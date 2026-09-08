import {
  NextRequest,
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

function textoOpcional(
  valor: unknown
): string | null {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto || null
}

function textoObrigatorio(
  valor: unknown
): string | null {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto || null
}

function respostaNaoAutorizada(
  mensagem: string
) {
  return NextResponse.json(
    {
      message:
        mensagem,
    },
    {
      status: 403,
    }
  )
}

function respostaErro(
  error: unknown,
  mensagem: string
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
    mensagem,
    error
  )

  return NextResponse.json(
    {
      message:
        mensagem,
    },
    {
      status: 500,
    }
  )
}

const selectContaBancaria = {
  id: true,

  escritorioId:
    true,

  empresaEscritorioId:
    true,

  usuarioTitularId:
    true,

  nome: true,

  banco: true,

  tipoTitular:
    true,

  titular:
    true,

  agencia:
    true,

  conta: true,

  pix: true,

  ativa: true,

  observacoes:
    true,

  empresaEscritorio: {
    select: {
      id: true,

      razaoSocial:
        true,

      nomeFantasia:
        true,

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
} as const

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "contasRecebimento",
        "ver"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para visualizar contas bancárias."
      )
    }

    const contas =
      await prisma.contaBancaria.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,
        },

        select:
          selectContaBancaria,

        orderBy: [
          {
            ativa:
              "desc",
          },

          {
            nome:
              "asc",
          },
        ],
      })

    return NextResponse.json(
      contas,
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (error) {
    return respostaErro(
      error,
      "Erro ao listar contas bancárias."
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "contasRecebimento",
        "criar"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para cadastrar contas bancárias."
      )
    }

    const body =
      await request.json()

    const nome =
      textoObrigatorio(
        body.nome
      )

    if (!nome) {
      return NextResponse.json(
        {
          message:
            "Informe um nome para identificar a conta.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Estes dois campos são obrigatórios
     * no modelo atual do banco.
     */
    const banco =
      textoObrigatorio(
        body.banco
      )

    if (!banco) {
      return NextResponse.json(
        {
          message:
            "Informe o banco ou instituição financeira.",
        },
        {
          status: 400,
        }
      )
    }

    const tipoTitular =
      textoObrigatorio(
        body.tipoTitular
      )

    if (!tipoTitular) {
      return NextResponse.json(
        {
          message:
            "Informe o tipo de titular da conta.",
        },
        {
          status: 400,
        }
      )
    }

    const titular =
      textoOpcional(
        body.titular
      )

    const agencia =
      textoOpcional(
        body.agencia
      )

    const conta =
      textoOpcional(
        body.conta
      )

    const pix =
      textoOpcional(
        body.pix
      )

    const observacoes =
      textoOpcional(
        body.observacoes
      )

    const empresaEscritorioId =
      textoOpcional(
        body.empresaEscritorioId
      )

    const usuarioTitularId =
      textoOpcional(
        body.usuarioTitularId
      )

    /*
     * Uma mesma conta não deve ser
     * simultaneamente atribuída a uma
     * empresa e a um usuário.
     */
    if (
      empresaEscritorioId &&
      usuarioTitularId
    ) {
      return NextResponse.json(
        {
          message:
            "A conta deve possuir apenas um titular vinculado: empresa ou usuário.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      empresaEscritorioId
    ) {
      const empresa =
        await prisma.empresaEscritorio.findFirst({
          where: {
            id:
              empresaEscritorioId,

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
          },
        })

      if (!empresa) {
        return NextResponse.json(
          {
            message:
              "Empresa do escritório não encontrada.",
          },
          {
            status: 400,
          }
        )
      }
    }

    if (
      usuarioTitularId
    ) {
      const usuario =
        await prisma.usuario.findFirst({
          where: {
            id:
              usuarioTitularId,

            escritorioId:
              sessao.escritorioId,

            ativo: true,
          },

          select: {
            id: true,
          },
        })

      if (!usuario) {
        return NextResponse.json(
          {
            message:
              "Usuário titular não encontrado ou inativo.",
          },
          {
            status: 400,
          }
        )
      }
    }

    /*
     * Evita duplicidade quando existem
     * informações bancárias suficientes
     * para identificar a conta.
     */
    if (
      agencia &&
      conta
    ) {
      const duplicada =
        await prisma.contaBancaria.findFirst({
          where: {
            escritorioId:
              sessao.escritorioId,

            banco,

            agencia,

            conta,
          },

          select: {
            id: true,

            nome: true,
          },
        })

      if (duplicada) {
        return NextResponse.json(
          {
            message:
              `Já existe uma conta bancária cadastrada com estes dados: ${duplicada.nome}.`,
          },
          {
            status: 409,
          }
        )
      }
    }

    const ativa =
      typeof body.ativa ===
      "boolean"
        ? body.ativa
        : true

    const novaConta =
      await prisma.contaBancaria.create({
        data: {
          escritorioId:
            sessao.escritorioId,

          empresaEscritorioId,

          usuarioTitularId,

          nome,

          banco,

          tipoTitular,

          titular,

          agencia,

          conta,

          pix,

          ativa,

          observacoes,
        },

        select:
          selectContaBancaria,
      })

    return NextResponse.json(
      {
        message:
          "Conta bancária cadastrada com sucesso.",

        data:
          novaConta,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    return respostaErro(
      error,
      "Erro ao cadastrar conta bancária."
    )
  }
}