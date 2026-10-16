import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import { obterSessaoAtual } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recebimento privado para a Central de Documentos. Nao cria vendas,
// despesas, titulos ou comissoes. Os registros aguardam conferencia.
const MAX_ARQUIVOS = 10;
const MAX_ARQUIVO_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const EXTENSOES = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif",
  ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ofx", ".txt",
  ".xml", ".eml",
]);

type Registro = {
  id: string;
  escritorioId: string;
  usuarioId: string;
  nomeOriginal: string;
  tipo: string;
  tamanho: number;
  sha256: string;
  extensao: string;
  criadoEm: string;
  situacao: "PendenteRevisao";
  origem: "Central" | "CompartilhamentoAndroid";
};

function responder(mensagem: string, status: number) {
  return NextResponse.json({ mensagem }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function diretorio(escritorioId: string) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(escritorioId)) {
    throw new Error("Identificador do escritorio invalido");
  }
  return path.join(process.cwd(), "storage", "private", "central-documentos", escritorioId);
}

function arquivoValido(valor: FormDataEntryValue): valor is File {
  return typeof valor !== "string" &&
    typeof valor.arrayBuffer === "function" &&
    typeof valor.name === "string";
}

function conferirAssinatura(bytes: Buffer, extensao: string): boolean {
  if (bytes.length === 0) return false;
  if (extensao === ".pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if ([".jpg", ".jpeg"].includes(extensao)) return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extensao === ".png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (extensao === ".webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if ([".heic", ".heif"].includes(extensao)) return bytes.subarray(4, 8).toString("ascii") === "ftyp";
  if ([".docx", ".xlsx"].includes(extensao)) return bytes.subarray(0, 2).toString("ascii") === "PK";
  if ([".doc", ".xls"].includes(extensao)) return bytes.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]));
  // Textos nao sao executados nem servidos como conteudo publico.
  return !bytes.includes(0);
}

