"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, CreditCard, Plus, RefreshCw, Wallet, ReceiptText, AlertCircle } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Consulta ao cadastro atual e à API de compras. Não cria movimentações bancárias.
type Cartao = {
  id: string
  nome: string
  emissor: string
  titularidade: string
  finalCartao: string | null
  limiteTotal: string | null
  limiteDisponivelInformado: string | null
  diaFechamento: number | null
  diaVencimento: number | null
  observacoes: string | null
}
type Parcela = {
  id: string
  numero: number
  valor: string
  vencimentoPrevisto: string | null
  status: string
  faturaId: string | null
}
type Compra = {
  id: string
  descricao: string
  natureza: string
  categoria: string | null
  dataCompra: string
  numeroParcelas: number
  valorTotal: string
  status: string
  parcelas: Parcela[]
}
type Formulario = {
  descricao: string
  natureza: "Pessoal" | "Empresarial" | "Mista"
  dataCompra: string
  valorTotal: string
  numeroParcelas: string
  categoria: string
  estabelecimento: string
  observacoes: string
  referenciaExterna: string
}
const vazio: Formulario = {
  descricao: "", natureza: "Pessoal", dataCompra: "", valorTotal: "",
  numeroParcelas: "1", categoria: "", estabelecimento: "",
  observacoes: "", referenciaExterna: "",
}
const moeda = (valor: number | string | null) => valor === null
  ? "Não informado"
  : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor))
