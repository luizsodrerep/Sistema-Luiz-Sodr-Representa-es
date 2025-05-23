import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Buscar um lançamento financeiro específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const financeiro = await prisma.financeiro.findUnique({
      where: { id },
      include: {
        categoria: true,
        representada: true,
      },
    })

    if (!financeiro) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 })
    }

    return NextResponse.json(financeiro)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar lançamento financeiro
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const data = await request.json()

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const financeiro = await prisma.financeiro.update({
      where: { id },
      data,
    })

    return NextResponse.json(financeiro)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar lançamento" }, { status: 500 })
  }
}

// DELETE - Deletar lançamento financeiro
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    await prisma.financeiro.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Lançamento excluído com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao excluir lançamento" }, { status: 500 })
  }
}
