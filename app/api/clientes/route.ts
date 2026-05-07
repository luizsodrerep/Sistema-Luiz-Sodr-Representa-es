import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { criadoEm: "desc" }
    })
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cliente = await prisma.cliente.create({
      data: {
        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia,
        cnpj: body.cnpj,
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
        status: body.status || "Ativo",
        aceitaEmail: body.aceitaEmail ?? true,
        observacoes: body.observacoes,
      }
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
