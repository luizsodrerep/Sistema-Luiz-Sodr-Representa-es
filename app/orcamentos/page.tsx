"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Search,
  XCircle,
} from "lucide-react"

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
  Input,
} from "@/components/ui/input"

import {
  formatarCodigoOrcamento,
} from "@/lib/orcamentos/codigo"

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type ClienteResumo = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
}

type RepresentadaResumo = {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
}

type InteracaoResumo = {
  id: string
  numeroSequencial: number
  data: string
  tipo: string
  assunto: string | null
}

type Orcamento = {
  id: string
  numeroSequencial: number

  data: string
  validadeEm: string

  valorTotal: number

  condicaoPagamento: string | null
  descricao: string | null

  status: string

  enviadoEm: string | null
  finalizadoEm: string | null
  motivoFinalizacao: string | null

  cliente: ClienteResumo
  representada: RepresentadaResumo
  interacaoOrigem: InteracaoResumo | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

const STATUS = [
  "Todos",
  "Pendente",
  "Aprovado",
  "Recusado",
  "Vencido",
  "Cancelado",
]

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return "—"
  }

  const data =
    new Date(valor)

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

function formatarMoeda(
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

function diasRestantes(
  validadeEm: string
) {
  const agora =
    new Date()

  const validade =
    new Date(
      validadeEm
    )

  const diferenca =
    validade.getTime() -
    agora.getTime()

  return Math.ceil(
    diferenca /
      (1000 * 60 * 60 * 24)
  )
}

function classeStatus(
  status: string
) {
  if (
    status ===
    "Aprovado"
  ) {
    return "bg-green-100 text-green-800"
  }

  if (
    status ===
    "Vencido"
  ) {
    return "bg-red-100 text-red-800"
  }

  if (
    status ===
      "Recusado" ||
    status ===
      "Cancelado"
  ) {
    return "bg-slate-200 text-slate-700"
  }

  return "bg-amber-100 text-amber-800"
}

export default function OrcamentosPage() {
  const [
    orcamentos,
    setOrcamentos,
  ] =
    useState<Orcamento[]>(
      []
    )

  const [
    loading,
    setLoading,
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
    status,
    setStatus,
  ] =
    useState("Todos")

  async function carregar() {
    try {
      setLoading(true)
      setErro(null)

      const parametros =
        new URLSearchParams()

      if (
        busca.trim() !==
        ""
      ) {
        parametros.set(
          "busca",
          busca.trim()
        )
      }

      if (
        status !==
        "Todos"
      ) {
        parametros.set(
          "status",
          status
        )
      }

      const query =
        parametros.toString()

      const response =
        await fetch(
          `/api/orcamentos${
            query
              ? `?${query}`
              : ""
          }`,
          {
            cache:
              "no-store",
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (
        !response.ok
      ) {
        setErro(
          data?.message ||
            "Não foi possível carregar os orçamentos."
        )

        return
      }

      setOrcamentos(
        Array.isArray(
          data
        )
          ? data
          : []
      )
    } catch {
      setErro(
        "Erro ao carregar orçamentos."
      )
    } finally {
      setLoading(
        false
      )
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const resumo =
    useMemo(() => {
      const pendentes =
        orcamentos.filter(
          (
            item
          ) =>
            item.status ===
            "Pendente"
        )

      const vencendo =
        pendentes.filter(
          (
            item
          ) => {
            const dias =
              diasRestantes(
                item.validadeEm
              )

            return (
              dias >= 0 &&
              dias <= 2
            )
          }
        )

      return {
        total:
          orcamentos.length,

        pendentes:
          pendentes.length,

        vencendo:
          vencendo.length,

        aprovados:
          orcamentos.filter(
            (
              item
            ) =>
              item.status ===
              "Aprovado"
          ).length,

        vencidos:
          orcamentos.filter(
            (
              item
            ) =>
              item.status ===
              "Vencido"
          ).length,
      }
    }, [orcamentos])

  return (
    <PageLayout title="Orçamentos">
      <NavigationButtons />

      <div className="mb-5 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Controle de propostas comerciais antes da geração da venda.
          </p>
        </div>

        <Link href="/orcamentos/novo">
          <Button>
            <FileText className="mr-2 h-4 w-4" />

            Novo Orçamento
          </Button>
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Total
            </CardDescription>

            <CardTitle>
              {resumo.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Pendentes
            </CardDescription>

            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-amber-600" />

              {
                resumo.pendentes
              }
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Vencendo em até 2 dias
            </CardDescription>

            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-orange-600" />

              {
                resumo.vencendo
              }
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Aprovados
            </CardDescription>

            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />

              {
                resumo.aprovados
              }
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Vencidos
            </CardDescription>

            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />

              {
                resumo.vencidos
              }
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Orçamentos Comerciais
          </CardTitle>

          <CardDescription>
            Consulte propostas por cliente, representada, status ou código.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
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
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      carregar()
                    }
                  }}
                  placeholder="Cliente, representada, descrição..."
                  className="pl-9"
                />
              </div>

              <Button
                variant="outline"
                onClick={
                  carregar
                }
              >
                Buscar
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS.map(
                (
                  item
                ) => (
                  <Button
                    key={
                      item
                    }
                    size="sm"
                    variant={
                      status ===
                      item
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setStatus(
                        item
                      )
                    }
                  >
                    {item}
                  </Button>
                )
              )}
            </div>
          </div>

          {erro && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />

              {erro}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Carregando orçamentos...
            </div>
          ) : orcamentos.length ===
            0 ? (
            <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nenhum orçamento encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {orcamentos.map(
                (
                  item
                ) => {
                  const codigo =
                    formatarCodigoOrcamento(
                      item.numeroSequencial
                    )

                  const dias =
                    diasRestantes(
                      item.validadeEm
                    )

                  const nomeCliente =
                    item.cliente.nomeFantasia ||
                    item.cliente.razaoSocial

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="rounded-lg border bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/orcamentos/${item.id}`}
                              className="font-mono text-sm font-bold text-blue-700 hover:underline"
                            >
                              {
                                codigo
                              }
                            </Link>

                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${classeStatus(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>

                            {item.status ===
                              "Pendente" &&
                              dias >=
                                0 &&
                              dias <=
                                2 && (
                                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                                  Vence em{" "}
                                  {
                                    dias
                                  }{" "}
                                  dia(s)
                                </span>
                              )}
                          </div>

                          <div className="grid gap-2 text-sm md:grid-cols-2">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Cliente
                              </span>

                              <Link
                                href={`/clientes/${item.cliente.id}`}
                                className="block font-medium text-blue-700 hover:underline"
                              >
                                {
                                  nomeCliente
                                }
                              </Link>
                            </div>

                            <div>
                              <span className="text-xs text-muted-foreground">
                                Representada
                              </span>

                              <Link
                                href={`/representadas/${item.representada.id}`}
                                className="block font-medium text-blue-700 hover:underline"
                              >
                                {
                                  item.representada.nome
                                }
                              </Link>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Emitido:{" "}
                              {formatarData(
                                item.data
                              )}
                            </span>

                            <span>
                              Validade:{" "}
                              {formatarData(
                                item.validadeEm
                              )}
                            </span>

                            <span>
                              Responsável:{" "}
                              {item.responsavel
                                ?.nome ||
                                "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-2 lg:items-end">
                          <div className="text-lg font-bold">
                            {formatarMoeda(
                              item.valorTotal
                            )}
                          </div>

                          <Link
                            href={`/orcamentos/${item.id}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Ver orçamento
                            </Button>
                          </Link>
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
    </PageLayout>
  )
}