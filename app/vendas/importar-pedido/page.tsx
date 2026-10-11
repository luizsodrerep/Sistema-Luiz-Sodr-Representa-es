"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowLeft, FileText, Loader2, UploadCloud, AlertTriangle, CheckCircle2 } from "lucide-react";

type Resultado = {
  nome: string;
  paginas: number;
  representada: string | null;
  numeroPedido: string | null;
  cliente: string | null;
  cnpj: string | null;
  data: string | null;
  entrega: string | null;
  condicao: string | null;
  valor: number | null;
  subtotal: number | null;
  itensDetectados: number;
  linhasItens: string[];
  alertas: string[];
  texto: string;
};

function primeiro(texto: string, regex: RegExp): string | null {
  const match = texto.match(regex);
  return match?.[1]?.replace(/\s+/g, " ").trim() || null;
}
function moeda(texto: string | null): number | null {
  if (!texto) return null;
  const limpo = texto.replace(/[^\d,.-]/g, "");
  const posVirgula = limpo.lastIndexOf(",");
  const posPonto = limpo.lastIndexOf(".");
  let numero = limpo;
  if (posVirgula > posPonto) numero = limpo.replace(/\./g, "").replace(",", ".");
  else if (posPonto > posVirgula && posVirgula >= 0) numero = limpo.replace(/,/g, "");
  else if (posVirgula >= 0) numero = limpo.replace(",", ".");
  const n = Number(numero);
  return Number.isFinite(n) ? n : null;
}
function formatoMoeda(valor: number | null) {
  return valor === null ? "Não identificado" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}
