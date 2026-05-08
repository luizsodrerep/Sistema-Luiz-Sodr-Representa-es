"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetch(`/api/clientes/${params.id}`)
      .then((res) => res.json())
      .then((data) => { setFormData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert("Cliente atualizado com sucesso!")
        router.push(`/clientes/${params.id}`)
      } else {
        alert("Erro ao atualizar cliente.")
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/clientes/${params.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razao Social *</Label>
                  <Input name="razaoSocial" value={formData.razaoSocial || ""} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input name="nomeFantasia" value={formData.nomeFantasia || ""} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input name="cnpj" value={formData.cnpj || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Inscricao Estadual</Label>
                  <Input name="inscricaoEstadual" value={formData.inscricaoEstadual || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.categoria || ""} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                      <SelectItem value="Atacado">Atacado</SelectItem>
                      <SelectItem value="Varejo">Varejo</SelectItem>
                      <SelectItem value="Industria">Industria</SelectItem>
                      <SelectItem value="Confeitaria">Confeitaria</SelectItem>
                      <SelectItem value="Supermercado">Supermercado</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Endereco</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endereco</Label>
                <Input name="endereco" value={formData.endereco || ""} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input name="bairro" value={formData.bairro || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input name="cidade" value={formData.cidade || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input name="estado" maxLength={2} value={formData.estado || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input name="cep" value={formData.cep || ""} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regiao/Zona</Label>
                  <Select value={formData.regiao || ""} onValueChange={(v) => setFormData({ ...formData, regiao: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                      <SelectItem value="Zona Sul">Zona Sul</SelectItem>
                      <SelectItem value="Zona Leste">Zona Leste</SelectItem>
                      <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                      <SelectItem value="Centro">Centro</SelectItem>
                      <SelectItem value="Grande SP">Grande SP</SelectItem>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Outro Estado">Outro Estado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rota de Visita</Label>
                  <Select value={formData.rota || ""} onValueChange={(v) => setFormData({ ...formData, rota: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Segunda">Segunda-feira</SelectItem>
                      <SelectItem value="Terca">Terca-feira</SelectItem>
                      <SelectItem value="Quarta">Quarta-feira</SelectItem>
                      <SelectItem value="Quinta">Quinta-feira</SelectItem>
                      <SelectItem value="Sexta">Sexta-feira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Contato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Contato</Label>
                  <Input name="contato" value={formData.contato || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input name="cargo" value={formData.cargo || ""} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input name="telefone" value={formData.telefone || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input name="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Observacoes</CardTitle></CardHeader>
            <CardContent>
              <Textarea name="observacoes" value={formData.observacoes || ""} onChange={handleChange} rows={3} />
            </CardContent>
          </Card>
          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Alteracoes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/clientes/${params.id}`)}>Cancelar</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
