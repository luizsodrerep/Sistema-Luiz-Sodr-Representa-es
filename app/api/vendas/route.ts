import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextRequest, NextResponse } from "next/server"

function dataValida(valor: unknown) {
  if (typeof valor !== "string" || valor.trim() === "") {
    return null
  }

  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

function numeroPositivo(valor: unknown) {
  if (valor === null || valor === undefined || valor === "") {
    return null
  }

  const numero = typeof valor === "number" ? valor : Number(valor)

  return Number.isFinite(numero) && numero > 0 ? numero : null
}

function numeroOpcional(valor: unknown) {
  if (valor === null || valor === undefined || valor === "") {
    return null
  }

  const numero = typeof valor === "number" ? valor : Number(valor)

  return Number.isFinite(numero) ? numero : null
}

/*
 * As datas das regras são informadas pela interface como YYYY-MM-DD.
 * Comparar somente o dia UTC mantém o último dia da vigência incluído,
 * inclusive para Vendas retroativas.
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

function valorMonetarioNaoNegativo(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") {
    return 0
  }

  const numero = numeroOpcional(valor)

  if (
    numero === null ||
    numero < 0 ||
    !Number.isSafeInteger(Math.round(numero * 100)) ||
    Math.abs(numero * 100 - Math.round(numero * 100)) > 0.000001
  ) {
    return null
  }

  return Math.round(numero * 100) / 100
}

function numeroDaFaixa(valor: unknown): number | null {
  if (typeof valor !== "string" && typeof valor !== "number") {
    return null
  }

  const normalizado =
    typeof valor === "string" ? valor.trim().replace(",", ".") : valor

  if (normalizado === "") return null

  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

function calcularPercentualDaPolitica({
  tipo,
  percentualFixo,
  faixasJson,
  valorOriginalCentavos,
  descontoCentavos,
}: {
  tipo: string | null
  percentualFixo: number | null
  faixasJson: string | null
  valorOriginalCentavos: number
  descontoCentavos: number
}): { percentual: number; erro: null } | { percentual: null; erro: string } {
  if (tipo === "fixa") {
    if (
      percentualFixo === null ||
      !Number.isFinite(percentualFixo) ||
      percentualFixo < 0 ||
      percentualFixo > 100
    ) {
      return {
        percentual: null,
        erro: "A política fixa da Representada não possui um percentual de comissão válido.",
      }
    }

    return { percentual: percentualFixo, erro: null }
  }

  if (tipo !== "variada") {
    return {
      percentual: null,
      erro: "Cadastre uma política de comissão fixa ou variável válida na Representada antes de lançar esta Venda.",
    }
  }

  let faixas: unknown

  try {
    faixas = JSON.parse(faixasJson || "")
  } catch {
    return {
      percentual: null,
      erro: "As faixas de comissão da política estão inválidas. Revise o cadastro da Representada.",
    }
  }

  if (!Array.isArray(faixas) || faixas.length === 0) {
    return {
      percentual: null,
      erro: "A política de comissão variável não possui faixas cadastradas.",
    }
  }

  const percentuaisCorrespondentes: number[] = []
  const descontosCadastrados = new Set<number>()

  for (const item of faixas) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {
        percentual: null,
        erro: "A política de comissão possui uma faixa inválida.",
      }
    }

    const faixa = item as Record<string, unknown>
    const percentualDesconto = numeroDaFaixa(faixa.desconto)
    const percentualComissao = numeroDaFaixa(faixa.comissao)

    if (
      percentualDesconto === null ||
      percentualComissao === null ||
      percentualDesconto < 0 ||
      percentualDesconto > 100 ||
      percentualComissao < 0 ||
      percentualComissao > 100
    ) {
      return {
        percentual: null,
        erro: "A política possui percentuais de desconto ou comissão inválidos.",
      }
    }

    if (descontosCadastrados.has(percentualDesconto)) {
      return {
        percentual: null,
        erro: "Há faixas de desconto duplicadas na política da Representada.",
      }
    }

    descontosCadastrados.add(percentualDesconto)

    // O desconto registrado já foi incorporado ao valor final da Venda.
    // Comparar centavos evita erros de ponto flutuante no percentual.
    const descontoEsperadoCentavos = Math.round(
      (valorOriginalCentavos * percentualDesconto) / 100
    )

    if (descontoEsperadoCentavos === descontoCentavos) {
      percentuaisCorrespondentes.push(percentualComissao)
    }
  }

  if (percentuaisCorrespondentes.length !== 1) {
    return {
      percentual: null,
      erro:
        percentuaisCorrespondentes.length > 1
          ? "Mais de uma faixa corresponde ao desconto informado. Revise a política da Representada."
          : "O desconto desta Venda não corresponde a uma faixa cadastrada. Confira o desconto e a política da Representada.",
    }
  }

  return { percentual: percentuaisCorrespondentes[0], erro: null }
}

function inteiroPositivo(
  valor: string | null,
  padrao: number,
  maximo: number
) {
  if (!valor) return padrao

  const numero = Number.parseInt(valor, 10)

  if (!Number.isInteger(numero) || numero <= 0) {
    return padrao
  }

  return Math.min(numero, maximo)
}

function dataFiltro(valor: string | null, fimDoDia = false) {
  if (!valor) return null

  const somenteData = /^\d{4}-\d{2}-\d{2}$/.test(valor)

  const data = somenteData
    ? new Date(
        `${valor}T${fimDoDia ? "23:59:59.999" : "00:00:00.000"}Z`
      )
    : new Date(valor)

  return Number.isNaN(data.getTime()) ? null : data
}

function numeroDaBusca(busca: string) {
  const correspondencia = busca.match(/\d+/)
  if (!correspondencia) return null

  const numero = Number.parseInt(correspondencia[0], 10)
  return Number.isInteger(numero) ? numero : null
}

export async function GET(request: NextRequest) {
  try {
    const sessao = await exigirSessao()
    const searchParams = request.nextUrl.searchParams

    const clienteId = searchParams.get("clienteId")?.trim() || null
    const representadaId =
      searchParams.get("representadaId")?.trim() || null
    const status = searchParams.get("status")?.trim() || null
    const busca = searchParams.get("busca")?.trim() || null

    const dataInicioTexto =
      searchParams.get("dataInicio")?.trim() || null
    const dataFimTexto =
      searchParams.get("dataFim")?.trim() || null

    const dataInicio = dataFiltro(dataInicioTexto)
    const dataFim = dataFiltro(dataFimTexto, true)

    if (dataInicioTexto && !dataInicio) {
      return NextResponse.json(
        { message: "Data inicial inválida." },
        { status: 400 }
      )
    }

    if (dataFimTexto && !dataFim) {
      return NextResponse.json(
        { message: "Data final inválida." },
        { status: 400 }
      )
    }

    if (
      dataInicio &&
      dataFim &&
      dataInicio.getTime() > dataFim.getTime()
    ) {
      return NextResponse.json(
        {
          message: "A data inicial não pode ser posterior à data final.",
        },
        { status: 400 }
      )
    }

    const pagina = inteiroPositivo(
      searchParams.get("page"),
      1,
      1000000
    )

    const limite = inteiroPositivo(
      searchParams.get("limit"),
      10,
      50
    )

    const paginado =
      searchParams.get("paginado") === "1" ||
      searchParams.has("page") ||
      searchParams.has("limit")

    const filtrosAnd: Prisma.VendaWhereInput[] = []

    // Preserva o escopo original de consulta do perfil Preposto.
    if (sessao.perfil === "Preposto") {
      filtrosAnd.push({
        OR: [
          { responsavelId: sessao.usuarioId },
          { criadoPorId: sessao.usuarioId },
        ],
      })
    }

    if (busca) {
      const numeroSequencial = numeroDaBusca(busca)

      const filtrosBusca: Prisma.VendaWhereInput[] = [
        {
          numeroPedidoInterno: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          numeroPedido: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          numeroPedidoRepresentada: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          numeroOCCliente: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          produto: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          observacoes: {
            contains: busca,
            mode: "insensitive",
          },
        },
        {
          cliente: {
            razaoSocial: {
              contains: busca,
              mode: "insensitive",
            },
          },
        },
        {
          cliente: {
            nomeFantasia: {
              contains: busca,
              mode: "insensitive",
            },
          },
        },
        {
          representada: {
            nome: {
              contains: busca,
              mode: "insensitive",
            },
          },
        },
      ]

      if (numeroSequencial !== null) {
        filtrosBusca.unshift({ numeroSequencial })
      }

      filtrosAnd.push({ OR: filtrosBusca })
    }

    if (dataInicio || dataFim) {
      filtrosAnd.push({
        data: {
          ...(dataInicio ? { gte: dataInicio } : {}),
          ...(dataFim ? { lte: dataFim } : {}),
        },
      })
    }

    const where: Prisma.VendaWhereInput = {
      escritorioId: sessao.escritorioId,

      ...(clienteId ? { clienteId } : {}),

      ...(representadaId ? { representadaId } : {}),

      ...(status &&
      status.toLocaleLowerCase("pt-BR") !== "todos"
        ? { status }
        : {}),

      ...(filtrosAnd.length > 0 ? { AND: filtrosAnd } : {}),
    }

    const include: Prisma.VendaInclude = {
      cliente: true,
      representada: true,
      regraComercial: true,

      orcamentoOrigem: {
        select: {
          id: true,
          numeroSequencial: true,
          status: true,

          interacaoOrigem: {
            select: {
              id: true,
              numeroSequencial: true,
              tipo: true,
              assunto: true,
            },
          },
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
    }

    if (!paginado) {
      const vendas = await prisma.venda.findMany({
        where,
        include,

        orderBy: [
          { data: "desc" },
          { criadoEm: "desc" },
        ],
      })

      return NextResponse.json(vendas)
    }

    const [total, vendas] = await prisma.$transaction([
      prisma.venda.count({ where }),

      prisma.venda.findMany({
        where,
        include,

        orderBy: [
          { data: "desc" },
          { criadoEm: "desc" },
        ],

        skip: (pagina - 1) * limite,
        take: limite,
      }),
    ])

    const totalPaginas = Math.max(
      1,
      Math.ceil(total / limite)
    )

    return NextResponse.json({
      dados: vendas,

      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao listar vendas:", error)

    return NextResponse.json(
      { message: "Erro ao listar vendas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessao = await exigirSessao()
    const body = await request.json()

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Dados da Venda inválidos." },
        { status: 400 }
      )
    }

    /*
     * Conversão de Orçamento é feita exclusivamente na
     * API individual de Orçamentos. Ali são conferidos
     * o aceite e a criação transacional da Venda.
     *
     * Este POST continua disponível para Vendas manuais.
     */
    if (
      body.orcamentoOrigemId !== undefined &&
      body.orcamentoOrigemId !== null &&
      body.orcamentoOrigemId !== ""
    ) {
      return NextResponse.json(
        {
          message:
            "Para converter um Orçamento aprovado, use a ação GERAR_VENDA_APROVADA no próprio Orçamento.",
        },
        { status: 409 }
      )
    }

    const dataVenda = dataValida(body.data)

    if (!dataVenda) {
      return NextResponse.json(
        { message: "Informe uma data de venda válida." },
        { status: 400 }
      )
    }

    const clienteId =
      typeof body.clienteId === "string" &&
      body.clienteId.trim() !== ""
        ? body.clienteId.trim()
        : null

    const representadaId =
      typeof body.representadaId === "string" &&
      body.representadaId.trim() !== ""
        ? body.representadaId.trim()
        : null

    const valorTotal = numeroPositivo(body.valorTotal)

    const condicaoPagamento =
      typeof body.condicaoPagamento === "string" &&
      body.condicaoPagamento.trim() !== ""
        ? body.condicaoPagamento.trim()
        : null

    if (!clienteId) {
      return NextResponse.json(
        { message: "Cliente obrigatório." },
        { status: 400 }
      )
    }

    if (!representadaId) {
      return NextResponse.json(
        { message: "Representada obrigatória." },
        { status: 400 }
      )
    }

    if (valorTotal === null) {
      return NextResponse.json(
        {
          message: "Informe um valor de venda maior que zero.",
        },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        escritorioId: sessao.escritorioId,
      },

      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        status: true,
      },
    })

    if (!cliente) {
      return NextResponse.json(
        {
          message: "Cliente não encontrado neste escritório.",
        },
        { status: 404 }
      )
    }

    if (cliente.status !== "Ativo") {
      return NextResponse.json(
        {
          message:
            "O cliente precisa estar ativo para registrar uma venda.",
        },
        { status: 400 }
      )
    }

    if (!cliente.cnpj || cliente.cnpj.trim() === "") {
      return NextResponse.json(
        {
          message:
            "O cliente precisa possuir CNPJ cadastrado para registrar venda.",
        },
        { status: 400 }
      )
    }

    const representada = await prisma.representada.findFirst({
      where: {
        id: representadaId,
        escritorioId: sessao.escritorioId,
      },

      select: {
        id: true,
        nome: true,
        status: true,
        comissao: true,
        tipoComissao: true,
        faixasComissao: true,
        regraReconhecimentoComissao: true,
      },
    })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada neste escritório.",
        },
        { status: 404 }
      )
    }

    if (representada.status !== "Ativa") {
      return NextResponse.json(
        {
          message:
            "A Representada precisa estar ativa para registrar uma venda.",
        },
        { status: 400 }
      )
    }

    /*
     * Valor total já é o valor efetivo do pedido, com descontos
     * negociados incorporados. Desconto serve para identificar
     * a faixa e recuperar o valor original; bonificação é registrada
     * separadamente e nunca é abatida automaticamente da base.
     */
    const desconto = valorMonetarioNaoNegativo(body.desconto)
    const bonificacaoValor = valorMonetarioNaoNegativo(
      body.bonificacaoValor
    )

    if (desconto === null || bonificacaoValor === null) {
      return NextResponse.json(
        {
          message:
            "Desconto e bonificação devem ser valores em reais não negativos, com até duas casas decimais.",
        },
        { status: 400 }
      )
    }

    const valorTotalCentavos = Math.round(valorTotal * 100)
    const valorOriginalCentavos =
      valorTotalCentavos + Math.round(desconto * 100)

    if (
      !Number.isSafeInteger(valorTotalCentavos) ||
      Math.abs(valorTotal * 100 - valorTotalCentavos) > 0.000001 ||
      !Number.isSafeInteger(valorOriginalCentavos)
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um valor de Venda válido em reais, com até duas casas decimais.",
        },
        { status: 400 }
      )
    }

    const regraInformadaId =
      typeof body.regraComercialId === "string"
        ? body.regraComercialId.trim() || null
        : null

    if (
      body.regraComercialId !== undefined &&
      body.regraComercialId !== null &&
      typeof body.regraComercialId !== "string"
    ) {
      return NextResponse.json(
        { message: "Identificador da regra comercial inválido." },
        { status: 400 }
      )
    }

    const regras = await prisma.regraComercialRepresentada.findMany({
      where: {
        representadaId: representada.id,
        ativa: true,

        OR: [
          { clienteId: cliente.id },
          { clienteId: null, tipoEscopo: "Padrao" },
        ],
      },

      orderBy: [
        { vigenciaInicio: "desc" },
        { criadoEm: "desc" },
      ],
    })

    const regrasVigentes = regras.filter((regra) =>
      regraEstaVigente(
        regra.vigenciaInicio,
        regra.vigenciaFim,
        dataVenda
      )
    )

    const regrasCliente = regrasVigentes.filter(
      (regra) =>
        regra.clienteId === cliente.id &&
        regra.tipoEscopo !== "Padrao"
    )

    const regrasPadrao = regrasVigentes.filter(
      (regra) =>
        regra.clienteId === null &&
        regra.tipoEscopo === "Padrao"
    )

    /*
     * PROTEÇÃO COMERCIAL
     *
     * Uma Venda nova somente pode ser registrada quando a
     * Representada possuir ao menos uma regra comercial padrão,
     * ativa e vigente na data efetiva da Venda.
     *
     * Regras específicas de Cliente podem complementar ou substituir
     * condições da negociação, mas não eliminam a obrigação de existir
     * uma política comercial padrão válida para a Representada.
     *
     * A meta mensal da Representada é gerencial e não participa
     * deste bloqueio operacional.
     */
    if (regrasPadrao.length === 0) {
      return NextResponse.json(
        {
          message:
            "Esta Representada está ativa, mas não possui uma política comercial padrão, ativa e vigente para a data da Venda. Regularize a política comercial da Representada antes de registrar uma nova Venda.",
        },
        { status: 409 }
      )
    }

    /*
     * A regra explícita é útil para campanhas de uma operação.
     * Nunca aceitamos regra de outra Representada, outro Cliente,
     * inativa ou fora da vigência. Uma regra padrão não substitui
     * silenciosamente a política específica vigente do Cliente.
     */
    const candidatas =
      regrasCliente.length > 0 ? regrasCliente : regrasPadrao

    if (regraInformadaId) {
      const regraSelecionada = candidatas.find(
        (regra) => regra.id === regraInformadaId
      )

      if (!regraSelecionada) {
        return NextResponse.json(
          {
            message:
              "A regra informada não é válida para esta Representada, Cliente e data da Venda. Confira a política comercial.",
          },
          { status: 400 }
        )
      }
    } else if (candidatas.length > 1) {
      return NextResponse.json(
        {
          message:
            "Há mais de uma regra comercial vigente para esta negociação. Selecione a regra correspondente antes de registrar a Venda.",
        },
        { status: 409 }
      )
    }

    const regraAplicavel = regraInformadaId
      ? candidatas.find((regra) => regra.id === regraInformadaId) || null
      : candidatas[0] || null

    /*
     * Regras sem comissão própria podem conter apenas condições
     * operacionais; nesse caso a política do cadastro principal
     * da Representada continua sendo a origem do percentual.
     */
    const regraDefineComissao = Boolean(
      regraAplicavel &&
        (regraAplicavel.tipoComissao !== null ||
          regraAplicavel.percentualComissao !== null ||
          regraAplicavel.faixasComissao !== null)
    )

    const tipoPolitica = regraDefineComissao
      ? regraAplicavel!.tipoComissao ||
        (regraAplicavel!.faixasComissao !== null ? "variada" : "fixa")
      : representada.tipoComissao ||
        (representada.faixasComissao !== null ? "variada" : "fixa")

    const resultadoPolitica = calcularPercentualDaPolitica({
      tipo: tipoPolitica,
      percentualFixo: regraDefineComissao
        ? regraAplicavel!.percentualComissao
        : representada.comissao,
      faixasJson: regraDefineComissao
        ? regraAplicavel!.faixasComissao
        : representada.faixasComissao,
      valorOriginalCentavos,
      descontoCentavos: Math.round(desconto * 100),
    })

    if (resultadoPolitica.percentual === null) {
      return NextResponse.json(
        { message: resultadoPolitica.erro },
        { status: 400 }
      )
    }

    const percentualComissao = resultadoPolitica.percentual

    // Não subtrair novamente desconto/bonificação: valorTotal é líquido.
    const baseCalculoComissao = valorTotalCentavos / 100

    const valorComissaoPrevista = Number(
      ((baseCalculoComissao * percentualComissao) / 100).toFixed(2)
    )

    const previsaoFaturamento = dataValida(
      body.previsaoFaturamento
    )

    const responsavelId =
      sessao.perfil === "Preposto"
        ? sessao.usuarioId
        : typeof body.responsavelId === "string" &&
            body.responsavelId.trim() !== ""
          ? body.responsavelId.trim()
          : sessao.usuarioId

    /*
     * Uma nova Venda manual começa Pendente.
     * A requisição não pode escolher livremente
     * sua situação inicial.
     */
    const status = "Pendente"

    const observacoes =
      typeof body.observacoes === "string" &&
      body.observacoes.trim() !== ""
        ? body.observacoes.trim()
        : null

    const numeroPedidoInterno =
      typeof body.numeroPedidoInterno === "string" &&
      body.numeroPedidoInterno.trim() !== ""
        ? body.numeroPedidoInterno.trim()
        : null

    const numeroPedido =
      typeof body.numeroPedido === "string" &&
      body.numeroPedido.trim() !== ""
        ? body.numeroPedido.trim()
        : null

    const numeroPedidoRepresentada =
      typeof body.numeroPedidoRepresentada === "string" &&
      body.numeroPedidoRepresentada.trim() !== ""
        ? body.numeroPedidoRepresentada.trim()
        : null

    const numeroOCCliente =
      typeof body.numeroOCCliente === "string" &&
      body.numeroOCCliente.trim() !== ""
        ? body.numeroOCCliente.trim()
        : null

    const produto =
      typeof body.produto === "string" &&
      body.produto.trim() !== ""
        ? body.produto.trim()
        : null

    const quantidade = numeroOpcional(body.quantidade)

    const resultado = await prisma.$transaction(
      async (tx) => {
        const venda = await tx.venda.create({
          data: {
            escritorioId: sessao.escritorioId,
            criadoPorId: sessao.usuarioId,
            responsavelId,

            data: dataVenda,
            clienteId,
            representadaId,

            regraComercialId: regraAplicavel?.id || null,

            // Venda manual: não atribuir origem de Orçamento.
            orcamentoOrigemId: null,

            numeroPedidoInterno,
            numeroPedido,
            numeroPedidoRepresentada,
            numeroOCCliente,

            produto,

            quantidade:
              quantidade !== null
                ? Math.trunc(quantidade)
                : null,

            valorTotal,
            desconto,

            comissao: valorComissaoPrevista,
            percentualComissaoAplicado: percentualComissao,

            regraReconhecimentoComissao:
              regraAplicavel?.reconhecimentoComissao ||
              representada.regraReconhecimentoComissao ||
              null,

            baseCalculoComissao,
            valorComissaoPrevista,
            bonificacaoValor,

            condicaoPagamento,
            previsaoFaturamento,
            status,
            observacoes,
          },

          include: {
            cliente: true,
            representada: true,
            regraComercial: true,

            orcamentoOrigem: {
              select: {
                id: true,
                numeroSequencial: true,
                status: true,

                interacaoOrigem: {
                  select: {
                    id: true,
                    numeroSequencial: true,
                    tipo: true,
                    assunto: true,
                  },
                },
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
          },
        })

        await tx.auditoria.create({
          data: {
            escritorioId: sessao.escritorioId,
            usuarioId: sessao.usuarioId,

            entidade: "Venda",
            entidadeId: venda.id,
            acao: "CRIACAO",

            dadosDepois: {
              id: venda.id,
              numeroSequencial: venda.numeroSequencial,
              data: venda.data,
              clienteId: venda.clienteId,
              representadaId: venda.representadaId,
              regraComercialId: venda.regraComercialId,
              orcamentoOrigemId: venda.orcamentoOrigemId,
              valorTotal: venda.valorTotal,
              desconto: venda.desconto,
              bonificacaoValor: venda.bonificacaoValor,
              baseCalculoComissao: venda.baseCalculoComissao,
              percentualComissaoAplicado:
                venda.percentualComissaoAplicado,
              valorComissaoPrevista:
                venda.valorComissaoPrevista,
              condicaoPagamento: venda.condicaoPagamento,
              status: venda.status,

              origem: {
                tipo: "VendaDireta",
              },
            },
          },
        })

        await tx.vendaEvento.create({
          data: {
            vendaId: venda.id,
            usuarioId: sessao.usuarioId,
            tipo: "Venda criada",
            canal: null,
            referencia: null,
            descricao:
              "Venda direta ou retroativa registrada no CRM.",
          },
        })

        return venda
      }
    )

    return NextResponse.json(resultado, { status: 201 })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao criar venda:", error)

    return NextResponse.json(
      { message: "Erro ao criar venda." },
      { status: 500 }
    )
  }
}