import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

function filtroAcessoInteracao(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
) {
  return {
    id,
    escritorioId,
    ...(perfil === "Preposto"
      ? {
          OR: [
            { responsavelId: usuarioId },
            { criadoPorId: usuarioId },
          ],
        }
      : {}),
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params

    const interacao = await prisma.interacao.findFirst({
      where: filtroAcessoInteracao(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
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
            cargo: true,
          },
        },
      },
    })

    if (!interacao) {
      return NextResponse.json(
        { message: "Interação não encontrada ou sem permissão de acesso." },
        { status: 404 }
      )
    }

    return NextResponse.json(interacao)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao buscar interação:", error)

    return NextResponse.json(
      { message: "Erro ao buscar interação." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params
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

    const interacaoExistente = await prisma.interacao.findFirst({
      where: filtroAcessoInteracao(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
      },
    })

    if (!interacaoExistente) {
      return NextResponse.json(
        { message: "Interação não encontrada ou sem permissão de acesso." },
        { status: 404 }
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

    const interacao = await prisma.interacao.update({
      where: {
        id: interacaoExistente.id,
      },
      data: {
        clienteId: body.clienteId,
        tipo: body.tipo,
        data: new Date(body.data),
        assunto: body.assunto || null,
        descricao: body.descricao || null,
        resultado: body.resultado || null,
        proximosPasso: body.proximosPasso || null,
        responsavelId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelId,
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

    return NextResponse.json(interacao)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao atualizar interação:", error)

    return NextResponse.json(
      { message: "Erro ao atualizar interação." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params

    const interacaoExistente = await prisma.interacao.findFirst({
      where: filtroAcessoInteracao(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
      },
    })

    if (!interacaoExistente) {
      return NextResponse.json(
        { message: "Interação não encontrada ou sem permissão de acesso." },
        { status: 404 }
      )
    }

    await prisma.interacao.delete({
      where: {
        id: interacaoExistente.id,
      },
    })

    return NextResponse.json({
      message: "Interação excluída com sucesso.",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao excluir interação:", error)

    return NextResponse.json(
      { message: "Erro ao excluir interação." },
      { status: 500 }
    )
  }
}