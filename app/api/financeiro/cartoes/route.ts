import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { podeExecutarAcao } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function responder(erro: string, status: number) {
  return NextResponse.json({ erro, message: erro }, { status })
}

function tratarErro(erro: unknown) {
  if (erro instanceof Error && erro.message === "NAO_AUTENTICADO") {
    return responder("Usuário não autenticado.", 401)
  }

  console.error("Erro na API de cartões de crédito:", erro)
  return responder("Não foi possível processar a solicitação de cartões.", 500)
}

function textoObrigatorio(valor: unknown, maximo: number): string | null {
  if (typeof valor !== "string") return null
  const texto = valor.trim()
  return texto.length > 0 && texto.length <= maximo ? texto : null
}

function textoOpcional(valor: unknown, maximo: number): string | null | undefined {
  if (valor === undefined || valor === null || valor === "") return null
  if (typeof valor !== "string") return undefined
  const texto = valor.trim()
  return texto.length <= maximo ? texto || null : undefined
}

function diaOpcional(valor: unknown): number | null | undefined {
  if (valor === undefined || valor === null || valor === "") return null
  const numero = typeof valor === "number" ? valor :
    typeof valor === "string" && /^\d{1,2}$/.test(valor.trim()) ? Number(valor.trim()) : NaN
  return Number.isInteger(numero) && numero >= 1 && numero <= 31 ? numero : undefined
}

function dinheiroOpcional(valor: unknown): Prisma.Decimal | null | undefined {
  if (valor === undefined || valor === null || valor === "") return null
  if (typeof valor !== "number" && typeof valor !== "string") return undefined
  const texto = String(valor).trim()
  // A API aceita formato decimal canônico; não interpreta ambiguidades de separadores locais.
  if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(texto)) return undefined
  return new Prisma.Decimal(texto)
}

function serializarCartao(cartao: {
  id: string
  escritorioId: string
  nome: string
  emissor: string
  titularidade: string
  titular: string | null
  finalCartao: string | null
  bandeira: string | null
  contaPagamentoId: string | null
  diaFechamento: number | null
  diaVencimento: number | null
  melhorDiaInformado: number | null
  limiteTotal: Prisma.Decimal | null
  limiteDisponivelInformado: Prisma.Decimal | null
  limiteConsultadoEm: Date | null
  ativo: boolean
  observacoes: string | null
  criadoEm: Date
  atualizadoEm: Date
}) {
  return {
    ...cartao,
    limiteTotal: cartao.limiteTotal?.toFixed(2) ?? null,
    limiteDisponivelInformado: cartao.limiteDisponivelInformado?.toFixed(2) ?? null,
  }
}

export async function GET() {
  try {
    const sessao = await exigirSessao()
    if (!podeExecutarAcao(sessao.perfil, "financeiro", "ver")) {
      return responder("Sem permissão para consultar cartões.", 403)
    }

    const cartoes = await prisma.cartaoCredito.findMany({
      where: { escritorioId: sessao.escritorioId },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    })

    return NextResponse.json(
      { cartoes: cartoes.map(serializarCartao) },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (erro) {
    return tratarErro(erro)
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessao = await exigirSessao()
    if (!podeExecutarAcao(sessao.perfil, "financeiro", "criar")) {
      return responder("Sem permissão para cadastrar cartões.", 403)
    }

    let body: Record<string, unknown>
    try {
      const entrada: unknown = await request.json()
      if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) {
        return responder("Informe um objeto JSON válido.", 400)
      }
      body = entrada as Record<string, unknown>
    } catch {
      return responder("Corpo JSON inválido.", 400)
    }

    const nome = textoObrigatorio(body.nome, 120)
    const emissor = textoObrigatorio(body.emissor, 120)
    const titularidade = body.titularidade

    if (!nome || !emissor || (titularidade !== "PF" && titularidade !== "PJ")) {
      return responder("Informe nome, emissor e titularidade (PF ou PJ) válidos.", 400)
    }

    const titular = textoOpcional(body.titular, 160)
    const bandeira = textoOpcional(body.bandeira, 40)
    const observacoes = textoOpcional(body.observacoes, 2000)
    const finalCartao = textoOpcional(body.finalCartao, 4)
    const contaPagamentoId = textoOpcional(body.contaPagamentoId, 120)
    const diaFechamento = diaOpcional(body.diaFechamento)
    const diaVencimento = diaOpcional(body.diaVencimento)
    const melhorDiaInformado = diaOpcional(body.melhorDiaInformado)
    const limiteTotal = dinheiroOpcional(body.limiteTotal)
    const limiteDisponivelInformado = dinheiroOpcional(body.limiteDisponivelInformado)

    if ([titular, bandeira, observacoes, finalCartao, contaPagamentoId,
      diaFechamento, diaVencimento, melhorDiaInformado,
      limiteTotal, limiteDisponivelInformado].some((valor) => valor === undefined)) {
      return responder("Um ou mais campos opcionais possuem formato inválido.", 400)
    }

    if (finalCartao && !/^\d{4}$/.test(finalCartao)) {
      return responder("Informe apenas os quatro últimos dígitos do cartão.", 400)
    }

    if (limiteTotal && limiteDisponivelInformado && limiteDisponivelInformado.gt(limiteTotal)) {
      return responder("O limite disponível não pode superar o limite total informado.", 400)
    }

    if (contaPagamentoId) {
      const conta = await prisma.contaBancaria.findFirst({
        where: { id: contaPagamentoId, escritorioId: sessao.escritorioId },
        select: { id: true },
      })
      if (!conta) return responder("Conta de pagamento não pertence ao escritório ou não existe.", 400)
    }

    // Evita duplicidade evidente, sem pressupor que finais de cartões são únicos.
    const existente = await prisma.cartaoCredito.findFirst({
      where: { escritorioId: sessao.escritorioId, nome: { equals: nome, mode: "insensitive" } },
      select: { id: true },
    })
    if (existente) return responder("Já existe um cartão com esse nome neste escritório.", 409)

    const cartao = await prisma.cartaoCredito.create({
      data: {
        escritorioId: sessao.escritorioId,
        nome,
        emissor,
        titularidade,
        titular: titular ?? null,
        finalCartao: finalCartao ?? null,
        bandeira: bandeira ?? null,
        contaPagamentoId: contaPagamentoId ?? null,
        diaFechamento: diaFechamento ?? null,
        diaVencimento: diaVencimento ?? null,
        melhorDiaInformado: melhorDiaInformado ?? null,
        limiteTotal: limiteTotal ?? null,
        limiteDisponivelInformado: limiteDisponivelInformado ?? null,
        limiteConsultadoEm: limiteDisponivelInformado ? new Date() : null,
        observacoes: observacoes ?? null,
      },
    })

    return NextResponse.json(
      { cartao: serializarCartao(cartao), message: "Cartão cadastrado com sucesso." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    )
  } catch (erro) {
    return tratarErro(erro)
  }
}