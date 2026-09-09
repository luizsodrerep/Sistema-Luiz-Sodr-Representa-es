"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"
import {
  useParams,
} from "next/navigation"

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MinusCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
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
  obterPermissao,
  type RecursoSistema,
} from "@/lib/auth/permissions"

type PerfilUsuarioLocal =
  | "Diretor"
  | "Administrativo"
  | "Preposto"

type PermissaoIndividual = {
  id: string
  recurso: string
  ver: boolean | null
  criar: boolean | null
  editar: boolean | null
  excluir: boolean | null
  administrar: boolean | null
  escopo: string | null
  criadoEm: string
  atualizadoEm: string
}

type UsuarioDetalhe = {
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

  permissoes: PermissaoIndividual[]
}

const RECURSOS:
  readonly {
    recurso: RecursoSistema
    label: string
  }[] = [
    {
      recurso: "dashboard",
      label: "Dashboard",
    },
    {
      recurso: "clientes",
      label: "Clientes",
    },
    {
      recurso: "representadas",
      label: "Representadas",
    },
    {
      recurso:
        "contratosRepresentada",
      label:
        "Contratos de Representadas",
    },
    {
      recurso:
        "regrasComerciais",
      label:
        "Regras Comerciais",
    },
    {
      recurso:
        "contasRecebimento",
      label:
        "Contas de Recebimento",
    },
    {
      recurso: "vendas",
      label: "Vendas",
    },
    {
      recurso: "faturamento",
      label: "Faturamento",
    },
    {
      recurso: "interacoes",
      label: "Interações",
    },
    {
      recurso: "agenda",
      label: "Agenda",
    },
    {
      recurso: "mapa",
      label: "Mapa",
    },
    {
      recurso: "relatorios",
      label: "Relatórios",
    },
    {
      recurso: "financeiro",
      label: "Financeiro",
    },
    {
      recurso: "contabilidade",
      label: "Contabilidade",
    },
    {
      recurso: "usuarios",
      label: "Usuários",
    },
    {
      recurso: "configuracoes",
      label: "Configurações",
    },
    {
      recurso: "auditoria",
      label: "Auditoria",
    },
  ]

function perfilValido(
  valor: string
): valor is PerfilUsuarioLocal {
  return (
    valor === "Diretor" ||
    valor === "Administrativo" ||
    valor === "Preposto"
  )
}

function obterPermissaoDoPerfil(
  perfil: string,
  recurso: RecursoSistema
) {
  if (!perfilValido(perfil)) {
    return null
  }

  return obterPermissao(
    perfil,
    recurso
  )
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

function rotuloAcao(
  acao: string
): string {
  switch (acao) {
    case "ver":
      return "Ver"

    case "criar":
      return "Criar"

    case "editar":
      return "Editar"

    case "excluir":
      return "Excluir"

    case "administrar":
      return "Administrar"

    default:
      return acao
  }
}

function rotuloEscopo(
  escopo: string
): string {
  switch (escopo) {
    case "todos":
      return "Todos os dados"

    case "operacional":
      return "Operacional"

    case "proprios":
      return "Próprios"

    case "nenhum":
      return "Nenhum"

    default:
      return escopo
  }
}

function IndicadorIndividual({
  valor,
}: {
  valor: boolean | null
}) {
  if (valor === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Sim
      </span>
    )
  }

  if (valor === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
        <XCircle className="h-3.5 w-3.5" />
        Não
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
      <MinusCircle className="h-3.5 w-3.5" />
      Herda
    </span>
  )
}

