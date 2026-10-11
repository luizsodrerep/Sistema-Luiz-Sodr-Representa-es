"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowLeft, FileCheck2, FileUp, Loader2, RefreshCcw, SearchCheck, ShieldCheck, TriangleAlert } from "lucide-react";

type Movimento = {
  id: string;
  tipo: string;
  status: string;
  valor: number;
  data: string;
  vencimento: string | null;
  descricao: string | null;
  categoria: string | null;
  contaBancariaId: string | null;
};
type Conta = { id: string; nome: string; banco: string | null; ativa: boolean; tipoTitular?: string | null };
type Extracao = {
  arquivo: string;
  texto: string;
  data: string;
  valor: string;
  destinatario: string;
  identificador: string;
  origemBanco: string;
  descricao: string;
  categoria: string;
  parcela: string;
  totalParcelas: string;
  competencia: string;
  contaId: string;
};
type Match = { movimento: Movimento; motivos: string[]; pontuacao: number };
type SugestaoHistorico = { movimento: Movimento; categoria: string; descricao: string; dias: number; };

const campo = "h-8 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus:border-blue-600";
const rotulo = "mb-1 block truncate text-[11px] font-medium text-slate-600";
const botao = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50";
const meses: Record<string, string> = {
  JAN: "01", FEV: "02", MAR: "03", ABR: "04", MAI: "05", JUN: "06",
  JUL: "07", AGO: "08", SET: "09", OUT: "10", NOV: "11", DEZ: "12",
};

