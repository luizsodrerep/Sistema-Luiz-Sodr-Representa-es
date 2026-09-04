"use client"

import {
  use,
  useEffect,
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
  formatarCodigoInteracao,
} from "@/lib/interacoes/codigo"

import {
  formatarCodigoOrcamento,
} from "@/lib/orcamentos/codigo"

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Factory,
  FileText,
  History,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  PlusCircle,
  User,
  UserSearch,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  contato: string | null
  cargo: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
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

  criadoEm: string
  atualizadoEm: string
}

type AcompanhamentoSnapshot = {
  resultado?: string | null
  proximosPasso?: string | null
  proximoContatoEm?: string | null
  finalizado?: boolean
}

type SnapshotInteracao = {
  id?: string
  numeroSequencial?: number

  tipo?: string | null
  assunto?: string | null
  descricao?: string | null
  resultado?: string | null
  proximosPasso?: string | null

  proximoContatoEm?: string | null
  statusFollowUp?: string | null

  clienteId?: string | null
  representadaId?: string | null
  responsavelId?: string | null

  nomeProspect?: string | null
  empresaProspect?: string | null
  origemProspeccao?: string | null

  atualizadoEm?: string | null

  acompanhamento?:
    | AcompanhamentoSnapshot
    | null
}

type HistoricoItem = {
  id: string
  acao: string
  criadoEm: string

  usuario: UsuarioResumo | null

  dadosAntes:
    | SnapshotInteracao
    | null

  dadosDepois:
    | SnapshotInteracao
    | null
}

type HistoricoResponse = {
  interacaoId: string
  numeroSequencial: number
  totalAlteracoes: number
  historico: HistoricoItem[]
}

type OrcamentoResumo = {
  id: string
  numeroSequencial: number

  data: string
  validadeEm: string

  valorTotal: number

  status: string

  representada: {
    id: string
    nome: string
  }

  responsavel:
    | {
        id: string
        nome: string
        perfil: string
      }
    | null
}

const corTipo: Record<
  string,
  string
