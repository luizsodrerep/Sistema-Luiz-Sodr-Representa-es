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
  codigo: string
  cnpj: string
  comissao: string
  tipoComissao:
    | "fixa"
    | "variada"
  faixasComissao?: string
  fechamentoComissao: string
  pagamentoComissao: string
  bancoComissao: string
  contatoPrincipal: string
  emailPrincipal: string
  telefonePrincipal: string
  whatsappPrincipal: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  status: string
  observacoes: string
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
                    Fechamento Comissão
                  </p>

                  <p className="font-medium">
                    {representada.fechamentoComissao ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pagamento Comissão
                  </p>

                  <p className="font-medium">
                    {representada.pagamentoComissao ||
                      "-"}
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
                      {representada.comissao ||
                        "0"}
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