export async function POST(request: NextRequest) {
  const sessao = await obterSessaoAtual();
  if (!sessao) return responder("Entre no CRM antes de compartilhar arquivos.", 401);

  const tipo = request.headers.get("content-type") || "";
  if (!tipo.toLowerCase().includes("multipart/form-data")) {
    return responder("Envie os documentos como multipart/form-data.", 415);
  }

  const tamanhoDeclarado = Number(request.headers.get("content-length") || "0");
  if (tamanhoDeclarado > MAX_TOTAL_BYTES + 1024 * 1024) {
    return responder("Envio acima de 40 MB. Divida em lotes menores.", 413);
  }

  let campos: FormData;
  try {
    campos = await request.formData();
  } catch {
    return responder("Nao foi possivel ler os arquivos enviados.", 400);
  }

  const arquivos = Array.from(campos.values()).filter(arquivoValido);
  if (arquivos.length < 1 || arquivos.length > MAX_ARQUIVOS) {
    return responder("Compartilhe de 1 a 10 documentos por envio.", 400);
  }

  let total = 0;
  for (const arquivo of arquivos) {
    const extensao = path.extname(arquivo.name).toLowerCase();
    total += arquivo.size;
    if (!EXTENSOES.has(extensao)) {
      return responder(`Formato nao permitido: ${extensao || "sem extensao"}.`, 415);
    }
    if (arquivo.size < 1 || arquivo.size > MAX_ARQUIVO_BYTES) {
      return responder("Cada arquivo deve ter entre 1 byte e 20 MB.", 413);
    }
  }
  if (total > MAX_TOTAL_BYTES) return responder("Envio acima de 40 MB.", 413);

  try {
    const base = diretorio(sessao.escritorioId);
    const pastaArquivos = path.join(base, "arquivos");
    const pastaRegistros = path.join(base, "registros");
    await mkdir(pastaArquivos, { recursive: true });
    await mkdir(pastaRegistros, { recursive: true });

    const resultados: Array<{ id: string; nome: string; situacao: string }> = [];

    for (const arquivo of arquivos) {
      const bytes = Buffer.from(await arquivo.arrayBuffer());
      const extensao = path.extname(arquivo.name).toLowerCase();
      if (!conferirAssinatura(bytes, extensao)) {
        return responder(`O conteudo de ${arquivo.name.slice(0, 100)} nao corresponde ao formato informado.`, 415);
      }

      const hash = createHash("sha256").update(bytes).digest("hex");
      const id = createHash("sha256")
        .update(`${sessao.usuarioId}:${hash}`)
        .digest("hex");
      const caminhoOriginal = path.join(pastaArquivos, hash);
      const caminhoRegistro = path.join(pastaRegistros, `${id}.json`);

      // O mesmo usuario nao gera segunda pendencia para arquivo identico.
      try {
        await readFile(caminhoRegistro);
        resultados.push({ id, nome: arquivo.name, situacao: "JaExistia" });
        continue;
      } catch (erro) {
        if ((erro as NodeJS.ErrnoException).code !== "ENOENT") throw erro;
      }

      // 'wx' impede sobrescrever o original de outro envio.
      try {
        await writeFile(caminhoOriginal, bytes, { flag: "wx" });
      } catch (erro) {
        if ((erro as NodeJS.ErrnoException).code !== "EEXIST") throw erro;
      }

      const registro: Registro = {
        id,
        escritorioId: sessao.escritorioId,
        usuarioId: sessao.usuarioId,
        nomeOriginal: arquivo.name.slice(0, 250),
        tipo: arquivo.type || "application/octet-stream",
        tamanho: arquivo.size,
        sha256: hash,
        extensao,
        criadoEm: new Date().toISOString(),
        situacao: "PendenteRevisao",
        origem: request.nextUrl.searchParams.get("origem") === "android"
          ? "CompartilhamentoAndroid"
          : "Central",
      };

      try {
        await writeFile(caminhoRegistro, JSON.stringify(registro, null, 2), { flag: "wx" });
        resultados.push({ id, nome: arquivo.name, situacao: "Guardado" });
      } catch (erro) {
        if ((erro as NodeJS.ErrnoException).code !== "EEXIST") throw erro;
        resultados.push({ id, nome: arquivo.name, situacao: "JaExistia" });
      }
    }

    // Compartilhar pelo Android abre a Central apos gravar os originais.
    if (request.nextUrl.searchParams.get("origem") === "android") {
      const destino = new URL("/central-documentos", request.url);
      destino.searchParams.set("recebidos", String(resultados.filter(r => r.situacao === "Guardado").length));
      destino.searchParams.set("duplicados", String(resultados.filter(r => r.situacao === "JaExistia").length));
      return NextResponse.redirect(destino, 303);
    }

    return NextResponse.json({ resultados }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (erro) {
    console.error("Falha no recebimento da Central de Documentos:", erro);
    return responder("Falha ao guardar documento. Confira a caixa antes de repetir o envio.", 500);
  }
}

export async function GET() {
  const sessao = await obterSessaoAtual();
  if (!sessao) return responder("Nao autenticado.", 401);

  try {
    const pasta = path.join(diretorio(sessao.escritorioId), "registros");
    let nomes: string[];
    try {
      nomes = await readdir(pasta);
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code === "ENOENT") {
        return NextResponse.json({ documentos: [] }, { headers: { "Cache-Control": "no-store" } });
      }
      throw erro;
    }

    const documentos: Registro[] = [];
    for (const nome of nomes.filter(n => /^[a-f0-9]{64}\.json$/.test(n)).slice(0, 500)) {
      try {
        const registro = JSON.parse(await readFile(path.join(pasta, nome), "utf8")) as Registro;
        if (registro.escritorioId !== sessao.escritorioId) continue;
        if (sessao.perfil === "Preposto" && registro.usuarioId !== sessao.usuarioId) continue;
        documentos.push(registro);
      } catch (erro) {
        console.error("Registro da Central ilegivel:", nome, erro);
      }
    }
    documentos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return NextResponse.json({ documentos }, { headers: { "Cache-Control": "no-store" } });
  } catch (erro) {
    console.error("Falha ao consultar caixa de documentos:", erro);
    return responder("Falha ao consultar documentos pendentes.", 500);
  }
}
