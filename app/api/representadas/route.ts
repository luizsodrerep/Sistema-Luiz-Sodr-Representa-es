import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        codigo: true,
        cnpj: true,
        contatoPrincipal: true,
        telefonePrincipal: true,
        status: true,
      },
    })

    return NextResponse.json(representadas)
  } catch (error) {
    console.error("Erro ao buscar representadas:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const representada = await prisma.representada.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        ie: body.ie || null,
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
        numero: body.numero || null,
        complemento: body.complemento || null,
        bairro: body.bairro || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,
        status: body.status || "Ativa",
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(representada)
  } catch (error) {
    console.error("Erro ao criar representada:", error)
    return NextResponse.json(
      { message: "Erro ao criar representada" },
      { status: 500 }
    )
  }
}