"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Plus, AlertCircle, CheckCircle2, CreditCard, Eye, EyeOff, ShieldAlert, Wallet, CalendarDays, ChevronDown, ChevronUp } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Cartao = {
  id: string
  nome: string
  emissor: string
  titularidade: "PF" | "PJ"
  finalCartao: string | null
  diaFechamento: number | null
  diaVencimento: number | null
  melhorDiaInformado: number | null
  limiteTotal: string | null
  limiteDisponivelInformado: string | null
  ativo: boolean
  observacoes: string | null
}

type Formulario = {
  nome: string
  emissor: string
  titularidade: "PF" | "PJ"
  finalCartao: string
  diaFechamento: string
  diaVencimento: string
  melhorDiaInformado: string
  limiteTotal: string
  limiteDisponivelInformado: string
  observacoes: string
}

const inicial: Formulario = {
  nome: "", emissor: "", titularidade: "PJ", finalCartao: "",
  diaFechamento: "", diaVencimento: "", melhorDiaInformado: "",
  limiteTotal: "", limiteDisponivelInformado: "", observacoes: "",
}

const moeda = (valor: string | null) => valor === null
  ? "Não informado"
  : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor))

function erroDaResposta(dados: unknown, padrao: string) {
  if (dados && typeof dados === "object") {
    const objeto = dados as { erro?: unknown; message?: unknown }
    if (typeof objeto.erro === "string") return objeto.erro
    if (typeof objeto.message === "string") return objeto.message
  }
  return padrao
}

// Converte valores informados em reais para o formato decimal canônico aceito pela API.
function valorDecimal(entrada: string): string | null {
  const texto = entrada.trim()
  if (!texto) return null
  const normalizado = texto.replace(/\s/g, "").replace(/^R\$/i, "")
  if (!/^(?:\d{1,9})(?:[.,]\d{1,2})?$/.test(normalizado)) return null
  const decimal = normalizado.replace(",", ".")
  return decimal
}

// Calcula sempre em centavos para não criar diferença de arredondamento.
function centavosInformados(valor: string | null): number | null {
  if (valor === null || !/^\d+(?:\.\d{1,2})?$/.test(valor)) return null
  const [reais, centavos = ""] = valor.split(".")
  const resultado = Number(reais) * 100 + Number(centavos.padEnd(2, "0"))
  return Number.isSafeInteger(resultado) ? resultado : null
}

function moedaCentavos(valor: number | null) {
  return valor === null ? "Não informado" : moeda((valor / 100).toFixed(2))
}

function utilizadoInformado(cartao: Cartao): number | null {
  const total = centavosInformados(cartao.limiteTotal)
  const disponivel = centavosInformados(cartao.limiteDisponivelInformado)
  if (total === null || disponivel === null) return null
  return total - disponivel
}

