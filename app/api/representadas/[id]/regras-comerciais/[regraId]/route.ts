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

function parseDataComercial(
  valor: string
): Date {
  const texto =
    valor.trim()

  /*
   * Datas comerciais são gravadas ao meio-dia
   * de Brasília para preservar o dia informado
   * nos campos HTML do tipo date.
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ) {
    const data =
      new Date(
        `${texto}T12:00:00-03:00`
      )

    if (
      Number.isNaN(
        data.getTime()
      )
    ) {
      throw new Error(
        "DATA_INVALIDA"
      )
    }

    const partes =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "America/Sao_Paulo",
          year:
            "numeric",
          month:
            "2-digit",
          day:
            "2-digit",
        }
      ).formatToParts(
        data
      )

    const parte =
      (
        tipo: string
      ) =>
        partes.find(
          (
            item
          ) =>
            item.type ===
            tipo
        )?.value

    const dia =
      `${parte("year")}-${parte("month")}-${parte("day")}`

    if (
      dia !== texto
    ) {
      throw new Error(
        "DATA_INVALIDA"
      )
    }

    return data
  }

  const data =
    new Date(
      texto
    )

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

function parseDataObrigatoria(
  valor: unknown
): Date {
  if (
    typeof valor !==
      "string" ||
    valor.trim() ===
      ""
  ) {
    throw new Error(
      "DATA_OBRIGATORIA"
    )
  }

  return parseDataComercial(
    valor
  )
}

function parseDataOpcional(
  valor: unknown
): Date | null {
  if (
    typeof valor !==
      "string" ||
    valor.trim() ===
      ""
  ) {
    return null
  }

  return parseDataComercial(
    valor
  )
}

function parseNumeroOpcional(
  valor: unknown
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() ===
      ""
  ) {
    return null
  }

  const texto =
    String(valor)
      .trim()
      .replace(
        ",",
        "."
      )

  const numero =
    Number(
      texto
    )

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

function parsePercentual(
  valor: unknown
): number | null {
  if (
    typeof valor !== "string" &&
    typeof valor !== "number"
  ) {
    return null
  }

  const texto =
    String(valor)
      .trim()
      .replace(
        ",",
        "."
      )

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      texto
    )
  ) {
    return null
  }

  const numero =
    Number(
      texto
    )

  return (
    Number.isFinite(
      numero
    ) &&
    numero >= 0 &&
    numero <= 100
  )
    ? numero
    : null
}

function textoOpcional(
  valor: unknown
): string | null {
  return (
    typeof valor ===
      "string" &&
    valor.trim() !==
      ""
  )
    ? valor.trim()
    : null
}

type FaixaComissaoNormalizada = {
  desconto: string
  comissao: string
  pedidoMinimo:
    number | null
}

function normalizarFaixasComissao(
  valor: unknown
): string {
  if (
    typeof valor !==
      "string" ||
    valor.trim() ===
      ""
  ) {
    throw new Error(
      "FAIXAS_INVALIDAS"
    )
  }

  let faixas:
    unknown

  try {
    faixas =
      JSON.parse(
        valor
      )
  } catch {
    throw new Error(
      "FAIXAS_INVALIDAS"
    )
  }

  if (
    !Array.isArray(
      faixas
    ) ||
    faixas.length ===
      0
  ) {
    throw new Error(
      "FAIXAS_INVALIDAS"
    )
  }

  const descontosVistos =
    new Set<number>()

  const normalizadas:
    FaixaComissaoNormalizada[] =
      []

  for (
    const item of faixas
  ) {
    if (
      !item ||
      typeof item !==
        "object" ||
      Array.isArray(
        item
      )
    ) {
      throw new Error(
        "FAIXAS_INVALIDAS"
      )
    }

    const faixa =
      item as Record<
        string,
        unknown
      >

    const desconto =
      parsePercentual(
        faixa.desconto
      )

    const comissao =
      parsePercentual(
        faixa.comissao
      )

    /*
     * Cada percentual de desconto
     * deve corresponder a uma única
     * comissão dentro da política.
     */
    if (
      desconto === null ||
      comissao === null ||
      comissao <= 0 ||
      descontosVistos.has(
        desconto
      )
    ) {
      throw new Error(
        "FAIXAS_INVALIDAS"
      )
    }

    let pedidoMinimoFaixa:
      number | null =
      null

    try {
      pedidoMinimoFaixa =
        parseNumeroOpcional(
          faixa.pedidoMinimo
        )
    } catch {
      throw new Error(
        "FAIXAS_INVALIDAS"
      )
    }

    if (
      pedidoMinimoFaixa !==
        null &&
      pedidoMinimoFaixa <
        0
    ) {
      throw new Error(
        "FAIXAS_INVALIDAS"
      )
    }

    descontosVistos.add(
      desconto
    )

    normalizadas.push({
      desconto:
        String(
          desconto
        ),

      comissao:
        String(
          comissao
        ),

      pedidoMinimo:
        pedidoMinimoFaixa ===
          null
          ? null
          : Number(
              pedidoMinimoFaixa.toFixed(
                2
              )
            ),
    })
  }

  return JSON.stringify(
    normalizadas
  )
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
      status:
        403,
    }
  )
}

