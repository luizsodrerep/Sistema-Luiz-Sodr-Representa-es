import {
  Prisma,
} from "@prisma/client"

import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

type Contexto = {
  params: Promise<{
    id: string
  }>
}

type SnapshotMeta = {
  id: string
  escritorioId: string
  representadaId: string
  criadoPorId: string | null
  tipo: string
  ano: number
  mes: number
  valorMeta: number
  ativa: boolean
  fonte: string | null
  referencia: string | null
  observacoes: string | null
  criadoEm: Date
  atualizadoEm: Date
}

function textoOpcional(
  valor: unknown
) {
  return typeof valor === "string" &&
    valor.trim() !== ""
    ? valor.trim()
    : null
}

function inteiroObrigatorio(
  valor: unknown
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null
  }

  const numero =
    Number(valor)

  return Number.isInteger(
    numero
  )
    ? numero
    : null
}

function valorMonetarioPositivo(
  valor: unknown
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null
  }

  if (
    typeof valor === "number"
  ) {
    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      return null
    }

    const centavos =
      Math.round(
        valor * 100
      )

    if (
      !Number.isSafeInteger(
        centavos
      ) ||
      Math.abs(
        valor * 100 -
          centavos
      ) >
        0.000001
    ) {
      return null
    }

    return centavos / 100
  }

  if (
    typeof valor !== "string"
  ) {
    return null
  }

  let texto =
    valor
      .trim()
      .replace(/\s/g, "")
      .replace(/R\$/gi, "")

  if (!texto) {
    return null
  }

  /*
   * Aceita:
   * 1000
   * 1000.50
   * 1000,50
   * 1.000,50
   * 1.000
   */
  if (
    texto.includes(",")
  ) {
    texto =
      texto
        .replace(/\./g, "")
        .replace(",", ".")
  } else if (
    /^\d{1,3}(?:\.\d{3})+$/.test(
      texto
    )
  ) {
    texto =
      texto.replace(
        /\./g,
        ""
      )
  }

  const numero =
    Number(texto)

  if (
    !Number.isFinite(
      numero
    ) ||
    numero <= 0
  ) {
    return null
  }

  const centavos =
    Math.round(
      numero * 100
    )

  if (
    !Number.isSafeInteger(
      centavos
    ) ||
    Math.abs(
      numero * 100 -
        centavos
    ) >
      0.000001
  ) {
    return null
  }

  return centavos / 100
}

function snapshotMeta(
  meta: SnapshotMeta
) {
  return {
    id:
      meta.id,

    escritorioId:
      meta.escritorioId,

    representadaId:
      meta.representadaId,

    criadoPorId:
      meta.criadoPorId,

    tipo:
      meta.tipo,

    ano:
      meta.ano,

    mes:
      meta.mes,

    valorMeta:
      meta.valorMeta,

    ativa:
      meta.ativa,

    fonte:
      meta.fonte,

    referencia:
      meta.referencia,

    observacoes:
      meta.observacoes,

    criadoEm:
      meta.criadoEm.toISOString(),

    atualizadoEm:
      meta.atualizadoEm.toISOString(),
  }
}

function validarPeriodo(
  ano: number | null,
  mes: number | null
) {
  if (
    ano === null ||
    ano < 2000 ||
    ano > 2100
  ) {
    return {
      valido: false,
      mensagem:
        "Informe um ano válido entre 2000 e 2100.",
    }
  }

  if (
    mes === null ||
    mes < 1 ||
    mes > 12
  ) {
    return {
      valido: false,
      mensagem:
        "Informe um mês válido entre 1 e 12.",
    }
  }

  return {
    valido: true,
    mensagem: null,
  }
}

async function buscarRepresentada(
  id: string,
  escritorioId: string
) {
  return prisma.representada.findFirst({
    where: {
      id,

      escritorioId,
    },

    select: {
      id: true,
      nome: true,
      status: true,
    },
  })
}

