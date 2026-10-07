import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

const CANAIS = ["WhatsApp", "E-mail", "Documento assinado", "Outro"]
const ESTADOS = ["Pendente", "Vencido", "Aprovado", "Recusado", "Cancelado"]
const MARCADOR_ACEITE_V1 = "DADOS_APROVACAO_V1="
const MARCADOR_ACEITE_V2 = "DADOS_APROVACAO_V2="

type Aceite = {
  canal: string
  aprovadoPor: string
  referencia: string
  aprovacaoEm: string
  dataVenda: string
  descontoPercentual: number
  bonificacaoValor: number
}

const texto = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null

function dinheiro(v: unknown): number | null {
  if (typeof v !== "string" && typeof v !== "number") return null
  let s = String(v).trim().replace(/\s|R\$/gi, "")
  if (!s) return null
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".")
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 &&
    Math.abs(n * 100 - Math.round(n * 100)) < 0.000001
    ? Number(n.toFixed(2)) : null
}

type FaixaComissao = {
  desconto: unknown
  comissao: unknown
  pedidoMinimo?: unknown
}

type ResultadoComissao = {
  percentual: number
  pedidoMinimoCondicao: number | null
}

type ResultadoPoliticaComercial = {
  representadaNome: string
  regraId: string
  regraNome: string
  vigenciaInicio: string
  vigenciaFim: string | null
  tipoComissao: "fixa" | "variada"
  descontoPercentual: number
  percentualComissao: number
  pedidoMinimoPolitica: number | null
  pedidoMinimoCondicao: number | null
  valorPedido: number
  regraReconhecimentoComissao: string | null
}

function percentualCadastrado(valor: unknown): number | null {
  if (typeof valor !== "string" && typeof valor !== "number") return null

  const texto = String(valor).trim().replace(",", ".")

  if (!/^\d+(?:\.\d{1,2})?$/.test(texto)) return null

  const numero = Number(texto)

  return Number.isFinite(numero) && numero >= 0 && numero <= 100
    ? numero
    : null
}

function valorMonetarioCadastrado(valor: unknown): number | null {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null
  }

  return dinheiro(valor)
}

function moedaBR(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function obterResultadoComissao(
  tipo: string | null,
  percentualFixo: number | null,
  faixasJson: string | null,
  descontoPercentual: number,
  valorPedido: number,
  pedidoMinimoPolitica: number | null
): ResultadoComissao {
  const tipoAplicavel = tipo?.trim() || null

  /*
   * O pedido mínimo geral da política continua válido.
   * Nas faixas variáveis, cada faixa também pode definir
   * um mínimo maior para aquela condição específica.
   */
  if (
    pedidoMinimoPolitica !== null &&
    valorPedido < pedidoMinimoPolitica
  ) {
    throw new Error(
      `PEDIDO_MINIMO_NAO_ATINGIDO|${pedidoMinimoPolitica.toFixed(2)}`
    )
  }

  if (tipoAplicavel === "fixa") {
    const percentual = percentualCadastrado(percentualFixo)

    if (percentual === null || percentual <= 0) {
      throw new Error("COMISSAO_CADASTRO_INVALIDO")
    }

    return {
      percentual,
      pedidoMinimoCondicao: pedidoMinimoPolitica,
    }
  }

  if (tipoAplicavel !== "variada" || !faixasJson) {
    throw new Error("COMISSAO_CADASTRO_INVALIDO")
  }

  const descontoInformado = percentualCadastrado(descontoPercentual)

  if (descontoInformado === null) {
    throw new Error("ACEITE_INVALIDO")
  }

  let registros: unknown

  try {
    registros = JSON.parse(faixasJson)
  } catch {
    throw new Error("COMISSAO_CADASTRO_INVALIDO")
  }

  if (!Array.isArray(registros) || registros.length === 0) {
    throw new Error("COMISSAO_CADASTRO_INVALIDO")
  }

  const descontoBase = Math.round(descontoInformado * 100)
  const descontosVistos = new Set<number>()
  const correspondencias: ResultadoComissao[] = []

  for (const registro of registros as unknown[]) {
    if (
      !registro ||
      typeof registro !== "object" ||
      Array.isArray(registro)
    ) {
      throw new Error("COMISSAO_CADASTRO_INVALIDO")
    }

    const faixa = registro as FaixaComissao
    const desconto = percentualCadastrado(faixa.desconto)
    const comissao = percentualCadastrado(faixa.comissao)

    if (desconto === null || comissao === null || comissao <= 0) {
      throw new Error("COMISSAO_CADASTRO_INVALIDO")
    }

    const descontoChave = Math.round(desconto * 100)

    if (descontosVistos.has(descontoChave)) {
      throw new Error("FAIXA_COMISSAO_AMBIGUA")
    }

    descontosVistos.add(descontoChave)

    let pedidoMinimoCondicao = pedidoMinimoPolitica

    if (
      faixa.pedidoMinimo !== undefined &&
      faixa.pedidoMinimo !== null &&
      String(faixa.pedidoMinimo).trim() !== ""
    ) {
      const pedidoMinimoFaixa = valorMonetarioCadastrado(
        faixa.pedidoMinimo
      )

      if (pedidoMinimoFaixa === null || pedidoMinimoFaixa < 0) {
        throw new Error("COMISSAO_CADASTRO_INVALIDO")
      }

      pedidoMinimoCondicao = pedidoMinimoFaixa
    }

    if (descontoChave === descontoBase) {
      correspondencias.push({
        percentual: comissao,
        pedidoMinimoCondicao,
      })
    }
  }

  if (correspondencias.length === 0) {
    throw new Error("FAIXA_COMISSAO_NAO_ENCONTRADA")
  }

  if (correspondencias.length > 1) {
    throw new Error("FAIXA_COMISSAO_AMBIGUA")
  }

  const correspondencia = correspondencias[0]

  if (
    correspondencia.pedidoMinimoCondicao !== null &&
    valorPedido < correspondencia.pedidoMinimoCondicao
  ) {
    throw new Error(
      `PEDIDO_MINIMO_NAO_ATINGIDO|${correspondencia.pedidoMinimoCondicao.toFixed(2)}`
    )
  }

  return correspondencia
}

function instante(v: unknown): Date | null {
  if (typeof v !== "string" || !v.trim()) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function diaBrasilia(d: Date) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)

  const achar = (tipo: string) =>
    p.find((item) => item.type === tipo)?.value

  return `${achar("year")}-${achar("month")}-${achar("day")}`
}