async function buscarRegraDoEscritorio(
  representadaId: string,
  regraId: string,
  escritorioId: string
) {
  return prisma.regraComercialRepresentada.findFirst(
    {
      where: {
        id:
          regraId,

        representadaId,

        representada: {
          escritorioId,
        },
      },

      include: {
        _count: {
          select: {
            vendas:
              true,
          },
        },

        vendas: {
          select: {
            id:
              true,

            data:
              true,

            numeroSequencial:
              true,
          },

          orderBy: {
            data:
              "desc",
          },

          take:
            1,
        },
      },
    }
  )
}

function snapshotRegra(
  regra: {
    id: string
    representadaId: string
    clienteId:
      string | null
    contratoId:
      string | null
    nome: string
    tipoEscopo: string
    vigenciaInicio: Date
    vigenciaFim:
      Date | null
    ativa: boolean
    pedidoMinimo:
      number | null
    minimoParcela:
      number | null
    prazoEntregaDias:
      number | null
    prazoFaturamentoDias:
      number | null
    frete:
      string | null
    regiao:
      string | null
    tipoComissao:
      string | null
    percentualComissao:
      number | null
    faixasComissao:
      string | null
    reconhecimentoComissao:
      string | null
    fechamentoComissao:
      string | null
    pagamentoComissao:
      string | null
    observacoes:
      string | null
    criadoEm: Date
    atualizadoEm: Date
  }
) {
  return {
    id:
      regra.id,

    representadaId:
      regra.representadaId,

    clienteId:
      regra.clienteId,

    contratoId:
      regra.contratoId,

    nome:
      regra.nome,

    tipoEscopo:
      regra.tipoEscopo,

    vigenciaInicio:
      regra.vigenciaInicio.toISOString(),

    vigenciaFim:
      regra.vigenciaFim
        ?.toISOString() ??
      null,

    ativa:
      regra.ativa,

    pedidoMinimo:
      regra.pedidoMinimo,

    minimoParcela:
      regra.minimoParcela,

    prazoEntregaDias:
      regra.prazoEntregaDias,

    prazoFaturamentoDias:
      regra.prazoFaturamentoDias,

    frete:
      regra.frete,

    regiao:
      regra.regiao,

    tipoComissao:
      regra.tipoComissao,

    percentualComissao:
      regra.percentualComissao,

    faixasComissao:
      regra.faixasComissao,

    reconhecimentoComissao:
      regra.reconhecimentoComissao,

    fechamentoComissao:
      regra.fechamentoComissao,

    pagamentoComissao:
      regra.pagamentoComissao,

    observacoes:
      regra.observacoes,

    criadoEm:
      regra.criadoEm.toISOString(),

    atualizadoEm:
      regra.atualizadoEm.toISOString(),
  }
}

