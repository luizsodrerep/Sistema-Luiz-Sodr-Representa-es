
import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const compromissos = await prisma.compromisso.findMany()
    return NextResponse.json(compromissos)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar compromissos." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const nova = await prisma.compromisso.create({ data })
    return NextResponse.json(nova)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar representada." }, { status: 500 })
  }
}
