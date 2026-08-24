import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

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

    /*
     * Antes de expor a auditoria,
     * confirmamos que o usuário possui
     * acesso à própria Interação.
     */
    const interacao =
      await prisma.interacao.findFirst({
        where: {
          id,
          escritorioId:
            sessao.escritorioId,

          ...(sessao.perfil ===
          "Preposto"
            ? filtroCarteiraPreposto(
                sessao.escritorioId,
                sessao.usuarioId
              )
            : {}),
        },

        select: {
          id: true,
          numeroSequencial: true,
        },
      })

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

    const historico =
      await prisma.auditoria.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          entidade:
            "Interacao",

          entidadeId:
            interacao.id,
        },

        orderBy: {
          criadoEm: "desc",
        },

        select: {
          id: true,
          acao: true,
          criadoEm: true,
          dadosAntes: true,
          dadosDepois: true,

          usuario: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },
      })

    return NextResponse.json({
      interacaoId:
        interacao.id,

      numeroSequencial:
        interacao.numeroSequencial,

      totalAlteracoes:
        historico.length,

      historico,
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
      "Erro ao consultar histórico da interação:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao consultar histórico da interação.",
      },
      {
        status: 500,
      }
    )
  }
}