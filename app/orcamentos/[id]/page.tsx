"use client"

import { use, useEffect, useMemo, useState } from "react"
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
  ShoppingCart,
  XCircle,
} from "lucide-react"

import { PageLayout } from "@/components/page-layout"
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
import { formatarCodigoOrcamento } from "@/lib/orcamentos/codigo"

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
  status: string
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
  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null
}

type VendaGerada = {
  id: string
  numeroSequencial: number
  status: string
  data: string
  pedidoEnviadoEm: string | null
  confirmadoEm: string | null
  numeroPedidoRepresentada: string | null
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
  vendaGerada: VendaGerada | null
}

type AtualizacaoOrcamento = Orcamento & {
  vendaCriada?: {
    id: string
    numeroSequencial: number
  } | null
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
  historico: HistoricoItem[]
}

const CANAIS_APROVACAO = [
  "WhatsApp",
  "E-mail",
  "Documento assinado",
  "Outro",
]

const MARCADOR_ACEITE_V1 = "DADOS_APROVACAO_V1="
const MARCADOR_ACEITE_V2 = "DADOS_APROVACAO_V2="

function formatarDataHora(valor: string | null) {
  if (!valor) return "—"

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) return "—"

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatarData(valor: string | null) {
  if (!valor) return "—"

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) return "—"

  return data.toLocaleDateString("pt-BR")
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatarCodigoInteracao(numero: number) {
  return `INT-${String(numero).padStart(6, "0")}`
}

function formatarCodigoVenda(numero: number) {
  return `VEN-${String(numero).padStart(6, "0")}`
}

function classeStatus(status: string) {
  if (status === "Aprovado") {
    return "bg-green-100 text-green-800"
  }

  if (status === "Vencido") {
    return "bg-red-100 text-red-800"
  }

  if (status === "Recusado" || status === "Cancelado") {
    return "bg-slate-200 text-slate-700"
  }

  return "bg-amber-100 text-amber-800"
}

function calcularDiasRestantes(validadeEm: string) {
  const validade = new Date(validadeEm)

  return Math.ceil(
    (validade.getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  )
}

/*
 * Utiliza o dia comercial de Brasília,
 * inclusive quando o navegador estiver em outro fuso.
 */
function dataBrasilia(data: Date = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data)

  const parte = (tipo: string) =>
    partes.find((item) => item.type === tipo)?.value

  return `${parte("year")}-${parte("month")}-${parte("day")}`
}

function converterValorBR(valor: string): number | null {
  let texto = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")

  if (!texto) return null

  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", ".")
  }

  const numero = Number(texto)

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    Math.abs(numero * 100 - Math.round(numero * 100)) >
      0.000001
  ) {
    return null
  }

  return Number(numero.toFixed(2))
}

function converterPercentual(valor: string): number | null {
  const texto = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/%/g, "")
    .replace(",", ".")

  if (!/^\d+(?:\.\d{1,2})?$/.test(texto)) {
    return null
  }

  const numero = Number(texto)

  if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
    return null
  }

  return Number(numero.toFixed(2))
}

function formatarPercentual(valor: number) {
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

function converterDataHoraLocal(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) {
    return null
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) return null

  const [dataTexto, horarioTexto] = valor.split("T")
  const [ano, mes, dia] = dataTexto.split("-").map(Number)
  const [hora, minuto] = horarioTexto.split(":").map(Number)

  if (
    data.getFullYear() !== ano ||
    data.getMonth() + 1 !== mes ||
    data.getDate() !== dia ||
    data.getHours() !== hora ||
    data.getMinutes() !== minuto
  ) {
    return null
  }

  return data
}

/*
 * A API armazena o registro legível e uma linha técnica
 * para a conversão futura. Ocultamos apenas essa linha
 * na apresentação; nada é removido do banco.
 */
function registroFinalizacaoLegivel(valor: string) {
  return valor
    .split("\n")
    .filter(
      (linha) =>
        !linha.startsWith(MARCADOR_ACEITE_V1) &&
        !linha.startsWith(MARCADOR_ACEITE_V2)
    )
    .join("\n")
}

function temAceiteEstruturadoV2(valor: string | null) {
  return Boolean(
    valor
      ?.split("\n")
      .some((linha) => linha.startsWith(MARCADOR_ACEITE_V2))
  )
}

function temAceiteHistoricoV1(valor: string | null) {
  return Boolean(
    valor
      ?.split("\n")
      .some((linha) => linha.startsWith(MARCADOR_ACEITE_V1))
  )
}

