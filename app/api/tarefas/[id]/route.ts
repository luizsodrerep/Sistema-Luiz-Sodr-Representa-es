import {
  Prisma,
} from "@prisma/client"

import {
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

const ACOES_PERMITIDAS = [
  "concluir",
  "cancelar",
  "reabrir",
] as const

function possuiCampo(
  objeto: Record<string, unknown>,
  campo: string
): boolean {
  return Object.prototype.hasOwnProperty.call(
    objeto,
    campo
  )
}

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

  if (
    typeof valor !== "string"
  ) {
    throw new Error(
      `DATA_INVALIDA:${campo}`
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
      `DATA_INVALIDA:${campo}`
    )
  }

  return data
}

function mensagemData(
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

export async function PATCH(
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

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "agenda",
        "editar"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para editar itens da Agenda.",
        },
        {
          status: 403,
        }
      )
    }

    const {
      id,
    } =
      await params

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
            "Dados de atualização inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * O item sempre precisa pertencer
     * ao escritório autenticado.
     *
     * Preposto somente pode editar
     * item criado por ele ou atribuído
     * a ele.
     */
    const tarefaAtual =
      await prisma.tarefa.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,

          ...(sessao.perfil ===
          "Preposto"
            ? {
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
              }
            : {}),
        },
      })

    if (!tarefaAtual) {
      return NextResponse.json(
        {
          message:
            "Item da Agenda não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    const dados:
      Prisma.TarefaUncheckedUpdateInput =
        {}

    /*
     * ACAO OPERACIONAL
     *
     * O status não pode ser alterado
     * livremente pelo cliente.
     *
     * Apenas estas transições são
     * aceitas pela API:
     *
     * concluir
     * cancelar
     * reabrir
     */
    if (
      possuiCampo(
        body,
        "acao"
      )
    ) {
      const acao =
        textoOpcional(
          body.acao
        )

      if (
        !acao ||
        !ACOES_PERMITIDAS.includes(
          acao as
            (typeof ACOES_PERMITIDAS)[number]
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Ação inválida para o item da Agenda.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        acao ===
        "concluir"
      ) {
        dados.status =
          "Concluida"

        dados.concluidoEm =
          new Date()

        dados.canceladoEm =
          null
      }

      if (
        acao ===
        "cancelar"
      ) {
        dados.status =
          "Cancelada"

        dados.canceladoEm =
          new Date()

        dados.concluidoEm =
          null
      }

      if (
        acao ===
        "reabrir"
      ) {
        dados.status =
          "Pendente"

        dados.concluidoEm =
          null

        dados.canceladoEm =
          null
      }
    }

    /*
     * TITULO
     */
    if (
      possuiCampo(
        body,
        "titulo"
      )
    ) {
      const titulo =
        textoOpcional(
          body.titulo
        )

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

      dados.titulo =
        titulo
    }

    /*
     * DESCRICAO
     */
    if (
      possuiCampo(
        body,
        "descricao"
      )
    ) {
      dados.descricao =
        textoOpcional(
          body.descricao
        )
    }

    /*
     * OBSERVACOES
     */
    if (
      possuiCampo(
        body,
        "observacoes"
      )
    ) {
      dados.observacoes =
        textoOpcional(
          body.observacoes
        )
    }

    /*
     * TIPO
     */
    let tipoFinal =
      tarefaAtual.tipo

    if (
      possuiCampo(
        body,
        "tipo"
      )
    ) {
      const tipo =
        textoOpcional(
          body.tipo
        )

      if (
        !tipo ||
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

      tipoFinal =
        tipo

      dados.tipo =
        tipo
    }

    /*
     * PRIORIDADE
     */
    if (
      possuiCampo(
        body,
        "prioridade"
      )
    ) {
      const prioridade =
        textoOpcional(
          body.prioridade
        )

      if (
        !prioridade ||
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

      dados.prioridade =
        prioridade
    }

    /*
     * DATAS
     *
     * Calculamos o estado final antes
     * de atualizar para impedir:
     *
     * - Compromisso sem início;
     * - fim sem início;
     * - fim anterior ao início.
     */
    let inicioFinal =
      tarefaAtual.inicioEm

    let fimFinal =
      tarefaAtual.fimEm

    if (
      possuiCampo(
        body,
        "inicioEm"
      )
    ) {
      inicioFinal =
        converterDataOpcional(
          body.inicioEm,
          "inicioEm"
        )

      dados.inicioEm =
        inicioFinal
    }

    if (
      possuiCampo(
        body,
        "fimEm"
      )
    ) {
      fimFinal =
        converterDataOpcional(
          body.fimEm,
          "fimEm"
        )

      dados.fimEm =
        fimFinal
    }

    if (
      possuiCampo(
        body,
        "vencimentoEm"
      )
    ) {
      dados.vencimentoEm =
        converterDataOpcional(
          body.vencimentoEm,
          "vencimentoEm"
        )
    }

    if (
      tipoFinal ===
        "Compromisso" &&
      !inicioFinal
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
      fimFinal &&
      !inicioFinal
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
      inicioFinal &&
      fimFinal &&
      fimFinal.getTime() <
        inicioFinal.getTime()
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

    /*
     * RESPONSAVEL
     *
     * Diretor e Administrativo podem
     * atribuir a usuário ativo do
     * mesmo escritório.
     *
     * Preposto somente pode manter
     * a responsabilidade consigo.
     */
    if (
      possuiCampo(
        body,
        "responsavelId"
      )
    ) {
      const responsavelInformado =
        textoOpcional(
          body.responsavelId
        )

      if (
        sessao.perfil ===
        "Preposto"
      ) {
        if (
          responsavelInformado &&
          responsavelInformado !==
            sessao.usuarioId
        ) {
          return NextResponse.json(
            {
              message:
                "Preposto não pode atribuir item da Agenda a outro usuário.",
            },
            {
              status: 403,
            }
          )
        }

        dados.responsavelId =
          sessao.usuarioId
      } else if (
        !responsavelInformado
      ) {
        dados.responsavelId =
          null
      } else {
        const responsavel =
          await prisma.usuario.findFirst(
            {
              where: {
                id:
                  responsavelInformado,

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

        dados.responsavelId =
          responsavel.id
      }
    }

    /*
     * Nenhuma alteração reconhecida.
     */
    if (
      Object.keys(
        dados
      ).length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Nenhuma alteração válida foi informada.",
        },
        {
          status: 400,
        }
      )
    }

    const tarefaAtualizada =
      await prisma.tarefa.update({
        where: {
          id:
            tarefaAtual.id,
        },

        data:
          dados,

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
      tarefaAtualizada
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
        error.message.split(
          ":"
        )[1] ?? ""

      return NextResponse.json(
        {
          message:
            mensagemData(
              campo
            ),
        },
        {
          status: 400,
        }
      )
    }

    console.error(
      "Erro ao atualizar item da Agenda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar item da Agenda.",
      },
      {
        status: 500,
      }
    )
  }
}