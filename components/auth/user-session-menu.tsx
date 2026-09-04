"use client"

import type {
  ReactNode,
} from "react"

import {
  useEffect,
  useState,
} from "react"

import Image from "next/image"
import Link from "next/link"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  BadgeDollarSign,
  BarChart3,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  FileBarChart,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquareText,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  AlertaCriticoGlobal,
} from "@/components/alerta-critico-global"

type UsuarioSessao = {
  id: string
  escritorioId: string
  nome: string
  email: string
  perfil:
    | "Diretor"
    | "Administrativo"
    | "Preposto"
}

type UserSessionMenuProps = {
  children?: ReactNode
}

type ItemMenu = {
  label: string
  href: string
  icon: typeof Home
}

type GrupoMenu = {
  titulo: string
  itens: ItemMenu[]
}

const ROTAS_PUBLICAS = [
  "/login",
  "/setup-inicial",
]

const EMAIL_LOGIN_PAULA =
  "comercial@luizsodre.com.br"

const ASSISTENTE_PESSOAL: ItemMenu = {
  label: "Meu Assistente Pessoal",
  href: "/meu-assistente-pessoal",
  icon: Sparkles,
}

const GRUPO_COMERCIAL: GrupoMenu = {
  titulo: "Comercial",
  itens: [
    {
      label: "Página Inicial",
      href: "/",
      icon: Home,
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: Users,
    },
    {
      label: "Interações",
      href: "/interacoes",
      icon: MessageSquareText,
    },
    {
      label: "Orçamentos",
      href: "/orcamentos",
      icon: FileText,
    },
    {
      label: "Vendas",
      href: "/vendas",
      icon: ReceiptText,
    },
    {
      label: "Faturamentos",
      href: "/faturamentos",
      icon: WalletCards,
    },
  ],
}

const GRUPOS_MENU: GrupoMenu[] = [
  GRUPO_COMERCIAL,
  {
    titulo: "Gestão",
    itens: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Representadas",
        href: "/representadas",
        icon: Building2,
      },
      {
        label: "Agenda",
        href: "/agenda",
        icon: CalendarDays,
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        icon: CircleDollarSign,
      },
      {
        label: "Títulos e Vencimentos",
        href: "/titulos",
        icon: CalendarClock,
      },
      {
        label: "Comissões",
        href: "/comissoes",
        icon: BadgeDollarSign,
      },
      {
        label: "Relatórios",
        href: "/relatorios",
        icon: FileBarChart,
      },
      {
        label: "Mapa",
        href: "/mapa",
        icon: Map,
      },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      {
        label: "Contabilidade",
        href: "/contabilidade",
        icon: Landmark,
      },
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
]

function rotaEstaAtiva(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/"
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  )
}

function obterTituloRota(
  pathname: string
) {
  if (
    rotaEstaAtiva(
      pathname,
      ASSISTENTE_PESSOAL.href
    )
  ) {
    return ASSISTENTE_PESSOAL.label
  }

  for (
    const grupo of
    GRUPOS_MENU
  ) {
    const item =
      grupo.itens.find(
        (itemMenu) =>
          rotaEstaAtiva(
            pathname,
            itemMenu.href
          )
      )

    if (item) {
      return item.label
    }
  }

  return "Luiz Sodré Representações"
}

