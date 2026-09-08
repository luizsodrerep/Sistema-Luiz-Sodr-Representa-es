import {
  randomUUID,
} from "crypto"

import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

import {
  NextRequest,
  NextResponse,
} from "next/server"

const TIPOS_PERMITIDOS = [
  "Entrada",
  "Saida",
  "SaldoInicial",
] as const

const STATUS_PERMITIDOS = [
  "Pendente",
  "Realizado",
  "Cancelado",
] as const

const CATEGORIA_TRANSFERENCIA =
  "Transferência entre contas"

const PREFIXO_TRANSFERENCIA =
  "TRANSFERENCIA_INTERNA:"

type TipoFinanceiro =
  (typeof TIPOS_PERMITIDOS)[number]

type StatusFinanceiro =
  (typeof STATUS_PERMITIDOS)[number]

type MovimentoParaResumo = {
  tipo: string
  status: string
  valor: number
  vencimento: Date | null
}

type ResumoFinanceiro = {
  saldoInicial: number

  entradasRealizadas: number
  saidasRealizadas: number

  saldoRealizado: number

  entradasPendentes: number
  saidasPendentes: number

  saldoProjetado: number

  quantidadeVencidas: number
  valorVencido: number
}

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

function numeroFinito(
  valor: unknown
): number | null {
  if (
    typeof valor === "number" &&
    Number.isFinite(valor)
  ) {
    return valor
  }

  if (
    typeof valor === "string" &&
    valor.trim()
  ) {
    const convertido =
      Number(valor)

    if (
      Number.isFinite(
        convertido
      )
    ) {
      return convertido
    }
  }

  return null
}

function inteiroPositivo(
  valor: unknown,
  padrao: number
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return padrao
  }

  const numero =
    Number(valor)

  if (
    !Number.isInteger(
      numero
    ) ||
    numero <= 0
  ) {
    return null
  }

  return numero
}

function dataValida(
  valor: unknown
): Date | null {
  if (
    typeof valor !== "string" ||
    !valor.trim()
  ) {
    return null
  }

  const texto =
    valor.trim()

  const somenteData =
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )

  const data =
    somenteData
      ? new Date(
          `${texto}T12:00:00.000Z`
        )
      : new Date(texto)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
}

function hojeUtcMeioDia() {
  const agora =
    new Date()

  return new Date(
    Date.UTC(
      agora.getUTCFullYear(),
      agora.getUTCMonth(),
      agora.getUTCDate(),
      12,
      0,
      0,
      0
    )
  )
}

function adicionarMeses(
  data: Date,
  quantidade: number
) {
  const novaData =
    new Date(data)

  const diaOriginal =
    novaData.getUTCDate()

  novaData.setUTCDate(1)

  novaData.setUTCMonth(
    novaData.getUTCMonth() +
      quantidade
  )

  const ultimoDiaMes =
    new Date(
      Date.UTC(
        novaData.getUTCFullYear(),
        novaData.getUTCMonth() + 1,
        0,
        12,
        0,
        0,
        0
      )
    ).getUTCDate()

  novaData.setUTCDate(
    Math.min(
      diaOriginal,
      ultimoDiaMes
    )
  )

  novaData.setUTCHours(
    12,
    0,
    0,
    0
  )

  return novaData
}

function distribuirValorParcelas(
  valorTotal: number,
  quantidade: number
) {
  const totalCentavos =
    Math.round(
      valorTotal * 100
    )

  const baseCentavos =
    Math.floor(
      totalCentavos /
        quantidade
    )

  const resto =
    totalCentavos -
    baseCentavos *
      quantidade

  return Array.from(
    {
      length:
        quantidade,
    },
    (_, indice) => {
      const adicional =
        indice ===
        quantidade - 1
          ? resto
          : 0

      return (
        baseCentavos +
        adicional
      ) / 100
    }
  )
}

function tipoPermitido(
  valor: unknown
): valor is TipoFinanceiro {
  return (
    typeof valor === "string" &&
    TIPOS_PERMITIDOS.includes(
      valor as TipoFinanceiro
    )
  )
}

function statusPermitido(
  valor: unknown
): valor is StatusFinanceiro {
  return (
    typeof valor === "string" &&
    STATUS_PERMITIDOS.includes(
      valor as StatusFinanceiro
    )
  )
}

