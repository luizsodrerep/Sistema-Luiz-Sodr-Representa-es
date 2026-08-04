"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Building2, Calendar, CircleDollarSign } from "lucide-react"
import Link from "next/link"

interface Venda {
  id: string
  data: string
  valorTotal: number
  comissao: number | null
  status: string
  observacoes: string | null
  condicaoPagamento: string | null
  cliente: {
    id: string
    razaoSocial: string
  }
  representada: {
    id: string
    nome: string
  }
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR")
}

export default function DetalheVendaPage() {
  const params = useParams()
  const router = useRouter()
  const [venda, setVenda] = useState<Venda | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarVenda() {
      try {
        const response = await fetch(`/api/vendas/${params.id}`)
        if (!response.ok) {
          throw new Error("Venda não encontrada")
        }
        const data = await response.json()
        setVenda(data)
      } catch (err) {
        console.error(err)
        setErro("Não foi possível carregar esta venda.")
      } finally {
        setCarregando(false)
      }
    }

    if (params.id) {
      carregarVenda()
    }
  }, [params.id])

  async function excluirVenda() {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return

    try {
      const response = await fetch(`/api/vendas/${params.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir")
      router.push("/vendas")
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir a venda.")
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons backLabel="Voltar para Vendas" />

        {carregando ? (
          <div className="text-sm text-muted-foreground">Carregando venda...</div>
        ) : erro || !venda ? (
          <div className="text-sm text-red-500">{erro || "Venda não encontrada."}</div>
        ) : (
          <>
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Venda #{venda.id.slice(0, 8)}</h2>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={excluirVenda}>
                  Excluir
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Venda</CardTitle>
                <CardDescription>Informações completas do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <Link href={`/clientes/${venda.cliente.id}`} className="font-medium hover:underline">
                        {venda.cliente.razaoSocial}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Representada</p>
                      <Link href={`/representadas/${venda.representada.id}`} className="font-medium hover:underline">
                        {venda.representada.nome}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="font-medium">{formatarData(venda.data)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Total</p>
                      <p className="font-medium">{formatarMoeda(Number(venda.valorTotal))}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Comissão</p>
                      <p className="font-medium">{formatarMoeda(Number(venda.comissao || 0))}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1 ${
                        venda.status === "Faturado"
                          ? "bg-green-100 text-green-800"
                          : venda.status === "Cancelado"
                            ? "bg-red-100 text-red-800"
                            : venda.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {venda.status}
                    </div>
                  </div>
                </div>

                {venda.condicaoPagamento && (
                  <div>
                    <p className="text-xs text-muted-foreground">Condição de Pagamento</p>
                    <p className="font-medium">{venda.condicaoPagamento}</p>
                  </div>
                )}

                {venda.observacoes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Observações</p>
                    <p className="font-medium">{venda.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}