import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { podeExecutarAcao } from "@/lib/auth/permissions"

class ErroApi extends Error {
  status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.name = "ErroApi"
    this.status = status
  }
}

function arredondarMoeda(valor: number) {
  return Number(valor.toFixed(2))
}

function normalizarTexto(valor: string | null | undefined) {
  return (valor || "").trim().toLowerCase()
}

function somarValores(valores: number[]) {
  return arredondarMoeda(
    valores.reduce((total, valor) => total + Number(valor || 0), 0)
  )
}

/*
 * Diagnóstico somente de leitura: todas as Vendas são confrontadas com
 * os cadastros da própria Representada. Não corrige nem persiste dados.
 * A relação historicamente vinculada tem prioridade; ausência de versão
 * preservada, regra ambígua ou faixa sem correspondência exigem conferência.
 */
type FaixaComissao = { desconto: number; comissao: number }

function faixasValidas(valor: string | null): FaixaComissao[] | null {
  if (!valor) return null
  try {
    const dados: unknown = JSON.parse(valor)
    if (!Array.isArray(dados) || dados.length === 0) return null
    const faixas: FaixaComissao[] = []
    for (const item of dados) {
      if (!item || typeof item !== "object") return null
      const campos = item as Record<string, unknown>
      if ((typeof campos.desconto !== "number" && typeof campos.desconto !== "string") ||
          (typeof campos.comissao !== "number" && typeof campos.comissao !== "string") ||
          String(campos.desconto).trim() === "" || String(campos.comissao).trim() === "") return null
      const desconto = Number(campos.desconto)
      const comissao = Number(campos.comissao)
      if (!Number.isFinite(desconto) || desconto < 0 || desconto > 100 ||
          !Number.isFinite(comissao) || comissao <= 0 || comissao > 100) return null
      faixas.push({ desconto, comissao })
    }
    return faixas
  } catch {
    return null
  }
}

