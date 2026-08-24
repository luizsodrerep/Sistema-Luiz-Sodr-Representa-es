import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

const TIPOS_EVENTO = [
  "Pedido enviado",
  "Recebimento confirmado",
  "Pedido registrado",
  "Contato com Representada",
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

  return Number.isNaN(data.getTime())
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
              responsavelId: usuarioId,
            },
            {
              criadoPorId: usuarioId,
            },
          ],
        }
      : {}),
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
    const sessao = await exigirSessao()
    const { id } = await params

    const venda = await prisma.venda.findFirst({
      where: filtroAcessoVenda(
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

    const eventos = await prisma.vendaEvento.findMany({
      where: {
        vendaId: venda.id,
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
          data: "desc",
        },
        {
          criadoEm: "desc",
        },
      ],
    })

    return NextResponse.json(eventos)
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
      "Erro ao listar eventos da venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar eventos da venda.",
      },
      {
        status: 500,
      }
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
    const sessao = await exigirSessao()
    const { id } = await params
    const body = await request.json()

    const venda = await prisma.venda.findFirst({
      where: filtroAcessoVenda(
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

    if (venda.status === "Cancelado") {
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
      typeof body.tipo === "string"
        ? body.tipo.trim()
        : ""

    if (!TIPOS_EVENTO.includes(tipo)) {
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
      textoOpcional(body.canal)

    if (
      canal &&
      !CANAIS_EVENTO.includes(canal)
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

    if (
      tipo === "Pedido enviado" &&
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

    const dataEvento =
      body.data !== undefined
        ? dataValida(body.data)
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
      textoOpcional(body.referencia)

    const descricao =
      textoOpcional(body.descricao)

    /*
     * Se a Representada fornecer seu número oficial
     * de pedido no evento "Pedido registrado",
     * ele também é consolidado na Venda.
     *
     * O número não é obrigatório porque cada
     * Representada possui processo diferente.
     */
    const numeroPedidoRepresentada =
      tipo === "Pedido registrado" && referencia
        ? referencia
        : venda.numeroPedidoRepresentada

    let novoStatus = venda.status
    let pedidoEnviadoEm = venda.pedidoEnviadoEm
    let confirmadoEm = venda.confirmadoEm

    /*
     * Fluxo operacional:
     *
     * Aguardando envio
     * -> Pedido enviado
     * -> Aguardando confirmação
     *
     * Depois:
     * Recebimento confirmado OU Pedido registrado
     * -> Confirmado
     */
    if (tipo === "Pedido enviado") {
      novoStatus = "Aguardando confirmação"

      if (!pedidoEnviadoEm) {
        pedidoEnviadoEm = dataEvento
      }
    }

    if (
      tipo === "Recebimento confirmado" ||
      tipo === "Pedido registrado"
    ) {
      /*
       * Se a confirmação ocorreu sem um evento
       * anterior de envio, preservamos a cronologia
       * usando a própria data da confirmação como
       * referência mínima do recebimento.
       */
      if (!pedidoEnviadoEm) {
        pedidoEnviadoEm = dataEvento
      }

      novoStatus = "Confirmado"

      if (!confirmadoEm) {
        confirmadoEm = dataEvento
      }
    }

    const resultado = await prisma.$transaction(
      async (tx) => {
        const evento =
          await tx.vendaEvento.create({
            data: {
              vendaId: venda.id,
              usuarioId: sessao.usuarioId,
              data: dataEvento,
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

        const vendaAtualizada =
          await tx.venda.update({
            where: {
              id: venda.id,
            },

            data: {
              status: novoStatus,
              pedidoEnviadoEm,
              confirmadoEm,
              numeroPedidoRepresentada,
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
                venda.id,

              numeroSequencialVenda:
                venda.numeroSequencial,

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
                  venda.status,

                pedidoEnviadoEm:
                  venda.pedidoEnviadoEm,

                confirmadoEm:
                  venda.confirmadoEm,

                numeroPedidoRepresentada:
                  venda.numeroPedidoRepresentada,
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
            },
          },
        })

        return {
          evento,
          venda:
            vendaAtualizada,
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
    if (
      error instanceof Error &&
      error.message === "NAO_AUTENTICADO"
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
      "Erro ao registrar evento da venda:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao registrar evento da venda.",
      },
      {
        status: 500,
      }
    )
  }
}