import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const compromisso = await prisma.compromisso.findUnique({ where: { id: params.id } })
  return NextResponse.json(compromisso)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const compromissoAtualizada = await prisma.compromisso.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(compromissoAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.compromisso.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
