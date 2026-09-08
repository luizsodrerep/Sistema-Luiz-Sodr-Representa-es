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

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    /*
     * Empresas do escritório são utilizadas
     * principalmente no contexto operacional
     * das Representadas, contratos e emissão
     * de documentos do próprio escritório.
     */
    if (
      !podeExecutarAcao(
        sessao.perfil,
        "representadas",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para visualizar empresas do escritório.",
        },
        {
          status: 403,
        }
      )
    }

    /*
     * ISOLAMENTO POR ESCRITÓRIO
     *
     * A autenticação sozinha não é suficiente.
     * Toda consulta deve permanecer restrita
     * ao escritorioId existente na sessão.
     */
    const empresas =
      await prisma.empresaEscritorio.findMany(
        {
          where: {
            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,

            escritorioId:
              true,

            razaoSocial:
              true,

            nomeFantasia:
              true,

            cnpj: true,

            status: true,

            email: true,

            telefone: true,
          },

          orderBy: [
            {
              status:
                "asc",
            },

            {
              razaoSocial:
                "asc",
            },
          ],
        }
      )

    return NextResponse.json(
      empresas,
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (error) {
    if (
      error instanceof
        Error &&
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
      "Erro ao listar empresas do escritório:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar empresas do escritório.",
      },
      {
        status: 500,
      }
    )
  }
}