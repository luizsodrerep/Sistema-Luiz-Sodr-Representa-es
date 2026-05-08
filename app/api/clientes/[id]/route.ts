import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: params.id } })
    if (!cliente) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const cliente = await prisma.cliente.update({
      where: { id: params.id },
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
      }
    })
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
