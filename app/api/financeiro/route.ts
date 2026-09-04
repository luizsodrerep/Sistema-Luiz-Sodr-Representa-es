import { podeExecutarAcao } from "@/lib/auth/permissions"
import { exigirSessao } from "@/lib/auth/server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

type TipoFinanceiro =
  (typeof TIPOS_PERMITIDOS)[number]

type StatusFinanceiro =
  (typeof STATUS_PERMITIDOS)[number]

function textoOpcional(
  valor: unknown
) {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto = valor.trim()

  return texto || null
}

function textoObrigatorio(
  valor: unknown
) {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto = valor.trim()

  return texto || null
}

function numeroFinito(
  valor: unknown
) {
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
      Number.isFinite(convertido)
    ) {
      return convertido
    }
  }

  return null
}

function inteiroPositivo(
  valor: unknown,
  padrao: number
) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return padrao
  }

  const numero = Number(valor)

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    return null
  }

  return numero
}

function dataValida(
  valor: unknown
) {
  if (
    typeof valor !== "string" ||
    !valor.trim()
  ) {
    return null
  }

  const texto = valor.trim()

  const somenteData =
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )

  const data = somenteData
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
  const agora = new Date()

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
      length: quantidade,
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
      erro: mensagemPadrao,
    },
    {
      status: 500,
    }
  )
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

    const movimentos =
      await prisma.financeiro.findMany(
        {
          where: {
            escritorioId:
              sessao.escritorioId,
          },
          orderBy: [
            {
              data: "desc",
            },
            {
              criadoEm: "desc",
            },
          ],
          select: {
            id: true,
            data: true,
            tipo: true,
            categoria: true,
            descricao: true,
            origem: true,
            origemExterna: true,
            valor: true,
            status: true,
            vencimento: true,
            contaBancariaId: true,
            criadoEm: true,
            atualizadoEm: true,
            contaBancaria: {
              select: {
                id: true,
                nome: true,
                banco: true,
              },
            },
          },
        }
      )

    let saldoRealizado = 0
    let entradasRealizadas = 0
    let saidasRealizadas = 0
    let entradasPendentes = 0
    let saidasPendentes = 0
    let quantidadeVencidas = 0
    let valorVencido = 0

    const agora = new Date()

    for (
      const movimento of movimentos
    ) {
      if (
        movimento.status ===
        "Cancelado"
      ) {
        continue
      }

      if (
        movimento.status ===
        "Realizado"
      ) {
        if (
          movimento.tipo ===
          "SaldoInicial"
        ) {
          saldoRealizado +=
            movimento.valor

          continue
        }

        if (
          movimento.tipo ===
          "Entrada"
        ) {
          entradasRealizadas +=
            movimento.valor

          saldoRealizado +=
            movimento.valor

          continue
        }

        if (
          movimento.tipo ===
          "Saida"
        ) {
          saidasRealizadas +=
            movimento.valor

          saldoRealizado -=
            movimento.valor
        }

        continue
      }

      if (
        movimento.status !==
        "Pendente"
      ) {
        continue
      }

      if (
        movimento.tipo ===
        "Entrada"
      ) {
        entradasPendentes +=
          movimento.valor

        continue
      }

      if (
        movimento.tipo ===
        "Saida"
      ) {
        saidasPendentes +=
          movimento.valor

        if (
          movimento.vencimento &&
          movimento.vencimento.getTime() <
            agora.getTime()
        ) {
          quantidadeVencidas += 1
          valorVencido +=
            movimento.valor
        }
      }
    }

    const saldoProjetado =
      saldoRealizado +
      entradasPendentes -
      saidasPendentes

    return NextResponse.json({
      movimentos,
      resumo: {
        saldoRealizado,
        entradasRealizadas,
        saidasRealizadas,
        entradasPendentes,
        saidasPendentes,
        saldoProjetado,
        quantidadeVencidas,
        valorVencido,
      },
    })
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

    if (!descricao) {
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
      status = "Realizado"
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
      body.origemExterna ===
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
      "SaldoInicial"
    ) {
      const saldoInicialExistente =
        await prisma.financeiro.findFirst(
          {
            where: {
              escritorioId:
                sessao.escritorioId,
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
          }
        )

      if (
        saldoInicialExistente
      ) {
        return NextResponse.json(
          {
            erro:
              "Já existe um saldo inicial ativo para este escritório. Corrija ou exclua o lançamento existente antes de cadastrar outro.",
          },
          {
            status: 409,
          }
        )
      }
    }

    if (
      contaBancariaId
    ) {
      const conta =
        await prisma.contaBancaria.findFirst(
          {
            where: {
              id:
                contaBancariaId,
              escritorioId:
                sessao.escritorioId,
              ativa: true,
            },
            select: {
              id: true,
            },
          }
        )

      if (!conta) {
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
      empresaEscritorioId
    ) {
      const empresa =
        await prisma.empresaEscritorio.findFirst(
          {
            where: {
              id:
                empresaEscritorioId,
              escritorioId:
                sessao.escritorioId,
            },
            select: {
              id: true,
            },
          }
        )

      if (!empresa) {
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
      status !== "Pendente"
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
      Date | null = null

    if (
      status ===
      "Pendente"
    ) {
      vencimento =
        dataValida(
          body.vencimento
        )

      if (!vencimento) {
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
        await prisma.financeiro.create(
          {
            data: {
              escritorioId:
                sessao.escritorioId,
              empresaEscritorioId,
              data,
              tipo,
              categoria,
              descricao,
              origem,
              origemExterna,
              valor,
              status:
                "Realizado",
              vencimento: null,
              contaBancariaId,
            },
          }
        )

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

          return prisma.financeiro.create(
            {
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
            }
          )
        }
      )

    const criados =
      await prisma.$transaction(
        criacoes
      )

    return NextResponse.json(
      {
        movimentos: criados,
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

    if (!id) {
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
      await prisma.financeiro.findFirst(
        {
          where: {
            id,
            escritorioId:
              sessao.escritorioId,
          },
        }
      )

    if (!movimento) {
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
        await prisma.financeiro.update(
          {
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
          }
        )

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
      await prisma.financeiro.update(
        {
          where: {
            id:
              movimento.id,
          },
          data: {
            status:
              "Cancelado",
          },
        }
      )

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

    if (!id) {
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
      await prisma.financeiro.findFirst(
        {
          where: {
            id,
            escritorioId:
              sessao.escritorioId,
          },
          select: {
            id: true,
            tipo: true,
            descricao: true,
            valor: true,
            status: true,
          },
        }
      )

    if (!movimento) {
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

    await prisma.financeiro.delete(
      {
        where: {
          id:
            movimento.id,
        },
      }
    )

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Lançamento financeiro excluído definitivamente. Os saldos serão recalculados.",
      movimentoExcluido: movimento,
    })
  } catch (error) {
    return respostaErro(
      error,
      "Não foi possível excluir definitivamente o lançamento financeiro."
    )
  }
}