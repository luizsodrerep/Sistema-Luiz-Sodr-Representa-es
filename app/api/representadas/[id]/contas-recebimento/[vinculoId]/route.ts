import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function parsePercentualOpcional(
  valor: unknown
): number | null {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null
  }

  const percentual = Number(valor)

  if (!Number.isFinite(percentual)) {
    throw new Error("PERCENTUAL_INVALIDO")
  }

  return percentual
}

async function buscarVinculo(
  representadaId: string,
  vinculoId: string
) {
  return prisma.representadaContaRecebimento.findFirst({
    where: {
      id: vinculoId,
      representadaId,
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
      vinculoId: string
    }>
  }
) {
  try {
    const {
      id: representadaId,
      vinculoId,
    } = await params

    const vinculo =
      await prisma.representadaContaRecebimento.findFirst({
        where: {
          id: vinculoId,
          representadaId,
        },

        include: {
          contaBancaria: {
            select: {
              id: true,
              nome: true,
              banco: true,
              tipoTitular: true,
              titular: true,
              agencia: true,
              conta: true,
              pix: true,
              ativa: true,
              empresaEscritorioId: true,
              usuarioTitularId: true,
            },
          },
        },
      })

    if (!vinculo) {
      return NextResponse.json(
        {
          message:
            "Conta de recebimento não encontrada para esta representada.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      vinculo,
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Erro ao buscar conta de recebimento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar conta de recebimento.",
      },
      { status: 500 }
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
      vinculoId: string
    }>
  }
) {
  try {
    const {
      id: representadaId,
      vinculoId,
    } = await params

    const body = await request.json()

    const vinculoAtual = await buscarVinculo(
      representadaId,
      vinculoId
    )

    if (!vinculoAtual) {
      return NextResponse.json(
        {
          message:
            "Conta de recebimento não encontrada para esta representada.",
        },
        { status: 404 }
      )
    }

    if (
      typeof body.contaBancariaId !== "string" ||
      body.contaBancariaId.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Conta bancária é obrigatória.",
        },
        { status: 400 }
      )
    }

    const contaBancariaId =
      body.contaBancariaId.trim()

    const representada =
      await prisma.representada.findUnique({
        where: {
          id: representadaId,
        },
        select: {
          id: true,
          escritorioId: true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada.",
        },
        { status: 404 }
      )
    }

    const contaBancaria =
      await prisma.contaBancaria.findUnique({
        where: {
          id: contaBancariaId,
        },
        select: {
          id: true,
          escritorioId: true,
          ativa: true,
        },
      })

    if (!contaBancaria) {
      return NextResponse.json(
        {
          message:
            "Conta bancária não encontrada.",
        },
        { status: 400 }
      )
    }

    if (!contaBancaria.ativa) {
      return NextResponse.json(
        {
          message:
            "Não é possível usar uma conta bancária inativa.",
        },
        { status: 400 }
      )
    }

    if (
      representada.escritorioId &&
      contaBancaria.escritorioId !==
        representada.escritorioId
    ) {
      return NextResponse.json(
        {
          message:
            "A conta bancária pertence a outro escritório.",
        },
        { status: 400 }
      )
    }

    if (
      typeof body.tipoRecebimento !== "string" ||
      body.tipoRecebimento.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de recebimento é obrigatório.",
        },
        { status: 400 }
      )
    }

    const tipoRecebimento =
      body.tipoRecebimento.trim()

    let percentualDestino: number | null

    try {
      percentualDestino =
        parsePercentualOpcional(
          body.percentualDestino
        )
    } catch {
      return NextResponse.json(
        {
          message:
            "Percentual de destino inválido.",
        },
        { status: 400 }
      )
    }

    if (
      percentualDestino !== null &&
      (
        percentualDestino <= 0 ||
        percentualDestino > 100
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Percentual de destino deve ser maior que zero e menor ou igual a 100.",
        },
        { status: 400 }
      )
    }

    const ativa =
      typeof body.ativa === "boolean"
        ? body.ativa
        : vinculoAtual.ativa

    if (ativa) {
      const duplicado =
        await prisma.representadaContaRecebimento.findFirst({
          where: {
            representadaId,
            contaBancariaId,
            tipoRecebimento,
            ativa: true,
            NOT: {
              id: vinculoId,
            },
          },
          select: {
            id: true,
          },
        })

      if (duplicado) {
        return NextResponse.json(
          {
            message:
              "Já existe outro vínculo ativo com esta conta e este tipo de recebimento.",
          },
          { status: 409 }
        )
      }
    }

    const vinculo =
      await prisma.representadaContaRecebimento.update({
        where: {
          id: vinculoId,
        },

        data: {
          contaBancariaId,
          tipoRecebimento,
          percentualDestino,
          ativa,

          observacoes:
            typeof body.observacoes === "string" &&
            body.observacoes.trim() !== ""
              ? body.observacoes.trim()
              : null,
        },

        include: {
          contaBancaria: {
            select: {
              id: true,
              nome: true,
              banco: true,
              tipoTitular: true,
              titular: true,
              agencia: true,
              conta: true,
              pix: true,
              ativa: true,
              empresaEscritorioId: true,
              usuarioTitularId: true,
            },
          },
        },
      })

    return NextResponse.json(
      {
        message:
          "Conta de recebimento atualizada com sucesso.",
        data: vinculo,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Erro ao atualizar conta de recebimento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar conta de recebimento.",
      },
      { status: 500 }
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
      vinculoId: string
    }>
  }
) {
  try {
    const {
      id: representadaId,
      vinculoId,
    } = await params

    const vinculo = await buscarVinculo(
      representadaId,
      vinculoId
    )

    if (!vinculo) {
      return NextResponse.json(
        {
          message:
            "Conta de recebimento não encontrada para esta representada.",
        },
        { status: 404 }
      )
    }

    await prisma.representadaContaRecebimento.delete({
      where: {
        id: vinculoId,
      },
    })

    return NextResponse.json(
      {
        message:
          "Conta de recebimento excluída com sucesso.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Erro ao excluir conta de recebimento:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao excluir conta de recebimento.",
      },
      { status: 500 }
    )
  }
}