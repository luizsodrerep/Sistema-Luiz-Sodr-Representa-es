"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  Building2,
  Calendar,
  CircleDollarSign,
  Factory,
  FileCheck2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Target,
} from "lucide-react"

import {
  NavigationButtons,
} from "@/components/navigation-buttons"

import {
  SpreadsheetHandler,
} from "@/components/spreadsheet-handler"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type InteracaoOrigemResumo = {
  id: string
  numeroSequencial: number
  tipo?: string
  assunto?: string | null
}

type OrcamentoOrigemResumo = {
  id: string
  numeroSequencial: number
  status: string

  interacaoOrigem?:
    | InteracaoOrigemResumo
    | null
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

interface Venda {
  id: string

  numeroSequencial: number

  data: string

  valorTotal: number | null

  comissao: number | null
  valorComissaoPrevista: number | null
  percentualComissaoAplicado: number | null

  status: string

  condicaoPagamento: string | null

  numeroPedido: string | null
  numeroPedidoRepresentada: string | null
  numeroOCCliente: string | null

  pedidoEnviadoEm: string | null
  confirmadoEm: string | null

  cliente: {
    id: string
    codigo: string | null
    razaoSocial: string
    nomeFantasia: string | null
    cnpj: string | null
  }

  representada: {
    id: string
    codigo: string | null
    nome: string
    cnpj: string | null
  }

  orcamentoOrigem:
    | OrcamentoOrigemResumo
    | null

  criadoPor:
    | UsuarioResumo
    | null

  responsavel:
    | UsuarioResumo
    | null
}

type FiltroStatus =
  | "todos"
  | "aguardando-envio"
  | "aguardando-confirmacao"
  | "confirmados"
  | "faturados"
  | "cancelados"

type FiltroPeriodo =
  | "mes-atual"
  | "mes-anterior"
  | "ultimos-3-meses"
  | "ano-atual"
  | "todo-historico"

type SaudeVendas = {
  nome: string
  emoji: string
  classe: string
  percentual: number | null
}

/*
 * META DO ESCRITÓRIO
 *
 * Não definir valor provisório ou fictício.
 *
 * A futura meta deverá ser construída a partir de dados reais:
 * - metas das Representadas;
 * - custos fixos do escritório;
 * - custos variáveis;
 * - compromissos financeiros;
 * - margem/reserva necessária para crescimento saudável.
 *
 * Quando essa estrutura estiver definida, esta tela já estará
 * preparada para consumir a meta real.
 */
const META_MENSAL_ESCRITORIO: number | null =
  null

function formatarCodigoVenda(
  numero: number
) {
  return `VEN-${String(
    numero
  ).padStart(6, "0")}`
}

function formatarCodigoOrcamento(
  numero: number
) {
  return `ORC-${String(
    numero
  ).padStart(6, "0")}`
}

function formatarCodigoInteracao(
  numero: number
) {
  return `INT-${String(
    numero
  ).padStart(6, "0")}`
}

function formatarMoeda(
  valor: number | null
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    Number(
      valor || 0
    )
  )
}

function formatarData(
  dataISO: string | null
) {
  if (!dataISO) {
    return "—"
  }

  const data =
    new Date(dataISO)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return data.toLocaleDateString(
    "pt-BR"
  )
}

function nomeCliente(
  venda: Venda
) {
  return (
    venda.cliente.nomeFantasia ||
    venda.cliente.razaoSocial
  )
}

function classeStatus(
  status: string
) {
  if (
    status === "Faturado"
  ) {
    return "bg-green-100 text-green-800"
  }

  if (
    status === "Confirmado"
  ) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (
    status ===
    "Aguardando confirmação"
  ) {
    return "bg-blue-100 text-blue-800"
  }

  if (
    status ===
    "Aguardando envio"
  ) {
    return "bg-amber-100 text-amber-800"
  }

  if (
    status === "Cancelado"
  ) {
    return "bg-red-100 text-red-800"
  }

  if (
    status === "Pendente"
  ) {
    return "bg-yellow-100 text-yellow-800"
  }

  return "bg-slate-100 text-slate-800"
}

