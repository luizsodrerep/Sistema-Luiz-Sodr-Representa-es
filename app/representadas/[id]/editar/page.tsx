"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Home } from "lucide-react"

export default function EditarRepresentadaPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    contatoPrincipal: "",
    emailPrincipal: "",
    telefonePrincipal: "",
    cidade: "",
    estado: "",
  })

  useEffect(() => {
    fetch(`/api/representadas/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          contatoPrincipal: data.contatoPrincipal || "",
          emailPrincipal: data.emailPrincipal || "",
          telefonePrincipal: data.telefonePrincipal || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        })
        setLoading(false)
      })
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)

    const res = await fetch(`/api/representadas/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      alert("Representada atualizada com sucesso!")
      router.push(`/representadas/${params.id}`)
    } else {
      alert("Erro ao salvar.")
    }

    setSalvando(false)
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Button>

        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          <Home className="h-4 w-4 mr-1" />Inicio
        </Button>

        <h2 className="text-3xl font-bold tracking-tight">Editar Representada</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" />
            <Input name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="CNPJ" />
            <Input name="contatoPrincipal" value={formData.contatoPrincipal} onChange={handleChange} placeholder="Contato" />
            <Input name="emailPrincipal" value={formData.emailPrincipal} onChange={handleChange} placeholder="Email" />
            <Input name="telefonePrincipal" value={formData.telefonePrincipal} onChange={handleChange} placeholder="Telefone" />
            <Input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" />
            <Input name="estado" value={formData.estado} onChange={handleChange} placeholder="UF" />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}