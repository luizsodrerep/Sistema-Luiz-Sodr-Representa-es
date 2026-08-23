"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserCog,
  UserRound,
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
import { Textarea } from "@/components/ui/textarea"

type FormSetup = {
  escritorioNome: string
  escritorioEmail: string
  escritorioTelefone: string
  escritorioWhatsapp: string
  escritorioObservacoes: string

  diretorNome: string
  diretorEmail: string
  diretorLogin: string
  diretorSenha: string
  diretorConfirmarSenha: string

  criarAdministrativo: boolean
  administrativoNome: string
  administrativoEmail: string
  administrativoLogin: string
  administrativoSenha: string
  administrativoConfirmarSenha: string
}

const FORM_INICIAL: FormSetup = {
  escritorioNome: "",
  escritorioEmail: "",
  escritorioTelefone: "",
  escritorioWhatsapp: "",
  escritorioObservacoes: "",

  diretorNome: "",
  diretorEmail: "",
  diretorLogin: "",
  diretorSenha: "",
  diretorConfirmarSenha: "",

  criarAdministrativo: false,
  administrativoNome: "",
  administrativoEmail: "",
  administrativoLogin: "",
  administrativoSenha: "",
  administrativoConfirmarSenha: "",
}

function validarSenhaLocal(senha: string): string | null {
  if (senha.length < 10) {
    return "A senha deve possuir pelo menos 10 caracteres."
  }

  if (!/[A-Z]/.test(senha)) {
    return "A senha deve possuir pelo menos uma letra maiúscula."
  }

  if (!/[a-z]/.test(senha)) {
    return "A senha deve possuir pelo menos uma letra minúscula."
  }

  if (!/[0-9]/.test(senha)) {
    return "A senha deve possuir pelo menos um número."
  }

  return null
}