function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function valorNumerico(s: string): number | null {
  const v = s.replace(/\s/g, "").replace(/R\$/gi, "");
  const n = Number(v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}
function isoData(s: string): string {
  const m = s.match(/(\d{1,2})\s*[/ .-]\s*(\d{1,2})\s*[/ .-]\s*(20\d{2})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const e = normalizar(s).match(/(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\w*\s+(20\d{2})/);
  return e ? `${e[3]}-${meses[e[2]]}-${e[1].padStart(2, "0")}` : "";
}
function obterValor(texto: string): string {
  const normal = texto.replace(/\u00a0/g, " ");
  const m = normal.match(/\bValor\s*[:\n ]*R\s*\$\s*([\d.,]+)/i) || normal.match(/\bR\s*\$\s*([\d.,]+)/i);
  return m?.[1] || "";
}
/**
 * O identificador EndToEnd Pix (E2E) possui 32 caracteres:
 * E + ISPB (8 dígitos) + data UTC (AAAAMMDD) + 15 caracteres alfanuméricos.
 * O OCR pode juntar ao ID o texto imediatamente posterior. Nunca devolvemos
 * mais que 32 caracteres; um resultado incompleto fica vazio para conferência.
 */
function obterIdPix(texto: string): string {
  const linhas = texto.split(/\r?\n/).map((linha) => linha.trim());
  const padraoE2E = /E\d{8}20\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[A-Za-z0-9]{15}/i;
  const buscar = (trecho: string): string => {
    const compactado = trecho.replace(/[\s.:\-]/g, "");
    return compactado.match(padraoE2E)?.[0] || "";
  };
  // Priorizar o campo identificado, evitando outros códigos do comprovante.
  for (let i = 0; i < linhas.length; i++) {
    if (/ID\s*da\s*transa|ID\s*da\s*opera|END\s*TO\s*END|IDENTIFICADOR/i.test(normalizar(linhas[i]))) {
      const id = buscar(linhas.slice(i, i + 5).join(" "));
      if (id) return id;
    }
  }
  // Fallback: texto do PDF ou OCR que perdeu a legenda, inclusive ID em 2 linhas.
  for (let i = 0; i < linhas.length; i++) {
    const id = buscar(linhas.slice(i, i + 2).join(" "));
    if (id) return id;
  }
  return "";
}

/**
 * Lê exclusivamente o bloco Destino. Em comprovantes Nubank, o OCR costuma
 * quebrar a etiqueta Nome em duas linhas: "N MARLENE..." / "ome SANTOS...".
 * Nessa situação, os textos à direita das duas metades da etiqueta são
 * concatenados, sem incluir o "N" e o "ome" no nome do favorecido.
 */
function obterFavorecido(texto: string): string {
  const linhas = texto.split(/\r?\n/).map((linha) => linha.replace(/\s+/g, " ").trim());
  const indiceDestino = linhas.findIndex((linha) => /\bDESTIN[O0]\b|DESTINATARI/i.test(normalizar(linha)));
  if (indiceDestino < 0) return "";
  const indiceOrigem = linhas.findIndex((linha, i) => i > indiceDestino && /^ORIGEM\b/i.test(normalizar(linha)));
  const fim = indiceOrigem >= 0 ? indiceOrigem : Math.min(linhas.length, indiceDestino + 18);
  const bloco = linhas.slice(indiceDestino + 1, fim);

  const interromper = (linha: string): boolean =>
    /^(?:CPF|CNPJ|INSTITUI|CHAV|ORIGEM|AGENCIA|CONTA|BANCO)\b/i.test(normalizar(linha));

  for (let i = 0; i < bloco.length; i++) {
    const linha = bloco[i];
    if (interromper(linha)) break;
    const partes: string[] = [];
    let proxima = i + 1;

    // Nubank: "N MARLENE SOUZA DOS" + "ome SANTOS RIOS".
    const primeiraMetade = linha.match(/^N\s+([\p{L}][\p{L} '-]*)$/iu);
    const segundaMetade = bloco[i + 1]?.match(/^ome\b\s*[:\-]?\s*(.*)$/i);
    if (primeiraMetade && segundaMetade) {
      partes.push(primeiraMetade[1]);
      if (segundaMetade[1]) partes.push(segundaMetade[1]);
      proxima = i + 2;
    } else {
      // Rótulo completo: "Nome MARLENE..." ou "Nome" na linha anterior.
      const nomeCompleto = linha.match(/(?:^|\s)N[o0]me\b\s*[:\-]?\s*(.*)$/i);
      if (!nomeCompleto) continue;
      if (nomeCompleto[1]) partes.push(nomeCompleto[1]);
    }

    for (let j = proxima; j < Math.min(bloco.length, proxima + 3); j++) {
      if (interromper(bloco[j])) break;
      if (bloco[j]) partes.push(bloco[j]);
    }
    const nome = partes.join(" ").replace(/\s+/g, " ").trim();
    // Evita atribuir CPF, instituição ou trecho ilegível a uma pessoa.
    if (/^[\p{L}][\p{L}' .-]{5,139}$/u.test(nome) && nome.split(/\s+/).length >= 2) {
      return nome;
    }
  }
  return "";
}
function extrair(texto: string, nome: string): Extracao {
  const t = texto.replace(/\u00a0/g, " ");
  const txt = normalizar(t);
  const data = isoData(t);
  const valor = obterValor(t);
  const destinatario = obterFavorecido(t);
  const origemBanco = /NU PAGAMENTOS|NUBANK/i.test(txt) ? "Nubank / Nu Pagamentos" : "";
  return {
    arquivo: nome, texto: t, data, valor, destinatario, identificador: obterIdPix(t), origemBanco,
    descricao: "", categoria: "Outros gastos", parcela: "", totalParcelas: "", competencia: "", contaId: "",
  };
}
function dataLocal(iso: string | null): string {
  return typeof iso === "string" ? iso.slice(0, 10) : "";
}
function formatarMoeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
function sugerirMatches(lista: Movimento[], registro: Extracao): Match[] {
  const valor = valorNumerico(registro.valor);
  if (!valor) return [];
  return lista.filter((m) => m.tipo === "Saida" && m.status !== "Cancelado")
    .map((movimento): Match => {
      const motivos: string[] = [];
      let pontuacao = 0;
      if (Math.abs(movimento.valor - valor) < 0.005) { pontuacao += 50; motivos.push("mesmo valor"); }
      else return { movimento, motivos: [], pontuacao: 0 };
      if (registro.data && (dataLocal(movimento.data) === registro.data || dataLocal(movimento.vencimento) === registro.data)) {
        pontuacao += 25; motivos.push("mesma data ou vencimento");
      }
      if (movimento.status === "Pendente") { pontuacao += 10; motivos.push("pendente para baixa"); }
      if (movimento.status === "Realizado") {
        motivos.push(registro.data && dataLocal(movimento.data) !== registro.data
          ? "pagamento anterior em outra data; não comprova duplicidade"
          : "já realizado: conferir possível duplicidade");
      }
      const termos = normalizar(`${registro.descricao} ${registro.categoria}`).split(/[^A-Z0-9]+/).filter((p) => p.length > 4);
      if (termos.some((p) => normalizar(`${movimento.descricao} ${movimento.categoria}`).includes(p))) {
        pontuacao += 10; motivos.push("descrição semelhante");
      }
      if (registro.contaId && movimento.contaBancariaId === registro.contaId) { pontuacao += 5; motivos.push("mesma conta"); }
      return { movimento, motivos, pontuacao };
    }).filter((m) => m.pontuacao >= 50)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, 12);
}

/**
 * Sugere recorrências confirmadas no passado: valor igual e intervalo mensal.
 * Não confunde comprovante com finalidade e não reaproveita a conta antiga.
 * Sem indício real de recorrência, prefere não sugerir.
 */
function sugerirHistorico(lista: Movimento[], registro: Extracao): SugestaoHistorico[] {
  const valor = valorNumerico(registro.valor);
  const referencia = registro.data ? new Date(`${registro.data}T12:00:00Z`).getTime() : NaN;
  if (valor === null || !Number.isFinite(referencia)) return [];
  return lista
    .filter((item) => item.tipo === "Saida" && item.status === "Realizado" &&
      !!item.descricao && Math.abs(item.valor - valor) < 0.005)
    .map((item) => {
      const anterior = new Date(`${dataLocal(item.data)}T12:00:00Z`).getTime();
      const dias = Math.round((referencia - anterior) / 86400000);
      const descricaoNormalizada = normalizar(item.descricao || "");
      const categoriaNormalizada = normalizar(item.categoria || "");
      const condominio = /CONDOM[IÍ]NIO|CONDOMINIO|COMDOMINIO/.test(descricaoNormalizada) ||
        /CONDOMINIO/.test(categoriaNormalizada);
      const casaParcelada = /PARCELA|PRESTACAO|PRESTACAO/.test(descricaoNormalizada) &&
        /CASA|QUEDAS|IMOVEL/.test(descricaoNormalizada);
      const recorrente = condominio || casaParcelada ||
        /MENSALIDADE|ALUGUEL|ASSINATURA/.test(descricaoNormalizada);
      if (!recorrente || dias < 20 || dias > 45) return null;
      return {
        movimento: item,
        categoria: condominio ? "Condomínio" : casaParcelada ? "Moradia" :
          ["Moradia", "Condomínio", "Dívidas e acordos", "Impostos e taxas", "Outros gastos"].includes(item.categoria || "")
            ? (item.categoria || "Outros gastos") : "Outros gastos",
        descricao: item.descricao || "",
        dias,
      } satisfies SugestaoHistorico;
    })
    .filter((v): v is SugestaoHistorico => v !== null)
    .sort((a, b) => Math.abs(a.dias - 30) - Math.abs(b.dias - 30))
    .slice(0, 3);
}

export default function ImportarComprovantePreviaPage() {
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [registro, setRegistro] = useState<Extracao | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [candidatoId, setCandidatoId] = useState("");

  const candidatos = useMemo(() => registro ? sugerirMatches(movimentos, registro) : [], [movimentos, registro]);
  const sugestoes = useMemo(() => registro ? sugerirHistorico(movimentos, registro) : [], [movimentos, registro]);
  const escolhido = candidatos.find((m) => m.movimento.id === candidatoId);
  const totalParcelas = Number(registro?.totalParcelas || 0);
  const parcela = Number(registro?.parcela || 0);
  const saldoParcelas = Number.isInteger(parcela) && Number.isInteger(totalParcelas) && parcela > 0 && totalParcelas >= parcela
    ? totalParcelas - parcela : null;

  async function consultarFinanceiro() {
    setConsultando(true); setErro("");
    try {
      const resposta = await fetch("/api/financeiro", { cache: "no-store", credentials: "same-origin" });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.erro || "Falha ao consultar o Financeiro.");
      setContas(Array.isArray(dados.contas) ? dados.contas.filter((c: Conta) => c.ativa) : []);
      setMovimentos(Array.isArray(dados.movimentos) ? dados.movimentos : []);
      setPesquisaRealizada(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível consultar lançamentos.");
    } finally { setConsultando(false); }
  }

  async function textoDeImagem(file: Blob): Promise<string> {
    const { createWorker } = await import("tesseract.js");
    setEtapa("Carregando leitor OCR em português...");
    const worker = await createWorker("por", 1, {
      logger: (m: { status?: string; progress?: number }) => {
        if (m.status === "recognizing text" && typeof m.progress === "number")
          setEtapa(`Reconhecendo imagem: ${Math.round(m.progress * 100)}%`);
      },
    });
    try {
      const saida = await worker.recognize(file);
      return saida.data.text;
    } finally { await worker.terminate(); }
  }

  async function textoDePdf(file: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const partes: string[] = [];
    try {
      const total = Math.min(pdf.numPages, 4);
      for (let p = 1; p <= total; p++) {
        setEtapa(`Lendo PDF: página ${p}/${total}`);
        const pagina = await pdf.getPage(p);
        const conteudo = await pagina.getTextContent();
        const porLinha = new Map<number, Array<{ x: number; texto: string }>>();
        for (const item of conteudo.items) {
          if (!("str" in item) || !("transform" in item)) continue;
          const y = Math.round(item.transform[5] / 3) * 3;
          const linha = porLinha.get(y) || [];
          linha.push({ x: item.transform[4], texto: item.str });
          porLinha.set(y, linha);
        }
        const texto = [...porLinha.keys()].sort((a, b) => b - a)
          .map((y) => (porLinha.get(y) || []).sort((a, b) => a.x - b.x).map((v) => v.texto).join(" ")).join("\n");
        if (texto.trim().length > 30) { partes.push(texto); continue; }
        setEtapa(`PDF digitalizado: usando OCR na página ${p}...`);
        const viewport = pagina.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Não foi possível preparar a leitura da página digitalizada.");
        await pagina.render({ canvasContext: ctx, viewport }).promise;
        const imagem = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível converter a página em imagem.")), "image/png"));
        partes.push(await textoDeImagem(imagem));
      }
      return partes.join("\n");
    } finally { await pdf.destroy(); }
  }

  async function receberArquivo(arquivo?: File) {
    if (!arquivo) return;
    setErro(""); setAviso(""); setRegistro(null); setCandidatoId(""); setMostrarTexto(false);
    setPesquisaRealizada(false); setMovimentos([]); setContas([]);
    const extensao = arquivo.name.split(".").pop()?.toLowerCase();
    if (!extensao || !["jpg", "jpeg", "png", "webp", "pdf"].includes(extensao)) {
      setErro("Escolha um comprovante JPG, PNG, WebP ou PDF."); return;
    }
    if (arquivo.size < 30 || arquivo.size > 12 * 1024 * 1024) {
      setErro("O arquivo deve ter até 12 MB e não pode estar vazio."); return;
    }
    setAnalisando(true);
    try {
      setEtapa("Preparando leitura...");
      const texto = extensao === "pdf" ? await textoDePdf(arquivo) : await textoDeImagem(arquivo);
      if (texto.trim().length < 15) throw new Error("Não foi possível extrair texto suficiente. Tente uma imagem mais nítida.");
      const resultado = extrair(texto, arquivo.name);
      setRegistro(resultado);
      setAviso("Leitura preliminar concluída. Confira os campos: OCR pode confundir números e letras. Nada foi gravado no CRM.");
      await consultarFinanceiro();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na leitura do comprovante.");
    } finally {
      setAnalisando(false); setEtapa("");
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  }
  function aplicarSugestao(sugestao: SugestaoHistorico) {
    setRegistro((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        descricao: sugestao.descricao,
        categoria: sugestao.categoria,
        competencia: atual.data ? atual.data.slice(0, 7) : "",
        // O comprovante não informa parcela. Nada pode ser inferido aqui.
        parcela: "",
        totalParcelas: "",
        // A conta do mês anterior não deve ser reutilizada automaticamente.
        contaId: "",
      };
    });
    setCandidatoId("");
    setAviso("Sugestão do histórico aplicada para conferência. Confira a finalidade, a conta de origem e, se houver, a parcela. Nada foi salvo no CRM.");
  }
  function alterar(chave: keyof Extracao, valor: string) {
    setRegistro((atual) => atual ? { ...atual, [chave]: valor } : atual);
    if (chave === "valor" || chave === "data" || chave === "contaId" || chave === "descricao") setCandidatoId("");
  }
  function escolher(e: ChangeEvent<HTMLInputElement>) { void receberArquivo(e.target.files?.[0]); }
  function soltar(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setArrastando(false); void receberArquivo(e.dataTransfer.files?.[0]); }
  const quantidadeRestante = saldoParcelas !== null ? `${saldoParcelas} de ${totalParcelas}` : "A definir";
  return (
    <main className="mx-auto w-full max-w-6xl space-y-3 px-3 py-3 text-slate-900 sm:px-5">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Financeiro 360° · Documentos</p>
          <h1 className="text-lg font-bold">Importar comprovante</h1>
          <p className="text-xs text-slate-500">Leitura automática, conferência e busca de lançamentos — modo seguro de prévia</p>
        </div>
        <Link href="/financeiro" className={botao}><ArrowLeft className="h-3.5 w-3.5" />Voltar ao Financeiro</Link>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span><strong>Modo de prévia:</strong> esta tela não envia nem salva comprovantes, não gera lançamentos e não altera saldos. A confirmação financeira e o arquivo permanente serão integrados em uma etapa posterior.</span>
      </div>
      <input ref={arquivoRef} className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={escolher} aria-label="Selecionar comprovante" />
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); arquivoRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)} onDrop={soltar}
        onClick={() => { if (!analisando) arquivoRef.current?.click(); }}
        className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed px-3 py-5 text-center ${arrastando ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
        {analisando ? <Loader2 className="h-6 w-6 animate-spin text-blue-700" /> : <FileUp className="h-6 w-6 text-blue-700" />}
        <div className="text-left"><div className="text-xs font-semibold">{analisando ? etapa : "Clique ou arraste um comprovante Pix"}</div><div className="text-[11px] text-slate-500">JPG, PNG, WebP ou PDF · até 12 MB · OCR local no navegador</div></div>
      </div>
      {erro && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800"><TriangleAlert className="h-4 w-4 shrink-0" />{erro}</div>}
      {aviso && <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{aviso}</div>}
      {registro && <>
        <section className="space-y-3 rounded-xl border bg-white p-3">
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b pb-2">
            <div className="flex min-w-0 items-center gap-2"><FileCheck2 className="h-4 w-4 text-blue-700"/><div><h2 className="text-sm font-semibold">1. Dados identificados e editáveis</h2><p className="max-w-[50ch] truncate text-[11px] text-slate-500">{registro.arquivo}</p></div></div>
            <button type="button" onClick={() => void consultarFinanceiro()} disabled={consultando} className={botao}>{consultando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}Atualizar lançamentos</button>
          </div>
          {pesquisaRealizada && sugestoes.length > 0 && <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/60 p-2">
            <div className="text-xs font-semibold text-blue-950">Sugestões do histórico mensal — escolha para preencher</div>
            {sugestoes.map((sugestao) => <div key={sugestao.movimento.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-100 bg-white p-2">
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-semibold text-slate-900">{sugestao.descricao}</div>
                <div className="text-[11px] text-slate-600">{formatarMoeda(sugestao.movimento.valor)} · {dataLocal(sugestao.movimento.data).split("-").reverse().join("/")} · categoria sugerida: {sugestao.categoria}</div>
              </div>
              <button type="button" className={botao} onClick={() => aplicarSugestao(sugestao)}>Usar sugestão</button>
            </div>)}
            <p className="text-[11px] text-blue-900">Sem confirmação automática: mesmo valor e frequência mensal não comprovam a finalidade. A conta anterior e o nº da parcela não são reaproveitados.</p>
          </div>}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label><span className={rotulo}>Valor do Pix (R$)</span><input className={campo} value={registro.valor} onChange={(e) => alterar("valor", e.target.value)} placeholder="1.000,00" /></label>
            <label><span className={rotulo}>Data do pagamento</span><input type="date" className={campo} value={registro.data} onChange={(e) => alterar("data", e.target.value)} /></label>
            <label className="sm:col-span-2"><span className={rotulo}>Favorecido</span><input className={campo} value={registro.destinatario} onChange={(e) => alterar("destinatario", e.target.value)} placeholder="Confirme o nome do destinatário" /></label>
            <label className="sm:col-span-2"><span className={rotulo}>ID Pix (conferir caracteres)</span><input className={campo} value={registro.identificador} onChange={(e) => alterar("identificador", e.target.value)} placeholder="ID E2E da transação" /></label>
            <label><span className={rotulo}>Banco de origem (leitura)</span><input className={campo} value={registro.origemBanco} onChange={(e) => alterar("origemBanco", e.target.value)} placeholder="Banco de origem" /></label>
            <label><span className={rotulo}>Conta do CRM (confirmar)</span><select className={campo} value={registro.contaId} onChange={(e) => alterar("contaId", e.target.value)}><option value="">Selecione uma conta...</option>{contas.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.banco ? ` · ${c.banco}` : ""}{c.tipoTitular ? ` · ${c.tipoTitular}` : ""}</option>)}</select></label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="sm:col-span-2"><span className={rotulo}>Finalidade / descrição (não consta necessariamente do Pix)</span><input className={campo} value={registro.descricao} onChange={(e) => alterar("descricao", e.target.value)} placeholder="Ex.: Casa do Quedas - compra da casa" /></label>
            <label><span className={rotulo}>Categoria</span><select className={campo} value={registro.categoria} onChange={(e) => alterar("categoria", e.target.value)}><option>Moradia</option><option>Condomínio</option><option>Dívidas e acordos</option><option>Impostos e taxas</option><option>Outros gastos</option></select></label>
            <label><span className={rotulo}>Competência</span><input className={campo} type="month" value={registro.competencia} onChange={(e) => alterar("competencia", e.target.value)} /></label>
            <label><span className={rotulo}>Nº da parcela</span><input className={campo} type="number" min="1" max="120" placeholder="Ex.: 17" value={registro.parcela} onChange={(e) => alterar("parcela", e.target.value)} /></label>
            <label><span className={rotulo}>Total de parcelas</span><input className={campo} type="number" min="1" max="120" placeholder="Ex.: 25" value={registro.totalParcelas} onChange={(e) => alterar("totalParcelas", e.target.value)} /></label>
            <div className="flex h-8 items-center rounded-md border bg-slate-50 px-2 text-xs"><span className="mr-1 text-slate-500">Restam:</span><strong>{quantidadeRestante}</strong></div>
          </div>
          <p className="text-[11px] text-slate-600">O comprovante prova o Pix, mas normalmente não informa se ele corresponde a uma parcela ou a condomínio. Essa finalidade é confirmada por você ou por um vínculo com um compromisso já cadastrado.</p>
        </section>
        <section className="space-y-2 rounded-xl border bg-white p-3">
          <div className="flex min-h-10 items-center gap-2 border-b pb-2"><SearchCheck className="h-4 w-4 text-blue-700"/><div><h2 className="text-sm font-semibold">2. Verificação de lançamentos do CRM</h2><p className="text-[11px] text-slate-500">Correspondências são sugestões, não baixas automáticas.</p></div></div>
          {!pesquisaRealizada && <p className="text-xs text-slate-600">Ainda não foi possível concluir a consulta financeira.</p>}
          {pesquisaRealizada && candidatos.length === 0 && <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">Não encontramos saídas com o mesmo valor na lista retornada pela API. Isso não comprova inexistência de registro; confira seu histórico antes de lançar.</p>}
          {candidatos.length > 0 && <div className="overflow-auto"><table className="w-full table-fixed text-xs"><thead><tr className="border-b bg-slate-50 text-left"><th className="w-8 p-2"></th><th className="p-2">Lançamento</th><th className="w-28 p-2">Valor</th><th className="w-24 p-2">Situação</th><th className="w-28 p-2">Data</th></tr></thead><tbody>{candidatos.map(({ movimento, motivos }) => <tr key={movimento.id} className="h-[42px] border-b last:border-0"><td className="p-2"><input type="radio" name="candidato" checked={candidatoId === movimento.id} onChange={() => setCandidatoId(movimento.id)} aria-label={`Selecionar ${movimento.descricao || movimento.id}`} /></td><td className="p-2"><div className="truncate font-semibold">{movimento.descricao || "Sem descrição"}</div><div className="truncate text-[10px] text-slate-500">{motivos.join(" · ")}</div></td><td className="p-2 tabular-nums">{formatarMoeda(movimento.valor)}</td><td className="p-2">{movimento.status}</td><td className="p-2">{dataLocal(movimento.data).split("-").reverse().join("/")}</td></tr>)}</tbody></table></div>}
          {escolhido && <p className="rounded-md border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900">Selecionado para futura associação: <strong>{escolhido.movimento.descricao || escolhido.movimento.id}</strong>. Nenhuma alteração foi feita. {escolhido.movimento.status === "Realizado" ? "Já realizado: verificar possível duplicidade." : "Pendente: na próxima etapa será possível confirmar a baixa."}</p>}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900"><strong>Atenção:</strong> nesta prévia ainda não existe registro persistente do ID Pix. Proteção definitiva contra importação duplicada, armazenamento do arquivo e confirmação financeira exigem uma API própria.</div>
        </section>
        <section className="rounded-xl border bg-white p-3"><button type="button" onClick={() => setMostrarTexto((v) => !v)} className={botao}>{mostrarTexto ? "Ocultar" : "Mostrar"} texto reconhecido</button>{mostrarTexto && <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-[11px]">{registro.texto}</pre>}</section>
      </>}
    </main>
  );
}
