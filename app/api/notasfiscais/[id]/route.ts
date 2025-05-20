import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const notasfiscais = await prisma.notasFiscais.findUnique({ where: { id: params.id } })
  return NextResponse.json(notasfiscais)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const notasfiscaisAtualizada = await prisma.notasFiscais.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(notasfiscaisAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.notasFiscais.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
