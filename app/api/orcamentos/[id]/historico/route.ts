import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

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
    const sessao =
      await exigirSessao()

    const { id } =
      await params

    /*
     * Primeiro validamos se o usuário
     * realmente possui acesso ao orçamento.
     *
     * Isso impede consultar auditoria
     * diretamente pela URL sem permissão.
     */
    const orcamento =
      await prisma.orcamento.findFirst({
        where:
          filtroAcessoOrcamento(
            sessao.escritorioId,
            sessao.usuarioId,
            sessao.perfil,
            id
          ),

        select: {
          id: true,
          numeroSequencial: true,
        },
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

    /*
     * Buscamos todas as alterações
     * registradas pela Auditoria.
     */
    const auditorias =
      await prisma.auditoria.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          entidade:
            "Orcamento",

          entidadeId:
            orcamento.id,
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

        orderBy: {
          criadoEm:
            "asc",
        },
      })

    /*
     * Retornamos um formato específico
     * para a interface.
     *
     * usuario null significa ação
     * automática do sistema, como
     * vencimento por prazo.
     */
    const historico =
      auditorias.map(
        (auditoria) => ({
          id:
            auditoria.id,

          acao:
            auditoria.acao,

          criadoEm:
            auditoria.criadoEm,

          usuario:
            auditoria.usuario
              ? {
                  id:
                    auditoria.usuario.id,

                  nome:
                    auditoria.usuario.nome,

                  perfil:
                    auditoria.usuario.perfil,
                }
              : {
                  id: null,
                  nome: "Sistema",
                  perfil: "Automático",
                },

          dadosAntes:
            auditoria.dadosAntes,

          dadosDepois:
            auditoria.dadosDepois,
        })
      )

    return NextResponse.json({
      orcamento: {
        id:
          orcamento.id,

        numeroSequencial:
          orcamento.numeroSequencial,
      },

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
      "Erro ao buscar histórico do orçamento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar histórico do orçamento.",
      },
      {
        status: 500,
      }
    )
  }
}