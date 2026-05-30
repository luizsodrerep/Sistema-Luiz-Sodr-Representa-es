"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Gem,
  Ban,
  Loader,
  AlertCircle,
} from "lucide-react"

interface Representada {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  ie: string | null
  comissao: number | null
  tipoComissao: string
  faixasComissao: string | null
  fechamentoComissao: string | null
  pagamentoComissao: string | null
  bancoComissao: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  status: string
  observacoes: string | null
}

interface Faixa {
  desconto: string
  comissao: string
}

export default function RepresentadaPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [representada, setRepresentada] = useState<Representada | null>(null)
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregarRepresentada()
  }, [id])

  async function carregarRepresentada() {
    try {
      setErro(null)
      const response = await fetch(`/api/representadas/${id}`)
      if (!response.ok) throw new Error("Erro ao carregar")
      const data = await response.json()
      setRepresentada(data)
    } catch (error) {
      setErro("Representada não encontrada")
    } finally {
      setLoading(false)
    }
  }

  async function excluirRepresentada() {
    const confirmar = confirm(
      `Excluir representada "${representada?.nome}"?`
    )
    if (!confirmar) return

    try {
      setExcluindo(true)
      const response = await fetch(`/api/representadas/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error()
      alert("Representada excluída com sucesso")
      router.push("/representadas")
    } catch {
      alert("Erro ao excluir representada")
    } finally {
      setExcluindo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (erro || !representada) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="font-semibold text-red-900">{erro}</h2>
            <p className="text-red-700 text-sm mt-1">A representada não foi encontrada</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/representadas")}
          >
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  let faixas: Faixa[] = []
  try {
    if (representada.faixasComissao) {
      faixas = JSON.parse(representada.faixasComissao)
    }
  } catch (e) {
    faixas = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto p-4 space-y-6">

        {/* ===== HEADER COM CÓDIGO E STATUS ===== */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/representadas")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{representada.nome}</h1>
              <p className="text-sm text-gray-600">ID: {representada.id}</p>
            </div>
          </div>

          {/* CÓDIGO E STATUS LADO A LADO */}
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Código:</span>
              <span className="text-sm font-bold text-blue-600">
                {representada.codigo || "—"}
              </span>
            </div>

            <div className="w-px h-6 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Status:</span>
              <div className="flex items-center gap-1">
                {representada.status === "Ativa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md">
                    <Gem className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-600">Ativa</span>
                  </div>
                )}
                {representada.status === "Inativa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
                    <Ban className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-600">Inativa</span>
                  </div>
                )}
                {representada.status === "Suspensa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
                    <Ban className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-600">Suspensa</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTÕES DE AÇÃO ===== */}
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/representadas/${id}/editar`)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            disabled={excluindo}
            onClick={excluirRepresentada}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </div>

        {/* ===== CARD: DADOS CADASTRAIS ===== */}
        <Card className="shadow border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Dados Cadastrais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Nome</p>
                <p className="font-semibold text-gray-900">{representada.nome || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">CNPJ</p>
                <p className="font-semibold text-gray-900">{representada.cnpj || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Inscrição Estadual</p>
                <p className="font-semibold text-gray-900">{representada.ie || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Fechamento Comissão</p>
                <p className="font-semibold text-gray-900">{representada.fechamentoComissao || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Pagamento Comissão</p>
                <p className="font-semibold text-gray-900">{representada.pagamentoComissao || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Banco Pagador</p>
                <p className="font-semibold text-gray-900">{representada.bancoComissao || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== CARD: COMISSÃO ===== */}
        <Card className="shadow border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Comissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Tipo</p>
              <p className="font-semibold text-gray-900 capitalize">
                {representada.tipoComissao === "fixa" ? "Comissão Fixa" : "Comissão Variada"}
              </p>
            </div>

            {representada.tipoComissao === "fixa" ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 font-medium">Percentual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {representada.comissao || 0}%
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {faixas.length > 0 ? (
                  faixas.map((faixa, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Desconto</p>
                        <p className="font-semibold text-gray-900">{faixa.desconto}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Comissão</p>
                        <p className="font-semibold text-green-600">{faixa.comissao}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Nenhuma faixa configurada</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== CARD: CONTATO ===== */}
        <Card className="shadow border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Nome do Contato</p>
                <p className="font-semibold text-gray-900">{representada.contatoPrincipal || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Email</p>
                <p className="font-semibold text-gray-900">{representada.emailPrincipal || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Telefone</p>
                <p className="font-semibold text-gray-900">{representada.telefonePrincipal || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">WhatsApp</p>
                <p className="font-semibold text-gray-900">{representada.whatsappPrincipal || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== CARD: ENDEREÇO ===== */}
        <Card className="shadow border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Logradouro</p>
                <p className="font-semibold text-gray-900">{representada.endereco || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Número</p>
                <p className="font-semibold text-gray-900">{representada.numero || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Complemento</p>
                <p className="font-semibold text-gray-900">{representada.complemento || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Bairro</p>
                <p className="font-semibold text-gray-900">{representada.bairro || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Cidade</p>
                <p className="font-semibold text-gray-900">{representada.cidade || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">UF</p>
                <p className="font-semibold text-gray-900">{representada.estado || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">CEP</p>
                <p className="font-semibold text-gray-900">{representada.cep || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== CARD: OBSERVAÇÕES ===== */}
        <Card className="shadow border-gray-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">
              {representada.observacoes || "Sem observações"}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}