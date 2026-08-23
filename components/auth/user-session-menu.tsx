"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"

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

const ROTAS_PUBLICAS = [
  "/login",
  "/setup-inicial",
]

export function UserSessionMenu() {
  const router = useRouter()
  const pathname = usePathname()

  const [usuario, setUsuario] =
    useState<UsuarioSessao | null>(null)

  const [carregando, setCarregando] =
    useState(true)

  const [saindo, setSaindo] =
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
    if (rotaPublica) {
      setUsuario(null)
      setCarregando(false)
      return
    }

    let ativo = true

    async function carregarSessao() {
      try {
        setCarregando(true)

        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
          }
        )

        if (!ativo) {
          return
        }

        if (!response.ok) {
          setUsuario(null)
          return
        }

        const dados =
          await response.json()

        if (
          dados.autenticado === true &&
          dados.usuario
        ) {
          setUsuario(
            dados.usuario
          )
        } else {
          setUsuario(null)
        }
      } catch (error) {
        console.error(
          "Erro ao carregar sessão:",
          error
        )

        if (ativo) {
          setUsuario(null)
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarSessao()

    return () => {
      ativo = false
    }
  }, [rotaPublica])

  async function realizarLogout() {
    if (saindo) {
      return
    }

    try {
      setSaindo(true)

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      )

      if (!response.ok) {
        const dados =
          await response
            .json()
            .catch(() => null)

        throw new Error(
          dados?.message ||
            "Erro ao sair do sistema."
        )
      }

      setUsuario(null)

      router.replace("/login")
      router.refresh()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao sair do sistema."

      alert(mensagem)
    } finally {
      setSaindo(false)
    }
  }

  if (
    rotaPublica ||
    carregando ||
    !usuario
  ) {
    return null
  }

  return (
    <div className="fixed top-3 right-4 z-40">
      <div className="flex items-center gap-3 rounded-xl border bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <div className="hidden sm:flex items-center gap-2">
          {usuario.perfil ===
          "Diretor" ? (
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          ) : (
            <UserRound className="h-4 w-4 text-slate-500" />
          )}

          <div className="leading-tight">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">
              {usuario.nome}
            </p>

            <p className="text-xs text-slate-500">
              {usuario.perfil}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={realizarLogout}
          disabled={saindo}
        >
          <LogOut className="h-4 w-4 mr-2" />

          {saindo
            ? "Saindo..."
            : "Sair"}
        </Button>
      </div>
    </div>
  )
}