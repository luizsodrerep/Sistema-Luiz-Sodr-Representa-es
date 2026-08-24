"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import Link from "next/link"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Factory,
  FileText,
  Info,
  Loader2,
  Pencil,
} from "lucide-react"

import {
  PageLayout,
} from "@/components/page-layout"

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
  Label,
} from "@/components/ui/label"

import {
  Textarea,
} from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type Representada = {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  status: string
}

type InteracaoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  assunto: string | null
  data: string

  clienteId: string | null
  representadaId: string | null

  cliente:
    | {
        id: string
        razaoSocial: string
        nomeFantasia: string | null
      }
    | null

  representada:
    | {
        id: string
        nome: string
      }
    | null
}

type RegraComercial = {
  id: string

  clienteId: string | null

  nome: string
  tipoEscopo: string

  vigenciaInicio: string
  vigenciaFim: string | null

  ativa: boolean

  pedidoMinimo: number | null
  minimoParcela: number | null

  prazoEntregaDias: number | null
  prazoFaturamentoDias: number | null

  frete: string | null
  regiao: string | null

  observacoes: string | null
}

function formatarCodigoInteracao(
  numero: number
) {
  return `INT-${String(numero).padStart(
    6,
    "0"
  )}`
}

function formatarData(
  valor: string
) {
  const data = new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
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

function formatarDataSimples(
  data: Date
) {
  return data.toLocaleDateString(
    "pt-BR"
  )
}

function formatarMoeda(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "—"
  }

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )
}

function calcularValidadePadrao() {
  const data = new Date()

  data.setDate(
    data.getDate() + 7
  )

  return data
}

function regraVigente(
  regra: RegraComercial
) {
  if (!regra.ativa) {
    return false
  }

  const agora = new Date()

  const inicio =
    new Date(
      regra.vigenciaInicio
    )

  if (
    Number.isNaN(
      inicio.getTime()
    ) ||
    inicio > agora
  ) {
    return false
  }

  if (
    regra.vigenciaFim
  ) {
    const fim =
      new Date(
        regra.vigenciaFim
      )

    if (
      !Number.isNaN(
        fim.getTime()
      ) &&
      fim < agora
    ) {
      return false
    }
  }

  return true
}

