import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

const PRAZO_PADRAO_ORCAMENTO_DIAS = 7

function textoOpcional(valor: unknown) {
  if (typeof valor !== "string") {
    return null
  }

  const texto = valor.trim()

  return texto === ""
    ? null
    : texto
}

function numeroPositivo(valor: unknown) {
  if (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor > 0
  ) {
    return valor
  }

  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  let texto = valor.trim()

  /*
   * Aceita entradas como:
   * 1250
   * 1250.50
   * 1.250,50
   * 1250,50
   */
  if (
    texto.includes(",")
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".")
  }

  const numero = Number(texto)

  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    return null
  }

  return numero
}

function adicionarDiasCorridos(
  data: Date,
  dias: number
) {
  const resultado =
    new Date(data)

  resultado.setDate(
    resultado.getDate() +
      dias
  )

  return resultado
}

function filtroCarteiraPreposto(
  escritorioId: string,
  usuarioId: string
) {
  return {
    cliente: {
      is: {
        escritorioId,

        OR: [
          {
            responsavelPrincipalId:
              usuarioId,
          },

          {
            participantes: {
              some: {
                usuarioId,
                ativa: true,
              },
            },
          },
        ],
      },
    },
  }
}

type SnapshotOrcamento = {
  id: string
  numeroSequencial: number
  escritorioId: string
  interacaoOrigemId: string | null
  clienteId: string
  representadaId: string
  criadoPorId: string | null
  responsavelId: string | null
  data: Date
  validadeEm: Date
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  status: string
  enviadoEm: Date | null
  finalizadoEm: Date | null
  motivoFinalizacao: string | null
  arquivoUrl: string | null
  observacoes: string | null
  criadoEm: Date
  atualizadoEm: Date
}

function snapshotOrcamento(
  orcamento: SnapshotOrcamento
) {
  return {
    id:
      orcamento.id,

    numeroSequencial:
      orcamento.numeroSequencial,

    escritorioId:
      orcamento.escritorioId,

    interacaoOrigemId:
      orcamento.interacaoOrigemId,

    clienteId:
      orcamento.clienteId,

    representadaId:
      orcamento.representadaId,

    criadoPorId:
      orcamento.criadoPorId,

    responsavelId:
      orcamento.responsavelId,

    data:
      orcamento.data.toISOString(),

    validadeEm:
      orcamento.validadeEm.toISOString(),

    valorTotal:
      orcamento.valorTotal,

    condicaoPagamento:
      orcamento.condicaoPagamento,

    descricao:
      orcamento.descricao,

    status:
      orcamento.status,

    enviadoEm:
      orcamento.enviadoEm
        ? orcamento.enviadoEm.toISOString()
        : null,

    finalizadoEm:
      orcamento.finalizadoEm
        ? orcamento.finalizadoEm.toISOString()
        : null,

    motivoFinalizacao:
      orcamento.motivoFinalizacao,

    arquivoUrl:
      orcamento.arquivoUrl,

    observacoes:
      orcamento.observacoes,

    criadoEm:
      orcamento.criadoEm.toISOString(),

    atualizadoEm:
      orcamento.atualizadoEm.toISOString(),
  }
}

/*
 * Sincroniza orçamentos cujo prazo
 * terminou sem decisão do cliente.
 *
 * Regra:
 * Pendente + validade ultrapassada
 * = Vencido.
 *
 * usuarioId = null identifica que
 * foi uma ação automática do sistema.
 */
