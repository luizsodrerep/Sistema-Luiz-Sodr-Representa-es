"use client"

import {
  use,
  useEffect,
  useState,
} from "react"
import Link from "next/link"

import {
  PageLayout,
} from "@/components/page-layout"
import {
  NavigationButtons,
} from "@/components/navigation-buttons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Button,
} from "@/components/ui/button"

import {
  formatarCodigoInteracao,
} from "@/lib/interacoes/codigo"

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Factory,
  History,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  User,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  contato: string | null
  cargo: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Interacao = {
  id: string
  numeroSequencial: number

  data: string
  tipo: string

  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null

  proximoContatoEm: string | null
  statusFollowUp: string

  clienteId: string | null
  representadaId: string | null

  cliente: Cliente | null
  representada: Representada | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null

  criadoEm: string
  atualizadoEm: string
}

type SnapshotInteracao = {
  id?: string
  numeroSequencial?: number

  tipo?: string | null
  assunto?: string | null
  descricao?: string | null
  resultado?: string | null
  proximosPasso?: string | null

  proximoContatoEm?: string | null
  statusFollowUp?: string | null

  clienteId?: string | null
  representadaId?: string | null
  responsavelId?: string | null

  atualizadoEm?: string | null
}

type HistoricoItem = {
  id: string
  acao: string
  criadoEm: string

  usuario: UsuarioResumo | null

  dadosAntes:
    | SnapshotInteracao
    | null

  dadosDepois:
    | SnapshotInteracao
    | null
}

type HistoricoResponse = {
  interacaoId: string
  numeroSequencial: number
  totalAlteracoes: number
  historico: HistoricoItem[]
}

const corTipo: Record<
  string,
  string
> = {
  WhatsApp:
    "bg-green-100 text-green-800",

  "E-mail":
    "bg-blue-100 text-blue-800",

  Visita:
    "bg-orange-100 text-orange-800",

  Ligação:
    "bg-purple-100 text-purple-800",

  Outro:
    "bg-gray-100 text-gray-800",
}

function formatarData(
  valor: string | null
) {
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

  return data.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

function foiEditada(
  criadoEm: string,
  atualizadoEm: string
) {
  const criado =
    new Date(
      criadoEm
    ).getTime()

  const atualizado =
    new Date(
      atualizadoEm
    ).getTime()

  if (
    Number.isNaN(criado) ||
    Number.isNaN(atualizado)
  ) {
    return false
  }

  return (
    atualizado - criado >
    2000
  )
}

function valorLegivel(
  campo: string,
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—"
  }

  if (
    campo ===
      "proximoContatoEm" &&
    typeof valor ===
      "string"
  ) {
    return formatarData(
      valor
    )
  }

  return String(valor)
}

const nomesCampos: Record<
  string,
  string
> = {
  tipo:
    "Tipo",

  assunto:
    "Assunto",

  descricao:
    "Descrição",

  resultado:
    "Resultado",

  proximosPasso:
    "Próximos passos",

  proximoContatoEm:
    "Próximo acompanhamento",

  statusFollowUp:
    "Status",

  clienteId:
    "Cliente",

  representadaId:
    "Representada",

  responsavelId:
    "Responsável",
}

function obterAlteracoes(
  item: HistoricoItem
) {
  const antes =
    item.dadosAntes ||
    {}

  const depois =
    item.dadosDepois ||
    {}

  const campos =
    Object.keys(
      nomesCampos
    )

  return campos
    .filter(
      (
        campo
      ) => {
        const chave =
          campo as keyof SnapshotInteracao

        return (
          antes[
            chave
          ] !==
          depois[
            chave
          ]
        )
      }
    )
    .map(
      (
        campo
      ) => {
        const chave =
          campo as keyof SnapshotInteracao

        return {
          campo:
            nomesCampos[
              campo
            ],

          antes:
            valorLegivel(
              campo,
              antes[
                chave
              ]
            ),

          depois:
            valorLegivel(
              campo,
              depois[
                chave
              ]
            ),
        }
      }
    )
}