export default function NovoOrcamentoPage() {
  const router =
    useRouter()

  const [
    clientes,
    setClientes,
  ] =
    useState<Cliente[]>(
      []
    )

  const [
    representadas,
    setRepresentadas,
  ] =
    useState<
      Representada[]
    >([])

  const [
    regrasComerciais,
    setRegrasComerciais,
  ] =
    useState<
      RegraComercial[]
    >([])

  const [
    interacaoOrigem,
    setInteracaoOrigem,
  ] =
    useState<
      InteracaoOrigem | null
    >(null)

  const [
    interacaoOrigemId,
    setInteracaoOrigemId,
  ] =
    useState<
      string | null
    >(null)

  const [
    clienteId,
    setClienteId,
  ] =
    useState("")

  const [
    representadaId,
    setRepresentadaId,
  ] =
    useState("")

  const [
    valorTotal,
    setValorTotal,
  ] =
    useState("")

  const [
    condicaoPagamento,
    setCondicaoPagamento,
  ] =
    useState("")

  const [
    descricao,
    setDescricao,
  ] =
    useState("")

  const [
    observacoes,
    setObservacoes,
  ] =
    useState("")

  const [
    loadingInicial,
    setLoadingInicial,
  ] =
    useState(true)

  const [
    loadingRegras,
    setLoadingRegras,
  ] =
    useState(false)

  const [
    salvando,
    setSalvando,
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
    sucesso,
    setSucesso,
  ] =
    useState<
      string | null
    >(null)

  const validadePadrao =
    useMemo(
      () =>
        calcularValidadePadrao(),
      []
    )

  useEffect(() => {
    const parametros =
      new URLSearchParams(
        window.location.search
      )

    const id =
      parametros.get(
        "interacaoId"
      )

    if (id) {
      setInteracaoOrigemId(
        id
      )
    }
  }, [])

  useEffect(() => {
    async function carregarBase() {
      try {
        setLoadingInicial(
          true
        )

        setErro(null)

        const [
          respostaClientes,
          respostaRepresentadas,
        ] =
          await Promise.all([
            fetch(
              "/api/clientes",
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/representadas",
              {
                cache:
                  "no-store",
              }
            ),
          ])

        const dadosClientes =
          await respostaClientes
            .json()
            .catch(
              () => []
            )

        const dadosRepresentadas =
          await respostaRepresentadas
            .json()
            .catch(
              () => []
            )

        if (
          !respostaClientes.ok
        ) {
          throw new Error(
            dadosClientes?.message ||
              "Erro ao carregar clientes."
          )
        }

        if (
          !respostaRepresentadas.ok
        ) {
          throw new Error(
            dadosRepresentadas?.message ||
              "Erro ao carregar representadas."
          )
        }

        setClientes(
          Array.isArray(
            dadosClientes
          )
            ? dadosClientes
            : []
        )

        setRepresentadas(
          Array.isArray(
            dadosRepresentadas
          )
            ? dadosRepresentadas
            : []
        )
      } catch (error) {
        setErro(
          error instanceof
            Error
            ? error.message
            : "Erro ao carregar dados para o orçamento."
        )
      } finally {
        setLoadingInicial(
          false
        )
      }
    }

    carregarBase()
  }, [])

  useEffect(() => {
    if (
      !interacaoOrigemId
    ) {
      return
    }

    async function carregarInteracao() {
      try {
        const response =
          await fetch(
            `/api/interacoes/${interacaoOrigemId}`,
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
              "Não foi possível carregar a interação de origem."
          )

          return
        }

        setInteracaoOrigem(
          data
        )

        if (
          data?.cliente?.id
        ) {
          setClienteId(
            data.cliente.id
          )
        } else if (
          data?.clienteId
        ) {
          setClienteId(
            data.clienteId
          )
        } else {
          setErro(
            "Esta interação não está vinculada a um cliente."
          )
        }

        if (
          data?.representada?.id
        ) {
          setRepresentadaId(
            data.representada.id
          )
        } else if (
          data?.representadaId
        ) {
          setRepresentadaId(
            data.representadaId
          )
        }
      } catch {
        setErro(
          "Erro ao carregar a interação de origem."
        )
      }
    }

    carregarInteracao()
  }, [
    interacaoOrigemId,
  ])

  useEffect(() => {
    if (
      !representadaId
    ) {
      setRegrasComerciais(
        []
      )

      return
    }

    async function carregarRegras() {
      try {
        setLoadingRegras(
          true
        )

        const response =
          await fetch(
            `/api/representadas/${representadaId}/regras-comerciais`,
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
          setRegrasComerciais(
            []
          )

          return
        }

        setRegrasComerciais(
          Array.isArray(
            data
          )
            ? data
            : []
        )
      } catch {
        setRegrasComerciais(
          []
        )
      } finally {
        setLoadingRegras(
          false
        )
      }
    }

    carregarRegras()
  }, [
    representadaId,
  ])

  const clientesDisponiveis =
    useMemo(
      () =>
        clientes.filter(
          (cliente) =>
            cliente.status ===
            "Ativo"
        ),
      [clientes]
    )

  const representadasDisponiveis =
    useMemo(
      () =>
        representadas.filter(
          (representada) =>
            representada.status ===
            "Ativa"
        ),
      [representadas]
    )

  const clienteSelecionado =
    useMemo(
      () =>
        clientes.find(
          (cliente) =>
            cliente.id ===
            clienteId
        ) || null,
      [
        clientes,
        clienteId,
      ]
    )

  const representadaSelecionada =
    useMemo(
      () =>
        representadas.find(
          (representada) =>
            representada.id ===
            representadaId
        ) || null,
      [
        representadas,
        representadaId,
      ]
    )

  const clienteTemCnpj =
    Boolean(
      clienteSelecionado
        ?.cnpj
        ?.trim()
    )

  const regraAplicavel =
    useMemo(() => {
      const vigentes =
        regrasComerciais.filter(
          regraVigente
        )

      const especifica =
        vigentes.find(
          (regra) =>
            regra.clienteId ===
            clienteId
        )

      if (especifica) {
        return especifica
      }

      return (
        vigentes.find(
          (regra) =>
            regra.tipoEscopo ===
              "Padrao" &&
            !regra.clienteId
        ) || null
      )
    }, [
      regrasComerciais,
      clienteId,
    ])

  const formularioPodeSalvar =
    Boolean(
      clienteId &&
        clienteTemCnpj &&
        representadaId &&
        valorTotal.trim() !==
          "" &&
        !salvando
    )

  async function salvar(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!clienteId) {
      setErro(
        "Selecione o cliente."
      )

      return
    }

    if (
      !clienteSelecionado
    ) {
      setErro(
        "Cliente selecionado não foi localizado."
      )

      return
    }

    if (
      !clienteTemCnpj
    ) {
      setErro(
        "O cliente precisa possuir CNPJ cadastrado para gerar orçamento comercial."
      )

      return
    }

    if (!representadaId) {
      setErro(
        "Selecione a representada."
      )

      return
    }

    if (
      valorTotal.trim() ===
      ""
    ) {
      setErro(
        "Informe o valor total do orçamento."
      )

      return
    }

    try {
      setSalvando(true)
      setErro(null)
      setSucesso(null)

      const response =
        await fetch(
          "/api/orcamentos",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                clienteId,
                representadaId,

                interacaoOrigemId:
                  interacaoOrigemId ||
                  null,

                valorTotal,

                condicaoPagamento,
                descricao,
                observacoes,
              }),
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
            "Não foi possível criar o orçamento."
        )

        return
      }

      setSucesso(
        "Orçamento criado com sucesso."
      )

      if (data?.id) {
        router.push(
          `/orcamentos/${data.id}`
        )

        router.refresh()

        return
      }

      router.push(
        "/orcamentos"
      )
    } catch {
      setErro(
        "Erro de comunicação ao criar o orçamento."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  if (
    loadingInicial
  ) {
    return (
      <PageLayout title="Novo Orçamento">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando dados comerciais...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Novo Orçamento">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.back()
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          Voltar
        </Button>

        <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
          Validade padrão:{" "}
          <strong className="text-slate-700">
            7 dias corridos
          </strong>
        </div>
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {erro}
          </span>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />

          {sucesso}
        </div>
      )}

      {interacaoOrigem && (
        <Card className="mb-4 border-blue-200 bg-blue-50/40">
          <CardHeader>
            <CardTitle className="text-base">
              Origem deste orçamento
            </CardTitle>

            <CardDescription>
              Este orçamento será rastreado a partir da interação comercial abaixo.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Interação
                </p>

                <p className="font-mono text-sm font-semibold">
                  {formatarCodigoInteracao(
                    interacaoOrigem.numeroSequencial
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Tipo
                </p>

                <p className="text-sm font-medium">
                  {
                    interacaoOrigem.tipo
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Registrada em
                </p>

                <p className="text-sm">
                  {formatarData(
                    interacaoOrigem.data
                  )}
                </p>
              </div>
            </div>

            {interacaoOrigem.assunto && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">
                  Assunto
                </p>

                <p className="text-sm">
                  {
                    interacaoOrigem.assunto
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={
          salvar
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Dados Comerciais
                </CardTitle>

                <CardDescription>
                  Cliente e Representada envolvidos na proposta.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Cliente *
                  </Label>

                  {interacaoOrigemId ? (
                    clienteSelecionado ? (
                      <div
                        className={`rounded-md border p-4 ${
                          clienteTemCnpj
                            ? "bg-slate-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 className="h-4 w-4 text-blue-600" />

                          {clienteSelecionado.nomeFantasia ||
                            clienteSelecionado.razaoSocial}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {clienteSelecionado.codigo
                            ? `${clienteSelecionado.codigo} — `
                            : ""}
                          CNPJ:{" "}
                          {clienteSelecionado.cnpj ||
                            "não informado"}
                        </p>

                        {clienteTemCnpj ? (
                          <p className="mt-2 text-xs text-blue-700">
                            Cliente definido automaticamente pela interação de origem.
                          </p>
                        ) : (
                          <div className="mt-3 rounded-md border border-red-200 bg-white p-3">
                            <p className="text-sm font-medium text-red-700">
                              Cadastro comercial incompleto
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                              Este cliente não possui CNPJ cadastrado. O orçamento não pode ser criado enquanto o cadastro comercial não for completado.
                            </p>

                            <Link
                              href={`/clientes/${clienteSelecionado.id}/editar`}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                              >
                                <Pencil className="mr-2 h-4 w-4" />

                                Completar cadastro do Cliente
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Não foi possível identificar o cliente da interação.
                      </div>
                    )
                  ) : (
                    <Select
                      value={
                        clienteId
                      }
                      onValueChange={
                        setClienteId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente..." />
                      </SelectTrigger>

                      <SelectContent>
                        {clientesDisponiveis.map(
                          (
                            cliente
                          ) => (
                            <SelectItem
                              key={
                                cliente.id
                              }
                              value={
                                cliente.id
                              }
                            >
                              {cliente.nomeFantasia ||
                                cliente.razaoSocial}
                              {cliente.codigo
                                ? ` — ${cliente.codigo}`
                                : ""}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {!interacaoOrigemId &&
                    clienteSelecionado &&
                    !clienteTemCnpj && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-700">
                          Cliente sem CNPJ cadastrado.
                        </p>

                        <Link
                          href={`/clientes/${clienteSelecionado.id}/editar`}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            <Pencil className="mr-2 h-4 w-4" />

                            Completar cadastro
                          </Button>
                        </Link>
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Representada *
                  </Label>

                  <Select
                    value={
                      representadaId
                    }
                    onValueChange={
                      setRepresentadaId
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a representada..." />
                    </SelectTrigger>

                    <SelectContent>
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
                            {representada.codigo
                              ? ` — ${representada.codigo}`
                              : ""}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  {representadaSelecionada && (
                    <div className="rounded-md border bg-slate-50 p-3 text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <Factory className="h-4 w-4 text-orange-600" />

                        {
                          representadaSelecionada.nome
                        }
                      </div>

                      {representadaSelecionada.cnpj && (
                        <p className="mt-1 text-muted-foreground">
                          CNPJ:{" "}
                          {
                            representadaSelecionada.cnpj
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {representadaId && (
                  <div className="space-y-2">
                    <Label>
                      Política comercial aplicável
                    </Label>

                    {loadingRegras ? (
                      <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Consultando regras da Representada...
                      </div>
                    ) : regraAplicavel ? (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <p className="font-medium text-green-900">
                          {
                            regraAplicavel.nome
                          }
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                          {regraAplicavel.clienteId
                            ? "Regra específica deste Cliente"
                            : "Regra padrão da Representada"}
                        </p>

                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Pedido mínimo
                            </p>

                            <p className="font-medium">
                              {formatarMoeda(
                                regraAplicavel.pedidoMinimo
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Parcela mínima
                            </p>

                            <p className="font-medium">
                              {formatarMoeda(
                                regraAplicavel.minimoParcela
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Prazo de entrega
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.prazoEntregaDias !== null
                                ? `${regraAplicavel.prazoEntregaDias} dia(s)`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Prazo de faturamento
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.prazoFaturamentoDias !== null
                                ? `${regraAplicavel.prazoFaturamentoDias} dia(s)`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Frete
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.frete ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Região
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.regiao ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                          <p className="font-medium">
                            Nenhuma regra comercial ativa encontrada.
                          </p>

                          <p className="mt-1 text-xs">
                            O orçamento pode continuar normalmente. Nenhuma condição comercial será presumida pelo sistema.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="valorTotal">
                    Valor total *
                  </Label>

                  <Input
                    id="valorTotal"
                    value={
                      valorTotal
                    }
                    onChange={(
                      event
                    ) =>
                      setValorTotal(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: 12.500,00"
                    inputMode="decimal"
                    disabled={
                      !clienteTemCnpj
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicaoPagamento">
                    Condição de pagamento
                  </Label>

                  <Input
                    id="condicaoPagamento"
                    value={
                      condicaoPagamento
                    }
                    onChange={(
                      event
                    ) =>
                      setCondicaoPagamento(
                        event.target.value
                      )
                    }
                    placeholder="Enquanto não houver política cadastrada, informe manualmente."
                    disabled={
                      !clienteTemCnpj
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    Descrição / escopo do orçamento
                  </Label>

                  <Textarea
                    id="descricao"
                    value={
                      descricao
                    }
                    onChange={(
                      event
                    ) =>
                      setDescricao(
                        event.target.value
                      )
                    }
                    rows={5}
                    disabled={
                      !clienteTemCnpj
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Observações internas
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Textarea
                  value={
                    observacoes
                  }
                  onChange={(
                    event
                  ) =>
                    setObservacoes(
                      event.target.value
                    )
                  }
                  rows={4}
                  disabled={
                    !clienteTemCnpj
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Prazo
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-md border bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-amber-700" />

                    <span className="font-semibold">
                      7 dias corridos
                    </span>
                  </div>

                  <p className="mt-2 text-sm">
                    Validade prevista até:
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {formatarDataSimples(
                      validadePadrao
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={
              !formularioPodeSalvar
            }
          >
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Criando orçamento...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />

                Criar Orçamento
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={
              salvando
            }
            onClick={() =>
              router.back()
            }
          >
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}