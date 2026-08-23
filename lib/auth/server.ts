import { cookies } from "next/headers"

import {
  getSessionCookieName,
  type PerfilUsuario,
  type SessaoUsuario,
  verificarTokenSessao,
} from "@/lib/auth/session"

export async function obterSessaoAtual(): Promise<SessaoUsuario | null> {
  const cookieStore = await cookies()

  const token = cookieStore.get(
    getSessionCookieName()
  )?.value

  if (!token) {
    return null
  }

  return verificarTokenSessao(token)
}

export async function exigirSessao(): Promise<SessaoUsuario> {
  const sessao = await obterSessaoAtual()

  if (!sessao) {
    throw new Error("NAO_AUTENTICADO")
  }

  return sessao
}

export async function exigirPerfis(
  perfisPermitidos: PerfilUsuario[]
): Promise<SessaoUsuario> {
  const sessao = await exigirSessao()

  if (
    !perfisPermitidos.includes(
      sessao.perfil
    )
  ) {
    throw new Error("ACESSO_NEGADO")
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