import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { exigirSessao } from "@/lib/auth/server"
import { NextResponse } from "next/server"

const ORIGENS_PROSPECCAO_PERMITIDAS = [
  "Visita presencial",
  "Instagram",
  "WhatsApp",
  "Indicação",
  "Telefone",
  "E-mail",
  "Site / Internet",
  "Feira / Evento",
]

function inteiroPositivo(
  valor: string | null,
  padrao: number,
  maximo: number
) {
  if (!valor) {
    return padrao
  }

  const numero =
    Number.parseInt(
      valor,
      10
    )

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    return padrao
  }

  return Math.min(
    numero,
    maximo
  )
}

function dataFiltro(
  valor: string | null,
  fimDoDia = false
) {
  if (!valor) {
    return null
  }

  const somenteData =
    /^\d{4}-\d{2}-\d{2}$/.test(
      valor
    )

  const data =
    somenteData
      ? new Date(
          `${valor}T${
            fimDoDia
              ? "23:59:59.999"
              : "00:00:00.000"
          }Z`
        )
      : new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
}

function numeroDaBusca(
  busca: string
) {
  const correspondencia =
    busca.match(/\d+/)

  if (!correspondencia) {
    return null
  }

  const numero =
    Number.parseInt(
      correspondencia[0],
      10
    )

  return Number.isInteger(numero)
    ? numero
    : null
}

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    const { searchParams } =
      new URL(request.url)

    const clienteId =
      searchParams
        .get("clienteId")
        ?.trim() || null

    const representadaId =
      searchParams
        .get("representadaId")
        ?.trim() || null

    const tipo =
      searchParams
        .get("tipo")
        ?.trim() || null

    const statusFollowUp =
      searchParams
        .get("statusFollowUp")
        ?.trim() || null

    const busca =
      searchParams
        .get("busca")
        ?.trim() || null

    const dataInicioTexto =
      searchParams
        .get("dataInicio")
        ?.trim() || null

    const dataFimTexto =
      searchParams
        .get("dataFim")
        ?.trim() || null

    const dataInicio =
      dataFiltro(
        dataInicioTexto
      )

    const dataFim =
      dataFiltro(
        dataFimTexto,
        true
      )

    if (
      dataInicioTexto &&
      !dataInicio
    ) {
      return NextResponse.json(
        {
          message:
            "Data inicial inválida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      dataFimTexto &&
      !dataFim
    ) {
      return NextResponse.json(
        {
          message:
            "Data final inválida.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      dataInicio &&
      dataFim &&
      dataInicio.getTime() >
        dataFim.getTime()
    ) {
      return NextResponse.json(
        {
          message:
            "A data inicial não pode ser posterior à data final.",
        },
        {
          status: 400,
        }
      )
    }

    const pagina =
      inteiroPositivo(
        searchParams.get(
          "page"
        ),
        1,
        1000000
      )

    const limite =
      inteiroPositivo(
        searchParams.get(
          "limit"
        ),
        10,
        50
      )

    const paginado =
      searchParams.get(
        "paginado"
      ) === "1" ||
      searchParams.has(
        "page"
      ) ||
      searchParams.has(
        "limit"
      )

    const filtrosAnd:
      Prisma.InteracaoWhereInput[] =
      []

    /*
     * PREPOSTO
     *
     * Pode visualizar:
     *
     * 1. Interações relacionadas aos
     *    clientes pertencentes à sua carteira;
     *
     * 2. Prospecções ainda sem Cliente,
     *    desde que sejam de sua responsabilidade
     *    ou tenham sido criadas por ele.
     *
     * Diretor e Administrativo continuam
     * visualizando todas as interações
     * do escritório.
     */
    if (
      sessao.perfil ===
      "Preposto"
    ) {
      filtrosAnd.push({
        OR: [
          {
            cliente: {
              is: {
                escritorioId:
                  sessao.escritorioId,

                OR: [
                  {
                    responsavelPrincipalId:
                      sessao.usuarioId,
                  },
                  {
                    participantes: {
                      some: {
                        usuarioId:
                          sessao.usuarioId,
                        ativa: true,
                      },
                    },
                  },
                ],
              },
            },
          },

          {
            AND: [
              {
                clienteId:
                  null,
              },
              {
                representadaId:
                  null,
              },
              {
                OR: [
                  {
                    responsavelId:
                      sessao.usuarioId,
                  },
                  {
                    criadoPorId:
                      sessao.usuarioId,
                  },
                ],
              },
            ],
          },
        ],
      })
    }

    if (busca) {
      const numeroSequencial =
        numeroDaBusca(
          busca
        )

      const filtrosBusca:
        Prisma.InteracaoWhereInput[] =
        [
          {
            assunto: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
          {
            descricao: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
          {
            resultado: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
          {
            proximosPasso: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
          {
            tipo: {
              contains:
                busca,
              mode:
                "insensitive",
            },
          },
        ]

      if (
        numeroSequencial !==
        null
      ) {
        filtrosBusca.unshift({
          numeroSequencial,
        })
      }

      filtrosAnd.push({
        OR:
          filtrosBusca,
      })
    }

    if (
      dataInicio ||
      dataFim
    ) {
      filtrosAnd.push({
        data: {
          ...(dataInicio
            ? {
                gte:
                  dataInicio,
              }
            : {}),

          ...(dataFim
            ? {
                lte:
                  dataFim,
              }
            : {}),
        },
      })
    }

    const where:
      Prisma.InteracaoWhereInput =
      {
        escritorioId:
          sessao.escritorioId,

        ...(clienteId
          ? {
              clienteId,
            }
          : {}),

        ...(representadaId
          ? {
              representadaId,
            }
          : {}),

        ...(tipo &&
        tipo !== "todas"
          ? {
              tipo,
            }
          : {}),

        ...(statusFollowUp &&
        statusFollowUp !==
          "todos"
          ? {
              statusFollowUp,
            }
          : {}),

        ...(filtrosAnd.length >
        0
          ? {
              AND:
                filtrosAnd,
            }
          : {}),
      }

    const include:
      Prisma.InteracaoInclude =
      {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            whatsapp: true,
            telefone: true,
            email: true,
            contato: true,
          },
        },

        representada: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
          },
        },

        criadoPor: {
          select: {
            id: true,
            nome: true,
            perfil: true,
          },
        },

        responsavel: {
          select: {
            id: true,
            nome: true,
            perfil: true,
          },
        },
      }

    if (!paginado) {
      const interacoes =
        await prisma.interacao.findMany({
          where,
          include,

          orderBy: [
            {
              data:
                "desc",
            },
            {
              criadoEm:
                "desc",
            },
          ],
        })

      return NextResponse.json(
        interacoes
      )
    }

    const [
      total,
      interacoes,
    ] =
      await prisma.$transaction([
        prisma.interacao.count({
          where,
        }),

        prisma.interacao.findMany({
          where,
          include,

          orderBy: [
            {
              data:
                "desc",
            },
            {
              criadoEm:
                "desc",
            },
          ],

          skip:
            (pagina - 1) *
            limite,

          take:
            limite,
        }),
      ])

    const totalPaginas =
      Math.max(
        1,
        Math.ceil(
          total /
            limite
        )
      )

    return NextResponse.json({
      dados:
        interacoes,

      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
      },
    })
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
      "Erro ao listar interações:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar interações.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    const body =
      await request.json()

    const clienteId =
      typeof body.clienteId ===
        "string" &&
      body.clienteId.trim() !== ""
        ? body.clienteId.trim()
        : null

    const representadaId =
      typeof body.representadaId ===
        "string" &&
      body.representadaId.trim() !== ""
        ? body.representadaId.trim()
        : null

    const nomeProspect =
      typeof body.nomeProspect ===
        "string" &&
      body.nomeProspect.trim() !== ""
        ? body.nomeProspect.trim()
        : null

    const empresaProspect =
      typeof body.empresaProspect ===
        "string" &&
      body.empresaProspect.trim() !== ""
        ? body.empresaProspect.trim()
        : null

    const origemProspeccao =
      typeof body.origemProspeccao ===
        "string" &&
      body.origemProspeccao.trim() !==
        ""
        ? body.origemProspeccao.trim()
        : null

    /*
     * Contextos permitidos:
     *
     * - Cliente
     * - Representada
     * - Cliente + Representada
     * - Prospecção / Lead ainda sem cadastro
     *
     * A Prospecção / Lead sem cadastro
     * permanece exclusiva e não pode ser
     * misturada com Cliente ou Representada.
     */
    const possuiCliente =
      Boolean(clienteId)

    const possuiRepresentada =
      Boolean(representadaId)

    const possuiProspeccao =
      Boolean(
        nomeProspect ||
          empresaProspect ||
          origemProspeccao
      )

    if (
      !possuiCliente &&
      !possuiRepresentada &&
      !possuiProspeccao
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione um Cliente, uma Representada, Cliente + Representada ou registre uma Prospecção / Lead.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      possuiProspeccao &&
      (
        possuiCliente ||
        possuiRepresentada
      )
    ) {
      return NextResponse.json(
        {
          message:
            "A Prospecção / Lead sem cadastro não pode ser combinada com Cliente ou Representada já cadastrados.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Validações específicas da Prospecção.
     */
    if (possuiProspeccao) {
      if (!nomeProspect) {
        return NextResponse.json(
          {
            message:
              "Informe o nome ou a referência da prospecção.",
          },
          {
            status: 400,
          }
        )
      }

      if (!origemProspeccao) {
        return NextResponse.json(
          {
            message:
              "Informe a origem da prospecção.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        !ORIGENS_PROSPECCAO_PERMITIDAS.includes(
          origemProspeccao
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Origem da prospecção inválida.",
          },
          {
            status: 400,
          }
        )
      }
    }

    if (
      !body.tipo ||
      typeof body.tipo !== "string" ||
      body.tipo.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de interação é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * CLIENTE
     */
    if (clienteId) {
      const cliente =
        await prisma.cliente.findFirst({
          where: {
            id: clienteId,

            escritorioId:
              sessao.escritorioId,

            ...(sessao.perfil ===
            "Preposto"
              ? {
                  OR: [
                    {
                      responsavelPrincipalId:
                        sessao.usuarioId,
                    },
                    {
                      participantes: {
                        some: {
                          usuarioId:
                            sessao.usuarioId,
                          ativa: true,
                        },
                      },
                    },
                  ],
                }
              : {}),
          },

          select: {
            id: true,
          },
        })

      if (!cliente) {
        return NextResponse.json(
          {
            message:
              "Cliente não encontrado ou sem permissão de acesso.",
          },
          {
            status: 403,
          }
        )
      }
    }

    /*
     * REPRESENTADA
     */
    if (representadaId) {
      /*
       * Interações exclusivamente
       * institucionais com Representadas
       * permanecem restritas ao Diretor
       * e Administrativo.
       *
       * Quando houver Cliente + Representada,
       * o Preposto pode registrar a interação
       * desde que tenha acesso ao Cliente.
       * Esse acesso já foi validado acima.
       */
      if (
        sessao.perfil === "Preposto" &&
        !clienteId
      ) {
        return NextResponse.json(
          {
            message:
              "Seu perfil não possui permissão para registrar interações exclusivamente institucionais com representadas.",
          },
          {
            status: 403,
          }
        )
      }

      const representada =
        await prisma.representada.findFirst(
          {
            where: {
              id: representadaId,

              escritorioId:
                sessao.escritorioId,
            },

            select: {
              id: true,
            },
          }
        )

      if (!representada) {
        return NextResponse.json(
          {
            message:
              "Representada não encontrada ou sem permissão de acesso.",
          },
          {
            status: 403,
          }
        )
      }
    }

    let proximoContatoEm:
      | Date
      | null = null

    if (
      typeof body.proximoContatoEm ===
        "string" &&
      body.proximoContatoEm.trim() !== ""
    ) {
      const dataProximoContato =
        new Date(
          body.proximoContatoEm
        )

      if (
        Number.isNaN(
          dataProximoContato.getTime()
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Data do próximo acompanhamento é inválida.",
          },
          {
            status: 400,
          }
        )
      }

      proximoContatoEm =
        dataProximoContato
    }

    /*
     * Data/hora oficial da interação:
     * definida pelo servidor.
     */
    const agora =
      new Date()

    const interacao =
      await prisma.interacao.create({
        data: {
          escritorioId:
            sessao.escritorioId,

          criadoPorId:
            sessao.usuarioId,

          responsavelId:
            sessao.usuarioId,

          clienteId,
          representadaId,

          /*
           * Dados da Prospecção ficam nulos
           * nas interações tradicionais.
           */
          nomeProspect:
            possuiProspeccao
              ? nomeProspect
              : null,

          empresaProspect:
            possuiProspeccao
              ? empresaProspect
              : null,

          origemProspeccao:
            possuiProspeccao
              ? origemProspeccao
              : null,

          tipo:
            body.tipo.trim(),

          data: agora,

          assunto:
            typeof body.assunto ===
              "string" &&
            body.assunto.trim() !== ""
              ? body.assunto.trim()
              : null,

          descricao:
            typeof body.descricao ===
              "string" &&
            body.descricao.trim() !== ""
              ? body.descricao.trim()
              : null,

          resultado:
            typeof body.resultado ===
              "string" &&
            body.resultado.trim() !== ""
              ? body.resultado.trim()
              : null,

          proximosPasso:
            typeof body.proximosPasso ===
              "string" &&
            body.proximosPasso.trim() !==
              ""
              ? body.proximosPasso.trim()
              : null,

          proximoContatoEm,

          statusFollowUp:
            proximoContatoEm
              ? "Aberto"
              : "Sem acompanhamento",
        },

        include: {
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },

          representada: {
            select: {
              id: true,
              nome: true,
            },
          },

          criadoPor: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },

          responsavel: {
            select: {
              id: true,
              nome: true,
              perfil: true,
            },
          },
        },
      })

    return NextResponse.json(
      interacao,
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

    console.error(
      "Erro ao criar interação:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar interação.",
      },
      {
        status: 500,
      }
    )
  }
}