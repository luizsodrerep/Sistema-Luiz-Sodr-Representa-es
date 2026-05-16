import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const representadas = await prisma.representada.findMany({ orderBy: { nome: "asc" } })
    return NextResponse.json(representadas)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar representadas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const representada = await prisma.representada.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        contratoAssinado: body.contratoAssinado ?? false,
        emiteNF: body.emiteNF ?? true,
        comissao: body.comissao ? parseFloat(body.comissao) : null,
        fechamentoComissao: body.fechamentoComissao || null,
        pagamentoComissao: body.pagamentoComissao || null,
        bancoComissao: body.bancoComissao || null,
        contatoPrincipal: body.contatoPrincipal || null,
        emailPrincipal: body.emailPrincipal || null,
        telefonePrincipal: body.telefonePrincipal || null,
        whatsappPrincipal: body.whatsappPrincipal || null,
        contatoFinanceiro: body.contatoFinanceiro || null,
        emailFinanceiro: body.emailFinanceiro || null,
        telefoneFinanceiro: body.telefoneFinanceiro || null,
        contatoLogistica: body.contatoLogistica || null,
        emailLogistica: body.emailLogistica || null,
        telefoneLogistica: body.telefoneLogistica || null,
        endereco: body.endereco || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,
        site: body.site || null,
        status: body.status || "Ativa",
        observacoes: body.observacoes || null,
      }
    })
    return NextResponse.json(representada, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar representada" }, { status: 500 })
  }
}