async function conferirRegrasDasVendas(escritorioId: string) {
  const vendas = await prisma.venda.findMany({
    where: { escritorioId },
    include: { representada: true, regraComercial: true },
    orderBy: [{ data: "asc" }, { numeroSequencial: "asc" }],
  })
  const representadaIds = [...new Set(vendas.map((v) => v.representadaId))]
  const regras = representadaIds.length > 0
    ? await prisma.regraComercialRepresentada.findMany({
        where: { representadaId: { in: representadaIds } },
        orderBy: [{ vigenciaInicio: "desc" }, { criadoEm: "desc" }],
      })
    : []

  const linhas = vendas.map((venda) => {
    const observacoes: string[] = []
    const valorVenda = Number(venda.valorTotal)
    const desconto = Number(venda.desconto ?? 0)
    const bonificacao = Number(venda.bonificacaoValor ?? 0)
    const baseCalculada = arredondarMoeda(valorVenda - desconto - bonificacao)
    const baseRegistrada = venda.baseCalculoComissao === null
      ? null : arredondarMoeda(Number(venda.baseCalculoComissao))
    const valorRegistrado = venda.valorComissaoPrevista === null
      ? null : arredondarMoeda(Number(venda.valorComissaoPrevista))
    const percentualRegistrado = venda.percentualComissaoAplicado
    const cancelada = ["cancelado", "cancelada"].includes(normalizarTexto(venda.status))

    const resumo = {
      id: venda.id,
      venda: `VEN-${String(venda.numeroSequencial).padStart(6, "0")}`,
      dataVenda: venda.data.toISOString(),
      statusVenda: venda.status,
      representada: venda.representada.nome,
      representadaId: venda.representadaId,
      clienteId: venda.clienteId,
      regraVinculadaId: venda.regraComercialId,
      valorVenda: Number.isFinite(valorVenda) ? arredondarMoeda(valorVenda) : null,
      desconto: arredondarMoeda(desconto),
      bonificacao: arredondarMoeda(bonificacao),
      baseRegistrada,
      percentualRegistrado,
      valorRegistrado,
      comissaoLegada: venda.comissao === null ? null : arredondarMoeda(Number(venda.comissao)),
    }
    const falha = (situacao: string) => ({
      ...resumo, situacao, regraConsultadaId: null as string | null,
      origemRegra: null as string | null, percentualProposto: null as number | null,
      baseProposta: null as number | null, valorProposto: null as number | null,
      observacoes,
    })

    if (cancelada) return falha("VENDA_CANCELADA_SEM_RECALCULO")
    if (!Number.isFinite(valorVenda) || valorVenda <= 0 ||
        !Number.isFinite(desconto) || desconto < 0 ||
        !Number.isFinite(bonificacao) || bonificacao < 0 ||
        baseCalculada <= 0) {
      observacoes.push("Valor, desconto e bonificação não formam uma base positiva verificável.")
      return falha("BASE_INVALIDA")
    }
    if (baseRegistrada !== null && Math.abs(baseRegistrada - baseCalculada) > 0.01) {
      observacoes.push("A base já gravada é diferente de valor da Venda menos desconto e bonificação; não substituir automaticamente.")
      return falha("BASE_DIVERGENTE")
    }

    const regrasDaRepresentada = regras.filter((r) => r.representadaId === venda.representadaId)
    const vinculada = venda.regraComercialId
      ? regrasDaRepresentada.find((r) => r.id === venda.regraComercialId) ?? null
      : null
    if (venda.regraComercialId && !vinculada) {
      observacoes.push("A regra vinculada à Venda não foi encontrada na sua Representada.")
      return falha("VINCULO_INCONSISTENTE")
    }
    if (vinculada && vinculada.clienteId !== null && vinculada.clienteId !== venda.clienteId) {
      observacoes.push("A regra vinculada pertence a outro Cliente.")
      return falha("VINCULO_INCONSISTENTE")
    }
    const vigente = (r: typeof regras[number]) =>
      r.vigenciaInicio <= venda.data && (!r.vigenciaFim || r.vigenciaFim >= venda.data)
    let regra = vinculada
    let origemRegra = vinculada ? "Regra vinculada à Venda" : "Cadastro da Representada"
    if (vinculada && !vigente(vinculada)) {
      observacoes.push("A data da Venda está fora da vigência declarada da regra vinculada.")
      return falha("VIGENCIA_DIVERGENTE")
    }
    if (!regra) {
      const especificas = regrasDaRepresentada.filter((r) => vigente(r) && r.clienteId === venda.clienteId)
      const padroes = regrasDaRepresentada.filter((r) => vigente(r) && r.clienteId === null && r.tipoEscopo === "Padrao")
      const candidatas = especificas.length ? especificas : padroes
      if (candidatas.length > 1) {
        observacoes.push("Há mais de uma regra com mesmo escopo vigente para esta Venda; não escolher arbitrariamente.")
        return falha("REGRAS_AMBIGUAS")
      }
      regra = candidatas[0] ?? null
      if (regra) origemRegra = especificas.length ? "Regra do cliente" : "Regra padrão"
    }
    if (regra && !regra.ativa) observacoes.push("Regra atualmente inativa; confirmar se estava válida comercialmente na data da Venda.")
    if (regra && regra.atualizadoEm > venda.data) {
      observacoes.push("Regra editada depois da Venda: o cadastro atual não comprova qual percentual vigorava naquela data.")
    }
    if (!regra && venda.representada.atualizadoEm > venda.data) {
      observacoes.push("Representada atualizada depois da Venda: o cadastro atual não comprova a comissão histórica.")
    }

    const tipo = normalizarTexto(regra?.tipoComissao || venda.representada.tipoComissao)
    const variada = ["variada", "variavel", "variável"].includes(tipo)
    let percentual: number | null = null
    if (variada) {
      const faixas = faixasValidas(regra?.faixasComissao ?? venda.representada.faixasComissao)
      if (!faixas) {
        observacoes.push("Tabela de comissão variável ausente ou inválida.")
        return falha("FAIXAS_INVALIDAS")
      }
      // Comparar descontos matematicamente, não arredondar para faixa próxima.
      const brutoCentavos = Math.round(valorVenda * 100)
      const descontoCentavos = Math.round(desconto * 100)
      const correspondentes = faixas.filter((f) =>
        Math.abs(f.desconto * brutoCentavos - descontoCentavos * 100) < 0.000001
      )
      if (correspondentes.length !== 1) {
        observacoes.push(correspondentes.length === 0
          ? "Nenhuma faixa corresponde exatamente ao desconto desta Venda."
          : "Há faixas duplicadas para o mesmo desconto.")
        return falha(correspondentes.length === 0 ? "FAIXA_EXATA_AUSENTE" : "FAIXAS_AMBIGUAS")
      }
      percentual = correspondentes[0].comissao
    } else if (!tipo || tipo === "fixa") {
      percentual = regra?.percentualComissao ?? venda.representada.comissao
    } else {
      observacoes.push(`Tipo de comissão não reconhecido: ${tipo}.`)
      return falha("TIPO_DESCONHECIDO")
    }
    if (percentual === null || !Number.isFinite(percentual) || percentual <= 0 || percentual > 100) {
      observacoes.push("Não existe percentual positivo e válido na regra da Representada.")
      return falha("PERCENTUAL_INDISPONIVEL")
    }
    const valorProposto = arredondarMoeda(baseCalculada * percentual / 100)
    const percentualConfere = percentualRegistrado !== null &&
      Math.abs(Number(percentualRegistrado) - percentual) < 0.000001
    const valorConfere = valorRegistrado !== null &&
      Math.abs(valorRegistrado - valorProposto) <= 0.01
    if (valorRegistrado !== null && valorRegistrado > 0 && (!percentualConfere || !valorConfere)) {
      observacoes.push("Comissão gravada difere do cadastro consultado; não substituir sem investigar a regra histórica.")
    }
    if (venda.comissao !== null && valorRegistrado !== null &&
        Math.abs(Number(venda.comissao) - valorRegistrado) > 0.01) {
      observacoes.push("Campo legado comissao difere de valorComissaoPrevista.")
    }
    if (venda.comissao !== null && valorRegistrado === null) {
      observacoes.push("Existe valor em comissao legada, mas a previsão consultada pelas telas está nula.")
    }
    const historicoIncerto = observacoes.some((o) => o.includes("depois da Venda") || o.includes("atualmente inativa"))
    const situacao = valorRegistrado !== null && valorRegistrado > 0
      ? (percentualConfere && valorConfere ? "REGISTRADA_COMPATIVEL_COM_CADASTRO" : "REGISTRADA_DIVERGENTE")
      : historicoIncerto ? "AUSENTE_COM_HISTORICO_A_VALIDAR" : "AUSENTE_COM_PROPOSTA_DE_CALCULO"

    return {
      ...resumo, situacao, regraConsultadaId: regra?.id ?? null,
      origemRegra, percentualProposto: percentual, baseProposta: baseCalculada,
      valorProposto, observacoes,
    }
  })
  const contar = (situacao: string) => linhas.filter((item) => item.situacao === situacao).length
  return {
    somenteLeitura: true,
    orientacao: "Esta prévia não altera nem confirma comissão histórica. Não use como valor recebido.",
    resumo: {
      vendasAnalisadas: linhas.length,
      vendasCanceladas: contar("VENDA_CANCELADA_SEM_RECALCULO"),
      registradasCompativeisComCadastro: contar("REGISTRADA_COMPATIVEL_COM_CADASTRO"),
      registradasDivergentes: contar("REGISTRADA_DIVERGENTE"),
      ausentesComProposta: contar("AUSENTE_COM_PROPOSTA_DE_CALCULO"),
      ausentesComHistoricoAValidar: contar("AUSENTE_COM_HISTORICO_A_VALIDAR"),
      demaisExcecoes: linhas.filter((item) => ![
        "VENDA_CANCELADA_SEM_RECALCULO", "REGISTRADA_COMPATIVEL_COM_CADASTRO",
        "REGISTRADA_DIVERGENTE", "AUSENTE_COM_PROPOSTA_DE_CALCULO",
        "AUSENTE_COM_HISTORICO_A_VALIDAR",
      ].includes(item.situacao)).length,
    },
    vendas: linhas,
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessao = await exigirSessao()

    if (!podeExecutarAcao(sessao.perfil, "financeiro", "ver")) {
      throw new ErroApi(
        "Você não possui permissão para visualizar comissões.",
        403
      )
    }

    if (request.nextUrl.searchParams.get("auditar") === "1") {
      return NextResponse.json(await conferirRegrasDasVendas(sessao.escritorioId), {
        headers: { "Cache-Control": "no-store" },
      })
    }

    const [vendas, movimentos] = await Promise.all([
      prisma.venda.findMany({
        where: {
          escritorioId: sessao.escritorioId,
          // Incluir também vendas com previsão nula ou zerada para conferência.
          // A consulta não calcula, corrige nem grava comissões.
        },
        select: {
          id: true,
          numeroSequencial: true,
          data: true,
          status: true,
          valorTotal: true,
          percentualComissaoAplicado: true,
          regraReconhecimentoComissao: true,
          baseCalculoComissao: true,
          valorComissaoPrevista: true,
          bonificacaoValor: true,
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
          representada: {
            select: {
              id: true,
              nome: true,
              regraReconhecimentoComissao: true,
              fechamentoComissao: true,
              pagamentoComissao: true,
              exigeNFComissao: true,
            },
          },
          faturamentos: {
            select: {
              id: true,
              numeroSequencial: true,
              numeroNF: true,
              dataFaturamento: true,
              valorFaturado: true,
              status: true,
            },
            orderBy: { dataFaturamento: "asc" },
          },
          comissoes: {
            select: {
              id: true,
              numeroSequencial: true,
              tipo: true,
              data: true,
              valor: true,
              status: true,
            },
            orderBy: { data: "asc" },
          },
        },
        orderBy: [
          { data: "desc" },
          { numeroSequencial: "desc" },
        ],
      }),

      prisma.comissaoMovimento.findMany({
        where: {
          OR: [
            { venda: { escritorioId: sessao.escritorioId } },
            { faturamento: { venda: { escritorioId: sessao.escritorioId } } },
            {
              tituloVenda: {
                faturamento: { venda: { escritorioId: sessao.escritorioId } },
              },
            },
            {
              tituloVendaBaixa: {
                tituloVenda: {
                  faturamento: { venda: { escritorioId: sessao.escritorioId } },
                },
              },
            },
            {
              nfComissao: {
                empresaEscritorio: { escritorioId: sessao.escritorioId },
              },
            },
          ],
        },
        include: {
          parcelas: {
            orderBy: { numeroParcela: "asc" },
          },
          venda: {
            select: {
              id: true,
              numeroSequencial: true,
              data: true,
              status: true,
              valorTotal: true,
              percentualComissaoAplicado: true,
              regraReconhecimentoComissao: true,
              baseCalculoComissao: true,
              valorComissaoPrevista: true,
              cliente: {
                select: {
                  id: true,
                  razaoSocial: true,
                  nomeFantasia: true,
                },
              },
              representada: {
                select: { id: true, nome: true },
              },
            },
          },
          faturamento: {
            select: {
              id: true,
              numeroSequencial: true,
              numeroNF: true,
              dataFaturamento: true,
              valorFaturado: true,
              status: true,
            },
          },
          tituloVenda: {
            select: {
              id: true,
              numeroSequencial: true,
              numeroParcela: true,
              numeroTituloExterno: true,
              vencimento: true,
              prorrogadoPara: true,
              valor: true,
              status: true,
              pagoEm: true,
            },
          },
          tituloVendaBaixa: {
            select: {
              id: true,
              data: true,
              valor: true,
              origemInformacao: true,
              referencia: true,
            },
          },
          nfComissao: {
            select: {
              id: true,
              numeroSequencial: true,
              numero: true,
              dataEmissao: true,
              valorBruto: true,
              valorLiquido: true,
              vencimento: true,
              pagoEm: true,
              status: true,
              representada: {
                select: { id: true, nome: true },
              },
              empresaEscritorio: {
                select: {
                  id: true,
                  razaoSocial: true,
                  nomeFantasia: true,
                },
              },
            },
          },
          movimentoOrigem: {
            select: {
              id: true,
              numeroSequencial: true,
              tipo: true,
              data: true,
              valor: true,
              status: true,
            },
          },
        },
        orderBy: [
          { data: "desc" },
          { numeroSequencial: "desc" },
        ],
      }),
    ])

    const vendasValidas = vendas.filter((venda) => {
      const status = normalizarTexto(venda.status)
      return status !== "cancelado" && status !== "cancelada"
    })

    // A lista e os totais de previsões positivas conservam o contrato anterior.
    // Registros nulos/zerados/negativos aparecem em uma lista separada,
    // sem serem convertidos artificialmente em previsão de R$ 0,00.
    const vendasComPrevisaoPositiva = vendasValidas.filter(
      (venda) =>
        venda.valorComissaoPrevista !== null &&
        Number(venda.valorComissaoPrevista) > 0
    )

    const vendasSemPrevisaoPositiva = vendasValidas.filter(
      (venda) =>
        venda.valorComissaoPrevista === null ||
        Number(venda.valorComissaoPrevista) <= 0
    )

    const vendasSemComissaoPrevista = vendasSemPrevisaoPositiva.map(
      (venda) => ({
        id: venda.id,
        numeroSequencial: venda.numeroSequencial,
        data: venda.data,
        status: venda.status,
        valorVenda: arredondarMoeda(Number(venda.valorTotal || 0)),
        baseCalculo: venda.baseCalculoComissao === null
          ? null
          : arredondarMoeda(Number(venda.baseCalculoComissao)),
        percentual: venda.percentualComissaoAplicado,
        valorRegistrado: venda.valorComissaoPrevista === null
          ? null
          : arredondarMoeda(Number(venda.valorComissaoPrevista)),
        situacao: venda.valorComissaoPrevista === null
          ? "SEM_VALOR_REGISTRADO"
          : Number(venda.valorComissaoPrevista) === 0
            ? "VALOR_ZERO"
            : "VALOR_NEGATIVO",
        cliente: venda.cliente,
        representada: venda.representada,
      })
    )

    const previsoes = vendasComPrevisaoPositiva.map((venda) => {
      const valorPrevisto = arredondarMoeda(
        Number(venda.valorComissaoPrevista)
      )
      const baseCalculo = venda.baseCalculoComissao !== null
        ? arredondarMoeda(Number(venda.baseCalculoComissao))
        : null
      const percentual = venda.percentualComissaoAplicado !== null
        ? Number(venda.percentualComissaoAplicado)
        : null
      const totalFaturado = somarValores(
        venda.faturamentos.map((faturamento) =>
          Number(faturamento.valorFaturado || 0)
        )
      )

      return {
        id: venda.id,
        numeroSequencial: venda.numeroSequencial,
        data: venda.data,
        status: venda.status,
        valorVenda: arredondarMoeda(Number(venda.valorTotal || 0)),
        baseCalculo,
        percentual,
        valorPrevisto,
        regraReconhecimento: venda.regraReconhecimentoComissao ||
          venda.representada.regraReconhecimentoComissao || null,
        bonificacaoValor: arredondarMoeda(
          Number(venda.bonificacaoValor || 0)
        ),
        cliente: venda.cliente,
        representada: venda.representada,
        faturamentos: venda.faturamentos,
        totalFaturado,
        quantidadeFaturamentos: venda.faturamentos.length,
        movimentosExistentes: venda.comissoes,
        quantidadeMovimentos: venda.comissoes.length,
        possuiMovimento: venda.comissoes.length > 0,
      }
    })

    const movimentosFormatados = movimentos.map((movimento) => {
      const parcelas = movimento.parcelas.map((parcela) => ({
        ...parcela,
        valor: arredondarMoeda(Number(parcela.valor || 0)),
      }))
      const valorParcelado = somarValores(
        parcelas.map((parcela) => parcela.valor)
      )
      const parcelasPendentes = parcelas.filter((parcela) => {
        const status = normalizarTexto(parcela.status)
        return status !== "recebido" && status !== "pago" &&
          status !== "liquidado" && status !== "cancelado"
      })
      const valorParcelasPendentes = somarValores(
        parcelasPendentes.map((parcela) => parcela.valor)
      )

      return {
        id: movimento.id,
        numeroSequencial: movimento.numeroSequencial,
        tipo: movimento.tipo,
        data: movimento.data,
        competencia: movimento.competencia,
        baseCalculo: movimento.baseCalculo !== null
          ? arredondarMoeda(Number(movimento.baseCalculo))
          : null,
        valor: arredondarMoeda(Number(movimento.valor || 0)),
        percentual: movimento.percentual,
        status: movimento.status,
        descricao: movimento.descricao,
        venda: movimento.venda,
        faturamento: movimento.faturamento,
        tituloVenda: movimento.tituloVenda,
        tituloVendaBaixa: movimento.tituloVendaBaixa,
        nfComissao: movimento.nfComissao,
        movimentoOrigem: movimento.movimentoOrigem,
        parcelas,
        quantidadeParcelas: parcelas.length,
        valorParcelado,
        quantidadeParcelasPendentes: parcelasPendentes.length,
        valorParcelasPendentes,
      }
    })

    const totalPrevistoVendas = somarValores(
      previsoes.map((previsao) => previsao.valorPrevisto)
    )
    const totalMovimentos = somarValores(
      movimentosFormatados.map((movimento) => movimento.valor)
    )
    const totalPorTipo = (tipoDesejado: string) => somarValores(
      movimentosFormatados
        .filter((movimento) =>
          normalizarTexto(movimento.tipo) === normalizarTexto(tipoDesejado)
        )
        .map((movimento) => movimento.valor)
    )
    const quantidadePorTipo = (tipoDesejado: string) =>
      movimentosFormatados.filter((movimento) =>
        normalizarTexto(movimento.tipo) === normalizarTexto(tipoDesejado)
      ).length
    const parcelasPendentes = movimentosFormatados
      .flatMap((movimento) => movimento.parcelas)
      .filter((parcela) => {
        const status = normalizarTexto(parcela.status)
        return status !== "recebido" && status !== "pago" &&
          status !== "liquidado" && status !== "cancelado"
      })
    const valorParcelasPendentes = somarValores(
      parcelasPendentes.map((parcela) => Number(parcela.valor || 0))
    )

    return NextResponse.json({
      referencia: { agora: new Date().toISOString() },
      resumo: {
        vendasComComissaoPrevista: previsoes.length,
        valorComissaoPrevistaVendas: totalPrevistoVendas,
        // Novos indicadores de conferência; não entram no total previsto.
        vendasSemComissaoPrevista: vendasSemComissaoPrevista.length,
        vendasSemValorRegistrado: vendasSemComissaoPrevista.filter(
          (venda) => venda.situacao === "SEM_VALOR_REGISTRADO"
        ).length,
        vendasComValorZero: vendasSemComissaoPrevista.filter(
          (venda) => venda.situacao === "VALOR_ZERO"
        ).length,
        vendasComValorNegativo: vendasSemComissaoPrevista.filter(
          (venda) => venda.situacao === "VALOR_NEGATIVO"
        ).length,
        movimentos: movimentosFormatados.length,
        valorTotalMovimentos: totalMovimentos,
        previstas: {
          quantidade: quantidadePorTipo("PREVISTA"),
          valor: totalPorTipo("PREVISTA"),
        },
        devidas: {
          quantidade: quantidadePorTipo("DEVIDA"),
          valor: totalPorTipo("DEVIDA"),
        },
        recebidas: {
          quantidade: quantidadePorTipo("RECEBIDA"),
          valor: totalPorTipo("RECEBIDA"),
        },
        estornadas: {
          quantidade: quantidadePorTipo("ESTORNADA"),
          valor: totalPorTipo("ESTORNADA"),
        },
        recuperadas: {
          quantidade: quantidadePorTipo("RECUPERADA"),
          valor: totalPorTipo("RECUPERADA"),
        },
        ajustes: {
          quantidade: quantidadePorTipo("AJUSTE"),
          valor: totalPorTipo("AJUSTE"),
        },
        parcelasPendentes: {
          quantidade: parcelasPendentes.length,
          valor: valorParcelasPendentes,
        },
      },
      previsoes,
      // Lista separada para conferência, sem alterar a estrutura de previsoes.
      vendasSemComissaoPrevista,
      movimentos: movimentosFormatados,
    })
  } catch (error) {
    console.error("Erro ao carregar comissões:", error)

    if (error instanceof ErroApi) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json({ message: "Não autenticado." }, { status: 401 })
    }
    return NextResponse.json(
      { message: "Erro ao carregar comissões." },
      { status: 500 }
    )
  }
}
