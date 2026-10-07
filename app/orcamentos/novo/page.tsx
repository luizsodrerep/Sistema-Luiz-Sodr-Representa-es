"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Factory,
  FileText,
  Info,
  Loader2,
  Pencil,
  Search,
} from "lucide-react"

import Link from "next/link"

import {
  PageLayout,
} from "@/components/page-layout"

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
  Label,
} from "@/components/ui/label"

import {
  Textarea,
} from "@/components/ui/textarea"

type UsuarioResumo = {
  id: string
  nome: string
}

type RepresentadaResumo = {
  id: string
  codigo?: string | null
  nome: string
}

type AtencaoComercial = {
  id: string
  tipo: string
  titulo: string
  descricao: string
  status: string
  resolucao: string | null
  criadoEm: string
  resolvidoEm: string | null
  representada:
    RepresentadaResumo | null
  criadoPor:
    UsuarioResumo | null
  resolvidoPor:
    UsuarioResumo | null
}

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type ClienteDetalhado =
  Cliente & {
    termometroRelacionamento:
      | string
      | null

    atencoesComerciais?:
      AtencaoComercial[]
  }

type Representada = {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  status: string
}

type InteracaoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  assunto: string | null
  data: string
  clienteId: string | null
  representadaId: string | null
  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null

  cliente: {
    id: string
    razaoSocial: string
    nomeFantasia: string | null
  } | null

  representada: {
    id: string
    nome: string
  } | null
}

type RegraComercial = {
  id: string
  clienteId: string | null
  nome: string
  tipoEscopo: string
  vigenciaInicio: string
  vigenciaFim: string | null
  ativa: boolean
  pedidoMinimo: number | null
  minimoParcela: number | null
  prazoEntregaDias: number | null
  prazoFaturamentoDias: number | null
  frete: string | null
  regiao: string | null
  observacoes: string | null
}

