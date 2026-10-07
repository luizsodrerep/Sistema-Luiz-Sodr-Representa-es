import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"

const MARCADOR_ACEITE_V1 = "DADOS_APROVACAO_V1="
const MARCADOR_ACEITE_V2 = "DADOS_APROVACAO_V2="

const TERMOMETROS_RELACIONAMENTO = [
  "Verde",
  "Azul",
  "Amarelo",
  "Laranja",
  "Vermelho",
] as const

const TIPOS_ATENCAO_COMERCIAL = [
  "Informação importante",
  "Atenção",
  "Restrição",
] as const

const ACOES_ATENCAO_COMERCIAL = [
  "CRIAR",
  "RESOLVER",
] as const

type Contexto = {
  params: Promise<{ id: string }>
}

function filtroAcessoCliente(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
): Prisma.ClienteWhereInput {
  return {
    id,
    escritorioId,
    ...(perfil === "Preposto"
      ? {
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
        }
      : {}),
  }
}

function campoOpcional(
  dados: Record<string, unknown>,
  nome: string,
  anterior: string | null
): string | null {
  const recebido = dados[nome]

  if (recebido === undefined) {
    return anterior
  }

  if (recebido === null) {
    return null
  }

  if (typeof recebido !== "string") {
    throw new Error("CAMPO_INVALIDO")
  }

  return recebido.trim() || null
}

function textoObrigatorio(
  valor: unknown
): string | null {
  return typeof valor === "string" &&
    valor.trim()
    ? valor.trim()
    : null
}

function campoTermometroRelacionamento(
  dados: Record<string, unknown>,
  anterior: string | null
): string | null {
  const recebido =
    dados.termometroRelacionamento

  if (recebido === undefined) {
    return anterior
  }

  if (recebido === null) {
    return null
  }

  if (typeof recebido !== "string") {
    throw new Error(
      "TERMOMETRO_INVALIDO"
    )
  }

  const valor = recebido.trim()

  if (!valor) {
    return null
  }

  if (
    !TERMOMETROS_RELACIONAMENTO.some(
      (item) => item === valor
    )
  ) {
    throw new Error(
      "TERMOMETRO_INVALIDO"
    )
  }

  return valor
}

