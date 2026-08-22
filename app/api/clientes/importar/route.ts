import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const workbook = new ExcelJS.Workbook()

    await workbook.xlsx.load(buffer as any)

    const sheet = workbook.getWorksheet("Clientes")

    if (!sheet) {
      return NextResponse.json(
        { error: "Aba Clientes nao encontrada" },
        { status: 400 }
      )
    }

    const rows: Array<{
      razaoSocial: string
      nomeFantasia: string | null
      cnpj: string | null
      inscricaoEstadual: string | null
      categoria: string | null
      status: string
      contato: string | null
      cargo: string | null
      telefone: string | null
      whatsapp: string | null
      email: string | null
      endereco: string | null
      bairro: string | null
      cidade: string | null
      estado: string | null
      cep: string | null
      regiao: string | null
      rota: string | null
      observacoes: string | null
    }> = []

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return
      }

      const razaoSocial = row.getCell(1).text?.trim()

      if (!razaoSocial || razaoSocial === "Exemplo Ltda") {
        return
      }

      rows.push({
        razaoSocial,
        nomeFantasia: row.getCell(2).text?.trim() || null,
        cnpj: row.getCell(3).text?.trim() || null,
        inscricaoEstadual:
          row.getCell(4).text?.trim() || null,
        categoria: row.getCell(5).text?.trim() || null,
        status: row.getCell(6).text?.trim() || "Ativo",
        contato: row.getCell(7).text?.trim() || null,
        cargo: row.getCell(8).text?.trim() || null,
        telefone: row.getCell(9).text?.trim() || null,
        whatsapp: row.getCell(10).text?.trim() || null,
        email: row.getCell(11).text?.trim() || null,
        endereco: row.getCell(12).text?.trim() || null,
        bairro: row.getCell(13).text?.trim() || null,
        cidade: row.getCell(14).text?.trim() || null,
        estado: row.getCell(15).text?.trim() || null,
        cep: row.getCell(16).text?.trim() || null,
        regiao: row.getCell(17).text?.trim() || null,
        rota: row.getCell(18).text?.trim() || null,
        observacoes: row.getCell(19).text?.trim() || null,
      })
    })

    if (rows.length === 0) {
      return NextResponse.json({
        importados: 0,
      })
    }

    await prisma.cliente.createMany({
      data: rows,
    })

    return NextResponse.json({
      importados: rows.length,
    })
  } catch (error) {
    console.error("Erro ao importar clientes:", error)

    return NextResponse.json(
      { error: "Erro ao importar arquivo" },
      { status: 500 }
    )
  }
}