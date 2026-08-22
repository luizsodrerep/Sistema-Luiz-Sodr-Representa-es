"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Pencil,
  AlertCircle,
  Loader,
  FileText,
  ListChecks,
  Landmark,
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
  tipoComissao: "fixa" | "variada"
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

export default function RepresentadaPage() {
  const params = useParams()
  const router = useRouter()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [representada, setRepresentada] =
    useState<Representada | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [erro, setErro] =
    useState<string | null>(null)

  const [excluindo, setExcluindo] =
    useState(false)

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        setErro(null)

        if (!id) {
          setErro(
            "ID da representada não encontrado"
          )
          setLoading(false)
          return
        }

        const response = await fetch(
          `/api/representadas/${id}`
        )

        if (!response.ok) {
          if (response.status === 404) {
            setErro(
              "Representada não encontrada"
            )
          } else {
            setErro(
              "Erro ao carregar representada"
            )
          }

          setLoading(false)
          return
        }

        const data: Representada =
          await response.json()

        setRepresentada(data)
      } catch (error) {
        console.error(
          "Erro ao carregar:",
          error
        )

        setErro(
          "Erro ao carregar os dados"
        )
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  const parseeFaixas = (): Faixa[] => {
    if (
      !representada?.faixasComissao
    ) {
      return []
    }

    try {
      const parsed = JSON.parse(
        representada.faixasComissao
      )

      return Array.isArray(parsed)
        ? parsed
        : []
    } catch {
      console.error(
        "Erro ao fazer parse de faixas"
      )

      return []
    }
  }

  async function excluirRepresentada() {
    setMostrarConfirmacao(false)

    try {
      setExcluindo(true)

      const response = await fetch(
        `/api/representadas/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        let mensagem =
          "Erro ao excluir representada"

        try {
          const dados =
            await response.json()

          if (
            typeof dados.message ===
            "string"
          ) {
            mensagem = dados.message
          }
        } catch {
          if (
            response.status === 404
          ) {
            mensagem =
              "Representada não encontrada"
          }
        }

        throw new Error(mensagem)
      }

      alert(
        "Representada excluída com sucesso"
      )

      router.push("/representadas")
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao excluir representada"

      console.error(
        "Erro ao excluir:",
        error
      )

      alert(mensagem)
    } finally {
      setExcluindo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />

          <p className="text-gray-600">
            Carregando representada...
          </p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />

          <div className="flex-1">
            <h2 className="font-semibold text-red-900">
              {erro}
            </h2>

            <p className="text-red-700 text-sm mt-1">
              Tente recarregar a página ou volte à lista de representadas.
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
        </div>
      </div>
    )
  }

  if (!representada) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />

          <div>
            <h2 className="font-semibold text-yellow-900">
              Representada não encontrada
            </h2>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              router.push(
                "/representadas"
              )
            }
            className="ml-auto"
          >
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const faixas = parseeFaixas()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  "/representadas"
                )
              }
              disabled={excluindo}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {representada.nome}
              </h1>

              <p className="text-sm text-slate-500">
                Código:{" "}
                {representada.codigo ||
                  "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-start xl:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/contratos`
                )
              }
              disabled={excluindo}
            >
              <FileText className="h-4 w-4 mr-2" />
              Contratos
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/regras-comerciais`
                )
              }
              disabled={excluindo}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Regras Comerciais
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/contas-recebimento`
                )
              }
              disabled={excluindo}
            >
              <Landmark className="h-4 w-4 mr-2" />
              Contas de Recebimento
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}/editar`
                )
              }
              disabled={excluindo}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>

            <Button
              variant="destructive"
              disabled={excluindo}
              onClick={() =>
                setMostrarConfirmacao(
                  true
                )
              }
            >
              <Trash2 className="h-4 w-4 mr-2" />

              {excluindo
                ? "Excluindo..."
                : "Excluir"}
            </Button>
          </div>
        </div>

        {mostrarConfirmacao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">
                  Excluir Representada
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  Tem certeza que deseja
                  excluir{" "}
                  <strong>
                    {representada.nome}
                  </strong>
                  ? Esta ação não pode ser
                  desfeita.
                </p>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setMostrarConfirmacao(
                        false
                      )
                    }
                    disabled={excluindo}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={
                      excluirRepresentada
                    }
                    disabled={excluindo}
                  >
                    {excluindo
                      ? "Excluindo..."
                      : "Excluir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Representada
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-slate-500">
                    Nome
                  </p>

                  <p className="font-medium text-slate-900">
                    {representada.nome ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    CNPJ
                  </p>

                  <p className="font-medium text-slate-900">
                    {representada.cnpj ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="font-medium">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        representada.status ===
                        "Ativa"
                          ? "bg-green-100 text-green-800"
                          : representada.status ===
                              "Inativa"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {representada.status ||
                        "-"}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Fechamento Comissão
                  </p>

                  <p className="font-medium text-slate-900">
                    {representada.fechamentoComissao ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pagamento Comissão
                  </p>

                  <p className="font-medium text-slate-900">
                    {representada.pagamentoComissao ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Banco Pagador
                  </p>

                  <p className="font-medium text-slate-900">
                    {representada.bancoComissao ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Comissão
                </h3>

                {representada.tipoComissao ===
                "variada" ? (
                  <div className="space-y-3">
                    {faixas &&
                    faixas.length > 0 ? (
                      faixas.map(
                        (
                          faixa,
                          index
                        ) => (
                          <div
                            key={index}
                            className="grid grid-cols-2 gap-4 bg-slate-50 border rounded-xl px-4 py-3"
                          >
                            <div>
                              <p className="text-xs text-slate-500">
                                Desconto
                              </p>

                              <p className="font-semibold text-slate-900">
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
                      <p className="text-slate-500 italic">
                        Nenhuma faixa configurada
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border rounded-xl p-4">
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

                  <p className="font-medium text-slate-900">
                    {representada.contatoPrincipal ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Telefone
                  </p>

                  {representada.telefonePrincipal ? (
                    <a
                      href={`tel:${representada.telefonePrincipal.replace(
                        /\D/g,
                        ""
                      )}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {
                        representada.telefonePrincipal
                      }
                    </a>
                  ) : (
                    <p className="font-medium text-slate-900">
                      -
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    WhatsApp
                  </p>

                  {representada.whatsappPrincipal ? (
                    <a
                      href={`https://wa.me/${representada.whatsappPrincipal.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-800 hover:underline"
                    >
                      {
                        representada.whatsappPrincipal
                      }
                    </a>
                  ) : (
                    <p className="font-medium text-slate-900">
                      -
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>

              <CardContent>
                {representada.emailPrincipal ? (
                  <a
                    href={`mailto:${representada.emailPrincipal}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {
                      representada.emailPrincipal
                    }
                  </a>
                ) : (
                  <p className="font-medium text-slate-900">
                    -
                  </p>
                )}
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
                <p className="text-slate-900">
                  {representada.endereco ||
                    "-"}
                </p>

                <p className="text-slate-900">
                  {representada.cidade ||
                    "-"}{" "}
                  -{" "}
                  {representada.estado ||
                    "-"}
                </p>

                <p className="text-slate-900">
                  CEP:{" "}
                  {representada.cep || "-"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Observações
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {representada.observacoes ||
                "Sem observações"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}