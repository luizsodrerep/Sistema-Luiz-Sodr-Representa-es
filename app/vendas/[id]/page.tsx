"use client"

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Factory,
  FileCheck2,
  FileText,
  History,
  Home,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  ShoppingCart,
  User,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Textarea,
} from "@/components/ui/textarea"

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type RegraComercial = {
  id: string
  nome: string
  tipoEscopo: string
  percentualComissao: number | null
}

type Faturamento = {
  id: string
  numeroNF: string | null
  dataFaturamento: string
  valorFaturado: number
  faturamentoParcial: boolean
  status: string
}

type ComissaoMovimento = {
  id: string
  tipo: string
  data: string
  valor: number
  percentual: number | null
  status: string
  descricao: string | null
}

type VendaEvento = {
  id: string
  vendaId: string
  usuarioId: string | null
  data: string
  tipo: string
  canal: string | null
  referencia: string | null
  descricao: string | null
  criadoEm: string

  usuario: {
    id: string
    nome: string
    perfil: string
  } | null
}

type Venda = {
  id: string
  numeroSequencial: number
  data: string

  numeroPedidoInterno: string | null
  numeroPedido: string | null
  numeroPedidoRepresentada: string | null
  numeroOCCliente: string | null

  produto: string | null
  quantidade: number | null

  valorTotal: number | null
  desconto: number | null
  bonificacaoValor: number | null

  comissao: number | null
  percentualComissaoAplicado: number | null
  baseCalculoComissao: number | null
  valorComissaoPrevista: number | null
  regraReconhecimentoComissao: string | null

  condicaoPagamento: string | null
  previsaoFaturamento: string | null

  pedidoEnviadoEm: string | null
  confirmadoEm: string | null
  canceladoEm: string | null

  motivoCancelamento: string | null
  status: string
  observacoes: string | null

  criadoEm: string
  atualizadoEm: string

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

  regraComercial: RegraComercial | null

  orcamentoOrigem:
    | {
        id: string
        numeroSequencial: number
        status: string

        interacaoOrigem:
          | {
              id: string
              numeroSequencial: number
              tipo: string
              assunto: string | null
            }
          | null
      }
    | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null

  faturamentos: Faturamento[]
  comissoes: ComissaoMovimento[]
}

const CANAIS_EVENTO = [
  "E-mail",
  "WhatsApp",
  "Ligação",
  "Portal",
  "Presencial",
  "Outro",
]

function formatarCodigoVenda(numero: number) {
  return `VEN-${String(numero).padStart(6, "0")}`
}

function formatarCodigoOrcamento(numero: number) {
  return `ORC-${String(numero).padStart(6, "0")}`
}

function formatarCodigoInteracao(numero: number) {
  return `INT-${String(numero).padStart(6, "0")}`
}

