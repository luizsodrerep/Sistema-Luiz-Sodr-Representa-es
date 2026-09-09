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
  startOfDay,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShoppingCart,
  UserRound,
  WalletCards,
  X,
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

type ModuloAgenda =
  | ModuloAssistente
  | "tarefas"

type SituacaoTemporal =
  | "atrasado"
  | "hoje"
  | "proximos"
  | "futuro"
  | "sem-data"

type Visualizacao =
  | "mes"
  | "semana"
  | "dia"

type TipoTarefa =
  | "Tarefa"
  | "Compromisso"

type PrioridadeTarefa =
  | "Baixa"
  | "Normal"
  | "Alta"
  | "Urgente"

type StatusTarefa =
  | "Pendente"
  | "Concluida"
  | "Cancelada"

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
  escopo:
    | "escritorio"
    | "pessoal"
  geradoEm: string
  pendencias: PendenciaAssistente[]
}

interface PessoaTarefa {
  id: string
  nome: string
  perfil: string
}

interface ClienteTarefa {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
}

interface RepresentadaTarefa {
  id: string
  codigo: string | null
  nome: string
}

interface InteracaoTarefa {
  id: string
  numeroSequencial: number
  tipo: string
  assunto: string | null
}

interface TarefaApi {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  prioridade: string
  status: string
  inicioEm: string | null
  fimEm: string | null
  vencimentoEm: string | null
  concluidoEm: string | null
  canceladoEm: string | null
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
  criadoPor: PessoaTarefa | null
  responsavel: PessoaTarefa | null
  cliente: ClienteTarefa | null
  representada: RepresentadaTarefa | null
  interacao: InteracaoTarefa | null
}

interface ItemAgenda {
  id: string
  origemAgenda:
    | "assistente"
    | "tarefa"
  tarefaId: string | null
  modulo: ModuloAgenda
  entidadeId: string
  codigo: string | null
  titulo: string
  descricao: string
  relacionadoA: string | null
  responsavel: string | null
  dataReferencia: string | null
  situacaoTemporal: SituacaoTemporal
  prioridade:
    | PrioridadeAssistente
    | PrioridadeTarefa
  status: string | null
  href: string | null
  origem: string | null
  tipoTarefa: string | null
}

interface FormularioTarefa {
  titulo: string
  descricao: string
  tipo: TipoTarefa
  prioridade: PrioridadeTarefa
  inicioEm: string
  fimEm: string
  vencimentoEm: string
  observacoes: string
}

