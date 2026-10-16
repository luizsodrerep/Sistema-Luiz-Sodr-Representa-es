"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FolderClock,
  Inbox,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

type Departamento =
  | "Pedido oficial"
  | "Comprovante de pagamento"
  | "Extrato bancário"
  | "Comissões e NF"
  | "Contas a pagar"
  | "Faturamento"
  | "Investimentos"
  | "Planejamento"
  | "Geral / não identificado";

type Situacao = "local" | "gravando" | "gravado" | "duplicado" | "erro";

type Documento = {
  id: string;
  arquivo: File;
  departamento: Departamento;
  situacao: Situacao;
  mensagem: string;
  texto: string;
  idNoCrm?: string;
  metodoLeitura: "PDF" | "OCR de imagem" | "Texto" | "Planilha" | "Não interpretado";
  observacaoLeitura: string;
  confirmadoComoPedido: boolean;
};

type DocumentoGuardado = {
  id: string;
  nomeOriginal: string;
  criadoEm: string;
  tamanho: number;
  situacao: "PendenteRevisao";
  origem: "Central" | "CompartilhamentoAndroid";
};

// Formatos efetivamente permitidos pelo receptor atual. Outros formatos
// continuam disponíveis para triagem local, sem simular um salvamento.
const EXTENSOES_GUARDAVEIS = /\.(?:pdf|jpe?g|png|webp|heic|heif|docx?|xlsx?|csv|ofx|txt|xml|eml)$/i;
const MAX_CENTRAL_BYTES = 20 * 1024 * 1024;

async function carregarCaixaDoServidor(): Promise<DocumentoGuardado[]> {
  const resposta = await fetch("/api/central-documentos", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados?.mensagem || `Erro HTTP ${resposta.status} ao consultar a caixa.`);
  }
  return Array.isArray(dados?.documentos) ? dados.documentos : [];
}

const MAX_ARQUIVOS = 30;
const MAX_PEDIDO_BYTES = 12 * 1024 * 1024;
const MAX_OCR_BYTES = 10 * 1024 * 1024;
const MAX_TEXTO_BYTES = 3 * 1024 * 1024;
const MAX_PLANILHA_BYTES = 5 * 1024 * 1024;

const departamentos: Departamento[] = [
  "Pedido oficial",
  "Comprovante de pagamento",
  "Extrato bancário",
  "Comissões e NF",
  "Contas a pagar",
  "Faturamento",
  "Investimentos",
  "Planejamento",
  "Geral / não identificado",
];

const destinos: Partial<Record<Departamento, { url: string; nome: string }>> = {
  "Pedido oficial": { url: "/vendas/importar-pedido/lote", nome: "Importador atual de pedidos" },
  "Comprovante de pagamento": { url: "/financeiro/importar-comprovante", nome: "Importador atual de comprovantes" },
  "Extrato bancário": { url: "/financeiro/conciliacao", nome: "Conciliação bancária atual" },
  "Comissões e NF": { url: "/comissoes", nome: "Módulo de comissões" },
  "Contas a pagar": { url: "/titulos", nome: "Módulo de títulos" },
  Faturamento: { url: "/faturamentos", nome: "Módulo de faturamentos" },
  Investimentos: { url: "/financeiro", nome: "Módulo financeiro" },
  Planejamento: { url: "/agenda", nome: "Agenda e planejamento" },
};

