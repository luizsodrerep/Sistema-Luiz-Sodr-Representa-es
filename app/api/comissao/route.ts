import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const comissoes = await prisma.comissao.findMany()
  return NextResponse.json(comissoes)
}

export async function POST(req: Request) {
  const data = await req.json()
  const novaComissao = await prisma.comissao.create({ data })
  return NextResponse.json(novaComissao)
}
