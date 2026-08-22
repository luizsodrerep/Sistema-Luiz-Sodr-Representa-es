import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const contas =
      await prisma.contaBancaria.findMany({
        select: {
          id: true,
          escritorioId: true,
          empresaEscritorioId: true,
          usuarioTitularId: true,
          nome: true,
          banco: true,
          tipoTitular: true,
          titular: true,
          agencia: true,
          conta: true,
          pix: true,
          ativa: true,
          observacoes: true,

          empresaEscritorio: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              status: true,
            },
          },

          usuarioTitular: {
            select: {
              id: true,
              nome: true,
              email: true,
              ativo: true,
            },
          },
        },

        orderBy: [
          {
            ativa: "desc",
          },
          {
            nome: "asc",
          },
        ],
      })

    return NextResponse.json(contas)
  } catch (error) {
    console.error(
      "Erro ao listar contas bancárias:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar contas bancárias.",
      },
      { status: 500 }
    )
  }
}