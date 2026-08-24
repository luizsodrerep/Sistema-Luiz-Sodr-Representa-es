"use client"

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Factory,
  Loader2,
  Save,
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

type Orcamento = {
  id: string
  numeroSequencial: number
  clienteId: string
  representadaId: string
  interacaoOrigemId: string | null

  validadeEm: string

  valorTotal: number

  condicaoPagamento: string | null
  descricao: string | null
  observacoes: string | null

  status: string

  responsavelId: string | null
}

function numeroParaInput(
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

function dataParaInput(
  valor: string
) {
  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return ""
  }

  const ano =
    data.getFullYear()

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

export default function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } =
    use(params)

  const router =
    useRouter()

  const [
    orcamento,
    setOrcamento,
  ] =
    useState<Orcamento | null>(
      null
    )

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
    validadeEm,
    setValidadeEm,
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
    loading,
    setLoading,
  ] =
    useState(true)

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

  async function carregar() {
    try {
      setLoading(true)
      setErro(null)

      const [
        respostaOrcamento,
        respostaClientes,
        respostaRepresentadas,
      ] =
        await Promise.all([
          fetch(
            `/api/orcamentos/${id}`,
            {
              cache:
                "no-store",
            }
          ),

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

      const dadosOrcamento =
        await respostaOrcamento
          .json()
          .catch(
            () => null
          )

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
        !respostaOrcamento.ok
      ) {
        throw new Error(
          dadosOrcamento?.message ||
            "Não foi possível carregar o orçamento."
        )
      }

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

      setOrcamento(
        dadosOrcamento
      )

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

      setClienteId(
        dadosOrcamento.clienteId
      )

      setRepresentadaId(
        dadosOrcamento.representadaId
      )

      setValorTotal(
        numeroParaInput(
          dadosOrcamento.valorTotal
        )
      )

      setValidadeEm(
        dataParaInput(
          dadosOrcamento.validadeEm
        )
      )

      setCondicaoPagamento(
        dadosOrcamento.condicaoPagamento ||
          ""
      )

      setDescricao(
        dadosOrcamento.descricao ||
          ""
      )

      setObservacoes(
        dadosOrcamento.observacoes ||
          ""
      )
    } catch (error) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao carregar orçamento."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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

  async function salvar(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!orcamento) {
      return
    }

    if (!clienteId) {
      setErro(
        "Selecione o cliente."
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
        "Informe o valor total."
      )

      return
    }

    if (
      validadeEm.trim() ===
      ""
    ) {
      setErro(
        "Informe a validade."
      )

      return
    }

    try {
      setSalvando(true)
      setErro(null)

      const response =
        await fetch(
          `/api/orcamentos/${orcamento.id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                clienteId,
                representadaId,
                valorTotal,
                validadeEm,
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
            "Não foi possível salvar o orçamento."
        )

        return
      }

      router.push(
        `/orcamentos/${orcamento.id}`
      )

      router.refresh()
    } catch {
      setErro(
        "Erro de comunicação ao salvar o orçamento."
      )
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Editar Orçamento">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando orçamento...
        </div>
      </PageLayout>
    )
  }

  if (!orcamento) {
    return (
      <PageLayout title="Editar Orçamento">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />

          {erro ||
            "Orçamento não encontrado."}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Editar Orçamento">
      <div className="mb-5">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              `/orcamentos/${orcamento.id}`
            )
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          Voltar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {erro}
          </span>
        </div>
      )}

      <form
        onSubmit={
          salvar
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Dados Comerciais
              </CardTitle>

              <CardDescription>
                Alterações ficam registradas na auditoria do orçamento.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Cliente *
                </Label>

                <Select
                  value={
                    clienteId
                  }
                  onValueChange={
                    setClienteId
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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

                {clienteSelecionado && (
                  <div className="rounded-md border bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4 text-blue-600" />

                      {clienteSelecionado.nomeFantasia ||
                        clienteSelecionado.razaoSocial}
                    </div>

                    <p className="mt-1 text-muted-foreground">
                      CNPJ:{" "}
                      {clienteSelecionado.cnpj ||
                        "—"}
                    </p>
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
                    <SelectValue placeholder="Selecione..." />
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
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validadeEm">
                    Validade *
                  </Label>

                  <Input
                    id="validadeEm"
                    type="date"
                    value={
                      validadeEm
                    }
                    onChange={(
                      event
                    ) =>
                      setValidadeEm(
                        event.target.value
                      )
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">
                  Observações internas
                </Label>

                <Textarea
                  id="observacoes"
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
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                salvando
              }
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />

                  Salvar Alterações
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
                router.push(
                  `/orcamentos/${orcamento.id}`
                )
              }
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  )
}