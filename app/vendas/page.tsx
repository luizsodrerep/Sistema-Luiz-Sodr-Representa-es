'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { ShareButtons } from "@/components/share-buttons"
import { SalesComparison } from "@/components/sales-comparison"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Building2, Calendar, CircleDollarSign, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Venda = {
  id: string
  data: string
  valor: string
  valorFaturado: string | null
  comissao: string
  cliente: string
  representada: string
  representadaId: number
  status: string
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("Todos")
  const [totalDifference, setTotalDifference] = useState(0)

  useEffect(() => {
    fetch('/api/vendas')
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar vendas")
        return res.json()
      })
      .then((data: Venda[]) => {
        setVendas(data)
      })
      .catch((err) => {
        console.error(err)
        setErro("Erro ao carregar dados")
      })
  }, [])

  const vendasFiltradas = vendas.filter((venda) => {
    const termo = searchTerm.toLowerCase()
    const matchTexto =
      venda.id.toLowerCase().includes(termo) ||
      venda.cliente.toLowerCase().includes(termo) ||
      venda.representada.toLowerCase().includes(termo)

    const matchStatus =
      statusFiltro === "Todos" || venda.status === statusFiltro

    return matchTexto && matchStatus
  })

  const totalVendas = vendas.reduce((acc, venda) => {
    return acc + Number(venda.valor.replace(".", "").replace(",", "."))
  }, 0)

  const totalFaturado = vendas.reduce((acc, venda) => {
    if (!venda.valorFaturado) return acc
    return acc + Number(venda.valorFaturado.replace(".", "").replace(",", "."))
  }, 0)

  if (erro) return <div className="text-red-500 p-4">{erro}</div>
  if (!vendas.length) return <div className="p-4">Carregando vendas...</div>

  return (
    <SidebarLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
            <div className="flex items-center space-x-2">
              <SpreadsheetHandler moduleType="vendas" data={vendas} />
              <Link href="/vendas/nova">
                <Button size="sm" className="h-9 gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nova Venda</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards com totais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalFaturado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Diferença Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${totalDifference < 0 ? "text-red-500" : totalDifference > 0 ? "text-green-500" : ""}`}
                >
                  {totalDifference.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar vendas..."
                className="w-full bg-white pl-8 dark:bg-gray-950"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {["Todos", "Faturado", "Pendente", "Cancelado", "Atrasado"].map((status) => (
                <Button
                  key={status}
                  variant={statusFiltro === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFiltro(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabela de vendas */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>Acompanhe todas as vendas realizadas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Representada</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Vendido</TableHead>
                    <TableHead>Valor Faturado</TableHead>
                    <TableHead>Diferença</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.map((venda, i) => {
                    const valor = Number(venda.valor.replace(".", "").replace(",", "."))
                    const valorFaturado = venda.valorFaturado ? Number(venda.valorFaturado.replace(".", "").replace(",", ".")) : 0
                    const diferenca = valorFaturado - valor

                    return (
                      <TableRow key={venda.id}>
                        <TableCell>#{venda.id}</TableCell>
                        <TableCell>{venda.cliente}</TableCell>
                        <TableCell>{venda.representada}</TableCell>
                        <TableCell>{venda.data}</TableCell>
                        <TableCell>R$ {venda.valor}</TableCell>
                        <TableCell>R$ {venda.valorFaturado || venda.valor}</TableCell>
                        <TableCell className={diferenca !== 0 ? (diferenca < 0 ? "text-red-500" : "text-green-500") : ""}>
                          {diferenca !== 0
                            ? `${diferenca < 0 ? "-" : "+"}R$ ${Math.abs(diferenca).toFixed(2).replace(".", ",")}`
                            : "Sem diferença"}
                        </TableCell>
                        <TableCell>R$ {venda.comissao}</TableCell>
                        <TableCell>{venda.status}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/vendas/${venda.id}`}>
                              <Button variant="ghost" size="sm">Ver</Button>
                            </Link>
                            <ShareButtons
                              fileUrl={`/pedidos/${venda.id}.pdf`}
                              fileName={`Pedido_${venda.id}.pdf`}
                              clientId={venda.id}
                              clientName={venda.cliente}
                              orderId={venda.id}
                              orderInfo={`R$ ${venda.valor}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Análise de diferenças */}
          <div className="mt-6">
            <SalesComparison onTotalDifferenceChange={setTotalDifference} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
