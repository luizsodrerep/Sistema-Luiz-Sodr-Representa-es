import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: any
) {

  try {

    const id = context.params.id

    const representada =
      await prisma.representada.findUnique({
        where: {
          id,
        },
      })

    if (!representada) {

      return NextResponse.json(
        {
          error:
            "Representada não encontrada",
        },
        { status: 404 }
      )

    }

    return NextResponse.json(
      representada
    )

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error:
          "Erro ao buscar representada",
      },
      { status: 500 }
    )

  }

}

export async function PUT(
  req: Request,
  context: any
) {

  try {

    const id = context.params.id

    const body = await req.json()

    const representada =
      await prisma.representada.update({
        where: {
          id,
        },

        data: {

          nome:
            body.nome || "",

          codigo:
            body.codigo || null,

          cnpj:
            body.cnpj || null,

          comissao:
            body.comissao
              ? parseFloat(
                  body.comissao
                )
              : null,

          tipoComissao:
            body.tipoComissao ||
            "fixa",

          faixasComissao:
            body.tipoComissao ===
            "variada"
              ? body.faixasComissao
              : null,

          fechamentoComissao:
            body.fechamentoComissao ||
            null,

          pagamentoComissao:
            body.pagamentoComissao ||
            null,

          bancoComissao:
            body.bancoComissao ||
            null,

          contatoPrincipal:
            body.contatoPrincipal ||
            null,

          emailPrincipal:
            body.emailPrincipal ||
            null,

          telefonePrincipal:
            body.telefonePrincipal ||
            null,

          whatsappPrincipal:
            body.whatsappPrincipal ||
            null,

          endereco:
            body.endereco || null,

          cidade:
            body.cidade || null,

          estado:
            body.estado || null,

          cep:
            body.cep || null,

          status:
            body.status || "Ativa",

          observacoes:
            body.observacoes || null,
        },
      })

    return NextResponse.json(
      representada
    )

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error:
          "Erro ao atualizar representada",
      },
      { status: 500 }
    )

  }

}