
import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const notafiscal = await prisma.notaFiscal.findMany()
    return NextResponse.json(notafiscal)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar notafiscal." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const nova = await prisma.notaFiscal.create({ data })
    return NextResponse.json(nova)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar representada." }, { status: 500 })
  }
}