const dataVisivel = (valor: string | null) => {
  if (!valor) return "Data não informada"
  const trecho = valor.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trecho)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "Data não informada"
}
function erroDaApi(dados: unknown, padrao: string) {
  if (dados && typeof dados === "object") {
    const obj = dados as { erro?: unknown; message?: unknown }
    if (typeof obj.erro === "string") return obj.erro
    if (typeof obj.message === "string") return obj.message
  }
  return padrao
}
function normalizarValor(valor: string) {
  const limpo = valor.trim().replace(/\s/g, "")
  if (!/^\d{1,12}(?:[.,]\d{1,2})?$/.test(limpo)) return null
  return limpo.replace(",", ".")
}
function centavos(valor: string): number {
  const [inteira, decimal = ""] = valor.split(".")
  return Number(inteira) * 100 + Number(decimal.padEnd(2, "0"))
}
export default function DetalheCartaoPage() {
  const params = useParams()
  const cartaoId = typeof params?.id === "string" ? params.id : ""
  const [cartao, setCartao] = useState<Cartao | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<Formulario>(vazio)
  const [datas, setDatas] = useState<string[]>([""])
  const [abertas, setAbertas] = useState<string[]>([])

  const carregar = useCallback(async () => {
    if (!cartaoId) { setErro("Identificador do cartão inválido."); setCarregando(false); return }
    setCarregando(true)
    setErro("")
    try {
      const [cartoesResposta, comprasResposta] = await Promise.all([
        fetch("/api/financeiro/cartoes", { cache: "no-store" }),
        fetch(`/api/financeiro/cartoes/compras?cartaoId=${encodeURIComponent(cartaoId)}`, { cache: "no-store" }),
      ])
      const [cartoesJson, comprasJson]: unknown[] = await Promise.all([cartoesResposta.json(), comprasResposta.json()])
      if (!cartoesResposta.ok) throw new Error(erroDaApi(cartoesJson, "Falha ao consultar os cartões."))
      if (!comprasResposta.ok) throw new Error(erroDaApi(comprasJson, "Falha ao consultar as compras."))
      const lista = (cartoesJson as { cartoes?: Cartao[] }).cartoes
      const lancamentos = (comprasJson as { compras?: Compra[] }).compras
      if (!Array.isArray(lista) || !Array.isArray(lancamentos)) throw new Error("Resposta inesperada do servidor.")
      const encontrado = lista.find(item => item.id === cartaoId) || null
      if (!encontrado) throw new Error("Cartão não encontrado neste escritório.")
      setCartao(encontrado)
      setCompras(lancamentos)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar dados do cartão.")
    } finally { setCarregando(false) }
  }, [cartaoId])

  useEffect(() => { void carregar() }, [carregar])

  const parcelas = useMemo(() => compras.flatMap(compra => compra.parcelas.map(parcela => ({ ...parcela, compra }))), [compras])
  const pendentes = useMemo(() => parcelas.filter(item => item.status !== "Paga" && item.status !== "Cancelada"), [parcelas])
  const comprometido = pendentes.reduce((soma, item) => soma + centavos(item.valor), 0)
  const comDatas = [...pendentes].filter(item => item.vencimentoPrevisto).sort((a, b) => (a.vencimentoPrevisto || "").localeCompare(b.vencimentoPrevisto || ""))
  const usado = cartao?.limiteTotal !== null && cartao?.limiteDisponivelInformado !== null && cartao
    ? Number(cartao.limiteTotal) - Number(cartao.limiteDisponivelInformado)
    : null

  function alterar<K extends keyof Formulario>(chave: K, valor: Formulario[K]) {
    setForm(atual => ({ ...atual, [chave]: valor }))
  }
  function alterarQuantidade(valor: string) {
    alterar("numeroParcelas", valor)
    const quantidade = Number(valor)
    if (Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= 120) {
      setDatas(anteriores => Array.from({ length: quantidade }, (_, i) => anteriores[i] || ""))
    }
  }
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    setErro(""); setSucesso("")
    const valor = normalizarValor(form.valorTotal)
    const quantidade = Number(form.numeroParcelas)
    if (!valor || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 120 ||
      datas.length !== quantidade ||
      !/^\d{4}-\d{2}-\d{2}$/.test(form.dataCompra) ||
      datas.some(data => data && !/^\d{4}-\d{2}-\d{2}$/.test(data))) {
      setErro("Confira valor, data da compra, quantidade de parcelas e datas opcionais.")
      return
    }
    setSalvando(true)
    try {
      const resposta = await fetch("/api/financeiro/cartoes/compras", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartaoId, descricao: form.descricao.trim(), natureza: form.natureza,
          dataCompra: form.dataCompra, valorTotal: valor, numeroParcelas: quantidade,
          categoria: form.categoria.trim() || null,
          estabelecimento: form.estabelecimento.trim() || null,
          observacoes: form.observacoes.trim() || null,
          referenciaExterna: form.referenciaExterna.trim() || null,
          vencimentos: datas.map(data => data || null),
        }),
      })
      const dados: unknown = await resposta.json()
      if (!resposta.ok) throw new Error(erroDaApi(dados, "Erro ao registrar compra."))
      setForm(vazio); setDatas([""]); setMostrarCadastro(false)
      setSucesso("Compra cadastrada com parcelas previstas. Nenhuma saída bancária foi criada.")
      await carregar()
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao salvar compra.") }
    finally { setSalvando(false) }
  }
  return (
    <PageLayout title="Financeiro">
      <main className="mx-auto w-full max-w-6xl space-y-4 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Link href="/financeiro/cartoes" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Cartões de crédito</Link>
            <h1 className="truncate text-2xl font-bold tracking-tight">{cartao?.nome || "Detalhamento do cartão"}</h1>
            <p className="text-xs text-muted-foreground">Compras e parcelas registradas neste cartão</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" onClick={() => void carregar()} disabled={carregando}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Atualizar</Button>
            <Button size="sm" className="h-8 px-2.5 text-xs" onClick={() => setMostrarCadastro(v => !v)}><Plus className="mr-1 h-3.5 w-3.5" /> {mostrarCadastro ? "Fechar" : "Nova compra"}</Button>
          </div>
        </div>
        {erro && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{erro}</div>}
        {sucesso && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{sucesso}</div>}
        {carregando && <p className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">Atualizando informações...</p>}
        {cartao && <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-3 shadow-sm"><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CreditCard className="h-3.5 w-3.5"/> Limite total</p><p className="mt-1 text-base font-bold tabular-nums">{moeda(cartao.limiteTotal)}</p></div>
            <div className="rounded-xl border bg-card p-3 shadow-sm"><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Wallet className="h-3.5 w-3.5"/> Disponível informado</p><p className="mt-1 text-base font-bold tabular-nums">{moeda(cartao.limiteDisponivelInformado)}</p></div>
            <div className="rounded-xl border bg-card p-3 shadow-sm"><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Wallet className="h-3.5 w-3.5"/> Utilizado informado</p><p className="mt-1 text-base font-bold tabular-nums">{moeda(usado)}</p></div>
            <div className="rounded-xl border bg-card p-3 shadow-sm"><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><ReceiptText className="h-3.5 w-3.5"/> Parcelado pendente no CRM</p><p className="mt-1 text-base font-bold tabular-nums">{moeda((comprometido / 100).toFixed(2))}</p><p className="text-[10px] text-muted-foreground">{pendentes.length} parcela(s), {compras.length} compra(s)</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
            <span><CalendarDays className="mr-1 inline h-3.5 w-3.5"/>Fecha dia {cartao.diaFechamento ?? "não informado"}</span>
            <span>Vence habitualmente dia {cartao.diaVencimento ?? "não informado"}</span>
            <span>{cartao.titularidade === "PJ" ? "Pessoa jurídica" : "Pessoa física"}</span>
            <span className="ml-auto">{comDatas[0] ? `Próximo vencimento: ${dataVisivel(comDatas[0].vencimentoPrevisto)}` : "Sem vencimento confirmado"}</span>
          </div>
          {cartao.observacoes?.trim() && <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/><span><strong>Observação: </strong>{cartao.observacoes}</span></div>}
          {mostrarCadastro && <form onSubmit={salvar} className="space-y-3 rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Nova compra parcelada</h2><p className="text-[11px] text-muted-foreground">Não cria saída bancária ou fatura.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1"><Label htmlFor="descricao" className="text-xs">Descrição *</Label><Input id="descricao" required maxLength={250} value={form.descricao} onChange={e => alterar("descricao", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="dataCompra" className="text-xs">Data da compra *</Label><Input id="dataCompra" required type="date" value={form.dataCompra} onChange={e => alterar("dataCompra", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="natureza" className="text-xs">Natureza da despesa *</Label><select id="natureza" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.natureza} onChange={e => alterar("natureza", e.target.value as Formulario["natureza"])}><option value="Pessoal">Pessoal (PF)</option><option value="Empresarial">Empresarial (PJ)</option><option value="Mista">Mista</option></select></div>
              <div className="space-y-1"><Label htmlFor="valorTotal" className="text-xs">Valor total (R$) *</Label><Input id="valorTotal" required inputMode="decimal" placeholder="4140,00" value={form.valorTotal} onChange={e => alterar("valorTotal", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="numeroParcelas" className="text-xs">Parcelas *</Label><Input id="numeroParcelas" type="number" min={1} max={120} required value={form.numeroParcelas} onChange={e => alterarQuantidade(e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="categoria" className="text-xs">Categoria</Label><Input id="categoria" maxLength={120} value={form.categoria} onChange={e => alterar("categoria", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="estabelecimento" className="text-xs">Estabelecimento / credor</Label><Input id="estabelecimento" maxLength={160} value={form.estabelecimento} onChange={e => alterar("estabelecimento", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="referenciaExterna" className="text-xs">Referência identificadora</Label><Input id="referenciaExterna" maxLength={160} value={form.referenciaExterna} onChange={e => alterar("referenciaExterna", e.target.value)} /></div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label htmlFor="observacoesCompra" className="text-xs">Observações</Label><textarea id="observacoesCompra" rows={2} maxLength={2000} className="w-full rounded-md border bg-background p-2 text-sm" value={form.observacoes} onChange={e => alterar("observacoes", e.target.value)} /></div>
            </div>
            <details className="rounded-lg border bg-muted/20 p-3" open={datas.length <= 2}>
              <summary className="cursor-pointer text-xs font-semibold">Vencimentos por parcela ({datas.length}) — abrir para informar datas reais</summary>
              <p className="mt-1 text-[11px] text-muted-foreground">Datas desconhecidas ficam em branco; não serão calculadas automaticamente.</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{datas.map((data, indice) => <div key={indice} className="space-y-1"><Label htmlFor={`parcela-${indice}`} className="text-[11px]">Parcela {indice + 1}</Label><Input id={`parcela-${indice}`} type="date" value={data} onChange={e => setDatas(anteriores => anteriores.map((atual, i) => i === indice ? e.target.value : atual))} /></div>)}</div>
            </details>
            <div className="flex justify-end gap-2 border-t pt-3"><Button type="button" size="sm" variant="outline" onClick={() => setMostrarCadastro(false)}>Cancelar</Button><Button type="submit" size="sm" disabled={salvando}>{salvando ? "Salvando..." : "Registrar compra"}</Button></div>
          </form>}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Compras registradas</h2><span className="text-xs text-muted-foreground">{compras.length} compra(s)</span></div>
            {!compras.length ? <p className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">Nenhuma compra registrada neste módulo. O limite utilizado pode incluir compras do banco ainda não conciliadas no CRM.</p> : <div className="space-y-2">{compras.map(compra => {
              const aberta = abertas.includes(compra.id)
              return <article key={compra.id} className="overflow-hidden rounded-xl border bg-card"><button type="button" aria-expanded={aberta} className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-muted/30" onClick={() => setAbertas(anteriores => aberta ? anteriores.filter(id => id !== compra.id) : [...anteriores, compra.id])}><span className="min-w-0"><span className="block text-sm font-semibold">{compra.descricao}</span><span className="text-[11px] text-muted-foreground">{dataVisivel(compra.dataCompra)} · {compra.natureza} · {compra.numeroParcelas} parcela(s)</span></span><span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums">{moeda(compra.valorTotal)}{aberta ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span></button>{aberta && <div className="grid gap-2 border-t p-3 sm:grid-cols-2 lg:grid-cols-4">{compra.parcelas.map(parcela => <div key={parcela.id} className="flex justify-between gap-2 rounded-lg border p-2 text-xs"><span><strong>{parcela.numero}/{compra.numeroParcelas}</strong><br/>{dataVisivel(parcela.vencimentoPrevisto)}<br/>{parcela.faturaId ? "Em fatura" : "Sem fatura"}</span><span className="text-right"><strong>{moeda(parcela.valor)}</strong><br/>{parcela.status}</span></div>)}</div>}</article>
            })}</div>}
          </section>
          <section className="space-y-2"><h2 className="flex items-center gap-1.5 text-sm font-semibold"><CalendarDays className="h-4 w-4"/> Próximos vencimentos conhecidos</h2>{comDatas.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{comDatas.slice(0, 12).map(parcela => <div key={parcela.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-xs"><div className="min-w-0"><span className="font-semibold">{dataVisivel(parcela.vencimentoPrevisto)}</span><p className="truncate text-muted-foreground">{parcela.compra.descricao} · {parcela.numero}/{parcela.compra.numeroParcelas}</p></div><strong className="shrink-0 tabular-nums">{moeda(parcela.valor)}</strong></div>)}</div> : <p className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">Nenhum vencimento confirmado neste cartão.</p>}</section>
          <p className="text-[11px] leading-relaxed text-muted-foreground">Limites são os últimos valores informados, não saldos bancários em tempo real. Compras e parcelas exibidas são somente as registradas no CRM. Pagamentos de faturas serão conciliados em etapa específica.</p>
        </>}
      </main>
    </PageLayout>
  )
}