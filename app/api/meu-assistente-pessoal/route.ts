import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

type PrioridadeAssistente =
  | "critica"
  | "alta"
  | "normal"
  | "informativa"

type ModuloAssistente =
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "titulos"
  | "faturamentos"
  | "comissoes"
  | "redes-sociais"

type SituacaoTemporal =
  | "atrasado"
  | "hoje"
  | "proximos"
  | "futuro"
  | "sem-data"

type PendenciaAssistente = {
  id: string

  modulo: ModuloAssistente

  entidadeId: string

  codigo: string | null

  titulo: string

  descricao: string

  relacionadoA: string | null

  responsavel: string | null

  dataReferencia: string | null

  situacaoTemporal: SituacaoTemporal

  prioridade: PrioridadeAssistente

  status: string | null

  href: string

  origem: string | null
}

function inicioDoDia(
  data: Date
) {
  const copia =
    new Date(data)

  copia.setHours(
    0,
    0,
    0,
    0
  )

  return copia
}

function adicionarDias(
  data: Date,
  quantidade: number
) {
  const copia =
    new Date(data)

  copia.setDate(
    copia.getDate() +
      quantidade
  )

  return copia
}

function classificarData(
  data: Date | null
): SituacaoTemporal {
  if (!data) {
    return "sem-data"
  }

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "sem-data"
  }

  const hoje =
    inicioDoDia(
      new Date()
    )

  const referencia =
    inicioDoDia(
      data
    )

  const amanha =
    adicionarDias(
      hoje,
      1
    )

  const seteDias =
    adicionarDias(
      hoje,
      7
    )

  if (
    referencia.getTime() <
    hoje.getTime()
  ) {
    return "atrasado"
  }

  if (
    referencia.getTime() ===
    hoje.getTime()
  ) {
    return "hoje"
  }

  if (
    referencia.getTime() >=
      amanha.getTime() &&
    referencia.getTime() <=
      seteDias.getTime()
  ) {
    return "proximos"
  }

  return "futuro"
}

function prioridadePorSituacao(
  situacao: SituacaoTemporal
): PrioridadeAssistente {
  if (
    situacao ===
    "atrasado"
  ) {
    return "critica"
  }

  if (
    situacao ===
      "hoje" ||
    situacao ===
      "proximos"
  ) {
    return "alta"
  }

  if (
    situacao ===
    "sem-data"
  ) {
    return "normal"
  }

  return "informativa"
}

