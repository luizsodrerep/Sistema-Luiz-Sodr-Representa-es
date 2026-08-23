import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"

function filtroAcessoCliente(
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
            {
              responsavelPrincipalId: usuarioId,
            },
            {
              participantes: {
                some: {
                  usuarioId,
                  ativa: true,
                },
              },
            },
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

    const cliente = await prisma.cliente.findFirst({
      where: filtroAcessoCliente(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error(error)

    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
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

    const clienteExistente = await prisma.cliente.findFirst({
      where: filtroAcessoCliente(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
      },
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    const cliente = await prisma.cliente.update({
      where: {
        id: clienteExistente.id,
      },
      data: {
        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia,
        cnpj: body.cnpj,
        inscricaoEstadual: body.inscricaoEstadual,
        contato: body.contato,
        cargo: body.cargo,
        email: body.email,
        telefone: body.telefone,
        whatsapp: body.whatsapp,
        endereco: body.endereco,
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        regiao: body.regiao,
        rota: body.rota,
        categoria: body.categoria,
        status: body.status,
        observacoes: body.observacoes,
        responsavelPrincipalId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelPrincipalId,
      },
    })

    return NextResponse.json(cliente)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error(error)

    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
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

    const clienteExistente = await prisma.cliente.findFirst({
      where: filtroAcessoCliente(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),
      select: {
        id: true,
      },
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou sem permissão de acesso" },
        { status: 404 }
      )
    }

    await prisma.cliente.delete({
      where: {
        id: clienteExistente.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error(error)

    return NextResponse.json(
      { error: "Erro ao excluir cliente" },
      { status: 500 }
    )
  }
}