function classificar(nome: string, texto = ""): Departamento {
  const conteudo = `${nome}\n${texto.slice(0, 15000)}`;
  if (/\.ofx$/i.test(nome)) return "Extrato bancário";
  if (/extrato\s+(?:de\s+)?conta|extrato\s+banc[aá]rio|<OFX>|<BANKTRANLIST>|saldo\s+anterior|saldo\s+do\s+dia/i.test(conteudo)) return "Extrato bancário";
  if (/comprovante\s+(?:do\s+)?pix|comprovante\s+de\s+(?:pagamento|transfer[eê]ncia)|dados\s+do\s+(?:recebedor|pagador)|ID\/Transa[cç][aã]o/i.test(conteudo)) return "Comprovante de pagamento";
  if (/relat[oó]rio\s+de\s+comiss[aã]o|demonstrativo\s+de\s+comiss[aã]o|comiss[oõ]es\s+a\s+receber|autoriza[cç][aã]o\s+para\s+(?:emitir|emiss[aã]o)\s+(?:de\s+)?NF/i.test(conteudo)) return "Comissões e NF";
  if (/pedido\s+(?:de\s+)?(?:venda|cliente)|espelho\s+de\s+pedido|PEDWEB|pedido\s+oficial|pedido\s+aprovado/i.test(conteudo)) return "Pedido oficial";
  // Formulários de pedidos fotografados podem não conter o título "Pedido de venda".
  if (/\bcliente\b/i.test(conteudo) && /\b(?:produto|c[oó]digo|descri[cç][aã]o)\b/i.test(conteudo) && /\b(?:quantidade|qtd|pre[cç]o|unit[aá]rio|total)\b/i.test(conteudo)) return "Pedido oficial";
  // Formulários de pedidos com OCR imperfeito:
  // códigos de produtos, subtotal e total a pagar.
  // Nunca considerar confirmação oficial sem revisão humana.
  const possuiCabecalhoProdutos =
    /\bc[oó]d\.?\s*prod(?:uto)?\b/i.test(conteudo);

  const possuiSubtotal =
    /\b(?:sub\s*total|gubtotal)\b/i.test(conteudo);

  const possuiTotalAPagar =
    /total\s*a\s*pagar/i.test(conteudo);

  const quantidadeCodigos =
    (conteudo.match(/(?:^|[\s|])\d{4,7}(?=[\s|])/gm) || []).length;

  const pareceDocumentoFiscal =
    /nota\s*fiscal|\bdanfe\b|\bnf-e\b|\bnfe\b/i.test(conteudo);

  if (
    !pareceDocumentoFiscal &&
    possuiCabecalhoProdutos &&
    possuiSubtotal &&
    possuiTotalAPagar &&
    quantidadeCodigos >= 2
  ) {
    return "Pedido oficial";
  }

  if (/nota\s+fiscal|danfe|nfe\b|nf-e\b/i.test(conteudo)) return "Faturamento";
  if (/fatura\s+a\s+pagar|boleto|vencimento|enel|sabesp|plano\s+de\s+sa[uú]de/i.test(conteudo)) return "Contas a pagar";
  if (/aplica[cç][aã]o\s+financeira|investimento|cdb\b|resgate/i.test(conteudo)) return "Investimentos";
  if (/planejamento|cronograma|agenda|meta\s+anual/i.test(conteudo)) return "Planejamento";
  return "Geral / não identificado";
}

async function lerPdfParaTriagem(arquivo: File): Promise<string> {
  if (!/\.pdf$/i.test(arquivo.name)) return "";
  if (arquivo.size > MAX_PEDIDO_BYTES) return "";
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await arquivo.arrayBuffer()) }).promise;
    try {
      const paginas: string[] = [];
      for (let numero = 1; numero <= Math.min(pdf.numPages, 5); numero++) {
        const conteudo = await (await pdf.getPage(numero)).getTextContent();
        paginas.push(conteudo.items.filter((item): item is typeof item & { str: string } => "str" in item).map((item) => item.str).join(" "));
      }
      return paginas.join("\n").slice(0, 90000);
    } finally {
      await pdf.destroy();
    }
  } catch {
    return ""; // PDFs digitalizados continuam disponíveis para conferência manual.
  }
}

type ResultadoLeitura = {
  texto: string;
  metodoLeitura: Documento["metodoLeitura"];
  observacaoLeitura: string;
};

