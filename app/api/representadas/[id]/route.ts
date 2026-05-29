import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const representada = await prisma.representada.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!representada) {
      return NextResponse.json(
        { error: "Representada não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao buscar representada" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const representada = await prisma.representada.update({
      where: {
        id: params.id,
      },

      data: {
        nome: body.nome || "",
        codigo: body.codigo || "",
        cnpj: body.cnpj || "",

        comissao: body.comissao
          ? Number(body.comissao)
          : null,

        tipoComissao: body.tipoComissao || "fixa",

        faixasComissao:
          body.faixasComissao || null,

        fechamentoComissao:
          body.fechamentoComissao || "",

        pagamentoComissao:
          body.pagamentoComissao || "",

        bancoComissao:
          body.bancoComissao || "",

        contatoPrincipal:
          body.contatoPrincipal || "",

        emailPrincipal:
          body.emailPrincipal || "",

        telefonePrincipal:
          body.telefonePrincipal || "",

        whatsappPrincipal:
          body.whatsappPrincipal || "",

        endereco:
          body.endereco || "",

        cidade:
          body.cidade || "",

        estado:
          body.estado || "",

        cep:
          body.cep || "",

        observacoes:
          body.observacoes || "",

        status:
          body.status || "Ativa",
      },
    })

    return NextResponse.json(representada)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Erro ao atualizar representada",
      },
      {
        status: 500,
      }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.representada.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Erro ao excluir representada",
      },
      {
        status: 500,
      }
    )
  }
}