export default function SetupInicialPage() {
  const router = useRouter()

  const [form, setForm] =
    useState<FormSetup>(FORM_INICIAL)

  const [verificando, setVerificando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  const [setupDisponivel, setSetupDisponivel] =
    useState(false)

  const [erro, setErro] =
    useState<string | null>(null)

  const [sucesso, setSucesso] =
    useState<string | null>(null)

  useEffect(() => {
    async function verificarSetup() {
      try {
        setVerificando(true)
        setErro(null)

        const response = await fetch(
          "/api/auth/setup-inicial",
          {
            method: "GET",
            cache: "no-store",
          }
        )

        const dados = await response.json()

        if (!response.ok) {
          throw new Error(
            dados.message ||
              "Erro ao verificar configuração inicial."
          )
        }

        if (!dados.configuracaoNecessaria) {
          setSetupDisponivel(false)

          setErro(
            "A configuração inicial já foi realizada. Utilize a tela de login."
          )

          return
        }

        setSetupDisponivel(true)
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao verificar configuração inicial."

        setErro(mensagem)
        setSetupDisponivel(false)
      } finally {
        setVerificando(false)
      }
    }

    verificarSetup()
  }, [])

  function atualizarCampo<
    K extends keyof FormSetup,
  >(
    campo: K,
    valor: FormSetup[K]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))

    if (erro) {
      setErro(null)
    }

    if (sucesso) {
      setSucesso(null)
    }
  }

  function validarFormulario(): string | null {
    if (!form.escritorioNome.trim()) {
      return "Informe o nome do escritório."
    }

    if (!form.diretorNome.trim()) {
      return "Informe o nome do Diretor."
    }

    if (!form.diretorEmail.trim()) {
      return "Informe o e-mail do Diretor."
    }

    if (!form.diretorLogin.trim()) {
      return "Informe o login do Diretor."
    }

    const erroSenhaDiretor =
      validarSenhaLocal(form.diretorSenha)

    if (erroSenhaDiretor) {
      return `Senha do Diretor: ${erroSenhaDiretor}`
    }

    if (
      form.diretorSenha !==
      form.diretorConfirmarSenha
    ) {
      return "A confirmação da senha do Diretor não confere."
    }

    if (form.criarAdministrativo) {
      if (!form.administrativoNome.trim()) {
        return "Informe o nome do usuário Administrativo."
      }

      if (!form.administrativoEmail.trim()) {
        return "Informe o e-mail do usuário Administrativo."
      }

      if (!form.administrativoLogin.trim()) {
        return "Informe o login do usuário Administrativo."
      }

      const erroSenhaAdministrativo =
        validarSenhaLocal(
          form.administrativoSenha
        )

      if (erroSenhaAdministrativo) {
        return `Senha do Administrativo: ${erroSenhaAdministrativo}`
      }

      if (
        form.administrativoSenha !==
        form.administrativoConfirmarSenha
      ) {
        return "A confirmação da senha do Administrativo não confere."
      }

      if (
        form.diretorEmail
          .trim()
          .toLowerCase() ===
        form.administrativoEmail
          .trim()
          .toLowerCase()
      ) {
        return "Diretor e Administrativo não podem utilizar o mesmo e-mail."
      }

      if (
        form.diretorLogin
          .trim()
          .toLowerCase() ===
        form.administrativoLogin
          .trim()
          .toLowerCase()
      ) {
        return "Diretor e Administrativo não podem utilizar o mesmo login."
      }
    }

    return null
  }

  async function salvarSetup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const erroValidacao =
      validarFormulario()

    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }

    try {
      setSalvando(true)
      setErro(null)
      setSucesso(null)

      const payload = {
        escritorio: {
          nome:
            form.escritorioNome.trim(),

          email:
            form.escritorioEmail.trim() ||
            null,

          telefone:
            form.escritorioTelefone.trim() ||
            null,

          whatsapp:
            form.escritorioWhatsapp.trim() ||
            null,

          observacoes:
            form.escritorioObservacoes.trim() ||
            null,
        },

        diretor: {
          nome:
            form.diretorNome.trim(),

          email:
            form.diretorEmail.trim(),

          login:
            form.diretorLogin.trim(),

          senha:
            form.diretorSenha,
        },

        administrativo: {
          criar:
            form.criarAdministrativo,

          nome:
            form.criarAdministrativo
              ? form.administrativoNome.trim()
              : null,

          email:
            form.criarAdministrativo
              ? form.administrativoEmail.trim()
              : null,

          login:
            form.criarAdministrativo
              ? form.administrativoLogin.trim()
              : null,

          senha:
            form.criarAdministrativo
              ? form.administrativoSenha
              : null,
        },
      }

      const response = await fetch(
        "/api/auth/setup-inicial",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(payload),
        }
      )

      const dados =
        await response.json()

      if (!response.ok) {
        throw new Error(
          dados.message ||
            "Erro ao realizar configuração inicial."
        )
      }

      setSucesso(
        "Configuração inicial concluída com sucesso."
      )

      setSetupDisponivel(false)

      window.setTimeout(() => {
        router.replace("/dashboard")
        router.refresh()
      }, 1200)
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao realizar configuração inicial."

      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span>
            Verificando configuração do sistema...
          </span>
        </div>
      </div>
    )
  }

  if (!setupDisponivel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Configuração do CRM
            </CardTitle>

            <CardDescription>
              Estado da configuração inicial.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {sucesso ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />

                  <div>
                    <p className="font-medium">
                      {sucesso}
                    </p>

                    <p className="text-sm mt-1">
                      Abrindo o CRM...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                {erro ||
                  "A configuração inicial não está disponível."}
              </div>
            )}

            {!sucesso && (
              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  router.push("/login")
                }
              >
                Ir para login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-7 w-7 text-blue-600" />

            <h1 className="text-3xl font-bold text-slate-900">
              Configuração Inicial do CRM
            </h1>
          </div>

          <p className="text-slate-600">
            Esta configuração será utilizada para criar a raiz institucional e os primeiros acessos do sistema.
          </p>
        </div>

        <form
          onSubmit={salvarSetup}
          className="space-y-6"
        >
          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Escritório
              </CardTitle>

              <CardDescription>
                Estrutura principal à qual usuários, representadas, clientes e contas bancárias serão vinculados.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="escritorioNome">
                  Nome do escritório *
                </Label>

                <Input
                  id="escritorioNome"
                  value={
                    form.escritorioNome
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "escritorioNome",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                  placeholder="Nome do escritório de representação"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="escritorioEmail">
                    E-mail
                  </Label>

                  <Input
                    id="escritorioEmail"
                    type="email"
                    value={
                      form.escritorioEmail
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "escritorioEmail",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="escritorioTelefone">
                    Telefone
                  </Label>

                  <Input
                    id="escritorioTelefone"
                    value={
                      form.escritorioTelefone
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "escritorioTelefone",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="escritorioWhatsapp">
                    WhatsApp
                  </Label>

                  <Input
                    id="escritorioWhatsapp"
                    value={
                      form.escritorioWhatsapp
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "escritorioWhatsapp",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="escritorioObservacoes">
                  Observações
                </Label>

                <Textarea
                  id="escritorioObservacoes"
                  value={
                    form.escritorioObservacoes
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "escritorioObservacoes",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Usuário Diretor
              </CardTitle>

              <CardDescription>
                Primeiro usuário com acesso administrativo completo ao CRM.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="diretorNome">
                    Nome *
                  </Label>

                  <Input
                    id="diretorNome"
                    value={
                      form.diretorNome
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "diretorNome",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="diretorEmail">
                    E-mail *
                  </Label>

                  <Input
                    id="diretorEmail"
                    type="email"
                    value={
                      form.diretorEmail
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "diretorEmail",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="diretorLogin">
                  Login *
                </Label>

                <Input
                  id="diretorLogin"
                  autoComplete="username"
                  value={
                    form.diretorLogin
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "diretorLogin",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="diretorSenha">
                    Senha *
                  </Label>

                  <Input
                    id="diretorSenha"
                    type="password"
                    autoComplete="new-password"
                    value={
                      form.diretorSenha
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "diretorSenha",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="diretorConfirmarSenha">
                    Confirmar senha *
                  </Label>

                  <Input
                    id="diretorConfirmarSenha"
                    type="password"
                    autoComplete="new-password"
                    value={
                      form.diretorConfirmarSenha
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "diretorConfirmarSenha",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Mínimo de 10 caracteres, incluindo letra maiúscula, letra minúscula e número.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Usuário Administrativo
              </CardTitle>

              <CardDescription>
                Pode ser criado agora ou posteriormente pelo Diretor.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    form.criarAdministrativo
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "criarAdministrativo",
                      event.target.checked
                    )
                  }
                  disabled={salvando}
                  className="h-4 w-4"
                />

                <span className="font-medium">
                  Criar usuário Administrativo agora
                </span>
              </label>

              {form.criarAdministrativo && (
                <div className="space-y-4 border-t pt-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="administrativoNome">
                        Nome *
                      </Label>

                      <Input
                        id="administrativoNome"
                        value={
                          form.administrativoNome
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "administrativoNome",
                            event.target.value
                          )
                        }
                        disabled={salvando}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="administrativoEmail">
                        E-mail *
                      </Label>

                      <Input
                        id="administrativoEmail"
                        type="email"
                        value={
                          form.administrativoEmail
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "administrativoEmail",
                            event.target.value
                          )
                        }
                        disabled={salvando}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="administrativoLogin">
                      Login *
                    </Label>

                    <Input
                      id="administrativoLogin"
                      autoComplete="username"
                      value={
                        form.administrativoLogin
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "administrativoLogin",
                          event.target.value
                        )
                      }
                      disabled={salvando}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="administrativoSenha">
                        Senha *
                      </Label>

                      <Input
                        id="administrativoSenha"
                        type="password"
                        autoComplete="new-password"
                        value={
                          form.administrativoSenha
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "administrativoSenha",
                            event.target.value
                          )
                        }
                        disabled={salvando}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="administrativoConfirmarSenha">
                        Confirmar senha *
                      </Label>

                      <Input
                        id="administrativoConfirmarSenha"
                        type="password"
                        autoComplete="new-password"
                        value={
                          form.administrativoConfirmarSenha
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "administrativoConfirmarSenha",
                            event.target.value
                          )
                        }
                        disabled={salvando}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Esta operação inicial é permitida apenas enquanto não existir nenhum Escritório nem Usuário no banco. Depois de concluída, o setup é bloqueado automaticamente.
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Configurando CRM...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Concluir configuração inicial
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}