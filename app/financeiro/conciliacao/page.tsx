"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

type Movimento = {
  id: string
  data: string
  tipo: "Entrada" | "Saida" | "SaldoInicial"
  categoria: string | null
  descricao: string | null
  origem: string | null
  valor: number
  status: "Realizado" | "Pendente" | "Cancelado"
  contaBancariaId: string | null
}
type Conta = {
  id: string
  nome: string
  banco: string
  tipoTitular: string
  resumo: { saldoRealizado: number }
}
type Resposta = { movimentos: Movimento[]; contas: Conta[] }

type LinhaBanco = {
  id: number
  data: string
  descricao: string
  tipo: "Entrada" | "Saida"
  centavos: number
}
type Classificacao = "Correspondência exata" | "Possível correspondência" | "Sem correspondência" | "Revisar duplicidade"
type ConferenciaLinha = { banco: LinhaBanco; situacao: Classificacao; crm: Movimento | null }
function lerCsvBancario(texto: string): LinhaBanco[] {
  const linhas = texto.replace(/^\uFEFF/, "").split(/\r?\n/).filter((x) => x.trim())
  const cab = linhas.shift()?.toLowerCase().trim()
  if (cab !== "data;descricao;tipo;valor") throw new Error("Formato incompatível. Use o CSV preparado com colunas data;descricao;tipo;valor.")
  if (linhas.length > 20000) throw new Error("Extrato com mais de 20 mil movimentos; divida em períodos.")
  return linhas.map((linha, id) => {
    // Leitura simples para os CSVs preparados: quatro campos, com aspas opcionais.
    const col: string[] = []
    let atual = ""; let aspas = false
    for (let i = 0; i < linha.length; i++) {
      const ch = linha[i]
      if (ch === '"') {
        if (aspas && linha[i + 1] === '"') { atual += '"'; i++ }
        else aspas = !aspas
      } else if (ch === ";" && !aspas) { col.push(atual); atual = "" }
      else atual += ch
    }
    col.push(atual)
    if (col.length !== 4 || !/^\d{4}-\d{2}-\d{2}$/.test(col[0]) || !["Entrada", "Saida"].includes(col[2])) throw new Error(`Movimento ${id + 1}: data, tipo ou colunas inválidos.`)
    const valor = numeroPt(col[3])
    if (valor === null || valor <= 0) throw new Error(`Movimento ${id + 1}: valor inválido.`)
    return { id, data: col[0], descricao: col[1], tipo: col[2] as LinhaBanco["tipo"], centavos: cents(valor) }
  })
}
/** OFX 1.x (SGML) e 2.x (XML), exclusivamente extratos de conta corrente. */
function lerOfxConta(texto: string): LinhaBanco[] {
  const conteudo = texto.replace(/^\uFEFF/, "")
  if (!/<OFX(?:\s|>)/i.test(conteudo)) {
    throw new Error("Este arquivo não possui uma estrutura OFX reconhecida.")
  }
  // Cartões usam outra contabilidade. Nunca registrar compras como débitos de conta corrente.
  if (/<CREDITCARDMSGSRSV1\b|<CCSTMTRS\b/i.test(conteudo)) {
    throw new Error("Este OFX é uma fatura/extrato de CARTÃO DE CRÉDITO, não da conta corrente. Não foi importado para evitar duplicar despesas. A leitura de faturas será realizada no módulo de cartões.")
  }
  if (!/<BANKMSGSRSV1\b|<STMTRS\b/i.test(conteudo)) {
    throw new Error("O OFX não contém um extrato de conta corrente reconhecido. Confira o tipo de documento no aplicativo bancário.")
  }
  const blocos = [...conteudo.matchAll(/<STMTTRN(?:\s[^>]*)?>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN(?:\s|>))|(?=<\/BANKTRANLIST>))/gi)]
  if (blocos.length === 0) throw new Error("Não foram encontradas movimentações no OFX de conta corrente.")
  if (blocos.length > 20000) throw new Error("Arquivo com mais de 20 mil movimentos. Divida o extrato em períodos menores.")
  const ids = new Set<string>()
  const campo = (bloco: string, nome: string): string => {
    const encontrado = new RegExp(`<${nome}(?:\\s[^>]*)?>([^<\\r\\n]*)`, "i").exec(bloco)
    return encontrado?.[1]?.trim() || ""
  }
  return blocos.map((match, id) => {
    const bloco = match[1]
    const dataBruta = campo(bloco, "DTPOSTED")
    const data = /^(\d{4})(\d{2})(\d{2})/.exec(dataBruta)
    if (!data) throw new Error(`Movimento OFX ${id + 1}: data inválida ou ausente.`)
    const dataISO = `${data[1]}-${data[2]}-${data[3]}`
    if (Number.isNaN(Date.parse(`${dataISO}T12:00:00Z`))) throw new Error(`Movimento OFX ${id + 1}: data inválida.`)
    const bruto = campo(bloco, "TRNAMT").replace(",", ".")
    if (!/^[+-]?\d+(?:\.\d{1,2})?$/.test(bruto)) throw new Error(`Movimento OFX ${id + 1}: valor inválido.`)
    const valor = Number(bruto)
    if (!Number.isFinite(valor) || valor === 0) throw new Error(`Movimento OFX ${id + 1}: valor inválido.`)
    const fitid = campo(bloco, "FITID")
    if (fitid) {
      if (ids.has(fitid)) throw new Error(`O OFX contém o identificador bancário repetido ${fitid}. Verifique o arquivo antes de importar.`)
      ids.add(fitid)
    }
    const descricao = campo(bloco, "MEMO") || campo(bloco, "NAME") || campo(bloco, "TRNTYPE") || "Movimento bancário"
    return {
      id,
      data: dataISO,
      descricao: fitid ? `${descricao} [ID banco: ${fitid}]` : descricao,
      tipo: valor > 0 ? "Entrada" as const : "Saida" as const,
      centavos: Math.round(Math.abs(valor) * 100),
    }
  })
}

