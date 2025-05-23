import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Buscar categoria por ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  const categoria = await prisma.categoriaFinanceira.findUnique({
    where: { id },
  });

  if (!categoria) {
    return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
  }

  return NextResponse.json(categoria);
}

// PUT - Atualizar categoria
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const data = await request.json();
  const { nome, tipo } = data;

  const categoria = await prisma.categoriaFinanceira.update({
    where: { id },
    data: {
      nome,
      tipo,
    },
  });

  return NextResponse.json(categoria);
}

// DELETE - Excluir categoria
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  await prisma.categoriaFinanceira.delete({
    where: { id },
  });

  return NextResponse.json({ message: 'Categoria excluída com sucesso.' });
}
