import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  criarTokenSessao,
  getSessionCookieName,
  getSessionDurationSeconds,
  type PerfilUsuario,
} from "@/lib/auth/session"

function perfilValido(
  perfil: string
): perfil is PerfilUsuario {
  return (
    perfil === "Diretor" ||
    perfil === "Administrativo" ||
    perfil === "Preposto"
  )
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const identificador =
      typeof body.identificador === "string"
        ? body.identificador.trim()
        : ""

    const senha =
      typeof body.senha === "string"
        ? body.senha
        : ""

    if (!identificador || !senha) {
      return NextResponse.json(
        {
          message:
            "Informe login/e-mail e senha.",
        },
        { status: 400 }
      )
    }

    const usuario =
      await prisma.usuario.findFirst({
        where: {
          OR: [
            {
              email: {
                equals: identificador,
                mode: "insensitive",
              },
            },
            {
              login: {
                equals: identificador,
                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
          escritorioId: true,
          nome: true,
          email: true,
          login: true,
          senhaHash: true,
          perfil: true,
          ativo: true,
        },
      })

    if (!usuario) {
      return NextResponse.json(
        {
          message:
            "Usuário ou senha inválidos.",
        },
        { status: 401 }
      )
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        {
          message:
            "Usuário inativo. Procure o administrador do sistema.",
        },
        { status: 403 }
      )
    }

    if (!usuario.senhaHash) {
      return NextResponse.json(
        {
          message:
            "Usuário ainda não possui senha configurada.",
        },
        { status: 403 }
      )
    }

    if (!perfilValido(usuario.perfil)) {
      console.error(
        "Perfil de usuário inválido:",
        usuario.perfil
      )

      return NextResponse.json(
        {
          message:
            "Perfil de acesso inválido.",
        },
        { status: 403 }
      )
    }

    const senhaCorreta =
      await bcrypt.compare(
        senha,
        usuario.senhaHash
      )

    if (!senhaCorreta) {
      return NextResponse.json(
        {
          message:
            "Usuário ou senha inválidos.",
        },
        { status: 401 }
      )
    }

    const token =
      await criarTokenSessao({
        usuarioId: usuario.id,
        escritorioId:
          usuario.escritorioId,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      })

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        ultimoAcessoEm: new Date(),
      },
    })

    const response =
      NextResponse.json(
        {
          message:
            "Login realizado com sucesso.",

          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            login: usuario.login,
            perfil: usuario.perfil,
            escritorioId:
              usuario.escritorioId,
          },
        },
        { status: 200 }
      )

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        getSessionDurationSeconds(),
    })

    return response
  } catch (error) {
    console.error(
      "Erro ao realizar login:",
      error
    )

    return NextResponse.json(
      {
        message:
          "Erro interno ao realizar login.",
      },
      { status: 500 }
    )
  }
}