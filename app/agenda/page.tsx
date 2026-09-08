"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"

import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Calendar } from "@/components/ui/calendar"
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
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  ShoppingCart,
  UserRound,
  WalletCards,
} from "lucide-react"

type PrioridadeAssistente =
  | "critica"
  | "alta"
  | "normal"
  | "informativa"

type ModuloAssistente =
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "titulos"
  | "faturamentos"
  | "comissoes"
  | "redes-sociais"

type SituacaoTemporal =
  | "atrasado"
  | "hoje"
  | "proximos"
  | "futuro"
  | "sem-data"

type Visualizacao = "mes" | "semana" | "dia"

interface PendenciaAssistente {
  id: string
  modulo: ModuloAssistente
  entidadeId: string
  codigo: string | null
  titulo: string
  descricao: string
  relacionadoA: string | null
  responsavel: string | null
  dataReferencia: string | null
  situacaoTemporal: SituacaoTemporal
  prioridade: PrioridadeAssistente
  status: string | null
  href: string
  origem: string | null
}

interface RespostaAssistente {
  usuario: {
    id: string
    perfil: string
  }
  escopo: "escritorio" | "pessoal"
  geradoEm: string
  pendencias: PendenciaAssistente[]
}

function converterData(valor: string | null) {
  if (!valor) return null

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return null
  }

  return data
}

