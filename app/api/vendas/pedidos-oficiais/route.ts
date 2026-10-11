import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { obterSessaoAtual } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resposta(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * GET /api/vendas/pedidos-oficiais?clienteId=...
 * GET /api/vendas/pedidos-oficiais?representadaId=...
 * GET /api/vendas/pedidos-oficiais?status=PendenteRevisao
 *
 * Consulta somente documentos oficiais. Não cria ou modifica Vendas.
 */
export async function GET(request: NextRequest) {
  try {
    const sessao = await obterSessaoAtual();
    if (!sessao) return resposta("Sessão expirada. Entre novamente no CRM.", 401);

    const permissao = await prisma.usuarioPermissao.findUnique({
      where: {
        usuarioId_recurso: {
          usuarioId: sessao.usuarioId,
          recurso: "Vendas",
        },
      },
      select: { ver: true, escopo: true },
    });

    if (permissao?.ver === false || (sessao.perfil === "Preposto" && permissao?.ver !== true)) {
      return resposta("Sem permissão para consultar pedidos oficiais.", 403);
    }

    const params = request.nextUrl.searchParams;
    const clienteId = params.get("clienteId")?.trim() || null;
    const representadaId = params.get("representadaId")?.trim() || null;
    const status = params.get("status")?.trim() || null;
    const cursor = params.get("cursor")?.trim() || null;

    if (clienteId && (clienteId.length > 100 || !/^[\w-]+$/.test(clienteId))) {
      return resposta("Identificador do cliente inválido.", 400);
    }
    if (representadaId && (representadaId.length > 100 || !/^[\w-]+$/.test(representadaId))) {
      return resposta("Identificador da representada inválido.", 400);
    }
    if (cursor && (cursor.length > 100 || !/^[\w-]+$/.test(cursor))) {
      return resposta("Cursor de paginação inválido.", 400);
    }
    const statusPermitidos = ["PendenteRevisao", "Vinculado", "Divergente", "Ignorado"];
    if (status && !statusPermitidos.includes(status)) {
      return resposta("Status inválido.", 400);
    }

    // Sem filtros de ficha, abre a fila permanente de pendências.
    const statusEfetivo = status || (!clienteId && !representadaId ? "PendenteRevisao" : null);

    const filtros: Prisma.ImportacaoDocumentoComercialWhereInput = {
      escritorioId: sessao.escritorioId,
      tipoDocumento: "PedidoOficial",
      ...(clienteId ? { clienteId } : {}),
      ...(representadaId ? { representadaId } : {}),
      ...(statusEfetivo ? { status: statusEfetivo } : {}),
    };

    // Mantém o escopo restrito de Preposto; documentos sem vínculo comercial
    // somente aparecem ao próprio usuário que os importou.
    if (sessao.perfil === "Preposto") {
      filtros.OR = [
        { importadoPorId: sessao.usuarioId },
        { venda: { responsavelId: sessao.usuarioId } },
        { venda: { criadoPorId: sessao.usuarioId } },
      ];
    }

    const [linhas, total] = await Promise.all([
      prisma.importacaoDocumentoComercial.findMany({
        where: filtros,
        orderBy: [{ importadoEm: "desc" }, { id: "desc" }],
        take: 26,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true,
          nomeArquivo: true,
          numeroPedidoExterno: true,
          status: true,
          dataPedido: true,
          dataEntrega: true,
          valorTotalDocumento: true,
          valorTotalConferido: true,
          condicaoPagamento: true,
          importadoEm: true,
          conferidoEm: true,
          clienteId: true,
          representadaId: true,
          vendaId: true,
          divergencias: true,
          caminhoArquivo: true,
          cliente: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
          representada: { select: { id: true, nome: true } },
        },
      }),
      prisma.importacaoDocumentoComercial.count({ where: filtros }),
    ]);

    const temMais = linhas.length > 25;
    const exibidas = linhas.slice(0, 25);
    const response = NextResponse.json({
      documentos: exibidas.map(({ caminhoArquivo, valorTotalDocumento, valorTotalConferido, ...doc }) => ({
        ...doc,
        possuiPdf: Boolean(caminhoArquivo),
        valorTotalDocumento: valorTotalDocumento?.toString() ?? null,
        valorTotalConferido: valorTotalConferido?.toString() ?? null,
      })),
      total,
      proximoCursor: temMais ? exibidas[exibidas.length - 1]?.id ?? null : null,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("Erro ao consultar pedidos oficiais:", error);
    return resposta("Não foi possível consultar os pedidos oficiais.", 500);
  }
}