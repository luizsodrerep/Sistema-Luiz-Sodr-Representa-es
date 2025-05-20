import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const vendas = await prisma.vendas.findMany({
      include: {
        cliente: true,
        representada: true,
      },
    });

    const vendasTratadas = vendas.map((venda) => ({
      id: venda.id,
      data: venda.data.toISOString().split("T")[0],
      valor: venda.valor.toFixed(2).replace(".", ","),
      valorFaturado: venda.valorFaturado
        ? venda.valorFaturado.toFixed(2).replace(".", ",")
        : venda.valor.toFixed(2).replace(".", ","),
      comissao: venda.comissao
        ? venda.comissao.toFixed(2).replace(".", ",")
        : "0,00",
      cliente: venda.cliente?.nome ?? "Cliente não informado",
      representada: venda.representada?.nome ?? "Representada não informada",
      representadaId: venda.representadaId,
      status: venda.status ?? "Pendente",
    }));

    return NextResponse.json(vendasTratadas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
