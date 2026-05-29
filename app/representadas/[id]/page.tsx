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
  Pencil,
} from "lucide-react"

interface Representada {
  id: string
  nome: string
  codigo: string | null
  cnpj: string | null

  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null

  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null

  tipoComissao: string | null
  comissao: string | null

  fechamentoComissao: string | null
  pagamentoComissao: string | null
  bancoComissao: string | null

  observacoes: string | null

  status: string
}

export default function RepresentadaPage() {
  const params = useParams()

  const router = useRouter()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [loading, setLoading] = useState(true)

  const [representada, setRepresentada] =
    useState<Representada | null>(null)

  useEffect(() => {
    if (!id) return

    carregarRepresentada()
  }, [id])

  async function carregarRepresentada() {
    try {
      const response = await fetch(
        `/api/representadas/${id}`
      )

      if (!response.ok) {
        throw new Error()
      }

      const data = await response.json()

      setRepresentada(data)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar representada")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Carregando...
      </div>
    )
  }

  if (!representada) {
    return (
      <div className="p-6">
        Representada não encontrada.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            onClick={() =>
              router.push("/representadas")
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>

          <h1 className="text-2xl font-bold">
            {representada.nome}
          </h1>

        </div>

        <Button
          onClick={() =>
            router.push(
              `/representadas/${representada.id}/editar`
            )
          }
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Dados Cadastrais
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <strong>Código:</strong><br />
            {representada.codigo || "-"}
          </div>

          <div>
            <strong>CNPJ:</strong><br />
            {representada.cnpj || "-"}
          </div>

          <div>
            <strong>Status:</strong><br />
            {representada.status}
          </div>

          <div>
            <strong>Tipo Comissão:</strong><br />
            {representada.tipoComissao || "-"}
          </div>

          <div>
            <strong>Comissão:</strong><br />
            {representada.comissao || "-"}
          </div>

          <div>
            <strong>Fechamento:</strong><br />
            {representada.fechamentoComissao || "-"}
          </div>

          <div>
            <strong>Pagamento:</strong><br />
            {representada.pagamentoComissao || "-"}
          </div>

          <div>
            <strong>Banco Recebedor:</strong><br />
            {representada.bancoComissao || "-"}
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Contato
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <strong>Contato:</strong><br />
            {representada.contatoPrincipal || "-"}
          </div>

          <div>
            <strong>Email:</strong><br />
            {representada.emailPrincipal || "-"}
          </div>

          <div>
            <strong>Telefone:</strong><br />
            {representada.telefonePrincipal || "-"}
          </div>

          <div>
            <strong>WhatsApp:</strong><br />
            {representada.whatsappPrincipal || "-"}
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Endereço
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <strong>Endereço:</strong><br />
            {representada.endereco || "-"}
          </div>

          <div>
            <strong>Cidade:</strong><br />
            {representada.cidade || "-"}
          </div>

          <div>
            <strong>UF:</strong><br />
            {representada.estado || "-"}
          </div>

          <div>
            <strong>CEP:</strong><br />
            {representada.cep || "-"}
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Observações
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm">
          {representada.observacoes || "-"}
        </CardContent>
      </Card>

    </div>
  )
}