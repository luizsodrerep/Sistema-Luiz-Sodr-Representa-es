"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertTriangle, Bell, Check, ChevronRight, ClipboardCopy, Clock3,
  MessageSquare, RefreshCw, X,
} from "lucide-react"

type ModuloAssistente =
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "agenda"
  | "titulos"
  | "faturamentos"
  | "comissoes"
  | "redes-sociais"

type SituacaoTemporal = "atrasado" | "hoje" | "proximos" | "futuro" | "sem-data"
type PrioridadeAssistente = "critica" | "alta" | "normal" | "informativa"
type FiltroResponsavel = "todas" | "luiz" | "paula" | "outros" | "sem-responsavel"
type VisaoPendencias = "criticos" | "todas"
type FiltroPrazo = SituacaoTemporal | "todos"

type PendenciaAssistente = {
  id: string
  modulo: ModuloAssistente
  entidadeId: string
  codigo: string | null
  titulo: string
  descricao: string
  relacionadoA: string | null
  responsavel: string | null
  dataReferencia: string | null
  situacaoTemporal: SituacaoTemporal
  prioridade: PrioridadeAssistente
  status: string | null
  href: string
  origem: string | null
}

type RespostaAssistente = {
  alertasCriticos?: PendenciaAssistente[]
  pendencias?: PendenciaAssistente[]
}

type AlertaCriticoGlobalProps = {
  nomeUsuario: string
}

function identificarResponsavel(nome: string | null): Exclude<FiltroResponsavel, "todas"> {
  if (!nome?.trim()) return "sem-responsavel"
  const normalizado = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
  if (/\bpaula\b/.test(normalizado)) return "paula"
  if (/\bluiz\b/.test(normalizado)) return "luiz"
  return "outros"
}

