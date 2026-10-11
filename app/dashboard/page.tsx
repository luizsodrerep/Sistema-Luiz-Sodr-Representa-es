
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
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
import { NavigationButtons } from "@/components/navigation-buttons"

type VendaDashboard = {
  id: string
  numeroSequencial: number
  data: string
  valorTotal: number | null
  comissao: number | null
  valorComissaoPrevista: number | null
  status: string
  cliente: {
    id: string
    razaoSocial: string
    nomeFantasia: string | null
  }
  representada: {
    id: string
    nome: string
    codigo: string | null
  }
}

type PeriodoDashboard =
  | "mes-atual"
  | "mes-anterior"
  | "ultimos-3-meses"
  | "ano"
  | "todo-historico"
  | "personalizado"

type Resumo = {
  valor: number
  pedidos: number
  ticket: number
  comissao: number
  conferir: number
  faturadas: number
  naoFaturadas: number
  clientes: number
}

type ResumoRepresentada = {
  id: string
  nome: string
  vendas: number
  pedidos: number
  comissao: number
  comissoesAConferir: number
  participacao: number
}

type ResumoMes = {
  numero: number
  nome: string
  curto: string
  vendas: number
  pedidos: number
  ticketMedio: number
  comissao: number
  comissoesAConferir: number
}

const META_ESCRITORIO: number | null = null

const CORES = {
  azul: "#0A2847",
  azulClaro: "#2563EB",
  laranja: "#F58220",
  verde: "#16A34A",
  cinza: "#94A3B8",
  vermelho: "#DC2626",
}

const CORES_GRAFICO = [
  CORES.azul,
  CORES.laranja,
  CORES.azulClaro,
  CORES.verde,
  "#7C3AED",
  "#0891B2",
  "#C2410C",
  "#64748B",
]

const MESES = [
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

const CURTOS = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
]

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

function percentual(valor: number) {
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

function moedaCurta(valor: number) {
  if (Math.abs(valor) >= 1000000) {
    return `${(valor / 1000000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`
  }

  if (Math.abs(valor) >= 1000) {
    return `${(valor / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`
  }

  return valor.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  })
}

function comissaoRegistrada(venda: VendaDashboard): number | null {
  const valor = venda.valorComissaoPrevista

  return typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor > 0
    ? valor
    : null
}

function dataVenda(venda: VendaDashboard) {
  const data = new Date(venda.data)
  return Number.isNaN(data.getTime()) ? null : data
}

function periodoDatas(
  periodo: PeriodoDashboard,
  ano: number,
  inicial: string,
  final: string,
  hoje: Date
) {
  if (periodo === "todo-historico") {
    return { inicio: null as Date | null, fim: null as Date | null }
  }

  if (periodo === "personalizado") {
    const inicio = inicial
      ? new Date(`${inicial}T00:00:00`)
      : null
    const fim = final
      ? new Date(`${final}T23:59:59.999`)
      : null

    return { inicio, fim }
  }

  if (periodo === "mes-atual") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      fim: new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0, 23, 59, 59, 999
      ),
    }
  }

  if (periodo === "mes-anterior") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),
      fim: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        0, 23, 59, 59, 999
      ),
    }
  }

  if (periodo === "ultimos-3-meses") {
    return {
      inicio: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1),
      fim: new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0, 23, 59, 59, 999
      ),
    }
  }

  return {
    inicio: new Date(ano, 0, 1),
    fim: new Date(ano, 11, 31, 23, 59, 59, 999),
  }
}

function noIntervalo(
  venda: VendaDashboard,
  inicio: Date | null,
  fim: Date | null
) {
  if (!inicio && !fim) return true

  const data = dataVenda(venda)
  if (!data) return false
  if (inicio && data < inicio) return false
  if (fim && data > fim) return false

  return true
}

