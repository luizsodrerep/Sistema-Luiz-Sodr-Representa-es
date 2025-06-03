import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const interacao = await prisma.interacao.findUnique({
    where: { id: params.id },
    include: { cliente: true, representada: true },
  });
  return NextResponse.json(interacao);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.interacao.update({
    where: { id: params.id },
    data: {
      tipo: body.tipo,
      data: new Date(body.data),
      descricao: body.descricao,
      status: body.status,
      responsavel: body.responsavel,
      clienteId: (body.clienteId),
      representadaId: (body.representadaId),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.interacao.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Interação excluída com sucesso' });
}
