"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
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
              disabled
              title="Cadastro de novos usuários será habilitado na próxima etapa do módulo."
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
                Dados reais do CRM
              </p>

              <p className="text-sm text-blue-900/80">
                Esta tela não utiliza mais usuários demonstrativos.
                Cadastro, edição e permissões individuais serão habilitados
                de forma controlada nas próximas etapas.
              </p>
            </div>
          </CardContent>
        </Card>

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