async function analisarArquivo(arquivo: File): Promise<ResultadoLeitura> {
  const semLeitura = (observacaoLeitura: string): ResultadoLeitura => ({
    texto: "", metodoLeitura: "Não interpretado", observacaoLeitura,
  });
  if (/\.pdf$/i.test(arquivo.name)) {
    if (arquivo.size > MAX_PEDIDO_BYTES) return semLeitura("PDF acima de 12 MB: requer conferência por outro meio.");
    const texto = await lerPdfParaTriagem(arquivo);
    return texto.trim()
      ? { texto, metodoLeitura: "PDF", observacaoLeitura: "Texto das primeiras cinco páginas do PDF; conferir o documento completo." }
      : semLeitura("PDF sem texto legível; não houve OCR das páginas digitalizadas nesta etapa.");
  }
  if (/\.(?:png|jpe?g|webp|bmp)$/i.test(arquivo.name)) {
    if (arquivo.size > MAX_OCR_BYTES) return semLeitura("Imagem acima de 10 MB: OCR não executado.");
    try {
      // O reconhecimento roda no navegador. A biblioteca pode precisar baixar
      // o idioma português na primeira utilização.
      const { recognize } = await import("tesseract.js");
      const resultado = await recognize(arquivo, "por");
      const texto = (resultado.data.text || "").slice(0, 90000);
      return texto.trim().length >= 15
        ? { texto, metodoLeitura: "OCR de imagem", observacaoLeitura: "Texto sugerido por OCR, sujeito a falhas. Conferir todos os campos no original." }
        : semLeitura("OCR não encontrou texto suficiente. Classifique manualmente.");
    } catch {
      return semLeitura("OCR indisponível no momento (idioma ou leitura). Classifique manualmente.");
    }
  }
  if (/\.(?:xlsx|xls|ods)$/i.test(arquivo.name)) {
    if (arquivo.size > MAX_PLANILHA_BYTES) return semLeitura("Planilha acima de 5 MB: selecione o departamento manualmente.");
    try {
      // Lê somente uma prévia de até 50 linhas por aba; não importa lançamentos.
      const XLSX = await import("xlsx");
      const conteudo = await arquivo.arrayBuffer();
      const livro = XLSX.read(conteudo, { type: "array", sheetRows: 50 });
      const partes: string[] = [];
      for (const aba of livro.SheetNames.slice(0, 3)) {
        const folha = livro.Sheets[aba];
        if (!folha) continue;
        partes.push(`Planilha: ${aba}\n${XLSX.utils.sheet_to_csv(folha).slice(0, 30000)}`);
      }
      const texto = partes.join("\n").slice(0, 90000);
      return texto.trim()
        ? { texto, metodoLeitura: "Planilha", observacaoLeitura: "Prévia das três primeiras abas, até 50 linhas por aba. Conferir a planilha integralmente." }
        : semLeitura("Planilha sem conteúdo reconhecido. Classifique manualmente.");
    } catch {
      return semLeitura("Não foi possível interpretar a planilha; classifique manualmente.");
    }
  }
  if (/\.(?:ofx|csv|tsv|txt|json|xml|html?|md|log|eml|ret)$/i.test(arquivo.name)) {
    if (arquivo.size > MAX_TEXTO_BYTES) return semLeitura("Arquivo de texto acima de 3 MB: leitura automática não realizada.");
    try {
      const texto = (await arquivo.text()).slice(0, 90000);
      return texto.trim()
        ? { texto, metodoLeitura: "Texto", observacaoLeitura: "Prévia textual para classificar; não constitui conciliação nem lançamento." }
        : semLeitura("Arquivo de texto vazio ou ilegível.");
    } catch { return semLeitura("Não foi possível ler o conteúdo textual."); }
  }
  return semLeitura("Formato selecionado, mas ainda sem leitor automático. O arquivo NÃO foi enviado nem salvo; selecione o departamento e use o módulo correspondente.");
}