function formatarData(valor: string | null) {
  if (!valor) return null
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return null
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

function nomeModulo(modulo: ModuloAssistente) {
  const nomes: Record<ModuloAssistente, string> = {
    interacoes: "Interação", orcamentos: "Orçamento", vendas: "Venda",
    agenda: "Agenda", titulos: "Título", faturamentos: "Faturamento",
    comissoes: "Comissão", "redes-sociais": "Redes sociais",
  }
  return nomes[modulo]
}

function ehUrgente(item: PendenciaAssistente) {
  return item.prioridade === "critica" || item.situacaoTemporal === "atrasado"
}

// Usa a classificação recebida do Assistente. Não inventa nem modifica prazos.
const pesoPrazo: Record<SituacaoTemporal, number> = {
  atrasado: 0, hoje: 1, proximos: 2, "sem-data": 3, futuro: 4,
}
const pesoPrioridade: Record<PrioridadeAssistente, number> = {
  critica: 0, alta: 1, normal: 2, informativa: 3,
}
const rotuloPrazo: Record<SituacaoTemporal, string> = {
  atrasado: "Atrasado", hoje: "Vence hoje", proximos: "Próximos 7 dias",
  "sem-data": "Sem prazo", futuro: "Futuro",
}

// Recomenda somente uma verificação operacional; não presume contato, pagamento ou solução.
function orientarProvidencia(item: PendenciaAssistente): string {
  switch (item.modulo) {
    case "interacoes":
      return "Registrar o resultado do contato ou da visita. Se continuar aberto, informar o próximo passo e a data de retorno."
    case "orcamentos":
      return "Verificar a definição comercial com o cliente e atualizar a situação do orçamento no CRM."
    case "vendas":
      if (item.titulo.toLowerCase().includes("faturamento")) {
        return "Verificar com a representada se o pedido foi faturado e conferir as NFs no CRM. Não registrar faturamento sem documento."
      }
      return "Conferir a etapa do pedido com a representada e registrar o andamento no CRM."
    case "agenda":
      return "Verificar a execução da tarefa. Concluir somente se a atividade tiver sido realizada."
    case "titulos":
      return "Conferir a situação do título antes de qualquer baixa ou alteração financeira."
    default:
      return "Consultar o registro de origem e documentar a próxima providência."
  }
}

// Lembrete interno de acompanhamento: não envia mensagens nem muda o status da pendência.
function prepararLembrete(item: PendenciaAssistente): string {
  const referencias = [
    `Acompanhamento interno — ${nomeModulo(item.modulo)}${item.codigo ? ` ${item.codigo}` : ""}`,
    `Responsável: ${item.responsavel?.trim() || "não atribuído"}`,
    `Assunto: ${item.titulo}`,
    item.relacionadoA ? `Relacionado a: ${item.relacionadoA}` : null,
    `Prazo: ${rotuloPrazo[item.situacaoTemporal]}${formatarData(item.dataReferencia) ? ` (${formatarData(item.dataReferencia)})` : ""}`,
    item.descricao ? `Informação registrada: ${item.descricao}` : null,
    `Providência sugerida: ${orientarProvidencia(item)}`,
    "Por favor, confirme o andamento e registre no CRM a providência tomada. Se estiver aguardando cliente ou representada, informe essa dependência e a data combinada de retorno.",
  ]
  return referencias.filter((linha): linha is string => typeof linha === "string").join("\n")
}

function ordenarPendencias(itens: PendenciaAssistente[]) {
  return [...itens].sort((a, b) => {
    const porPrazo = pesoPrazo[a.situacaoTemporal] - pesoPrazo[b.situacaoTemporal]
    if (porPrazo !== 0) return porPrazo

    const porPrioridade = pesoPrioridade[a.prioridade] - pesoPrioridade[b.prioridade]
    if (porPrioridade !== 0) return porPrioridade

    // Ordena pela data apenas quando os dois registros possuem datas válidas.
    const dataA = a.dataReferencia ? new Date(a.dataReferencia).getTime() : NaN
    const dataB = b.dataReferencia ? new Date(b.dataReferencia).getTime() : NaN
    if (Number.isFinite(dataA) && Number.isFinite(dataB) && dataA !== dataB) {
      return dataA - dataB
    }
    return 0 // Mantém a ordem original em empates (ordenação estável).
  })
}

function IndicadorDocumentosGlobal({ oculto }: { oculto: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [total, setTotal] = useState<number | null>(null)
  const [falha, setFalha] = useState(false)

  useEffect(() => {
    let encerrado = false
    let consultando = false
    let controle: AbortController | null = null

    async function consultar() {
      if (consultando || document.visibilityState === "hidden") return
      consultando = true
      controle = new AbortController()
      const limite = window.setTimeout(() => controle?.abort(), 15000)
      try {
        const resposta = await fetch("/api/central-documentos", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controle.signal,
        })
        if (!resposta.ok) throw new Error("Consulta indisponível")
        const dados: unknown = await resposta.json()
        if (
          typeof dados !== "object" || dados === null ||
          !("documentos" in dados) || !Array.isArray(dados.documentos)
        ) throw new Error("Resposta inválida")

        const quantidade = dados.documentos.filter((item: unknown) =>
          typeof item === "object" && item !== null &&
          "situacao" in item && item.situacao === "PendenteRevisao"
        ).length

        if (!encerrado) {
          setTotal(quantidade)
          setFalha(false)
        }
      } catch {
        if (!encerrado) setFalha(true)
      } finally {
        window.clearTimeout(limite)
        consultando = false
      }
    }

    const atualizar = () => { void consultar() }
    atualizar()
    const intervalo = window.setInterval(atualizar, 30000)
    window.addEventListener("focus", atualizar)
    document.addEventListener("visibilitychange", atualizar)

    return () => {
      encerrado = true
      controle?.abort()
      window.clearInterval(intervalo)
      window.removeEventListener("focus", atualizar)
      document.removeEventListener("visibilitychange", atualizar)
    }
  }, [pathname])

  if (oculto) return null

  const descricao = falha
    ? "Documentos: consulta indisponível. Abra a Central para conferir."
    : total === null
      ? "Consultando documentos para validar"
      : `Documentos para validar: ${total}`

  return (
    <button
      type="button"
      onClick={() => router.push("/central-documentos")}
      aria-label={descricao}
      title={descricao}
      className="absolute bottom-14 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#071a2f] text-white shadow-lg ring-2 ring-white transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
      {(falha || total === null || total > 0) && (
        <span className={`absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white ${falha ? "bg-amber-700" : total === null ? "bg-slate-600" : "bg-red-600"}`}>
          {falha ? "!" : total === null ? "…" : total > 99 ? "99+" : total}
        </span>
      )}
    </button>
  )
}

export function AlertaCriticoGlobal({ nomeUsuario }: AlertaCriticoGlobalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [alertas, setAlertas] = useState<PendenciaAssistente[]>([])
  const [pendencias, setPendencias] = useState<PendenciaAssistente[]>([])
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)
  const [filtro, setFiltro] = useState<FiltroResponsavel>("todas")
  const [visao, setVisao] = useState<VisaoPendencias>("todas")
  const [filtroPrazo, setFiltroPrazo] = useState<FiltroPrazo>("todos")
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)
  const [lembreteId, setLembreteId] = useState<string | null>(null)
  const [copiandoId, setCopiandoId] = useState<string | null>(null)
  const [processandoId, setProcessandoId] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  const carregarAlertas = useCallback(async (): Promise<boolean> => {
    try {
      setCarregando(true)
      setErro(false)
      const resposta = await fetch("/api/meu-assistente-pessoal", {
        method: "GET", cache: "no-store",
      })
      if (!resposta.ok) throw new Error("Falha ao consultar as pendências")
      const dados: RespostaAssistente = await resposta.json()
      const criticos = Array.isArray(dados.alertasCriticos) ? dados.alertasCriticos : []
      setAlertas(criticos)
      setPendencias(Array.isArray(dados.pendencias) ? dados.pendencias : criticos)
      return true
    } catch (error) {
      console.error("Erro ao carregar pendências:", error)
      // Em falha de rede, preserva a última lista para não aparentar resolução inexistente.
      setErro(true)
      return false
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarAlertas()
  }, [carregarAlertas, pathname])

  useEffect(() => {
    const intervalo = window.setInterval(() => { void carregarAlertas() }, 5 * 60 * 1000)
    return () => window.clearInterval(intervalo)
  }, [carregarAlertas])

  function abrirCompromisso(item: PendenciaAssistente) {
    if (!item.href || !item.href.startsWith("/") || item.href.startsWith("//")) return
    setAberto(false)
    setConfirmandoId(null)
    setLembreteId(null)
    if (item.modulo === "agenda") {
      window.location.assign(item.href)
      return
    }
    router.push(item.href)
  }

  function registrarProvidencia(item: PendenciaAssistente) {
    // Acompanhamentos comerciais são registrados na Interação original,
    // com auditoria e sem alterar automaticamente o responsável.
    if (item.modulo !== "interacoes" || !item.entidadeId) return
    setAberto(false)
    setConfirmandoId(null)
    setLembreteId(null)
    window.location.assign(
      `/interacoes/${encodeURIComponent(item.entidadeId)}#registrar-acompanhamento`
    )
  }

  async function copiarLembrete(item: PendenciaAssistente) {
    setCopiandoId(item.id)
    try {
      // O usuário escolhe onde enviar o texto; nenhum canal é acionado automaticamente.
      await navigator.clipboard.writeText(prepararLembrete(item))
      setMensagem({ tipo: "sucesso", texto: "Lembrete interno copiado. Envie apenas se desejar e registre a providência no CRM." })
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível copiar automaticamente. Selecione e copie o texto no campo abaixo." })
    } finally {
      setCopiandoId(null)
    }
  }

  async function concluirTarefa(item: PendenciaAssistente) {
    // Somente a Agenda possui a operação de conclusão auditada nesta etapa.
    if (item.modulo !== "agenda" || !item.entidadeId || processandoId) return
    setProcessandoId(item.id)
    setMensagem(null)
    try {
      const resposta = await fetch(`/api/tarefas/${encodeURIComponent(item.entidadeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "concluir" }),
      })
      if (!resposta.ok) {
        const dados: { message?: string } = await resposta.json().catch(() => ({}))
        throw new Error(dados.message || "Não foi possível concluir esta tarefa.")
      }
      setConfirmandoId(null)
      const atualizado = await carregarAlertas()
      setMensagem(atualizado
        ? { tipo: "sucesso", texto: "Tarefa concluída. Responsável preservado e ação registrada na auditoria." }
        : { tipo: "sucesso", texto: "Tarefa concluída, mas a lista não foi atualizada. Utilize o botão de atualizar." })
      router.refresh()
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Não foi possível concluir esta tarefa.",
      })
    } finally {
      setProcessandoId(null)
    }
  }

  const totalCriticos = alertas.length
  const listaAtual = visao === "criticos" ? alertas : pendencias
  const totalUrgentes = alertas.filter(ehUrgente).length
  const totalAgenda = pendencias.filter((item) => item.modulo === "agenda").length
  const contagens = {
    luiz: listaAtual.filter((item) => identificarResponsavel(item.responsavel) === "luiz").length,
    paula: listaAtual.filter((item) => identificarResponsavel(item.responsavel) === "paula").length,
    outros: listaAtual.filter((item) => identificarResponsavel(item.responsavel) === "outros").length,
    "sem-responsavel": listaAtual.filter((item) => identificarResponsavel(item.responsavel) === "sem-responsavel").length,
  }
  const listaResponsavel = filtro === "todas"
    ? listaAtual
    : listaAtual.filter((item) => identificarResponsavel(item.responsavel) === filtro)
  const atrasadasDaSelecao = listaResponsavel.filter((item) => item.situacaoTemporal === "atrasado").length
  const semDataDaSelecao = listaResponsavel.filter((item) => item.situacaoTemporal === "sem-data").length

  // Os totais por prazo refletem o responsável e a visão atualmente selecionados.
  const opcoesPrazo: { id: FiltroPrazo; texto: string; total: number }[] = [
    { id: "todos", texto: "Todos", total: listaResponsavel.length },
    { id: "atrasado", texto: "Atrasados", total: listaResponsavel.filter((i) => i.situacaoTemporal === "atrasado").length },
    { id: "hoje", texto: "Hoje", total: listaResponsavel.filter((i) => i.situacaoTemporal === "hoje").length },
    { id: "proximos", texto: "Próx. 7 dias", total: listaResponsavel.filter((i) => i.situacaoTemporal === "proximos").length },
    { id: "sem-data", texto: "Sem data", total: listaResponsavel.filter((i) => i.situacaoTemporal === "sem-data").length },
    { id: "futuro", texto: "Futuros", total: listaResponsavel.filter((i) => i.situacaoTemporal === "futuro").length },
  ]
  const listaVisivel = ordenarPendencias(
    filtroPrazo === "todos"
      ? listaResponsavel
      : listaResponsavel.filter((item) => item.situacaoTemporal === filtroPrazo),
  )
  const lembreteAtivo = lembreteId ? pendencias.find((item) => item.id === lembreteId) : null
  const opcoes: { id: FiltroResponsavel; texto: string; total: number }[] = [
    { id: "todas", texto: "Todas", total: listaAtual.length },
    { id: "luiz", texto: "Luiz", total: contagens.luiz },
    { id: "paula", texto: "Paula", total: contagens.paula },
    { id: "outros", texto: "Outros", total: contagens.outros },
    { id: "sem-responsavel", texto: "Sem responsável", total: contagens["sem-responsavel"] },
  ]

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:right-6">
      <IndicadorDocumentosGlobal oculto={aberto} />
      {aberto && (
        <section
          id="central-alertas-global"
          aria-label="Central de Alertas e Robô Gestor de Pendências"
          className="absolute bottom-14 right-0 flex h-[min(70vh,620px)] max-h-[calc(100vh-96px)] w-[min(calc(100vw-24px),440px)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Bell className="h-4 w-4 text-blue-700" /> Central de Alertas
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Robô Gestor · {totalCriticos} críticos · {totalUrgentes} urgentes · Acesso: {nomeUsuario}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => void carregarAlertas()}
                disabled={carregando || processandoId !== null}
                aria-label="Atualizar pendências" title="Atualizar pendências"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />
              </button>
              <button type="button" onClick={() => { setAberto(false); setConfirmandoId(null) }}
                aria-label="Fechar central" title="Fechar central"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {erro && (
            <p role="status" className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              Falha ao atualizar. A lista pode estar desatualizada; tente novamente.
            </p>
          )}
          {mensagem && (
            <p role="status" className={`border-b px-4 py-2 text-xs ${
              mensagem.tipo === "sucesso"
                ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border-red-100 bg-red-50 text-red-800"
            }`}>
              {mensagem.texto}
            </p>
          )}

          <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2">
            <button type="button" onClick={() => { setVisao("todas"); setConfirmandoId(null); setLembreteId(null) }}
              aria-pressed={visao === "todas"}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                visao === "todas" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>Todas as pendências ({pendencias.length})</button>
            <button type="button" onClick={() => { setVisao("criticos"); setConfirmandoId(null); setLembreteId(null) }}
              aria-pressed={visao === "criticos"}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                visao === "criticos" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>Críticos ({totalCriticos})</button>
          </div>

          <nav aria-label="Filtrar pendências por responsável"
            className="flex shrink-0 flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2">
            {opcoes.filter((opcao) => opcao.id === "todas" || opcao.id === "luiz" || opcao.id === "paula" || opcao.total > 0).map((opcao) => (
              <button key={opcao.id} type="button" onClick={() => { setFiltro(opcao.id); setConfirmandoId(null); setLembreteId(null) }}
                aria-pressed={filtro === opcao.id}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                  filtro === opcao.id
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}>
                {opcao.texto} ({opcao.total})
              </button>
            ))}
          </nav>

          <nav aria-label="Filtrar pendências por prazo"
            className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2">
            <span className="shrink-0 text-[11px] font-semibold text-slate-500">Prazo</span>
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
              {opcoesPrazo.map((opcao) => (
                <button key={opcao.id} type="button"
                  onClick={() => { setFiltroPrazo(opcao.id); setConfirmandoId(null); setLembreteId(null) }}
                  aria-pressed={filtroPrazo === opcao.id}
                  className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                    filtroPrazo === opcao.id
                      ? "border-blue-700 bg-blue-700 text-white"
                      : opcao.id === "atrasado" && opcao.total > 0
                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opcao.texto} ({opcao.total})
                </button>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            <span className="min-w-0">
              <strong className="text-slate-800">Fila de ação:</strong> {atrasadasDaSelecao} vencida(s) · {semDataDaSelecao} sem data definida
            </span>
            {atrasadasDaSelecao > 0 && (
              <button type="button"
                onClick={() => { setFiltroPrazo("atrasado"); setConfirmandoId(null); setLembreteId(null) }}
                className="shrink-0 rounded border border-red-200 bg-white px-2 py-1 font-semibold text-red-700 hover:bg-red-50">
                Ver vencidas
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {listaVisivel.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                <p>{carregando && pendencias.length === 0
                  ? "Consultando pendências..."
                  : "Nenhuma pendência para os filtros selecionados."}</p>
                {filtroPrazo !== "todos" && !carregando && (
                  <button type="button" onClick={() => { setFiltroPrazo("todos"); setLembreteId(null) }}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:underline">
                    Mostrar todos os prazos
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {listaVisivel.map((item) => {
                  const dataFormatada = formatarData(item.dataReferencia)
                  const prioritario = ehUrgente(item)
                  const podeConcluirAqui = item.modulo === "agenda" && item.status === "Pendente"
                  const confirmando = confirmandoId === item.id
                  const processando = processandoId === item.id
                  return (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle aria-hidden="true"
                          className={`mt-0.5 h-4 w-4 shrink-0 ${prioritario ? "text-red-600" : "text-amber-600"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-slate-500">
                            <span>{nomeModulo(item.modulo)}{item.codigo ? ` · ${item.codigo}` : ""}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              item.situacaoTemporal === "atrasado"
                                ? "bg-red-50 text-red-700"
                                : item.situacaoTemporal === "hoje"
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}>{rotuloPrazo[item.situacaoTemporal]}</span>
                            {item.prioridade === "critica" || item.prioridade === "alta" ? (
                              <span className={`text-[10px] font-bold ${
                                item.prioridade === "critica" ? "text-red-700" : "text-amber-700"
                              }`}>{item.prioridade === "critica" ? "Prioridade crítica" : "Prioridade alta"}</span>
                            ) : null}
                          </div>
                          <p className="text-sm font-semibold leading-snug text-slate-900">{item.titulo}</p>
                          {item.relacionadoA && <p className="mt-0.5 text-xs text-slate-600">{item.relacionadoA}</p>}
                          {item.descricao && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.descricao}</p>}
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                              Responsável: {item.responsavel?.trim() || "Não atribuído"}
                            </span>
                            {dataFormatada && <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" /> {dataFormatada}
                            </span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <button type="button" onClick={() => abrirCompromisso(item)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50"
                            title="Abrir o registro original sem alterar sua situação">
                            Abrir <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          {item.modulo === "interacoes" && (
                            <button type="button" onClick={() => registrarProvidencia(item)}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50"
                              title="Registrar providência e agendar próximo acompanhamento na Interação"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Providência
                            </button>
                          )}
                           {!confirmando && (
                             <button type="button"
                               onClick={() => { setLembreteId(item.id); setConfirmandoId(null); setMensagem(null) }}
                               aria-haspopup="dialog"
                               className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                               title="Preparar lembrete interno sem enviar ou alterar registros">
                               <ClipboardCopy className="h-3.5 w-3.5" /> Lembrete
                             </button>
                           )}
                          {podeConcluirAqui && !confirmando && (
                            <button type="button" onClick={() => { setConfirmandoId(item.id); setMensagem(null) }}
                              disabled={processandoId !== null}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                              title="Concluir tarefa da Agenda com registro na auditoria">
                              <Check className="h-3.5 w-3.5" /> Concluir
                            </button>
                          )}
                        </div>
                      </div>
                      {podeConcluirAqui && confirmando && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                          <p className="text-xs font-semibold text-amber-900">Esta tarefa foi realmente concluída?</p>
                          <p className="mt-0.5 text-[11px] text-amber-800">
                            A conclusão será registrada em seu usuário; o responsável original será mantido.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => void concluirTarefa(item)}
                              disabled={processandoId !== null}
                              className="rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                              {processando ? "Concluindo..." : "Confirmar conclusão"}
                            </button>
                            <button type="button" onClick={() => setConfirmandoId(null)}
                              disabled={processandoId !== null}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] leading-tight text-slate-500">
            {totalAgenda} da Agenda · Ações e lembretes não encerram pendências automaticamente.
          </div>

          {lembreteAtivo && (
            <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-900/25 p-2" onClick={() => setLembreteId(null)}>
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Lembrete interno: ${lembreteAtivo.codigo || lembreteAtivo.titulo}`}
                onClick={(evento) => evento.stopPropagation()}
                className="flex max-h-[92%] w-full flex-col overflow-hidden rounded-lg border border-blue-200 bg-white shadow-xl"
              >
                <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">Lembrete pronto para copiar</p>
                    <p className="text-[11px] text-slate-600">{lembreteAtivo.codigo || nomeModulo(lembreteAtivo.modulo)} · {lembreteAtivo.responsavel || "Sem responsável"}</p>
                  </div>
                  <button type="button" onClick={() => setLembreteId(null)} aria-label="Fechar lembrete"
                    className="rounded p-1 text-slate-500 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <p className="text-[11px] text-slate-600">Prévia interna: nenhum contato foi enviado ou registrado.</p>
                  <textarea
                    aria-label={`Texto para copiar de ${lembreteAtivo.codigo || lembreteAtivo.titulo}`}
                    readOnly
                    value={prepararLembrete(lembreteAtivo)}
                    onFocus={(evento) => evento.currentTarget.select()}
                    rows={9}
                    className="mt-2 min-h-[160px] w-full resize-y rounded-md border border-slate-200 bg-slate-50 p-2 text-xs leading-relaxed text-slate-800"
                  />
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-3 py-2">
                  <button type="button" onClick={() => setLembreteId(null)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    Fechar
                  </button>
                  <button type="button" onClick={() => void copiarLembrete(lembreteAtivo)}
                    disabled={copiandoId !== null}
                    className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                    <ClipboardCopy className="mr-1 inline h-3.5 w-3.5" />
                    {copiandoId === lembreteAtivo.id ? "Copiando..." : "Copiar lembrete"}
                  </button>
                </div>
                {mensagem && (
                  <p role="status" className={`shrink-0 px-3 py-1.5 text-[11px] ${mensagem.tipo === "sucesso" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                    {mensagem.texto}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <button type="button" onClick={() => { setAberto((atual) => !atual); setConfirmandoId(null) }}
        aria-expanded={aberto}
        aria-controls="central-alertas-global"
        aria-label={`Central de alertas: ${totalCriticos} ${totalCriticos === 1 ? "pendência crítica" : "pendências críticas"}`}
        title={`Central de Alertas · ${totalCriticos} ${totalCriticos === 1 ? "pendência crítica" : "pendências críticas"}`}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#071a2f] text-white shadow-lg ring-2 ring-white transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        <Bell className="h-5 w-5" />
        {totalCriticos > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {totalCriticos > 99 ? "99+" : totalCriticos}
          </span>
        )}
      </button>
    </div>
  )
}
