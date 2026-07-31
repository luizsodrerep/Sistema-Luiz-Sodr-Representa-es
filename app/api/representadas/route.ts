import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(representadas)
  } catch (error) {
    console.error("Erro ao listar representadas:", error)

    return NextResponse.json(
      { message: "Erro ao listar representadas" },
      { status: 500 }
    )
  }
}