import { NextRequest, NextResponse } from "next/server"

import {
  getSessionCookieName,
  verificarTokenSessao,
} from "@/lib/auth/session"

import {
  type AcaoSistema,
  podeExecutarAcao,
  recursoDaRota,
} from "@/lib/auth/permissions"

const ROTAS_PUBLICAS = [
  "/login",
  "/setup-inicial",
]

const APIS_PUBLICAS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/setup-inicial",
]

function rotaEhPublica(
  pathname: string
): boolean {
  return ROTAS_PUBLICAS.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(
        `${rota}/`
      )
  )
}

function apiEhPublica(
  pathname: string
): boolean {
  return APIS_PUBLICAS.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(
        `${rota}/`
      )
  )
}

function ehApi(
  pathname: string
): boolean {
  return pathname.startsWith(
    "/api/"
  )
}

function acaoPorMetodo(
  method: string
): AcaoSistema {
  switch (method.toUpperCase()) {
    case "POST":
      return "criar"

    case "PUT":
    case "PATCH":
      return "editar"

    case "DELETE":
      return "excluir"

    case "GET":
    case "HEAD":
    case "OPTIONS":
    default:
      return "ver"
  }
}

function limparSessao(
  response: NextResponse
) {
  response.cookies.set({
    name:
      getSessionCookieName(),

    value:
      "",

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
      0,
  })

  return response
}

export async function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname

  /*
   * Endpoints públicos necessários
   * para autenticação e primeiro setup.
   */
  if (apiEhPublica(pathname)) {
    return NextResponse.next()
  }

  /*
   * Páginas públicas.
   */
  if (rotaEhPublica(pathname)) {
    return NextResponse.next()
  }

  const token =
    request.cookies.get(
      getSessionCookieName()
    )?.value

  /*
   * Sem token:
   *
   * - API recebe 401 em JSON;
   * - página é enviada ao login.
   */
  if (!token) {
    if (ehApi(pathname)) {
      return NextResponse.json(
        {
          message:
            "Autenticação necessária.",
        },
        { status: 401 }
      )
    }

    const urlLogin =
      new URL(
        "/login",
        request.url
      )

    urlLogin.searchParams.set(
      "retorno",
      `${pathname}${request.nextUrl.search}`
    )

    return NextResponse.redirect(
      urlLogin
    )
  }

  /*
   * Validação criptográfica da sessão.
   */
  const sessao =
    await verificarTokenSessao(
      token
    )

  if (!sessao) {
    if (ehApi(pathname)) {
      return limparSessao(
        NextResponse.json(
          {
            message:
              "Sessão inválida ou expirada.",
          },
          { status: 401 }
        )
      )
    }

    const urlLogin =
      new URL(
        "/login",
        request.url
      )

    urlLogin.searchParams.set(
      "retorno",
      `${pathname}${request.nextUrl.search}`
    )

    return limparSessao(
      NextResponse.redirect(
        urlLogin
      )
    )
  }

  /*
   * Determina qual recurso do CRM
   * corresponde à rota solicitada.
   *
   * Rotas que ainda não possuem
   * classificação específica continuam
   * exigindo autenticação, mas não são
   * bloqueadas por perfil neste ponto.
   *
   * Elas devem ser classificadas quando
   * entrarem na auditoria funcional.
   */
  const recurso =
    recursoDaRota(pathname)

  if (!recurso) {
    return NextResponse.next()
  }

  /*
   * Para páginas, acessar equivale
   * sempre a ação "ver".
   *
   * Para APIs, o método HTTP determina
   * a ação solicitada.
   */
  const acao: AcaoSistema =
    ehApi(pathname)
      ? acaoPorMetodo(
          request.method
        )
      : "ver"

  const permitido =
    podeExecutarAcao(
      sessao.perfil,
      recurso,
      acao
    )

  if (permitido) {
    return NextResponse.next()
  }

  /*
   * API proibida:
   *
   * 403 significa que o usuário está
   * autenticado, porém não possui
   * autorização para aquela operação.
   */
  if (ehApi(pathname)) {
    return NextResponse.json(
      {
        message:
          "Você não possui permissão para realizar esta operação.",

        recurso,
        acao,
      },
      { status: 403 }
    )
  }

  /*
   * Página proibida:
   * envia para tela própria de acesso
   * negado, preservando a rota tentada.
   */
  const urlAcessoNegado =
    new URL(
      "/acesso-negado",
      request.url
    )

  urlAcessoNegado.searchParams.set(
    "origem",
    pathname
  )

  return NextResponse.redirect(
    urlAcessoNegado
  )
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}