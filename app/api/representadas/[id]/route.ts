import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const representada = await prisma.representada.findUnique({
      where: {
        id,
      },
      include: {
        faixasComissao: {
          orderBy: {
            ordem: "asc",
          },
        },
      },
    })

    if (!representada) {
      return NextResponse.json(
        { error: "Nao encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const body = await request.json()

    const representada = await prisma.representada.update({
      where: {
        id,
      },
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        contratoAssinado: body.contratoAssinado,
        emiteNF: body.emiteNF,

        comissao: body.comissao
          ? Number(body.comissao)
          : null,

        fechamentoComissao: body.fechamentoComissao,
        pagamentoComissao: body.pagamentoComissao,
        bancoComissao: body.bancoComissao,

        contatoPrincipal: body.contatoPrincipal,
        emailPrincipal: body.emailPrincipal,
        telefonePrincipal: body.telefonePrincipal,
        whatsappPrincipal: body.whatsappPrincipal,

        contatoFinanceiro: body.contatoFinanceiro,
        emailFinanceiro: body.emailFinanceiro,
        telefoneFinanceiro: body.telefoneFinanceiro,

        contatoLogistica: body.contatoLogistica,
        emailLogistica: body.emailLogistica,
        telefoneLogistica: body.telefoneLogistica,

        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        site: body.site,

        status: body.status,
        observacoes: body.observacoes,
      },
    })

    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao atualizar representada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    await prisma.representada.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao excluir" },
      { status: 500 }
    )
  }
}