function formatarDataHora(valor: string | null) {
  const data = converterData(valor)

  if (!data) {
    return "Sem data definida"
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function nomeModulo(modulo: ModuloAssistente) {
  switch (modulo) {
    case "interacoes":
      return "Interações"
    case "orcamentos":
      return "Orçamentos"
    case "vendas":
      return "Vendas"
    case "titulos":
      return "Títulos"
    case "faturamentos":
      return "Faturamentos"
    case "comissoes":
      return "Comissões"
    case "redes-sociais":
      return "Redes Sociais"
  }
}

function nomeSituacao(situacao: SituacaoTemporal) {
  switch (situacao) {
    case "atrasado":
      return "Atrasado"
    case "hoje":
      return "Hoje"
    case "proximos":
      return "Próximos 7 dias"
    case "futuro":
      return "Futuro"
    case "sem-data":
      return "Sem data"
  }
}

function classeSituacao(situacao: SituacaoTemporal) {
  switch (situacao) {
    case "atrasado":
      return "bg-red-100 text-red-800"
    case "hoje":
      return "bg-amber-100 text-amber-800"
    case "proximos":
      return "bg-blue-100 text-blue-800"
    case "futuro":
      return "bg-slate-100 text-slate-700"
    case "sem-data":
      return "bg-gray-100 text-gray-700"
  }
}

function classeModulo(modulo: ModuloAssistente) {
  switch (modulo) {
    case "interacoes":
      return "bg-blue-100 text-blue-800"
    case "orcamentos":
      return "bg-violet-100 text-violet-800"
    case "vendas":
      return "bg-green-100 text-green-800"
    case "titulos":
      return "bg-amber-100 text-amber-800"
    case "faturamentos":
      return "bg-cyan-100 text-cyan-800"
    case "comissoes":
      return "bg-emerald-100 text-emerald-800"
    case "redes-sociais":
      return "bg-pink-100 text-pink-800"
  }
}

function IconeModulo({ modulo }: { modulo: ModuloAssistente }) {
  switch (modulo) {
    case "interacoes":
      return <MessageSquare className="h-4 w-4" />
    case "orcamentos":
      return <FileText className="h-4 w-4" />
    case "vendas":
      return <ShoppingCart className="h-4 w-4" />
    case "titulos":
    case "comissoes":
      return <WalletCards className="h-4 w-4" />
    default:
      return <CalendarClock className="h-4 w-4" />
  }
}

function escaparCsv(valor: string | null | undefined) {
  const texto = valor ?? ""
  return `"${texto.replace(/"/g, '""')}"`
}

export default function AgendaPage() {
  const [dados, setDados] = useState<RespostaAssistente | null>(null)
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [mes, setMes] = useState(new Date())
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("mes")
  const [filtroModulo, setFiltroModulo] = useState("todos")
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos")

  const carregarAgenda = useCallback(async (silencioso = false) => {
    if (silencioso) {
      setAtualizando(true)
    } else {
      setLoading(true)
    }

    setErro(null)

    try {
      const response = await fetch("/api/meu-assistente-pessoal", {
        cache: "no-store",
      })

      if (!response.ok) {
        const respostaErro = await response.json().catch(() => null)

        throw new Error(
          respostaErro?.message ||
            "Não foi possível carregar a Agenda."
        )
      }

      const resposta = await response.json()

      if (!resposta || !Array.isArray(resposta.pendencias)) {
        throw new Error(
          "Resposta inválida do Meu Assistente Pessoal."
        )
      }

      setDados(resposta)
    } catch (error) {
      console.error("Erro ao carregar Agenda:", error)

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar a Agenda."
      )
    } finally {
      setLoading(false)
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    carregarAgenda()
  }, [carregarAgenda])

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      carregarAgenda(true)
    }, 30000)

    return () => window.clearInterval(intervalo)
  }, [carregarAgenda])

  const pendencias = useMemo(
    () => dados?.pendencias ?? [],
    [dados]
  )

  const modulosDisponiveis = useMemo(() => {
    return Array.from(
      new Set(pendencias.map((item) => item.modulo))
    ).sort((a, b) =>
      nomeModulo(a).localeCompare(nomeModulo(b), "pt-BR")
    )
  }, [pendencias])

  const responsaveisDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        pendencias
          .map((item) => item.responsavel)
          .filter((valor): valor is string => Boolean(valor))
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [pendencias])

  const pendenciasFiltradas = useMemo(() => {
    return pendencias.filter((item) => {
      if (
        filtroModulo !== "todos" &&
        item.modulo !== filtroModulo
      ) {
        return false
      }

      if (
        filtroResponsavel !== "todos" &&
        item.responsavel !== filtroResponsavel
      ) {
        return false
      }

      return true
    })
  }, [pendencias, filtroModulo, filtroResponsavel])

  const pendenciasComData = useMemo(() => {
    return pendenciasFiltradas
      .filter((item) => converterData(item.dataReferencia))
      .sort((a, b) => {
        const dataA = converterData(a.dataReferencia)
        const dataB = converterData(b.dataReferencia)

        return (
          (dataA?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (dataB?.getTime() ?? Number.MAX_SAFE_INTEGER)
        )
      })
  }, [pendenciasFiltradas])

  const pendenciasSemData = useMemo(() => {
    return pendenciasFiltradas.filter(
      (item) => !converterData(item.dataReferencia)
    )
  }, [pendenciasFiltradas])

  const diasComEvento = useMemo(() => {
    return pendenciasComData
      .map((item) => converterData(item.dataReferencia))
      .filter((data): data is Date => Boolean(data))
  }, [pendenciasComData])

  const pendenciasPeriodo = useMemo(() => {
    return pendenciasComData.filter((item) => {
      const data = converterData(item.dataReferencia)

      if (!data) return false

      if (visualizacao === "dia") {
        return isSameDay(data, dataSelecionada)
      }

      if (visualizacao === "semana") {
        return isSameWeek(data, dataSelecionada, {
          weekStartsOn: 1,
        })
      }

      return isSameMonth(data, mes)
    })
  }, [
    pendenciasComData,
    visualizacao,
    dataSelecionada,
    mes,
  ])

  const proximosCompromissos = useMemo(() => {
    const agora = new Date().getTime()

    return pendenciasComData
      .filter((item) => {
        const data = converterData(item.dataReferencia)
        return data && data.getTime() >= agora
      })
      .slice(0, 6)
  }, [pendenciasComData])

  const contadores = useMemo(() => {
    return {
      datados: pendenciasComData.length,
      atrasados: pendenciasFiltradas.filter(
        (item) => item.situacaoTemporal === "atrasado"
      ).length,
      hoje: pendenciasFiltradas.filter(
        (item) => item.situacaoTemporal === "hoje"
      ).length,
      proximos: pendenciasFiltradas.filter(
        (item) => item.situacaoTemporal === "proximos"
      ).length,
      semData: pendenciasSemData.length,
    }
  }, [
    pendenciasComData,
    pendenciasFiltradas,
    pendenciasSemData,
  ])

  const tituloPeriodo = useMemo(() => {
    if (visualizacao === "dia") {
      return format(
        dataSelecionada,
        "dd 'de' MMMM 'de' yyyy",
        { locale: ptBR }
      )
    }

    if (visualizacao === "semana") {
      return `Semana de ${format(
        dataSelecionada,
        "dd/MM/yyyy"
      )}`
    }

    return format(mes, "MMMM 'de' yyyy", {
      locale: ptBR,
    })
  }, [visualizacao, dataSelecionada, mes])

  function irHoje() {
    const hoje = new Date()
    setDataSelecionada(hoje)
    setMes(hoje)
  }

  function navegarAnterior() {
    if (visualizacao === "mes") {
      const novaData = addMonths(mes, -1)
      setMes(novaData)
      setDataSelecionada(novaData)
      return
    }

    if (visualizacao === "semana") {
      const novaData = addWeeks(dataSelecionada, -1)
      setDataSelecionada(novaData)
      setMes(novaData)
      return
    }

    const novaData = addDays(dataSelecionada, -1)
    setDataSelecionada(novaData)
    setMes(novaData)
  }

  function navegarProximo() {
    if (visualizacao === "mes") {
      const novaData = addMonths(mes, 1)
      setMes(novaData)
      setDataSelecionada(novaData)
      return
    }

    if (visualizacao === "semana") {
      const novaData = addWeeks(dataSelecionada, 1)
      setDataSelecionada(novaData)
      setMes(novaData)
      return
    }

    const novaData = addDays(dataSelecionada, 1)
    setDataSelecionada(novaData)
    setMes(novaData)
  }

  function exportarPeriodo() {
    const cabecalho = [
      "Código",
      "Data",
      "Módulo",
      "Título",
      "Descrição",
      "Relacionado a",
      "Responsável",
      "Situação",
      "Status",
    ]

    const linhas = pendenciasPeriodo.map((item) =>
      [
        item.codigo,
        formatarDataHora(item.dataReferencia),
        nomeModulo(item.modulo),
        item.titulo,
        item.descricao,
        item.relacionadoA,
        item.responsavel,
        nomeSituacao(item.situacaoTemporal),
        item.status,
      ]
        .map(escaparCsv)
        .join(";")
    )

    const csv = [
      cabecalho.map(escaparCsv).join(";"),
      ...linhas,
    ].join("\n")

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `agenda-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <PageLayout title="Agenda">
        <NavigationButtons />

        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando agenda real...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Agenda">
      <NavigationButtons />

      <div className="space-y-6">

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 h-6 w-6 text-blue-700" />

                <div>
                  <div className="font-semibold">
                    Agenda Operacional
                  </div>

                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    Esta agenda utiliza as pendências reais do Meu
                    Assistente Pessoal. Compromissos administrativos
                    pessoais serão acrescentados futuramente quando
                    fizermos a alteração estrutural do banco.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => carregarAgenda(true)}
                  disabled={atualizando}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      atualizando ? "animate-spin" : ""
                    }`}
                  />
                  Atualizar
                </Button>

                <Button
                  variant="outline"
                  onClick={exportarPeriodo}
                  disabled={pendenciasPeriodo.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar período
                </Button>

                <Button asChild>
                  <Link href="/interacoes/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Interação
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {erro && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {erro}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Compromissos datados</CardDescription>
              <CardTitle className="text-3xl">
                {contadores.datados}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardDescription>Atrasados</CardDescription>
              <CardTitle className="text-3xl text-red-700">
                {contadores.atrasados}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardDescription>Hoje</CardDescription>
              <CardTitle className="text-3xl text-amber-700">
                {contadores.hoje}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription>Próximos 7 dias</CardDescription>
              <CardTitle className="text-3xl text-blue-700">
                {contadores.proximos}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sem data</CardDescription>
              <CardTitle className="text-3xl">
                {contadores.semData}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1 text-sm font-medium">
                    Visualização
                  </div>

                  <Select
                    value={visualizacao}
                    onValueChange={(valor) =>
                      setVisualizacao(valor as Visualizacao)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="mes">Mês</SelectItem>
                      <SelectItem value="semana">Semana</SelectItem>
                      <SelectItem value="dia">Dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium">
                    Módulo
                  </div>

                  <Select
                    value={filtroModulo}
                    onValueChange={setFiltroModulo}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos
                      </SelectItem>

                      {modulosDisponiveis.map((modulo) => (
                        <SelectItem
                          key={modulo}
                          value={modulo}
                        >
                          {nomeModulo(modulo)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium">
                    Responsável
                  </div>

                  <Select
                    value={filtroResponsavel}
                    onValueChange={setFiltroResponsavel}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos
                      </SelectItem>

                      {responsaveisDisponiveis.map((responsavel) => (
                        <SelectItem
                          key={responsavel}
                          value={responsavel}
                        >
                          {responsavel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navegarAnterior}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={irHoje}
                >
                  Hoje
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={navegarProximo}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">

          <div className="space-y-6 xl:col-span-2">

            <Card>
              <CardHeader>
                <CardTitle className="capitalize">
                  {tituloPeriodo}
                </CardTitle>

                <CardDescription>
                  Dias sublinhados possuem pendências registradas.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={(novaData) => {
                    if (novaData) {
                      setDataSelecionada(novaData)
                      setMes(novaData)
                    }
                  }}
                  month={mes}
                  onMonthChange={setMes}
                  locale={ptBR}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: diasComEvento,
                  }}
                  modifiersClassNames={{
                    hasEvent:
                      "font-bold underline decoration-2 underline-offset-4",
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compromissos do período</CardTitle>
                <CardDescription>{tituloPeriodo}</CardDescription>
              </CardHeader>

              <CardContent>
                {pendenciasPeriodo.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-600" />

                    <p className="font-medium">
                      Nenhuma pendência datada neste período.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendenciasPeriodo.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block rounded-lg border p-4 transition hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap gap-2">
                              {item.codigo && (
                                <span className="font-mono text-sm font-semibold">
                                  {item.codigo}
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${classeModulo(
                                  item.modulo
                                )}`}
                              >
                                <IconeModulo modulo={item.modulo} />
                                {nomeModulo(item.modulo)}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${classeSituacao(
                                  item.situacaoTemporal
                                )}`}
                              >
                                {nomeSituacao(item.situacaoTemporal)}
                              </span>
                            </div>

                            <div className="mt-2 font-semibold">
                              {item.titulo}
                            </div>

                            {item.relacionadoA && (
                              <div className="mt-1 text-sm text-muted-foreground">
                                {item.relacionadoA}
                              </div>
                            )}

                            <div className="mt-2 whitespace-pre-wrap text-sm">
                              {item.descricao}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span>
                                {formatarDataHora(item.dataReferencia)}
                              </span>

                              {item.responsavel && (
                                <span className="inline-flex items-center gap-1">
                                  <UserRound className="h-3.5 w-3.5" />
                                  {item.responsavel}
                                </span>
                              )}
                            </div>

                          </div>

                          <ArrowRight className="h-5 w-5 text-muted-foreground" />

                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Próximos compromissos</CardTitle>
              </CardHeader>

              <CardContent>
                {proximosCompromissos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum compromisso futuro datado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {proximosCompromissos.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block border-b pb-4 last:border-0"
                      >
                        <div className="flex gap-3">
                          <div
                            className={`rounded-md p-2 ${classeModulo(
                              item.modulo
                            )}`}
                          >
                            <IconeModulo modulo={item.modulo} />
                          </div>

                          <div>
                            <div className="text-sm font-medium">
                              {item.titulo}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatarDataHora(item.dataReferencia)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pendências sem data</CardTitle>
                <CardDescription>
                  Ainda não podem ser posicionadas no calendário.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {pendenciasSemData.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Nenhuma pendência sem data.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendenciasSemData.slice(0, 6).map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="block rounded-md border p-3"
                      >
                        <div className="flex gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />

                          <div>
                            <div className="text-sm font-medium">
                              {item.titulo}
                            </div>

                            <div className="mt-1 text-xs text-muted-foreground">
                              {nomeModulo(item.modulo)}
                              {item.relacionadoA
                                ? ` • ${item.relacionadoA}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {pendenciasSemData.length > 6 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href="/meu-assistente-pessoal">
                          Ver todas no Meu Assistente
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </PageLayout>
  )
}