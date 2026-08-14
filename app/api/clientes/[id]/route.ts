import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
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
    const { id } = await params
    const body = await request.json()

    const cliente = await prisma.cliente.update({
      where: { id },
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
      },
    })

    return NextResponse.json(cliente)
  } catch (error) {
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
    const { id } = await params

    await prisma.cliente.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao excluir cliente" },
      { status: 500 }
    )
  }
}