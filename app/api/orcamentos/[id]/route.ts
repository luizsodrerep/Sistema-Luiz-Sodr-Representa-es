import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

const STATUS_PERMITIDOS = [
  "Pendente",
  "Aprovado",
  "Recusado",
  "Cancelado",
]

function textoOpcional(valor: unknown) {
  return typeof valor === "string" && valor.trim() !== ""
    ? valor.trim()
    : null
}

function dataValida(valor: unknown): Date | null {
  if (typeof valor !== "string" || valor.trim() === "") {
    return null
  }

  const data = new Date(valor)

  return Number.isNaN(data.getTime()) ? null : data
}

function regraEstaVigente(
  vigenciaInicio: Date,
  vigenciaFim: Date | null,
  referencia: Date
) {
  if (vigenciaInicio > referencia) {
    return false
  }

  if (vigenciaFim && vigenciaFim < referencia) {
    return false
  }

  return true
}

function formatarCodigoOrcamento(numeroSequencial: number) {
  return `ORC-${String(numeroSequencial).padStart(6, "0")}`
}

function snapshotOrcamento(orcamento: {
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
}) {
  return {
    id: orcamento.id,
    numeroSequencial: orcamento.numeroSequencial,
    escritorioId: orcamento.escritorioId,
    interacaoOrigemId: orcamento.interacaoOrigemId,
    clienteId: orcamento.clienteId,
    representadaId: orcamento.representadaId,
    criadoPorId: orcamento.criadoPorId,
    responsavelId: orcamento.responsavelId,
    data: orcamento.data.toISOString(),
    validadeEm: orcamento.validadeEm.toISOString(),
    valorTotal: orcamento.valorTotal,
    condicaoPagamento: orcamento.condicaoPagamento,
    descricao: orcamento.descricao,
    status: orcamento.status,
    enviadoEm: orcamento.enviadoEm
      ? orcamento.enviadoEm.toISOString()
      : null,
    finalizadoEm: orcamento.finalizadoEm
      ? orcamento.finalizadoEm.toISOString()
      : null,
    motivoFinalizacao: orcamento.motivoFinalizacao,
    arquivoUrl: orcamento.arquivoUrl,
    observacoes: orcamento.observacoes,
    criadoEm: orcamento.criadoEm.toISOString(),
    atualizadoEm: orcamento.atualizadoEm.toISOString(),
  }
}

