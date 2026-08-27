import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

const TIPOS_EVENTO = [
  "Pedido enviado",
  "Recebimento confirmado",
  "Pedido registrado",
  "Contato com Representada",
  "Alteração pós-envio",
  "Outro",
]

const CANAIS_EVENTO = [
  "E-mail",
  "WhatsApp",
  "Ligação",
  "Portal",
  "Presencial",
  "Outro",
]

class ErroApi extends Error {
  status: number

  constructor(
    mensagem: string,
    status: number
  ) {
    super(mensagem)
    this.name = "ErroApi"
    this.status = status
  }
}

function textoOpcional(
  valor: unknown
) {
  return typeof valor ===
    "string" &&
    valor.trim() !== ""
    ? valor.trim()
    : null
}

function dataValida(
  valor: unknown
): Date | null {
  if (
    typeof valor !==
      "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data =
    new Date(valor)

  return Number.isNaN(
    data.getTime()
  )
    ? null
    : data
}

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
            {
              responsavelId:
                usuarioId,
            },
            {
              criadoPorId:
                usuarioId,
            },
          ],
        }
      : {}),
  }
}

function respostaErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (
    error instanceof ErroApi
  ) {
    return NextResponse.json(
      {
        message:
          error.message,
      },
      {
        status:
          error.status,
      }
    )
  }

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
    mensagemPadrao,
    error
  )

  return NextResponse.json(
    {
      message:
        mensagemPadrao,
    },
    {
      status: 500,
    }
  )
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
  void request

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

        select: {
          id: true,
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

    const eventos =
      await prisma.vendaEvento.findMany({
        where: {
          vendaId:
            venda.id,
        },

        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },

        orderBy: [
          {
            data:
              "desc",
          },
          {
            criadoEm:
              "desc",
          },
        ],
      })

    return NextResponse.json(
      eventos
    )
  } catch (error) {
    return respostaErro(
      error,
      "Erro ao listar eventos da venda."
    )
  }
}

