import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo")

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Clientes")

  const colunas = [
    { header: "Razao Social *", key: "razaoSocial", width: 30 },
    { header: "Nome Fantasia", key: "nomeFantasia", width: 25 },
    { header: "CNPJ", key: "cnpj", width: 20 },
    { header: "Inscricao Estadual", key: "inscricaoEstadual", width: 20 },
    { header: "Categoria", key: "categoria", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Nome do Contato", key: "contato", width: 25 },
    { header: "Cargo", key: "cargo", width: 15 },
    { header: "Telefone", key: "telefone", width: 18 },
    { header: "WhatsApp", key: "whatsapp", width: 18 },
    { header: "Email", key: "email", width: 25 },
    { header: "Endereco", key: "endereco", width: 35 },
    { header: "Bairro", key: "bairro", width: 20 },
    { header: "Cidade", key: "cidade", width: 20 },
    { header: "UF", key: "estado", width: 5 },
    { header: "CEP", key: "cep", width: 12 },
    { header: "Regiao/Zona", key: "regiao", width: 15 },
    { header: "Rota de Visita", key: "rota", width: 15 },
    { header: "Observacoes", key: "observacoes", width: 40 },
  ]

  sheet.columns = colunas
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1e40af" } }
  sheet.getRow(1).alignment = { horizontal: "center" }

  if (tipo === "dados") {
    const clientes = await prisma.cliente.findMany({ orderBy: { razaoSocial: "asc" } })
    clientes.forEach((c) => {
      sheet.addRow({
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia || "",
        cnpj: c.cnpj || "",
        inscricaoEstadual: c.inscricaoEstadual || "",
        categoria: c.categoria || "",
        status: c.status,
        contato: c.contato || "",
        cargo: c.cargo || "",
        telefone: c.telefone || "",
        whatsapp: c.whatsapp || "",
        email: c.email || "",
        endereco: c.endereco || "",
        bairro: c.bairro || "",
        cidade: c.cidade || "",
        estado: c.estado || "",
        cep: c.cep || "",
        regiao: c.regiao || "",
        rota: c.rota || "",
        observacoes: c.observacoes || "",
      })
    })
  } else {
    sheet.addRow({
      razaoSocial: "Exemplo Ltda",
      nomeFantasia: "Exemplo",
      cnpj: "00.000.000/0001-00",
      inscricaoEstadual: "000.000.000.000",
      categoria: "Atacado",
      status: "Ativo",
      contato: "Joao Silva",
      cargo: "Comprador",
      telefone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999",
      email: "joao@exemplo.com",
      endereco: "Rua Exemplo, 123",
      bairro: "Centro",
      cidade: "Sao Paulo",
      estado: "SP",
      cep: "01310-100",
      regiao: "Zona Sul",
      rota: "Segunda",
      observacoes: "Cliente exemplo - pode excluir",
    })
    sheet.getRow(2).font = { italic: true, color: { argb: "FF999999" } }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const nome = tipo === "dados" ? "clientes-exportados.xlsx" : "modelo-importacao-clientes.xlsx"

  return new NextResponse(buffer as Buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}"`,
    },
  })
}
