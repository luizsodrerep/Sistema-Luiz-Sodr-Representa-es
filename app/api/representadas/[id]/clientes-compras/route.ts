import {
  NextRequest,
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

const STATUS_COMPRA_CONFIRMADA = [
  "Confirmado",
  "Parcialmente faturado",
  "Faturado",
]

function textoBusca(
  valor: string | null
) {
  return (
    valor || ""
  ).trim()
}

export async function GET(
  request: NextRequest,
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
        "representadas",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Você não possui permissão para visualizar Representadas.",
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

    const representada =
      await prisma.representada.findFirst({
        where: {
          id,
          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada.",
        },
        {
          status: 404,
        }
      )
    }

    const busca =
      textoBusca(
        request.nextUrl.searchParams.get(
          "busca"
        )
      )

    if (!busca) {
      return NextResponse.json({
        busca: "",
        total: 0,
        clientes: [],
      })
    }

    const grupos =
      await prisma.venda.groupBy({
        by: [
          "clienteId",
        ],

        where: {
          escritorioId:
            sessao.escritorioId,

          representadaId:
            representada.id,

          status: {
            in:
              STATUS_COMPRA_CONFIRMADA,
          },

          cliente: {
            OR: [
              {
                razaoSocial: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
              {
                nomeFantasia: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
              {
                codigo: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
              {
                cnpj: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
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
        busca,
        total: 0,
        clientes: [],
      })
    }

    const idsClientes =
      grupos.map(
        (
          grupo
        ) =>
          grupo.clienteId
      )

    const clientes =
      await prisma.cliente.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          id: {
            in:
              idsClientes,
          },

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
          codigo: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpj: true,
          status: true,
        },
      })

    const dadosPorCliente =
      new Map(
        grupos.map(
          (
            grupo
          ) => [
            grupo.clienteId,
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
      clientes
        .map(
          (
            cliente
          ) => {
            const dados =
              dadosPorCliente.get(
                cliente.id
              )

            return {
              id:
                cliente.id,

              codigo:
                cliente.codigo,

              razaoSocial:
                cliente.razaoSocial,

              nomeFantasia:
                cliente.nomeFantasia,

              cnpj:
                cliente.cnpj,

              status:
                cliente.status,

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
          ) => {
            const dataA =
              a.ultimaVendaEm
                ? new Date(
                    a.ultimaVendaEm
                  ).getTime()
                : 0

            const dataB =
              b.ultimaVendaEm
                ? new Date(
                    b.ultimaVendaEm
                  ).getTime()
                : 0

            if (
              dataA !==
              dataB
            ) {
              return (
                dataB -
                dataA
              )
            }

            return a.razaoSocial.localeCompare(
              b.razaoSocial,
              "pt-BR"
            )
          }
        )
        .slice(
          0,
          10
        )

    return NextResponse.json({
      busca,
      total:
        clientes.length,
      clientes:
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
      "Erro ao buscar Clientes com compras confirmadas da Representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar Clientes com compras confirmadas da Representada.",
      },
      {
        status: 500,
      }
    )
  }
}