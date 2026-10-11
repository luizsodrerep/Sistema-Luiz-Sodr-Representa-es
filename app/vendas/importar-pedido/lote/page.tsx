"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertTriangle, ArrowLeft, Files, Loader2, UploadCloud, X } from "lucide-react";

type Linha = {
  chave: string;
  arquivo: File;
  pedido: string;
  cliente: string;
  representada: string;
  valor: string;
  data: string;
  entrega: string;
  condicao: string;
  cnpj: string;
  texto: string;
  avisos: string[];
  situacao: "pendente" | "salvando" | "salvo" | "repetido" | "erro";
  mensagem: string;
  documentoId?: string;
};

const MAX_ARQUIVOS = 20;
const MAX_BYTES = 12 * 1024 * 1024;

function capturar(texto: string, expressao: RegExp): string {
  return texto.match(expressao)?.[1]?.trim() || "";
}

function extrairValor(texto: string): string {
  const numero = texto.replace(/[^0-9.,-]/g, "");
  if (!numero) return "";
  const ultimaVirgula = numero.lastIndexOf(",");
  const ultimoPonto = numero.lastIndexOf(".");
  const normalizado = ultimaVirgula > ultimoPonto
    ? numero.replace(/\./g, "").replace(",", ".")
    : ultimoPonto > ultimaVirgula && ultimaVirgula >= 0
      ? numero.replace(/,/g, "")
      : numero.replace(",", ".");
  const valor = Number(normalizado);
  return Number.isFinite(valor) && valor > 0 ? valor.toFixed(2) : "";
}

async function textoDoPdf(arquivo: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise;
  try {
    const linhas: string[] = [];
    if (pdf.numPages > 60) throw new Error("PDF com mais de 60 páginas: revise o arquivo antes de importar.");
    for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
      const conteudo = await (await pdf.getPage(pagina)).getTextContent();
      const mapa = new Map<number, Array<{ x: number; texto: string }>>();
      for (const item of conteudo.items) {
        if (!("str" in item) || !("transform" in item)) continue;
        const y = Math.round(item.transform[5] / 3) * 3;
        const itens = mapa.get(y) || [];
        itens.push({ x: item.transform[4], texto: item.str });
        mapa.set(y, itens);
      }
      for (const y of [...mapa.keys()].sort((a, b) => b - a)) {
        linhas.push((mapa.get(y) || []).sort((a, b) => a.x - b.x).map((x) => x.texto).join(" "));
      }
      linhas.push("");
    }
    return linhas.join("\n");
  } finally {
    await pdf.destroy();
  }
}

