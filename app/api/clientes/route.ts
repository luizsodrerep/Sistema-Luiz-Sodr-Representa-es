import * as XLSX from "xlsx"
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';;

const prisma = new PrismaClient()

// 🟨 POST - Criar um novo cliente
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nome,
      nomeFantasia,
      cnpj,
      inscricaoEstadual,
      categoria,
      telefone,
      whatsapp,
      email,
      website,
      responsavel,
      cidade,
      estado,
      status,
      ultimaCompra,
      contato, // opcional
    } = body;

    if (!nome || !cnpj) {
      return NextResponse.json(
        { error: 'Nome e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        nomeFantasia,
        cnpj,
        inscricaoEstadual,
        categoria,
        telefone,
        whatsapp,
        email,
        website,
        responsavel,
        cidade,
        estado,
        status,
        ultimaCompra: ultimaCompra ? new Date(ultimaCompra) : undefined,
      },
    });

    let contatoResultado = null;

    if (contato) {
      contatoResultado = await prisma.contato.create({
        data: {
          clienteId: cliente.id,
          nome: contato.nome,
          cargo: contato.cargo,
          telefone: contato.telefone,
          email: contato.email,
          representadaId: contato.representadaId ?? null,
        },
      });
    }

    return NextResponse.json({ cliente, contato: contatoResultado });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const module = searchParams.get("module")
  const format = searchParams.get("format") || "xlsx"

  // Se não houver parâmetro "module", retorna os clientes do banco
  if (!module) {
    try {
      const clientes = await prisma.cliente.findMany()
      return NextResponse.json(clientes)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 400 })
    }
  }

  // Definir templates de exportação
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
  }

  const templateData = templates[module]

  if (!templateData) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  XLSX.utils.book_append_sheet(workbook, worksheet, module.charAt(0).toUpperCase() + module.slice(1))

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

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}