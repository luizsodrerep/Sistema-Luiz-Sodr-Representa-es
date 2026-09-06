"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  BarChart3,
  CircleDollarSign,
  Download,
  LineChart,
  Loader2,
  PieChart,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react"

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

type VendaDashboard = {
  id: string

  numeroSequencial: number

  data: string

  valorTotal:
    | number
    | null

  comissao:
    | number
    | null

  valorComissaoPrevista:
    | number
    | null

  status: string

  cliente: {
    id: string

    razaoSocial: string

    nomeFantasia:
      | string
      | null
  }

  representada: {
    id: string

    nome: string

    codigo:
      | string
      | null
  }
}

type PeriodoDashboard =
  | "mes-atual"
  | "mes-anterior"
  | "ultimos-3-meses"
  | "ano"
  | "todo-historico"
  | "personalizado"

type ResumoRepresentada = {
  id: string
  nome: string

  vendas: number
  pedidos: number
  comissao: number

  participacao: number
}

type ResumoMes = {
  numero: number
  nome: string

  vendas: number
  pedidos: number
  ticketMedio: number
  comissao: number
}

/*
 * ======================================================
 * META DO ESCRITÓRIO
 * ======================================================
 *
 * Nenhum valor fictício será utilizado.
 *
 * A futura meta deverá considerar dados reais como:
 * - metas das Representadas;
 * - custos fixos;
 * - custos variáveis;
 * - compromissos financeiros;
 * - margem/reserva para crescimento saudável.
 */
const META_ESCRITORIO:
  number | null =
  null

const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    valor
  )
}

function formatarPercentual(
  valor: number
) {
  return `${valor.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  )}%`
}

function inicioDoDia(
  data: Date
) {
  const nova =
    new Date(data)

  nova.setHours(
    0,
    0,
    0,
    0
  )

  return nova
}

function fimDoDia(
  data: Date
) {
  const nova =
    new Date(data)

  nova.setHours(
    23,
    59,
    59,
    999
  )

  return nova
}

function obterIntervaloPeriodo(
  periodo: PeriodoDashboard,
  anoSelecionado: number,
  dataInicial: string,
  dataFinal: string
) {
  const hoje =
    new Date()

  if (
    periodo ===
    "todo-historico"
  ) {
    return {
      inicio:
        null as Date | null,

      fim:
        null as Date | null,
    }
  }

  if (
    periodo ===
    "personalizado"
  ) {
    const inicio =
      dataInicial
        ? inicioDoDia(
            new Date(
              `${dataInicial}T00:00:00`
            )
          )
        : null

    const fim =
      dataFinal
        ? fimDoDia(
            new Date(
              `${dataFinal}T00:00:00`
            )
          )
        : null

    return {
      inicio,
      fim,
    }
  }

  if (
    periodo ===
    "mes-atual"
  ) {
    return {
      inicio:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1
        ),

      fim:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ),
    }
  }

  if (
    periodo ===
    "mes-anterior"
  ) {
    return {
      inicio:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 1,
          1
        ),

      fim:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          0,
          23,
          59,
          59,
          999
        ),
    }
  }

  if (
    periodo ===
    "ultimos-3-meses"
  ) {
    return {
      inicio:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 2,
          1
        ),

      fim:
        new Date(
          hoje.getFullYear(),
          hoje.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ),
    }
  }

  return {
    inicio:
      new Date(
        anoSelecionado,
        0,
        1
      ),

    fim:
      new Date(
        anoSelecionado,
        11,
        31,
        23,
        59,
        59,
        999
      ),
  }
}

function vendaNoIntervalo(
  venda: VendaDashboard,
  inicio: Date | null,
  fim: Date | null
) {
  if (
    !inicio &&
    !fim
  ) {
    return true
  }

  const data =
    new Date(
      venda.data
    )

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return false
  }

  if (
    inicio &&
    data < inicio
  ) {
    return false
  }

  if (
    fim &&
    data > fim
  ) {
    return false
  }

  return true
}