function interpretar(arquivo: File, texto: string): Linha {
  const straw = /STRAWPLAST|PEDIDO DE VENDA:\s*002\d{3}/i.test(texto);
  const gate = /GATE 72 COMERCIAL|Processado por ION/i.test(texto);
  const lamina = /LAMINA INDUSTRIA PLASTICA|PEDWEB\s*-?\s*\d+/i.test(texto);
  const metasa = /METAL[ÚU]RGICA SANTA AD[ÉE]LIA|METASA/i.test(texto);
  const pen = /P E N IMPORTADOS|Espelho de Pedido Mobile/i.test(texto);
  const fasc = /Fascina[çc][ãa]o/i.test(texto);
  const representada = straw ? "Strawplast" : gate ? "Gate 72" : lamina ? "Lâmina" : metasa ? "Metasa" : pen ? "P E N Importados" : fasc ? "Fascinação" : "";
  const pedido = capturar(texto, /PEDIDO DE VENDA\s*:\s*(\d+)/i)
    || capturar(texto, /N[úu]mero do Pedido\s*:\s*(\d+)/i)
    || capturar(texto, /Pedido FV\.?\s*:\s*(\d+)/i)
    || capturar(texto, /PEDWEB\s*[-:]\s*(\d+)/i);
  const cliente = (straw ? capturar(texto, /Raz[ãa]o Social\s*:\s*([^\n]+)/i) : "")
    || (gate ? capturar(texto, /^\s*\d+\s*-\s*([^\n]+(?:LTDA\.?|EIRELI))\s*$/im) : "")
    || (pen ? capturar(texto, /Cliente\.?\s*:\s*(?:\d+\s*-\s*)?([^\n]+)/i) : "")
    || capturar(texto, /Cliente\s*:\s*([^\n]+)/i);
  const valorOrigem = straw ? capturar(texto, /(?:^|\n)\s*Total\s*:\s*(?:R\$|\$)?\s*([\d.,]+)/im)
    : gate ? capturar(texto, /Total\s+\d+\s+\$\s*([\d.,]+)/i)
    : lamina ? capturar(texto, /Total Pedido\s*:\s*([\d.,]+)/i)
    : pen ? capturar(texto, /Total\.?\s*:\s*R\$\s*([\d.,]+)/i)
    : fasc ? capturar(texto, /VALOR TOTAL DO PEDIDO\s*R\$?\s*([\d.,]+)/i)
    : metasa ? capturar(texto, /Valor\s+R\$\s*([\d.,]+)/i) : "";
  const valor = extrairValor(valorOrigem);
  const avisos: string[] = [];
  // Evita que um comprovante bancário seja tratado como pedido oficial
  // apenas porque contém o nome de uma representada.
  const documentoFinanceiro = /(?:comprovante\s+(?:de\s+)?(?:pagamento|transfer[êe]ncia|pix)|comprovante\s*santander|autentica[çc][ãa]o\s*banc[áa]ria)/i.test(
    `${arquivo.name}\n${texto.slice(0, 12000)}`
  );
  if (documentoFinanceiro) avisos.push("Possível comprovante bancário: não importar como pedido oficial");
  if (!pedido) avisos.push("Número do pedido não identificado");
  if (!cliente) avisos.push("Cliente não identificado");
  if (!representada) avisos.push("Representada não identificada");
  if (!valor) avisos.push("Valor não identificado");
  if (metasa && /Total\s+R\$\s*0,00/i.test(texto)) avisos.push("Metasa: total final de R$ 0,00 exige conferência");
  if (/31\/12\/1969/.test(texto)) avisos.push("Data 31/12/1969 inválida: verificar manualmente");
  return {
    chave: `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`,
    arquivo, pedido, cliente, representada, valor,
    data: capturar(texto, /(?:Dt\. Emiss[ãa]o|DATA DO PEDIDO)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i),
    entrega: capturar(texto, /(?:Dt\. Entrega|Data de Entrega)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i),
    condicao: capturar(texto, /(?:Condi[çc][ãa]o de Pagamento|Plano de pagamento|Cond\.Pgto\.?)\s*:\s*([^\n]+)/i),
    cnpj: capturar(texto, /(?:CNPJ\/CPF|CNPJ)\s*:?\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i),
    texto: texto.slice(0, 100000), avisos, situacao: documentoFinanceiro ? "erro" : "pendente", mensagem: documentoFinanceiro ? "Documento financeiro: remova da lista de pedidos" : "Aguardando salvamento",
  };
}