function diaComercial(v: unknown): Date | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null

  const d = new Date(`${v}T12:00:00-03:00`)

  return !Number.isNaN(d.getTime()) && diaBrasilia(d) === v
    ? d
    : null
}

/*
 * As vigências são datas comerciais.
 * Comparar somente YYYY-MM-DD mantém o último dia
 * da regra incluído e evita diferença por horário.
 */
function regraEstaVigente(
  vigenciaInicio: Date,
  vigenciaFim: Date | null,
  dataVenda: Date
) {
  const diaVenda = dataVenda.toISOString().slice(0, 10)
  const diaInicio = vigenciaInicio.toISOString().slice(0, 10)
  const diaFim = vigenciaFim?.toISOString().slice(0, 10) || null

  return diaInicio <= diaVenda && (diaFim === null || diaVenda <= diaFim)
}

function conferirAceite(
  body: Record<string, unknown>,
  enviadoEm: Date | null
): { registro: Aceite; data: Date } | string {
  const canal = texto(body.aprovacaoCanal)
  const aprovadoPor = texto(body.aprovadoPor)
  const referencia = texto(body.aprovacaoReferencia)
  const aprovacaoTexto = texto(body.aprovacaoEm)
  const dataVenda = texto(body.dataVenda)

  if (!canal || !CANAIS.includes(canal) || !aprovadoPor || !referencia) {
    return "Informe canal, comprador e referência verificável da aprovação real."
  }

  if (
    !aprovacaoTexto ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      aprovacaoTexto
    )
  ) {
    return "Informe a data e hora reais da aprovação, com fuso horário."
  }

  const aprovacao = instante(aprovacaoTexto)

  if (!aprovacao || aprovacao.getTime() > Date.now()) {
    return "A data da aprovação é inválida ou futura."
  }

  if (!enviadoEm || enviadoEm.getTime() > aprovacao.getTime()) {
    return "Registre o envio real, anterior ou igual ao aceite do comprador."
  }

  const data = diaComercial(dataVenda)

  if (
    !data ||
    !dataVenda ||
    dataVenda > diaBrasilia(new Date()) ||
    dataVenda < diaBrasilia(aprovacao)
  ) {
    return "Informe a data comercial verdadeira, não futura nem anterior ao aceite."
  }

  const descontoPercentual = percentualCadastrado(
    body.descontoPercentual
  )

  const bonificacaoValor = dinheiro(
    body.bonificacaoValor
  )

  if (
    descontoPercentual === null ||
    bonificacaoValor === null
  ) {
    return "Informe o desconto comercial em percentual e a bonificação em valor, inclusive zero quando não houver."
  }

  return {
    registro: {
      canal,
      aprovadoPor,
      referencia,
      aprovacaoEm: aprovacao.toISOString(),
      dataVenda,
      descontoPercentual,
      bonificacaoValor,
    },
    data,
  }
}

function registrarAceite(a: Aceite) {
  return [
    "APROVAÇÃO COMERCIAL REGISTRADA",
    `Canal: ${a.canal}`,
    `Comprador/responsável: ${a.aprovadoPor}`,
    `Data/hora do aceite: ${a.aprovacaoEm}`,
    `Referência da confirmação original: ${a.referencia}`,
    `Data comercial da Venda: ${a.dataVenda}`,
    `Desconto comercial informado para comissão: ${a.descontoPercentual.toFixed(2)}%`,
    `Bonificação registrada separadamente: R$ ${a.bonificacaoValor.toFixed(2)}`,
    `${MARCADOR_ACEITE_V2}${JSON.stringify(a)}`,
  ].join("\n")
}

function lerAceite(valor: string | null): Aceite | null {
  const linha = valor
    ?.split("\n")
    .find((item) => item.startsWith(MARCADOR_ACEITE_V2))

  if (!linha) return null

  try {
    const a: unknown = JSON.parse(
      linha.slice(MARCADOR_ACEITE_V2.length)
    )

    if (!a || typeof a !== "object") return null

    const r = a as Record<string, unknown>

    if (
      typeof r.canal !== "string" ||
      !CANAIS.includes(r.canal) ||
      !texto(r.aprovadoPor) ||
      !texto(r.referencia) ||
      typeof r.aprovacaoEm !== "string" ||
      !instante(r.aprovacaoEm) ||
      typeof r.dataVenda !== "string" ||
      !diaComercial(r.dataVenda) ||
      typeof r.descontoPercentual !== "number" ||
      percentualCadastrado(r.descontoPercentual) === null ||
      typeof r.bonificacaoValor !== "number" ||
      dinheiro(r.bonificacaoValor) === null
    ) {
      return null
    }

    return r as Aceite
  } catch {
    return null
  }
}

function possuiAceiteV1(valor: string | null) {
  return Boolean(
    valor
      ?.split("\n")
      .some((item) => item.startsWith(MARCADOR_ACEITE_V1))
  )
}

function escopoOrcamento(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
): Prisma.OrcamentoWhereInput {
  return {
    id,
    escritorioId,
    ...(perfil === "Preposto"
      ? {
          cliente: {
            is: {
              escritorioId,
              OR: [
                { responsavelPrincipalId: usuarioId },
                {
                  participantes: {
                    some: {
                      usuarioId,
                      ativa: true,
                    },
                  },
                },
              ],
            },
          },
        }
      : {}),
  }
}

