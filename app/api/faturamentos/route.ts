import {
  Prisma,
} from "@prisma/client"

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

function numeroObrigatorio(
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(valor)

  if (
    !Number.isFinite(numero)
  ) {
    return null
  }

  return numero
}

function numeroOpcional(
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(valor)

  if (
    !Number.isFinite(numero)
  ) {
    return null
  }

  return numero
}

function textoObrigatorio(
  valor: unknown
) {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto !== ""
    ? texto
    : null
}

function textoOpcional(
  valor: unknown
) {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto !== ""
    ? texto
    : null
}

function dataValida(
  valor: unknown
) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
}

function interpretarCondicaoPagamento(
  valor: string
) {
  const normalizada =
    valor
      .trim()
      .replace(
        /\s+/g,
        ""
      )

  if (
    !/^\d+(?:-\d+)*$/.test(
      normalizada
    )
  ) {
    throw new ErroApi(
      "A condição de pagamento da Venda está inválida. Use somente números separados por hífen, por exemplo: 0, 21, 21-28 ou 21-28-35.",
      400
    )
  }

  const prazos =
    normalizada
      .split("-")
      .map(
        (
          parte
        ) =>
          Number(
            parte
          )
      )

  if (
    prazos.length === 1 &&
    prazos[0] === 0
  ) {
    return {
      normalizada:
        "0",
      prazos: [0],
    }
  }

  if (
    prazos.some(
      (
        prazo
      ) =>
        !Number.isInteger(
          prazo
        ) ||
        prazo <= 0
    )
  ) {
    throw new ErroApi(
      "A condição de pagamento é inválida. O valor 0 é exclusivo para venda à vista; os demais prazos devem ser dias inteiros maiores que zero.",
      400
    )
  }

  for (
    let indice = 1;
    indice < prazos.length;
    indice += 1
  ) {
    if (
      prazos[indice] <=
      prazos[indice - 1]
    ) {
      throw new ErroApi(
        "Os prazos da condição de pagamento devem estar em ordem crescente e sem repetição, por exemplo: 21-28-35.",
        400
      )
    }
  }

  return {
    normalizada,
    prazos,
  }
}

function adicionarDias(
  dataBase: Date,
  dias: number
) {
  const resultado =
    new Date(
      dataBase.getTime()
    )

  resultado.setUTCDate(
    resultado.getUTCDate() +
      dias
  )

  return resultado
}

function dividirValorEmParcelas(
  valor: number,
  quantidade: number
) {
  const totalCentavos =
    Math.round(
      valor * 100
    )

  const baseCentavos =
    Math.floor(
      totalCentavos /
        quantidade
    )

  const resto =
    totalCentavos %
    quantidade

  return Array.from(
    {
      length:
        quantidade,
    },
    (
      _,
      indice
    ) =>
      (
        baseCentavos +
        (
          indice < resto
            ? 1
            : 0
        )
      ) /
      100
  )
}

function tratarErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (
    error instanceof ErroApi
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

  console.error(
    mensagemPadrao,
    error
  )

  return NextResponse.json(
    {
      message:
        mensagemPadrao,
    },
    {
      status: 500,
    }
  )
}

