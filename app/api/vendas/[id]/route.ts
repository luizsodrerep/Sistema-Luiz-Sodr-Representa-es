import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venda = await prisma.venda.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        representada: true,
      },
    })

    if (!venda) {
      return NextResponse.json(
        { message: "Venda não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(venda)
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json(
      { message: "Erro ao buscar venda" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const venda = await prisma.venda.update({
      where: { id: params.id },
      data: {
        data: body.data ? new Date(body.data) : undefined,
        clienteId: body.clienteId,
        representadaId: body.representadaId,
        valorTotal: body.valorTotal ? Number(body.valorTotal) : undefined,
        comissao: body.comissao !== undefined ? Number(body.comissao) : undefined,
        status: body.status,
        observacoes: body.observacoes,
        condicaoPagamento: body.condicaoPagamento,
      },
      include: {
        cliente: true,
        representada: true,
      },
    })

    return NextResponse.json(venda)
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json(
      { message: "Erro ao atualizar venda" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.venda.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Venda excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir venda:", error)
    return NextResponse.json(
      { message: "Erro ao excluir venda" },
      { status: 500 }
    )
  }
}