import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const representada = await prisma.representada.findUnique({
      where: { id: params.id },
      include: { faixasComissao: { orderBy: { ordem: "asc" } } }
    })
    if (!representada) return NextResponse.json({ error: "Nao encontrada" }, { status: 404 })
    return NextResponse.json(representada)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const representada = await prisma.representada.update({
      where: { id: params.id },
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        contratoAssinado: body.contratoAssinado || false,
        emiteNF: body.emiteNF || false,
        comissao: body.comissao || null,
        fechamentoComissao: body.fechamentoComissao || null,
        pagamentoComissao: body.pagamentoComissao || null,
        bancoComissao: body.bancoComissao || null,
        contatoPrincipal: body.contatoPrincipal || null,
        comissao: body.comissao ? parseFloat(body.comissao) : null,
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
    return NextResponse.json(representada)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.comissaoFaixa.deleteMany({ where: { representadaId: params.id } })
    await prisma.representada.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}