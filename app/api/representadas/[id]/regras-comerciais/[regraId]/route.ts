import { Prisma } from "@prisma/client"
import {
  NextRequest,
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"

import {
  prisma,
} from "@/lib/prisma"

function parseDataObrigatoria(
  valor: unknown
): Date {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    throw new Error(
      "DATA_OBRIGATORIA"
    )
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    throw new Error(
      "DATA_INVALIDA"
    )
  }

  return data
}

function parseDataOpcional(
  valor: unknown
): Date | null {
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
    throw new Error(
      "DATA_INVALIDA"
    )
  }

  return data
}

function parseNumeroOpcional(
  valor: unknown
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null
  }

  const numero =
    Number(valor)

  if (
    !Number.isFinite(
      numero
    )
  ) {
    throw new Error(
      "NUMERO_INVALIDO"
    )
  }

  return numero
}

function respostaNaoAutorizada(
  mensagem: string
) {
  return NextResponse.json(
    {
      message:
        mensagem,
    },
    {
      status: 403,
    }
  )
}

async function buscarRegraDoEscritorio(
  representadaId: string,
  regraId: string,
  escritorioId: string
) {
  return prisma.regraComercialRepresentada.findFirst({
    where: {
      id:
        regraId,

      representadaId,

      representada: {
        escritorioId,
      },
    },
  })
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      regraId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "regrasComerciais",
        "ver"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para visualizar regras comerciais."
      )
    }

    /*
     * PROTEÇÃO TEMPORÁRIA
     *
     * O Preposto poderá consultar na rota de
     * listagem somente as condições operacionais
     * necessárias para vender.
     *
     * A ficha individual contém dados internos,
     * comissão do escritório, observações,
     * vínculos contratuais e vendas associadas.
     *
     * Até a implantação das permissões individuais
     * do Cadastro 360, essa ficha detalhada fica
     * bloqueada para Preposto.
     */
    if (
      sessao.perfil ===
      "Preposto"
    ) {
      return respostaNaoAutorizada(
        "A ficha completa desta regra comercial contém informações internas do escritório e não está disponível para este perfil."
      )
    }

    const {
      id:
        representadaId,

      regraId,
    } =
      await params

    /*
     * A regra somente pode ser localizada
     * quando pertence a uma Representada
     * do escritório autenticado.
     */
    const regra =
      await prisma.regraComercialRepresentada.findFirst({
        where: {
          id:
            regraId,

          representadaId,

          representada: {
            escritorioId:
              sessao.escritorioId,
          },
        },

        include: {
          cliente: {
            select: {
              id: true,

              codigo: true,

              razaoSocial:
                true,

              nomeFantasia:
                true,

              cnpj: true,

              status: true,
            },
          },

          contrato: {
            select: {
              id: true,

              tipoFormalizacao:
                true,

              descricao:
                true,

              dataInicio:
                true,

              dataEncerramento:
                true,

              vigente:
                true,
            },
          },

          vendas: {
            select: {
              id: true,

              numeroPedido:
                true,

              numeroPedidoInterno:
                true,

              data: true,

              valorTotal:
                true,

              status: true,
            },

            orderBy: {
              data:
                "desc",
            },
          },

          _count: {
            select: {
              vendas: true,
            },
          },
        },
      })

    if (
      !regra
    ) {
      return NextResponse.json(
        {
          message:
            "Regra comercial não encontrada para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      regra,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (error) {
    if (
      error instanceof
        Error &&
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
      "Erro ao buscar regra comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar regra comercial.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      regraId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "regrasComerciais",
        "editar"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para editar regras comerciais."
      )
    }

    const {
      id:
        representadaId,

      regraId,
    } =
      await params

    const body =
      await request.json()

    /*
     * Não basta conhecer regraId e representadaId.
     * A Representada também precisa pertencer
     * ao escritório da sessão autenticada.
     */
    const regraAtual =
      await buscarRegraDoEscritorio(
        representadaId,
        regraId,
        sessao.escritorioId
      )

    if (
      !regraAtual
    ) {
      return NextResponse.json(
        {
          message:
            "Regra comercial não encontrada para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      typeof body.nome !==
        "string" ||
      body.nome.trim() ===
        ""
    ) {
      return NextResponse.json(
        {
          message:
            "Nome da regra comercial é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    let vigenciaInicio:
      Date

    let vigenciaFim:
      | Date
      | null

    try {
      vigenciaInicio =
        parseDataObrigatoria(
          body.vigenciaInicio
        )

      vigenciaFim =
        parseDataOpcional(
          body.vigenciaFim
        )
    } catch {
      return NextResponse.json(
        {
          message:
            "A vigência da regra comercial contém data inválida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      vigenciaFim &&
      vigenciaFim <
        vigenciaInicio
    ) {
      return NextResponse.json(
        {
          message:
            "A data final da vigência não pode ser anterior à data inicial.",
        },
        {
          status: 400,
        }
      )
    }

    let clienteId:
      | string
      | null =
      null

    if (
      typeof body.clienteId ===
        "string" &&
      body.clienteId.trim() !==
        ""
    ) {
      const clienteIdValidado =
        body.clienteId.trim()

      /*
       * Cliente vinculado à regra deve
       * pertencer ao mesmo escritório.
       */
      const cliente =
        await prisma.cliente.findFirst({
          where: {
            id:
              clienteIdValidado,

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
          },
        })

      if (
        !cliente
      ) {
        return NextResponse.json(
          {
            message:
              "Cliente informado não foi encontrado.",
          },
          {
            status: 400,
          }
        )
      }

      clienteId =
        cliente.id
    }

    let contratoId:
      | string
      | null =
      null

    if (
      typeof body.contratoId ===
        "string" &&
      body.contratoId.trim() !==
        ""
    ) {
      const contratoIdValidado =
        body.contratoId.trim()

      /*
       * Contrato precisa pertencer:
       * - à mesma Representada;
       * - ao mesmo escritório.
       */
      const contrato =
        await prisma.contratoRepresentada.findFirst({
          where: {
            id:
              contratoIdValidado,

            representadaId,

            representada: {
              escritorioId:
                sessao.escritorioId,
            },
          },

          select: {
            id: true,
          },
        })

      if (
        !contrato
      ) {
        return NextResponse.json(
          {
            message:
              "Contrato informado não pertence a esta representada.",
          },
          {
            status: 400,
          }
        )
      }

      contratoId =
        contrato.id
    }

    const tipoEscopo =
      typeof body.tipoEscopo ===
        "string" &&
      body.tipoEscopo.trim() !==
        ""
        ? body.tipoEscopo.trim()
        : "Padrao"

    if (
      clienteId &&
      tipoEscopo ===
        "Padrao"
    ) {
      return NextResponse.json(
        {
          message:
            "Uma regra vinculada a cliente não pode ter escopo Padrão.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !clienteId &&
      tipoEscopo !==
        "Padrao"
    ) {
      return NextResponse.json(
        {
          message:
            "Regra sem cliente específico deve usar escopo Padrão.",
        },
        {
          status: 400,
        }
      )
    }

    let pedidoMinimo:
      | number
      | null

    let minimoParcela:
      | number
      | null

    let prazoEntregaDias:
      | number
      | null

    let prazoFaturamentoDias:
      | number
      | null

    let percentualComissao:
      | number
      | null

    try {
      pedidoMinimo =
        parseNumeroOpcional(
          body.pedidoMinimo
        )

      minimoParcela =
        parseNumeroOpcional(
          body.minimoParcela
        )

      prazoEntregaDias =
        parseNumeroOpcional(
          body.prazoEntregaDias
        )

      prazoFaturamentoDias =
        parseNumeroOpcional(
          body.prazoFaturamentoDias
        )

      percentualComissao =
        parseNumeroOpcional(
          body.percentualComissao
        )
    } catch {
      return NextResponse.json(
        {
          message:
            "Um ou mais campos numéricos são inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      pedidoMinimo !==
        null &&
      pedidoMinimo <
        0
    ) {
      return NextResponse.json(
        {
          message:
            "Pedido mínimo não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      minimoParcela !==
        null &&
      minimoParcela <
        0
    ) {
      return NextResponse.json(
        {
          message:
            "Valor mínimo da parcela não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      prazoEntregaDias !==
        null &&
      (
        !Number.isInteger(
          prazoEntregaDias
        ) ||
        prazoEntregaDias <
          0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de entrega deve ser inteiro e igual ou maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      prazoFaturamentoDias !==
        null &&
      (
        !Number.isInteger(
          prazoFaturamentoDias
        ) ||
        prazoFaturamentoDias <
          0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de faturamento deve ser inteiro e igual ou maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    const tipoComissao =
      typeof body.tipoComissao ===
        "string" &&
      body.tipoComissao.trim() !==
        ""
        ? body.tipoComissao.trim()
        : null

    if (
      tipoComissao !==
        null &&
      tipoComissao !==
        "fixa" &&
      tipoComissao !==
        "variada"
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de comissão inválido.",
        },
        {
          status: 400,
        }
      )
    }

    let faixasComissao:
      | string
      | null =
      null

    if (
      tipoComissao ===
      "fixa"
    ) {
      if (
        percentualComissao ===
          null ||
        percentualComissao <=
          0
      ) {
        return NextResponse.json(
          {
            message:
              "Percentual de comissão é obrigatório para regra fixa.",
          },
          {
            status: 400,
          }
        )
      }

      faixasComissao =
        null
    }

    if (
      tipoComissao ===
      "variada"
    ) {
      if (
        typeof body.faixasComissao !==
          "string" ||
        body.faixasComissao.trim() ===
          ""
      ) {
        return NextResponse.json(
          {
            message:
              "Faixas de comissão são obrigatórias para comissão variada.",
          },
          {
            status: 400,
          }
        )
      }

      try {
        const faixas =
          JSON.parse(
            body.faixasComissao
          )

        if (
          !Array.isArray(
            faixas
          ) ||
          faixas.length ===
            0
        ) {
          throw new Error()
        }

        const validas =
          faixas.every(
            (
              faixa
            ) =>
              faixa &&
              typeof faixa.desconto ===
                "string" &&
              faixa.desconto.trim() !==
                "" &&
              typeof faixa.comissao ===
                "string" &&
              faixa.comissao.trim() !==
                ""
          )

        if (
          !validas
        ) {
          throw new Error()
        }

        faixasComissao =
          JSON.stringify(
            faixas
          )

        percentualComissao =
          null
      } catch {
        return NextResponse.json(
          {
            message:
              "Faixas de comissão inválidas.",
          },
          {
            status: 400,
          }
        )
      }
    }

    const regra =
      await prisma.regraComercialRepresentada.update({
        where: {
          id:
            regraAtual.id,
        },

        data: {
          clienteId,

          contratoId,

          nome:
            body.nome.trim(),

          tipoEscopo,

          vigenciaInicio,

          vigenciaFim,

          ativa:
            typeof body.ativa ===
            "boolean"
              ? body.ativa
              : regraAtual.ativa,

          pedidoMinimo,

          minimoParcela,

          prazoEntregaDias:
            prazoEntregaDias ===
            null
              ? null
              : Math.trunc(
                  prazoEntregaDias
                ),

          prazoFaturamentoDias:
            prazoFaturamentoDias ===
            null
              ? null
              : Math.trunc(
                  prazoFaturamentoDias
                ),

          frete:
            typeof body.frete ===
              "string" &&
            body.frete.trim() !==
              ""
              ? body.frete.trim()
              : null,

          regiao:
            typeof body.regiao ===
              "string" &&
            body.regiao.trim() !==
              ""
              ? body.regiao.trim()
              : null,

          tipoComissao,

          percentualComissao,

          faixasComissao,

          reconhecimentoComissao:
            typeof body.reconhecimentoComissao ===
              "string" &&
            body.reconhecimentoComissao.trim() !==
              ""
              ? body.reconhecimentoComissao.trim()
              : null,

          fechamentoComissao:
            typeof body.fechamentoComissao ===
              "string" &&
            body.fechamentoComissao.trim() !==
              ""
              ? body.fechamentoComissao.trim()
              : null,

          pagamentoComissao:
            typeof body.pagamentoComissao ===
              "string" &&
            body.pagamentoComissao.trim() !==
              ""
              ? body.pagamentoComissao.trim()
              : null,

          observacoes:
            typeof body.observacoes ===
              "string" &&
            body.observacoes.trim() !==
              ""
              ? body.observacoes.trim()
              : null,
        },

        include: {
          cliente: {
            select: {
              id: true,

              codigo: true,

              razaoSocial:
                true,

              nomeFantasia:
                true,
            },
          },

          contrato: {
            select: {
              id: true,

              tipoFormalizacao:
                true,

              vigente:
                true,
            },
          },

          _count: {
            select: {
              vendas: true,
            },
          },
        },
      })

    return NextResponse.json(
      {
        message:
          "Regra comercial atualizada com sucesso.",

        data:
          regra,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    if (
      error instanceof
        Error &&
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
      "Erro ao atualizar regra comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar regra comercial.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      regraId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "regrasComerciais",
        "excluir"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para excluir regras comerciais."
      )
    }

    const {
      id:
        representadaId,

      regraId,
    } =
      await params

    /*
     * A regra precisa pertencer simultaneamente
     * à Representada informada e ao escritório
     * autenticado.
     */
    const regra =
      await prisma.regraComercialRepresentada.findFirst({
        where: {
          id:
            regraId,

          representadaId,

          representada: {
            escritorioId:
              sessao.escritorioId,
          },
        },

        select: {
          id: true,

          nome: true,

          _count: {
            select: {
              vendas: true,
            },
          },
        },
      })

    if (
      !regra
    ) {
      return NextResponse.json(
        {
          message:
            "Regra comercial não encontrada para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Regras já utilizadas em vendas fazem
     * parte do histórico comercial e não
     * devem ser apagadas.
     */
    if (
      regra._count
        .vendas >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Esta regra comercial já foi utilizada em vendas e não pode ser excluída. Desative a regra ou encerre sua vigência.",
        },
        {
          status: 409,
        }
      )
    }

    await prisma.regraComercialRepresentada.delete({
      where: {
        id:
          regra.id,
      },
    })

    return NextResponse.json(
      {
        message:
          "Regra comercial excluída com sucesso.",
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    if (
      error instanceof
        Error &&
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

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2003"
    ) {
      return NextResponse.json(
        {
          message:
            "Esta regra comercial possui registros vinculados e não pode ser excluída.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao excluir regra comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir regra comercial.",
      },
      {
        status: 500,
      }
    )
  }
}