function resumir(vendas: VendaDashboard[]): Resumo {
  let valor = 0
  let comissao = 0
  let conferir = 0
  let faturadas = 0
  let naoFaturadas = 0

  const clientes = new Set<string>()

  for (const venda of vendas) {
    const total = Number(venda.valorTotal || 0)
    const previsao = comissaoRegistrada(venda)

    valor += total
    comissao += previsao ?? 0

    if (previsao === null) conferir++

    if (venda.status === "Faturado") {
      faturadas += total
    } else {
      naoFaturadas += total
    }

    if (venda.cliente?.id) clientes.add(venda.cliente.id)
  }

  return {
    valor,
    pedidos: vendas.length,
    ticket: vendas.length ? valor / vendas.length : 0,
    comissao,
    conferir,
    faturadas,
    naoFaturadas,
    clientes: clientes.size,
  }
}

function textoPeriodo(
  periodo: PeriodoDashboard,
  ano: number,
  inicial: string,
  final: string
) {
  switch (periodo) {
    case "mes-atual":
      return "Mês atual"
    case "mes-anterior":
      return "Mês anterior"
    case "ultimos-3-meses":
      return "Últimos 3 meses"
    case "ano":
      return `Ano de ${ano}`
    case "todo-historico":
      return "Todo o histórico"
    case "personalizado":
      if (inicial && final) {
        return `${inicial.split("-").reverse().join("/")} até ${
          final.split("-").reverse().join("/")
        }`
      }
      return "Período personalizado"
  }
}

function numeroVenda(numero: number) {
  return `VEN-${String(numero).padStart(6, "0")}`
}

