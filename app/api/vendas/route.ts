import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        cliente: true,
        representada: true,
      },
      orderBy: {
        criadoEm: "desc",
      },
    })

    return NextResponse.json(vendas)
  } catch (error) {
    console.error("Erro ao listar vendas:", error)

    return NextResponse.json(
      { message: "Erro ao listar vendas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clienteId) {
      return NextResponse.json(
        { message: "Cliente obrigatório" },
        { status: 400 }
      )
    }

    if (!body.representadaId) {
      return NextResponse.json(
        { message: "Representada obrigatória" },
        { status: 400 }
      )
    }

    if (!body.valorTotal) {
      return NextResponse.json(
        { message: "Valor obrigatório" },
        { status: 400 }
      )
    }

    const venda = await prisma.venda.create({
      data: {
        data: new Date(body.data),
        clienteId: body.clienteId,
        representadaId: body.representadaId,
        valorTotal: Number(body.valorTotal),
        comissao: Number(body.comissao || 0),
        status: body.status || "Pendente",
        observacoes: body.observacoes || null,
        condicaoPagamento: body.condicaoPagamento || null,
      },
      include: {
        cliente: true,
        representada: true,
      },
    })

    return NextResponse.json(venda, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar venda:", error)

    return NextResponse.json(
      { message: "Erro ao criar venda" },
      { status: 500 }
    )
  }
}