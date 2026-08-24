import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextRequest, NextResponse } from "next/server"

function filtroAcessoVenda(
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
          OR: [
            { responsavelId: usuarioId },
            { criadoPorId: usuarioId },
          ],
        }
      : {}),
  }
}

function dataValida(valor: unknown) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data = new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
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

  if (
    !Number.isFinite(numero)
  ) {
    return null
  }

  return numero
}

function regraEstaVigente(
  vigenciaInicio: Date,
  vigenciaFim: Date | null,
  agora: Date
) {
  if (
    vigenciaInicio > agora
  ) {
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

export async function GET(
  request: NextRequest,
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

    const venda =
      await prisma.venda.findFirst({
        where:
          filtroAcessoVenda(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        include: {
          cliente: true,

          representada: true,

          regraComercial: true,

          orcamentoOrigem: {
            include: {
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

          faturamentos: {
            orderBy: {
              dataFaturamento:
                "desc",
            },
          },

          comissoes: {
            orderBy: {
              data: "desc",
            },
          },
        },
      })

    if (!venda) {
      return NextResponse.json(
        {
          message:
            "Venda não encontrada ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      venda
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
      "Erro ao buscar venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar venda.",
      },
      {
        status: 500,
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

    const vendaExistente =
      await prisma.venda.findFirst({
        where:
          filtroAcessoVenda(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        include: {
          cliente: true,
          representada: true,
          regraComercial: true,

          orcamentoOrigem: {
            select: {
              id: true,
              numeroSequencial: true,
              clienteId: true,
              representadaId: true,
              valorTotal: true,
              condicaoPagamento: true,
            },
          },
        },
      })

    if (!vendaExistente) {
      return NextResponse.json(
        {
          message:
            "Venda não encontrada ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    let clienteId =
      vendaExistente.clienteId

    let representadaId =
      vendaExistente.representadaId

    let valorTotal =
      Number(
        vendaExistente.valorTotal ||
          0
      )

    let condicaoPagamento =
      vendaExistente.condicaoPagamento

    if (
      vendaExistente.orcamentoOrigem
    ) {
      clienteId =
        vendaExistente.orcamentoOrigem.clienteId

      representadaId =
        vendaExistente.orcamentoOrigem.representadaId

      valorTotal =
        Number(
          vendaExistente.orcamentoOrigem.valorTotal
        )

      condicaoPagamento =
        vendaExistente.orcamentoOrigem.condicaoPagamento
    } else {
      if (
        typeof body.clienteId ===
          "string" &&
        body.clienteId.trim() !==
          ""
      ) {
        clienteId =
          body.clienteId.trim()
      }

      if (
        typeof body.representadaId ===
          "string" &&
        body.representadaId.trim() !==
          ""
      ) {
        representadaId =
          body.representadaId.trim()
      }

      if (
        body.valorTotal !==
        undefined
      ) {
        const novoValor =
          numeroOpcional(
            body.valorTotal
          )

        if (
          novoValor === null ||
          novoValor <= 0
        ) {
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

        valorTotal =
          novoValor
      }

      if (
        body.condicaoPagamento !==
        undefined
      ) {
        condicaoPagamento =
          typeof body.condicaoPagamento ===
            "string" &&
          body.condicaoPagamento.trim() !==
            ""
            ? body.condicaoPagamento.trim()
            : null
      }
    }

    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id:
            clienteId,

          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
          status: true,
          cnpj: true,
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
      cliente.status !==
      "Ativo"
    ) {
      return NextResponse.json(
        {
          message:
            "O cliente precisa estar ativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !cliente.cnpj ||
      cliente.cnpj.trim() ===
        ""
    ) {
      return NextResponse.json(
        {
          message:
            "O cliente precisa possuir CNPJ cadastrado.",
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
            "A Representada precisa estar ativa.",
        },
        {
          status: 400,
        }
      )
    }

    const dataVenda =
      body.data !== undefined
        ? dataValida(body.data)
        : vendaExistente.data

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

    const desconto =
      body.desconto !==
      undefined
        ? numeroOpcional(
            body.desconto
          ) || 0
        : Number(
            vendaExistente.desconto ||
              0
          )

    const bonificacaoValor =
      body.bonificacaoValor !==
      undefined
        ? numeroOpcional(
            body.bonificacaoValor
          ) || 0
        : Number(
            vendaExistente.bonificacaoValor ||
              0
          )

    const agora =
      new Date()

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
              clienteId:
                null,

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
      regras.filter(
        (regra) =>
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
      | null =
      null

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
      body.previsaoFaturamento !==
      undefined
        ? body.previsaoFaturamento
          ? dataValida(
              body.previsaoFaturamento
            )
          : null
        : vendaExistente.previsaoFaturamento

    if (
      body.previsaoFaturamento &&
      !previsaoFaturamento
    ) {
      return NextResponse.json(
        {
          message:
            "Previsão de faturamento inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const status =
      typeof body.status ===
        "string" &&
      body.status.trim() !==
        ""
        ? body.status.trim()
        : vendaExistente.status

    const confirmadoEm =
      status ===
        "Confirmado" &&
      !vendaExistente.confirmadoEm
        ? new Date()
        : status !==
            "Confirmado"
          ? vendaExistente.confirmadoEm
          : vendaExistente.confirmadoEm

    const canceladoEm =
      status ===
        "Cancelado" &&
      !vendaExistente.canceladoEm
        ? new Date()
        : status !==
            "Cancelado"
          ? null
          : vendaExistente.canceladoEm

    const motivoCancelamento =
      status ===
      "Cancelado"
        ? typeof body.motivoCancelamento ===
            "string" &&
          body.motivoCancelamento.trim() !==
            ""
          ? body.motivoCancelamento.trim()
          : vendaExistente.motivoCancelamento
        : null

    const dadosAntes = {
      id:
        vendaExistente.id,

      data:
        vendaExistente.data,

      clienteId:
        vendaExistente.clienteId,

      representadaId:
        vendaExistente.representadaId,

      valorTotal:
        vendaExistente.valorTotal,

      desconto:
        vendaExistente.desconto,

      bonificacaoValor:
        vendaExistente.bonificacaoValor,

      condicaoPagamento:
        vendaExistente.condicaoPagamento,

      previsaoFaturamento:
        vendaExistente.previsaoFaturamento,

      status:
        vendaExistente.status,

      numeroPedido:
        vendaExistente.numeroPedido,

      numeroPedidoRepresentada:
        vendaExistente.numeroPedidoRepresentada,

      numeroOCCliente:
        vendaExistente.numeroOCCliente,

      observacoes:
        vendaExistente.observacoes,

      percentualComissaoAplicado:
        vendaExistente.percentualComissaoAplicado,

      valorComissaoPrevista:
        vendaExistente.valorComissaoPrevista,
    }

    const venda =
      await prisma.$transaction(
        async (tx) => {
          const atualizada =
            await tx.venda.update({
              where: {
                id:
                  vendaExistente.id,
              },

              data: {
                data:
                  dataVenda,

                clienteId,

                representadaId,

                regraComercialId:
                  regraAplicavel?.id ||
                  null,

                valorTotal,

                desconto,

                bonificacaoValor,

                condicaoPagamento,

                previsaoFaturamento,

                numeroPedido:
                  body.numeroPedido !==
                  undefined
                    ? typeof body.numeroPedido ===
                        "string" &&
                      body.numeroPedido.trim() !==
                        ""
                      ? body.numeroPedido.trim()
                      : null
                    : vendaExistente.numeroPedido,

                numeroPedidoRepresentada:
                  body.numeroPedidoRepresentada !==
                  undefined
                    ? typeof body.numeroPedidoRepresentada ===
                        "string" &&
                      body.numeroPedidoRepresentada.trim() !==
                        ""
                      ? body.numeroPedidoRepresentada.trim()
                      : null
                    : vendaExistente.numeroPedidoRepresentada,

                numeroOCCliente:
                  body.numeroOCCliente !==
                  undefined
                    ? typeof body.numeroOCCliente ===
                        "string" &&
                      body.numeroOCCliente.trim() !==
                        ""
                      ? body.numeroOCCliente.trim()
                      : null
                    : vendaExistente.numeroOCCliente,

                produto:
                  body.produto !==
                  undefined
                    ? typeof body.produto ===
                        "string" &&
                      body.produto.trim() !==
                        ""
                      ? body.produto.trim()
                      : null
                    : vendaExistente.produto,

                quantidade:
                  body.quantidade !==
                  undefined
                    ? numeroOpcional(
                        body.quantidade
                      ) !== null
                      ? Math.trunc(
                          Number(
                            body.quantidade
                          )
                        )
                      : null
                    : vendaExistente.quantidade,

                percentualComissaoAplicado:
                  percentualComissao,

                baseCalculoComissao,

                valorComissaoPrevista,

                comissao:
                  valorComissaoPrevista,

                regraReconhecimentoComissao:
                  regraAplicavel?.reconhecimentoComissao ||
                  representada.regraReconhecimentoComissao ||
                  null,

                status,

                confirmadoEm,

                canceladoEm,

                motivoCancelamento,

                observacoes:
                  body.observacoes !==
                  undefined
                    ? typeof body.observacoes ===
                        "string" &&
                      body.observacoes.trim() !==
                        ""
                      ? body.observacoes.trim()
                      : null
                    : vendaExistente.observacoes,

                responsavelId:
                  sessao.perfil ===
                  "Preposto"
                    ? sessao.usuarioId
                    : typeof body.responsavelId ===
                          "string" &&
                        body.responsavelId.trim() !==
                          ""
                      ? body.responsavelId.trim()
                      : vendaExistente.responsavelId,
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
                atualizada.id,

              acao:
                "EDICAO",

              dadosAntes,

              dadosDepois: {
                id:
                  atualizada.id,

                data:
                  atualizada.data,

                clienteId:
                  atualizada.clienteId,

                representadaId:
                  atualizada.representadaId,

                valorTotal:
                  atualizada.valorTotal,

                desconto:
                  atualizada.desconto,

                bonificacaoValor:
                  atualizada.bonificacaoValor,

                condicaoPagamento:
                  atualizada.condicaoPagamento,

                previsaoFaturamento:
                  atualizada.previsaoFaturamento,

                status:
                  atualizada.status,

                numeroPedido:
                  atualizada.numeroPedido,

                numeroPedidoRepresentada:
                  atualizada.numeroPedidoRepresentada,

                numeroOCCliente:
                  atualizada.numeroOCCliente,

                observacoes:
                  atualizada.observacoes,

                percentualComissaoAplicado:
                  atualizada.percentualComissaoAplicado,

                valorComissaoPrevista:
                  atualizada.valorComissaoPrevista,
              },
            },
          })

          return atualizada
        }
      )

    return NextResponse.json(
      venda
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
      "Erro ao atualizar venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar venda.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE(
  request: NextRequest,
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

    const vendaExistente =
      await prisma.venda.findFirst({
        where:
          filtroAcessoVenda(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        include: {
          faturamentos: {
            select: {
              id: true,
            },
          },

          comissoes: {
            select: {
              id: true,
            },
          },

          financeiros: {
            select: {
              id: true,
            },
          },
        },
      })

    if (!vendaExistente) {
      return NextResponse.json(
        {
          message:
            "Venda não encontrada ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      vendaExistente.faturamentos.length >
        0 ||
      vendaExistente.comissoes.length >
        0 ||
      vendaExistente.financeiros.length >
        0
    ) {
      return NextResponse.json(
        {
          message:
            "Esta venda já possui movimentos vinculados e não pode ser excluída.",
        },
        {
          status: 409,
        }
      )
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.auditoria.create({
          data: {
            escritorioId:
              sessao.escritorioId,

            usuarioId:
              sessao.usuarioId,

            entidade:
              "Venda",

            entidadeId:
              vendaExistente.id,

            acao:
              "EXCLUSAO",

            dadosAntes: {
              id:
                vendaExistente.id,

              data:
                vendaExistente.data,

              clienteId:
                vendaExistente.clienteId,

              representadaId:
                vendaExistente.representadaId,

              orcamentoOrigemId:
                vendaExistente.orcamentoOrigemId,

              valorTotal:
                vendaExistente.valorTotal,

              status:
                vendaExistente.status,
            },
          },
        })

        await tx.venda.delete({
          where: {
            id:
              vendaExistente.id,
          },
        })
      }
    )

    return NextResponse.json({
      message:
        "Venda excluída com sucesso.",
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
      "Erro ao excluir venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir venda.",
      },
      {
        status: 500,
      }
    )
  }
}