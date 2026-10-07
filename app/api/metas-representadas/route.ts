import { NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const sessao =
      await exigirSessao()

    const { searchParams } =
      new URL(request.url)

    const tipo =
      searchParams
        .get("tipo")
        ?.trim() ||
      "Vendas"

    /*
     * Neste momento o painel de Vendas utiliza
     * exclusivamente metas de Vendas.
     *
     * O modelo permanece preparado para outros
     * tipos futuramente, como Faturamento.
     */
    if (tipo !== "Vendas") {
      return NextResponse.json(
        {
          message:
            "Tipo de meta não suportado neste painel.",
        },
        {
          status: 400,
        }
      )
    }

    const metas =
      await prisma.metaRepresentada.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          tipo,

          ativa: true,
        },

        select: {
          id: true,

          representadaId: true,

          tipo: true,

          ano: true,

          mes: true,

          valorMeta: true,

          ativa: true,

          fonte: true,

          referencia: true,

          observacoes: true,

          criadoEm: true,

          atualizadoEm: true,

          representada: {
            select: {
              id: true,
              nome: true,
              status: true,
            },
          },
        },

        orderBy: [
          {
            ano: "asc",
          },
          {
            mes: "asc",
          },
          {
            criadoEm: "asc",
          },
        ],
      })

    return NextResponse.json(
      metas
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
      "Erro ao listar metas das Representadas:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar metas das Representadas.",
      },
      {
        status: 500,
      }
    )
  }
}