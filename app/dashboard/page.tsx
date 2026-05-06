"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { NavigationButtons } from "@/components/navigation-buttons"
import { BarChart3, LineChart, PieChart, Target, TrendingUp, TrendingDown, Download } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("month")
  const [anoSelecionado, setAnoSelecionado] = useState("2023")

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons backLabel="Voltar para Home" />

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Vendas e Metas</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar Relatório</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Representada</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma representada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as representadas</SelectItem>
                  <SelectItem value="rep1">Descartáveis Premium</SelectItem>
                  <SelectItem value="rep2">Embalagens Eco</SelectItem>
                  <SelectItem value="rep3">Papel & Cia</SelectItem>
                  <SelectItem value="rep4">Plásticos Nobre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button>Aplicar Filtros</Button>
        </div>

        {/* Resumo de Metas e Vendas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 152.380,45</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-green-500">+12.5% em relação ao período anterior</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 180.000,00</div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progresso: 84.7%</span>
                  <span>R$ 152.380,45 / R$ 180.000,00</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "84.7%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 3.842,50</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-green-500">+5.2% em relação ao período anterior</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <p className="text-xs text-red-500">-3.1% em relação ao período anterior</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diferenças no Faturamento</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">-R$ 1.150,00</div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <p className="text-xs text-red-500">Representa 5.2% do valor total vendido</p>
              </div>
              <div className="mt-2">
                <Link href="/vendas" className="text-xs text-primary hover:underline">
                  Ver análise detalhada
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendas-metas">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendas-metas">Vendas vs Metas</TabsTrigger>
            <TabsTrigger value="representadas">Desempenho por Representada</TabsTrigger>
            <TabsTrigger value="mensal">Análise Mensal</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas-metas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Vendas vs Metas (Anual)</CardTitle>
                  <CardDescription>Comparativo entre vendas realizadas e metas estabelecidas</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <LineChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Distribuição de Vendas</CardTitle>
                  <CardDescription>Vendas por representada no período</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <PieChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Progresso de Metas por Representada</CardTitle>
                <CardDescription>Acompanhamento do progresso em relação às metas estabelecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { nome: "Descartáveis Premium", meta: "R$ 80.000,00", atual: "R$ 68.450,00", progresso: 85.6 },
                    { nome: "Embalagens Eco", meta: "R$ 50.000,00", atual: "R$ 42.320,00", progresso: 84.6 },
                    { nome: "Papel & Cia", meta: "R$ 30.000,00", atual: "R$ 28.760,00", progresso: 95.9 },
                    { nome: "Plásticos Nobre", meta: "R$ 20.000,00", atual: "R$ 12.850,00", progresso: 64.3 },
                  ].map((rep, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rep.nome}</span>
                        <span>
                          {rep.atual} / {rep.meta}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Progresso: {rep.progresso.toFixed(1)}%</span>
                        <span
                          className={
                            rep.progresso >= 80
                              ? "text-green-500"
                              : rep.progresso >= 60
                                ? "text-yellow-500"
                                : "text-red-500"
                          }
                        >
                          {rep.progresso >= 80 ? "Bom" : rep.progresso >= 60 ? "Regular" : "Abaixo do esperado"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${
                            rep.progresso >= 80 ? "bg-green-500" : rep.progresso >= 60 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${rep.progresso}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="representadas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Representada</CardTitle>
                <CardDescription>Análise detalhada de vendas e metas por representada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { nome: "Descartáveis Premium", meta: "R$ 80.000,00", atual: "R$ 68.450,00", progresso: 85.6 },
                    { nome: "Embalagens Eco", meta: "R$ 50.000,00", atual: "R$ 42.320,00", progresso: 84.6 },
                    { nome: "Papel & Cia", meta: "R$ 30.000,00", atual: "R$ 28.760,00", progresso: 95.9 },
                    { nome: "Plásticos Nobre", meta: "R$ 20.000,00", atual: "R$ 12.850,00", progresso: 64.3 },
                  ].map((rep, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{rep.nome}</h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rep.progresso >= 80
                              ? "bg-green-100 text-green-800"
                              : rep.progresso >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rep.progresso.toFixed(1)}% da meta
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Meta Mensal</div>
                          <div className="text-xl font-bold">{rep.meta}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Vendas Realizadas</div>
                          <div className="text-xl font-bold">{rep.atual}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progresso</span>
                          <span>
                            {rep.atual} / {rep.meta}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${
                              rep.progresso >= 80
                                ? "bg-green-500"
                                : rep.progresso >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${rep.progresso}%` }}
                          />
                        </div>
                      </div>

                      <div className="h-[150px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                        <LineChart className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mensal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Mensal de Vendas e Metas</CardTitle>
                <CardDescription>Desempenho mês a mês durante o ano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-7 text-xs font-medium bg-muted/20 p-2">
                    <div>Mês</div>
                    <div>Meta</div>
                    <div>Vendas</div>
                    <div>Diferença</div>
                    <div>% Atingido</div>
                    <div>Comissão</div>
                    <div>Status</div>
                  </div>

                  {[
                    {
                      mes: "Janeiro",
                      meta: "R$ 150.000",
                      vendas: "R$ 142.500",
                      diff: "-R$ 7.500",
                      perc: 95,
                      comissao: "R$ 14.250",
                      status: "Bom",
                    },
                    {
                      mes: "Fevereiro",
                      meta: "R$ 150.000",
                      vendas: "R$ 163.200",
                      diff: "+R$ 13.200",
                      perc: 108.8,
                      comissao: "R$ 16.320",
                      status: "Excelente",
                    },
                    {
                      mes: "Março",
                      meta: "R$ 180.000",
                      vendas: "R$ 152.380",
                      diff: "-R$ 27.620",
                      perc: 84.7,
                      comissao: "R$ 15.238",
                      status: "Bom",
                    },
                    {
                      mes: "Abril",
                      meta: "R$ 180.000",
                      vendas: "R$ 0",
                      diff: "-R$ 180.000",
                      perc: 0,
                      comissao: "R$ 0",
                      status: "Pendente",
                    },
                  ].map((mes, i) => (
                    <div key={i} className="grid grid-cols-7 text-xs p-2 border-t">
                      <div>{mes.mes}</div>
                      <div>{mes.meta}</div>
                      <div>{mes.vendas}</div>
                      <div
                        className={
                          mes.diff.startsWith("+") ? "text-green-500" : mes.diff === "-R$ 0" ? "" : "text-red-500"
                        }
                      >
                        {mes.diff}
                      </div>
                      <div>{mes.perc}%</div>
                      <div>{mes.comissao}</div>
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            mes.status === "Excelente"
                              ? "bg-green-100 text-green-800"
                              : mes.status === "Bom"
                                ? "bg-blue-100 text-blue-800"
                                : mes.status === "Regular"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : mes.status === "Ruim"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mes.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

