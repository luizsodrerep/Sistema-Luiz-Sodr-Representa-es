import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

const STATUS_FOLLOW_UP_PERMITIDOS = [
  "Aberto",
  "Em acompanhamento",
  "Finalizado",
  "Sem acompanhamento",
]

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

function filtroAcessoInteracao(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
) {
  return {
    id,
    escritorioId,
    ...(perfil === "Preposto"
      ? filtroCarteiraPreposto(
          escritorioId,
          usuarioId
        )
      : {}),
  }
}

function textoOpcional(
  valor: unknown
) {
  return typeof valor === "string" &&
    valor.trim() !== ""
    ? valor.trim()
    : null
}

function snapshotInteracao(
  interacao: {
    id: string
    numeroSequencial: number
    escritorioId: string | null

    data: Date

    clienteId: string | null
    representadaId: string | null
    vendaId: string | null

    criadoPorId: string | null
    responsavelId: string | null

    tipo: string

    assunto: string | null
    descricao: string | null
    resultado: string | null
    proximosPasso: string | null

    proximoContatoEm: Date | null
    statusFollowUp: string

    criadoEm: Date
    atualizadoEm: Date
  }
) {
  return {
    id: interacao.id,

    numeroSequencial:
      interacao.numeroSequencial,

    escritorioId:
      interacao.escritorioId,

    data:
      interacao.data.toISOString(),

    clienteId:
      interacao.clienteId,

    representadaId:
      interacao.representadaId,

    vendaId:
      interacao.vendaId,

    criadoPorId:
      interacao.criadoPorId,

    responsavelId:
      interacao.responsavelId,

    tipo:
      interacao.tipo,

    assunto:
      interacao.assunto,

    descricao:
      interacao.descricao,

    resultado:
      interacao.resultado,

    proximosPasso:
      interacao.proximosPasso,

    proximoContatoEm:
      interacao.proximoContatoEm
        ? interacao.proximoContatoEm.toISOString()
        : null,

    statusFollowUp:
      interacao.statusFollowUp,

    criadoEm:
      interacao.criadoEm.toISOString(),

    atualizadoEm:
      interacao.atualizadoEm.toISOString(),
  }
}

