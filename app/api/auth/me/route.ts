import { NextResponse } from "next/server"

import {
  obterSessaoAtual,
} from "@/lib/auth/server"

export async function GET() {
  try {
    const sessao =
      await obterSessaoAtual()

    if (!sessao) {
      return NextResponse.json(
        {
          autenticado: false,
          usuario: null,
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        autenticado: true,

        usuario: {
          id: sessao.usuarioId,
          escritorioId:
            sessao.escritorioId,
          nome: sessao.nome,
          email: sessao.email,
          perfil: sessao.perfil,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Erro ao consultar sessão:",
      error
    )

    return NextResponse.json(
      {
        autenticado: false,
        usuario: null,
        message:
          "Erro ao consultar sessão.",
      },
      { status: 500 }
    )
  }
}