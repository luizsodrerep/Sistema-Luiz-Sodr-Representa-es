import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    })

    return NextResponse.json(representadas, { status: 200 })
  } catch (error) {
    console.error("Erro ao listar:", error)
    return NextResponse.json(
      { message: "Erro ao listar representadas" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validações básicas
    if (!body.nome) {
      return NextResponse.json(
        { message: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    if (!body.emailPrincipal) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      )
    }

    if (!body.telefonePrincipal) {
      return NextResponse.json(
        { message: "Telefone é obrigatório" },
        { status: 400 }
      )
    }

    // Converte comissao para Float se necessário
    const dados = {
      nome: body.nome,
      codigo: body.codigo,
      cnpj: body.cnpj || null,
      comissao: body.comissao ? parseFloat(body.comissao) : null,
      tipoComissao: body.tipoComissao || "fixa",
      faixasComissao: body.faixasComissao || null,
      fechamentoComissao: body.fechamentoComissao || null,
      pagamentoComissao: body.pagamentoComissao || null,
      bancoComissao: body.bancoComissao || null,
      contatoPrincipal: body.contatoPrincipal || null,
      emailPrincipal: body.emailPrincipal,
      telefonePrincipal: body.telefonePrincipal,
      whatsappPrincipal: body.whatsappPrincipal || null,
      endereco: body.endereco || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      cep: body.cep || null,
      status: body.status || "Ativa",
      observacoes: body.observacoes || null,
      contratoAssinado: body.contratoAssinado || false,
      emiteNF: body.emiteNF !== false,
    }

    const representada = await prisma.representada.create({
      data: dados,
    })

    return NextResponse.json(
      { message: "Representada criada com sucesso", data: representada },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar:", error)
    return NextResponse.json(
      { message: "Erro ao criar representada" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}