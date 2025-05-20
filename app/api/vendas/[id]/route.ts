import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const venda = await prisma.vendas.findUnique({ where: { id: params.id } })
  return NextResponse.json(venda)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const vendaAtualizada = await prisma.vendas.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(vendaAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.vendas.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
