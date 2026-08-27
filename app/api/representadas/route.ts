import {
  prisma,
} from "@/lib/prisma"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  NextResponse,
} from "next/server"

function textoObrigatorio(
  valor: unknown
) {
  return typeof valor === "string"
    ? valor.trim()
    : ""
}

function textoOpcional(
  valor: unknown
) {
  return typeof valor === "string" &&
    valor.trim() !== ""
    ? valor.trim()
    : null
}

function somenteNumeros(
  valor: string
) {
  return valor.replace(
    /\D/g,
    ""
  )
}

function emailValido(
  valor: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
  )
}

function numeroOpcional(
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

  return Number.isFinite(
    numero
  )
    ? numero
    : null
}

function inteiroOpcional(
  valor: unknown
): number | null {
  const numero =
    numeroOpcional(
      valor
    )

  if (
    numero === null
  ) {
    return null
  }

  if (
    !Number.isInteger(
      numero
    )
  ) {
    return null
  }

  return numero
}

function booleanoObrigatorio(
  valor: unknown
): boolean | null {
  if (
    valor === true ||
    valor === false
  ) {
    return valor
  }

  return null
}

function validarFaixasComissao(
  valor: unknown
) {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return {
      valido: false,
      valor: null as string | null,
    }
  }

  try {
    const faixas =
      JSON.parse(
        valor
      )

    if (
      !Array.isArray(
        faixas
      ) ||
      faixas.length === 0
    ) {
      return {
        valido: false,
        valor: null,
      }
    }

    const todasValidas =
      faixas.every(
        (
          faixa: unknown
        ) => {
          if (
            typeof faixa !==
              "object" ||
            faixa === null
          ) {
            return false
          }

          const registro =
            faixa as Record<
              string,
              unknown
            >

          const desconto =
            numeroOpcional(
              registro.desconto
            )

          const comissao =
            numeroOpcional(
              registro.comissao
            )

          return (
            desconto !==
              null &&
            desconto >= 0 &&
            desconto <=
              100 &&
            comissao !==
              null &&
            comissao > 0 &&
            comissao <=
              100
          )
        }
      )

    return {
      valido:
        todasValidas,

      valor:
        todasValidas
          ? JSON.stringify(
              faixas
            )
          : null,
    }
  } catch {
    return {
      valido: false,
      valor: null,
    }
  }
}

