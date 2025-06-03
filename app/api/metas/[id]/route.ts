import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const meta = await prisma.meta.findUnique({ where: { id: params.id } })
  return NextResponse.json(meta)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const metaAtualizada = await prisma.meta.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(metaAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.meta.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