async function sincronizarVencimentos(
  escritorioId: string
) {
  const agora =
    new Date()

  const expirados =
    await prisma.orcamento.findMany({
      where: {
        escritorioId,

        status:
          "Pendente",

        validadeEm: {
          lt: agora,
        },
      },
    })

  if (
    expirados.length === 0
  ) {
    return
  }

  await prisma.$transaction(
    async (tx) => {
      for (
        const anterior of
        expirados
      ) {
        const atualizado =
          await tx.orcamento.update({
            where: {
              id:
                anterior.id,
            },

            data: {
              status:
                "Vencido",

              finalizadoEm:
                agora,

              motivoFinalizacao:
                "Prazo de validade expirado sem aprovação ou recusa do cliente.",
            },
          })

        await tx.auditoria.create({
          data: {
            escritorioId,

            usuarioId:
              null,

            entidade:
              "Orcamento",

            entidadeId:
              anterior.id,

            acao:
              "VENCIMENTO_AUTOMATICO",

            dadosAntes:
              snapshotOrcamento(
                anterior
              ),

            dadosDepois:
              snapshotOrcamento(
                atualizado
              ),
          },
        })
      }
    }
  )
}

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    /*
     * Mantém os status comerciais
     * coerentes antes da consulta.
     */
    await sincronizarVencimentos(
      sessao.escritorioId
    )

    const { searchParams } =
      new URL(request.url)

    const clienteId =
      searchParams.get(
        "clienteId"
      )

    const representadaId =
      searchParams.get(
        "representadaId"
      )

    const interacaoOrigemId =
      searchParams.get(
        "interacaoOrigemId"
      )

    const status =
      searchParams.get(
        "status"
      )

    const busca =
      searchParams
        .get("busca")
        ?.trim()

    const orcamentos =
      await prisma.orcamento.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          ...(clienteId
            ? {
                clienteId,
              }
            : {}),

          ...(representadaId
            ? {
                representadaId,
              }
            : {}),

          ...(interacaoOrigemId
            ? {
                interacaoOrigemId,
              }
            : {}),

          ...(status &&
          status !== "Todos"
            ? {
                status,
              }
            : {}),

          ...(busca
            ? {
                OR: [
                  {
                    cliente: {
                      razaoSocial: {
                        contains:
                          busca,

                        mode:
                          "insensitive",
                      },
                    },
                  },

                  {
                    cliente: {
                      nomeFantasia: {
                        contains:
                          busca,

                        mode:
                          "insensitive",
                      },
                    },
                  },

                  {
                    representada: {
                      nome: {
                        contains:
                          busca,

                        mode:
                          "insensitive",
                      },
                    },
                  },

                  {
                    descricao: {
                      contains:
                        busca,

                      mode:
                        "insensitive",
                    },
                  },

                  {
                    condicaoPagamento: {
                      contains:
                        busca,

                      mode:
                        "insensitive",
                    },
                  },
                ],
              }
            : {}),

          ...(sessao.perfil ===
          "Preposto"
            ? filtroCarteiraPreposto(
                sessao.escritorioId,
                sessao.usuarioId
              )
            : {}),
        },

        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              telefone: true,
              whatsapp: true,
              email: true,
            },
          },

          representada: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              cnpj: true,
            },
          },

          interacaoOrigem: {
            select: {
              id: true,
              numeroSequencial:
                true,
              data: true,
              tipo: true,
              assunto: true,
            },
          },

          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },

          responsavel: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },

        orderBy: [
          {
            validadeEm:
              "asc",
          },

          {
            data:
              "desc",
          },
        ],
      })

    return NextResponse.json(
      orcamentos
    )
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
      "Erro ao listar orçamentos:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar orçamentos.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    const body =
      await request.json()

    const clienteId =
      textoOpcional(
        body.clienteId
      )

    const representadaId =
      textoOpcional(
        body.representadaId
      )

    const interacaoOrigemId =
      textoOpcional(
        body.interacaoOrigemId
      )

    const responsavelSolicitadoId =
      textoOpcional(
        body.responsavelId
      )

    const valorTotal =
      numeroPositivo(
        body.valorTotal
      )

    if (!clienteId) {
      return NextResponse.json(
        {
          message:
            "Cliente é obrigatório para gerar orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    if (!representadaId) {
      return NextResponse.json(
        {
          message:
            "Representada é obrigatória para gerar orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      valorTotal === null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um valor total válido e maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Valida o Cliente e, para Preposto,
     * também a carteira comercial.
     */
    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id:
            clienteId,

          escritorioId:
            sessao.escritorioId,

          status:
            "Ativo",

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

                        ativa:
                          true,
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
        },
      })

    if (!cliente) {
      return NextResponse.json(
        {
          message:
            "Cliente não encontrado, inativo ou sem permissão de acesso.",
        },
        {
          status: 403,
        }
      )
    }

    /*
     * Regra operacional atual:
     * orçamentos/vendas comerciais
     * somente para Cliente com CNPJ.
     */
    if (
      !cliente.cnpj ||
      cliente.cnpj.trim() ===
        ""
    ) {
      return NextResponse.json(
        {
          message:
            "O cliente precisa possuir CNPJ cadastrado para gerar orçamento comercial.",
        },
        {
          status: 400,
        }
      )
    }

    const representada =
      await prisma.representada.findFirst({
        where: {
          id:
            representadaId,

          escritorioId:
            sessao.escritorioId,

          status:
            "Ativa",
        },

        select: {
          id: true,
          codigo: true,
          nome: true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada, inativa ou sem permissão de acesso.",
        },
        {
          status: 403,
        }
      )
    }

    /*
     * Quando houver Interação de origem,
     * ela precisa pertencer:
     *
     * - ao mesmo Escritório;
     * - ao mesmo Cliente;
     * - à carteira acessível pelo usuário.
     */
    if (
      interacaoOrigemId
    ) {
      const interacao =
        await prisma.interacao.findFirst({
          where: {
            id:
              interacaoOrigemId,

            escritorioId:
              sessao.escritorioId,

            clienteId,

            ...(sessao.perfil ===
            "Preposto"
              ? filtroCarteiraPreposto(
                  sessao.escritorioId,
                  sessao.usuarioId
                )
              : {}),
          },

          select: {
            id: true,
            numeroSequencial:
              true,
            clienteId: true,
          },
        })

      if (!interacao) {
        return NextResponse.json(
          {
            message:
              "A interação de origem não foi encontrada, não pertence ao cliente selecionado ou está fora da sua permissão.",
          },
          {
            status: 400,
          }
        )
      }
    }

    /*
     * Por padrão, quem cria fica
     * responsável pelo orçamento.
     */
    let responsavelId =
      sessao.usuarioId

    if (
      responsavelSolicitadoId
    ) {
      /*
       * Preposto não pode transferir
       * diretamente responsabilidade
       * para outro usuário.
       */
      if (
        sessao.perfil ===
          "Preposto" &&
        responsavelSolicitadoId !==
          sessao.usuarioId
      ) {
        return NextResponse.json(
          {
            message:
              "Seu perfil não possui permissão para atribuir o orçamento a outro usuário.",
          },
          {
            status: 403,
          }
        )
      }

      const responsavel =
        await prisma.usuario.findFirst({
          where: {
            id:
              responsavelSolicitadoId,

            escritorioId:
              sessao.escritorioId,

            ativo:
              true,
          },

          select: {
            id: true,
          },
        })

      if (!responsavel) {
        return NextResponse.json(
          {
            message:
              "Responsável não encontrado ou está inativo.",
          },
          {
            status: 400,
          }
        )
      }

      responsavelId =
        responsavel.id
    }

    /*
     * Data oficial do orçamento definida
     * no servidor.
     */
    const agora =
      new Date()

    /*
     * Regra comercial:
     * validade padrão = 7 dias corridos.
     */
    const validadeEm =
      adicionarDiasCorridos(
        agora,
        PRAZO_PADRAO_ORCAMENTO_DIAS
      )

    /*
     * Criação e Auditoria acontecem
     * dentro da mesma transação.
     *
     * Se a Auditoria falhar, o Orçamento
     * também não fica criado pela metade.
     */
    const orcamento =
      await prisma.$transaction(
        async (tx) => {
          const criado =
            await tx.orcamento.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                interacaoOrigemId,

                clienteId,
                representadaId,

                criadoPorId:
                  sessao.usuarioId,

                responsavelId,

                data:
                  agora,

                validadeEm,

                valorTotal,

                condicaoPagamento:
                  textoOpcional(
                    body.condicaoPagamento
                  ),

                descricao:
                  textoOpcional(
                    body.descricao
                  ),

                /*
                 * Todo novo orçamento
                 * nasce Pendente.
                 */
                status:
                  "Pendente",

                /*
                 * Criar não significa
                 * necessariamente enviar.
                 */
                enviadoEm:
                  null,

                finalizadoEm:
                  null,

                motivoFinalizacao:
                  null,

                arquivoUrl:
                  textoOpcional(
                    body.arquivoUrl
                  ),

                observacoes:
                  textoOpcional(
                    body.observacoes
                  ),
              },
            })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "Orcamento",

              entidadeId:
                criado.id,

              acao:
                "CRIACAO",

              dadosDepois:
                snapshotOrcamento(
                  criado
                ),
            },
          })

          return criado
        }
      )

    /*
     * Recarrega o registro já com
     * informações comerciais relacionadas.
     */
    const completo =
      await prisma.orcamento.findUnique({
        where: {
          id:
            orcamento.id,
        },

        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              telefone: true,
              whatsapp: true,
              email: true,
            },
          },

          representada: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              cnpj: true,
            },
          },

          interacaoOrigem: {
            select: {
              id: true,
              numeroSequencial:
                true,
              data: true,
              tipo: true,
              assunto: true,
            },
          },

          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },

          responsavel: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },
      })

    return NextResponse.json(
      completo,
      {
        status: 201,
      }
    )
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
      "Erro ao criar orçamento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar orçamento.",
      },
      {
        status: 500,
      }
    )
  }
}