function correspondeStatus(
  venda: Venda,
  filtro: FiltroStatus
) {
  if (
    filtro === "todos"
  ) {
    return true
  }

  if (
    filtro ===
    "aguardando-envio"
  ) {
    return (
      venda.status ===
      "Aguardando envio"
    )
  }

  if (
    filtro ===
    "aguardando-confirmacao"
  ) {
    return (
      venda.status ===
      "Aguardando confirmação"
    )
  }

  if (
    filtro ===
    "confirmados"
  ) {
    return (
      venda.status ===
      "Confirmado"
    )
  }

  if (
    filtro ===
    "faturados"
  ) {
    return (
      venda.status ===
      "Faturado"
    )
  }

  if (
    filtro ===
    "cancelados"
  ) {
    return (
      venda.status ===
      "Cancelado"
    )
  }

  return true
}

function pertenceAoPeriodo(
  venda: Venda,
  filtro: FiltroPeriodo
) {
  if (
    filtro === "todo-historico"
  ) {
    return true
  }

  const dataVenda =
    new Date(venda.data)

  if (
    Number.isNaN(
      dataVenda.getTime()
    )
  ) {
    return false
  }

  const hoje =
    new Date()

  const ano =
    hoje.getFullYear()

  const mes =
    hoje.getMonth()

  let inicio: Date
  let fim: Date

  if (
    filtro === "mes-atual"
  ) {
    inicio =
      new Date(
        ano,
        mes,
        1
      )

    fim =
      new Date(
        ano,
        mes + 1,
        1
      )
  } else if (
    filtro === "mes-anterior"
  ) {
    inicio =
      new Date(
        ano,
        mes - 1,
        1
      )

    fim =
      new Date(
        ano,
        mes,
        1
      )
  } else if (
    filtro ===
    "ultimos-3-meses"
  ) {
    inicio =
      new Date(
        ano,
        mes - 2,
        1
      )

    fim =
      new Date(
        ano,
        mes + 1,
        1
      )
  } else {
    inicio =
      new Date(
        ano,
        0,
        1
      )

    fim =
      new Date(
        ano + 1,
        0,
        1
      )
  }

  return (
    dataVenda >= inicio &&
    dataVenda < fim
  )
}

function descreverPeriodo(
  filtro: FiltroPeriodo
) {
  const hoje =
    new Date()

  if (
    filtro === "mes-atual"
  ) {
    const descricao =
      hoje.toLocaleDateString(
        "pt-BR",
        {
          month: "long",
          year: "numeric",
        }
      )

    return `Mês atual · ${descricao}`
  }

  if (
    filtro === "mes-anterior"
  ) {
    const mesAnterior =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 1,
        1
      )

    const descricao =
      mesAnterior.toLocaleDateString(
        "pt-BR",
        {
          month: "long",
          year: "numeric",
        }
      )

    return `Mês anterior · ${descricao}`
  }

  if (
    filtro ===
    "ultimos-3-meses"
  ) {
    return "Últimos 3 meses"
  }

  if (
    filtro === "ano-atual"
  ) {
    return `Ano atual · ${hoje.getFullYear()}`
  }

  return "Todo o histórico"
}

function calcularMetaPeriodo(
  filtro: FiltroPeriodo
) {
  if (
    META_MENSAL_ESCRITORIO ===
      null ||
    filtro === "todo-historico"
  ) {
    return null
  }

  if (
    filtro ===
      "mes-atual" ||
    filtro ===
      "mes-anterior"
  ) {
    return META_MENSAL_ESCRITORIO
  }

  if (
    filtro ===
    "ultimos-3-meses"
  ) {
    return (
      META_MENSAL_ESCRITORIO *
      3
    )
  }

  /*
   * Para o ano atual, a comparação futura será
   * acumulada até o mês corrente, e não contra
   * doze meses completos antes do encerramento
   * do exercício.
   */
  const mesesDecorridos =
    new Date().getMonth() + 1

  return (
    META_MENSAL_ESCRITORIO *
    mesesDecorridos
  )
}

