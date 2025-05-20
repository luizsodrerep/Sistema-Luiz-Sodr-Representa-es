// // app/api/representadas/[id]/route.ts
// import { NextResponse } from "next/server"
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function GET(_: Request, { params }: { params: { id: string } }) {
//   const id = params.id
//   try {
//     const item = await prisma.representadas.findUnique({ where: { id } })
//     if (!item) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
//     return NextResponse.json(item)
//   } catch {
//     return NextResponse.json({ error: "Erro ao buscar representada" }, { status: 500 })
//   }
// }

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   const id = params.id
//   try {
//     const data = await req.json()
//     const atualizado = await prisma.representadas.update({ where: { id }, data })
//     return NextResponse.json(atualizado)
//   } catch {
//     return NextResponse.json({ error: "Erro ao atualizar representada" }, { status: 500 })
//   }
// }

// export async function DELETE(_: Request, { params }: { params: { id: string } }) {
//   const id = params.id
//   try {
//     await prisma.representadas.delete({ where: { id } })
//     return NextResponse.json({ message: "Removida com sucesso" })
//   } catch {
//     return NextResponse.json({ error: "Erro ao remover representada" }, { status: 500 })
//   }
// }
