"use client"

import {
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  useParams,
  useRouter,
} from "next/navigation"

import {
  Button,
} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  formatarCodigoInteracao,
} from "@/lib/interacoes/codigo"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ClipboardList,
  Eye,
  FileText,
  Landmark,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react"

interface Faixa {
  desconto: string
  comissao: string
}

interface Representada {
  id: string
  nome: string
  codigo: string | null
  cnpj: string | null

  comissao: number | null

  tipoComissao:
    | "fixa"
    | "variada"
    | null

  faixasComissao:
    | string
    | null

  fechamentoComissao:
    | string
    | null

  pagamentoComissao:
    | string
    | null

  regraReconhecimentoComissao:
    | string
    | null

  bancoComissao:
    | string
    | null

  contatoPrincipal:
    | string
    | null

  emailPrincipal:
    | string
    | null

  telefonePrincipal:
    | string
    | null

  whatsappPrincipal:
    | string
    | null

  endereco:
    | string
    | null

  cidade:
    | string
    | null

  estado:
    | string
    | null

  cep:
    | string
    | null

  pedidoMinimo:
    | number
    | null

  minimoParcela:
    | number
    | null

  politicaFrete:
    | string
    | null

  regiaoAtendimento:
    | string
    | null

  prazoEntregaDias:
    | number
    | null

  prazoFaturamentoDias:
    | number
    | null

  status: string

  observacoes:
    | string
    | null
}

interface RegraComercial {
  id: string
  representadaId: string

  clienteId:
    | string
    | null

  contratoId:
    | string
    | null

  nome: string
  tipoEscopo: string

  vigenciaInicio: string

  vigenciaFim:
    | string
    | null

  ativa: boolean

  pedidoMinimo:
    | number
    | null

  minimoParcela:
    | number
    | null

  prazoEntregaDias:
    | number
    | null

  prazoFaturamentoDias:
    | number
    | null

  frete:
    | string
    | null

  regiao:
    | string
    | null

  tipoComissao:
    | string
    | null

  percentualComissao:
    | number
    | null

  faixasComissao:
    | string
    | null

  reconhecimentoComissao:
    | string
    | null

  fechamentoComissao:
    | string
    | null

  pagamentoComissao:
    | string
    | null

  observacoes:
    | string
    | null

  _count: {
    vendas: number
  }
}

interface UsuarioResumo {
  id: string
  nome: string
  perfil: string
}

interface Interacao {
  id: string

  numeroSequencial: number

  data: string
  tipo: string

  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null

  proximoContatoEm:
    | string
    | null

  statusFollowUp: string

  criadoPor:
    | UsuarioResumo
    | null

  responsavel:
    | UsuarioResumo
    | null

  criadoEm: string
  atualizadoEm: string
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

function formatarDataCurta(
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

  return data.toLocaleDateString(
    "pt-BR"
  )
}

function formatarValor(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "—"
  }

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )
}

function formatarPedidoMinimo(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "Não informado"
  }

  if (
    valor === 0
  ) {
    return "Sem pedido mínimo"
  }

  return formatarValor(
    valor
  )
}

function formatarMinimoParcela(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "Não informado"
  }

  if (
    valor === 0
  ) {
    return "Sem mínimo por parcela"
  }

  return formatarValor(
    valor
  )
}

function regraEstaVigente(
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
    )
  ) {
    return false
  }

  if (
    inicio > agora
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
      )
    ) {
      fim.setHours(
        23,
        59,
        59,
        999
      )

      if (
        fim < agora
      ) {
        return false
      }
    }
  }

  return true
}

function formatarComissaoRegra(
  regra: RegraComercial
) {
  if (
    regra.tipoComissao ===
    "fixa"
  ) {
    if (
      regra.percentualComissao ===
      null
    ) {
      return "Não informada"
    }

    return `${regra.percentualComissao.toLocaleString(
      "pt-BR",
      {
        maximumFractionDigits: 4,
      }
    )}%`
  }

  if (
    regra.tipoComissao ===
    "variada"
  ) {
    return "Comissão variável por faixas"
  }

  return "Não informada"
}

