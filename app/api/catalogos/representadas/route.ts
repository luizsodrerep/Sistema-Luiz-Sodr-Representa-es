import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    const url =
      new URL(
        request.url
      )

    const busca =
      url.searchParams
        .get(
          "busca"
        )
        ?.trim() ?? ""

    const somenteComCatalogos =
      url.searchParams.get(
        "somenteComCatalogos"
      ) === "1"

    const representadas =
      await prisma.representada.findMany(
        {
          where: {
            escritorioId:
              sessao.escritorioId,

            ...(busca
              ? {
                  OR: [
                    {
                      nome: {
                        contains:
                          busca,

                        mode:
                          "insensitive" as const,
                      },
                    },

                    {
                      codigo: {
                        contains:
                          busca,

                        mode:
                          "insensitive" as const,
                      },
                    },
                  ],
                }
              : {}),
          },

          orderBy: [
            {
              nome:
                "asc",
            },
          ],

          select: {
            id: true,
            codigo: true,
            nome: true,
            status: true,
          },
        }
      )

    const agrupamentos =
      await prisma.catalogo.groupBy(
        {
          by: [
            "representadaId",
            "status",
          ],

          where: {
            escritorioId:
              sessao.escritorioId,
          },

          _count: {
            _all: true,
          },

          _max: {
            criadoEm: true,
            atualizadoEm: true,
          },
        }
      )

    const resumoPorRepresentada =
      new Map<
        string,
        {
          ativos: number
          arquivados: number
          outros: number
          total: number
          ultimoCatalogoEm:
            Date | null
        }
      >()

    for (
      const grupo of
      agrupamentos
    ) {
      const atual =
        resumoPorRepresentada.get(
          grupo.representadaId
        ) ?? {
          ativos: 0,
          arquivados: 0,
          outros: 0,
          total: 0,
          ultimoCatalogoEm:
            null,
        }

      const quantidade =
        grupo._count._all

      atual.total +=
        quantidade

      if (
        grupo.status ===
        "Ativo"
      ) {
        atual.ativos +=
          quantidade
      } else if (
        grupo.status ===
        "Arquivado"
      ) {
        atual.arquivados +=
          quantidade
      } else {
        atual.outros +=
          quantidade
      }

      const dataGrupo =
        grupo._max
          .atualizadoEm ??
        grupo._max
          .criadoEm ??
        null

      if (
        dataGrupo &&
        (
          !atual.ultimoCatalogoEm ||
          dataGrupo >
            atual.ultimoCatalogoEm
        )
      ) {
        atual.ultimoCatalogoEm =
          dataGrupo
      }

      resumoPorRepresentada.set(
        grupo.representadaId,
        atual
      )
    }

    const dados =
      representadas
        .map(
          (
            representada
          ) => {
            const resumo =
              resumoPorRepresentada.get(
                representada.id
              ) ?? {
                ativos: 0,
                arquivados: 0,
                outros: 0,
                total: 0,
                ultimoCatalogoEm:
                  null,
              }

            return {
              ...representada,

              catalogos: {
                ativos:
                  resumo.ativos,

                arquivados:
                  resumo.arquivados,

                outros:
                  resumo.outros,

                total:
                  resumo.total,

                ultimoCatalogoEm:
                  resumo.ultimoCatalogoEm,
              },
            }
          }
        )
        .filter(
          (
            item
          ) =>
            !somenteComCatalogos ||
            item.catalogos.total >
              0
        )

    const totais =
      dados.reduce(
        (
          acumulado,
          item
        ) => {
          acumulado.representadas +=
            1

          acumulado.catalogosAtivos +=
            item.catalogos.ativos

          acumulado.catalogosArquivados +=
            item.catalogos.arquivados

          acumulado.catalogosTotal +=
            item.catalogos.total

          return acumulado
        },
        {
          representadas: 0,
          catalogosAtivos: 0,
          catalogosArquivados: 0,
          catalogosTotal: 0,
        }
      )

    return NextResponse.json(
      {
        dados,
        totais,
      }
    )
  } catch (
    error
  ) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao listar pastas de catálogos por Representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao carregar as Representadas dos catálogos.",
      },
      {
        status: 500,
      }
    )
  }
}