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

function somenteDataUtc(
  data: Date
) {
  return Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate()
  )
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
        "Você não possui permissão para prorrogar vencimentos.",
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
        "Dados da prorrogação inválidos.",
        400
      )
    }

    const novaData =
      converterData(
        (
          corpo as {
            prorrogadoPara?: unknown
          }
        ).prorrogadoPara
      )

    if (
      !novaData
    ) {
      throw new ErroApi(
        "Informe uma nova data de vencimento válida.",
        400
      )
    }

    const titulo =
      await prisma
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

    const totalBaixado =
      Number(
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
          .toFixed(2)
      )

    const saldo =
      Number(
        Math.max(
          Number(
            titulo.valor
          ) -
            totalBaixado,
          0
        ).toFixed(2)
      )

    if (
      saldo <= 0
    ) {
      throw new ErroApi(
        "Não é possível prorrogar um título já liquidado.",
        409
      )
    }

    const statusNormalizado =
      titulo.status
        .trim()
        .toLowerCase()

    if (
      statusNormalizado ===
        "pago" ||
      statusNormalizado ===
        "liquidado"
    ) {
      throw new ErroApi(
        "Não é possível prorrogar um título marcado como pago.",
        409
      )
    }

    const vencimentoAtual =
      titulo.prorrogadoPara ||
      titulo.vencimento

    if (
      somenteDataUtc(
        novaData
      ) <=
      somenteDataUtc(
        vencimentoAtual
      )
    ) {
      throw new ErroApi(
        "A nova data deve ser posterior ao vencimento atual do título.",
        400
      )
    }

    const tituloAtualizado =
      await prisma
        .tituloVenda
        .update({
          where: {
            id:
              titulo.id,
          },

          data: {
            prorrogadoPara:
              novaData,
          },

          include: {
            baixas: {
              orderBy: {
                data: "asc",
              },
            },

            faturamento: {
              include: {
                venda: {
                  include: {
                    cliente: true,
                    representada:
                      true,
                  },
                },
              },
            },
          },
        })

    return NextResponse.json({
      message:
        "Vencimento prorrogado com sucesso.",

      titulo:
        tituloAtualizado,
    })
  } catch (
    error
  ) {
    console.error(
      "Erro ao prorrogar vencimento:",
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
          "Erro ao prorrogar vencimento.",
      },
      {
        status: 500,
      }
    )
  }
}