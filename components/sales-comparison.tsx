"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, BarChart3, Download, Filter, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Modificar a interface SalesComparisonProps para incluir uma propriedade para atualizar o dashboard
interface SalesComparisonProps {
  clientId?: string
  representadaId?: string
  period?: "month" | "quarter" | "semester" | "year"
  onTotalDifferenceChange?: (totalDifference: number) => void
}

export function SalesComparison({
  clientId,
  representadaId,
  period = "month",
  onTotalDifferenceChange,
}: SalesComparisonProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [selectedStatus, setSelectedStatus] = useState("all")

  const now = new Date()

  const isInSelectedPeriod = (saleDateStr: string) => {
    const [day, month, year] = saleDateStr.split("/").map(Number)
    const saleDate = new Date(year, month - 1, day)

    switch (selectedPeriod) {
      case "month":
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        )
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const saleQuarter = Math.floor(saleDate.getMonth() / 3)
        return saleQuarter === currentQuarter && saleDate.getFullYear() === now.getFullYear()
      case "semester":
        const currentSemester = Math.floor(now.getMonth() / 6)
        const saleSemester = Math.floor(saleDate.getMonth() / 6)
        return saleSemester === currentSemester && saleDate.getFullYear() === now.getFullYear()
      case "year":
        return saleDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }


  // Adicionar um estado para a representada selecionada no filtro
  const [selectedRepresentada, setSelectedRepresentada] = useState<string>("all")

  // Dados simulados de comparação de vendas
  const salesData = [
    {
      id: "12345",
      date: "15/01/2025",
      client: "Distribuidora ABC Ltda",
      clientId: "abc123",
      representada: "Descartáveis Premium Ltda",
      representadaId: "premium123",
      soldValue: 5200.0,
      invoicedValue: 4950.0,
      difference: -250.0,
      percentageDifference: -4.81,
      reason: "Ajuste de preço",
      status: "pendente",
    },
    {
      id: "12346",
      date: "14/02/2025",
      client: "Supermercado Silva",
      clientId: "silva456",
      representada: "Embalagens Eco Ltda",
      representadaId: "eco456",
      soldValue: 3800.0,
      invoicedValue: 3800.0,
      difference: 0,
      percentageDifference: 0,
      reason: "",
      status: "cancelado",
    },
    {
      id: "12347",
      date: "12/03/2025",
      client: "Confeitaria Doce Sabor",
      clientId: "doce789",
      representada: "Papel & Cia",
      representadaId: "papel789",
      soldValue: 1200.0,
      invoicedValue: 1150.0,
      difference: -50.0,
      percentageDifference: -4.17,
      reason: "Desconto por volume",
      status: "faturado",
    },
    {
      id: "12348",
      date: "10/04/2025",
      client: "Atacadão Produtos",
      clientId: "atacadao101",
      representada: "Plásticos Nobre",
      representadaId: "plasticos101",
      soldValue: 8500.0,
      invoicedValue: 7650.0,
      difference: -850.0,
      percentageDifference: -10.0,
      reason: "Negociação comercial",
      status: "faturado",
    },
    {
      id: "12349",
      date: "08/05/2025",
      client: "Mercado Central",
      clientId: "central202",
      representada: "Descartáveis Premium Ltda",
      representadaId: "premium123",
      soldValue: 2300.0,
      invoicedValue: 2300.0,
      difference: 0,
      percentageDifference: 0,
      reason: "",
      status: "faturado",
    },
  ]

  // Modificar a função de filtragem para incluir o filtro de representada
  const filteredData = salesData.filter((sale) => {
    if (clientId && sale.clientId !== clientId) return false
    if (representadaId && sale.representadaId !== representadaId) return false
    if (selectedStatus !== "all" && sale.status !== selectedStatus) return false
    if (selectedRepresentada !== "all" && sale.representadaId !== selectedRepresentada) return false
    if (!isInSelectedPeriod(sale.date)) return false
    return true
  })


  // Calcular totais
  const totals = filteredData.reduce(
    (acc, sale) => {
      acc.soldValue += sale.soldValue
      acc.invoicedValue += sale.invoicedValue
      acc.difference += sale.difference
      return acc
    },
    { soldValue: 0, invoicedValue: 0, difference: 0 },
  )

  // Calcular porcentagem total de diferença
  const totalPercentageDifference = totals.soldValue > 0 ? (totals.difference / totals.soldValue) * 100 : 0

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Formatar porcentagens
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Adicionar um array de representadas para o filtro
  const representadas = [
    { id: "premium123", name: "Descartáveis Premium Ltda" },
    { id: "eco456", name: "Embalagens Eco Ltda" },
    { id: "papel789", name: "Papel & Cia" },
    { id: "plasticos101", name: "Plásticos Nobre" },
  ]

  // Adicionar um useEffect para notificar o componente pai sobre mudanças no total de diferenças
  useEffect(() => {
    if (onTotalDifferenceChange) {
      onTotalDifferenceChange(totals.difference)
    }
  }, [totals.difference, onTotalDifferenceChange])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Comparação de Valores: Vendido vs. Faturado</CardTitle>
            <CardDescription>
              {clientId
                ? "Análise de diferenças entre valores vendidos e faturados para este cliente"
                : representadaId
                  ? "Análise de diferenças entre valores vendidos e faturados para esta representada"
                  : "Análise de diferenças entre valores vendidos e faturados"}
            </CardDescription>
          </div>
          {/* Modificar a seção de filtros no CardHeader para incluir o filtro de representada */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="semester">Semestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="faturado">Faturados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRepresentada} onValueChange={setSelectedRepresentada}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Representada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as representadas</SelectItem>
                {representadas.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.soldValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.invoicedValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium">Diferença</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totals.difference < 0 ? "text-red-500" : totals.difference > 0 ? "text-green-500" : ""}`}
              >
                {formatCurrency(totals.difference)}
                <span className="text-sm ml-2">({formatPercentage(totalPercentageDifference)})</span>
              </div>
              {totals.difference < 0 && (
                <div className="flex items-center mt-1 text-xs text-red-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  <span>Perda no faturamento</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              {!clientId && <TableHead>Cliente</TableHead>}
              {!representadaId && <TableHead>Representada</TableHead>}
              <TableHead>Data</TableHead>
              <TableHead>Valor Vendido</TableHead>
              <TableHead>Valor Faturado</TableHead>
              <TableHead>Diferença</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">#{sale.id}</TableCell>
                {!clientId && (
                  <TableCell>
                    <Link href={`/clientes/${sale.clientId}`} className="text-primary hover:underline">
                      {sale.client}
                    </Link>
                  </TableCell>
                )}
                {!representadaId && (
                  <TableCell>
                    <Link href={`/representadas/${sale.representadaId}`} className="text-primary hover:underline">
                      {sale.representada}
                    </Link>
                  </TableCell>
                )}
                <TableCell>{sale.date}</TableCell>
                <TableCell>{formatCurrency(sale.soldValue)}</TableCell>
                <TableCell>{formatCurrency(sale.invoicedValue)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "font-medium",
                        sale.difference < 0 ? "text-red-500" : sale.difference > 0 ? "text-green-500" : "",
                      )}
                    >
                      {formatCurrency(sale.difference)}
                    </span>
                    <span className="text-xs ml-1">
                      {sale.difference !== 0 && (
                        <>
                          {sale.difference < 0 ? (
                            <ArrowDown className="h-3 w-3 text-red-500 inline" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-green-500 inline" />
                          )}
                          {formatPercentage(sale.percentageDifference)}
                        </>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{sale.reason || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      sale.status === "faturado" && "border-green-500 text-green-500",
                      sale.status === "pendente" && "border-yellow-500 text-yellow-500",
                      sale.status === "cancelado" && "border-red-500 text-red-500",
                    )}
                  >
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">Mostrando {filteredData.length} registros</div>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>

        <div className="mt-6">
          <div className="h-[200px] w-full">
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

