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
    console.error("Erro ao buscar:", error)

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

    const representada = await prisma.representada.update({
      where: { id },
      data: {
        ...body,
        comissao: body.comissao ? parseFloat(body.comissao) : null,
      },
    })

    return NextResponse.json(
      { message: "Atualizado com sucesso", data: representada },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao atualizar:", error)

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

    const existe = await prisma.representada.findUnique({
      where: { id },
    })

    if (!existe) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    await prisma.representada.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: "Deletado com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao deletar:", error)

    return NextResponse.json(
      { message: "Erro ao deletar representada" },
      { status: 500 }
    )
  }
}