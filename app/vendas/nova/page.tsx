"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  useRouter,
} from "next/navigation"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Factory,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  Save,
  ShoppingCart,
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
  comissao: number | null
}

type Orcamento = {
  id: string
  numeroSequencial: number

  clienteId: string
  representadaId: string

  valorTotal: number
  condicaoPagamento: string | null

  descricao: string | null
  observacoes: string | null

  status: string

  data: string
  validadeEm: string

  cliente: {
    id: string
    codigo: string | null
    razaoSocial: string
    nomeFantasia: string | null
    cnpj: string | null
  }

  representada: {
    id: string
    nome: string
    cnpj: string | null
    comissao?: number | null
  }

  vendaGerada?:
    | {
        id: string
      }
    | null
}

function formatarCodigoOrcamento(
  numero: number
) {
  return `ORC-${String(
    numero
  ).padStart(6, "0")}`
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

function dataHojeInput() {
  const agora =
    new Date()

  const ano =
    agora.getFullYear()

  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      agora.getDate()
    ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function converterValorBR(
  valor: string
) {
  const limpo =
    valor
      .trim()
      .replace(/\s/g, "")

  if (!limpo) {
    return null
  }

  let normalizado =
    limpo

  if (
    limpo.includes(",")
  ) {
    normalizado =
      limpo
        .replace(/\./g, "")
        .replace(",", ".")
  }

  const numero =
    Number(
      normalizado
    )

  if (
    !Number.isFinite(
      numero
    )
  ) {
    return null
  }

  return numero
}

function numeroParaInputBR(
  valor: number
) {
  return valor.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}

export default function NovaVendaPage() {
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
    orcamento,
    setOrcamento,
  ] =
    useState<
      Orcamento | null
    >(null)

  const [
    orcamentoOrigemId,
    setOrcamentoOrigemId,
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
    dataVenda,
    setDataVenda,
  ] =
    useState(
      dataHojeInput()
    )

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
    numeroPedido,
    setNumeroPedido,
  ] =
    useState("")

  const [
    numeroPedidoRepresentada,
    setNumeroPedidoRepresentada,
  ] =
    useState("")

  const [
    numeroOCCliente,
    setNumeroOCCliente,
  ] =
    useState("")

  const [
    produto,
    setProduto,
  ] =
    useState("")

  const [
    quantidade,
    setQuantidade,
  ] =
    useState("")

  const [
    desconto,
    setDesconto,
  ] =
    useState("")

  const [
    bonificacaoValor,
    setBonificacaoValor,
  ] =
    useState("")

  const [
    previsaoFaturamento,
    setPrevisaoFaturamento,
  ] =
    useState("")

  const [
    status,
    setStatus,
  ] =
    useState("Pendente")

  const [
    observacoes,
    setObservacoes,
  ] =
    useState("")

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    carregandoOrcamento,
    setCarregandoOrcamento,
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

  useEffect(() => {
    const parametros =
      new URLSearchParams(
        window.location.search
      )

    const id =
      parametros.get(
        "orcamentoId"
      )

    if (id) {
      setOrcamentoOrigemId(
        id
      )
    }
  }, [])

  useEffect(() => {
    async function carregarBase() {
      try {
        setCarregando(
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
              "Não foi possível carregar os clientes."
          )
        }

        if (
          !respostaRepresentadas.ok
        ) {
          throw new Error(
            dadosRepresentadas?.message ||
              "Não foi possível carregar as Representadas."
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
            : "Erro ao carregar dados da venda."
        )
      } finally {
        setCarregando(
          false
        )
      }
    }

    carregarBase()
  }, [])

  useEffect(() => {
    if (
      !orcamentoOrigemId
    ) {
      return
    }

    async function carregarOrcamento() {
      try {
        setCarregandoOrcamento(
          true
        )

        setErro(null)

        const response =
          await fetch(
            `/api/orcamentos/${orcamentoOrigemId}`,
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
              "Não foi possível carregar o orçamento de origem."
          )

          return
        }

        if (
          data.status !==
          "Aprovado"
        ) {
          setErro(
            "Somente orçamento aprovado pode ser convertido em venda."
          )

          return
        }

        if (
          data.vendaGerada
        ) {
          setErro(
            "Este orçamento já possui uma venda vinculada."
          )

          return
        }

        setOrcamento(
          data
        )

        setClienteId(
          data.clienteId
        )

        setRepresentadaId(
          data.representadaId
        )

        setValorTotal(
          numeroParaInputBR(
            Number(
              data.valorTotal
            )
          )
        )

        setCondicaoPagamento(
          data.condicaoPagamento ||
            ""
        )

        if (
          data.descricao
        ) {
          setObservacoes(
            `Origem ${formatarCodigoOrcamento(
              data.numeroSequencial
            )}: ${data.descricao}`
          )
        }
      } catch {
        setErro(
          "Erro ao carregar o orçamento de origem."
        )
      } finally {
        setCarregandoOrcamento(
          false
        )
      }
    }

    carregarOrcamento()
  }, [
    orcamentoOrigemId,
  ])

  const vendaViaOrcamento =
    Boolean(
      orcamentoOrigemId
    )

  const clientesDisponiveis =
    useMemo(
      () =>
        clientes.filter(
          (cliente) =>
            cliente.status ===
              "Ativo" &&
            Boolean(
              cliente.cnpj?.trim()
            )
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

  const valorNumerico =
    useMemo(
      () =>
        converterValorBR(
          valorTotal
        ),
      [valorTotal]
    )

  const percentualMatriz =
    representadaSelecionada
      ?.comissao ?? null

  const previsaoComissaoMatriz =
    useMemo(() => {
      if (
        valorNumerico ===
          null ||
        percentualMatriz ===
          null ||
        !Number.isFinite(
          Number(
            percentualMatriz
          )
        )
      ) {
        return null
      }

      const descontoNumero =
        converterValorBR(
          desconto
        ) || 0

      const bonificacaoNumero =
        converterValorBR(
          bonificacaoValor
        ) || 0

      const base =
        Math.max(
          valorNumerico -
            descontoNumero -
            bonificacaoNumero,
          0
        )

      return (
        base *
        Number(
          percentualMatriz
        )
      ) / 100
    }, [
      valorNumerico,
      percentualMatriz,
      desconto,
      bonificacaoValor,
    ])

  const podeSalvar =
    Boolean(
      clienteId &&
        representadaId &&
        dataVenda &&
        valorNumerico !==
          null &&
        valorNumerico >
          0 &&
        !salvando &&
        (!vendaViaOrcamento ||
          orcamento?.status ===
            "Aprovado")
    )

  async function salvarVenda(
    event: React.FormEvent
  ) {
    event.preventDefault()

    setErro(null)
    setSucesso(null)

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
        "Cliente selecionado não encontrado."
      )

      return
    }

    if (
      !clienteSelecionado.cnpj ||
      clienteSelecionado.cnpj.trim() ===
        ""
    ) {
      setErro(
        "O cliente precisa possuir CNPJ cadastrado para registrar venda."
      )

      return
    }

    if (!representadaId) {
      setErro(
        "Selecione a Representada."
      )

      return
    }

    if (!dataVenda) {
      setErro(
        "Informe a data da venda."
      )

      return
    }

    if (
      valorNumerico ===
        null ||
      valorNumerico <=
        0
    ) {
      setErro(
        "Informe um valor de venda válido e maior que zero."
      )

      return
    }

    if (
      vendaViaOrcamento &&
      !orcamento
    ) {
      setErro(
        "O orçamento de origem não foi carregado corretamente."
      )

      return
    }

    try {
      setSalvando(
        true
      )

      const descontoNumero =
        converterValorBR(
          desconto
        )

      const bonificacaoNumero =
        converterValorBR(
          bonificacaoValor
        )

      const quantidadeNumero =
        quantidade.trim() !==
        ""
          ? Number(
              quantidade
            )
          : null

      const response =
        await fetch(
          "/api/vendas",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orcamentoOrigemId:
                  orcamentoOrigemId ||
                  null,

                clienteId,

                representadaId,

                data:
                  dataVenda,

                valorTotal:
                  valorNumerico,

                condicaoPagamento,

                numeroPedido,

                numeroPedidoRepresentada,

                numeroOCCliente,

                produto,

                quantidade:
                  quantidadeNumero,

                desconto:
                  descontoNumero,

                bonificacaoValor:
                  bonificacaoNumero,

                previsaoFaturamento:
                  previsaoFaturamento ||
                  null,

                status,

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
        if (
          response.status ===
            409 &&
          data?.vendaId
        ) {
          setErro(
            "Este orçamento já foi convertido em venda."
          )

          return
        }

        setErro(
          data?.message ||
            "Não foi possível registrar a venda."
        )

        return
      }

      setSucesso(
        "Venda registrada com sucesso."
      )

      if (
        data?.id
      ) {
        router.push(
          `/vendas/${data.id}`
        )

        router.refresh()

        return
      }

      router.push(
        "/vendas"
      )
    } catch {
      setErro(
        "Erro de comunicação ao registrar a venda."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  if (
    carregando
  ) {
    return (
      <PageLayout title="Nova Venda">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando dados comerciais...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Nova Venda">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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

          <Link href="/vendas">
            <Button
              type="button"
              variant="outline"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />

              Vendas
            </Button>
          </Link>
        </div>

        <div
          className={`rounded-md border px-3 py-2 text-xs font-medium ${
            vendaViaOrcamento
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {vendaViaOrcamento
            ? "Venda originada de Orçamento"
            : "Venda direta / retroativa"}
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

      {carregandoOrcamento && (
        <div className="mb-4 flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando orçamento aprovado...
        </div>
      )}

      {orcamento && (
        <Card className="mb-4 border-green-200 bg-green-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck2 className="h-5 w-5 text-green-700" />

              Origem da Venda
            </CardTitle>

            <CardDescription>
              Esta venda está sendo criada a partir de um orçamento aprovado.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Orçamento
                </p>

                <Link
                  href={`/orcamentos/${orcamento.id}`}
                  className="font-mono text-sm font-bold text-blue-700 hover:underline"
                >
                  {formatarCodigoOrcamento(
                    orcamento.numeroSequencial
                  )}
                </Link>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="text-sm font-semibold text-green-700">
                  {
                    orcamento.status
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Valor aprovado
                </p>

                <p className="text-sm font-semibold">
                  {formatarMoeda(
                    Number(
                      orcamento.valorTotal
                    )
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Validade
                </p>

                <p className="text-sm">
                  {formatarData(
                    orcamento.validadeEm
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-md border bg-white p-3 text-xs text-muted-foreground">
              Cliente, Representada, valor e condição de pagamento são preservados pelo servidor conforme o orçamento aprovado.
            </div>
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={
          salvarVenda
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Dados da Venda
                </CardTitle>

                <CardDescription>
                  Registre pedidos atuais ou retroativos. A data informada representa a data real da venda.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Cliente *
                  </Label>

                  {vendaViaOrcamento ? (
                    <div className="rounded-md border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Building2 className="h-4 w-4 text-blue-600" />

                        {orcamento?.cliente
                          ? orcamento.cliente.nomeFantasia ||
                            orcamento.cliente.razaoSocial
                          : "Carregando cliente..."}
                      </div>

                      {orcamento?.cliente && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {orcamento.cliente.codigo
                            ? `${orcamento.cliente.codigo} — `
                            : ""}
                          CNPJ:{" "}
                          {orcamento.cliente.cnpj ||
                            "não informado"}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-green-700">
                        Definido pelo orçamento aprovado.
                      </p>
                    </div>
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

                  {!vendaViaOrcamento &&
                    clientesDisponiveis.length ===
                      0 && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Nenhum cliente ativo com CNPJ está disponível para venda.
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Representada *
                  </Label>

                  {vendaViaOrcamento ? (
                    <div className="rounded-md border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Factory className="h-4 w-4 text-orange-600" />

                        {orcamento?.representada
                          ?.nome ||
                          "Carregando Representada..."}
                      </div>

                      <p className="mt-2 text-xs text-green-700">
                        Definida pelo orçamento aprovado.
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={
                        representadaId
                      }
                      onValueChange={
                        setRepresentadaId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Representada..." />
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
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataVenda">
                      Data da Venda *
                    </Label>

                    <Input
                      id="dataVenda"
                      type="date"
                      value={
                        dataVenda
                      }
                      onChange={(
                        event
                      ) =>
                        setDataVenda(
                          event.target.value
                        )
                      }
                    />

                    <p className="text-xs text-muted-foreground">
                      Aceita datas anteriores para lançamento retroativo.
                    </p>
                  </div>

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
                      inputMode="decimal"
                      placeholder="Ex.: 12.500,00"
                      disabled={
                        vendaViaOrcamento
                      }
                    />
                  </div>
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
                    placeholder="Ex.: 28/35/42 dias"
                    disabled={
                      vendaViaOrcamento
                    }
                  />

                  {vendaViaOrcamento && (
                    <p className="text-xs text-green-700">
                      Condição preservada do orçamento aprovado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Identificação do Pedido
                </CardTitle>

                <CardDescription>
                  Informações utilizadas para rastrear o pedido junto ao Cliente e à Representada.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPedido">
                      Número do Pedido
                    </Label>

                    <Input
                      id="numeroPedido"
                      value={
                        numeroPedido
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroPedido(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroPedidoRepresentada">
                      Pedido Representada
                    </Label>

                    <Input
                      id="numeroPedidoRepresentada"
                      value={
                        numeroPedidoRepresentada
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroPedidoRepresentada(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroOCCliente">
                      OC do Cliente
                    </Label>

                    <Input
                      id="numeroOCCliente"
                      value={
                        numeroOCCliente
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroOCCliente(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="produto">
                      Produto / resumo
                    </Label>

                    <Input
                      id="produto"
                      value={
                        produto
                      }
                      onChange={(
                        event
                      ) =>
                        setProduto(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">
                      Quantidade
                    </Label>

                    <Input
                      id="quantidade"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        quantidade
                      }
                      onChange={(
                        event
                      ) =>
                        setQuantidade(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Ajustes Comerciais
                </CardTitle>

                <CardDescription>
                  Desconto e bonificação reduzem a base prevista de comissão.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="desconto">
                      Desconto (R$)
                    </Label>

                    <Input
                      id="desconto"
                      value={
                        desconto
                      }
                      onChange={(
                        event
                      ) =>
                        setDesconto(
                          event.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonificacaoValor">
                      Bonificação sem comissão (R$)
                    </Label>

                    <Input
                      id="bonificacaoValor"
                      value={
                        bonificacaoValor
                      }
                      onChange={(
                        event
                      ) =>
                        setBonificacaoValor(
                          event.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previsaoFaturamento">
                    Previsão de faturamento
                  </Label>

                  <Input
                    id="previsaoFaturamento"
                    type="date"
                    value={
                      previsaoFaturamento
                    }
                    onChange={(
                      event
                    ) =>
                      setPrevisaoFaturamento(
                        event.target.value
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Observações
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
                  rows={5}
                  placeholder="Informações comerciais, histórico, faturamento já realizado ou observações da venda..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Situação Inicial
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Label>
                  Status
                </Label>

                <Select
                  value={
                    status
                  }
                  onValueChange={
                    setStatus
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Pendente">
                      Pendente
                    </SelectItem>

                    <SelectItem value="Confirmado">
                      Confirmado
                    </SelectItem>

                    <SelectItem value="Faturado">
                      Faturado
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="rounded-md border bg-slate-50 p-3 text-xs text-muted-foreground">
                  Para vendas retroativas já entregues/faturadas, o status poderá refletir a situação real informada.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Comissão Prevista
                </CardTitle>

                <CardDescription>
                  A API define a regra oficial no momento do salvamento.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {percentualMatriz !==
                null ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Percentual da matriz
                      </p>

                      <p className="text-lg font-bold">
                        {Number(
                          percentualMatriz
                        ).toLocaleString(
                          "pt-BR",
                          {
                            maximumFractionDigits: 4,
                          }
                        )}
                        %
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prévia pela matriz
                      </p>

                      <p className="text-lg font-bold">
                        {previsaoComissaoMatriz !==
                        null
                          ? formatarMoeda(
                              previsaoComissaoMatriz
                            )
                          : "—"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      Nenhum percentual padrão está disponível na matriz da Representada.
                    </span>
                  </div>
                )}

                <div className="rounded-md border bg-blue-50 p-3 text-xs text-blue-800">
                  Se existir regra comercial específica ou padrão vigente, o servidor dará prioridade a ela. A comissão exibida aqui é apenas uma prévia.
                </div>
              </CardContent>
            </Card>

            {clienteSelecionado && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Cliente
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium">
                    {clienteSelecionado.nomeFantasia ||
                      clienteSelecionado.razaoSocial}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    CNPJ:{" "}
                    {clienteSelecionado.cnpj ||
                      "não informado"}
                  </p>
                </CardContent>
              </Card>
            )}

            {representadaSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Representada
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium">
                    {
                      representadaSelecionada.nome
                    }
                  </p>

                  {representadaSelecionada.cnpj && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      CNPJ:{" "}
                      {
                        representadaSelecionada.cnpj
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  Fluxo
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />

                    Data real da venda
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />

                    {vendaViaOrcamento
                      ? "ORC aprovado vinculado"
                      : "Venda direta / retroativa"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    Auditoria registrada no servidor
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={
              !podeSalvar
            }
          >
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Registrando Venda...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />

                Registrar Venda
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