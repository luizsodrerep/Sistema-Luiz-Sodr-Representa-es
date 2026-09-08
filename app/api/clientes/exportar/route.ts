import {
  NextResponse,
} from "next/server"

import ExcelJS from "exceljs"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"

import {
  prisma,
} from "@/lib/prisma"

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "clientes",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para acessar dados de clientes.",
        },
        {
          status: 403,
        }
      )
    }

    const {
      searchParams,
    } =
      new URL(
        request.url
      )

    const tipo =
      searchParams.get(
        "tipo"
      )

    const workbook =
      new ExcelJS.Workbook()

    const sheet =
      workbook.addWorksheet(
        "Clientes"
      )

    const colunas = [
      {
        header:
          "Razao Social *",
        key:
          "razaoSocial",
        width: 30,
      },

      {
        header:
          "Nome Fantasia",
        key:
          "nomeFantasia",
        width: 25,
      },

      {
        header:
          "CNPJ",
        key:
          "cnpj",
        width: 20,
      },

      {
        header:
          "Inscricao Estadual",
        key:
          "inscricaoEstadual",
        width: 20,
      },

      {
        header:
          "Categoria",
        key:
          "categoria",
        width: 15,
      },

      {
        header:
          "Status",
        key:
          "status",
        width: 15,
      },

      {
        header:
          "Nome do Contato",
        key:
          "contato",
        width: 25,
      },

      {
        header:
          "Cargo",
        key:
          "cargo",
        width: 15,
      },

      {
        header:
          "Telefone",
        key:
          "telefone",
        width: 18,
      },

      {
        header:
          "WhatsApp",
        key:
          "whatsapp",
        width: 18,
      },

      {
        header:
          "Email",
        key:
          "email",
        width: 25,
      },

      {
        header:
          "Endereco",
        key:
          "endereco",
        width: 35,
      },

      {
        header:
          "Bairro",
        key:
          "bairro",
        width: 20,
      },

      {
        header:
          "Cidade",
        key:
          "cidade",
        width: 20,
      },

      {
        header:
          "UF",
        key:
          "estado",
        width: 5,
      },

      {
        header:
          "CEP",
        key:
          "cep",
        width: 12,
      },

      {
        header:
          "Regiao/Zona",
        key:
          "regiao",
        width: 15,
      },

      {
        header:
          "Rota de Visita",
        key:
          "rota",
        width: 15,
      },

      {
        header:
          "Observacoes",
        key:
          "observacoes",
        width: 40,
      },
    ]

    sheet.columns =
      colunas

    sheet.getRow(
      1
    ).font = {
      bold: true,

      color: {
        argb:
          "FFFFFFFF",
      },
    }

    sheet.getRow(
      1
    ).fill = {
      type:
        "pattern",

      pattern:
        "solid",

      fgColor: {
        argb:
          "FF1e40af",
      },
    }

    sheet.getRow(
      1
    ).alignment = {
      horizontal:
        "center",
    }

    if (
      tipo ===
      "dados"
    ) {
      const clientes =
        await prisma.cliente.findMany(
          {
            where: {
              escritorioId:
                sessao.escritorioId,

              ...(sessao.perfil ===
              "Preposto"
                ? {
                    OR: [
                      {
                        responsavelPrincipalId:
                          sessao.usuarioId,
                      },

                      {
                        participantes:
                          {
                            some: {
                              usuarioId:
                                sessao.usuarioId,

                              ativa:
                                true,
                            },
                          },
                      },
                    ],
                  }
                : {}),
            },

            orderBy: {
              razaoSocial:
                "asc",
            },
          }
        )

      clientes.forEach(
        (
          cliente
        ) => {
          sheet.addRow({
            razaoSocial:
              cliente.razaoSocial,

            nomeFantasia:
              cliente.nomeFantasia ||
              "",

            cnpj:
              cliente.cnpj ||
              "",

            inscricaoEstadual:
              cliente.inscricaoEstadual ||
              "",

            categoria:
              cliente.categoria ||
              "",

            status:
              cliente.status,

            contato:
              cliente.contato ||
              "",

            cargo:
              cliente.cargo ||
              "",

            telefone:
              cliente.telefone ||
              "",

            whatsapp:
              cliente.whatsapp ||
              "",

            email:
              cliente.email ||
              "",

            endereco:
              cliente.endereco ||
              "",

            bairro:
              cliente.bairro ||
              "",

            cidade:
              cliente.cidade ||
              "",

            estado:
              cliente.estado ||
              "",

            cep:
              cliente.cep ||
              "",

            regiao:
              cliente.regiao ||
              "",

            rota:
              cliente.rota ||
              "",

            observacoes:
              cliente.observacoes ||
              "",
          })
        }
      )
    } else {
      /*
       * Linha exclusivamente demonstrativa
       * do modelo de importação.
       * Não representa registro real do CRM.
       */
      sheet.addRow({
        razaoSocial:
          "Exemplo Ltda",

        nomeFantasia:
          "Exemplo",

        cnpj:
          "00.000.000/0001-00",

        inscricaoEstadual:
          "000.000.000.000",

        categoria:
          "Atacado",

        status:
          "Ativo",

        contato:
          "Joao Silva",

        cargo:
          "Comprador",

        telefone:
          "(11) 99999-9999",

        whatsapp:
          "(11) 99999-9999",

        email:
          "joao@exemplo.com",

        endereco:
          "Rua Exemplo, 123",

        bairro:
          "Centro",

        cidade:
          "Sao Paulo",

        estado:
          "SP",

        cep:
          "01310-100",

        regiao:
          "Zona Sul",

        rota:
          "Segunda",

        observacoes:
          "Linha demonstrativa do modelo. Não importar como cliente real.",
      })

      sheet.getRow(
        2
      ).font = {
        italic: true,

        color: {
          argb:
            "FF999999",
        },
      }
    }

    const buffer =
      await workbook.xlsx.writeBuffer()

    const body =
      new Uint8Array(
        buffer
      )

    const nome =
      tipo ===
      "dados"
        ? "clientes-exportados.xlsx"
        : "modelo-importacao-clientes.xlsx"

    return new NextResponse(
      body,
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${nome}"`,

          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (error) {
    if (
      error instanceof
        Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao exportar clientes:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao gerar planilha de clientes.",
      },
      {
        status: 500,
      }
    )
  }
}