function descricaoPeriodo(
  periodo: PeriodoDashboard,
  anoSelecionado: number,
  dataInicial: string,
  dataFinal: string
) {
  if (
    periodo ===
    "mes-atual"
  ) {
    return "Mês atual"
  }

  if (
    periodo ===
    "mes-anterior"
  ) {
    return "Mês anterior"
  }

  if (
    periodo ===
    "ultimos-3-meses"
  ) {
    return "Últimos 3 meses"
  }

  if (
    periodo ===
    "ano"
  ) {
    return `Ano de ${anoSelecionado}`
  }

  if (
    periodo ===
    "personalizado"
  ) {
    if (
      dataInicial &&
      dataFinal
    ) {
      return `${new Date(
        `${dataInicial}T00:00:00`
      ).toLocaleDateString(
        "pt-BR"
      )} até ${new Date(
        `${dataFinal}T00:00:00`
      ).toLocaleDateString(
        "pt-BR"
      )}`
    }

    return "Período personalizado"
  }

  return "Todo o histórico"
}

function nomeArquivoData() {
  const agora =
    new Date()

  const ano =
    agora.getFullYear()

  const mes =
    String(
      agora.getMonth() +
        1
    ).padStart(
      2,
      "0"
    )

  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    )

  return `${ano}-${mes}-${dia}`
}

