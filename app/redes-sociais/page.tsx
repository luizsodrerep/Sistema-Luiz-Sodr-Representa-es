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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarIcon,
  Download,
  Facebook,
  Filter,
  Instagram,
  Linkedin,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Twitter,
  UserSearch,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
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

  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null

  cliente: Cliente | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

const REDES_SOCIAIS =
  [
    "Instagram",
    "Facebook",
    "LinkedIn",
    "X (Twitter)",
    "TikTok",
  ]

function ehOrigemSocial(
  origem: string | null
) {
  if (!origem) {
    return false
  }

  return REDES_SOCIAIS.some(
    (
      rede
    ) =>
      rede.toLowerCase() ===
      origem.toLowerCase()
  )
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

function nomeLead(
  interacao: Interacao
) {
  return (
    interacao.empresaProspect ||
    interacao.nomeProspect ||
    interacao.cliente
      ?.nomeFantasia ||
    interacao.cliente
      ?.razaoSocial ||
    "Lead sem identificação"
  )
}

function iconeRede(
  rede: string | null
) {
  switch (
    rede
  ) {
    case "Instagram":
      return (
        <Instagram className="h-4 w-4 text-pink-500" />
      )

    case "LinkedIn":
      return (
        <Linkedin className="h-4 w-4 text-blue-600" />
      )

    case "Facebook":
      return (
        <Facebook className="h-4 w-4 text-blue-500" />
      )

    case "X (Twitter)":
      return (
        <Twitter className="h-4 w-4 text-sky-500" />
      )

    default:
      return (
        <Share2 className="h-4 w-4 text-muted-foreground" />
      )
  }
}

function escaparCsv(
  valor:
    | string
    | number
    | null
    | undefined
) {
  const texto =
    valor === null ||
    valor === undefined
      ? ""
      : String(valor)

  return `"${texto.replace(
    /"/g,
    '""'
  )}"`
}

function CartaoRede({
  nome,
  icone,
}: {
  nome: string
  icone: React.ReactNode
}) {
  return (
    <Card className="card-container">
      <div className="flex h-full">
        <div className="flex items-center justify-center bg-muted/30 px-3">
          {icone}
        </div>

        <CardContent className="flex flex-col justify-center p-3">
          <p className="text-xs text-muted-foreground">
            {nome}
          </p>

          <p className="mt-1 text-lg font-bold">
            —
          </p>

          <p className="text-xs text-muted-foreground">
            Conta não conectada
          </p>
        </CardContent>
      </div>
    </Card>
  )
}

function AnalyticsPendente({
  titulo,
}: {
  titulo: string
}) {
  return (
    <Card className="card-container">
      <CardHeader className="card-header">
        <CardTitle className="card-title">
          {titulo}
        </CardTitle>

        <CardDescription className="card-description">
          Estrutura preservada para integração oficial.
        </CardDescription>
      </CardHeader>

      <CardContent className="card-content">
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-md border border-dashed text-center">
          <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" />

          <p className="text-sm font-medium">
            Integração ainda não configurada
          </p>

          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            As métricas aparecerão aqui quando a conta da rede social
            estiver conectada ao CRM por uma integração oficial.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RedesSociaisPage() {
  const [
    interacoes,
    setInteracoes,
  ] =
    useState<Interacao[]>(
      []
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    atualizando,
    setAtualizando,
  ] =
    useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    busca,
    setBusca,
  ] =
    useState("")

  const carregarDados =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (
          silencioso
        ) {
          setAtualizando(
            true
          )
        } else {
          setLoading(
            true
          )
        }

        setErro(
          null
        )

        try {
          const response =
            await fetch(
              "/api/interacoes",
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Não foi possível consultar as prospecções do CRM."
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
              "Resposta inválida da API de Interações."
            )
          }

          setInteracoes(
            data
          )
        } catch (
          error
        ) {
          console.error(
            "Erro ao carregar Redes Sociais:",
            error
          )

          setErro(
            error instanceof
              Error
              ? error.message
              : "Erro ao carregar dados."
          )
        } finally {
          setLoading(
            false
          )

          setAtualizando(
            false
          )
        }
      },
      []
    )

  useEffect(() => {
    carregarDados()
  }, [
    carregarDados,
  ])

  const leadsSociais =
    useMemo(() => {
      return interacoes.filter(
        (
          interacao
        ) =>
          ehOrigemSocial(
            interacao.origemProspeccao
          )
      )
    }, [
      interacoes,
    ])

  const leadsFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase()

      if (!termo) {
        return leadsSociais
      }

      return leadsSociais.filter(
        (
          interacao
        ) => {
          const campos =
            [
              nomeLead(
                interacao
              ),

              interacao.nomeProspect,

              interacao.empresaProspect,

              interacao.origemProspeccao,

              interacao.assunto,

              interacao.descricao,

              interacao.proximosPasso,

              interacao.responsavel
                ?.nome,

              interacao.criadoPor
                ?.nome,
            ]

          return campos.some(
            (
              campo
            ) =>
              campo
                ?.toLowerCase()
                .includes(
                  termo
                )
          )
        }
      )
    }, [
      busca,
      leadsSociais,
    ])

  function exportarLeads() {
    if (
      leadsFiltrados.length ===
      0
    ) {
      return
    }

    const cabecalho =
      [
        "Data",
        "Lead",
        "Origem",
        "Assunto",
        "Descrição",
        "Próximo passo",
        "Responsável",
      ]

    const linhas =
      leadsFiltrados.map(
        (
          interacao
        ) =>
          [
            formatarData(
              interacao.data
            ),

            nomeLead(
              interacao
            ),

            interacao.origemProspeccao,

            interacao.assunto,

            interacao.descricao,

            interacao.proximosPasso,

            interacao.responsavel
              ?.nome ||
              interacao.criadoPor
                ?.nome ||
              "",
          ]
            .map(
              escaparCsv
            )
            .join(
              ";"
            )
      )

    const csv =
      [
        cabecalho
          .map(
            escaparCsv
          )
          .join(
            ";"
          ),

        ...linhas,
      ].join(
        "\n"
      )

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

    link.href =
      url

    link.download =
      `leads-redes-sociais-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

    URL.revokeObjectURL(
      url
    )
  }

  if (
    loading
  ) {
    return (
      <PageLayout title="Gestão de Redes Sociais">
        <NavigationButtons />

        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados reais...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Gestão de Redes Sociais">
      <NavigationButtons />

      <div className="space-y-4">

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="font-semibold">
                  Gestão de Redes Sociais
                </div>

                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  A estrutura original deste módulo foi preservada.
                  Métricas, mensagens, postagens e campanhas serão
                  alimentadas quando as contas oficiais forem integradas.
                  Leads originados de redes sociais já utilizam registros
                  reais das Interações do CRM.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  carregarDados(
                    true
                  )
                }
                disabled={
                  atualizando
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    atualizando
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Atualizar
              </Button>

            </div>
          </CardContent>
        </Card>

        {erro && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {erro}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap items-center gap-2">

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Buscar leads de redes sociais..."
                className="pl-9"
                value={
                  busca
                }
                onChange={(
                  event
                ) =>
                  setBusca(
                    event.target.value
                  )
                }
              />
            </div>

            <Button
              variant="outline"
              disabled
              title="Filtros avançados serão ativados com a integração das redes sociais."
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>

          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              variant="outline"
              onClick={
                exportarLeads
              }
              disabled={
                leadsFiltrados.length ===
                0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>

            <Button
              disabled
              title="Publicação será habilitada quando houver integração oficial com as redes sociais."
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Postagem
            </Button>

          </div>

        </div>

        <div className="grid gap-3 md:grid-cols-4">

          <CartaoRede
            nome="Instagram"
            icone={
              <Instagram className="h-5 w-5 text-pink-500" />
            }
          />

          <CartaoRede
            nome="LinkedIn"
            icone={
              <Linkedin className="h-5 w-5 text-blue-600" />
            }
          />

          <CartaoRede
            nome="Facebook"
            icone={
              <Facebook className="h-5 w-5 text-blue-500" />
            }
          />

          <CartaoRede
            nome="X (Twitter)"
            icone={
              <Twitter className="h-5 w-5 text-sky-500" />
            }
          />

        </div>

        <Tabs
          defaultValue="todas"
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="todas">
              Todas
            </TabsTrigger>

            <TabsTrigger value="instagram">
              Instagram
            </TabsTrigger>

            <TabsTrigger value="linkedin">
              LinkedIn
            </TabsTrigger>

            <TabsTrigger value="facebook">
              Facebook
            </TabsTrigger>

            <TabsTrigger value="twitter">
              X (Twitter)
            </TabsTrigger>

            <TabsTrigger value="tiktok">
              TikTok
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="todas"
            className="space-y-4"
          >

            <div className="grid gap-4 lg:grid-cols-3">

              <Card className="lg:col-span-2 card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">
                    Desempenho das Redes Sociais
                  </CardTitle>

                  <CardDescription className="card-description">
                    Análise comparativa de engajamento
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                    <BarChart3 className="mb-3 h-9 w-9 text-muted-foreground" />

                    <p className="font-medium">
                      Métricas aguardando integração
                    </p>

                    <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                      Nenhum número de seguidores, alcance ou engajamento
                      será exibido sem uma fonte oficial conectada.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">
                    Mensagens Pendentes
                  </CardTitle>

                  <CardDescription className="card-description">
                    Interações que precisam de resposta
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                    <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground" />

                    <p className="text-sm font-medium">
                      Caixa de mensagens não conectada
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Responder e marcar como lida serão habilitados
                      quando houver integração oficial.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">
                  Últimas Postagens
                </CardTitle>

                <CardDescription className="card-description">
                  Histórico de conteúdos publicados
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto rounded-md border">

                  <div className="grid min-w-[850px] grid-cols-7 bg-muted/30 p-2 text-xs font-medium">
                    <div>Rede</div>
                    <div>Data</div>
                    <div>Tipo</div>
                    <div>Conteúdo</div>
                    <div>Engajamento</div>
                    <div>Status</div>
                    <div className="text-right">
                      Ações
                    </div>
                  </div>

                  <div className="flex min-h-[120px] items-center justify-center border-t p-6 text-sm text-muted-foreground">
                    Nenhuma postagem real disponível. A estrutura será
                    alimentada pela futura integração das contas oficiais.
                  </div>

                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">
                    Campanhas Patrocinadas
                  </CardTitle>

                  <CardDescription className="card-description">
                    Desempenho de anúncios pagos
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                    <Share2 className="mb-3 h-8 w-8 text-muted-foreground" />

                    <p className="text-sm font-medium">
                      Nenhuma campanha conectada
                    </p>

                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      Orçamento, CPC, conversões e status só serão exibidos
                      quando vierem de uma fonte real.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">
                    Leads das Redes Sociais
                  </CardTitle>

                  <CardDescription className="card-description">
                    Prospecções reais registradas no CRM com origem social
                  </CardDescription>
                </CardHeader>

                <CardContent>

                  {leadsFiltrados.length ===
                  0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                      <UserSearch className="mb-3 h-8 w-8 text-muted-foreground" />

                      <p className="text-sm font-medium">
                        Nenhum lead social encontrado
                      </p>

                      <p className="mt-1 max-w-md text-xs text-muted-foreground">
                        Quando uma Prospecção / Lead for registrada com
                        origem de rede social, aparecerá aqui automaticamente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {leadsFiltrados.map(
                        (
                          interacao
                        ) => (
                          <Link
                            key={
                              interacao.id
                            }
                            href={`/interacoes/${interacao.id}`}
                            className="block rounded-md border p-3 transition hover:bg-muted/30"
                          >
                            <div className="flex items-start gap-3">

                              <div className="rounded-full bg-muted/30 p-2">
                                {iconeRede(
                                  interacao.origemProspeccao
                                )}
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <div className="font-medium">
                                    {nomeLead(
                                      interacao
                                    )}
                                  </div>

                                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                                </div>

                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">

                                  <span className="inline-flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />

                                    {formatarData(
                                      interacao.data
                                    )}
                                  </span>

                                  <span>
                                    via{" "}
                                    {interacao.origemProspeccao}
                                  </span>

                                </div>

                                {interacao.assunto && (
                                  <div className="mt-2 text-sm">
                                    {interacao.assunto}
                                  </div>
                                )}

                                {interacao.proximosPasso && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Próximo passo:{" "}
                                    {interacao.proximosPasso}
                                  </div>
                                )}

                              </div>

                            </div>
                          </Link>
                        )
                      )}

                    </div>
                  )}

                </CardContent>
              </Card>

            </div>

          </TabsContent>

          <TabsContent
            value="instagram"
            className="mt-4"
          >
            <AnalyticsPendente titulo="Instagram Analytics" />
          </TabsContent>

          <TabsContent
            value="linkedin"
            className="mt-4"
          >
            <AnalyticsPendente titulo="LinkedIn Analytics" />
          </TabsContent>

          <TabsContent
            value="facebook"
            className="mt-4"
          >
            <AnalyticsPendente titulo="Facebook Analytics" />
          </TabsContent>

          <TabsContent
            value="twitter"
            className="mt-4"
          >
            <AnalyticsPendente titulo="X (Twitter) Analytics" />
          </TabsContent>

          <TabsContent
            value="tiktok"
            className="mt-4"
          >
            <AnalyticsPendente titulo="TikTok Analytics" />
          </TabsContent>

        </Tabs>

      </div>
    </PageLayout>
  )
}