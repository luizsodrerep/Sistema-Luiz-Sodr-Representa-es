"use client"

import {
  FormEvent,
  useEffect,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  ArrowRight,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  Label,
} from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()

  const [
    identificador,
    setIdentificador,
  ] = useState("")

  const [
    senha,
    setSenha,
  ] = useState("")

  const [
    carregando,
    setCarregando,
  ] = useState(false)

  const [
    verificando,
    setVerificando,
  ] = useState(true)

  const [
    erro,
    setErro,
  ] = useState<string | null>(null)

  useEffect(() => {
    async function verificarEstado() {
      try {
        const respostaSetup =
          await fetch(
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

        const respostaSessao =
          await fetch(
            "/api/auth/me",
            {
              method: "GET",
              cache: "no-store",
            }
          )

        if (respostaSessao.ok) {
          router.replace("/")

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

      const response =
        await fetch(
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

      router.replace("/")
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
      <div className="flex min-h-screen items-center justify-center bg-[#071a2f] px-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-200 shadow-xl backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin text-orange-400" />

          <span>
            Verificando acesso...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071a2f]">
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border-[80px] border-blue-600/10" />

        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full border-[96px] border-orange-500/[0.07]" />

        <div className="absolute left-[18%] top-[18%] h-2 w-2 rounded-full bg-orange-400/70" />

        <div className="absolute bottom-[22%] right-[16%] h-2 w-2 rounded-full bg-blue-400/60" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between px-12 py-12 text-white lg:flex xl:px-16 xl:py-14">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black tracking-tight text-[#0b315d] shadow-xl">
                LS
              </div>

              <div>
                <p className="text-base font-bold tracking-wide text-white">
                  LUIZ SODRÉ
                </p>

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Representações
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                <ShieldCheck className="h-4 w-4 text-orange-400" />

                CRM e Gestão Comercial
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Gestão comercial com clareza,
                controle e continuidade.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Acesse clientes, interações, orçamentos,
                vendas, faturamentos e demais áreas do
                escritório em um único ambiente.
              </p>
            </div>
          </div>

          <div className="max-w-lg border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Luiz Sodré Representações
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sistema interno de CRM e gestão comercial.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-base font-black tracking-tight text-[#0b315d] shadow-lg">
                LS
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-white">
                  LUIZ SODRÉ
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Representações
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl sm:p-8 lg:p-10">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <LogIn className="h-6 w-6" />
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                  Entrar no sistema
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Informe suas credenciais para acessar
                  o ambiente de gestão comercial.
                </p>
              </div>

              <form
                onSubmit={realizarLogin}
                className="mt-8 space-y-5"
              >
                {erro && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {erro}
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="identificador"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Login ou e-mail
                  </Label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                      placeholder="Digite seu login ou e-mail"
                      className="h-12 rounded-xl border-slate-300 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="senha"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Senha
                  </Label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                      placeholder="Digite sua senha"
                      className="h-12 rounded-xl border-slate-300 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={carregando}
                  className="h-12 w-full rounded-xl bg-[#0b315d] text-sm font-semibold text-white hover:bg-[#09294f]"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-7 flex items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-blue-700" />

                <span>
                  Acesso restrito aos usuários autorizados.
                </span>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              CRM Luiz Sodré Representações
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}