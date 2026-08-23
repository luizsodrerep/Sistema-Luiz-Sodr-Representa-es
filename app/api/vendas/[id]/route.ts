import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextRequest, NextResponse } from "next/server"

function filtroAcessoVenda(
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params

    const venda = await prisma.venda.findFirst({
      where: filtroAcessoVenda(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      include: {
        cliente: true,
        representada: true,
      },
    })

    if (!venda) {
      return NextResponse.json(
        { message: "Venda não encontrada ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    return NextResponse.json(venda)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao buscar venda:", error)

    return NextResponse.json(
      { message: "Erro ao buscar venda" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params
    const body = await request.json()

    const vendaExistente = await prisma.venda.findFirst({
      where: filtroAcessoVenda(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
        clienteId: true,
      },
    })

    if (!vendaExistente) {
      return NextResponse.json(
        { message: "Venda não encontrada ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    if (
      body.clienteId &&
      body.clienteId !== vendaExistente.clienteId
    ) {
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
          {
            message:
              "Cliente não encontrado ou sem permissão de acesso.",
          },
          { status: 403 }
        )
      }
    }

    const venda = await prisma.venda.update({
      where: {
        id: vendaExistente.id,
      },
      data: {
        data: body.data ? new Date(body.data) : undefined,
        clienteId: body.clienteId,
        representadaId: body.representadaId,
        valorTotal:
          body.valorTotal !== undefined
            ? Number(body.valorTotal)
            : undefined,
        comissao:
          body.comissao !== undefined
            ? Number(body.comissao)
            : undefined,
        status: body.status,
        observacoes: body.observacoes,
        condicaoPagamento: body.condicaoPagamento,
        responsavelId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelId,
      },
      include: {
        cliente: true,
        representada: true,
      },
    })

    return NextResponse.json(venda)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao atualizar venda:", error)

    return NextResponse.json(
      { message: "Erro ao atualizar venda" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessao = await exigirSessao()
    const { id } = await params

    const vendaExistente = await prisma.venda.findFirst({
      where: filtroAcessoVenda(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
      },
    })

    if (!vendaExistente) {
      return NextResponse.json(
        { message: "Venda não encontrada ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    await prisma.venda.delete({
      where: {
        id: vendaExistente.id,
      },
    })

    return NextResponse.json({
      message: "Venda excluída com sucesso",
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao excluir venda:", error)

    return NextResponse.json(
      { message: "Erro ao excluir venda" },
      { status: 500 }
    )
  }
}