function calcularSaudeVendas(
  vendas: number,
  meta: number | null
): SaudeVendas {
  if (
    meta === null ||
    meta <= 0
  ) {
    return {
      nome: "Meta não configurada",
      emoji: "⚪",
      classe:
        "border-slate-200 bg-slate-50 text-slate-700",
      percentual: null,
    }
  }

  const percentual =
    (vendas / meta) * 100

  if (
    percentual >= 110
  ) {
    return {
      nome: "Excelente",
      emoji: "🟢",
      classe:
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      percentual,
    }
  }

  if (
    percentual >= 100
  ) {
    return {
      nome: "Ótimo",
      emoji: "🟢",
      classe:
        "border-green-200 bg-green-50 text-green-800",
      percentual,
    }
  }

  if (
    percentual >= 80
  ) {
    return {
      nome: "Regular",
      emoji: "🟡",
      classe:
        "border-yellow-200 bg-yellow-50 text-yellow-800",
      percentual,
    }
  }

  if (
    percentual >= 60
  ) {
    return {
      nome: "Atenção",
      emoji: "🟠",
      classe:
        "border-orange-200 bg-orange-50 text-orange-800",
      percentual,
    }
  }

  if (
    percentual >= 40
  ) {
    return {
      nome: "Ruim",
      emoji: "🔴",
      classe:
        "border-red-200 bg-red-50 text-red-800",
      percentual,
    }
  }

  return {
    nome: "Prejudicial",
    emoji: "🔴",
    classe:
      "border-rose-200 bg-rose-50 text-rose-800",
    percentual,
  }
}

