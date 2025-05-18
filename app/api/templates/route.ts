
import * as XLSX from "xlsx"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const module = searchParams.get("module")
  const format = searchParams.get("format") || "xlsx"

  if (!module) {
    return NextResponse.json({ error: "Módulo não especificado" }, { status: 400 })
  }

  // Definir estrutura de dados para cada módulo
  const templates: Record<string, any[]> = {
    clientes: [
      {
        id: "",
        nome: "Nome do Cliente",
        empresa: "Nome da Empresa",
        cargo: "Cargo",
        email: "email@exemplo.com",
        telefone: "(00) 00000-0000",
        endereco: "Endereço Completo",
        cidade: "Cidade",
        estado: "UF",
        observacoes: "Observações",
      },
    ],
    representadas: [
      {
        id: "",
        nome: "Nome da Representada",
        cnpj: "00.000.000/0000-00",
        contato: "Nome do Contato",
        email: "email@exemplo.com",
        telefone: "(00) 00000-0000",
        endereco: "Endereço Completo",
        cidade: "Cidade",
        estado: "UF",
        produtos: "Descrição dos Produtos",
        comissao: "0.00",
      },
    ],
    vendas: [
      {
        id: "",
        data: "01/01/2023",
        cliente: "Nome do Cliente",
        representada: "Nome da Representada",
        produto: "Descrição do Produto",
        quantidade: "0",
        valor_unitario: "0.00",
        valor_total: "0.00",
        status: "Pendente/Faturado",
        comissao: "0.00",
      },
    ],
    interacoes: [
      {
        id: "",
        data: "01/01/2023",
        cliente: "Nome do Cliente",
        tipo: "Reunião/Ligação/Email",
        assunto: "Assunto da Interação",
        descricao: "Descrição detalhada",
        resultado: "Resultado da interação",
        proximos_passos: "Próximos passos a seguir",
      },
    ],
    financeiro: [
      {
        id: "",
        data: "01/01/2023",
        tipo: "Receita/Despesa",
        categoria: "Categoria",
        descricao: "Descrição",
        valor: "0.00",
        status: "Pago/Pendente",
        vencimento: "01/01/2023",
        representada: "Nome da Representada (se aplicável)",
      },
    ],
    contabilidade: [
      {
        id: "",
        data: "01/01/2023",
        tipo: "Nota Fiscal/Imposto/Outro",
        numero_documento: "Número do Documento",
        descricao: "Descrição",
        valor: "0.00",
        status: "Processado/Pendente",
        vencimento: "01/01/2023",
        observacoes: "Observações",
      },
    ],
    agenda: [
      {
        id: "",
        data: "01/01/2023",
        hora: "00:00",
        titulo: "Título do Evento",
        descricao: "Descrição do Evento",
        local: "Local do Evento",
        cliente: "Nome do Cliente (se aplicável)",
        representada: "Nome da Representada (se aplicável)",
        status: "Confirmado/Pendente/Cancelado",
      },
    ],
  }

  // Obter o template para o módulo solicitado
  const templateData = templates[module]

  if (!templateData) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })
  }

  // Criar a planilha
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  XLSX.utils.book_append_sheet(workbook, worksheet, module.charAt(0).toUpperCase() + module.slice(1))

  // Converter para o formato solicitado
  let buffer: Buffer
  let contentType: string
  let filename: string

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    buffer = Buffer.from(csv)
    contentType = "text/csv"
    filename = `template_${module}.csv`
  } else {
    buffer = Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }))
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    filename = `template_${module}.xlsx`
  }

  // Configurar os headers para download
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

