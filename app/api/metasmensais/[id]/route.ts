import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const metasmensais = await prisma.metasMensais.findUnique({ where: { id: params.id } })
  return NextResponse.json(metasmensais)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const metasmensaisAtualizada = await prisma.metasMensais.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(metasmensaisAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.metasMensais.delete({ where: { id: params.id } })
  return NextResponse.json({ message: "Comissão deletada com sucesso" })
}
