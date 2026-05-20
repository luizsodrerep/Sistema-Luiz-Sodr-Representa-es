import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        {
          error: "Representada nao encontrada",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(representada)
  } catch (error) {
    console.error("ERRO AO BUSCAR REPRESENTADA:", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar representada",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const representadaAtualizada = await prisma.representada.update({
      where: {
        id,
      },
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,

        contatoPrincipal: body.contatoPrincipal || null,
        emailPrincipal: body.emailPrincipal || null,
        telefonePrincipal: body.telefonePrincipal || null,
        whatsappPrincipal: body.whatsappPrincipal || null,

        contatoFinanceiro: body.contatoFinanceiro || null,
        emailFinanceiro: body.emailFinanceiro || null,
        telefoneFinanceiro: body.telefoneFinanceiro || null,

        contatoLogistica: body.contatoLogistica || null,
        emailLogistica: body.emailLogistica || null,
        telefoneLogistica: body.telefoneLogistica || null,

        endereco: body.endereco || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,

        site: body.site || null,
        status: body.status || "Ativa",
        observacoes: body.observacoes || null,

        contratoAssinado: body.contratoAssinado || false,
        emiteNF: body.emiteNF || false,

        comissao: body.comissao || null,
        fechamentoComissao: body.fechamentoComissao || null,
        pagamentoComissao: body.pagamentoComissao || null,
        bancoComissao: body.bancoComissao || null,
      },
    })

    return NextResponse.json(representadaAtualizada)
  } catch (error) {
    console.error("ERRO AO ATUALIZAR REPRESENTADA:", error)

    return NextResponse.json(
      {
        error: "Erro ao atualizar representada",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.comissaoFaixa.deleteMany({
      where: {
        representadaId: id,
      },
    })

    await prisma.representada.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("ERRO AO EXCLUIR REPRESENTADA:", error)

    return NextResponse.json(
      {
        error: "Erro ao excluir representada",
      },
      { status: 500 }
    )
  }
}