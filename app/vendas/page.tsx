"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Calendar, CircleDollarSign, Plus, Search } from "lucide-react"
import Link from "next/link"
import { NavigationButtons } from "@/components/navigation-buttons"
import { ShareButtons } from "@/components/share-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { useEffect, useState } from "react"

interface Venda {
  id: string
  data: string
  valorTotal: number
  comissao: number | null
  status: string
  condicaoPagamento: string | null
  cliente: {
    id: string
    razaoSocial: string
    nomeFantasia: string | null
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

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregarVendas() {
      try {
        const response = await fetch("/api/vendas")
        if (!response.ok) {
          throw new Error("Erro ao buscar vendas")
        }
        const data = await response.json()
        setVendas(data)
      } catch (err) {
        console.error(err)
        setErro("Não foi possível carregar as vendas.")
      } finally {
        setCarregando(false)
      }
    }

    carregarVendas()
  }, [])

  const totalVendas = vendas.reduce((acc, venda) => acc + Number(venda.valorTotal), 0)
  const totalComissoes = vendas.reduce((acc, venda) => acc + Number(venda.comissao || 0), 0)

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons />

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
          <div className="flex items-center space-x-2">
            {/* Componente de importação/exportação de planilhas */}
            <SpreadsheetHandler moduleType="vendas" data={vendas} />

            <Link href="/vendas/nova">
              <Button size="sm" className="h-9 gap-1">
                <Plus className="h-4 w-4" />
                <span>Nova Venda</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(totalVendas)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(totalComissoes)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar vendas..." className="w-full bg-white pl-8 dark:bg-gray-950" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Todos
            </Button>
            <Button variant="outline" size="sm">
              Faturados
            </Button>
            <Button variant="outline" size="sm">
              Pendentes
            </Button>
            <Button variant="outline" size="sm">
              Cancelados
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>Acompanhe todas as vendas realizadas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {carregando ? (
              <div className="p-6 text-sm text-muted-foreground">Carregando vendas...</div>
            ) : erro ? (
              <div className="p-6 text-sm text-red-500">{erro}</div>
            ) : vendas.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">Nenhuma venda cadastrada ainda.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Representada</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">#{venda.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <Link href={`/clientes/${venda.cliente.id}`} className="hover:underline">
                            <span>{venda.cliente.razaoSocial}</span>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/representadas/${venda.representada.id}`}
                          className="text-primary hover:underline"
                        >
                          {venda.representada.nome}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatarData(venda.data)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CircleDollarSign className="h-3 w-3" />
                          <span>{formatarMoeda(Number(venda.valorTotal))}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatarMoeda(Number(venda.comissao || 0))}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            venda.status === "Faturado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : venda.status === "Cancelado"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : venda.status === "Pendente"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {venda.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vendas/${venda.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                          <ShareButtons
                            fileUrl={`/pedidos/${venda.id}.pdf`}
                            fileName={`Pedido_${venda.id}.pdf`}
                            clientId={venda.cliente.id}
                            clientName={venda.cliente.razaoSocial}
                            orderId={venda.id}
                            orderInfo={formatarMoeda(Number(venda.valorTotal))}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}