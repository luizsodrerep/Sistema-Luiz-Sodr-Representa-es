
import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const metasmensais = await prisma.metaMensal.findMany()
    return NextResponse.json(metasmensais)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar metasmensais." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const nova = await prisma.metaMensal.create({ data })
    return NextResponse.json(nova)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar representada." }, { status: 500 })
  }
}
