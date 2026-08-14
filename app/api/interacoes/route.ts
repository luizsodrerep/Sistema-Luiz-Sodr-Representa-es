import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get("clienteId")
    const tipo = searchParams.get("tipo")

    const interacoes = await prisma.interacao.findMany({
      where: {
        ...(clienteId ? { clienteId } : {}),
        ...(tipo && tipo !== "todas" ? { tipo } : {}),
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            whatsapp: true,
            telefone: true,
            email: true,
            contato: true,
          },
        },
      },
      orderBy: {
        data: "desc",
      },
    })

    return NextResponse.json(interacoes)
  } catch (error) {
    console.error("Erro ao listar interações:", error)
    return NextResponse.json(
      { message: "Erro ao listar interações." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.clienteId || body.clienteId.trim() === "") {
      return NextResponse.json(
        { message: "Cliente é obrigatório." },
        { status: 400 }
      )
    }

    if (!body.tipo || body.tipo.trim() === "") {
      return NextResponse.json(
        { message: "Tipo de interação é obrigatório." },
        { status: 400 }
      )
    }

    if (!body.data) {
      return NextResponse.json(
        { message: "Data é obrigatória." },
        { status: 400 }
      )
    }

    const interacao = await prisma.interacao.create({
      data: {
        clienteId: body.clienteId,
        tipo: body.tipo,
        data: new Date(body.data),
        assunto: body.assunto || null,
        descricao: body.descricao || null,
        resultado: body.resultado || null,
        proximosPasso: body.proximosPasso || null,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
    })

    return NextResponse.json(interacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar interação:", error)
    return NextResponse.json(
      { message: "Erro ao criar interação." },
      { status: 500 }
    )
  }
}