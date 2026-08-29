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

class ErroApi extends Error {
  status: number

  constructor(
    mensagem: string,
    status: number
  ) {
    super(mensagem)
    this.name = "ErroApi"
    this.status = status
  }
}

function arredondarMoeda(
  valor: number
) {
  return Number(
    valor.toFixed(2)
  )
}

function normalizarTexto(
  valor:
    | string
    | null
    | undefined
) {
  return (
    valor ||
    ""
  )
    .trim()
    .toLowerCase()
}

function somarValores(
  valores: number[]
) {
  return arredondarMoeda(
    valores.reduce(
      (
        total,
        valor
      ) =>
        total +
        Number(
          valor ||
            0
        ),
      0
    )
  )
}

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "financeiro",
        "ver"
      )
    ) {
      throw new ErroApi(
        "Você não possui permissão para visualizar comissões.",
        403
      )
    }

    const [
      vendas,
      movimentos,
    ] =
      await Promise.all([
        prisma.venda.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,

            valorComissaoPrevista: {
              gt: 0,
            },
          },

          select: {
            id: true,
            numeroSequencial:
              true,
            data: true,
            status: true,

            valorTotal:
              true,

            percentualComissaoAplicado:
              true,

            regraReconhecimentoComissao:
              true,

            baseCalculoComissao:
              true,

            valorComissaoPrevista:
              true,

            bonificacaoValor:
              true,

            cliente: {
              select: {
                id: true,
                razaoSocial:
                  true,
                nomeFantasia:
                  true,
              },
            },

            representada: {
              select: {
                id: true,
                nome: true,

                regraReconhecimentoComissao:
                  true,

                fechamentoComissao:
                  true,

                pagamentoComissao:
                  true,

                exigeNFComissao:
                  true,
              },
            },

            faturamentos: {
              select: {
                id: true,
                numeroSequencial:
                  true,
                numeroNF:
                  true,
                dataFaturamento:
                  true,
                valorFaturado:
                  true,
                status:
                  true,
              },

              orderBy: {
                dataFaturamento:
                  "asc",
              },
            },

            comissoes: {
              select: {
                id: true,
                numeroSequencial:
                  true,
                tipo: true,
                data: true,
                valor: true,
                status:
                  true,
              },

              orderBy: {
                data: "asc",
              },
            },
          },

          orderBy: [
            {
              data: "desc",
            },
            {
              numeroSequencial:
                "desc",
            },
          ],
        }),

        prisma
          .comissaoMovimento
          .findMany({
            where: {
              OR: [
                {
                  venda: {
                    escritorioId:
                      sessao.escritorioId,
                  },
                },

                {
                  faturamento: {
                    venda: {
                      escritorioId:
                        sessao.escritorioId,
                    },
                  },
                },

                {
                  tituloVenda: {
                    faturamento: {
                      venda: {
                        escritorioId:
                          sessao.escritorioId,
                      },
                    },
                  },
                },

                {
                  tituloVendaBaixa: {
                    tituloVenda: {
                      faturamento: {
                        venda: {
                          escritorioId:
                            sessao.escritorioId,
                        },
                      },
                    },
                  },
                },

                {
                  nfComissao: {
                    empresaEscritorio: {
                      escritorioId:
                        sessao.escritorioId,
                    },
                  },
                },
              ],
            },

            include: {
              parcelas: {
                orderBy: {
                  numeroParcela:
                    "asc",
                },
              },

              venda: {
                select: {
                  id: true,
                  numeroSequencial:
                    true,
                  data: true,
                  status: true,

                  valorTotal:
                    true,

                  percentualComissaoAplicado:
                    true,

                  regraReconhecimentoComissao:
                    true,

                  baseCalculoComissao:
                    true,

                  valorComissaoPrevista:
                    true,

                  cliente: {
                    select: {
                      id: true,
                      razaoSocial:
                        true,
                      nomeFantasia:
                        true,
                    },
                  },

                  representada: {
                    select: {
                      id: true,
                      nome: true,
                    },
                  },
                },
              },

              faturamento: {
                select: {
                  id: true,
                  numeroSequencial:
                    true,
                  numeroNF:
                    true,
                  dataFaturamento:
                    true,
                  valorFaturado:
                    true,
                  status:
                    true,
                },
              },

              tituloVenda: {
                select: {
                  id: true,
                  numeroSequencial:
                    true,
                  numeroParcela:
                    true,
                  numeroTituloExterno:
                    true,
                  vencimento:
                    true,
                  prorrogadoPara:
                    true,
                  valor: true,
                  status:
                    true,
                  pagoEm:
                    true,
                },
              },

              tituloVendaBaixa: {
                select: {
                  id: true,
                  data: true,
                  valor: true,
                  origemInformacao:
                    true,
                  referencia:
                    true,
                },
              },

              nfComissao: {
                select: {
                  id: true,
                  numeroSequencial:
                    true,
                  numero: true,
                  dataEmissao:
                    true,
                  valorBruto:
                    true,
                  valorLiquido:
                    true,
                  vencimento:
                    true,
                  pagoEm:
                    true,
                  status:
                    true,

                  representada: {
                    select: {
                      id: true,
                      nome: true,
                    },
                  },

                  empresaEscritorio: {
                    select: {
                      id: true,
                      razaoSocial:
                        true,
                      nomeFantasia:
                        true,
                    },
                  },
                },
              },

              movimentoOrigem: {
                select: {
                  id: true,
                  numeroSequencial:
                    true,
                  tipo: true,
                  data: true,
                  valor: true,
                  status:
                    true,
                },
              },
            },

            orderBy: [
              {
                data: "desc",
              },
              {
                numeroSequencial:
                  "desc",
              },
            ],
          }),
      ])

    const vendasValidas =
      vendas.filter(
        (
          venda
        ) => {
          const status =
            normalizarTexto(
              venda.status
            )

          return (
            status !==
              "cancelado" &&
            status !==
              "cancelada"
          )
        }
      )

    const previsoes =
      vendasValidas.map(
        (
          venda
        ) => {
          const valorPrevisto =
            arredondarMoeda(
              Number(
                venda
                  .valorComissaoPrevista ||
                  0
              )
            )

          const baseCalculo =
            venda
              .baseCalculoComissao !==
            null
              ? arredondarMoeda(
                  Number(
                    venda
                      .baseCalculoComissao
                  )
                )
              : null

          const percentual =
            venda
              .percentualComissaoAplicado !==
            null
              ? Number(
                  venda
                    .percentualComissaoAplicado
                )
              : null

          const totalFaturado =
            somarValores(
              venda.faturamentos.map(
                (
                  faturamento
                ) =>
                  Number(
                    faturamento
                      .valorFaturado ||
                      0
                  )
              )
            )

          return {
            id:
              venda.id,

            numeroSequencial:
              venda.numeroSequencial,

            data:
              venda.data,

            status:
              venda.status,

            valorVenda:
              arredondarMoeda(
                Number(
                  venda.valorTotal ||
                    0
                )
              ),

            baseCalculo,

            percentual,

            valorPrevisto,

            regraReconhecimento:
              venda
                .regraReconhecimentoComissao ||
              venda
                .representada
                .regraReconhecimentoComissao ||
              null,

            bonificacaoValor:
              arredondarMoeda(
                Number(
                  venda
                    .bonificacaoValor ||
                    0
                )
              ),

            cliente:
              venda.cliente,

            representada:
              venda.representada,

            faturamentos:
              venda.faturamentos,

            totalFaturado,

            quantidadeFaturamentos:
              venda
                .faturamentos
                .length,

            movimentosExistentes:
              venda.comissoes,

            quantidadeMovimentos:
              venda
                .comissoes
                .length,

            possuiMovimento:
              venda
                .comissoes
                .length >
              0,
          }
        }
      )

    const movimentosFormatados =
      movimentos.map(
        (
          movimento
        ) => {
          const parcelas =
            movimento.parcelas.map(
              (
                parcela
              ) => ({
                ...parcela,

                valor:
                  arredondarMoeda(
                    Number(
                      parcela.valor ||
                        0
                    )
                  ),
              })
            )

          const valorParcelado =
            somarValores(
              parcelas.map(
                (
                  parcela
                ) =>
                  parcela.valor
              )
            )

          const parcelasPendentes =
            parcelas.filter(
              (
                parcela
              ) => {
                const status =
                  normalizarTexto(
                    parcela.status
                  )

                return (
                  status !==
                    "recebido" &&
                  status !==
                    "pago" &&
                  status !==
                    "liquidado" &&
                  status !==
                    "cancelado"
                )
              }
            )

          const valorParcelasPendentes =
            somarValores(
              parcelasPendentes.map(
                (
                  parcela
                ) =>
                  parcela.valor
              )
            )

          return {
            id:
              movimento.id,

            numeroSequencial:
              movimento.numeroSequencial,

            tipo:
              movimento.tipo,

            data:
              movimento.data,

            competencia:
              movimento.competencia,

            baseCalculo:
              movimento
                .baseCalculo !==
              null
                ? arredondarMoeda(
                    Number(
                      movimento
                        .baseCalculo
                    )
                  )
                : null,

            valor:
              arredondarMoeda(
                Number(
                  movimento.valor ||
                    0
                )
              ),

            percentual:
              movimento.percentual,

            status:
              movimento.status,

            descricao:
              movimento.descricao,

            venda:
              movimento.venda,

            faturamento:
              movimento
                .faturamento,

            tituloVenda:
              movimento
                .tituloVenda,

            tituloVendaBaixa:
              movimento
                .tituloVendaBaixa,

            nfComissao:
              movimento
                .nfComissao,

            movimentoOrigem:
              movimento
                .movimentoOrigem,

            parcelas,

            quantidadeParcelas:
              parcelas.length,

            valorParcelado,

            quantidadeParcelasPendentes:
              parcelasPendentes.length,

            valorParcelasPendentes,
          }
        }
      )

    const totalPrevistoVendas =
      somarValores(
        previsoes.map(
          (
            previsao
          ) =>
            previsao.valorPrevisto
        )
      )

    const totalMovimentos =
      somarValores(
        movimentosFormatados.map(
          (
            movimento
          ) =>
            movimento.valor
        )
      )

    const totalPorTipo =
      (
        tipoDesejado: string
      ) =>
        somarValores(
          movimentosFormatados
            .filter(
              (
                movimento
              ) =>
                normalizarTexto(
                  movimento.tipo
                ) ===
                normalizarTexto(
                  tipoDesejado
                )
            )
            .map(
              (
                movimento
              ) =>
                movimento.valor
            )
        )

    const quantidadePorTipo =
      (
        tipoDesejado: string
      ) =>
        movimentosFormatados
          .filter(
            (
              movimento
            ) =>
              normalizarTexto(
                movimento.tipo
              ) ===
              normalizarTexto(
                tipoDesejado
              )
          )
          .length

    const parcelasPendentes =
      movimentosFormatados
        .flatMap(
          (
            movimento
          ) =>
            movimento
              .parcelas
        )
        .filter(
          (
            parcela
          ) => {
            const status =
              normalizarTexto(
                parcela.status
              )

            return (
              status !==
                "recebido" &&
              status !==
                "pago" &&
              status !==
                "liquidado" &&
              status !==
                "cancelado"
            )
          }
        )

    const valorParcelasPendentes =
      somarValores(
        parcelasPendentes.map(
          (
            parcela
          ) =>
            Number(
              parcela.valor ||
                0
            )
        )
      )

    return NextResponse.json({
      referencia: {
        agora:
          new Date()
            .toISOString(),
      },

      resumo: {
        vendasComComissaoPrevista:
          previsoes.length,

        valorComissaoPrevistaVendas:
          totalPrevistoVendas,

        movimentos:
          movimentosFormatados.length,

        valorTotalMovimentos:
          totalMovimentos,

        previstas: {
          quantidade:
            quantidadePorTipo(
              "PREVISTA"
            ),

          valor:
            totalPorTipo(
              "PREVISTA"
            ),
        },

        devidas: {
          quantidade:
            quantidadePorTipo(
              "DEVIDA"
            ),

          valor:
            totalPorTipo(
              "DEVIDA"
            ),
        },

        recebidas: {
          quantidade:
            quantidadePorTipo(
              "RECEBIDA"
            ),

          valor:
            totalPorTipo(
              "RECEBIDA"
            ),
        },

        estornadas: {
          quantidade:
            quantidadePorTipo(
              "ESTORNADA"
            ),

          valor:
            totalPorTipo(
              "ESTORNADA"
            ),
        },

        recuperadas: {
          quantidade:
            quantidadePorTipo(
              "RECUPERADA"
            ),

          valor:
            totalPorTipo(
              "RECUPERADA"
            ),
        },

        ajustes: {
          quantidade:
            quantidadePorTipo(
              "AJUSTE"
            ),

          valor:
            totalPorTipo(
              "AJUSTE"
            ),
        },

        parcelasPendentes: {
          quantidade:
            parcelasPendentes.length,

          valor:
            valorParcelasPendentes,
        },
      },

      previsoes,

      movimentos:
        movimentosFormatados,
    })
  } catch (
    error
  ) {
    console.error(
      "Erro ao carregar comissões:",
      error
    )

    if (
      error instanceof
      ErroApi
    ) {
      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status:
            error.status,
        }
      )
    }

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

    return NextResponse.json(
      {
        message:
          "Erro ao carregar comissões.",
      },
      {
        status: 500,
      }
    )
  }
}