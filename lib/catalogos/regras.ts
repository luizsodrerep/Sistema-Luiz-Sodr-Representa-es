const TIPOS_MIME_PERMITIDOS: Record<
  string,
  readonly string[]
> = {
  pdf: [
    "application/pdf",
  ],

  jpg: [
    "image/jpeg",
  ],

  jpeg: [
    "image/jpeg",
  ],

  png: [
    "image/png",
  ],

  webp: [
    "image/webp",
  ],

  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/octet-stream",
  ],

  xls: [
    "application/vnd.ms-excel",
    "application/octet-stream",
  ],

  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/octet-stream",
  ],

  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/octet-stream",
  ],

  zip: [
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ],
}

export const EXTENSOES_CATALOGO_PERMITIDAS =
  Object.freeze(
    Object.keys(
      TIPOS_MIME_PERMITIDOS
    )
  )

export function limparNomeArquivoCatalogo(
  nomeArquivo: string
) {
  const nome =
    nomeArquivo
      .replace(
        /\\/g,
        "/"
      )
      .split(
        "/"
      )
      .pop()
      ?.trim() ?? ""

  if (
    !nome ||
    nome === "." ||
    nome === ".."
  ) {
    throw new Error(
      "NOME_ARQUIVO_INVALIDO"
    )
  }

  return nome.slice(
    0,
    255
  )
}

export function obterExtensaoCatalogo(
  nomeArquivo: string
) {
  const nome =
    limparNomeArquivoCatalogo(
      nomeArquivo
    )

  const indice =
    nome.lastIndexOf(
      "."
    )

  if (
    indice <= 0 ||
    indice ===
      nome.length - 1
  ) {
    throw new Error(
      "EXTENSAO_AUSENTE"
    )
  }

  const extensao =
    nome
      .slice(
        indice + 1
      )
      .toLowerCase()

  if (
    !EXTENSOES_CATALOGO_PERMITIDAS.includes(
      extensao
    )
  ) {
    throw new Error(
      "EXTENSAO_NAO_PERMITIDA"
    )
  }

  return extensao
}

function comecaCom(
  conteudo: Buffer,
  assinatura: readonly number[]
) {
  if (
    conteudo.length <
    assinatura.length
  ) {
    return false
  }

  return assinatura.every(
    (
      byte,
      indice
    ) =>
      conteudo[indice] ===
      byte
  )
}

function assinaturaCompativel(
  extensao: string,
  conteudo: Buffer
) {
  if (
    extensao === "pdf"
  ) {
    return comecaCom(
      conteudo,
      [
        0x25,
        0x50,
        0x44,
        0x46,
        0x2d,
      ]
    )
  }

  if (
    extensao === "jpg" ||
    extensao === "jpeg"
  ) {
    return comecaCom(
      conteudo,
      [
        0xff,
        0xd8,
        0xff,
      ]
    )
  }

  if (
    extensao === "png"
  ) {
    return comecaCom(
      conteudo,
      [
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ]
    )
  }

  if (
    extensao === "webp"
  ) {
    if (
      conteudo.length < 12
    ) {
      return false
    }

    const riff =
      conteudo
        .subarray(
          0,
          4
        )
        .toString(
          "ascii"
        )

    const webp =
      conteudo
        .subarray(
          8,
          12
        )
        .toString(
          "ascii"
        )

    return (
      riff === "RIFF" &&
      webp === "WEBP"
    )
  }

  if (
    extensao === "xlsx" ||
    extensao === "docx" ||
    extensao === "pptx" ||
    extensao === "zip"
  ) {
    return comecaCom(
      conteudo,
      [
        0x50,
        0x4b,
      ]
    )
  }

  if (
    extensao === "xls"
  ) {
    return comecaCom(
      conteudo,
      [
        0xd0,
        0xcf,
        0x11,
        0xe0,
        0xa1,
        0xb1,
        0x1a,
        0xe1,
      ]
    )
  }

  return false
}

export function validarArquivoCatalogo({
  nomeArquivo,
  tipoMime,
  conteudo,
}: {
  nomeArquivo: string
  tipoMime: string
  conteudo: Buffer
}) {
  const nomeArquivoOriginal =
    limparNomeArquivoCatalogo(
      nomeArquivo
    )

  const extensao =
    obterExtensaoCatalogo(
      nomeArquivoOriginal
    )

  if (
    conteudo.length <= 0
  ) {
    throw new Error(
      "ARQUIVO_VAZIO"
    )
  }

  const mime =
    tipoMime
      .trim()
      .toLowerCase()

  const tiposPermitidos =
    TIPOS_MIME_PERMITIDOS[
      extensao
    ]

  if (
    mime &&
    !tiposPermitidos.includes(
      mime
    )
  ) {
    throw new Error(
      "TIPO_MIME_NAO_PERMITIDO"
    )
  }

  if (
    !assinaturaCompativel(
      extensao,
      conteudo
    )
  ) {
    throw new Error(
      "CONTEUDO_ARQUIVO_INCOMPATIVEL"
    )
  }

  return {
    nomeArquivoOriginal,
    extensao,
    tipoMime:
      mime ||
      "application/octet-stream",
  }
}