function formatarMoeda(valor: number | null) {
  if (valor === null || valor === undefined) {
    return "—"
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatarData(valor: string | null) {
  if (!valor) {
    return "—"
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return "—"
  }

  return data.toLocaleDateString("pt-BR")
}

function formatarDataHora(valor: string | null) {
  if (!valor) {
    return "—"
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return "—"
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function classeStatus(status: string) {
  if (
    status === "Faturado" ||
    status === "Confirmado"
  ) {
    return "bg-green-100 text-green-800"
  }

  if (status === "Aguardando confirmação") {
    return "bg-blue-100 text-blue-800"
  }

  if (status === "Aguardando envio") {
    return "bg-amber-100 text-amber-800"
  }

  if (status === "Cancelado") {
    return "bg-red-100 text-red-800"
  }

  return "bg-slate-100 text-slate-800"
}

function dataHoraLocalInput() {
  const agora = new Date()

  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  const dia = String(agora.getDate()).padStart(2, "0")
  const hora = String(agora.getHours()).padStart(2, "0")
  const minuto = String(agora.getMinutes()).padStart(2, "0")

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`
}

export default function VendaDetalhesPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = use(params)

  const [venda, setVenda] =
    useState<Venda | null>(null)

  const [eventos, setEventos] =
    useState<VendaEvento[]>([])

  const [loading, setLoading] =
    useState(true)

  const [salvandoEvento, setSalvandoEvento] =
    useState(false)

  const [erro, setErro] =
    useState<string | null>(null)

  const [sucesso, setSucesso] =
    useState<string | null>(null)

  const [modoEvento, setModoEvento] =
    useState<
      | "envio"
      | "confirmacao"
      | "pedido"
      | "contato"
    >("envio")

  const [canalEvento, setCanalEvento] =
    useState("E-mail")

  const [referenciaEvento, setReferenciaEvento] =
    useState("")

  const [descricaoEvento, setDescricaoEvento] =
    useState("")

  const [dataEvento, setDataEvento] =
    useState(dataHoraLocalInput())

  async function carregar() {
    try {
      setLoading(true)
      setErro(null)

      const [
        respostaVenda,
        respostaEventos,
      ] = await Promise.all([
        fetch(
          `/api/vendas/${id}`,
          {
            cache: "no-store",
          }
        ),

        fetch(
          `/api/vendas/${id}/eventos`,
          {
            cache: "no-store",
          }
        ),
      ])

      const dadosVenda =
        await respostaVenda
          .json()
          .catch(() => null)

      const dadosEventos =
        await respostaEventos
          .json()
          .catch(() => [])

      if (!respostaVenda.ok) {
        setErro(
          dadosVenda?.message ||
            "Não foi possível carregar a venda."
        )

        return
      }

      setVenda(dadosVenda)

      setEventos(
        respostaEventos.ok &&
          Array.isArray(dadosEventos)
          ? dadosEventos
          : []
      )

      if (
        dadosVenda.status ===
        "Aguardando confirmação"
      ) {
        setModoEvento("confirmacao")
      } else if (
        dadosVenda.status ===
        "Confirmado"
      ) {
        setModoEvento("contato")
      } else {
        setModoEvento("envio")
      }
    } catch {
      setErro(
        "Erro ao carregar venda."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const totalFaturado =
    useMemo(() => {
      if (!venda) {
        return 0
      }

      return venda.faturamentos.reduce(
        (total, item) =>
          total +
          Number(
            item.valorFaturado || 0
          ),
        0
      )
    }, [venda])

  const saldo =
    useMemo(() => {
      if (!venda) {
        return 0
      }

      return Math.max(
        Number(
          venda.valorTotal || 0
        ) -
          totalFaturado,
        0
      )
    }, [
      venda,
      totalFaturado,
    ])

  const possuiEnvio =
    eventos.some(
      (evento) =>
        evento.tipo ===
        "Pedido enviado"
    )

  function tipoEventoAtual() {
    if (
      modoEvento === "confirmacao"
    ) {
      return "Recebimento confirmado"
    }

    if (
      modoEvento === "pedido"
    ) {
      return "Pedido registrado"
    }

    if (
      modoEvento === "contato"
    ) {
      return "Contato com Representada"
    }

    return "Pedido enviado"
  }

  async function registrarEvento(
    event: React.FormEvent
  ) {
    event.preventDefault()

    setErro(null)
    setSucesso(null)

    const tipo =
      tipoEventoAtual()

    if (
      tipo === "Pedido enviado" &&
      !canalEvento
    ) {
      setErro(
        "Informe o canal utilizado para enviar o pedido."
      )

      return
    }

    if (
      tipo ===
        "Recebimento confirmado" &&
      !referenciaEvento.trim() &&
      !descricaoEvento.trim()
    ) {
      setErro(
        "Informe uma referência, protocolo, número ou descrição que identifique a confirmação recebida da Representada."
      )

      return
    }

    try {
      setSalvandoEvento(true)

      const response =
        await fetch(
          `/api/vendas/${id}/eventos`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                tipo,
                canal:
                  canalEvento ||
                  null,

                referencia:
                  referenciaEvento ||
                  null,

                descricao:
                  descricaoEvento ||
                  null,

                data:
                  dataEvento
                    ? new Date(
                        dataEvento
                      ).toISOString()
                    : new Date().toISOString(),
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {
        setErro(
          data?.message ||
            "Não foi possível registrar o evento."
        )

        return
      }

      setSucesso(
        "Evento registrado com sucesso."
      )

      setReferenciaEvento("")
      setDescricaoEvento("")
      setDataEvento(
        dataHoraLocalInput()
      )

      await carregar()
    } catch {
      setErro(
        "Erro de comunicação ao registrar o evento."
      )
    } finally {
      setSalvandoEvento(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Venda">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando venda...
        </div>
      </PageLayout>
    )
  }

  if (erro && !venda) {
    return (
      <PageLayout title="Venda">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>

          <Link href="/vendas">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Vendas
            </Button>
          </Link>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {erro}
        </div>
      </PageLayout>
    )
  }

  if (!venda) {
    return null
  }

  const codigoVenda =
    formatarCodigoVenda(
      venda.numeroSequencial
    )

  const nomeCliente =
    venda.cliente.nomeFantasia ||
    venda.cliente.razaoSocial

  const origemOrcamento =
    venda.orcamentoOrigem

  return (
    <PageLayout title="Detalhes da Venda">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>

          <Link href="/vendas">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Vendas
            </Button>
          </Link>
        </div>

        <Button
          variant="outline"
          onClick={carregar}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {sucesso}
        </div>
      )}

      <div className="mb-4 rounded-lg border bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código permanente da Venda
            </p>

            <p className="mt-1 font-mono text-2xl font-bold">
              {codigoVenda}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${classeStatus(
              venda.status
            )}`}
          >
            {venda.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Dados Comerciais
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cliente
                  </p>

                  <Link
                    href={`/clientes/${venda.cliente.id}`}
                    className="mt-1 flex items-center gap-2 font-medium text-blue-700 hover:underline"
                  >
                    <Building2 className="h-4 w-4" />
                    {nomeCliente}
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground">
                    CNPJ:{" "}
                    {venda.cliente.cnpj ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Representada
                  </p>

                  <Link
                    href={`/representadas/${venda.representada.id}`}
                    className="mt-1 flex items-center gap-2 font-medium text-blue-700 hover:underline"
                  >
                    <Factory className="h-4 w-4" />
                    {venda.representada.nome}
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Data da venda
                  </p>

                  <p className="mt-1 flex items-center gap-2 font-medium">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    {formatarData(
                      venda.data
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Valor total
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {formatarMoeda(
                      venda.valorTotal
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Condição de pagamento
                  </p>

                  <p className="mt-1 font-medium">
                    {venda.condicaoPagamento ||
                      "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              venda.status ===
              "Aguardando confirmação"
                ? "border-blue-300"
                : undefined
            }
          >
            <CardHeader>
              <CardTitle>
                Próxima Ação Comercial
              </CardTitle>

              <CardDescription>
                O sistema destaca a ação correspondente ao estágio atual da Venda.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {venda.status ===
                "Aguardando envio" && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">
                    Pedido ainda não enviado à Representada
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Registre o primeiro envio abaixo.
                  </p>
                </div>
              )}

              {venda.status ===
                "Aguardando confirmação" && (
                <div className="rounded-md border border-blue-300 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900">
                    Pedido já enviado. Agora confirme o recebimento da Representada.
                  </p>

                  <p className="mt-1 text-sm text-blue-800">
                    Informe como a Representada confirmou o recebimento e registre protocolo, número, referência ou descrição da confirmação.
                  </p>
                </div>
              )}

              {venda.status ===
                "Confirmado" && (
                <div className="rounded-md border border-green-300 bg-green-50 p-4">
                  <p className="font-semibold text-green-900">
                    Pedido confirmado pela Representada.
                  </p>

                  <p className="mt-1 text-sm text-green-800">
                    O ciclo comercial da Venda está confirmado. Faturamento e comissão serão tratados nos módulos seguintes.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {venda.status ===
                  "Aguardando envio" && (
                  <Button
                    type="button"
                    onClick={() =>
                      setModoEvento(
                        "envio"
                      )
                    }
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Registrar Envio
                  </Button>
                )}

                {venda.status ===
                  "Aguardando confirmação" && (
                  <>
                    <Button
                      type="button"
                      onClick={() =>
                        setModoEvento(
                          "confirmacao"
                        )
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar Recebimento
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setModoEvento(
                          "envio"
                        )
                      }
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Registrar Novo Envio
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setModoEvento(
                          "pedido"
                        )
                      }
                    >
                      Pedido Registrado
                    </Button>
                  </>
                )}

                {venda.status ===
                  "Confirmado" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setModoEvento(
                          "pedido"
                        )
                      }
                    >
                      Registrar Nº do Pedido
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setModoEvento(
                          "contato"
                        )
                      }
                    >
                      Registrar Contato
                    </Button>
                  </>
                )}
              </div>

              {modoEvento ===
                "envio" &&
                possuiEnvio && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Esta Venda já possui envio registrado. O novo envio será acrescentado ao histórico e não substituirá os anteriores.
                  </div>
                )}

              <form
                onSubmit={
                  registrarEvento
                }
                className="space-y-4 rounded-md border p-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {modoEvento ===
                    "confirmacao"
                      ? "Confirmar recebimento da Representada"
                      : modoEvento ===
                          "pedido"
                        ? "Registrar pedido da Representada"
                        : modoEvento ===
                            "contato"
                          ? "Registrar contato com Representada"
                          : possuiEnvio
                            ? "Registrar novo envio"
                            : "Registrar envio do pedido"}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Canal *
                    </Label>

                    <Select
                      value={
                        canalEvento
                      }
                      onValueChange={
                        setCanalEvento
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {CANAIS_EVENTO.map(
                          (canal) => (
                            <SelectItem
                              key={
                                canal
                              }
                              value={
                                canal
                              }
                            >
                              {canal}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataEvento">
                      Data e hora
                    </Label>

                    <Input
                      id="dataEvento"
                      type="datetime-local"
                      value={
                        dataEvento
                      }
                      onChange={(
                        event
                      ) =>
                        setDataEvento(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenciaEvento">
                    {modoEvento ===
                    "confirmacao"
                      ? "Referência da confirmação"
                      : modoEvento ===
                          "pedido"
                        ? "Número / referência do pedido"
                        : "Referência"}
                  </Label>

                  <Input
                    id="referenciaEvento"
                    value={
                      referenciaEvento
                    }
                    onChange={(
                      event
                    ) =>
                      setReferenciaEvento(
                        event.target.value
                      )
                    }
                    placeholder={
                      modoEvento ===
                      "confirmacao"
                        ? "Protocolo, nº portal, mensagem, contato..."
                        : modoEvento ===
                            "pedido"
                          ? "Número oficial do pedido, protocolo..."
                          : "Protocolo, contato, referência..."
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoEvento">
                    Descrição
                  </Label>

                  <Textarea
                    id="descricaoEvento"
                    rows={3}
                    value={
                      descricaoEvento
                    }
                    onChange={(
                      event
                    ) =>
                      setDescricaoEvento(
                        event.target.value
                      )
                    }
                    placeholder="Detalhes do envio, confirmação ou contato..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    salvandoEvento
                  }
                >
                  {salvandoEvento ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />

                      {modoEvento ===
                      "confirmacao"
                        ? "Confirmar Recebimento"
                        : modoEvento ===
                            "pedido"
                          ? "Registrar Pedido"
                          : modoEvento ===
                              "contato"
                            ? "Registrar Contato"
                            : "Registrar Envio"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico Operacional
              </CardTitle>

              <CardDescription>
                Registros preservados em ordem cronológica.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {eventos.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhum evento operacional registrado.
                </div>
              ) : (
                <div className="space-y-3">
                  {eventos.map(
                    (evento) => (
                      <div
                        key={evento.id}
                        className="rounded-md border bg-slate-50 p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">
                              {evento.tipo}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {evento.canal && (
                                <span>
                                  Canal:{" "}
                                  {evento.canal}
                                </span>
                              )}

                              {evento.referencia && (
                                <span>
                                  Referência:{" "}
                                  {evento.referencia}
                                </span>
                              )}
                            </div>

                            {evento.descricao && (
                              <p className="mt-2 whitespace-pre-wrap text-sm">
                                {evento.descricao}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-muted-foreground">
                              Registrado por:{" "}
                              {evento.usuario?.nome ||
                                "Usuário não identificado"}
                              {evento.usuario?.perfil
                                ? ` — ${evento.usuario.perfil}`
                                : ""}
                            </p>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {formatarDataHora(
                              evento.data
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Comissão Prevista
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Percentual
                </p>

                <p className="text-lg font-bold">
                  {venda.percentualComissaoAplicado !== null
                    ? `${Number(
                        venda.percentualComissaoAplicado
                      ).toLocaleString(
                        "pt-BR"
                      )}%`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Base
                </p>

                <p className="text-lg font-bold">
                  {formatarMoeda(
                    venda.baseCalculoComissao
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Prevista
                </p>

                <p className="text-lg font-bold">
                  {formatarMoeda(
                    venda.valorComissaoPrevista
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Origem
              </CardTitle>
            </CardHeader>

            <CardContent>
              {origemOrcamento ? (
                <div className="space-y-3">
                  {origemOrcamento.interacaoOrigem && (
                    <div className="rounded-md border bg-blue-50 p-3">
                      <FileText className="mb-2 h-5 w-5 text-blue-700" />

                      <p className="text-xs text-muted-foreground">
                        Interação
                      </p>

                      <Link
                        href={`/interacoes/${origemOrcamento.interacaoOrigem.id}`}
                        className="font-mono font-bold text-blue-700 hover:underline"
                      >
                        {formatarCodigoInteracao(
                          origemOrcamento.interacaoOrigem.numeroSequencial
                        )}
                      </Link>
                    </div>
                  )}

                  <div className="rounded-md border border-green-200 bg-green-50 p-3">
                    <FileCheck2 className="mb-2 h-5 w-5 text-green-700" />

                    <p className="text-xs text-muted-foreground">
                      Orçamento
                    </p>

                    <Link
                      href={`/orcamentos/${origemOrcamento.id}`}
                      className="font-mono font-bold text-blue-700 hover:underline"
                    >
                      {formatarCodigoOrcamento(
                        origemOrcamento.numeroSequencial
                      )}
                    </Link>
                  </div>

                  <div className="rounded-md border bg-slate-50 p-3">
                    <ShoppingCart className="mb-2 h-5 w-5" />

                    <p className="text-xs text-muted-foreground">
                      Venda
                    </p>

                    <p className="font-mono font-bold">
                      {codigoVenda}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border bg-blue-50 p-3 text-sm text-blue-800">
                  Venda direta / retroativa.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Situação Operacional
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="font-semibold">
                  {venda.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Enviado em
                </p>

                <p>
                  {formatarDataHora(
                    venda.pedidoEnviadoEm
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Confirmado em
                </p>

                <p>
                  {formatarDataHora(
                    venda.confirmadoEm
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Pedido da Representada
                </p>

                <p className="font-medium">
                  {venda.numeroPedidoRepresentada ||
                    "Não informado"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Responsabilidade
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Criado por
                </p>

                <p className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  {venda.criadoPor?.nome ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Responsável
                </p>

                <p className="font-medium">
                  {venda.responsavel?.nome ||
                    "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Link href="/vendas">
            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver todas as Vendas
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}