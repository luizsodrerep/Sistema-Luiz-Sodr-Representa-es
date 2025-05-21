import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const representadas = await prisma.representadas.findMany()
    return NextResponse.json(representadas)
  } catch (error) {
    console.error("Erro ao buscar representadas:", error)
    return NextResponse.json({ error: "Erro ao buscar representadas." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      nome,
      segmento,
      cidade,
      estado,
      contato,
      telefone,
      email,
      status,
      metaAnual,
      vendasRealizadas,
      percentualMeta,
      comissoesGeradas,
      percentualComissao,
    } = data

    const nova = await prisma.representadas.create({
      data: {
        nome,
        segmento,
        cidade,
        estado,
        contato,
        telefone,
        email,
        status,
        metaAnual: metaAnual.toString(),
        vendasRealizadas: vendasRealizadas.toString(),
        percentualMeta: parseFloat(percentualMeta),
        comissoesGeradas: comissoesGeradas.toString(),
        percentualComissao: parseFloat(percentualComissao),
      }
    })

    return NextResponse.json(nova)
  } catch (error) {
    console.error("Erro ao criar representada:", error)
    return NextResponse.json({ error: "Erro ao criar representada." }, { status: 500 })
  }
}
