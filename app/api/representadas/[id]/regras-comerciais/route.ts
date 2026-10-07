import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

import { exigirSessao } from "@/lib/auth/server"
import { podeExecutarAcao } from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

function parseDataComercial(valor: string): Date {
  const texto = valor.trim()

  /*
   * Os formulários de política usam campos do tipo date e enviam YYYY-MM-DD.
   * O dia é gravado ao meio-dia de Brasília para manter a data comercial
   * estável e permitir comparação inclusiva de início e fim de vigência.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const data = new Date(`${texto}T12:00:00-03:00`)

    if (Number.isNaN(data.getTime())) {
      throw new Error("DATA_INVALIDA")
    }

    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(data)

    const parte = (tipo: string) =>
      partes.find((item) => item.type === tipo)?.value

    const dia = `${parte("year")}-${parte("month")}-${parte("day")}`

    if (dia !== texto) {
      throw new Error("DATA_INVALIDA")
    }

    return data
  }

  const data = new Date(texto)

  if (Number.isNaN(data.getTime())) {
    throw new Error("DATA_INVALIDA")
  }

  return data
}

function parseDataObrigatoria(valor: unknown): Date {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error("DATA_OBRIGATORIA")
  }

  return parseDataComercial(valor)
}

function parseDataOpcional(valor: unknown): Date | null {
  if (typeof valor !== "string" || valor.trim() === "") {
    return null
  }

  return parseDataComercial(valor)
}

function normalizarDataCadastroComoDataComercial(data: Date): Date {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data)

  const parte = (tipo: string) =>
    partes.find((item) => item.type === tipo)?.value

  const dia = `${parte("year")}-${parte("month")}-${parte("day")}`

  return parseDataComercial(dia)
}

function parseNumeroOpcional(valor: unknown): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null
  }

  const texto = String(valor).trim().replace(",", ".")
  const numero = Number(texto)

  if (!Number.isFinite(numero)) {
    throw new Error("NUMERO_INVALIDO")
  }

  return numero
}

function parsePercentual(valor: unknown): number | null {
  if (typeof valor !== "string" && typeof valor !== "number") {
    return null
  }

  const texto = String(valor).trim().replace(",", ".")

  if (!/^\d+(?:\.\d{1,2})?$/.test(texto)) {
    return null
  }

  const numero = Number(texto)

  return Number.isFinite(numero) && numero >= 0 && numero <= 100
    ? numero
    : null
}

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== ""
    ? valor.trim()
    : null
}

type FaixaComissaoNormalizada = {
  desconto: string
  comissao: string
  pedidoMinimo: number | null
}

function normalizarFaixasComissao(valor: unknown): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error("FAIXAS_INVALIDAS")
  }

  let faixas: unknown

  try {
    faixas = JSON.parse(valor)
  } catch {
    throw new Error("FAIXAS_INVALIDAS")
  }

  if (!Array.isArray(faixas) || faixas.length === 0) {
    throw new Error("FAIXAS_INVALIDAS")
  }

  const descontosVistos = new Set<number>()
  const normalizadas: FaixaComissaoNormalizada[] = []

  for (const item of faixas) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("FAIXAS_INVALIDAS")
    }

    const faixa = item as Record<string, unknown>
    const desconto = parsePercentual(faixa.desconto)
    const comissao = parsePercentual(faixa.comissao)

    if (
      desconto === null ||
      comissao === null ||
      comissao <= 0 ||
      descontosVistos.has(desconto)
    ) {
      throw new Error("FAIXAS_INVALIDAS")
    }

    let pedidoMinimoFaixa: number | null = null

    try {
      pedidoMinimoFaixa = parseNumeroOpcional(
        faixa.pedidoMinimo
      )
    } catch {
      throw new Error("FAIXAS_INVALIDAS")
    }

    if (
      pedidoMinimoFaixa !== null &&
      pedidoMinimoFaixa < 0
    ) {
      throw new Error("FAIXAS_INVALIDAS")
    }

    descontosVistos.add(desconto)

    normalizadas.push({
      desconto: String(desconto),
      comissao: String(comissao),
      pedidoMinimo:
        pedidoMinimoFaixa === null
          ? null
          : Number(pedidoMinimoFaixa.toFixed(2)),
    })
  }

  return JSON.stringify(normalizadas)
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

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "regrasComerciais",
        "ver"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para visualizar regras comerciais."
      )
    }

    const {
      id: representadaId,
    } = await params

    const representada =
      await prisma.representada.findFirst({
        where: {
          id: representadaId,
          escritorioId:
            sessao.escritorioId,
        },
        select: {
          id: true,
        },
      })

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

    /*
     * Preposto recebe condições operacionais,
     * mas não recebe dados financeiros internos
     * de comissão.
     */
    if (
      sessao.perfil === "Preposto"
    ) {
      const regrasOperacionais =
        await prisma.regraComercialRepresentada.findMany(
          {
            where: {
              representadaId:
                representada.id,
            },
            select: {
              id: true,
              representadaId: true,
              clienteId: true,
              contratoId: true,
              nome: true,
              tipoEscopo: true,
              vigenciaInicio: true,
              vigenciaFim: true,
              ativa: true,
              pedidoMinimo: true,
              minimoParcela: true,
              prazoEntregaDias: true,
              prazoFaturamentoDias:
                true,
              frete: true,
              regiao: true,
              criadoEm: true,
              atualizadoEm: true,
              cliente: {
                select: {
                  id: true,
                  codigo: true,
                  razaoSocial: true,
                  nomeFantasia: true,
                  status: true,
                },
              },
              contrato: {
                select: {
                  id: true,
                  tipoFormalizacao:
                    true,
                  dataInicio: true,
                  dataEncerramento:
                    true,
                  vigente: true,
                },
              },
              _count: {
                select: {
                  vendas: true,
                },
              },
            },
            orderBy: [
              {
                ativa: "desc",
              },
              {
                vigenciaInicio:
                  "desc",
              },
              {
                criadoEm: "desc",
              },
            ],
          }
        )

      const resposta =
        regrasOperacionais.map(
          (regra) => ({
            ...regra,

            tipoComissao: null,
            percentualComissao:
              null,
            faixasComissao: null,
            reconhecimentoComissao:
              null,
            fechamentoComissao:
              null,
            pagamentoComissao:
              null,
            observacoes: null,

            informacoesFinanceirasRestritas:
              true,
          })
        )

      return NextResponse.json(
        resposta,
        {
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      )
    }

    const regras =
      await prisma.regraComercialRepresentada.findMany(
        {
          where: {
            representadaId:
              representada.id,
          },
          include: {
            cliente: {
              select: {
                id: true,
                codigo: true,
                razaoSocial: true,
                nomeFantasia: true,
                cnpj: true,
                status: true,
              },
            },
            contrato: {
              select: {
                id: true,
                tipoFormalizacao:
                  true,
                descricao: true,
                dataInicio: true,
                dataEncerramento:
                  true,
                vigente: true,
              },
            },
            _count: {
              select: {
                vendas: true,
              },
            },
          },
          orderBy: [
            {
              ativa: "desc",
            },
            {
              vigenciaInicio:
                "desc",
            },
            {
              criadoEm: "desc",
            },
          ],
        }
      )

    return NextResponse.json(
      regras,
      {
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
      "Erro ao listar regras comerciais da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar regras comerciais da representada.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "regrasComerciais",
        "criar"
      )
    ) {
      return respostaNaoAutorizada(
        "Seu perfil não possui permissão para cadastrar regras comerciais."
      )
    }

    const {
      id: representadaId,
    } = await params

    const recebido: unknown =
      await request.json()

    if (
      !recebido ||
      typeof recebido !== "object" ||
      Array.isArray(recebido)
    ) {
      return NextResponse.json(
        {
          message:
            "Dados da política comercial são inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const body =
      recebido as Record<
        string,
        unknown
      >

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
            nome: true,
            criadoEm: true,
          },
        }
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

    if (
      typeof body.nome !==
        "string" ||
      body.nome.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Nome da política comercial é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    const nome =
      body.nome.trim()

    /*
     * REGRA DE DATA DA PRIMEIRA POLÍTICA
     *
     * A primeira política Padrão da Representada começa,
     * por definição operacional atual, na própria data de
     * cadastro da Representada no CRM.
     *
     * A partir da segunda política Padrão, a data de início
     * volta a ser obrigatória, pois representa uma nova
     * versão comercial com vigência própria.
     */
    const politicaPadraoExistente =
      await prisma.regraComercialRepresentada.findFirst(
        {
          where: {
            representadaId:
              representada.id,

            clienteId:
              null,

            tipoEscopo:
              "Padrao",
          },

          select: {
            id: true,
          },
        }
      )

    const primeiraPoliticaPadrao =
      !politicaPadraoExistente

    let vigenciaInicio: Date
    let vigenciaFim:
      | Date
      | null

    try {
      vigenciaInicio =
        primeiraPoliticaPadrao
          ? normalizarDataCadastroComoDataComercial(
              representada.criadoEm
            )
          : parseDataObrigatoria(
              body.vigenciaInicio
            )

      vigenciaFim =
        parseDataOpcional(
          body.vigenciaFim
        )
    } catch {
      return NextResponse.json(
        {
          message:
            primeiraPoliticaPadrao
              ? "Não foi possível determinar a data inicial da primeira política a partir da data de cadastro da Representada."
              : "Informe uma data válida para o início da nova versão da política comercial.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      vigenciaFim &&
      vigenciaFim <
        vigenciaInicio
    ) {
      return NextResponse.json(
        {
          message:
            "A data final da vigência não pode ser anterior à data inicial.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * MODELO COMERCIAL CONTROLADO
     *
     * Novas políticas são sempre da própria Representada.
     * O CRM não aceita novas regras livres por Cliente.
     *
     * Na comissão variável, cada faixa pode definir:
     * - desconto;
     * - comissão;
     * - pedido mínimo próprio.
     *
     * O valor do pedido nunca concede desconto automaticamente.
     * Ele apenas valida se a faixa realmente negociada pode ser usada.
     *
     * Regras antigas vinculadas a Cliente permanecem preservadas
     * no histórico e seguem visíveis no GET.
     */
    const tipoEscopoInformado =
      textoOpcional(
        body.tipoEscopo
      )

    const clienteIdInformado =
      textoOpcional(
        body.clienteId
      )

    if (
      clienteIdInformado ||
      (
        tipoEscopoInformado !==
          null &&
        tipoEscopoInformado !==
          "Padrao"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Novas políticas específicas por Cliente estão desabilitadas. Cadastre as faixas de desconto, comissão e pedido mínimo na política comercial da própria Representada.",
        },
        {
          status: 409,
        }
      )
    }

    const tipoEscopo =
      "Padrao"

    const clienteId =
      null

    let contratoId:
      | string
      | null =
      null

    if (
      typeof body.contratoId ===
        "string" &&
      body.contratoId.trim() !==
        ""
    ) {
      const contratoIdValidado =
        body.contratoId.trim()

      const contrato =
        await prisma.contratoRepresentada.findFirst(
          {
            where: {
              id:
                contratoIdValidado,
              representadaId:
                representada.id,
              representada: {
                escritorioId:
                  sessao.escritorioId,
              },
            },
            select: {
              id: true,
            },
          }
        )

      if (!contrato) {
        return NextResponse.json(
          {
            message:
              "Contrato informado não pertence a esta representada.",
          },
          {
            status: 400,
          }
        )
      }

      contratoId =
        contrato.id
    }

    let pedidoMinimo:
      | number
      | null

    let minimoParcela:
      | number
      | null

    let prazoEntregaDias:
      | number
      | null

    let prazoFaturamentoDias:
      | number
      | null

    let percentualComissao:
      | number
      | null

    try {
      pedidoMinimo =
        parseNumeroOpcional(
          body.pedidoMinimo
        )

      minimoParcela =
        parseNumeroOpcional(
          body.minimoParcela
        )

      prazoEntregaDias =
        parseNumeroOpcional(
          body.prazoEntregaDias
        )

      prazoFaturamentoDias =
        parseNumeroOpcional(
          body.prazoFaturamentoDias
        )

      percentualComissao =
        parseNumeroOpcional(
          body.percentualComissao
        )
    } catch {
      return NextResponse.json(
        {
          message:
            "Um ou mais campos numéricos são inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      pedidoMinimo !== null &&
      pedidoMinimo < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Pedido mínimo não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      minimoParcela !== null &&
      minimoParcela < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Valor mínimo da parcela não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      prazoEntregaDias !==
        null &&
      (
        !Number.isInteger(
          prazoEntregaDias
        ) ||
        prazoEntregaDias < 0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de entrega deve ser um número inteiro igual ou maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      prazoFaturamentoDias !==
        null &&
      (
        !Number.isInteger(
          prazoFaturamentoDias
        ) ||
        prazoFaturamentoDias <
          0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de faturamento deve ser um número inteiro igual ou maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    const tipoComissao =
      textoOpcional(
        body.tipoComissao
      )

    if (
      tipoComissao !== "fixa" &&
      tipoComissao !== "variada"
    ) {
      return NextResponse.json(
        {
          message:
            "Toda política comercial precisa definir comissão fixa ou variável.",
        },
        {
          status: 400,
        }
      )
    }

    let faixasComissao:
      | string
      | null =
      null

    if (
      tipoComissao === "fixa"
    ) {
      const percentualValidado =
        parsePercentual(
          percentualComissao
        )

      if (
        percentualValidado ===
          null ||
        percentualValidado <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Percentual de comissão fixa deve ser maior que zero e no máximo 100%.",
          },
          {
            status: 400,
          }
        )
      }

      percentualComissao =
        percentualValidado
    } else {
      try {
        faixasComissao =
          normalizarFaixasComissao(
            body.faixasComissao
          )

        percentualComissao =
          null
      } catch {
        return NextResponse.json(
          {
            message:
              "Faixas de comissão inválidas. Informe desconto de 0% a 100%, comissão maior que 0% e até 100%, sem descontos repetidos. O pedido mínimo da faixa é opcional e, quando informado, deve ser igual ou maior que zero.",
          },
          {
            status: 400,
          }
        )
      }
    }

    const ativa =
      typeof body.ativa ===
      "boolean"
        ? body.ativa
        : true

    const frete =
      textoOpcional(
        body.frete
      )

    const regiao =
      textoOpcional(
        body.regiao
      )

    const reconhecimentoComissao =
      textoOpcional(
        body.reconhecimentoComissao
      )

    const fechamentoComissao =
      textoOpcional(
        body.fechamentoComissao
      )

    const pagamentoComissao =
      textoOpcional(
        body.pagamentoComissao
      )

    const observacoes =
      textoOpcional(
        body.observacoes
      )

    const regra =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Nunca permitimos duas políticas Padrão ativas
           * com vigências sobrepostas.
           *
           * Se houver uma versão atual aberta, ela precisa
           * ser encerrada antes da entrada de uma nova
           * versão ativa.
           */
          if (ativa) {
            const conflito =
              await tx.regraComercialRepresentada.findFirst(
                {
                  where: {
                    representadaId:
                      representada.id,

                    clienteId:
                      null,

                    tipoEscopo:
                      "Padrao",

                    ativa:
                      true,

                    ...(vigenciaFim
                      ? {
                          vigenciaInicio:
                            {
                              lte:
                                vigenciaFim,
                            },
                        }
                      : {}),

                    AND: [
                      {
                        OR: [
                          {
                            vigenciaFim:
                              null,
                          },
                          {
                            vigenciaFim:
                              {
                                gte:
                                  vigenciaInicio,
                              },
                          },
                        ],
                      },
                    ],
                  },
                  select: {
                    id: true,
                    nome: true,
                    vigenciaInicio:
                      true,
                    vigenciaFim:
                      true,
                  },
                }
              )

            if (conflito) {
              throw new Error(
                "POLITICA_VIGENCIA_CONFLITANTE"
              )
            }
          }

          const criada =
            await tx.regraComercialRepresentada.create(
              {
                data: {
                  representadaId:
                    representada.id,

                  clienteId,

                  contratoId,

                  nome,

                  tipoEscopo,

                  vigenciaInicio,

                  vigenciaFim,

                  ativa,

                  pedidoMinimo,

                  minimoParcela,

                  prazoEntregaDias:
                    prazoEntregaDias ===
                    null
                      ? null
                      : Math.trunc(
                          prazoEntregaDias
                        ),

                  prazoFaturamentoDias:
                    prazoFaturamentoDias ===
                    null
                      ? null
                      : Math.trunc(
                          prazoFaturamentoDias
                        ),

                  frete,

                  regiao,

                  tipoComissao,

                  percentualComissao,

                  faixasComissao,

                  reconhecimentoComissao,

                  fechamentoComissao,

                  pagamentoComissao,

                  observacoes,
                },

                include: {
                  cliente: {
                    select: {
                      id: true,
                      codigo: true,
                      razaoSocial:
                        true,
                      nomeFantasia:
                        true,
                    },
                  },

                  contrato: {
                    select: {
                      id: true,
                      tipoFormalizacao:
                        true,
                      vigente: true,
                    },
                  },

                  _count: {
                    select: {
                      vendas: true,
                    },
                  },
                },
              }
            )

          await tx.auditoria.create(
            {
              data: {
                escritorioId:
                  sessao.escritorioId,

                usuarioId:
                  sessao.usuarioId,

                entidade:
                  "RegraComercialRepresentada",

                entidadeId:
                  criada.id,

                acao:
                  "CRIACAO_POLITICA_COMERCIAL",

                dadosDepois: {
                  id:
                    criada.id,

                  representadaId:
                    representada.id,

                  representadaNome:
                    representada.nome,

                  nome:
                    criada.nome,

                  tipoEscopo:
                    criada.tipoEscopo,

                  vigenciaInicio:
                    criada.vigenciaInicio.toISOString(),

                  origemVigenciaInicio:
                    primeiraPoliticaPadrao
                      ? "DATA_CADASTRO_REPRESENTADA"
                      : "INFORMADA_NOVA_VERSAO",

                  vigenciaFim:
                    criada.vigenciaFim
                      ?.toISOString() ??
                    null,

                  ativa:
                    criada.ativa,

                  pedidoMinimo:
                    criada.pedidoMinimo,

                  minimoParcela:
                    criada.minimoParcela,

                  prazoEntregaDias:
                    criada.prazoEntregaDias,

                  prazoFaturamentoDias:
                    criada.prazoFaturamentoDias,

                  frete:
                    criada.frete,

                  regiao:
                    criada.regiao,

                  tipoComissao:
                    criada.tipoComissao,

                  percentualComissao:
                    criada.percentualComissao,

                  faixasComissao:
                    criada.faixasComissao,

                  reconhecimentoComissao:
                    criada.reconhecimentoComissao,

                  fechamentoComissao:
                    criada.fechamentoComissao,

                  pagamentoComissao:
                    criada.pagamentoComissao,

                  observacoes:
                    criada.observacoes,

                  modeloComercial: {
                    politicaUnicaDaRepresentada:
                      true,

                    faixaVariavelComPedidoMinimo:
                      true,

                    descontoAutomatico:
                      false,

                    primeiraPoliticaUsaDataCadastroRepresentada:
                      true,
                  },
                },
              },
            }
          )

          return criada
        },
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        }
      )

    return NextResponse.json(
      regra,
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
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    if (
      error instanceof Error &&
      error.message ===
        "POLITICA_VIGENCIA_CONFLITANTE"
    ) {
      return NextResponse.json(
        {
          message:
            "Conflito cadastral: já existe uma política comercial Padrão ativa com vigência sobreposta para esta Representada. Encerre a vigência anterior antes de criar uma nova versão ativa.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        {
          message:
            "A política comercial foi alterada por outra operação simultânea. Atualize a página e tente novamente.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao cadastrar política comercial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar política comercial.",
      },
      {
        status: 500,
      }
    )
  }
}