export default function VendasPage() {
  const [
    vendas,
    setVendas,
  ] =
    useState<Venda[]>(
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
    busca,
    setBusca,
  ] =
    useState("")

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<FiltroStatus>(
      "todos"
    )

  const [
    filtroPeriodo,
    setFiltroPeriodo,
  ] =
    useState<FiltroPeriodo>(
      "mes-atual"
    )

  async function carregarVendas(
    silencioso = false
  ) {
    try {
      if (!silencioso) {
        setCarregando(
          true
        )
      }

      setErro(null)

      const response =
        await fetch(
          "/api/vendas",
          {
            cache:
              "no-store",
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => []
          )

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ||
            "Erro ao buscar vendas."
        )
      }

      setVendas(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        error
      )

      setErro(
        "Não foi possível carregar as vendas."
      )
    } finally {
      if (!silencioso) {
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
        15000
      )

    return () => {
      window.clearInterval(
        intervalo
      )
    }
  }, [])

  const vendasNoPeriodo =
    useMemo(
      () =>
        vendas.filter(
          (venda) =>
            pertenceAoPeriodo(
              venda,
              filtroPeriodo
            )
        ),
      [
        vendas,
        filtroPeriodo,
      ]
    )

  const vendasFiltradas =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase()

      return vendasNoPeriodo.filter(
        (
          venda
        ) => {
          if (
            !correspondeStatus(
              venda,
              filtroStatus
            )
          ) {
            return false
          }

          if (!termo) {
            return true
          }

          const codigoVenda =
            formatarCodigoVenda(
              venda.numeroSequencial
            ).toLowerCase()

          const codigoOrcamento =
            venda.orcamentoOrigem
              ? formatarCodigoOrcamento(
                  venda
                    .orcamentoOrigem
                    .numeroSequencial
                ).toLowerCase()
              : ""

          const codigoInteracao =
            venda.orcamentoOrigem
              ?.interacaoOrigem
              ? formatarCodigoInteracao(
                  venda
                    .orcamentoOrigem
                    .interacaoOrigem
                    .numeroSequencial
                ).toLowerCase()
              : ""

          return (
            codigoVenda.includes(
              termo
            ) ||
            codigoOrcamento.includes(
              termo
            ) ||
            codigoInteracao.includes(
              termo
            ) ||
            nomeCliente(
              venda
            )
              .toLowerCase()
              .includes(
                termo
              ) ||
            venda.cliente.razaoSocial
              .toLowerCase()
              .includes(
                termo
              ) ||
            venda.representada.nome
              .toLowerCase()
              .includes(
                termo
              ) ||
            venda.status
              .toLowerCase()
              .includes(
                termo
              ) ||
            (
              venda.numeroPedido
                ?.toLowerCase()
                .includes(
                  termo
                ) ??
              false
            ) ||
            (
              venda.numeroPedidoRepresentada
                ?.toLowerCase()
                .includes(
                  termo
                ) ??
              false
            ) ||
            (
              venda.numeroOCCliente
                ?.toLowerCase()
                .includes(
                  termo
                ) ??
              false
            )
          )
        }
      )
    }, [
      vendasNoPeriodo,
      busca,
      filtroStatus,
    ])

  const totalVendas =
    useMemo(
      () =>
        vendasNoPeriodo.reduce(
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
      [vendasNoPeriodo]
    )

  const totalComissoes =
    useMemo(
      () =>
        vendasNoPeriodo.reduce(
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
      [vendasNoPeriodo]
    )

  const aguardandoEnvio =
    useMemo(
      () =>
        vendasNoPeriodo.filter(
          (venda) =>
            venda.status ===
            "Aguardando envio"
        ).length,
      [vendasNoPeriodo]
    )

  const aguardandoConfirmacao =
    useMemo(
      () =>
        vendasNoPeriodo.filter(
          (venda) =>
            venda.status ===
            "Aguardando confirmação"
        ).length,
      [vendasNoPeriodo]
    )

  const metaPeriodo =
    useMemo(
      () =>
        calcularMetaPeriodo(
          filtroPeriodo
        ),
      [filtroPeriodo]
    )

  const saudeVendas =
    useMemo(
      () =>
        calcularSaudeVendas(
          totalVendas,
          metaPeriodo
        ),
      [
        totalVendas,
        metaPeriodo,
      ]
    )

  const descricaoPeriodo =
    useMemo(
      () =>
        descreverPeriodo(
          filtroPeriodo
        ),
      [filtroPeriodo]
    )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Vendas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Pedidos comerciais com identificação permanente e origem rastreável.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SpreadsheetHandler
              moduleType="vendas"
              data={
                vendasNoPeriodo
              }
            />

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={() =>
                carregarVendas()
              }
            >
              <RefreshCw className="h-4 w-4" />

              Atualizar
            </Button>

            <Link href="/vendas/nova">
              <Button
                size="sm"
                className="h-9 gap-1"
              >
                <Plus className="h-4 w-4" />

                Nova Venda
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 dark:bg-gray-950 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">
              Período de análise
            </p>

            <p className="text-xs text-muted-foreground">
              {descricaoPeriodo}
            </p>
          </div>

          <Select
            value={
              filtroPeriodo
            }
            onValueChange={(
              value
            ) =>
              setFiltroPeriodo(
                value as FiltroPeriodo
              )
            }
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Selecione o período" />
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

              <SelectItem value="ano-atual">
                Ano atual
              </SelectItem>

              <SelectItem value="todo-historico">
                Todo o histórico
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {formatarMoeda(
                  totalVendas
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  vendasNoPeriodo.length
                }{" "}
                venda(s) no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Comissão Prevista
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {formatarMoeda(
                  totalComissoes
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Conforme regras comerciais no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Aguardando Envio
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {
                  aguardandoEnvio
                }
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Vendas do período ainda não enviadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                Aguardando Confirmação
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {
                  aguardandoConfirmacao
                }
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Pedidos do período aguardando retorno
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Target className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Saúde das Vendas
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Desempenho comercial comparado à meta do escritório
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${saudeVendas.classe}`}
                >
                  {saudeVendas.emoji}{" "}
                  {saudeVendas.nome}
                </div>

                <div className="text-xs text-muted-foreground">
                  Meta:{" "}
                  <span className="font-medium text-foreground">
                    {metaPeriodo !== null
                      ? formatarMoeda(
                          metaPeriodo
                        )
                      : "ainda não configurada"}
                  </span>
                </div>

                {saudeVendas.percentual !==
                  null && (
                  <div className="text-xs text-muted-foreground">
                    Atingimento:{" "}
                    <span className="font-medium text-foreground">
                      {saudeVendas.percentual.toLocaleString(
                        "pt-BR",
                        {
                          maximumFractionDigits: 1,
                        }
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 border-t pt-3">
  <div className="mb-2 flex items-center justify-between">
    <p className="text-xs font-medium">
      Referência da Saúde das Vendas
    </p>

    <p className="text-[10px] text-muted-foreground">
      Baseada no atingimento da meta
    </p>
  </div>

  <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        ≥ 110%
      </span>
      <span className="font-medium">
        🟢 Excelente
      </span>
    </div>

    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        100% a 109,99%
      </span>
      <span className="font-medium">
        🟢 Ótimo
      </span>
    </div>

    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        80% a 99,99%
      </span>
      <span className="font-medium">
        🟡 Regular
      </span>
    </div>

    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        60% a 79,99%
      </span>
      <span className="font-medium">
        🟠 Atenção
      </span>
    </div>

    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        40% a 59,99%
      </span>
      <span className="font-medium">
        🔴 Ruim
      </span>
    </div>

    <div className="flex items-center justify-between rounded-md px-2 py-1">
      <span className="text-muted-foreground">
        &lt; 40%
      </span>
      <span className="font-medium">
        🔴 Prejudicial
      </span>
    </div>
  </div>

  {metaPeriodo === null && (
    <p className="mt-3 text-[11px] text-muted-foreground">
      A classificação automática será ativada quando a meta real do escritório for definida a partir das metas das Representadas, custos operacionais e margem de crescimento.
    </p>
  )}
</div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
              type="search"
              placeholder="VEN, ORC, INT, cliente, pedido..."
              className="w-full bg-white pl-8 dark:bg-gray-950"
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
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={
                filtroStatus ===
                "todos"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "todos"
                )
              }
            >
              Todos
            </Button>

            <Button
              variant={
                filtroStatus ===
                "aguardando-envio"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "aguardando-envio"
                )
              }
            >
              Aguardando envio
            </Button>

            <Button
              variant={
                filtroStatus ===
                "aguardando-confirmacao"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "aguardando-confirmacao"
                )
              }
            >
              Aguardando confirmação
            </Button>

            <Button
              variant={
                filtroStatus ===
                "confirmados"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "confirmados"
                )
              }
            >
              Confirmados
            </Button>

            <Button
              variant={
                filtroStatus ===
                "faturados"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "faturados"
                )
              }
            >
              Faturados
            </Button>

            <Button
              variant={
                filtroStatus ===
                "cancelados"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "cancelados"
                )
              }
            >
              Cancelados
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>
              Histórico de Vendas
            </CardTitle>

            <CardDescription>
              {
                vendasFiltradas.length
              }{" "}
              registro(s) exibido(s) em{" "}
              {descricaoPeriodo.toLowerCase()}.
              Atualização automática a cada 15 segundos.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {carregando ? (
              <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />

                Carregando vendas...
              </div>
            ) : erro ? (
              <div className="flex items-center gap-2 p-6 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />

                {
                  erro
                }
              </div>
            ) : vendasFiltradas.length ===
              0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Nenhuma venda encontrada para o período e filtros selecionados.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Venda
                    </TableHead>

                    <TableHead>
                      Origem
                    </TableHead>

                    <TableHead>
                      Cliente
                    </TableHead>

                    <TableHead>
                      Representada
                    </TableHead>

                    <TableHead>
                      Data
                    </TableHead>

                    <TableHead>
                      Valor
                    </TableHead>

                    <TableHead>
                      Comissão
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {vendasFiltradas.map(
                    (
                      venda
                    ) => {
                      const codigoVenda =
                        formatarCodigoVenda(
                          venda.numeroSequencial
                        )

                      const orcamento =
                        venda.orcamentoOrigem

                      const interacao =
                        orcamento?.interacaoOrigem

                      return (
                        <TableRow
                          key={
                            venda.id
                          }
                        >
                          <TableCell>
                            <Link
                              href={`/vendas/${venda.id}`}
                              className="font-mono font-bold text-blue-700 hover:underline"
                            >
                              {
                                codigoVenda
                              }
                            </Link>

                            {venda.numeroPedidoRepresentada && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Pedido Rep.:{" "}
                                {
                                  venda.numeroPedidoRepresentada
                                }
                              </p>
                            )}
                          </TableCell>

                          <TableCell>
                            {orcamento ? (
                              <div className="space-y-1">
                                {interacao && (
                                  <Link
                                    href={`/interacoes/${interacao.id}`}
                                    className="flex items-center gap-1 font-mono text-xs font-semibold text-blue-700 hover:underline"
                                  >
                                    <FileText className="h-3 w-3" />

                                    {formatarCodigoInteracao(
                                      interacao.numeroSequencial
                                    )}
                                  </Link>
                                )}

                                <Link
                                  href={`/orcamentos/${orcamento.id}`}
                                  className="flex items-center gap-1 font-mono text-xs font-semibold text-green-700 hover:underline"
                                >
                                  <FileCheck2 className="h-3 w-3" />

                                  {formatarCodigoOrcamento(
                                    orcamento.numeroSequencial
                                  )}
                                </Link>

                                <p className="text-[10px] text-muted-foreground">
                                  {interacao
                                    ? "Interação → Orçamento → Venda"
                                    : "Orçamento → Venda"}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-slate-500" />

                                <div>
                                  <p className="text-xs font-medium">
                                    Venda direta
                                  </p>

                                  <p className="text-[10px] text-muted-foreground">
                                    Direta / retroativa
                                  </p>
                                </div>
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-primary/10 p-2">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>

                              <div>
                                <Link
                                  href={`/clientes/${venda.cliente.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {nomeCliente(
                                    venda
                                  )}
                                </Link>

                                {venda.cliente.codigo && (
                                  <p className="text-xs text-muted-foreground">
                                    {
                                      venda.cliente.codigo
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Link
                              href={`/representadas/${venda.representada.id}`}
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <Factory className="h-4 w-4" />

                              {
                                venda.representada.nome
                              }
                            </Link>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />

                              <span>
                                {formatarData(
                                  venda.data
                                )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CircleDollarSign className="h-3 w-3" />

                              <span className="font-medium">
                                {formatarMoeda(
                                  venda.valorTotal
                                )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatarMoeda(
                                  venda.valorComissaoPrevista ??
                                    venda.comissao
                                )}
                              </p>

                              {venda.percentualComissaoAplicado !==
                                null && (
                                <p className="text-xs text-muted-foreground">
                                  {Number(
                                    venda.percentualComissaoAplicado
                                  ).toLocaleString(
                                    "pt-BR",
                                    {
                                      maximumFractionDigits: 4,
                                    }
                                  )}
                                  %
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classeStatus(
                                venda.status
                              )}`}
                            >
                              {
                                venda.status
                              }
                            </div>

                            {venda.pedidoEnviadoEm && (
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                Enviado:{" "}
                                {formatarData(
                                  venda.pedidoEnviadoEm
                                )}
                              </p>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Link
                              href={`/vendas/${venda.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Ver Venda
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    }
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}