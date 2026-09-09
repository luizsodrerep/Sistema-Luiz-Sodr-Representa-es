import bcrypt from "bcryptjs"
import {
  Prisma,
} from "@prisma/client"
import {
  NextRequest,
  NextResponse,
} from "next/server"

import {
  exigirSessao,
} from "@/lib/auth/server"
import {
  podeExecutarAcao,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"

type PerfilNovoUsuario =
  | "Diretor"
  | "Administrativo"
  | "Preposto"

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
): valor is PerfilNovoUsuario {
  return (
    valor === "Diretor" ||
    valor === "Administrativo" ||
    valor === "Preposto"
  )
}

function validarSenha(
  senha: string
): string | null {
  if (senha.length < 10) {
    return "A senha deve possuir pelo menos 10 caracteres."
  }

  if (!/[A-Z]/.test(senha)) {
    return "A senha deve possuir pelo menos uma letra maiúscula."
  }

  if (!/[a-z]/.test(senha)) {
    return "A senha deve possuir pelo menos uma letra minúscula."
  }

  if (!/[0-9]/.test(senha)) {
    return "A senha deve possuir pelo menos um número."
  }

  return null
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

export async function GET() {
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

    const usuarios =
      await prisma.usuario.findMany({
        where: {
          escritorioId:
            sessao.escritorioId,
        },

        orderBy: [
          {
            ativo: "desc",
          },
          {
            nome: "asc",
          },
        ],

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
          ultimoAcessoEm: true,
          observacoes: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      })

    return NextResponse.json(
      usuarios,
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
      "Erro ao listar usuários:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao listar usuários.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const sessao =
      await exigirSessao()

    if (
      !podeExecutarAcao(
        sessao.perfil,
        "usuarios",
        "criar"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Seu perfil não possui permissão para criar usuários.",
        },
        {
          status: 403,
        }
      )
    }

    const body =
      await request.json()

    const nome =
      textoObrigatorio(
        body.nome
      )

    const email =
      textoObrigatorio(
        body.email
      )

    const login =
      textoObrigatorio(
        body.login
      )

    const senha =
      typeof body.senha ===
        "string"
        ? body.senha
        : ""

    const perfil =
      body.perfil

    const cargo =
      textoOpcional(
        body.cargo
      )

    const departamento =
      textoOpcional(
        body.departamento
      )

    const telefone =
      textoOpcional(
        body.telefone
      )

    const tipoVinculo =
      textoOpcional(
        body.tipoVinculo
      )

    const regiaoAtuacao =
      textoOpcional(
        body.regiaoAtuacao
      )

    const observacoes =
      textoOpcional(
        body.observacoes
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

    const erroSenha =
      validarSenha(
        senha
      )

    if (erroSenha) {
      return NextResponse.json(
        {
          message:
            erroSenha,
        },
        {
          status: 400,
        }
      )
    }

    const identificadorExistente =
      await prisma.usuario.findFirst({
        where: {
          OR: [
            {
              email: {
                equals:
                  email,
                mode:
                  "insensitive",
              },
            },
            {
              login: {
                equals:
                  login,
                mode:
                  "insensitive",
              },
            },
          ],
        },

        select: {
          email: true,
          login: true,
        },
      })

    if (
      identificadorExistente
    ) {
      const emailDuplicado =
        identificadorExistente.email
          .toLowerCase() ===
        email.toLowerCase()

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

    const senhaHash =
      await bcrypt.hash(
        senha,
        12
      )

    const novoUsuario =
      await prisma.$transaction(
        async (tx) => {
          const usuario =
            await tx.usuario.create({
              data: {
                escritorioId:
                  sessao.escritorioId,

                nome,

                email:
                  email.toLowerCase(),

                login,

                senhaHash,

                perfil,

                ativo:
                  true,

                cargo,
                departamento,
                telefone,
                tipoVinculo,
                regiaoAtuacao,
                observacoes,
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
                ultimoAcessoEm: true,
                observacoes: true,
                criadoEm: true,
                atualizadoEm: true,
              },
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
                usuario.id,

              acao:
                "CRIAR",

              dadosDepois: {
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
                cargo:
                  usuario.cargo,
                departamento:
                  usuario.departamento,
                telefone:
                  usuario.telefone,
                tipoVinculo:
                  usuario.tipoVinculo,
                regiaoAtuacao:
                  usuario.regiaoAtuacao,
                observacoes:
                  usuario.observacoes,
              },
            },
          })

          return usuario
        }
      )

    return NextResponse.json(
      {
        message:
          "Usuário criado com sucesso.",

        usuario:
          novoUsuario,
      },
      {
        status: 201,
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
      "Erro ao criar usuário:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao criar usuário.",
      },
      {
        status: 500,
      }
    )
  }
}
