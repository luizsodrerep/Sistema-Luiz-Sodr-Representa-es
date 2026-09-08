"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  PageLayout,
} from "@/components/page-layout"

import {
  NavigationButtons,
} from "@/components/navigation-buttons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  formatarCodigoInteracao,
} from "@/lib/interacoes/codigo"

import {
  AlertCircle,
  ArrowRight,
  Brain,
  Building2,
  CalendarClock,
  ClipboardList,
  Download,
  Factory,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
  UserSearch,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Interacao = {
  id: string
  numeroSequencial: number

  data: string
  tipo: string

  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null

  proximoContatoEm: string | null
  statusFollowUp: string

  clienteId: string | null
  representadaId: string | null

  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null

  cliente: Cliente | null
  representada: Representada | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

type FiltroSituacao =
  | "todas"
  | "vencidas"
  | "hoje"
  | "a-vencer"
  | "sem-acompanhamento"
  | "finalizadas"

type Origem = {
  tipo:
    | "Cliente"
    | "Representada"
    | "Prospecção / Lead"
    | "Registro"

  nome: string
  detalhe: string | null
  href: string | null
}

function converterData(
  valor: string | null
) {
  if (!valor) {
    return null
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data
}

function formatarDataHora(
  valor: string | null
) {
  const data =
    converterData(
      valor
    )

  if (!data) {
    return "—"
  }

  return data.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

function estaFinalizada(
  interacao: Interacao
) {
  return (
    interacao.statusFollowUp ===
    "Finalizado"
  )
}

function semAcompanhamento(
  interacao: Interacao
) {
  return (
    !estaFinalizada(
      interacao
    ) &&
    (
      interacao.statusFollowUp ===
        "Sem acompanhamento" ||
      !interacao.proximoContatoEm
    )
  )
}

function mesmaData(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  )
}

function estaVencida(
  interacao: Interacao
) {
  if (
    estaFinalizada(
      interacao
    ) ||
    semAcompanhamento(
      interacao
    )
  ) {
    return false
  }

  const data =
    converterData(
      interacao.proximoContatoEm
    )

  if (!data) {
    return false
  }

  return (
    data.getTime() <
    Date.now()
  )
}

function venceHoje(
  interacao: Interacao
) {
  if (
    estaFinalizada(
      interacao
    ) ||
    semAcompanhamento(
      interacao
    )
  ) {
    return false
  }

  const data =
    converterData(
      interacao.proximoContatoEm
    )

  if (!data) {
    return false
  }

  return (
    mesmaData(
      data,
      new Date()
    ) &&
    data.getTime() >=
      Date.now()
  )
}

function estaAVencer(
  interacao: Interacao
) {
  if (
    estaFinalizada(
      interacao
    ) ||
    semAcompanhamento(
      interacao
    )
  ) {
    return false
  }

  const data =
    converterData(
      interacao.proximoContatoEm
    )

  if (!data) {
    return false
  }

  return (
    data.getTime() >
      Date.now() &&
    !mesmaData(
      data,
      new Date()
    )
  )
}

function obterOrigem(
  interacao: Interacao
): Origem {
  if (
    interacao.cliente
  ) {
    return {
      tipo:
        "Cliente",

      nome:
        interacao.cliente
          .nomeFantasia ||
        interacao.cliente
          .razaoSocial,

      detalhe: null,

      href:
        `/clientes/${interacao.cliente.id}`,
    }
  }

  if (
    interacao.representada
  ) {
    return {
      tipo:
        "Representada",

      nome:
        interacao
          .representada
          .nome,

      detalhe:
        interacao
          .representada
          .cnpj,

      href:
        `/representadas/${interacao.representada.id}`,
    }
  }

  if (
    interacao.nomeProspect ||
    interacao.empresaProspect ||
    interacao.origemProspeccao
  ) {
    const detalhes =
      [
        interacao.nomeProspect &&
        interacao.empresaProspect
          ? interacao.nomeProspect
          : null,

        interacao.origemProspeccao
          ? `Origem: ${interacao.origemProspeccao}`
          : null,
      ].filter(Boolean)

    return {
      tipo:
        "Prospecção / Lead",

      nome:
        interacao.empresaProspect ||
        interacao.nomeProspect ||
        "Prospecção sem identificação",

      detalhe:
        detalhes.length > 0
          ? detalhes.join(
              " • "
            )
          : null,

      href: null,
    }
  }

  return {
    tipo:
      "Registro",

    nome:
      "Origem não disponível",

    detalhe: null,
    href: null,
  }
}

function nomeSituacao(
  interacao: Interacao
) {
  if (
    estaFinalizada(
      interacao
    )
  ) {
    return "Finalizada"
  }

  if (
    estaVencida(
      interacao
    )
  ) {
    return "Vencida"
  }

  if (
    venceHoje(
      interacao
    )
  ) {
    return "Hoje"
  }

  if (
    estaAVencer(
      interacao
    )
  ) {
    return "A vencer"
  }

  return (
    "Sem acompanhamento"
  )
}

function classeSituacao(
  interacao: Interacao
) {
  if (
    estaFinalizada(
      interacao
    )
  ) {
    return (
      "bg-emerald-100 text-emerald-800"
    )
  }

  if (
    estaVencida(
      interacao
    )
  ) {
    return (
      "bg-red-100 text-red-800"
    )
  }

  if (
    venceHoje(
      interacao
    )
  ) {
    return (
      "bg-amber-100 text-amber-800"
    )
  }

  if (
    estaAVencer(
      interacao
    )
  ) {
    return (
      "bg-blue-100 text-blue-800"
    )
  }

  return (
    "bg-slate-100 text-slate-700"
  )
}

function correspondeSituacao(
  interacao: Interacao,
  filtro: FiltroSituacao
) {
  switch (
    filtro
  ) {
    case "vencidas":
      return estaVencida(
        interacao
      )

    case "hoje":
      return venceHoje(
        interacao
      )

    case "a-vencer":
      return estaAVencer(
        interacao
      )

    case "sem-acompanhamento":
      return semAcompanhamento(
        interacao
      )

    case "finalizadas":
      return estaFinalizada(
        interacao
      )

    default:
      return true
  }
}

function iconeTipo(
  tipo: string
) {
  switch (
    tipo
  ) {
    case "WhatsApp":
      return (
        <MessageSquare className="h-4 w-4 text-green-600" />
      )

    case "E-mail":
      return (
        <Mail className="h-4 w-4 text-blue-600" />
      )

    case "Ligação":
      return (
        <Phone className="h-4 w-4 text-purple-600" />
      )

    case "Visita":
      return (
        <User className="h-4 w-4 text-orange-600" />
      )

    default:
      return (
        <ClipboardList className="h-4 w-4 text-slate-600" />
      )
  }
}

function IconeOrigem({
  tipo,
}: {
  tipo: Origem["tipo"]
}) {
  switch (
    tipo
  ) {
    case "Cliente":
      return (
        <Building2 className="h-4 w-4" />
      )

    case "Representada":
      return (
        <Factory className="h-4 w-4" />
      )

    case "Prospecção / Lead":
      return (
        <UserSearch className="h-4 w-4" />
      )

    default:
      return (
        <ClipboardList className="h-4 w-4" />
      )
  }
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

export default function InteracoesAIPage() {
  const [
    interacoes,
    setInteracoes,
  ] =
    useState<Interacao[]>(
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
    busca,
    setBusca,
  ] =
    useState("")

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState("todos")

  const [
    filtroSituacao,
    setFiltroSituacao,
  ] =
    useState<FiltroSituacao>(
      "todas"
    )

  const carregarInteracoes =
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
          const response =
            await fetch(
              "/api/interacoes",
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            const erroApi =
              await response
                .json()
                .catch(
                  () =>
                    null
                )

            throw new Error(
              erroApi?.message ||
                "Não foi possível carregar as interações."
            )
          }

          const data =
            await response.json()

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Resposta inválida da API de interações."
            )
          }

          setInteracoes(
            data
          )
        } catch (
          error
        ) {
          console.error(
            "Erro ao carregar análise de interações:",
            error
          )

          setErro(
            error instanceof
              Error
              ? error.message
              : "Erro ao carregar as interações."
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
    carregarInteracoes()
  }, [
    carregarInteracoes,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarInteracoes(
            true
          )
        },
        30000
      )

    return () =>
      window.clearInterval(
        intervalo
      )
  }, [
    carregarInteracoes,
  ])

  const tipos =
    useMemo(() => {
      return Array.from(
        new Set(
          interacoes.map(
            (
              interacao
            ) =>
              interacao.tipo
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
      interacoes,
    ])

  const contadores =
    useMemo(() => {
      return {
        total:
          interacoes.length,

        vencidas:
          interacoes.filter(
            estaVencida
          ).length,

        hoje:
          interacoes.filter(
            venceHoje
          ).length,

        aVencer:
          interacoes.filter(
            estaAVencer
          ).length,

        semAcompanhamento:
          interacoes.filter(
            semAcompanhamento
          ).length,
      }
    }, [
      interacoes,
    ])

  const interacoesFiltradas =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase()

      return interacoes.filter(
        (
          interacao
        ) => {
          if (
            filtroTipo !==
              "todos" &&
            interacao.tipo !==
              filtroTipo
          ) {
            return false
          }

          if (
            !correspondeSituacao(
              interacao,
              filtroSituacao
            )
          ) {
            return false
          }

          if (
            !termo
          ) {
            return true
          }

          const origem =
            obterOrigem(
              interacao
            )

          const campos =
            [
              formatarCodigoInteracao(
                interacao.numeroSequencial
              ),

              String(
                interacao.numeroSequencial
              ),

              origem.tipo,
              origem.nome,
              origem.detalhe,

              interacao.tipo,
              interacao.assunto,
              interacao.descricao,
              interacao.resultado,
              interacao.proximosPasso,
              interacao.statusFollowUp,

              interacao.criadoPor
                ?.nome,

              interacao.responsavel
                ?.nome,
            ]

          return campos.some(
            (
              campo
            ) =>
              campo
                ?.toLowerCase()
                .includes(
                  termo
                )
          )
        }
      )
    }, [
      busca,
      filtroSituacao,
      filtroTipo,
      interacoes,
    ])

  function exportarCsv() {
    const cabecalho =
      [
        "Código",
        "Data",
        "Tipo",
        "Origem",
        "Relacionado a",
        "Assunto",
        "Descrição",
        "Resultado",
        "Próximo passo",
        "Próximo contato",
        "Situação",
        "Responsável",
      ]

    const linhas =
      interacoesFiltradas.map(
        (
          interacao
        ) => {
          const origem =
            obterOrigem(
              interacao
            )

          return [
            formatarCodigoInteracao(
              interacao.numeroSequencial
            ),

            formatarDataHora(
              interacao.data
            ),

            interacao.tipo,

            origem.tipo,

            origem.nome,

            interacao.assunto,

            interacao.descricao,

            interacao.resultado,

            interacao.proximosPasso,

            formatarDataHora(
              interacao.proximoContatoEm
            ),

            nomeSituacao(
              interacao
            ),

            interacao.responsavel
              ?.nome ||
              interacao.criadoPor
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
      `interacoes-${new Date()
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
      <PageLayout title="Interações — Análise">
        <NavigationButtons />

        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando interações reais...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Interações — Análise">
      <NavigationButtons />

      <div className="space-y-6">

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-3">
                <Brain className="mt-1 h-6 w-6 text-blue-700" />

                <div>
                  <div className="font-semibold">
                    Análise Operacional das Interações
                  </div>

                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    Esta tela utiliza somente registros reais do CRM.
                    Não há classificação artificial de sentimento nem
                    recomendações fictícias. Assistentes inteligentes poderão
                    ser incorporados futuramente de forma controlada.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">

                <Button
                  variant="outline"
                  onClick={() =>
                    carregarInteracoes(
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
                    exportarCsv
                  }
                  disabled={
                    interacoesFiltradas.length ===
                    0
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
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
              <CardDescription>
                Interações
              </CardDescription>

              <CardTitle className="text-3xl">
                {contadores.total}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardDescription>
                Vencidas
              </CardDescription>

              <CardTitle className="text-3xl text-red-700">
                {contadores.vencidas}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardDescription>
                Para hoje
              </CardDescription>

              <CardTitle className="text-3xl text-amber-700">
                {contadores.hoje}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription>
                A vencer
              </CardDescription>

              <CardTitle className="text-3xl text-blue-700">
                {contadores.aVencer}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                Sem acompanhamento
              </CardDescription>

              <CardTitle className="text-3xl">
                {contadores.semAcompanhamento}
              </CardTitle>
            </CardHeader>
          </Card>

        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Consulta das Interações
            </CardTitle>

            <CardDescription>
              Busca e análise dos registros comerciais existentes.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  value={
                    busca
                  }
                  onChange={(
                    event
                  ) =>
                    setBusca(
                      event.target.value
                    )
                  }
                  className="pl-9"
                  placeholder="Buscar cliente, representada, prospect, código, assunto..."
                />
              </div>

              <Select
                value={
                  filtroTipo
                }
                onValueChange={
                  setFiltroTipo
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">
                    Todos os tipos
                  </SelectItem>

                  {tipos.map(
                    (
                      tipo
                    ) => (
                      <SelectItem
                        key={
                          tipo
                        }
                        value={
                          tipo
                        }
                      >
                        {tipo}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Select
                value={
                  filtroSituacao
                }
                onValueChange={(
                  valor
                ) =>
                  setFiltroSituacao(
                    valor as FiltroSituacao
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todas">
                    Todas as situações
                  </SelectItem>

                  <SelectItem value="vencidas">
                    Vencidas
                  </SelectItem>

                  <SelectItem value="hoje">
                    Para hoje
                  </SelectItem>

                  <SelectItem value="a-vencer">
                    A vencer
                  </SelectItem>

                  <SelectItem value="sem-acompanhamento">
                    Sem acompanhamento
                  </SelectItem>

                  <SelectItem value="finalizadas">
                    Finalizadas
                  </SelectItem>
                </SelectContent>
              </Select>

            </div>

            <div className="text-sm text-muted-foreground">
              {interacoesFiltradas.length} registro(s) encontrado(s)
            </div>

            {interacoesFiltradas.length ===
            0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                Nenhuma interação encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="space-y-3">

                {interacoesFiltradas.map(
                  (
                    interacao
                  ) => {
                    const origem =
                      obterOrigem(
                        interacao
                      )

                    return (
                      <Card
                        key={
                          interacao.id
                        }
                      >
                        <CardContent className="p-4">

                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <Link
                                  href={`/interacoes/${interacao.id}`}
                                  className="font-mono text-sm font-semibold hover:underline"
                                >
                                  {formatarCodigoInteracao(
                                    interacao.numeroSequencial
                                  )}
                                </Link>

                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                                  {iconeTipo(
                                    interacao.tipo
                                  )}

                                  {interacao.tipo}
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs">
                                  <IconeOrigem
                                    tipo={
                                      origem.tipo
                                    }
                                  />

                                  {origem.tipo}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${classeSituacao(
                                    interacao
                                  )}`}
                                >
                                  {nomeSituacao(
                                    interacao
                                  )}
                                </span>

                              </div>

                              <div className="mt-3 text-lg font-semibold">
                                {interacao.assunto ||
                                  origem.nome}
                              </div>

                              <div className="mt-1 text-sm text-muted-foreground">
                                {origem.href ? (
                                  <Link
                                    href={
                                      origem.href
                                    }
                                    className="font-medium text-foreground hover:underline"
                                  >
                                    {origem.nome}
                                  </Link>
                                ) : (
                                  origem.nome
                                )}

                                {origem.detalhe
                                  ? ` • ${origem.detalhe}`
                                  : ""}
                              </div>

                              {interacao.descricao && (
                                <div className="mt-3 whitespace-pre-wrap text-sm">
                                  {interacao.descricao}
                                </div>
                              )}

                              {interacao.resultado && (
                                <div className="mt-3 text-sm">
                                  <span className="font-medium">
                                    Resultado:
                                  </span>{" "}
                                  {interacao.resultado}
                                </div>
                              )}

                              {interacao.proximosPasso && (
                                <div className="mt-2 text-sm">
                                  <span className="font-medium">
                                    Próximo passo:
                                  </span>{" "}
                                  {interacao.proximosPasso}
                                </div>
                              )}

                              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">

                                <span className="inline-flex items-center gap-1">
                                  <CalendarClock className="h-4 w-4" />

                                  Interação:{" "}
                                  {formatarDataHora(
                                    interacao.data
                                  )}
                                </span>

                                <span>
                                  Próximo contato:{" "}
                                  {formatarDataHora(
                                    interacao.proximoContatoEm
                                  )}
                                </span>

                                <span>
                                  Responsável:{" "}
                                  {interacao.responsavel
                                    ?.nome ||
                                    interacao.criadoPor
                                      ?.nome ||
                                    "Não informado"}
                                </span>

                              </div>

                            </div>

                            <Button
                              variant="outline"
                              asChild
                            >
                              <Link
                                href={`/interacoes/${interacao.id}`}
                              >
                                Abrir registro
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>

                          </div>

                        </CardContent>
                      </Card>
                    )
                  }
                )}

              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </PageLayout>
  )
}