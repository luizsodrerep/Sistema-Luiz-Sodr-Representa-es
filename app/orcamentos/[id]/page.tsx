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
  Clock3,
  Factory,
  History,
  Home,
  Loader2,
  MailCheck,
  Pencil,
  RefreshCw,
  XCircle,
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
  formatarCodigoOrcamento,
} from "@/lib/orcamentos/codigo"

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  contato: string | null
  telefone: string | null
  whatsapp: string | null
  email: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
  contatoPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
  emailPrincipal: string | null
}

type InteracaoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  assunto: string | null
  data: string
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

  arquivoUrl: string | null
  observacoes: string | null

  criadoEm: string
  atualizadoEm: string

  cliente: Cliente
  representada: Representada

  interacaoOrigem: InteracaoOrigem | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

type HistoricoItem = {
  id: string
  acao: string
  criadoEm: string

  usuario: {
    id: string | null
    nome: string
    perfil: string
  }

  dadosAntes: unknown
  dadosDepois: unknown
}

type HistoricoResponse = {
  orcamento: {
    id: string
    numeroSequencial: number
  }

  historico: HistoricoItem[]
}

function formatarDataHora(
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

function formatarCodigoInteracao(
  numero: number
) {
  return `INT-${String(
    numero
  ).padStart(6, "0")}`
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

function calcularDiasRestantes(
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

export default function OrcamentoDetalhesPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } =
    use(params)

  const [
    orcamento,
    setOrcamento,
  ] =
    useState<Orcamento | null>(
      null
    )

  const [
    historico,
    setHistorico,
  ] =
    useState<HistoricoItem[]>(
      []
    )

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

  const [
    mensagem,
    setMensagem,
  ] =
    useState<
      string | null
    >(null)

  const [
    historicoAberto,
    setHistoricoAberto,
  ] =
    useState(false)

  async function carregar() {
    try {
      setLoading(true)
      setErro(null)

      const [
        respostaOrcamento,
        respostaHistorico,
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
            `/api/orcamentos/${id}/historico`,
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

      const dadosHistorico:
        | HistoricoResponse
        | null =
        await respostaHistorico
          .json()
          .catch(
            () => null
          )

      if (
        !respostaOrcamento.ok
      ) {
        setErro(
          dadosOrcamento?.message ||
            "Não foi possível carregar o orçamento."
        )

        return
      }

      setOrcamento(
        dadosOrcamento
      )

      if (
        respostaHistorico.ok &&
        dadosHistorico
      ) {
        setHistorico(
          Array.isArray(
            dadosHistorico.historico
          )
            ? dadosHistorico.historico
            : []
        )
      }
    } catch {
      setErro(
        "Erro ao carregar orçamento."
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
  }, [id])

  const diasRestantes =
    useMemo(
      () =>
        orcamento
          ? calcularDiasRestantes(
              orcamento.validadeEm
            )
          : null,
      [orcamento]
    )

  async function atualizar(
    dados: Record<
      string,
      unknown
    >,
    mensagemSucesso: string
  ) {
    if (!orcamento) {
      return
    }

    try {
      setSalvando(true)
      setErro(null)
      setMensagem(null)

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
              JSON.stringify(
                dados
              ),
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
            "Não foi possível atualizar o orçamento."
        )

        return
      }

      setMensagem(
        mensagemSucesso
      )

      await carregar()
    } catch {
      setErro(
        "Erro de comunicação ao atualizar o orçamento."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  async function marcarComoEnviado() {
    await atualizar(
      {
        enviadoEm:
          new Date().toISOString(),
      },
      "Orçamento marcado como enviado."
    )
  }

  async function aprovar() {
    await atualizar(
      {
        status:
          "Aprovado",
      },
      "Orçamento aprovado."
    )
  }

  async function recusar() {
    const motivo =
      window.prompt(
        "Informe o motivo da recusa, se houver:"
      )

    await atualizar(
      {
        status:
          "Recusado",

        motivoFinalizacao:
          motivo || null,
      },
      "Orçamento registrado como recusado."
    )
  }

  async function cancelar() {
    const motivo =
      window.prompt(
        "Informe o motivo do cancelamento:"
      )

    if (
      motivo === null
    ) {
      return
    }

    await atualizar(
      {
        status:
          "Cancelado",

        motivoFinalizacao:
          motivo || null,
      },
      "Orçamento cancelado."
    )
  }

  async function reabrir() {
    await atualizar(
      {
        status:
          "Pendente",
      },
      "Orçamento reaberto como pendente."
    )
  }

  if (loading) {
    return (
      <PageLayout title="Orçamento">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando orçamento...
        </div>
      </PageLayout>
    )
  }

  if (
    erro &&
    !orcamento
  ) {
    return (
      <PageLayout title="Orçamento">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />

              Página Inicial
            </Button>
          </Link>

          <Link href="/orcamentos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />

              Voltar para Orçamentos
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

  if (!orcamento) {
    return null
  }

  const codigo =
    formatarCodigoOrcamento(
      orcamento.numeroSequencial
    )

  const nomeCliente =
    orcamento.cliente.nomeFantasia ||
    orcamento.cliente.razaoSocial

  return (
    <PageLayout title="Detalhes do Orçamento">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />

              Página Inicial
            </Button>
          </Link>

          <Link href="/orcamentos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />

              Voltar para Orçamentos
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/orcamentos/${orcamento.id}/editar`}
          >
            <Button
              variant="outline"
            >
              <Pencil className="mr-2 h-4 w-4" />

              Editar
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={
              carregar
            }
            disabled={
              salvando
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />

            Atualizar
          </Button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />

          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />

          {mensagem}
        </div>
      )}

      <div className="mb-4 rounded-lg border bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código do orçamento
            </p>

            <p className="mt-1 font-mono text-2xl font-bold">
              {codigo}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${classeStatus(
              orcamento.status
            )}`}
          >
            {
              orcamento.status
            }
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

              <CardDescription>
                Informações principais da proposta.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cliente
                  </p>

                  <Link
                    href={`/clientes/${orcamento.cliente.id}`}
                    className="mt-1 flex items-center gap-2 font-medium text-blue-700 hover:underline"
                  >
                    <Building2 className="h-4 w-4" />

                    {
                      nomeCliente
                    }
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground">
                    CNPJ:{" "}
                    {
                      orcamento.cliente.cnpj ||
                      "—"
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Representada
                  </p>

                  <Link
                    href={`/representadas/${orcamento.representada.id}`}
                    className="mt-1 flex items-center gap-2 font-medium text-blue-700 hover:underline"
                  >
                    <Factory className="h-4 w-4" />

                    {
                      orcamento.representada.nome
                    }
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Emitido em
                  </p>

                  <p className="mt-1 font-medium">
                    {formatarDataHora(
                      orcamento.data
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Validade
                  </p>

                  <p className="mt-1 font-medium">
                    {formatarData(
                      orcamento.validadeEm
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Valor
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {formatarMoeda(
                      orcamento.valorTotal
                    )}
                  </p>
                </div>
              </div>

              {orcamento.status ===
                "Pendente" &&
                diasRestantes !==
                  null && (
                  <div className="rounded-md border bg-amber-50 p-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-amber-700" />

                      <span className="text-sm font-medium">
                        {diasRestantes > 0
                          ? `${diasRestantes} dia(s) restantes`
                          : diasRestantes ===
                              0
                            ? "Vence hoje"
                            : "Prazo expirado"}
                      </span>
                    </div>
                  </div>
                )}

              {orcamento.condicaoPagamento && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Condição de pagamento
                  </p>

                  <p className="mt-1 font-medium">
                    {
                      orcamento.condicaoPagamento
                    }
                  </p>
                </div>
              )}

              {orcamento.descricao && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Descrição
                  </p>

                  <div className="mt-1 whitespace-pre-wrap rounded-md border bg-slate-50 p-3 text-sm">
                    {
                      orcamento.descricao
                    }
                  </div>
                </div>
              )}

              {orcamento.observacoes && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Observações internas
                  </p>

                  <div className="mt-1 whitespace-pre-wrap rounded-md border bg-slate-50 p-3 text-sm">
                    {
                      orcamento.observacoes
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Ações Comerciais
              </CardTitle>

              <CardDescription>
                Atualize o ciclo do orçamento sem apagar o histórico.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-3">
              {!orcamento.enviadoEm && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    salvando
                  }
                  onClick={
                    marcarComoEnviado
                  }
                >
                  <MailCheck className="mr-2 h-4 w-4" />

                  Marcar como enviado
                </Button>
              )}

              {orcamento.status ===
                "Pendente" && (
                <>
                  <Button
                    type="button"
                    disabled={
                      salvando
                    }
                    onClick={
                      aprovar
                    }
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />

                    Aprovar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      salvando
                    }
                    onClick={
                      recusar
                    }
                  >
                    <XCircle className="mr-2 h-4 w-4" />

                    Recusar
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    disabled={
                      salvando
                    }
                    onClick={
                      cancelar
                    }
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {orcamento.status !==
                "Pendente" &&
                orcamento.status !==
                  "Vencido" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      salvando
                    }
                    onClick={
                      reabrir
                    }
                  >
                    Reabrir como Pendente
                  </Button>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Histórico
              </CardTitle>

              <CardDescription>
                Auditoria de criação e alterações do orçamento.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setHistoricoAberto(
                    (valor) =>
                      !valor
                  )
                }
              >
                <History className="mr-2 h-4 w-4" />

                {historicoAberto
                  ? "Ocultar histórico"
                  : `Mostrar histórico (${historico.length})`}
              </Button>

              {historicoAberto && (
                <div className="mt-4 space-y-3">
                  {historico.length ===
                  0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Nenhuma auditoria encontrada.
                    </div>
                  ) : (
                    historico.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.id
                          }
                          className="rounded-md border bg-slate-50 p-3"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {
                                  item.acao
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {
                                  item.usuario.nome
                                }{" "}
                                —{" "}
                                {
                                  item.usuario.perfil
                                }
                              </p>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {formatarDataHora(
                                item.criadoEm
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Situação
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="font-semibold">
                  {
                    orcamento.status
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Enviado em
                </p>

                <p className="text-sm">
                  {formatarDataHora(
                    orcamento.enviadoEm
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Finalizado em
                </p>

                <p className="text-sm">
                  {formatarDataHora(
                    orcamento.finalizadoEm
                  )}
                </p>
              </div>

              {orcamento.motivoFinalizacao && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Motivo
                  </p>

                  <p className="text-sm">
                    {
                      orcamento.motivoFinalizacao
                    }
                  </p>
                </div>
              )}
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

                <p className="font-medium">
                  {orcamento.criadoPor
                    ?.nome ||
                    "—"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {orcamento.criadoPor
                    ?.perfil ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Responsável
                </p>

                <p className="font-medium">
                  {orcamento.responsavel
                    ?.nome ||
                    "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {orcamento.interacaoOrigem && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Origem
                </CardTitle>

                <CardDescription>
                  Interação que originou o orçamento.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Link
                  href={`/interacoes/${orcamento.interacaoOrigem.id}`}
                  className="block rounded-md border bg-blue-50 p-3 hover:bg-blue-100"
                >
                  <p className="font-mono text-sm font-bold text-blue-700">
                    {formatarCodigoInteracao(
                      orcamento.interacaoOrigem.numeroSequencial
                    )}
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {
                      orcamento.interacaoOrigem.tipo
                    }
                  </p>

                  {orcamento.interacaoOrigem.assunto && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        orcamento.interacaoOrigem.assunto
                      }
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Próxima etapa
              </CardTitle>
            </CardHeader>

            <CardContent>
              {orcamento.status ===
              "Aprovado" ? (
                <div className="rounded-md border bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />

                  Orçamento aprovado. A conversão em Venda será feita no módulo Vendas.
                </div>
              ) : (
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
                  <Clock3 className="mr-2 inline h-4 w-4" />

                  O orçamento ainda não gera Venda, Financeiro ou Comissão automaticamente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}