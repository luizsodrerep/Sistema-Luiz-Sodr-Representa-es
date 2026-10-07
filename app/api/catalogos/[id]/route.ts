import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

const ACOES_PERMITIDAS = [
  "arquivar",
  "restaurar",
] as const

type AcaoCatalogo =
  (typeof ACOES_PERMITIDAS)[number]

function acaoValida(
  valor: unknown
): valor is AcaoCatalogo {
  return (
    typeof valor === "string" &&
    ACOES_PERMITIDAS.includes(
      valor as AcaoCatalogo
    )
  )
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
      sessao.perfil ===
      "Preposto"
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil possui acesso de consulta, mas não pode alterar catálogos.",
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

    const catalogoId =
      id?.trim()

    if (
      !catalogoId
    ) {
      return NextResponse.json(
        {
          message:
            "Catálogo inválido.",
        },
        {
          status: 400,
        }
      )
    }

    let body:
      | Record<string, unknown>
      | null =
      null

    try {
      const recebido =
        await request.json()

      if (
        recebido &&
        typeof recebido ===
          "object" &&
        !Array.isArray(
          recebido
        )
      ) {
        body =
          recebido as Record<
            string,
            unknown
          >
      }
    } catch {
      body =
        null
    }

    if (
      !body ||
      !acaoValida(
        body.acao
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Ação inválida. Utilize arquivar ou restaurar.",
        },
        {
          status: 400,
        }
      )
    }

    const catalogo =
      await prisma.catalogo.findFirst(
        {
          where: {
            id:
              catalogoId,

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
            nome: true,
            status: true,
            arquivadoEm:
              true,

            representada: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        }
      )

    if (
      !catalogo
    ) {
      return NextResponse.json(
        {
          message:
            "Catálogo não encontrado neste escritório.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      body.acao ===
      "arquivar"
    ) {
      if (
        catalogo.status ===
        "Arquivado"
      ) {
        return NextResponse.json(
          {
            message:
              "Este catálogo já está arquivado.",

            catalogo,
          }
        )
      }

      const atualizado =
        await prisma.catalogo.update(
          {
            where: {
              id:
                catalogo.id,
            },

            data: {
              status:
                "Arquivado",

              arquivadoEm:
                new Date(),
            },

            select: {
              id: true,
              nome: true,
              status: true,
              arquivadoEm:
                true,
              atualizadoEm:
                true,

              representada: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          }
        )

      return NextResponse.json(
        {
          message:
            "Catálogo arquivado com sucesso. O arquivo físico foi preservado.",

          catalogo:
            atualizado,
        }
      )
    }

    if (
      catalogo.status ===
      "Ativo"
    ) {
      return NextResponse.json(
        {
          message:
            "Este catálogo já está ativo.",

          catalogo,
        }
      )
    }

    const atualizado =
      await prisma.catalogo.update(
        {
          where: {
            id:
              catalogo.id,
          },

          data: {
            status:
              "Ativo",

            arquivadoEm:
              null,
          },

          select: {
            id: true,
            nome: true,
            status: true,
            arquivadoEm:
              true,
            atualizadoEm:
              true,

            representada: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        }
      )

    return NextResponse.json(
      {
        message:
          "Catálogo restaurado com sucesso.",

        catalogo:
          atualizado,
      }
    )
  } catch (
    error
  ) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao alterar catálogo:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao alterar catálogo.",
      },
      {
        status: 500,
      }
    )
  }
}