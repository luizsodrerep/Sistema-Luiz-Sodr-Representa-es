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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: representadaId } = await params

    const representada =
      await prisma.representada.findUnique({
        where: {
          id: representadaId,
        },
        select: {
          id: true,
        },
      })

    if (!representada) {
      return NextResponse.json(
        {
          message: "Representada não encontrada.",
        },
        { status: 404 }
      )
    }

    const contas =
      await prisma.representadaContaRecebimento.findMany({
        where: {
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

        orderBy: [
          {
            ativa: "desc",
          },
          {
            criadoEm: "desc",
          },
        ],
      })

    return NextResponse.json(contas)
  } catch (error) {
    console.error(
      "Erro ao listar contas de recebimento da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar contas de recebimento da representada.",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: representadaId } = await params
    const body = await request.json()

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
          message: "Representada não encontrada.",
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
            "Não é possível vincular uma conta bancária inativa.",
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

    const vinculoExistente =
      await prisma.representadaContaRecebimento.findFirst({
        where: {
          representadaId,
          contaBancariaId,
          tipoRecebimento,
          ativa: true,
        },
        select: {
          id: true,
        },
      })

    if (vinculoExistente) {
      return NextResponse.json(
        {
          message:
            "Esta conta já está vinculada à representada com o mesmo tipo de recebimento.",
        },
        { status: 409 }
      )
    }

    const ativa =
      typeof body.ativa === "boolean"
        ? body.ativa
        : true

    const vinculo =
      await prisma.representadaContaRecebimento.create({
        data: {
          representadaId,
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
      vinculo,
      { status: 201 }
    )
  } catch (error) {
    console.error(
      "Erro ao cadastrar conta de recebimento da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar conta de recebimento da representada.",
      },
      { status: 500 }
    )
  }
}