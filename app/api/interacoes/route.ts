import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request
) {
  try {
    const sessao = await exigirSessao()

    const { searchParams } =
      new URL(request.url)

    const clienteId =
      searchParams.get("clienteId")

    const representadaId =
      searchParams.get(
        "representadaId"
      )

    const tipo =
      searchParams.get("tipo")

    const interacoes =
      await prisma.interacao.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          ...(clienteId
            ? { clienteId }
            : {}),

          ...(representadaId
            ? { representadaId }
            : {}),

          ...(tipo &&
          tipo !== "todas"
            ? { tipo }
            : {}),

          /*
           * PREPOSTO:
           *
           * Enxerga somente interações
           * relacionadas a clientes da sua
           * própria carteira.
           *
           * Isso inclui interações feitas
           * pelo Diretor ou Administrativo
           * nesses clientes.
           */
          ...(sessao.perfil ===
          "Preposto"
            ? {
                cliente: {
                  is: {
                    escritorioId:
                      sessao.escritorioId,

                    OR: [
                      {
                        responsavelPrincipalId:
                          sessao.usuarioId,
                      },
                      {
                        participantes: {
                          some: {
                            usuarioId:
                              sessao.usuarioId,
                            ativa: true,
                          },
                        },
                      },
                    ],
                  },
                },
              }
            : {}),
        },

        include: {
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              whatsapp: true,
              telefone: true,
              email: true,
              contato: true,
            },
          },

          representada: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
            },
          },

          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },

          responsavel: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },

        orderBy: {
          data: "desc",
        },
      })

    return NextResponse.json(
      interacoes
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error(
      "Erro ao listar interações:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar interações.",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request
) {
  try {
    const sessao = await exigirSessao()
    const body = await request.json()

    const clienteId =
      typeof body.clienteId ===
        "string" &&
      body.clienteId.trim() !== ""
        ? body.clienteId.trim()
        : null

    const representadaId =
      typeof body.representadaId ===
        "string" &&
      body.representadaId.trim() !== ""
        ? body.representadaId.trim()
        : null

    if (
      !clienteId &&
      !representadaId
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione um cliente ou uma representada para relacionar a interação.",
        },
        { status: 400 }
      )
    }

    if (
      clienteId &&
      representadaId
    ) {
      return NextResponse.json(
        {
          message:
            "A interação deve ser relacionada a um cliente ou a uma representada, não aos dois simultaneamente.",
        },
        { status: 400 }
      )
    }

    if (
      !body.tipo ||
      typeof body.tipo !== "string" ||
      body.tipo.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de interação é obrigatório.",
        },
        { status: 400 }
      )
    }

    if (clienteId) {
      const cliente =
        await prisma.cliente.findFirst({
          where: {
            id: clienteId,

            escritorioId:
              sessao.escritorioId,

            ...(sessao.perfil ===
            "Preposto"
              ? {
                  OR: [
                    {
                      responsavelPrincipalId:
                        sessao.usuarioId,
                    },
                    {
                      participantes: {
                        some: {
                          usuarioId:
                            sessao.usuarioId,
                          ativa: true,
                        },
                      },
                    },
                  ],
                }
              : {}),
          },

          select: {
            id: true,
          },
        })

      if (!cliente) {
        return NextResponse.json(
          {
            message:
              "Cliente não encontrado ou sem permissão de acesso.",
          },
          { status: 403 }
        )
      }
    }

    if (representadaId) {
      /*
       * Interações institucionais com
       * representadas ficam restritas ao
       * Diretor e Administrativo.
       */
      if (
        sessao.perfil === "Preposto"
      ) {
        return NextResponse.json(
          {
            message:
              "Seu perfil não possui permissão para registrar interações institucionais com representadas.",
          },
          { status: 403 }
        )
      }

      const representada =
        await prisma.representada.findFirst(
          {
            where: {
              id: representadaId,
              escritorioId:
                sessao.escritorioId,
            },

            select: {
              id: true,
            },
          }
        )

      if (!representada) {
        return NextResponse.json(
          {
            message:
              "Representada não encontrada ou sem permissão de acesso.",
          },
          { status: 403 }
        )
      }
    }

    let proximoContatoEm:
      | Date
      | null = null

    if (
      typeof body.proximoContatoEm ===
        "string" &&
      body.proximoContatoEm.trim() !== ""
    ) {
      const dataProximoContato =
        new Date(
          body.proximoContatoEm
        )

      if (
        Number.isNaN(
          dataProximoContato.getTime()
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Data do próximo acompanhamento é inválida.",
          },
          { status: 400 }
        )
      }

      proximoContatoEm =
        dataProximoContato
    }

    /*
     * Data/hora oficial da interação:
     * definida pelo servidor.
     */
    const agora = new Date()

    const interacao =
      await prisma.interacao.create({
        data: {
          escritorioId:
            sessao.escritorioId,

          criadoPorId:
            sessao.usuarioId,

          responsavelId:
            sessao.usuarioId,

          clienteId,
          representadaId,

          tipo: body.tipo.trim(),

          data: agora,

          assunto:
            typeof body.assunto ===
              "string" &&
            body.assunto.trim() !== ""
              ? body.assunto.trim()
              : null,

          descricao:
            typeof body.descricao ===
              "string" &&
            body.descricao.trim() !== ""
              ? body.descricao.trim()
              : null,

          resultado:
            typeof body.resultado ===
              "string" &&
            body.resultado.trim() !== ""
              ? body.resultado.trim()
              : null,

          proximosPasso:
            typeof body.proximosPasso ===
              "string" &&
            body.proximosPasso.trim() !==
              ""
              ? body.proximosPasso.trim()
              : null,

          proximoContatoEm,

          statusFollowUp:
            proximoContatoEm
              ? "Aberto"
              : "Sem acompanhamento",
        },

        include: {
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },

          representada: {
            select: {
              id: true,
              nome: true,
            },
          },

          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },
      })

    return NextResponse.json(
      interacao,
      {
        status: 201,
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      )
    }

    console.error(
      "Erro ao criar interação:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar interação.",
      },
      { status: 500 }
    )
  }
}