
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null
}

function inteiroPositivo(valor: string | null, padrao: number, maximo: number) {
  if (!valor) return padrao
  const numero = Number.parseInt(valor, 10)
  return Number.isInteger(numero) && numero > 0 ? Math.min(numero, maximo) : padrao
}

function formatarCnpjCompleto(valor: string) {
  const digitos = valor.replace(/\D/g, "")
  if (digitos.length !== 14) return null
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12, 14)}`
}

function normalizarNome(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ")
}

function normalizarCnpj(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export async function GET(request: Request) {
  try {
    const sessao = await exigirSessao()
    const { searchParams } = new URL(request.url)
    const modoSeletor = searchParams.get("seletor") === "1"
    const busca = searchParams.get("busca")?.trim() || ""
    const limite = inteiroPositivo(searchParams.get("limit"), 10, 20)
    const somenteAtivos = searchParams.get("somenteAtivos") === "1"

    const escopoPreposto: Prisma.ClienteWhereInput =
      sessao.perfil === "Preposto"
        ? {
            OR: [
              { responsavelPrincipalId: sessao.usuarioId },
              { participantes: { some: { usuarioId: sessao.usuarioId, ativa: true } } },
            ],
          }
        : {}

    if (modoSeletor) {
      if (busca.length < 2) return NextResponse.json([])
      const cnpjFormatado = formatarCnpjCompleto(busca)
      const filtrosBusca: Prisma.ClienteWhereInput[] = [
        { razaoSocial: { contains: busca, mode: "insensitive" } },
        { nomeFantasia: { contains: busca, mode: "insensitive" } },
        { codigo: { contains: busca, mode: "insensitive" } },
        { cnpj: { contains: busca, mode: "insensitive" } },
      ]
      if (cnpjFormatado && cnpjFormatado !== busca) {
        filtrosBusca.push({ cnpj: { contains: cnpjFormatado, mode: "insensitive" } })
      }
      const clientes = await prisma.cliente.findMany({
        where: {
          escritorioId: sessao.escritorioId,
          ...(somenteAtivos ? { status: "Ativo" } : {}),
          AND: [escopoPreposto, { OR: filtrosBusca }],
        },
        orderBy: [{ nomeFantasia: "asc" }, { razaoSocial: "asc" }],
        take: limite,
        select: {
          id: true, codigo: true, razaoSocial: true, nomeFantasia: true,
          cnpj: true, status: true,
        },
      })
      return NextResponse.json(clientes)
    }

    const clientes = await prisma.cliente.findMany({
      where: { escritorioId: sessao.escritorioId, ...escopoPreposto },
      orderBy: { razaoSocial: "asc" },
    })
    return NextResponse.json(clientes)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 })
    }
    console.error("Erro ao listar clientes:", error)
    return NextResponse.json({ message: "Erro ao listar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao()
    const body = await request.json()
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Dados de Cliente inválidos." }, { status: 400 })
    }

    const razaoSocial = textoOpcional(body.razaoSocial)
    if (!razaoSocial) {
      return NextResponse.json({ message: "Razão Social é obrigatória." }, { status: 400 })
    }

    const status = textoOpcional(body.status) || "Ativo"
    const emQualificacao = status === "Em qualificação"
    const cnpj = textoOpcional(body.cnpj)
    const interacaoOrigemId = textoOpcional(body.interacaoOrigemId)

    if (emQualificacao) {
      if (!interacaoOrigemId || body.confirmarIdentidadeProspeccao !== true) {
        return NextResponse.json({
          message: "Pré-cadastro exige Prospecção de origem e confirmação da identidade real da empresa.",
        }, { status: 400 })
      }

      const origem = await prisma.interacao.findFirst({
        where: {
          id: interacaoOrigemId,
          escritorioId: sessao.escritorioId,
          tipo: "Prospecção",
          clienteId: null,
          representadaId: null,
          ...(sessao.perfil === "Preposto"
            ? { OR: [{ criadoPorId: sessao.usuarioId }, { responsavelId: sessao.usuarioId }] }
            : {}),
        },
        select: { id: true, nomeProspect: true },
      })
      if (!origem?.nomeProspect?.trim()) {
        return NextResponse.json({
          message: "Prospecção de origem não encontrada ou sem permissão de acesso.",
        }, { status: 403 })
      }

      // Verificação preventiva. O modelo atual não possui unicidade por CNPJ/razão social:
      // concorrência e diferenças cadastrais ainda exigem conferência operacional.
      const candidatos = await prisma.cliente.findMany({
        where: {
          escritorioId: sessao.escritorioId,
          OR: [
            { razaoSocial: { equals: razaoSocial, mode: "insensitive" } },
            { nomeFantasia: { equals: razaoSocial, mode: "insensitive" } },
            ...(cnpj ? [{ cnpj: { not: null } }] : []),
          ],
        },
        select: { id: true, razaoSocial: true, nomeFantasia: true, cnpj: true },
      })
      const nomeNormalizado = normalizarNome(razaoSocial)
      const cnpjNormalizado = cnpj ? normalizarCnpj(cnpj) : null
      const existePossivelDuplicidade = candidatos.some((candidato) => {
        const cnpjExistente = candidato.cnpj ? normalizarCnpj(candidato.cnpj) : null
        const mesmoCnpj = Boolean(cnpjNormalizado && cnpjExistente === cnpjNormalizado)
        const mesmoNome = normalizarNome(candidato.razaoSocial) === nomeNormalizado ||
          Boolean(candidato.nomeFantasia && normalizarNome(candidato.nomeFantasia) === nomeNormalizado)
        return mesmoCnpj || (mesmoNome && (!cnpjNormalizado || !cnpjExistente))
      })
      if (existePossivelDuplicidade) {
        return NextResponse.json({
          message: "Há possível cadastro existente desta empresa. Consulte os Clientes antes de criar outro.",
        }, { status: 409 })
      }
    }

    // Mantém a numeração e todos os campos do cadastro já existente.
    const ultimoCliente = await prisma.cliente.findFirst({
      where: { codigo: { not: null } },
      orderBy: { codigo: "desc" },
    })
    let proximoNumero = 1
    if (ultimoCliente?.codigo) {
      const numeroAtual = Number.parseInt(ultimoCliente.codigo.replace("CLI-", ""), 10)
      if (!Number.isNaN(numeroAtual)) proximoNumero = numeroAtual + 1
    }
    const codigoCliente = `CLI-${String(proximoNumero).padStart(6, "0")}`

    const dadosCliente = {
      escritorioId: sessao.escritorioId,
      originadoPorId: sessao.usuarioId,
      responsavelPrincipalId: sessao.perfil === "Preposto"
        ? sessao.usuarioId : textoOpcional(body.responsavelPrincipalId) || sessao.usuarioId,
      codigo: codigoCliente,
      razaoSocial,
      nomeFantasia: textoOpcional(body.nomeFantasia),
      cnpj,
      inscricaoEstadual: textoOpcional(body.inscricaoEstadual),
      contato: textoOpcional(body.contato),
      cargo: textoOpcional(body.cargo),
      email: textoOpcional(body.email),
      telefone: textoOpcional(body.telefone),
      whatsapp: textoOpcional(body.whatsapp),
      endereco: textoOpcional(body.endereco),
      bairro: textoOpcional(body.bairro),
      cidade: textoOpcional(body.cidade),
      estado: textoOpcional(body.estado),
      cep: textoOpcional(body.cep),
      regiao: textoOpcional(body.regiao),
      rota: textoOpcional(body.rota),
      categoria: textoOpcional(body.categoria),
      status,
      aceitaEmail: body.aceitaEmail ?? true,
      observacoes: textoOpcional(body.observacoes),
    }

    const cliente = emQualificacao
      ? await prisma.$transaction(async (tx) => {
          const criado = await tx.cliente.create({ data: dadosCliente })
          await tx.auditoria.create({
            data: {
              escritorioId: sessao.escritorioId,
              usuarioId: sessao.usuarioId,
              entidade: "Cliente",
              entidadeId: criado.id,
              acao: "PRE_CADASTRO_PROSPECCAO",
              dadosDepois: {
                id: criado.id,
                codigo: criado.codigo,
                razaoSocial: criado.razaoSocial,
                cnpj: criado.cnpj,
                status: criado.status,
                interacaoOrigemId,
                identidadeConfirmada: true,
              },
            },
          })
          return criado
        })
      : await prisma.cliente.create({ data: dadosCliente })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 })
    }
    console.error("Erro ao cadastrar cliente:", error)
    return NextResponse.json({ message: "Erro ao cadastrar cliente." }, { status: 500 })
  }
}