function exportarCSV(vendas: VendaDashboard[]) {
  const cabecalho = [
    "VEN",
    "Data",
    "Cliente",
    "Representada",
    "Status",
    "Valor",
    "Comissao Prevista",
    "Situacao da comissao prevista",
  ]

  const linhas = vendas.map((venda) => {
    const previsao = comissaoRegistrada(venda)

    return [
      numeroVenda(venda.numeroSequencial),
      new Date(venda.data).toLocaleDateString("pt-BR"),
      venda.cliente?.nomeFantasia ||
        venda.cliente?.razaoSocial ||
        "",
      venda.representada?.nome || "",
      venda.status,
      Number(venda.valorTotal || 0).toFixed(2).replace(".", ","),
      venda.valorComissaoPrevista === null ||
      !Number.isFinite(venda.valorComissaoPrevista)
        ? ""
        : venda.valorComissaoPrevista.toFixed(2).replace(".", ","),
      previsao === null
        ? "A conferir"
        : "Registrada (nao auditada)",
    ]
  })

  const escapar = (valor: string | number) =>
    `"${String(valor).replace(/"/g, '""')}"`

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map(escapar).join(";"))
    .join("\n")

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `dashboard-vendas-${
    new Date().toLocaleDateString("en-CA")
  }.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function Indicador({
  titulo,
  valor,
  detalhe,
  icone: Icone,
  destaque = false,
}: {
  titulo: string
  valor: string
  detalhe: string
  icone: typeof BarChart3
  destaque?: boolean
}) {
  return (
    <Card className={
      destaque
        ? "border-[#F58220]/40 bg-[#0A2847] text-white shadow-sm"
        : "shadow-sm"
    }>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className={
            destaque
              ? "text-xs font-medium text-slate-200"
              : "text-xs font-medium text-muted-foreground"
          }>
            {titulo}
          </p>
          <Icone className={
            destaque
              ? "h-4 w-4 text-[#F58220]"
              : "h-4 w-4 text-[#F58220]"
          } />
        </div>

        <p className="mt-2 break-words text-xl font-bold tracking-tight 2xl:text-2xl">
          {valor}
        </p>

        <p className={
          destaque
            ? "mt-1 text-xs text-slate-300"
            : "mt-1 text-xs text-muted-foreground"
        }>
          {detalhe}
        </p>
      </CardContent>
    </Card>
  )
}

function SemDados({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
      {mensagem}
    </div>
  )
}

export default function DashboardPage() {
  const [vendas, setVendas] = useState<VendaDashboard[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dadosCarregados, setDadosCarregados] = useState(false)

  const [periodoSelecionado, setPeriodoSelecionado] =
    useState<PeriodoDashboard>("mes-atual")
  const [anoSelecionado, setAnoSelecionado] =
    useState(new Date().getFullYear())
  const [representadaSelecionada, setRepresentadaSelecionada] =
    useState("all")
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")
  const [ultimaAtualizacao, setUltimaAtualizacao] =
    useState<Date | null>(null)
  const [hoje, setHoje] = useState(() => new Date())

  const carregarVendas = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true)
      setErro(null)

      const resposta = await fetch("/api/vendas", {
        cache: "no-store",
      })

      const dados: unknown = await resposta.json().catch(() => null)

      if (!resposta.ok) {
        throw new Error("Falha na consulta de vendas.")
      }

      if (!Array.isArray(dados)) {
        throw new Error("Formato inesperado na resposta de vendas.")
      }

      setVendas(dados as VendaDashboard[])
      setDadosCarregados(true)
      setUltimaAtualizacao(new Date())
      setHoje(new Date())
    } catch (falha) {
      console.error("Erro ao carregar Dashboard:", falha)
      setErro(
        "Não foi possível atualizar os dados reais de vendas. " +
        "Verifique a conexão antes de interpretar os indicadores."
      )
    } finally {
      if (!silencioso) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarVendas()

    const intervalo = window.setInterval(() => {
      void carregarVendas(true)
    }, 30000)

    return () => window.clearInterval(intervalo)
  }, [carregarVendas])

  const vendasValidas = useMemo(
    () => vendas.filter((v) => v.status !== "Cancelado"),
    [vendas]
  )

  const totalGeral = useMemo(
    () => resumir(vendasValidas),
    [vendasValidas]
  )

  const vendasMesAtual = useMemo(
    () => vendasValidas.filter((venda) => {
      const data = dataVenda(venda)
      return !!data &&
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth()
    }),
    [vendasValidas, hoje]
  )

  const resumoMesAtual = useMemo(
    () => resumir(vendasMesAtual),
    [vendasMesAtual]
  )

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>([hoje.getFullYear()])

    vendas.forEach((venda) => {
      const data = dataVenda(venda)
      if (data) anos.add(data.getFullYear())
    })

    return [...anos].sort((a, b) => b - a)
  }, [vendas, hoje])

  const representadasDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>()

    vendas.forEach((venda) => {
      if (venda.representada?.id) {
        mapa.set(venda.representada.id, venda.representada.nome)
      }
    })

    return [...mapa.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [vendas])

  const intervaloSelecionado = useMemo(
    () => periodoDatas(
      periodoSelecionado,
      anoSelecionado,
      dataInicial,
      dataFinal,
      hoje
    ),
    [
      periodoSelecionado,
      anoSelecionado,
      dataInicial,
      dataFinal,
      hoje,
    ]
  )

  const periodoInvalido =
    periodoSelecionado === "personalizado" &&
    !!dataInicial &&
    !!dataFinal &&
    dataInicial > dataFinal

  const vendasPeriodo = useMemo(() => {
    if (periodoInvalido) return []

    return vendasValidas.filter((venda) => {
      if (
        representadaSelecionada !== "all" &&
        venda.representada?.id !== representadaSelecionada
      ) {
        return false
      }

      return noIntervalo(
        venda,
        intervaloSelecionado.inicio,
        intervaloSelecionado.fim
      )
    })
  }, [
    vendasValidas,
    representadaSelecionada,
    intervaloSelecionado,
    periodoInvalido,
  ])

  const resumoPeriodo = useMemo(
    () => resumir(vendasPeriodo),
    [vendasPeriodo]
  )

  const descricaoFiltro = textoPeriodo(
    periodoSelecionado,
    anoSelecionado,
    dataInicial,
    dataFinal
  )

  const resumoRepresentadas = useMemo<ResumoRepresentada[]>(() => {
    const mapa = new Map<string, ResumoRepresentada>()

    vendasPeriodo.forEach((venda) => {
      if (!venda.representada?.id) return

      const id = venda.representada.id
      const valor = Number(venda.valorTotal || 0)
      const previsao = comissaoRegistrada(venda)

      const atual = mapa.get(id)

      if (atual) {
        atual.vendas += valor
        atual.pedidos++
        atual.comissao += previsao ?? 0
        if (previsao === null) atual.comissoesAConferir++
      } else {
        mapa.set(id, {
          id,
          nome: venda.representada.nome,
          vendas: valor,
          pedidos: 1,
          comissao: previsao ?? 0,
          comissoesAConferir: previsao === null ? 1 : 0,
          participacao: 0,
        })
      }
    })

    return [...mapa.values()]
      .map((item) => ({
        ...item,
        participacao: resumoPeriodo.valor > 0
          ? item.vendas / resumoPeriodo.valor * 100
          : 0,
      }))
      .sort((a, b) => b.vendas - a.vendas)
  }, [vendasPeriodo, resumoPeriodo.valor])

  const resumoMensal = useMemo<ResumoMes[]>(() => {
    const meses: ResumoMes[] = MESES.map((nome, numero) => ({
      nome,
      numero,
      curto: CURTOS[numero],
      vendas: 0,
      pedidos: 0,
      ticketMedio: 0,
      comissao: 0,
      comissoesAConferir: 0,
    }))

    vendasValidas.forEach((venda) => {
      const data = dataVenda(venda)

      if (!data || data.getFullYear() !== anoSelecionado) return

      if (
        representadaSelecionada !== "all" &&
        venda.representada?.id !== representadaSelecionada
      ) {
        return
      }

      const mes = meses[data.getMonth()]
      mes.vendas += Number(venda.valorTotal || 0)
      mes.pedidos++

      const previsao = comissaoRegistrada(venda)
      mes.comissao += previsao ?? 0

      if (previsao === null) mes.comissoesAConferir++
    })

    meses.forEach((mes) => {
      mes.ticketMedio = mes.pedidos
        ? mes.vendas / mes.pedidos
        : 0
    })

    return meses
  }, [vendasValidas, anoSelecionado, representadaSelecionada])

  const distribuicao = useMemo(
    () => resumoRepresentadas.map((item, indice) => ({
      ...item,
      cor: CORES_GRAFICO[indice % CORES_GRAFICO.length],
    })),
    [resumoRepresentadas]
  )

  const dadosSituacao = [
    {
      nome: "Faturadas",
      valor: resumoPeriodo.faturadas,
      cor: CORES.verde,
    },
    {
      nome: "Não faturadas",
      valor: resumoPeriodo.naoFaturadas,
      cor: CORES.laranja,
    },
  ].filter((item) => item.valor > 0)

  const metaExibicao: string =
    META_ESCRITORIO === null
      ? "Não configurada"
      : moeda(META_ESCRITORIO)

  const possuiDados = dadosCarregados && !carregando
  const dadosConfiaveis = possuiDados && !erro

  return (
    <div className="min-w-0 bg-slate-50/40">
      <div className="mx-auto max-w-[1800px] space-y-4 p-4 lg:p-6">
        <NavigationButtons backLabel="Voltar para Home" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[#F58220]" />
              <h1 className="text-2xl font-bold tracking-tight text-[#0A2847]">
                Painel Gerencial
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Luiz Sodré Representações · Vendas e desempenho comercial
            </p>
            {ultimaAtualizacao && (
              <p className="mt-1 text-xs text-muted-foreground">
                Última atualização:{" "}
                {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void carregarVendas()}
              disabled={carregando}
            >
              <RefreshCw className={
                `mr-2 h-4 w-4 ${carregando ? "animate-spin" : ""}`
              } />
              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportarCSV(vendasPeriodo)}
              disabled={!dadosConfiaveis || !vendasPeriodo.length || periodoInvalido}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {erro && (
          <div className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              {erro}
              {dadosCarregados &&
                " Os números anteriores foram mantidos apenas para consulta e podem estar desatualizados."}
            </span>
          </div>
        )}

        {carregando ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-14">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando dados reais do CRM...
            </CardContent>
          </Card>
        ) : !dadosCarregados ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Dados indisponíveis. Utilize Atualizar para tentar novamente.
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-[#0A2847]">
                    <BarChart3 className="h-5 w-5 text-[#F58220]" />
                    Visão Geral da Empresa
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Acumulado histórico registrado, sem vendas canceladas.
                    Não muda com os filtros abaixo.
                  </p>
                </div>
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-[#0A2847]">
                  Histórico geral
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Indicador
                  titulo="Vendas gerais"
                  valor={moeda(totalGeral.valor)}
                  detalhe={`${totalGeral.pedidos} pedidos registrados`}
                  icone={BarChart3}
                  destaque
                />
                <Indicador
                  titulo="Vendido no mês atual"
                  valor={moeda(resumoMesAtual.valor)}
                  detalhe={`${resumoMesAtual.pedidos} pedidos no mês`}
                  icone={CalendarDays}
                />
                <Indicador
                  titulo="Clientes com vendas"
                  valor={String(totalGeral.clientes)}
                  detalhe="Clientes distintos no histórico"
                  icone={Users}
                />
                <Indicador
                  titulo="Comissão prevista geral"
                  valor={moeda(totalGeral.comissao)}
                  detalhe={
                    totalGeral.conferir > 0
                      ? `${totalGeral.conferir} venda(s) a conferir`
                      : "Previsões registradas, não auditadas"
                  }
                  icone={CircleDollarSign}
                />
              </div>
            </section>

            <Card className="border-[#0A2847]/10 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#0A2847]">
                    Análise por período
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {descricaoFiltro}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Período</label>
                    <Select
                      value={periodoSelecionado}
                      onValueChange={(valor) =>
                        setPeriodoSelecionado(valor as PeriodoDashboard)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mes-atual">Mês atual</SelectItem>
                        <SelectItem value="mes-anterior">Mês anterior</SelectItem>
                        <SelectItem value="ultimos-3-meses">
                          Últimos 3 meses
                        </SelectItem>
                        <SelectItem value="ano">Ano selecionado</SelectItem>
                        <SelectItem value="todo-historico">
                          Todo o histórico
                        </SelectItem>
                        <SelectItem value="personalizado">
                          Personalizado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Ano para análise mensal e anual
                    </label>
                    <Select
                      value={String(anoSelecionado)}
                      onValueChange={(valor) =>
                        setAnoSelecionado(Number(valor))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {anosDisponiveis.map((ano) => (
                          <SelectItem key={ano} value={String(ano)}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Representada
                    </label>
                    <Select
                      value={representadaSelecionada}
                      onValueChange={setRepresentadaSelecionada}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas as Representadas
                        </SelectItem>
                        {representadasDisponiveis.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {periodoSelecionado === "personalizado" && (
                  <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">
                        Data inicial
                      </label>
                      <input
                        type="date"
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">
                        Data final
                      </label>
                      <input
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                  </div>
                )}

                {periodoInvalido && (
                  <p className="mt-2 text-sm font-medium text-red-700">
                    A data inicial não pode ser posterior à data final.
                  </p>
                )}
              </CardContent>
            </Card>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-[#0A2847]">
                  Indicadores do período selecionado
                </h2>
                <p className="text-xs text-muted-foreground">
                  Estes indicadores respondem aos filtros.
                  Vendas canceladas são excluídas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
                <Indicador
                  titulo="Vendas no período"
                  valor={moeda(resumoPeriodo.valor)}
                  detalhe={descricaoFiltro}
                  icone={BarChart3}
                />
                <Indicador
                  titulo="Pedidos"
                  valor={String(resumoPeriodo.pedidos)}
                  detalhe="Vendas consideradas"
                  icone={TrendingUp}
                />
                <Indicador
                  titulo="Ticket médio"
                  valor={moeda(resumoPeriodo.ticket)}
                  detalhe="Média por pedido"
                  icone={Wallet}
                />
                <Indicador
                  titulo="Faturadas"
                  valor={moeda(resumoPeriodo.faturadas)}
                  detalhe="Status atual da Venda"
                  icone={CircleDollarSign}
                />
                <Indicador
                  titulo="Não faturadas"
                  valor={moeda(resumoPeriodo.naoFaturadas)}
                  detalhe="Status diferente de Faturado"
                  icone={AlertCircle}
                />
                <Indicador
                  titulo="Meta do escritório"
                  valor={metaExibicao}
                  detalhe="Aguardando definição real"
                  icone={Target}
                />
              </div>
            </section>

            {resumoPeriodo.conferir > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-semibold">
                  {resumoPeriodo.conferir} venda(s) com comissão prevista
                  ausente, zerada ou inválida.
                </p>
                <p className="mt-1 text-xs">
                  O total de comissões é parcial e não auditado.
                  Nenhum recálculo histórico foi realizado.
                </p>
                <Link
                  href="/comissoes"
                  className="mt-2 inline-block text-xs font-semibold underline"
                >
                  Abrir conferência de comissões
                </Link>
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-5">
              <Card className="min-w-0 shadow-sm xl:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0A2847]">
                    Evolução das Vendas · {anoSelecionado}
                  </CardTitle>
                  <CardDescription>
                    Valores registrados por mês no ano selecionado,
                    respeitando o filtro de Representada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={resumoMensal}
                        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E2E8F0"
                        />
                        <XAxis
                          dataKey="curto"
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tickFormatter={moedaCurta}
                          tick={{ fontSize: 10 }}
                          width={55}
                        />
                        <Tooltip
                          formatter={(valor: number) => [
                            moeda(Number(valor)),
                            "Vendas",
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="vendas"
                          stroke={CORES.laranja}
                          strokeWidth={3}
                          dot={{ r: 3, fill: CORES.azul }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-0 shadow-sm xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0A2847]">
                    Situação das Vendas
                  </CardTitle>
                  <CardDescription>
                    Distribuição por valor no período filtrado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dadosSituacao.length === 0 ? (
                    <SemDados mensagem="Sem valores para representar." />
                  ) : (
                    <>
                      <div className="relative h-[190px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dadosSituacao}
                              dataKey="valor"
                              nameKey="nome"
                              cx="50%"
                              cy="50%"
                              innerRadius={58}
                              outerRadius={83}
                              paddingAngle={2}
                              strokeWidth={0}
                            >
                              {dadosSituacao.map((item) => (
                                <Cell key={item.nome} fill={item.cor} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(valor: number) =>
                                moeda(Number(valor))
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            Pedidos
                          </span>
                          <span className="text-2xl font-bold text-[#0A2847]">
                            {resumoPeriodo.pedidos}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-2 text-xs">
                        {dadosSituacao.map((item) => (
                          <div
                            key={item.nome}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: item.cor }}
                              />
                              {item.nome}
                            </span>
                            <strong>{moeda(item.valor)}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <Link
                    href="/faturamentos"
                    className="mt-3 inline-block text-xs font-medium text-blue-700 hover:underline"
                  >
                    Abrir Faturamentos
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="representadas">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="representadas" className="text-xs sm:text-sm">
                  Representadas
                </TabsTrigger>
                <TabsTrigger value="mensal" className="text-xs sm:text-sm">
                  Análise mensal
                </TabsTrigger>
                <TabsTrigger value="comercial" className="text-xs sm:text-sm">
                  Resumo comercial
                </TabsTrigger>
              </TabsList>

              <TabsContent value="representadas" className="mt-4 space-y-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <Card className="min-w-0">
                    <CardHeader>
                      <CardTitle className="text-base text-[#0A2847]">
                        Participação por Representada
                      </CardTitle>
                      <CardDescription>
                        Participação nas vendas do período filtrado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!distribuicao.length ? (
                        <SemDados mensagem="Nenhuma venda no período." />
                      ) : (
                        <div className="space-y-3">
                          <div className="h-[230px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={distribuicao}
                                  dataKey="vendas"
                                  nameKey="nome"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={48}
                                  outerRadius={90}
                                  strokeWidth={1}
                                >
                                  {distribuicao.map((item) => (
                                    <Cell
                                      key={item.id}
                                      fill={item.cor}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(valor: number) =>
                                    moeda(Number(valor))
                                  }
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
                            {distribuicao.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.cor }}
                                  />
                                  <span className="truncate">{item.nome}</span>
                                </span>
                                <strong>{percentual(item.participacao)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="min-w-0">
                    <CardHeader>
                      <CardTitle className="text-base text-[#0A2847]">
                        Ranking de Vendas
                      </CardTitle>
                      <CardDescription>
                        Valores por Representada no período selecionado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!resumoRepresentadas.length ? (
                        <SemDados mensagem="Nenhuma Representada com vendas no período." />
                      ) : (
                        <div className="max-h-[475px] space-y-3 overflow-y-auto pr-1">
                          {resumoRepresentadas.map((item, indice) => (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="min-w-0 truncate font-medium">
                                  {indice + 1}. {item.nome}
                                </span>
                                <strong className="shrink-0">
                                  {moeda(item.vendas)}
                                </strong>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-[#F58220]"
                                  style={{
                                    width: `${
                                      resumoRepresentadas[0].vendas > 0
                                        ? Math.min(
                                            100,
                                            item.vendas /
                                              resumoRepresentadas[0].vendas * 100
                                          )
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>{item.pedidos} pedidos</span>
                                <span>{percentual(item.participacao)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Desempenho Detalhado por Representada
                    </CardTitle>
                    <CardDescription>
                      Vendas, pedidos, previsão de comissão e participação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!resumoRepresentadas.length ? (
                      <SemDados mensagem="Não há vendas para os filtros selecionados." />
                    ) : (
                      <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[850px] text-left text-xs">
                          <thead className="bg-slate-100 text-[#0A2847]">
                            <tr>
                              <th className="p-3">Representada</th>
                              <th className="p-3 text-right">Vendas</th>
                              <th className="p-3 text-right">Pedidos</th>
                              <th className="p-3 text-right">Participação</th>
                              <th className="p-3 text-right">Comissão prevista</th>
                              <th className="p-3 text-right">Conferência</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resumoRepresentadas.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="p-3 font-medium">
                                  <Link
                                    href={`/representadas/${item.id}`}
                                    className="text-blue-700 hover:underline"
                                  >
                                    {item.nome}
                                  </Link>
                                </td>
                                <td className="p-3 text-right">
                                  {moeda(item.vendas)}
                                </td>
                                <td className="p-3 text-right">{item.pedidos}</td>
                                <td className="p-3 text-right">
                                  {percentual(item.participacao)}
                                </td>
                                <td className="p-3 text-right">
                                  {moeda(item.comissao)}
                                </td>
                                <td className="p-3 text-right">
                                  {item.comissoesAConferir > 0 ? (
                                    <span className="font-semibold text-amber-700">
                                      {item.comissoesAConferir} a conferir
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      As metas individuais ainda não estão configuradas.
                      Os valores de comissão registrados não foram auditados.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mensal" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-[#0A2847]">
                      Comparativo Mensal · {anoSelecionado}
                    </CardTitle>
                    <CardDescription>
                      Vendas registradas e número de pedidos por mês.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[275px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resumoMensal}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="curto" tick={{ fontSize: 11 }} />
                          <YAxis
                            tickFormatter={moedaCurta}
                            tick={{ fontSize: 10 }}
                            width={55}
                          />
                          <Tooltip
                            formatter={(valor: number) => [
                              moeda(Number(valor)),
                              "Vendas",
                            ]}
                          />
                          <Bar
                            dataKey="vendas"
                            fill={CORES.azul}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={45}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Demonstrativo Mensal
                    </CardTitle>
                    <CardDescription>
                      Histórico do ano selecionado, com meta não configurada.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full min-w-[850px] text-left text-xs">
                        <thead className="bg-slate-100 text-[#0A2847]">
                          <tr>
                            <th className="p-3">Mês</th>
                            <th className="p-3">Meta</th>
                            <th className="p-3 text-right">Vendas</th>
                            <th className="p-3 text-right">Pedidos</th>
                            <th className="p-3 text-right">Ticket médio</th>
                            <th className="p-3 text-right">Comissão</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumoMensal.map((mes) => (
                            <tr key={mes.numero} className="border-t">
                              <td className="p-3 font-medium">{mes.nome}</td>
                              <td className="p-3 text-muted-foreground">—</td>
                              <td className="p-3 text-right">
                                {moeda(mes.vendas)}
                              </td>
                              <td className="p-3 text-right">
                                {mes.pedidos}
                              </td>
                              <td className="p-3 text-right">
                                {moeda(mes.ticketMedio)}
                              </td>
                              <td className="p-3 text-right">
                                {moeda(mes.comissao)}
                                {mes.comissoesAConferir > 0 && (
                                  <p className="text-amber-700">
                                    {mes.comissoesAConferir} a conferir
                                  </p>
                                )}
                              </td>
                              <td className="p-3">
                                {mes.pedidos
                                  ? "Vendas registradas"
                                  : "Sem vendas"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comercial" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-[#0A2847]">
                      Consolidação Comercial
                    </CardTitle>
                    <CardDescription>
                      Situação das vendas no período selecionado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Indicador
                        titulo="Comissão prevista"
                        valor={moeda(resumoPeriodo.comissao)}
                        detalhe="Registrada, não auditada"
                        icone={CircleDollarSign}
                      />
                      <Indicador
                        titulo="Clientes com vendas"
                        valor={String(resumoPeriodo.clientes)}
                        detalhe="Clientes distintos no período"
                        icone={Users}
                      />
                      <Indicador
                        titulo="A conferir"
                        valor={String(resumoPeriodo.conferir)}
                        detalhe="Vendas com previsão inconsistente"
                        icone={AlertCircle}
                      />
                      <Indicador
                        titulo="Total de pedidos"
                        valor={String(resumoPeriodo.pedidos)}
                        detalhe={descricaoFiltro}
                        icone={BarChart3}
                      />
                    </div>

                    <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-[#0A2847]">
                        Critérios dos indicadores
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        Os indicadores utilizam as Vendas registradas no CRM,
                        excluindo status Cancelado. A comissão prevista é a
                        soma dos valores positivos já registrados, sem
                        recalcular políticas comerciais históricas.
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        O indicador de vendas não faturadas considera a
                        situação atual da Venda. Não representa uma
                        conciliação definitiva com notas fiscais, títulos
                        ou recebimentos do módulo Financeiro.
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        A definição de metas reais depende de informações
                        financeiras e comerciais formalmente cadastradas.
                        Nenhuma meta fictícia é utilizada.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs">
                      <Link
                        href="/faturamentos"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        Abrir Faturamentos
                      </Link>
                      <Link
                        href="/comissoes"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        Abrir Comissões
                      </Link>
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