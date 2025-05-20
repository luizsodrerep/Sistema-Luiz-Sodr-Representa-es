// import { NextResponse } from "next/server"
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function GET(_: Request, { params }: { params: { id: string } }) {
//   const cliente = await prisma.clientes.findUnique({ where: { id: params.id } })
//   return NextResponse.json(cliente)
// }

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   const data = await req.json()
//   const clienteAtualizada = await prisma.clientes.update({
//     where: { id: params.id },
//     data,
//   })
//   return NextResponse.json(clienteAtualizada)
// }

// export async function DELETE(_: Request, { params }: { params: { id: string } }) {
//   await prisma.clientes.delete({ where: { id: params.id } })
//   return NextResponse.json({ message: "Comissão deletada com sucesso" })
// }
