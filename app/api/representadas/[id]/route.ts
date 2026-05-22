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