export async function POST(
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

    const venda =
      await prisma.venda.findFirst({
        where:
          filtroAcessoVenda(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        select: {
          id: true,
          numeroSequencial: true,
          status: true,
          pedidoEnviadoEm: true,
          confirmadoEm: true,
          numeroPedidoRepresentada: true,
          canceladoEm: true,

          orcamentoOrigem: {
            select: {
              id: true,
              interacaoOrigemId: true,
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

    if (
      venda.status ===
        "Cancelado" ||
      venda.canceladoEm
    ) {
      return NextResponse.json(
        {
          message:
            "Venda cancelada não pode receber novos eventos operacionais.",
        },
        {
          status: 409,
        }
      )
    }

    const tipo =
      typeof body.tipo ===
      "string"
        ? body.tipo.trim()
        : ""

    if (
      !TIPOS_EVENTO.includes(
        tipo
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de evento inválido.",
        },
        {
          status: 400,
        }
      )
    }

    const canal =
      textoOpcional(
        body.canal
      )

    if (
      canal &&
      !CANAIS_EVENTO.includes(
        canal
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Canal do evento inválido.",
        },
        {
          status: 400,
        }
      )
    }

    const dataEvento =
      body.data !==
      undefined
        ? dataValida(
            body.data
          )
        : new Date()

    if (!dataEvento) {
      return NextResponse.json(
        {
          message:
            "Data do evento inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const referencia =
      textoOpcional(
        body.referencia
      )

    const descricao =
      textoOpcional(
        body.descricao
      )

    if (
      tipo ===
        "Pedido enviado" &&
      !canal
    ) {
      return NextResponse.json(
        {
          message:
            "Informe o canal utilizado para enviar o pedido à Representada.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      tipo ===
        "Pedido enviado" &&
      (
        venda.pedidoEnviadoEm ||
        venda.status !==
          "Aguardando envio"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Este pedido já possui envio oficial registrado. Para mudanças posteriores, registre uma alteração pós-envio.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      (
        tipo ===
          "Recebimento confirmado" ||
        tipo ===
          "Pedido registrado" ||
        tipo ===
          "Alteração pós-envio" ||
        tipo ===
          "Contato com Representada"
      ) &&
      !venda.pedidoEnviadoEm
    ) {
      return NextResponse.json(
        {
          message:
            "Este evento somente pode ser registrado depois do envio oficial do pedido.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      tipo ===
        "Recebimento confirmado" &&
      !referencia &&
      !descricao
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um protocolo, referência ou descrição que identifique a confirmação recebida da Representada.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      tipo ===
        "Recebimento confirmado" &&
      (
        venda.confirmadoEm ||
        venda.status !==
          "Aguardando confirmação"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "O recebimento desta Venda já foi confirmado ou ela não está mais aguardando confirmação.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      tipo ===
        "Pedido registrado" &&
      !referencia
    ) {
      return NextResponse.json(
        {
          message:
            "Informe o número oficial do pedido fornecido pela Representada.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      tipo ===
        "Pedido registrado" &&
      venda.numeroPedidoRepresentada
    ) {
      return NextResponse.json(
        {
          message:
            "Esta Venda já possui número oficial do pedido da Representada. Qualquer correção posterior deve ser registrada como alteração/divergência.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      tipo ===
        "Alteração pós-envio" &&
      !descricao
    ) {
      return NextResponse.json(
        {
          message:
            "Descreva a divergência ou alteração ocorrida após o envio.",
        },
        {
          status: 400,
        }
      )
    }

    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const vendaAtual =
            await tx.venda.findUnique({
              where: {
                id:
                  venda.id,
              },

              select: {
                id: true,
                numeroSequencial: true,
                status: true,
                pedidoEnviadoEm: true,
                confirmadoEm: true,
                numeroPedidoRepresentada: true,
                canceladoEm: true,
              },
            })

          if (!vendaAtual) {
            throw new ErroApi(
              "Venda não encontrada.",
              404
            )
          }

          if (
            vendaAtual.status ===
              "Cancelado" ||
            vendaAtual.canceladoEm
          ) {
            throw new ErroApi(
              "Venda cancelada não pode receber novos eventos operacionais.",
              409
            )
          }

          let vendaAtualizada

          if (
            tipo ===
            "Pedido enviado"
          ) {
            const atualizacaoEnvio =
              await tx.venda.updateMany({
                where: {
                  id:
                    vendaAtual.id,

                  status:
                    "Aguardando envio",

                  pedidoEnviadoEm:
                    null,
                },

                data: {
                  status:
                    "Aguardando confirmação",

                  pedidoEnviadoEm:
                    dataEvento,
                },
              })

            if (
              atualizacaoEnvio.count !==
              1
            ) {
              throw new ErroApi(
                "Este pedido já possui envio oficial registrado. Para mudanças posteriores, registre uma alteração pós-envio.",
                409
              )
            }

            vendaAtualizada =
              await tx.venda.findUniqueOrThrow({
                where: {
                  id:
                    vendaAtual.id,
                },

                select: {
                  id: true,
                  numeroSequencial: true,
                  status: true,
                  pedidoEnviadoEm: true,
                  confirmadoEm: true,
                  numeroPedidoRepresentada: true,
                },
              })
          } else if (
            tipo ===
            "Recebimento confirmado"
          ) {
            const atualizacaoConfirmacao =
              await tx.venda.updateMany({
                where: {
                  id:
                    vendaAtual.id,

                  status:
                    "Aguardando confirmação",

                  pedidoEnviadoEm: {
                    not:
                      null,
                  },

                  confirmadoEm:
                    null,
                },

                data: {
                  status:
                    "Confirmado",

                  confirmadoEm:
                    dataEvento,
                },
              })

            if (
              atualizacaoConfirmacao.count !==
              1
            ) {
              throw new ErroApi(
                "O recebimento desta Venda já foi confirmado ou ela não está mais aguardando confirmação.",
                409
              )
            }

            vendaAtualizada =
              await tx.venda.findUniqueOrThrow({
                where: {
                  id:
                    vendaAtual.id,
                },

                select: {
                  id: true,
                  numeroSequencial: true,
                  status: true,
                  pedidoEnviadoEm: true,
                  confirmadoEm: true,
                  numeroPedidoRepresentada: true,
                },
              })
          } else if (
            tipo ===
            "Pedido registrado"
          ) {
            if (
              !referencia
            ) {
              throw new ErroApi(
                "Informe o número oficial do pedido fornecido pela Representada.",
                400
              )
            }

            const atualizacaoPedido =
              await tx.venda.updateMany({
                where: {
                  id:
                    vendaAtual.id,

                  pedidoEnviadoEm: {
                    not:
                      null,
                  },

                  numeroPedidoRepresentada:
                    null,
                },

                data: {
                  numeroPedidoRepresentada:
                    referencia,

                  ...(vendaAtual.status ===
                  "Aguardando confirmação"
                    ? {
                        status:
                          "Confirmado",

                        confirmadoEm:
                          vendaAtual.confirmadoEm ||
                          dataEvento,
                      }
                    : {}),
                },
              })

            if (
              atualizacaoPedido.count !==
              1
            ) {
              throw new ErroApi(
                "Esta Venda já possui número oficial do pedido da Representada. Qualquer correção posterior deve ser registrada como alteração/divergência.",
                409
              )
            }

            vendaAtualizada =
              await tx.venda.findUniqueOrThrow({
                where: {
                  id:
                    vendaAtual.id,
                },

                select: {
                  id: true,
                  numeroSequencial: true,
                  status: true,
                  pedidoEnviadoEm: true,
                  confirmadoEm: true,
                  numeroPedidoRepresentada: true,
                },
              })
          } else {
            if (
              (
                tipo ===
                  "Alteração pós-envio" ||
                tipo ===
                  "Contato com Representada"
              ) &&
              !vendaAtual.pedidoEnviadoEm
            ) {
              throw new ErroApi(
                "Este evento somente pode ser registrado depois do envio oficial do pedido.",
                409
              )
            }

            vendaAtualizada =
              {
                id:
                  vendaAtual.id,

                numeroSequencial:
                  vendaAtual.numeroSequencial,

                status:
                  vendaAtual.status,

                pedidoEnviadoEm:
                  vendaAtual.pedidoEnviadoEm,

                confirmadoEm:
                  vendaAtual.confirmadoEm,

                numeroPedidoRepresentada:
                  vendaAtual.numeroPedidoRepresentada,
              }
          }

          const evento =
            await tx.vendaEvento.create({
              data: {
                vendaId:
                  vendaAtual.id,

                usuarioId:
                  sessao.usuarioId,

                data:
                  dataEvento,

                tipo,

                canal,

                referencia,

                descricao,
              },

              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    perfil: true,
                  },
                },
              },
            })

          let interacaoFinalizada:
            | {
                id: string
                numeroSequencial: number
              }
            | null = null

          if (
            tipo ===
              "Pedido enviado" &&
            venda
              .orcamentoOrigem
              ?.interacaoOrigemId
          ) {
            const interacaoOrigem =
              await tx.interacao.findFirst({
                where: {
                  id:
                    venda
                      .orcamentoOrigem
                      .interacaoOrigemId,

                  escritorioId:
                    sessao.escritorioId,
                },

                select: {
                  id: true,
                  numeroSequencial: true,
                  statusFollowUp: true,
                  proximoContatoEm: true,
                },
              })

            if (
              interacaoOrigem &&
              interacaoOrigem.statusFollowUp !==
                "Finalizado"
            ) {
              await tx.interacao.update({
                where: {
                  id:
                    interacaoOrigem.id,
                },

                data: {
                  statusFollowUp:
                    "Finalizado",

                  proximoContatoEm:
                    null,
                },
              })

              await tx.auditoria.create({
                data: {
                  escritorioId:
                    sessao.escritorioId,

                  usuarioId:
                    sessao.usuarioId,

                  entidade:
                    "Interacao",

                  entidadeId:
                    interacaoOrigem.id,

                  acao:
                    "FINALIZACAO_AUTOMATICA_VENDA_ENVIADA",

                  dadosAntes: {
                    statusFollowUp:
                      interacaoOrigem.statusFollowUp,

                    proximoContatoEm:
                      interacaoOrigem.proximoContatoEm,

                    vendaId:
                      vendaAtual.id,

                    numeroSequencialVenda:
                      vendaAtual.numeroSequencial,
                  },

                  dadosDepois: {
                    statusFollowUp:
                      "Finalizado",

                    proximoContatoEm:
                      null,

                    motivo:
                      "Venda enviada à Representada",

                    vendaId:
                      vendaAtual.id,

                    numeroSequencialVenda:
                      vendaAtual.numeroSequencial,
                  },
                },
              })

              interacaoFinalizada =
                {
                  id:
                    interacaoOrigem.id,

                  numeroSequencial:
                    interacaoOrigem.numeroSequencial,
                }
            }
          }

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "VendaEvento",

              entidadeId:
                evento.id,

              acao:
                "CRIACAO",

              dadosDepois: {
                vendaId:
                  vendaAtual.id,

                numeroSequencialVenda:
                  vendaAtual.numeroSequencial,

                evento: {
                  id:
                    evento.id,

                  data:
                    evento.data,

                  tipo:
                    evento.tipo,

                  canal:
                    evento.canal,

                  referencia:
                    evento.referencia,

                  descricao:
                    evento.descricao,
                },

                vendaAntes: {
                  status:
                    vendaAtual.status,

                  pedidoEnviadoEm:
                    vendaAtual.pedidoEnviadoEm,

                  confirmadoEm:
                    vendaAtual.confirmadoEm,

                  numeroPedidoRepresentada:
                    vendaAtual.numeroPedidoRepresentada,
                },

                vendaDepois: {
                  status:
                    vendaAtualizada.status,

                  pedidoEnviadoEm:
                    vendaAtualizada.pedidoEnviadoEm,

                  confirmadoEm:
                    vendaAtualizada.confirmadoEm,

                  numeroPedidoRepresentada:
                    vendaAtualizada.numeroPedidoRepresentada,
                },

                interacaoOrigemFinalizada:
                  interacaoFinalizada,
              },
            },
          })

          return {
            evento,

            venda:
              vendaAtualizada,

            interacaoOrigemFinalizada:
              interacaoFinalizada,
          }
        }
      )

    return NextResponse.json(
      resultado,
      {
        status: 201,
      }
    )
  } catch (error) {
    return respostaErro(
      error,
      "Erro ao registrar evento da venda."
    )
  }
}
