import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextRequest, NextResponse } from "next/server"

function dataValida(valor: unknown) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return null
  }

  return data
}

function numeroPositivo(valor: unknown) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(valor)

  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    return null
  }

  return numero
}

function numeroOpcional(valor: unknown) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(valor)

  if (!Number.isFinite(numero)) {
    return null
  }

  return numero
}

function regraEstaVigente(
  vigenciaInicio: Date,
  vigenciaFim: Date | null,
  agora: Date
) {
  if (vigenciaInicio > agora) {
    return false
  }

  if (
    vigenciaFim &&
    vigenciaFim < agora
  ) {
    return false
  }

  return true
}

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    const vendas =
      await prisma.venda.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          ...(sessao.perfil === "Preposto"
            ? {
                OR: [
                  {
                    responsavelId:
                      sessao.usuarioId,
                  },
                  {
                    criadoPorId:
                      sessao.usuarioId,
                  },
                ],
              }
            : {}),
        },

        include: {
          cliente: true,

          representada: true,

          regraComercial: true,

          orcamentoOrigem: {
            select: {
              id: true,
              numeroSequencial: true,
              status: true,

              interacaoOrigem: {
                select: {
                  id: true,
                  numeroSequencial: true,
                  tipo: true,
                  assunto: true,
                },
              },
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
            data: "desc",
          },
          {
            criadoEm: "desc",
          },
        ],
      })

    return NextResponse.json(vendas)
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

    console.error(
      "Erro ao listar vendas:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar vendas",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    const body =
      await request.json()

    const orcamentoOrigemId =
      typeof body.orcamentoOrigemId ===
        "string" &&
      body.orcamentoOrigemId.trim() !==
        ""
        ? body.orcamentoOrigemId.trim()
        : null

    const dataVenda =
      dataValida(body.data)

    if (!dataVenda) {
      return NextResponse.json(
        {
          message:
            "Informe uma data de venda válida.",
        },
        {
          status: 400,
        }
      )
    }

    let clienteId: string | null =
      typeof body.clienteId ===
        "string" &&
      body.clienteId.trim() !==
        ""
        ? body.clienteId.trim()
        : null

    let representadaId: string | null =
      typeof body.representadaId ===
        "string" &&
      body.representadaId.trim() !==
        ""
        ? body.representadaId.trim()
        : null

    let valorTotal =
      numeroPositivo(body.valorTotal)

    let condicaoPagamento:
      | string
      | null =
      typeof body.condicaoPagamento ===
        "string" &&
      body.condicaoPagamento.trim() !==
        ""
        ? body.condicaoPagamento.trim()
        : null

    let orcamentoOrigem:
      | {
          id: string
          numeroSequencial: number
          clienteId: string
          representadaId: string
          valorTotal: number
          condicaoPagamento:
            | string
            | null
          status: string
        }
      | null = null

    if (orcamentoOrigemId) {
      const orcamento =
        await prisma.orcamento.findFirst({
          where: {
            id: orcamentoOrigemId,
            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
            numeroSequencial: true,
            clienteId: true,
            representadaId: true,
            valorTotal: true,
            condicaoPagamento: true,
            status: true,

            vendaGerada: {
              select: {
                id: true,
              },
            },
          },
        })

      if (!orcamento) {
        return NextResponse.json(
          {
            message:
              "Orçamento de origem não encontrado neste escritório.",
          },
          {
            status: 404,
          }
        )
      }

      if (
        orcamento.status !==
        "Aprovado"
      ) {
        return NextResponse.json(
          {
            message:
              "Somente orçamento aprovado pode ser convertido em venda.",
          },
          {
            status: 400,
          }
        )
      }

      if (orcamento.vendaGerada) {
        return NextResponse.json(
          {
            message:
              "Este orçamento já possui uma venda vinculada.",
            vendaId:
              orcamento.vendaGerada.id,
          },
          {
            status: 409,
          }
        )
      }

      clienteId =
        orcamento.clienteId

      representadaId =
        orcamento.representadaId

      valorTotal =
        Number(
          orcamento.valorTotal
        )

      condicaoPagamento =
        orcamento.condicaoPagamento

      orcamentoOrigem = {
        id:
          orcamento.id,

        numeroSequencial:
          orcamento.numeroSequencial,

        clienteId:
          orcamento.clienteId,

        representadaId:
          orcamento.representadaId,

        valorTotal:
          Number(
            orcamento.valorTotal
          ),

        condicaoPagamento:
          orcamento.condicaoPagamento,

        status:
          orcamento.status,
      }
    }

    if (!clienteId) {
      return NextResponse.json(
        {
          message:
            "Cliente obrigatório.",
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
            "Representada obrigatória.",
        },
        {
          status: 400,
        }
      )
    }

    if (valorTotal === null) {
      return NextResponse.json(
        {
          message:
            "Informe um valor de venda maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id: clienteId,
          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
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
            "Cliente não encontrado neste escritório.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      cliente.status !== "Ativo"
    ) {
      return NextResponse.json(
        {
          message:
            "O cliente precisa estar ativo para registrar uma venda.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !cliente.cnpj ||
      cliente.cnpj.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "O cliente precisa possuir CNPJ cadastrado para registrar venda.",
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
        },

        select: {
          id: true,
          nome: true,
          status: true,
          comissao: true,
          regraReconhecimentoComissao:
            true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada neste escritório.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      representada.status !==
      "Ativa"
    ) {
      return NextResponse.json(
        {
          message:
            "A Representada precisa estar ativa para registrar uma venda.",
        },
        {
          status: 400,
        }
      )
    }

    const agora = new Date()

    const regras =
      await prisma.regraComercialRepresentada.findMany({
        where: {
          representadaId:
            representada.id,

          ativa: true,

          OR: [
            {
              clienteId:
                cliente.id,
            },
            {
              clienteId: null,
              tipoEscopo:
                "Padrao",
            },
          ],
        },

        orderBy: {
          vigenciaInicio:
            "desc",
        },
      })

    const regrasVigentes =
      regras.filter((regra) =>
        regraEstaVigente(
          regra.vigenciaInicio,
          regra.vigenciaFim,
          agora
        )
      )

    const regraEspecifica =
      regrasVigentes.find(
        (regra) =>
          regra.clienteId ===
          cliente.id
      )

    const regraPadrao =
      regrasVigentes.find(
        (regra) =>
          regra.clienteId ===
            null &&
          regra.tipoEscopo ===
            "Padrao"
      )

    const regraAplicavel =
      regraEspecifica ||
      regraPadrao ||
      null

    let percentualComissao:
      | number
      | null = null

    if (
      regraAplicavel
        ?.percentualComissao !==
        null &&
      regraAplicavel
        ?.percentualComissao !==
        undefined
    ) {
      percentualComissao =
        Number(
          regraAplicavel.percentualComissao
        )
    } else if (
      representada.comissao !==
        null &&
      representada.comissao !==
        undefined
    ) {
      percentualComissao =
        Number(
          representada.comissao
        )
    }

    if (
      percentualComissao !==
        null &&
      !Number.isFinite(
        percentualComissao
      )
    ) {
      percentualComissao =
        null
    }

    const desconto =
      numeroOpcional(
        body.desconto
      ) || 0

    const bonificacaoValor =
      numeroOpcional(
        body.bonificacaoValor
      ) || 0

    const baseCalculoComissao =
      Math.max(
        valorTotal -
          desconto -
          bonificacaoValor,
        0
      )

    const valorComissaoPrevista =
      percentualComissao !==
      null
        ? Number(
            (
              (baseCalculoComissao *
                percentualComissao) /
              100
            ).toFixed(2)
          )
        : null

    const previsaoFaturamento =
      dataValida(
        body.previsaoFaturamento
      )

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

    const status =
      typeof body.status ===
        "string" &&
      body.status.trim() !==
        ""
        ? body.status.trim()
        : "Pendente"

    const observacoes =
      typeof body.observacoes ===
        "string" &&
      body.observacoes.trim() !==
        ""
        ? body.observacoes.trim()
        : null

    const numeroPedidoInterno =
      typeof body.numeroPedidoInterno ===
        "string" &&
      body.numeroPedidoInterno.trim() !==
        ""
        ? body.numeroPedidoInterno.trim()
        : null

    const numeroPedido =
      typeof body.numeroPedido ===
        "string" &&
      body.numeroPedido.trim() !==
        ""
        ? body.numeroPedido.trim()
        : null

    const numeroPedidoRepresentada =
      typeof body.numeroPedidoRepresentada ===
        "string" &&
      body.numeroPedidoRepresentada.trim() !==
        ""
        ? body.numeroPedidoRepresentada.trim()
        : null

    const numeroOCCliente =
      typeof body.numeroOCCliente ===
        "string" &&
      body.numeroOCCliente.trim() !==
        ""
        ? body.numeroOCCliente.trim()
        : null

    const produto =
      typeof body.produto ===
        "string" &&
      body.produto.trim() !==
        ""
        ? body.produto.trim()
        : null

    const quantidade =
      numeroOpcional(
        body.quantidade
      )

    const resultado =
      await prisma.$transaction(
        async (tx) => {
          if (orcamentoOrigemId) {
            const vendaExistente =
              await tx.venda.findUnique({
                where: {
                  orcamentoOrigemId:
                    orcamentoOrigemId,
                },

                select: {
                  id: true,
                },
              })

            if (vendaExistente) {
              throw new Error(
                "ORCAMENTO_JA_CONVERTIDO"
              )
            }
          }

          const venda =
            await tx.venda.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                criadoPorId:
                  sessao.usuarioId,

                responsavelId,

                data:
                  dataVenda,

                clienteId,

                representadaId,

                regraComercialId:
                  regraAplicavel?.id ||
                  null,

                orcamentoOrigemId,

                numeroPedidoInterno,

                numeroPedido,

                numeroPedidoRepresentada,

                numeroOCCliente,

                produto,

                quantidade:
                  quantidade !==
                  null
                    ? Math.trunc(
                        quantidade
                      )
                    : null,

                valorTotal,

                desconto,

                comissao:
                  valorComissaoPrevista,

                percentualComissaoAplicado:
                  percentualComissao,

                regraReconhecimentoComissao:
                  regraAplicavel?.reconhecimentoComissao ||
                  representada.regraReconhecimentoComissao ||
                  null,

                baseCalculoComissao,

                valorComissaoPrevista,

                bonificacaoValor,

                condicaoPagamento,

                previsaoFaturamento,

                status,

                observacoes,
              },

              include: {
                cliente: true,

                representada: true,

                regraComercial: true,

                orcamentoOrigem: {
                  select: {
                    id: true,
                    numeroSequencial: true,
                    status: true,

                    interacaoOrigem: {
                      select: {
                        id: true,
                        numeroSequencial: true,
                        tipo: true,
                        assunto: true,
                      },
                    },
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

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "Venda",

              entidadeId:
                venda.id,

              acao:
                "CRIACAO",

              dadosDepois: {
                id:
                  venda.id,

                numeroSequencial:
                  venda.numeroSequencial,

                data:
                  venda.data,

                clienteId:
                  venda.clienteId,

                representadaId:
                  venda.representadaId,

                regraComercialId:
                  venda.regraComercialId,

                orcamentoOrigemId:
                  venda.orcamentoOrigemId,

                valorTotal:
                  venda.valorTotal,

                percentualComissaoAplicado:
                  venda.percentualComissaoAplicado,

                valorComissaoPrevista:
                  venda.valorComissaoPrevista,

                condicaoPagamento:
                  venda.condicaoPagamento,

                status:
                  venda.status,

                origem:
                  orcamentoOrigem
                    ? {
                        tipo:
                          "Orcamento",

                        id:
                          orcamentoOrigem.id,

                        numeroSequencial:
                          orcamentoOrigem.numeroSequencial,
                      }
                    : {
                        tipo:
                          "VendaDireta",
                      },
              },
            },
          })

          if (
            !orcamentoOrigemId
          ) {
            await tx.vendaEvento.create({
              data: {
                vendaId:
                  venda.id,

                usuarioId:
                  sessao.usuarioId,

                tipo:
                  "Venda criada",

                canal: null,

                referencia:
                  null,

                descricao:
                  "Venda direta ou retroativa registrada no CRM.",
              },
            })
          }

          return venda
        }
      )

    return NextResponse.json(
      resultado,
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
      error.message ===
        "ORCAMENTO_JA_CONVERTIDO"
    ) {
      return NextResponse.json(
        {
          message:
            "Este orçamento já foi convertido em venda.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao criar venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar venda.",
      },
      {
        status: 500,
      }
    )
  }
}