function formatarCodigoInteracao(
  numero: number
) {
  return `INT-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function formatarData(
  valor: string
) {
  const data =
    new Date(
      valor
    )

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
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  )
}

function formatarMoeda(
  valor: number | null
) {
  return valor ===
    null
    ? "—"
    : valor.toLocaleString(
        "pt-BR",
        {
          style:
            "currency",

          currency:
            "BRL",
        }
      )
}

function regraVigente(
  regra: RegraComercial
) {
  if (
    !regra.ativa
  ) {
    return false
  }

  const agora =
    new Date()

  const inicio =
    new Date(
      regra.vigenciaInicio
    )

  if (
    Number.isNaN(
      inicio.getTime()
    ) ||
    inicio >
      agora
  ) {
    return false
  }

  if (
    regra.vigenciaFim
  ) {
    const fim =
      new Date(
        regra.vigenciaFim
      )

    if (
      !Number.isNaN(
        fim.getTime()
      ) &&
      fim <
        agora
    ) {
      return false
    }
  }

  return true
}

function rotuloCliente(
  cliente: Cliente
) {
  return (
    cliente.nomeFantasia ||
    cliente.razaoSocial
  )
}

function descricaoTermometro(
  valor:
    | string
    | null
) {
  switch (valor) {
    case "Verde":
      return {
        emoji:
          "🟢",

        titulo:
          "Relacionamento consolidado",

        classe:
          "border-green-200 bg-green-50 text-green-900",
      }

    case "Azul":
      return {
        emoji:
          "🔵",

        titulo:
          "Bom relacionamento / em desenvolvimento",

        classe:
          "border-blue-200 bg-blue-50 text-blue-900",
      }

    case "Amarelo":
      return {
        emoji:
          "🟡",

        titulo:
          "Atenção / relacionamento irregular",

        classe:
          "border-yellow-200 bg-yellow-50 text-yellow-900",
      }

    case "Laranja":
      return {
        emoji:
          "🟠",

        titulo:
          "Cautela comercial",

        classe:
          "border-orange-200 bg-orange-50 text-orange-900",
      }

    case "Vermelho":
      return {
        emoji:
          "🔴",

        titulo:
          "Relacionamento crítico",

        classe:
          "border-red-200 bg-red-50 text-red-900",
      }

    default:
      return {
        emoji:
          "⚪",

        titulo:
          "Não classificado",

        classe:
          "border-slate-200 bg-slate-50 text-slate-700",
      }
  }
}

function classeTipoAtencao(
  tipo: string
) {
  switch (tipo) {
    case "Restrição":
      return "border-red-200 bg-red-50 text-red-800"

    case "Atenção":
      return "border-orange-200 bg-orange-50 text-orange-800"

    case "Informação importante":
      return "border-blue-200 bg-blue-50 text-blue-800"

    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

export default function NovoOrcamentoPage() {
  const router =
    useRouter()

  const [
    interacaoOrigemId,
    setInteracaoOrigemId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    interacaoOrigem,
    setInteracaoOrigem,
  ] =
    useState<
      InteracaoOrigem | null
    >(
      null
    )

  const [
    carregandoInteracao,
    setCarregandoInteracao,
  ] =
    useState(
      false
    )

  const [
    confirmarVinculoProspeccao,
    setConfirmarVinculoProspeccao,
  ] =
    useState(
      false
    )

  const [
    clienteId,
    setClienteId,
  ] =
    useState(
      ""
    )

  const [
    buscaCliente,
    setBuscaCliente,
  ] =
    useState(
      ""
    )

  const [
    resultadosClientes,
    setResultadosClientes,
  ] =
    useState<
      Cliente[]
    >(
      []
    )

  const [
    clienteSelecionado,
    setClienteSelecionado,
  ] =
    useState<
      Cliente | null
    >(
      null
    )

  const [
    carregandoClientes,
    setCarregandoClientes,
  ] =
    useState(
      false
    )

  const [
    listaClientesAberta,
    setListaClientesAberta,
  ] =
    useState(
      false
    )

  const [
    clienteDetalhado,
    setClienteDetalhado,
  ] =
    useState<
      ClienteDetalhado | null
    >(
      null
    )

  const [
    carregandoClienteDetalhado,
    setCarregandoClienteDetalhado,
  ] =
    useState(
      false
    )

  const [
    erroClienteDetalhado,
    setErroClienteDetalhado,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    representadaId,
    setRepresentadaId,
  ] =
    useState(
      ""
    )

  const [
    buscaRepresentada,
    setBuscaRepresentada,
  ] =
    useState(
      ""
    )

  const [
    resultadosRepresentadas,
    setResultadosRepresentadas,
  ] =
    useState<
      Representada[]
    >(
      []
    )

  const [
    representadaSelecionada,
    setRepresentadaSelecionada,
  ] =
    useState<
      Representada | null
    >(
      null
    )

  const [
    carregandoRepresentadas,
    setCarregandoRepresentadas,
  ] =
    useState(
      false
    )

  const [
    listaRepresentadasAberta,
    setListaRepresentadasAberta,
  ] =
    useState(
      false
    )

  const [
    regrasComerciais,
    setRegrasComerciais,
  ] =
    useState<
      RegraComercial[]
    >(
      []
    )

  const [
    loadingRegras,
    setLoadingRegras,
  ] =
    useState(
      false
    )

  const [
    valorTotal,
    setValorTotal,
  ] =
    useState(
      ""
    )

  const [
    condicaoPagamento,
    setCondicaoPagamento,
  ] =
    useState(
      ""
    )

  const [
    descricao,
    setDescricao,
  ] =
    useState(
      ""
    )

  const [
    observacoes,
    setObservacoes,
  ] =
    useState(
      ""
    )

  const [
    salvando,
    setSalvando,
  ] =
    useState(
      false
    )

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    sucesso,
    setSucesso,
  ] =
    useState<
      string | null
    >(
      null
    )

  const validadePadrao =
    useMemo(
      () => {
        const data =
          new Date()

        data.setDate(
          data.getDate() +
            7
        )

        return data
          .toLocaleDateString(
            "pt-BR"
          )
      },
      []
    )

  const origemEhProspeccaoSemCliente =
    Boolean(
      interacaoOrigem?.tipo ===
        "Prospecção" &&
      interacaoOrigem
        .clienteId ===
        null &&
      interacaoOrigem
        .representadaId ===
        null &&
      interacaoOrigem
        .nomeProspect
        ?.trim()
    )

  const clienteTemCnpj =
    Boolean(
      clienteSelecionado
        ?.cnpj
        ?.trim()
    )

  const clienteHabilitado =
    Boolean(
      clienteSelecionado &&
      (
        (
          clienteSelecionado
            .status ===
            "Ativo" &&
          clienteTemCnpj
        ) ||
        (
          origemEhProspeccaoSemCliente &&
          clienteSelecionado
            .status ===
            "Em qualificação"
        )
      )
    )

  const formularioPodeSalvar =
    Boolean(
      clienteId &&
      clienteHabilitado &&
      representadaId &&
      valorTotal.trim() &&
      !salvando &&
      !carregandoInteracao &&
      (
        !interacaoOrigemId ||
        interacaoOrigem
      ) &&
      (
        !origemEhProspeccaoSemCliente ||
        confirmarVinculoProspeccao
      )
    )

  const regraAplicavel =
    useMemo(
      () => {
        const vigentes =
          regrasComerciais.filter(
            regraVigente
          )

        return (
          vigentes.find(
            (
              regra
            ) =>
              regra.clienteId ===
              clienteId
          ) ||
          vigentes.find(
            (
              regra
            ) =>
              regra.tipoEscopo ===
                "Padrao" &&
              !regra.clienteId
          ) ||
          null
        )
      },
      [
        regrasComerciais,
        clienteId,
      ]
    )

  const atencoesAtivas =
    useMemo(
      () =>
        (
          clienteDetalhado
            ?.atencoesComerciais ||
          []
        ).filter(
          (
            atencao
          ) =>
            atencao.status ===
            "Ativa"
        ),
      [
        clienteDetalhado,
      ]
    )

  const atencoesAtivasOrdenadas =
    useMemo(
      () => {
        if (
          !representadaId
        ) {
          return atencoesAtivas
        }

        return [
          ...atencoesAtivas,
        ].sort(
          (
            a,
            b
          ) => {
            const aEspecifica =
              a.representada
                ?.id ===
              representadaId

            const bEspecifica =
              b.representada
                ?.id ===
              representadaId

            if (
              aEspecifica ===
              bEspecifica
            ) {
              return 0
            }

            return aEspecifica
              ? -1
              : 1
          }
        )
      },
      [
        atencoesAtivas,
        representadaId,
      ]
    )

  const termometro =
    descricaoTermometro(
      clienteDetalhado
        ?.termometroRelacionamento ||
        null
    )

  useEffect(
    () => {
      const id =
        new URLSearchParams(
          window.location.search
        ).get(
          "interacaoId"
        )

      if (
        id?.trim()
      ) {
        setInteracaoOrigemId(
          id.trim()
        )
      }
    },
    []
  )

  useEffect(
    () => {
      if (
        !interacaoOrigemId
      ) {
        return
      }

      let ativo =
        true

      async function carregarInteracao() {
        setCarregandoInteracao(
          true
        )

        setErro(
          null
        )

        try {
          const response =
            await fetch(
              `/api/interacoes/${encodeURIComponent(
                interacaoOrigemId!
              )}`,
              {
                cache:
                  "no-store",
              }
            )

          const data:
            | InteracaoOrigem
            | {
                message?:
                  string
              }
            | null =
            await response
              .json()
              .catch(
                () =>
                  null
              )

          if (
            !ativo
          ) {
            return
          }

          if (
            !response.ok ||
            !data ||
            !(
              "id" in
              data
            )
          ) {
            setErro(
              (
                data &&
                "message" in
                  data &&
                data.message
              ) ||
                "Não foi possível carregar a interação de origem."
            )

            return
          }

          const origem =
            data as
              InteracaoOrigem

          setInteracaoOrigem(
            origem
          )

          const ehProspeccao =
            origem.tipo ===
              "Prospecção" &&
            origem.clienteId ===
              null &&
            origem.representadaId ===
              null &&
            Boolean(
              origem.nomeProspect
                ?.trim()
            )

          const idCliente =
            origem.cliente
              ?.id ||
            origem.clienteId

          if (
            !idCliente &&
            !ehProspeccao
          ) {
            setErro(
              "A interação não possui Cliente e não é uma Prospecção válida."
            )

            return
          }

          if (
            idCliente
          ) {
            const respostaCliente =
              await fetch(
                `/api/clientes/${encodeURIComponent(
                  idCliente
                )}`,
                {
                  cache:
                    "no-store",
                }
              )

            const cliente:
              | Cliente
              | null =
              await respostaCliente
                .json()
                .catch(
                  () =>
                    null
                )

            if (
              !ativo
            ) {
              return
            }

            if (
              !respostaCliente.ok ||
              !cliente?.id
            ) {
              setErro(
                "Não foi possível carregar o Cliente da interação."
              )

              return
            }

            setClienteId(
              cliente.id
            )

            setClienteSelecionado(
              cliente
            )

            setBuscaCliente(
              rotuloCliente(
                cliente
              )
            )
          }

          if (
            origem.representada
              ?.id
          ) {
            const representada:
              Representada =
              {
                id:
                  origem
                    .representada
                    .id,

                codigo:
                  null,

                nome:
                  origem
                    .representada
                    .nome,

                cnpj:
                  null,

                status:
                  "Ativa",
              }

            setRepresentadaId(
              representada.id
            )

            setRepresentadaSelecionada(
              representada
            )

            setBuscaRepresentada(
              representada.nome
            )
          }
        } catch {
          if (
            ativo
          ) {
            setErro(
              "Erro ao carregar a interação de origem."
            )
          }
        } finally {
          if (
            ativo
          ) {
            setCarregandoInteracao(
              false
            )
          }
        }
      }

      void carregarInteracao()

      return () => {
        ativo =
          false
      }
    },
    [
      interacaoOrigemId,
    ]
  )

  useEffect(
    () => {
      if (
        (
          interacaoOrigemId &&
          !origemEhProspeccaoSemCliente
        ) ||
        clienteSelecionado
      ) {
        setResultadosClientes(
          []
        )

        setCarregandoClientes(
          false
        )

        return
      }

      const termo =
        buscaCliente.trim()

      if (
        termo.length <
        2
      ) {
        setResultadosClientes(
          []
        )

        setCarregandoClientes(
          false
        )

        return
      }

      const controller =
        new AbortController()

      const timer =
        window.setTimeout(
          async () => {
            setCarregandoClientes(
              true
            )

            try {
              const params =
                new URLSearchParams({
                  seletor:
                    "1",

                  busca:
                    termo,

                  limit:
                    "10",

                  somenteAtivos:
                    origemEhProspeccaoSemCliente
                      ? "0"
                      : "1",
                })

              const response =
                await fetch(
                  `/api/clientes?${params.toString()}`,
                  {
                    cache:
                      "no-store",

                    signal:
                      controller.signal,
                  }
                )

              const data =
                await response
                  .json()
                  .catch(
                    () =>
                      []
                  )

              if (
                !response.ok
              ) {
                throw new Error(
                  data?.message ||
                    "Erro na busca de Clientes."
                )
              }

              if (
                !controller
                  .signal
                  .aborted
              ) {
                const clientes =
                  Array.isArray(
                    data
                  )
                    ? data as
                        Cliente[]
                    : []

                setResultadosClientes(
                  clientes.filter(
                    (
                      cliente
                    ) =>
                      cliente.status ===
                        "Ativo" ||
                      (
                        origemEhProspeccaoSemCliente &&
                        cliente.status ===
                          "Em qualificação"
                      )
                  )
                )
              }
            } catch (
              error
            ) {
              if (
                controller
                  .signal
                  .aborted
              ) {
                return
              }

              console.error(
                "Erro ao pesquisar Clientes:",
                error
              )

              setResultadosClientes(
                []
              )

              setErro(
                "Não foi possível pesquisar Clientes. Tente novamente."
              )
            } finally {
              if (
                !controller
                  .signal
                  .aborted
              ) {
                setCarregandoClientes(
                  false
                )
              }
            }
          },
          350
        )

      return () => {
        window.clearTimeout(
          timer
        )

        controller.abort()
      }
    },
    [
      interacaoOrigemId,
      origemEhProspeccaoSemCliente,
      buscaCliente,
      clienteSelecionado,
    ]
  )

  /*
   * Carrega a ficha comercial completa
   * do Cliente selecionado.
   *
   * Termômetro e Atenções Comerciais
   * são informativos e não bloqueiam
   * a criação do orçamento.
   */
  useEffect(
    () => {
      if (
        !clienteSelecionado
          ?.id
      ) {
        setClienteDetalhado(
          null
        )

        setCarregandoClienteDetalhado(
          false
        )

        setErroClienteDetalhado(
          null
        )

        return
      }

      const controller =
        new AbortController()

      const carregar =
        async () => {
          setCarregandoClienteDetalhado(
            true
          )

          setErroClienteDetalhado(
            null
          )

          try {
            const response =
              await fetch(
                `/api/clientes/${encodeURIComponent(
                  clienteSelecionado.id
                )}`,
                {
                  method:
                    "GET",

                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                }
              )

            const data =
              await response
                .json()
                .catch(
                  () =>
                    null
                )

            if (
              !response.ok
            ) {
              throw new Error(
                data?.error ||
                  data?.message ||
                  "Não foi possível carregar as informações comerciais do Cliente."
              )
            }

            if (
              !controller
                .signal
                .aborted
            ) {
              setClienteDetalhado(
                data as
                  ClienteDetalhado
              )
            }
          } catch (
            error
          ) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return
            }

            console.error(
              "Erro ao carregar informações comerciais do Cliente:",
              error
            )

            setClienteDetalhado(
              null
            )

            setErroClienteDetalhado(
              error instanceof
                Error
                ? error.message
                : "Não foi possível carregar as informações comerciais do Cliente."
            )
          } finally {
            if (
              !controller
                .signal
                .aborted
            ) {
              setCarregandoClienteDetalhado(
                false
              )
            }
          }
        }

      void carregar()

      return () => {
        controller.abort()
      }
    },
    [
      clienteSelecionado
        ?.id,
    ]
  )

  useEffect(
    () => {
      if (
        representadaSelecionada
      ) {
        setResultadosRepresentadas(
          []
        )

        setCarregandoRepresentadas(
          false
        )

        return
      }

      const termo =
        buscaRepresentada
          .trim()

      if (
        termo.length <
        2
      ) {
        setResultadosRepresentadas(
          []
        )

        setCarregandoRepresentadas(
          false
        )

        return
      }

      const controller =
        new AbortController()

      const timer =
        window.setTimeout(
          async () => {
            setCarregandoRepresentadas(
              true
            )

            try {
              const params =
                new URLSearchParams({
                  seletor:
                    "1",

                  busca:
                    termo,

                  limit:
                    "10",

                  somenteAtivas:
                    "1",
                })

              const response =
                await fetch(
                  `/api/representadas?${params.toString()}`,
                  {
                    cache:
                      "no-store",

                    signal:
                      controller.signal,
                  }
                )

              const data =
                await response
                  .json()
                  .catch(
                    () =>
                      []
                  )

              if (
                !response.ok
              ) {
                throw new Error(
                  data?.message ||
                    "Erro na busca de Representadas."
                )
              }

              if (
                !controller
                  .signal
                  .aborted
              ) {
                setResultadosRepresentadas(
                  Array.isArray(
                    data
                  )
                    ? data
                    : []
                )
              }
            } catch (
              error
            ) {
              if (
                controller
                  .signal
                  .aborted
              ) {
                return
              }

              console.error(
                "Erro ao pesquisar Representadas:",
                error
              )

              setResultadosRepresentadas(
                []
              )

              setErro(
                "Não foi possível pesquisar Representadas. Tente novamente."
              )
            } finally {
              if (
                !controller
                  .signal
                  .aborted
              ) {
                setCarregandoRepresentadas(
                  false
                )
              }
            }
          },
          350
        )

      return () => {
        window.clearTimeout(
          timer
        )

        controller.abort()
      }
    },
    [
      buscaRepresentada,
      representadaSelecionada,
    ]
  )

  useEffect(
    () => {
      if (
        !representadaId
      ) {
        setRegrasComerciais(
          []
        )

        return
      }

      let ativo =
        true

      async function carregarRegras() {
        setLoadingRegras(
          true
        )

        try {
          const response =
            await fetch(
              `/api/representadas/${encodeURIComponent(
                representadaId
              )}/regras-comerciais`,
              {
                cache:
                  "no-store",
              }
            )

          const data =
            await response
              .json()
              .catch(
                () =>
                  []
              )

          if (
            ativo
          ) {
            setRegrasComerciais(
              response.ok &&
              Array.isArray(
                data
              )
                ? data
                : []
            )
          }
        } catch {
          if (
            ativo
          ) {
            setRegrasComerciais(
              []
            )
          }
        } finally {
          if (
            ativo
          ) {
            setLoadingRegras(
              false
            )
          }
        }
      }

      void carregarRegras()

      return () => {
        ativo =
          false
      }
    },
    [
      representadaId,
    ]
  )

  function selecionarCliente(
    cliente: Cliente
  ) {
    setClienteId(
      cliente.id
    )

    setClienteSelecionado(
      cliente
    )

    setClienteDetalhado(
      null
    )

    setErroClienteDetalhado(
      null
    )

    setBuscaCliente(
      rotuloCliente(
        cliente
      )
    )

    setResultadosClientes(
      []
    )

    setListaClientesAberta(
      false
    )

    setConfirmarVinculoProspeccao(
      false
    )

    setErro(
      null
    )
  }

  function selecionarRepresentada(
    representada:
      Representada
  ) {
    setRepresentadaId(
      representada.id
    )

    setRepresentadaSelecionada(
      representada
    )

    setBuscaRepresentada(
      representada.nome
    )

    setResultadosRepresentadas(
      []
    )

    setListaRepresentadasAberta(
      false
    )

    setErro(
      null
    )
  }

  async function salvar(
    event:
      React.FormEvent
  ) {
    event.preventDefault()

    if (
      salvando
    ) {
      return
    }

    if (
      interacaoOrigemId &&
      !interacaoOrigem
    ) {
      setErro(
        "A interação de origem precisa ser carregada antes de continuar."
      )

      return
    }

    if (
      !clienteId ||
      !clienteSelecionado ||
      !clienteHabilitado
    ) {
      setErro(
        "Selecione um Cliente válido. Pré-cadastro só é aceito para Prospecção sem Cliente."
      )

      return
    }

    if (
      origemEhProspeccaoSemCliente &&
      !confirmarVinculoProspeccao
    ) {
      setErro(
        "Confirme que o Cliente selecionado corresponde à Prospecção."
      )

      return
    }

    if (
      !representadaId
    ) {
      setErro(
        "Selecione a Representada."
      )

      return
    }

    if (
      !valorTotal.trim()
    ) {
      setErro(
        "Informe o valor total do orçamento."
      )

      return
    }

    setSalvando(
      true
    )

    setErro(
      null
    )

    setSucesso(
      null
    )

    try {
      const response =
        await fetch(
          "/api/orcamentos",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                clienteId,

                representadaId,

                interacaoOrigemId:
                  interacaoOrigemId ||
                  null,

                confirmarVinculoProspeccao:
                  origemEhProspeccaoSemCliente
                    ? confirmarVinculoProspeccao
                    : false,

                valorTotal,

                condicaoPagamento,

                descricao,

                observacoes,
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(
            () =>
              null
          )

      if (
        !response.ok
      ) {
        setErro(
          data?.message ||
            "Não foi possível criar o orçamento."
        )

        return
      }

      setSucesso(
        "Orçamento criado com sucesso."
      )

      router.push(
        data?.id
          ? `/orcamentos/${data.id}`
          : "/orcamentos"
      )

      router.refresh()
    } catch {
      setErro(
        "Erro de comunicação ao criar o orçamento."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  return (
    <PageLayout title="Novo Orçamento">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.back()
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
          Validade cadastrada:{" "}
          <strong className="text-slate-700">
            7 dias corridos
          </strong>
        </div>
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {erro}
          </span>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />

          {sucesso}
        </div>
      )}

      {carregandoInteracao && (
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando interação de origem...
        </p>
      )}

      {interacaoOrigem && (
        <Card className="mb-4 border-blue-200 bg-blue-50/40">
          <CardHeader>
            <CardTitle className="text-base">
              Origem deste orçamento
            </CardTitle>

            <CardDescription>
              A interação original será
              preservada e vinculada ao
              orçamento.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Interação
                </p>

                <p className="font-mono font-semibold">
                  {formatarCodigoInteracao(
                    interacaoOrigem.numeroSequencial
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Tipo
                </p>

                <p className="font-medium">
                  {
                    interacaoOrigem.tipo
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Registrada em
                </p>

                <p>
                  {formatarData(
                    interacaoOrigem.data
                  )}
                </p>
              </div>
            </div>

            {interacaoOrigem.assunto && (
              <p>
                <strong>
                  Assunto:
                </strong>{" "}
                {
                  interacaoOrigem.assunto
                }
              </p>
            )}

            {origemEhProspeccaoSemCliente && (
              <div className="rounded-md border border-blue-200 bg-white p-3">
                <p>
                  <strong>
                    Contato da Prospecção:
                  </strong>{" "}
                  {
                    interacaoOrigem.nomeProspect
                  }
                </p>

                <p>
                  <strong>
                    Empresa informada:
                  </strong>{" "}
                  {
                    interacaoOrigem.empresaProspect ||
                    "Não informada"
                  }
                </p>

                <p>
                  <strong>
                    Origem comercial:
                  </strong>{" "}
                  {
                    interacaoOrigem.origemProspeccao ||
                    "Não informada"
                  }
                </p>

                <p className="mt-2 text-xs text-blue-800">
                  Selecione abaixo o cadastro real
                  correspondente. Caso ainda não
                  exista, será necessário criar um
                  pré-cadastro com status
                  “Em qualificação” antes de gerar
                  este orçamento. Não invente razão
                  social nem CNPJ.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={
          salvar
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Dados Comerciais
                </CardTitle>

                <CardDescription>
                  Cliente e Representada
                  envolvidos na proposta.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Cliente *
                  </Label>

                  {interacaoOrigemId &&
                  !origemEhProspeccaoSemCliente ? (
                    clienteSelecionado ? (
                      <div
                        className={`rounded-md border p-4 ${
                          clienteHabilitado
                            ? "bg-slate-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 className="h-4 w-4 text-blue-600" />

                          {rotuloCliente(
                            clienteSelecionado
                          )}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {clienteSelecionado.codigo
                            ? `${clienteSelecionado.codigo} — `
                            : ""}

                          CNPJ:{" "}
                          {clienteSelecionado.cnpj ||
                            "não informado"}
                        </p>

                        {!clienteHabilitado && (
                          <div className="mt-3 rounded-md border border-red-200 bg-white p-3">
                            <p className="text-sm font-medium text-red-700">
                              Cadastro comercial incompleto
                              ou inativo.
                            </p>

                            <p className="mt-1 text-xs text-red-600">
                              Para esta interação, o Cliente
                              precisa estar ativo e ter CNPJ
                              cadastrado.
                            </p>

                            <Link
                              href={`/clientes/${clienteSelecionado.id}/editar`}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Completar cadastro
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                        {carregandoInteracao
                          ? "Carregando Cliente da interação..."
                          : "A interação não pôde ser vinculada a um Cliente válido."}
                      </div>
                    )
                  ) : (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        value={
                          buscaCliente
                        }
                        onFocus={() =>
                          setListaClientesAberta(
                            true
                          )
                        }
                        onBlur={() =>
                          window.setTimeout(
                            () =>
                              setListaClientesAberta(
                                false
                              ),
                            150
                          )
                        }
                        onChange={(
                          event
                        ) => {
                          setBuscaCliente(
                            event.target.value
                          )

                          setClienteId(
                            ""
                          )

                          setClienteSelecionado(
                            null
                          )

                          setClienteDetalhado(
                            null
                          )

                          setErroClienteDetalhado(
                            null
                          )

                          setConfirmarVinculoProspeccao(
                            false
                          )

                          setResultadosClientes(
                            []
                          )

                          setListaClientesAberta(
                            true
                          )
                        }}
                        placeholder={
                          origemEhProspeccaoSemCliente
                            ? "Procure a empresa real ou seu pré-cadastro..."
                            : "Digite nome, fantasia, código ou CNPJ..."
                        }
                        className="pl-9"
                        autoComplete="off"
                      />

                      {listaClientesAberta && (
                        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                          {buscaCliente
                            .trim()
                            .length <
                          2 ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Digite pelo menos 2
                              caracteres para pesquisar.
                            </div>
                          ) : carregandoClientes ? (
                            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />

                              Pesquisando Clientes...
                            </div>
                          ) : resultadosClientes.length >
                            0 ? (
                            resultadosClientes.map(
                              (
                                cliente
                              ) => (
                                <button
                                  key={
                                    cliente.id
                                  }
                                  type="button"
                                  className="block w-full border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                                  onMouseDown={(
                                    event
                                  ) => {
                                    event.preventDefault()

                                    selecionarCliente(
                                      cliente
                                    )
                                  }}
                                >
                                  <div className="text-sm font-medium">
                                    {rotuloCliente(
                                      cliente
                                    )}
                                  </div>

                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    {cliente.codigo && (
                                      <span>
                                        {
                                          cliente.codigo
                                        }
                                      </span>
                                    )}

                                    {cliente.nomeFantasia &&
                                      cliente.nomeFantasia !==
                                        cliente.razaoSocial && (
                                        <span>
                                          Razão social:{" "}
                                          {
                                            cliente.razaoSocial
                                          }
                                        </span>
                                      )}

                                    {cliente.cnpj && (
                                      <span>
                                        CNPJ:{" "}
                                        {
                                          cliente.cnpj
                                        }
                                      </span>
                                    )}

                                    {cliente.status ===
                                      "Em qualificação" && (
                                      <span>
                                        Em qualificação
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            )
                          ) : (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Nenhum cadastro permitido
                              encontrado. Verifique se a
                              empresa já existe antes de
                              solicitar um pré-cadastro.
                            </div>
                          )}
                        </div>
                      )}

                      {clienteSelecionado && (
                        <div
                          className={`mt-2 rounded-md border p-3 text-sm ${
                            clienteHabilitado
                              ? "bg-slate-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <p className="font-medium">
                            {rotuloCliente(
                              clienteSelecionado
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {clienteSelecionado.codigo ||
                              "Sem código"}{" "}
                            ·{" "}
                            {
                              clienteSelecionado.status
                            }
                            {clienteSelecionado.cnpj
                              ? ` · CNPJ: ${clienteSelecionado.cnpj}`
                              : " · CNPJ não informado"}
                          </p>

                          {!clienteHabilitado && (
                            <p className="mt-2 text-xs text-red-700">
                              Este cadastro não atende às
                              condições para gerar o
                              orçamento. Somente
                              pré-cadastros em qualificação
                              ligados a Prospecção dispensam
                              CNPJ.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {clienteSelecionado && (
                  <div className="space-y-3">
                    {carregandoClienteDetalhado && (
                      <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Carregando Termômetro e
                        Atenções Comerciais do Cliente...
                      </div>
                    )}

                    {erroClienteDetalhado && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                          <p className="font-medium">
                            Não foi possível carregar o
                            resumo comercial do Cliente.
                          </p>

                          <p className="mt-1">
                            {
                              erroClienteDetalhado
                            }
                          </p>

                          <p className="mt-1 text-xs">
                            O orçamento não está bloqueado
                            por este aviso. Consulte a ficha
                            do Cliente caso precise dessas
                            informações antes de continuar.
                          </p>
                        </div>
                      </div>
                    )}

                    {clienteDetalhado && (
                      <>
                        <div
                          className={`rounded-md border p-3 ${termometro.classe}`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                Termômetro de relacionamento
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  termometro.emoji
                                }{" "}
                                {
                                  termometro.titulo
                                }
                              </p>
                            </div>

                            <Link
                              href={`/clientes/${clienteSelecionado.id}`}
                              className="text-sm font-medium underline underline-offset-4"
                            >
                              Ver ficha do Cliente
                            </Link>
                          </div>
                        </div>

                        {atencoesAtivas.length >
                        0 ? (
                          <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-orange-950">
                                  Este Cliente possui{" "}
                                  {
                                    atencoesAtivas.length
                                  }{" "}
                                  Atenção Comercial ativa
                                  {atencoesAtivas.length ===
                                  1
                                    ? ""
                                    : "s"}
                                  .
                                </p>

                                <p className="mt-1 text-sm text-orange-900">
                                  Leia as informações antes
                                  de elaborar a proposta.
                                  Elas são alertas comerciais
                                  e não bloqueiam
                                  automaticamente o
                                  Orçamento.
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {atencoesAtivasOrdenadas
                                .slice(
                                  0,
                                  5
                                )
                                .map(
                                  (
                                    atencao
                                  ) => {
                                    const atencaoDaRepresentada =
                                      Boolean(
                                        representadaId &&
                                        atencao
                                          .representada
                                          ?.id ===
                                          representadaId
                                      )

                                    return (
                                      <div
                                        key={
                                          atencao.id
                                        }
                                        className={`rounded-md border p-3 ${
                                          atencaoDaRepresentada
                                            ? "border-orange-400 bg-orange-100"
                                            : "border-orange-200 bg-white/80"
                                        }`}
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span
                                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${classeTipoAtencao(
                                              atencao.tipo
                                            )}`}
                                          >
                                            {
                                              atencao.tipo
                                            }
                                          </span>

                                          {atencao.representada ? (
                                            <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                              Representada:{" "}
                                              {
                                                atencao
                                                  .representada
                                                  .nome
                                              }
                                            </span>
                                          ) : (
                                            <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                              Geral do Cliente
                                            </span>
                                          )}

                                          {atencaoDaRepresentada && (
                                            <span className="rounded-full border border-orange-400 bg-orange-200 px-2 py-0.5 text-xs font-semibold text-orange-950">
                                              Relacionada à
                                              Representada deste
                                              Orçamento
                                            </span>
                                          )}
                                        </div>

                                        <p className="mt-2 font-medium text-slate-900">
                                          {
                                            atencao.titulo
                                          }
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                          {
                                            atencao.descricao
                                          }
                                        </p>
                                      </div>
                                    )
                                  }
                                )}

                              {atencoesAtivas.length >
                                5 && (
                                <p className="text-sm font-medium text-orange-900">
                                  Existem mais{" "}
                                  {atencoesAtivas.length -
                                    5}{" "}
                                  Atenção
                                  {atencoesAtivas.length -
                                    5 ===
                                  1
                                    ? ""
                                    : "ões"}{" "}
                                  ativa
                                  {atencoesAtivas.length -
                                    5 ===
                                  1
                                    ? ""
                                    : "s"}{" "}
                                  na ficha do Cliente.
                                </p>
                              )}
                            </div>

                            <div className="mt-3">
                              <Link
                                href={`/clientes/${clienteSelecionado.id}`}
                                className="text-sm font-semibold text-orange-950 underline underline-offset-4"
                              >
                                Ver todas as Atenções do
                                Cliente
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                            Nenhuma Atenção Comercial ativa
                            registrada para este Cliente.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {origemEhProspeccaoSemCliente &&
                  clienteSelecionado && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0"
                        checked={
                          confirmarVinculoProspeccao
                        }
                        onChange={(
                          event
                        ) =>
                          setConfirmarVinculoProspeccao(
                            event.target.checked
                          )
                        }
                      />

                      <span>
                        Confirmo que{" "}
                        <strong>
                          {rotuloCliente(
                            clienteSelecionado
                          )}
                        </strong>{" "}
                        é a mesma empresa da
                        Prospecção{" "}
                        <strong>
                          {formatarCodigoInteracao(
                            interacaoOrigem!
                              .numeroSequencial
                          )}
                        </strong>
                        {interacaoOrigem
                          ?.empresaProspect
                          ? ` (${interacaoOrigem.empresaProspect})`
                          : ""}
                        . Verifiquei a identidade; não
                        estou criando um cadastro fictício
                        ou duplicado.
                      </span>
                    </label>
                  )}

                <div className="space-y-2">
                  <Label>
                    Representada *
                  </Label>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      value={
                        buscaRepresentada
                      }
                      onFocus={() =>
                        setListaRepresentadasAberta(
                          true
                        )
                      }
                      onBlur={() =>
                        window.setTimeout(
                          () =>
                            setListaRepresentadasAberta(
                              false
                            ),
                          150
                        )
                      }
                      onChange={(
                        event
                      ) => {
                        setBuscaRepresentada(
                          event.target.value
                        )

                        setRepresentadaId(
                          ""
                        )

                        setRepresentadaSelecionada(
                          null
                        )

                        setResultadosRepresentadas(
                          []
                        )

                        setListaRepresentadasAberta(
                          true
                        )
                      }}
                      placeholder="Digite nome, código ou CNPJ..."
                      className="pl-9"
                      autoComplete="off"
                    />

                    {listaRepresentadasAberta && (
                      <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                        {buscaRepresentada
                          .trim()
                          .length <
                        2 ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            Digite pelo menos 2 caracteres
                            para pesquisar.
                          </div>
                        ) : carregandoRepresentadas ? (
                          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />

                            Pesquisando Representadas...
                          </div>
                        ) : resultadosRepresentadas.length >
                          0 ? (
                          resultadosRepresentadas.map(
                            (
                              representada
                            ) => (
                              <button
                                key={
                                  representada.id
                                }
                                type="button"
                                className="block w-full border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                                onMouseDown={(
                                  event
                                ) => {
                                  event.preventDefault()

                                  selecionarRepresentada(
                                    representada
                                  )
                                }}
                              >
                                <div className="text-sm font-medium">
                                  {
                                    representada.nome
                                  }
                                </div>

                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                  {representada.codigo && (
                                    <span>
                                      {
                                        representada.codigo
                                      }
                                    </span>
                                  )}

                                  {representada.cnpj && (
                                    <span>
                                      CNPJ:{" "}
                                      {
                                        representada.cnpj
                                      }
                                    </span>
                                  )}
                                </div>
                              </button>
                            )
                          )
                        ) : (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            Nenhuma Representada ativa
                            encontrada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {representadaSelecionada && (
                    <div className="rounded-md border bg-slate-50 p-3 text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <Factory className="h-4 w-4 text-orange-600" />

                        {
                          representadaSelecionada.nome
                        }
                      </div>

                      {representadaSelecionada.cnpj && (
                        <p className="mt-1 text-muted-foreground">
                          CNPJ:{" "}
                          {
                            representadaSelecionada.cnpj
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {representadaId && (
                  <div className="space-y-2">
                    <Label>
                      Política comercial aplicável
                    </Label>

                    {loadingRegras ? (
                      <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Consultando regras da
                        Representada...
                      </div>
                    ) : regraAplicavel ? (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <p className="font-medium text-green-900">
                          {
                            regraAplicavel.nome
                          }
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                          {regraAplicavel.clienteId
                            ? "Regra específica deste Cliente"
                            : "Regra padrão da Representada"}
                        </p>

                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Pedido mínimo
                            </p>

                            <p className="font-medium">
                              {formatarMoeda(
                                regraAplicavel.pedidoMinimo
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Parcela mínima
                            </p>

                            <p className="font-medium">
                              {formatarMoeda(
                                regraAplicavel.minimoParcela
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Prazo de entrega
                            </p>

                            <p className="font-medium">
                              {regraAplicavel
                                .prazoEntregaDias !==
                              null
                                ? `${regraAplicavel.prazoEntregaDias} dia(s)`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Prazo de faturamento
                            </p>

                            <p className="font-medium">
                              {regraAplicavel
                                .prazoFaturamentoDias !==
                              null
                                ? `${regraAplicavel.prazoFaturamentoDias} dia(s)`
                                : "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Frete
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.frete ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Região
                            </p>

                            <p className="font-medium">
                              {regraAplicavel.regiao ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                          <p className="font-medium">
                            Nenhuma regra comercial ativa
                            encontrada.
                          </p>

                          <p className="mt-1 text-xs">
                            O orçamento pode continuar.
                            Nenhuma condição comercial será
                            presumida pelo sistema.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="valorTotal">
                    Valor total *
                  </Label>

                  <Input
                    id="valorTotal"
                    value={
                      valorTotal
                    }
                    onChange={(
                      event
                    ) =>
                      setValorTotal(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: 12.500,00"
                    inputMode="decimal"
                    disabled={
                      !clienteHabilitado
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicaoPagamento">
                    Condição de pagamento
                  </Label>

                  <Input
                    id="condicaoPagamento"
                    value={
                      condicaoPagamento
                    }
                    onChange={(
                      event
                    ) =>
                      setCondicaoPagamento(
                        event.target.value
                      )
                    }
                    placeholder="Enquanto não houver política cadastrada, informe manualmente."
                    disabled={
                      !clienteHabilitado
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    Descrição / escopo do orçamento
                  </Label>

                  <Textarea
                    id="descricao"
                    value={
                      descricao
                    }
                    onChange={(
                      event
                    ) =>
                      setDescricao(
                        event.target.value
                      )
                    }
                    rows={
                      5
                    }
                    disabled={
                      !clienteHabilitado
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Observações internas
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Textarea
                  value={
                    observacoes
                  }
                  onChange={(
                    event
                  ) =>
                    setObservacoes(
                      event.target.value
                    )
                  }
                  rows={
                    4
                  }
                  disabled={
                    !clienteHabilitado
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Prazo
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-md border bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-amber-700" />

                    <span className="font-semibold">
                      7 dias corridos
                    </span>
                  </div>

                  <p className="mt-2 text-sm">
                    Validade registrada até:
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {
                      validadePadrao
                    }
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    A criação não registra envio ao
                    comprador. Orçamentos não enviados
                    não vencem automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={
              !formularioPodeSalvar
            }
          >
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando orçamento...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Criar Orçamento
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={
              salvando
            }
            onClick={() =>
              router.back()
            }
          >
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}