import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sessao = await exigirSessao()

    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get("clienteId")
    const tipo = searchParams.get("tipo")

    const interacoes = await prisma.interacao.findMany({
      where: {
        escritorioId: sessao.escritorioId,
        ...(clienteId ? { clienteId } : {}),
        ...(tipo && tipo !== "todas" ? { tipo } : {}),
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
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao listar interações:", error)

    return NextResponse.json(
      { message: "Erro ao listar interações." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao()
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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: body.clienteId,
        escritorioId: sessao.escritorioId,
        ...(sessao.perfil === "Preposto"
          ? {
              OR: [
                {
                  responsavelPrincipalId: sessao.usuarioId,
                },
                {
                  participantes: {
                    some: {
                      usuarioId: sessao.usuarioId,
                      ativa: true,
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado ou sem permissão de acesso." },
        { status: 403 }
      )
    }

    const interacao = await prisma.interacao.create({
      data: {
        escritorioId: sessao.escritorioId,
        criadoPorId: sessao.usuarioId,
        responsavelId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelId || sessao.usuarioId,
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
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao criar interação:", error)

    return NextResponse.json(
      { message: "Erro ao criar interação." },
      { status: 500 }
    )
  }
}