function diferencaDias(a: string, b: string) {
  const n1 = Date.parse(`${a}T12:00:00Z`)
  const n2 = Date.parse(`${b}T12:00:00Z`)
  return Math.abs(n1 - n2) / 86400000
}
function compararLancamentos(banco: LinhaBanco[], crm: Movimento[]): ConferenciaLinha[] {
  const usados = new Set<string>()
  return banco.map((linha) => {
    const candidatas = crm.filter((m) =>
      !usados.has(m.id) && m.status === "Realizado" && m.tipo === linha.tipo &&
      cents(m.valor) === linha.centavos && diferencaDias(dia(m.data), linha.data) <= 1
    )
    const noDia = candidatas.filter((m) => dia(m.data) === linha.data)
    const candidatasFinais = noDia.length ? noDia : candidatas
    if (candidatasFinais.length === 1) {
      const movimento = candidatasFinais[0]
      if (noDia.length === 1) { usados.add(movimento.id); return { banco: linha, situacao: "Correspondência exata" as const, crm: movimento } }
      return { banco: linha, situacao: "Possível correspondência" as const, crm: movimento }
    }
    if (candidatasFinais.length > 1) return { banco: linha, situacao: "Revisar duplicidade" as const, crm: null }
    return { banco: linha, situacao: "Sem correspondência" as const, crm: null }
  })
}
const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
function dia(value: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return m?.[1] ?? ""
}
function dataPt(value: string): string {
  const d = dia(value)
  return d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : "—"
}
function numeroPt(value: string): number | null {
  const n = Number(value.trim().replace(/\./g, "").replace(",", "."))
  return value.trim() && Number.isFinite(n) && n >= 0 ? n : null
}
function cents(n: number) { return Math.round(n * 100) }
function csvCampo(v: string | number): string {
  return `"${String(v).replace(/"/g, '""')}"`
}