const INCLUDE = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      razaoSocial: true,
      nomeFantasia: true,
      cnpj: true,
      status: true,
      contato: true,
      telefone: true,
      whatsapp: true,
      email: true,
    },
  },

  representada: {
    select: {
      id: true,
      nome: true,
      cnpj: true,
      contatoPrincipal: true,
      telefonePrincipal: true,
      whatsappPrincipal: true,
      emailPrincipal: true,
    },
  },

  interacaoOrigem: {
    select: {
      id: true,
      numeroSequencial: true,
      tipo: true,
      assunto: true,
      data: true,
      nomeProspect: true,
      empresaProspect: true,
      origemProspeccao: true,
    },
  },

  criadoPor: {
    select: {
      id: true,
      nome: true,
      perfil: true,
    },
  },

  responsavel: {
    select: {
      id: true,
      nome: true,
      perfil: true,
    },
  },

  vendaGerada: {
    select: {
      id: true,
      numeroSequencial: true,
      status: true,
      data: true,
      pedidoEnviadoEm: true,
      confirmadoEm: true,
      numeroPedidoRepresentada: true,
    },
  },
} satisfies Prisma.OrcamentoInclude

function snapshot(o: {
  id: string
  numeroSequencial: number
  escritorioId: string
  interacaoOrigemId: string | null
  clienteId: string | null
  representadaId: string
  criadoPorId: string | null
  responsavelId: string | null
  data: Date
  validadeEm: Date
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  status: string
  enviadoEm: Date | null
  finalizadoEm: Date | null
  motivoFinalizacao: string | null
  arquivoUrl: string | null
  observacoes: string | null
  criadoEm: Date
  atualizadoEm: Date
}) {
  return {
    ...o,
    data: o.data.toISOString(),
    validadeEm: o.validadeEm.toISOString(),
    enviadoEm: o.enviadoEm?.toISOString() ?? null,
    finalizadoEm: o.finalizadoEm?.toISOString() ?? null,
    criadoEm: o.criadoEm.toISOString(),
    atualizadoEm: o.atualizadoEm.toISOString(),
  }
}

function codigo(numero: number) {
  return `ORC-${String(numero).padStart(6, "0")}`
}

async function resolverPoliticaComercial(
  tx: Prisma.TransactionClient,
  orcamento: {
    escritorioId: string
    clienteId: string | null
    representadaId: string
    valorTotal: number
  },
  dataVenda: Date,
  descontoPercentual: number
): Promise<ResultadoPoliticaComercial> {
  const clienteId = orcamento.clienteId

  if (!clienteId) {
    throw new Error("CLIENTE_NAO_FORMALIZADO")
  }

  const cliente = await tx.cliente.findFirst({
    where: {
      id: clienteId,
      escritorioId: orcamento.escritorioId,
      status: "Ativo",
      cnpj: {
        not: null,
      },
    },

    select: {
      id: true,
      cnpj: true,
    },
  })

  if (!cliente?.cnpj?.trim()) {
    throw new Error("CLIENTE_NAO_FORMALIZADO")
  }

  const representada = await tx.representada.findFirst({
    where: {
      id: orcamento.representadaId,
      escritorioId: orcamento.escritorioId,
      status: "Ativa",
    },

    select: {
      id: true,
      nome: true,
      regraReconhecimentoComissao: true,
    },
  })

  if (!representada) {
    throw new Error("REPRESENTADA_INATIVA")
  }

  const regrasAtivas =
    await tx.regraComercialRepresentada.findMany({
      where: {
        representadaId: orcamento.representadaId,
        ativa: true,
      },

      orderBy: [
        {
          vigenciaInicio: "desc",
        },
        {
          criadoEm: "desc",
        },
      ],
    })

  const regrasVigentes =
    regrasAtivas.filter((regra) =>
      regraEstaVigente(
        regra.vigenciaInicio,
        regra.vigenciaFim,
        dataVenda
      )
    )

  /*
   * O novo modelo utiliza uma única política comercial Padrão
   * da Representada por data.
   *
   * Regras específicas antigas por Cliente não são ignoradas
   * silenciosamente. Se ainda estiverem vigentes, o cadastro
   * precisa ser regularizado antes de gerar uma nova Venda.
   */
  const regrasClienteLegadas =
    regrasVigentes.filter(
      (regra) =>
        regra.clienteId === clienteId &&
        regra.tipoEscopo === "Cliente"
    )

  if (regrasClienteLegadas.length > 0) {
    throw new Error(
      "REGRA_CLIENTE_LEGADA_VIGENTE"
    )
  }

  const regrasPadraoVigentes =
    regrasVigentes.filter(
      (regra) =>
        regra.clienteId === null &&
        regra.tipoEscopo === "Padrao"
    )

  if (regrasPadraoVigentes.length === 0) {
    throw new Error(
      "POLITICA_COMERCIAL_PADRAO_AUSENTE"
    )
  }

  if (regrasPadraoVigentes.length > 1) {
    throw new Error(
      "POLITICA_COMERCIAL_CONFLITANTE"
    )
  }

  const regra = regrasPadraoVigentes[0]

  const valorPedido =
    Number(
      orcamento.valorTotal.toFixed(2)
    )

  const resultadoComissao =
    obterResultadoComissao(
      regra.tipoComissao,
      regra.percentualComissao,
      regra.faixasComissao,
      descontoPercentual,
      valorPedido,
      regra.pedidoMinimo
    )

  const tipoComissao =
    regra.tipoComissao?.trim()

  if (
    tipoComissao !== "fixa" &&
    tipoComissao !== "variada"
  ) {
    throw new Error(
      "COMISSAO_CADASTRO_INVALIDO"
    )
  }

  return {
    representadaNome:
      representada.nome,

    regraId:
      regra.id,

    regraNome:
      regra.nome,

    vigenciaInicio:
      regra.vigenciaInicio.toISOString(),

    vigenciaFim:
      regra.vigenciaFim?.toISOString() ??
      null,

    tipoComissao,

    descontoPercentual,

    percentualComissao:
      resultadoComissao.percentual,

    pedidoMinimoPolitica:
      regra.pedidoMinimo,

    pedidoMinimoCondicao:
      resultadoComissao.pedidoMinimoCondicao,

    valorPedido,

    regraReconhecimentoComissao:
      regra.reconhecimentoComissao ??
      representada.regraReconhecimentoComissao ??
      null,
  }
}

