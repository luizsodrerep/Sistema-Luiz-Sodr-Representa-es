import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { podeExecutarAcao } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function falha(mensagem: string, status: number) {
  return NextResponse.json({ erro: mensagem, message: mensagem }, { status })
}

function tratarErro(erro: unknown) {
  if (erro instanceof Error && erro.message === "NAO_AUTENTICADO") {
    return falha("Usuário não autenticado.", 401)
  }
  console.error("Erro na API de compras em cartões:", erro)
  return falha("Não foi possível processar a compra do cartão.", 500)
}

function textoObrigatorio(valor: unknown, maximo: number) {
  if (typeof valor !== "string") return null
  const texto = valor.trim()
  return texto && texto.length <= maximo ? texto : null
}

function textoOpcional(valor: unknown, maximo: number): string | null | undefined {
  if (valor === null || valor === undefined || valor === "") return null
  if (typeof valor !== "string") return undefined
  const texto = valor.trim()
  return texto.length <= maximo ? texto || null : undefined
}

// Conversão decimal exata, em centavos. Proíbe números negativos e separadores ambíguos.
function dinheiroEmCentavos(valor: unknown): bigint | null {
  if (typeof valor !== "string" && typeof valor !== "number") return null
  const texto = String(valor).trim()
  const partes = /^(0|[1-9]\d{0,11})(?:\.(\d{1,2}))?$/.exec(texto)
  if (!partes) return null
  const centavos = BigInt(partes[1]) * BigInt(100) + BigInt((partes[2] || "").padEnd(2, "0"))
  return centavos > BigInt(0) && centavos <= BigInt(99999999999999) ? centavos : null
}

function decimalCentavos(valor: bigint) {
  return new Prisma.Decimal(`${valor / BigInt(100)}.${String(valor % BigInt(100)).padStart(2, "0")}`)
}

// Meiodia UTC preserva a data civil em aplicações brasileiras sem conversão involuntária.
function dataCivil(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null
  const data = new Date(`${valor}T12:00:00.000Z`)
  return Number.isNaN(data.valueOf()) || data.toISOString().slice(0, 10) !== valor ? null : data
}

