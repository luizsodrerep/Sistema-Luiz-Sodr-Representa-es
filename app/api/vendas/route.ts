import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const vendas = await prisma.vendas.findMany();
    return NextResponse.json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}