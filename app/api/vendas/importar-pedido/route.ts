import { createHash } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { obterSessaoAtual } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mensagem(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
function texto(v: FormDataEntryValue | null, limite = 300): string | null {
  if (typeof v !== "string") return null;
  return v.trim().slice(0, limite) || null;
}
function numero(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 999999999999 ? Math.round(n * 100) / 100 : null;
}
function data(v: string | null): Date | null {
  if (!v) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 12));
  return d.getUTCDate() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCFullYear() === +m[3] ? d : null;
}

async function autorizar() {
  const sessao = await obterSessaoAtual();
  if (!sessao) return { sessao: null, erro: mensagem("Sessão expirada. Entre novamente no CRM.", 401) };
  const regra = await prisma.usuarioPermissao.findUnique({
    where: { usuarioId_recurso: { usuarioId: sessao.usuarioId, recurso: "Vendas" } },
    select: { criar: true, editar: true },
  });
  if (regra?.criar === false || regra?.editar === false || (sessao.perfil === "Preposto" && regra?.criar !== true)) {
    return { sessao: null, erro: mensagem("Você não possui permissão para importar pedidos oficiais.", 403) };
  }
  return { sessao, erro: null };
}

// Busca filtrada no banco; nunca carrega a lista completa no navegador.
// O identificador de versão permite verificar qual API o servidor está executando.
export async function GET(request: NextRequest) {
  const { sessao, erro } = await autorizar();
  if (!sessao) return erro!;

  const buscaCliente = (request.nextUrl.searchParams.get("cliente") || "").trim().slice(0, 120);
  const buscaRepresentada = (request.nextUrl.searchParams.get("representada") || "").trim().slice(0, 120);
  const digitosCliente = buscaCliente.replace(/\D/g, "");
  const digitosRepresentada = buscaRepresentada.replace(/\D/g, "");

  const [clientes, representadas] = await Promise.all([
    buscaCliente.length >= 2
      ? prisma.cliente.findMany({
          where: {
            escritorioId: sessao.escritorioId,
            OR: [
              { razaoSocial: { contains: buscaCliente, mode: "insensitive" } },
              { nomeFantasia: { contains: buscaCliente, mode: "insensitive" } },
              ...(digitosCliente.length >= 3
                ? [{ cnpj: { contains: digitosCliente, mode: "insensitive" as const } }]
                : []),
            ],
          },
          select: { id: true, razaoSocial: true, nomeFantasia: true, cnpj: true },
          orderBy: [{ razaoSocial: "asc" }, { id: "asc" }],
          take: 20,
        })
      : Promise.resolve([]),
    buscaRepresentada.length >= 2
      ? prisma.representada.findMany({
          where: {
            escritorioId: sessao.escritorioId,
            OR: [
              { nome: { contains: buscaRepresentada, mode: "insensitive" } },
              ...(digitosRepresentada.length >= 3
                ? [{ cnpj: { contains: digitosRepresentada, mode: "insensitive" as const } }]
                : []),
            ],
          },
          select: { id: true, nome: true, cnpj: true },
          orderBy: [{ nome: "asc" }, { id: "asc" }],
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const response = NextResponse.json({
    versaoBusca: "pedidos-clientes-filtrados-v2",
    filtrosAplicados: { cliente: buscaCliente, representada: buscaRepresentada },
    clientes,
    representadas,
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function POST(request: NextRequest) {
  const { sessao, erro } = await autorizar();
  if (!sessao) return erro!;

  let form: FormData;
  try { form = await request.formData(); } catch { return mensagem("Envio inválido.", 400); }
  const anexo = form.get("arquivo");
  if (!(anexo instanceof File)) return mensagem("Selecione o PDF oficial.", 400);
  if (anexo.size < 30 || anexo.size > 12 * 1024 * 1024) return mensagem("Arquivo PDF inválido ou maior que 12 MB.", 400);
  if (!/\.pdf$/i.test(anexo.name)) return mensagem("Somente PDFs são aceitos nesta etapa.", 400);
  const bytes = Buffer.from(await anexo.arrayBuffer());
  if (bytes.subarray(0, 1024).indexOf(Buffer.from("%PDF-")) < 0) return mensagem("O arquivo não parece ser um PDF válido.", 400);

  const hash = createHash("sha256").update(bytes).digest("hex");
  const existente = await prisma.importacaoDocumentoComercial.findUnique({
    where: { escritorioId_hashArquivo: { escritorioId: sessao.escritorioId, hashArquivo: hash } },
    select: { id: true, numeroPedidoExterno: true, status: true },
  });
  if (existente) return NextResponse.json({ jaExistia: true, documento: existente });

  const pedido = texto(form.get("numeroPedido"), 80);
  const representadaNome = texto(form.get("representada"), 150);
  const clienteNome = texto(form.get("cliente"), 250);
  const cnpj = texto(form.get("cnpj"), 30);
  const valor = numero(texto(form.get("valor"), 40));
  const dataPedido = data(texto(form.get("data"), 12));
  const dataEntrega = data(texto(form.get("entrega"), 12));
  const condicaoPagamento = texto(form.get("condicao"), 250);
  const textoExtraido = texto(form.get("texto"), 100000);
  // O lote pode preservar um documento incompleto para conferência posterior.
  // No fluxo individual já existente, todas as informações continuam obrigatórias.
  const modoPendente = texto(form.get("modoPendente"), 10) === "sim";
  if (!modoPendente && (!pedido || !representadaNome || !clienteNome || !valor)) {
    return mensagem("Confira número, representada, cliente e valor positivo antes de salvar.", 400);
  }

  // IDs podem ficar vazios SOMENTE no recebimento pendente do lote.
  // Se vierem preenchidos, a API sempre confere o escritório.
  const representadaId = texto(form.get("representadaId"), 80);
  const clienteId = texto(form.get("clienteId"), 80);
  if (!modoPendente && (!representadaId || !clienteId)) {
    return mensagem("Confirme o cliente e a representada cadastrados antes de salvar.", 400);
  }
  const [representadaCadastro, clienteCadastro] = await Promise.all([
    representadaId
      ? prisma.representada.findFirst({ where: { id: representadaId, escritorioId: sessao.escritorioId }, select: { id: true, nome: true } })
      : Promise.resolve(null),
    clienteId
      ? prisma.cliente.findFirst({ where: { id: clienteId, escritorioId: sessao.escritorioId }, select: { id: true, razaoSocial: true } })
      : Promise.resolve(null),
  ]);
  if ((representadaId && !representadaCadastro) || (clienteId && !clienteCadastro)) {
    return mensagem("Cliente ou representada não encontrados neste escritório. Revise a seleção.", 400);
  }
  const pendencias: string[] = [];
  if (!pedido) pendencias.push("Número do pedido não identificado");
  if (!representadaId) pendencias.push("Representada pendente de seleção");
  if (!clienteId) pendencias.push("Cliente pendente de seleção");
  if (!valor) pendencias.push("Valor total pendente de conferência");
  if (!representadaNome) pendencias.push("Nome da representada não extraído");
  if (!clienteNome) pendencias.push("Nome do cliente não extraído");
  const alertasLeitura = texto(form.get("alertas"), 4000);
  if (alertasLeitura) {
    try {
      const avisos = JSON.parse(alertasLeitura) as unknown;
      if (Array.isArray(avisos)) {
        for (const aviso of avisos.slice(0, 15)) {
          if (typeof aviso === "string" && aviso.trim()) pendencias.push(aviso.trim().slice(0, 300));
        }
      }
    } catch { pendencias.push("Alertas de leitura não puderam ser interpretados"); }
  }
  const possiveisVendas = pedido && representadaId && clienteId
    ? await prisma.venda.findMany({
        where: {
          escritorioId: sessao.escritorioId, representadaId, clienteId,
          OR: [{ numeroPedidoRepresentada: pedido }, { numeroPedido: pedido }],
        },
        select: { id: true, numeroSequencial: true }, take: 3,
      })
    : [];
  const numeroJaImportado = pedido && representadaId
    ? await prisma.importacaoDocumentoComercial.findFirst({
        where: { escritorioId: sessao.escritorioId, representadaId, numeroPedidoExterno: pedido },
        select: { id: true },
      })
    : null;
  if (numeroJaImportado) {
    return mensagem("Este número de pedido já possui documento importado nesta representada. Confira o histórico antes de continuar.", 409);
  }
  const diretorio = path.join(process.cwd(), "storage", "private", "pedidos-oficiais", sessao.escritorioId);
  const caminho = path.join(diretorio, `${hash}.pdf`);
  let arquivoCriado = false;
  try {
    await mkdir(diretorio, { recursive: true });
    await writeFile(caminho, bytes, { flag: "wx" });
    arquivoCriado = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") return mensagem("Não foi possível guardar o PDF no armazenamento protegido.", 500);
  }
  try {
    const documento = await prisma.$transaction(async (tx) => {
      const criado = await tx.importacaoDocumentoComercial.create({
        data: {
          escritorioId: sessao.escritorioId, importadoPorId: sessao.usuarioId,
          nomeArquivo: path.basename(anexo.name).slice(0, 240), formatoArquivo: "PDF",
          hashArquivo: hash, caminhoArquivo: caminho, tamanhoBytes: bytes.length,
          numeroPedidoExterno: pedido, dataPedido, dataEntrega, condicaoPagamento,
          valorTotalDocumento: valor === null ? null : new Prisma.Decimal(valor.toFixed(2)),
          status: "PendenteRevisao", representadaId, clienteId,
          vendaId: null,
          dadosExtraidos: { representadaNome, clienteNome, cnpj, clienteCadastro: clienteCadastro?.razaoSocial || null, representadaCadastro: representadaCadastro?.nome || null, texto: textoExtraido || "", origem: "Upload manual (WhatsApp)" },
          divergencias: {
            pendencias,
            requerValidacao: modoPendente || pendencias.length > 0 || possiveisVendas.length > 0,
            candidatosVenda: possiveisVendas.map((v) => v.id),
          },
        },
        select: { id: true, numeroPedidoExterno: true, status: true, vendaId: true },
      });
      await tx.auditoria.create({ data: {
        escritorioId: sessao.escritorioId, usuarioId: sessao.usuarioId,
        entidade: "ImportacaoDocumentoComercial", entidadeId: criado.id,
        acao: "IMPORTAR_PDF_PEDIDO", dadosDepois: {
          hashArquivo: hash, pedido, valor, representadaId, clienteId, representadaNome, clienteNome, vendaId: null, modoPendente, pendencias,
        },
      } });
      return criado;
    });
    return NextResponse.json({ jaExistia: false, documento, pendencias }, { status: 201 });
  } catch (error) {
    if (arquivoCriado) await unlink(caminho).catch(() => undefined);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return mensagem("Esse PDF já foi importado. Não foi criado outro registro.", 409);
    }
    console.error("Falha ao salvar documento comercial:", error);
    return mensagem("Falha ao salvar o pedido. Nenhuma venda foi criada.", 500);
  }
}