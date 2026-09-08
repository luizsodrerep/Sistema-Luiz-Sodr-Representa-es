"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  PageLayout,
} from "@/components/page-layout"

import {
  NavigationButtons,
} from "@/components/navigation-buttons"

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Input,
} from "@/components/ui/input"

import {
  AlertCircle,
  BarChart3,
  Download,
  LineChart,
  Loader2,
  PieChart,
  RefreshCw,
  Users,
  WalletCards,
} from "lucide-react"

type ClienteVenda = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  categoria?: string | null
  status?: string | null
}

type Representada = {
  id: string
  nome: string
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Venda = {
  id: string
  numeroSequencial: number
  data: string
  valorTotal: number
  status: string

  valorComissaoPrevista:
    | number
    | null

  comissao?:
    | number
    | null

  cliente:
    | ClienteVenda
    | null

  representada:
    | Representada
    | null

  responsavel:
    | UsuarioResumo
    | null

  criadoPor:
    | UsuarioResumo
    | null
}

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  categoria: string | null
  status: string | null
}

type Periodo =
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "all"
  | "custom"

function moeda(
  valor: number
) {
  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )
}

function dataValida(
  valor: string
) {
  const data =
    new Date(valor)

  return Number.isNaN(
    data.getTime()
  )
    ? null
    : data
}

function inicioDoDia(
  data: Date
) {
  const copia =
    new Date(data)

  copia.setHours(
    0,
    0,
    0,
    0
  )

  return copia
}

function fimDoDia(
  data: Date
) {
  const copia =
    new Date(data)

  copia.setHours(
    23,
    59,
    59,
    999
  )

  return copia
}

function inicioPeriodo(
  periodo: Periodo
) {
  const hoje =
    inicioDoDia(
      new Date()
    )

  switch (
    periodo
  ) {
    case "week": {
      const data =
        new Date(
          hoje
        )

      data.setDate(
        data.getDate() -
          6
      )

      return data
    }

    case "month":
      return new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )

    case "quarter":
      return new Date(
        hoje.getFullYear(),
        hoje.getMonth() -
          2,
        1
      )

    case "year":
      return new Date(
        hoje.getFullYear(),
        0,
        1
      )

    default:
      return null
  }
}

function vendaCancelada(
  status: string
) {
  const normalizado =
    status
      .trim()
      .toLowerCase()

  return (
    normalizado ===
      "cancelado" ||
    normalizado ===
      "cancelada"
  )
}

function nomeCliente(
  cliente:
    | ClienteVenda
    | null
) {
  return (
    cliente?.nomeFantasia ||
    cliente?.razaoSocial ||
    "Cliente não informado"
  )
}

function escaparCsv(
  valor:
    | string
    | number
    | null
    | undefined
) {
  const texto =
    valor === null ||
    valor === undefined
      ? ""
      : String(valor)

  return `"${texto.replace(
    /"/g,
    '""'
  )}"`
}

