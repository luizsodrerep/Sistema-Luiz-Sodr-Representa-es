import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error("Erro ao listar clientes:", error)

    return NextResponse.json(
      { message: "Erro ao listar clientes" },
      { status: 500 }
    )
  }
}