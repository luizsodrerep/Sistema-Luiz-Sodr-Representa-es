import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  criarTokenSessao,
  getSessionCookieName,
  getSessionDurationSeconds,
} from "@/lib/auth/session"

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

function emailValido(
  valor: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
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

export async function GET() {
  try {
    const [
      totalEscritorios,
      totalUsuarios,
    ] = await Promise.all([
      prisma.escritorio.count(),
      prisma.usuario.count(),
    ])

    const configuracaoNecessaria =
      totalEscritorios === 0 &&
      totalUsuarios === 0

    return NextResponse.json(
      {
        configuracaoNecessaria,
        totalEscritorios,
        totalUsuarios,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Erro ao consultar setup inicial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro ao consultar configuração inicial.",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()

    /*
     * Segurança:
     * o setup somente pode funcionar enquanto
     * NÃO existir escritório nem usuário.
     */
    const [
      totalEscritorios,
      totalUsuarios,
    ] = await Promise.all([
      prisma.escritorio.count(),
      prisma.usuario.count(),
    ])

    if (
      totalEscritorios > 0 ||
      totalUsuarios > 0
    ) {
      return NextResponse.json(
        {
          message:
            "A configuração inicial já foi realizada.",
        },
        { status: 409 }
      )
    }

    const escritorioNome =
      textoObrigatorio(
        body.escritorio?.nome
      )

    const diretorNome =
      textoObrigatorio(
        body.diretor?.nome
      )

    const diretorEmail =
      textoObrigatorio(
        body.diretor?.email
      )

    const diretorLogin =
      textoObrigatorio(
        body.diretor?.login
      )

    const diretorSenha =
      typeof body.diretor?.senha ===
        "string"
        ? body.diretor.senha
        : ""

    if (!escritorioNome) {
      return NextResponse.json(
        {
          message:
            "Nome do escritório é obrigatório.",
        },
        { status: 400 }
      )
    }

    if (!diretorNome) {
      return NextResponse.json(
        {
          message:
            "Nome do diretor é obrigatório.",
        },
        { status: 400 }
      )
    }

    if (
      !diretorEmail ||
      !emailValido(diretorEmail)
    ) {
      return NextResponse.json(
        {
          message:
            "Informe um e-mail válido para o diretor.",
        },
        { status: 400 }
      )
    }

    if (!diretorLogin) {
      return NextResponse.json(
        {
          message:
            "Login do diretor é obrigatório.",
        },
        { status: 400 }
      )
    }

    const erroSenhaDiretor =
      validarSenha(diretorSenha)

    if (erroSenhaDiretor) {
      return NextResponse.json(
        {
          message:
            erroSenhaDiretor,
        },
        { status: 400 }
      )
    }

    /*
     * Usuário administrativo é opcional
     * durante o primeiro setup.
     */
    const criarAdministrativo =
      body.administrativo?.criar === true

    let administrativoNome:
      | string
      | null = null

    let administrativoEmail:
      | string
      | null = null

    let administrativoLogin:
      | string
      | null = null

    let administrativoSenha = ""

    if (criarAdministrativo) {
      administrativoNome =
        textoObrigatorio(
          body.administrativo?.nome
        )

      administrativoEmail =
        textoObrigatorio(
          body.administrativo?.email
        )

      administrativoLogin =
        textoObrigatorio(
          body.administrativo?.login
        )

      administrativoSenha =
        typeof body.administrativo
          ?.senha === "string"
          ? body.administrativo.senha
          : ""

      if (!administrativoNome) {
        return NextResponse.json(
          {
            message:
              "Nome do usuário administrativo é obrigatório.",
          },
          { status: 400 }
        )
      }

      if (
        !administrativoEmail ||
        !emailValido(
          administrativoEmail
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Informe um e-mail válido para o usuário administrativo.",
          },
          { status: 400 }
        )
      }

      if (!administrativoLogin) {
        return NextResponse.json(
          {
            message:
              "Login do usuário administrativo é obrigatório.",
          },
          { status: 400 }
        )
      }

      if (
        administrativoEmail.toLowerCase() ===
        diretorEmail.toLowerCase()
      ) {
        return NextResponse.json(
          {
            message:
              "Diretor e Administrativo não podem utilizar o mesmo e-mail.",
          },
          { status: 400 }
        )
      }

      if (
        administrativoLogin.toLowerCase() ===
        diretorLogin.toLowerCase()
      ) {
        return NextResponse.json(
          {
            message:
              "Diretor e Administrativo não podem utilizar o mesmo login.",
          },
          { status: 400 }
        )
      }

      const erroSenhaAdministrativo =
        validarSenha(
          administrativoSenha
        )

      if (
        erroSenhaAdministrativo
      ) {
        return NextResponse.json(
          {
            message:
              `Senha do Administrativo: ${erroSenhaAdministrativo}`,
          },
          { status: 400 }
        )
      }
    }

    const diretorSenhaHash =
      await bcrypt.hash(
        diretorSenha,
        12
      )

    const administrativoSenhaHash =
      criarAdministrativo
        ? await bcrypt.hash(
            administrativoSenha,
            12
          )
        : null

    const resultado =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Confirma novamente dentro da
           * transação para reduzir risco
           * de configuração duplicada.
           */
          const [
            escritoriosExistentes,
            usuariosExistentes,
          ] = await Promise.all([
            tx.escritorio.count(),
            tx.usuario.count(),
          ])

          if (
            escritoriosExistentes > 0 ||
            usuariosExistentes > 0
          ) {
            throw new Error(
              "SETUP_JA_REALIZADO"
            )
          }

          const escritorio =
            await tx.escritorio.create({
              data: {
                nome:
                  escritorioNome,

                status:
                  "Ativo",

                email:
                  textoObrigatorio(
                    body.escritorio?.email
                  ),

                telefone:
                  textoObrigatorio(
                    body.escritorio
                      ?.telefone
                  ),

                whatsapp:
                  textoObrigatorio(
                    body.escritorio
                      ?.whatsapp
                  ),

                observacoes:
                  textoObrigatorio(
                    body.escritorio
                      ?.observacoes
                  ),
              },
            })

          const diretor =
            await tx.usuario.create({
              data: {
                escritorioId:
                  escritorio.id,

                nome:
                  diretorNome,

                email:
                  diretorEmail.toLowerCase(),

                login:
                  diretorLogin,

                senhaHash:
                  diretorSenhaHash,

                perfil:
                  "Diretor",

                ativo:
                  true,

                observacoes:
                  "Usuário Diretor criado na configuração inicial do CRM.",
              },
            })

          let administrativo:
            | {
                id: string
                nome: string
                email: string
                login: string | null
                perfil: string
              }
            | null = null

          if (
            criarAdministrativo &&
            administrativoNome &&
            administrativoEmail &&
            administrativoLogin &&
            administrativoSenhaHash
          ) {
            administrativo =
              await tx.usuario.create({
                data: {
                  escritorioId:
                    escritorio.id,

                  nome:
                    administrativoNome,

                  email:
                    administrativoEmail.toLowerCase(),

                  login:
                    administrativoLogin,

                  senhaHash:
                    administrativoSenhaHash,

                  perfil:
                    "Administrativo",

                  ativo:
                    true,

                  observacoes:
                    "Usuário Administrativo criado na configuração inicial do CRM.",
                },

                select: {
                  id: true,
                  nome: true,
                  email: true,
                  login: true,
                  perfil: true,
                },
              })
          }

          return {
            escritorio,
            diretor,
            administrativo,
          }
        }
      )

    /*
     * Finalizado o setup, o Diretor já
     * fica autenticado automaticamente.
     */
    const token =
      await criarTokenSessao({
        usuarioId:
          resultado.diretor.id,

        escritorioId:
          resultado.escritorio.id,

        nome:
          resultado.diretor.nome,

        email:
          resultado.diretor.email,

        perfil:
          "Diretor",
      })

    const response =
      NextResponse.json(
        {
          message:
            "Configuração inicial concluída com sucesso.",

          escritorio: {
            id:
              resultado.escritorio.id,
            nome:
              resultado.escritorio.nome,
          },

          diretor: {
            id:
              resultado.diretor.id,
            nome:
              resultado.diretor.nome,
            email:
              resultado.diretor.email,
            login:
              resultado.diretor.login,
            perfil:
              resultado.diretor.perfil,
          },

          administrativo:
            resultado.administrativo,
        },
        { status: 201 }
      )

    response.cookies.set({
      name:
        getSessionCookieName(),

      value:
        token,

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        getSessionDurationSeconds(),
    })

    return response
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "SETUP_JA_REALIZADO"
    ) {
      return NextResponse.json(
        {
          message:
            "A configuração inicial já foi realizada.",
        },
        { status: 409 }
      )
    }

    console.error(
      "Erro na configuração inicial:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro interno durante a configuração inicial.",
      },
      { status: 500 }
    )
  }
}