export function UserSessionMenu({
  children,
}: UserSessionMenuProps) {
  const router =
    useRouter()

  const pathname =
    usePathname()

  const [
    usuario,
    setUsuario,
  ] =
    useState<UsuarioSessao | null>(
      null
    )

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    saindo,
    setSaindo,
  ] =
    useState(false)

  const rotaPublica =
    ROTAS_PUBLICAS.some(
      (rota) =>
        pathname === rota ||
        pathname.startsWith(
          `${rota}/`
        )
    )

  useEffect(() => {
    if (
      rotaPublica
    ) {
      setUsuario(
        null
      )

      setCarregando(
        false
      )

      return
    }

    let ativo =
      true

    async function carregarSessao() {
      try {
        setCarregando(
          true
        )

        const response =
          await fetch(
            "/api/auth/me",
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          )

        if (
          !ativo
        ) {
          return
        }

        if (
          !response.ok
        ) {
          setUsuario(
            null
          )

          return
        }

        const dados =
          await response.json()

        if (
          dados.autenticado ===
            true &&
          dados.usuario
        ) {
          setUsuario(
            dados.usuario
          )
        } else {
          setUsuario(
            null
          )
        }
      } catch (error) {
        console.error(
          "Erro ao carregar sessão:",
          error
        )

        if (
          ativo
        ) {
          setUsuario(
            null
          )
        }
      } finally {
        if (
          ativo
        ) {
          setCarregando(
            false
          )
        }
      }
    }

    carregarSessao()

    return () => {
      ativo =
        false
    }
  }, [
    rotaPublica,
  ])

  async function realizarLogout() {
    if (
      saindo
    ) {
      return
    }

    try {
      setSaindo(
        true
      )

      const loginDestino =
        usuario?.email
          ?.trim()
          .toLowerCase() ===
        EMAIL_LOGIN_PAULA
          ? "/login/paula"
          : "/login"

      const response =
        await fetch(
          "/api/auth/logout",
          {
            method:
              "POST",
          }
        )

      if (
        !response.ok
      ) {
        const dados =
          await response
            .json()
            .catch(
              () => null
            )

        throw new Error(
          dados?.message ||
            "Erro ao sair do sistema."
        )
      }

      setUsuario(
        null
      )

      router.replace(
        loginDestino
      )

      router.refresh()
    } catch (error) {
      const mensagem =
        error instanceof
          Error
          ? error.message
          : "Erro ao sair do sistema."

      alert(
        mensagem
      )
    } finally {
      setSaindo(
        false
      )
    }
  }

  function renderizarItemMenu(
    item: ItemMenu
  ) {
    const Icone =
      item.icon

    const ativo =
      rotaEstaAtiva(
        pathname,
        item.href
      )

    return (
      <Link
        key={
          item.href
        }
        href={
          item.href
        }
        className={[
          "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          ativo
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-300 hover:bg-white/10 hover:text-white",
        ].join(
          " "
        )}
      >
        <Icone
          className={[
            "h-[18px] w-[18px] shrink-0 transition-colors",
            ativo
              ? "text-white"
              : "text-slate-300 group-hover:text-orange-400",
          ].join(
            " "
          )}
        />

        <span className="min-w-0 flex-1 truncate">
          {
            item.label
          }
        </span>

        {ativo && (
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-100" />
        )}
      </Link>
    )
  }

  if (
    rotaPublica
  ) {
    if (
      children
    ) {
      return (
        <>
          {children}
        </>
      )
    }

    return null
  }

  if (
    carregando
  ) {
    if (
      children
    ) {
      return (
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      )
    }

    return null
  }

  if (
    !usuario
  ) {
    if (
      children
    ) {
      return (
        <>
          {children}
        </>
      )
    }

    return null
  }

  if (
    !children
  ) {
    return (
      <div className="w-full border-b border-slate-200 bg-white">

        <div className="flex min-h-[64px] w-full items-center justify-end px-4 py-2 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

            <div className="flex items-center gap-2">

              {usuario.perfil ===
              "Diretor" ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" />
              ) : (
                <UserRound className="h-4 w-4 shrink-0 text-slate-500" />
              )}

              <div className="min-w-0 leading-tight">

                <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                  {
                    usuario.nome
                  }
                </p>

                <p className="text-xs text-slate-500">
                  {
                    usuario.perfil
                  }
                </p>

              </div>

            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={
                realizarLogout
              }
              disabled={
                saindo
              }
              className="shrink-0"
            >
              <LogOut className="mr-2 h-4 w-4" />

              {saindo
                ? "Saindo..."
                : "Sair"}
            </Button>

          </div>

        </div>

        <AlertaCriticoGlobal
          nomeUsuario={
            usuario.nome
          }
        />

      </div>
    )
  }

  const tituloPagina =
    obterTituloRota(
      pathname
    )

  const assistenteAtivo =
    rotaEstaAtiva(
      pathname,
      ASSISTENTE_PESSOAL.href
    )

  const IconeAssistente =
    ASSISTENTE_PESSOAL.icon

  const paginaInicial =
    GRUPO_COMERCIAL
      .itens[0]

  const demaisItensComerciais =
    GRUPO_COMERCIAL
      .itens.slice(
        1
      )

  const gruposRestantes =
    GRUPOS_MENU.slice(
      1
    )

  return (
    <div className="min-h-screen bg-slate-50">

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-slate-800 bg-[#071a2f] lg:flex">

        <div className="border-b border-white/10 px-5 py-5">

          <Link
            href="/"
            className="block rounded-xl transition-colors hover:bg-white/[0.04]"
          >

            <div className="flex items-center gap-3 p-1">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#101a24] shadow-sm ring-1 ring-white/10">

                <Image
                  src="/branding/logo-lsr.png"
                  alt="Luiz Sodré Representações"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-contain"
                />

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold tracking-wide text-white">
                  LUIZ SODRÉ
                </p>

                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-400">
                  Representações
                </p>

              </div>

            </div>

          </Link>

        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <div>

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Comercial
            </p>

            <div className="space-y-1">

              {renderizarItemMenu(
                paginaInicial
              )}

            </div>

            <div className="my-3">

              <Link
                href={
                  ASSISTENTE_PESSOAL.href
                }
                className={[
                  "group relative flex min-h-[74px] items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 transition-all",
                  assistenteAtivo
                    ? "border-blue-400 bg-blue-600 text-white shadow-lg"
                    : "border-blue-400/30 bg-gradient-to-r from-blue-600/25 to-slate-900/40 text-white hover:border-blue-400/60 hover:from-blue-600/35 hover:to-slate-900/50",
                ].join(
                  " "
                )}
              >

                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    assistenteAtivo
                      ? "bg-white/20"
                      : "bg-blue-500/20 ring-1 ring-blue-400/30",
                  ].join(
                    " "
                  )}
                >
                  <IconeAssistente
                    className={[
                      "h-6 w-6",
                      assistenteAtivo
                        ? "text-white"
                        : "text-blue-300 group-hover:text-white",
                    ].join(
                      " "
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-bold leading-tight">
                    Meu Assistente
                  </p>

                  <p className="text-sm font-bold leading-tight">
                    Pessoal
                  </p>

                  <p
                    className={[
                      "mt-1 truncate text-[10px]",
                      assistenteAtivo
                        ? "text-blue-100"
                        : "text-slate-400",
                    ].join(
                      " "
                    )}
                  >
                    Pendências e compromissos
                  </p>

                </div>

                <ChevronRight
                  className={[
                    "h-5 w-5 shrink-0",
                    assistenteAtivo
                      ? "text-white"
                      : "text-blue-300",
                  ].join(
                    " "
                  )}
                />

              </Link>

            </div>

            <div className="space-y-1">

              {demaisItensComerciais.map(
                renderizarItemMenu
              )}

            </div>

          </div>

          <div className="mt-6 space-y-6">

            {gruposRestantes.map(
              (
                grupo
              ) => (
                <div
                  key={
                    grupo.titulo
                  }
                >

                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {
                      grupo.titulo
                    }
                  </p>

                  <div className="space-y-1">

                    {grupo.itens.map(
                      renderizarItemMenu
                    )}

                  </div>

                </div>
              )
            )}

          </div>

        </nav>

        <div className="border-t border-white/10 p-4">

          <div className="rounded-xl bg-white/[0.06] p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">

                {usuario.perfil ===
                "Diretor" ? (
                  <ShieldCheck className="h-5 w-5 text-orange-400" />
                ) : (
                  <UserRound className="h-5 w-5 text-slate-300" />
                )}

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-white">
                  {
                    usuario.nome
                  }
                </p>

                <p className="truncate text-xs text-slate-400">
                  {
                    usuario.perfil
                  }
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                realizarLogout
              }
              disabled={
                saindo
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-orange-400/40 px-3 py-2 text-xs font-semibold text-orange-300 transition-colors hover:border-orange-400/70 hover:bg-orange-500/10 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <LogOut className="h-4 w-4" />

              {saindo
                ? "Saindo..."
                : "Sair do sistema"}

            </button>

          </div>

        </div>

      </aside>

      <div className="lg:pl-[272px]">

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            <div className="min-w-0">

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                <BarChart3 className="h-4 w-4 text-blue-700" />

                <span>
                  CRM e Gestão Comercial
                </span>

              </div>

              <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-[#071a2f]">
                {
                  tituloPagina
                }
              </h1>

            </div>

            <div className="hidden items-center gap-3 sm:flex">

              <div className="text-right leading-tight">

                <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                  {
                    usuario.nome
                  }
                </p>

                <p className="text-xs text-slate-500">
                  {
                    usuario.perfil
                  }
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071a2f] text-white">

                {usuario.perfil ===
                "Diretor" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}

              </div>

            </div>

          </div>

        </header>

        <main className="min-h-[calc(100vh-72px)]">
          {
            children
          }
        </main>

      </div>

      <AlertaCriticoGlobal
        nomeUsuario={
          usuario.nome
        }
      />

    </div>
  )
}