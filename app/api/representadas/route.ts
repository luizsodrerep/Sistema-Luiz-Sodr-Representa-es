import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(representadas)
  } catch (error) {
    console.error("ERRO API REPRESENTADAS:", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar representadas",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const novaRepresentada = await prisma.representada.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        contratoAssinado: body.contratoAssinado || false,
        emiteNF: body.emiteNF || false,
        comissao: body.comissao || null,
        comissao: body.comissao ? parseFloat(body.comissao) : null,
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
      },
    })
    // SALVAR FAIXAS DE COMISSAO
if (
  body.faixasComissao &&
  Array.isArray(body.faixasComissao)
) {
  await prisma.comissaoFaixa.createMany({
    data: body.faixasComissao.map((f: any, idx: number) => ({
      representadaId: novaRepresentada.id,
      descontoAte: Number(f.descontoAte),
      percentualComissao: Number(f.percentualComissao),
      ordem: idx + 1,
    })),
  })
}

    return NextResponse.json(novaRepresentada)
  } catch (error) {
    console.error("ERRO AO CRIAR REPRESENTADA:", error)

    return NextResponse.json(
      {
        error: "Erro ao criar representada",
      },
      { status: 500 }
    )
  }
}