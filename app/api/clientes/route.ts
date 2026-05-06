import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { criadoEm: 'desc' }
    })
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cliente = await prisma.cliente.create({
      data: {
        nome: body.nome,
        empresa: body.empresa,
        cargo: body.cargo,
        email: body.email,
        telefone: body.telefone,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        categoria: body.categoria,
        status: body.status || 'Ativo',
        observacoes: body.observacoes,
      }
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}