export default function ConciliacaoFinanceiraPage() {
  const [dados, setDados] = useState<Resposta | null>(null)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [contaId, setContaId] = useState("")
  const [inicio, setInicio] = useState("2026-09-01")
  const [fim, setFim] = useState("2026-10-09")
  const [saldoBanco, setSaldoBanco] = useState("")
  const [referencia, setReferencia] = useState("2026-10-09")
  const [arquivo, setArquivo] = useState("")
  const [importados, setImportados] = useState<LinhaBanco[]>([])
  const [erroImportacao, setErroImportacao] = useState("")
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const seletorArquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ativo = true
    fetch("/api/financeiro", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.erro || "Não foi possível consultar o Financeiro.")
        return j as Resposta
      })
      .then((j) => {
        if (!ativo) return
        setDados(j)
        setContaId((old) => old || j.contas[0]?.id || "")
      })
      .catch((e: unknown) => { if (ativo) setErro(e instanceof Error ? e.message : "Erro na consulta.") })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  const conta = dados?.contas.find((c) => c.id === contaId)
  const todosDaConta = useMemo(() => (dados?.movimentos || []).filter((m) => m.contaBancariaId === contaId && m.status === "Realizado"), [dados, contaId])
  const movimentos = useMemo(() => todosDaConta.filter((m) => dia(m.data) >= inicio && dia(m.data) <= fim).sort((a, b) => dia(a.data).localeCompare(dia(b.data)) || a.id.localeCompare(b.id)), [todosDaConta, inicio, fim])
  const saldoNaReferencia = useMemo(() => todosDaConta.filter((m) => dia(m.data) <= referencia).reduce((total, m) => total + (m.tipo === "Saida" ? -m.valor : m.valor), 0), [todosDaConta, referencia])
  const entradas = movimentos.filter((m) => m.tipo === "Entrada").reduce((s, m) => s + m.valor, 0)
  const saidas = movimentos.filter((m) => m.tipo === "Saida").reduce((s, m) => s + m.valor, 0)
  const valorBanco = numeroPt(saldoBanco)
  const diferenca = valorBanco === null ? null : (cents(valorBanco) - cents(saldoNaReferencia)) / 100
  const invalidas = !inicio || !fim || inicio > fim || !referencia
  const analise = useMemo(() => compararLancamentos(importados.filter((m) => m.data >= inicio && m.data <= fim), todosDaConta), [importados, todosDaConta, inicio, fim])
  const resumoImportado = useMemo(() => ({
    correspondencias: analise.filter((x) => x.situacao === "Correspondência exata").length,
    pendencias: analise.filter((x) => x.situacao !== "Correspondência exata").length,
    entradas: analise.filter((x) => x.banco.tipo === "Entrada").reduce((v, x) => v + x.banco.centavos, 0) / 100,
    saidas: analise.filter((x) => x.banco.tipo === "Saida").reduce((v, x) => v + x.banco.centavos, 0) / 100,
  }), [analise])
  const visiveis = mostrarTodos ? analise : analise.filter((x) => x.situacao !== "Correspondência exata")
  async function carregarArquivo(file: File | undefined) {
    if (!file) return
    setErroImportacao("")
    setImportados([])
    setArquivo("")
    const extensao = file.name.toLowerCase().split(".").pop()
    if (extensao !== "csv" && extensao !== "ofx") {
      setErroImportacao(extensao === "pdf"
        ? "Arquivo PDF recebido, mas a leitura de PDFs (inclusive os protegidos) ainda não está disponível. Não forneça senhas aqui."
        : "Formato não suportado nesta etapa. Selecione um OFX de conta corrente ou o CSV preparado.")
      return
    }
    if (file.size > 3_000_000) { setErroImportacao("Arquivo grande demais para a prévia local."); return }
    try {
      // O OFX é processado somente no navegador; nada é enviado nem gravado no servidor.
      const conteudo = await file.text()
      const linhas = extensao === "ofx" ? lerOfxConta(conteudo) : lerCsvBancario(conteudo)
      setImportados(linhas)
      setArquivo(file.name)
      setMostrarTodos(false)
    } catch (e: unknown) { setErroImportacao(e instanceof Error ? e.message : "Erro ao ler arquivo.") }
  }

  function aoSoltarArquivo(evento: React.DragEvent<HTMLDivElement>) {
    evento.preventDefault()
    evento.stopPropagation()
    setArrastando(false)
    const lista = evento.dataTransfer.files
    if (lista.length !== 1) {
      setImportados([])
      setArquivo("")
      setErroImportacao("Arraste apenas um extrato de cada vez, após selecionar a conta correspondente.")
      return
    }
    void carregarArquivo(lista[0])
  }

  function exportar() {
    if (!conta || invalidas) return
    const linhas = [
      ["Conta", "Data", "Descrição", "Categoria", "Tipo", "Débito", "Crédito", "Status", "ID CRM"],
      ...movimentos.map((m) => [conta.nome, dataPt(m.data), m.descricao || m.origem || "", m.categoria || "", m.tipo, m.tipo === "Saida" ? m.valor.toFixed(2).replace(".", ",") : "", m.tipo !== "Saida" ? m.valor.toFixed(2).replace(".", ",") : "", m.status, m.id]),
    ]
    const csv = "\uFEFF" + linhas.map((l) => l.map(csvCampo).join(";")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `crm-extrato-${conta.nome.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${inicio}-${fim}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 text-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financeiro</p><h1 className="text-2xl font-bold">Conferência bancária</h1><p className="mt-1 text-sm text-slate-600">Comparação de saldos e exportação dos lançamentos existentes, sem modificar registros.</p></div>
        <Link href="/financeiro" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Voltar ao Financeiro</Link>
      </div>
      {carregando && <p role="status" className="rounded-lg border p-4">Carregando movimentos do CRM...</p>}
      {erro && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{erro}</p>}
      {dados && <>
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm font-medium">Conta bancária<select value={contaId} onChange={(e) => { setContaId(e.target.value); setSaldoBanco(""); setImportados([]); setArquivo("") }} className="w-full rounded-lg border p-2 font-normal">{dados.contas.map((c) => <option value={c.id} key={c.id}>{c.nome} ({c.tipoTitular})</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium">Início dos movimentos<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-full rounded-lg border p-2 font-normal" /></label>
          <label className="space-y-1 text-sm font-medium">Fim dos movimentos<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="w-full rounded-lg border p-2 font-normal" /></label>
          <label className="space-y-1 text-sm font-medium">Data do saldo de referência<input type="date" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full rounded-lg border p-2 font-normal" /></label>
        </section>
        {invalidas && <p className="text-sm text-red-700">Verifique as datas informadas.</p>}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Entradas realizadas no período</p><p className="mt-1 text-xl font-semibold">{reais.format(entradas)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Saídas realizadas no período</p><p className="mt-1 text-xl font-semibold">{reais.format(saidas)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Saldo CRM na referência</p><p className="mt-1 text-xl font-semibold">{reais.format(saldoNaReferencia)}</p></article>
          <article className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Diferença: banco menos CRM</p><p className="mt-1 text-xl font-semibold">{diferenca === null ? "A informar" : reais.format(diferenca)}</p></article>
        </section>
        <section className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Comparar com o extrato oficial</h2>
          <p className="text-sm text-slate-600">Informe o saldo real do banco na data de referência. É uma conferência temporária na tela: o valor não é gravado.</p>
          <div className="flex flex-wrap items-end gap-3"><label className="space-y-1 text-sm font-medium">Saldo do banco (R$)<input inputMode="decimal" placeholder="Ex.: 3150,38" value={saldoBanco} onChange={(e) => setSaldoBanco(e.target.value)} className="block rounded-lg border p-2 font-normal" /></label><button onClick={exportar} disabled={invalidas || !conta} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Baixar extrato CSV</button></div>
          {diferenca !== null && <p role="status" className="text-sm font-medium">{cents(diferenca) === 0 ? "Saldos iguais na data informada. Isso não comprova conciliação individual dos movimentos." : `Diferença identificada: ${reais.format(diferenca)}. Confira as operações uma a uma; não faça lançamento de ajuste pelo valor da diferença.`}</p>}
        </section>
        <section className="space-y-4 rounded-xl border border-blue-200 bg-white p-4">
          <div><h2 className="text-lg font-semibold">Importar e analisar extrato — prévia automática</h2><p className="mt-1 text-sm text-slate-600">Selecione a conta correta e carregue um OFX de conta corrente ou CSV preparado do mesmo banco. O CRM compara data, valor e natureza das transações, sem gravar ou alterar nada. A descrição continua disponível para revisão.</p></div>
          <div
            onDragEnter={(evento) => { evento.preventDefault(); evento.stopPropagation(); setArrastando(true) }}
            onDragOver={(evento) => { evento.preventDefault(); evento.stopPropagation(); evento.dataTransfer.dropEffect = "copy"; setArrastando(true) }}
            onDragLeave={(evento) => { evento.preventDefault(); evento.stopPropagation(); if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setArrastando(false) }}
            onDrop={aoSoltarArquivo}
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${arrastando ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl" aria-hidden="true">↑</div>
            <p className="font-semibold">Arraste o extrato da pasta Downloads e solte aqui</p>
            <p className="mt-1 text-sm text-slate-600">Conta selecionada: <strong>{conta?.nome || "Nenhuma"}</strong></p>
            <p className="mt-2 text-xs text-slate-500">Leitura disponível: OFX de conta corrente e CSV preparado. PDFs, inclusive protegidos, ainda não são interpretados. OFX de cartão de crédito é identificado e bloqueado nesta tela.</p>
            <input
              ref={seletorArquivo}
              type="file"
              accept=".csv,text/csv,.ofx,.pdf,application/pdf"
              aria-label="Selecionar extrato bancário"
              className="sr-only"
              onChange={(evento) => { void carregarArquivo(evento.target.files?.[0]); evento.target.value = "" }}
            />
            <button type="button" onClick={() => seletorArquivo.current?.click()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Escolher arquivo</button>
          </div>
          {erroImportacao && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{erroImportacao}</p>}
          {arquivo && <>
            <p className="text-sm text-slate-600">Arquivo analisado: <strong>{arquivo}</strong>. Confira o banco selecionado antes de interpretar os resultados. Os resultados são temporários e desaparecerão ao recarregar a página.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Movimentos importados no período</p><p className="text-xl font-bold">{analise.length}</p></div>
              <div className="rounded-lg bg-green-50 p-3"><p className="text-xs text-green-800">Candidatos exatos (data, valor, tipo)</p><p className="text-xl font-bold">{resumoImportado.correspondencias}</p></div>
              <div className="rounded-lg bg-amber-50 p-3"><p className="text-xs text-amber-800">Pendências para revisar</p><p className="text-xl font-bold">{resumoImportado.pendencias}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Saldo líquido dos movimentos</p><p className="text-xl font-bold">{reais.format(resumoImportado.entradas - resumoImportado.saidas)}</p></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mostrarTodos} onChange={(e) => setMostrarTodos(e.target.checked)} /> Mostrar também candidatos exatos</label>
            <div className="max-h-[450px] overflow-auto rounded-lg border"><table className="w-full min-w-[750px] text-left text-xs"><thead className="sticky top-0 bg-slate-100"><tr><th className="p-2">Data banco</th><th className="p-2">Descrição banco</th><th className="p-2">Tipo</th><th className="p-2 text-right">Valor</th><th className="p-2">Análise</th><th className="p-2">Registro CRM sugerido</th></tr></thead><tbody>{visiveis.map((x) => <tr key={x.banco.id} className="border-t"><td className="whitespace-nowrap p-2">{dataPt(x.banco.data)}</td><td className="p-2">{x.banco.descricao}</td><td className="p-2">{x.banco.tipo === "Saida" ? "Saída" : "Entrada"}</td><td className="whitespace-nowrap p-2 text-right">{reais.format(x.banco.centavos / 100)}</td><td className="p-2 font-medium">{x.situacao}</td><td className="p-2">{x.crm?.descricao || x.crm?.origem || "—"}</td></tr>)}{visiveis.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">Nenhuma pendência neste filtro; habilite a exibição de correspondências para inspecionar.</td></tr>}</tbody></table></div>
            <p className="text-xs text-slate-600">A correspondência exata aqui é apenas um candidato baseado em data, tipo e valor; ainda não constitui conciliação bancária validada. Em especial, valores iguais no mesmo dia podem representar operações distintas. Transferências próprias, recebimentos comerciais e pagamentos de fatura exigem vínculo com sua origem.</p>
          </>}
        </section>
        <section className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b p-4"><h2 className="font-semibold">Movimentos realizados no CRM</h2><span className="text-sm text-slate-500">{movimentos.length} registro(s) no período</span></div><div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Data</th><th className="p-3">Descrição</th><th className="p-3">Categoria</th><th className="p-3 text-right">Débito</th><th className="p-3 text-right">Crédito</th></tr></thead><tbody>{movimentos.map((m) => <tr key={m.id} className="border-t"><td className="whitespace-nowrap p-3">{dataPt(m.data)}</td><td className="p-3">{m.descricao || m.origem || "—"}</td><td className="p-3">{m.categoria || "—"}</td><td className="p-3 text-right">{m.tipo === "Saida" ? reais.format(m.valor) : "—"}</td><td className="p-3 text-right">{m.tipo !== "Saida" ? reais.format(m.valor) : "—"}</td></tr>)}{movimentos.length === 0 && <tr><td colSpan={5} className="p-5 text-center text-slate-500">Não há movimentos realizados neste período.</td></tr>}</tbody></table></div></section>
        <p className="text-xs leading-relaxed text-slate-500">A importação OFX/CSV faz prévia e comparação de candidatos em memória, sem registrar documentos ou alterar saldos e lançamentos. Antes de considerar uma conta 100% conciliada, é necessário confrontar cada operação com o documento bancário. O saldo CRM é calculado até a data de referência a partir dos lançamentos realizados disponíveis.</p>
      </>}
    </main>
  )
}