export default function CartoesFinanceirosPage() {
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [form, setForm] = useState<Formulario>(inicial)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [observacoesAbertas, setObservacoesAbertas] = useState<string[]>([])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      const resposta = await fetch("/api/financeiro/cartoes", { cache: "no-store" })
      const dados: unknown = await resposta.json()
      if (!resposta.ok) throw new Error(erroDaResposta(dados, "Falha ao buscar cartões."))
      const resultado = dados as { cartoes?: Cartao[] }
      if (!Array.isArray(resultado.cartoes)) throw new Error("Resposta de cartões inesperada.")
      setCartoes(resultado.cartoes)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível consultar os cartões.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  function alterar<K extends keyof Formulario>(chave: K, valor: Formulario[K]) {
    setForm(anterior => ({ ...anterior, [chave]: valor }))
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    setErro("")
    setSucesso("")

    const limiteTotal = valorDecimal(form.limiteTotal)
    const limiteDisponivelInformado = valorDecimal(form.limiteDisponivelInformado)
    if ((form.limiteTotal.trim() && limiteTotal === null) ||
        (form.limiteDisponivelInformado.trim() && limiteDisponivelInformado === null)) {
      setErro("Digite os limites em reais, por exemplo 4500,00. Não use separador de milhares.")
      return
    }
    if (limiteTotal !== null && limiteDisponivelInformado !== null &&
      Number(limiteDisponivelInformado) > Number(limiteTotal)) {
      setErro("O limite disponível não pode superar o limite total.")
      return
    }

    setSalvando(true)
    try {
      const resposta = await fetch("/api/financeiro/cartoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(), emissor: form.emissor.trim(), titularidade: form.titularidade,
          finalCartao: form.finalCartao.trim() || null,
          diaFechamento: form.diaFechamento || null,
          diaVencimento: form.diaVencimento || null,
          melhorDiaInformado: form.melhorDiaInformado || null,
          limiteTotal, limiteDisponivelInformado,
          observacoes: form.observacoes.trim() || null,
        }),
      })
      const dados: unknown = await resposta.json()
      if (!resposta.ok) throw new Error(erroDaResposta(dados, "Não foi possível cadastrar o cartão."))
      setForm(inicial)
      setMostrarFormulario(false)
      setSucesso("Cartão cadastrado. Nenhuma movimentação financeira foi lançada.")
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar o cartão.")
    } finally {
      setSalvando(false)
    }
  }

  const campoDia = (titulo: string, chave: "diaFechamento" | "diaVencimento" | "melhorDiaInformado") => (
    <div className="space-y-1.5">
      <Label htmlFor={chave}>{titulo}</Label>
      <Input id={chave} type="number" min="1" max="31" step="1" placeholder="Dia (1–31)"
        value={form[chave]} onChange={e => alterar(chave, e.target.value)} />
    </div>
  )

  const totalLimites = cartoes.reduce((soma, cartao) => soma + (cartao.limiteTotal === null ? 0 : Number(cartao.limiteTotal)), 0)
  const limitesDisponiveis = cartoes.reduce((soma, cartao) => soma + (cartao.limiteDisponivelInformado === null ? 0 : Number(cartao.limiteDisponivelInformado)), 0)
  const limitesInformados = cartoes.filter(cartao => cartao.limiteTotal !== null).length
  const disponiveisInformados = cartoes.filter(cartao => cartao.limiteDisponivelInformado !== null).length
  const cartoesComObservacao = cartoes.filter(cartao => Boolean(cartao.observacoes?.trim())).length
  const cartoesComUtilizacao = cartoes.filter(cartao => utilizadoInformado(cartao) !== null)
  const totalUtilizadoCentavos = cartoesComUtilizacao.reduce(
    (soma, cartao) => soma + (utilizadoInformado(cartao) ?? 0), 0,
  )

  function alternarObservacoes(id: string) {
    setObservacoesAbertas(anteriores =>
      anteriores.includes(id)
        ? anteriores.filter(item => item !== id)
        : [...anteriores, id],
    )
  }

  return (
    <PageLayout title="Financeiro">
      <div className="mx-auto w-full max-w-6xl space-y-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Link href="/financeiro" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Financeiro
            </Link>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cartões de crédito</h1>
            <p className="text-sm text-muted-foreground">Controle dos cartões PF e PJ, limites, datas e avisos importantes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void carregar()} disabled={carregando}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Atualizar
            </Button>
            <Button size="sm" onClick={() => { setMostrarFormulario(v => !v); setErro(""); setSucesso("") }}>
              {mostrarFormulario ? <ChevronUp className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
              {mostrarFormulario ? "Recolher cadastro" : "Novo cartão"}
            </Button>
          </div>
        </div>

        {erro && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-300/50 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{erro}</div>}
        {sucesso && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-300/50 bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" />{sucesso}</div>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CreditCard className="h-4 w-4" /> Cartões cadastrados</div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{cartoes.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-4 w-4" /> Limite total informado</div>
            <p className="mt-2 text-lg font-bold tabular-nums">{moeda(limitesInformados ? totalLimites.toFixed(2) : null)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{limitesInformados} de {cartoes.length} cartões informados</p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-4 w-4" /> Disponível informado</div>
            <p className="mt-2 text-lg font-bold tabular-nums">{moeda(disponiveisInformados ? limitesDisponiveis.toFixed(2) : null)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Últimos valores cadastrados, não bancários em tempo real</p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><CreditCard className="h-4 w-4" /> Limite utilizado</div>
            <p className="mt-2 text-lg font-bold tabular-nums">{moedaCentavos(cartoesComUtilizacao.length ? totalUtilizadoCentavos : null)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{cartoesComUtilizacao.length} de {cartoes.length} cartões com ambos os limites</p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldAlert className="h-4 w-4" /> Com observações</div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{cartoesComObservacao}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Consulte avisos nos cartões abaixo</p>
          </div>
        </div>

        {mostrarFormulario && (
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="text-base">Cadastrar novo cartão</CardTitle>
              <CardDescription className="text-xs">Somente dados confirmados. Nunca informe número completo, senha ou CVV.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={salvar} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1"><Label htmlFor="nome">Identificação *</Label><Input id="nome" required maxLength={120} placeholder="Nubank PJ" value={form.nome} onChange={e => alterar("nome", e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="emissor">Banco emissor *</Label><Input id="emissor" required maxLength={120} placeholder="Nubank" value={form.emissor} onChange={e => alterar("emissor", e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="titularidade">Titularidade *</Label><select id="titularidade" value={form.titularidade} onChange={e => alterar("titularidade", e.target.value as "PF" | "PJ")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="PF">Pessoa física (PF)</option><option value="PJ">Pessoa jurídica (PJ)</option></select></div>
                  <div className="space-y-1"><Label htmlFor="finalCartao">Final (opcional)</Label><Input id="finalCartao" maxLength={4} inputMode="numeric" placeholder="4 dígitos" value={form.finalCartao} onChange={e => alterar("finalCartao", e.target.value.replace(/\D/g, "").slice(0, 4))} /></div>
                  {campoDia("Fechamento", "diaFechamento")}
                  {campoDia("Vencimento habitual", "diaVencimento")}
                  {campoDia("Melhor dia informado", "melhorDiaInformado")}
                  <div className="space-y-1"><Label htmlFor="limiteTotal">Limite total (R$)</Label><Input id="limiteTotal" inputMode="decimal" placeholder="5000,00" value={form.limiteTotal} onChange={e => alterar("limiteTotal", e.target.value)} /></div>
                  <div className="space-y-1"><Label htmlFor="limiteDisponivelInformado">Disponível informado (R$)</Label><Input id="limiteDisponivelInformado" inputMode="decimal" placeholder="2500,00" value={form.limiteDisponivelInformado} onChange={e => alterar("limiteDisponivelInformado", e.target.value)} /></div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3"><Label htmlFor="observacoes">Observações e alertas</Label><textarea id="observacoes" rows={2} maxLength={2000} value={form.observacoes} onChange={e => alterar("observacoes", e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ex.: cartão bloqueado por suspeita de fraude" /></div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" type="button" disabled={salvando} onClick={() => setMostrarFormulario(false)}>Cancelar</Button>
                  <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar cartão"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section aria-label="Cartões cadastrados" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Meus cartões</h2>
            <span className="text-xs text-muted-foreground">{cartoes.length} cadastrado(s)</span>
          </div>
          {carregando ? (
            <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">Carregando cartões...</p>
          ) : cartoes.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Nenhum cartão cadastrado. Utilize “Novo cartão” para começar.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cartoes.map(cartao => {
                const observacao = cartao.observacoes?.trim() || ""
                const aberta = observacoesAbertas.includes(cartao.id)
                const alertaBloqueio = /bloquead|fraude|suspeit|clonad|cancelad/i.test(observacao)
                return (
                  <article key={cartao.id} className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">{cartao.nome}</h3>
                        <p className="truncate text-xs text-muted-foreground">{cartao.emissor}{cartao.finalCartao ? ` · final ${cartao.finalCartao}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold">{cartao.titularidade}</span>
                        {!cartao.ativo && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">Inativo</span>}
                      </div>
                    </div>
                    <div className="space-y-3 px-4 py-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0"><p className="text-[11px] text-muted-foreground">Limite total</p><p className="truncate text-base font-semibold tabular-nums">{moeda(cartao.limiteTotal)}</p></div>
                        <div className="min-w-0"><p className="text-[11px] text-muted-foreground">Disponível informado</p><p className="truncate text-base font-semibold tabular-nums">{moeda(cartao.limiteDisponivelInformado)}</p></div>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">Limite utilizado</span>
                        <span className="text-sm font-bold tabular-nums">{moedaCentavos(utilizadoInformado(cartao))}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Fecha {cartao.diaFechamento ?? "—"}</span>
                        <span>Vence {cartao.diaVencimento ?? "—"}</span>
                        <span>Melhor dia {cartao.melhorDiaInformado ?? "—"}</span>
                      </div>
                      {observacao && (
                        <div className={`rounded-lg border px-3 py-2 ${alertaBloqueio ? "border-amber-300/70 bg-amber-50/70 dark:bg-amber-950/20" : "bg-muted/30"}`}>
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {alertaBloqueio ? <ShieldAlert className="h-3.5 w-3.5 text-amber-700" /> : <AlertCircle className="h-3.5 w-3.5" />}
                            {alertaBloqueio ? "Atenção: verificar observação" : "Observação"}
                          </div>
                          <p className={`mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground ${aberta ? "" : "line-clamp-2"}`}>{observacao}</p>
                          {observacao.length > 110 && (
                            <button type="button" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => alternarObservacoes(cartao.id)} aria-expanded={aberta}>
                              {aberta ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              {aberta ? "Ver menos" : "Ver observações"}
                            </button>
                          )}
                        </div>
                      )}
                      <Link
                        href={`/financeiro/cartoes/${encodeURIComponent(cartao.id)}`}
                        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Consultar compras e parcelas do cartão ${cartao.nome}`}
                      >
                        <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                        Ver compras e parcelas
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
        <p className="text-xs text-muted-foreground">O utilizado corresponde ao limite total menos o disponível informado, e não representa necessariamente a soma das faturas. São valores manuais, não sincronizados em tempo real com os bancos. Compras, faturas e pagamentos serão integrados em uma próxima etapa. Observações não alteram automaticamente o status do cartão.</p>
      </div>
    </PageLayout>
  )
}