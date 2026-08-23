"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()

  const [identificador, setIdentificador] =
    useState("")

  const [senha, setSenha] =
    useState("")

  const [carregando, setCarregando] =
    useState(false)

  const [verificando, setVerificando] =
    useState(true)

  const [erro, setErro] =
    useState<string | null>(null)

  useEffect(() => {
    async function verificarEstado() {
      try {
        /*
         * Primeiro verificamos se o sistema
         * ainda precisa do setup inicial.
         */
        const respostaSetup = await fetch(
          "/api/auth/setup-inicial",
          {
            method: "GET",
            cache: "no-store",
          }
        )

        if (respostaSetup.ok) {
          const dadosSetup =
            await respostaSetup.json()

          if (
            dadosSetup.configuracaoNecessaria
          ) {
            router.replace(
              "/setup-inicial"
            )

            return
          }
        }

        /*
         * Se já houver sessão válida,
         * não faz sentido exibir login.
         */
        const respostaSessao =
          await fetch(
            "/api/auth/me",
            {
              method: "GET",
              cache: "no-store",
            }
          )

        if (respostaSessao.ok) {
          router.replace(
            "/dashboard"
          )

          return
        }
      } catch (error) {
        console.error(
          "Erro ao verificar estado de autenticação:",
          error
        )
      } finally {
        setVerificando(false)
      }
    }

    verificarEstado()
  }, [router])

  async function realizarLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!identificador.trim()) {
      setErro(
        "Informe seu login ou e-mail."
      )
      return
    }

    if (!senha) {
      setErro(
        "Informe sua senha."
      )
      return
    }

    try {
      setCarregando(true)
      setErro(null)

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            identificador:
              identificador.trim(),

            senha,
          }),
        }
      )

      const dados =
        await response.json()

      if (!response.ok) {
        throw new Error(
          dados.message ||
            "Não foi possível realizar o login."
        )
      }

      router.replace("/dashboard")
      router.refresh()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao realizar login."

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>
            Verificando acesso...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="h-6 w-6" />

            <span className="font-semibold">
              CRM Luiz Sodré Representações
            </span>
          </div>

          <div>
            <CardTitle className="text-2xl">
              Entrar no sistema
            </CardTitle>

            <CardDescription className="mt-2">
              Utilize seu login ou e-mail e sua senha de acesso.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={realizarLogin}
            className="space-y-5"
          >
            {erro && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="identificador">
                Login ou e-mail
              </Label>

              <Input
                id="identificador"
                autoComplete="username"
                value={identificador}
                onChange={(event) => {
                  setIdentificador(
                    event.target.value
                  )

                  if (erro) {
                    setErro(null)
                  }
                }}
                disabled={carregando}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="senha">
                Senha
              </Label>

              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => {
                  setSenha(
                    event.target.value
                  )

                  if (erro) {
                    setErro(null)
                  }
                }}
                disabled={carregando}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}