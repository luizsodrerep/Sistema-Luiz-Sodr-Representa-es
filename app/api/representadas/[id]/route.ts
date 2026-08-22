import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const representada = await prisma.representada.findUnique({
      where: { id },
    })

    if (!representada) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(representada, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar representada:", error)

    return NextResponse.json(
      { message: "Erro ao buscar representada" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existe = await prisma.representada.findUnique({
      where: { id },
    })

    if (!existe) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    if (
      typeof body.nome !== "string" ||
      body.nome.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Nome da representada é obrigatório." },
        { status: 400 }
      )
    }

    const tiposComissaoPermitidos = ["fixa", "variada"]

    if (
      typeof body.tipoComissao !== "string" ||
      !tiposComissaoPermitidos.includes(body.tipoComissao)
    ) {
      return NextResponse.json(
        { message: "Tipo de comissão inválido." },
        { status: 400 }
      )
    }

    const statusPermitidos = [
      "Ativa",
      "Inativa",
      "Suspensa",
    ]

    if (
      typeof body.status !== "string" ||
      !statusPermitidos.includes(body.status)
    ) {
      return NextResponse.json(
        { message: "Status da representada inválido." },
        { status: 400 }
      )
    }

    let comissao: number | null = null
    let faixasComissao: string | null = null

    if (body.tipoComissao === "fixa") {
      if (
        body.comissao === undefined ||
        body.comissao === null ||
        String(body.comissao).trim() === ""
      ) {
        return NextResponse.json(
          { message: "Comissão fixa é obrigatória." },
          { status: 400 }
        )
      }

      comissao = Number(body.comissao)

      if (!Number.isFinite(comissao) || comissao <= 0) {
        return NextResponse.json(
          { message: "Comissão fixa inválida." },
          { status: 400 }
        )
      }

      faixasComissao = null
    }

    if (body.tipoComissao === "variada") {
      if (
        typeof body.faixasComissao !== "string" ||
        body.faixasComissao.trim() === ""
      ) {
        return NextResponse.json(
          { message: "Faixas de comissão são obrigatórias." },
          { status: 400 }
        )
      }

      try {
        const faixas = JSON.parse(body.faixasComissao)

        if (!Array.isArray(faixas) || faixas.length === 0) {
          return NextResponse.json(
            { message: "Faixas de comissão inválidas." },
            { status: 400 }
          )
        }

        const faixasValidas = faixas.every(
          (faixa) =>
            faixa &&
            typeof faixa.desconto === "string" &&
            faixa.desconto.trim() !== "" &&
            typeof faixa.comissao === "string" &&
            faixa.comissao.trim() !== ""
        )

        if (!faixasValidas) {
          return NextResponse.json(
            {
              message:
                "Todas as faixas devem possuir desconto e comissão.",
            },
            { status: 400 }
          )
        }

        faixasComissao = JSON.stringify(faixas)
        comissao = null
      } catch {
        return NextResponse.json(
          { message: "Formato das faixas de comissão inválido." },
          { status: 400 }
        )
      }
    }

    const representada = await prisma.representada.update({
      where: { id },
      data: {
        nome: body.nome.trim(),

        cnpj:
          typeof body.cnpj === "string" &&
          body.cnpj.trim() !== ""
            ? body.cnpj.trim()
            : null,

        endereco:
          typeof body.endereco === "string" &&
          body.endereco.trim() !== ""
            ? body.endereco.trim()
            : null,

        cidade:
          typeof body.cidade === "string" &&
          body.cidade.trim() !== ""
            ? body.cidade.trim()
            : null,

        estado:
          typeof body.estado === "string" &&
          body.estado.trim() !== ""
            ? body.estado.trim()
            : null,

        cep:
          typeof body.cep === "string" &&
          body.cep.trim() !== ""
            ? body.cep.trim()
            : null,

        contatoPrincipal:
          typeof body.contatoPrincipal === "string" &&
          body.contatoPrincipal.trim() !== ""
            ? body.contatoPrincipal.trim()
            : null,

        emailPrincipal:
          typeof body.emailPrincipal === "string" &&
          body.emailPrincipal.trim() !== ""
            ? body.emailPrincipal.trim()
            : null,

        telefonePrincipal:
          typeof body.telefonePrincipal === "string" &&
          body.telefonePrincipal.trim() !== ""
            ? body.telefonePrincipal.trim()
            : null,

        whatsappPrincipal:
          typeof body.whatsappPrincipal === "string" &&
          body.whatsappPrincipal.trim() !== ""
            ? body.whatsappPrincipal.trim()
            : null,

        bancoComissao:
          typeof body.bancoComissao === "string" &&
          body.bancoComissao.trim() !== ""
            ? body.bancoComissao.trim()
            : null,

        comissao,
        tipoComissao: body.tipoComissao,
        faixasComissao,

        fechamentoComissao:
          typeof body.fechamentoComissao === "string" &&
          body.fechamentoComissao.trim() !== ""
            ? body.fechamentoComissao.trim()
            : null,

        pagamentoComissao:
          typeof body.pagamentoComissao === "string" &&
          body.pagamentoComissao.trim() !== ""
            ? body.pagamentoComissao.trim()
            : null,

        status: body.status,

        observacoes:
          typeof body.observacoes === "string" &&
          body.observacoes.trim() !== ""
            ? body.observacoes.trim()
            : null,
      },
    })

    return NextResponse.json(
      {
        message: "Representada atualizada com sucesso",
        data: representada,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao atualizar representada:", error)

    return NextResponse.json(
      { message: "Erro ao atualizar representada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const representada = await prisma.representada.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
      },
    })

    if (!representada) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    const [
      contratos,
      regrasComerciais,
      vendas,
      interacoes,
      notasComissao,
      contasRecebimento,
      financeiros,
    ] = await Promise.all([
      prisma.contratoRepresentada.count({
        where: { representadaId: id },
      }),

      prisma.regraComercialRepresentada.count({
        where: { representadaId: id },
      }),

      prisma.venda.count({
        where: { representadaId: id },
      }),

      prisma.interacao.count({
        where: { representadaId: id },
      }),

      prisma.nFComissao.count({
        where: { representadaId: id },
      }),

      prisma.representadaContaRecebimento.count({
        where: { representadaId: id },
      }),

      prisma.financeiro.count({
        where: { representadaId: id },
      }),
    ])

    const totalVinculos =
      contratos +
      regrasComerciais +
      vendas +
      interacoes +
      notasComissao +
      contasRecebimento +
      financeiros

    if (totalVinculos > 0) {
      return NextResponse.json(
        {
          message:
            "Esta representada possui histórico ou registros vinculados e não pode ser excluída. Altere o status para Inativa ou Suspensa.",
          vinculos: {
            contratos,
            regrasComerciais,
            vendas,
            interacoes,
            notasComissao,
            contasRecebimento,
            financeiros,
          },
        },
        { status: 409 }
      )
    }

    await prisma.representada.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        message: "Representada excluída com sucesso",
      },
      { status: 200 }
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          message:
            "Esta representada possui registros vinculados e não pode ser excluída. Altere o status para Inativa ou Suspensa.",
        },
        { status: 409 }
      )
    }

    console.error("Erro ao excluir representada:", error)

    return NextResponse.json(
      { message: "Erro ao excluir representada" },
      { status: 500 }
    )
  }
}