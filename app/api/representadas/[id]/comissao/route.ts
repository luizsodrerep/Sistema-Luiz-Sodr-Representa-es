import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { faixas } = await request.json()
    await prisma.comissaoFaixa.deleteMany({ where: { representadaId: params.id } })
    if (faixas.length > 0) {
      await prisma.comissaoFaixa.createMany({
        data: faixas.map((f: any, i: number) => ({
          representadaId: params.id,
          descontoAte: Number(f.descontoAte),
          percentualComissao: Number(f.percentualComissao),
          ordem: i + 1,
        }))
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar faixas" }, { status: 500 })
  }
}