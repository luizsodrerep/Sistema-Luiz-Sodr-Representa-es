import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const representada = await prisma.representada.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        comissao: true,
        tipoComissao: true,
        faixasComissao: true,
        vendas: true,
      },
    })

    if (!representada) {
      return NextResponse.json(
        { message: "Representada não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(representada, { status: 200 })
  } catch (error) {
    console.error("Erro comissão:", error)
    return NextResponse.json(
      { message: "Erro ao buscar comissão" },
      { status: 500 }
    )
  }
}