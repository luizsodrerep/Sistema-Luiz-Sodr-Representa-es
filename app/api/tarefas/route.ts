import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import {
  escopoDoRecurso,
  podeExecutarAcao,
} from "@/lib/auth/permissions"

const TIPOS_PERMITIDOS = [
  "Tarefa",
  "Compromisso",
] as const

const PRIORIDADES_PERMITIDAS = [
  "Baixa",
  "Normal",
  "Alta",
  "Urgente",
] as const

function textoOpcional(
  valor: unknown
): string | null {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  return valor.trim()
}

function converterDataOpcional(
  valor: unknown,
  campo: string
): Date | null {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null
  }

  if (typeof valor !== "string") {
    throw new Error(
      `DATA_INVALIDA:${campo}`
    )
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    throw new Error(
      `DATA_INVALIDA:${campo}`
    )
  }

  return data
}

function mensagemCampoData(
  campo: string
) {
  switch (campo) {
    case "inicioEm":
      return "Data/hora de início inválida."

    case "fimEm":
      return "Data/hora de término inválida."

    case "vencimentoEm":
      return "Data de vencimento inválida."

    default:
      return "Uma das datas informadas é inválida."
  }
}

function inteiroPositivo(
  valor: string | null,
  padrao: number,
  maximo: number
) {
  if (!valor) {
    return padrao
  }

  const numero =
    Number.parseInt(
      valor,
      10
    )

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    return padrao
  }

  return Math.min(
    numero,
    maximo
  )
}

