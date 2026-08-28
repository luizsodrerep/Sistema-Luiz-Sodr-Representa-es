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

function converterNumero(
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

function converterTextoOpcional(
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

function converterData(
  valor: unknown
) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const texto =
    valor.trim()

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ) {
    return null
  }

  const [
    anoTexto,
    mesTexto,
    diaTexto,
  ] =
    texto.split("-")

  const ano =
    Number(anoTexto)

  const mes =
    Number(mesTexto)

  const dia =
    Number(diaTexto)

  const data =
    new Date(
      Date.UTC(
        ano,
        mes - 1,
        dia,
        12,
        0,
        0,
        0
      )
    )

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !==
      mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null
  }

  return data
}

export async function POST(
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
        "faturamento",
        "editar"
      )
    ) {
      throw new ErroApi(
        "Você não possui permissão para registrar baixas de títulos.",
        403
      )
    }

    const {
      id,
    } =
      await params

    if (
      !id ||
      id.trim() === ""
    ) {
      throw new ErroApi(
        "Título não informado.",
        400
      )
    }

    const corpo =
      await request
        .json()
        .catch(
          () => null
        )

    if (
      !corpo ||
      typeof corpo !==
        "object"
    ) {
      throw new ErroApi(
        "Dados da baixa inválidos.",
        400
      )
    }

    const dados =
      corpo as {
        data?: unknown
        valor?: unknown
        origemInformacao?: unknown
        referencia?: unknown
        observacoes?: unknown
      }

    const data =
      converterData(
        dados.data
      )

    if (
      !data
    ) {
      throw new ErroApi(
        "Informe uma data de pagamento válida.",
        400
      )
    }

    const valor =
      converterNumero(
        dados.valor
      )

    if (
      valor === null ||
      valor <= 0
    ) {
      throw new ErroApi(
        "O valor da baixa deve ser maior que zero.",
        400
      )
    }

    const valorBaixa =
      arredondarMoeda(
        valor
      )

    const origemInformacao =
      converterTextoOpcional(
        dados.origemInformacao
      )

    const referencia =
      converterTextoOpcional(
        dados.referencia
      )

    const observacoes =
      converterTextoOpcional(
        dados.observacoes
      )

    const resultado =
      await prisma
        .$transaction(
          async (
            tx
          ) => {
            const titulo =
              await tx
                .tituloVenda
                .findFirst({
                  where: {
                    id,

                    faturamento: {
                      venda: {
                        escritorioId:
                          sessao.escritorioId,
                      },
                    },
                  },

                  include: {
                    baixas: true,

                    faturamento: {
                      include: {
                        venda: {
                          include: {
                            cliente:
                              true,
                            representada:
                              true,
                          },
                        },
                      },
                    },
                  },
                })

            if (
              !titulo
            ) {
              throw new ErroApi(
                "Título não encontrado.",
                404
              )
            }

            const totalBaixadoAntes =
              arredondarMoeda(
                titulo.baixas
                  .reduce(
                    (
                      total,
                      baixa
                    ) =>
                      total +
                      Number(
                        baixa.valor ||
                          0
                      ),
                    0
                  )
              )

            const valorTitulo =
              arredondarMoeda(
                Number(
                  titulo.valor
                )
              )

            const saldoAntes =
              arredondarMoeda(
                Math.max(
                  valorTitulo -
                    totalBaixadoAntes,
                  0
                )
              )

            if (
              saldoAntes <= 0
            ) {
              throw new ErroApi(
                "Este título já está totalmente liquidado.",
                409
              )
            }

            if (
              valorBaixa >
              saldoAntes
            ) {
              throw new ErroApi(
                `O valor informado é maior que o saldo atual do título, que é de R$ ${saldoAntes.toLocaleString(
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

            const baixa =
              await tx
                .tituloVendaBaixa
                .create({
                  data: {
                    tituloVendaId:
                      titulo.id,

                    data,

                    valor:
                      valorBaixa,

                    origemInformacao,

                    referencia,

                    observacoes,
                  },
                })

            const totalBaixadoDepois =
              arredondarMoeda(
                totalBaixadoAntes +
                  valorBaixa
              )

            const saldoDepois =
              arredondarMoeda(
                Math.max(
                  valorTitulo -
                    totalBaixadoDepois,
                  0
                )
              )

            const liquidado =
              saldoDepois <= 0

            const tituloAtualizado =
              await tx
                .tituloVenda
                .update({
                  where: {
                    id:
                      titulo.id,
                  },

                  data: liquidado
                    ? {
                        status:
                          "Pago",

                        pagoEm:
                          data,
                      }
                    : {
                        status:
                          "Aberto",

                        pagoEm:
                          null,
                      },

                  include: {
                    baixas: {
                      orderBy: {
                        data:
                          "asc",
                      },
                    },

                    faturamento: {
                      include: {
                        venda: {
                          include: {
                            cliente:
                              true,
                            representada:
                              true,
                          },
                        },
                      },
                    },
                  },
                })

            return {
              baixa,
              titulo:
                tituloAtualizado,
              valorTitulo,
              totalBaixado:
                totalBaixadoDepois,
              saldo:
                saldoDepois,
              liquidado,
            }
          }
        )

    return NextResponse.json({
      message:
        resultado.liquidado
          ? "Baixa registrada e título liquidado com sucesso."
          : "Baixa parcial registrada com sucesso.",

      baixa:
        resultado.baixa,

      titulo:
        resultado.titulo,

      resumo: {
        valorTitulo:
          resultado.valorTitulo,

        totalBaixado:
          resultado.totalBaixado,

        saldo:
          resultado.saldo,

        liquidado:
          resultado.liquidado,
      },
    })
  } catch (
    error
  ) {
    console.error(
      "Erro ao registrar baixa do título:",
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
          "Erro ao registrar baixa do título.",
      },
      {
        status: 500,
      }
    )
  }
}