export async function GET(
  request: Request,
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

    const { id } =
      await params

    const interacao =
      await prisma.interacao.findFirst(
        {
          where:
            filtroAcessoInteracao(
              sessao.escritorioId,
              sessao.usuarioId,
              sessao.perfil,
              id
            ),

          include: {
            cliente: {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
                whatsapp: true,
                telefone: true,
                email: true,
                contato: true,
                cargo: true,
              },
            },

            representada: {
              select: {
                id: true,
                nome: true,
                cnpj: true,
                contatoPrincipal:
                  true,
                emailPrincipal:
                  true,
                telefonePrincipal:
                  true,
                whatsappPrincipal:
                  true,
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
        }
      )

    if (!interacao) {
      return NextResponse.json(
        {
          message:
            "Interação não encontrada ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      interacao
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
      "Erro ao buscar interação:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar interação.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: Request,
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

    const { id } =
      await params

    const body =
      await request.json()

    /*
     * Carregamos o estado integral antes
     * da alteração.
     *
     * Esse objeto será utilizado tanto
     * para autorização quanto para o
     * snapshot de auditoria.
     */
    const interacaoExistente =
      await prisma.interacao.findFirst(
        {
          where:
            filtroAcessoInteracao(
              sessao.escritorioId,
              sessao.usuarioId,
              sessao.perfil,
              id
            ),
        }
      )

    if (!interacaoExistente) {
      return NextResponse.json(
        {
          message:
            "Interação não encontrada ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    const clienteId =
      typeof body.clienteId ===
        "string" &&
      body.clienteId.trim() !== ""
        ? body.clienteId.trim()
        : null

    const representadaId =
      typeof body.representadaId ===
        "string" &&
      body.representadaId.trim() !== ""
        ? body.representadaId.trim()
        : null

    if (
      !clienteId &&
      !representadaId
    ) {
      return NextResponse.json(
        {
          message:
            "A interação precisa permanecer vinculada a um cliente ou representada.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      clienteId &&
      representadaId
    ) {
      return NextResponse.json(
        {
          message:
            "A interação não pode ser vinculada simultaneamente a cliente e representada.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      typeof body.tipo !==
        "string" ||
      body.tipo.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de interação é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    if (clienteId) {
      const cliente =
        await prisma.cliente.findFirst(
          {
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
                  }
                : {}),
            },

            select: {
              id: true,
            },
          }
        )

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

    if (representadaId) {
      if (
        sessao.perfil ===
        "Preposto"
      ) {
        return NextResponse.json(
          {
            message:
              "Seu perfil não possui permissão para alterar interações institucionais com representadas.",
          },
          {
            status: 403,
          }
        )
      }

      const representada =
        await prisma.representada.findFirst(
          {
            where: {
              id:
                representadaId,

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

    let proximoContatoEm:
      Date | null = null

    if (
      typeof body.proximoContatoEm ===
        "string" &&
      body.proximoContatoEm.trim() !==
        ""
    ) {
      const dataProximoContato =
        new Date(
          body.proximoContatoEm
        )

      if (
        Number.isNaN(
          dataProximoContato.getTime()
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Data do próximo acompanhamento é inválida.",
          },
          {
            status: 400,
          }
        )
      }

      proximoContatoEm =
        dataProximoContato
    }

    let statusFollowUp =
      typeof body.statusFollowUp ===
        "string" &&
      STATUS_FOLLOW_UP_PERMITIDOS.includes(
        body.statusFollowUp
      )
        ? body.statusFollowUp
        : proximoContatoEm
          ? "Aberto"
          : "Sem acompanhamento"

    if (
      statusFollowUp ===
        "Sem acompanhamento" &&
      proximoContatoEm
    ) {
      statusFollowUp =
        "Aberto"
    }

    if (
      statusFollowUp !==
        "Finalizado" &&
      !proximoContatoEm
    ) {
      statusFollowUp =
        "Sem acompanhamento"
    }

    const responsavelId =
      sessao.perfil ===
      "Preposto"
        ? sessao.usuarioId
        : typeof body.responsavelId ===
              "string" &&
            body.responsavelId.trim() !==
              ""
          ? body.responsavelId.trim()
          : sessao.usuarioId

    /*
     * IMPORTANTE:
     *
     * numeroSequencial,
     * criadoPorId e data original
     * NÃO fazem parte deste update.
     *
     * Assim, uma edição nunca gera
     * um novo código comercial e
     * nunca altera autoria/data original.
     */
    const resultado =
      await prisma.$transaction(
        async (
          tx
        ) => {
          const antes =
            snapshotInteracao(
              interacaoExistente
            )

          const interacao =
            await tx.interacao.update(
              {
                where: {
                  id:
                    interacaoExistente.id,
                },

                data: {
                  clienteId,
                  representadaId,

                  tipo:
                    body.tipo.trim(),

                  assunto:
                    textoOpcional(
                      body.assunto
                    ),

                  descricao:
                    textoOpcional(
                      body.descricao
                    ),

                  resultado:
                    textoOpcional(
                      body.resultado
                    ),

                  proximosPasso:
                    textoOpcional(
                      body.proximosPasso
                    ),

                  proximoContatoEm,

                  statusFollowUp,

                  responsavelId,
                },
              }
            )

          const depois =
            snapshotInteracao(
              interacao
            )

          /*
           * Auditoria e edição pertencem
           * à mesma transação.
           *
           * Se o INSERT da auditoria falhar,
           * o UPDATE da interação é revertido.
           */
          await tx.auditoria.create(
            {
              data: {
                escritorioId:
                  sessao.escritorioId,

                usuarioId:
                  sessao.usuarioId,

                entidade:
                  "Interacao",

                entidadeId:
                  interacao.id,

                acao:
                  "EDICAO",

                dadosAntes:
                  antes,

                dadosDepois:
                  depois,
              },
            }
          )

          return interacao
        }
      )

    /*
     * Após a transação, fazemos apenas
     * leitura para montar a resposta
     * completa da API.
     */
    const interacao =
      await prisma.interacao.findUnique(
        {
          where: {
            id:
              resultado.id,
          },

          include: {
            cliente: {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            },

            representada: {
              select: {
                id: true,
                nome: true,
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
        }
      )

    if (!interacao) {
      return NextResponse.json(
        {
          message:
            "Interação atualizada, mas não foi possível recarregar o registro.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json(
      interacao
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
      "Erro ao atualizar interação:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar interação.",
      },
      {
        status: 500,
      }
    )
  }
}

/*
 * Exclusão definitiva permanece
 * reservada ao mecanismo auditado
 * do Diretor.
 *
 * Até essa implementação estar pronta,
 * a API bloqueia exclusão física.
 */
export async function DELETE() {
  try {
    await exigirSessao()

    return NextResponse.json(
      {
        message:
          "Exclusão temporariamente bloqueada. Utilize a edição para corrigir o registro.",
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
          message:
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    return NextResponse.json(
      {
        message:
          "Operação não permitida.",
      },
      {
        status: 405,
      }
    )
  }
}