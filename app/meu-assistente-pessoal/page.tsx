"use client"

import Image from "next/image"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"

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
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  ListTodo,
  RefreshCw,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react"

interface UsuarioSessao {
  id: string
  nome: string
  email: string
  perfil: string
}

interface RespostaSessao {
  autenticado: boolean
  usuario?: UsuarioSessao
}

type PrioridadeAssistente =
  | "critica"
  | "alta"
  | "normal"
  | "informativa"

type ModuloAssistente =
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "titulos"
  | "faturamentos"
  | "comissoes"
  | "redes-sociais"

type SituacaoTemporal =
  | "atrasado"
  | "hoje"
  | "proximos"
  | "futuro"
  | "sem-data"

interface PendenciaAssistente {
  id: string

  modulo: ModuloAssistente

  entidadeId: string

  codigo: string | null

  titulo: string

  descricao: string

  relacionadoA: string | null

  responsavel: string | null

  dataReferencia: string | null

  situacaoTemporal: SituacaoTemporal

  prioridade: PrioridadeAssistente

  status: string | null

  href: string

  origem: string | null
}

interface ContadoresAssistente {
  total: number
  atrasados: number
  hoje: number
  proximos: number
  semData: number
  futuros: number
}

interface ModuloResumo {
  ativo: boolean
  quantidade: number
  observacao?: string
}

interface ModulosAssistente {
  interacoes: ModuloResumo
  orcamentos: ModuloResumo
  vendas: ModuloResumo
  faturamentos: ModuloResumo
  titulos: ModuloResumo
  comissoes: ModuloResumo
  redesSociais: ModuloResumo
}

interface RespostaAssistente {
  usuario: {
    id: string
    perfil: string
  }

  escopo:
    | "escritorio"
    | "pessoal"

  geradoEm: string

  contadores: ContadoresAssistente

  modulos: ModulosAssistente

  pendencias: PendenciaAssistente[]
}

type GrupoAssistente =
  | "atrasados"
  | "hoje"
  | "proximos"
  | "futuros"
  | "semData"

const formatarDataHora = (
  valor: string | null
) => {
  if (!valor) {
    return "Sem data definida"
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "Data inválida"
  }

  return data.toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
  )
}