export async function GET() {
  try {
    const sessao =
      await exigirSessao()

    const representadas =
      await prisma.representada.findMany(
        {
          where: {
            escritorioId:
              sessao.escritorioId,
          },

          orderBy: {
            nome: "asc",
          },
        }
      )

    return NextResponse.json(
      representadas
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
      "Erro ao listar representadas:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar representadas.",
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

    if (
      sessao.perfil ===
      "Preposto"
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para cadastrar representadas.",
        },
        {
          status: 403,
        }
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
            "Nome da Representada é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    const cnpj =
      textoObrigatorio(
        body.cnpj
      )

    if (!cnpj) {
      return NextResponse.json(
        {
          message:
            "CNPJ da Representada é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    const cnpjNumeros =
      somenteNumeros(
        cnpj
      )

    if (
      cnpjNumeros.length !==
      14
    ) {
      return NextResponse.json(
        {
          message:
            "CNPJ da Representada deve conter 14 dígitos.",
        },
        {
          status: 400,
        }
      )
    }

    const representadasExistentes =
      await prisma.representada.findMany(
        {
          where: {
            escritorioId:
              sessao.escritorioId,

            cnpj: {
              not: null,
            },
          },

          select: {
            id: true,
            nome: true,
            cnpj: true,
          },
        }
      )

    const duplicada =
      representadasExistentes.find(
        (
          item
        ) =>
          item.cnpj &&
          somenteNumeros(
            item.cnpj
          ) === cnpjNumeros
      )

    if (duplicada) {
      return NextResponse.json(
        {
          message:
            `Já existe uma Representada cadastrada com este CNPJ: ${duplicada.nome}.`,
        },
        {
          status: 409,
        }
      )
    }

    const emailPrincipal =
      textoObrigatorio(
        body.emailPrincipal
      )

    if (
      !emailPrincipal
    ) {
      return NextResponse.json(
        {
          message:
            "E-mail principal da Representada é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !emailValido(
        emailPrincipal
      )
    ) {
      return NextResponse.json(
        {
          message:
            "E-mail principal da Representada é inválido.",
        },
        {
          status: 400,
        }
      )
    }

    const telefonePrincipal =
      textoObrigatorio(
        body.telefonePrincipal
      )

    if (
      !telefonePrincipal
    ) {
      return NextResponse.json(
        {
          message:
            "Telefone principal da Representada é obrigatório.",
        },
        {
          status: 400,
        }
      )
    }

    const tipoComissao =
      textoObrigatorio(
        body.tipoComissao
      ) || "fixa"

    if (
      ![
        "fixa",
        "variada",
      ].includes(
        tipoComissao
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de comissão inválido.",
        },
        {
          status: 400,
        }
      )
    }

    let comissao:
      number | null =
      null

    let faixasComissao:
      string | null =
      null

    if (
      tipoComissao ===
      "fixa"
    ) {
      comissao =
        numeroOpcional(
          body.comissao
        )

      if (
        comissao ===
          null ||
        comissao <= 0 ||
        comissao > 100
      ) {
        return NextResponse.json(
          {
            message:
              "Informe a comissão fixa da Representada em percentual maior que zero e até 100%.",
          },
          {
            status: 400,
          }
        )
      }
    }

    if (
      tipoComissao ===
      "variada"
    ) {
      const resultado =
        validarFaixasComissao(
          body.faixasComissao
        )

      if (
        !resultado.valido
      ) {
        return NextResponse.json(
          {
            message:
              "Preencha corretamente todas as faixas de comissão da Representada.",
          },
          {
            status: 400,
          }
        )
      }

      faixasComissao =
        resultado.valor
    }

    const fechamentoComissao =
      textoObrigatorio(
        body.fechamentoComissao
      )

    if (
      !fechamentoComissao
    ) {
      return NextResponse.json(
        {
          message:
            "Informe a regra ou data de fechamento da comissão.",
        },
        {
          status: 400,
        }
      )
    }

    const pagamentoComissao =
      textoObrigatorio(
        body.pagamentoComissao
      )

    if (
      !pagamentoComissao
    ) {
      return NextResponse.json(
        {
          message:
            "Informe a regra ou data de pagamento da comissão.",
        },
        {
          status: 400,
        }
      )
    }

    const regraReconhecimentoComissao =
      textoObrigatorio(
        body.regraReconhecimentoComissao
      )

    if (
      ![
        "Faturamento",
        "Liquidez",
      ].includes(
        regraReconhecimentoComissao
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se a comissão é calculada sobre Faturamento ou Liquidez.",
        },
        {
          status: 400,
        }
      )
    }

    const possuiPedidoMinimo =
      booleanoObrigatorio(
        body.possuiPedidoMinimo
      )

    if (
      possuiPedidoMinimo ===
      null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se a Representada possui pedido mínimo.",
        },
        {
          status: 400,
        }
      )
    }

    let pedidoMinimo =
      0

    if (
      possuiPedidoMinimo
    ) {
      const valor =
        numeroOpcional(
          body.pedidoMinimo
        )

      if (
        valor === null ||
        valor <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Informe o valor do pedido mínimo da Representada.",
          },
          {
            status: 400,
          }
        )
      }

      pedidoMinimo =
        valor
    }

    const possuiMinimoParcela =
      booleanoObrigatorio(
        body.possuiMinimoParcela
      )

    if (
      possuiMinimoParcela ===
      null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se a Representada possui valor mínimo por parcela.",
        },
        {
          status: 400,
        }
      )
    }

    let minimoParcela =
      0

    if (
      possuiMinimoParcela
    ) {
      const valor =
        numeroOpcional(
          body.minimoParcela
        )

      if (
        valor === null ||
        valor <= 0
      ) {
        return NextResponse.json(
          {
            message:
              "Informe o valor mínimo por parcela da Representada.",
          },
          {
            status: 400,
          }
        )
      }

      minimoParcela =
        valor
    }

    const politicaFrete =
      textoObrigatorio(
        body.politicaFrete
      )

    if (
      !politicaFrete
    ) {
      return NextResponse.json(
        {
          message:
            "Informe a política de frete da Representada.",
        },
        {
          status: 400,
        }
      )
    }

    const prazoEntregaDias =
      inteiroOpcional(
        body.prazoEntregaDias
      )

    if (
      body.prazoEntregaDias !==
        undefined &&
      body.prazoEntregaDias !==
        null &&
      String(
        body.prazoEntregaDias
      ).trim() !== "" &&
      (
        prazoEntregaDias ===
          null ||
        prazoEntregaDias < 0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de entrega deve ser informado em dias inteiros e não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    const prazoFaturamentoDias =
      inteiroOpcional(
        body.prazoFaturamentoDias
      )

    if (
      body.prazoFaturamentoDias !==
        undefined &&
      body.prazoFaturamentoDias !==
        null &&
      String(
        body.prazoFaturamentoDias
      ).trim() !== "" &&
      (
        prazoFaturamentoDias ===
          null ||
        prazoFaturamentoDias < 0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de faturamento deve ser informado em dias inteiros e não pode ser negativo.",
        },
        {
          status: 400,
        }
      )
    }

    const contratoAssinado =
      booleanoObrigatorio(
        body.contratoAssinado
      )

    if (
      contratoAssinado ===
      null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se existe contrato assinado com a Representada.",
        },
        {
          status: 400,
        }
      )
    }

    const emiteNF =
      booleanoObrigatorio(
        body.emiteNF
      )

    if (
      emiteNF === null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se a Representada emite NF de venda.",
        },
        {
          status: 400,
        }
      )
    }

    const exigeNFComissao =
      booleanoObrigatorio(
        body.exigeNFComissao
      )

    if (
      exigeNFComissao ===
      null
    ) {
      return NextResponse.json(
        {
          message:
            "Informe se a Representada exige NF de comissão do escritório.",
        },
        {
          status: 400,
        }
      )
    }

    const statusPermitidos =
      [
        "Ativa",
        "Inativa",
        "Suspensa",
      ]

    const status =
      typeof body.status ===
        "string" &&
      statusPermitidos.includes(
        body.status
      )
        ? body.status
        : "Ativa"

    const representada =
      await prisma.representada.create(
        {
          data: {
            escritorioId:
              sessao.escritorioId,

            codigo:
              textoOpcional(
                body.codigo
              ),

            nome,

            cnpj,

            endereco:
              textoOpcional(
                body.endereco
              ),

            cidade:
              textoOpcional(
                body.cidade
              ),

            estado:
              textoOpcional(
                body.estado
              ),

            cep:
              textoOpcional(
                body.cep
              ),

            contatoPrincipal:
              textoOpcional(
                body.contatoPrincipal
              ),

            emailPrincipal,

            telefonePrincipal,

            whatsappPrincipal:
              textoOpcional(
                body.whatsappPrincipal
              ),

            bancoComissao:
              textoOpcional(
                body.bancoComissao
              ),

            comissao,

            tipoComissao,

            faixasComissao,

            fechamentoComissao,

            pagamentoComissao,

            pedidoMinimo,

            minimoParcela,

            politicaFrete,

            regiaoAtendimento:
              textoOpcional(
                body.regiaoAtendimento
              ),

            prazoEntregaDias,

            prazoFaturamentoDias,

            regraReconhecimentoComissao,

            contratoAssinado,

            emiteNF,

            exigeNFComissao,

            status,

            observacoes:
              textoOpcional(
                body.observacoes
              ),
          },
        }
      )

    return NextResponse.json(
      representada,
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
      "Erro ao cadastrar representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar representada.",
      },
      {
        status: 500,
      }
    )
  }
}
