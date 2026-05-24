"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  cidade: string | null
  estado: string | null
  observacoes: string | null
}

export default function EditarRepresentadaPage() {
  const router = useRouter()
  const params = useParams()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Representada>({
    id: "",
    nome: "",
    cnpj: "",
    contatoPrincipal: "",
    emailPrincipal: "",
    telefonePrincipal: "",
    cidade: "",
    estado: "",
    observacoes: "",
  })

  useEffect(() => {
    if (!id) return

    async function carregarRepresentada() {
      try {
        const response = await fetch(`/api/representadas/${id}`)

        if (!response.ok) {
          throw new Error("Erro ao carregar")
        }

        const data = await response.json()

        setFormData({
          id: data.id || "",
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          contatoPrincipal: data.contatoPrincipal || "",
          emailPrincipal: data.emailPrincipal || "",
          telefonePrincipal: data.telefonePrincipal || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          observacoes: data.observacoes || "",
        })
      } catch (error) {
        console.error(error)
        alert("Erro ao carregar representada")
      } finally {
        setLoading(false)
      }
    }

    carregarRepresentada()
  }, [id])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSalvar() {
    try {
      const response = await fetch(`/api/representadas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar")
      }

      alert("Representada atualizada com sucesso")

      router.push(`/representadas/${id}`)
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar representada")
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Representada</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
          />

          <Input
            name="cnpj"
            placeholder="CNPJ"
            value={formData.cnpj || ""}
            onChange={handleChange}
          />

          <Input
            name="contatoPrincipal"
            placeholder="Contato Principal"
            value={formData.contatoPrincipal || ""}
            onChange={handleChange}
          />

          <Input
            name="emailPrincipal"
            placeholder="Email"
            value={formData.emailPrincipal || ""}
            onChange={handleChange}
          />

          <Input
            name="telefonePrincipal"
            placeholder="Telefone"
            value={formData.telefonePrincipal || ""}
            onChange={handleChange}
          />

          <Input
            name="cidade"
            placeholder="Cidade"
            value={formData.cidade || ""}
            onChange={handleChange}
          />

          <Input
            name="estado"
            placeholder="Estado"
            value={formData.estado || ""}
            onChange={handleChange}
          />

          <Input
            name="observacoes"
            placeholder="Observações"
            value={formData.observacoes || ""}
            onChange={handleChange}
          />

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSalvar}>
              Salvar
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/representadas/${id}`)}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}