export default function OrcamentoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [orcamento, setOrcamento] =
    useState<Orcamento | null>(null)

  const [historico, setHistorico] =
    useState<HistoricoItem[]>([])

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)

  const [envioEmInformado, setEnvioEmInformado] = useState("")
  const [aprovacaoCanal, setAprovacaoCanal] = useState("")
  const [aprovadoPor, setAprovadoPor] = useState("")
  const [aprovacaoReferencia, setAprovacaoReferencia] =
    useState("")
  const [aprovacaoEm, setAprovacaoEm] = useState("")
  const [dataVenda, setDataVenda] = useState(dataBrasilia)
  const [descontoPercentual, setDescontoPercentual] = useState("")
  const [bonificacaoValor, setBonificacaoValor] = useState("")
  const [novaValidade, setNovaValidade] = useState("")

  async function carregar() {
    try {
      setLoading(true)
      setErro(null)

      const [respostaOrcamento, respostaHistorico] =
        await Promise.all([
          fetch(`/api/orcamentos/${encodeURIComponent(id)}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/orcamentos/${encodeURIComponent(id)}/historico`,
            { cache: "no-store" }
          ),
        ])

      const dadosOrcamento =
        await respostaOrcamento.json().catch(() => null)

      const dadosHistorico: HistoricoResponse | null =
        await respostaHistorico.json().catch(() => null)

      if (!respostaOrcamento.ok || !dadosOrcamento?.id) {
        setErro(
          dadosOrcamento?.message ||
            "Não foi possível carregar o orçamento."
        )
        return
      }

      setOrcamento(dadosOrcamento as Orcamento)

      setHistorico(
        respostaHistorico.ok &&
          Array.isArray(dadosHistorico?.historico)
          ? dadosHistorico.historico
          : []
      )
    } catch {
      setErro("Erro ao carregar orçamento.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregar()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const diasRestantes = useMemo(
    () =>
      orcamento
        ? calcularDiasRestantes(orcamento.validadeEm)
        : null,
    [orcamento]
  )

  const descontoPercentualNumerico =
    converterPercentual(descontoPercentual)
  const bonificacaoNumerica =
    converterValorBR(bonificacaoValor)

  /*
   * O valor do Orçamento já é o valor final negociado.
   * O desconto percentual serve apenas para localizar
   * a faixa de comissão e não reduz a Venda novamente.
   */
  const valorVendaPrevisto = orcamento
    ? orcamento.valorTotal
    : null

  const baseComissaoPrevista = valorVendaPrevisto

  const clienteEmQualificacao =
    orcamento?.cliente.status === "Em qualificação"

  const clienteFormalizado =
    orcamento?.cliente.status === "Ativo" &&
    Boolean(orcamento.cliente.cnpj?.trim())

  const origemProspeccao =
    orcamento?.interacaoOrigem?.tipo === "Prospecção"

  const podeRegistrarAprovacao =
    Boolean(
      orcamento &&
        ["Pendente", "Vencido"].includes(orcamento.status) &&
        !orcamento.vendaGerada &&
        (clienteFormalizado ||
          (clienteEmQualificacao && origemProspeccao))
    )

  const aprovadoSemVenda =
    orcamento?.status === "Aprovado" &&
    !orcamento.vendaGerada

  const aprovacaoComDados =
    temAceiteEstruturadoV2(orcamento?.motivoFinalizacao ?? null)

  const aprovacaoHistoricaV1 =
    temAceiteHistoricoV1(orcamento?.motivoFinalizacao ?? null)

  const podeConverter =
    Boolean(
      aprovadoSemVenda &&
        clienteFormalizado &&
        aprovacaoComDados
    )

  async function atualizar(
    dados: Record<string, unknown>,
    mensagemSucesso:
      | string
      | ((resultado: AtualizacaoOrcamento) => string)
  ) {
    if (!orcamento || salvando) return

    try {
      setSalvando(true)
      setErro(null)
      setMensagem(null)

      const response = await fetch(
        `/api/orcamentos/${encodeURIComponent(orcamento.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setErro(
          data?.message ||
            "Não foi possível atualizar o orçamento."
        )
        return
      }

      if (!data?.id) {
        setErro(
          "O servidor não retornou a confirmação completa da atualização."
        )
        return
      }

      const resultado = data as AtualizacaoOrcamento
      setOrcamento(resultado)

      await carregar()

      setMensagem(
        typeof mensagemSucesso === "function"
          ? mensagemSucesso(resultado)
          : mensagemSucesso
      )
    } catch {
      setErro(
        "Erro de comunicação ao atualizar o orçamento."
      )
    } finally {
      setSalvando(false)
    }
  }

  async function marcarComoEnviado() {
    if (
      !orcamento ||
      orcamento.status !== "Pendente" ||
      orcamento.vendaGerada
    ) {
      return
    }

    const dataEnvio =
      converterDataHoraLocal(envioEmInformado)

    if (!dataEnvio || dataEnvio.getTime() > Date.now()) {
      setErro(
        "Informe a data e a hora reais do envio ao cliente. Não utilize data futura."
      )
      return
    }

    const confirmou = window.confirm(
      "Confirma que ESTE orçamento foi efetivamente enviado ao cliente na data informada?\n\n" +
        "Esta ação apenas registra o fato no CRM; não envia mensagens nem arquivos."
    )

    if (!confirmou) return

    await atualizar(
      { enviadoEm: dataEnvio.toISOString() },
      "Data real do envio registrada. Nenhuma mensagem ou arquivo foi enviado por esta ação."
    )
  }

  async function aprovar() {
    if (!orcamento || salvando || orcamento.vendaGerada) {
      return
    }

    if (!podeRegistrarAprovacao) {
      setErro(
        "Este cadastro não atende às condições de aprovação. " +
          "Verifique o status do Cliente e a Prospecção de origem."
      )
      return
    }

    if (!orcamento.enviadoEm) {
      setErro(
        "Registre o envio efetivamente realizado antes de aprovar o orçamento."
      )
      return
    }

    if (!CANAIS_APROVACAO.includes(aprovacaoCanal)) {
      setErro(
        "Selecione o canal em que o comprador confirmou a aprovação."
      )
      return
    }

    if (!aprovadoPor.trim()) {
      setErro(
        "Identifique o comprador ou responsável que aprovou o orçamento."
      )
      return
    }

    if (!aprovacaoReferencia.trim()) {
      setErro(
        "Informe onde está a confirmação original do comprador."
      )
      return
    }

    const dataAprovacao =
      converterDataHoraLocal(aprovacaoEm)

    if (
      !dataAprovacao ||
      dataAprovacao.getTime() > Date.now()
    ) {
      setErro(
        "Informe a data e a hora reais da aprovação. Não utilize data futura."
      )
      return
    }

    const dataEnvio = new Date(orcamento.enviadoEm)

    if (
      Number.isNaN(dataEnvio.getTime()) ||
      dataEnvio.getTime() > dataAprovacao.getTime()
    ) {
      setErro(
        "A data de envio está posterior à aprovação. Corrija o envio antes de continuar."
      )
      return
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dataVenda) ||
      dataVenda > dataBrasilia() ||
      dataVenda < dataBrasilia(dataAprovacao)
    ) {
      setErro(
        "A data comercial não pode ser futura nem anterior ao dia do aceite do comprador."
      )
      return
    }

    if (
      descontoPercentualNumerico === null ||
      bonificacaoNumerica === null
    ) {
      setErro(
        "Informe o desconto comercial em percentual e a bonificação em valor. Digite zero quando não houver."
      )
      return
    }

    const geraraVendaAgora = Boolean(clienteFormalizado)

    const consequencia = geraraVendaAgora
      ? "O CRM criará UMA Venda aguardando envio à Representada. Esta ação NÃO envia o pedido."
      : "O CRM registrará o aceite, mas NÃO criará Venda. A Venda dependerá da formalização deste mesmo Cliente."

    const confirmou = window.confirm(
      `Confirma a aprovação real deste orçamento?\n\n` +
        `Orçamento: ${formatarCodigoOrcamento(orcamento.numeroSequencial)}\n` +
        `Comprador: ${aprovadoPor.trim()}\n` +
        `Canal: ${aprovacaoCanal}\n` +
        `Data do aceite: ${formatarDataHora(dataAprovacao.toISOString())}\n` +
        `Valor final negociado do orçamento: ${formatarMoeda(orcamento.valorTotal)}\n` +
        `Desconto comercial para localizar a faixa de comissão: ${formatarPercentual(descontoPercentualNumerico)}\n` +
        `Valor previsto da Venda, sem nova subtração: ${formatarMoeda(valorVendaPrevisto ?? 0)}\n` +
        `Bonificação registrada separadamente: ${formatarMoeda(bonificacaoNumerica)}\n` +
        `Base prevista de comissão: ${formatarMoeda(baseComissaoPrevista ?? 0)}\n\n` +
        consequencia +
        "\n\nPreserve a confirmação original do comprador."
    )

    if (!confirmou) return

    await atualizar(
      {
        status: "Aprovado",
        aprovacaoCanal,
        aprovadoPor: aprovadoPor.trim(),
        aprovacaoReferencia: aprovacaoReferencia.trim(),
        aprovacaoEm: dataAprovacao.toISOString(),
        dataVenda,
        descontoPercentual: descontoPercentualNumerico,
        bonificacaoValor: bonificacaoNumerica,
      },
      (resultado) =>
        resultado.vendaCriada?.id || resultado.vendaGerada?.id
          ? "Aprovação registrada e Venda gerada. Confira a Venda antes de enviá-la à Representada."
          : "Aceite real registrado. Nenhuma Venda foi gerada. Formalize o mesmo Cliente antes da conversão."
    )
  }

  async function converterVendaAprovada() {
    if (!orcamento || salvando || !podeConverter) {
      setErro(
        "A conversão exige Orçamento aprovado, aceite estruturado e Cliente ativo com CNPJ."
      )
      return
    }

    const confirmou = window.confirm(
      `Confirma a geração de UMA Venda a partir do aceite já registrado?\n\n` +
        `Orçamento: ${formatarCodigoOrcamento(orcamento.numeroSequencial)}\n` +
        `Cliente: ${orcamento.cliente.razaoSocial}\n` +
        `CNPJ: ${orcamento.cliente.cnpj}\n\n` +
        "Confira o registro do aceite e os valores abaixo. " +
        "Esta ação não registra uma nova aprovação e NÃO envia o pedido à Representada."
    )

    if (!confirmou) return

    await atualizar(
      { acao: "GERAR_VENDA_APROVADA" },
      (resultado) =>
        resultado.vendaCriada?.id || resultado.vendaGerada?.id
          ? "Venda gerada a partir da aprovação já registrada. Confira seus dados antes de enviá-la à Representada."
          : "A operação retornou sem uma Venda identificável. Verifique o histórico antes de prosseguir."
    )
  }

  async function recusar() {
    if (
      !orcamento ||
      !["Pendente", "Vencido"].includes(orcamento.status)
    ) {
      return
    }

    const motivo = window.prompt(
      "Informe o motivo da recusa:"
    )

    if (motivo === null) return

    if (!motivo.trim()) {
      setErro(
        "Informe o motivo da recusa para preservar o histórico comercial."
      )
      return
    }

    await atualizar(
      {
        status: "Recusado",
        motivoFinalizacao: motivo.trim(),
      },
      orcamento.status === "Vencido"
        ? "Orçamento vencido finalizado como recusado, com histórico preservado."
        : "Orçamento registrado como recusado."
    )
  }

  async function cancelar() {
    if (!orcamento || orcamento.status !== "Pendente") return

    const motivo = window.prompt(
      "Informe o motivo do cancelamento:"
    )

    if (motivo === null) return

    await atualizar(
      {
        status: "Cancelado",
        motivoFinalizacao: motivo.trim() || null,
      },
      "Orçamento cancelado."
    )
  }

  async function reabrir() {
    if (
      !orcamento ||
      orcamento.vendaGerada ||
      !["Recusado", "Cancelado", "Vencido"].includes(
        orcamento.status
      )
    ) {
      return
    }

    if (orcamento.status === "Vencido") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(novaValidade)) {
        setErro(
          "Informe a nova validade para retomar o orçamento vencido."
        )
        return
      }

      const validadeAtual = new Date(orcamento.validadeEm)
      const novaValidadeData =
        new Date(`${novaValidade}T12:00:00-03:00`)

      if (
        Number.isNaN(validadeAtual.getTime()) ||
        Number.isNaN(novaValidadeData.getTime()) ||
        novaValidadeData.getTime() <= validadeAtual.getTime() ||
        novaValidade < dataBrasilia()
      ) {
        setErro(
          "A nova validade precisa ser posterior à validade anterior e não pode estar vencida."
        )
        return
      }

      const confirmou = window.confirm(
        `Confirma a retomada deste orçamento vencido?\n\n` +
          `Validade anterior: ${formatarData(orcamento.validadeEm)}\n` +
          `Nova validade: ${formatarData(novaValidadeData.toISOString())}\n\n` +
          "O mesmo orçamento será reaberto como Pendente e o vencimento anterior permanecerá registrado na auditoria."
      )

      if (!confirmou) return

      await atualizar(
        {
          status: "Pendente",
          validadeEm: novaValidadeData.toISOString(),
        },
        "Orçamento vencido retomado com nova validade. O histórico anterior foi preservado."
      )

      setNovaValidade("")
      return
    }

    const confirmou = window.confirm(
      "Confirma a reabertura deste orçamento? " +
        "A ação será registrada na auditoria."
    )

    if (!confirmou) return

    await atualizar(
      { status: "Pendente" },
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

  if (erro && !orcamento) {
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

  if (!orcamento) return null

  const codigo =
    formatarCodigoOrcamento(orcamento.numeroSequencial)

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
          {orcamento.status === "Pendente" &&
            !orcamento.vendaGerada && (
              <Link href={`/orcamentos/${orcamento.id}/editar`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
            )}

          <Button
            variant="outline"
            onClick={() => void carregar()}
            disabled={salvando}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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
            {orcamento.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados Comerciais</CardTitle>
              <CardDescription>
                Informações principais da proposta.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {clienteEmQualificacao
                      ? "Empresa em qualificação"
                      : "Cliente"}
                  </p>

                  <Link
                    href={`/clientes/${orcamento.cliente.id}`}
                    className="mt-1 flex items-center gap-2 font-medium text-blue-700 hover:underline"
                  >
                    <Building2 className="h-4 w-4" />
                    {nomeCliente}
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: {orcamento.cliente.status}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    CNPJ: {orcamento.cliente.cnpj || "—"}
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
                    {orcamento.representada.nome}
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Emitido em
                  </p>
                  <p className="mt-1 font-medium">
                    {formatarDataHora(orcamento.data)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Validade
                  </p>
                  <p className="mt-1 font-medium">
                    {formatarData(orcamento.validadeEm)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Valor do orçamento
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {formatarMoeda(orcamento.valorTotal)}
                  </p>
                </div>
              </div>

              {orcamento.status === "Pendente" &&
                !orcamento.enviadoEm && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                    Orçamento ainda sem envio registrado.
                    O prazo de validade não provoca
                    vencimento automático enquanto
                    o envio não tiver ocorrido.
                  </div>
                )}

              {orcamento.status === "Pendente" &&
                Boolean(orcamento.enviadoEm) &&
                diasRestantes !== null && (
                  <div className="rounded-md border bg-amber-50 p-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-amber-700" />

                      <span className="text-sm font-medium">
                        {diasRestantes > 0
                          ? `${diasRestantes} dia(s) restantes`
                          : diasRestantes === 0
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
                    {orcamento.condicaoPagamento}
                  </p>
                </div>
              )}

              {orcamento.descricao && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Descrição
                  </p>
                  <div className="mt-1 whitespace-pre-wrap rounded-md border bg-slate-50 p-3 text-sm">
                    {orcamento.descricao}
                  </div>
                </div>
              )}

              {orcamento.observacoes && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Observações internas
                  </p>
                  <div className="mt-1 whitespace-pre-wrap rounded-md border bg-slate-50 p-3 text-sm">
                    {orcamento.observacoes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {orcamento.status === "Pendente" &&
            !orcamento.vendaGerada && (
              <Card>
                <CardHeader>
                  <CardTitle>Envio ao Cliente</CardTitle>
                  <CardDescription>
                    Registre a data real em que este
                    orçamento foi enviado. Esta ação
                    não envia mensagens nem arquivos.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {orcamento.enviadoEm && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                      Envio registrado em{" "}
                      <strong>
                        {formatarDataHora(orcamento.enviadoEm)}
                      </strong>
                      . Se estiver incorreto, informe
                      a data correta abaixo.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="envioEmInformado">
                      Data e hora reais do envio
                    </Label>

                    <Input
                      id="envioEmInformado"
                      type="datetime-local"
                      value={envioEmInformado}
                      onChange={(event) =>
                        setEnvioEmInformado(event.target.value)
                      }
                      disabled={salvando}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={salvando || !envioEmInformado}
                    onClick={() => void marcarComoEnviado()}
                  >
                    <MailCheck className="mr-2 h-4 w-4" />

                    {orcamento.enviadoEm
                      ? "Corrigir data de envio"
                      : "Registrar envio realizado"}
                  </Button>
                </CardContent>
              </Card>
            )}

          {["Pendente", "Vencido"].includes(orcamento.status) &&
            !orcamento.vendaGerada && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Aprovação do Comprador</CardTitle>

                  <CardDescription>
                    Preencha somente quando houver
                    confirmação real e identificável
                    deste orçamento.{" "}
                    {orcamento.status === "Vencido"
                      ? "Mesmo vencido, o orçamento pode ser aprovado e finalizado sem apagar o histórico do vencimento. "
                      : ""}
                    {clienteEmQualificacao
                      ? "Para empresa em qualificação, o aceite será registrado sem gerar Venda."
                      : "Para Cliente formalizado, a aprovação gera uma Venda, mas não envia o pedido à Representada."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {!orcamento.enviadoEm && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Primeiro registre o envio
                      efetivamente realizado no quadro
                      anterior.
                    </div>
                  )}

                  {clienteEmQualificacao && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                      O cadastro está em qualificação.
                      O aceite real poderá ser registrado,
                      mas a Venda dependerá da formalização
                      do mesmo Cliente. Não cadastre
                      uma segunda empresa para converter.
                    </div>
                  )}

                  {!podeRegistrarAprovacao && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      O cadastro atual não atende às
                      condições da aprovação. Verifique
                      se é Cliente ativo com CNPJ ou
                      pré-cadastro com Prospecção válida.
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="aprovacaoCanal">
                        Canal da aprovação *
                      </Label>

                      <select
                        id="aprovacaoCanal"
                        value={aprovacaoCanal}
                        onChange={(event) =>
                          setAprovacaoCanal(event.target.value)
                        }
                        disabled={salvando}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">
                          Selecione o canal
                        </option>

                        {CANAIS_APROVACAO.map((canal) => (
                          <option key={canal} value={canal}>
                            {canal}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aprovadoPor">
                        Comprador que aprovou *
                      </Label>

                      <Input
                        id="aprovadoPor"
                        value={aprovadoPor}
                        onChange={(event) =>
                          setAprovadoPor(event.target.value)
                        }
                        placeholder="Nome do comprador"
                        disabled={salvando}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aprovacaoReferencia">
                      Referência da confirmação *
                    </Label>

                    <Input
                      id="aprovacaoReferencia"
                      value={aprovacaoReferencia}
                      onChange={(event) =>
                        setAprovacaoReferencia(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: WhatsApp do comprador, mensagem de 14/09 às 17h32"
                      disabled={salvando}
                    />

                    <p className="text-xs text-muted-foreground">
                      Identifique onde está a mensagem,
                      o e-mail ou o documento original
                      que comprova o aceite. Este campo
                      não anexa nem arquiva a evidência.
                      Preserve o original.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="aprovacaoEm">
                        Data e hora reais do aceite *
                      </Label>

                      <Input
                        id="aprovacaoEm"
                        type="datetime-local"
                        value={aprovacaoEm}
                        onChange={(event) =>
                          setAprovacaoEm(event.target.value)
                        }
                        disabled={salvando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataVenda">
                        Data comercial do negócio *
                      </Label>

                      <Input
                        id="dataVenda"
                        type="date"
                        value={dataVenda}
                        onChange={(event) =>
                          setDataVenda(event.target.value)
                        }
                        disabled={salvando}
                      />

                      <p className="text-xs text-muted-foreground">
                        Será a data comercial da Venda
                        quando ela puder ser gerada.
                        Pode ser retroativa, mas não
                        anterior ao aceite. A auditoria
                        preserva a data do lançamento.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border bg-slate-50 p-4">
                    <p className="text-sm font-semibold">
                      Impacto comercial e comissão
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      O valor do orçamento já é o valor final
                      negociado com o Cliente. Informe abaixo
                      somente o percentual de desconto comercial
                      usado para localizar a faixa de comissão.
                      Esse percentual não será abatido novamente.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="descontoPercentual">
                          Desconto comercial (%) *
                        </Label>

                        <Input
                          id="descontoPercentual"
                          value={descontoPercentual}
                          onChange={(event) =>
                            setDescontoPercentual(
                              event.target.value
                            )
                          }
                          placeholder="Ex.: 15,40"
                          inputMode="decimal"
                          disabled={salvando}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bonificacaoValor">
                          Bonificação registrada separadamente
                          (R$) *
                        </Label>

                        <Input
                          id="bonificacaoValor"
                          value={bonificacaoValor}
                          onChange={(event) =>
                            setBonificacaoValor(
                              event.target.value
                            )
                          }
                          placeholder="Ex.: 0,00"
                          inputMode="decimal"
                          disabled={salvando}
                        />
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span>Valor do orçamento</span>
                        <strong>
                          {formatarMoeda(orcamento.valorTotal)}
                        </strong>
                      </div>

                      <div className="mt-2 flex justify-between gap-3">
                        <span>
                          Desconto comercial para faixa de comissão
                        </span>
                        <strong>
                          {descontoPercentualNumerico === null
                            ? "Preencha o percentual"
                            : formatarPercentual(
                                descontoPercentualNumerico
                              )}
                        </strong>
                      </div>

                      <div className="mt-2 flex justify-between gap-3">
                        <span>Valor previsto da Venda</span>
                        <strong>
                          {valorVendaPrevisto === null
                            ? "—"
                            : formatarMoeda(
                                valorVendaPrevisto
                              )}
                        </strong>
                      </div>

                      <div className="mt-2 flex justify-between gap-3">
                        <span>
                          Base prevista para comissão
                        </span>
                        <strong>
                          {baseComissaoPrevista === null
                            ? "—"
                            : formatarMoeda(
                                baseComissaoPrevista
                              )}
                        </strong>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        O percentual de desconto serve somente
                        para localizar a faixa de comissão.
                        A Venda copiará integralmente o valor final
                        do orçamento. A bonificação fica registrada
                        separadamente e não reduz automaticamente
                        a Venda nem a base prevista de comissão.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={
                      salvando ||
                      !orcamento.enviadoEm ||
                      !podeRegistrarAprovacao
                    }
                    onClick={() => void aprovar()}
                    className="w-full sm:w-auto"
                  >
                    {salvando ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}

                    {clienteEmQualificacao
                      ? "Registrar aceite do comprador"
                      : "Aprovar e gerar Venda"}
                  </Button>
                </CardContent>
              </Card>
            )}

          <Card>
            <CardHeader>
              <CardTitle>Ações Comerciais</CardTitle>
              <CardDescription>
                Preserve o histórico do orçamento.
                A aprovação não representa envio do
                pedido à Representada.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-3">
              {["Pendente", "Vencido"].includes(
                orcamento.status
              ) && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={salvando}
                  onClick={() => void recusar()}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Recusar
                </Button>
              )}

              {orcamento.status === "Pendente" && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={salvando}
                  onClick={() => void cancelar()}
                >
                  Cancelar
                </Button>
              )}

              {orcamento.status === "Vencido" &&
                !orcamento.vendaGerada && (
                  <div className="w-full space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div>
                      <p className="font-semibold">
                        Retomar / Reabrir orçamento vencido
                      </p>

                      <p className="mt-1 text-xs">
                        Informe uma nova validade. O mesmo
                        orçamento voltará para Pendente e
                        o vencimento anterior continuará
                        registrado na auditoria.
                      </p>
                    </div>

                    <div className="max-w-xs space-y-2">
                      <Label htmlFor="novaValidade">
                        Nova validade *
                      </Label>

                      <Input
                        id="novaValidade"
                        type="date"
                        value={novaValidade}
                        onChange={(event) =>
                          setNovaValidade(event.target.value)
                        }
                        min={dataBrasilia()}
                        disabled={salvando}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={salvando || !novaValidade}
                      onClick={() => void reabrir()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retomar / Reabrir
                    </Button>
                  </div>
                )}

              {aprovadoSemVenda &&
                clienteEmQualificacao &&
                !aprovacaoHistoricaV1 && (
                  <div className="w-full rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <p className="font-semibold">
                      Aceite registrado — aguardando formalização
                    </p>

                    <p className="mt-2">
                      O comprador aprovou o orçamento,
                      mas nenhuma Venda foi criada.
                      Formalize o{" "}
                      <strong>mesmo cadastro</strong>,
                      utilizando o CNPJ verdadeiro e
                      o status Ativo. Não crie outro Cliente.
                    </p>

                    <p className="mt-2 text-xs">
                      A formalização de Clientes ainda
                      depende da validação específica
                      da API de cadastro. Não utilize
                      este fluxo com dados reais.
                    </p>
                  </div>
                )}

              {aprovadoSemVenda &&
                clienteFormalizado &&
                aprovacaoComDados && (
                  <div className="w-full space-y-3 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    <p className="font-semibold">
                      Cliente formalizado — conversão disponível
                    </p>

                    <p>
                      O aceite do comprador já está
                      registrado. A ação abaixo gera
                      uma única Venda a partir desse
                      aceite, sem registrar nova
                      aprovação e sem enviar o pedido.
                    </p>

                    <Button
                      type="button"
                      disabled={salvando || !podeConverter}
                      onClick={() =>
                        void converterVendaAprovada()
                      }
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Gerar Venda do Orçamento aprovado
                    </Button>
                  </div>
                )}

              {aprovadoSemVenda && aprovacaoHistoricaV1 && (
                <div className="w-full rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Esta aprovação foi registrada no formato
                  histórico V1, quando o desconto era tratado
                  como valor monetário. Para evitar reinterpretar
                  o passado, a conversão automática está bloqueada
                  e este caso deve ser conferido individualmente.
                </div>
              )}

              {aprovadoSemVenda &&
                !aprovacaoHistoricaV1 &&
                !clienteEmQualificacao &&
                (!clienteFormalizado ||
                  !aprovacaoComDados) && (
                  <div className="w-full rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    A aprovação existe, mas a conversão
                    automática não está habilitada.
                    Verifique a formalização do Cliente,
                    o CNPJ e o histórico do aceite.
                    Não crie outra Venda sem apurar
                    essa situação.
                  </div>
                )}

              {orcamento.vendaGerada && (
                <Link
                  href={`/vendas/${orcamento.vendaGerada.id}`}
                >
                  <Button type="button" variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Abrir{" "}
                    {formatarCodigoVenda(
                      orcamento.vendaGerada.numeroSequencial
                    )}
                  </Button>
                </Link>
              )}

              {["Recusado", "Cancelado"].includes(
                orcamento.status
              ) &&
                !orcamento.vendaGerada && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={salvando}
                    onClick={() => void reabrir()}
                  >
                    Reabrir como Pendente
                  </Button>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
              <CardDescription>
                Auditoria de criação e alterações
                do orçamento.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setHistoricoAberto((valor) => !valor)
                }
              >
                <History className="mr-2 h-4 w-4" />
                {historicoAberto
                  ? "Ocultar histórico"
                  : `Mostrar histórico (${historico.length})`}
              </Button>

              {historicoAberto && (
                <div className="mt-4 space-y-3">
                  {historico.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Nenhuma auditoria encontrada.
                    </div>
                  ) : (
                    historico.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border bg-slate-50 p-3"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.acao}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.usuario.nome} —{" "}
                              {item.usuario.perfil}
                            </p>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {formatarDataHora(item.criadoEm)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Situação</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>
                <p className="font-semibold">
                  {orcamento.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Enviado ao cliente em
                </p>
                <p className="text-sm">
                  {formatarDataHora(orcamento.enviadoEm)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Finalizado em
                </p>
                <p className="text-sm">
                  {formatarDataHora(orcamento.finalizadoEm)}
                </p>
              </div>

              {orcamento.motivoFinalizacao && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Registro da finalização
                  </p>

                  <div className="whitespace-pre-wrap break-words rounded-md border bg-slate-50 p-3 text-sm">
                    {registroFinalizacaoLegivel(
                      orcamento.motivoFinalizacao
                    )}
                  </div>
                </div>
              )}

              {orcamento.vendaGerada && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Venda vinculada
                  </p>

                  <Link
                    href={`/vendas/${orcamento.vendaGerada.id}`}
                    className="mt-1 inline-block font-mono font-bold text-blue-700 hover:underline"
                  >
                    {formatarCodigoVenda(
                      orcamento.vendaGerada.numeroSequencial
                    )}
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: {orcamento.vendaGerada.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsabilidade</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Criado por
                </p>

                <p className="font-medium">
                  {orcamento.criadoPor?.nome || "—"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {orcamento.criadoPor?.perfil || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Responsável
                </p>

                <p className="font-medium">
                  {orcamento.responsavel?.nome || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {orcamento.interacaoOrigem && (
            <Card>
              <CardHeader>
                <CardTitle>Origem</CardTitle>
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
                    {orcamento.interacaoOrigem.tipo}
                  </p>

                  {orcamento.interacaoOrigem.assunto && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {orcamento.interacaoOrigem.assunto}
                    </p>
                  )}

                  {orcamento.interacaoOrigem.empresaProspect && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Empresa informada:{" "}
                      {orcamento.interacaoOrigem.empresaProspect}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Próxima etapa</CardTitle>
            </CardHeader>

            <CardContent>
              {orcamento.vendaGerada ? (
                <div className="space-y-3">
                  <div className="rounded-md border bg-blue-50 p-3 text-sm text-blue-800">
                    <ShoppingCart className="mr-2 inline h-4 w-4" />

                    Este orçamento já gerou a Venda{" "}
                    <strong>
                      {formatarCodigoVenda(
                        orcamento.vendaGerada.numeroSequencial
                      )}
                    </strong>
                    . Confira os dados e registre
                    o envio à Representada somente
                    quando ele realmente ocorrer.
                  </div>

                  <Link
                    href={`/vendas/${orcamento.vendaGerada.id}`}
                    className="block"
                  >
                    <Button className="w-full">
                      Abrir Venda
                    </Button>
                  </Link>
                </div>
              ) : orcamento.status === "Vencido" ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <Clock3 className="mr-2 inline h-4 w-4" />
                  Este orçamento venceu. Você pode aprovar,
                  recusar ou retomar com uma nova validade,
                  mantendo o histórico anterior.
                </div>
              ) : aprovadoSemVenda ? (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />

                  O aceite do comprador está registrado.
                  {clienteEmQualificacao
                    ? " A próxima etapa é formalizar este mesmo cadastro de empresa, sem criar outro Cliente."
                    : podeConverter
                      ? " A conversão específica está disponível em Ações Comerciais."
                      : " Verifique o cadastro e a comprovação antes de qualquer conversão."}
                </div>
              ) : (
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
                  <Clock3 className="mr-2 inline h-4 w-4" />

                  Registre o envio real do orçamento.
                  Depois, informe a confirmação
                  identificável do comprador.
                  Preserve a comprovação original
                  fora deste formulário até existir
                  armazenamento próprio no CRM.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}