function ehTransferenciaInterna(
  movimento: {
    categoria: string | null
    origem: string | null
  }
) {
  return (
    movimento.categoria ===
      CATEGORIA_TRANSFERENCIA &&
    typeof movimento.origem ===
      "string" &&
    movimento.origem.startsWith(
      PREFIXO_TRANSFERENCIA
    )
  )
}

function respostaNaoAutorizada() {
  return NextResponse.json(
    {
      erro:
        "Você não tem permissão para executar esta ação no Financeiro.",
    },
    {
      status: 403,
    }
  )
}

function respostaErro(
  error: unknown,
  mensagemPadrao: string
) {
  if (
    error instanceof Error &&
    error.message ===
      "NAO_AUTENTICADO"
  ) {
    return NextResponse.json(
      {
        erro:
          "Usuário não autenticado.",
      },
      {
        status: 401,
      }
    )
  }

  console.error(
    mensagemPadrao,
    error
  )

  return NextResponse.json(
    {
      erro:
        mensagemPadrao,
    },
    {
      status: 500,
    }
  )
}

function criarResumoVazio(): ResumoFinanceiro {
  return {
    saldoInicial: 0,

    entradasRealizadas: 0,
    saidasRealizadas: 0,

    saldoRealizado: 0,

    entradasPendentes: 0,
    saidasPendentes: 0,

    saldoProjetado: 0,

    quantidadeVencidas: 0,
    valorVencido: 0,
  }
}

