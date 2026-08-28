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
  Check,
  Crown,
  Heart,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
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

export default function LoginPaulaPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#9d004d] via-[#d50068] to-[#ff3c98] px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-medium text-white shadow-xl backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>
            Preparando seu acesso...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff5fa]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#ad0056] via-[#dd006c] to-[#ff3593] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14 xl:py-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 top-20 h-96 w-96 rounded-full border-[3px] border-white/10" />

            <div className="absolute -left-20 top-32 h-72 w-72 rounded-full border-[2px] border-pink-200/10" />

            <div className="absolute bottom-[-180px] right-[-140px] h-[500px] w-[500px] rounded-full border-[80px] border-white/[0.04]" />

            <div className="absolute right-16 top-20 h-2 w-2 rounded-full bg-white/60" />

            <div className="absolute bottom-40 left-20 h-2 w-2 rounded-full bg-pink-100/70" />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black tracking-tight text-[#c0005b] shadow-lg">
              LS
            </div>

            <div>
              <p className="text-lg font-bold tracking-[0.08em]">
                LUIZ SODRÉ
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-100">
                Representações
              </p>
            </div>
          </div>

          <div className="relative mt-12">
            <Crown className="h-14 w-14 stroke-[1.5] text-pink-100" />

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
              <Heart className="h-4 w-4 fill-current" />

              Espaço exclusivo da Paula
            </div>

            <h1 className="mt-7 max-w-xl text-4xl font-light leading-tight tracking-tight xl:text-5xl">
              Você torna tudo
              <span className="block font-bold italic">
                mais especial.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-pink-50/90">
              Seu cuidado, dedicação e parceria
              fazem parte da força da nossa empresa
              todos os dias.
            </p>
          </div>

          <div className="relative mt-10 grid gap-2">
            {[
              "Força nos desafios",
              "Clareza nas decisões",
              "Parceria em todos os momentos",
              "Peça fundamental nesta história",
            ].map((texto) => (
              <div
                key={texto}
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm text-white/95"
              >
                <Heart className="h-4 w-4 shrink-0" />

                <span>
                  {texto}
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-9 rounded-2xl border border-white/20 bg-[#730038]/25 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-pink-100">
              <Sparkles className="h-5 w-5" />

              <p className="text-xs font-bold uppercase tracking-[0.16em]">
                Inspiração para o seu dia
              </p>
            </div>

            <p className="mt-3 text-base font-semibold leading-7 text-white">
              Um passo de cada vez.
              Organização, constância e confiança
              transformam desafios em conquistas.
            </p>

            <p className="mt-2 text-sm leading-6 text-pink-100">
              Você é capaz de fazer um grande
              dia acontecer.
            </p>
          </div>

          <div className="relative mt-auto pt-8">
            <div className="border-t border-white/20 pt-5">
              <p className="text-sm font-semibold text-white">
                Trabalho • Parceria • Família • Futuro
              </p>

              <p className="mt-1 text-xs text-pink-100/80">
                Luiz Sodré Representações
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-200/40 blur-3xl" />

            <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-fuchsia-100/60 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[520px]">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#d50068] to-[#ff3c98] text-base font-black text-white shadow-lg">
                LS
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-[#740039]">
                  LUIZ SODRÉ
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d50068]">
                  Representações
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-pink-200/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(190,0,90,0.12)] backdrop-blur sm:p-9 lg:p-10">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-[#dc006b] ring-8 ring-pink-50">
                  <Crown className="h-8 w-8" />
                </div>

                <p className="mt-7 text-3xl font-bold tracking-tight text-slate-900">
                  Bem-vinda,{" "}
                  <span className="text-[#df006c]">
                    Paula!
                  </span>
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tudo organizado para você
                  acompanhar, gerir e cuidar do
                  que é nosso.
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
                    className="font-semibold text-slate-800"
                  >
                    Login ou e-mail
                  </Label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e0006b]" />

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
                      className="h-14 rounded-xl border-pink-300 bg-white pl-12 text-base focus-visible:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="senha"
                    className="font-semibold text-slate-800"
                  >
                    Senha
                  </Label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e0006b]" />

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
                      className="h-14 rounded-xl border-pink-300 bg-white pl-12 text-base focus-visible:ring-pink-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={carregando}
                  className="h-14 w-full rounded-xl bg-gradient-to-r from-[#ec1974] to-[#d30068] text-base font-bold text-white shadow-lg shadow-pink-200 hover:from-[#da1168] hover:to-[#bd005c]"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                      Entrando...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />

                      Entrar

                      <ArrowRight className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-7 border-t border-pink-100 pt-6">
                <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-[#fff0f7] p-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#df006c] shadow-sm">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#a90050]">
                        Acesso exclusivo da Paula
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Um espaço preparado especialmente
                        para quem participa todos os dias
                        da construção desta empresa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Check className="h-4 w-4 text-[#dc006b]" />

                <span>
                  Ambiente protegido e acesso autorizado
                </span>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b40056]">
                Luiz Sodré Representações
              </p>

              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Heart className="h-3.5 w-3.5 text-[#e60070]" />

                <span>
                  Trabalho • Parceria • Família • Futuro
                </span>

                <Heart className="h-3.5 w-3.5 text-[#e60070]" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}