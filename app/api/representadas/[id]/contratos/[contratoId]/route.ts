import { Prisma } from "@prisma/client"
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

function parseDataOpcional(
  valor: unknown
): Date | null {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data = new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    throw new Error(
      "DATA_INVALIDA"
    )
  }

  return data
}

function respostaNaoAutorizada(
  mensagem: string
) {
  return NextResponse.json(
    {
      message: mensagem,
    },
    {
      status: 403,
    }
  )
}

async function buscarContratoDoEscritorio(
  representadaId: string,
  contratoId: string,
  escritorioId: string
) {
  return prisma.contratoRepresentada.findFirst({
    where: {
      id: contratoId,

      representadaId,

      representada: {
        escritorioId,
      },
    },
  })
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      contratoId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "contratosRepresentada",
        "ver"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para visualizar contratos de Representadas."
      )
    }

    /*
     * PROTEÇÃO TEMPORÁRIA DE CONFIDENCIALIDADE
     *
     * Enquanto ainda não existem permissões granulares
     * por usuário, Preposto não recebe o contrato completo.
     *
     * O contrato pode conter condições financeiras,
     * documentos e regras de remuneração do escritório
     * que não são necessárias para a operação comercial
     * cotidiana do Preposto.
     *
     * Esta regra será substituída posteriormente pelo
     * Cadastro 360 + permissões individuais.
     */
    if (
      sessao.perfil ===
      "Preposto"
    ) {
      return respostaNaoAutorizada(
        "O contrato completo contém informações internas do escritório e não está disponível para este perfil."
      )
    }

    const {
      id: representadaId,
      contratoId,
    } =
      await params

    /*
     * O contrato somente pode ser encontrado
     * se sua Representada pertencer ao mesmo
     * escritório da sessão autenticada.
     */
    const contrato =
      await prisma.contratoRepresentada.findFirst({
        where: {
          id: contratoId,

          representadaId,

          representada: {
            escritorioId:
              sessao.escritorioId,
          },
        },

        include: {
          empresaEscritorio: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              status: true,
            },
          },

          regrasComerciais: {
            orderBy: {
              vigenciaInicio:
                "desc",
            },
          },

          _count: {
            select: {
              regrasComerciais:
                true,
            },
          },
        },
      })

    if (
      !contrato
    ) {
      return NextResponse.json(
        {
          message:
            "Contrato não encontrado para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      contrato,
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
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
      "Erro ao buscar contrato da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar contrato da representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      contratoId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "contratosRepresentada",
        "editar"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para editar contratos de Representadas."
      )
    }

    const {
      id: representadaId,
      contratoId,
    } =
      await params

    const body =
      await request.json()

    /*
     * Não basta conhecer o contratoId.
     * O contrato precisa pertencer a uma
     * Representada do próprio escritório.
     */
    const contratoAtual =
      await buscarContratoDoEscritorio(
        representadaId,
        contratoId,
        sessao.escritorioId
      )

    if (
      !contratoAtual
    ) {
      return NextResponse.json(
        {
          message:
            "Contrato não encontrado para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      typeof body.tipoFormalizacao !==
        "string" ||
      body.tipoFormalizacao.trim() ===
        ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de formalização do contrato é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    let empresaEscritorioId:
      | string
      | null =
      null

    if (
      typeof body.empresaEscritorioId ===
        "string" &&
      body.empresaEscritorioId.trim() !==
        ""
    ) {
      const empresaId =
        body.empresaEscritorioId.trim()

      /*
       * Uma Empresa do Escritório de outro
       * escritório nunca poderá ser associada
       * a este contrato.
       */
      const empresa =
        await prisma.empresaEscritorio.findFirst({
          where: {
            id: empresaId,

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
          },
        })

      if (
        !empresa
      ) {
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

      empresaEscritorioId =
        empresa.id
    }

    let dataInicio:
      | Date
      | null

    let dataEncerramento:
      | Date
      | null

    let ultimaRevisaoEm:
      | Date
      | null

    let proximaRevisaoEm:
      | Date
      | null

    try {
      dataInicio =
        parseDataOpcional(
          body.dataInicio
        )

      dataEncerramento =
        parseDataOpcional(
          body.dataEncerramento
        )

      ultimaRevisaoEm =
        parseDataOpcional(
          body.ultimaRevisaoEm
        )

      proximaRevisaoEm =
        parseDataOpcional(
          body.proximaRevisaoEm
        )
    } catch {
      return NextResponse.json(
        {
          message:
            "Uma ou mais datas informadas são inválidas.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      dataInicio &&
      dataEncerramento &&
      dataEncerramento <
        dataInicio
    ) {
      return NextResponse.json(
        {
          message:
            "A data de encerramento não pode ser anterior à data de início.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      ultimaRevisaoEm &&
      proximaRevisaoEm &&
      proximaRevisaoEm <
        ultimaRevisaoEm
    ) {
      return NextResponse.json(
        {
          message:
            "A próxima revisão não pode ser anterior à última revisão.",
        },
        {
          status: 400,
        }
      )
    }

    const vigente =
      typeof body.vigente ===
      "boolean"
        ? body.vigente
        : contratoAtual.vigente

    if (
      vigente &&
      dataEncerramento
    ) {
      return NextResponse.json(
        {
          message:
            "Contrato vigente não deve possuir data de encerramento.",
        },
        {
          status: 400,
        }
      )
    }

    const contrato =
      await prisma.contratoRepresentada.update({
        where: {
          id:
            contratoAtual.id,
        },

        data: {
          empresaEscritorioId,

          tipoFormalizacao:
            body.tipoFormalizacao.trim(),

          descricao:
            typeof body.descricao ===
              "string" &&
            body.descricao.trim() !==
              ""
              ? body.descricao.trim()
              : null,

          dataInicio,

          dataEncerramento,

          vigente,

          ultimaRevisaoEm,

          proximaRevisaoEm,

          motivoEncerramento:
            typeof body.motivoEncerramento ===
              "string" &&
            body.motivoEncerramento.trim() !==
              ""
              ? body.motivoEncerramento.trim()
              : null,

          arquivoUrl:
            typeof body.arquivoUrl ===
              "string" &&
            body.arquivoUrl.trim() !==
              ""
              ? body.arquivoUrl.trim()
              : null,

          origemDocumento:
            typeof body.origemDocumento ===
              "string" &&
            body.origemDocumento.trim() !==
              ""
              ? body.origemDocumento.trim()
              : null,

          observacoes:
            typeof body.observacoes ===
              "string" &&
            body.observacoes.trim() !==
              ""
              ? body.observacoes.trim()
              : null,
        },

        include: {
          empresaEscritorio: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              status: true,
            },
          },

          _count: {
            select: {
              regrasComerciais:
                true,
            },
          },
        },
      })

    return NextResponse.json(
      {
        message:
          "Contrato atualizado com sucesso.",

        data:
          contrato,
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
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao atualizar contrato da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar contrato da representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
      contratoId: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "contratosRepresentada",
        "excluir"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para excluir contratos de Representadas."
      )
    }

    const {
      id: representadaId,
      contratoId,
    } =
      await params

    /*
     * Confirma simultaneamente:
     * - contrato correto;
     * - Representada correta;
     * - escritório correto.
     */
    const contrato =
      await prisma.contratoRepresentada.findFirst({
        where: {
          id: contratoId,

          representadaId,

          representada: {
            escritorioId:
              sessao.escritorioId,
          },
        },

        select: {
          id: true,

          _count: {
            select: {
              regrasComerciais:
                true,
            },
          },
        },
      })

    if (
      !contrato
    ) {
      return NextResponse.json(
        {
          message:
            "Contrato não encontrado para esta representada.",
        },
        {
          status: 404,
        }
      )
    }

    if (
      contrato._count
        .regrasComerciais >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Este contrato possui regras comerciais vinculadas e não pode ser excluído. Encerre o contrato em vez de apagá-lo.",
        },
        {
          status: 409,
        }
      )
    }

    await prisma.contratoRepresentada.delete({
      where: {
        id:
          contrato.id,
      },
    })

    return NextResponse.json(
      {
        message:
          "Contrato excluído com sucesso.",
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
            "Não autenticado.",
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
        "P2003"
    ) {
      return NextResponse.json(
        {
          message:
            "Este contrato possui registros vinculados e não pode ser excluído.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao excluir contrato da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir contrato da representada.",
      },
      {
        status: 500,
      }
    )
  }
}