function analisar(texto: string, nome: string, paginas: number): Resultado {
  const limpo = texto.replace(/\u00a0/g, " ");
  const plano = limpo.replace(/[ \t]+/g, " ");
  const strawplast = /STRAWPLAST|PEDIDO DE VENDA:\s*002\d{3}/i.test(plano);
  const gate = /GATE 72 COMERCIAL|Processado por ION/i.test(plano);
  const lamina = /LAMINA INDUSTRIA PLASTICA|PEDWEB\s*-?\s*\d+/i.test(plano);
  const metasa = /METAL[ÚU]RGICA SANTA AD[ÉE]LIA|METASA/i.test(plano);
  const pen = /P E N IMPORTADOS|Espelho de Pedido Mobile/i.test(plano);
  const fasc = /Fascina[çc][ãa]o/i.test(plano);
  const numeroPedido = primeiro(plano, /PEDIDO DE VENDA\s*:\s*(\d+)/i)
    || primeiro(plano, /N[úu]mero do Pedido\s*:\s*(\d+)/i)
    || primeiro(plano, /Pedido FV\.?\s*:\s*(\d+)/i)
    || primeiro(plano, /PEDWEB\s*[-:]\s*(\d+)/i);
  const representada = strawplast ? "Strawplast" : gate ? "Gate 72" : lamina ? "Lâmina" : metasa ? "Metasa" : pen ? "P E N Importados" : fasc ? "Fascinação" : null;
  let cliente = strawplast ? primeiro(plano, /Raz[ãa]o Social\s*:\s*(.+?)(?:\s{2,}|Endere[çc]o|Nome Fantasia|$)/im) : null;
  if (!cliente && gate) cliente = primeiro(plano, /^\s*\d+\s*-\s*([^\n]+(?:LTDA\.?|EIRELI))\s*$/im);
  if (!cliente && pen) cliente = primeiro(plano, /Cliente\.?\s*:\s*(?:\d+\s*-\s*)?([^\n]+?)(?:\s+-\s+\d+|$)/im);
  if (!cliente && lamina) cliente = primeiro(plano, /Raz[ãa]o Social\s*:\s*(?:\d+\s*-\s*)?([^\n]+?)(?:\s+CNPJ|$)/im);
  if (!cliente && metasa) cliente = primeiro(plano, /Cliente\s*:\s*([^\n]+?)(?:\s+Fantasia|$)/im);
  const cnpj = primeiro(plano, /(?:CNPJ\/CPF|CNPJ)\s*:?\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);
  const condicao = primeiro(plano, /(?:Condi[çc][ãa]o de Pagamento|Plano de pagamento|Cond\.Pgto\.?|Condi[çc][ãa]o Comercial)\s*:\s*([^\n]+)/i);
  const data = primeiro(plano, /(?:PEDIDO DE VENDA\s*:\s*\d+|Dt\. Emiss[ãa]o|DATA DO PEDIDO)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i)
    || primeiro(plano, /\b(\d{2}\/\d{2}\/2026)\b/);
  const entrega = primeiro(plano, /(?:Dt\. Entrega|Data de Entrega)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i);
  const totalStraw = strawplast ? primeiro(plano, /(?:^|\n)\s*Total\s*:\s*(?:R\$|\$)?\s*([\d.,]+)/im) : null;
  const totalGate = gate ? primeiro(plano, /Total\s+\d+\s+\$\s*([\d.,]+)/i) : null;
  const totalLamina = lamina ? primeiro(plano, /Total Pedido\s*:\s*([\d.,]+)/i) : null;
  const totalPen = pen ? primeiro(plano, /Total\.?\s*:\s*R\$\s*([\d.,]+)/i) : null;
  const totalFasc = fasc ? primeiro(plano, /VALOR TOTAL DO PEDIDO\s*R\$?\s*([\d.,]+)/i) : null;
  const totalMeta = metasa ? primeiro(plano, /Valor\s+R\$\s*([\d.,]+)/i) : null;
  const valor = moeda(totalStraw || totalGate || totalLamina || totalPen || totalFasc || totalMeta);
  const subtotal = moeda(primeiro(plano, /Subtotal\s*:\s*(?:R\$)?\s*([\d.,]+)/i));
  const linhasItens = plano.split("\n").map((x) => x.trim()).filter((x) =>
    /(?:\d+[.,]\d{2,4})/.test(x) && /(?:CANUDO|VELA|BALAO|SACHE|EMBALAGEM|FORMA|CORTADOR|BONECA|TOALHA|AP\.DOR)/i.test(x)
  ).slice(0, 80);
  const alertas: string[] = [];
  if (!representada) alertas.push("Representada não identificada. É necessário selecionar e conferir manualmente.");
  if (!numeroPedido) alertas.push("Número oficial não identificado. Não é seguro vincular uma venda automaticamente.");
  if (valor === null || valor <= 0) alertas.push("Valor total não identificado. Verifique o documento antes de qualquer cadastro.");
  if (metasa && /Total\s+R\$\s*0,00/i.test(plano)) alertas.push("Documento Metasa: campo final apresenta R$ 0,00. O valor localizado antes do desconto exige conferência.");
  if (pen && /31\/12\/1969/.test(plano)) alertas.push("Documento P E N: data de pedido 1969 inconsistente. Não utilizá-la automaticamente.");
  alertas.push("Prévia apenas: nenhum pedido ou documento foi gravado no CRM.");
  return { nome, paginas, representada, numeroPedido, cliente, cnpj, data, entrega, condicao, valor, subtotal, itensDetectados: linhasItens.length, linhasItens, alertas, texto: plano };
}