const formatarDataAtualizacao = (
  valor: string | null
) => {
  if (!valor) {
    return ""
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return ""
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

const usuarioEhPaula = (
  usuario: UsuarioSessao | null
) => {
  if (!usuario) {
    return false
  }

  return usuario.nome
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .includes(
      "paula"
    )
}

const nomeModulo = (
  modulo: ModuloAssistente
) => {
  switch (
    modulo
  ) {
    case "interacoes":
      return "Interação"

    case "orcamentos":
      return "Orçamento"

    case "vendas":
      return "Venda"

    case "titulos":
      return "Título"

    case "faturamentos":
      return "Faturamento"

    case "comissoes":
      return "Comissão"

    case "redes-sociais":
      return "Redes Sociais"

    default:
      return "CRM"
  }
}

const classeModulo = (
  modulo: ModuloAssistente
) => {
  switch (
    modulo
  ) {
    case "interacoes":
      return "bg-blue-100 text-blue-800"

    case "orcamentos":
      return "bg-violet-100 text-violet-800"

    case "vendas":
      return "bg-green-100 text-green-800"

    case "titulos":
      return "bg-amber-100 text-amber-800"

    case "faturamentos":
      return "bg-cyan-100 text-cyan-800"

    case "comissoes":
      return "bg-emerald-100 text-emerald-800"

    case "redes-sociais":
      return "bg-pink-100 text-pink-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

const classePrioridade = (
  prioridade: PrioridadeAssistente
) => {
  switch (
    prioridade
  ) {
    case "critica":
      return "border-red-300 bg-red-50/40"

    case "alta":
      return "border-amber-300 bg-amber-50/30"

    case "normal":
      return "border-slate-200"

    case "informativa":
      return "border-blue-200 bg-blue-50/20"

    default:
      return ""
  }
}

const textoPrioridade = (
  prioridade: PrioridadeAssistente
) => {
  switch (
    prioridade
  ) {
    case "critica":
      return "Urgente"

    case "alta":
      return "Prioridade"

    case "normal":
      return "Pendente"

    case "informativa":
      return "Programado"

    default:
      return ""
  }
}

export default function MeuAssistentePessoalPage() {
  const router =
    useRouter()

  const [
    usuario,
    setUsuario,
  ] =
    useState<UsuarioSessao | null>(
      null
    )

  const [
    assistente,
    setAssistente,
  ] =
    useState<RespostaAssistente | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState("")

  const carregarAssistente =
    useCallback(
      async () => {
        setLoading(
          true
        )

        setErro(
          ""
        )

        try {
          const [
            responseSessao,
            responseAssistente,
          ] =
            await Promise.all([
              fetch(
                "/api/auth/me",
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                "/api/meu-assistente-pessoal",
                {
                  cache:
                    "no-store",
                }
              ),
            ])

          if (
            !responseSessao.ok
          ) {
            throw new Error(
              "Não foi possível identificar o usuário logado."
            )
          }

          if (
            !responseAssistente.ok
          ) {
            const erroApi =
              await responseAssistente
                .json()
                .catch(
                  () => null
                )

            throw new Error(
              erroApi?.message ||
                "Não foi possível carregar as pendências do Assistente."
            )
          }

          const sessao:
            RespostaSessao =
            await responseSessao.json()

          const dadosAssistente:
            RespostaAssistente =
            await responseAssistente.json()

          if (
            !sessao.autenticado ||
            !sessao.usuario
          ) {
            throw new Error(
              "Sessão de usuário não identificada."
            )
          }

          setUsuario(
            sessao.usuario
          )

          setAssistente(
            dadosAssistente
          )
        } catch (error) {
          console.error(
            error
          )

          setUsuario(
            null
          )

          setAssistente(
            null
          )

          setErro(
            error instanceof
              Error
              ? error.message
              : "Erro ao carregar o Meu Assistente Pessoal."
          )
        } finally {
          setLoading(
            false
          )
        }
      },
      []
    )

  useEffect(() => {
    carregarAssistente()
  }, [
    carregarAssistente,
  ])

  const grupos =
    useMemo(() => {
      const resultado: Record<
        GrupoAssistente,
        PendenciaAssistente[]
      > = {
        atrasados: [],
        hoje: [],
        proximos: [],
        futuros: [],
        semData: [],
      }

      if (
        !assistente
      ) {
        return resultado
      }

      for (
        const pendencia of
        assistente.pendencias
      ) {
        switch (
          pendencia.situacaoTemporal
        ) {
          case "atrasado":
            resultado.atrasados.push(
              pendencia
            )

            break

          case "hoje":
            resultado.hoje.push(
              pendencia
            )

            break

          case "proximos":
            resultado.proximos.push(
              pendencia
            )

            break

          case "futuro":
            resultado.futuros.push(
              pendencia
            )

            break

          case "sem-data":
            resultado.semData.push(
              pendencia
            )

            break
        }
      }

      return resultado
    }, [
      assistente,
    ])

  const renderizarPendencia = (
    pendencia: PendenciaAssistente
  ) => {
    return (
      <button
        key={
          pendencia.id
        }
        type="button"
        onClick={() =>
          router.push(
            pendencia.href
          )
        }
        className={`w-full rounded-lg border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40 ${classePrioridade(
          pendencia.prioridade
        )}`}
      >
        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex flex-wrap items-center gap-2">

              {pendencia.codigo && (
                <span className="font-mono text-sm font-semibold">
                  {
                    pendencia.codigo
                  }
                </span>
              )}

              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${classeModulo(
                  pendencia.modulo
                )}`}
              >
                {nomeModulo(
                  pendencia.modulo
                )}
              </span>

              <span className="rounded-full border bg-white/70 px-2 py-1 text-xs">
                {textoPrioridade(
                  pendencia.prioridade
                )}
              </span>

              {pendencia.status && (
                <span className="text-xs text-muted-foreground">
                  {
                    pendencia.status
                  }
                </span>
              )}

            </div>

            <div className="font-semibold">
              {
                pendencia.titulo
              }
            </div>

            {pendencia.relacionadoA && (
              <div className="mt-1 text-sm text-muted-foreground">
                {
                  pendencia.relacionadoA
                }
              </div>
            )}

            <div className="mt-3">

              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                O que precisa de atenção
              </div>

              <div className="text-sm leading-relaxed">
                {
                  pendencia.descricao
                }
              </div>

            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">

              {pendencia.responsavel && (
                <div className="flex items-center gap-1.5">
                  <UserRound className="h-4 w-4" />

                  <span>
                    {
                      pendencia.responsavel
                    }
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">

                <CalendarClock className="h-4 w-4" />

                <span>
                  {formatarDataHora(
                    pendencia.dataReferencia
                  )}
                </span>

              </div>

              {pendencia.origem && (
                <span>
                  Origem:{" "}
                  <strong className="font-medium text-foreground">
                    {
                      pendencia.origem
                    }
                  </strong>
                </span>
              )}

            </div>

          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />

        </div>
      </button>
    )
  }

  const renderizarGrupo = (
    titulo: string,
    descricao: string,
    itens: PendenciaAssistente[],
    icone: React.ReactNode
  ) => {
    if (
      itens.length ===
      0
    ) {
      return null
    }

    return (
      <Card>

        <CardHeader className="pb-3">

          <div className="flex items-center gap-3">

            {
              icone
            }

            <div>

              <CardTitle className="text-lg">
                {
                  titulo
                }
              </CardTitle>

              <CardDescription>
                {
                  descricao
                }
              </CardDescription>

            </div>

            <div className="ml-auto text-lg font-bold">
              {
                itens.length
              }
            </div>

          </div>

        </CardHeader>

        <CardContent className="space-y-3">

          {itens.map(
            renderizarPendencia
          )}

        </CardContent>

      </Card>
    )
  }

  if (
    loading
  ) {
    return (
      <div className="p-8">

        <div className="flex items-center gap-3 text-muted-foreground">

          <RefreshCw className="h-5 w-5 animate-spin" />

          Preparando seu Assistente Pessoal...

        </div>

      </div>
    )
  }

  const mostrarFotoPaula =
    usuarioEhPaula(
      usuario
    )

  const contadores =
    assistente?.contadores

  const modulos =
    assistente?.modulos

  const visaoEmpresa =
    assistente?.escopo ===
    "escritorio"

  return (
    <div className="mx-auto max-w-7xl p-8 pt-6">

      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">

        <div className="flex items-start gap-5">

          {mostrarFotoPaula ? (

            <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-xl border shadow-sm md:h-48 md:w-40">

              <Image
                src="/assistente-paula.jpeg"
                alt="Paula"
                fill
                priority
                className="object-cover object-top"
              />

            </div>

          ) : (

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">

              <UserRound className="h-8 w-8 text-primary" />

            </div>

          )}

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight">
                Meu Assistente Pessoal
              </h1>

              {visaoEmpresa && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <UsersRound className="h-3.5 w-3.5" />

                  Visão da empresa
                </span>
              )}

            </div>

            <p className="mt-2 text-lg">
              {usuario
                ? `Olá, ${usuario.nome}.`
                : "Olá."}
            </p>

            <p className="mt-1 max-w-3xl text-muted-foreground">
              {visaoEmpresa
                ? "Estas são as demandas que o CRM identificou no escritório e que ainda precisam de atenção."
                : "Estas são as demandas que o CRM identificou e que ainda precisam da sua atenção."}
            </p>

            <div className="mt-4 inline-flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3">

              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div className="text-sm">

                <span className="font-medium">
                  Seu foco operacional em um único lugar.
                </span>{" "}

                Interações, prospecções, orçamentos, vendas e compromissos financeiros organizados conforme a prioridade.

              </div>

            </div>

            {assistente?.geradoEm && (
              <p className="mt-2 text-xs text-muted-foreground">
                Atualizado em{" "}
                {formatarDataAtualizacao(
                  assistente.geradoEm
                )}
              </p>
            )}

          </div>

        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={
              carregarAssistente
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />

            Atualizar
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              router.push(
                "/"
              )
            }
          >
            <Home className="mr-2 h-4 w-4" />

            Início
          </Button>

        </div>

      </div>

      {erro && (

        <Card className="mb-6 border-red-200">

          <CardContent className="pt-6">

            <div className="flex items-start gap-3 text-red-700">

              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>

                <div className="font-semibold">
                  Não foi possível carregar o Assistente Pessoal
                </div>

                <div className="mt-1 text-sm">
                  {
                    erro
                  }
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

      )}

      {!erro &&
        assistente && (
          <>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

              <Card>

                <CardContent className="p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-sm text-muted-foreground">
                        Total pendente
                      </div>

                      <div className="text-2xl font-bold">
                        {
                          contadores?.total ??
                          0
                        }
                      </div>

                    </div>

                    <ListTodo className="h-6 w-6 text-muted-foreground" />

                  </div>

                </CardContent>

              </Card>

              <Card
                className={
                  (
                    contadores?.atrasados ??
                    0
                  ) > 0
                    ? "border-red-300"
                    : ""
                }
              >

                <CardContent className="p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-sm text-muted-foreground">
                        Atrasados
                      </div>

                      <div className="text-2xl font-bold text-red-700">
                        {
                          contadores?.atrasados ??
                          0
                        }
                      </div>

                    </div>

                    <AlertTriangle className="h-6 w-6 text-red-600" />

                  </div>

                </CardContent>

              </Card>

              <Card>

                <CardContent className="p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-sm text-muted-foreground">
                        Hoje
                      </div>

                      <div className="text-2xl font-bold">
                        {
                          contadores?.hoje ??
                          0
                        }
                      </div>

                    </div>

                    <Clock3 className="h-6 w-6 text-muted-foreground" />

                  </div>

                </CardContent>

              </Card>

              <Card>

                <CardContent className="p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-sm text-muted-foreground">
                        Próximos 7 dias
                      </div>

                      <div className="text-2xl font-bold">
                        {
                          contadores?.proximos ??
                          0
                        }
                      </div>

                    </div>

                    <CalendarDays className="h-6 w-6 text-muted-foreground" />

                  </div>

                </CardContent>

              </Card>

              <Card>

                <CardContent className="p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="text-sm text-muted-foreground">
                        Mais adiante
                      </div>

                      <div className="text-2xl font-bold">
                        {
                          contadores?.futuros ??
                          0
                        }
                      </div>

                    </div>

                    <CalendarClock className="h-6 w-6 text-muted-foreground" />

                  </div>

                </CardContent>

              </Card>

            </div>

            {modulos && (
              <Card className="mb-6">

                <CardHeader>

                  <CardTitle className="text-lg">
                    Módulos monitorados
                  </CardTitle>

                  <CardDescription>
                    Fontes que já alimentam ou estão preparadas para alimentar o Meu Assistente Pessoal.
                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-lg border p-3">

                      <div className="text-sm font-semibold">
                        Interações / Prospecções
                      </div>

                      <div className="mt-1 text-2xl font-bold">
                        {
                          modulos.interacoes.quantidade
                        }
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Ativo
                      </div>

                    </div>

                    <div className="rounded-lg border p-3">

                      <div className="text-sm font-semibold">
                        Orçamentos
                      </div>

                      <div className="mt-1 text-2xl font-bold">
                        {
                          modulos.orcamentos.quantidade
                        }
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Ativo
                      </div>

                    </div>

                    <div className="rounded-lg border p-3">

                      <div className="text-sm font-semibold">
                        Vendas
                      </div>

                      <div className="mt-1 text-2xl font-bold">
                        {
                          modulos.vendas.quantidade
                        }
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Ativo
                      </div>

                    </div>

                    <div className="rounded-lg border p-3">

                      <div className="text-sm font-semibold">
                        Títulos
                      </div>

                      <div className="mt-1 text-2xl font-bold">
                        {
                          modulos.titulos.quantidade
                        }
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Ativo
                      </div>

                    </div>

                  </div>

                </CardContent>

              </Card>
            )}

            {assistente.pendencias.length ===
            0 ? (

              <Card>

                <CardContent className="py-12">

                  <div className="flex flex-col items-center text-center">

                    <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />

                    <h2 className="text-xl font-semibold">
                      Nenhuma pendência encontrada
                    </h2>

                    <p className="mt-2 max-w-xl text-muted-foreground">
                      {visaoEmpresa
                        ? "Neste momento o CRM não encontrou demandas abertas no escritório que exijam acompanhamento."
                        : "Neste momento o CRM não encontrou demandas atribuídas a você que exijam acompanhamento."}
                    </p>

                  </div>

                </CardContent>

              </Card>

            ) : (

              <div className="space-y-5">

                {renderizarGrupo(
                  "Atrasados",
                  "Demandas com prazo ultrapassado e que ainda exigem ação.",
                  grupos.atrasados,
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}

                {renderizarGrupo(
                  "Hoje",
                  "O que precisa de atenção hoje.",
                  grupos.hoje,
                  <Clock3 className="h-5 w-5" />
                )}

                {renderizarGrupo(
                  "Próximos 7 dias",
                  "Demandas e compromissos previstos para os próximos dias.",
                  grupos.proximos,
                  <CalendarDays className="h-5 w-5" />
                )}

                {renderizarGrupo(
                  "Sem data definida",
                  "Demandas abertas que ainda não possuem prazo objetivo registrado.",
                  grupos.semData,
                  <ListTodo className="h-5 w-5" />
                )}

                {renderizarGrupo(
                  "Mais adiante",
                  "Compromissos futuros já identificados pelo CRM.",
                  grupos.futuros,
                  <CalendarClock className="h-5 w-5" />
                )}

              </div>

            )}

            <Card className="mt-6">

              <CardContent className="py-5">

                <div className="flex items-start gap-3">

                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>

                    <div className="font-semibold">
                      Assistente conectado ao fluxo comercial
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      Interações e Prospecções, Orçamentos, Vendas e Títulos já podem alimentar as prioridades operacionais.
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      Faturamentos entram pelo acompanhamento das Vendas e dos Títulos. Comissões permanecerão preparadas para ativação após a consolidação das regras financeiras.
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      Redes Sociais permanecerão preparadas para integração. Enquanto as métricas atuais forem simuladas, o Assistente utilizará apenas dados comerciais reais, como Prospecções cuja origem seja Instagram.
                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          </>
        )}

    </div>
  )
}