export async function GET(
  request: Request,
  {
    params,
  }: Contexto
) {
  try {
    const sessao =
      await exigirSessao()

    const { id } =
      await params

    const representada =
      await buscarRepresentada(
        id,
        sessao.escritorioId
      )

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada.",
        },
        {
          status: 404,
        }
      )
    }

    const {
      searchParams,
    } =
      new URL(
        request.url
      )

    const anoTexto =
      searchParams
        .get("ano")
        ?.trim() ||
      null

    let ano:
      number | null =
      null

    if (anoTexto) {
      ano =
        inteiroObrigatorio(
          anoTexto
        )

      if (
        ano === null ||
        ano < 2000 ||
        ano > 2100
      ) {
        return NextResponse.json(
          {
            message:
              "Ano de consulta inválido.",
          },
          {
            status: 400,
          }
        )
      }
    }

    const tipo =
      searchParams
        .get("tipo")
        ?.trim() ||
      "Vendas"

    /*
     * A estrutura do banco permite outros
     * tipos no futuro, mas neste primeiro
     * módulo trabalhamos somente com metas
     * de Vendas.
     */
    if (
      tipo !== "Vendas"
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de meta não suportado neste módulo.",
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

          representadaId:
            representada.id,

          tipo,

          ...(ano !== null
            ? {
                ano,
              }
            : {}),
        },

        orderBy: [
          {
            ano:
              "desc",
          },
          {
            mes:
              "desc",
          },
        ],

        include: {
          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },
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
      "Erro ao listar metas da Representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar metas da Representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: Request,
  {
    params,
  }: Contexto
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
            "Seu perfil não possui permissão para cadastrar metas de Representadas.",
        },
        {
          status: 403,
        }
      )
    }

    const { id } =
      await params

    const representada =
      await buscarRepresentada(
        id,
        sessao.escritorioId
      )

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada.",
        },
        {
          status: 404,
        }
      )
    }

    const body =
      await request.json()

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          message:
            "Dados da meta inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const tipo =
      textoOpcional(
        body.tipo
      ) ||
      "Vendas"

    if (
      tipo !== "Vendas"
    ) {
      return NextResponse.json(
        {
          message:
            "Neste momento somente metas de Vendas podem ser cadastradas.",
        },
        {
          status: 400,
        }
      )
    }

    const ano =
      inteiroObrigatorio(
        body.ano
      )

    const mes =
      inteiroObrigatorio(
        body.mes
      )

    const periodo =
      validarPeriodo(
        ano,
        mes
      )

    if (
      !periodo.valido
    ) {
      return NextResponse.json(
        {
          message:
            periodo.mensagem,
        },
        {
          status: 400,
        }
      )
    }

    const valorMeta =
      valorMonetarioPositivo(
        body.valorMeta
      )

    if (
      valorMeta === null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe uma meta de Vendas maior que zero, em reais, com até duas casas decimais.",
        },
        {
          status: 400,
        }
      )
    }

    const fonte =
      textoOpcional(
        body.fonte
      )

    const referencia =
      textoOpcional(
        body.referencia
      )

    const observacoes =
      textoOpcional(
        body.observacoes
      )

    const meta =
      await prisma.$transaction(
        async (tx) => {
          const criada =
            await tx.metaRepresentada.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                representadaId:
                  representada.id,

                criadoPorId:
                  sessao.usuarioId,

                tipo,

                ano:
                  ano!,

                mes:
                  mes!,

                valorMeta,

                ativa:
                  true,

                fonte,

                referencia,

                observacoes,
              },
            })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "MetaRepresentada",

              entidadeId:
                criada.id,

              acao:
                "CRIACAO",

              dadosDepois:
                snapshotMeta(
                  criada
                ),
            },
          })

          return criada
        }
      )

    return NextResponse.json(
      meta,
      {
        status: 201,
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
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Já existe uma meta de Vendas para esta Representada no mês e ano informados. Edite a meta existente em vez de criar outra.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao cadastrar meta da Representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar meta da Representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: Contexto
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
            "Seu perfil não possui permissão para alterar metas de Representadas.",
        },
        {
          status: 403,
        }
      )
    }

    const { id } =
      await params

    const representada =
      await buscarRepresentada(
        id,
        sessao.escritorioId
      )

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada.",
        },
        {
          status: 404,
        }
      )
    }

    const body =
      await request.json()

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          message:
            "Dados da meta inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const metaId =
      textoOpcional(
        body.metaId
      )

    if (!metaId) {
      return NextResponse.json(
        {
          message:
            "Informe a meta que será alterada.",
        },
        {
          status: 400,
        }
      )
    }

    const anterior =
      await prisma.metaRepresentada.findFirst({
        where: {
          id:
            metaId,

          escritorioId:
            sessao.escritorioId,

          representadaId:
            representada.id,
        },
      })

    if (!anterior) {
      return NextResponse.json(
        {
          message:
            "Meta não encontrada nesta Representada.",
        },
        {
          status: 404,
        }
      )
    }

    const tipo =
      textoOpcional(
        body.tipo
      ) ||
      anterior.tipo

    if (
      tipo !== "Vendas"
    ) {
      return NextResponse.json(
        {
          message:
            "Neste momento somente metas de Vendas podem ser alteradas.",
        },
        {
          status: 400,
        }
      )
    }

    const ano =
      body.ano ===
        undefined
        ? anterior.ano
        : inteiroObrigatorio(
            body.ano
          )

    const mes =
      body.mes ===
        undefined
        ? anterior.mes
        : inteiroObrigatorio(
            body.mes
          )

    const periodo =
      validarPeriodo(
        ano,
        mes
      )

    if (
      !periodo.valido
    ) {
      return NextResponse.json(
        {
          message:
            periodo.mensagem,
        },
        {
          status: 400,
        }
      )
    }

    const valorMeta =
      body.valorMeta ===
        undefined
        ? anterior.valorMeta
        : valorMonetarioPositivo(
            body.valorMeta
          )

    if (
      valorMeta === null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe uma meta de Vendas maior que zero, em reais, com até duas casas decimais.",
        },
        {
          status: 400,
        }
      )
    }

    let ativa =
      anterior.ativa

    if (
      body.ativa !==
      undefined
    ) {
      if (
        typeof body.ativa !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            message:
              "Situação da meta inválida.",
          },
          {
            status: 400,
          }
        )
      }

      ativa =
        body.ativa
    }

    const fonte =
      body.fonte ===
        undefined
        ? anterior.fonte
        : textoOpcional(
            body.fonte
          )

    const referencia =
      body.referencia ===
        undefined
        ? anterior.referencia
        : textoOpcional(
            body.referencia
          )

    const observacoes =
      body.observacoes ===
        undefined
        ? anterior.observacoes
        : textoOpcional(
            body.observacoes
          )

    const atualizada =
      await prisma.$transaction(
        async (tx) => {
          const meta =
            await tx.metaRepresentada.update({
              where: {
                id:
                  anterior.id,
              },

              data: {
                tipo,

                ano:
                  ano!,

                mes:
                  mes!,

                valorMeta,

                ativa,

                fonte,

                referencia,

                observacoes,
              },
            })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "MetaRepresentada",

              entidadeId:
                meta.id,

              acao:
                "EDICAO",

              dadosAntes:
                snapshotMeta(
                  anterior
                ),

              dadosDepois:
                snapshotMeta(
                  meta
                ),
            },
          })

          return meta
        }
      )

    return NextResponse.json(
      {
        message:
          "Meta atualizada com sucesso.",

        data:
          atualizada,
      },
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
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Já existe outra meta de Vendas para esta Representada no mês e ano informados.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao atualizar meta da Representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar meta da Representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE() {
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
            "Seu perfil não possui permissão para alterar metas de Representadas.",
        },
        {
          status: 403,
        }
      )
    }

    return NextResponse.json(
      {
        message:
          "Exclusão de Meta bloqueada para preservar o histórico. Edite a meta ou marque-a como inativa.",
      },
      {
        status: 405,
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
            "Não autenticado",
        },
        {
          status: 401,
        }
      )
    }

    return NextResponse.json(
      {
        message:
          "Operação não permitida.",
      },
      {
        status: 405,
      }
    )
  }
}