import {
  Prisma,
} from "@prisma/client"

import {
  NextRequest,
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

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
    numero === null ||
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
            typeof faixa !== "object" ||
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
            desconto !== null &&
            desconto >= 0 &&
            desconto <= 100 &&
            comissao !== null &&
            comissao > 0 &&
            comissao <= 100
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

export async function GET(
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

    const { id } =
      await params

    const representada =
      await prisma.representada.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
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

    return NextResponse.json(
      representada,
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

    console.error(
      "Erro ao buscar representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar representada.",
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
    }>
  }
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
            "Seu perfil não possui permissão para alterar Representadas.",
        },
        {
          status: 403,
        }
      )
    }

    const { id } =
      await params

    const body =
      await request.json()

    const existe =
      await prisma.representada.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },
      })

    if (!existe) {
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

    // ==================================================
    // IDENTIFICAÇÃO
    // ==================================================

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

    const outrasRepresentadas =
      await prisma.representada.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,

          id: {
            not: id,
          },

          cnpj: {
            not: null,
          },
        },

        select: {
          id: true,
          nome: true,
          cnpj: true,
        },
      })

    const duplicada =
      outrasRepresentadas.find(
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
            `Já existe outra Representada cadastrada com este CNPJ: ${duplicada.nome}.`,
        },
        {
          status: 409,
        }
      )
    }

    // ==================================================
    // CONTATO
    // ==================================================

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

    // ==================================================
    // COMISSÃO
    // Somente FIXA ou VARIADA
    // ==================================================

    const tipoComissao =
      textoObrigatorio(
        body.tipoComissao
      )

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
        comissao === null ||
        comissao <= 0 ||
        comissao > 100
      ) {
        return NextResponse.json(
          {
            message:
              "Informe a comissão fixa em percentual maior que zero e até 100%.",
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
              "Preencha corretamente todas as faixas da comissão variável.",
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
            "Informe a regra de fechamento da comissão.",
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
            "Informe a regra de pagamento da comissão.",
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

    // ==================================================
    // POLÍTICA COMERCIAL
    // ==================================================

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
              "Informe o valor do pedido mínimo.",
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
            "Informe se existe valor mínimo por parcela.",
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
              "Informe o valor mínimo por parcela.",
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
        prazoEntregaDias === null ||
        prazoEntregaDias < 0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de entrega deve ser informado em dias inteiros.",
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
        prazoFaturamentoDias === null ||
        prazoFaturamentoDias < 0
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Prazo de faturamento deve ser informado em dias inteiros.",
        },
        {
          status: 400,
        }
      )
    }

    // ==================================================
    // CONTRATO / NF
    // ==================================================

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
            "Informe se existe contrato assinado.",
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
            "Informe se a Representada exige NF de comissão.",
        },
        {
          status: 400,
        }
      )
    }

    // ==================================================
    // STATUS
    // ==================================================

    const statusPermitidos =
      [
        "Ativa",
        "Inativa",
        "Suspensa",
      ]

    if (
      typeof body.status !==
        "string" ||
      !statusPermitidos.includes(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Status da Representada inválido.",
        },
        {
          status: 400,
        }
      )
    }

    // ==================================================
    // ATUALIZAÇÃO
    // ==================================================

    const representada =
      await prisma.representada.update({
        where: {
          id,
        },

        data: {
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

          status:
            body.status,

          observacoes:
            textoOpcional(
              body.observacoes
            ),
        },
      })

    return NextResponse.json(
      {
        message:
          "Representada atualizada com sucesso.",

        data:
          representada,
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

    console.error(
      "Erro ao atualizar representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar representada.",
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
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      sessao.perfil !==
      "Diretor"
    ) {
      return NextResponse.json(
        {
          message:
            "Somente o Diretor possui permissão para excluir Representadas.",
        },
        {
          status: 403,
        }
      )
    }

    const { id } =
      await params

    const representada =
      await prisma.representada.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
          nome: true,
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

    const [
      contratos,
      regrasComerciais,
      vendas,
      interacoes,
      notasComissao,
      contasRecebimento,
      financeiros,
    ] =
      await Promise.all([
        prisma.contratoRepresentada.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.regraComercialRepresentada.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.venda.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.interacao.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.nFComissao.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.representadaContaRecebimento.count({
          where: {
            representadaId:
              id,
          },
        }),

        prisma.financeiro.count({
          where: {
            representadaId:
              id,
          },
        }),
      ])

    const totalVinculos =
      contratos +
      regrasComerciais +
      vendas +
      interacoes +
      notasComissao +
      contasRecebimento +
      financeiros

    if (
      totalVinculos > 0
    ) {
      return NextResponse.json(
        {
          message:
            "Esta Representada possui histórico ou registros vinculados e não pode ser excluída. Altere o status para Inativa ou Suspensa.",

          vinculos: {
            contratos,
            regrasComerciais,
            vendas,
            interacoes,
            notasComissao,
            contasRecebimento,
            financeiros,
          },
        },
        {
          status: 409,
        }
      )
    }

    await prisma.representada.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(
      {
        message:
          "Representada excluída com sucesso.",
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
        "P2003"
    ) {
      return NextResponse.json(
        {
          message:
            "Esta Representada possui registros vinculados e não pode ser excluída. Altere o status para Inativa ou Suspensa.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao excluir representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir representada.",
      },
      {
        status: 500,
      }
    )
  }
}