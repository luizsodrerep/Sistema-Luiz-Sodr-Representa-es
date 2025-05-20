import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/interacoes
export async function GET() {
  const interacoes = await prisma.interacoes.findMany({
    include: {
      cliente: true,
      representada: true,
    },
    orderBy: { data: 'desc' },
  });
  return NextResponse.json(interacoes);
}

// POST /api/interacoes
export async function POST(req: Request) {
  const body = await req.json();
  const interacao = await prisma.interacoes.create({
    data: {
      tipo: body.tipo,
      data: new Date(body.data),
      descricao: body.descricao,
      status: body.status,
      responsavel: body.responsavel,
      clienteId: parseInt(body.clienteId),
      representadaId: parseInt(body.representadaId),
    },
  });
  return NextResponse.json(interacao, { status: 201 });
}
