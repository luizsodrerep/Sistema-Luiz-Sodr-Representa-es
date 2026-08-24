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
  Calendar,
  ClipboardList,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react"

interface Cliente {
  id: string
  codigo?: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  inscricaoEstadual: string | null
  contato: string | null
  cargo: string | null
  email: string | null
  telefone: string | null
  whatsapp: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  regiao: string | null
  rota: string | null
  categoria: string | null
  status: string
  observacoes: string | null
  criadoEm: string
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

  proximoContatoEm: string | null
  statusFollowUp: string

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null

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

export default function ClientePage() {
  const router =
    useRouter()

  const params =
    useParams()

  const id =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id

  const [
    cliente,
    setCliente,
  ] =
    useState<Cliente | null>(
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
    erroInteracoes,
    setErroInteracoes,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    fetch(
      `/api/clientes/${id}`,
      {
        cache:
          "no-store",
      }
    )
      .then(
        async (
          res
        ) => {
          if (
            !res.ok
          ) {
            throw new Error(
              "Cliente não encontrado."
            )
          }

          return res.json()
        }
      )
      .then(
        (
          data
        ) => {
          setCliente(
            data
          )
        }
      )
      .catch(
        (
          error
        ) => {
          console.error(
            "Erro ao carregar cliente:",
            error
          )

          setCliente(
            null
          )
        }
      )
      .finally(
        () => {
          setLoading(
            false
          )
        }
      )
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
              `/api/interacoes?clienteId=${encodeURIComponent(
                id
              )}`,
              {
                method:
                  "GET",
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Não foi possível carregar as interações deste cliente."
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
              "Resposta inválida da API de interações."
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
            "Não foi possível carregar as interações deste cliente."
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

  const handleExcluir =
    async () => {
      if (
        !confirm(
          "Tem certeza que deseja excluir este cliente?"
        )
      ) {
        return
      }

      try {
        const response =
          await fetch(
            `/api/clientes/${id}`,
            {
              method:
                "DELETE",
            }
          )

        if (
          response.ok
        ) {
          alert(
            "Cliente excluído com sucesso!"
          )

          router.push(
            "/clientes"
          )
        } else {
          alert(
            "Erro ao excluir cliente."
          )
        }
      } catch {
        alert(
          "Erro ao conectar com o servidor."
        )
      }
    }

  const statusCor = (
    status: string
  ) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800"

      case "Inativo":
        return "bg-red-100 text-red-800"

      case "Inativo 6 meses":
        return "bg-orange-100 text-orange-800"

      case "Prospect":
        return "bg-blue-100 text-blue-800"

      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Carregando...
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="p-6">
        Cliente não encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                "/clientes"
              )
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>

          <div>
            <h1 className="text-3xl font-bold">
              {
                cliente.razaoSocial
              }
            </h1>

            <div className="mt-2 flex flex-wrap gap-2">
              {cliente.codigo && (
                <span className="text-sm font-medium">
                  Código:{" "}
                  {
                    cliente.codigo
                  }
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${statusCor(
                  cliente.status
                )}`}
              >
                {
                  cliente.status
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              router.push(
                "/interacoes/nova"
              )
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova Interação
          </Button>

          <Button
            size="sm"
            onClick={() =>
              router.push(
                `/clientes/${cliente.id}/editar`
              )
            }
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={
              handleExcluir
            }
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Dados Cadastrais
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>
              Razão Social:
            </strong>
            <br />
            {
              cliente.razaoSocial
            }
          </div>

          <div>
            <strong>
              Nome Fantasia:
            </strong>
            <br />
            {cliente.nomeFantasia ||
              "-"}
          </div>

          <div>
            <strong>
              CNPJ:
            </strong>
            <br />
            {cliente.cnpj ||
              "-"}
          </div>

          <div>
            <strong>
              Inscrição Estadual:
            </strong>
            <br />
            {cliente.inscricaoEstadual ||
              "-"}
          </div>

          <div>
            <strong>
              Categoria:
            </strong>
            <br />
            {cliente.categoria ||
              "-"}
          </div>

          <div>
            <strong>
              Status:
            </strong>
            <br />
            {
              cliente.status
            }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Endereço
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>
              Endereço:
            </strong>
            <br />
            {cliente.endereco ||
              "-"}
          </div>

          <div>
            <strong>
              Bairro:
            </strong>
            <br />
            {cliente.bairro ||
              "-"}
          </div>

          <div>
            <strong>
              Cidade / UF:
            </strong>
            <br />
            {cliente.cidade ||
              "-"}{" "}
            /{" "}
            {cliente.estado ||
              "-"}
          </div>

          <div>
            <strong>
              CEP:
            </strong>
            <br />
            {cliente.cep ||
              "-"}
          </div>

          <div>
            <strong>
              Região:
            </strong>
            <br />
            {cliente.regiao ||
              "-"}
          </div>

          <div>
            <strong>
              Rota:
            </strong>
            <br />
            {cliente.rota ||
              "-"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Contato
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>
              Contato:
            </strong>
            <br />
            {cliente.contato ||
              "-"}
          </div>

          <div>
            <strong>
              Cargo:
            </strong>
            <br />
            {cliente.cargo ||
              "-"}
          </div>

          <div>
            <strong>
              Telefone:
            </strong>
            <br />
            {cliente.telefone ||
              "-"}
          </div>

          <div>
            <strong>
              WhatsApp:
            </strong>
            <br />
            {cliente.whatsapp ||
              "-"}
          </div>

          <div>
            <strong>
              E-mail:
            </strong>
            <br />
            {cliente.email ||
              "-"}
          </div>
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
                Histórico comercial relacionado exclusivamente a este cliente.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Carregando interações...
            </div>
          ) : erroInteracoes ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <div className="flex items-center gap-2 text-sm text-red-600">
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
                <RefreshCw className="mr-2 h-4 w-4" />

                Tentar novamente
              </Button>
            </div>
          ) : interacoes.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <ClipboardList className="h-8 w-8" />

              <p>
                Nenhuma interação registrada para este cliente.
              </p>

              <Button
                variant="outline"
                size="sm"
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

                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
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
                            <p className="font-semibold text-slate-900">
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
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

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

                            <div className="flex items-start gap-2">
                              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

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
                              <p className="text-xs font-medium text-muted-foreground">
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
          {cliente.observacoes ||
            "Nenhuma observação cadastrada."}
        </CardContent>
      </Card>
    </div>
  )
}