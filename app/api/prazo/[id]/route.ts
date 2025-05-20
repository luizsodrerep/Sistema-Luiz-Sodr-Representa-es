import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const prazo = await prisma.prazo.findUnique({ where: { id: params.id } })
  return NextResponse.json(prazo)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const prazoAtualizada = await prisma.prazo.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(prazoAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.prazo.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
