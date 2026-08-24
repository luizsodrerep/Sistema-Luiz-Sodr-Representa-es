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

  const vendasFiltradas =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase()

      return vendas.filter(
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
      vendas,
      busca,
      filtroStatus,
    ])

  const totalVendas =
    useMemo(
      () =>
        vendas.reduce(
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
      [vendas]
    )

  const totalComissoes =
    useMemo(
      () =>
        vendas.reduce(
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
      [vendas]
    )

  const aguardandoEnvio =
    useMemo(
      () =>
        vendas.filter(
          (venda) =>
            venda.status ===
            "Aguardando envio"
        ).length,
      [vendas]
    )

  const aguardandoConfirmacao =
    useMemo(
      () =>
        vendas.filter(
          (venda) =>
            venda.status ===
            "Aguardando confirmação"
        ).length,
      [vendas]
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
                vendas
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
                  vendas.length
                }{" "}
                venda(s) registrada(s)
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
                Conforme regras comerciais aplicadas
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
                Vendas ainda não enviadas à Representada
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
                Pedidos enviados aguardando retorno
              </p>
            </CardContent>
          </Card>
        </div>

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
              registro(s) exibido(s). Atualização automática a cada 15 segundos.
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
                Nenhuma venda encontrada para os filtros selecionados.
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