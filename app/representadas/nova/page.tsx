"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function NovaRepresentadaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "", cnpj: "", comissao: "", fechamentoComissao: "",
    pagamentoComissao: "", bancoComissao: "", contratoAssinado: false,
    emiteNF: true, contatoPrincipal: "", emailPrincipal: "",
    telefonePrincipal: "", whatsappPrincipal: "", contatoFinanceiro: "",
    emailFinanceiro: "", telefoneFinanceiro: "", contatoLogistica: "",
    emailLogistica: "", telefoneLogistica: "", endereco: "",
    cidade: "", estado: "", cep: "", site: "", status: "Ativa", observacoes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/representadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert("Representada cadastrada com sucesso!")
        router.push("/representadas")
      } else {
        alert("Erro ao cadastrar representada.")
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/representadas")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Nova Representada</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Comissao %</Label>
                  <Input name="comissao" type="number" step="0.01" value={formData.comissao} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Fechamento Comissao</Label>
                  <Input name="fechamentoComissao" value={formData.fechamentoComissao} onChange={handleChange} placeholder="Ex: Dia 30" />
                </div>
                <div className="space-y-2">
                  <Label>Pagamento Comissao</Label>
                  <Input name="pagamentoComissao" value={formData.pagamentoComissao} onChange={handleChange} placeholder="Ex: Dia 10 mes seguinte" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Banco Pagamento</Label>
                  <Input name="bancoComissao" value={formData.bancoComissao} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Contrato Assinado</Label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="contratoAssinado" checked={formData.contratoAssinado === true} onChange={() => setFormData({...formData, contratoAssinado: true})} />
                      <span className="text-green-700 font-medium">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="contratoAssinado" checked={formData.contratoAssinado === false} onChange={() => setFormData({...formData, contratoAssinado: false})} />
                      <span className="text-red-700 font-medium">Nao</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emite NF</Label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="emiteNF" checked={formData.emiteNF === true} onChange={() => setFormData({...formData, emiteNF: true})} />
                      <span className="text-green-700 font-medium">Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="emiteNF" checked={formData.emiteNF === false} onChange={() => setFormData({...formData, emiteNF: false})} />
                      <span className="text-red-700 font-medium">Nao</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contato Principal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Contato</Label>
                  <Input name="contatoPrincipal" value={formData.contatoPrincipal} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="emailPrincipal" type="email" value={formData.emailPrincipal} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input name="telefonePrincipal" value={formData.telefonePrincipal} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input name="whatsappPrincipal" value={formData.whatsappPrincipal} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contato Financeiro</Label>
                  <Input name="contatoFinanceiro" value={formData.contatoFinanceiro} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email Financeiro</Label>
                  <Input name="emailFinanceiro" type="email" value={formData.emailFinanceiro} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Telefone Financeiro</Label>
                <Input name="telefoneFinanceiro" value={formData.telefoneFinanceiro} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Logistica</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contato Logistica</Label>
                  <Input name="contatoLogistica" value={formData.contatoLogistica} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email Logistica</Label>
                  <Input name="emailLogistica" type="email" value={formData.emailLogistica} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Telefone Logistica</Label>
                <Input name="telefoneLogistica" value={formData.telefoneLogistica} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Endereco e Site</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endereco</Label>
                <Input name="endereco" value={formData.endereco} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input name="cidade" value={formData.cidade} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input name="estado" maxLength={2} value={formData.estado} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input name="cep" value={formData.cep} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Input name="site" value={formData.site} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observacoes</CardTitle></CardHeader>
            <CardContent>
              <Textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} />
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Representada"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/representadas")}>Cancelar</Button>
          </div>
        </div>
      </form>
    </div>
  )
}