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

export async function GET(
  _request: Request,
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
        "usuarios",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para visualizar usuários.",
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

    const usuario =
      await prisma.usuario.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
          nome: true,
          email: true,
          login: true,
          perfil: true,
          ativo: true,

          regiaoAtuacao: true,
          cargo: true,
          departamento: true,
          telefone: true,
          tipoVinculo: true,

          ultimoAcessoEm: true,
          observacoes: true,

          criadoEm: true,
          atualizadoEm: true,

          permissoes: {
            orderBy: {
              recurso: "asc",
            },

            select: {
              id: true,
              recurso: true,
              ver: true,
              criar: true,
              editar: true,
              excluir: true,
              administrar: true,
              escopo: true,
              criadoEm: true,
              atualizadoEm: true,
            },
          },
        },
      })

    if (!usuario) {
      return NextResponse.json(
        {
          message:
            "Usuário não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      usuario,
      {
        status: 200,
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
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao buscar usuário:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar usuário.",
      },
      {
        status: 500,
      }
    )
  }
}