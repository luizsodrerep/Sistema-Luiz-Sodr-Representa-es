import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const interacao = await prisma.interacao.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            whatsapp: true,
            telefone: true,
            email: true,
            contato: true,
            cargo: true,
          },
        },
      },
    })

    if (!interacao) {
      return NextResponse.json(
        { message: "Interação não encontrada." },
        { status: 404 }
      )
    }

    return NextResponse.json(interacao)
  } catch (error) {
    console.error("Erro ao buscar interação:", error)

    return NextResponse.json(
      { message: "Erro ao buscar interação." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.clienteId || body.clienteId.trim() === "") {
      return NextResponse.json(
        { message: "Cliente é obrigatório." },
        { status: 400 }
      )
    }

    if (!body.tipo || body.tipo.trim() === "") {
      return NextResponse.json(
        { message: "Tipo de interação é obrigatório." },
        { status: 400 }
      )
    }

    if (!body.data) {
      return NextResponse.json(
        { message: "Data é obrigatória." },
        { status: 400 }
      )
    }

    const interacao = await prisma.interacao.update({
      where: { id },
      data: {
        clienteId: body.clienteId,
        tipo: body.tipo,
        data: new Date(body.data),
        assunto: body.assunto || null,
        descricao: body.descricao || null,
        resultado: body.resultado || null,
        proximosPasso: body.proximosPasso || null,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
    })

    return NextResponse.json(interacao)
  } catch (error) {
    console.error("Erro ao atualizar interação:", error)

    return NextResponse.json(
      { message: "Erro ao atualizar interação." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.interacao.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Interação excluída com sucesso.",
    })
  } catch (error) {
    console.error("Erro ao excluir interação:", error)

    return NextResponse.json(
      { message: "Erro ao excluir interação." },
      { status: 500 }
    )
  }
}