export default function RelatoriosPage() {
  const [
    vendas,
    setVendas,
  ] =
    useState<Venda[]>(
      []
    )

  const [
    clientes,
    setClientes,
  ] =
    useState<Cliente[]>(
      []
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    atualizando,
    setAtualizando,
  ] =
    useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    periodo,
    setPeriodo,
  ] =
    useState<Periodo>(
      "month"
    )

  const [
    categoria,
    setCategoria,
  ] =
    useState(
      "all"
    )

  const [
    representadaId,
    setRepresentadaId,
  ] =
    useState(
      "all"
    )

  const [
    dataInicial,
    setDataInicial,
  ] =
    useState("")

  const [
    dataFinal,
    setDataFinal,
  ] =
    useState("")

  const carregarDados =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (
          silencioso
        ) {
          setAtualizando(
            true
          )
        } else {
          setLoading(
            true
          )
        }

        setErro(
          null
        )

        try {
          const [
            respostaVendas,
            respostaClientes,
          ] =
            await Promise.all([
              fetch(
                "/api/vendas",
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                "/api/clientes",
                {
                  cache:
                    "no-store",
                }
              ),
            ])

          if (
            !respostaVendas.ok
          ) {
            throw new Error(
              "Não foi possível carregar as vendas."
            )
          }

          if (
            !respostaClientes.ok
          ) {
            throw new Error(
              "Não foi possível carregar os clientes."
            )
          }

          const [
            dadosVendas,
            dadosClientes,
          ] =
            await Promise.all([
              respostaVendas.json(),
              respostaClientes.json(),
            ])

          if (
            !Array.isArray(
              dadosVendas
            ) ||
            !Array.isArray(
              dadosClientes
            )
          ) {
            throw new Error(
              "Resposta inválida das APIs."
            )
          }

          setVendas(
            dadosVendas
          )

          setClientes(
            dadosClientes
          )
        } catch (
          error
        ) {
          console.error(
            "Erro ao carregar relatórios:",
            error
          )

          setErro(
            error instanceof
              Error
              ? error.message
              : "Erro ao carregar relatórios."
          )
        } finally {
          setLoading(
            false
          )

          setAtualizando(
            false
          )
        }
      },
      []
    )

  useEffect(() => {
    carregarDados()
  }, [
    carregarDados,
  ])

  const categorias =
    useMemo(() => {
      return Array.from(
        new Set(
          clientes
            .map(
              (
                cliente
              ) =>
                cliente.categoria
            )
            .filter(
              (
                valor
              ): valor is string =>
                Boolean(
                  valor
                )
            )
        )
      ).sort(
        (
          a,
          b
        ) =>
          a.localeCompare(
            b,
            "pt-BR"
          )
      )
    }, [
      clientes,
    ])

  const representadas =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          string
        >()

      for (
        const venda of
        vendas
      ) {
        if (
          venda.representada
        ) {
          mapa.set(
            venda.representada.id,
            venda.representada.nome
          )
        }
      }

      return Array.from(
        mapa.entries()
      )
        .map(
          ([
            id,
            nome,
          ]) => ({
            id,
            nome,
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            a.nome.localeCompare(
              b.nome,
              "pt-BR"
            )
        )
    }, [
      vendas,
    ])

  const vendasFiltradas =
    useMemo(() => {
      let inicio:
        | Date
        | null =
        null

      let fim:
        | Date
        | null =
        fimDoDia(
          new Date()
        )

      if (
        periodo ===
        "custom"
      ) {
        inicio =
          dataInicial
            ? inicioDoDia(
                new Date(
                  `${dataInicial}T00:00:00`
                )
              )
            : null

        fim =
          dataFinal
            ? fimDoDia(
                new Date(
                  `${dataFinal}T00:00:00`
                )
              )
            : null
      } else if (
        periodo ===
        "all"
      ) {
        inicio =
          null

        fim =
          null
      } else {
        inicio =
          inicioPeriodo(
            periodo
          )
      }

      return vendas.filter(
        (
          venda
        ) => {
          if (
            vendaCancelada(
              venda.status
            )
          ) {
            return false
          }

          const dataVenda =
            dataValida(
              venda.data
            )

          if (!dataVenda) {
            return false
          }

          if (
            inicio &&
            dataVenda <
              inicio
          ) {
            return false
          }

          if (
            fim &&
            dataVenda >
              fim
          ) {
            return false
          }

          if (
            representadaId !==
              "all" &&
            venda.representada
              ?.id !==
              representadaId
          ) {
            return false
          }

          if (
            categoria !==
            "all"
          ) {
            const categoriaVenda =
              venda.cliente
                ?.categoria ||
              null

            if (
              categoriaVenda !==
              categoria
            ) {
              return false
            }
          }

          return true
        }
      )
    }, [
      categoria,
      dataFinal,
      dataInicial,
      periodo,
      representadaId,
      vendas,
    ])

  const indicadores =
    useMemo(() => {
      const totalVendas =
        vendasFiltradas.reduce(
          (
            soma,
            venda
          ) =>
            soma +
            Number(
              venda.valorTotal ||
                0
            ),
          0
        )

      const pedidos =
        vendasFiltradas.length

      const ticketMedio =
        pedidos > 0
          ? totalVendas /
            pedidos
          : 0

      const comissaoPrevista =
        vendasFiltradas.reduce(
          (
            soma,
            venda
          ) =>
            soma +
            Number(
              venda.valorComissaoPrevista ??
                venda.comissao ??
                0
            ),
          0
        )

      return {
        totalVendas,
        pedidos,
        ticketMedio,
        comissaoPrevista,
      }
    }, [
      vendasFiltradas,
    ])

  const vendasPorCategoria =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          number
        >()

      for (
        const venda of
        vendasFiltradas
      ) {
        const chave =
          venda.cliente
            ?.categoria ||
          "Sem categoria"

        mapa.set(
          chave,
          (
            mapa.get(
              chave
            ) ||
            0
          ) +
            Number(
              venda.valorTotal ||
                0
            )
        )
      }

      return Array.from(
        mapa.entries()
      )
        .map(
          ([
            nome,
            valor,
          ]) => ({
            nome,
            valor,
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.valor -
            a.valor
        )
    }, [
      vendasFiltradas,
    ])

  const vendasPorRepresentada =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          {
            nome: string
            valor: number
            pedidos: number
          }
        >()

      for (
        const venda of
        vendasFiltradas
      ) {
        const id =
          venda.representada
            ?.id ||
          "sem-representada"

        const atual =
          mapa.get(
            id
          ) || {
            nome:
              venda.representada
                ?.nome ||
              "Sem Representada",

            valor: 0,
            pedidos: 0,
          }

        atual.valor +=
          Number(
            venda.valorTotal ||
              0
          )

        atual.pedidos +=
          1

        mapa.set(
          id,
          atual
        )
      }

      return Array.from(
        mapa.values()
      ).sort(
        (
          a,
          b
        ) =>
          b.valor -
          a.valor
      )
    }, [
      vendasFiltradas,
    ])

  const vendasMensais =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          {
            chave: string
            rotulo: string
            valor: number
          }
        >()

      for (
        const venda of
        vendasFiltradas
      ) {
        const data =
          dataValida(
            venda.data
          )

        if (!data) {
          continue
        }

        const chave =
          `${data.getFullYear()}-${String(
            data.getMonth() +
              1
          ).padStart(
            2,
            "0"
          )}`

        const rotulo =
          data.toLocaleDateString(
            "pt-BR",
            {
              month:
                "short",
              year:
                "2-digit",
            }
          )

        const atual =
          mapa.get(
            chave
          ) || {
            chave,
            rotulo,
            valor: 0,
          }

        atual.valor +=
          Number(
            venda.valorTotal ||
              0
          )

        mapa.set(
          chave,
          atual
        )
      }

      return Array.from(
        mapa.values()
      ).sort(
        (
          a,
          b
        ) =>
          a.chave.localeCompare(
            b.chave
          )
      )
    }, [
      vendasFiltradas,
    ])

  const clientesComVenda =
    useMemo(() => {
      const ids =
        new Set(
          vendasFiltradas
            .map(
              (
                venda
              ) =>
                venda.cliente
                  ?.id
            )
            .filter(
              (
                valor
              ): valor is string =>
                Boolean(
                  valor
                )
            )
        )

      return ids.size
    }, [
      vendasFiltradas,
    ])

  const desempenho =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          {
            nome: string
            valor: number
            pedidos: number
            comissao: number
          }
        >()

      for (
        const venda of
        vendasFiltradas
      ) {
        const usuario =
          venda.responsavel ||
          venda.criadoPor

        const id =
          usuario?.id ||
          "sem-responsavel"

        const atual =
          mapa.get(
            id
          ) || {
            nome:
              usuario?.nome ||
              "Não informado",

            valor: 0,
            pedidos: 0,
            comissao: 0,
          }

        atual.valor +=
          Number(
            venda.valorTotal ||
              0
          )

        atual.pedidos +=
          1

        atual.comissao +=
          Number(
            venda.valorComissaoPrevista ??
              venda.comissao ??
              0
          )

        mapa.set(
          id,
          atual
        )
      }

      return Array.from(
        mapa.values()
      ).sort(
        (
          a,
          b
        ) =>
          b.valor -
          a.valor
      )
    }, [
      vendasFiltradas,
    ])

  const maiorVendaMensal =
    useMemo(() => {
      return Math.max(
        ...vendasMensais.map(
          (
            item
          ) =>
            item.valor
        ),
        1
      )
    }, [
      vendasMensais,
    ])

  const maiorCategoria =
    useMemo(() => {
      return Math.max(
        ...vendasPorCategoria.map(
          (
            item
          ) =>
            item.valor
        ),
        1
      )
    }, [
      vendasPorCategoria,
    ])

  function exportar() {
    const cabecalho =
      [
        "Venda",
        "Data",
        "Cliente",
        "Categoria",
        "Representada",
        "Status",
        "Valor Total",
        "Comissão Prevista",
        "Responsável",
      ]

    const linhas =
      vendasFiltradas.map(
        (
          venda
        ) => {
          const data =
            dataValida(
              venda.data
            )

          return [
            `VEN-${String(
              venda.numeroSequencial
            ).padStart(
              6,
              "0"
            )}`,

            data
              ? data.toLocaleDateString(
                  "pt-BR"
                )
              : "",

            nomeCliente(
              venda.cliente
            ),

            venda.cliente
              ?.categoria ||
              "",

            venda.representada
              ?.nome ||
              "",

            venda.status,

            Number(
              venda.valorTotal ||
                0
            ).toFixed(
              2
            ),

            Number(
              venda.valorComissaoPrevista ??
                venda.comissao ??
                0
            ).toFixed(
              2
            ),

            venda.responsavel
              ?.nome ||
              venda.criadoPor
                ?.nome ||
              "",
          ]
            .map(
              escaparCsv
            )
            .join(
              ";"
            )
        }
      )

    const csv =
      [
        cabecalho
          .map(
            escaparCsv
          )
          .join(
            ";"
          ),

        ...linhas,
      ].join(
        "\n"
      )

    const blob =
      new Blob(
        [
          "\uFEFF",
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        "a"
      )

    link.href =
      url

    link.download =
      `relatorio-vendas-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

    URL.revokeObjectURL(
      url
    )
  }

  if (
    loading
  ) {
    return (
      <PageLayout title="Relatórios">
        <NavigationButtons />

        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando relatórios reais...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Relatórios">
      <NavigationButtons />

      <div className="space-y-6">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Relatórios
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Consolidação feita a partir dos dados reais registrados no CRM.
            </p>
          </div>

          <div className="flex gap-2">

            <Button
              variant="outline"
              onClick={() =>
                carregarDados(
                  true
                )
              }
              disabled={
                atualizando
              }
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  atualizando
                    ? "animate-spin"
                    : ""
                }`}
              />

              Atualizar
            </Button>

            <Button
              variant="outline"
              onClick={
                exportar
              }
              disabled={
                vendasFiltradas.length ===
                0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>

          </div>

        </div>

        {erro && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {erro}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">

            <div className="grid gap-4 md:grid-cols-3">

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Período
                </label>

                <Select
                  value={
                    periodo
                  }
                  onValueChange={(
                    valor
                  ) =>
                    setPeriodo(
                      valor as Periodo
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="week">
                      Últimos 7 dias
                    </SelectItem>

                    <SelectItem value="month">
                      Mês atual
                    </SelectItem>

                    <SelectItem value="quarter">
                      Últimos 3 meses
                    </SelectItem>

                    <SelectItem value="year">
                      Ano atual
                    </SelectItem>

                    <SelectItem value="all">
                      Todo o histórico
                    </SelectItem>

                    <SelectItem value="custom">
                      Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Categoria
                </label>

                <Select
                  value={
                    categoria
                  }
                  onValueChange={
                    setCategoria
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      Todas as categorias
                    </SelectItem>

                    {categorias.map(
                      (
                        item
                      ) => (
                        <SelectItem
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Representada
                </label>

                <Select
                  value={
                    representadaId
                  }
                  onValueChange={
                    setRepresentadaId
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      Todas as Representadas
                    </SelectItem>

                    {representadas.map(
                      (
                        item
                      ) => (
                        <SelectItem
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {item.nome}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {periodo ===
              "custom" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data inicial
                  </label>

                  <Input
                    type="date"
                    value={
                      dataInicial
                    }
                    onChange={(
                      event
                    ) =>
                      setDataInicial(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data final
                  </label>

                  <Input
                    type="date"
                    value={
                      dataFinal
                    }
                    onChange={(
                      event
                    ) =>
                      setDataFinal(
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>
            )}

          </CardContent>
        </Card>

        <Tabs
          defaultValue="vendas"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-4">
            <TabsTrigger value="vendas">
              Vendas
            </TabsTrigger>

            <TabsTrigger value="clientes">
              Clientes
            </TabsTrigger>

            <TabsTrigger value="comissoes">
              Comissões
            </TabsTrigger>

            <TabsTrigger value="desempenho">
              Desempenho
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="vendas"
            className="space-y-4"
          >

            <div className="grid gap-4 md:grid-cols-3">

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Vendas
                  </CardTitle>

                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {moeda(
                      indicadores.totalVendas
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Somente vendas não canceladas no período.
                  </p>
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
                    {moeda(
                      indicadores.ticketMedio
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Total vendido dividido pelos pedidos do período.
                  </p>
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
                    {indicadores.pedidos}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Quantidade real de vendas no filtro atual.
                  </p>
                </CardContent>
              </Card>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <Card>
                <CardHeader>
                  <CardTitle>
                    Vendas por Período
                  </CardTitle>

                  <CardDescription>
                    Evolução mensal das vendas filtradas
                  </CardDescription>
                </CardHeader>

                <CardContent>

                  {vendasMensais.length ===
                  0 ? (
                    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                      Nenhuma venda encontrada.
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {vendasMensais.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.chave
                            }
                          >
                            <div className="mb-1 flex justify-between text-xs">
                              <span>
                                {item.rotulo}
                              </span>

                              <span className="font-medium">
                                {moeda(
                                  item.valor
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width:
                                    `${Math.max(
                                      (
                                        item.valor /
                                        maiorVendaMensal
                                      ) *
                                        100,
                                      2
                                    )}%`,
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

              <Card>
                <CardHeader>
                  <CardTitle>
                    Vendas por Categoria
                  </CardTitle>

                  <CardDescription>
                    Distribuição real conforme categoria dos clientes
                  </CardDescription>
                </CardHeader>

                <CardContent>

                  {vendasPorCategoria.length ===
                  0 ? (
                    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                      Nenhuma categoria disponível.
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {vendasPorCategoria.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.nome
                            }
                          >
                            <div className="mb-1 flex justify-between text-xs">
                              <span>
                                {item.nome}
                              </span>

                              <span className="font-medium">
                                {moeda(
                                  item.valor
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width:
                                    `${Math.max(
                                      (
                                        item.valor /
                                        maiorCategoria
                                      ) *
                                        100,
                                      2
                                    )}%`,
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

            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Vendas por Produto
                </CardTitle>

                <CardDescription>
                  Produtos mais vendidos no período
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                  <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="text-sm font-medium">
                    Estrutura preservada
                  </p>

                  <p className="mt-1 max-w-lg text-xs text-muted-foreground">
                    O endpoint atual de Vendas ainda não fornece itens de
                    produto em formato que permita consolidar este gráfico
                    com segurança. Nenhum produto fictício será exibido.
                  </p>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent
            value="clientes"
            className="space-y-4"
          >

            <div className="grid gap-4 md:grid-cols-3">

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Clientes cadastrados
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {clientes.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Clientes com venda no período
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {clientesComVenda}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Categorias cadastradas
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {categorias.length}
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Análise de Clientes
                </CardTitle>

                <CardDescription>
                  Participação da base de clientes nas vendas do período
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">

                  {vendasPorCategoria.length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma venda disponível para análise.
                    </p>
                  ) : (
                    vendasPorCategoria.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.nome
                          }
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {item.nome}
                          </div>

                          <div className="font-medium">
                            {moeda(
                              item.valor
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}

                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent
            value="comissoes"
            className="space-y-4"
          >

            <div className="grid gap-4 md:grid-cols-3">

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Comissão prevista
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {moeda(
                      indicadores.comissaoPrevista
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Vendas consideradas
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {indicadores.pedidos}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Média prevista por pedido
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {moeda(
                      indicadores.pedidos >
                        0
                        ? indicadores.comissaoPrevista /
                            indicadores.pedidos
                        : 0
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Relatório de Comissões
                </CardTitle>

                <CardDescription>
                  Valores previstos calculados nas vendas reais
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">

                  {vendasPorRepresentada.length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma venda disponível no período.
                    </p>
                  ) : (
                    vendasPorRepresentada.map(
                      (
                        item
                      ) => {
                        const vendasRep =
                          vendasFiltradas.filter(
                            (
                              venda
                            ) =>
                              (
                                venda.representada
                                  ?.nome ||
                                "Sem Representada"
                              ) ===
                              item.nome
                          )

                        const comissao =
                          vendasRep.reduce(
                            (
                              soma,
                              venda
                            ) =>
                              soma +
                              Number(
                                venda.valorComissaoPrevista ??
                                  venda.comissao ??
                                  0
                              ),
                            0
                          )

                        return (
                          <div
                            key={
                              item.nome
                            }
                            className="grid gap-2 rounded-md border p-3 md:grid-cols-3"
                          >
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Representada
                              </div>

                              <div className="font-medium">
                                {item.nome}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground">
                                Vendas
                              </div>

                              <div className="font-medium">
                                {moeda(
                                  item.valor
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground">
                                Comissão prevista
                              </div>

                              <div className="font-medium">
                                {moeda(
                                  comissao
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )
                  )}

                </div>

                <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Comissões efetivamente reconhecidas e pagas permanecem
                  sob controle do módulo próprio de Comissões. Este relatório
                  não inventa recebimentos nem baixas financeiras.
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent
            value="desempenho"
            className="space-y-4"
          >

            <Card>
              <CardHeader>
                <CardTitle>
                  Desempenho da Equipe
                </CardTitle>

                <CardDescription>
                  Consolidação das vendas por responsável no período
                </CardDescription>
              </CardHeader>

              <CardContent>

                {desempenho.length ===
                0 ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    Nenhuma venda disponível para o filtro atual.
                  </div>
                ) : (
                  <div className="space-y-3">

                    {desempenho.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.nome
                          }
                          className="grid gap-3 rounded-md border p-4 md:grid-cols-4"
                        >
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Responsável
                            </div>

                            <div className="font-medium">
                              {item.nome}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Vendas
                            </div>

                            <div className="font-medium">
                              {moeda(
                                item.valor
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Pedidos
                            </div>

                            <div className="font-medium">
                              {item.pedidos}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Comissão prevista
                            </div>

                            <div className="font-medium">
                              {moeda(
                                item.comissao
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                  </div>
                )}

              </CardContent>
            </Card>

          </TabsContent>

        </Tabs>

      </div>
    </PageLayout>
  )
}