function formatarComissaoRepresentada(
  representada: Representada
) {
  if (
    representada.tipoComissao ===
    "variada"
  ) {
    return "Comissão variável por faixas"
  }

  if (
    representada.comissao ===
    null
  ) {
    return "Não informada"
  }

  return `${representada.comissao.toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 4,
    }
  )}%`
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

function corTipo(
  tipo: string
) {
  switch (tipo) {
    case "WhatsApp":
      return "bg-green-100 text-green-800"

    case "E-mail":
      return "bg-blue-100 text-blue-800"

    case "Visita":
      return "bg-orange-100 text-orange-800"

    case "Ligação":
      return "bg-purple-100 text-purple-800"

    default:
      return "bg-gray-100 text-gray-800"
  }
}

function corStatusFollowUp(
  status: string
) {
  switch (status) {
    case "Aberto":
      return "bg-amber-100 text-amber-800"

    case "Em acompanhamento":
      return "bg-blue-100 text-blue-800"

    case "Finalizado":
      return "bg-green-100 text-green-800"

    case "Sem acompanhamento":
      return "bg-gray-100 text-gray-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function RepresentadaPage() {
  const params =
    useParams()

  const router =
    useRouter()

  const id =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id

  const [
    representada,
    setRepresentada,
  ] =
    useState<Representada | null>(
      null
    )

  const [
    regrasComerciais,
    setRegrasComerciais,
  ] =
    useState<RegraComercial[]>(
      []
    )

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
    loadingRegras,
    setLoadingRegras,
  ] =
    useState(true)

  const [
    loadingInteracoes,
    setLoadingInteracoes,
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
    erroRegras,
    setErroRegras,
  ] =
    useState<
      string | null
    >(null)

  const [
    erroInteracoes,
    setErroInteracoes,
  ] =
    useState<
      string | null
    >(null)

  const [
    excluindo,
    setExcluindo,
  ] =
    useState(false)

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] =
    useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        setErro(null)

        if (!id) {
          setErro(
            "ID da representada não encontrado."
          )

          return
        }

        const response =
          await fetch(
            `/api/representadas/${id}`,
            {
              cache:
                "no-store",
            }
          )

        if (
          !response.ok
        ) {
          if (
            response.status ===
            404
          ) {
            setErro(
              "Representada não encontrada."
            )
          } else {
            setErro(
              "Erro ao carregar representada."
            )
          }

          return
        }

        const data:
          Representada =
          await response.json()

        setRepresentada(
          data
        )
      } catch (error) {
        console.error(
          "Erro ao carregar representada:",
          error
        )

        setErro(
          "Erro ao carregar os dados."
        )
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  const carregarRegrasComerciais =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (!id) {
          setRegrasComerciais(
            []
          )

          setLoadingRegras(
            false
          )

          return
        }

        if (
          !silencioso
        ) {
          setLoadingRegras(
            true
          )
        }

        setErroRegras(
          null
        )

        try {
          const response =
            await fetch(
              `/api/representadas/${id}/regras-comerciais`,
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Falha ao carregar regras comerciais."
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

          setRegrasComerciais(
            data
          )
        } catch (error) {
          console.error(
            "Erro ao carregar regras comerciais:",
            error
          )

          setErroRegras(
            "Não foi possível carregar as regras comerciais desta representada."
          )
        } finally {
          if (
            !silencioso
          ) {
            setLoadingRegras(
              false
            )
          }
        }
      },
      [id]
    )

  useEffect(() => {
    carregarRegrasComerciais()
  }, [
    carregarRegrasComerciais,
  ])

  const carregarInteracoes =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (!id) {
          setInteracoes(
            []
          )

          setLoadingInteracoes(
            false
          )

          return
        }

        if (
          !silencioso
        ) {
          setLoadingInteracoes(
            true
          )
        }

        setErroInteracoes(
          null
        )

        try {
          const response =
            await fetch(
              `/api/interacoes?representadaId=${encodeURIComponent(
                id
              )}`,
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Falha ao carregar interações."
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
            "Erro ao carregar interações:",
            error
          )

          setErroInteracoes(
            "Não foi possível carregar as interações desta representada."
          )
        } finally {
          if (
            !silencioso
          ) {
            setLoadingInteracoes(
              false
            )
          }
        }
      },
      [id]
    )

  useEffect(() => {
    carregarInteracoes()
  }, [
    carregarInteracoes,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarInteracoes(
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
    carregarInteracoes,
  ])

  function obterFaixas():
    Faixa[] {
    if (
      !representada
        ?.faixasComissao
    ) {
      return []
    }

    try {
      const parsed =
        JSON.parse(
          representada.faixasComissao
        )

      return Array.isArray(
        parsed
      )
        ? parsed
        : []
    } catch {
      return []
    }
  }

  async function excluirRepresentada() {
    setMostrarConfirmacao(
      false
    )

    try {
      setExcluindo(
        true
      )

      const response =
        await fetch(
          `/api/representadas/${id}`,
          {
            method:
              "DELETE",
          }
        )

      if (
        !response.ok
      ) {
        let mensagem =
          "Erro ao excluir representada."

        try {
          const dados =
            await response.json()

          if (
            typeof dados.message ===
            "string"
          ) {
            mensagem =
              dados.message
          }
        } catch {
          // mantém mensagem padrão
        }

        throw new Error(
          mensagem
        )
      }

      alert(
        "Representada excluída com sucesso."
      )

      router.push(
        "/representadas"
      )
    } catch (error) {
      const mensagem =
        error instanceof
        Error
          ? error.message
          : "Erro ao excluir representada."

      alert(mensagem)
    } finally {
      setExcluindo(
        false
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />

          <p>
            Carregando representada...
          </p>
        </div>
      </div>
    )
  }

  if (
    erro ||
    !representada
  ) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-red-600" />

            <div className="flex-1">
              <p className="font-semibold text-red-900">
                {erro ||
                  "Representada não encontrada."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  "/representadas"
                )
              }
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const faixas =
    obterFaixas()

  const regraPadraoVigente =
    regrasComerciais.find(
      (
        regra
      ) =>
        regra.tipoEscopo ===
          "Padrao" &&
        regraEstaVigente(
          regra
        )
    ) ||
    null

  const regrasEspecificasAtivas =
    regrasComerciais.filter(
      (
        regra
      ) =>
        regra.tipoEscopo !==
          "Padrao" &&
        regraEstaVigente(
          regra
        )
    ).length

  const possuiCondicoesComerciaisCadastro =
    representada.comissao !==
      null ||
    representada.tipoComissao ===
      "variada" ||
    representada.pedidoMinimo !==
      null ||
    representada.minimoParcela !==
      null ||
    Boolean(
      representada.politicaFrete
    ) ||
    Boolean(
      representada.regiaoAtendimento
    ) ||
    representada.prazoEntregaDias !==
      null ||
    representada.prazoFaturamentoDias !==
      null ||
    Boolean(
      representada.regraReconhecimentoComissao
    ) ||
    Boolean(
      representada.fechamentoComissao
    ) ||
    Boolean(
      representada.pagamentoComissao
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  "/representadas"
                )
              }
              disabled={
                excluindo
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {
                  representada.nome
                }
              </h1>

              <p className="text-sm text-slate-500">
                Código:{" "}
                {representada.codigo ||
                  "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  "/interacoes/nova"
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Interação
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/contratos`
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Contratos
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/regras-comerciais`
                )
              }
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Regras Comerciais
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/contas-recebimento`
                )
              }
            >
              <Landmark className="mr-2 h-4 w-4" />
              Contas
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/editar`
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button
              variant="destructive"
              disabled={
                excluindo
              }
              onClick={() =>
                setMostrarConfirmacao(
                  true
                )
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {mostrarConfirmacao && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  Excluir Representada
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>
                  Tem certeza que deseja excluir{" "}
                  <strong>
                    {
                      representada.nome
                    }
                  </strong>
                  ?
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setMostrarConfirmacao(
                        false
                      )
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={
                      excluirRepresentada
                    }
                  >
                    Confirmar exclusão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Representada
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">
                    Nome
                  </p>

                  <p className="font-medium">
                    {
                      representada.nome
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    CNPJ
                  </p>

                  <p className="font-medium">
                    {representada.cnpj ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="font-medium">
                    {
                      representada.status
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Fechamento da comissão
                  </p>

                  <p className="font-medium">
                    {representada.fechamentoComissao
                      ? `Dia ${representada.fechamentoComissao}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pagamento da comissão
                  </p>

                  <p className="font-medium">
                    {representada.pagamentoComissao
                      ? `Dia ${representada.pagamentoComissao}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Banco Pagador
                  </p>

                  <p className="font-medium">
                    {representada.bancoComissao ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="mb-4 font-semibold">
                  Comissão
                </h3>

                <div className="mb-4 rounded-lg border bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">
                    Base para cálculo da comissão
                  </p>

                  <p className="text-lg font-semibold text-slate-900">
                    {representada.regraReconhecimentoComissao ||
                      "Não informada"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {representada.regraReconhecimentoComissao ===
                    "Liquidez"
                      ? "A comissão é calculada conforme o pagamento do cliente."
                      : representada.regraReconhecimentoComissao ===
                        "Faturamento"
                      ? "A comissão é calculada a partir do faturamento da venda."
                      : "Edite o cadastro da Representada para definir Faturamento ou Liquidez."}
                  </p>
                </div>

                {representada.tipoComissao ===
                "variada" ? (
                  <div className="space-y-3">
                    {faixas.length >
                    0 ? (
                      faixas.map(
                        (
                          faixa,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="grid grid-cols-2 gap-4 rounded-lg border bg-slate-50 p-4"
                          >
                            <div>
                              <p className="text-xs text-slate-500">
                                Desconto
                              </p>

                              <p className="font-semibold">
                                {
                                  faixa.desconto
                                }
                                %
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                Comissão
                              </p>

                              <p className="font-semibold text-emerald-600">
                                {
                                  faixa.comissao
                                }
                                %
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhuma faixa configurada.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Comissão Fixa
                    </p>

                    <p className="text-2xl font-bold text-emerald-600">
                      {representada.comissao !==
                      null
                        ? representada.comissao.toLocaleString(
                            "pt-BR",
                            {
                              maximumFractionDigits: 4,
                            }
                          )
                        : "0"}
                      %
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Contato Principal
                  </p>

                  <p>
                    {representada.contatoPrincipal ||
                      "-"}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4" />

                  <p>
                    {representada.telefonePrincipal ||
                      "-"}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4" />

                  <p className="break-all">
                    {representada.emailPrincipal ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    WhatsApp
                  </p>

                  <p>
                    {representada.whatsappPrincipal ||
                      "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p>
                  {representada.endereco ||
                    "-"}
                </p>

                <p>
                  {representada.cidade ||
                    "-"}
                  {" / "}
                  {representada.estado ||
                    "-"}
                </p>

                <p>
                  CEP:{" "}
                  {representada.cep ||
                    "-"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Regras Comerciais
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Condições comerciais desta Representada.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarRegrasComerciais()
                  }
                  disabled={
                    loadingRegras
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      loadingRegras
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Atualizar
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/representadas/${id}/regras-comerciais`
                    )
                  }
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Gerenciar Regras
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingRegras ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-4 w-4 animate-spin" />

                Carregando regras comerciais...
              </div>
            ) : erroRegras ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />

                  {
                    erroRegras
                  }
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarRegrasComerciais()
                  }
                >
                  Tentar novamente
                </Button>
              </div>
            ) : regraPadraoVigente ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                      Regra comercial padrão ativa e vigente
                    </p>

                    <p className="mt-1 text-lg font-semibold text-emerald-950">
                      {
                        regraPadraoVigente.nome
                      }
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      Ativa
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {
                        regraPadraoVigente._count.vendas
                      }{" "}
                      venda
                      {regraPadraoVigente._count.vendas ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Vigência
                    </p>

                    <p className="font-medium">
                      {formatarDataCurta(
                        regraPadraoVigente.vigenciaInicio
                      )}{" "}
                      até{" "}
                      {regraPadraoVigente.vigenciaFim
                        ? formatarDataCurta(
                            regraPadraoVigente.vigenciaFim
                          )
                        : "sem data final"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pedido mínimo
                    </p>

                    <p className="font-medium">
                      {formatarPedidoMinimo(
                        regraPadraoVigente.pedidoMinimo
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo por parcela
                    </p>

                    <p className="font-medium">
                      {formatarMinimoParcela(
                        regraPadraoVigente.minimoParcela
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Comissão
                    </p>

                    <p className="font-medium">
                      {formatarComissaoRegra(
                        regraPadraoVigente
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Prazo de entrega
                    </p>

                    <p className="font-medium">
                      {regraPadraoVigente.prazoEntregaDias !==
                      null
                        ? `${regraPadraoVigente.prazoEntregaDias} dia(s)`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Prazo de faturamento
                    </p>

                    <p className="font-medium">
                      {regraPadraoVigente.prazoFaturamentoDias !==
                      null
                        ? `${regraPadraoVigente.prazoFaturamentoDias} dia(s)`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Frete
                    </p>

                    <p className="font-medium">
                      {regraPadraoVigente.frete ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Região
                    </p>

                    <p className="font-medium">
                      {regraPadraoVigente.regiao ||
                        "—"}
                    </p>
                  </div>
                </div>

                {regraPadraoVigente.observacoes && (
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-xs font-medium">
                      Observações da regra
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {
                        regraPadraoVigente.observacoes
                      }
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Regras específicas de clientes ativas e vigentes:{" "}
                    <span className="font-semibold text-foreground">
                      {
                        regrasEspecificasAtivas
                      }
                    </span>
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/representadas/${id}/regras-comerciais`
                      )
                    }
                  >
                    Ver histórico completo
                  </Button>
                </div>
              </div>
            ) : possuiCondicoesComerciaisCadastro ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                    Condições comerciais já cadastradas
                  </p>

                  <p className="mt-1 font-semibold text-amber-950">
                    Os dados abaixo estão salvos no cadastro principal da Representada.
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Ainda não existe uma regra comercial versionada ativa. No próximo passo estes dados serão reaproveitados automaticamente em “Gerenciar Regras”, evitando nova digitação.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pedido mínimo
                    </p>

                    <p className="font-medium">
                      {formatarPedidoMinimo(
                        representada.pedidoMinimo
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo por parcela
                    </p>

                    <p className="font-medium">
                      {formatarMinimoParcela(
                        representada.minimoParcela
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Comissão
                    </p>

                    <p className="font-medium">
                      {formatarComissaoRepresentada(
                        representada
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Comissão calculada sobre
                    </p>

                    <p className="font-medium">
                      {representada.regraReconhecimentoComissao ||
                        "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Prazo de entrega
                    </p>

                    <p className="font-medium">
                      {representada.prazoEntregaDias !==
                      null
                        ? `${representada.prazoEntregaDias} dia(s)`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Prazo de faturamento
                    </p>

                    <p className="font-medium">
                      {representada.prazoFaturamentoDias !==
                      null
                        ? `${representada.prazoFaturamentoDias} dia(s)`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Frete
                    </p>

                    <p className="font-medium">
                      {representada.politicaFrete ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Região
                    </p>

                    <p className="font-medium">
                      {representada.regiaoAtendimento ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fechamento da comissão
                    </p>

                    <p className="font-medium">
                      {representada.fechamentoComissao
                        ? `Dia ${representada.fechamentoComissao}`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Pagamento da comissão
                    </p>

                    <p className="font-medium">
                      {representada.pagamentoComissao
                        ? `Dia ${representada.pagamentoComissao}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {regrasComerciais.length >
                  0 && (
                  <p className="border-t pt-3 text-xs text-muted-foreground">
                    Existem{" "}
                    <span className="font-semibold text-foreground">
                      {
                        regrasComerciais.length
                      }
                    </span>{" "}
                    regra(s) no histórico, mas nenhuma regra padrão está ativa e vigente neste momento.
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/representadas/${id}/regras-comerciais`
                      )
                    }
                  >
                    <ListChecks className="mr-2 h-4 w-4" />

                    Gerenciar e versionar regras
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
                <ListChecks className="h-8 w-8" />

                <div>
                  <p className="font-medium text-foreground">
                    Nenhuma condição comercial encontrada.
                  </p>

                  <p className="mt-1 text-sm">
                    Não existem condições comerciais no cadastro principal nem regra padrão ativa e vigente.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/representadas/${id}/regras-comerciais`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />

                  Abrir Regras Comerciais
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Interações
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Histórico institucional relacionado exclusivamente a esta representada.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarInteracoes()
                  }
                  disabled={
                    loadingInteracoes
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      loadingInteracoes
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Atualizar
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/interacoes/nova"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Interação
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingInteracoes ? (
              <div className="flex items-center justify-center gap-2 py-10">
                <Loader2 className="h-4 w-4 animate-spin" />

                Carregando interações...
              </div>
            ) : erroInteracoes ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />

                  {
                    erroInteracoes
                  }
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarInteracoes()
                  }
                >
                  Tentar novamente
                </Button>
              </div>
            ) : interacoes.length ===
              0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                <ClipboardList className="h-8 w-8" />

                <p>
                  Nenhuma interação registrada para esta representada.
                </p>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      "/interacoes/nova"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />

                  Registrar primeira interação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {interacoes.map(
                  (
                    interacao
                  ) => {
                    const editada =
                      foiEditada(
                        interacao.criadoEm,
                        interacao.atualizadoEm
                      )

                    const codigo =
                      formatarCodigoInteracao(
                        interacao.numeroSequencial
                      )

                    return (
                      <div
                        key={
                          interacao.id
                        }
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/20"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                              {
                                codigo
                              }
                            </span>

                            <span className="text-xs text-muted-foreground">
                              Identificação permanente
                            </span>
                          </div>

                          {editada && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              Editada
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${corTipo(
                                  interacao.tipo
                                )}`}
                              >
                                {
                                  interacao.tipo
                                }
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${corStatusFollowUp(
                                  interacao.statusFollowUp
                                )}`}
                              >
                                {
                                  interacao.statusFollowUp
                                }
                              </span>
                            </div>

                            <div>
                              <p className="font-semibold">
                                {interacao.assunto ||
                                  "Sem assunto"}
                              </p>

                              {interacao.descricao && (
                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                  {
                                    interacao.descricao
                                  }
                                </p>
                              )}
                            </div>

                            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                              <div className="flex gap-2">
                                <Calendar className="mt-0.5 h-4 w-4" />

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Registrada em
                                  </p>

                                  <p>
                                    {formatarData(
                                      interacao.data
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <User className="mt-0.5 h-4 w-4" />

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Autor
                                  </p>

                                  <p>
                                    {interacao.criadoPor
                                      ?.nome ||
                                      "—"}
                                  </p>

                                  {interacao.criadoPor
                                    ?.perfil && (
                                    <p className="text-xs text-muted-foreground">
                                      {
                                        interacao.criadoPor.perfil
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Próximo acompanhamento
                                </p>

                                <p>
                                  {formatarData(
                                    interacao.proximoContatoEm
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Responsável
                                </p>

                                <p>
                                  {interacao.responsavel
                                    ?.nome ||
                                    "—"}
                                </p>
                              </div>
                            </div>

                            {interacao.resultado && (
                              <div className="rounded-md bg-muted/40 p-3">
                                <p className="text-xs font-medium">
                                  Resultado
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                  {
                                    interacao.resultado
                                  }
                                </p>
                              </div>
                            )}

                            {interacao.proximosPasso && (
                              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-medium text-amber-800">
                                  Próximos passos
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">
                                  {
                                    interacao.proximosPasso
                                  }
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/interacoes/${interacao.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />

                            Ver
                          </Button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Observações
            </CardTitle>
          </CardHeader>

          <CardContent>
            {representada.observacoes ||
              "Nenhuma observação cadastrada."}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}