export default function DashboardPage() {
  const [
    vendas,
    setVendas,
  ] =
    useState<VendaDashboard[]>(
      []
    )

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    periodoSelecionado,
    setPeriodoSelecionado,
  ] =
    useState<PeriodoDashboard>(
      "mes-atual"
    )

  const [
    anoSelecionado,
    setAnoSelecionado,
  ] =
    useState(
      new Date().getFullYear()
    )

  const [
    representadaSelecionada,
    setRepresentadaSelecionada,
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

  const [
    ultimaAtualizacao,
    setUltimaAtualizacao,
  ] =
    useState<Date | null>(
      null
    )

  async function carregarVendas(
    silencioso = false
  ) {
    try {
      if (
        !silencioso
      ) {
        setCarregando(
          true
        )
      }

      setErro(
        null
      )

      const response =
        await fetch(
          "/api/vendas",
          {
            cache:
              "no-store",
          }
        )

      const dados =
        await response
          .json()
          .catch(
            () => []
          )

      if (
        !response.ok
      ) {
        throw new Error(
          dados?.message ||
            "Erro ao carregar vendas."
        )
      }

      setVendas(
        Array.isArray(
          dados
        )
          ? dados
          : []
      )

      setUltimaAtualizacao(
        new Date()
      )
    } catch (error) {
      console.error(
        "Erro ao carregar Dashboard:",
        error
      )

      setErro(
        "Não foi possível carregar os dados reais de vendas."
      )
    } finally {
      if (
        !silencioso
      ) {
        setCarregando(
          false
        )
      }
    }
  }

  useEffect(() => {
    carregarVendas()

    const intervalo =
      window.setInterval(
        () => {
          carregarVendas(
            true
          )
        },
        30000
      )

    return () => {
      window.clearInterval(
        intervalo
      )
    }
  }, [])

  const anosDisponiveis =
    useMemo(
      () => {
        const anos =
          new Set<number>()

        anos.add(
          new Date().getFullYear()
        )

        vendas.forEach(
          (
            venda
          ) => {
            const data =
              new Date(
                venda.data
              )

            if (
              !Number.isNaN(
                data.getTime()
              )
            ) {
              anos.add(
                data.getFullYear()
              )
            }
          }
        )

        return Array.from(
          anos
        ).sort(
          (
            a,
            b
          ) =>
            b - a
        )
      },
      [vendas]
    )

  const representadasDisponiveis =
    useMemo(
      () => {
        const mapa =
          new Map<
            string,
            string
          >()

        vendas.forEach(
          (
            venda
          ) => {
            if (
              venda.representada
                ?.id
            ) {
              mapa.set(
                venda.representada.id,
                venda.representada.nome
              )
            }
          }
        )

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
      },
      [vendas]
    )

  const intervaloSelecionado =
    useMemo(
      () =>
        obterIntervaloPeriodo(
          periodoSelecionado,
          anoSelecionado,
          dataInicial,
          dataFinal
        ),
      [
        periodoSelecionado,
        anoSelecionado,
        dataInicial,
        dataFinal,
      ]
    )

  const vendasPeriodo =
    useMemo(
      () =>
        vendas.filter(
          (
            venda
          ) => {
            if (
              venda.status ===
              "Cancelado"
            ) {
              return false
            }

            if (
              representadaSelecionada !==
                "all" &&
              venda.representada
                .id !==
                representadaSelecionada
            ) {
              return false
            }

            return vendaNoIntervalo(
              venda,
              intervaloSelecionado.inicio,
              intervaloSelecionado.fim
            )
          }
        ),
      [
        vendas,
        representadaSelecionada,
        intervaloSelecionado,
      ]
    )

  const totalVendas =
    useMemo(
      () =>
        vendasPeriodo.reduce(
          (
            total,
            venda
          ) =>
            total +
            Number(
              venda.valorTotal ||
                0
            ),
          0
        ),
      [vendasPeriodo]
    )

  const totalComissao =
    useMemo(
      () =>
        vendasPeriodo.reduce(
          (
            total,
            venda
          ) =>
            total +
            Number(
              venda.valorComissaoPrevista ??
                venda.comissao ??
                0
            ),
          0
        ),
      [vendasPeriodo]
    )

  const totalPedidos =
    vendasPeriodo.length

  const ticketMedio =
    totalPedidos >
    0
      ? totalVendas /
        totalPedidos
      : 0

  const vendasFaturadas =
    useMemo(
      () =>
        vendasPeriodo.filter(
          (
            venda
          ) =>
            venda.status ===
            "Faturado"
        ),
      [vendasPeriodo]
    )

  const totalFaturadas =
    useMemo(
      () =>
        vendasFaturadas.reduce(
          (
            total,
            venda
          ) =>
            total +
            Number(
              venda.valorTotal ||
                0
            ),
          0
        ),
      [vendasFaturadas]
    )

  const vendasAindaNaoFaturadas =
    Math.max(
      totalVendas -
        totalFaturadas,
      0
    )

  const resumoRepresentadas =
    useMemo<
      ResumoRepresentada[]
    >(
      () => {
        const mapa =
          new Map<
            string,
            ResumoRepresentada
          >()

        vendasPeriodo.forEach(
          (
            venda
          ) => {
            const atual =
              mapa.get(
                venda.representada.id
              )

            const valor =
              Number(
                venda.valorTotal ||
                  0
              )

            const comissao =
              Number(
                venda.valorComissaoPrevista ??
                  venda.comissao ??
                  0
              )

            if (
              atual
            ) {
              atual.vendas +=
                valor

              atual.pedidos +=
                1

              atual.comissao +=
                comissao
            } else {
              mapa.set(
                venda.representada.id,
                {
                  id:
                    venda.representada.id,

                  nome:
                    venda.representada.nome,

                  vendas:
                    valor,

                  pedidos:
                    1,

                  comissao,

                  participacao:
                    0,
                }
              )
            }
          }
        )

        return Array.from(
          mapa.values()
        )
          .map(
            (
              item
            ) => ({
              ...item,

              participacao:
                totalVendas >
                0
                  ? (
                      item.vendas /
                      totalVendas
                    ) *
                    100
                  : 0,
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              b.vendas -
              a.vendas
          )
      },
      [
        vendasPeriodo,
        totalVendas,
      ]
    )

  const resumoMensal =
    useMemo<
      ResumoMes[]
    >(
      () => {
        const meses =
          NOMES_MESES.map(
            (
              nome,
              numero
            ) => ({
              numero,
              nome,

              vendas: 0,
              pedidos: 0,
              ticketMedio: 0,
              comissao: 0,
            })
          )

        vendas.forEach(
          (
            venda
          ) => {
            if (
              venda.status ===
              "Cancelado"
            ) {
              return
            }

            const data =
              new Date(
                venda.data
              )

            if (
              Number.isNaN(
                data.getTime()
              )
            ) {
              return
            }

            if (
              data.getFullYear() !==
              anoSelecionado
            ) {
              return
            }

            if (
              representadaSelecionada !==
                "all" &&
              venda.representada
                .id !==
                representadaSelecionada
            ) {
              return
            }

            const mes =
              meses[
                data.getMonth()
              ]

            mes.vendas +=
              Number(
                venda.valorTotal ||
                  0
              )

            mes.pedidos +=
              1

            mes.comissao +=
              Number(
                venda.valorComissaoPrevista ??
                  venda.comissao ??
                  0
              )
          }
        )

        meses.forEach(
          (
            mes
          ) => {
            mes.ticketMedio =
              mes.pedidos >
              0
                ? mes.vendas /
                  mes.pedidos
                : 0
          }
        )

        return meses
      },
      [
        vendas,
        anoSelecionado,
        representadaSelecionada,
      ]
    )

  const maiorVendaMensal =
    useMemo(
      () =>
        Math.max(
          ...resumoMensal.map(
            (
              mes
            ) =>
              mes.vendas
          ),
          0
        ),
      [resumoMensal]
    )

  const maiorVendaRepresentada =
    useMemo(
      () =>
        Math.max(
          ...resumoRepresentadas.map(
            (
              item
            ) =>
              item.vendas
          ),
          0
        ),
      [resumoRepresentadas]
    )

  const descricaoFiltro =
    useMemo(
      () =>
        descricaoPeriodo(
          periodoSelecionado,
          anoSelecionado,
          dataInicial,
          dataFinal
        ),
      [
        periodoSelecionado,
        anoSelecionado,
        dataInicial,
        dataFinal,
      ]
    )

  function exportarRelatorio() {
    const cabecalho = [
      "VEN",
      "Data",
      "Cliente",
      "Representada",
      "Status",
      "Valor",
      "Comissao Prevista",
    ]

    const linhas =
      vendasPeriodo.map(
        (
          venda
        ) => [
          `VEN-${String(
            venda.numeroSequencial
          ).padStart(
            6,
            "0"
          )}`,

          new Date(
            venda.data
          ).toLocaleDateString(
            "pt-BR"
          ),

          venda.cliente
            .nomeFantasia ||
            venda.cliente
              .razaoSocial,

          venda.representada
            .nome,

          venda.status,

          Number(
            venda.valorTotal ||
              0
          )
            .toFixed(
              2
            )
            .replace(
              ".",
              ","
            ),

          Number(
            venda.valorComissaoPrevista ??
              venda.comissao ??
              0
          )
            .toFixed(
              2
            )
            .replace(
              ".",
              ","
            ),
        ]
      )

    const escapar = (
      valor:
        | string
        | number
    ) =>
      `"${String(
        valor
      ).replace(
        /"/g,
        '""'
      )}"`

    const csv = [
      cabecalho
        .map(
          escapar
        )
        .join(
          ";"
        ),

      ...linhas.map(
        (
          linha
        ) =>
          linha
            .map(
              escapar
            )
            .join(
              ";"
            )
      ),
    ].join(
      "\n"
    )

    const blob =
      new Blob(
        [
          `\uFEFF${csv}`,
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
      `dashboard-vendas-${nomeArquivoData()}.csv`

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

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons
          backLabel="Voltar para Home"
        />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard de Vendas e Metas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Consolidação dos dados comerciais reais registrados no CRM.
            </p>

            {ultimaAtualizacao && (
              <p className="mt-1 text-xs text-muted-foreground">
                Última atualização:{" "}
                {ultimaAtualizacao.toLocaleTimeString(
                  "pt-BR",
                  {
                    hour:
                      "2-digit",

                    minute:
                      "2-digit",

                    second:
                      "2-digit",
                  }
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={() =>
                carregarVendas()
              }
              disabled={
                carregando
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  carregando
                    ? "animate-spin"
                    : ""
                }`}
              />

              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={
                exportarRelatorio
              }
              disabled={
                vendasPeriodo.length ===
                0
              }
            >
              <Download className="h-4 w-4" />

              Exportar Relatório
            </Button>
          </div>
        </div>

        {erro && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />

            {
              erro
            }
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Filtros do Dashboard
            </CardTitle>

            <CardDescription>
              Todos os indicadores abaixo respondem aos filtros selecionados.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Período
                </label>

                <Select
                  value={
                    periodoSelecionado
                  }
                  onValueChange={(
                    valor
                  ) =>
                    setPeriodoSelecionado(
                      valor as PeriodoDashboard
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="mes-atual">
                      Mês atual
                    </SelectItem>

                    <SelectItem value="mes-anterior">
                      Mês anterior
                    </SelectItem>

                    <SelectItem value="ultimos-3-meses">
                      Últimos 3 meses
                    </SelectItem>

                    <SelectItem value="ano">
                      Ano selecionado
                    </SelectItem>

                    <SelectItem value="todo-historico">
                      Todo o histórico
                    </SelectItem>

                    <SelectItem value="personalizado">
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
                    String(
                      anoSelecionado
                    )
                  }
                  onValueChange={(
                    valor
                  ) =>
                    setAnoSelecionado(
                      Number(
                        valor
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>

                  <SelectContent>
                    {anosDisponiveis.map(
                      (
                        ano
                      ) => (
                        <SelectItem
                          key={
                            ano
                          }
                          value={
                            String(
                              ano
                            )
                          }
                        >
                          {
                            ano
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Usado na análise anual e mensal.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Representada
                </label>

                <Select
                  value={
                    representadaSelecionada
                  }
                  onValueChange={
                    setRepresentadaSelecionada
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma representada" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      Todas as Representadas
                    </SelectItem>

                    {representadasDisponiveis.map(
                      (
                        representada
                      ) => (
                        <SelectItem
                          key={
                            representada.id
                          }
                          value={
                            representada.id
                          }
                        >
                          {
                            representada.nome
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Lista baseada nas vendas reais registradas.
                </p>
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  Período em análise
                </p>

                <p className="mt-1 font-semibold">
                  {
                    descricaoFiltro
                  }
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Vendas canceladas não entram nos indicadores.
                </p>
              </div>
            </div>

            {periodoSelecionado ===
              "personalizado" && (
              <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data inicial
                  </label>

                  <input
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
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data final
                  </label>

                  <input
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
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {carregando ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Carregando vendas reais...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Vendas
                  </CardTitle>

                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(
                      totalVendas
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {
                      totalPedidos
                    }{" "}
                    pedido(s) considerados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Meta
                  </CardTitle>

                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-xl font-bold">
                    {META_ESCRITORIO ===
                    null
                      ? "Não configurada"
                      : formatarMoeda(
                          META_ESCRITORIO
                        )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Aguardando definição financeira real
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
                    {formatarMoeda(
                      ticketMedio
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Valor médio por pedido
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
                    {
                      totalPedidos
                    }
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    No período selecionado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Comissão Prevista
                  </CardTitle>

                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(
                      totalComissao
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Conforme regras aplicadas nas vendas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ainda não Faturadas
                  </CardTitle>

                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(
                      vendasAindaNaoFaturadas
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Venda registrada sem status Faturado
                  </p>

                  <Link
                    href="/faturamentos"
                    className="mt-2 inline-block text-xs text-primary hover:underline"
                  >
                    Abrir Faturamentos
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">
                  Observação:
                </strong>{" "}
                “Ainda não Faturadas” usa o status atual da Venda. A comparação contábil definitiva entre valor vendido e notas efetivamente faturadas será consolidada posteriormente com o módulo Faturamentos, sem presumir diferenças.
              </p>
            </div>

            <Tabs
              defaultValue="vendas-metas"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vendas-metas">
                  Vendas e Metas
                </TabsTrigger>

                <TabsTrigger value="representadas">
                  Por Representada
                </TabsTrigger>

                <TabsTrigger value="mensal">
                  Análise Mensal
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="vendas-metas"
                className="space-y-4"
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Evolução de Vendas — {anoSelecionado}
                      </CardTitle>

                      <CardDescription>
                        Vendas reais mês a mês. A meta será acrescentada quando estiver definida.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {resumoMensal.map(
                          (
                            mes
                          ) => {
                            const largura =
                              maiorVendaMensal >
                              0
                                ? (
                                    mes.vendas /
                                    maiorVendaMensal
                                  ) *
                                  100
                                : 0

                            return (
                              <div
                                key={
                                  mes.numero
                                }
                                className="space-y-1"
                              >
                                <div className="flex items-center justify-between gap-4 text-xs">
                                  <span className="w-20 font-medium">
                                    {
                                      mes.nome
                                    }
                                  </span>

                                  <span>
                                    {formatarMoeda(
                                      mes.vendas
                                    )}
                                  </span>
                                </div>

                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                      width:
                                        `${largura}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Distribuição de Vendas
                      </CardTitle>

                      <CardDescription>
                        Participação real de cada Representada no período filtrado.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {resumoRepresentadas.length ===
                      0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                          <p className="font-medium">
                            Nenhuma venda no período
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Altere os filtros para consultar outro período.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {resumoRepresentadas.map(
                            (
                              representada
                            ) => (
                              <div
                                key={
                                  representada.id
                                }
                                className="space-y-1"
                              >
                                <div className="flex items-center justify-between gap-3 text-sm">
                                  <span className="truncate font-medium">
                                    {
                                      representada.nome
                                    }
                                  </span>

                                  <span className="whitespace-nowrap">
                                    {formatarPercentual(
                                      representada.participacao
                                    )}
                                  </span>
                                </div>

                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                      width:
                                        `${Math.min(
                                          representada.participacao,
                                          100
                                        )}%`,
                                    }}
                                  />
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {
                                      representada.pedidos
                                    }{" "}
                                    pedido(s)
                                  </span>

                                  <span>
                                    {formatarMoeda(
                                      representada.vendas
                                    )}
                                  </span>
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
                      Vendas por Representada
                    </CardTitle>

                    <CardDescription>
                      Valores reais consolidados. Metas individuais ainda não foram configuradas.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {resumoRepresentadas.length ===
                    0 ? (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="font-medium">
                          Nenhuma venda real encontrada
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Não existem vendas para os filtros selecionados.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {resumoRepresentadas.map(
                          (
                            representada
                          ) => {
                            const largura =
                              maiorVendaRepresentada >
                              0
                                ? (
                                    representada.vendas /
                                    maiorVendaRepresentada
                                  ) *
                                  100
                                : 0

                            return (
                              <div
                                key={
                                  representada.id
                                }
                                className="rounded-lg border p-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="font-semibold">
                                      {
                                        representada.nome
                                      }
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {
                                        representada.pedidos
                                      }{" "}
                                      pedido(s)
                                    </p>
                                  </div>

                                  <div className="text-left sm:text-right">
                                    <p className="font-bold">
                                      {formatarMoeda(
                                        representada.vendas
                                      )}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      Comissão:{" "}
                                      {formatarMoeda(
                                        representada.comissao
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                      width:
                                        `${largura}%`,
                                    }}
                                  />
                                </div>

                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    Participação nas vendas
                                  </span>

                                  <span>
                                    {formatarPercentual(
                                      representada.participacao
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}

                    <div className="mt-4 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      Quando as metas reais de cada Representada forem cadastradas, esta mesma área poderá comparar realizado × meta sem alterar o histórico de vendas.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
                      Vendas, pedidos, comissão prevista e participação no período selecionado.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {resumoRepresentadas.length ===
                    0 ? (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="font-medium">
                          Nenhum desempenho para exibir
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Não há vendas reais no período selecionado.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {resumoRepresentadas.map(
                          (
                            representada
                          ) => (
                            <Card
                              key={
                                representada.id
                              }
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                  {
                                    representada.nome
                                  }
                                </CardTitle>
                              </CardHeader>

                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Vendas
                                    </p>

                                    <p className="font-bold">
                                      {formatarMoeda(
                                        representada.vendas
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Pedidos
                                    </p>

                                    <p className="font-bold">
                                      {
                                        representada.pedidos
                                      }
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Comissão prevista
                                    </p>

                                    <p className="font-bold">
                                      {formatarMoeda(
                                        representada.comissao
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Participação
                                    </p>

                                    <p className="font-bold">
                                      {formatarPercentual(
                                        representada.participacao
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <Link
                                  href={`/representadas/${representada.id}`}
                                  className="mt-4 inline-block text-xs text-primary hover:underline"
                                >
                                  Abrir Representada
                                </Link>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="mensal"
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Análise Mensal — {anoSelecionado}
                    </CardTitle>

                    <CardDescription>
                      Vendas e comissões reais mês a mês. Meta permanece em aberto até definição oficial.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6 space-y-3">
                      {resumoMensal.map(
                        (
                          mes
                        ) => {
                          const largura =
                            maiorVendaMensal >
                            0
                              ? (
                                  mes.vendas /
                                  maiorVendaMensal
                                ) *
                                100
                              : 0

                          return (
                            <div
                              key={
                                mes.numero
                              }
                              className="grid grid-cols-[80px_1fr_auto] items-center gap-3"
                            >
                              <span className="text-xs font-medium">
                                {
                                  mes.nome
                                }
                              </span>

                              <div className="h-3 rounded-full bg-muted">
                                <div
                                  className="h-3 rounded-full bg-primary"
                                  style={{
                                    width:
                                      `${largura}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs font-medium">
                                {formatarMoeda(
                                  mes.vendas
                                )}
                              </span>
                            </div>
                          )
                        }
                      )}
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                      <div className="min-w-[920px]">
                        <div className="grid grid-cols-7 bg-muted/20 p-3 text-xs font-medium">
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
                            Pedidos
                          </div>

                          <div>
                            Ticket Médio
                          </div>

                          <div>
                            Comissão
                          </div>

                          <div>
                            Status
                          </div>
                        </div>

                        {resumoMensal.map(
                          (
                            mes
                          ) => (
                            <div
                              key={
                                mes.numero
                              }
                              className="grid grid-cols-7 border-t p-3 text-xs"
                            >
                              <div className="font-medium">
                                {
                                  mes.nome
                                }
                              </div>

                              <div className="text-muted-foreground">
                                —
                              </div>

                              <div>
                                {formatarMoeda(
                                  mes.vendas
                                )}
                              </div>

                              <div>
                                {
                                  mes.pedidos
                                }
                              </div>

                              <div>
                                {formatarMoeda(
                                  mes.ticketMedio
                                )}
                              </div>

                              <div>
                                {formatarMoeda(
                                  mes.comissao
                                )}
                              </div>

                              <div>
                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] ${
                                    mes.pedidos >
                                    0
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {mes.pedidos >
                                  0
                                    ? "Vendas registradas"
                                    : "Sem vendas"}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      Meta, diferença e percentual de atingimento não são exibidos enquanto a Meta do Escritório e as metas das Representadas não forem formalmente definidas.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}