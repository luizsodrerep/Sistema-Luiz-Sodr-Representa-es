import { Prisma } from "@prisma/client"
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

function numeroDaBusca(
  busca: string
) {
  const correspondencia =
    busca.match(/\d+/)

  if (!correspondencia) {
    return null
  }

  const numero =
    Number.parseInt(
      correspondencia[0],
      10
    )

  return Number.isInteger(numero)
    ? numero
    : null
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
  clienteId: string | null
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

        // Propostas ainda não enviadas não vencem automaticamente.
        enviadoEm: {
          not: null,
        },

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
      searchParams
        .get("clienteId")
        ?.trim() || null

    const representadaId =
      searchParams
        .get("representadaId")
        ?.trim() || null

    const interacaoOrigemId =
      searchParams
        .get("interacaoOrigemId")
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

    const numeroSequencial =
      busca
        ? numeroDaBusca(
            busca
          )
        : null

    const filtrosBusca:
      Prisma.OrcamentoWhereInput[] =
      busca
        ? [
            ...(numeroSequencial !==
            null
              ? [
                  {
                    numeroSequencial,
                  },
                ]
              : []),

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
          ]
        : []

    const where:
      Prisma.OrcamentoWhereInput =
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
              OR:
                filtrosBusca,
            }
          : {}),

        ...(dataInicio ||
        dataFim
          ? {
              data: {
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
              },
            }
          : {}),

        ...(sessao.perfil ===
        "Preposto"
          ? filtroCarteiraPreposto(
              sessao.escritorioId,
              sessao.usuarioId
            )
          : {}),
      }

    const include:
      Prisma.OrcamentoInclude =
      {
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
      }

    const orderBy:
      Prisma.OrcamentoOrderByWithRelationInput[] =
      [
        {
          validadeEm:
            "asc",
        },

        {
          data:
            "desc",
        },
      ]

    if (!paginado) {
      const orcamentos =
        await prisma.orcamento.findMany({
          where,
          include,
          orderBy,
        })

      return NextResponse.json(
        orcamentos
      )
    }

    const [
      total,
      orcamentos,
    ] =
      await prisma.$transaction([
        prisma.orcamento.count({
          where,
        }),

        prisma.orcamento.findMany({
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
        orcamentos,

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
     * A Prospecção original continua sem Cliente.
     * O Orçamento usa um pré-cadastro legítimo, mantendo
     * interacaoOrigemId como vínculo histórico.
     *
     * Não associar uma Prospecção de outro usuário
     * a um pré-cadastro apenas por conhecer seu ID.
     */
    const interacaoOrigem =
      interacaoOrigemId
        ? await prisma.interacao.findFirst({
            where: {
              id: interacaoOrigemId,
              escritorioId: sessao.escritorioId,
              ...(sessao.perfil === "Preposto"
                ? {
                    OR: [
                      { criadoPorId: sessao.usuarioId },
                      { responsavelId: sessao.usuarioId },
                      { cliente: filtroCarteiraPreposto(
                          sessao.escritorioId,
                          sessao.usuarioId
                        ).cliente },
                    ],
                  }
                : {}),
            },
            select: {
              id: true,
              tipo: true,
              clienteId: true,
              representadaId: true,
              nomeProspect: true,
            },
          })
        : null

    if (interacaoOrigemId && !interacaoOrigem) {
      return NextResponse.json(
        { message: "Interação de origem não encontrada ou sem permissão de acesso." },
        { status: 403 }
      )
    }

    const origemEProspecaoSemCliente =
      interacaoOrigem?.tipo === "Prospecção" &&
      interacaoOrigem.clienteId === null &&
      interacaoOrigem.representadaId === null &&
      Boolean(interacaoOrigem.nomeProspect?.trim())

    /*
     * Não vincular silenciosamente uma Prospecção sem Cliente
     * a qualquer cadastro. A interface deverá pedir confirmação
     * explícita da identidade antes de enviar esta opção.
     */
    if (
      origemEProspecaoSemCliente &&
      body.confirmarVinculoProspeccao !== true
    ) {
      return NextResponse.json(
        { message: "Confirme expressamente que o pré-cadastro corresponde à Prospecção selecionada." },
        { status: 400 }
      )
    }

    if (
      interacaoOrigem &&
      !origemEProspecaoSemCliente &&
      interacaoOrigem.clienteId !== clienteId
    ) {
      return NextResponse.json(
        { message: "A interação de origem não pertence ao Cliente selecionado." },
        { status: 400 }
      )
    }

    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id: clienteId,
          escritorioId: sessao.escritorioId,
          ...(sessao.perfil === "Preposto"
            ? {
                OR: [
                  { responsavelPrincipalId: sessao.usuarioId },
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
          codigo: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpj: true,
          status: true,
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

    const emQualificacao =
      cliente.status ===
        "Em qualificação"

    if (
      emQualificacao &&
      !origemEProspecaoSemCliente
    ) {
      return NextResponse.json(
        {
          message:
            "O pré-cadastro em qualificação exige uma Prospecção de origem válida, ainda sem Cliente.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      cliente.status !== "Ativo" &&
      !emQualificacao
    ) {
      return NextResponse.json(
        {
          message:
            "O cadastro precisa estar ativo ou em qualificação.",
        },
        {
          status: 400,
        }
      )
    }

    // Clientes já formalizados mantêm a exigência anterior de CNPJ.
    // A exceção se aplica somente ao pré-cadastro vinculado à Prospecção.
    if (
      !emQualificacao &&
      !cliente.cnpj?.trim()
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

    /*
     * Data oficial do orçamento definida
     * no servidor.
     *
     * A mesma referência de tempo é usada
     * para validar a vigência da política
     * comercial da Representada.
     */
    const agora =
      new Date()

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
     * PROTEÇÃO COMERCIAL
     *
     * Representadas antigas podem continuar marcadas
     * como Ativas mesmo sem política comercial
     * versionada. Para novos Orçamentos, isso não é
     * permitido.
     *
     * É obrigatória ao menos uma regra:
     * - padrão;
     * - sem vínculo exclusivo a Cliente;
     * - ativa;
     * - já iniciada;
     * - ainda vigente.
     *
     * A meta mensal não participa desta validação.
     */
    const regraComercialPadraoVigente =
      await prisma.regraComercialRepresentada.findFirst({
        where: {
          representadaId:
            representada.id,

          clienteId:
            null,

          tipoEscopo:
            "Padrao",

          ativa:
            true,

          vigenciaInicio: {
            lte:
              agora,
          },

          OR: [
            {
              vigenciaFim:
                null,
            },
            {
              vigenciaFim: {
                gte:
                  agora,
              },
            },
          ],
        },

        select: {
          id: true,
          nome: true,
        },
      })

    if (
      !regraComercialPadraoVigente
    ) {
      return NextResponse.json(
        {
          message:
            "Esta Representada está ativa, mas não possui uma política comercial padrão, ativa e vigente. Regularize a política comercial da Representada antes de gerar um novo Orçamento.",
        },
        {
          status: 409,
        }
      )
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