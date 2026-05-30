import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id
    const representada = await prisma.representada.findUnique({
      where: { id },
    })
    if (!representada) {
      return NextResponse.json(
        { message: "Representada nao encontrada" },
        { status: 404 }
      )
    }
    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro ao buscar representada" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id
    const body = await request.json()
    const representada = await prisma.representada.update({
      where: { id },
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        codigo: body.codigo,
        comissao: body.comissao ? parseFloat(body.comissao) : null,
        tipoComissao: body.tipoComissao || "fixa",
        faixasComissao: body.faixasComissao || null,
        fechamentoComissao: body.fechamentoComissao || null,
        pagamentoComissao: body.pagamentoComissao || null,
        bancoComissao: body.bancoComissao || null,
        contatoPrincipal: body.contatoPrincipal || null,
        emailPrincipal: body.emailPrincipal || null,
        telefonePrincipal: body.telefonePrincipal || null,
        whatsappPrincipal: body.whatsappPrincipal || null,
        endereco: body.endereco || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,
        status: body.status || "Ativa",
        observacoes: body.observacoes || null,
      },
    })
    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro ao atualizar representada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id
    await prisma.representada.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro ao excluir representada" },
      { status: 500 }
    )
  }
}