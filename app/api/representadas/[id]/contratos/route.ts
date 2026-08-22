import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function parseDataOpcional(valor: unknown): Date | null {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    throw new Error("DATA_INVALIDA")
  }

  return data
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const representada = await prisma.representada.findUnique({
      where: { id },
      select: {
        id: true,
      },
    })

    if (!representada) {
      return NextResponse.json(
        { message: "Representada não encontrada." },
        { status: 404 }
      )
    }

    const contratos =
      await prisma.contratoRepresentada.findMany({
        where: {
          representadaId: id,
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
              regrasComerciais: true,
            },
          },
        },
        orderBy: [
          {
            vigente: "desc",
          },
          {
            dataInicio: "desc",
          },
          {
            criadoEm: "desc",
          },
        ],
      })

    return NextResponse.json(contratos)
  } catch (error) {
    console.error(
      "Erro ao listar contratos da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar contratos da representada.",
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
    const { id } = await params
    const body = await request.json()

    const representada = await prisma.representada.findUnique({
      where: { id },
      select: {
        id: true,
      },
    })

    if (!representada) {
      return NextResponse.json(
        { message: "Representada não encontrada." },
        { status: 404 }
      )
    }

    if (
      typeof body.tipoFormalizacao !== "string" ||
      body.tipoFormalizacao.trim() === ""
    ) {
      return NextResponse.json(
        {
          message:
            "Tipo de formalização do contrato é obrigatório.",
        },
        { status: 400 }
      )
    }

    let empresaEscritorioId: string | null = null

    if (
      typeof body.empresaEscritorioId === "string" &&
      body.empresaEscritorioId.trim() !== ""
    ) {
      const empresaId =
        body.empresaEscritorioId.trim()

      const empresa =
        await prisma.empresaEscritorio.findUnique({
          where: {
            id: empresaId,
          },
          select: {
            id: true,
          },
        })

      if (!empresa) {
        return NextResponse.json(
          {
            message:
              "Empresa do escritório não encontrada.",
          },
          { status: 400 }
        )
      }

      empresaEscritorioId = empresaId
    }

    let dataInicio: Date | null
    let dataEncerramento: Date | null
    let ultimaRevisaoEm: Date | null
    let proximaRevisaoEm: Date | null

    try {
      dataInicio = parseDataOpcional(body.dataInicio)
      dataEncerramento = parseDataOpcional(
        body.dataEncerramento
      )
      ultimaRevisaoEm = parseDataOpcional(
        body.ultimaRevisaoEm
      )
      proximaRevisaoEm = parseDataOpcional(
        body.proximaRevisaoEm
      )
    } catch {
      return NextResponse.json(
        {
          message:
            "Uma ou mais datas informadas são inválidas.",
        },
        { status: 400 }
      )
    }

    if (
      dataInicio &&
      dataEncerramento &&
      dataEncerramento < dataInicio
    ) {
      return NextResponse.json(
        {
          message:
            "A data de encerramento não pode ser anterior à data de início.",
        },
        { status: 400 }
      )
    }

    const vigente =
      typeof body.vigente === "boolean"
        ? body.vigente
        : true

    if (
      vigente &&
      dataEncerramento
    ) {
      return NextResponse.json(
        {
          message:
            "Contrato vigente não deve possuir data de encerramento.",
        },
        { status: 400 }
      )
    }

    const contrato =
      await prisma.contratoRepresentada.create({
        data: {
          representadaId: id,

          empresaEscritorioId,

          tipoFormalizacao:
            body.tipoFormalizacao.trim(),

          descricao:
            typeof body.descricao === "string" &&
            body.descricao.trim() !== ""
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
            body.motivoEncerramento.trim() !== ""
              ? body.motivoEncerramento.trim()
              : null,

          arquivoUrl:
            typeof body.arquivoUrl === "string" &&
            body.arquivoUrl.trim() !== ""
              ? body.arquivoUrl.trim()
              : null,

          origemDocumento:
            typeof body.origemDocumento ===
              "string" &&
            body.origemDocumento.trim() !== ""
              ? body.origemDocumento.trim()
              : null,

          observacoes:
            typeof body.observacoes === "string" &&
            body.observacoes.trim() !== ""
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
              regrasComerciais: true,
            },
          },
        },
      })

    return NextResponse.json(
      contrato,
      { status: 201 }
    )
  } catch (error) {
    console.error(
      "Erro ao cadastrar contrato da representada:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar contrato da representada.",
      },
      { status: 500 }
    )
  }
}