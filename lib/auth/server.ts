import { cookies } from "next/headers"

import {
  getSessionCookieName,
  type PerfilUsuario,
  type SessaoUsuario,
  verificarTokenSessao,
} from "@/lib/auth/session"

import {
  prisma,
} from "@/lib/prisma"

function perfilValido(
  valor: string
): valor is PerfilUsuario {
  return (
    valor === "Diretor" ||
    valor === "Administrativo" ||
    valor === "Preposto"
  )
}

export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const cookieStore =
    await cookies()

  const token =
    cookieStore.get(
      getSessionCookieName()
    )?.value

  if (!token) {
    return null
  }

  const sessaoToken =
    await verificarTokenSessao(
      token
    )

  if (!sessaoToken) {
    return null
  }

  /*
   * O token comprova que a sessão foi
   * emitida pelo CRM e ainda não expirou.
   *
   * Porém o banco é a fonte de verdade
   * para o estado atual da conta.
   *
   * Isso impede que um usuário:
   *
   * - desativado continue usando APIs;
   * - removido continue autenticado;
   * - permaneça com perfil antigo nas
   *   validações server-side após mudança.
   *
   * O escritorioId do token também precisa
   * coincidir com o cadastro real.
   */
  const usuario =
    await prisma.usuario.findFirst({
      where: {
        id:
          sessaoToken.usuarioId,

        escritorioId:
          sessaoToken.escritorioId,

        ativo:
          true,
      },

      select: {
        id: true,
        escritorioId: true,
        nome: true,
        email: true,
        perfil: true,
      },
    })

  if (
    !usuario ||
    !perfilValido(
      usuario.perfil
    )
  ) {
    return null
  }

  /*
   * Retornamos os dados atuais do banco,
   * não os dados antigos gravados no JWT.
   *
   * Assim alterações de nome, e-mail e
   * perfil passam a valer imediatamente
   * nas verificações realizadas no servidor.
   */
  return {
    usuarioId:
      usuario.id,

    escritorioId:
      usuario.escritorioId,

    nome:
      usuario.nome,

    email:
      usuario.email,

    perfil:
      usuario.perfil,
  }
}

export async function exigirSessao(): Promise<SessaoUsuario> {
  const sessao =
    await obterSessaoAtual()

  if (!sessao) {
    throw new Error(
      "NAO_AUTENTICADO"
    )
  }

  return sessao
}

export async function exigirPerfis(
  perfisPermitidos: PerfilUsuario[]
): Promise<SessaoUsuario> {
  const sessao =
    await exigirSessao()

  if (
    !perfisPermitidos.includes(
      sessao.perfil
    )
  ) {
    throw new Error(
      "ACESSO_NEGADO"
    )
  }

  return sessao
}

export async function exigirDiretor(): Promise<SessaoUsuario> {
  return exigirPerfis([
    "Diretor",
  ])
}

export async function exigirAdministracao(): Promise<SessaoUsuario> {
  return exigirPerfis([
    "Diretor",
    "Administrativo",
  ])
}