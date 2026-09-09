import {
  Prisma,
} from "@prisma/client"

import {
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"

import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"

import {
  prisma,
} from "@/lib/prisma"

type PerfilUsuarioEditavel =
  | "Diretor"
  | "Administrativo"
  | "Preposto"

const USUARIO_SELECT = {
  id: true,
  nome: true,
  email: true,
  login: true,
  perfil: true,
  ativo: true,

  regiaoAtuacao: true,
  cargo: true,
  departamento: true,
  telefone: true,
  tipoVinculo: true,

  ultimoAcessoEm: true,
  observacoes: true,

  criadoEm: true,
  atualizadoEm: true,

  permissoes: {
    orderBy: {
      recurso: "asc",
    },

    select: {
      id: true,
      recurso: true,
      ver: true,
      criar: true,
      editar: true,
      excluir: true,
      administrar: true,
      escopo: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  },
} satisfies Prisma.UsuarioSelect

function possuiCampo(
  objeto: Record<string, unknown>,
  campo: string
): boolean {
  return Object.prototype.hasOwnProperty.call(
    objeto,
    campo
  )
}

function textoObrigatorio(
  valor: unknown
): string | null {
  if (
    typeof valor !== "string" ||
    valor.trim() === ""
  ) {
    return null
  }

  return valor.trim()
}

function textoOpcional(
  valor: unknown
): string | null {
  if (
    valor === null ||
    valor === undefined
  ) {
    return null
  }

  if (
    typeof valor !== "string"
  ) {
    return null
  }

  const texto =
    valor.trim()

  return texto === ""
    ? null
    : texto
}

function emailValido(
  valor: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
  )
}

function perfilValido(
  valor: unknown
): valor is PerfilUsuarioEditavel {
  return (
    valor === "Diretor" ||
    valor === "Administrativo" ||
    valor === "Preposto"
  )
}

function dadosAuditoriaUsuario(
  usuario: {
    id: string
    nome: string
    email: string
    login: string | null
    perfil: string
    ativo: boolean
    regiaoAtuacao: string | null
    cargo: string | null
    departamento: string | null
    telefone: string | null
    tipoVinculo: string | null
    observacoes: string | null
  }
) {
  return {
    id:
      usuario.id,

    nome:
      usuario.nome,

    email:
      usuario.email,

    login:
      usuario.login,

    perfil:
      usuario.perfil,

    ativo:
      usuario.ativo,

    regiaoAtuacao:
      usuario.regiaoAtuacao,

    cargo:
      usuario.cargo,

    departamento:
      usuario.departamento,

    telefone:
      usuario.telefone,

    tipoVinculo:
      usuario.tipoVinculo,

    observacoes:
      usuario.observacoes,
  }
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
  _request: Request,
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

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "usuarios",
        "ver"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para visualizar usuários.",
        },
        {
          status: 403,
        }
      )
    }

    const {
      id,
    } =
      await params

    const usuario =
      await prisma.usuario.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },

        select:
          USUARIO_SELECT,
      })

    if (!usuario) {
      return NextResponse.json(
        {
          message:
            "Usuário não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json(
      usuario,
      {
        status: 200,
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return respostaNaoAutenticado()
    }

    console.error(
      "Erro ao buscar usuário:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao buscar usuário.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function PATCH(
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

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "usuarios",
        "editar"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para editar usuários.",
        },
        {
          status: 403,
        }
      )
    }

    const {
      id,
    } =
      await params

    let body:
      | Record<string, unknown>
      | null = null

    try {
      const recebido =
        await request.json()

      if (
        recebido &&
        typeof recebido ===
          "object" &&
        !Array.isArray(
          recebido
        )
      ) {
        body =
          recebido as Record<
            string,
            unknown
          >
      }
    } catch {
      body = null
    }

    if (!body) {
      return NextResponse.json(
        {
          message:
            "Dados de atualização inválidos.",
        },
        {
          status: 400,
        }
      )
    }

    const usuarioAtual =
      await prisma.usuario.findFirst({
        where: {
          id,

          escritorioId:
            sessao.escritorioId,
        },

        select: {
          id: true,
          nome: true,
          email: true,
          login: true,
          perfil: true,
          ativo: true,
          regiaoAtuacao: true,
          cargo: true,
          departamento: true,
          telefone: true,
          tipoVinculo: true,
          observacoes: true,
        },
      })

    if (!usuarioAtual) {
      return NextResponse.json(
        {
          message:
            "Usuário não encontrado ou sem permissão de acesso.",
        },
        {
          status: 404,
        }
      )
    }

    const dados:
      Prisma.UsuarioUncheckedUpdateInput =
        {}

    if (
      possuiCampo(
        body,
        "nome"
      )
    ) {
      const nome =
        textoObrigatorio(
          body.nome
        )

      if (!nome) {
        return NextResponse.json(
          {
            message:
              "Nome do usuário é obrigatório.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        nome !==
        usuarioAtual.nome
      ) {
        dados.nome =
          nome
      }
    }

    if (
      possuiCampo(
        body,
        "email"
      )
    ) {
      const email =
        textoObrigatorio(
          body.email
        )

      if (
        !email ||
        !emailValido(email)
      ) {
        return NextResponse.json(
          {
            message:
              "Informe um e-mail válido.",
          },
          {
            status: 400,
          }
        )
      }

      const emailNormalizado =
        email.toLowerCase()

      if (
        emailNormalizado !==
        usuarioAtual.email.toLowerCase()
      ) {
        dados.email =
          emailNormalizado
      }
    }

    if (
      possuiCampo(
        body,
        "login"
      )
    ) {
      const login =
        textoObrigatorio(
          body.login
        )

      if (!login) {
        return NextResponse.json(
          {
            message:
              "Login do usuário é obrigatório.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        login !==
        usuarioAtual.login
      ) {
        dados.login =
          login
      }
    }

    if (
      possuiCampo(
        body,
        "perfil"
      )
    ) {
      const perfil =
        body.perfil

      if (
        !perfilValido(
          perfil
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Perfil inválido. Utilize Diretor, Administrativo ou Preposto.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        usuarioAtual.id ===
          sessao.usuarioId &&
        perfil !==
          usuarioAtual.perfil
      ) {
        return NextResponse.json(
          {
            message:
              "Não é permitido alterar o próprio perfil por esta operação.",
          },
          {
            status: 409,
          }
        )
      }

      if (
        perfil !==
        usuarioAtual.perfil
      ) {
        dados.perfil =
          perfil
      }
    }

    if (
      possuiCampo(
        body,
        "ativo"
      )
    ) {
      if (
        typeof body.ativo !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            message:
              "Status ativo inválido.",
          },
          {
            status: 400,
          }
        )
      }

      if (
        usuarioAtual.id ===
          sessao.usuarioId &&
        body.ativo ===
          false
      ) {
        return NextResponse.json(
          {
            message:
              "Não é permitido desativar o próprio usuário.",
          },
          {
            status: 409,
          }
        )
      }

      if (
        body.ativo !==
        usuarioAtual.ativo
      ) {
        dados.ativo =
          body.ativo
      }
    }

    const camposOpcionais:
      Array<{
        campo:
          | "regiaoAtuacao"
          | "cargo"
          | "departamento"
          | "telefone"
          | "tipoVinculo"
          | "observacoes"
        valorAtual:
          string | null
      }> = [
        {
          campo:
            "regiaoAtuacao",
          valorAtual:
            usuarioAtual.regiaoAtuacao,
        },
        {
          campo:
            "cargo",
          valorAtual:
            usuarioAtual.cargo,
        },
        {
          campo:
            "departamento",
          valorAtual:
            usuarioAtual.departamento,
        },
        {
          campo:
            "telefone",
          valorAtual:
            usuarioAtual.telefone,
        },
        {
          campo:
            "tipoVinculo",
          valorAtual:
            usuarioAtual.tipoVinculo,
        },
        {
          campo:
            "observacoes",
          valorAtual:
            usuarioAtual.observacoes,
        },
      ]

    for (
      const item of
      camposOpcionais
    ) {
      if (
        !possuiCampo(
          body,
          item.campo
        )
      ) {
        continue
      }

      const novoValor =
        textoOpcional(
          body[item.campo]
        )

      if (
        novoValor !==
        item.valorAtual
      ) {
        dados[item.campo] =
          novoValor
      }
    }

    const perfilFinal =
      typeof dados.perfil ===
        "string"
        ? dados.perfil
        : usuarioAtual.perfil

    const ativoFinal =
      typeof dados.ativo ===
        "boolean"
        ? dados.ativo
        : usuarioAtual.ativo

    if (
      usuarioAtual.perfil ===
        "Diretor" &&
      usuarioAtual.ativo &&
      (
        perfilFinal !==
          "Diretor" ||
        !ativoFinal
      )
    ) {
      const outrosDiretoresAtivos =
        await prisma.usuario.count({
          where: {
            escritorioId:
              sessao.escritorioId,

            perfil:
              "Diretor",

            ativo:
              true,

            id: {
              not:
                usuarioAtual.id,
            },
          },
        })

      if (
        outrosDiretoresAtivos ===
        0
      ) {
        return NextResponse.json(
          {
            message:
              "A operação foi bloqueada porque o escritório precisa manter pelo menos um Diretor ativo.",
          },
          {
            status: 409,
          }
        )
      }
    }

    const verificacoesDuplicidade:
      Prisma.UsuarioWhereInput[] =
        []

    if (
      typeof dados.email ===
        "string"
    ) {
      verificacoesDuplicidade.push({
        email: {
          equals:
            dados.email,
          mode:
            "insensitive",
        },
      })
    }

    if (
      typeof dados.login ===
        "string"
    ) {
      verificacoesDuplicidade.push({
        login: {
          equals:
            dados.login,
          mode:
            "insensitive",
        },
      })
    }

    if (
      verificacoesDuplicidade.length >
      0
    ) {
      const duplicado =
        await prisma.usuario.findFirst({
          where: {
            id: {
              not:
                usuarioAtual.id,
            },

            OR:
              verificacoesDuplicidade,
          },

          select: {
            email: true,
            login: true,
          },
        })

      if (duplicado) {
        const emailDuplicado =
          typeof dados.email ===
            "string" &&
          duplicado.email.toLowerCase() ===
            dados.email.toLowerCase()

        return NextResponse.json(
          {
            message:
              emailDuplicado
                ? "Já existe um usuário com este e-mail."
                : "Já existe um usuário com este login.",
          },
          {
            status: 409,
          }
        )
      }
    }

    if (
      Object.keys(
        dados
      ).length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Nenhuma alteração efetiva foi informada.",
        },
        {
          status: 400,
        }
      )
    }

    const usuarioAtualizado =
      await prisma.$transaction(
        async (tx) => {
          const atualizado =
            await tx.usuario.update({
              where: {
                id:
                  usuarioAtual.id,
              },

              data:
                dados,

              select:
                USUARIO_SELECT,
            })

          await tx.auditoria.create({
            data: {
              escritorioId:
                sessao.escritorioId,

              usuarioId:
                sessao.usuarioId,

              entidade:
                "Usuario",

              entidadeId:
                usuarioAtual.id,

              acao:
                "ATUALIZAR",

              dadosAntes:
                dadosAuditoriaUsuario(
                  usuarioAtual
                ),

              dadosDepois:
                dadosAuditoriaUsuario(
                  atualizado
                ),
            },
          })

          return atualizado
        }
      )

    return NextResponse.json(
      {
        message:
          "Usuário atualizado com sucesso.",

        usuario:
          usuarioAtualizado,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "NAO_AUTENTICADO"
    ) {
      return respostaNaoAutenticado()
    }

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "E-mail ou login já cadastrado.",
        },
        {
          status: 409,
        }
      )
    }

    console.error(
      "Erro ao atualizar usuário:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao atualizar usuário.",
      },
      {
        status: 500,
      }
    )
  }
}