function cnpjNormalizado(valor: string) {
  return valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

// Verificação de formato, não consulta à Receita Federal nem prova de titularidade.
function formatoCnpjPossivel(
  valor: string
) {
  const caracteres =
    cnpjNormalizado(valor)

  return (
    /^[A-Z0-9]{12}[0-9]{2}$/.test(
      caracteres
    ) &&
    !/^([A-Z0-9])\1{13}$/.test(
      caracteres
    )
  )
}

function snapshotJson(
  valor: object
): Prisma.InputJsonObject {
  return JSON.parse(
    JSON.stringify(valor)
  ) as Prisma.InputJsonObject
}

function inclusoesAtencaoComercial() {
  return {
    representada: {
      select: {
        id: true,
        codigo: true,
        nome: true,
      },
    },
    criadoPor: {
      select: {
        id: true,
        nome: true,
      },
    },
    resolvidoPor: {
      select: {
        id: true,
        nome: true,
      },
    },
  } satisfies Prisma.AtencaoComercialClienteInclude
}

export async function GET(
  _request: Request,
  { params }: Contexto
) {
  try {
    const sessao =
      await exigirSessao()

    const { id } = await params

    const cliente =
      await prisma.cliente.findFirst({
        where: filtroAcessoCliente(
          sessao.escritorioId,
          sessao.usuarioId,
          sessao.perfil,
          id
        ),

        include: {
          atencoesComerciais: {
            include:
              inclusoesAtencaoComercial(),

            orderBy: [
              {
                status: "asc",
              },
              {
                criadoEm: "desc",
              },
            ],
          },
        },
      })

    if (!cliente) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado ou sem permissão de acesso",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      cliente
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao buscar cliente:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Erro ao buscar cliente",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: Contexto
) {
  try {
    const sessao =
      await exigirSessao()

    const { id } = await params

    const body: unknown =
      await request.json()

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Dados de Cliente inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const dados =
      body as Record<
        string,
        unknown
      >

    const anterior =
      await prisma.cliente.findFirst({
        where: filtroAcessoCliente(
          sessao.escritorioId,
          sessao.usuarioId,
          sessao.perfil,
          id
        ),
      })

    if (!anterior) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado ou sem permissão de acesso",
        },
        {
          status: 404,
        }
      )
    }

    if (
      dados.acaoAtencaoComercial !==
      undefined
    ) {
      if (
        typeof dados.acaoAtencaoComercial !==
        "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Ação de Atenção Comercial inválida.",
          },
          {
            status: 400,
          }
        )
      }

      const acao =
        dados.acaoAtencaoComercial
          .trim()
          .toUpperCase()

      if (
        !ACOES_ATENCAO_COMERCIAL.some(
          (item) => item === acao
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Ação de Atenção Comercial não reconhecida.",
          },
          {
            status: 400,
          }
        )
      }

      if (acao === "CRIAR") {
        const tipo =
          textoObrigatorio(
            dados.tipo
          )

        const titulo =
          textoObrigatorio(
            dados.titulo
          )

        const descricao =
          textoObrigatorio(
            dados.descricao
          )

        if (
          !tipo ||
          !TIPOS_ATENCAO_COMERCIAL.some(
            (item) =>
              item === tipo
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Tipo de Atenção Comercial inválido. Use Informação importante, Atenção ou Restrição.",
            },
            {
              status: 400,
            }
          )
        }

        if (!titulo) {
          return NextResponse.json(
            {
              error:
                "Informe um título para a Atenção Comercial.",
            },
            {
              status: 400,
            }
          )
        }

        if (
          titulo.length > 160
        ) {
          return NextResponse.json(
            {
              error:
                "O título da Atenção Comercial deve ter no máximo 160 caracteres.",
            },
            {
              status: 400,
            }
          )
        }

        if (!descricao) {
          return NextResponse.json(
            {
              error:
                "Descreva objetivamente a Atenção Comercial.",
            },
            {
              status: 400,
            }
          )
        }

        if (
          descricao.length > 5000
        ) {
          return NextResponse.json(
            {
              error:
                "A descrição da Atenção Comercial deve ter no máximo 5.000 caracteres.",
            },
            {
              status: 400,
            }
          )
        }

        let representadaId:
          | string
          | null = null

        if (
          dados.representadaId !==
            undefined &&
          dados.representadaId !==
            null
        ) {
          if (
            typeof dados.representadaId !==
            "string"
          ) {
            return NextResponse.json(
              {
                error:
                  "Representada da Atenção Comercial inválida.",
              },
              {
                status: 400,
              }
            )
          }

          const valorRepresentada =
            dados.representadaId.trim()

          if (valorRepresentada) {
            const representada =
              await prisma.representada
                .findFirst({
                  where: {
                    id:
                      valorRepresentada,

                    escritorioId:
                      sessao.escritorioId,
                  },

                  select: {
                    id: true,
                  },
                })

            if (!representada) {
              return NextResponse.json(
                {
                  error:
                    "Representada não encontrada neste escritório.",
                },
                {
                  status: 400,
                }
              )
            }

            representadaId =
              representada.id
          }
        }

        const criada =
          await prisma.$transaction(
            async (tx) => {
              const atencao =
                await tx.atencaoComercialCliente
                  .create({
                    data: {
                      escritorioId:
                        sessao.escritorioId,

                      clienteId:
                        anterior.id,

                      representadaId,

                      criadoPorId:
                        sessao.usuarioId,

                      tipo,

                      titulo,

                      descricao,

                      status:
                        "Ativa",
                    },
                  })

              await tx.auditoria.create({
                data: {
                  escritorioId:
                    sessao.escritorioId,

                  usuarioId:
                    sessao.usuarioId,

                  entidade:
                    "AtencaoComercialCliente",

                  entidadeId:
                    atencao.id,

                  acao:
                    "CRIACAO_ATENCAO_COMERCIAL",

                  dadosDepois:
                    snapshotJson(
                      atencao
                    ),
                },
              })

              return tx.atencaoComercialCliente
                .findUniqueOrThrow({
                  where: {
                    id:
                      atencao.id,
                  },

                  include:
                    inclusoesAtencaoComercial(),
                })
            }
          )

        return NextResponse.json(
          criada,
          {
            status: 201,
          }
        )
      }

      if (acao === "RESOLVER") {
        const atencaoId =
          textoObrigatorio(
            dados.atencaoId
          )

        const resolucao =
          textoObrigatorio(
            dados.resolucao
          )

        if (!atencaoId) {
          return NextResponse.json(
            {
              error:
                "Informe a Atenção Comercial que será resolvida.",
            },
            {
              status: 400,
            }
          )
        }

        if (!resolucao) {
          return NextResponse.json(
            {
              error:
                "Informe o desfecho da Atenção Comercial antes de resolvê-la.",
            },
            {
              status: 400,
            }
          )
        }

        if (
          resolucao.length > 5000
        ) {
          return NextResponse.json(
            {
              error:
                "O desfecho da Atenção Comercial deve ter no máximo 5.000 caracteres.",
            },
            {
              status: 400,
            }
          )
        }

        const atencaoAnterior =
          await prisma.atencaoComercialCliente
            .findFirst({
              where: {
                id:
                  atencaoId,

                escritorioId:
                  sessao.escritorioId,

                clienteId:
                  anterior.id,
              },
            })

        if (!atencaoAnterior) {
          return NextResponse.json(
            {
              error:
                "Atenção Comercial não encontrada para este Cliente.",
            },
            {
              status: 404,
            }
          )
        }

        if (
          atencaoAnterior.status !==
          "Ativa"
        ) {
          return NextResponse.json(
            {
              error:
                "Esta Atenção Comercial já foi resolvida.",
            },
            {
              status: 409,
            }
          )
        }

        const resolvida =
          await prisma.$transaction(
            async (tx) => {
              const resultado =
                await tx.atencaoComercialCliente
                  .updateMany({
                    where: {
                      id:
                        atencaoAnterior.id,

                      escritorioId:
                        sessao.escritorioId,

                      clienteId:
                        anterior.id,

                      status:
                        "Ativa",

                      atualizadoEm:
                        atencaoAnterior.atualizadoEm,
                    },

                    data: {
                      status:
                        "Resolvida",

                      resolucao,

                      resolvidoEm:
                        new Date(),

                      resolvidoPorId:
                        sessao.usuarioId,
                    },
                  })

              if (
                resultado.count !==
                1
              ) {
                throw new Error(
                  "ATENCAO_ALTERADA"
                )
              }

              const depois =
                await tx.atencaoComercialCliente
                  .findUniqueOrThrow({
                    where: {
                      id:
                        atencaoAnterior.id,
                    },
                  })

              await tx.auditoria.create({
                data: {
                  escritorioId:
                    sessao.escritorioId,

                  usuarioId:
                    sessao.usuarioId,

                  entidade:
                    "AtencaoComercialCliente",

                  entidadeId:
                    depois.id,

                  acao:
                    "RESOLUCAO_ATENCAO_COMERCIAL",

                  dadosAntes:
                    snapshotJson(
                      atencaoAnterior
                    ),

                  dadosDepois:
                    snapshotJson(
                      depois
                    ),
                },
              })

              return tx.atencaoComercialCliente
                .findUniqueOrThrow({
                  where: {
                    id:
                      depois.id,
                  },

                  include:
                    inclusoesAtencaoComercial(),
                })
            }
          )

        return NextResponse.json(
          resolvida
        )
      }
    }

    const razaoSocial =
      dados.razaoSocial ===
      undefined
        ? anterior.razaoSocial
        : textoObrigatorio(
            dados.razaoSocial
          )

    if (!razaoSocial) {
      return NextResponse.json(
        {
          error:
            "Informe a razão social real da empresa.",
        },
        {
          status: 400,
        }
      )
    }

    const status =
      dados.status === undefined
        ? anterior.status
        : dados.status

    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Situação cadastral inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const formalizando =
      anterior.status ===
        "Em qualificação" &&
      status === "Ativo"

    if (
      status !==
        anterior.status &&
      !formalizando
    ) {
      return NextResponse.json(
        {
          error:
            "Esta rota só permite alterar a situação de Em qualificação para Ativo, mediante formalização. Outras mudanças de situação exigem fluxo específico.",
        },
        {
          status: 400,
        }
      )
    }

    const cnpj =
      campoOpcional(
        dados,
        "cnpj",
        anterior.cnpj
      )

    const mudouCnpj =
      cnpjNormalizado(
        cnpj || ""
      ) !==
      cnpjNormalizado(
        anterior.cnpj || ""
      )

    if (
      mudouCnpj &&
      cnpj &&
      !formatoCnpjPossivel(
        cnpj
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O CNPJ informado não possui o formato esperado de 14 caracteres. Confira os dados originais.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      anterior.status ===
        "Ativo" &&
      anterior.cnpj?.trim() &&
      !cnpj
    ) {
      return NextResponse.json(
        {
          error:
            "Não é permitido apagar o CNPJ de um Cliente ativo. Corrija o cadastro sem eliminar sua identificação.",
        },
        {
          status: 400,
        }
      )
    }

    let orcamentoAprovadoId:
      | string
      | null = null

    if (formalizando) {
      if (
        dados.confirmarFormalizacao !==
        true
      ) {
        return NextResponse.json(
          {
            error:
              "Confirme expressamente a identidade real da empresa e a formalização do mesmo pré-cadastro.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        !cnpj ||
        !formatoCnpjPossivel(
          cnpj
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Informe o CNPJ verdadeiro da empresa para formalizar o pré-cadastro.",
          },
          {
            status: 400,
          }
        )
      }

      const aprovado =
        await prisma.orcamento
          .findFirst({
            where: {
              escritorioId:
                sessao.escritorioId,

              clienteId:
                anterior.id,

              status:
                "Aprovado",

              enviadoEm: {
                not: null,
              },

              OR: [
                {
                  motivoFinalizacao:
                    {
                      contains:
                        MARCADOR_ACEITE_V1,
                    },
                },
                {
                  motivoFinalizacao:
                    {
                      contains:
                        MARCADOR_ACEITE_V2,
                    },
                },
              ],

              interacaoOrigem: {
                is: {
                  escritorioId:
                    sessao.escritorioId,

                  tipo:
                    "Prospecção",

                  clienteId:
                    null,

                  representadaId:
                    null,

                  nomeProspect:
                    {
                      not: null,
                    },
                },
              },
            },

            select: {
              id: true,
            },
          })

      if (!aprovado) {
        return NextResponse.json(
          {
            error:
              "A formalização exige um Orçamento deste pré-cadastro, com Prospecção de origem e aceite real já registrado. Não crie outro Cliente.",
          },
          {
            status: 409,
          }
        )
      }

      orcamentoAprovadoId =
        aprovado.id
    }

    let responsavelPrincipalId =
      anterior.responsavelPrincipalId

    if (
      dados.responsavelPrincipalId !==
        undefined &&
      dados.responsavelPrincipalId !==
        anterior.responsavelPrincipalId
    ) {
      if (
        sessao.perfil ===
        "Preposto"
      ) {
        return NextResponse.json(
          {
            error:
              "Preposto não pode transferir a responsabilidade principal por este cadastro.",
          },
          {
            status: 403,
          }
        )
      }

      const novoResponsavel =
        textoObrigatorio(
          dados.responsavelPrincipalId
        )

      if (!novoResponsavel) {
        return NextResponse.json(
          {
            error:
              "Informe um responsável válido.",
          },
          {
            status: 400,
          }
        )
      }

      const usuario =
        await prisma.usuario
          .findFirst({
            where: {
              id:
                novoResponsavel,

              escritorioId:
                sessao.escritorioId,

              ativo: true,
            },

            select: {
              id: true,
            },
          })

      if (!usuario) {
        return NextResponse.json(
          {
            error:
              "Responsável não encontrado ou inativo neste escritório.",
          },
          {
            status: 400,
          }
        )
      }

      responsavelPrincipalId =
        usuario.id
    }

    if (
      dados.aceitaEmail !==
        undefined &&
      typeof dados.aceitaEmail !==
        "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Preferência de e-mail inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const termometroRelacionamento =
      campoTermometroRelacionamento(
        dados,
        anterior
          .termometroRelacionamento
      )

    const alteracoes:
      Prisma.ClienteUncheckedUpdateManyInput =
      {
        razaoSocial,

        nomeFantasia:
          campoOpcional(
            dados,
            "nomeFantasia",
            anterior.nomeFantasia
          ),

        cnpj,

        inscricaoEstadual:
          campoOpcional(
            dados,
            "inscricaoEstadual",
            anterior
              .inscricaoEstadual
          ),

        contato:
          campoOpcional(
            dados,
            "contato",
            anterior.contato
          ),

        cargo:
          campoOpcional(
            dados,
            "cargo",
            anterior.cargo
          ),

        email:
          campoOpcional(
            dados,
            "email",
            anterior.email
          ),

        telefone:
          campoOpcional(
            dados,
            "telefone",
            anterior.telefone
          ),

        whatsapp:
          campoOpcional(
            dados,
            "whatsapp",
            anterior.whatsapp
          ),

        endereco:
          campoOpcional(
            dados,
            "endereco",
            anterior.endereco
          ),

        bairro:
          campoOpcional(
            dados,
            "bairro",
            anterior.bairro
          ),

        cidade:
          campoOpcional(
            dados,
            "cidade",
            anterior.cidade
          ),

        estado:
          campoOpcional(
            dados,
            "estado",
            anterior.estado
          ),

        cep:
          campoOpcional(
            dados,
            "cep",
            anterior.cep
          ),

        regiao:
          campoOpcional(
            dados,
            "regiao",
            anterior.regiao
          ),

        rota:
          campoOpcional(
            dados,
            "rota",
            anterior.rota
          ),

        categoria:
          campoOpcional(
            dados,
            "categoria",
            anterior.categoria
          ),

        termometroRelacionamento,

        observacoes:
          campoOpcional(
            dados,
            "observacoes",
            anterior.observacoes
          ),

        aceitaEmail:
          dados.aceitaEmail ===
          undefined
            ? anterior.aceitaEmail
            : dados.aceitaEmail,

        responsavelPrincipalId,

        status,
      }

    const atualizado =
      await prisma.$transaction(
        async (tx) => {
          if (
            cnpj &&
            (
              mudouCnpj ||
              formalizando
            )
          ) {
            // Conferência preventiva, sem garantia de unicidade em concorrência.
            const outros =
              await tx.cliente
                .findMany({
                  where: {
                    escritorioId:
                      sessao.escritorioId,

                    id: {
                      not:
                        anterior.id,
                    },

                    cnpj: {
                      not: null,
                    },
                  },

                  select: {
                    cnpj: true,
                  },
                })

            const normalizado =
              cnpjNormalizado(
                cnpj
              )

            if (
              outros.some(
                (outro) =>
                  outro.cnpj &&
                  cnpjNormalizado(
                    outro.cnpj
                  ) ===
                    normalizado
              )
            ) {
              throw new Error(
                "CNPJ_DUPLICADO"
              )
            }
          }

          const resultado =
            await tx.cliente
              .updateMany({
                where: {
                  id:
                    anterior.id,

                  escritorioId:
                    sessao.escritorioId,

                  status:
                    anterior.status,

                  atualizadoEm:
                    anterior.atualizadoEm,
                },

                data:
                  alteracoes,
              })

          if (
            resultado.count !==
            1
          ) {
            throw new Error(
              "CLIENTE_ALTERADO"
            )
          }

          const depois =
            await tx.cliente
              .findUniqueOrThrow({
                where: {
                  id:
                    anterior.id,
                },
              })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "Cliente",

              entidadeId:
                depois.id,

              acao:
                formalizando
                  ? "FORMALIZACAO_APOS_ACEITE"
                  : "EDICAO",

              dadosAntes:
                snapshotJson(
                  anterior
                ),

              dadosDepois: {
                ...snapshotJson(
                  depois
                ),

                ...(formalizando
                  ? {
                      confirmacaoFormalizacao:
                        true,

                      orcamentoAprovadoId,
                    }
                  : {}),
              },
            },
          })

          return depois
        }
      )

    return NextResponse.json(
      atualizado
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "CAMPO_INVALIDO"
    ) {
      return NextResponse.json(
        {
          error:
            "Um dos campos cadastrais possui valor inválido.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "TERMOMETRO_INVALIDO"
    ) {
      return NextResponse.json(
        {
          error:
            "Classificação de relacionamento inválida. Use Verde, Azul, Amarelo, Laranja, Vermelho ou deixe sem classificação.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "CNPJ_DUPLICADO"
    ) {
      return NextResponse.json(
        {
          error:
            "Este CNPJ já aparece em outro cadastro do escritório. Verifique os Clientes existentes antes de formalizar.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "CLIENTE_ALTERADO"
    ) {
      return NextResponse.json(
        {
          error:
            "Este Cliente foi alterado por outra operação. Recarregue o cadastro antes de salvar.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "ATENCAO_ALTERADA"
    ) {
      return NextResponse.json(
        {
          error:
            "Esta Atenção Comercial foi alterada por outra operação. Recarregue o Cliente antes de continuar.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao atualizar cliente:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Erro ao atualizar cliente",
      },
      {
        status: 500,
      }
    )
  }
}

// Exclusão física bloqueada para preservar Orçamentos, Vendas, participação e auditoria.
export async function DELETE() {
  try {
    await exigirSessao()

    return NextResponse.json(
      {
        error:
          "Exclusão física de Cliente bloqueada. Preserve o cadastro e seu histórico comercial.",
      },
      {
        status: 405,
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
          error:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    return NextResponse.json(
      {
        error:
          "Operação não permitida.",
      },
      {
        status: 405,
      }
    )
  }
}