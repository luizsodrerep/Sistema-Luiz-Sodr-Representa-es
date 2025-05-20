import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const comissao = await prisma.comissao.findUnique({ where: { id: params.id } })
  return NextResponse.json(comissao)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const comissaoAtualizada = await prisma.comissao.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(comissaoAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.comissao.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