export default function ImportarPedidoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaRepresentada, setBuscaRepresentada] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [representadaId, setRepresentadaId] = useState("");
  const [clientes, setClientes] = useState<Array<{id:string; razaoSocial:string; nomeFantasia:string|null; cnpj:string|null}>>([]);
  const [representadas, setRepresentadas] = useState<Array<{id:string; nome:string; cnpj:string|null}>>([]);
  const [consultando, setConsultando] = useState(false);
  const [erroConsulta, setErroConsulta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState<{ id: string; status: string; vendaId?: string | null } | null>(null);
  async function receberArquivo(arquivo?: File) {
    if (!arquivo) return;
    setResultado(null); setErro(""); setMostrarTexto(false); setArquivoSelecionado(null); setSalvo(null);
    setClienteId(""); setRepresentadaId(""); setClientes([]); setRepresentadas([]);
    setBuscaCliente(""); setBuscaRepresentada(""); setErroConsulta("");
    if (!/\.pdf$/i.test(arquivo.name) && arquivo.type !== "application/pdf") {
      setErro("Selecione um pedido oficial em PDF. Imagens e outros formatos serão adicionados posteriormente."); return;
    }
    if (arquivo.size > 12 * 1024 * 1024) { setErro("O PDF deve ter no máximo 12 MB neste primeiro teste."); return; }
    setCarregando(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = new Uint8Array(await arquivo.arrayBuffer());
      const documento = await pdfjs.getDocument({ data: bytes }).promise;
      const linhas: string[] = [];
      for (let p = 1; p <= documento.numPages; p++) {
        const pagina = await documento.getPage(p);
        const conteudo = await pagina.getTextContent();
        const porLinha = new Map<number, Array<{ x: number; texto: string }>>();
        for (const item of conteudo.items) {
          if (!("str" in item) || !("transform" in item)) continue;
          const y = Math.round(item.transform[5] / 3) * 3;
          const linha = porLinha.get(y) || [];
          linha.push({ x: item.transform[4], texto: item.str });
          porLinha.set(y, linha);
        }
        for (const y of [...porLinha.keys()].sort((a,b) => b-a)) {
          linhas.push((porLinha.get(y) || []).sort((a,b) => a.x-b.x).map((x) => x.texto).join(" "));
        }
        linhas.push("");
      }
      const texto = linhas.join("\n");
      if (texto.trim().length < 40) {
        throw new Error("O PDF não contém texto digital suficiente. Documentos digitalizados como imagem exigirão leitura OCR, ainda não disponível nesta etapa.");
      }
      const identificado = analisar(texto, arquivo.name, documento.numPages);
      setResultado(identificado);
      setBuscaCliente(identificado.cliente || "");
      setBuscaRepresentada(identificado.representada || "");
      setArquivoSelecionado(arquivo);
      await documento.destroy();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível ler o PDF.";
      setErro(/PasswordException|password/i.test(msg) ? "PDF protegido por senha. A leitura de PDFs protegidos será tratada em uma etapa específica; não envie a senha bancária." : msg);
    } finally { setCarregando(false); if(inputRef.current) inputRef.current.value = ""; }
  }
  async function consultarCadastros() {
    setConsultando(true); setErroConsulta("");
    setClienteId(""); setRepresentadaId("");
    setClientes([]); setRepresentadas([]);
    try {
      const parametros = new URLSearchParams({ cliente: buscaCliente.trim(), representada: buscaRepresentada.trim() });
      const resposta = await fetch(`/api/vendas/importar-pedido?${parametros.toString()}`, { cache: "no-store" });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(corpo.message || "Não foi possível consultar os cadastros.");
      setClientes(Array.isArray(corpo.clientes) ? corpo.clientes : []);
      setRepresentadas(Array.isArray(corpo.representadas) ? corpo.representadas : []);
    } catch (e) {
      setErroConsulta(e instanceof Error ? e.message : "Falha ao consultar os cadastros.");
    } finally { setConsultando(false); }
  }
  async function salvarPedido() {
    if (!resultado || !arquivoSelecionado || salvando) return;
    if (!clienteId || !representadaId) { setErro("Selecione o cliente e a representada cadastrados antes de salvar."); return; }
    if (!resultado.numeroPedido || !resultado.representada || !resultado.cliente || !resultado.valor || resultado.valor <= 0) {
      setErro("Não foi possível salvar: confira o número, a representada, o cliente e o valor do pedido.");
      return;
    }
    setSalvando(true); setErro("");
    try {
      const dados = new FormData();
      dados.append("arquivo", arquivoSelecionado);
      dados.append("clienteId", clienteId);
      dados.append("representadaId", representadaId);
      for (const [chave, valor] of Object.entries({
        numeroPedido: resultado.numeroPedido, representada: resultado.representada,
        cliente: resultado.cliente, cnpj: resultado.cnpj, valor: String(resultado.valor),
        data: resultado.data, entrega: resultado.entrega, condicao: resultado.condicao,
        texto: resultado.texto,
      })) if (valor) dados.append(chave, valor);
      const resposta = await fetch("/api/vendas/importar-pedido", { method: "POST", body: dados });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(corpo.message || "Falha ao salvar pedido.");
      setSalvo(corpo.documento);
      if (corpo.jaExistia) setErro("Este PDF já estava cadastrado. Nenhum registro duplicado foi criado.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o pedido.");
    } finally { setSalvando(false); }
  }
  function soltar(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setArrastando(false); void receberArquivo(e.dataTransfer.files?.[0]); }
  function escolher(e: ChangeEvent<HTMLInputElement>) { void receberArquivo(e.target.files?.[0]); }
  const campo = (rotulo: string, valor: string | null | undefined) => <div className="rounded-lg border p-3"><div className="text-xs text-slate-500">{rotulo}</div><div className="mt-1 break-words font-semibold">{valor || "Não identificado"}</div></div>;
  return (
    <div className="space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-medium text-blue-700">COMERCIAL · PEDIDOS OFICIAIS</p><h1 className="mt-1 text-2xl font-bold md:text-3xl">Importar Pedido Oficial</h1><p className="mt-2 text-sm text-slate-600">Leia e confira pedidos recebidos pelo WhatsApp, sem alterar as Vendas existentes.</p></div>
        <Link href="/vendas" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"><ArrowLeft className="h-4 w-4"/>Voltar para Vendas</Link>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Modo de teste:</strong> a leitura acontece no navegador. Ao confirmar, o PDF e os dados são salvos no histórico de documentos comerciais como pendentes de revisão; nenhuma Venda é criada ou atualizada.</div>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={escolher} className="hidden" aria-label="Selecionar PDF do pedido" />
      <div role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();inputRef.current?.click();}}} onDragOver={(e)=>{e.preventDefault();setArrastando(true);}} onDragLeave={()=>setArrastando(false)} onDrop={soltar} onClick={()=>inputRef.current?.click()} className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${arrastando ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"}`}>
        {carregando ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-700"/> : <UploadCloud className="mx-auto h-10 w-10 text-blue-700"/>}
        <p className="mt-3 font-semibold">{carregando ? "Lendo o PDF..." : "Arraste um pedido oficial em PDF ou toque para escolher"}</p>
        <p className="mt-2 text-sm text-slate-500">No celular, selecione o PDF salvo a partir do WhatsApp. Máximo de 12 MB.</p>
        <span className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Escolher arquivo</span>
      </div>
      {erro && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mr-2 inline h-5 w-5"/>{erro}</div>}
      {resultado && <section className="space-y-4 rounded-xl border bg-white p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5"/>Resultado da leitura</h2><p className="mt-1 break-all text-sm text-slate-500">{resultado.nome} · {resultado.paginas} página(s)</p></div><span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"><CheckCircle2 className="h-4 w-4"/>PDF lido</span></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{campo("Representada sugerida",resultado.representada)}{campo("Número do pedido",resultado.numeroPedido)}{campo("Cliente (extração preliminar)",resultado.cliente)}{campo("CNPJ identificado",resultado.cnpj)}{campo("Data do documento",resultado.data)}{campo("Data de entrega",resultado.entrega)}{campo("Condição de pagamento",resultado.condicao)}{campo("Subtotal",resultado.subtotal === null ? null : formatoMoeda(resultado.subtotal))}<div className="rounded-lg border border-blue-200 bg-blue-50 p-3"><div className="text-xs text-blue-700">Valor total sugerido</div><div className="mt-1 text-xl font-bold text-blue-900">{formatoMoeda(resultado.valor)}</div></div></div>
        <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
          <h3 className="font-bold">Confirmar os cadastros do CRM antes de salvar</h3>
          <p className="text-sm text-slate-600">Os nomes encontrados no PDF são sugestões. Procure e selecione os cadastros reais. Nenhum cliente ou representada será criado automaticamente.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium">Buscar cliente cadastrado
              <input className="mt-1 w-full rounded-md border bg-white p-2" value={buscaCliente} onChange={e=>{setBuscaCliente(e.target.value);setClienteId("");setClientes([]);}} placeholder="Ex.: Kalupel ou CNPJ" />
            </label>
            <label className="block text-sm font-medium">Buscar representada cadastrada
              <input className="mt-1 w-full rounded-md border bg-white p-2" value={buscaRepresentada} onChange={e=>{setBuscaRepresentada(e.target.value);setRepresentadaId("");setRepresentadas([]);}} placeholder="Ex.: Gate 72" />
            </label>
          </div>
          <button type="button" onClick={()=>void consultarCadastros()} disabled={consultando || buscaCliente.trim().length<2 || buscaRepresentada.trim().length<2} className="rounded-lg border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 disabled:opacity-50">{consultando ? "Consultando cadastros..." : "Buscar cadastros no CRM"}</button>
          {erroConsulta && <p role="alert" className="text-sm text-red-700">{erroConsulta}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium">Cliente confirmado
              <select value={clienteId} onChange={e=>setClienteId(e.target.value)} className="mt-1 w-full rounded-md border bg-white p-2">
                <option value="">Selecione um cliente encontrado</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial} — {c.razaoSocial}{c.cnpj ? ` (${c.cnpj})` : ""}</option>)}
              </select>
              {clientes.length===0 && <span className="mt-1 block text-xs text-slate-500">Nenhum resultado ainda. Refine a busca se necessário.</span>}
            </label>
            <label className="block text-sm font-medium">Representada confirmada
              <select value={representadaId} onChange={e=>setRepresentadaId(e.target.value)} className="mt-1 w-full rounded-md border bg-white p-2">
                <option value="">Selecione uma representada encontrada</option>
                {representadas.map(r=><option key={r.id} value={r.id}>{r.nome}{r.cnpj ? ` (${r.cnpj})` : ""}</option>)}
              </select>
              {representadas.length===0 && <span className="mt-1 block text-xs text-slate-500">Nenhum resultado ainda. Refine a busca se necessário.</span>}
            </label>
          </div>
          <p className="text-sm font-medium">{clienteId && representadaId ? "Cliente e representada selecionados. Confira os dados do pedido e salve." : "Salvamento bloqueado: selecione os dois cadastros."}</p>
        </div>
        <p className="text-sm text-slate-600">Os produtos não são exibidos nesta tela. O PDF original será preservado como documento do pedido; a consulta e o compartilhamento pelos cadastros serão habilitados em uma próxima etapa.</p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><h3 className="mb-2 font-semibold text-amber-900">Conferências obrigatórias</h3><ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">{resultado.alertas.map((a,i)=><li key={i}>{a}</li>)}</ul></div>
        {salvo ? <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900"><strong>Pedido oficial salvo no CRM.</strong> Código: {salvo.id}. Status: {salvo.status}. {salvo.vendaId ? "Venda vinculada para revisão." : "Ainda é necessário conferir o vínculo com uma venda."} Nenhuma nova venda foi criada.</div> : <button type="button" onClick={()=>void salvarPedido()} disabled={salvando || !clienteId || !representadaId || !resultado.valor || !resultado.numeroPedido || !resultado.cliente || !resultado.representada} className="w-full rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{salvando ? "Salvando pedido no CRM..." : "Salvar pedido oficial no CRM (pendente de revisão)"}</button>}
        <button type="button" onClick={()=>setMostrarTexto(!mostrarTexto)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50">{mostrarTexto ? "Ocultar" : "Mostrar"} texto reconhecido</button>
        {mostrarTexto && <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-xs">{resultado.texto}</pre>}
      </section>}
    </div>
  );
}