import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const empresas =
      await prisma.empresaEscritorio.findMany({
        select: {
          id: true,
          escritorioId: true,
          razaoSocial: true,
          nomeFantasia: true,
          cnpj: true,
          status: true,
          email: true,
          telefone: true,
        },

        orderBy: [
          {
            status: "asc",
          },
          {
            razaoSocial: "asc",
          },
        ],
      })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error(
      "Erro ao listar empresas do escritório:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar empresas do escritório.",
      },
      { status: 500 }
    )
  }
}