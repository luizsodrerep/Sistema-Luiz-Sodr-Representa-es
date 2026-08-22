import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const representadas = await prisma.representada.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(representadas)
  } catch (error) {
    console.error("Erro ao listar representadas:", error)

    return NextResponse.json(
      { message: "Erro ao listar representadas" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (
      typeof body.nome !== "string" ||
      body.nome.trim() === ""
    ) {
      return NextResponse.json(
        { message: "Nome da representada é obrigatório." },
        { status: 400 }
      )
    }

    let comissao: number | null = null

    if (
      body.comissao !== undefined &&
      body.comissao !== null &&
      String(body.comissao).trim() !== ""
    ) {
      comissao = Number(body.comissao)

      if (!Number.isFinite(comissao)) {
        return NextResponse.json(
          { message: "Comissão inválida." },
          { status: 400 }
        )
      }
    }

    const statusPermitidos = [
      "Ativa",
      "Inativa",
      "Suspensa",
    ]

    const status =
      typeof body.status === "string" &&
      statusPermitidos.includes(body.status)
        ? body.status
        : "Ativa"

    const representada = await prisma.representada.create({
      data: {
        codigo:
          typeof body.codigo === "string" &&
          body.codigo.trim() !== ""
            ? body.codigo.trim()
            : null,

        nome: body.nome.trim(),

        cnpj:
          typeof body.cnpj === "string" &&
          body.cnpj.trim() !== ""
            ? body.cnpj.trim()
            : null,

        endereco:
          typeof body.endereco === "string" &&
          body.endereco.trim() !== ""
            ? body.endereco.trim()
            : null,

        cidade:
          typeof body.cidade === "string" &&
          body.cidade.trim() !== ""
            ? body.cidade.trim()
            : null,

        estado:
          typeof body.estado === "string" &&
          body.estado.trim() !== ""
            ? body.estado.trim()
            : null,

        cep:
          typeof body.cep === "string" &&
          body.cep.trim() !== ""
            ? body.cep.trim()
            : null,

        contatoPrincipal:
          typeof body.contatoPrincipal === "string" &&
          body.contatoPrincipal.trim() !== ""
            ? body.contatoPrincipal.trim()
            : null,

        emailPrincipal:
          typeof body.emailPrincipal === "string" &&
          body.emailPrincipal.trim() !== ""
            ? body.emailPrincipal.trim()
            : null,

        telefonePrincipal:
          typeof body.telefonePrincipal === "string" &&
          body.telefonePrincipal.trim() !== ""
            ? body.telefonePrincipal.trim()
            : null,

        whatsappPrincipal:
          typeof body.whatsappPrincipal === "string" &&
          body.whatsappPrincipal.trim() !== ""
            ? body.whatsappPrincipal.trim()
            : null,

        bancoComissao:
          typeof body.bancoComissao === "string" &&
          body.bancoComissao.trim() !== ""
            ? body.bancoComissao.trim()
            : null,

        comissao,

        tipoComissao:
          typeof body.tipoComissao === "string" &&
          body.tipoComissao.trim() !== ""
            ? body.tipoComissao.trim()
            : "fixa",

        faixasComissao:
          typeof body.faixasComissao === "string" &&
          body.faixasComissao.trim() !== ""
            ? body.faixasComissao
            : null,

        fechamentoComissao:
          typeof body.fechamentoComissao === "string" &&
          body.fechamentoComissao.trim() !== ""
            ? body.fechamentoComissao.trim()
            : null,

        pagamentoComissao:
          typeof body.pagamentoComissao === "string" &&
          body.pagamentoComissao.trim() !== ""
            ? body.pagamentoComissao.trim()
            : null,

        status,

        observacoes:
          typeof body.observacoes === "string" &&
          body.observacoes.trim() !== ""
            ? body.observacoes.trim()
            : null,
      },
    })

    return NextResponse.json(representada, {
      status: 201,
    })
  } catch (error) {
    console.error(
      "Erro ao cadastrar representada:",
      error
    )

    return NextResponse.json(
      { message: "Erro ao cadastrar representada." },
      { status: 500 }
    )
  }
}