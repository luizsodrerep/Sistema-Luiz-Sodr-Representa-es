"use client"

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  Download,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react"

import {
  NavigationButtons,
} from "@/components/navigation-buttons"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Input,
} from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type UsuarioReal = {
  id: string
  nome: string
  email: string
  login: string | null
  perfil: string
  ativo: boolean
  regiaoAtuacao: string | null
  cargo: string | null
  departamento: string | null
  telefone: string | null
  tipoVinculo: string | null
  ultimoAcessoEm: string | null
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

type FiltroStatus =
  | "todos"
  | "ativos"
  | "inativos"

type PerfilNovoUsuario =
  | ""
  | "Diretor"
  | "Administrativo"
  | "Preposto"

type FormNovoUsuario = {
  nome: string
  email: string
  login: string
  senha: string
  perfil: PerfilNovoUsuario
  cargo: string
  departamento: string
  telefone: string
  tipoVinculo: string
  regiaoAtuacao: string
  observacoes: string
}

const FORM_NOVO_USUARIO_INICIAL:
  FormNovoUsuario = {
    nome: "",
    email: "",
    login: "",
    senha: "",
    perfil: "",
    cargo: "",
    departamento: "",
    telefone: "",
    tipoVinculo: "",
    regiaoAtuacao: "",
    observacoes: "",
  }

function textoOuTraco(
  valor: string | null
): string {
  if (
    !valor ||
    valor.trim() === ""
  ) {
    return "—"
  }

  return valor
}

function formatarDataHora(
  valor: string | null
): string {
  if (!valor) {
    return "—"
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(data)
}

function escaparCsv(
  valor: unknown
): string {
  const texto =
    String(
      valor ?? ""
    )

  return `"${texto.replace(
    /"/g,
    '""'
  )}"`
}

export default function UsuariosPage() {
  const [
    usuarios,
    setUsuarios,
  ] =
    useState<UsuarioReal[]>([])

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  const [
    busca,
    setBusca,
  ] =
    useState("")

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<FiltroStatus>(
      "todos"
    )

  const [
    mostrarNovoUsuario,
    setMostrarNovoUsuario,
  ] =
    useState(false)

  const [
    formNovoUsuario,
    setFormNovoUsuario,
  ] =
    useState<FormNovoUsuario>(
      FORM_NOVO_USUARIO_INICIAL
    )

  const [
    salvandoNovoUsuario,
    setSalvandoNovoUsuario,
  ] =
    useState(false)

  const [
    erroNovoUsuario,
    setErroNovoUsuario,
  ] =
    useState<string | null>(
      null
    )

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] =
    useState<string | null>(
      null
    )

  async function carregarUsuarios() {
    setCarregando(true)
    setErro(null)

    try {
      const resposta =
        await fetch(
          "/api/usuarios",
          {
            method: "GET",
            cache: "no-store",
          }
        )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            "Não foi possível carregar os usuários."
        )
      }

      if (
        !Array.isArray(dados)
      ) {
        throw new Error(
          "Resposta inválida ao carregar usuários."
        )
      }

      setUsuarios(
        dados as UsuarioReal[]
      )
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao carregar usuários."

      setUsuarios([])
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarUsuarios()
  }, [])

  const usuariosFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          )

      return usuarios.filter(
        (usuario) => {
          if (
            filtroStatus ===
              "ativos" &&
            !usuario.ativo
          ) {
            return false
          }

          if (
            filtroStatus ===
              "inativos" &&
            usuario.ativo
          ) {
            return false
          }

          if (!termo) {
            return true
          }

          const campos = [
            usuario.nome,
            usuario.email,
            usuario.login,
            usuario.perfil,
            usuario.cargo,
            usuario.departamento,
            usuario.telefone,
            usuario.tipoVinculo,
            usuario.regiaoAtuacao,
          ]

          return campos.some(
            (campo) =>
              campo
                ?.toLocaleLowerCase(
                  "pt-BR"
                )
                .includes(
                  termo
                )
          )
        }
      )
    }, [
      usuarios,
      busca,
      filtroStatus,
    ])

  const totais =
    useMemo(() => {
      const ativos =
        usuarios.filter(
          (usuario) =>
            usuario.ativo
        ).length

      return {
        total:
          usuarios.length,
        ativos,
        inativos:
          usuarios.length -
          ativos,
      }
    }, [usuarios])

  function exportarCsv() {
    if (
      usuariosFiltrados.length ===
      0
    ) {
      return
    }

    const cabecalho = [
      "Nome",
      "Perfil",
      "Cargo",
      "Departamento",
      "E-mail",
      "Login",
      "Telefone",
      "Tipo de vínculo",
      "Região de atuação",
      "Status",
      "Último acesso",
      "Criado em",
    ]

    const linhas =
      usuariosFiltrados.map(
        (usuario) => [
          usuario.nome,
          usuario.perfil,
          usuario.cargo ?? "",
          usuario.departamento ??
            "",
          usuario.email,
          usuario.login ?? "",
          usuario.telefone ?? "",
          usuario.tipoVinculo ??
            "",
          usuario.regiaoAtuacao ??
            "",
          usuario.ativo
            ? "Ativo"
            : "Inativo",
          formatarDataHora(
            usuario.ultimoAcessoEm
          ),
          formatarDataHora(
            usuario.criadoEm
          ),
        ]
      )

    const csv = [
      cabecalho,
      ...linhas,
    ]
      .map((linha) =>
        linha
          .map(
            escaparCsv
          )
          .join(";")
      )
      .join("\r\n")

    const blob =
      new Blob(
        [
          "\uFEFF",
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        "a"
      )

    link.href = url
    link.download =
      "usuarios-crm.csv"

    document.body.appendChild(
      link
    )
    link.click()
    link.remove()

    URL.revokeObjectURL(
      url
    )
  }

  function abrirNovoUsuario() {
    setErroNovoUsuario(
      null
    )
    setMensagemSucesso(
      null
    )
    setFormNovoUsuario(
      FORM_NOVO_USUARIO_INICIAL
    )
    setMostrarNovoUsuario(
      true
    )
  }

  function fecharNovoUsuario() {
    if (
      salvandoNovoUsuario
    ) {
      return
    }

    setMostrarNovoUsuario(
      false
    )
    setErroNovoUsuario(
      null
    )
    setFormNovoUsuario(
      FORM_NOVO_USUARIO_INICIAL
    )
  }

  function atualizarCampoNovoUsuario(
    campo:
      keyof FormNovoUsuario,
    valor: string
  ) {
    setFormNovoUsuario(
      (atual) => ({
        ...atual,
        [campo]:
          valor,
      })
    )
  }

  async function criarNovoUsuario(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setErroNovoUsuario(
      null
    )
    setMensagemSucesso(
      null
    )

    if (
      !formNovoUsuario.nome.trim() ||
      !formNovoUsuario.email.trim() ||
      !formNovoUsuario.login.trim() ||
      !formNovoUsuario.senha ||
      !formNovoUsuario.perfil
    ) {
      setErroNovoUsuario(
        "Preencha nome, e-mail, login, senha inicial e perfil."
      )

      return
    }

    const confirmado =
      window.confirm(
        `Confirma a criação do usuário "${formNovoUsuario.nome.trim()}" com perfil "${formNovoUsuario.perfil}"?`
      )

    if (!confirmado) {
      return
    }

    setSalvandoNovoUsuario(
      true
    )

    try {
      const resposta =
        await fetch(
          "/api/usuarios",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              formNovoUsuario
            ),
          }
        )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            "Não foi possível criar o usuário."
        )
      }

      setMensagemSucesso(
        "Usuário criado com sucesso."
      )

      setFormNovoUsuario(
        FORM_NOVO_USUARIO_INICIAL
      )

      setMostrarNovoUsuario(
        false
      )

      await carregarUsuarios()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar usuário."

      setErroNovoUsuario(
        mensagem
      )
    } finally {
      setSalvandoNovoUsuario(
        false
      )
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Usuários
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Usuários reais vinculados ao escritório autenticado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={() =>
                void carregarUsuarios()
              }
              disabled={
                carregando
              }
            >
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={
                exportarCsv
              }
              disabled={
                carregando ||
                usuariosFiltrados.length ===
                  0
              }
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>

            <Button
              size="sm"
              className="h-9 gap-1"
              onClick={
                abrirNovoUsuario
              }
              disabled={
                salvandoNovoUsuario
              }
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-950">
                Gestão real de usuários
              </p>

              <p className="text-sm text-blue-900/80">
                O Diretor pode cadastrar usuários reais do escritório.
                Edição, ativação, desativação e permissões individuais
                serão habilitadas nas próximas etapas.
              </p>
            </div>
          </CardContent>
        </Card>

        {mensagemSucesso && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {
              mensagemSucesso
            }
          </div>
        )}

        {mostrarNovoUsuario && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  Novo Usuário
                </CardTitle>

                <CardDescription className="mt-1">
                  Cadastre um usuário real no escritório atual.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={
                  fecharNovoUsuario
                }
                disabled={
                  salvandoNovoUsuario
                }
                title="Fechar cadastro"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-6"
                onSubmit={
                  criarNovoUsuario
                }
              >
                {erroNovoUsuario && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {
                      erroNovoUsuario
                    }
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="novo-usuario-nome"
                      className="text-sm font-medium"
                    >
                      Nome *
                    </label>

                    <Input
                      id="novo-usuario-nome"
                      value={
                        formNovoUsuario.nome
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampoNovoUsuario(
                          "nome",
                          event.target.value
                        )
                      }
                      autoComplete="name"
                      disabled={
                        salvandoNovoUsuario
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="novo-usuario-perfil"
                      className="text-sm font-medium"
                    >
                      Perfil *
                    </label>

                    <select
                      id="novo-usuario-perfil"
                      value={
                        formNovoUsuario.perfil
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampoNovoUsuario(
                          "perfil",
                          event.target.value
                        )
                      }
                      disabled={
                        salvandoNovoUsuario
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        Selecione
                      </option>
                      <option value="Diretor">
                        Diretor
                      </option>
                      <option value="Administrativo">
                        Administrativo
                      </option>
                      <option value="Preposto">
                        Preposto
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="novo-usuario-email"
                      className="text-sm font-medium"
                    >
                      E-mail *
                    </label>

                    <Input
                      id="novo-usuario-email"
                      type="email"
                      value={
                        formNovoUsuario.email
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampoNovoUsuario(
                          "email",
                          event.target.value
                        )
                      }
                      autoComplete="email"
                      disabled={
                        salvandoNovoUsuario
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="novo-usuario-login"
                      className="text-sm font-medium"
                    >
                      Login *
                    </label>

                    <Input
                      id="novo-usuario-login"
                      value={
                        formNovoUsuario.login
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampoNovoUsuario(
                          "login",
                          event.target.value
                        )
                      }
                      autoComplete="username"
                      disabled={
                        salvandoNovoUsuario
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="novo-usuario-senha"
                      className="text-sm font-medium"
                    >
                      Senha inicial *
                    </label>

                    <Input
                      id="novo-usuario-senha"
                      type="password"
                      value={
                        formNovoUsuario.senha
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampoNovoUsuario(
                          "senha",
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      disabled={
                        salvandoNovoUsuario
                      }
                    />

                    <p className="text-xs text-muted-foreground">
                      Mínimo de 10 caracteres, com letra maiúscula,
                      letra minúscula e número.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-5">
                  <p className="mb-4 text-sm font-medium">
                    Informações profissionais
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="novo-usuario-cargo"
                        className="text-sm font-medium"
                      >
                        Cargo
                      </label>

                      <Input
                        id="novo-usuario-cargo"
                        value={
                          formNovoUsuario.cargo
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "cargo",
                            event.target.value
                          )
                        }
                        disabled={
                          salvandoNovoUsuario
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="novo-usuario-departamento"
                        className="text-sm font-medium"
                      >
                        Departamento
                      </label>

                      <Input
                        id="novo-usuario-departamento"
                        value={
                          formNovoUsuario.departamento
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "departamento",
                            event.target.value
                          )
                        }
                        disabled={
                          salvandoNovoUsuario
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="novo-usuario-telefone"
                        className="text-sm font-medium"
                      >
                        Telefone
                      </label>

                      <Input
                        id="novo-usuario-telefone"
                        value={
                          formNovoUsuario.telefone
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "telefone",
                            event.target.value
                          )
                        }
                        autoComplete="tel"
                        disabled={
                          salvandoNovoUsuario
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="novo-usuario-vinculo"
                        className="text-sm font-medium"
                      >
                        Tipo de vínculo
                      </label>

                      <Input
                        id="novo-usuario-vinculo"
                        value={
                          formNovoUsuario.tipoVinculo
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "tipoVinculo",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Sócio, Funcionário, Preposto"
                        disabled={
                          salvandoNovoUsuario
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="novo-usuario-regiao"
                        className="text-sm font-medium"
                      >
                        Região de atuação
                      </label>

                      <Input
                        id="novo-usuario-regiao"
                        value={
                          formNovoUsuario.regiaoAtuacao
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "regiaoAtuacao",
                            event.target.value
                          )
                        }
                        disabled={
                          salvandoNovoUsuario
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="novo-usuario-observacoes"
                        className="text-sm font-medium"
                      >
                        Observações
                      </label>

                      <textarea
                        id="novo-usuario-observacoes"
                        value={
                          formNovoUsuario.observacoes
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampoNovoUsuario(
                            "observacoes",
                            event.target.value
                          )
                        }
                        rows={4}
                        disabled={
                          salvandoNovoUsuario
                        }
                        className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      fecharNovoUsuario
                    }
                    disabled={
                      salvandoNovoUsuario
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      salvandoNovoUsuario
                    }
                  >
                    {salvandoNovoUsuario ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Usuário
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totais.total}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Ativos
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totais.ativos}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Inativos
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totais.inativos}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <Input
              type="search"
              placeholder="Buscar por nome, e-mail, perfil, cargo..."
              className="w-full bg-white pl-8 dark:bg-gray-950"
              value={busca}
              onChange={(
                event
              ) =>
                setBusca(
                  event.target.value
                )
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={
                filtroStatus ===
                "todos"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "todos"
                )
              }
            >
              Todos
            </Button>

            <Button
              variant={
                filtroStatus ===
                "ativos"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "ativos"
                )
              }
            >
              Ativos
            </Button>

            <Button
              variant={
                filtroStatus ===
                "inativos"
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                setFiltroStatus(
                  "inativos"
                )
              }
            >
              Inativos
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>
              Lista de Usuários
            </CardTitle>

            <CardDescription>
              Exibindo{" "}
              {
                usuariosFiltrados.length
              }{" "}
              de{" "}
              {usuarios.length}{" "}
              usuário(s).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {erro ? (
              <div className="p-6">
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {erro}
                </div>
              </div>
            ) : carregando ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando usuários...
              </div>
            ) : usuariosFiltrados.length ===
              0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado para os filtros informados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Nome
                      </TableHead>

                      <TableHead>
                        Perfil
                      </TableHead>

                      <TableHead>
                        Cargo
                      </TableHead>

                      <TableHead>
                        Departamento
                      </TableHead>

                      <TableHead>
                        E-mail
                      </TableHead>

                      <TableHead>
                        Telefone
                      </TableHead>

                      <TableHead>
                        Último acesso
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead className="text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {usuariosFiltrados.map(
                      (
                        usuario
                      ) => (
                        <TableRow
                          key={
                            usuario.id
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="rounded-full bg-primary/10 p-2">
                                <User className="h-4 w-4 text-primary" />
                              </div>

                              <div>
                                <div className="font-medium">
                                  {
                                    usuario.nome
                                  }
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  Login:{" "}
                                  {textoOuTraco(
                                    usuario.login
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {
                              usuario.perfil
                            }
                          </TableCell>

                          <TableCell>
                            {textoOuTraco(
                              usuario.cargo
                            )}
                          </TableCell>

                          <TableCell>
                            {textoOuTraco(
                              usuario.departamento
                            )}
                          </TableCell>

                          <TableCell>
                            {
                              usuario.email
                            }
                          </TableCell>

                          <TableCell>
                            {textoOuTraco(
                              usuario.telefone
                            )}
                          </TableCell>

                          <TableCell>
                            {formatarDataHora(
                              usuario.ultimoAcessoEm
                            )}
                          </TableCell>

                          <TableCell>
                            <span
                              className={
                                usuario.ativo
                                  ? "inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800"
                                  : "inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
                              }
                            >
                              {usuario.ativo
                                ? "Ativo"
                                : "Inativo"}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                            >
                              <Link
                                href={`/usuarios/${usuario.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                Detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}