function codigoInteracao(
  numero: number
) {
  return `INT-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function codigoOrcamento(
  numero: number
) {
  return `ORC-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function codigoVenda(
  numero: number
) {
  return `VEN-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function codigoTitulo(
  numero: number
) {
  return `TIT-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function nomeCliente(
  cliente:
    | {
        razaoSocial: string
        nomeFantasia:
          | string
          | null
      }
    | null
) {
  if (!cliente) {
    return null
  }

  return (
    cliente.nomeFantasia ||
    cliente.razaoSocial
  )
}

function nomeResponsavel(
  responsavel:
    | {
        nome: string
      }
    | null,
  criadoPor:
    | {
        nome: string
      }
    | null
) {
  return (
    responsavel?.nome ||
    criadoPor?.nome ||
    null
  )
}

function ehStatusFinalVenda(
  status: string
) {
  const normalizado =
    status
      .trim()
      .toLowerCase()

  return [
    "cancelado",
    "cancelada",
    "finalizado",
    "finalizada",
    "concluido",
    "concluído",
    "concluida",
    "concluída",
    "faturado",
    "faturada",
  ].includes(
    normalizado
  )
}

function ehTituloQuitado(
  status: string,
  pagoEm: Date | null
) {
  if (pagoEm) {
    return true
  }

  const normalizado =
    status
      .trim()
      .toLowerCase()

  return [
    "pago",
    "paga",
    "quitado",
    "quitada",
    "liquidado",
    "liquidada",
    "baixado",
    "baixada",
  ].includes(
    normalizado
  )
}

function ehAlertaCritico(
  pendencia: PendenciaAssistente
) {
  /*
   * Interações e Prospecções podem ser urgentes
   * dentro do Assistente, mas não interrompem
   * globalmente o usuário nesta primeira versão.
   */
  if (
    pendencia.modulo ===
    "interacoes"
  ) {
    return false
  }

  /*
   * Orçamento vencido.
   */
  if (
    pendencia.modulo ===
      "orcamentos" &&
    pendencia.status ===
      "Vencido"
  ) {
    return true
  }

  /*
   * Venda aprovada ainda aguardando envio
   * para a Representada.
   */
  if (
    pendencia.modulo ===
      "vendas" &&
    pendencia.titulo ===
      "Venda aguardando envio"
  ) {
    return true
  }

  /*
   * Aguardar confirmação da Representada
   * é importante, mas ainda não é alerta
   * global crítico sem um prazo objetivo
   * máximo definido.
   */
  if (
    pendencia.modulo ===
      "vendas" &&
    pendencia.titulo ===
      "Venda aguardando confirmação da Representada"
  ) {
    return false
  }

  /*
   * Previsão de faturamento já ultrapassada.
   */
  if (
    pendencia.modulo ===
      "vendas" &&
    pendencia.titulo ===
      "Previsão de faturamento vencida"
  ) {
    return true
  }

  /*
   * Título vencido e ainda não quitado.
   */
  if (
    pendencia.modulo ===
      "titulos" &&
    pendencia.situacaoTemporal ===
      "atrasado"
  ) {
    return true
  }

  return false
}

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    /*
     * REGRA DO ASSISTENTE
     *
     * Diretor:
     * visão consolidada de todo o escritório.
     *
     * Administrativo e Preposto:
     * visão das demandas atribuídas ao próprio usuário.
     *
     * Esta regra afeta somente o Assistente.
     * Não altera permissões dos módulos originais.
     */
    const visaoEscritorio =
      sessao.perfil ===
      "Diretor"

    const filtroResponsabilidade =
      visaoEscritorio
        ? {}
        : {
            OR: [
              {
                responsavelId:
                  sessao.usuarioId,
              },

              {
                AND: [
                  {
                    responsavelId:
                      null,
                  },

                  {
                    criadoPorId:
                      sessao.usuarioId,
                  },
                ],
              },
            ],
          }

    const filtroResponsabilidadeOrcamento =
      visaoEscritorio
        ? {}
        : {
            responsavelId:
              sessao.usuarioId,
          }

    const [
      interacoes,
      orcamentos,
      vendas,
    ] =
      await Promise.all([
        prisma.interacao.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,

            statusFollowUp: {
              not:
                "Finalizado",
            },

            ...filtroResponsabilidade,
          },

          select: {
            id: true,

            numeroSequencial:
              true,

            tipo: true,

            assunto: true,

            descricao: true,

            resultado: true,

            proximosPasso:
              true,

            proximoContatoEm:
              true,

            statusFollowUp:
              true,

            nomeProspect:
              true,

            empresaProspect:
              true,

            origemProspeccao:
              true,

            cliente: {
              select: {
                razaoSocial:
                  true,

                nomeFantasia:
                  true,
              },
            },

            representada: {
              select: {
                nome: true,
              },
            },

            responsavel: {
              select: {
                nome: true,
              },
            },

            criadoPor: {
              select: {
                nome: true,
              },
            },
          },
        }),

        prisma.orcamento.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,

            ...filtroResponsabilidadeOrcamento,

            status: {
              in: [
                "Pendente",
                "Vencido",
              ],
            },
          },

          select: {
            id: true,

            numeroSequencial:
              true,

            validadeEm:
              true,

            valorTotal:
              true,

            status: true,

            enviadoEm: true,

            cliente: {
              select: {
                razaoSocial:
                  true,

                nomeFantasia:
                  true,
              },
            },

            representada: {
              select: {
                nome: true,
              },
            },

            responsavel: {
              select: {
                nome: true,
              },
            },

            criadoPor: {
              select: {
                nome: true,
              },
            },
          },
        }),

        prisma.venda.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,

            ...filtroResponsabilidade,
          },

          select: {
            id: true,

            numeroSequencial:
              true,

            status: true,

            previsaoFaturamento:
              true,

            pedidoEnviadoEm:
              true,

            confirmadoEm:
              true,

            numeroPedidoRepresentada:
              true,

            cliente: {
              select: {
                razaoSocial:
                  true,

                nomeFantasia:
                  true,
              },
            },

            representada: {
              select: {
                nome: true,
              },
            },

            responsavel: {
              select: {
                nome: true,
              },
            },

            criadoPor: {
              select: {
                nome: true,
              },
            },
          },
        }),
      ])

    const pendencias:
      PendenciaAssistente[] =
      []

    /*
     * ==================================================
     * INTERAÇÕES / PROSPECÇÕES
     * ==================================================
     */
    for (
      const interacao of
      interacoes
    ) {
      const situacao =
        classificarData(
          interacao.proximoContatoEm
        )

      const ehProspeccao =
        Boolean(
          interacao.nomeProspect ||
            interacao.empresaProspect ||
            interacao.origemProspeccao
        )

      const relacionamento =
        nomeCliente(
          interacao.cliente
        ) ||
        interacao.representada
          ?.nome ||
        interacao.empresaProspect ||
        interacao.nomeProspect ||
        null

      const descricao =
        interacao.proximosPasso?.trim() ||
        interacao.resultado?.trim() ||
        interacao.descricao?.trim() ||
        "Interação ainda não finalizada."

      pendencias.push({
        id:
          `interacao-${interacao.id}`,

        modulo:
          "interacoes",

        entidadeId:
          interacao.id,

        codigo:
          codigoInteracao(
            interacao.numeroSequencial
          ),

        titulo:
          interacao.assunto ||
          (ehProspeccao
            ? "Prospecção pendente"
            : "Interação pendente"),

        descricao,

        relacionadoA:
          relacionamento,

        responsavel:
          nomeResponsavel(
            interacao.responsavel,
            interacao.criadoPor
          ),

        dataReferencia:
          interacao.proximoContatoEm
            ? interacao.proximoContatoEm.toISOString()
            : null,

        situacaoTemporal:
          situacao,

        prioridade:
          prioridadePorSituacao(
            situacao
          ),

        status:
          interacao.statusFollowUp,

        href:
          `/interacoes/${interacao.id}`,

        origem:
          ehProspeccao
            ? interacao.origemProspeccao
            : interacao.tipo,
      })
    }

    /*
     * ==================================================
     * ORÇAMENTOS
     * ==================================================
     */
    for (
      const orcamento of
      orcamentos
    ) {
      const situacao =
        classificarData(
          orcamento.validadeEm
        )

      const cliente =
        nomeCliente(
          orcamento.cliente
        )

      const representada =
        orcamento.representada
          ?.nome ||
        null

      const partes =
        [
          cliente,
          representada,
        ].filter(
          Boolean
        )

      let descricao =
        "Orçamento pendente de definição."

      if (
        orcamento.status ===
        "Vencido"
      ) {
        descricao =
          "O prazo de validade deste orçamento foi ultrapassado sem definição comercial."
      } else if (
        !orcamento.enviadoEm
      ) {
        descricao =
          "Orçamento ainda não possui registro de envio ao cliente."
      } else {
        descricao =
          "Orçamento enviado e ainda pendente de aprovação, recusa ou encerramento."
      }

      pendencias.push({
        id:
          `orcamento-${orcamento.id}`,

        modulo:
          "orcamentos",

        entidadeId:
          orcamento.id,

        codigo:
          codigoOrcamento(
            orcamento.numeroSequencial
          ),

        titulo:
          orcamento.status ===
          "Vencido"
            ? "Orçamento vencido"
            : "Orçamento pendente",

        descricao,

        relacionadoA:
          partes.length > 0
            ? partes.join(
                " • "
              )
            : null,

        responsavel:
          nomeResponsavel(
            orcamento.responsavel,
            orcamento.criadoPor
          ),

        dataReferencia:
          orcamento.validadeEm.toISOString(),

        situacaoTemporal:
          situacao,

        prioridade:
          orcamento.status ===
          "Vencido"
            ? "critica"
            : prioridadePorSituacao(
                situacao
              ),

        status:
          orcamento.status,

        href:
          `/orcamentos/${orcamento.id}`,

        origem:
          "Orçamento",
      })
    }

    /*
     * ==================================================
     * VENDAS
     * ==================================================
     */
    const vendasAtivas =
      vendas.filter(
        (
          venda
        ) =>
          !ehStatusFinalVenda(
            venda.status
          )
      )

    for (
      const venda of
      vendasAtivas
    ) {
      const cliente =
        nomeCliente(
          venda.cliente
        )

      const representada =
        venda.representada
          ?.nome ||
        null

      const relacionados =
        [
          cliente,
          representada,
        ].filter(
          Boolean
        )

      const responsavel =
        nomeResponsavel(
          venda.responsavel,
          venda.criadoPor
        )

      const statusNormalizado =
        venda.status
          .trim()
          .toLowerCase()

      /*
       * VENDA AGUARDANDO ENVIO
       *
       * O Orçamento já foi aprovado,
       * mas o pedido ainda precisa
       * ser enviado à Representada.
       */
      if (
        statusNormalizado ===
        "aguardando envio"
      ) {
        pendencias.push({
          id:
            `venda-envio-${venda.id}`,

          modulo:
            "vendas",

          entidadeId:
            venda.id,

          codigo:
            codigoVenda(
              venda.numeroSequencial
            ),

          titulo:
            "Venda aguardando envio",

          descricao:
            "O orçamento foi aprovado e a Venda ainda precisa ser enviada à Representada.",

          relacionadoA:
            relacionados.length >
            0
              ? relacionados.join(
                  " • "
                )
              : null,

          responsavel,

          dataReferencia:
            null,

          situacaoTemporal:
            "sem-data",

          prioridade:
            "alta",

          status:
            venda.status,

          href:
            `/vendas/${venda.id}`,

          origem:
            "Venda",
        })
      }

      /*
       * VENDA AGUARDANDO CONFIRMAÇÃO
       *
       * O Pedido já foi enviado oficialmente
       * para a Representada, porém o recebimento
       * ainda não foi confirmado.
       *
       * Esta etapa não pode depender da memória
       * do usuário.
       */
      if (
        statusNormalizado ===
        "aguardando confirmação" &&
        venda.pedidoEnviadoEm &&
        !venda.confirmadoEm
      ) {
        pendencias.push({
          id:
            `venda-confirmacao-${venda.id}`,

          modulo:
            "vendas",

          entidadeId:
            venda.id,

          codigo:
            codigoVenda(
              venda.numeroSequencial
            ),

          titulo:
            "Venda aguardando confirmação da Representada",

          descricao:
            "O pedido já foi enviado à Representada, mas o recebimento ainda não foi confirmado.",

          relacionadoA:
            relacionados.length >
            0
              ? relacionados.join(
                  " • "
                )
              : null,

          responsavel,

          dataReferencia:
            venda.pedidoEnviadoEm.toISOString(),

          situacaoTemporal:
            "sem-data",

          prioridade:
            "alta",

          status:
            venda.status,

          href:
            `/vendas/${venda.id}`,

          origem:
            "Pedido enviado",
        })
      }

      /*
       * PREVISÃO DE FATURAMENTO
       *
       * Quando existe uma data objetiva,
       * o Assistente passa a acompanhar
       * o compromisso operacional.
       */
      if (
        venda.previsaoFaturamento
      ) {
        const situacao =
          classificarData(
            venda.previsaoFaturamento
          )

        pendencias.push({
          id:
            `venda-faturamento-${venda.id}`,

          modulo:
            "vendas",

          entidadeId:
            venda.id,

          codigo:
            codigoVenda(
              venda.numeroSequencial
            ),

          titulo:
            situacao ===
            "atrasado"
              ? "Previsão de faturamento vencida"
              : "Previsão de faturamento",

          descricao:
            "A Venda possui previsão de faturamento registrada e ainda exige acompanhamento operacional.",

          relacionadoA:
            relacionados.length >
            0
              ? relacionados.join(
                  " • "
                )
              : null,

          responsavel,

          dataReferencia:
            venda.previsaoFaturamento.toISOString(),

          situacaoTemporal:
            situacao,

          prioridade:
            prioridadePorSituacao(
              situacao
            ),

          status:
            venda.status,

          href:
            `/vendas/${venda.id}`,

          origem:
            "Venda",
        })
      }
    }

    /*
     * ==================================================
     * TÍTULOS
     * ==================================================
     *
     * O Título não possui escritório ou responsável
     * diretamente.
     *
     * A responsabilidade é obtida pela Venda.
     */
    const titulos =
      await prisma.tituloVenda.findMany({
        where: {
          faturamento: {
            is: {
              venda: {
                is: {
                  escritorioId:
                    sessao.escritorioId,

                  ...(visaoEscritorio
                    ? {}
                    : {
                        OR: [
                          {
                            responsavelId:
                              sessao.usuarioId,
                          },

                          {
                            AND: [
                              {
                                responsavelId:
                                  null,
                              },

                              {
                                criadoPorId:
                                  sessao.usuarioId,
                              },
                            ],
                          },
                        ],
                      }),
                },
              },
            },
          },
        },

        select: {
          id: true,

          numeroSequencial:
            true,

          numeroTituloExterno:
            true,

          vencimento:
            true,

          prorrogadoPara:
            true,

          valor: true,

          status: true,

          pagoEm: true,

          faturamento: {
            select: {
              venda: {
                select: {
                  id: true,

                  cliente: {
                    select: {
                      razaoSocial:
                        true,

                      nomeFantasia:
                        true,
                    },
                  },

                  representada: {
                    select: {
                      nome: true,
                    },
                  },

                  responsavel: {
                    select: {
                      nome: true,
                    },
                  },

                  criadoPor: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

    for (
      const titulo of
      titulos
    ) {
      if (
        ehTituloQuitado(
          titulo.status,
          titulo.pagoEm
        )
      ) {
        continue
      }

      const vencimentoEfetivo =
        titulo.prorrogadoPara ||
        titulo.vencimento

      const situacao =
        classificarData(
          vencimentoEfetivo
        )

      /*
       * Títulos muito distantes ficam fora
       * da rotina diária do Assistente.
       */
      if (
        situacao ===
        "futuro"
      ) {
        continue
      }

      const cliente =
        nomeCliente(
          titulo.faturamento
            .venda.cliente
        )

      const representada =
        titulo.faturamento
          .venda.representada
          ?.nome ||
        null

      const relacionados =
        [
          cliente,
          representada,
        ].filter(
          Boolean
        )

      const responsavel =
        nomeResponsavel(
          titulo.faturamento
            .venda.responsavel,
          titulo.faturamento
            .venda.criadoPor
        )

      pendencias.push({
        id:
          `titulo-${titulo.id}`,

        modulo:
          "titulos",

        entidadeId:
          titulo.id,

        codigo:
          codigoTitulo(
            titulo.numeroSequencial
          ),

        titulo:
          situacao ===
          "atrasado"
            ? "Título vencido"
            : situacao ===
                "hoje"
              ? "Título vence hoje"
              : "Título próximo do vencimento",

        descricao:
          titulo.numeroTituloExterno
            ? `Título externo ${titulo.numeroTituloExterno} ainda não consta como quitado.`
            : "Título ainda não consta como quitado.",

        relacionadoA:
          relacionados.length >
          0
            ? relacionados.join(
                " • "
              )
            : null,

        responsavel,

        dataReferencia:
          vencimentoEfetivo.toISOString(),

        situacaoTemporal:
          situacao,

        prioridade:
          prioridadePorSituacao(
            situacao
          ),

        status:
          titulo.status,

        href:
          "/titulos",

        origem:
          titulo.prorrogadoPara
            ? "Título prorrogado"
            : "Título",
      })
    }

    /*
     * ==================================================
     * ORDENAÇÃO
     * ==================================================
     *
     * 1. atrasados
     * 2. hoje
     * 3. próximos
     * 4. sem data
     * 5. futuros
     */
    const pesoSituacao:
      Record<
        SituacaoTemporal,
        number
      > = {
        atrasado: 0,
        hoje: 1,
        proximos: 2,
        "sem-data": 3,
        futuro: 4,
      }

    pendencias.sort(
      (
        a,
        b
      ) => {
        const diferenca =
          pesoSituacao[
            a.situacaoTemporal
          ] -
          pesoSituacao[
            b.situacaoTemporal
          ]

        if (
          diferenca !==
          0
        ) {
          return diferenca
        }

        if (
          a.dataReferencia &&
          b.dataReferencia
        ) {
          return (
            new Date(
              a.dataReferencia
            ).getTime() -
            new Date(
              b.dataReferencia
            ).getTime()
          )
        }

        if (
          a.dataReferencia
        ) {
          return -1
        }

        if (
          b.dataReferencia
        ) {
          return 1
        }

        return (
          a.titulo.localeCompare(
            b.titulo,
            "pt-BR"
          )
        )
      }
    )

    /*
     * ==================================================
     * ALERTAS CRÍTICOS GLOBAIS
     * ==================================================
     */
    const alertasCriticos =
      pendencias.filter(
        ehAlertaCritico
      )

    /*
     * ==================================================
     * CONTADORES
     * ==================================================
     */
    const contadores = {
      total:
        pendencias.length,

      atrasados:
        pendencias.filter(
          (
            item
          ) =>
            item.situacaoTemporal ===
            "atrasado"
        ).length,

      hoje:
        pendencias.filter(
          (
            item
          ) =>
            item.situacaoTemporal ===
            "hoje"
        ).length,

      proximos:
        pendencias.filter(
          (
            item
          ) =>
            item.situacaoTemporal ===
            "proximos"
        ).length,

      semData:
        pendencias.filter(
          (
            item
          ) =>
            item.situacaoTemporal ===
            "sem-data"
        ).length,

      futuros:
        pendencias.filter(
          (
            item
          ) =>
            item.situacaoTemporal ===
            "futuro"
        ).length,

      alertasCriticos:
        alertasCriticos.length,
    }

    /*
     * ==================================================
     * MÓDULOS
     * ==================================================
     */
    const modulos = {
      interacoes: {
        ativo: true,

        quantidade:
          pendencias.filter(
            (
              item
            ) =>
              item.modulo ===
              "interacoes"
          ).length,
      },

      orcamentos: {
        ativo: true,

        quantidade:
          pendencias.filter(
            (
              item
            ) =>
              item.modulo ===
              "orcamentos"
          ).length,
      },

      vendas: {
        ativo: true,

        quantidade:
          pendencias.filter(
            (
              item
            ) =>
              item.modulo ===
              "vendas"
          ).length,
      },

      faturamentos: {
        ativo: true,

        quantidade:
          pendencias.filter(
            (
              item
            ) =>
              item.modulo ===
              "faturamentos"
          ).length,

        observacao:
          "Nesta etapa, o acompanhamento de faturamento é realizado pelas previsões da Venda e pelos Títulos gerados.",
      },

      titulos: {
        ativo: true,

        quantidade:
          pendencias.filter(
            (
              item
            ) =>
              item.modulo ===
              "titulos"
          ).length,
      },

      comissoes: {
        ativo: false,

        quantidade: 0,

        observacao:
          "Integração preparada. Alertas serão ativados após consolidação das regras operacionais de comissão.",
      },

      redesSociais: {
        ativo: false,

        quantidade: 0,

        observacao:
          "Integração preparada. Métricas simuladas existentes não são utilizadas como dados reais. Prospecções com origem Instagram já entram pelo módulo de Interações.",
      },
    }

    return NextResponse.json({
      usuario: {
        id:
          sessao.usuarioId,

        perfil:
          sessao.perfil,
      },

      escopo:
        visaoEscritorio
          ? "escritorio"
          : "pessoal",

      geradoEm:
        new Date().toISOString(),

      contadores,

      modulos,

      pendencias,

      alertasCriticos,
    })
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
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao montar Meu Assistente Pessoal:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao carregar o Meu Assistente Pessoal.",
      },
      {
        status: 500,
      }
    )
  }
}