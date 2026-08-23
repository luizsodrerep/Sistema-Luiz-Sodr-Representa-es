import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sessao = await exigirSessao()

    const clientes = await prisma.cliente.findMany({
      where: {
        escritorioId: sessao.escritorioId,
        ...(sessao.perfil === "Preposto"
          ? {
              OR: [
                {
                  responsavelPrincipalId: sessao.usuarioId,
                },
                {
                  participantes: {
                    some: {
                      usuarioId: sessao.usuarioId,
                      ativa: true,
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        razaoSocial: "asc",
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao listar clientes:", error)

    return NextResponse.json(
      { message: "Erro ao listar clientes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao()
    const body = await request.json()

    if (!body.razaoSocial || body.razaoSocial.trim() === "") {
      return NextResponse.json(
        { message: "Razão Social é obrigatória." },
        { status: 400 }
      )
    }

    const ultimoCliente = await prisma.cliente.findFirst({
      where: {
        codigo: {
          not: null,
        },
      },
      orderBy: {
        codigo: "desc",
      },
    })

    let proximoNumero = 1

    if (ultimoCliente?.codigo) {
      const numeroAtual = parseInt(
        ultimoCliente.codigo.replace("CLI-", "")
      )

      if (!isNaN(numeroAtual)) {
        proximoNumero = numeroAtual + 1
      }
    }

    const codigoCliente = `CLI-${String(proximoNumero).padStart(6, "0")}`

    const cliente = await prisma.cliente.create({
      data: {
        escritorioId: sessao.escritorioId,
        originadoPorId: sessao.usuarioId,
        responsavelPrincipalId:
          sessao.perfil === "Preposto"
            ? sessao.usuarioId
            : body.responsavelPrincipalId || sessao.usuarioId,

        codigo: codigoCliente,

        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia || null,
        cnpj: body.cnpj || null,
        inscricaoEstadual: body.inscricaoEstadual || null,
        contato: body.contato || null,
        cargo: body.cargo || null,
        email: body.email || null,
        telefone: body.telefone || null,
        whatsapp: body.whatsapp || null,
        endereco: body.endereco || null,
        bairro: body.bairro || null,
        cidade: body.cidade || null,
        estado: body.estado || null,
        cep: body.cep || null,
        regiao: body.regiao || null,
        rota: body.rota || null,
        categoria: body.categoria || null,
        status: body.status || "Ativo",
        aceitaEmail: body.aceitaEmail ?? true,
        observacoes: body.observacoes || null,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "NAO_AUTENTICADO") {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error("Erro ao cadastrar cliente:", error)

    return NextResponse.json(
      { message: "Erro ao cadastrar cliente." },
      { status: 500 }
    )
  }
}