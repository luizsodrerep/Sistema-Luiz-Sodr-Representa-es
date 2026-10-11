"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"

type Conta = {
  id: string
  nome: string
  banco: string | null
  ativa: boolean
  tipoTitular?: string | null
}

type Movimento = {
  id: string
  tipo: string
  status: string
  valor: number
  descricao: string | null
  categoria: string | null
  data: string
  contaBancariaId: string | null
  vencimento?: string | null
}

type Resposta = { contas?: Conta[]; movimentos?: Movimento[]; erro?: string }

type Tipo = "Saida" | "Entrada"

const categoriasSaida = [
  "Alimentação", "Combustível", "Mercado", "Farmácia e saúde", "Moradia",
  "Veículo e manutenção", "Impostos e taxas", "Dívidas e acordos",
  "Trabalho e viagens", "Parcelamento informal", "Educação", "Outros gastos",
]
const categoriasEntrada = [
  "Comissão de representação", "Uber", "Reembolso", "Venda de patrimônio",
  "Transferência recebida de terceiros", "Outras entradas",
]

function dataHojeLocal() {
  const agora = new Date()
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

function valorDigitado(entrada: string): number | null {
  const limpo = entrada.trim().replace(/\s/g, "").replace(/R\$/gi, "")
  if (!limpo) return null
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  const numero = Number(normalizado)
  return Number.isFinite(numero) && numero > 0 && Math.round(numero * 100) / 100 === numero
    ? numero
    : null
}

export default function RegistroFinanceiroRapido() {
  const [tipo, setTipo] = useState<Tipo>("Saida")
  const [modalidade, setModalidade] = useState<"realizado" | "informal" | "cartao">("realizado")
  const [quantidade, setQuantidade] = useState("1")
  const [primeiroVencimento, setPrimeiroVencimento] = useState("")
  const [credor, setCredor] = useState("")
  const [valor, setValor] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("Alimentação")
  const [data, setData] = useState(dataHojeLocal)
  const [contaId, setContaId] = useState("")
  const [contas, setContas] = useState<Conta[]>([])
  const [movimentos, setMovimentos] = useState<Movimento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [pendentes, setPendentes] = useState<Movimento[]>([])
  const [entradasPendentes, setEntradasPendentes] = useState<Movimento[]>([])
  const [confirmacao, setConfirmacao] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      const resposta = await fetch("/api/financeiro", { cache: "no-store", credentials: "same-origin" })
      const json = (await resposta.json()) as Resposta
      if (!resposta.ok) throw new Error(json.erro || "Falha ao carregar dados financeiros.")
      setContas((json.contas || []).filter((conta) => conta.ativa))
      setMovimentos(json.movimentos || [])
      setPendentes((json.movimentos || []).filter((item) => item.status === "Pendente" && item.tipo === "Saida"))
      setEntradasPendentes((json.movimentos || []).filter((item) => item.status === "Pendente" && item.tipo === "Entrada"))
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar o Financeiro.")
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  const hoje = dataHojeLocal()
  const realizadosDoDia = useMemo(() => {
    return movimentos.filter((item) =>
      item.status === "Realizado" && item.tipo !== "SaldoInicial" &&
      typeof item.data === "string" && item.data.slice(0, 10) === hoje
    )
  }, [movimentos, hoje])

  const entradasHoje = realizadosDoDia
    .filter((item) => item.tipo === "Entrada")
    .reduce((soma, item) => soma + item.valor, 0)
  const saidasHoje = realizadosDoDia
    .filter((item) => item.tipo === "Saida")
    .reduce((soma, item) => soma + item.valor, 0)

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro("")
    setMensagem("")
    const numero = valorDigitado(valor)
    if (numero === null) { setErro("Informe um valor positivo com até duas casas decimais."); return }
    if (!descricao.trim()) { setErro("Informe a descrição do movimento."); return }
    if (!data) { setErro("Informe a data da operação."); return }
    if (modalidade === "cartao") {
      setErro("Cartões ainda não têm controle próprio de faturas no CRM. Não grave a compra como saída bancária. Aguarde o cadastro dos cartões.")
      return
    }
    const compromisso = modalidade === "informal"
    const numeroParcelas = Number(quantidade)
    if (compromisso && (!Number.isInteger(numeroParcelas) || numeroParcelas < 1 || numeroParcelas > 120)) {
      setErro("Informe de 1 a 120 parcelas futuras.")
      return
    }
    if (compromisso && (!primeiroVencimento || primeiroVencimento < data)) {
      setErro("Informe a primeira data prevista, igual ou posterior à data de registro. Para reembolsos, confirme o acordo com o pagador.")
      return
    }
    if ((!compromisso || contaId) && (!contaId || !contas.some((conta) => conta.id === contaId))) {
      setErro("Selecione uma conta bancária válida para a movimentação.")
      return
    }
    if (!confirmacao) {
      setErro(compromisso ? "Confirme que os valores futuros ainda não foram cadastrados nem recebidos/pagos." : "Confirme que a transação aconteceu e ainda não foi registrada.")
      return
    }

    setSalvando(true)
    try {
      const resposta = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          tipo, valor: numero, descricao: descricao.trim(), categoria,
          data,
          status: compromisso ? "Pendente" : "Realizado",
          contaBancariaId: compromisso ? (contaId || null) : contaId,
          origem: compromisso ? (credor.trim() || (tipo === "Entrada" ? "Reembolso combinado" : "Parcelamento informal")) : "Registro rápido financeiro",
          origemExterna: compromisso,
          parcelas: compromisso ? numeroParcelas : 1,
          intervaloMeses: 1,
          ...(compromisso ? { vencimento: primeiroVencimento } : {}),
        }),
      })
      const json = (await resposta.json()) as { erro?: string }
      if (!resposta.ok) throw new Error(json.erro || "O lançamento não foi salvo.")
      setMensagem(compromisso
        ? `${numeroParcelas} ${tipo === "Entrada" ? "recebível(is)" : "compromisso(s)"} futuro(s) cadastrado(s), totalizando ${moeda(numero)}. Nenhum valor foi ${tipo === "Entrada" ? "creditado" : "debitado"} agora.`
        : `${tipo === "Saida" ? "Despesa" : "Entrada"} de ${moeda(numero)} registrada com sucesso.`)
      setValor("")
      setDescricao("")
      setConfirmacao(false)
      if (compromisso) setPrimeiroVencimento("")
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado ao salvar.")
    } finally {
      setSalvando(false)
    }
  }

  const opcoes = tipo === "Saida" ? categoriasSaida : categoriasEntrada

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 text-slate-800 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Financeiro · Rotina diária</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Registro rápido</h1>
          <p className="mt-1 text-sm text-slate-600">Pagamentos, recebimentos e compromissos futuros, sem duplicar saldos.</p>
        </div>
        <a href="/financeiro" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">Financeiro completo →</a>
      </div>

      <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
         <strong>Um lançamento por fato financeiro.</strong> Pagou ou recebeu: registre como realizado. Vai pagar ou receber: registre como pendente, sem alterar o saldo bancário atual. Compras no cartão ainda aguardam o cadastro específico de cartões e faturas.
       </div>
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
         <strong>Conciliação bancária pendente.</strong> Os saldos internos históricos ainda precisam ser conferidos com os extratos atuais. Não crie saldo inicial, receita ou transferência fictícia para igualar os valores.
       </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Entradas registradas hoje</div>
          <div className="mt-1 text-xl font-bold text-emerald-700">{moeda(entradasHoje)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Saídas registradas hoje</div>
          <div className="mt-1 text-xl font-bold text-rose-700">{moeda(saidasHoje)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Movimentos registrados hoje</div>
          <div className="mt-1 text-xl font-bold">{realizadosDoDia.length}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={() => { setTipo("Saida"); setModalidade("realizado"); setCategoria("Alimentação"); setConfirmacao(false); setMensagem(""); setErro("") }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${tipo === "Saida" ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-600"}`}>
              − Nova despesa
            </button>
            <button type="button" onClick={() => { setTipo("Entrada"); setModalidade("realizado"); setCategoria("Reembolso"); setConfirmacao(false); setMensagem(""); setErro("") }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${tipo === "Entrada" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`}>
              + Nova entrada
            </button>
          </div>
          <div className="mb-4 rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold">{tipo === "Saida" ? "Como foi ou será pago?" : "Recebeu ou ainda vai receber?"}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {([
                ["realizado", tipo === "Saida" ? "Pix / débito / dinheiro" : "Recebimento já ocorrido"],
                ...(tipo === "Saida" ? [["informal", "A prazo sem cartão"], ["cartao", "Cartão de crédito"]] as const : [["informal", "Reembolso futuro"]] as const),
              ] as const).map(([valorModalidade, rotulo]) => (
                <button key={valorModalidade} type="button" onClick={() => { setModalidade(valorModalidade); setConfirmacao(false); setMensagem(""); setErro("") }}
                  className={`rounded-lg border px-3 py-3 text-left text-xs font-semibold ${modalidade === valorModalidade ? "border-blue-700 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700"}`}>
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
          {modalidade === "cartao" && <div role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Registro de cartão temporariamente bloqueado.</strong> A API atual não possui um cadastro separado de cartões e faturas. Para não subtrair indevidamente o saldo bancário nem duplicar pagamentos, o cadastro automático das compras no cartão será habilitado apenas após implantação do controle de faturas. A modalidade de cartão não pode ser confundida com um pagamento realizado por conta corrente.
          </div>}
          <form onSubmit={(evento) => { void salvar(evento) }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Valor em reais
                <input value={valor} onChange={(evento) => setValor(evento.target.value)} placeholder="Ex.: 48,90" inputMode="decimal"
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3 text-lg outline-none focus:border-blue-600" required />
              </label>
              <label className="block text-sm font-medium">Data do movimento
                <input type="date" value={data} onChange={(evento) => setData(evento.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600" required />
              </label>
            </div>
            <label className="block text-sm font-medium">Descrição
              <input value={descricao} onChange={(evento) => setDescricao(evento.target.value)} placeholder="Ex.: Almoço família"
                maxLength={180} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Categoria
                <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3" required>
                  {opcoes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">{modalidade === "informal" ? tipo === "Entrada" ? "Conta prevista para receber (opcional)" : "Conta prevista para pagar (opcional)" : "Conta usada"}
                <select value={contaId} onChange={(evento) => setContaId(evento.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3" required={modalidade !== "informal"}>
                  <option value="">{modalidade === "informal" ? "A definir" : "Selecione a conta"}</option>
                  {contas.map((conta) => <option key={conta.id} value={conta.id}>
                    {conta.nome}{conta.banco ? ` · ${conta.banco}` : ""}{conta.tipoTitular ? ` · ${conta.tipoTitular}` : ""}
                  </option>)}
                </select>
              </label>
            </div>
            {modalidade === "informal" && (
              <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-950">{tipo === "Entrada" ? "Reembolsos futuros a receber" : "Compromissos futuros sem cartão"}</p>
                <p className="text-xs text-blue-900">{tipo === "Entrada" ? "Informe somente o total que ainda falta receber, e NÃO inclua quantias que já recebeu. O sistema cria entradas pendentes, sem aumentar o saldo bancário agora. Não conte esse valor como disponível até recebê-lo." : "Informe o total que ainda falta pagar, e NÃO o valor total do acordo se já pagou uma prestação. O sistema cria uma saída pendente para cada parcela, sem reduzir o saldo bancário agora."}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">{tipo === "Entrada" ? "Reembolsos ainda não recebidos" : "Parcelas ainda não pagas"}
                    <input type="number" min="1" max="120" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3" required />
                  </label>
                  <label className="block text-sm font-medium">{tipo === "Entrada" ? "Data prevista do primeiro reembolso" : "Primeiro vencimento confirmado"}
                    <input type="date" value={primeiroVencimento} onChange={(e) => setPrimeiroVencimento(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3" required />
                  </label>
                </div>
                <label className="block text-sm font-medium">{tipo === "Entrada" ? "Pessoa que vai reembolsar" : "Pessoa / credor"}
                  <input value={credor} onChange={(e) => setCredor(e.target.value)} placeholder={tipo === "Entrada" ? "Nome do pagador" : "Nome do credor"}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-3" />
                </label>
                {valorDigitado(valor) !== null && Number.isInteger(Number(quantidade)) && Number(quantidade) > 0 && (
                  <div className="rounded-lg bg-white p-3 text-sm text-blue-950">
                    {tipo === "Entrada" ? "Total a receber: " : "Total a pagar: "} <strong>{moeda(valorDigitado(valor)!)}</strong> · Média por parcela: <strong>{moeda(valorDigitado(valor)! / Number(quantidade))}</strong>.
                    <span className="mt-1 block text-xs">{tipo === "Entrada" ? "Recebíveis previstos mensais, sem garantia de recebimento. Confirme as datas com o pagador." : "São parcelas mensais geradas pela API, sem vinculação automática a um contrato ou cobrança de cartão."}</span>
                  </div>
                )}
              </div>
            )}
            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <input type="checkbox" checked={confirmacao} onChange={(evento) => setConfirmacao(evento.target.checked)} className="mt-1" />
              <span>{modalidade === "informal"
                ? tipo === "Entrada" ? "Confirmo que estes valores ainda não foram recebidos, são apenas previsões e não estão cadastrados no CRM." : "Confirmo que estes compromissos são reais, ainda estão pendentes e não foram cadastrados anteriormente."
                : "Confirmo que o dinheiro realmente entrou/saiu, que a conta está correta e que ainda não registrei esta operação."}</span>
            </label>
            {erro && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{erro}</div>}
            {mensagem && <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{mensagem}</div>}
            <button type="submit" disabled={salvando || carregando || !contas.length || modalidade === "cartao"}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {salvando ? "Salvando..." : carregando ? "Carregando contas..." : modalidade === "cartao" ? "Aguardando controle de faturas" : modalidade === "informal" ? tipo === "Entrada" ? "Registrar recebíveis futuros" : "Registrar parcelas futuras" : "Registrar movimento realizado"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold">Lançamentos de hoje</h2>
            <button type="button" onClick={() => { void carregar() }} disabled={carregando}
              className="text-sm font-semibold text-blue-700 disabled:opacity-50">Atualizar</button>
          </div>
          <p className="mb-4 text-xs text-slate-500">Lista lida diretamente da API do CRM, sem incluir saldos históricos como orçamento disponível.</p>
          {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : realizadosDoDia.length === 0
            ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhum movimento de hoje registrado.</p>
            : <ul className="divide-y divide-slate-100">
              {realizadosDoDia.slice(0, 20).map((item) => <li key={item.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{item.descricao || "Sem descrição"}</p>
                    <p className="text-xs text-slate-500">{item.categoria || "Sem categoria"} · {contas.find((c) => c.id === item.contaBancariaId)?.nome || "Conta não identificada"}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${item.tipo === "Entrada" ? "text-emerald-700" : "text-rose-700"}`}>
                    {item.tipo === "Entrada" ? "+" : "−"}{moeda(item.valor)}
                  </span>
                </div>
              </li>)}
            </ul>}
          <div className="mt-5 rounded-xl border border-slate-200 p-4">
             <h3 className="text-sm font-bold">Próximos compromissos e recebimentos</h3>
             <p className="mt-1 text-xs text-slate-600">Previsões cadastradas na API, não recebimentos garantidos. Uma parcela pendente precisa ser baixada quando ocorrer o pagamento ou recebimento; não cadastre uma segunda operação igual.</p>
             {(() => {
               const futuros = [...pendentes, ...entradasPendentes]
                 .filter((item) => !!item.vencimento)
                 .sort((a, b) => (a.vencimento || "").localeCompare(b.vencimento || ""))
               if (futuros.length === 0) return <p className="mt-3 text-sm text-slate-500">Nenhuma parcela futura cadastrada com vencimento.</p>
               const meses = new Map<string, { saidas: number; entradas: number; quantidade: number }>()
               for (const item of futuros) {
                 const mes = (item.vencimento || "").slice(0, 7)
                 if (!/^\d{4}-\d{2}$/.test(mes)) continue
                 const atual = meses.get(mes) || { saidas: 0, entradas: 0, quantidade: 0 }
                 if (item.tipo === "Saida") atual.saidas += item.valor
                 else atual.entradas += item.valor
                 atual.quantidade += 1
                 meses.set(mes, atual)
               }
               return <div className="mt-3 space-y-2">
                 {[...meses.entries()].slice(0, 18).map(([mes, resumo]) => <div key={mes} className="rounded-lg bg-slate-50 p-3">
                   <div className="flex justify-between gap-2 text-sm font-semibold"><span>{mes.slice(5, 7)}/{mes.slice(0, 4)}</span><span>{resumo.quantidade} compromisso(s)</span></div>
                   <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs"><span className="text-rose-700">Saídas: {moeda(resumo.saidas)}</span><span className="text-emerald-700">Entradas previstas: {moeda(resumo.entradas)}</span></div>
                   <div className="mt-1 text-xs font-semibold">Necessidade líquida projetada: {moeda(resumo.saidas - resumo.entradas)}</div>
                 </div>)}
               </div>
             })()}
             <a href="/financeiro" className="mt-3 inline-block text-sm font-semibold text-blue-700 underline">Ver e baixar pendências no Financeiro completo</a>
           </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <strong>Saídas pendentes:</strong> {pendentes.length} · <strong>Entradas pendentes:</strong> {entradasPendentes.length}. Confira o Financeiro completo antes de cadastrar novas parcelas ou reembolsos, para evitar duplicidade.
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Esta tela registra movimentos realizados, parcelamentos informais e recebíveis futuros. A agenda é uma projeção dos registros existentes, não valida disponibilidade bancária. Transferências, conciliação e gestão de cartões serão tratadas em rotinas específicas.
          </div>
        </section>
      </div>
    </main>
  )
}