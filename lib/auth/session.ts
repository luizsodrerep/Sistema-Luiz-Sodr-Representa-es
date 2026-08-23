import { SignJWT, jwtVerify } from "jose";

export type PerfilUsuario = "Diretor" | "Administrativo" | "Preposto";

export type SessaoUsuario = {
  usuarioId: string;
  escritorioId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
};

const COOKIE_NAME = "crm_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET não configurado. Defina AUTH_SECRET no arquivo .env.local."
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET deve possuir pelo menos 32 caracteres."
    );
  }

  return new TextEncoder().encode(secret);
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionDurationSeconds(): number {
  return SESSION_DURATION_SECONDS;
}

export async function criarTokenSessao(
  sessao: SessaoUsuario
): Promise<string> {
  return new SignJWT({
    escritorioId: sessao.escritorioId,
    nome: sessao.nome,
    email: sessao.email,
    perfil: sessao.perfil,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(sessao.usuarioId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verificarTokenSessao(
  token: string
): Promise<SessaoUsuario | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.escritorioId !== "string" ||
      typeof payload.nome !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.perfil !== "string"
    ) {
      return null;
    }

    if (
      payload.perfil !== "Diretor" &&
      payload.perfil !== "Administrativo" &&
      payload.perfil !== "Preposto"
    ) {
      return null;
    }

    return {
      usuarioId: payload.sub,
      escritorioId: payload.escritorioId,
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil,
    };
  } catch {
    return null;
  }
}

export function podeAdministrarSistema(
  perfil: PerfilUsuario
): boolean {
  return perfil === "Diretor";
}

export function podeAdministrarCadastros(
  perfil: PerfilUsuario
): boolean {
  return perfil === "Diretor" || perfil === "Administrativo";
}