export default function ImportacaoPedidosLotePage() {
  const input = useRef<HTMLInputElement>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [concluidos, setConcluidos] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [andamento, setAndamento] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  async function receber(arquivos: FileList | File[]) {
    if (carregando || salvando) return;
    const lista = Array.from(arquivos);
    setErroGeral("");
    if (lista.length === 0) return;
    if (lista.length + linhas.length + concluidos.length > MAX_ARQUIVOS) {
      setErroGeral(`O limite é de ${MAX_ARQUIVOS} arquivos por lote, incluindo os já concluídos nesta sessão.`);
      return;
    }
    setCarregando(true);
    const novos: Linha[] = [];
    const chavesAtuais = new Set([...linhas, ...concluidos].map((l) => l.chave));
    try {
      for (let i = 0; i < lista.length; i++) {
        const arquivo = lista[i];
        setAndamento(`Lendo ${i + 1} de ${lista.length}: ${arquivo.name}`);
        const chave = `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
        if (chavesAtuais.has(chave) || novos.some((l) => l.chave === chave)) continue;
        if (!/\.pdf$/i.test(arquivo.name)) {
          novos.push({ chave, arquivo, pedido: "", cliente: "", representada: "", valor: "", data: "", entrega: "", condicao: "", cnpj: "", texto: "", avisos: ["Formato ainda não suportado pelo servidor. Não enviado nem gravado."], situacao: "erro", mensagem: "Formato não suportado nesta etapa (somente PDF)" });
          continue;
        }
        if (arquivo.size < 30 || arquivo.size > MAX_BYTES) {
          novos.push({ chave, arquivo, pedido: "", cliente: "", representada: "", valor: "", data: "", entrega: "", condicao: "", cnpj: "", texto: "", avisos: ["Tamanho inválido"], situacao: "erro", mensagem: "PDF precisa ter entre 30 bytes e 12 MB" });
          continue;
        }
        try {
          const texto = await textoDoPdf(arquivo);
          if (texto.trim().length < 40) throw new Error("PDF digitalizado ou sem texto: leitura não disponível nesta versão.");
          novos.push(interpretar(arquivo, texto));
        } catch (e) {
          const mensagemLeitura = e instanceof Error ? e.message : "Não foi possível ler o PDF";
          // PDF ilegível ainda pode ser recebido como pendente; não inferimos dados.
          // O servidor validará a assinatura PDF antes de guardá-lo.
          novos.push({ chave, arquivo, pedido: "", cliente: "", representada: "", valor: "", data: "", entrega: "", condicao: "", cnpj: "", texto: "", avisos: [`Leitura pendente: ${mensagemLeitura}`], situacao: "pendente", mensagem: "PDF sem leitura: salvar para validação manual" });
        }
      }
      setLinhas((anteriores) => [...anteriores, ...novos]);
    } finally {
      setCarregando(false);
      setAndamento("");
      if (input.current) input.current.value = "";
    }
  }

  async function guardarLinha(chave: string) {
    if (salvando || carregando) return;
    const linha = linhas.find((item) => item.chave === chave);
    if (!linha || linha.situacao !== "pendente") return;
    setSalvando(true);
    setAndamento(`Guardando ${linha.arquivo.name}...`);
    setLinhas((anteriores) => anteriores.map((item) => item.chave === chave ? { ...item, situacao: "salvando", mensagem: "Gravando documento..." } : item));
    try {
      const form = new FormData();
      form.append("arquivo", linha.arquivo);
      form.append("modoPendente", "sim");
      for (const [campo, valor] of Object.entries({
        numeroPedido: linha.pedido, cliente: linha.cliente, representada: linha.representada,
        valor: linha.valor, data: linha.data, entrega: linha.entrega,
        condicao: linha.condicao, cnpj: linha.cnpj, texto: linha.texto,
        alertas: JSON.stringify(linha.avisos),
      })) if (valor) form.append(campo, valor);
      const resposta = await fetch("/api/vendas/importar-pedido", { method: "POST", body: form });
      const json = await resposta.json().catch(() => ({}));
      if (resposta.ok && json.documento?.id) {
        const final: Linha = {
          ...linha,
          situacao: json.jaExistia ? "repetido" : "salvo",
          mensagem: json.jaExistia ? "PDF já existente — nenhuma cópia criada" : "PDF guardado; aguarda validação e vínculo comercial",
          documentoId: json.documento.id,
        };
        setConcluidos((anteriores) => [...anteriores, final]);
        setLinhas((anteriores) => anteriores.filter((item) => item.chave !== chave));
      } else {
        setLinhas((anteriores) => anteriores.map((item) => item.chave === chave ? {
          ...item, situacao: "erro", mensagem: json.message || `Erro HTTP ${resposta.status}`,
        } : item));
      }
    } catch (error) {
      setLinhas((anteriores) => anteriores.map((item) => item.chave === chave ? {
        ...item, situacao: "erro", mensagem: error instanceof Error ? error.message : "Falha de rede",
      } : item));
    } finally {
      setSalvando(false);
      setAndamento("");
    }
  }

  function tentarNovamente(chave: string) {
    setLinhas((anteriores) => anteriores.map((item) =>
      item.chave === chave &&
      item.situacao === "erro" &&
      /\.pdf$/i.test(item.arquivo.name) &&
      !item.avisos.some((aviso) => aviso.includes("Possível comprovante bancário"))
        ? { ...item, situacao: "pendente", mensagem: "Aguardando salvamento" }
        : item
    ));
  }

  function removerDaLista(chave: string) {
    if (carregando || salvando) return;
    // Remove apenas do estado local, sem fazer requisição DELETE ao servidor.
    setLinhas((anteriores) => anteriores.filter((item) => item.chave !== chave));
    setErroGeral("");
  }

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    void receber(evento.dataTransfer.files);
  }
  function escolher(evento: ChangeEvent<HTMLInputElement>) {
    void receber(evento.target.files || []);
  }

  const prontos = linhas.filter((l) => l.situacao === "pendente").length;
  const salvos = concluidos.filter((l) => l.situacao === "salvo").length;
  const repetidos = concluidos.filter((l) => l.situacao === "repetido").length;
  const falhas = linhas.filter((l) => l.situacao === "erro").length;
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold text-blue-700">COMERCIAL · PEDIDOS OFICIAIS</p><h1 className="mt-1 text-2xl font-bold">Importação em lote</h1><p className="mt-1 text-sm text-slate-600">Até 20 PDFs por lote. Guarde cada documento individualmente, sem criar vendas automaticamente.</p></div>
        <Link href="/vendas/importar-pedido" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><ArrowLeft className="h-4 w-4"/>Importação individual</Link>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Primeira versão:</strong> o lote recebe somente PDFs digitais. Excel, CSV e Word serão habilitados quando seus leitores e a validação no servidor estiverem prontos. Cada PDF será guardado somente ao clicar em <strong>Guardar PDF</strong> na respectiva linha, como <strong>Pendente de revisão</strong>, sem criar Venda. Os vínculos com Cliente e Representada deverão ser confirmados posteriormente.
      </div>
      <input ref={input} type="file" multiple accept=".pdf,application/pdf" className="hidden" onChange={escolher}/>
      <div role="button" tabIndex={0} onClick={() => !carregando && !salvando && (input.current?.click())} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }} onDragOver={(e) => e.preventDefault()} onDrop={soltar} className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        {carregando ? <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-700"/> : <UploadCloud className="mx-auto h-9 w-9 text-blue-700"/>}
        <p className="mt-2 font-semibold">Selecione um ou vários PDFs e adicione os próximos quando quiser</p>
        <p className="mt-1 text-sm text-slate-500">Cada arquivo: até 12 MB. Se o Windows só permitir um arquivo, clique novamente em Adicionar PDFs. Os anteriores permanecem na fila.</p>
        <p className="mt-2 text-sm font-semibold text-blue-800" aria-live="polite">{linhas.length} de {MAX_ARQUIVOS} arquivo(s) aguardando · {concluidos.length} concluído(s) nesta sessão</p>
        <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Files className="h-4 w-4"/>{linhas.length > 0 || concluidos.length > 0 ? "Adicionar mais PDFs" : "Escolher arquivos"}</span>
      </div>
      {andamento && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>{andamento}</p>}
      {erroGeral && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mr-2 inline h-4 w-4"/>{erroGeral}</p>}
      {linhas.length > 0 && <section className="space-y-4 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Conferência dos arquivos ({linhas.length})</h2><p className="text-sm text-slate-600">Aguardando: {prontos} · Salvos: {salvos} · Já importados: {repetidos} · Falhas: {falhas}</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] border-collapse text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-2">Arquivo / pedido</th><th className="p-2">Cliente sugerido</th><th className="p-2">Representada sugerida</th><th className="p-2">Valor sugerido</th><th className="p-2">Resultado</th><th className="p-2 text-right">Ação</th></tr></thead><tbody>
          {linhas.map((linha) => <tr key={linha.chave} className="border-b align-top"><td className="max-w-[240px] break-words p-2"><strong>{linha.arquivo.name}</strong><div className="mt-1 text-slate-600">Pedido: {linha.pedido || "não identificado"}</div></td><td className="p-2">{linha.cliente || "Não identificado"}</td><td className="p-2">{linha.representada || "Não identificada"}</td><td className="p-2 font-semibold">{linha.valor ? Number(linha.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Conferir"}</td><td className="p-2"><span className={linha.situacao === "salvo" || linha.situacao === "repetido" ? "text-green-700" : linha.situacao === "erro" ? "text-red-700" : "text-amber-700"}>{linha.mensagem}</span>{linha.avisos.length > 0 && <ul className="mt-1 list-inside list-disc text-xs text-amber-800">{linha.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>}{linha.documentoId && <p className="mt-1 break-all text-xs text-slate-500">ID: {linha.documentoId}</p>}</td><td className="whitespace-nowrap p-2 text-right"><div className="flex items-center justify-end gap-2">
              {linha.situacao === "pendente" ? (
                <button type="button" disabled={carregando || salvando} onClick={() => void guardarLinha(linha.chave)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Guardar PDF</button>
              ) : linha.situacao === "salvando" ? (
                <span className="text-xs">Gravando...</span>
              ) : linha.situacao === "erro" && /\.pdf$/i.test(linha.arquivo.name) && !linha.avisos.some((aviso) => aviso.includes("Possível comprovante bancário")) ? (
                <button type="button" disabled={salvando || carregando} onClick={() => tentarNovamente(linha.chave)} className="rounded-lg border px-3 py-2 text-xs">Tentar novamente</button>
              ) : null}
              {linha.situacao !== "salvando" && (
                <button
                  type="button"
                  disabled={carregando || salvando}
                  onClick={() => removerDaLista(linha.chave)}
                  title={`Remover ${linha.arquivo.name} da lista sem excluir do CRM`}
                  aria-label={`Remover ${linha.arquivo.name} da lista`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4"/>
                </button>
              )}
            </div></td></tr>)}
        </tbody></table></div>
        <p className="text-sm font-medium text-slate-700">Use Guardar PDF somente para pedidos oficiais. O X vermelho remove o arquivo apenas desta lista, sem excluir documentos do CRM. Cada linha guardada sai da tabela e continua registrada no banco.</p>
        <p className="text-xs text-slate-600">O servidor bloqueia PDFs idênticos. Pedidos com números repetidos, mas arquivos diferentes, exigem conferência comercial posterior. Cada PDF é processado separadamente; uma falha não cancela os demais. Não fecha a página enquanto estiver salvando.</p>
      </section>}
      {concluidos.length > 0 && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="mb-2 font-semibold text-emerald-950">Concluídos nesta sessão ({concluidos.length})</h2>
        <ul className="space-y-2 text-sm text-emerald-900">{concluidos.map((item) => <li key={item.chave} className="break-words">{item.arquivo.name}: {item.mensagem} · ID: {item.documentoId}</li>)}</ul>
        <p className="mt-3 text-xs text-emerald-900">Esta lista é um recibo desta sessão. A fila permanente de revisão e a liberação das Vendas serão disponibilizadas em outra etapa.</p>
      </section>}
    </div>
  );
}