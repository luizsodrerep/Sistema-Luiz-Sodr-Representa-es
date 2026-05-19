import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const representada = await prisma.representada.findUnique({
      where: { id: params.id },
      include: {
        faixasComissao: {
          orderBy: { ordem: "asc" }
        }
      }
    })

    if (!representada) {
      return NextResponse.json(
        { error: "Representada nao encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar representada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.comissaoFaixa.deleteMany({
      where: { representadaId: params.id }
    })

    await prisma.representada.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao excluir representada" },
      { status: 500 }
    )
  }
}