async function gerarVenda(
  tx: Prisma.TransactionClient,
  orcamento: {
    id: string
    numeroSequencial: number
    escritorioId: string
    interacaoOrigemId: string | null
    clienteId: string | null
    representadaId: string
    responsavelId: string | null
    valorTotal: number
    condicaoPagamento: string | null
  },
  aceite: Aceite,
  usuarioId: string
) {
  const dataVenda =
    diaComercial(
      aceite.dataVenda
    )

  if (
    !dataVenda ||
    !instante(
      aceite.aprovacaoEm
    )
  ) {
    throw new Error(
      "ACEITE_INVALIDO"
    )
  }

  /*
   * O Prisma exige clienteId obrigatório na Venda.
   * Guardamos o valor já validado como string para
   * impedir criação sem Cliente formalizado e também
   * eliminar ambiguidade de tipagem.
   */
  const clienteId =
    orcamento.clienteId

  if (!clienteId) {
    throw new Error(
      "CLIENTE_NAO_FORMALIZADO"
    )
  }

  const existe =
    await tx.venda.findUnique({
      where: {
        orcamentoOrigemId:
          orcamento.id,
      },

      select: {
        id: true,
      },
    })

  if (existe) {
    throw new Error(
      "ORCAMENTO_JA_CONVERTIDO"
    )
  }

  const politica =
    await resolverPoliticaComercial(
      tx,
      orcamento,
      dataVenda,
      aceite.descontoPercentual
    )

  /*
   * O valor do Orçamento já é o valor final negociado.
   * O desconto percentual NÃO é novamente subtraído.
   *
   * Em comissão variável, o desconto efetivamente
   * negociado apenas localiza a faixa correspondente.
   *
   * Cada faixa pode possuir um pedido mínimo próprio.
   * O valor do pedido nunca concede desconto sozinho.
   *
   * Exemplo: um pedido de R$ 50.000,00 com 0% de
   * desconto usa a faixa de 0%, se ela estiver cadastrada,
   * preservando a comissão correspondente à venda sem desconto.
   *
   * A bonificação permanece separada.
   */
  const valorVendaFinal =
    Number(
      orcamento.valorTotal.toFixed(2)
    )

  const base =
    valorVendaFinal

  const percentual =
    politica.percentualComissao

  const comissao =
    Number(
      (
        base *
        percentual /
        100
      ).toFixed(2)
    )

  const venda =
    await tx.venda.create({
      data: {
        escritorioId:
          orcamento.escritorioId,

        data:
          dataVenda,

        clienteId,

        representadaId:
          orcamento.representadaId,

        regraComercialId:
          politica.regraId,

        orcamentoOrigemId:
          orcamento.id,

        criadoPorId:
          usuarioId,

        responsavelId:
          orcamento.responsavelId ??
          usuarioId,

        valorTotal:
          valorVendaFinal,

        desconto:
          null,

        bonificacaoValor:
          aceite.bonificacaoValor,

        percentualComissaoAplicado:
          percentual,

        regraReconhecimentoComissao:
          politica.regraReconhecimentoComissao,

        baseCalculoComissao:
          base,

        valorComissaoPrevista:
          comissao,

        comissao,

        condicaoPagamento:
          orcamento.condicaoPagamento,

        status:
          "Aguardando envio",

        observacoes:
          null,
      },

      select: {
        id: true,
        numeroSequencial: true,
      },
    })

  await tx.vendaEvento.create({
    data: {
      vendaId:
        venda.id,

      usuarioId,

      tipo:
        "Venda criada",

      canal:
        null,

      referencia:
        codigo(
          orcamento.numeroSequencial
        ),

      descricao:
        "Venda gerada a partir de aprovação real registrada; o pedido não foi enviado à Representada.",
    },
  })

  await tx.auditoria.create({
    data: {
      escritorioId:
        orcamento.escritorioId,

      usuarioId,

      entidade:
        "Venda",

      entidadeId:
        venda.id,

      acao:
        "CRIACAO",

      dadosDepois: {
        id:
          venda.id,

        numeroSequencial:
          venda.numeroSequencial,

        origem: {
          tipo:
            "Orcamento",

          orcamentoId:
            orcamento.id,

          numeroSequencial:
            orcamento.numeroSequencial,

          interacaoOrigemId:
            orcamento.interacaoOrigemId,
        },

        clienteId,

        representadaId:
          orcamento.representadaId,

        data:
          dataVenda.toISOString(),

        valorTotal:
          valorVendaFinal,

        valorOrcamentoFinalNegociado:
          orcamento.valorTotal,

        descontoMonetarioVenda:
          null,

        descontoComercialPercentual:
          aceite.descontoPercentual,

        bonificacaoValor:
          aceite.bonificacaoValor,

        baseCalculoComissao:
          base,

        condicaoPagamento:
          orcamento.condicaoPagamento,

        regraComercialId:
          politica.regraId,

        politicaComercial: {
          representadaNome:
            politica.representadaNome,

          regraNome:
            politica.regraNome,

          vigenciaInicio:
            politica.vigenciaInicio,

          vigenciaFim:
            politica.vigenciaFim,

          tipoComissao:
            politica.tipoComissao,

          pedidoMinimoPolitica:
            politica.pedidoMinimoPolitica,

          pedidoMinimoCondicao:
            politica.pedidoMinimoCondicao,
        },

        percentualComissaoAplicado:
          percentual,

        valorComissaoPrevista:
          comissao,

        status:
          "Aguardando envio",

        comprovacao: {
          canal:
            aceite.canal,

          comprador:
            aceite.aprovadoPor,

          referencia:
            aceite.referencia,

          aprovacaoEm:
            aceite.aprovacaoEm,
        },
      },
    },
  })

  return venda
}

