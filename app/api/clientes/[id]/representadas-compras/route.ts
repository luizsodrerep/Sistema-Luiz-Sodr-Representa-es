import {
  NextResponse,
} from "next/server"

import {
  prisma,
} from "@/lib/prisma"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"

function filtroAcessoCliente(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
) {
  return {
    id,
    escritorioId,

    ...(perfil === "Preposto"
      ? {
          OR: [
            {
              responsavelPrincipalId:
                usuarioId,
            },
            {
              participantes: {
                some: {
                  usuarioId,
                  ativa: true,
                },
              },
            },
          ],
        }
      : {}),
  }
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "clientes",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Você não possui permissão para visualizar Clientes.",
        },
        {
          status: 403,
        }
      )
    }

    const {
      id,
    } =
      await params

    const cliente =
      await prisma.cliente.findFirst({
        where:
          filtroAcessoCliente(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

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
        {
          status: 404,
        }
      )
    }

    const grupos =
      await prisma.venda.groupBy({
        by: [
          "representadaId",
        ],

        where: {
          escritorioId:
            sessao.escritorioId,

          clienteId:
            cliente.id,

          status: {
            in: [
              "Confirmado",
              "Parcialmente faturado",
              "Faturado",
            ],
          },

          ...(sessao.perfil ===
          "Preposto"
            ? {
                OR: [
                  {
                    responsavelId:
                      sessao.usuarioId,
                  },
                  {
                    criadoPorId:
                      sessao.usuarioId,
                  },
                ],
              }
            : {}),
        },

        _count: {
          _all: true,
        },

        _max: {
          data: true,
        },
      })

    if (
      grupos.length === 0
    ) {
      return NextResponse.json({
        totalRepresentadas: 0,
        representadas: [],
      })
    }

    const idsRepresentadas =
      grupos.map(
        (
          grupo
        ) =>
          grupo.representadaId
      )

    const representadas =
      await prisma.representada.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          id: {
            in:
              idsRepresentadas,
          },
        },

        select: {
          id: true,
          codigo: true,
          nome: true,
          status: true,
        },
      })

    const dadosPorRepresentada =
      new Map(
        grupos.map(
          (
            grupo
          ) => [
            grupo.representadaId,
            {
              quantidadeVendas:
                grupo._count._all,

              ultimaVendaEm:
                grupo._max.data,
            },
          ]
        )
      )

    const itens =
      representadas
        .map(
          (
            representada
          ) => {
            const dados =
              dadosPorRepresentada.get(
                representada.id
              )

            return {
              id:
                representada.id,

              codigo:
                representada.codigo,

              nome:
                representada.nome,

              status:
                representada.status,

              quantidadeVendas:
                dados?.quantidadeVendas ??
                0,

              ultimaVendaEm:
                dados?.ultimaVendaEm ??
                null,
            }
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            a.nome.localeCompare(
              b.nome,
              "pt-BR"
            )
        )

    return NextResponse.json({
      totalRepresentadas:
        itens.length,

      representadas:
        itens,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao listar Representadas com compras confirmadas do Cliente:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar Representadas com compras confirmadas do Cliente.",
      },
      {
        status: 500,
      }
    )
  }
}