export default function UsuarioDetalhePage() {
  const params =
    useParams<{
      id: string
    }>()

  const id =
    typeof params.id ===
      "string"
      ? params.id
      : ""

  const [
    usuario,
    setUsuario,
  ] =
    useState<UsuarioDetalhe | null>(
      null
    )

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

  async function carregarUsuario() {
    if (!id) {
      setUsuario(null)
      setErro(
        "Identificador do usuário inválido."
      )
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const resposta =
        await fetch(
          `/api/usuarios/${encodeURIComponent(
            id
          )}`,
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
            "Não foi possível carregar o usuário."
        )
      }

      setUsuario(
        dados as UsuarioDetalhe
      )
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao carregar usuário."

      setUsuario(null)
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarUsuario()
  }, [id])

  const permissoesIndividuaisPorRecurso =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          PermissaoIndividual
        >()

      for (
        const permissao of
        usuario?.permissoes ?? []
      ) {
        mapa.set(
          permissao.recurso,
          permissao
        )
      }

      return mapa
    }, [usuario])

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2">
              <Link
                href="/usuarios"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Usuários
              </Link>
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Detalhes do Usuário
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Consulta somente leitura dos dados reais do usuário.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() =>
              void carregarUsuario()
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
        </div>

        {erro && (
          <Card className="border-red-200">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-red-800">
                {erro}
              </p>
            </CardContent>
          </Card>
        )}

        {carregando ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando usuário...
            </CardContent>
          </Card>
        ) : usuario ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <UserRound className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <CardTitle>
                        {
                          usuario.nome
                        }
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Perfil:{" "}
                        {
                          usuario.perfil
                        }
                      </CardDescription>
                    </div>
                  </div>

                  <span
                    className={
                      usuario.ativo
                        ? "inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
                        : "inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800"
                    }
                  >
                    {usuario.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      E-mail
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        usuario.email
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Login
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.login
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Perfil
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        usuario.perfil
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Cargo
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.cargo
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Departamento
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.departamento
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Telefone
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.telefone
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tipo de vínculo
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.tipoVinculo
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Região de atuação
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {textoOuTraco(
                        usuario.regiaoAtuacao
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Último acesso
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatarDataHora(
                        usuario.ultimoAcessoEm
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Criado em
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatarDataHora(
                        usuario.criadoEm
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Atualizado em
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatarDataHora(
                        usuario.atualizadoEm
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Observações
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {textoOuTraco(
                      usuario.observacoes
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="flex gap-3 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-950">
                    Estado atual das permissões
                  </p>

                  <p className="text-sm text-blue-900/80">
                    A autorização atualmente aplicada pelo CRM continua sendo
                    a matriz base do perfil. Registros de permissão individual
                    são exibidos abaixo apenas para diagnóstico e preparação
                    da próxima etapa; eles ainda não alteram o runtime de
                    autorização.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Permissões do Perfil
                </CardTitle>

                <CardDescription>
                  Regra base atualmente utilizada pelo sistema para este usuário.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {perfilValido(
                  usuario.perfil
                ) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="px-3 py-3 font-medium">
                            Recurso
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Ações do perfil
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Escopo
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Permissão individual cadastrada
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {RECURSOS.map(
                          ({
                            recurso,
                            label,
                          }) => {
                            const base =
                              obterPermissaoDoPerfil(
                                usuario.perfil,
                                recurso
                              )

                            const individual =
                              permissoesIndividuaisPorRecurso.get(
                                recurso
                              )

                            return (
                              <tr
                                key={
                                  recurso
                                }
                                className="border-b align-top last:border-b-0"
                              >
                                <td className="px-3 py-4 font-medium">
                                  {
                                    label
                                  }

                                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                                    {
                                      recurso
                                    }
                                  </div>
                                </td>

                                <td className="px-3 py-4">
                                  {base ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {base.acoes.map(
                                        (
                                          acao
                                        ) => (
                                          <span
                                            key={
                                              acao
                                            }
                                            className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                                          >
                                            {rotuloAcao(
                                              acao
                                            )}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                      Sem acesso
                                    </span>
                                  )}
                                </td>

                                <td className="px-3 py-4">
                                  {base ? (
                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                      {rotuloEscopo(
                                        base.escopo
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </td>

                                <td className="px-3 py-4">
                                  {individual ? (
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap gap-1.5">
                                        <span className="text-xs text-muted-foreground">
                                          Ver:
                                        </span>
                                        <IndicadorIndividual
                                          valor={
                                            individual.ver
                                          }
                                        />

                                        <span className="ml-1 text-xs text-muted-foreground">
                                          Criar:
                                        </span>
                                        <IndicadorIndividual
                                          valor={
                                            individual.criar
                                          }
                                        />

                                        <span className="ml-1 text-xs text-muted-foreground">
                                          Editar:
                                        </span>
                                        <IndicadorIndividual
                                          valor={
                                            individual.editar
                                          }
                                        />

                                        <span className="ml-1 text-xs text-muted-foreground">
                                          Excluir:
                                        </span>
                                        <IndicadorIndividual
                                          valor={
                                            individual.excluir
                                          }
                                        />

                                        <span className="ml-1 text-xs text-muted-foreground">
                                          Administrar:
                                        </span>
                                        <IndicadorIndividual
                                          valor={
                                            individual.administrar
                                          }
                                        />
                                      </div>

                                      <div className="text-xs text-muted-foreground">
                                        Escopo individual:{" "}
                                        <span className="font-medium text-foreground">
                                          {individual.escopo
                                            ? rotuloEscopo(
                                                individual.escopo
                                              )
                                            : "Herda"}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      Nenhuma — herda integralmente o perfil base.
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    O usuário possui um perfil não reconhecido pela matriz atual
                    de permissões.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Permissões Individuais Registradas
                </CardTitle>

                <CardDescription>
                  Registros persistidos em UsuarioPermissao para este usuário.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {usuario.permissoes.length ===
                0 ? (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                    Nenhuma permissão individual está cadastrada. O usuário
                    herda integralmente as regras do perfil base.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usuario.permissoes.map(
                      (
                        permissao
                      ) => (
                        <div
                          key={
                            permissao.id
                          }
                          className="rounded-md border p-4"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium">
                                {
                                  permissao.recurso
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Atualizado em{" "}
                                {formatarDataHora(
                                  permissao.atualizadoEm
                                )}
                              </p>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Escopo:{" "}
                              <span className="font-medium text-foreground">
                                {permissao.escopo
                                  ? rotuloEscopo(
                                      permissao.escopo
                                    )
                                  : "Herda"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}