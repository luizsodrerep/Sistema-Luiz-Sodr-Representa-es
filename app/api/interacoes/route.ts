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

export async function GET(
  request: Request
) {
  try {
    const sessao = await exigirSessao()

    const { searchParams } =
      new URL(request.url)

    const clienteId =
      searchParams.get("clienteId")

    const representadaId =
      searchParams.get(
        "representadaId"
      )

    const tipo =
      searchParams.get("tipo")

    const interacoes =
      await prisma.interacao.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          ...(clienteId
            ? { clienteId }
            : {}),

          ...(representadaId
            ? { representadaId }
            : {}),

          ...(tipo &&
          tipo !== "todas"
            ? { tipo }
            : {}),

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
          ...(sessao.perfil ===
          "Preposto"
            ? {
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
              }
            : {}),
        },

        include: {
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
        },

        orderBy: {
          data: "desc",
        },
      })

    return NextResponse.json(
      interacoes
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
     * Uma interação pode pertencer a apenas
     * um dos três contextos:
     *
     * - Cliente
     * - Representada
     * - Prospecção / Lead
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

    const quantidadeVinculos =
      [
        possuiCliente,
        possuiRepresentada,
        possuiProspeccao,
      ].filter(Boolean).length

    if (
      quantidadeVinculos === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione um Cliente, uma Representada ou registre uma Prospecção / Lead.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      quantidadeVinculos > 1
    ) {
      return NextResponse.json(
        {
          message:
            "A interação deve ser relacionada somente a um contexto: Cliente, Representada ou Prospecção.",
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
       * Interações institucionais com
       * representadas permanecem restritas
       * ao Diretor e Administrativo.
       */
      if (
        sessao.perfil === "Preposto"
      ) {
        return NextResponse.json(
          {
            message:
              "Seu perfil não possui permissão para registrar interações institucionais com representadas.",
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