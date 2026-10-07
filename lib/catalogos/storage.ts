import {
  createHash,
  randomUUID,
} from "node:crypto"

import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises"

import path from "node:path"

export const TAMANHO_MAXIMO_CATALOGO_MB =
  300

export const TAMANHO_MAXIMO_CATALOGO_BYTES =
  TAMANHO_MAXIMO_CATALOGO_MB *
  1024 *
  1024

const PASTA_STORAGE =
  path.resolve(
    process.cwd(),
    "storage"
  )

const PASTA_CATALOGOS =
  path.join(
    PASTA_STORAGE,
    "catalogos"
  )

function segmentoSeguro(
  valor: string,
  campo: string
) {
  const limpo =
    valor.trim()

  if (
    !limpo ||
    !/^[A-Za-z0-9_-]+$/.test(
      limpo
    )
  ) {
    throw new Error(
      `SEGMENTO_INVALIDO:${campo}`
    )
  }

  return limpo
}

export function normalizarExtensaoCatalogo(
  extensao: string
) {
  const valor =
    extensao
      .trim()
      .toLowerCase()
      .replace(
        /^\./,
        ""
      )

  if (
    !valor ||
    !/^[a-z0-9]+$/.test(
      valor
    )
  ) {
    throw new Error(
      "EXTENSAO_INVALIDA"
    )
  }

  return valor
}

function caminhoRelativoSeguro(
  caminhoArquivo: string
) {
  const normalizado =
    caminhoArquivo
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      )

  if (
    !normalizado.startsWith(
      "catalogos/"
    ) ||
    normalizado.includes(
      "../"
    ) ||
    normalizado.includes(
      "/.."
    ) ||
    path.isAbsolute(
      normalizado
    )
  ) {
    throw new Error(
      "CAMINHO_CATALOGO_INVALIDO"
    )
  }

  return normalizado
}

export function resolverCaminhoCatalogo(
  caminhoArquivo: string
) {
  const relativo =
    caminhoRelativoSeguro(
      caminhoArquivo
    )

  const absoluto =
    path.resolve(
      PASTA_STORAGE,
      relativo
    )

  const raizComSeparador =
    `${PASTA_CATALOGOS}${path.sep}`

  if (
    absoluto !==
      PASTA_CATALOGOS &&
    !absoluto.startsWith(
      raizComSeparador
    )
  ) {
    throw new Error(
      "CAMINHO_CATALOGO_FORA_DA_STORAGE"
    )
  }

  return absoluto
}

export function calcularHashSha256(
  conteudo: Buffer
) {
  return createHash(
    "sha256"
  )
    .update(
      conteudo
    )
    .digest(
      "hex"
    )
}

export async function gravarArquivoCatalogo({
  escritorioId,
  representadaId,
  extensao,
  conteudo,
}: {
  escritorioId: string
  representadaId: string
  extensao: string
  conteudo: Buffer
}) {
  const escritorio =
    segmentoSeguro(
      escritorioId,
      "escritorioId"
    )

  const representada =
    segmentoSeguro(
      representadaId,
      "representadaId"
    )

  const extensaoSegura =
    normalizarExtensaoCatalogo(
      extensao
    )

  if (
    conteudo.length <= 0
  ) {
    throw new Error(
      "ARQUIVO_VAZIO"
    )
  }

  if (
    conteudo.length >
    TAMANHO_MAXIMO_CATALOGO_BYTES
  ) {
    throw new Error(
      "ARQUIVO_MUITO_GRANDE"
    )
  }

  const pastaRelativa =
    path.posix.join(
      "catalogos",
      escritorio,
      representada
    )

  const pastaAbsoluta =
    resolverCaminhoCatalogo(
      pastaRelativa
    )

  await mkdir(
    pastaAbsoluta,
    {
      recursive: true,
    }
  )

  const nomeArquivoArmazenado =
    `${randomUUID()}.${extensaoSegura}`

  const caminhoArquivo =
    path.posix.join(
      pastaRelativa,
      nomeArquivoArmazenado
    )

  const caminhoAbsoluto =
    resolverCaminhoCatalogo(
      caminhoArquivo
    )

  await writeFile(
    caminhoAbsoluto,
    conteudo,
    {
      flag: "wx",
    }
  )

  return {
    caminhoArquivo,
    nomeArquivoArmazenado,
    tamanhoBytes:
      conteudo.length,
    hashSha256:
      calcularHashSha256(
        conteudo
      ),
  }
}

export async function lerArquivoCatalogo(
  caminhoArquivo: string
) {
  const caminhoAbsoluto =
    resolverCaminhoCatalogo(
      caminhoArquivo
    )

  return readFile(
    caminhoAbsoluto
  )
}

export async function removerArquivoCatalogo(
  caminhoArquivo: string
) {
  const caminhoAbsoluto =
    resolverCaminhoCatalogo(
      caminhoArquivo
    )

  try {
    await unlink(
      caminhoAbsoluto
    )
  } catch (
    error
  ) {
    const codigo =
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error
        ? String(
            (
              error as {
                code?: unknown
              }
            ).code
          )
        : ""

    if (
      codigo !== "ENOENT"
    ) {
      throw error
    }
  }
}