"use client"

import {
  useCallback,
  useEffect,
  useMemo,
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
  Input,
} from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  AlertCircle,
  Building2,
  Calendar,
  ClipboardList,
  Eye,
  Factory,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Interacao = {
  id: string

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

const corTipo: Record<string, string> = {
  WhatsApp:
    "bg-green-100 text-green-800",

  "E-mail":
    "bg-blue-100 text-blue-800",

  Visita:
    "bg-orange-100 text-orange-800",

  Ligação:
    "bg-purple-100 text-purple-800",
}

const TIPOS_ABA: Record<
  string,
  string
> = {
  todas: "todas",
  whatsapp: "WhatsApp",
  email: "E-mail",
  visita: "Visita",
  ligacao: "Ligação",
}

type FiltroSituacao =
  | "todas"
  | "pendentes"
  | "acompanhar"
  | "finalizadas"
  | "sem-acompanhamento"

function iconeTipo(
  tipo: string
) {
  switch (tipo) {
    case "WhatsApp":
      return (
        <MessageSquare className="h-3 w-3 text-green-600" />
      )

    case "E-mail":
      return (
        <Mail className="h-3 w-3 text-blue-600" />
      )

    case "Visita":
      return (
        <User className="h-3 w-3 text-orange-600" />
      )

    case "Ligação":
      return (
        <Phone className="h-3 w-3 text-purple-600" />
      )

    default:
      return (
        <ClipboardList className="h-3 w-3 text-gray-600" />
      )
  }
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
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

function obterOrigem(
  interacao: Interacao
) {
  if (interacao.cliente) {
    return {
      tipo: "Cliente",
      nome:
        interacao.cliente
          .nomeFantasia ||
        interacao.cliente
          .razaoSocial,
    }
  }

  if (interacao.representada) {
    return {
      tipo: "Representada",
      nome:
        interacao.representada
          .nome,
    }
  }

  return {
    tipo: "Registro",
    nome:
      "Origem não disponível",
  }
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

  return atualizado - criado > 2000
}

function correspondeSituacao(
  interacao: Interacao,
  filtro: FiltroSituacao
) {
  if (filtro === "todas") {
    return true
  }

  if (filtro === "finalizadas") {
    return (
      interacao.statusFollowUp ===
      "Finalizado"
    )
  }

  if (
    filtro ===
    "sem-acompanhamento"
  ) {
    return (
      interacao.statusFollowUp ===
        "Sem acompanhamento" ||
      !interacao.proximoContatoEm
    )
  }

  if (filtro === "acompanhar") {
    return (
      interacao.statusFollowUp ===
        "Em acompanhamento" ||
      interacao.statusFollowUp ===
        "Aberto"
    )
  }

  if (filtro === "pendentes") {
    if (
      interacao.statusFollowUp ===
        "Finalizado" ||
      interacao.statusFollowUp ===
        "Sem acompanhamento"
    ) {
      return false
    }

    if (
      !interacao.proximoContatoEm
    ) {
      return false
    }

    const proximo =
      new Date(
        interacao.proximoContatoEm
      ).getTime()

    const agora =
      Date.now()

    return (
      !Number.isNaN(proximo) &&
      proximo <= agora
    )
  }

  return true
}

export default function InteracoesPage() {
  const [
    interacoes,
    setInteracoes,
  ] = useState<Interacao[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("")

  const [
    abaAtiva,
    setAbaAtiva,
  ] = useState("todas")

  const [
    filtroSituacao,
    setFiltroSituacao,
  ] =
    useState<FiltroSituacao>(
      "todas"
    )

  const carregarInteracoes =
    useCallback(
      async (
        aba: string,
        silencioso = false
      ) => {
        if (!silencioso) {
          setLoading(true)
        }

        setErro(null)

        try {
          const tipo =
            TIPOS_ABA[aba]

          const params =
            tipo &&
            tipo !== "todas"
              ? `?tipo=${encodeURIComponent(
                  tipo
                )}`
              : ""

          const response =
            await fetch(
              `/api/interacoes${params}`,
              {
                method: "GET",
                cache: "no-store",
              }
            )

          if (!response.ok) {
            throw new Error(
              "Falha ao consultar interações."
            )
          }

          const data =
            await response.json()

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Resposta inválida da API."
            )
          }

          setInteracoes(
            data
          )
        } catch (error) {
          console.error(
            error
          )

          setErro(
            "Não foi possível carregar as interações."
          )
        } finally {
          if (!silencioso) {
            setLoading(false)
          }
        }
      },
      []
    )

  useEffect(() => {
    carregarInteracoes(
      abaAtiva
    )
  }, [
    abaAtiva,
    carregarInteracoes,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarInteracoes(
            abaAtiva,
            true
          )
        },
        15000
      )

    return () => {
      window.clearInterval(
        intervalo
      )
    }
  }, [
    abaAtiva,
    carregarInteracoes,
  ])

  const interacoesFiltradas =
    useMemo(() => {
      const termo =
        searchTerm
          .trim()
          .toLowerCase()

      return interacoes.filter(
        (interacao) => {
          if (
            !correspondeSituacao(
              interacao,
              filtroSituacao
            )
          ) {
            return false
          }

          if (!termo) {
            return true
          }

          const origem =
            obterOrigem(
              interacao
            )

          const autor =
            interacao.criadoPor
              ?.nome || ""

          const perfil =
            interacao.criadoPor
              ?.perfil || ""

          return (
            origem.nome
              .toLowerCase()
              .includes(
                termo
              ) ||
            origem.tipo
              .toLowerCase()
              .includes(
                termo
              ) ||
            autor
              .toLowerCase()
              .includes(
                termo
              ) ||
            perfil
              .toLowerCase()
              .includes(
                termo
              ) ||
            interacao.tipo
              .toLowerCase()
              .includes(
                termo
              ) ||
            (interacao.assunto
              ?.toLowerCase()
              .includes(
                termo
              ) ??
              false) ||
            (interacao.descricao
              ?.toLowerCase()
              .includes(
                termo
              ) ??
              false) ||
            (interacao
              .proximosPasso
              ?.toLowerCase()
              .includes(
                termo
              ) ??
              false)
          )
        }
      )
    }, [
      interacoes,
      searchTerm,
      filtroSituacao,
    ])

  const contadores =
    useMemo(() => {
      return {
        todas:
          interacoes.length,

        pendentes:
          interacoes.filter(
            (interacao) =>
              correspondeSituacao(
                interacao,
                "pendentes"
              )
          ).length,

        acompanhar:
          interacoes.filter(
            (interacao) =>
              correspondeSituacao(
                interacao,
                "acompanhar"
              )
          ).length,

        finalizadas:
          interacoes.filter(
            (interacao) =>
              correspondeSituacao(
                interacao,
                "finalizadas"
              )
          ).length,

        semAcompanhamento:
          interacoes.filter(
            (interacao) =>
              correspondeSituacao(
                interacao,
                "sem-acompanhamento"
              )
          ).length,
      }
    }, [interacoes])

  function renderLista() {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando interações...
        </div>
      )
    }

    if (erro) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />

            {erro}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              carregarInteracoes(
                abaAtiva
              )
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />

            Tentar novamente
          </Button>
        </div>
      )
    }

    if (
      interacoesFiltradas.length ===
      0
    ) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
          <ClipboardList className="h-7 w-7" />

          <span>
            Nenhuma interação encontrada para este filtro.
          </span>

          <Link href="/interacoes/nova">
            <Button
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />

              Nova Interação
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {interacoesFiltradas.map(
          (interacao) => {
            const origem =
              obterOrigem(
                interacao
              )

            const editada =
              foiEditada(
                interacao.criadoEm,
                interacao.atualizadoEm
              )

            return (
              <div
                key={
                  interacao.id
                }
                className="rounded-md border p-3 transition hover:bg-muted/20"
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.25fr_1.35fr_1.05fr_1.15fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {origem.tipo ===
                      "Cliente" ? (
                        <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
                      ) : origem.tipo ===
                        "Representada" ? (
                        <Factory className="h-4 w-4 shrink-0 text-orange-600" />
                      ) : (
                        <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}

                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium"
                          title={
                            origem.nome
                          }
                        >
                          {
                            origem.nome
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {
                            origem.tipo
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1">
                      {iconeTipo(
                        interacao.tipo
                      )}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          corTipo[
                            interacao
                              .tipo
                          ] ??
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {
                          interacao.tipo
                        }
                      </span>

                      {editada && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Editada
                        </span>
                      )}
                    </div>

                    <p
                      className="truncate text-sm"
                      title={
                        interacao.assunto ||
                        ""
                      }
                    >
                      {interacao.assunto ||
                        "Sem assunto"}
                    </p>

                    {interacao
                      .proximosPasso && (
                      <p
                        className="mt-1 truncate text-xs text-muted-foreground"
                        title={
                          interacao
                            .proximosPasso
                        }
                      >
                        Próximo passo:{" "}
                        {
                          interacao
                            .proximosPasso
                        }
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />

                      <span>
                        {formatarData(
                          interacao.data
                        )}
                      </span>
                    </div>

                    <div className="mt-1">
                      <p className="truncate text-xs font-medium">
                        {interacao
                          .criadoPor
                          ?.nome ||
                          "Usuário não identificado"}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {interacao
                          .criadoPor
                          ?.perfil ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    {interacao.proximoContatoEm ? (
                      <>
                        <p className="text-xs font-medium">
                          Próximo acompanhamento
                        </p>

                        <p className="text-xs">
                          {formatarData(
                            interacao
                              .proximoContatoEm
                          )}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          {
                            interacao
                              .statusFollowUp
                          }
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Sem acompanhamento pendente
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/interacoes/${interacao.id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Eye className="mr-1 h-3 w-3" />

                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          }
        )}
      </div>
    )
  }

  return (
    <PageLayout title="Interações">
      <NavigationButtons
        backLabel="Voltar"
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-72 max-w-full">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />

            <Input
              type="search"
              placeholder="Buscar interação..."
              className="h-8 w-full pl-7 text-xs"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() =>
              carregarInteracoes(
                abaAtiva
              )
            }
          >
            <RefreshCw className="h-3 w-3" />

            Atualizar
          </Button>
        </div>

        <Link href="/interacoes/nova">
          <Button
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />

            Nova Interação
          </Button>
        </Link>
      </div>

      <Tabs
        value={abaAtiva}
        className="w-full"
        onValueChange={
          setAbaAtiva
        }
      >
        <TabsList className="grid h-9 w-full grid-cols-5">
          <TabsTrigger
            value="todas"
            className="text-xs"
          >
            Todas
          </TabsTrigger>

          <TabsTrigger
            value="whatsapp"
            className="text-xs"
          >
            WhatsApp
          </TabsTrigger>

          <TabsTrigger
            value="email"
            className="text-xs"
          >
            E-mail
          </TabsTrigger>

          <TabsTrigger
            value="visita"
            className="text-xs"
          >
            Visitas
          </TabsTrigger>

          <TabsTrigger
            value="ligacao"
            className="text-xs"
          >
            Ligações
          </TabsTrigger>
        </TabsList>

        {Object.keys(
          TIPOS_ABA
        ).map((aba) => (
          <TabsContent
            key={aba}
            value={aba}
            className="mt-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Histórico de Interações
                </CardTitle>

                <CardDescription>
                  {
                    interacoesFiltradas.length
                  }{" "}
                  registro(s) exibido(s).
                  Atualização automática a cada 15 segundos.
                </CardDescription>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      filtroSituacao ===
                      "todas"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFiltroSituacao(
                        "todas"
                      )
                    }
                  >
                    Todas ({contadores.todas})
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={
                      filtroSituacao ===
                      "pendentes"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFiltroSituacao(
                        "pendentes"
                      )
                    }
                  >
                    Pendentes ({contadores.pendentes})
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={
                      filtroSituacao ===
                      "acompanhar"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFiltroSituacao(
                        "acompanhar"
                      )
                    }
                  >
                    Acompanhar ({contadores.acompanhar})
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={
                      filtroSituacao ===
                      "finalizadas"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFiltroSituacao(
                        "finalizadas"
                      )
                    }
                  >
                    Finalizadas ({contadores.finalizadas})
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={
                      filtroSituacao ===
                      "sem-acompanhamento"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFiltroSituacao(
                        "sem-acompanhamento"
                      )
                    }
                  >
                    Sem acompanhamento ({contadores.semAcompanhamento})
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {renderLista()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageLayout>
  )
}