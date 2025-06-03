
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const followUps = await prisma.followUp.findMany({
      include: {
        interacao: {
          select: {
            id: true,
            tipo: true,
            data: true,
            cliente: {
              select: { nome: true }
            }
          }
        }
      }
    })

    return NextResponse.json(followUps)
  } catch (error) {
    console.error('[GET /followups]', error)
    return new NextResponse('Erro ao buscar follow-ups', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { interacaoId, data, descricao, responsavel } = body

    const followUp = await prisma.followUp.create({
      data: {
        interacaoId,
        data: new Date(data),
        descricao,
        responsavel
      }
    })

    return NextResponse.json(followUp, { status: 201 })
  } catch (error) {
    console.error('[POST /followups]', error)
    return new NextResponse('Erro ao criar follow-up', { status: 500 })
  }
}
