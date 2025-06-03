
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Buscar uma categoria pelo ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if ((id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const categoria = await prisma.categoriaFinanceira.findUnique({
      where: { id },
    })

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar uma categoria
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if ((id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const data = await request.json()

  try {
    const categoria = await prisma.categoriaFinanceira.update({
      where: { id },
      data,
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
  }
}

// DELETE - Deletar uma categoria
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if ((id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    await prisma.categoriaFinanceira.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Categoria excluída com sucesso" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 })
  }
}
