import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "ID é obrigatório" },
        { status: 400 }
      )
    }

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
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validações básicas
    if (!body.nome || !body.emailPrincipal) {
      return NextResponse.json(
        { message: "Nome e Email são obrigatórios" },
        { status: 400 }
      )
    }

    // Verifica se existe
    const existe = await prisma.representada.findUnique({
      where: { id },
    })

    if (!existe) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    // Converte comissao para Float se necessário
    const dados = {
      ...body,
      comissao: body.comissao ? parseFloat(body.comissao) : null,
    }

    const representada = await prisma.representada.update({
      where: { id },
      data: dados,
    })

    return NextResponse.json(
      { message: "Representada atualizada com sucesso", data: representada },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao atualizar:", error)
    return NextResponse.json(
      { message: "Erro ao atualizar representada" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "ID é obrigatório" },
        { status: 400 }
      )
    }

    // Verifica se existe
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
      { message: "Representada deletada com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao deletar:", error)
    return NextResponse.json(
      { message: "Erro ao deletar representada" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}