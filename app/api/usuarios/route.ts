import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

export async function GET() {
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

    const usuarios =
      await prisma.usuario.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,
        },

        orderBy: [
          {
            ativo: "desc",
          },
          {
            nome: "asc",
          },
        ],

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
        },
      })

    return NextResponse.json(
      usuarios,
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
      "Erro ao listar usuários:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar usuários.",
      },
      {
        status: 500,
      }
    )
  }
}