type Contexto = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _request: Request,
  {
    params,
  }: Contexto
) {
  try {
    const sessao =
      await exigirSessao()

    const {
      id,
    } =
      await params

    const registro =
      await prisma.orcamento.findFirst({
        where:
          escopoOrcamento(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        include:
          INCLUDE,
      })

    if (!registro) {
      return NextResponse.json(
        {
          message:
            "Orçamento não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      registro
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao buscar orçamento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar orçamento.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: Contexto
) {
  try {
    const sessao =
      await exigirSessao()

    const {
      id,
    } =
      await params

    const body:
      Record<string, unknown> =
      await request.json()

    if (
      !body ||
      typeof body !==
        "object" ||
      Array.isArray(
        body
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Dados inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const anterior =
      await prisma.orcamento.findFirst({
        where:
          escopoOrcamento(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        include: {
          vendaGerada: {
            select: {
              id: true,
            },
          },
        },
      })

    if (!anterior) {
      return NextResponse.json(
        {
          message:
            "Orçamento não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      anterior.vendaGerada
    ) {
      return NextResponse.json(
        {
          message:
            "O orçamento já gerou Venda; seus dados comerciais estão bloqueados.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * PRÉ-VALIDAÇÃO COMERCIAL
     *
     * A tela utilizará esta ação antes de efetivar
     * a aprovação para mostrar claramente:
     *
     * - política encontrada;
     * - faixa de comissão encontrada;
     * - pedido mínimo;
     * - desconto negociado;
     * - comissão correspondente.
     *
     * Nenhum dado é alterado nesta ação.
     */
    const validarPolitica =
      body.acao ===
      "VALIDAR_POLITICA_COMERCIAL"

    if (
      validarPolitica
    ) {
      const chavesPermitidas =
        new Set([
          "acao",
          "dataVenda",
          "descontoPercentual",
        ])

      if (
        Object.keys(
          body
        ).some(
          (
            chave
          ) =>
            !chavesPermitidas.has(
              chave
            )
        )
      ) {
        return NextResponse.json(
          {
            message:
              "A validação comercial aceita somente data da Venda e desconto percentual.",
          },
          {
            status: 400,
          }
        )
      }

      const dataVendaTexto =
        texto(
          body.dataVenda
        )

      const dataVenda =
        diaComercial(
          dataVendaTexto
        )

      const descontoPercentual =
        percentualCadastrado(
          body.descontoPercentual
        )

      if (
        !dataVenda ||
        !dataVendaTexto ||
        dataVendaTexto >
          diaBrasilia(
            new Date()
          ) ||
        descontoPercentual ===
          null
      ) {
        return NextResponse.json(
          {
            message:
              "Informe uma data comercial válida, não futura, e o desconto efetivamente negociado em percentual.",
          },
          {
            status: 400,
          }
        )
      }

      const politica =
        await prisma.$transaction(
          (
            tx
          ) =>
            resolverPoliticaComercial(
              tx,
              anterior,
              dataVenda,
              descontoPercentual
            )
        )

      const financeiroRestrito =
        sessao.perfil ===
        "Preposto"

      return NextResponse.json({
        id:
          anterior.id,

        validacaoComercial: {
          representadaNome:
            politica.representadaNome,

          regraId:
            politica.regraId,

          regraNome:
            politica.regraNome,

          vigenciaInicio:
            politica.vigenciaInicio,

          vigenciaFim:
            politica.vigenciaFim,

          tipoComissao:
            politica.tipoComissao,

          valorPedido:
            politica.valorPedido,

          pedidoMinimoPolitica:
            politica.pedidoMinimoPolitica,

          pedidoMinimoCondicao:
            politica.pedidoMinimoCondicao,

          descontoPercentual:
            politica.descontoPercentual,

          percentualComissao:
            financeiroRestrito
              ? null
              : politica.percentualComissao,

          informacoesFinanceirasRestritas:
            financeiroRestrito,

          situacao:
            "PRONTA_PARA_GERAR_VENDA",
        },
      })
    }

    const converter =
      body.acao ===
      "GERAR_VENDA_APROVADA"

    if (converter) {
      if (
        Object.keys(
          body
        ).some(
          (
            chave
          ) =>
            chave !==
            "acao"
        )
      ) {
        return NextResponse.json(
          {
            message:
              "A conversão não aceita alterações comerciais.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        anterior.status !==
        "Aprovado"
      ) {
        return NextResponse.json(
          {
            message:
              "Somente um Orçamento aprovado pode ser convertido.",
          },
          {
            status: 409,
          }
        )
      }

      const aceite =
        lerAceite(
          anterior.motivoFinalizacao
        )

      if (!aceite) {
        if (
          possuiAceiteV1(
            anterior.motivoFinalizacao
          )
        ) {
          return NextResponse.json(
            {
              message:
                "Esta aprovação foi registrada no formato histórico V1, quando o desconto era tratado em valor monetário. Para preservar o histórico e evitar recálculo incorreto, a conversão automática foi bloqueada. Apure este caso individualmente.",
            },
            {
              status: 409,
            }
          )
        }

        return NextResponse.json(
          {
            message:
              "A aprovação anterior não possui todos os dados verificáveis. Não crie Venda automaticamente; apure o histórico.",
          },
          {
            status: 409,
          }
        )
      }

      const resultado =
        await prisma.$transaction(
          async (
            tx
          ) => {
            const atualizado =
              await tx.orcamento.updateMany({
                where: {
                  id:
                    anterior.id,

                  status:
                    "Aprovado",

                  atualizadoEm:
                    anterior.atualizadoEm,
                },

                data: {
                  atualizadoEm:
                    new Date(),
                },
              })

            if (
              atualizado.count !==
              1
            ) {
              throw new Error(
                "ORCAMENTO_ALTERADO"
              )
            }

            const venda =
              await gerarVenda(
                tx,
                anterior,
                aceite,
                sessao.usuarioId
              )

            await tx.auditoria.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                usuarioId:
                  sessao.usuarioId,

                entidade:
                  "Orcamento",

                entidadeId:
                  anterior.id,

                acao:
                  "CONVERSAO_VENDA_APROVADA",

                dadosAntes:
                  snapshot(
                    anterior
                  ),

                dadosDepois: {
                  ...snapshot(
                    anterior
                  ),

                  vendaId:
                    venda.id,

                  conversaoRegistradaEm:
                    new Date().toISOString(),
                },
              },
            })

            const completo =
              await tx.orcamento.findUniqueOrThrow({
                where: {
                  id:
                    anterior.id,
                },

                include:
                  INCLUDE,
              })

            return {
              venda,
              completo,
            }
          }
        )

      return NextResponse.json({
        ...resultado.completo,

        vendaCriada:
          resultado.venda,
      })
    }

    if (
      anterior.status ===
      "Aprovado"
    ) {
      return NextResponse.json(
        {
          message:
            "A aprovação está congelada. Formalize o Cliente e utilize a conversão específica.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      body.acao !==
      undefined
    ) {
      return NextResponse.json(
        {
          message:
            "Ação desconhecida.",
        },
        {
          status: 400,
        }
      )
    }

    const clienteId =
      texto(
        body.clienteId
      ) ??
      anterior.clienteId

    const representadaId =
      texto(
        body.representadaId
      ) ??
      anterior.representadaId

    if (!clienteId) {
      return NextResponse.json(
        {
          message:
            "Cliente não vinculado: regularize o registro antes de movimentar.",
        },
        {
          status: 409,
        }
      )
    }

    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id:
            clienteId,

          escritorioId:
            sessao.escritorioId,

          ...(sessao.perfil ===
          "Preposto"
            ? {
                OR: [
                  {
                    responsavelPrincipalId:
                      sessao.usuarioId,
                  },
                  {
                    participantes: {
                      some: {
                        usuarioId:
                          sessao.usuarioId,

                        ativa:
                          true,
                      },
                    },
                  },
                ],
              }
            : {}),
        },

        select: {
          id: true,
          status: true,
          cnpj: true,
        },
      })

    if (!cliente) {
      return NextResponse.json(
        {
          message:
            "Cliente não encontrado ou sem permissão.",
        },
        {
          status: 403,
        }
      )
    }

    const representada =
      await prisma.representada.findFirst({
        where: {
          id:
            representadaId,

          escritorioId:
            sessao.escritorioId,

          status:
            "Ativa",
        },

        select: {
          id:
            true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada inativa, inexistente ou sem permissão.",
        },
        {
          status: 403,
        }
      )
    }

    const interacaoOrigemId =
      body.interacaoOrigemId ===
      undefined
        ? anterior.interacaoOrigemId
        : texto(
            body.interacaoOrigemId
          )

    const interacao =
      interacaoOrigemId
        ? await prisma.interacao.findFirst({
            where: {
              id:
                interacaoOrigemId,

              escritorioId:
                sessao.escritorioId,

              ...(sessao.perfil ===
              "Preposto"
                ? {
                    OR: [
                      {
                        criadoPorId:
                          sessao.usuarioId,
                      },
                      {
                        responsavelId:
                          sessao.usuarioId,
                      },
                      {
                        cliente: {
                          is: {
                            escritorioId:
                              sessao.escritorioId,

                            OR: [
                              {
                                responsavelPrincipalId:
                                  sessao.usuarioId,
                              },
                              {
                                participantes: {
                                  some: {
                                    usuarioId:
                                      sessao.usuarioId,

                                    ativa:
                                      true,
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  }
                : {}),
            },

            select: {
              id:
                true,

              tipo:
                true,

              clienteId:
                true,

              representadaId:
                true,

              nomeProspect:
                true,
            },
          })
        : null

    if (
      interacaoOrigemId &&
      !interacao
    ) {
      return NextResponse.json(
        {
          message:
            "Interação de origem inexistente ou sem permissão.",
        },
        {
          status: 403,
        }
      )
    }

    const prospeccao =
      Boolean(
        interacao?.tipo ===
          "Prospecção" &&
        interacao.clienteId ===
          null &&
        interacao.representadaId ===
          null &&
        interacao.nomeProspect?.trim()
      )

    if (
      interacao &&
      !prospeccao &&
      interacao.clienteId !==
        clienteId
    ) {
      return NextResponse.json(
        {
          message:
            "A interação pertence a outro Cliente.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      prospeccao &&
      (
        interacaoOrigemId !==
          anterior.interacaoOrigemId ||
        clienteId !==
          anterior.clienteId
      ) &&
      body.confirmarVinculoProspeccao !==
        true
    ) {
      return NextResponse.json(
        {
          message:
            "Confirme a identidade da Prospecção e do Cliente antes de alterar o vínculo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      cliente.status ===
        "Em qualificação" &&
      !prospeccao
    ) {
      return NextResponse.json(
        {
          message:
            "Pré-cadastro exige uma Prospecção de origem válida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      cliente.status !==
        "Ativo" &&
      cliente.status !==
        "Em qualificação"
    ) {
      return NextResponse.json(
        {
          message:
            "Cadastro inativo ou não qualificado.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      cliente.status ===
        "Ativo" &&
      !cliente.cnpj?.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Cliente ativo precisa de CNPJ para movimentar Orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    let valorTotal =
      anterior.valorTotal

    if (
      body.valorTotal !==
      undefined
    ) {
      const n =
        dinheiro(
          body.valorTotal
        )

      if (
        n === null ||
        n <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Valor total inválido.",
          },
          {
            status: 400,
          }
        )
      }

      valorTotal =
        n
    }

    let validadeEm =
      anterior.validadeEm

    if (
      body.validadeEm !==
      undefined
    ) {
      const d =
        instante(
          body.validadeEm
        )

      if (!d) {
        return NextResponse.json(
          {
            message:
              "Validade inválida.",
          },
          {
            status: 400,
          }
        )
      }

      validadeEm =
        d
    }

    const status =
      body.status ===
      undefined
        ? anterior.status
        : body.status

    if (
      typeof status !==
        "string" ||
      !ESTADOS.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Status inválido.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      status ===
        "Aprovado" &&
      ![
        "Pendente",
        "Vencido",
      ].includes(
        anterior.status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Somente Orçamento pendente ou vencido pode receber aprovação.",
        },
        {
          status: 409,
        }
      )
    }

    const retomandoVencido =
      anterior.status ===
        "Vencido" &&
      status ===
        "Pendente"

    if (
      retomandoVencido
    ) {
      if (
        body.validadeEm ===
        undefined
      ) {
        return NextResponse.json(
          {
            message:
              "Para retomar um Orçamento vencido, informe obrigatoriamente uma nova validade.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        validadeEm.getTime() <=
          anterior.validadeEm.getTime() ||
        diaBrasilia(
          validadeEm
        ) <
          diaBrasilia(
            new Date()
          )
      ) {
        return NextResponse.json(
          {
            message:
              "A nova validade precisa ser posterior à validade anterior e não pode estar vencida.",
          },
          {
            status: 400,
          }
        )
      }
    }

    let enviadoEm =
      anterior.enviadoEm

    if (
      body.enviadoEm !==
      undefined
    ) {
      if (
        body.enviadoEm ===
          null ||
        body.enviadoEm ===
          ""
      ) {
        if (
          anterior.enviadoEm
        ) {
          return NextResponse.json(
            {
              message:
                "Envio já registrado não pode ser apagado; informe correção de data.",
            },
            {
              status: 400,
            }
          )
        }

        enviadoEm =
          null
      } else {
        const d =
          instante(
            body.enviadoEm
          )

        if (
          !d ||
          d.getTime() >
            Date.now()
        ) {
          return NextResponse.json(
            {
              message:
                "Data real de envio inválida ou futura.",
            },
            {
              status: 400,
            }
          )
        }

        enviadoEm =
          d
      }
    }

    const responsavelId =
      body.responsavelId ===
      undefined
        ? anterior.responsavelId ??
          sessao.usuarioId
        : texto(
            body.responsavelId
          )

    if (
      !responsavelId ||
      (
        sessao.perfil ===
          "Preposto" &&
        responsavelId !==
          anterior.responsavelId &&
        responsavelId !==
          sessao.usuarioId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Responsável inválido ou sem permissão.",
        },
        {
          status: 403,
        }
      )
    }

    const responsavel =
      await prisma.usuario.findFirst({
        where: {
          id:
            responsavelId,

          escritorioId:
            sessao.escritorioId,

          ativo:
            true,
        },

        select: {
          id:
            true,
        },
      })

    if (
      !responsavel
    ) {
      return NextResponse.json(
        {
          message:
            "Responsável inativo ou não encontrado.",
        },
        {
          status: 400,
        }
      )
    }

    const condicaoPagamento =
      body.condicaoPagamento ===
      undefined
        ? anterior.condicaoPagamento
        : texto(
            body.condicaoPagamento
          )

    let motivoFinalizacao =
      anterior.motivoFinalizacao

    let finalizadoEm =
      anterior.finalizadoEm

    let aceite:
      Aceite | null =
      null

    let criarVendaAgora =
      false

    if (
      status ===
      "Aprovado"
    ) {
      const validacao =
        conferirAceite(
          body,
          enviadoEm
        )

      if (
        typeof validacao ===
        "string"
      ) {
        return NextResponse.json(
          {
            message:
              validacao,
          },
          {
            status: 400,
          }
        )
      }

      aceite =
        validacao.registro

      motivoFinalizacao =
        registrarAceite(
          aceite
        )

      finalizadoEm =
        new Date()

      criarVendaAgora =
        cliente.status ===
        "Ativo"
    } else if (
      status ===
        "Recusado" ||
      status ===
        "Cancelado"
    ) {
      if (
        status !==
          anterior.status ||
        !finalizadoEm
      ) {
        finalizadoEm =
          new Date()
      }

      motivoFinalizacao =
        body.motivoFinalizacao ===
        undefined
          ? motivoFinalizacao
          : texto(
              body.motivoFinalizacao
            )
    } else if (
      status ===
      "Pendente"
    ) {
      finalizadoEm =
        null

      motivoFinalizacao =
        null
    }

    const resultado =
      await prisma.$transaction(
        async (
          tx
        ) => {
          const alterado =
            await tx.orcamento.updateMany({
              where: {
                id:
                  anterior.id,

                status:
                  anterior.status,

                atualizadoEm:
                  anterior.atualizadoEm,
              },

              data: {
                clienteId,

                representadaId,

                interacaoOrigemId,

                responsavelId,

                validadeEm,

                valorTotal,

                condicaoPagamento,

                descricao:
                  body.descricao ===
                  undefined
                    ? anterior.descricao
                    : texto(
                        body.descricao
                      ),

                status,

                enviadoEm,

                finalizadoEm,

                motivoFinalizacao,

                arquivoUrl:
                  body.arquivoUrl ===
                  undefined
                    ? anterior.arquivoUrl
                    : texto(
                        body.arquivoUrl
                      ),

                observacoes:
                  body.observacoes ===
                  undefined
                    ? anterior.observacoes
                    : texto(
                        body.observacoes
                      ),
              },
            })

          if (
            alterado.count !==
            1
          ) {
            throw new Error(
              "ORCAMENTO_ALTERADO"
            )
          }

          const atualizado =
            await tx.orcamento.findUniqueOrThrow({
              where: {
                id:
                  anterior.id,
              },
            })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "Orcamento",

              entidadeId:
                anterior.id,

              acao:
                status ===
                "Aprovado"
                  ? anterior.status ===
                    "Vencido"
                    ? "APROVACAO_APOS_VENCIMENTO"
                    : "APROVACAO"
                  : retomandoVencido
                    ? "RETOMADA_ORCAMENTO_VENCIDO"
                    : status ===
                        "Recusado" &&
                      anterior.status ===
                        "Vencido"
                      ? "RECUSA_APOS_VENCIMENTO"
                      : "EDICAO",

              dadosAntes:
                snapshot(
                  anterior
                ),

              dadosDepois:
                snapshot(
                  atualizado
                ),
            },
          })

          const venda =
            criarVendaAgora &&
            aceite
              ? await gerarVenda(
                  tx,
                  atualizado,
                  aceite,
                  sessao.usuarioId
                )
              : null

          const completo =
            await tx.orcamento.findUniqueOrThrow({
              where: {
                id:
                  anterior.id,
              },

              include:
                INCLUDE,
            })

          return {
            venda,
            completo,
          }
        }
      )

    return NextResponse.json({
      ...resultado.completo,

      vendaCriada:
        resultado.venda,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Este Orçamento já possui Venda vinculada.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      error instanceof
      Error
    ) {
      const [
        codigoErro,
        detalhe,
      ] =
        error.message.split(
          "|"
        )

      if (
        codigoErro ===
          "PEDIDO_MINIMO_NAO_ATINGIDO"
      ) {
        const minimo =
          Number(
            detalhe
          )

        const minimoTexto =
          Number.isFinite(
            minimo
          )
            ? moedaBR(
                minimo
              )
            : "o mínimo cadastrado"

        return NextResponse.json(
          {
            message:
              `O valor deste Orçamento é inferior ao pedido mínimo de ${minimoTexto} exigido para a faixa de comissão correspondente ao desconto informado. Confira o valor do pedido, o desconto negociado e a política da Representada antes de gerar a Venda.`,
          },
          {
            status: 409,
          }
        )
      }

      const mensagens:
        Record<
          string,
          string
        > = {
        ORCAMENTO_ALTERADO:
          "O orçamento foi alterado por outra operação. Atualize a página antes de continuar.",

        ORCAMENTO_JA_CONVERTIDO:
          "Este orçamento já foi convertido em Venda.",

        CLIENTE_NAO_FORMALIZADO:
          "Formalize o mesmo Cliente, com CNPJ verdadeiro e status Ativo, antes de gerar Venda.",

        REPRESENTADA_INATIVA:
          "A Representada precisa estar ativa para gerar Venda.",

        POLITICA_COMERCIAL_PADRAO_AUSENTE:
          "Não é possível gerar a Venda: nenhuma política comercial Padrão, ativa e vigente foi encontrada para a Representada na data comercial informada. Corrija a política da Representada antes de continuar.",

        POLITICA_COMERCIAL_CONFLITANTE:
          "Conflito cadastral: existem duas ou mais políticas comerciais Padrão ativas e vigentes para esta Representada na mesma data. O CRM não escolherá uma delas automaticamente. Corrija as vigências antes de continuar.",

        REGRA_CLIENTE_LEGADA_VIGENTE:
          "Conflito cadastral: este Cliente ainda possui uma regra comercial específica do modelo anterior vigente. O CRM não irá escolher silenciosamente entre essa regra e a política atual da Representada. Regularize esse cadastro antes de gerar a Venda.",

        ACEITE_INVALIDO:
          "O registro de aprovação está incompleto ou inconsistente.",

        COMISSAO_CADASTRO_INVALIDO:
          "A política comercial vigente está incompleta ou possui comissão/faixas inválidas. O CRM não utilizará a comissão do cadastro principal como alternativa silenciosa. Corrija a política da Representada antes de gerar a Venda.",

        FAIXA_COMISSAO_NAO_ENCONTRADA:
          "O desconto efetivamente negociado não corresponde exatamente a nenhuma faixa de comissão cadastrada na política comercial vigente. Confira o percentual informado e as faixas da Representada.",

        FAIXA_COMISSAO_AMBIGUA:
          "Conflito cadastral: mais de uma faixa corresponde ao mesmo percentual de desconto. O CRM não escolherá uma comissão automaticamente. Corrija a política da Representada.",
      }

      if (
        mensagens[
          codigoErro
        ]
      ) {
        return NextResponse.json(
          {
            message:
              mensagens[
                codigoErro
              ],
          },
          {
            status: 409,
          }
        )
      }
    }

    console.error(
      "Erro ao atualizar orçamento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar orçamento.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE() {
  try {
    await exigirSessao()

    return NextResponse.json(
      {
        message:
          "Exclusão de Orçamento bloqueada. Utilize edição ou cancelamento para preservar o histórico.",
      },
      {
        status: 405,
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    return NextResponse.json(
      {
        message:
          "Operação não permitida.",
      },
      {
        status: 405,
      }
    )
  }
}