
import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const prazos = await prisma.prazo.findMany()
    return NextResponse.json(prazos)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar prazos." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const nova = await prisma.prazo.create({ data })
    return NextResponse.json(nova)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar representada." }, { status: 500 })
  }
}
