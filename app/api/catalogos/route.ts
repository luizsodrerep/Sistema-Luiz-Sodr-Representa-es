import path from "node:path"

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
  gravarArquivoCatalogo,
  removerArquivoCatalogo,
  TAMANHO_MAXIMO_CATALOGO_BYTES,
  TAMANHO_MAXIMO_CATALOGO_MB,
} from "@/lib/catalogos/storage"

import {
  validarArquivoCatalogo,
} from "@/lib/catalogos/regras"

export const runtime =
  "nodejs"

const MENSAGEM_ARQUIVO_MUITO_GRANDE =
  `Arquivo superior a ${TAMANHO_MAXIMO_CATALOGO_MB} MB. Compacte o arquivo e tente novamente ou solicite uma versão otimizada do catálogo à Representada.`

function textoOpcional(
  valor: FormDataEntryValue | null
) {
  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto || null
}

function numeroInteiroPositivo(
  valor: string | null,
  padrao: number
) {
  if (!valor) {
    return padrao
  }

  const numero =
    Number.parseInt(
      valor,
      10
    )

  if (
    !Number.isInteger(
      numero
    ) ||
    numero <= 0
  ) {
    return padrao
  }

  return numero
}

function dataOpcional(
  valor: FormDataEntryValue | null
) {
  const texto =
    textoOpcional(
      valor
    )

  if (!texto) {
    return null
  }

  const data =
    new Date(
      `${texto}T12:00:00`
    )

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    throw new Error(
      "DATA_REFERENCIA_INVALIDA"
    )
  }

  return data
}

function nomePadraoCatalogo(
  nomeArquivo: string
) {
  const extensao =
    path.extname(
      nomeArquivo
    )

  const nome =
    path
      .basename(
        nomeArquivo,
        extensao
      )
      .trim()

  return (
    nome ||
    "Catálogo"
  ).slice(
    0,
    160
  )
}

