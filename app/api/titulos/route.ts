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

function inicioDoDia(
  data: Date
) {
  const resultado =
    new Date(data)

  resultado.setHours(
    0,
    0,
    0,
    0
  )

  return resultado
}

function fimDoDia(
  data: Date
) {
  const resultado =
    new Date(data)

  resultado.setHours(
    23,
    59,
    59,
    999
  )

  return resultado
}

function determinarSituacao(
  status: string,
  vencimento: Date,
  prorrogadoPara: Date | null,
  valor: number,
  totalBaixado: number
) {
  const saldo =
    Math.max(
      Number(
        (
          valor -
          totalBaixado
        ).toFixed(2)
      ),
      0
    )

  if (
    saldo <= 0
  ) {
    return {
      situacao: "Pago",
      saldo,
    }
  }

  const statusNormalizado =
    status
      .trim()
      .toLowerCase()

  if (
    statusNormalizado ===
      "pago" ||
    statusNormalizado ===
      "liquidado"
  ) {
    return {
      situacao: "Pago",
      saldo,
    }
  }

  const dataEfetiva =
    prorrogadoPara ||
    vencimento

  const hoje =
    inicioDoDia(
      new Date()
    )

  const vencimentoEfetivo =
    inicioDoDia(
      dataEfetiva
    )

  if (
    vencimentoEfetivo.getTime() <
    hoje.getTime()
  ) {
    return {
      situacao: "Vencido",
      saldo,
    }
  }

  if (
    vencimentoEfetivo.getTime() ===
    hoje.getTime()
  ) {
    return {
      situacao:
        "Vence hoje",
      saldo,
    }
  }

  if (
    prorrogadoPara
  ) {
    return {
      situacao:
        "Prorrogado",
      saldo,
    }
  }

  return {
    situacao: "A vencer",
    saldo,
  }
}

export async function GET() {
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
      throw new ErroApi(
        "Você não possui permissão para visualizar títulos e vencimentos.",
        403
      )
    }

    const agora =
      new Date()

    const inicioHoje =
      inicioDoDia(
        agora
      )

    const fimHoje =
      fimDoDia(
        agora
      )

    const titulos =
      await prisma
        .tituloVenda
        .findMany({
          where: {
            faturamento: {
              venda: {
                escritorioId:
                  sessao.escritorioId,
              },
            },
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

          orderBy: [
            {
              vencimento:
                "asc",
            },
            {
              numeroSequencial:
                "asc",
            },
          ],
        })

    const itens =
      titulos.map(
        (
          titulo
        ) => {
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

          const resultado =
            determinarSituacao(
              titulo.status,
              titulo.vencimento,
              titulo.prorrogadoPara,
              Number(
                titulo.valor ||
                  0
              ),
              totalBaixado
            )

          return {
            id:
              titulo.id,

            numeroSequencial:
              titulo
                .numeroSequencial,

            numeroParcela:
              titulo
                .numeroParcela,

            numeroTituloExterno:
              titulo
                .numeroTituloExterno,

            vencimento:
              titulo
                .vencimento,

            prorrogadoPara:
              titulo
                .prorrogadoPara,

            vencimentoEfetivo:
              titulo
                .prorrogadoPara ||
              titulo
                .vencimento,

            valor:
              Number(
                titulo.valor
              ),

            totalBaixado,

            saldo:
              resultado.saldo,

            status:
              titulo.status,

            situacao:
              resultado
                .situacao,

            pagoEm:
              titulo.pagoEm,

            atrasoInformadoEm:
              titulo
                .atrasoInformadoEm,

            observacoes:
              titulo
                .observacoes,

            quantidadeBaixas:
              titulo
                .baixas
                .length,

            baixas:
              titulo
                .baixas,

            faturamento: {
              id:
                titulo
                  .faturamento
                  .id,

              numeroSequencial:
                titulo
                  .faturamento
                  .numeroSequencial,

              numeroNF:
                titulo
                  .faturamento
                  .numeroNF,

              dataFaturamento:
                titulo
                  .faturamento
                  .dataFaturamento,

              valorFaturado:
                Number(
                  titulo
                    .faturamento
                    .valorFaturado
                ),
            },

            venda: {
              id:
                titulo
                  .faturamento
                  .venda
                  .id,

              numeroSequencial:
                titulo
                  .faturamento
                  .venda
                  .numeroSequencial,

              data:
                titulo
                  .faturamento
                  .venda
                  .data,

              status:
                titulo
                  .faturamento
                  .venda
                  .status,

              cliente:
                titulo
                  .faturamento
                  .venda
                  .cliente,

              representada:
                titulo
                  .faturamento
                  .venda
                  .representada,
            },
          }
        }
      )

    const resumo =
      itens.reduce(
        (
          acumulado,
          item
        ) => {
          acumulado
            .valorTotal +=
            item.valor

          acumulado
            .totalBaixado +=
            item.totalBaixado

          acumulado
            .saldoAberto +=
            item.saldo

          if (
            item.situacao ===
            "Vencido"
          ) {
            acumulado
              .vencidos +=
              1

            acumulado
              .valorVencido +=
              item.saldo
          }

          if (
            item.situacao ===
            "Vence hoje"
          ) {
            acumulado
              .venceHoje +=
              1

            acumulado
              .valorVenceHoje +=
              item.saldo
          }

          if (
            item.situacao ===
            "A vencer"
          ) {
            acumulado
              .aVencer +=
              1
          }

          if (
            item.situacao ===
            "Prorrogado"
          ) {
            acumulado
              .prorrogados +=
              1
          }

          if (
            item.situacao ===
            "Pago"
          ) {
            acumulado
              .pagos +=
              1
          }

          return acumulado
        },
        {
          quantidade:
            0,
          valorTotal:
            0,
          totalBaixado:
            0,
          saldoAberto:
            0,
          vencidos:
            0,
          valorVencido:
            0,
          venceHoje:
            0,
          valorVenceHoje:
            0,
          aVencer:
            0,
          prorrogados:
            0,
          pagos:
            0,
        }
      )

    resumo.quantidade =
      itens.length

    resumo.valorTotal =
      Number(
        resumo.valorTotal
          .toFixed(2)
      )

    resumo.totalBaixado =
      Number(
        resumo.totalBaixado
          .toFixed(2)
      )

    resumo.saldoAberto =
      Number(
        resumo.saldoAberto
          .toFixed(2)
      )

    resumo.valorVencido =
      Number(
        resumo.valorVencido
          .toFixed(2)
      )

    resumo.valorVenceHoje =
      Number(
        resumo.valorVenceHoje
          .toFixed(2)
      )

    return NextResponse.json({
      referencia: {
        agora,
        inicioHoje,
        fimHoje,
      },

      resumo,

      titulos: itens,
    })
  } catch (
    error
  ) {
    console.error(
      "Erro ao carregar títulos e vencimentos:",
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
          "Erro ao carregar títulos e vencimentos.",
      },
      {
        status: 500,
      }
    )
  }
}