export async function GET(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "faturamento",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Você não possui permissão para acessar Faturamento.",
        },
        {
          status: 403,
        }
      )
    }

    const vendaId =
      request.nextUrl.searchParams
        .get("vendaId")
        ?.trim() || null

    const faturamentos =
      await prisma.faturamento.findMany({
        where: {
          venda: {
            escritorioId:
              sessao.escritorioId,

            ...(vendaId
              ? {
                  id:
                    vendaId,
                }
              : {}),
          },
        },

        include: {
          venda: {
            select: {
              id: true,
              numeroSequencial: true,
              data: true,
              valorTotal: true,
              status: true,
              condicaoPagamento: true,

              cliente: {
                select: {
                  id: true,
                  codigo: true,
                  razaoSocial: true,
                  nomeFantasia: true,
                },
              },

              representada: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                },
              },
            },
          },

          titulos: {
            orderBy: [
              {
                vencimento:
                  "asc",
              },
              {
                numeroParcela:
                  "asc",
              },
            ],
          },
        },

        orderBy: [
          {
            dataFaturamento:
              "desc",
          },
          {
            criadoEm:
              "desc",
          },
        ],
      })

    return NextResponse.json(
      faturamentos
    )
  } catch (error) {
    return tratarErro(
      error,
      "Erro ao listar faturamentos."
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "faturamento",
        "criar"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Você não possui permissão para registrar Faturamento.",
        },
        {
          status: 403,
        }
      )
    }

    const body =
      await request.json()

    const vendaId =
      textoObrigatorio(
        body.vendaId
      )

    if (!vendaId) {
      return NextResponse.json(
        {
          message:
            "Venda obrigatória.",
        },
        {
          status: 400,
        }
      )
    }

    const numeroNF =
      textoObrigatorio(
        body.numeroNF
      )

    if (!numeroNF) {
      return NextResponse.json(
        {
          message:
            "Informe o número da NF.",
        },
        {
          status: 400,
        }
      )
    }

    const dataFaturamento =
      dataValida(
        body.dataFaturamento
      )

    if (!dataFaturamento) {
      return NextResponse.json(
        {
          message:
            "Informe uma data de faturamento válida.",
        },
        {
          status: 400,
        }
      )
    }

    const valorFaturadoInformado =
      numeroObrigatorio(
        body.valorFaturado
      )

    if (
      valorFaturadoInformado ===
        null ||
      valorFaturadoInformado <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um valor faturado maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    const valorFaturado =
      arredondarMoeda(
        valorFaturadoInformado
      )

    const valorCorteInformado =
      numeroOpcional(
        body.valorCorte
      )

    const percentualCorteInformado =
      numeroOpcional(
        body.percentualCorte
      )

    if (
      valorCorteInformado !== null &&
      valorCorteInformado < 0
    ) {
      return NextResponse.json(
        {
          message:
            "O valor de corte não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      percentualCorteInformado !==
        null &&
      (
        percentualCorteInformado <
          0 ||
        percentualCorteInformado >
          100
      )
    ) {
      return NextResponse.json(
        {
          message:
            "O percentual de corte deve estar entre 0 e 100.",
        },
        {
          status: 400,
        }
      )
    }

    const motivoCorte =
      textoOpcional(
        body.motivoCorte
      )

    const observacoes =
      textoOpcional(
        body.observacoes
      )

    const pdfUrl =
      textoOpcional(
        body.pdfUrl
      )

    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const venda =
            await tx.venda.findFirst({
              where: {
                id:
                  vendaId,

                escritorioId:
                  sessao.escritorioId,
              },

              select: {
                id: true,
                numeroSequencial: true,
                valorTotal: true,
                status: true,
                canceladoEm: true,
                condicaoPagamento: true,

                clienteId: true,
                representadaId: true,

                cliente: {
                  select: {
                    razaoSocial: true,
                    nomeFantasia: true,
                  },
                },

                representada: {
                  select: {
                    nome: true,
                  },
                },

                faturamentos: {
                  select: {
                    id: true,
                    numeroNF: true,
                    valorFaturado: true,
                    valorCorte: true,
                  },
                },
              },
            })

          if (!venda) {
            throw new ErroApi(
              "Venda não encontrada neste escritório.",
              404
            )
          }

          if (
            venda.status ===
              "Cancelado" ||
            venda.canceladoEm
          ) {
            throw new ErroApi(
              "Venda cancelada não pode receber faturamento.",
              400
            )
          }

          if (
            ![
              "Confirmado",
              "Parcialmente faturado",
              "Faturado",
            ].includes(
              venda.status
            )
          ) {
            throw new ErroApi(
              "A Venda precisa estar confirmada pela Representada antes do faturamento.",
              400
            )
          }

          const condicaoPagamento =
            textoObrigatorio(
              venda.condicaoPagamento
            )

          if (
            !condicaoPagamento
          ) {
            throw new ErroApi(
              "A Venda não possui condição de pagamento registrada. Corrija a condição comercial antes de registrar o faturamento.",
              400
            )
          }

          const condicaoInterpretada =
            interpretarCondicaoPagamento(
              condicaoPagamento
            )

          const valorVenda =
            arredondarMoeda(
              Number(
                venda.valorTotal ||
                  0
              )
            )

          if (
            valorVenda <= 0
          ) {
            throw new ErroApi(
              "A Venda não possui valor total válido para faturamento.",
              400
            )
          }

          const nfDuplicada =
            venda.faturamentos.some(
              (item) =>
                item.numeroNF
                  ?.trim()
                  .toLocaleLowerCase(
                    "pt-BR"
                  ) ===
                numeroNF.toLocaleLowerCase(
                  "pt-BR"
                )
            )

          if (nfDuplicada) {
            throw new ErroApi(
              "Esta NF já está registrada nesta Venda.",
              409
            )
          }

          const totalFaturadoAnterior =
            arredondarMoeda(
              venda.faturamentos.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  Number(
                    item.valorFaturado ||
                      0
                  ),
                0
              )
            )

          const totalCortadoAnterior =
            arredondarMoeda(
              venda.faturamentos.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  Number(
                    item.valorCorte ||
                      0
                  ),
                0
              )
            )

          const saldoAntes =
            arredondarMoeda(
              Math.max(
                valorVenda -
                  totalFaturadoAnterior -
                  totalCortadoAnterior,
                0
              )
            )

          if (
            saldoAntes <= 0
          ) {
            throw new ErroApi(
              "Esta Venda não possui saldo disponível para novo faturamento.",
              409
            )
          }

          let valorCorte = 0

          if (
            valorCorteInformado !==
              null
          ) {
            valorCorte =
              arredondarMoeda(
                valorCorteInformado
              )
          } else if (
            percentualCorteInformado !==
              null
          ) {
            valorCorte =
              arredondarMoeda(
                (
                  valorVenda *
                  percentualCorteInformado
                ) /
                  100
              )
          }

          let percentualCorte = 0

          if (
            valorCorte > 0
          ) {
            percentualCorte =
              Number(
                (
                  (valorCorte /
                    valorVenda) *
                  100
                ).toFixed(4)
              )
          }

          if (
            valorCorteInformado !==
              null &&
            percentualCorteInformado !==
              null
          ) {
            const valorCalculadoPorPercentual =
              arredondarMoeda(
                (
                  valorVenda *
                  percentualCorteInformado
                ) /
                  100
              )

            if (
              Math.abs(
                valorCalculadoPorPercentual -
                  valorCorte
              ) > 0.01
            ) {
              throw new ErroApi(
                "O valor e o percentual de corte informados não correspondem entre si.",
                400
              )
            }

            percentualCorte =
              Number(
                percentualCorteInformado.toFixed(
                  4
                )
              )
          }

          if (
            valorCorte > 0 &&
            !motivoCorte
          ) {
            throw new ErroApi(
              "Informe o motivo do corte.",
              400
            )
          }

          const totalMovimentado =
            arredondarMoeda(
              valorFaturado +
                valorCorte
            )

          if (
            totalMovimentado >
            saldoAntes + 0.01
          ) {
            throw new ErroApi(
              `O faturamento mais o corte ultrapassa o saldo disponível da Venda, que é de R$ ${saldoAntes.toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits:
                    2,
                  maximumFractionDigits:
                    2,
                }
              )}.`,
              400
            )
          }

          const saldoDepois =
            arredondarMoeda(
              Math.max(
                saldoAntes -
                  totalMovimentado,
                0
              )
            )

          const faturamentoParcial =
            saldoDepois > 0.01

          const novoStatusVenda =
            faturamentoParcial
              ? "Parcialmente faturado"
              : "Faturado"

          const valoresParcelas =
            dividirValorEmParcelas(
              valorFaturado,
              condicaoInterpretada
                .prazos
                .length
            )

          const titulosPrevistos =
            condicaoInterpretada
              .prazos
              .map(
                (
                  prazo,
                  indice
                ) => ({
                  numeroParcela:
                    indice + 1,

                  vencimento:
                    adicionarDias(
                      dataFaturamento,
                      prazo
                    ),

                  valor:
                    valoresParcelas[
                      indice
                    ],

                  status:
                    "Aberto",

                  observacoes:
                    `Título interno gerado automaticamente a partir da NF ${numeroNF}. Condição de pagamento: ${condicaoInterpretada.normalizada}.`,
                })
              )

          const faturamento =
            await tx.faturamento.create({
              data: {
                vendaId:
                  venda.id,

                numeroNF,

                dataFaturamento,

                valorFaturado,

                faturamentoParcial,

                saldoPedido:
                  saldoDepois,

                percentualCorte:
                  valorCorte > 0
                    ? percentualCorte
                    : null,

                valorCorte:
                  valorCorte > 0
                    ? valorCorte
                    : null,

                motivoCorte:
                  valorCorte > 0
                    ? motivoCorte
                    : null,

                pdfUrl,

                status:
                  "Faturado",

                observacoes,

                titulos: {
                  create:
                    titulosPrevistos,
                },
              },

              include: {
                titulos: {
                  orderBy: {
                    numeroParcela:
                      "asc",
                  },
                },
              },
            })

          await tx.venda.update({
            where: {
              id:
                venda.id,
            },

            data: {
              status:
                novoStatusVenda,
            },
          })

          return {
            faturamento,

            resumo: {
              vendaId:
                venda.id,

              numeroSequencialVenda:
                venda.numeroSequencial,

              valorVenda,

              totalFaturadoAnterior,

              totalCortadoAnterior,

              valorFaturado,

              valorCorte,

              totalFaturadoAtual:
                arredondarMoeda(
                  totalFaturadoAnterior +
                    valorFaturado
                ),

              totalCortadoAtual:
                arredondarMoeda(
                  totalCortadoAnterior +
                    valorCorte
                ),

              saldoAntes,

              saldoDepois,

              faturamentoParcial,

              statusVenda:
                novoStatusVenda,

              condicaoPagamento:
                condicaoInterpretada.normalizada,

              quantidadeTitulos:
                faturamento.titulos.length,

              titulos:
                faturamento.titulos.map(
                  (
                    titulo
                  ) => ({
                    id:
                      titulo.id,

                    numeroSequencial:
                      titulo.numeroSequencial,

                    numeroParcela:
                      titulo.numeroParcela,

                    vencimento:
                      titulo.vencimento,

                    valor:
                      titulo.valor,

                    status:
                      titulo.status,
                  })
                ),
            },
          }
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel
              .Serializable,
        }
      )

    return NextResponse.json(
      resultado,
      {
        status: 201,
      }
    )
  } catch (error) {
    return tratarErro(
      error,
      "Erro ao registrar faturamento."
    )
  }
}