function respostaNaoAutenticado() {
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

export async function GET(
  request: Request
) {
  try {
    const sessao =
      await exigirSessao()

    const url =
      new URL(
        request.url
      )

    const busca =
      url.searchParams
        .get(
          "busca"
        )
        ?.trim() ?? ""

    const representadaId =
      url.searchParams
        .get(
          "representadaId"
        )
        ?.trim() ?? ""

    const statusSolicitado =
      url.searchParams
        .get(
          "status"
        )
        ?.trim() ?? "Ativo"

    const pagina =
      numeroInteiroPositivo(
        url.searchParams.get(
          "pagina"
        ),
        1
      )

    const limiteSolicitado =
      numeroInteiroPositivo(
        url.searchParams.get(
          "limite"
        ),
        20
      )

    const limite =
      Math.min(
        limiteSolicitado,
        50
      )

    const where = {
      escritorioId:
        sessao.escritorioId,

      ...(representadaId
        ? {
            representadaId,
          }
        : {}),

      ...(statusSolicitado &&
      statusSolicitado !==
        "todos"
        ? {
            status:
              statusSolicitado,
          }
        : {}),

      ...(busca
        ? {
            OR: [
              {
                nome: {
                  contains:
                    busca,
                  mode:
                    "insensitive" as const,
                },
              },
              {
                descricao: {
                  contains:
                    busca,
                  mode:
                    "insensitive" as const,
                },
              },
              {
                nomeArquivoOriginal: {
                  contains:
                    busca,
                  mode:
                    "insensitive" as const,
                },
              },
              {
                versao: {
                  contains:
                    busca,
                  mode:
                    "insensitive" as const,
                },
              },
              {
                representada: {
                  nome: {
                    contains:
                      busca,
                    mode:
                      "insensitive" as const,
                  },
                },
              },
              {
                representada: {
                  codigo: {
                    contains:
                      busca,
                    mode:
                      "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    }

    const [
      total,
      dados,
    ] =
      await Promise.all([
        prisma.catalogo.count(
          {
            where,
          }
        ),

        prisma.catalogo.findMany(
          {
            where,

            orderBy: [
              {
                criadoEm:
                  "desc",
              },
              {
                nome:
                  "asc",
              },
            ],

            skip:
              (pagina - 1) *
              limite,

            take:
              limite,

            select: {
              id: true,
              nome: true,
              descricao: true,

              nomeArquivoOriginal:
                true,

              tipoMime: true,
              extensao: true,
              tamanhoBytes: true,

              versao: true,

              dataReferencia:
                true,

              origem: true,
              status: true,

              arquivadoEm:
                true,

              observacoes: true,

              criadoEm: true,
              atualizadoEm:
                true,

              representada: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                  status: true,
                },
              },

              criadoPor: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          }
        ),
      ])

    const totalPaginas =
      total === 0
        ? 1
        : Math.ceil(
            total /
              limite
          )

    return NextResponse.json(
      {
        dados,

        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas,
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
      return respostaNaoAutenticado()
    }

    console.error(
      "Erro ao listar catálogos:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar catálogos.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: Request
) {
  let caminhoGravado:
    string | null =
    null

  try {
    const sessao =
      await exigirSessao()

    if (
      sessao.perfil ===
      "Preposto"
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para cadastrar catálogos.",
        },
        {
          status: 403,
        }
      )
    }

    const formData =
      await request.formData()

    const representadaId =
      textoOpcional(
        formData.get(
          "representadaId"
        )
      )

    if (
      !representadaId
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione a Representada do catálogo.",
        },
        {
          status: 400,
        }
      )
    }

    const representada =
      await prisma.representada.findFirst(
        {
          where: {
            id:
              representadaId,

            escritorioId:
              sessao.escritorioId,
          },

          select: {
            id: true,
            nome: true,
            status: true,
          },
        }
      )

    if (
      !representada
    ) {
      return NextResponse.json(
        {
          message:
            "Representada não encontrada neste escritório.",
        },
        {
          status: 404,
        }
      )
    }

    const entradaArquivo =
      formData.get(
        "arquivo"
      )

    if (
      !entradaArquivo ||
      typeof entradaArquivo ===
        "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione um arquivo para o catálogo.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      entradaArquivo.size <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "O arquivo selecionado está vazio.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      entradaArquivo.size >
      TAMANHO_MAXIMO_CATALOGO_BYTES
    ) {
      return NextResponse.json(
        {
          message:
            MENSAGEM_ARQUIVO_MUITO_GRANDE,
        },
        {
          status: 413,
        }
      )
    }

    const conteudo =
      Buffer.from(
        await entradaArquivo.arrayBuffer()
      )

    const validado =
      validarArquivoCatalogo(
        {
          nomeArquivo:
            entradaArquivo.name,

          tipoMime:
            entradaArquivo.type,

          conteudo,
        }
      )

    const hashSha256 =
      calcularHashSha256(
        conteudo
      )

    const existente =
      await prisma.catalogo.findFirst(
        {
          where: {
            escritorioId:
              sessao.escritorioId,

            representadaId:
              representada.id,

            hashSha256,
          },

          select: {
            id: true,
            nome: true,

            nomeArquivoOriginal:
              true,

            status: true,
          },
        }
      )

    if (
      existente
    ) {
      return NextResponse.json(
        {
          message:
            `Este mesmo arquivo já está cadastrado para ${representada.nome}.`,

          catalogoExistente:
            existente,
        },
        {
          status: 409,
        }
      )
    }

    const nomeInformado =
      textoOpcional(
        formData.get(
          "nome"
        )
      )

    const nome =
      (
        nomeInformado ||
        nomePadraoCatalogo(
          validado.nomeArquivoOriginal
        )
      ).slice(
        0,
        160
      )

    const descricao =
      textoOpcional(
        formData.get(
          "descricao"
        )
      )

    const versao =
      textoOpcional(
        formData.get(
          "versao"
        )
      )

    const origem =
      textoOpcional(
        formData.get(
          "origem"
        )
      ) ||
      "Upload manual"

    const observacoes =
      textoOpcional(
        formData.get(
          "observacoes"
        )
      )

    const dataReferencia =
      dataOpcional(
        formData.get(
          "dataReferencia"
        )
      )

    const arquivoGravado =
      await gravarArquivoCatalogo(
        {
          escritorioId:
            sessao.escritorioId,

          representadaId:
            representada.id,

          extensao:
            validado.extensao,

          conteudo,
        }
      )

    caminhoGravado =
      arquivoGravado.caminhoArquivo

    const catalogo =
      await prisma.catalogo.create(
        {
          data: {
            escritorioId:
              sessao.escritorioId,

            representadaId:
              representada.id,

            criadoPorId:
              sessao.usuarioId,

            nome,
            descricao,

            nomeArquivoOriginal:
              validado.nomeArquivoOriginal,

            caminhoArquivo:
              arquivoGravado.caminhoArquivo,

            tipoMime:
              validado.tipoMime,

            extensao:
              validado.extensao,

            tamanhoBytes:
              arquivoGravado.tamanhoBytes,

            hashSha256:
              arquivoGravado.hashSha256,

            versao,
            dataReferencia,
            origem,

            status:
              "Ativo",

            observacoes,
          },

          select: {
            id: true,
            nome: true,
            descricao: true,

            nomeArquivoOriginal:
              true,

            tipoMime: true,
            extensao: true,
            tamanhoBytes: true,

            versao: true,

            dataReferencia:
              true,

            origem: true,
            status: true,

            criadoEm: true,

            representada: {
              select: {
                id: true,
                codigo: true,
                nome: true,
              },
            },

            criadoPor: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        }
      )

    return NextResponse.json(
      {
        message:
          "Catálogo cadastrado com sucesso.",

        catalogo,
      },
      {
        status: 201,
      }
    )
  } catch (
    error
  ) {
    if (
      caminhoGravado
    ) {
      try {
        await removerArquivoCatalogo(
          caminhoGravado
        )
      } catch (
        erroRemocao
      ) {
        console.error(
          "Falha ao remover arquivo após erro no cadastro do catálogo:",
          erroRemocao
        )
      }
    }

    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return respostaNaoAutenticado()
    }

    if (
      error instanceof Error
    ) {
      const errosArquivo =
        new Set([
          "NOME_ARQUIVO_INVALIDO",
          "EXTENSAO_AUSENTE",
          "EXTENSAO_NAO_PERMITIDA",
          "TIPO_MIME_NAO_PERMITIDO",
          "CONTEUDO_ARQUIVO_INCOMPATIVEL",
          "EXTENSAO_INVALIDA",
          "ARQUIVO_VAZIO",
          "DATA_REFERENCIA_INVALIDA",
        ])

      if (
        errosArquivo.has(
          error.message
        )
      ) {
        const mensagens: Record<
          string,
          string
        > = {
          NOME_ARQUIVO_INVALIDO:
            "Nome do arquivo inválido.",

          EXTENSAO_AUSENTE:
            "O arquivo precisa possuir uma extensão.",

          EXTENSAO_NAO_PERMITIDA:
            "Formato não permitido. Utilize PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, DOCX, PPTX ou ZIP.",

          TIPO_MIME_NAO_PERMITIDO:
            "O tipo informado pelo arquivo não corresponde a um formato permitido.",

          CONTEUDO_ARQUIVO_INCOMPATIVEL:
            "O conteúdo do arquivo não corresponde à extensão informada.",

          EXTENSAO_INVALIDA:
            "Extensão do arquivo inválida.",

          ARQUIVO_VAZIO:
            "O arquivo selecionado está vazio.",

          DATA_REFERENCIA_INVALIDA:
            "A data de referência informada é inválida.",
        }

        return NextResponse.json(
          {
            message:
              mensagens[
                error.message
              ] ||
              "Arquivo inválido.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        error.message ===
        "ARQUIVO_MUITO_GRANDE"
      ) {
        return NextResponse.json(
          {
            message:
              MENSAGEM_ARQUIVO_MUITO_GRANDE,
          },
          {
            status: 413,
          }
        )
      }
    }

    console.error(
      "Erro ao cadastrar catálogo:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao cadastrar catálogo.",
      },
      {
        status: 500,
      }
    )
  }
}