export async function GET(request: NextRequest) {
  try {
    const sessao = await exigirSessao()
    if (!podeExecutarAcao(sessao.perfil, "financeiro", "ver")) {
      return falha("Sem permissão para consultar compras dos cartões.", 403)
    }

    const cartaoId = request.nextUrl.searchParams.get("cartaoId")?.trim()
    if (!cartaoId) return falha("Informe cartaoId para consultar as compras.", 400)

    const cartao = await prisma.cartaoCredito.findFirst({
      where: { id: cartaoId, escritorioId: sessao.escritorioId },
      select: { id: true, nome: true, titularidade: true },
    })
    if (!cartao) return falha("Cartão não encontrado neste escritório.", 404)

    const compras = await prisma.cartaoCompra.findMany({
      where: { cartaoId: cartao.id, escritorioId: sessao.escritorioId },
      include: {
        parcelas: {
          where: { escritorioId: sessao.escritorioId },
          orderBy: { numero: "asc" },
          select: {
            id: true, numero: true, valor: true, vencimentoPrevisto: true,
            faturaId: true, status: true,
          },
        },
      },
      orderBy: [{ dataCompra: "desc" }, { criadoEm: "desc" }],
      take: 300,
    })

    return NextResponse.json(
      {
        cartao,
        compras: compras.map((compra) => ({
          ...compra,
          valorTotal: compra.valorTotal.toFixed(2),
          parcelas: compra.parcelas.map((parcela) => ({
            ...parcela, valor: parcela.valor.toFixed(2),
          })),
        })),
      },
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
      return falha("Sem permissão para registrar compras no cartão.", 403)
    }

    let body: Record<string, unknown>
    try {
      const entrada: unknown = await request.json()
      if (!entrada || Array.isArray(entrada) || typeof entrada !== "object") {
        return falha("Informe um objeto JSON válido.", 400)
      }
      body = entrada as Record<string, unknown>
    } catch {
      return falha("Corpo JSON inválido.", 400)
    }

    const cartaoId = textoObrigatorio(body.cartaoId, 120)
    const descricao = textoObrigatorio(body.descricao, 250)
    const natureza = body.natureza
    const dataCompra = dataCivil(body.dataCompra)
    const centavos = dinheiroEmCentavos(body.valorTotal)
    const quantidade = body.numeroParcelas
    const categoria = textoOpcional(body.categoria, 120)
    const estabelecimento = textoOpcional(body.estabelecimento, 160)
    const referenciaExterna = textoOpcional(body.referenciaExterna, 160)
    const observacoes = textoOpcional(body.observacoes, 2000)

    if (!cartaoId || !descricao || !dataCompra || !centavos ||
      !["Pessoal", "Empresarial", "Mista"].includes(String(natureza)) ||
      !Number.isInteger(quantidade) || typeof quantidade !== "number" ||
      quantidade < 1 || quantidade > 120 ||
      [categoria, estabelecimento, referenciaExterna, observacoes].some((campo) => campo === undefined)) {
      return falha("Confira cartão, descrição, data (AAAA-MM-DD), natureza, valor decimal e número de parcelas (1 a 120).", 400)
    }

    // Datas opcionais e explícitas, na mesma ordem das parcelas. Nunca presumir
    // vencimento futuro a partir de um dia habitual do cartão.
    const datasRecebidas = body.vencimentos
    if (datasRecebidas !== undefined &&
      (!Array.isArray(datasRecebidas) || datasRecebidas.length !== quantidade)) {
      return falha("O campo vencimentos deve conter uma posição para cada parcela.", 400)
    }
    const datas = Array.isArray(datasRecebidas) ? datasRecebidas.map((data: unknown) =>
      data === null || data === "" ? null : dataCivil(data),
    ) : Array.from({ length: quantidade }, () => null as Date | null)
    if (Array.isArray(datasRecebidas) && datas.some((data, indice) =>
      data === null && datasRecebidas[indice] !== null && datasRecebidas[indice] !== "")) {
      return falha("Uma ou mais datas de vencimento são inválidas.", 400)
    }

    const cartao = await prisma.cartaoCredito.findFirst({
      where: { id: cartaoId, escritorioId: sessao.escritorioId, ativo: true },
      select: { id: true },
    })
    if (!cartao) return falha("Cartão não encontrado, inativo ou fora do escritório.", 404)

    // Bloqueio adicional contra reenvio da mesma transação bancária, quando informada.
    if (referenciaExterna) {
      const existente = await prisma.cartaoCompra.findFirst({
        where: { escritorioId: sessao.escritorioId, cartaoId, referenciaExterna },
        select: { id: true },
      })
      if (existente) return falha("Esta referência externa já está registrada no cartão.", 409)
    }

    const numeroParcelas = quantidade as number
    const valorBase = centavos / BigInt(numeroParcelas)
    const sobra = centavos % BigInt(numeroParcelas)
    const valores = Array.from({ length: numeroParcelas }, (_, indice) =>
      valorBase + (indice === numeroParcelas - 1 ? sobra : BigInt(0)),
    )
    if (valores.some((valor) => valor <= BigInt(0))) {
      return falha("O valor deve permitir ao menos um centavo por parcela.", 400)
    }

    const compra = await prisma.$transaction(async (tx) => {
      return tx.cartaoCompra.create({
        data: {
          escritorioId: sessao.escritorioId,
          cartaoId,
          dataCompra,
          descricao,
          natureza: natureza as string,
          valorTotal: decimalCentavos(centavos),
          numeroParcelas,
          categoria: categoria ?? null,
          estabelecimento: estabelecimento ?? null,
          referenciaExterna: referenciaExterna ?? null,
          observacoes: observacoes ?? null,
          parcelas: {
            create: valores.map((valor, indice) => ({
              escritorioId: sessao.escritorioId,
              numero: indice + 1,
              valor: decimalCentavos(valor),
              vencimentoPrevisto: datas[indice],
              status: "Prevista",
            })),
          },
        },
        include: { parcelas: { orderBy: { numero: "asc" } } },
      })
    })

    return NextResponse.json(
      {
        message: "Compra registrada. Parcelas previstas criadas sem movimentar contas bancárias nem criar faturas automáticas.",
        compra: {
          ...compra,
          valorTotal: compra.valorTotal.toFixed(2),
          parcelas: compra.parcelas.map((parcela) => ({
            ...parcela, valor: parcela.valor.toFixed(2),
          })),
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    )
  } catch (erro) {
    return tratarErro(erro)
  }
}