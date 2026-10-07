import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  prisma,
} from "@/lib/prisma"

import {
  calcularHashSha256,
  lerArquivoCatalogo,
} from "@/lib/catalogos/storage"

export const runtime =
  "nodejs"

function nomeArquivoCabecalho(
  nomeArquivo: string
) {
  const fallback =
    nomeArquivo
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^A-Za-z0-9._ -]/g,
        "_"
      )
      .replace(
        /"/g,
        ""
      )
      .trim() ||
    "catalogo"

  return {
    fallback:
      fallback.slice(
        0,
        180
      ),

    utf8:
      encodeURIComponent(
        nomeArquivo
      ),
  }
}

function codigoErroArquivo(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (
        error as {
          code?: unknown
        }
      ).code
    )
  }

  return ""
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const sessao =
      await exigirSessao()

    const {
      id,
    } =
      await params

    if (
      !id?.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Catálogo inválido.",
        },
        {
          status: 400,
        }
      )
    }

    const catalogo =
      await prisma.catalogo.findFirst(
        {
          where: {
            id:
              id.trim(),

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,

            nomeArquivoOriginal:
              true,

            caminhoArquivo:
              true,

            tipoMime:
              true,

            tamanhoBytes:
              true,

            hashSha256:
              true,

            status:
              true,
          },
        }
      )

    if (
      !catalogo
    ) {
      return NextResponse.json(
        {
          message:
            "Catálogo não encontrado.",
        },
        {
          status: 404,
        }
      )
    }

    let conteudo:
      Buffer

    try {
      conteudo =
        await lerArquivoCatalogo(
          catalogo.caminhoArquivo
        )
    } catch (
      error
    ) {
      if (
        codigoErroArquivo(
          error
        ) === "ENOENT"
      ) {
        console.error(
          "Arquivo físico do catálogo não localizado:",
          {
            catalogoId:
              catalogo.id,
          }
        )

        return NextResponse.json(
          {
            message:
              "O registro do catálogo existe, mas o arquivo físico não foi localizado.",
          },
          {
            status: 404,
          }
        )
      }

      throw error
    }

    if (
      conteudo.length !==
      catalogo.tamanhoBytes
    ) {
      console.error(
        "Tamanho físico divergente no catálogo:",
        {
          catalogoId:
            catalogo.id,

          esperado:
            catalogo.tamanhoBytes,

          encontrado:
            conteudo.length,
        }
      )

      return NextResponse.json(
        {
          message:
            "O arquivo do catálogo apresentou divergência de integridade.",
        },
        {
          status: 409,
        }
      )
    }

    if (
      catalogo.hashSha256
    ) {
      const hashAtual =
        calcularHashSha256(
          conteudo
        )

      if (
        hashAtual !==
        catalogo.hashSha256
      ) {
        console.error(
          "SHA-256 divergente no catálogo:",
          {
            catalogoId:
              catalogo.id,
          }
        )

        return NextResponse.json(
          {
            message:
              "O arquivo do catálogo apresentou divergência de integridade.",
          },
          {
            status: 409,
          }
        )
      }
    }

    const url =
      new URL(
        request.url
      )

    const forcarDownload =
      url.searchParams.get(
        "download"
      ) === "1"

    const nome =
      nomeArquivoCabecalho(
        catalogo.nomeArquivoOriginal
      )

    const disposicao =
      forcarDownload
        ? "attachment"
        : "inline"

    return new Response(
      new Uint8Array(
        conteudo
      ),
      {
        status: 200,

        headers: {
          "Content-Type":
            catalogo.tipoMime ||
            "application/octet-stream",

          "Content-Length":
            String(
              conteudo.length
            ),

          "Content-Disposition":
            `${disposicao}; filename="${nome.fallback}"; filename*=UTF-8''${nome.utf8}`,

          "X-Content-Type-Options":
            "nosniff",

          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    )
  } catch (
    error
  ) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autenticado.",
        },
        {
          status: 401,
        }
      )
    }

    console.error(
      "Erro ao abrir arquivo do catálogo:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao abrir arquivo do catálogo.",
      },
      {
        status: 500,
      }
    )
  }
}