> = {
  WhatsApp:
    "bg-green-100 text-green-800",

  "E-mail":
    "bg-blue-100 text-blue-800",

  Visita:
    "bg-orange-100 text-orange-800",

  Ligação:
    "bg-purple-100 text-purple-800",

  Outro:
    "bg-gray-100 text-gray-800",
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

function classeStatusOrcamento(
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

function valorLegivel(
  campo: string,
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—"
  }

  if (
    campo ===
      "proximoContatoEm" &&
    typeof valor ===
      "string"
  ) {
    return formatarData(
      valor
    )
  }

  return String(valor)
}

const nomesCampos: Record<
  string,
  string
> = {
  tipo:
    "Tipo",

  assunto:
    "Assunto",

  descricao:
    "Descrição",

  resultado:
    "Resultado",

  proximosPasso:
    "Próximos passos",

  proximoContatoEm:
    "Próximo acompanhamento",

  statusFollowUp:
    "Status",

  clienteId:
    "Cliente",

  representadaId:
    "Representada",

  responsavelId:
    "Responsável",

  nomeProspect:
    "Nome / Referência da Prospecção",

  empresaProspect:
    "Empresa / Estabelecimento",

  origemProspeccao:
    "Origem da Prospecção",
}

function obterAlteracoes(
  item: HistoricoItem
) {
  const antes =
    item.dadosAntes ||
    {}

  const depois =
    item.dadosDepois ||
    {}

  const campos =
    Object.keys(
      nomesCampos
    )

  return campos
    .filter(
      (
        campo
      ) => {
        const chave =
          campo as keyof SnapshotInteracao

        return (
          antes[
            chave
          ] !==
          depois[
            chave
          ]
        )
      }
    )
    .map(
      (
        campo
      ) => {
        const chave =
          campo as keyof SnapshotInteracao

        return {
          campo:
            nomesCampos[
              campo
            ],

          antes:
            valorLegivel(
              campo,
              antes[
                chave
              ]
            ),

          depois:
            valorLegivel(
              campo,
              depois[
                chave
              ]
            ),
        }
      }
    )
}

export default function InteracaoDetalhesPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } =
    use(params)

  const [
    interacao,
    setInteracao,
  ] =
    useState<Interacao | null>(
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
    orcamentos,
    setOrcamentos,
  ] =
    useState<
      OrcamentoResumo[]
    >([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    loadingHistorico,
    setLoadingHistorico,
  ] =
    useState(true)

  const [
    loadingOrcamentos,
    setLoadingOrcamentos,
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
    erroHistorico,
    setErroHistorico,
  ] =
    useState<
      string | null
    >(null)

  const [
    erroOrcamentos,
    setErroOrcamentos,
  ] =
    useState<
      string | null
    >(null)

  const [
    historicoAberto,
    setHistoricoAberto,
  ] =
    useState(false)

  const [
    acompanhamentoAberto,
    setAcompanhamentoAberto,
  ] =
    useState(false)

  const [
    resultadoAcompanhamento,
    setResultadoAcompanhamento,
  ] =
    useState("")

  const [
    proximosPassoAcompanhamento,
    setProximosPassoAcompanhamento,
  ] =
    useState("")

  const [
    proximoContatoAcompanhamento,
    setProximoContatoAcompanhamento,
  ] =
    useState("")

  const [
    salvandoAcompanhamento,
    setSalvandoAcompanhamento,
  ] =
    useState(false)

  const [
    erroAcompanhamento,
    setErroAcompanhamento,
  ] =
    useState<
      string | null
    >(null)

  const [
    sucessoAcompanhamento,
    setSucessoAcompanhamento,
  ] =
    useState<
      string | null
    >(null)

  async function carregarHistorico() {
    try {
      setLoadingHistorico(
        true
      )

      setErroHistorico(
        null
      )

      const response =
        await fetch(
          `/api/interacoes/${id}/historico`,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        )

      const data:
        | HistoricoResponse
        | {
            message?: string
          } =
        await response
          .json()
          .catch(
            () => ({
              message:
                "Resposta inválida.",
            })
          )

      if (
        !response.ok
      ) {
        setErroHistorico(
          "message" in
            data &&
            data.message
            ? data.message
            : "Não foi possível carregar o histórico."
        )

        return
      }

      if (
        "historico" in
          data &&
        Array.isArray(
          data.historico
        )
      ) {
        setHistorico(
          data.historico
        )
      }
    } catch {
      setErroHistorico(
        "Erro ao carregar histórico."
      )
    } finally {
      setLoadingHistorico(
        false
      )
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setErro(null)

        const response =
          await fetch(
            `/api/interacoes/${id}`,
            {
              method:
                "GET",

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
              "Não foi possível carregar a interação."
          )

          return
        }

        setInteracao(
          data
        )
      } catch {
        setErro(
          "Erro ao carregar interação. Tente novamente."
        )
      } finally {
        setLoading(
          false
        )
      }
    }

    carregar()
  }, [id])

  useEffect(() => {
    carregarHistorico()
  }, [id])

  useEffect(() => {
    async function carregarOrcamentos() {
      try {
        setLoadingOrcamentos(
          true
        )

        setErroOrcamentos(
          null
        )

        const response =
          await fetch(
            `/api/orcamentos?interacaoOrigemId=${encodeURIComponent(
              id
            )}`,
            {
              method:
                "GET",

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
          setErroOrcamentos(
            data?.message ||
              "Não foi possível carregar os orçamentos desta interação."
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
        setErroOrcamentos(
          "Erro ao carregar os orçamentos desta interação."
        )
      } finally {
        setLoadingOrcamentos(
          false
        )
      }
    }

    carregarOrcamentos()
  }, [id])

  async function registrarAcompanhamento(
    finalizar: boolean
  ) {
    if (
      resultadoAcompanhamento
        .trim() === ""
    ) {
      setErroAcompanhamento(
        "Informe a atualização ou resultado deste acompanhamento."
      )

      return
    }

    if (
      finalizar
    ) {
      const confirmou =
        window.confirm(
          "Deseja realmente finalizar esta interação? O acompanhamento atual será registrado e a interação ficará como Finalizada."
        )

      if (!confirmou) {
        return
      }
    }

    try {
      setSalvandoAcompanhamento(
        true
      )

      setErroAcompanhamento(
        null
      )

      setSucessoAcompanhamento(
        null
      )

      const proximoContatoEm =
        proximoContatoAcompanhamento
          ? new Date(
              proximoContatoAcompanhamento
            ).toISOString()
          : null

      const response =
        await fetch(
          `/api/interacoes/${id}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                resultado:
                  resultadoAcompanhamento,

                proximosPasso:
                  proximosPassoAcompanhamento,

                proximoContatoEm,

                finalizar,
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
        setErroAcompanhamento(
          data?.message ||
            "Não foi possível registrar o acompanhamento."
        )

        return
      }

      if (
        data?.interacao
      ) {
        setInteracao(
          data.interacao
        )
      }

      setResultadoAcompanhamento(
        ""
      )

      setProximosPassoAcompanhamento(
        ""
      )

      setProximoContatoAcompanhamento(
        ""
      )

      setSucessoAcompanhamento(
        data?.message ||
          "Acompanhamento registrado com sucesso."
      )

      setAcompanhamentoAberto(
        false
      )

      await carregarHistorico()
    } catch {
      setErroAcompanhamento(
        "Erro ao registrar acompanhamento. Tente novamente."
      )
    } finally {
      setSalvandoAcompanhamento(
        false
      )
    }
  }

  if (loading) {
    return (
      <PageLayout title="Carregando...">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando interação...
        </div>
      </PageLayout>
    )
  }

  if (
    erro &&
    !interacao
  ) {
    return (
      <PageLayout title="Interação">
        <NavigationButtons
          backLabel="Voltar para Interações"
          backHref="/interacoes"
        />

        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          <AlertCircle className="h-6 w-6" />

          <p>
            {erro}
          </p>
        </div>
      </PageLayout>
    )
  }

  if (!interacao) {
    return null
  }

  const historicoEdicoes =
    historico.filter(
      (
        item
      ) =>
        item.acao ===
        "EDICAO"
    )

  const acompanhamentos =
    historico.filter(
      (
        item
      ) =>
        item.acao ===
        "ACOMPANHAMENTO"
    )

  const editada =
    historicoEdicoes.length >
    0

  const codigo =
    formatarCodigoInteracao(
      interacao.numeroSequencial
    )

  const origemCliente =
    interacao.cliente !==
    null

  const origemRepresentada =
    interacao.representada !==
    null

  const origemProspeccao =
    !origemCliente &&
    !origemRepresentada &&
    Boolean(
      interacao.nomeProspect ||
      interacao.empresaProspect ||
      interacao.origemProspeccao
    )

  const nomeOrigem =
    interacao.cliente
      ? interacao.cliente
          .nomeFantasia ||
        interacao.cliente
          .razaoSocial
      : interacao
          .representada
        ? interacao
            .representada
            .nome
        : origemProspeccao
          ? interacao.empresaProspect ||
            interacao.nomeProspect ||
            "Prospecção sem identificação"
          : "Origem não disponível"

  const tipoOrigem =
    origemCliente
      ? "Cliente"
      : origemRepresentada
        ? "Representada"
        : origemProspeccao
          ? "Prospecção / Lead"
          : "Registro"

  const ultimaEdicao =
    historicoEdicoes.length >
    0
      ? historicoEdicoes[0]
      : null

  const finalizada =
    interacao.statusFollowUp ===
    "Finalizado"

  return (
    <PageLayout title="Detalhes da Interação">
      <NavigationButtons
        backLabel="Voltar para Interações"
        backHref="/interacoes"
      />

      <div className="mb-4 mt-3 rounded-lg border bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código da interação
            </p>

            <p className="mt-1 font-mono text-xl font-bold text-slate-900">
              {codigo}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Identificação permanente deste registro.
            </p>
          </div>

          <div className="rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground">
            Sequencial interno:{" "}
            <span className="font-semibold text-slate-700">
              {
                interacao.numeroSequencial
              }
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {origemCliente ? (
            <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
          ) : origemRepresentada ? (
            <Factory className="h-5 w-5 shrink-0 text-orange-600" />
          ) : origemProspeccao ? (
            <UserSearch className="h-5 w-5 shrink-0 text-amber-600" />
          ) : (
            <ClipboardList className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {nomeOrigem}
            </p>

            <p
              className={
                origemProspeccao
                  ? "text-xs font-medium text-amber-700"
                  : "text-xs text-muted-foreground"
              }
            >
              {tipoOrigem}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              corTipo[
                interacao.tipo
              ] ??
              "bg-gray-100 text-gray-800"
            }`}
          >
            {
              interacao.tipo
            }
          </span>

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              finalizada
                ? "bg-slate-200 text-slate-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {
              interacao.statusFollowUp
            }
          </span>

          {editada && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              Editada
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!finalizada && (
            <Button
              size="sm"
              onClick={() => {
                setAcompanhamentoAberto(
                  (
                    atual
                  ) =>
                    !atual
                )

                setErroAcompanhamento(
                  null
                )

                setSucessoAcompanhamento(
                  null
                )
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />

              Registrar acompanhamento
            </Button>
          )}

          {interacao.cliente && (
            <Link
              href={`/orcamentos/novo?interacaoId=${interacao.id}`}
            >
              <Button
                size="sm"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />

                Criar Orçamento
              </Button>
            </Link>
          )}

          <Link
            href={`/interacoes/${id}/editar`}
          >
            <Button
              variant="outline"
              size="sm"
            >
              <Pencil className="mr-2 h-4 w-4" />

              Editar
            </Button>
          </Link>
        </div>
      </div>

      {erro && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          {erro}
        </div>
      )}

      {sucessoAcompanhamento && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />

          {
            sucessoAcompanhamento
          }
        </div>
      )}

      {erroAcompanhamento && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          {
            erroAcompanhamento
          }
        </div>
      )}

      {!finalizada &&
        acompanhamentoAberto && (
          <Card className="mb-4 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />

                Registrar acompanhamento
              </CardTitle>

              <CardDescription>
                Registre uma nova etapa desta mesma interação sem alterar o histórico anterior.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="resultadoAcompanhamento"
                  className="text-sm font-medium"
                >
                  Nova informação / resultado *
                </label>

                <textarea
                  id="resultadoAcompanhamento"
                  value={
                    resultadoAcompanhamento
                  }
                  onChange={(
                    event
                  ) =>
                    setResultadoAcompanhamento(
                      event.target.value
                    )
                  }
                  disabled={
                    salvandoAcompanhamento
                  }
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ex.: Fiz novo contato e fui informado que..."
                />
              </div>

              <div>
                <label
                  htmlFor="proximosPassoAcompanhamento"
                  className="text-sm font-medium"
                >
                  Próximos passos
                </label>

                <textarea
                  id="proximosPassoAcompanhamento"
                  value={
                    proximosPassoAcompanhamento
                  }
                  onChange={(
                    event
                  ) =>
                    setProximosPassoAcompanhamento(
                      event.target.value
                    )
                  }
                  disabled={
                    salvandoAcompanhamento
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ex.: Retornar após envio do catálogo."
                />
              </div>

              <div>
                <label
                  htmlFor="proximoContatoAcompanhamento"
                  className="text-sm font-medium"
                >
                  Próximo acompanhamento
                </label>

                <input
                  id="proximoContatoAcompanhamento"
                  type="datetime-local"
                  value={
                    proximoContatoAcompanhamento
                  }
                  onChange={(
                    event
                  ) =>
                    setProximoContatoAcompanhamento(
                      event.target.value
                    )
                  }
                  disabled={
                    salvandoAcompanhamento
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-sm"
                />
              </div>

              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    salvandoAcompanhamento
                  }
                  onClick={() =>
                    setAcompanhamentoAberto(
                      false
                    )
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    salvandoAcompanhamento
                  }
                  onClick={() =>
                    registrarAcompanhamento(
                      true
                    )
                  }
                >
                  {salvandoAcompanhamento ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}

                  Registrar e finalizar
                </Button>

                <Button
                  type="button"
                  disabled={
                    salvandoAcompanhamento
                  }
                  onClick={() =>
                    registrarAcompanhamento(
                      false
                    )
                  }
                >
                  {salvandoAcompanhamento ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}

                  Registrar acompanhamento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Registro da Interação
            </CardTitle>

            <CardDescription>
              Registro principal preservado sob o código{" "}
              <span className="font-mono font-medium">
                {codigo}
              </span>
              .
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Data e hora
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />

                  {formatarData(
                    interacao.data
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Registrado por
                </p>

                <p className="mt-1 text-sm font-medium">
                  {interacao.criadoPor
                    ?.nome ||
                    "Usuário não identificado"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {interacao.criadoPor
                    ?.perfil ||
                    "—"}
                </p>
              </div>
            </div>

            {interacao.assunto && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Assunto
                </p>

                <p className="mt-1 text-sm font-medium">
                  {
                    interacao.assunto
                  }
                </p>
              </div>
            )}

            {interacao.descricao && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Descrição
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/10 p-3 text-sm">
                  {
                    interacao.descricao
                  }
                </div>
              </div>
            )}

            {interacao.resultado && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  Resultado atual
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-green-50 p-3 text-sm">
                  {
                    interacao.resultado
                  }
                </div>
              </div>
            )}

            {interacao.proximosPasso && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-blue-600" />

                  Próximos Passos
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-blue-50 p-3 text-sm">
                  {
                    interacao.proximosPasso
                  }
                </div>
              </div>
            )}

            {interacao.proximoContatoEm && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-600" />

                  Próximo acompanhamento
                </p>

                <div className="mt-1 rounded-md border bg-amber-50 p-3">
                  <p className="text-sm font-medium">
                    {formatarData(
                      interacao.proximoContatoEm
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Status:{" "}
                    {
                      interacao.statusFollowUp
                    }
                  </p>

                  {interacao.responsavel && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responsável:{" "}
                      {
                        interacao.responsavel.nome
                      }{" "}
                      —{" "}
                      {
                        interacao.responsavel.perfil
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {!interacao.proximoContatoEm && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Status do acompanhamento
                </p>

                <p className="mt-1 text-sm font-medium">
                  {
                    interacao.statusFollowUp
                  }
                </p>
              </div>
            )}

            <div className="border-t pt-3 text-xs text-muted-foreground">
              <p>
                Código:{" "}
                <span className="font-mono font-medium text-slate-700">
                  {codigo}
                </span>
              </p>

              <p className="mt-1">
                Criada em:{" "}
                {formatarData(
                  interacao.criadoEm
                )}
                {" — "}
                {interacao.criadoPor
                  ?.nome ||
                  "Usuário não identificado"}
              </p>

              {editada && (
                <>
                  <p className="mt-1 font-medium text-amber-700">
                    Última edição:{" "}
                    {formatarData(
                      ultimaEdicao
                        ?.criadoEm ||
                        null
                    )}

                    {ultimaEdicao
                      ?.usuario
                      ? ` — ${ultimaEdicao.usuario.nome} — ${ultimaEdicao.usuario.perfil}`
                      : ""}
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    Total de edições registradas:{" "}
                    <strong>
                      {
                        historicoEdicoes.length
                      }
                    </strong>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {origemCliente
                ? "Dados do Cliente"
                : origemRepresentada
                  ? "Dados da Representada"
                  : origemProspeccao
                    ? "Dados da Prospecção"
                    : "Origem"}
            </CardTitle>

            <CardDescription>
              {origemProspeccao
                ? "Informações iniciais do possível cliente antes do cadastro formal."
                : "Informações relacionadas ao registro."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {interacao.cliente && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Empresa
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao.cliente.razaoSocial
                    }
                  </p>

                  {interacao.cliente.nomeFantasia && (
                    <p className="text-xs text-muted-foreground">
                      {
                        interacao.cliente.nomeFantasia
                      }
                    </p>
                  )}
                </div>

                {interacao.cliente.contato && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao.cliente.contato
                      }

                      {interacao.cliente.cargo
                        ? ` — ${interacao.cliente.cargo}`
                        : ""}
                    </p>
                  </div>
                )}

                {interacao.cliente.whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.cliente.whatsapp
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.cliente.whatsapp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.cliente.telefone && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.cliente.telefone
                        }
                      </p>

                      <a
                        href={`tel:${interacao.cliente.telefone.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.cliente.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao.cliente.email
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.cliente.email}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  href={`/clientes/${interacao.cliente.id}`}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />

                    Ver Cliente
                  </Button>
                </Link>
              </>
            )}

            {interacao.representada && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Representada
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao.representada.nome
                    }
                  </p>
                </div>

                {interacao.representada.cnpj && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CNPJ
                    </p>

                    <p className="text-sm">
                      {
                        interacao.representada.cnpj
                      }
                    </p>
                  </div>
                )}

                {interacao.representada.contatoPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao.representada.contatoPrincipal
                      }
                    </p>
                  </div>
                )}

                {interacao.representada.whatsappPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.representada.whatsappPrincipal
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.representada.whatsappPrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.representada.telefonePrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.representada.telefonePrincipal
                        }
                      </p>

                      <a
                        href={`tel:${interacao.representada.telefonePrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.representada.emailPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao.representada.emailPrincipal
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.representada.emailPrincipal}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  href={`/representadas/${interacao.representada.id}`}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Factory className="mr-2 h-4 w-4" />

                    Ver Representada
                  </Button>
                </Link>
              </>
            )}

            {origemProspeccao && (
              <>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2">
                    <UserSearch className="h-4 w-4 text-amber-700" />

                    <p className="text-sm font-semibold text-amber-900">
                      Prospecção / Lead
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-amber-800">
                    Este contato ainda não possui cadastro formal como Cliente.
                  </p>
                </div>

                {interacao.nomeProspect && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Nome / Referência
                    </p>

                    <p className="text-sm font-medium">
                      {
                        interacao.nomeProspect
                      }
                    </p>
                  </div>
                )}

                {interacao.empresaProspect && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Empresa / Estabelecimento
                    </p>

                    <p className="text-sm font-medium">
                      {
                        interacao.empresaProspect
                      }
                    </p>
                  </div>
                )}

                {interacao.origemProspeccao && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Origem da Prospecção
                    </p>

                    <p className="text-sm font-medium">
                      {
                        interacao.origemProspeccao
                      }
                    </p>
                  </div>
                )}

                <div className="rounded-md border bg-slate-50 p-3 text-xs leading-5 text-muted-foreground">
                  Caso esta oportunidade evolua para orçamento ou venda, será necessário cadastrar o Cliente e posteriormente vincular este histórico ao cadastro definitivo.
                </div>
              </>
            )}

            {!interacao.cliente &&
              !interacao.representada &&
              !origemProspeccao && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />

                  Origem não disponível.
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />

            Linha do tempo de acompanhamentos
          </CardTitle>

          <CardDescription>
            Continuidade operacional desta mesma interação. Cada registro preserva a informação anterior.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-md border bg-slate-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Registro inicial
                </p>

                <p className="text-xs text-muted-foreground">
                  {interacao.criadoPor
                    ?.nome ||
                    "Usuário não identificado"}
                  {" — "}
                  {interacao.criadoPor
                    ?.perfil ||
                    "—"}
                </p>
              </div>

              <p className="text-xs font-medium text-slate-600">
                {formatarData(
                  interacao.data
                )}
              </p>
            </div>

            {acompanhamentos.length ===
              0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Nenhum acompanhamento posterior registrado até o momento.
              </p>
            )}
          </div>

          {[...acompanhamentos]
            .reverse()
            .map(
              (
                item,
                index
              ) => {
                const acompanhamento =
                  item.dadosDepois
                    ?.acompanhamento

                const resultado =
                  acompanhamento
                    ?.resultado ??
                  item.dadosDepois
                    ?.resultado ??
                  "—"

                const proximosPasso =
                  acompanhamento
                    ?.proximosPasso ??
                  item.dadosDepois
                    ?.proximosPasso ??
                  null

                const proximoContatoEm =
                  acompanhamento
                    ?.proximoContatoEm ??
                  item.dadosDepois
                    ?.proximoContatoEm ??
                  null

                const finalizado =
                  acompanhamento
                    ?.finalizado ===
                    true ||
                  item.dadosDepois
                    ?.statusFollowUp ===
                    "Finalizado"

                return (
                  <div
                    key={
                      item.id
                    }
                    className="rounded-md border bg-white p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Acompanhamento{" "}
                          {
                            index +
                            1
                          }

                          {finalizado
                            ? " — Finalização"
                            : ""}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {item.usuario
                            ?.nome ||
                            "Usuário não identificado"}
                          {" — "}
                          {item.usuario
                            ?.perfil ||
                            "—"}
                        </p>
                      </div>

                      <p className="text-xs font-medium text-slate-600">
                        {formatarData(
                          item.criadoEm
                        )}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">
                        Nova informação / resultado
                      </p>

                      <div className="mt-1 whitespace-pre-wrap rounded-md bg-green-50 p-3 text-sm">
                        {
                          resultado
                        }
                      </div>
                    </div>

                    {proximosPasso && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">
                          Próximos passos
                        </p>

                        <div className="mt-1 whitespace-pre-wrap rounded-md bg-blue-50 p-3 text-sm">
                          {
                            proximosPasso
                          }
                        </div>
                      </div>
                    )}

                    {proximoContatoEm && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">
                          Próximo acompanhamento agendado
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatarData(
                            proximoContatoEm
                          )}
                        </p>
                      </div>
                    )}

                    {finalizado && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-100 p-3 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="h-4 w-4" />

                        Interação finalizada neste acompanhamento.
                      </div>
                    )}
                  </div>
                )
              }
            )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />

            Histórico técnico de alterações
          </CardTitle>

          <CardDescription>
            Correções feitas pelo recurso Editar. Este histórico é separado dos acompanhamentos operacionais.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            onClick={() =>
              setHistoricoAberto(
                (
                  atual
                ) =>
                  !atual
              )
            }
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" />

              Histórico de edições (
              {
                historicoEdicoes.length
              }
              )
            </span>

            {historicoAberto ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {historicoAberto && (
            <div className="mt-3 space-y-3">
              {loadingHistorico ? (
                <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Carregando histórico...
                </div>
              ) : erroHistorico ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {
                    erroHistorico
                  }
                </div>
              ) : historicoEdicoes.length ===
                0 ? (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  Nenhuma edição registrada.
                </div>
              ) : (
                historicoEdicoes.map(
                  (
                    item,
                    index
                  ) => {
                    const alteracoes =
                      obterAlteracoes(
                        item
                      )

                    return (
                      <div
                        key={
                          item.id
                        }
                        className="rounded-md border bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              Edição{" "}
                              {
                                historicoEdicoes.length -
                                index
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {item.usuario
                                ?.nome ||
                                "Usuário não identificado"}
                              {" — "}
                              {item.usuario
                                ?.perfil ||
                                "—"}
                            </p>
                          </div>

                          <p className="text-xs font-medium text-slate-600">
                            {formatarData(
                              item.criadoEm
                            )}
                          </p>
                        </div>

                        {alteracoes.length >
                        0 ? (
                          <div className="mt-3 space-y-2">
                            {alteracoes.map(
                              (
                                alteracao,
                                alteracaoIndex
                              ) => (
                                <div
                                  key={`${item.id}-${alteracaoIndex}`}
                                  className="rounded-md bg-white p-3 text-sm"
                                >
                                  <p className="font-medium">
                                    {
                                      alteracao.campo
                                    }
                                  </p>

                                  <div className="mt-1 grid gap-1 text-xs sm:grid-cols-2">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Antes:{" "}
                                      </span>

                                      <span>
                                        {
                                          alteracao.antes
                                        }
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">
                                        Depois:{" "}
                                      </span>

                                      <span>
                                        {
                                          alteracao.depois
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Edição registrada sem diferença operacional identificada nos campos exibidos.
                          </p>
                        )}
                      </div>
                    )
                  }
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />

                Orçamentos desta Interação
              </CardTitle>

              <CardDescription className="mt-1">
                Propostas comerciais originadas diretamente de{" "}
                <span className="font-mono font-medium">
                  {codigo}
                </span>
                .
              </CardDescription>
            </div>

            {interacao.cliente && (
              <Link
                href={`/orcamentos/novo?interacaoId=${interacao.id}`}
              >
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />

                  Criar Orçamento
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!interacao.cliente ? (
            <div className="rounded-md border bg-slate-50 p-4 text-sm text-muted-foreground">
              {origemProspeccao
                ? "Esta interação ainda é uma Prospecção / Lead. Para gerar orçamento comercial, primeiro será necessário cadastrar o Cliente e vincular a prospecção ao cadastro definitivo. Todo orçamento exige Cliente + Representada."
                : "Esta interação está vinculada diretamente a uma Representada. Para gerar um orçamento comercial é necessário partir de uma interação vinculada ao Cliente, pois todo orçamento exige Cliente + Representada."}
            </div>
          ) : loadingOrcamentos ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Carregando orçamentos...
            </div>
          ) : erroOrcamentos ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {
                erroOrcamentos
              }
            </div>
          ) : orcamentos.length ===
            0 ? (
            <div className="rounded-md border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não existe orçamento originado desta interação.
              </p>

              <Link
                href={`/orcamentos/novo?interacaoId=${interacao.id}`}
              >
                <Button
                  className="mt-3"
                  variant="outline"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />

                  Gerar primeiro orçamento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orcamentos.map(
                (
                  orcamento
                ) => {
                  const codigoOrcamento =
                    formatarCodigoOrcamento(
                      orcamento.numeroSequencial
                    )

                  return (
                    <div
                      key={
                        orcamento.id
                      }
                      className="rounded-lg border bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/orcamentos/${orcamento.id}`}
                              className="font-mono text-sm font-bold text-blue-700 hover:underline"
                            >
                              {
                                codigoOrcamento
                              }
                            </Link>

                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${classeStatusOrcamento(
                                orcamento.status
                              )}`}
                            >
                              {
                                orcamento.status
                              }
                            </span>
                          </div>

                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Representada
                            </p>

                            <Link
                              href={`/representadas/${orcamento.representada.id}`}
                              className="text-sm font-medium text-blue-700 hover:underline"
                            >
                              {
                                orcamento.representada.nome
                              }
                            </Link>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Emitido:{" "}
                              {formatarDataSimples(
                                orcamento.data
                              )}
                            </span>

                            <span>
                              Validade:{" "}
                              {formatarDataSimples(
                                orcamento.validadeEm
                              )}
                            </span>

                            <span>
                              Responsável:{" "}
                              {orcamento.responsavel
                                ?.nome ||
                                "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <p className="text-lg font-bold">
                            {formatarMoeda(
                              orcamento.valorTotal
                            )}
                          </p>

                          <Link
                            href={`/orcamentos/${orcamento.id}`}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              Ver Orçamento
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