import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// GET - Listar todos os lançamentos financeiros
export async function GET() {
  const financeiro = await prisma.financeiro.findMany({
    include: {
      categoria: true,
      representada: true,
    },
    orderBy: { dataVencimento: "desc" }, // <- Corrigido aqui
  });
  return NextResponse.json(financeiro);
}

// POST - Criar um lançamento financeiro
export async function POST(request: Request) {
  const data = await request.json();
  const {
    descricao,
    tipo,
    status,
    valor,
    dataLancamento,
    dataVencimento,
    dataPagamento,
    categoriaId,
    representadaId,
  } = data;

  if (
    !descricao ||
    !tipo ||
    !status ||
    !valor ||
    !dataLancamento ||
    !dataVencimento ||
    !categoriaId ||
    !representadaId
  ) {
    return NextResponse.json(
      { error: "Todos os campos obrigatórios devem ser preenchidos." },
      { status: 400 }
    );
  }

  try {
    const financeiro = await prisma.financeiro.create({
      data: {
        descricao,
        tipo,
        status,
        valor,
        dataLancamento: new Date(dataLancamento),
        dataVencimento: new Date(dataVencimento),
        dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
        categoriaId,
        representadaId,
      },
    });

    return NextResponse.json(financeiro);
  } catch (error) {
    console.error("Erro ao criar financeiro:", error);
    return NextResponse.json(
      { error: "Erro ao criar lançamento financeiro." },
      { status: 500 }
    );
  }
}

