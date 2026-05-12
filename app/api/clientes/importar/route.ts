import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.getWorksheet("Clientes")
    if (!sheet) return NextResponse.json({ error: "Aba Clientes nao encontrada" }, { status: 400 })

    const rows: any[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const razaoSocial = row.getCell(1).text?.trim()
      if (!razaoSocial || razaoSocial === "Exemplo Ltda") return
      rows.push({
        razaoSocial,
        nomeFantasia: row.getCell(2).text?.trim() || null,
        cnpj: row.getCell(3).text?.trim() || null,
        inscricaoEstadual: row.getCell(4).text?.trim() || null,
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

    await prisma.cliente.createMany({ data: rows })
    return NextResponse.json({ importados: rows.length })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao importar arquivo" }, { status: 500 })
  }
}
