"use client"

import {
  useState,
} from "react"

import {
  BarChart3,
  Download,
  LineChart,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import Link from "next/link"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  NavigationButtons,
} from "@/components/navigation-buttons"

type RepresentadaDashboard = {
  nome: string
  meta: string
  atual: string
  progresso: number
}

type MesDashboard = {
  mes: string
  meta: string
  vendas: string
  diff: string
  perc: number
  comissao: string
  status: string
}

/*
 * ======================================================
 * DADOS DO DASHBOARD
 * ======================================================
 *
 * Os dados demonstrativos da versão inicial do front-end
 * foram removidos.
 *
 * As estruturas permanecem preservadas para receber
 * posteriormente dados reais do CRM.
 */
const REPRESENTADAS_DASHBOARD:
  RepresentadaDashboard[] =
  []

const MESES_DASHBOARD:
  MesDashboard[] = [
    {
      mes: "Janeiro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Fevereiro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Março",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Abril",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Maio",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Junho",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Julho",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Agosto",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Setembro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Outubro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Novembro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
    {
      mes: "Dezembro",
      meta: "R$ 0,00",
      vendas: "R$ 0,00",
      diff: "R$ 0,00",
      perc: 0,
      comissao: "R$ 0,00",
      status: "Sem dados",
    },
  ]

export default function DashboardPage() {
  const [
    periodoSelecionado,
    setPeriodoSelecionado,
  ] =
    useState(
      "month"
    )

  const [
    anoSelecionado,
    setAnoSelecionado,
  ] =
    useState(
      "2026"
    )

  return (
    <div className="flex flex-col">

      <div className="flex-1 space-y-4 p-8 pt-6">

        {/* Botões de navegação */}
        <NavigationButtons
          backLabel="Voltar para Home"
        />

        <div className="flex items-center justify-between space-y-2">

          <div>

            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard de Vendas e Metas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Estrutura preservada para consolidação dos dados comerciais reais do CRM.
            </p>

          </div>

          <div className="flex items-center space-x-2">

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
            >
              <Download className="h-4 w-4" />

              <span>
                Exportar Relatório
              </span>
            </Button>

          </div>

        </div>

        {/* Filtros */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">

          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Período
              </label>

              <Select
                value={
                  periodoSelecionado
                }
                onValueChange={
                  setPeriodoSelecionado
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="week">
                    Última semana
                  </SelectItem>

                  <SelectItem value="month">
                    Último mês
                  </SelectItem>

                  <SelectItem value="quarter">
                    Último trimestre
                  </SelectItem>

                  <SelectItem value="year">
                    Último ano
                  </SelectItem>

                  <SelectItem value="custom">
                    Personalizado
                  </SelectItem>
                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Ano
              </label>

              <Select
                value={
                  anoSelecionado
                }
                onValueChange={
                  setAnoSelecionado
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="2023">
                    2023
                  </SelectItem>

                  <SelectItem value="2024">
                    2024
                  </SelectItem>

                  <SelectItem value="2025">
                    2025
                  </SelectItem>

                  <SelectItem value="2026">
                    2026
                  </SelectItem>
                </SelectContent>

              </Select>

            </div>

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Representada
              </label>

              <Select
                defaultValue="all"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma representada" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todas as representadas
                  </SelectItem>
                </SelectContent>

              </Select>

              <p className="text-xs text-muted-foreground">
                As Representadas reais serão carregadas do cadastro do CRM.
              </p>

            </div>

          </div>

          <Button>
            Aplicar Filtros
          </Button>

        </div>

        {/* Resumo de Metas e Vendas */}
        <div className="grid gap-4 md:grid-cols-5">

          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>

              <BarChart3 className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>

              <div className="text-2xl font-bold">
                R$ 0,00
              </div>

              <div className="flex items-center space-x-2">

                <TrendingUp className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Sem comparação real disponível
                </p>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">
                Meta Mensal
              </CardTitle>

              <Target className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>

              <div className="text-2xl font-bold">
                R$ 0,00
              </div>

              <div className="mt-2">

                <div className="flex items-center justify-between text-xs">

                  <span>
                    Progresso: 0,0%
                  </span>

                  <span>
                    R$ 0,00 / R$ 0,00
                  </span>

                </div>

                <div className="mt-1 h-2 w-full rounded-full bg-muted">

                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width:
                        "0%",
                    }}
                  />

                </div>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>

              <LineChart className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>

              <div className="text-2xl font-bold">
                R$ 0,00
              </div>

              <div className="flex items-center space-x-2">

                <TrendingUp className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Sem comparação real disponível
                </p>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>

              <PieChart className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>

              <div className="text-2xl font-bold">
                0
              </div>

              <div className="flex items-center space-x-2">

                <TrendingDown className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Sem comparação real disponível
                </p>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">
                Diferenças no Faturamento
              </CardTitle>

              <TrendingDown className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>

              <div className="text-2xl font-bold">
                R$ 0,00
              </div>

              <div className="flex items-center space-x-2">

                <TrendingDown className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Nenhuma diferença real consolidada
                </p>

              </div>

              <div className="mt-2">

                <Link
                  href="/vendas"
                  className="text-xs text-primary hover:underline"
                >
                  Ver análise detalhada
                </Link>

              </div>

            </CardContent>

          </Card>

        </div>

        <Tabs
          defaultValue="vendas-metas"
        >

          <TabsList className="grid w-full grid-cols-3">

            <TabsTrigger value="vendas-metas">
              Vendas vs Metas
            </TabsTrigger>

            <TabsTrigger value="representadas">
              Desempenho por Representada
            </TabsTrigger>

            <TabsTrigger value="mensal">
              Análise Mensal
            </TabsTrigger>

          </TabsList>

          {/* VENDAS X METAS */}
          <TabsContent
            value="vendas-metas"
            className="space-y-4"
          >

            <div className="grid gap-4 md:grid-cols-2">

              <Card className="col-span-1">

                <CardHeader>

                  <CardTitle>
                    Vendas vs Metas (Anual)
                  </CardTitle>

                  <CardDescription>
                    Comparativo entre vendas realizadas e metas estabelecidas
                  </CardDescription>

                </CardHeader>

                <CardContent className="pl-2">

                  <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-md bg-muted/20">

                    <LineChart className="h-8 w-8 text-muted-foreground" />

                    <p className="mt-2 text-sm text-muted-foreground">
                      Sem dados reais para o gráfico
                    </p>

                  </div>

                </CardContent>

              </Card>

              <Card className="col-span-1">

                <CardHeader>

                  <CardTitle>
                    Distribuição de Vendas
                  </CardTitle>

                  <CardDescription>
                    Vendas por representada no período
                  </CardDescription>

                </CardHeader>

                <CardContent className="pl-2">

                  <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-md bg-muted/20">

                    <PieChart className="h-8 w-8 text-muted-foreground" />

                    <p className="mt-2 text-sm text-muted-foreground">
                      Sem dados reais para o gráfico
                    </p>

                  </div>

                </CardContent>

              </Card>

            </div>

            <Card>

              <CardHeader>

                <CardTitle>
                  Progresso de Metas por Representada
                </CardTitle>

                <CardDescription>
                  Acompanhamento do progresso em relação às metas estabelecidas
                </CardDescription>

              </CardHeader>

              <CardContent>

                {REPRESENTADAS_DASHBOARD.length ===
                0 ? (

                  <div className="rounded-lg border border-dashed p-8 text-center">

                    <p className="font-medium">
                      Nenhum dado real consolidado por Representada
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      A estrutura permanece preparada para receber metas e vendas reais.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {REPRESENTADAS_DASHBOARD.map(
                      (
                        rep
                      ) => (
                        <div
                          key={
                            rep.nome
                          }
                          className="space-y-1"
                        >

                          <div className="flex items-center justify-between">

                            <span className="font-medium">
                              {
                                rep.nome
                              }
                            </span>

                            <span>
                              {rep.atual} / {rep.meta}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-xs">

                            <span>
                              Progresso:{" "}
                              {rep.progresso.toFixed(
                                1
                              )}
                              %
                            </span>

                            <span
                              className={
                                rep.progresso >=
                                80
                                  ? "text-green-500"
                                  : rep.progresso >=
                                      60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }
                            >
                              {rep.progresso >=
                              80
                                ? "Bom"
                                : rep.progresso >=
                                    60
                                  ? "Regular"
                                  : "Abaixo do esperado"}
                            </span>

                          </div>

                          <div className="h-2 w-full rounded-full bg-muted">

                            <div
                              className={`h-2 rounded-full ${
                                rep.progresso >=
                                80
                                  ? "bg-green-500"
                                  : rep.progresso >=
                                      60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width:
                                  `${rep.progresso}%`,
                              }}
                            />

                          </div>

                        </div>
                      )
                    )}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

          {/* REPRESENTADAS */}
          <TabsContent
            value="representadas"
            className="space-y-4"
          >

            <Card>

              <CardHeader>

                <CardTitle>
                  Desempenho por Representada
                </CardTitle>

                <CardDescription>
                  Análise detalhada de vendas e metas por representada
                </CardDescription>

              </CardHeader>

              <CardContent>

                {REPRESENTADAS_DASHBOARD.length ===
                0 ? (

                  <div className="rounded-lg border border-dashed p-8 text-center">

                    <p className="font-medium">
                      Nenhum desempenho real consolidado
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Esta área permanece preparada para análise individual das Representadas.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-6">

                    {REPRESENTADAS_DASHBOARD.map(
                      (
                        rep
                      ) => (
                        <div
                          key={
                            rep.nome
                          }
                          className="space-y-3 rounded-lg border p-4"
                        >

                          <div className="flex items-center justify-between">

                            <h3 className="text-lg font-bold">
                              {
                                rep.nome
                              }
                            </h3>

                            <div
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                rep.progresso >=
                                80
                                  ? "bg-green-100 text-green-800"
                                  : rep.progresso >=
                                      60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {rep.progresso.toFixed(
                                1
                              )}
                              % da meta
                            </div>

                          </div>

                          <div className="grid grid-cols-2 gap-4">

                            <div>

                              <div className="text-sm text-muted-foreground">
                                Meta Mensal
                              </div>

                              <div className="text-xl font-bold">
                                {
                                  rep.meta
                                }
                              </div>

                            </div>

                            <div>

                              <div className="text-sm text-muted-foreground">
                                Vendas Realizadas
                              </div>

                              <div className="text-xl font-bold">
                                {
                                  rep.atual
                                }
                              </div>

                            </div>

                          </div>

                          <div className="space-y-1">

                            <div className="flex items-center justify-between text-xs">

                              <span>
                                Progresso
                              </span>

                              <span>
                                {rep.atual} / {rep.meta}
                              </span>

                            </div>

                            <div className="h-2 w-full rounded-full bg-muted">

                              <div
                                className={`h-2 rounded-full ${
                                  rep.progresso >=
                                  80
                                    ? "bg-green-500"
                                    : rep.progresso >=
                                        60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width:
                                    `${rep.progresso}%`,
                                }}
                              />

                            </div>

                          </div>

                          <div className="flex h-[150px] w-full items-center justify-center rounded-md bg-muted/20">

                            <LineChart className="h-6 w-6 text-muted-foreground" />

                          </div>

                        </div>
                      )
                    )}

                  </div>

                )}

              </CardContent>

            </Card>

          </TabsContent>

          {/* ANÁLISE MENSAL */}
          <TabsContent
            value="mensal"
            className="space-y-4"
          >

            <Card>

              <CardHeader>

                <CardTitle>
                  Análise Mensal de Vendas e Metas
                </CardTitle>

                <CardDescription>
                  Desempenho mês a mês durante o ano
                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="mb-4 flex h-[400px] w-full flex-col items-center justify-center rounded-md bg-muted/20">

                  <BarChart3 className="h-8 w-8 text-muted-foreground" />

                  <p className="mt-2 text-sm text-muted-foreground">
                    Gráfico aguardando dados reais
                  </p>

                </div>

                <div className="overflow-x-auto rounded-md border">

                  <div className="min-w-[760px]">

                    <div className="grid grid-cols-7 bg-muted/20 p-2 text-xs font-medium">

                      <div>
                        Mês
                      </div>

                      <div>
                        Meta
                      </div>

                      <div>
                        Vendas
                      </div>

                      <div>
                        Diferença
                      </div>

                      <div>
                        % Atingido
                      </div>

                      <div>
                        Comissão
                      </div>

                      <div>
                        Status
                      </div>

                    </div>

                    {MESES_DASHBOARD.map(
                      (
                        mes
                      ) => (
                        <div
                          key={
                            mes.mes
                          }
                          className="grid grid-cols-7 border-t p-2 text-xs"
                        >

                          <div>
                            {
                              mes.mes
                            }
                          </div>

                          <div>
                            {
                              mes.meta
                            }
                          </div>

                          <div>
                            {
                              mes.vendas
                            }
                          </div>

                          <div>
                            {
                              mes.diff
                            }
                          </div>

                          <div>
                            {
                              mes.perc
                            }
                            %
                          </div>

                          <div>
                            {
                              mes.comissao
                            }
                          </div>

                          <div>

                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">
                              {
                                mes.status
                              }
                            </span>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>
  )
}