const FORMULARIO_INICIAL: FormularioTarefa = {
  titulo: "",
  descricao: "",
  tipo: "Tarefa",
  prioridade: "Normal",
  inicioEm: "",
  fimEm: "",
  vencimentoEm: "",
  observacoes: "",
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
    converterData(valor)

  if (!data) {
    return "Sem data definida"
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

function paraDatetimeLocal(
  valor: string | null
) {
  const data =
    converterData(valor)

  if (!data) {
    return ""
  }

  const local =
    new Date(
      data.getTime() -
        data.getTimezoneOffset() *
          60000
    )

  return local
    .toISOString()
    .slice(0, 16)
}

function paraIso(
  valor: string
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

  return data.toISOString()
}

function situacaoDaData(
  valor: string | null
): SituacaoTemporal {
  const data =
    converterData(valor)

  if (!data) {
    return "sem-data"
  }

  const hoje =
    startOfDay(
      new Date()
    )

  const diaItem =
    startOfDay(data)

  if (
    diaItem.getTime() <
    hoje.getTime()
  ) {
    return "atrasado"
  }

  if (
    isSameDay(
      diaItem,
      hoje
    )
  ) {
    return "hoje"
  }

  const limite =
    addDays(
      hoje,
      7
    )

  if (
    diaItem.getTime() <=
    limite.getTime()
  ) {
    return "proximos"
  }

  return "futuro"
}

function nomeModulo(
  modulo: ModuloAgenda
) {
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
    case "tarefas":
      return "Tarefas / Compromissos"
  }
}

function nomeSituacao(
  situacao: SituacaoTemporal
) {
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

function classeSituacao(
  situacao: SituacaoTemporal
) {
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

function classeModulo(
  modulo: ModuloAgenda
) {
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
    case "tarefas":
      return "bg-indigo-100 text-indigo-800"
  }
}

function classePrioridadeTarefa(
  prioridade: string
) {
  switch (prioridade) {
    case "Urgente":
      return "bg-red-100 text-red-800"
    case "Alta":
      return "bg-orange-100 text-orange-800"
    case "Baixa":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

function classeStatusTarefa(
  status: string
) {
  switch (status) {
    case "Concluida":
      return "bg-emerald-100 text-emerald-800"
    case "Cancelada":
      return "bg-slate-200 text-slate-700"
    default:
      return "bg-amber-100 text-amber-800"
  }
}

function IconeModulo({
  modulo,
}: {
  modulo: ModuloAgenda
}) {
  switch (modulo) {
    case "interacoes":
      return (
        <MessageSquare className="h-4 w-4" />
      )
    case "orcamentos":
      return (
        <FileText className="h-4 w-4" />
      )
    case "vendas":
      return (
        <ShoppingCart className="h-4 w-4" />
      )
    case "titulos":
    case "comissoes":
      return (
        <WalletCards className="h-4 w-4" />
      )
    case "tarefas":
      return (
        <ClipboardList className="h-4 w-4" />
      )
    default:
      return (
        <CalendarClock className="h-4 w-4" />
      )
  }
}

function escaparCsv(
  valor:
    | string
    | null
    | undefined
) {
  const texto =
    valor ?? ""

  return `"${texto.replace(
    /"/g,
    '""'
  )}"`
}

function relacionadoDaTarefa(
  tarefa: TarefaApi
) {
  if (tarefa.cliente) {
    return (
      tarefa.cliente.nomeFantasia ||
      tarefa.cliente.razaoSocial
    )
  }

  if (tarefa.representada) {
    return tarefa.representada.nome
  }

  if (tarefa.interacao) {
    return `Interação INT-${String(
      tarefa.interacao
        .numeroSequencial
    ).padStart(
      6,
      "0"
    )}`
  }

  return null
}

function dataReferenciaTarefa(
  tarefa: TarefaApi
) {
  if (
    tarefa.tipo ===
    "Compromisso"
  ) {
    return (
      tarefa.inicioEm ??
      tarefa.vencimentoEm
    )
  }

  return (
    tarefa.vencimentoEm ??
    tarefa.inicioEm
  )
}

export default function AgendaPage() {
  const [
    dados,
    setDados,
  ] =
    useState<RespostaAssistente | null>(
      null
    )

  const [
    tarefas,
    setTarefas,
  ] =
    useState<TarefaApi[]>(
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
    useState<string | null>(
      null
    )

  const [
    mensagem,
    setMensagem,
  ] =
    useState<string | null>(
      null
    )

  const [
    dataSelecionada,
    setDataSelecionada,
  ] =
    useState(new Date())

  const [
    mes,
    setMes,
  ] =
    useState(new Date())

  const [
    visualizacao,
    setVisualizacao,
  ] =
    useState<Visualizacao>(
      "mes"
    )

  const [
    filtroModulo,
    setFiltroModulo,
  ] =
    useState("todos")

  const [
    filtroResponsavel,
    setFiltroResponsavel,
  ] =
    useState("todos")

  const [
    formularioAberto,
    setFormularioAberto,
  ] =
    useState(false)

  const [
    tarefaEmEdicao,
    setTarefaEmEdicao,
  ] =
    useState<string | null>(
      null
    )

  const [
    formulario,
    setFormulario,
  ] =
    useState<FormularioTarefa>(
      FORMULARIO_INICIAL
    )

  const [
    salvando,
    setSalvando,
  ] =
    useState(false)

  const [
    tarefaEmAcao,
    setTarefaEmAcao,
  ] =
    useState<string | null>(
      null
    )

  const carregarAgenda =
    useCallback(
      async (
        silencioso = false
      ) => {
        if (silencioso) {
          setAtualizando(true)
        } else {
          setLoading(true)
        }

        setErro(null)

        try {
          const [
            respostaAssistente,
            respostaTarefas,
          ] =
            await Promise.all([
              fetch(
                "/api/meu-assistente-pessoal",
                {
                  cache:
                    "no-store",
                }
              ),
              fetch(
                "/api/tarefas",
                {
                  cache:
                    "no-store",
                }
              ),
            ])

          if (
            !respostaAssistente.ok
          ) {
            const respostaErro =
              await respostaAssistente
                .json()
                .catch(
                  () => null
                )

            throw new Error(
              respostaErro?.message ||
                "Não foi possível carregar as pendências operacionais."
            )
          }

          if (
            !respostaTarefas.ok
          ) {
            const respostaErro =
              await respostaTarefas
                .json()
                .catch(
                  () => null
                )

            throw new Error(
              respostaErro?.message ||
                "Não foi possível carregar tarefas e compromissos."
            )
          }

          const assistente =
            await respostaAssistente.json()

          const listaTarefas =
            await respostaTarefas.json()

          if (
            !assistente ||
            !Array.isArray(
              assistente.pendencias
            )
          ) {
            throw new Error(
              "Resposta inválida do Meu Assistente Pessoal."
            )
          }

          if (
            !Array.isArray(
              listaTarefas
            )
          ) {
            throw new Error(
              "Resposta inválida da API de tarefas."
            )
          }

          setDados(
            assistente
          )

          setTarefas(
            listaTarefas
          )
        } catch (error) {
          console.error(
            "Erro ao carregar Agenda:",
            error
          )

          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar a Agenda."
          )
        } finally {
          setLoading(false)
          setAtualizando(false)
        }
      },
      []
    )

  useEffect(() => {
    carregarAgenda()
  }, [
    carregarAgenda,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarAgenda(
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
    carregarAgenda,
  ])

  const itensAssistente =
    useMemo<ItemAgenda[]>(
      () =>
        (
          dados?.pendencias ??
          []
        ).map(
          (item) => ({
            ...item,
            id:
              `assistente:${item.id}`,
            origemAgenda:
              "assistente",
            tarefaId:
              null,
            href:
              item.href,
            tipoTarefa:
              null,
          })
        ),
      [
        dados,
      ]
    )

  const tarefasPendentes =
    useMemo(
      () =>
        tarefas.filter(
          (tarefa) =>
            tarefa.status ===
            "Pendente"
        ),
      [
        tarefas,
      ]
    )

  const itensTarefas =
    useMemo<ItemAgenda[]>(
      () =>
        tarefasPendentes.map(
          (tarefa) => {
            const dataReferencia =
              dataReferenciaTarefa(
                tarefa
              )

            return {
              id:
                `tarefa:${tarefa.id}`,
              origemAgenda:
                "tarefa",
              tarefaId:
                tarefa.id,
              modulo:
                "tarefas",
              entidadeId:
                tarefa.id,
              codigo:
                tarefa.tipo ===
                "Compromisso"
                  ? "COMP"
                  : "TAR",
              titulo:
                tarefa.titulo,
              descricao:
                tarefa.descricao ??
                tarefa.observacoes ??
                "",
              relacionadoA:
                relacionadoDaTarefa(
                  tarefa
                ),
              responsavel:
                tarefa
                  .responsavel
                  ?.nome ??
                tarefa
                  .criadoPor
                  ?.nome ??
                null,
              dataReferencia,
              situacaoTemporal:
                situacaoDaData(
                  dataReferencia
                ),
              prioridade:
                (
                  tarefa.prioridade ||
                  "Normal"
                ) as PrioridadeTarefa,
              status:
                tarefa.status,
              href:
                null,
              origem:
                "Agenda",
              tipoTarefa:
                tarefa.tipo,
            }
          }
        ),
      [
        tarefasPendentes,
      ]
    )

  const itensAgenda =
    useMemo(
      () => [
        ...itensAssistente,
        ...itensTarefas,
      ],
      [
        itensAssistente,
        itensTarefas,
      ]
    )

  const modulosDisponiveis =
    useMemo(
      () =>
        Array.from(
          new Set(
            itensAgenda.map(
              (item) =>
                item.modulo
            )
          )
        ).sort(
          (
            a,
            b
          ) =>
            nomeModulo(
              a
            ).localeCompare(
              nomeModulo(
                b
              ),
              "pt-BR"
            )
        ),
      [
        itensAgenda,
      ]
    )

  const responsaveisDisponiveis =
    useMemo(
      () =>
        Array.from(
          new Set(
            itensAgenda
              .map(
                (item) =>
                  item.responsavel
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
        ),
      [
        itensAgenda,
      ]
    )

  const itensFiltrados =
    useMemo(
      () =>
        itensAgenda.filter(
          (item) => {
            if (
              filtroModulo !==
                "todos" &&
              item.modulo !==
                filtroModulo
            ) {
              return false
            }

            if (
              filtroResponsavel !==
                "todos" &&
              item.responsavel !==
                filtroResponsavel
            ) {
              return false
            }

            return true
          }
        ),
      [
        itensAgenda,
        filtroModulo,
        filtroResponsavel,
      ]
    )

  const itensComData =
    useMemo(
      () =>
        itensFiltrados
          .filter(
            (item) =>
              converterData(
                item.dataReferencia
              )
          )
          .sort(
            (
              a,
              b
            ) => {
              const dataA =
                converterData(
                  a.dataReferencia
                )

              const dataB =
                converterData(
                  b.dataReferencia
                )

              return (
                (
                  dataA?.getTime() ??
                  Number.MAX_SAFE_INTEGER
                ) -
                (
                  dataB?.getTime() ??
                  Number.MAX_SAFE_INTEGER
                )
              )
            }
          ),
      [
        itensFiltrados,
      ]
    )

  const itensSemData =
    useMemo(
      () =>
        itensFiltrados.filter(
          (item) =>
            !converterData(
              item.dataReferencia
            )
        ),
      [
        itensFiltrados,
      ]
    )

  const diasComEvento =
    useMemo(
      () =>
        itensComData
          .map(
            (item) =>
              converterData(
                item.dataReferencia
              )
          )
          .filter(
            (
              data
            ): data is Date =>
              Boolean(
                data
              )
          ),
      [
        itensComData,
      ]
    )

  const itensPeriodo =
    useMemo(
      () =>
        itensComData.filter(
          (item) => {
            const data =
              converterData(
                item.dataReferencia
              )

            if (!data) {
              return false
            }

            if (
              visualizacao ===
              "dia"
            ) {
              return isSameDay(
                data,
                dataSelecionada
              )
            }

            if (
              visualizacao ===
              "semana"
            ) {
              return isSameWeek(
                data,
                dataSelecionada,
                {
                  weekStartsOn:
                    1,
                }
              )
            }

            return isSameMonth(
              data,
              mes
            )
          }
        ),
      [
        itensComData,
        visualizacao,
        dataSelecionada,
        mes,
      ]
    )

  const proximosCompromissos =
    useMemo(
      () => {
        const agora =
          new Date().getTime()

        return itensComData
          .filter(
            (item) => {
              const data =
                converterData(
                  item.dataReferencia
                )

              return (
                data &&
                data.getTime() >=
                  agora
              )
            }
          )
          .slice(
            0,
            6
          )
      },
      [
        itensComData,
      ]
    )

  const contadores =
    useMemo(
      () => ({
        datados:
          itensComData.length,

        atrasados:
          itensFiltrados.filter(
            (item) =>
              item.situacaoTemporal ===
              "atrasado"
          ).length,

        hoje:
          itensFiltrados.filter(
            (item) =>
              item.situacaoTemporal ===
              "hoje"
          ).length,

        proximos:
          itensFiltrados.filter(
            (item) =>
              item.situacaoTemporal ===
              "proximos"
          ).length,

        semData:
          itensSemData.length,
      }),
      [
        itensComData,
        itensFiltrados,
        itensSemData,
      ]
    )

  const contadoresTarefas =
    useMemo(
      () => ({
        pendentes:
          tarefas.filter(
            (item) =>
              item.status ===
              "Pendente"
          ).length,

        concluidas:
          tarefas.filter(
            (item) =>
              item.status ===
              "Concluida"
          ).length,

        canceladas:
          tarefas.filter(
            (item) =>
              item.status ===
              "Cancelada"
          ).length,
      }),
      [
        tarefas,
      ]
    )

  const tituloPeriodo =
    useMemo(
      () => {
        if (
          visualizacao ===
          "dia"
        ) {
          return format(
            dataSelecionada,
            "dd 'de' MMMM 'de' yyyy",
            {
              locale:
                ptBR,
            }
          )
        }

        if (
          visualizacao ===
          "semana"
        ) {
          return `Semana de ${format(
            dataSelecionada,
            "dd/MM/yyyy"
          )}`
        }

        return format(
          mes,
          "MMMM 'de' yyyy",
          {
            locale:
              ptBR,
          }
        )
      },
      [
        visualizacao,
        dataSelecionada,
        mes,
      ]
    )

  function irHoje() {
    const hoje =
      new Date()

    setDataSelecionada(
      hoje
    )
    setMes(
      hoje
    )
  }

  function navegarAnterior() {
    if (
      visualizacao ===
      "mes"
    ) {
      const novaData =
        addMonths(
          mes,
          -1
        )

      setMes(
        novaData
      )
      setDataSelecionada(
        novaData
      )

      return
    }

    if (
      visualizacao ===
      "semana"
    ) {
      const novaData =
        addWeeks(
          dataSelecionada,
          -1
        )

      setDataSelecionada(
        novaData
      )
      setMes(
        novaData
      )

      return
    }

    const novaData =
      addDays(
        dataSelecionada,
        -1
      )

    setDataSelecionada(
      novaData
    )
    setMes(
      novaData
    )
  }

  function navegarProximo() {
    if (
      visualizacao ===
      "mes"
    ) {
      const novaData =
        addMonths(
          mes,
          1
        )

      setMes(
        novaData
      )
      setDataSelecionada(
        novaData
      )

      return
    }

    if (
      visualizacao ===
      "semana"
    ) {
      const novaData =
        addWeeks(
          dataSelecionada,
          1
        )

      setDataSelecionada(
        novaData
      )
      setMes(
        novaData
      )

      return
    }

    const novaData =
      addDays(
        dataSelecionada,
        1
      )

    setDataSelecionada(
      novaData
    )
    setMes(
      novaData
    )
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

    const linhas =
      itensPeriodo.map(
        (item) =>
          [
            item.codigo,
            formatarDataHora(
              item.dataReferencia
            ),
            nomeModulo(
              item.modulo
            ),
            item.titulo,
            item.descricao,
            item.relacionadoA,
            item.responsavel,
            nomeSituacao(
              item.situacaoTemporal
            ),
            item.status,
          ]
            .map(
              escaparCsv
            )
            .join(
              ";"
            )
      )

    const csv = [
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
      `agenda-${new Date()
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

  function fecharFormulario() {
    setFormularioAberto(
      false
    )

    setTarefaEmEdicao(
      null
    )

    setFormulario(
      FORMULARIO_INICIAL
    )
  }

  function abrirNovaTarefa() {
    setMensagem(
      null
    )

    setTarefaEmEdicao(
      null
    )

    setFormulario(
      FORMULARIO_INICIAL
    )

    setFormularioAberto(
      true
    )
  }

  function abrirEdicao(
    tarefa: TarefaApi
  ) {
    setMensagem(
      null
    )

    setTarefaEmEdicao(
      tarefa.id
    )

    setFormulario({
      titulo:
        tarefa.titulo,

      descricao:
        tarefa.descricao ??
        "",

      tipo:
        tarefa.tipo ===
        "Compromisso"
          ? "Compromisso"
          : "Tarefa",

      prioridade:
        (
          [
            "Baixa",
            "Normal",
            "Alta",
            "Urgente",
          ].includes(
            tarefa.prioridade
          )
            ? tarefa.prioridade
            : "Normal"
        ) as PrioridadeTarefa,

      inicioEm:
        paraDatetimeLocal(
          tarefa.inicioEm
        ),

      fimEm:
        paraDatetimeLocal(
          tarefa.fimEm
        ),

      vencimentoEm:
        paraDatetimeLocal(
          tarefa.vencimentoEm
        ),

      observacoes:
        tarefa.observacoes ??
        "",
    })

    setFormularioAberto(
      true
    )
  }

  async function salvarTarefa() {
    if (
      formulario.titulo.trim() ===
      ""
    ) {
      setErro(
        "Informe o título da tarefa ou compromisso."
      )

      return
    }

    if (
      formulario.tipo ===
        "Compromisso" &&
      !formulario.inicioEm
    ) {
      setErro(
        "Compromisso precisa possuir data/hora de início."
      )

      return
    }

    setSalvando(
      true
    )
    setErro(
      null
    )
    setMensagem(
      null
    )

    try {
      const payload = {
        titulo:
          formulario.titulo.trim(),

        descricao:
          formulario.descricao.trim() ||
          null,

        tipo:
          formulario.tipo,

        prioridade:
          formulario.prioridade,

        inicioEm:
          paraIso(
            formulario.inicioEm
          ),

        fimEm:
          paraIso(
            formulario.fimEm
          ),

        vencimentoEm:
          paraIso(
            formulario.vencimentoEm
          ),

        observacoes:
          formulario.observacoes.trim() ||
          null,
      }

      const response =
        await fetch(
          tarefaEmEdicao
            ? `/api/tarefas/${tarefaEmEdicao}`
            : "/api/tarefas",
          {
            method:
              tarefaEmEdicao
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        )

      const resposta =
        await response
          .json()
          .catch(
            () => null
          )

      if (!response.ok) {
        throw new Error(
          resposta?.message ||
            "Não foi possível salvar o item da Agenda."
        )
      }

      setMensagem(
        tarefaEmEdicao
          ? "Item da Agenda atualizado com sucesso."
          : "Item da Agenda criado com sucesso."
      )

      fecharFormulario()

      await carregarAgenda(
        true
      )
    } catch (error) {
      console.error(
        "Erro ao salvar item da Agenda:",
        error
      )

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar item da Agenda."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  async function executarAcaoTarefa(
    tarefaId: string,
    acao:
      | "concluir"
      | "cancelar"
      | "reabrir"
  ) {
    setTarefaEmAcao(
      tarefaId
    )
    setErro(
      null
    )
    setMensagem(
      null
    )

    try {
      const response =
        await fetch(
          `/api/tarefas/${tarefaId}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                acao,
              }),
          }
        )

      const resposta =
        await response
          .json()
          .catch(
            () => null
          )

      if (!response.ok) {
        throw new Error(
          resposta?.message ||
            "Não foi possível atualizar o item da Agenda."
        )
      }

      setMensagem(
        acao ===
        "concluir"
          ? "Item concluído com sucesso."
          : acao ===
              "cancelar"
            ? "Item cancelado com sucesso."
            : "Item reaberto com sucesso."
      )

      await carregarAgenda(
        true
      )
    } catch (error) {
      console.error(
        "Erro ao atualizar item da Agenda:",
        error
      )

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar item da Agenda."
      )
    } finally {
      setTarefaEmAcao(
        null
      )
    }
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
                    Agenda Operacional e Administrativa
                  </div>

                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    A agenda reúne as pendências reais do Meu Assistente Pessoal
                    com tarefas e compromissos administrativos persistentes no
                    banco do CRM.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    carregarAgenda(
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
                    exportarPeriodo
                  }
                  disabled={
                    itensPeriodo.length ===
                    0
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar período
                </Button>

                <Button
                  variant="outline"
                  asChild
                >
                  <Link href="/interacoes/nova">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Nova Interação
                  </Link>
                </Button>

                <Button
                  onClick={
                    abrirNovaTarefa
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Tarefa / Compromisso
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

        {mensagem && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              {mensagem}
            </CardContent>
          </Card>
        )}

        {formularioAberto && (
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>
                    {tarefaEmEdicao
                      ? "Editar tarefa / compromisso"
                      : "Nova tarefa / compromisso"}
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Tarefas podem possuir vencimento. Compromissos exigem
                    data/hora de início.
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={
                    fecharFormulario
                  }
                  disabled={
                    salvando
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agenda-tipo">
                    Tipo
                  </Label>

                  <Select
                    value={
                      formulario.tipo
                    }
                    onValueChange={(
                      valor
                    ) =>
                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,
                          tipo:
                            valor as TipoTarefa,
                        })
                      )
                    }
                  >
                    <SelectTrigger id="agenda-tipo">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Tarefa">
                        Tarefa
                      </SelectItem>

                      <SelectItem value="Compromisso">
                        Compromisso
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda-prioridade">
                    Prioridade
                  </Label>

                  <Select
                    value={
                      formulario.prioridade
                    }
                    onValueChange={(
                      valor
                    ) =>
                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,
                          prioridade:
                            valor as PrioridadeTarefa,
                        })
                      )
                    }
                  >
                    <SelectTrigger id="agenda-prioridade">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Baixa">
                        Baixa
                      </SelectItem>

                      <SelectItem value="Normal">
                        Normal
                      </SelectItem>

                      <SelectItem value="Alta">
                        Alta
                      </SelectItem>

                      <SelectItem value="Urgente">
                        Urgente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda-titulo">
                  Título
                </Label>

                <Input
                  id="agenda-titulo"
                  value={
                    formulario.titulo
                  }
                  onChange={(
                    event
                  ) =>
                    setFormulario(
                      (
                        atual
                      ) => ({
                        ...atual,
                        titulo:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Ex.: Reunião com contador"
                  maxLength={
                    200
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda-descricao">
                  Descrição
                </Label>

                <Textarea
                  id="agenda-descricao"
                  value={
                    formulario.descricao
                  }
                  onChange={(
                    event
                  ) =>
                    setFormulario(
                      (
                        atual
                      ) => ({
                        ...atual,
                        descricao:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Detalhes do que precisa ser feito."
                  rows={
                    3
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="agenda-inicio">
                    Início
                  </Label>

                  <Input
                    id="agenda-inicio"
                    type="datetime-local"
                    value={
                      formulario.inicioEm
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,
                          inicioEm:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda-fim">
                    Término
                  </Label>

                  <Input
                    id="agenda-fim"
                    type="datetime-local"
                    value={
                      formulario.fimEm
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,
                          fimEm:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda-vencimento">
                    Vencimento
                  </Label>

                  <Input
                    id="agenda-vencimento"
                    type="datetime-local"
                    value={
                      formulario.vencimentoEm
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,
                          vencimentoEm:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda-observacoes">
                  Observações
                </Label>

                <Textarea
                  id="agenda-observacoes"
                  value={
                    formulario.observacoes
                  }
                  onChange={(
                    event
                  ) =>
                    setFormulario(
                      (
                        atual
                      ) => ({
                        ...atual,
                        observacoes:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Observações internas opcionais."
                  rows={
                    2
                  }
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={
                    fecharFormulario
                  }
                  disabled={
                    salvando
                  }
                >
                  Cancelar
                </Button>

                <Button
                  onClick={
                    salvarTarefa
                  }
                  disabled={
                    salvando
                  }
                >
                  {salvando ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  {tarefaEmEdicao
                    ? "Salvar alterações"
                    : "Criar item"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                Compromissos datados
              </CardDescription>

              <CardTitle className="text-3xl">
                {contadores.datados}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardDescription>
                Atrasados
              </CardDescription>

              <CardTitle className="text-3xl text-red-700">
                {contadores.atrasados}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardDescription>
                Hoje
              </CardDescription>

              <CardTitle className="text-3xl text-amber-700">
                {contadores.hoje}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription>
                Próximos 7 dias
              </CardDescription>

              <CardTitle className="text-3xl text-blue-700">
                {contadores.proximos}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                Sem data
              </CardDescription>

              <CardTitle className="text-3xl">
                {contadores.semData}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-indigo-200">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Tarefas e compromissos administrativos
                </CardTitle>

                <CardDescription className="mt-1">
                  Itens persistentes do CRM, separados das pendências
                  automáticas do Meu Assistente Pessoal.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  Pendentes: {contadoresTarefas.pendentes}
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
                  Concluídas: {contadoresTarefas.concluidas}
                </span>

                <span className="rounded-full bg-slate-200 px-3 py-1 font-medium text-slate-700">
                  Canceladas: {contadoresTarefas.canceladas}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {tarefas.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <ClipboardList className="mb-3 h-10 w-10 text-indigo-600" />

                <div className="font-medium">
                  Nenhuma tarefa ou compromisso administrativo cadastrado.
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Use “Nova Tarefa / Compromisso” para registrar o primeiro item.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tarefas.map(
                  (
                    tarefa
                  ) => {
                    const dataReferencia =
                      dataReferenciaTarefa(
                        tarefa
                      )

                    const emAcao =
                      tarefaEmAcao ===
                      tarefa.id

                    return (
                      <div
                        key={
                          tarefa.id
                        }
                        className="rounded-lg border p-4"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                                {tarefa.tipo}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${classePrioridadeTarefa(
                                  tarefa.prioridade
                                )}`}
                              >
                                {tarefa.prioridade}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${classeStatusTarefa(
                                  tarefa.status
                                )}`}
                              >
                                {tarefa.status ===
                                "Concluida"
                                  ? "Concluída"
                                  : tarefa.status ===
                                      "Cancelada"
                                    ? "Cancelada"
                                    : "Pendente"}
                              </span>
                            </div>

                            <div className="mt-2 font-semibold">
                              {tarefa.titulo}
                            </div>

                            {tarefa.descricao && (
                              <div className="mt-1 whitespace-pre-wrap text-sm">
                                {tarefa.descricao}
                              </div>
                            )}

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                {dataReferencia
                                  ? formatarDataHora(
                                      dataReferencia
                                    )
                                  : "Sem data definida"}
                              </span>

                              {tarefa.responsavel && (
                                <span className="inline-flex items-center gap-1">
                                  <UserRound className="h-3.5 w-3.5" />
                                  {tarefa.responsavel.nome}
                                </span>
                              )}

                              {relacionadoDaTarefa(
                                tarefa
                              ) && (
                                <span>
                                  {relacionadoDaTarefa(
                                    tarefa
                                  )}
                                </span>
                              )}
                            </div>

                            {tarefa.observacoes && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Observações: {tarefa.observacoes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                abrirEdicao(
                                  tarefa
                                )
                              }
                              disabled={
                                emAcao
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Button>

                            {tarefa.status ===
                              "Pendente" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    executarAcaoTarefa(
                                      tarefa.id,
                                      "concluir"
                                    )
                                  }
                                  disabled={
                                    emAcao
                                  }
                                >
                                  {emAcao ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Concluir
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    executarAcaoTarefa(
                                      tarefa.id,
                                      "cancelar"
                                    )
                                  }
                                  disabled={
                                    emAcao
                                  }
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Cancelar
                                </Button>
                              </>
                            )}

                            {tarefa.status !==
                              "Pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  executarAcaoTarefa(
                                    tarefa.id,
                                    "reabrir"
                                  )
                                }
                                disabled={
                                  emAcao
                                }
                              >
                                {emAcao ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                )}
                                Reabrir
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1 text-sm font-medium">
                    Visualização
                  </div>

                  <Select
                    value={
                      visualizacao
                    }
                    onValueChange={(
                      valor
                    ) =>
                      setVisualizacao(
                        valor as Visualizacao
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="mes">
                        Mês
                      </SelectItem>

                      <SelectItem value="semana">
                        Semana
                      </SelectItem>

                      <SelectItem value="dia">
                        Dia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium">
                    Módulo
                  </div>

                  <Select
                    value={
                      filtroModulo
                    }
                    onValueChange={
                      setFiltroModulo
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos
                      </SelectItem>

                      {modulosDisponiveis.map(
                        (
                          modulo
                        ) => (
                          <SelectItem
                            key={
                              modulo
                            }
                            value={
                              modulo
                            }
                          >
                            {nomeModulo(
                              modulo
                            )}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium">
                    Responsável
                  </div>

                  <Select
                    value={
                      filtroResponsavel
                    }
                    onValueChange={
                      setFiltroResponsavel
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos
                      </SelectItem>

                      {responsaveisDisponiveis.map(
                        (
                          responsavel
                        ) => (
                          <SelectItem
                            key={
                              responsavel
                            }
                            value={
                              responsavel
                            }
                          >
                            {responsavel}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={
                    navegarAnterior
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={
                    irHoje
                  }
                >
                  Hoje
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={
                    navegarProximo
                  }
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
                  Dias sublinhados possuem pendências operacionais, tarefas ou
                  compromissos cadastrados.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Calendar
                  mode="single"
                  selected={
                    dataSelecionada
                  }
                  onSelect={(
                    novaData
                  ) => {
                    if (
                      novaData
                    ) {
                      setDataSelecionada(
                        novaData
                      )

                      setMes(
                        novaData
                      )
                    }
                  }}
                  month={
                    mes
                  }
                  onMonthChange={
                    setMes
                  }
                  locale={
                    ptBR
                  }
                  className="rounded-md border"
                  modifiers={{
                    hasEvent:
                      diasComEvento,
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
                <CardTitle>
                  Compromissos do período
                </CardTitle>

                <CardDescription>
                  {tituloPeriodo}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {itensPeriodo.length ===
                0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-600" />

                    <p className="font-medium">
                      Nenhuma pendência datada neste período.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itensPeriodo.map(
                      (
                        item
                      ) => {
                        const conteudo = (
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
                                  <IconeModulo
                                    modulo={
                                      item.modulo
                                    }
                                  />
                                  {nomeModulo(
                                    item.modulo
                                  )}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${classeSituacao(
                                    item.situacaoTemporal
                                  )}`}
                                >
                                  {nomeSituacao(
                                    item.situacaoTemporal
                                  )}
                                </span>

                                {item.origemAgenda ===
                                  "tarefa" && (
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${classePrioridadeTarefa(
                                      String(
                                        item.prioridade
                                      )
                                    )}`}
                                  >
                                    {String(
                                      item.prioridade
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 font-semibold">
                                {item.titulo}
                              </div>

                              {item.relacionadoA && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  {item.relacionadoA}
                                </div>
                              )}

                              {item.descricao && (
                                <div className="mt-2 whitespace-pre-wrap text-sm">
                                  {item.descricao}
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span>
                                  {formatarDataHora(
                                    item.dataReferencia
                                  )}
                                </span>

                                {item.responsavel && (
                                  <span className="inline-flex items-center gap-1">
                                    <UserRound className="h-3.5 w-3.5" />
                                    {item.responsavel}
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.href && (
                              <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        )

                        if (
                          item.href
                        ) {
                          return (
                            <Link
                              key={
                                item.id
                              }
                              href={
                                item.href
                              }
                              className="block rounded-lg border p-4 transition hover:bg-muted/30"
                            >
                              {conteudo}
                            </Link>
                          )
                        }

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="rounded-lg border border-indigo-200 p-4"
                          >
                            {conteudo}
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Próximos compromissos
                </CardTitle>
              </CardHeader>

              <CardContent>
                {proximosCompromissos.length ===
                0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum compromisso futuro datado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {proximosCompromissos.map(
                      (
                        item
                      ) => {
                        const conteudo = (
                          <div className="flex gap-3">
                            <div
                              className={`rounded-md p-2 ${classeModulo(
                                item.modulo
                              )}`}
                            >
                              <IconeModulo
                                modulo={
                                  item.modulo
                                }
                              />
                            </div>

                            <div>
                              <div className="text-sm font-medium">
                                {item.titulo}
                              </div>

                              <div className="mt-1 text-xs text-muted-foreground">
                                {formatarDataHora(
                                  item.dataReferencia
                                )}
                              </div>
                            </div>
                          </div>
                        )

                        if (
                          item.href
                        ) {
                          return (
                            <Link
                              key={
                                item.id
                              }
                              href={
                                item.href
                              }
                              className="block border-b pb-4 last:border-0"
                            >
                              {conteudo}
                            </Link>
                          )
                        }

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="border-b pb-4 last:border-0"
                          >
                            {conteudo}
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Pendências sem data
                </CardTitle>

                <CardDescription>
                  Ainda não podem ser posicionadas no calendário.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {itensSemData.length ===
                0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Nenhuma pendência sem data.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itensSemData
                      .slice(
                        0,
                        6
                      )
                      .map(
                        (
                          item
                        ) => {
                          const conteudo = (
                            <div className="flex gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />

                              <div>
                                <div className="text-sm font-medium">
                                  {item.titulo}
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  {nomeModulo(
                                    item.modulo
                                  )}
                                  {item.relacionadoA
                                    ? ` • ${item.relacionadoA}`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          )

                          if (
                            item.href
                          ) {
                            return (
                              <Link
                                key={
                                  item.id
                                }
                                href={
                                  item.href
                                }
                                className="block rounded-md border p-3"
                              >
                                {conteudo}
                              </Link>
                            )
                          }

                          return (
                            <div
                              key={
                                item.id
                              }
                              className="rounded-md border border-indigo-200 p-3"
                            >
                              {conteudo}
                            </div>
                          )
                        }
                      )}

                    {itensSemData.length >
                      6 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href="/meu-assistente-pessoal">
                          Ver pendências operacionais no Meu Assistente
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