function dataFiltro(
  valor: string | null,
  fimDoDia = false
) {
  if (!valor) {
    return null
  }

  const somenteData =
    /^\d{4}-\d{2}-\d{2}$/.test(
      valor
    )

  const data =
    somenteData
      ? new Date(
          `${valor}T${
            fimDoDia
              ? "23:59:59.999"
              : "00:00:00.000"
          }Z`
        )
      : new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
}

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "agenda",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para visualizar a Agenda.",
        },
        {
          status: 403,
        }
      )
    }

    const { searchParams } =
      new URL(request.url)

    const clienteId =
      searchParams
        .get("clienteId")
        ?.trim() || null

    const representadaId =
      searchParams
        .get("representadaId")
        ?.trim() || null

    const responsavelId =
      searchParams
        .get("responsavelId")
        ?.trim() || null

    const tipo =
      searchParams
        .get("tipo")
        ?.trim() || null

    const prioridade =
      searchParams
        .get("prioridade")
        ?.trim() || null

    const status =
      searchParams
        .get("status")
        ?.trim() || null

    const busca =
      searchParams
        .get("busca")
        ?.trim() || null

    const dataInicioTexto =
      searchParams
        .get("dataInicio")
        ?.trim() || null

    const dataFimTexto =
      searchParams
        .get("dataFim")
        ?.trim() || null

    const dataInicio =
      dataFiltro(
        dataInicioTexto
      )

    const dataFim =
      dataFiltro(
        dataFimTexto,
        true
      )

    if (
      dataInicioTexto &&
      !dataInicio
    ) {
      return NextResponse.json(
        {
          message:
            "Data inicial inválida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      dataFimTexto &&
      !dataFim
    ) {
      return NextResponse.json(
        {
          message:
            "Data final inválida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      dataInicio &&
      dataFim &&
      dataInicio.getTime() >
        dataFim.getTime()
    ) {
      return NextResponse.json(
        {
          message:
            "A data inicial não pode ser posterior à data final.",
        },
        {
          status: 400,
        }
      )
    }

    const pagina =
      inteiroPositivo(
        searchParams.get(
          "page"
        ),
        1,
        1000000
      )

    const limite =
      inteiroPositivo(
        searchParams.get(
          "limit"
        ),
        10,
        50
      )

    const paginado =
      searchParams.get(
        "paginado"
      ) === "1" ||
      searchParams.has(
        "page"
      ) ||
      searchParams.has(
        "limit"
      )

    const escopo =
      escopoDoRecurso(
        sessao.perfil,
        "agenda"
      )

    const filtrosAnd:
      Prisma.TarefaWhereInput[] =
      []

    /*
     * Mantém exatamente o escopo já
     * definido para a Agenda.
     */
    if (
      escopo ===
      "proprios"
    ) {
      filtrosAnd.push({
        OR: [
          {
            criadoPorId:
              sessao.usuarioId,
          },
          {
            responsavelId:
              sessao.usuarioId,
          },
        ],
      })
    }

    if (busca) {
      filtrosAnd.push({
        OR: [
          {
            titulo: {
              contains:
                busca,
              mode:
                "insensitive",
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
            observacoes: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
          {
            cliente: {
              is: {
                OR: [
                  {
                    razaoSocial: {
                      contains:
                        busca,
                      mode:
                        "insensitive",
                    },
                  },
                  {
                    nomeFantasia: {
                      contains:
                        busca,
                      mode:
                        "insensitive",
                    },
                  },
                ],
              },
            },
          },
          {
            representada: {
              is: {
                nome: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
            },
          },
          {
            responsavel: {
              is: {
                nome: {
                  contains:
                    busca,
                  mode:
                    "insensitive",
                },
              },
            },
          },
        ],
      })
    }

    if (
      dataInicio ||
      dataFim
    ) {
      const intervalo = {
        ...(dataInicio
          ? {
              gte:
                dataInicio,
            }
          : {}),

        ...(dataFim
          ? {
              lte:
                dataFim,
            }
          : {}),
      }

      filtrosAnd.push({
        OR: [
          {
            inicioEm:
              intervalo,
          },
          {
            vencimentoEm:
              intervalo,
          },
        ],
      })
    }

    const where:
      Prisma.TarefaWhereInput =
      {
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

        ...(responsavelId
          ? {
              responsavelId,
            }
          : {}),

        ...(tipo &&
        tipo.toLocaleLowerCase(
          "pt-BR"
        ) !== "todos"
          ? {
              tipo,
            }
          : {}),

        ...(prioridade &&
        prioridade.toLocaleLowerCase(
          "pt-BR"
        ) !== "todas"
          ? {
              prioridade,
            }
          : {}),

        ...(status &&
        status.toLocaleLowerCase(
          "pt-BR"
        ) !== "todos"
          ? {
              status,
            }
          : {}),

        ...(filtrosAnd.length >
        0
          ? {
              AND:
                filtrosAnd,
            }
          : {}),
      }

    const include:
      Prisma.TarefaInclude =
      {
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

        interacao: {
          select: {
            id: true,
            numeroSequencial: true,
            tipo: true,
            assunto: true,
          },
        },
      }

    const orderBy:
      Prisma.TarefaOrderByWithRelationInput[] =
      [
        {
          vencimentoEm:
            "asc",
        },
        {
          inicioEm:
            "asc",
        },
        {
          criadoEm:
            "desc",
        },
      ]

    if (!paginado) {
      const tarefas =
        await prisma.tarefa.findMany({
          where,
          include,
          orderBy,
        })

      return NextResponse.json(
        tarefas
      )
    }

    const [
      total,
      tarefas,
    ] =
      await prisma.$transaction([
        prisma.tarefa.count({
          where,
        }),

        prisma.tarefa.findMany({
          where,
          include,
          orderBy,

          skip:
            (pagina - 1) *
            limite,

          take:
            limite,
        }),
      ])

    const totalPaginas =
      Math.max(
        1,
        Math.ceil(
          total /
            limite
        )
      )

    return NextResponse.json({
      dados:
        tarefas,

      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
      },
    })
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
      "Erro ao listar tarefas da Agenda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar tarefas da Agenda.",
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

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "agenda",
        "criar"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para criar itens na Agenda.",
        },
        {
          status: 403,
        }
      )
    }

    let body:
      | Record<string, unknown>
      | null = null

    try {
      const recebido =
        await request.json()

      if (
        recebido &&
        typeof recebido === "object" &&
        !Array.isArray(recebido)
      ) {
        body =
          recebido as Record<
            string,
            unknown
          >
      }
    } catch {
      body = null
    }

    if (!body) {
      return NextResponse.json(
        {
          message:
            "Dados da tarefa são inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const titulo =
      textoOpcional(body.titulo)

    if (!titulo) {
      return NextResponse.json(
        {
          message:
            "Título é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    const tipo =
      textoOpcional(body.tipo) ??
      "Tarefa"

    if (
      !TIPOS_PERMITIDOS.includes(
        tipo as
          (typeof TIPOS_PERMITIDOS)[number]
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo inválido. Utilize Tarefa ou Compromisso.",
        },
        {
          status: 400,
        }
      )
    }

    const prioridade =
      textoOpcional(
        body.prioridade
      ) ?? "Normal"

    if (
      !PRIORIDADES_PERMITIDAS.includes(
        prioridade as
          (typeof PRIORIDADES_PERMITIDAS)[number]
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prioridade inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const inicioEm =
      converterDataOpcional(
        body.inicioEm,
        "inicioEm"
      )

    const fimEm =
      converterDataOpcional(
        body.fimEm,
        "fimEm"
      )

    const vencimentoEm =
      converterDataOpcional(
        body.vencimentoEm,
        "vencimentoEm"
      )

    if (
      tipo === "Compromisso" &&
      !inicioEm
    ) {
      return NextResponse.json(
        {
          message:
            "Compromisso precisa possuir data/hora de início.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      fimEm &&
      !inicioEm
    ) {
      return NextResponse.json(
        {
          message:
            "Informe a data/hora de início antes da data/hora de término.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      inicioEm &&
      fimEm &&
      fimEm.getTime() <
        inicioEm.getTime()
    ) {
      return NextResponse.json(
        {
          message:
            "A data/hora de término não pode ser anterior ao início.",
        },
        {
          status: 400,
        }
      )
    }

    const clienteId =
      textoOpcional(
        body.clienteId
      )

    const representadaId =
      textoOpcional(
        body.representadaId
      )

    const interacaoId =
      textoOpcional(
        body.interacaoId
      )

    /*
     * RESPONSAVEL
     *
     * Por padrão, o próprio usuário
     * que cria o item será responsável.
     *
     * Diretor e Administrativo podem
     * atribuir o item a outro usuário
     * ativo do mesmo escritório.
     *
     * Preposto não pode atribuir
     * tarefa a outro usuário.
     */
    let responsavelId =
      sessao.usuarioId

    const responsavelInformado =
      textoOpcional(
        body.responsavelId
      )

    if (responsavelInformado) {
      if (
        sessao.perfil ===
          "Preposto" &&
        responsavelInformado !==
          sessao.usuarioId
      ) {
        return NextResponse.json(
          {
            message:
              "Preposto não pode atribuir tarefa a outro usuário.",
          },
          {
            status: 403,
          }
        )
      }

      const responsavel =
        await prisma.usuario.findFirst(
          {
            where: {
              id: responsavelInformado,
              escritorioId:
                sessao.escritorioId,
              ativo: true,
            },

            select: {
              id: true,
            },
          }
        )

      if (!responsavel) {
        return NextResponse.json(
          {
            message:
              "Responsável não encontrado ou inativo.",
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
     * CLIENTE
     *
     * O vínculo é opcional.
     * Quando houver Preposto, aplica-se
     * o mesmo conceito de carteira já
     * utilizado nas Interações.
     */
    if (clienteId) {
      const cliente =
        await prisma.cliente.findFirst({
          where: {
            id: clienteId,

            escritorioId:
              sessao.escritorioId,

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
                          ativa: true,
                        },
                      },
                    },
                  ],
                }
              : {}),
          },

          select: {
            id: true,
          },
        })

      if (!cliente) {
        return NextResponse.json(
          {
            message:
              "Cliente não encontrado ou sem permissão de acesso.",
          },
          {
            status: 403,
          }
        )
      }
    }

    /*
     * REPRESENTADA
     *
     * Apenas valida que pertence
     * ao mesmo escritório.
     */
    if (representadaId) {
      const representada =
        await prisma.representada.findFirst(
          {
            where: {
              id: representadaId,
              escritorioId:
                sessao.escritorioId,
            },

            select: {
              id: true,
            },
          }
        )

      if (!representada) {
        return NextResponse.json(
          {
            message:
              "Representada não encontrada ou sem permissão de acesso.",
          },
          {
            status: 403,
          }
        )
      }
    }

    /*
     * INTERACAO
     *
     * Diretor e Administrativo:
     * qualquer interação do escritório.
     *
     * Preposto:
     * interação da própria carteira
     * ou prospecção criada/atribuída
     * ao próprio usuário.
     */
    if (interacaoId) {
      const interacao =
        await prisma.interacao.findFirst({
          where: {
            id: interacaoId,

            escritorioId:
              sessao.escritorioId,

            ...(sessao.perfil ===
            "Preposto"
              ? {
                  OR: [
                    {
                      cliente: {
                        is: {
                          escritorioId:
                            sessao.escritorioId,

                          OR: [
                            {
                              responsavelPrincipalId:
                                sessao.usuarioId,
                            },
                            {
                              participantes:
                                {
                                  some: {
                                    usuarioId:
                                      sessao.usuarioId,
                                    ativa:
                                      true,
                                  },
                                },
                            },
                          ],
                        },
                      },
                    },

                    {
                      AND: [
                        {
                          clienteId:
                            null,
                        },
                        {
                          representadaId:
                            null,
                        },
                        {
                          OR: [
                            {
                              criadoPorId:
                                sessao.usuarioId,
                            },
                            {
                              responsavelId:
                                sessao.usuarioId,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : {}),
          },

          select: {
            id: true,
          },
        })

      if (!interacao) {
        return NextResponse.json(
          {
            message:
              "Interação não encontrada ou sem permissão de acesso.",
          },
          {
            status: 403,
          }
        )
      }
    }

    const tarefa =
      await prisma.tarefa.create({
        data: {
          escritorioId:
            sessao.escritorioId,

          criadoPorId:
            sessao.usuarioId,

          responsavelId,

          clienteId,
          representadaId,
          interacaoId,

          titulo,

          descricao:
            textoOpcional(
              body.descricao
            ),

          tipo,

          prioridade,

          status: "Pendente",

          inicioEm,
          fimEm,
          vencimentoEm,

          observacoes:
            textoOpcional(
              body.observacoes
            ),
        },

        include: {
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

          interacao: {
            select: {
              id: true,
              numeroSequencial: true,
              tipo: true,
              assunto: true,
            },
          },
        },
      })

    return NextResponse.json(
      tarefa,
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

    if (
      error instanceof Error &&
      error.message.startsWith(
        "DATA_INVALIDA:"
      )
    ) {
      const campo =
        error.message.split(":")[1] ??
        ""

      return NextResponse.json(
        {
          message:
            mensagemCampoData(campo),
        },
        {
          status: 400,
        }
      )
    }

    console.error(
      "Erro ao criar tarefa da Agenda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar tarefa da Agenda.",
      },
      {
        status: 500,
      }
    )
  }
}