function formatarTamanho(bytes: number): string {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CentralDocumentosPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [lendo, setLendo] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [progresso, setProgresso] = useState("");
  const [guardadosNoServidor, setGuardadosNoServidor] = useState<DocumentoGuardado[]>([]);
  const [carregandoCaixa, setCarregandoCaixa] = useState(true);
  const [erroCaixa, setErroCaixa] = useState("");

  useEffect(() => {
    let cancelado = false;
    void carregarCaixaDoServidor().then((registros) => {
      if (!cancelado) setGuardadosNoServidor(registros);
    }).catch((erro: unknown) => {
      if (!cancelado) setErroCaixa(erro instanceof Error ? erro.message : "Não foi possível consultar a caixa.");
    }).finally(() => {
      if (!cancelado) setCarregandoCaixa(false);
    });
    return () => { cancelado = true; };
  }, []);

  async function atualizarCaixa() {
    setCarregandoCaixa(true);
    setErroCaixa("");
    try {
      setGuardadosNoServidor(await carregarCaixaDoServidor());
    } catch (erro) {
      setErroCaixa(erro instanceof Error ? erro.message : "Falha ao atualizar a caixa.");
    } finally {
      setCarregandoCaixa(false);
    }
  }

  async function guardarOriginal(item: Documento) {
    if (lendo || gravando || item.situacao !== "local") return;
    if (!EXTENSOES_GUARDAVEIS.test(item.arquivo.name) || item.arquivo.size < 1 || item.arquivo.size > MAX_CENTRAL_BYTES) {
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d, situacao: "erro", mensagem: "Formato não aceito ou arquivo acima de 20 MB. Nenhum documento foi gravado.",
      } : d));
      return;
    }
    setGravando(true);
    setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
      ...d, situacao: "gravando", mensagem: "Enviando arquivo original ao servidor...",
    } : d));
    try {
      const formulario = new FormData();
      formulario.append("files", item.arquivo, item.arquivo.name);
      const resposta = await fetch("/api/central-documentos", {
        method: "POST", body: formulario, credentials: "same-origin",
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados?.mensagem || `Falha HTTP ${resposta.status}`);
      const resultado = Array.isArray(dados?.resultados) ? dados.resultados[0] : null;
      if (!resultado?.id || !["Guardado", "JaExistia"].includes(resultado.situacao)) {
        throw new Error("O servidor não confirmou o documento. Consulte a caixa antes de tentar novamente.");
      }
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d,
        situacao: resultado.situacao === "JaExistia" ? "duplicado" : "gravado",
        idNoCrm: resultado.id,
        mensagem: resultado.situacao === "JaExistia"
          ? "Original já guardado no servidor; nenhuma nova pendência criada."
          : "Arquivo original guardado no servidor como PendenteRevisao. Nenhum lançamento criado.",
      } : d));
      try {
        setGuardadosNoServidor(await carregarCaixaDoServidor());
        setErroCaixa("");
      } catch {
        setErroCaixa("Arquivo confirmado pelo servidor, mas não foi possível atualizar a lista. Toque em Atualizar caixa.");
      }
    } catch (erro) {
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d, situacao: "erro", mensagem: erro instanceof Error ? erro.message : "Falha ao guardar o original.",
      } : d));
    } finally {
      setGravando(false);
    }
  }

  async function receber(arquivos: FileList | File[]) {
    if (lendo || gravando) return;
    const novosArquivos = Array.from(arquivos);
    if (!novosArquivos.length) return;
    if (novosArquivos.length + documentos.length > MAX_ARQUIVOS) {
      setAviso(`Selecione até ${MAX_ARQUIVOS} documentos por sessão de triagem.`);
      return;
    }
    setAviso("");
    setLendo(true);
    try {
      const existentes = new Set(documentos.map((d) => d.id));
      const novos: Documento[] = [];
      for (const [indice, arquivo] of novosArquivos.entries()) {
        setProgresso(`Analisando ${indice + 1} de ${novosArquivos.length}: ${arquivo.name}`);
        const id = `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
        if (existentes.has(id)) continue;
        existentes.add(id);
        const leitura = await analisarArquivo(arquivo);
        novos.push({
          id, arquivo, texto: leitura.texto,
          metodoLeitura: leitura.metodoLeitura,
          observacaoLeitura: leitura.observacaoLeitura,
          confirmadoComoPedido: false,
          departamento: classificar(arquivo.name, leitura.texto),
          situacao: "local",
          mensagem: "Em triagem local — ainda não gravado no servidor",
        });
      }
      setDocumentos((anteriores) => [...anteriores, ...novos]);
    } finally {
      setLendo(false);
      setProgresso("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function escolher(evento: ChangeEvent<HTMLInputElement>) {
    void receber(evento.target.files ?? []);
  }

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    void receber(evento.dataTransfer.files);
  }

  function alterarDepartamento(id: string, departamento: Departamento) {
    setDocumentos((anteriores) => anteriores.map((item) => item.id === id && item.situacao === "local" ? { ...item, departamento } : item));
  }

  async function guardarPedido(item: Documento) {
    if (lendo || gravando || item.situacao !== "local" || item.departamento !== "Pedido oficial" || !item.confirmadoComoPedido) return;
    if (!/\.pdf$/i.test(item.arquivo.name) || item.arquivo.size < 30 || item.arquivo.size > MAX_PEDIDO_BYTES) {
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d, situacao: "erro", mensagem: "A API atual aceita somente PDFs entre 30 bytes e 12 MB.",
      } : d));
      return;
    }
    setGravando(true);
    setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? { ...d, situacao: "gravando", mensagem: "Enviando ao CRM..." } : d));
    try {
      const formulario = new FormData();
      formulario.append("arquivo", item.arquivo);
      formulario.append("modoPendente", "sim");
      if (item.texto) formulario.append("texto", item.texto);
      formulario.append("alertas", JSON.stringify(["Recebido pela Central de Documentos; pedido e valores exigem conferência antes de vincular a uma venda."]));
      const resposta = await fetch("/api/vendas/importar-pedido", { method: "POST", body: formulario, credentials: "same-origin" });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !dados?.documento?.id) throw new Error(dados?.message || `Falha HTTP ${resposta.status}`);
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d,
        situacao: dados.jaExistia ? "duplicado" : "gravado",
        idNoCrm: dados.documento.id,
        mensagem: dados.jaExistia ? "Documento já cadastrado: nenhuma duplicata criada." : "PDF guardado com status PendenteRevisao. Nenhuma venda foi criada.",
      } : d));
    } catch (erro) {
      setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? {
        ...d, situacao: "erro", mensagem: erro instanceof Error ? erro.message : "Falha ao salvar o pedido.",
      } : d));
    } finally {
      setGravando(false);
    }
  }

  const gravados = documentos.filter((item) => item.situacao === "gravado" || item.situacao === "duplicado").length;
  const naoGravados = documentos.length - gravados;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-700"><Inbox className="h-5 w-5" /> CRM LUIZ SODRÉ REPRESENTAÇÕES</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Central Inteligente de Documentos</h1>
          <p className="mt-1 text-xs font-semibold text-sky-700">ETAPA 3 · Entrada de documentos com armazenamento privado</p>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Entrada única para pedidos, comprovantes, comissões, extratos, contas e documentos de outros departamentos.</p>
        </div>
        <Link href="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Voltar ao painel</Link>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Etapa 3 — Guardar originais sem lançar movimentos.</strong> PDFs, imagens, planilhas e arquivos textuais podem ser analisados e guardados no servidor como <strong>PendenteRevisao</strong>, quando o formato é aceito. Não são criadas vendas, despesas nem conciliações. A sugestão de departamento é feita na sessão e ainda não integra o cadastro permanente; o original e o registro básico permanecem no servidor do CRM. Os importadores existentes continuam disponíveis.</p></div>
      </div>

      <input ref={inputRef} className="hidden" type="file" multiple onChange={escolher} />
      <div role="button" tabIndex={0} onClick={() => !lendo && !gravando && inputRef.current?.click()} onKeyDown={(evento) => { if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); inputRef.current?.click(); } }} onDragOver={(evento) => evento.preventDefault()} onDrop={soltar} className="cursor-pointer rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/60 px-6 py-10 text-center hover:border-sky-500">
        {lendo ? <Loader2 className="mx-auto h-9 w-9 animate-spin text-sky-700" /> : <UploadCloud className="mx-auto h-9 w-9 text-sky-700" />}
        <p className="mt-3 font-semibold text-slate-900">Selecionar vários arquivos ou arrastar para cá</p>
        <p className="mt-1 text-sm text-slate-600">Até 30 por triagem. PDF, imagens, Excel, ODS, OFX, CSV, TXT, XML, JSON e outros arquivos.</p>
        <p className="mt-2 text-xs text-slate-500">No celular, salve o documento no aparelho e use Selecionar arquivos. Após a triagem, toque em Guardar original. Até 20 MB por arquivo e 10 arquivos por envio; cada documento desta tela é guardado individualmente. Nada é lançado automaticamente.</p>
        {progresso && <p role="status" className="mt-3 text-sm font-medium text-sky-800">{progresso}</p>}
      </div>

      {aviso && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{aviso}</p>}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><FolderClock className="h-5 w-5" /> Documentos desta sessão ({documentos.length})</h2>
          <span className="text-sm text-slate-600">{gravados} confirmados pelo servidor · {naoGravados} ainda não guardados</span>
        </div>
        {!documentos.length && <p className="rounded-xl border border-slate-200 p-7 text-center text-sm text-slate-500">Nenhum arquivo selecionado. Adicione documentos para começar a triagem.</p>}
        {documentos.map((item) => {
          const destino = destinos[item.departamento];
          const podeGuardar = item.departamento === "Pedido oficial" && /\.pdf$/i.test(item.arquivo.name) && item.situacao === "local" && item.confirmadoComoPedido;
          const podeGuardarOriginal = item.situacao === "local" && EXTENSOES_GUARDAVEIS.test(item.arquivo.name) && item.arquivo.size > 0 && item.arquivo.size <= MAX_CENTRAL_BYTES;
          return (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="break-all font-medium text-slate-900">{item.arquivo.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatarTamanho(item.arquivo.size)} · {item.arquivo.type || "Formato não informado"} · Leitura: {item.metodoLeitura}</p>
                  </div>
                </div>
                {item.situacao === "local" && <button type="button" aria-label={`Remover ${item.arquivo.name} da triagem`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={() => setDocumentos((anteriores) => anteriores.filter((d) => d.id !== item.id))}><X className="h-4 w-4" /></button>}
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="min-w-56 flex-1 text-xs font-semibold text-slate-600">Departamento sugerido
                  <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={item.departamento} disabled={item.situacao !== "local"} onChange={(evento) => alterarDepartamento(item.id, evento.target.value as Departamento)}>
                    {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                {item.departamento === "Pedido oficial" && item.situacao === "local" && /\.pdf$/i.test(item.arquivo.name) && <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={item.confirmadoComoPedido} onChange={(evento) => setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? { ...d, confirmadoComoPedido: evento.target.checked } : d))} /> Conferi o PDF original: é realmente um pedido comercial (não comprovante nem extrato).</label>}
                {podeGuardarOriginal && <button type="button" disabled={gravando || lendo} onClick={() => void guardarOriginal(item)} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-sky-800">Guardar original na Central</button>}
                {podeGuardar && <button type="button" disabled={gravando || lendo} onClick={() => void guardarPedido(item)} className="rounded-lg border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-800 disabled:opacity-50 hover:bg-sky-50">Importar PDF como pedido pendente (fluxo atual)</button>}
                {item.situacao === "erro" && <button type="button" disabled={gravando || lendo} onClick={() => setDocumentos((anteriores) => anteriores.map((d) => d.id === item.id ? { ...d, situacao: "local", mensagem: "Revise o arquivo e tente guardar novamente." } : d))} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Tentar novamente</button>}
                {destino && <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={destino.url}>{destino.nome}</Link>}
              </div>
              <p className="mt-3 text-xs text-slate-600">{item.observacaoLeitura}</p>
              {item.texto && <details className="mt-2 rounded-lg border border-slate-200 p-3 text-sm"><summary className="cursor-pointer font-medium">Visualizar texto detectado (conferência)</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">{item.texto.slice(0, 3000)}</pre></details>}
              {item.departamento === "Pedido oficial" && <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">Fluxo comercial informado: aprovado pelo cliente e enviado à representada; confirmação oficial da representada ainda depende de documento e validação. Esta informação ainda não foi aplicada a uma venda.</p>}
              <div className="mt-3 flex items-start gap-2 text-sm">
                {item.situacao === "gravado" || item.situacao === "duplicado" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : item.situacao === "gravando" ? <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
                <p className="text-slate-600">{item.mensagem}{item.situacao === "local" && !podeGuardarOriginal ? " — Este formato/tamanho ainda não é aceito pelo armazenamento da Central." : ""}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Inbox className="h-5 w-5" /> Caixa de documentos guardados ({guardadosNoServidor.length})</h2>
          <button type="button" onClick={() => void atualizarCaixa()} disabled={carregandoCaixa || gravando} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">{carregandoCaixa ? "Consultando..." : "Atualizar caixa"}</button>
        </div>
        <p className="text-xs text-slate-600">Estes registros são consultados diretamente no servidor e permanecem listados depois de fechar ou reabrir o CRM. Nesta etapa, a classificação não é registrada no servidor e ainda não há botão para reabrir ou aprovar o original.</p>
        {erroCaixa && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{erroCaixa}</p>}
        {!carregandoCaixa && !erroCaixa && guardadosNoServidor.length === 0 && <p className="text-sm text-slate-500">Nenhum documento guardado nesta caixa até o momento.</p>}
        <ul className="divide-y divide-slate-100">
          {guardadosNoServidor.slice(0, 100).map((registro) => (
            <li key={registro.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <div className="min-w-0">
                <p className="break-all font-medium text-slate-900">{registro.nomeOriginal}</p>
                <p className="text-xs text-slate-500">{new Date(registro.criadoEm).toLocaleString("pt-BR")} · {formatarTamanho(registro.tamanho)} · {registro.origem === "CompartilhamentoAndroid" ? "Android" : "Central"}</p>
              </div>
              <span className="text-xs font-semibold text-amber-800">Pendente de revisão</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Antes de fechar:</strong> somente os arquivos marcados como guardados ou já existentes, com resposta do servidor, têm persistência confirmada. Os demais estão apenas nesta sessão. Nenhum pedido, extrato, comprovante ou despesa gera lançamento automático na Central.
      </div>
    </main>
  );
}
