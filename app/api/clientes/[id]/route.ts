import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const cliente = await prisma.clientes.findUnique({ where: { id } })
  return NextResponse.json(cliente)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  const clienteAtualizada = await prisma.clientes.update({
    where: { id },
    data,
  })
  return NextResponse.json(clienteAtualizada)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await prisma.clientes.delete({ where: { id } })
  return NextResponse.json({ message: "Cliente deletado com sucesso" })
}
