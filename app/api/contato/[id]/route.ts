import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const contato = await prisma.contato.findUnique({ where: { id: params.id } })
  return NextResponse.json(contato)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const contatoAtualizada = await prisma.contato.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(contatoAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.contato.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