export async function GET(
  _request: NextRequest,
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
     * A ficha individual contém
     * informações financeiras internas.
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

    const regra =
      await prisma.regraComercialRepresentada.findFirst(
        {
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
                id:
                  true,

                codigo:
                  true,

                razaoSocial:
                  true,

                nomeFantasia:
                  true,

                cnpj:
                  true,

                status:
                  true,
              },
            },

            contrato: {
              select: {
                id:
                  true,

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
                id:
                  true,

                numeroPedido:
                  true,

                numeroPedidoInterno:
                  true,

                data:
                  true,

                valorTotal:
                  true,

                status:
                  true,
              },

              orderBy: {
                data:
                  "desc",
              },
            },

            _count: {
              select: {
                vendas:
                  true,
              },
            },
          },
        }
      )

    if (
      !regra
    ) {
      return NextResponse.json(
        {
          message:
            "Regra comercial não encontrada para esta representada.",
        },
        {
          status:
            404,
        }
      )
    }

    return NextResponse.json(
      regra,
      {
        status:
          200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (
    error
  ) {
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
          status:
            401,
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
        status:
          500,
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

    const recebido:
      unknown =
      await request.json()

    if (
      !recebido ||
      typeof recebido !==
        "object" ||
      Array.isArray(
        recebido
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Dados da política comercial são inválidos.",
        },
        {
          status:
            400,
        }
      )
    }

    const body =
      recebido as Record<
        string,
        unknown
      >

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
          status:
            404,
        }
      )
    }

    /*
     * AÇÃO CONTROLADA:
     * ENCERRAR VIGÊNCIA
     *
     * Uma política que já foi utilizada em Venda
     * continua imutável comercialmente.
     *
     * Entretanto, precisamos conseguir informar
     * quando essa versão deixou de valer, para que
     * uma nova versão possa começar sem destruir
     * o histórico anterior.
     */
    if (
      body.acao ===
      "ENCERRAR_VIGENCIA"
    ) {
      let novaVigenciaFim:
        Date

      try {
        novaVigenciaFim =
          parseDataObrigatoria(
            body.vigenciaFim
          )
      } catch {
        return NextResponse.json(
          {
            message:
              "Informe uma data final válida para encerrar a vigência desta política.",
          },
          {
            status:
              400,
          }
        )
      }

      if (
        novaVigenciaFim <
        regraAtual.vigenciaInicio
      ) {
        return NextResponse.json(
          {
            message:
              "A data final da vigência não pode ser anterior ao início da política.",
          },
          {
            status:
              400,
          }
        )
      }

      const ultimaVenda =
        regraAtual.vendas[0] ??
        null

      if (
        ultimaVenda &&
        ultimaVenda.data >
          novaVigenciaFim
      ) {
        return NextResponse.json(
          {
            message:
              "A vigência não pode ser encerrada antes da última Venda que utilizou esta política.",
          },
          {
            status:
              409,
          }
        )
      }

      const resultado =
        await prisma.$transaction(
          async (
            tx
          ) => {
            const conflito =
              await tx.regraComercialRepresentada.findFirst(
                {
                  where: {
                    id: {
                      not:
                        regraAtual.id,
                    },

                    representadaId:
                      regraAtual.representadaId,

                    clienteId:
                      null,

                    tipoEscopo:
                      "Padrao",

                    ativa:
                      true,

                    vigenciaInicio: {
                      lte:
                        novaVigenciaFim,
                    },

                    AND: [
                      {
                        OR: [
                          {
                            vigenciaFim:
                              null,
                          },
                          {
                            vigenciaFim:
                              {
                                gte:
                                  regraAtual.vigenciaInicio,
                              },
                          },
                        ],
                      },
                    ],
                  },

                  select: {
                    id:
                      true,
                  },
                }
              )

            if (
              conflito
            ) {
              throw new Error(
                "POLITICA_VIGENCIA_CONFLITANTE"
              )
            }

            const alterado =
              await tx.regraComercialRepresentada.updateMany(
                {
                  where: {
                    id:
                      regraAtual.id,

                    representadaId,

                    atualizadoEm:
                      regraAtual.atualizadoEm,
                  },

                  data: {
                    vigenciaFim:
                      novaVigenciaFim,
                  },
                }
              )

            if (
              alterado.count !==
              1
            ) {
              throw new Error(
                "REGRA_ALTERADA"
              )
            }

            const atualizada =
              await tx.regraComercialRepresentada.findUniqueOrThrow(
                {
                  where: {
                    id:
                      regraAtual.id,
                  },

                  include: {
                    cliente: {
                      select: {
                        id:
                          true,

                        codigo:
                          true,

                        razaoSocial:
                          true,

                        nomeFantasia:
                          true,
                      },
                    },

                    contrato: {
                      select: {
                        id:
                          true,

                        tipoFormalizacao:
                          true,

                        vigente:
                          true,
                      },
                    },

                    _count: {
                      select: {
                        vendas:
                          true,
                      },
                    },
                  },
                }
              )

            await tx.auditoria.create(
              {
                data: {
                  escritorioId:
                    sessao.escritorioId,

                  usuarioId:
                    sessao.usuarioId,

                  entidade:
                    "RegraComercialRepresentada",

                  entidadeId:
                    regraAtual.id,

                  acao:
                    "ENCERRAMENTO_VIGENCIA_POLITICA_COMERCIAL",

                  dadosAntes:
                    snapshotRegra(
                      regraAtual
                    ),

                  dadosDepois:
                    snapshotRegra(
                      atualizada
                    ),
                },
              }
            )

            return atualizada
          },
          {
            isolationLevel:
              Prisma
                .TransactionIsolationLevel
                .Serializable,
          }
        )

      return NextResponse.json(
        {
          message:
            "Vigência da política comercial encerrada com histórico preservado.",

          data:
            resultado,
        },
        {
          status:
            200,
        }
      )
    }

    if (
      body.acao !==
      undefined
    ) {
      return NextResponse.json(
        {
          message:
            "Ação desconhecida para a política comercial.",
        },
        {
          status:
            400,
        }
      )
    }

    /*
     * Política já aplicada em Venda não pode
     * ter comissão, faixas, escopo ou demais
     * condições comerciais reescritas.
     */
    if (
      regraAtual._count
        .vendas >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Esta política comercial já foi utilizada em Venda e está congelada para preservar o histórico. Para alterar condições comerciais, encerre sua vigência e cadastre uma nova versão.",
        },
        {
          status:
            409,
        }
      )
    }

    /*
     * Regras específicas por Cliente pertencem
     * ao modelo anterior.
     *
     * Elas permanecem preservadas, mas não podem
     * ser transformadas silenciosamente no novo
     * modelo de política única da Representada.
     */
    if (
      regraAtual.clienteId !==
        null ||
      regraAtual.tipoEscopo !==
        "Padrao"
    ) {
      return NextResponse.json(
        {
          message:
            "Esta é uma regra específica do modelo anterior. Ela foi preservada para não alterar o histórico, mas não pode ser convertida livremente para a nova política da Representada.",
        },
        {
          status:
            409,
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
            "Nome da política comercial é obrigatório.",
        },
        {
          status:
            400,
        }
      )
    }

    const nome =
      body.nome.trim()

    const clienteIdInformado =
      textoOpcional(
        body.clienteId
      )

    const tipoEscopoInformado =
      textoOpcional(
        body.tipoEscopo
      )

    if (
      clienteIdInformado ||
      (
        tipoEscopoInformado !==
          null &&
        tipoEscopoInformado !==
          "Padrao"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "A política da Representada não pode ser convertida em regra livre por Cliente. Condições diferenciadas devem ser cadastradas nas faixas de desconto, comissão e pedido mínimo da própria política variável.",
        },
        {
          status:
            409,
        }
      )
    }

    const clienteId =
      null

    const tipoEscopo =
      "Padrao"

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
            "A vigência da política comercial contém data inválida.",
        },
        {
          status:
            400,
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
          status:
            400,
        }
      )
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

      const contrato =
        await prisma.contratoRepresentada.findFirst(
          {
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
              id:
                true,
            },
          }
        )

      if (
        !contrato
      ) {
        return NextResponse.json(
          {
            message:
              "Contrato informado não pertence a esta representada.",
          },
          {
            status:
              400,
          }
        )
      }

      contratoId =
        contrato.id
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
          status:
            400,
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
          status:
            400,
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
          status:
            400,
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
          status:
            400,
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
          status:
            400,
        }
      )
    }

    const tipoComissao =
      textoOpcional(
        body.tipoComissao
      )

    if (
      tipoComissao !==
        "fixa" &&
      tipoComissao !==
        "variada"
    ) {
      return NextResponse.json(
        {
          message:
            "Toda política comercial precisa definir comissão fixa ou variável.",
        },
        {
          status:
            400,
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
      const percentualValidado =
        parsePercentual(
          percentualComissao
        )

      if (
        percentualValidado ===
          null ||
        percentualValidado <=
          0
      ) {
        return NextResponse.json(
          {
            message:
              "Percentual de comissão fixa deve ser maior que zero e no máximo 100%.",
          },
          {
            status:
              400,
          }
        )
      }

      percentualComissao =
        percentualValidado

      faixasComissao =
        null
    } else {
      try {
        faixasComissao =
          normalizarFaixasComissao(
            body.faixasComissao
          )

        percentualComissao =
          null
      } catch {
        return NextResponse.json(
          {
            message:
              "Faixas de comissão inválidas. Informe desconto de 0% a 100%, comissão maior que 0% e até 100%, sem descontos repetidos. O pedido mínimo da faixa é opcional e, quando informado, deve ser igual ou maior que zero.",
          },
          {
            status:
              400,
          }
        )
      }
    }

    const ativa =
      typeof body.ativa ===
        "boolean"
        ? body.ativa
        : regraAtual.ativa

    const frete =
      textoOpcional(
        body.frete
      )

    const regiao =
      textoOpcional(
        body.regiao
      )

    const reconhecimentoComissao =
      textoOpcional(
        body.reconhecimentoComissao
      )

    const fechamentoComissao =
      textoOpcional(
        body.fechamentoComissao
      )

    const pagamentoComissao =
      textoOpcional(
        body.pagamentoComissao
      )

    const observacoes =
      textoOpcional(
        body.observacoes
      )

    const resultado =
      await prisma.$transaction(
        async (
          tx
        ) => {
          /*
           * Uma política ativa não pode
           * sobrepor outra política Padrão
           * ativa da mesma Representada.
           */
          if (
            ativa
          ) {
            const conflito =
              await tx.regraComercialRepresentada.findFirst(
                {
                  where: {
                    id: {
                      not:
                        regraAtual.id,
                    },

                    representadaId,

                    clienteId:
                      null,

                    tipoEscopo:
                      "Padrao",

                    ativa:
                      true,

                    ...(vigenciaFim
                      ? {
                          vigenciaInicio:
                            {
                              lte:
                                vigenciaFim,
                            },
                        }
                      : {}),

                    AND: [
                      {
                        OR: [
                          {
                            vigenciaFim:
                              null,
                          },
                          {
                            vigenciaFim:
                              {
                                gte:
                                  vigenciaInicio,
                              },
                          },
                        ],
                      },
                    ],
                  },

                  select: {
                    id:
                      true,
                  },
                }
              )

            if (
              conflito
            ) {
              throw new Error(
                "POLITICA_VIGENCIA_CONFLITANTE"
              )
            }
          }

          const alterado =
            await tx.regraComercialRepresentada.updateMany(
              {
                where: {
                  id:
                    regraAtual.id,

                  representadaId,

                  atualizadoEm:
                    regraAtual.atualizadoEm,
                },

                data: {
                  clienteId,

                  contratoId,

                  nome,

                  tipoEscopo,

                  vigenciaInicio,

                  vigenciaFim,

                  ativa,

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

                  frete,

                  regiao,

                  tipoComissao,

                  percentualComissao,

                  faixasComissao,

                  reconhecimentoComissao,

                  fechamentoComissao,

                  pagamentoComissao,

                  observacoes,
                },
              }
            )

          if (
            alterado.count !==
            1
          ) {
            throw new Error(
              "REGRA_ALTERADA"
            )
          }

          const atualizada =
            await tx.regraComercialRepresentada.findUniqueOrThrow(
              {
                where: {
                  id:
                    regraAtual.id,
                },

                include: {
                  cliente: {
                    select: {
                      id:
                        true,

                      codigo:
                        true,

                      razaoSocial:
                        true,

                      nomeFantasia:
                        true,
                    },
                  },

                  contrato: {
                    select: {
                      id:
                        true,

                      tipoFormalizacao:
                        true,

                      vigente:
                        true,
                    },
                  },

                  _count: {
                    select: {
                      vendas:
                        true,
                    },
                  },
                },
              }
            )

          await tx.auditoria.create(
            {
              data: {
                escritorioId:
                  sessao.escritorioId,

                usuarioId:
                  sessao.usuarioId,

                entidade:
                  "RegraComercialRepresentada",

                entidadeId:
                  regraAtual.id,

                acao:
                  "ATUALIZACAO_POLITICA_COMERCIAL",

                dadosAntes:
                  snapshotRegra(
                    regraAtual
                  ),

                dadosDepois: {
                  ...snapshotRegra(
                    atualizada
                  ),

                  modeloComercial: {
                    politicaUnicaDaRepresentada:
                      true,

                    faixaVariavelComPedidoMinimo:
                      true,

                    descontoAutomatico:
                      false,
                  },
                },
              },
            }
          )

          return atualizada
        },
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      )

    return NextResponse.json(
      {
        message:
          "Política comercial atualizada com sucesso.",

        data:
          resultado,
      },
      {
        status:
          200,
      }
    )
  } catch (
    error
  ) {
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
          status:
            401,
        }
      )
    }

    if (
      error instanceof
        Error &&
      error.message ===
        "POLITICA_VIGENCIA_CONFLITANTE"
    ) {
      return NextResponse.json(
        {
          message:
            "Conflito cadastral: existe outra política comercial Padrão ativa com vigência sobreposta para esta Representada.",
        },
        {
          status:
            409,
        }
      )
    }

    if (
      error instanceof
        Error &&
      error.message ===
        "REGRA_ALTERADA"
    ) {
      return NextResponse.json(
        {
          message:
            "A política comercial foi alterada por outra operação. Atualize a página antes de continuar.",
        },
        {
          status:
            409,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2034"
    ) {
      return NextResponse.json(
        {
          message:
            "A política comercial sofreu uma alteração simultânea. Atualize a página e tente novamente.",
        },
        {
          status:
            409,
        }
      )
    }

    console.error(
      "Erro ao atualizar política comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar política comercial.",
      },
      {
        status:
          500,
      }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const regra =
      await buscarRegraDoEscritorio(
        representadaId,
        regraId,
        sessao.escritorioId
      )

    if (
      !regra
    ) {
      return NextResponse.json(
        {
          message:
            "Regra comercial não encontrada para esta representada.",
        },
        {
          status:
            404,
        }
      )
    }

    /*
     * Política utilizada em Venda integra
     * o histórico comercial e nunca pode
     * ser apagada fisicamente.
     */
    if (
      regra._count
        .vendas >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Esta política comercial já foi utilizada em Venda e não pode ser excluída. Encerre sua vigência e preserve a versão histórica.",
        },
        {
          status:
            409,
        }
      )
    }

    /*
     * Não permitimos exclusão física de uma
     * política que ainda esteja ativa.
     *
     * Isso evita deixar a Representada sem
     * política por um clique acidental.
     */
    if (
      regra.ativa
    ) {
      return NextResponse.json(
        {
          message:
            "Uma política comercial ativa não pode ser excluída. Desative-a de forma controlada antes de qualquer exclusão.",
        },
        {
          status:
            409,
        }
      )
    }

    await prisma.$transaction(
      async (
        tx
      ) => {
        const excluida =
          await tx.regraComercialRepresentada.deleteMany(
            {
              where: {
                id:
                  regra.id,

                representadaId,

                atualizadoEm:
                  regra.atualizadoEm,
              },
            }
          )

        if (
          excluida.count !==
          1
        ) {
          throw new Error(
            "REGRA_ALTERADA"
          )
        }

        await tx.auditoria.create(
          {
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "RegraComercialRepresentada",

              entidadeId:
                regra.id,

              acao:
                "EXCLUSAO_POLITICA_COMERCIAL_NAO_UTILIZADA",

              dadosAntes:
                snapshotRegra(
                  regra
                ),

              dadosDepois: {
                excluida:
                  true,

                excluidaEm:
                  new Date().toISOString(),
              },
            },
          }
        )
      },
      {
        isolationLevel:
          Prisma
            .TransactionIsolationLevel
            .Serializable,
      }
    )

    return NextResponse.json(
      {
        message:
          "Política comercial inativa e não utilizada excluída com auditoria registrada.",
      },
      {
        status:
          200,
      }
    )
  } catch (
    error
  ) {
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
          status:
            401,
        }
      )
    }

    if (
      error instanceof
        Error &&
      error.message ===
        "REGRA_ALTERADA"
    ) {
      return NextResponse.json(
        {
          message:
            "A política comercial foi alterada por outra operação. Atualize a página antes de continuar.",
        },
        {
          status:
            409,
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
            "Esta política comercial possui registros vinculados e não pode ser excluída.",
        },
        {
          status:
            409,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2034"
    ) {
      return NextResponse.json(
        {
          message:
            "A política comercial sofreu uma alteração simultânea. Atualize a página e tente novamente.",
        },
        {
          status:
            409,
        }
      )
    }

    console.error(
      "Erro ao excluir política comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir política comercial.",
      },
      {
        status:
          500,
      }
    )
  }
}