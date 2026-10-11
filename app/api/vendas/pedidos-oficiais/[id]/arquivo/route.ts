import { stat, realpath, readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { obterSessaoAtual } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function erro(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * GET /api/vendas/pedidos-oficiais/[id]/arquivo
 * GET /api/vendas/pedidos-oficiais/[id]/arquivo?download=1
 * Entrega um PDF armazenado privadamente somente a um usuário autorizado.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const sessao = await obterSessaoAtual();
    if (!sessao) return erro("Sessão expirada. Entre novamente no CRM.", 401);

    const id = (await context.params).id;
    if (!id || id.length > 100 || !/^[\w-]+$/.test(id)) {
      return erro("Identificador do documento inválido.", 400);
    }

    const permissao = await prisma.usuarioPermissao.findUnique({
      where: {
        usuarioId_recurso: { usuarioId: sessao.usuarioId, recurso: "Vendas" },
      },
      select: { ver: true },
    });
    if (permissao?.ver === false || (sessao.perfil === "Preposto" && permissao?.ver !== true)) {
      return erro("Sem permissão para acessar documentos de pedidos oficiais.", 403);
    }

    const documento = await prisma.importacaoDocumentoComercial.findFirst({
      where: {
        id,
        escritorioId: sessao.escritorioId,
        tipoDocumento: "PedidoOficial",
        ...(sessao.perfil === "Preposto"
          ? {
              OR: [
                { importadoPorId: sessao.usuarioId },
                { venda: { responsavelId: sessao.usuarioId } },
                { venda: { criadoPorId: sessao.usuarioId } },
              ],
            }
          : {}),
      },
      select: {
        nomeArquivo: true,
        formatoArquivo: true,
        hashArquivo: true,
        caminhoArquivo: true,
        tamanhoBytes: true,
      },
    });
    if (!documento) return erro("Documento não encontrado ou sem acesso.", 404);
    if (!documento.caminhoArquivo || documento.formatoArquivo.toUpperCase() !== "PDF") {
      return erro("O PDF original não está disponível para este documento.", 404);
    }
    if (!/^[a-f0-9]{64}$/i.test(documento.hashArquivo)) {
      return erro("Referência do arquivo inválida.", 409);
    }

    // A importação grava <sha256>.pdf em storage/private/pedidos-oficiais/<escritorioId>.
    // Não aceita caminhos fora desse diretório, mesmo se o banco contiver um valor incorreto.
    const diretorioPermitido = path.resolve(
      process.cwd(), "storage", "private", "pedidos-oficiais", sessao.escritorioId,
    );
    const arquivoEsperado = path.resolve(diretorioPermitido, `${documento.hashArquivo}.pdf`);
    const arquivoBanco = path.resolve(documento.caminhoArquivo);
    const normalizar = (valor: string) => process.platform === "win32" ? valor.toLowerCase() : valor;
    if (normalizar(arquivoBanco) !== normalizar(arquivoEsperado)) {
      return erro("Referência do PDF não corresponde ao armazenamento protegido.", 409);
    }

    let diretorioReal: string;
    let arquivoReal: string;
    try {
      [diretorioReal, arquivoReal] = await Promise.all([
        realpath(diretorioPermitido),
        realpath(arquivoEsperado),
      ]);
    } catch {
      return erro("O PDF original não foi encontrado no servidor.", 404);
    }
    if (normalizar(path.dirname(arquivoReal)) !== normalizar(diretorioReal)) {
      return erro("Localização do arquivo inválida.", 409);
    }

    const informacoes = await stat(arquivoReal);
    if (!informacoes.isFile() || informacoes.size < 30 || informacoes.size > 12 * 1024 * 1024) {
      return erro("O arquivo original não pode ser disponibilizado.", 409);
    }

    const conteudo = await readFile(arquivoReal);
    if (!conteudo.subarray(0, 1024).includes(Buffer.from("%PDF-"))) {
      return erro("O documento armazenado não parece ser um PDF válido.", 409);
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    const nome = documento.nomeArquivo.replace(/[\r\n\\/"\x00-\x1f\x7f]/g, "_").slice(0, 180);
    const nomePdf = /\.pdf$/i.test(nome) ? nome : `${nome}.pdf`;
    const nomeAscii = nomePdf.replace(/[^a-zA-Z0-9._ -]/g, "_");
    const disposicao = download ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(conteudo), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(conteudo.length),
        "Content-Disposition": `${disposicao}; filename="${nomeAscii}"; filename*=UTF-8''${encodeURIComponent(nomePdf)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    console.error("Falha ao acessar PDF de pedido oficial:", error);
    return erro("Não foi possível disponibilizar o PDF original.", 500);
  }
}