import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const representadas =
      await prisma.representada.findMany({
        orderBy: {
          nome: "asc",
        },
      })

    return NextResponse.json(
      representadas
    )

  } catch (error) {

    console.error(
      "ERRO API REPRESENTADAS:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Erro ao buscar representadas",
      },
      { status: 500 }
    )

  }

}

export async function POST(
  req: Request
) {

  try {

    const body = await req.json()

    const novaRepresentada =
      await prisma.representada.create({
        data: {

          nome: body.nome || "",

          codigo:
            body.codigo ||
            `REP-${Date.now()}`,

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
      novaRepresentada
    )

  } catch (error) {

    console.error(
      "ERRO AO CRIAR REPRESENTADA:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Erro ao criar representada",
      },
      { status: 500 }
    )

  }

}