function aplicarMovimentoNoResumo(
  resumo: ResumoFinanceiro,
  movimento: MovimentoParaResumo,
  hojeReferencia: Date
) {
  if (
    movimento.status ===
    "Cancelado"
  ) {
    return
  }

  if (
    movimento.status ===
    "Realizado"
  ) {
    if (
      movimento.tipo ===
      "SaldoInicial"
    ) {
      resumo.saldoInicial +=
        movimento.valor

      resumo.saldoRealizado +=
        movimento.valor

      resumo.saldoProjetado +=
        movimento.valor

      return
    }

    if (
      movimento.tipo ===
      "Entrada"
    ) {
      resumo.entradasRealizadas +=
        movimento.valor

      resumo.saldoRealizado +=
        movimento.valor

      resumo.saldoProjetado +=
        movimento.valor

      return
    }

    if (
      movimento.tipo ===
      "Saida"
    ) {
      resumo.saidasRealizadas +=
        movimento.valor

      resumo.saldoRealizado -=
        movimento.valor

      resumo.saldoProjetado -=
        movimento.valor
    }

    return
  }

  if (
    movimento.status !==
    "Pendente"
  ) {
    return
  }

  if (
    movimento.tipo ===
    "Entrada"
  ) {
    resumo.entradasPendentes +=
      movimento.valor

    resumo.saldoProjetado +=
      movimento.valor

    return
  }

  if (
    movimento.tipo ===
    "Saida"
  ) {
    resumo.saidasPendentes +=
      movimento.valor

    resumo.saldoProjetado -=
      movimento.valor

    if (
      movimento.vencimento &&
      movimento.vencimento.getTime() <
        hojeReferencia.getTime()
    ) {
      resumo.quantidadeVencidas +=
        1

      resumo.valorVencido +=
        movimento.valor
    }
  }
}

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "financeiro",
        "ver"
      )
    ) {
      return respostaNaoAutorizada()
    }

    const [
      movimentos,
      contasBancarias,
    ] =
      await Promise.all([
        prisma.financeiro.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,
          },

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

          select: {
            id: true,

            data: true,

            tipo: true,

            categoria:
              true,

            descricao:
              true,

            origem: true,

            origemExterna:
              true,

            valor: true,

            status: true,

            vencimento:
              true,

            contaBancariaId:
              true,

            criadoEm:
              true,

            atualizadoEm:
              true,

            contaBancaria: {
              select: {
                id: true,

                nome: true,

                banco: true,

                agencia:
                  true,

                conta:
                  true,

                ativa:
                  true,
              },
            },
          },
        }),

        prisma.contaBancaria.findMany({
          where: {
            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,

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

            empresaEscritorioId:
              true,

            usuarioTitularId:
              true,
          },

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
        }),
      ])

    const hojeReferencia =
      hojeUtcMeioDia()

    const resumo =
      criarResumoVazio()

    const resumoPorConta =
      new Map<
        string,
        ResumoFinanceiro
      >()

    for (
      const conta of
      contasBancarias
    ) {
      resumoPorConta.set(
        conta.id,
        criarResumoVazio()
      )
    }

    const resumoSemConta =
      criarResumoVazio()

    let quantidadeSemConta =
      0

    for (
      const movimento of
      movimentos
    ) {
      aplicarMovimentoNoResumo(
        resumo,
        movimento,
        hojeReferencia
      )

      if (
        movimento.contaBancariaId
      ) {
        const resumoConta =
          resumoPorConta.get(
            movimento.contaBancariaId
          )

        if (
          resumoConta
        ) {
          aplicarMovimentoNoResumo(
            resumoConta,
            movimento,
            hojeReferencia
          )
        }

        continue
      }

      quantidadeSemConta +=
        1

      aplicarMovimentoNoResumo(
        resumoSemConta,
        movimento,
        hojeReferencia
      )
    }

    const contas =
      contasBancarias.map(
        (conta) => ({
          ...conta,

          resumo:
            resumoPorConta.get(
              conta.id
            ) ??
            criarResumoVazio(),
        })
      )

    return NextResponse.json(
      {
        movimentos,

        resumo,

        contas,

        semConta: {
          quantidade:
            quantidadeSemConta,

          resumo:
            resumoSemConta,
        },
      },
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
      "Não foi possível carregar o Financeiro."
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
        "financeiro",
        "criar"
      )
    ) {
      return respostaNaoAutorizada()
    }

    const body =
      await request.json()

    /*
     * TRANSFERÊNCIA ENTRE CONTAS
     *
     * É uma única operação lógica,
     * registrada contabilmente em duas pontas:
     *
     * - saída na conta de origem;
     * - entrada na conta de destino.
     *
     * Como os valores são iguais, o saldo
     * consolidado do escritório não muda.
     */
    if (
      body.operacao ===
      "Transferencia"
    ) {
      const contaOrigemId =
        textoObrigatorio(
          body.contaOrigemId
        )

      const contaDestinoId =
        textoObrigatorio(
          body.contaDestinoId
        )

      if (
        !contaOrigemId ||
        !contaDestinoId
      ) {
        return NextResponse.json(
          {
            erro:
              "Selecione a conta de origem e a conta de destino.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        contaOrigemId ===
        contaDestinoId
      ) {
        return NextResponse.json(
          {
            erro:
              "A conta de origem e a conta de destino precisam ser diferentes.",
          },
          {
            status: 400,
          }
        )
      }

      const valor =
        numeroFinito(
          body.valor
        )

      if (
        valor === null ||
        valor <= 0
      ) {
        return NextResponse.json(
          {
            erro:
              "Informe um valor de transferência maior que zero.",
          },
          {
            status: 400,
          }
        )
      }

      const data =
        dataValida(
          body.data
        ) ??
        hojeUtcMeioDia()

      const [
        contaOrigem,
        contaDestino,
      ] =
        await Promise.all([
          prisma.contaBancaria.findFirst({
            where: {
              id:
                contaOrigemId,

              escritorioId:
                sessao.escritorioId,

              ativa: true,
            },

            select: {
              id: true,

              nome: true,

              banco: true,
            },
          }),

          prisma.contaBancaria.findFirst({
            where: {
              id:
                contaDestinoId,

              escritorioId:
                sessao.escritorioId,

              ativa: true,
            },

            select: {
              id: true,

              nome: true,

              banco: true,
            },
          }),
        ])

      if (
        !contaOrigem
      ) {
        return NextResponse.json(
          {
            erro:
              "Conta de origem inválida ou inativa.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        !contaDestino
      ) {
        return NextResponse.json(
          {
            erro:
              "Conta de destino inválida ou inativa.",
          },
          {
            status: 400,
          }
        )
      }

      const identificador =
        `${PREFIXO_TRANSFERENCIA}${randomUUID()}`

      const descricao =
        CATEGORIA_TRANSFERENCIA

      const [
        saida,
        entrada,
      ] =
        await prisma.$transaction([
          prisma.financeiro.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              data,

              tipo:
                "Saida",

              categoria:
                CATEGORIA_TRANSFERENCIA,

              descricao,

              /*
               * Campo técnico usado para manter as
               * duas pontas da transferência ligadas.
               *
               * O frontend não exibirá este valor
               * para o usuário.
               */
              origem:
                identificador,

              origemExterna:
                false,

              valor,

              status:
                "Realizado",

              vencimento:
                null,

              contaBancariaId:
                contaOrigem.id,
            },
          }),

          prisma.financeiro.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              data,

              tipo:
                "Entrada",

              categoria:
                CATEGORIA_TRANSFERENCIA,

              descricao,

              origem:
                identificador,

              origemExterna:
                false,

              valor,

              status:
                "Realizado",

              vencimento:
                null,

              contaBancariaId:
                contaDestino.id,
            },
          }),
        ])

      return NextResponse.json(
        {
          message:
            "Transferência entre contas registrada com sucesso.",

          transferencia: {
            valor,

            data,

            origem: {
              id:
                contaOrigem.id,

              nome:
                contaOrigem.nome,

              banco:
                contaOrigem.banco,
            },

            destino: {
              id:
                contaDestino.id,

              nome:
                contaDestino.nome,

              banco:
                contaDestino.banco,
            },

            movimentos: {
              saidaId:
                saida.id,

              entradaId:
                entrada.id,
            },
          },
        },
        {
          status: 201,
        }
      )
    }

    if (
      !tipoPermitido(
        body.tipo
      )
    ) {
      return NextResponse.json(
        {
          erro:
            "Tipo financeiro inválido.",
        },
        {
          status: 400,
        }
      )
    }

    const tipo =
      body.tipo

    const valor =
      numeroFinito(
        body.valor
      )

    if (
      valor === null
    ) {
      return NextResponse.json(
        {
          erro:
            "Informe um valor válido.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      tipo ===
        "SaldoInicial" &&
      valor === 0
    ) {
      return NextResponse.json(
        {
          erro:
            "O saldo inicial não pode ser zero.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      tipo !==
        "SaldoInicial" &&
      valor <= 0
    ) {
      return NextResponse.json(
        {
          erro:
            "Entradas e saídas devem possuir valor maior que zero.",
        },
        {
          status: 400,
        }
      )
    }

    const descricao =
      textoObrigatorio(
        body.descricao
      )

    if (
      !descricao
    ) {
      return NextResponse.json(
        {
          erro:
            "Informe uma descrição.",
        },
        {
          status: 400,
        }
      )
    }

    const data =
      dataValida(
        body.data
      ) ??
      hojeUtcMeioDia()

    let status:
      StatusFinanceiro

    if (
      tipo ===
      "SaldoInicial"
    ) {
      status =
        "Realizado"
    } else {
      if (
        !statusPermitido(
          body.status
        ) ||
        body.status ===
          "Cancelado"
      ) {
        return NextResponse.json(
          {
            erro:
              "Situação financeira inválida.",
          },
          {
            status: 400,
          }
        )
      }

      status =
        body.status
    }

    const categoria =
      textoOpcional(
        body.categoria
      )

    const origem =
      textoOpcional(
        body.origem
      )

    const origemExterna =
      tipo ===
      "SaldoInicial"
        ? false
        : body.origemExterna ===
          true

    const contaBancariaId =
      textoOpcional(
        body.contaBancariaId
      )

    const empresaEscritorioId =
      textoOpcional(
        body.empresaEscritorioId
      )

    if (
      tipo ===
        "SaldoInicial" &&
      !contaBancariaId
    ) {
      return NextResponse.json(
        {
          erro:
            "Selecione a conta bancária para informar o saldo inicial.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      contaBancariaId
    ) {
      const conta =
        await prisma.contaBancaria.findFirst({
          where: {
            id:
              contaBancariaId,

            escritorioId:
              sessao.escritorioId,

            ativa: true,
          },

          select: {
            id: true,
            nome: true,
          },
        })

      if (
        !conta
      ) {
        return NextResponse.json(
          {
            erro:
              "Conta bancária inválida ou inativa.",
          },
          {
            status: 400,
          }
        )
      }
    }

    if (
      tipo ===
        "SaldoInicial" &&
      contaBancariaId
    ) {
      const saldoInicialExistente =
        await prisma.financeiro.findFirst({
          where: {
            escritorioId:
              sessao.escritorioId,

            contaBancariaId,

            tipo:
              "SaldoInicial",

            status: {
              not:
                "Cancelado",
            },
          },

          select: {
            id: true,
          },
        })

      if (
        saldoInicialExistente
      ) {
        return NextResponse.json(
          {
            erro:
              "Já existe um saldo inicial ativo para esta conta. Corrija, cancele ou exclua o lançamento existente antes de cadastrar outro.",
          },
          {
            status: 409,
          }
        )
      }
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

      if (
        !empresa
      ) {
        return NextResponse.json(
          {
            erro:
              "Empresa do escritório inválida.",
          },
          {
            status: 400,
          }
        )
      }
    }

    const parcelas =
      inteiroPositivo(
        body.parcelas,
        1
      )

    if (
      parcelas === null ||
      parcelas > 120
    ) {
      return NextResponse.json(
        {
          erro:
            "Quantidade de parcelas inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const intervaloMeses =
      inteiroPositivo(
        body.intervaloMeses,
        1
      )

    if (
      intervaloMeses ===
        null ||
      intervaloMeses > 24
    ) {
      return NextResponse.json(
        {
          erro:
            "Intervalo entre parcelas inválido.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      parcelas > 1 &&
      status !==
        "Pendente"
    ) {
      return NextResponse.json(
        {
          erro:
            "Parcelamento somente pode ser cadastrado como pendente.",
        },
        {
          status: 400,
        }
      )
    }

    let vencimento:
      Date | null =
      null

    if (
      status ===
      "Pendente"
    ) {
      vencimento =
        dataValida(
          body.vencimento
        )

      if (
        !vencimento
      ) {
        return NextResponse.json(
          {
            erro:
              "Informe o vencimento do compromisso pendente.",
          },
          {
            status: 400,
          }
        )
      }
    }

    if (
      tipo ===
      "SaldoInicial"
    ) {
      const criado =
        await prisma.financeiro.create({
          data: {
            escritorioId:
              sessao.escritorioId,

            empresaEscritorioId,

            data,

            tipo,

            categoria,

            descricao,

            origem,

            origemExterna:
              false,

            valor,

            status:
              "Realizado",

            vencimento:
              null,

            contaBancariaId,
          },
        })

      return NextResponse.json(
        {
          movimentos: [
            criado,
          ],
        },
        {
          status: 201,
        }
      )
    }

    const valoresParcelas =
      distribuirValorParcelas(
        valor,
        parcelas
      )

    const criacoes =
      valoresParcelas.map(
        (
          valorParcela,
          indice
        ) => {
          const descricaoParcela =
            parcelas > 1
              ? `${descricao} (${indice + 1}/${parcelas})`
              : descricao

          const vencimentoParcela =
            status ===
              "Pendente" &&
            vencimento
              ? adicionarMeses(
                  vencimento,
                  indice *
                    intervaloMeses
                )
              : null

          return prisma.financeiro.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              empresaEscritorioId,

              data,

              tipo,

              categoria,

              descricao:
                descricaoParcela,

              origem,

              origemExterna,

              valor:
                valorParcela,

              status,

              vencimento:
                vencimentoParcela,

              contaBancariaId,
            },
          })
        }
      )

    const criados =
      await prisma.$transaction(
        criacoes
      )

    return NextResponse.json(
      {
        movimentos:
          criados,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    return respostaErro(
      error,
      "Não foi possível salvar o lançamento financeiro."
    )
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "financeiro",
        "editar"
      )
    ) {
      return respostaNaoAutorizada()
    }

    const body =
      await request.json()

    const id =
      textoObrigatorio(
        body.id
      )

    const acao =
      textoObrigatorio(
        body.acao
      )

    if (
      !id
    ) {
      return NextResponse.json(
        {
          erro:
            "Informe o lançamento financeiro.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      acao !==
        "realizar" &&
      acao !==
        "cancelar"
    ) {
      return NextResponse.json(
        {
          erro:
            "Ação financeira inválida.",
        },
        {
          status: 400,
        }
      )
    }

    const movimento =
      await prisma.financeiro.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },
      })

    if (
      !movimento
    ) {
      return NextResponse.json(
        {
          erro:
            "Lançamento financeiro não encontrado.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Transferência é uma operação única.
     *
     * Ao cancelar uma das pontas, as duas
     * precisam ser canceladas juntas para
     * preservar os saldos das contas.
     */
    if (
      acao ===
        "cancelar" &&
      ehTransferenciaInterna(
        movimento
      )
    ) {
      await prisma.financeiro.updateMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          categoria:
            CATEGORIA_TRANSFERENCIA,

          origem:
            movimento.origem,
        },

        data: {
          status:
            "Cancelado",
        },
      })

      return NextResponse.json({
        message:
          "Transferência entre contas cancelada com sucesso.",
      })
    }

    if (
      acao ===
      "realizar"
    ) {
      if (
        movimento.status ===
        "Cancelado"
      ) {
        return NextResponse.json(
          {
            erro:
              "Um lançamento cancelado não pode ser realizado.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        movimento.tipo ===
        "SaldoInicial"
      ) {
        return NextResponse.json(
          {
            erro:
              "Saldo inicial não utiliza a ação de realização.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        movimento.status ===
        "Realizado"
      ) {
        return NextResponse.json(
          {
            erro:
              "Este lançamento já está realizado.",
          },
          {
            status: 400,
          }
        )
      }

      const dataRealizacao =
        dataValida(
          body.data
        ) ??
        hojeUtcMeioDia()

      const atualizado =
        await prisma.financeiro.update({
          where: {
            id:
              movimento.id,
          },

          data: {
            status:
              "Realizado",

            data:
              dataRealizacao,
          },
        })

      return NextResponse.json({
        movimento:
          atualizado,
      })
    }

    if (
      movimento.status ===
      "Cancelado"
    ) {
      return NextResponse.json(
        {
          erro:
            "Este lançamento já está cancelado.",
        },
        {
          status: 400,
        }
      )
    }

    const atualizado =
      await prisma.financeiro.update({
        where: {
          id:
            movimento.id,
        },

        data: {
          status:
            "Cancelado",
        },
      })

    return NextResponse.json({
      movimento:
        atualizado,
    })
  } catch (error) {
    return respostaErro(
      error,
      "Não foi possível atualizar o lançamento financeiro."
    )
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "financeiro",
        "excluir"
      )
    ) {
      return respostaNaoAutorizada()
    }

    const body =
      await request.json()

    const id =
      textoObrigatorio(
        body.id
      )

    if (
      !id
    ) {
      return NextResponse.json(
        {
          erro:
            "Informe o lançamento financeiro que será excluído.",
        },
        {
          status: 400,
        }
      )
    }

    const movimento =
      await prisma.financeiro.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,

          tipo: true,

          categoria:
            true,

          descricao:
            true,

          origem: true,

          valor: true,

          status: true,

          contaBancariaId:
            true,
        },
      })

    if (
      !movimento
    ) {
      return NextResponse.json(
        {
          erro:
            "Lançamento financeiro não encontrado.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Exclusão definitiva de transferência
     * também remove as duas pontas juntas.
     */
    if (
      ehTransferenciaInterna(
        movimento
      )
    ) {
      await prisma.financeiro.deleteMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          categoria:
            CATEGORIA_TRANSFERENCIA,

          origem:
            movimento.origem,
        },
      })

      return NextResponse.json({
        sucesso:
          true,

        mensagem:
          "Transferência entre contas excluída definitivamente. Os saldos das duas contas foram recalculados.",
      })
    }

    await prisma.financeiro.delete({
      where: {
        id:
          movimento.id,
      },
    })

    return NextResponse.json({
      sucesso:
        true,

      mensagem:
        "Lançamento financeiro excluído definitivamente. Os saldos serão recalculados.",

      movimentoExcluido:
        movimento,
    })
  } catch (error) {
    return respostaErro(
      error,
      "Não foi possível excluir definitivamente o lançamento financeiro."
    )
  }
}