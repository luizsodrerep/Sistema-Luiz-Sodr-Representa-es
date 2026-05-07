"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    razaoSocial: "", nomeFantasia: "", cnpj: "", inscricaoEstadual: "",
    contato: "", cargo: "", email: "", telefone: "", whatsapp: "",
    endereco: "", bairro: "", cidade: "", estado: "", cep: "",
    regiao: "", rota: "", categoria: "", status: "Ativo",
    aceitaEmail: true, observacoes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert("Cliente cadastrado com sucesso!")
        router.push("/clientes")
      } else {
        alert("Erro ao cadastrar cliente.")
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
        <Button variant="outline" onClick={() => router.push("/clientes")}>Voltar</Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">

          <Card>
            <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input id="nomeFantasia" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input id="inscricaoEstadual" name="inscricaoEstadual" value={formData.inscricaoEstadual} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                      <SelectItem value="Atacado">Atacado</SelectItem>
                      <SelectItem value="Varejo">Varejo</SelectItem>
                      <SelectItem value="Industria">Indústria</SelectItem>
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
            <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">UF</Label>
                  <Input id="estado" name="estado" maxLength={2} value={formData.estado} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" name="cep" value={formData.cep} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regiao">Região/Zona</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, regiao: v })}>
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
                  <Label htmlFor="rota">Rota de Visita</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, rota: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Segunda">Segunda-feira</SelectItem>
                      <SelectItem value="Terca">Terça-feira</SelectItem>
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
                  <Label htmlFor="contato">Nome do Contato</Label>
                  <Input id="contato" name="contato" value={formData.contato} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent>
              <Textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} />
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Cliente"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>Cancelar</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
