"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

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

export default function ClientePage() {
  const router = useRouter()
  const params = useParams()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clientes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCliente(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Cliente excluído com sucesso!")
        router.push("/clientes")
      } else {
        alert("Erro ao excluir cliente.")
      }
    } catch {
      alert("Erro ao conectar com o servidor.")
    }
  }

  const statusCor = (status: string) => {
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
    return <div className="p-6">Carregando...</div>
  }

  if (!cliente) {
    return <div className="p-6">Cliente não encontrado.</div>
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/clientes")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>

          <div>
            <h1 className="text-3xl font-bold">
              {cliente.razaoSocial}
            </h1>

            <div className="flex gap-2 mt-2">

              {cliente.codigo && (
                <span className="text-sm font-medium">
                  Código: {cliente.codigo}
                </span>
              )}

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusCor(
                  cliente.status
                )}`}
              >
                {cliente.status}
              </span>

            </div>
          </div>
        </div>

        <div className="flex gap-2">

          <Button
            size="sm"
            onClick={() =>
              router.push(`/clientes/${cliente.id}/editar`)
            }
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleExcluir}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>

        </div>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Cadastrais</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><strong>Razão Social:</strong><br />{cliente.razaoSocial}</div>
          <div><strong>Nome Fantasia:</strong><br />{cliente.nomeFantasia || "-"}</div>
          <div><strong>CNPJ:</strong><br />{cliente.cnpj || "-"}</div>
          <div><strong>Inscrição Estadual:</strong><br />{cliente.inscricaoEstadual || "-"}</div>
          <div><strong>Categoria:</strong><br />{cliente.categoria || "-"}</div>
          <div><strong>Status:</strong><br />{cliente.status}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><strong>Endereço:</strong><br />{cliente.endereco || "-"}</div>
          <div><strong>Bairro:</strong><br />{cliente.bairro || "-"}</div>
          <div><strong>Cidade / UF:</strong><br />{cliente.cidade || "-"} / {cliente.estado || "-"}</div>
          <div><strong>CEP:</strong><br />{cliente.cep || "-"}</div>
          <div><strong>Região:</strong><br />{cliente.regiao || "-"}</div>
          <div><strong>Rota:</strong><br />{cliente.rota || "-"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><strong>Contato:</strong><br />{cliente.contato || "-"}</div>
          <div><strong>Cargo:</strong><br />{cliente.cargo || "-"}</div>
          <div><strong>Telefone:</strong><br />{cliente.telefone || "-"}</div>
          <div><strong>WhatsApp:</strong><br />{cliente.whatsapp || "-"}</div>
          <div><strong>E-mail:</strong><br />{cliente.email || "-"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>

        <CardContent>
          {cliente.observacoes || "Nenhuma observação cadastrada."}
        </CardContent>
      </Card>

    </div>
  )
}