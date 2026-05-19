import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: { nome: "asc" },
    })
    return NextResponse.json(representadas)
  } catch (error: any) {
    console.error("ERRO AO BUSCAR REPRESENTADAS:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar representadas" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("DADOS RECEBIDOS:", body)

    const representada = await prisma.representada.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj || null,
        contratoAssinado: body.contratoAssinado ?? false,
        emiteNF: body.emiteNF ?? true,
        comissao:
          body.comissao && body.comissao !== ""
            ? parseFloat(String(body.comissao).replace(",", "."))
            : null,
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
      },
    })

    return NextResponse.json(representada, { status: 201 })
  } catch (error: any) {
    console.error("ERRO REAL AO SALVAR REPRESENTADA:", error)

    return NextResponse.json(
      {
        error: error.message || "Erro ao criar representada",
      },
      { status: 500 }
    )
  }
}