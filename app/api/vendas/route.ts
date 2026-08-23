import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const sessao = await exigirSessao()

    const vendas = await prisma.venda.findMany({
      where: {
        escritorioId: sessao.escritorioId,
        ...(sessao.perfil === "Preposto"
          ? {
              OR: [
                { responsavelId: sessao.usuarioId },
                { criadoPorId: sessao.usuarioId },
              ],
            }
          : {}),
      },
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
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao listar vendas:", error)

    return NextResponse.json(
      { message: "Erro ao listar vendas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessao = await exigirSessao()
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
        escritorioId: sessao.escritorioId,
        criadoPorId: sessao.usuarioId,
        responsavelId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelId || sessao.usuarioId,
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
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao criar venda:", error)

    return NextResponse.json(
      { message: "Erro ao criar venda" },
      { status: 500 }
    )
  }
}