export default function InteracaoDetalhesPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } =
    use(params)

  const [
    interacao,
    setInteracao,
  ] =
    useState<Interacao | null>(
      null
    )

  const [
    historico,
    setHistorico,
  ] =
    useState<HistoricoItem[]>(
      []
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    loadingHistorico,
    setLoadingHistorico,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    erroHistorico,
    setErroHistorico,
  ] =
    useState<
      string | null
    >(null)

  const [
    historicoAberto,
    setHistoricoAberto,
  ] =
    useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setErro(null)

        const response =
          await fetch(
            `/api/interacoes/${id}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          )

        const data =
          await response
            .json()
            .catch(
              () => null
            )

        if (
          !response.ok
        ) {
          setErro(
            data?.message ||
              "Não foi possível carregar a interação."
          )

          return
        }

        setInteracao(
          data
        )
      } catch {
        setErro(
          "Erro ao carregar interação. Tente novamente."
        )
      } finally {
        setLoading(
          false
        )
      }
    }

    carregar()
  }, [id])

  useEffect(() => {
    async function carregarHistorico() {
      try {
        setLoadingHistorico(
          true
        )

        setErroHistorico(
          null
        )

        const response =
          await fetch(
            `/api/interacoes/${id}/historico`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          )

        const data:
          | HistoricoResponse
          | {
              message?: string
            } =
          await response
            .json()
            .catch(
              () => ({
                message:
                  "Resposta inválida.",
              })
            )

        if (
          !response.ok
        ) {
          setErroHistorico(
            "message" in
              data &&
              data.message
              ? data.message
              : "Não foi possível carregar o histórico."
          )

          return
        }

        if (
          "historico" in
            data &&
          Array.isArray(
            data.historico
          )
        ) {
          setHistorico(
            data.historico
          )
        }
      } catch {
        setErroHistorico(
          "Erro ao carregar histórico de alterações."
        )
      } finally {
        setLoadingHistorico(
          false
        )
      }
    }

    carregarHistorico()
  }, [id])

  if (loading) {
    return (
      <PageLayout title="Carregando...">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando interação...
        </div>
      </PageLayout>
    )
  }

  if (
    erro &&
    !interacao
  ) {
    return (
      <PageLayout title="Interação">
        <NavigationButtons
          backLabel="Voltar para Interações"
          backHref="/interacoes"
        />

        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          <AlertCircle className="h-6 w-6" />

          <p>
            {erro}
          </p>
        </div>
      </PageLayout>
    )
  }

  if (!interacao) {
    return null
  }

  const editada =
    foiEditada(
      interacao.criadoEm,
      interacao.atualizadoEm
    )

  const codigo =
    formatarCodigoInteracao(
      interacao.numeroSequencial
    )

  const origemCliente =
    interacao.cliente !==
    null

  const origemRepresentada =
    interacao.representada !==
    null

  const nomeOrigem =
    interacao.cliente
      ? interacao.cliente
          .nomeFantasia ||
        interacao.cliente
          .razaoSocial
      : interacao
          .representada
        ? interacao
            .representada
            .nome
        : "Origem não disponível"

  const tipoOrigem =
    origemCliente
      ? "Cliente"
      : origemRepresentada
        ? "Representada"
        : "Registro"

  const ultimaEdicao =
    historico.length >
    0
      ? historico[0]
      : null

  return (
    <PageLayout title="Detalhes da Interação">
      <NavigationButtons
        backLabel="Voltar para Interações"
        backHref="/interacoes"
      />

      <div className="mb-4 mt-3 rounded-lg border bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código da interação
            </p>

            <p className="mt-1 font-mono text-xl font-bold text-slate-900">
              {codigo}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Identificação permanente deste registro.
            </p>
          </div>

          <div className="rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground">
            Sequencial interno:{" "}
            <span className="font-semibold text-slate-700">
              {
                interacao.numeroSequencial
              }
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {origemCliente ? (
            <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
          ) : origemRepresentada ? (
            <Factory className="h-5 w-5 shrink-0 text-orange-600" />
          ) : (
            <ClipboardList className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {nomeOrigem}
            </p>

            <p className="text-xs text-muted-foreground">
              {tipoOrigem}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              corTipo[
                interacao.tipo
              ] ??
              "bg-gray-100 text-gray-800"
            }`}
          >
            {
              interacao.tipo
            }
          </span>

          {editada && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              Editada
            </span>
          )}
        </div>

        <Link
          href={`/interacoes/${id}/editar`}
        >
          <Button
            variant="outline"
            size="sm"
          >
            <Pencil className="mr-2 h-4 w-4" />

            Editar
          </Button>
        </Link>
      </div>

      {erro && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          {erro}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Registro da Interação
            </CardTitle>

            <CardDescription>
              Histórico comercial preservado sob o código{" "}
              <span className="font-mono font-medium">
                {codigo}
              </span>
              .
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Data e hora
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />

                  {formatarData(
                    interacao.data
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Registrado por
                </p>

                <p className="mt-1 text-sm font-medium">
                  {interacao.criadoPor
                    ?.nome ||
                    "Usuário não identificado"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {interacao.criadoPor
                    ?.perfil ||
                    "—"}
                </p>
              </div>
            </div>

            {interacao.assunto && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Assunto
                </p>

                <p className="mt-1 text-sm font-medium">
                  {
                    interacao.assunto
                  }
                </p>
              </div>
            )}

            {interacao.descricao && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Descrição
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/10 p-3 text-sm">
                  {
                    interacao.descricao
                  }
                </div>
              </div>
            )}

            {interacao.resultado && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  Resultado
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-green-50 p-3 text-sm">
                  {
                    interacao.resultado
                  }
                </div>
              </div>
            )}

            {interacao.proximosPasso && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-blue-600" />

                  Próximos Passos
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-blue-50 p-3 text-sm">
                  {
                    interacao.proximosPasso
                  }
                </div>
              </div>
            )}

            {interacao.proximoContatoEm && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-600" />

                  Próximo acompanhamento
                </p>

                <div className="mt-1 rounded-md border bg-amber-50 p-3">
                  <p className="text-sm font-medium">
                    {formatarData(
                      interacao.proximoContatoEm
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Status:{" "}
                    {
                      interacao.statusFollowUp
                    }
                  </p>

                  {interacao.responsavel && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responsável:{" "}
                      {
                        interacao.responsavel.nome
                      }{" "}
                      —{" "}
                      {
                        interacao.responsavel.perfil
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-3 text-xs text-muted-foreground">
              <p>
                Código:{" "}
                <span className="font-mono font-medium text-slate-700">
                  {codigo}
                </span>
              </p>

              <p className="mt-1">
                Criada em:{" "}
                {formatarData(
                  interacao.criadoEm
                )}
                {" — "}
                {interacao.criadoPor
                  ?.nome ||
                  "Usuário não identificado"}
              </p>

              {editada && (
                <>
                  <p className="mt-1 font-medium text-amber-700">
                    Última edição:{" "}
                    {formatarData(
                      interacao.atualizadoEm
                    )}

                    {ultimaEdicao
                      ?.usuario
                      ? ` — ${ultimaEdicao.usuario.nome} — ${ultimaEdicao.usuario.perfil}`
                      : ""}
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    Total de alterações registradas:{" "}
                    <strong>
                      {
                        historico.length
                      }
                    </strong>
                  </p>
                </>
              )}
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() =>
                  setHistoricoAberto(
                    (
                      atual
                    ) =>
                      !atual
                  )
                }
              >
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />

                  Histórico de alterações (
                  {
                    historico.length
                  }
                  )
                </span>

                {historicoAberto ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {historicoAberto && (
                <div className="mt-3 space-y-3">
                  {loadingHistorico ? (
                    <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Carregando histórico...
                    </div>
                  ) : erroHistorico ? (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {
                        erroHistorico
                      }
                    </div>
                  ) : historico.length ===
                    0 ? (
                    <div className="rounded-md border p-4 text-sm text-muted-foreground">
                      Nenhuma alteração registrada.
                    </div>
                  ) : (
                    historico.map(
                      (
                        item,
                        index
                      ) => {
                        const alteracoes =
                          obterAlteracoes(
                            item
                          )

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="rounded-md border bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold">
                                  Alteração{" "}
                                  {
                                    historico.length -
                                    index
                                  }
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {item.usuario
                                    ?.nome ||
                                    "Usuário não identificado"}
                                  {" — "}
                                  {item.usuario
                                    ?.perfil ||
                                    "—"}
                                </p>
                              </div>

                              <p className="text-xs font-medium text-slate-600">
                                {formatarData(
                                  item.criadoEm
                                )}
                              </p>
                            </div>

                            {alteracoes.length >
                            0 ? (
                              <div className="mt-3 space-y-2">
                                {alteracoes.map(
                                  (
                                    alteracao,
                                    alteracaoIndex
                                  ) => (
                                    <div
                                      key={`${item.id}-${alteracaoIndex}`}
                                      className="rounded-md bg-white p-3 text-sm"
                                    >
                                      <p className="font-medium">
                                        {
                                          alteracao.campo
                                        }
                                      </p>

                                      <div className="mt-1 grid gap-1 text-xs sm:grid-cols-2">
                                        <div>
                                          <span className="text-muted-foreground">
                                            Antes:{" "}
                                          </span>

                                          <span>
                                            {
                                              alteracao.antes
                                            }
                                          </span>
                                        </div>

                                        <div>
                                          <span className="text-muted-foreground">
                                            Depois:{" "}
                                          </span>

                                          <span>
                                            {
                                              alteracao.depois
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="mt-3 text-xs text-muted-foreground">
                                Alteração registrada sem diferença operacional identificada nos campos exibidos.
                              </p>
                            )}
                          </div>
                        )
                      }
                    )
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {origemCliente
                ? "Dados do Cliente"
                : origemRepresentada
                  ? "Dados da Representada"
                  : "Origem"}
            </CardTitle>

            <CardDescription>
              Informações relacionadas ao registro.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {interacao.cliente && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Empresa
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao.cliente.razaoSocial
                    }
                  </p>

                  {interacao.cliente.nomeFantasia && (
                    <p className="text-xs text-muted-foreground">
                      {
                        interacao.cliente.nomeFantasia
                      }
                    </p>
                  )}
                </div>

                {interacao.cliente.contato && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao.cliente.contato
                      }

                      {interacao.cliente.cargo
                        ? ` — ${interacao.cliente.cargo}`
                        : ""}
                    </p>
                  </div>
                )}

                {interacao.cliente.whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.cliente.whatsapp
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.cliente.whatsapp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.cliente.telefone && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.cliente.telefone
                        }
                      </p>

                      <a
                        href={`tel:${interacao.cliente.telefone.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.cliente.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao.cliente.email
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.cliente.email}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  href={`/clientes/${interacao.cliente.id}`}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />

                    Ver Cliente
                  </Button>
                </Link>
              </>
            )}

            {interacao.representada && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Representada
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao.representada.nome
                    }
                  </p>
                </div>

                {interacao.representada.cnpj && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CNPJ
                    </p>

                    <p className="text-sm">
                      {
                        interacao.representada.cnpj
                      }
                    </p>
                  </div>
                )}

                {interacao.representada.contatoPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao.representada.contatoPrincipal
                      }
                    </p>
                  </div>
                )}

                {interacao.representada.whatsappPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.representada.whatsappPrincipal
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.representada.whatsappPrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.representada.telefonePrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao.representada.telefonePrincipal
                        }
                      </p>

                      <a
                        href={`tel:${interacao.representada.telefonePrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao.representada.emailPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao.representada.emailPrincipal
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.representada.emailPrincipal}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  href={`/representadas/${interacao.representada.id}`}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Factory className="mr-2 h-4 w-4" />

                    Ver Representada
                  </Button>
                </Link>
              </>
            )}

            {!interacao.cliente &&
              !interacao.representada && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />

                  Origem não disponível.
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}