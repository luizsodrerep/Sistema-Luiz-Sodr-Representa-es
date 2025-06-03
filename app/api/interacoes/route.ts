import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const interacoes = await prisma.interacao.findMany({
      include: {
        cliente: true,        // ✅ Inclui os dados do cliente
        representada: true,
      },
      orderBy: { data: "desc" },
    })

    const formatted = interacoes.map((i) => ({
      id: i.id,
      tipo: i.tipo,
      dataHora: i.data.toISOString(),
      descricao: i.descricao,
      status: i.status,
      cliente: i.cliente.nome,
      clienteId: i.clienteId.toString(),
      representada: i.representada.nome,
      representadaId: i.representadaId.toString(),
      responsavel: i.cliente.responsavel ?? "Não informado", // ✅ Pega do cliente
    }))


    return NextResponse.json(formatted)
  } catch (error) {
    console.error(error)
    return new NextResponse("Erro ao buscar interações", { status: 500 })
  }
}