function filtroAcessoOrcamento(
  escritorioId: string,
  usuarioId: string,
  perfil: string,
  id: string
) {
  return {
    id,
    escritorioId,

    ...(perfil === "Preposto"
      ? {
          cliente: {
            is: {
              escritorioId,
              OR: [
                {
                  responsavelPrincipalId: usuarioId,
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
      : {}),
  }
}

const INCLUDE_ORCAMENTO = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      razaoSocial: true,
      nomeFantasia: true,
      cnpj: true,
      contato: true,
      telefone: true,
      whatsapp: true,
      email: true,
    },
  },

  representada: {
    select: {
      id: true,
      nome: true,
      cnpj: true,
      contatoPrincipal: true,
      telefonePrincipal: true,
      whatsappPrincipal: true,
      emailPrincipal: true,
    },
  },

  interacaoOrigem: {
    select: {
      id: true,
      numeroSequencial: true,
      tipo: true,
      assunto: true,
      data: true,
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

  vendaGerada: {
    select: {
      id: true,
      numeroSequencial: true,
      status: true,
      data: true,
      pedidoEnviadoEm: true,
      confirmadoEm: true,
      numeroPedidoRepresentada: true,
    },
  },
} satisfies Prisma.OrcamentoInclude

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
    const sessao = await exigirSessao()
    const { id } = await params

    const orcamento = await prisma.orcamento.findFirst({
      where: filtroAcessoOrcamento(
        sessao.escritorioId,
        sessao.usuarioId,
        sessao.perfil,
        id
      ),

      include: INCLUDE_ORCAMENTO,
    })

    if (!orcamento) {
      return NextResponse.json(
        {
          message:
            "Orçamento não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(orcamento)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message: "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    console.error("Erro ao buscar orçamento:", error)

    return NextResponse.json(
      {
        message: "Erro ao buscar orçamento.",
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
    const sessao = await exigirSessao()
    const { id } = await params
    const body = await request.json()

    const orcamentoExistente =
      await prisma.orcamento.findFirst({
        where: filtroAcessoOrcamento(
          sessao.escritorioId,
          sessao.usuarioId,
          sessao.perfil,
          id
        ),

        include: {
          vendaGerada: {
            select: {
              id: true,
              numeroSequencial: true,
              status: true,
            },
          },
        },
      })

    if (!orcamentoExistente) {
      return NextResponse.json(
        {
          message:
            "Orçamento não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    const clienteId =
      typeof body.clienteId === "string" &&
      body.clienteId.trim() !== ""
        ? body.clienteId.trim()
        : orcamentoExistente.clienteId

    const representadaId =
      typeof body.representadaId === "string" &&
      body.representadaId.trim() !== ""
        ? body.representadaId.trim()
        : orcamentoExistente.representadaId

    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        escritorioId: sessao.escritorioId,

        ...(sessao.perfil === "Preposto"
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

    if (!cliente.cnpj || cliente.cnpj.trim() === "") {
      return NextResponse.json(
        {
          message:
            "O cliente precisa possuir CNPJ cadastrado para receber orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    if (cliente.status !== "Ativo") {
      return NextResponse.json(
        {
          message:
            "O cliente precisa estar ativo para movimentar o orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    const representada =
      await prisma.representada.findFirst({
        where: {
          id: representadaId,
          escritorioId: sessao.escritorioId,
        },

        select: {
          id: true,
          status: true,
          comissao: true,
          regraReconhecimentoComissao: true,
        },
      })

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

    if (representada.status !== "Ativa") {
      return NextResponse.json(
        {
          message:
            "A Representada precisa estar ativa para movimentar o orçamento.",
        },
        {
          status: 400,
        }
      )
    }

    let valorTotal = orcamentoExistente.valorTotal

    if (body.valorTotal !== undefined) {
      const valor = Number(body.valorTotal)

      if (!Number.isFinite(valor) || valor <= 0) {
        return NextResponse.json(
          {
            message:
              "Valor total do orçamento deve ser maior que zero.",
          },
          {
            status: 400,
          }
        )
      }

      valorTotal = valor
    }

    let validadeEm = orcamentoExistente.validadeEm

    if (body.validadeEm !== undefined) {
      const validade = dataValida(body.validadeEm)

      if (!validade) {
        return NextResponse.json(
          {
            message:
              "Data de validade do orçamento é inválida.",
          },
          {
            status: 400,
          }
        )
      }

      validadeEm = validade
    }

    let status = orcamentoExistente.status

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !STATUS_PERMITIDOS.includes(body.status)
      ) {
        return NextResponse.json(
          {
            message:
              "Status de orçamento inválido.",
          },
          {
            status: 400,
          }
        )
      }

      status = body.status
    }

    let enviadoEm = orcamentoExistente.enviadoEm

    if (body.enviadoEm !== undefined) {
      if (body.enviadoEm === null || body.enviadoEm === "") {
        enviadoEm = null
      } else {
        const dataEnvio = dataValida(body.enviadoEm)

        if (!dataEnvio) {
          return NextResponse.json(
            {
              message:
                "Data de envio do orçamento é inválida.",
            },
            {
              status: 400,
            }
          )
        }

        enviadoEm = dataEnvio
      }
    }

    /*
     * O orçamento precisa ter sido enviado ao cliente
     * antes de registrar o aceite/aprovação.
     */
    if (status === "Aprovado" && !enviadoEm) {
      return NextResponse.json(
        {
          message:
            "O orçamento precisa ser marcado como enviado ao cliente antes da aprovação.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Se já existe Venda gerada por este orçamento,
     * o vínculo comercial não pode ser desfeito.
     */
    if (
      orcamentoExistente.vendaGerada &&
      status !== "Aprovado"
    ) {
      return NextResponse.json(
        {
          message:
            "Este orçamento já gerou uma Venda e não pode retornar para outro status.",
          vendaId: orcamentoExistente.vendaGerada.id,
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Após gerar a Venda, Cliente, Representada, valor
     * e condição de pagamento não podem divergir do ORC.
     */
    if (orcamentoExistente.vendaGerada) {
      const tentouAlterarCliente =
        clienteId !== orcamentoExistente.clienteId

      const tentouAlterarRepresentada =
        representadaId !== orcamentoExistente.representadaId

      const tentouAlterarValor =
        valorTotal !== orcamentoExistente.valorTotal

      const condicaoSolicitada =
        body.condicaoPagamento !== undefined
          ? textoOpcional(body.condicaoPagamento)
          : orcamentoExistente.condicaoPagamento

      const tentouAlterarCondicao =
        condicaoSolicitada !==
        orcamentoExistente.condicaoPagamento

      if (
        tentouAlterarCliente ||
        tentouAlterarRepresentada ||
        tentouAlterarValor ||
        tentouAlterarCondicao
      ) {
        return NextResponse.json(
          {
            message:
              "Cliente, Representada, valor e condição de pagamento não podem ser alterados após a geração da Venda.",
            vendaId: orcamentoExistente.vendaGerada.id,
          },
          {
            status: 409,
          }
        )
      }
    }

    const statusFinal =
      status === "Aprovado" ||
      status === "Recusado" ||
      status === "Cancelado"

    let finalizadoEm = orcamentoExistente.finalizadoEm
    let motivoFinalizacao =
      orcamentoExistente.motivoFinalizacao

    if (statusFinal) {
      if (
        orcamentoExistente.status !== status ||
        !finalizadoEm
      ) {
        finalizadoEm = new Date()
      }

      motivoFinalizacao =
        textoOpcional(body.motivoFinalizacao) ??
        motivoFinalizacao
    } else {
      finalizadoEm = null
      motivoFinalizacao = null
    }

    const responsavelId =
      sessao.perfil === "Preposto"
        ? sessao.usuarioId
        : typeof body.responsavelId === "string" &&
            body.responsavelId.trim() !== ""
          ? body.responsavelId.trim()
          : orcamentoExistente.responsavelId ??
            sessao.usuarioId

    if (responsavelId) {
      const responsavel =
        await prisma.usuario.findFirst({
          where: {
            id: responsavelId,
            escritorioId: sessao.escritorioId,
            ativo: true,
          },

          select: {
            id: true,
          },
        })

      if (!responsavel) {
        return NextResponse.json(
          {
            message:
              "Responsável pelo orçamento não encontrado ou inativo.",
          },
          {
            status: 400,
          }
        )
      }
    }

    let interacaoOrigemId =
      orcamentoExistente.interacaoOrigemId

    if (body.interacaoOrigemId !== undefined) {
      interacaoOrigemId =
        typeof body.interacaoOrigemId === "string" &&
        body.interacaoOrigemId.trim() !== ""
          ? body.interacaoOrigemId.trim()
          : null
    }

    if (interacaoOrigemId) {
      const interacao =
        await prisma.interacao.findFirst({
          where: {
            id: interacaoOrigemId,
            escritorioId: sessao.escritorioId,
          },

          select: {
            id: true,
            clienteId: true,
          },
        })

      if (!interacao) {
        return NextResponse.json(
          {
            message:
              "Interação de origem não encontrada.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        interacao.clienteId &&
        interacao.clienteId !== clienteId
      ) {
        return NextResponse.json(
          {
            message:
              "A interação de origem pertence a outro cliente.",
          },
          {
            status: 400,
          }
        )
      }
    }

    const condicaoPagamento =
      body.condicaoPagamento !== undefined
        ? textoOpcional(body.condicaoPagamento)
        : orcamentoExistente.condicaoPagamento

    /*
     * A Venda nasce somente quando o cliente aprova o ORC.
     * Antes de entrar na transação calculamos a política
     * comercial vigente que será congelada na Venda.
     */
    const deveCriarVenda =
      status === "Aprovado" &&
      !orcamentoExistente.vendaGerada

    let regraComercialId: string | null = null
    let percentualComissao: number | null = null
    let regraReconhecimentoComissao: string | null =
      representada.regraReconhecimentoComissao

    if (deveCriarVenda) {
      const referencia = new Date()

      const regras =
        await prisma.regraComercialRepresentada.findMany({
          where: {
            representadaId,
            ativa: true,

            OR: [
              {
                clienteId,
              },
              {
                clienteId: null,
                tipoEscopo: "Padrao",
              },
            ],
          },

          orderBy: {
            vigenciaInicio: "desc",
          },
        })

      const regrasVigentes = regras.filter((regra) =>
        regraEstaVigente(
          regra.vigenciaInicio,
          regra.vigenciaFim,
          referencia
        )
      )

      const regraEspecifica = regrasVigentes.find(
        (regra) => regra.clienteId === clienteId
      )

      const regraPadrao = regrasVigentes.find(
        (regra) =>
          regra.clienteId === null &&
          regra.tipoEscopo === "Padrao"
      )

      const regraAplicavel =
        regraEspecifica ?? regraPadrao ?? null

      regraComercialId = regraAplicavel?.id ?? null

      if (
        regraAplicavel?.percentualComissao !== null &&
        regraAplicavel?.percentualComissao !== undefined
      ) {
        percentualComissao = Number(
          regraAplicavel.percentualComissao
        )
      } else if (
        representada.comissao !== null &&
        representada.comissao !== undefined
      ) {
        percentualComissao = Number(representada.comissao)
      }

      if (
        percentualComissao !== null &&
        !Number.isFinite(percentualComissao)
      ) {
        percentualComissao = null
      }

      regraReconhecimentoComissao =
        regraAplicavel?.reconhecimentoComissao ??
        representada.regraReconhecimentoComissao ??
        null
    }

    const resultado = await prisma.$transaction(
      async (tx) => {
        const antes = snapshotOrcamento(
          orcamentoExistente
        )

        /*
         * Proteção adicional contra duas aprovações
         * simultâneas do mesmo orçamento.
         */
        const vendaJaExistente =
          await tx.venda.findUnique({
            where: {
              orcamentoOrigemId:
                orcamentoExistente.id,
            },

            select: {
              id: true,
              numeroSequencial: true,
            },
          })

        if (
          deveCriarVenda &&
          vendaJaExistente
        ) {
          throw new Error(
            "ORCAMENTO_JA_CONVERTIDO"
          )
        }

        const orcamento =
          await tx.orcamento.update({
            where: {
              id: orcamentoExistente.id,
            },

            data: {
              clienteId,
              representadaId,
              interacaoOrigemId,
              responsavelId,

              validadeEm,
              valorTotal,
              condicaoPagamento,

              descricao:
                body.descricao !== undefined
                  ? textoOpcional(body.descricao)
                  : orcamentoExistente.descricao,

              status,
              enviadoEm,
              finalizadoEm,
              motivoFinalizacao,

              arquivoUrl:
                body.arquivoUrl !== undefined
                  ? textoOpcional(body.arquivoUrl)
                  : orcamentoExistente.arquivoUrl,

              observacoes:
                body.observacoes !== undefined
                  ? textoOpcional(body.observacoes)
                  : orcamentoExistente.observacoes,
            },
          })

        const depois = snapshotOrcamento(orcamento)

        await tx.auditoria.create({
          data: {
            escritorioId: sessao.escritorioId,
            usuarioId: sessao.usuarioId,

            entidade: "Orcamento",
            entidadeId: orcamento.id,
            acao: "EDICAO",

            dadosAntes: antes,
            dadosDepois: depois,
          },
        })

        let vendaCriada:
          | {
              id: string
              numeroSequencial: number
            }
          | null = null

        if (deveCriarVenda) {
          const baseCalculoComissao = valorTotal

          const valorComissaoPrevista =
            percentualComissao !== null
              ? Number(
                  (
                    (baseCalculoComissao *
                      percentualComissao) /
                    100
                  ).toFixed(2)
                )
              : null

          const venda =
            await tx.venda.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                data: new Date(),

                clienteId,
                representadaId,

                regraComercialId,
                orcamentoOrigemId:
                  orcamento.id,

                criadoPorId:
                  sessao.usuarioId,

                responsavelId,

                valorTotal,

                desconto: 0,
                bonificacaoValor: 0,

                percentualComissaoAplicado:
                  percentualComissao,

                regraReconhecimentoComissao,

                baseCalculoComissao,

                valorComissaoPrevista,

                comissao:
                  valorComissaoPrevista,

                condicaoPagamento,

                /*
                 * Aprovação do cliente não significa
                 * envio à Representada.
                 */
                status:
                  "Aguardando envio",

                observacoes: null,
              },

              select: {
                id: true,
                numeroSequencial: true,
              },
            })

          vendaCriada = venda

          await tx.vendaEvento.create({
            data: {
              vendaId: venda.id,
              usuarioId:
                sessao.usuarioId,

              tipo: "Venda criada",

              canal: null,

              referencia:
                formatarCodigoOrcamento(
                  orcamento.numeroSequencial
                ),

              descricao:
                "Venda gerada automaticamente após aprovação do orçamento pelo cliente.",
            },
          })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade: "Venda",

              entidadeId:
                venda.id,

              acao: "CRIACAO",

              dadosDepois: {
                id: venda.id,
                numeroSequencial:
                  venda.numeroSequencial,

                origem: {
                  tipo: "Orcamento",
                  orcamentoId:
                    orcamento.id,
                  numeroSequencial:
                    orcamento.numeroSequencial,
                  interacaoOrigemId:
                    orcamento.interacaoOrigemId,
                },

                clienteId,
                representadaId,
                valorTotal,
                condicaoPagamento,

                regraComercialId,
                percentualComissaoAplicado:
                  percentualComissao,

                valorComissaoPrevista,

                status:
                  "Aguardando envio",
              },
            },
          })
        }

        return {
          orcamentoId:
            orcamento.id,

          vendaCriada,
        }
      }
    )

    const orcamento =
      await prisma.orcamento.findUnique({
        where: {
          id: resultado.orcamentoId,
        },

        include: INCLUDE_ORCAMENTO,
      })

    if (!orcamento) {
      return NextResponse.json(
        {
          message:
            "Orçamento atualizado, mas não foi possível recarregar o registro.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      ...orcamento,

      vendaCriada:
        resultado.vendaCriada,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message: "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "ORCAMENTO_JA_CONVERTIDO"
    ) {
      return NextResponse.json(
        {
          message:
            "Este orçamento já foi convertido em Venda.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Este orçamento já possui uma Venda vinculada.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao atualizar orçamento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar orçamento.",
      },
      {
        status: 500,
      }
    )
  }
}

/*
 * Exclusão física permanece bloqueada.
 *
 * Correções operacionais devem ocorrer por edição,
 * cancelamento ou alteração auditada do status.
 */
export async function DELETE() {
  try {
    await exigirSessao()

    return NextResponse.json(
      {
        message:
          "Exclusão de orçamento bloqueada. Utilize edição ou cancelamento para preservar o histórico comercial.",
      },
      {
        status: 405,
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message: "Não autenticado",
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