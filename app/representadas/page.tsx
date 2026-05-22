"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Home, Pencil, Trash2, Plus, X } from "lucide-react"

interface Faixa {
  id?: string
  descontoAte: number
  percentualComissao: number
  ordem: number
}

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  contratoAssinado: boolean
  emiteNF: boolean
  comissao: number | null
  fechamentoComissao: string | null
  pagamentoComissao: string | null
  bancoComissao: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
  contatoFinanceiro: string | null
  emailFinanceiro: string | null
  telefoneFinanceiro: string | null
  contatoLogistica: string | null
  emailLogistica: string | null
  telefoneLogistica: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  site: string | null
  status: string
  observacoes: string | null
  faixasComissao: Faixa[]
}

export default function RepresentadaPage() {
  const router = useRouter()
  const params = useParams()
  const [rep, setRep] = useState<Representada | null>(null)
  const [loading, setLoading] = useState(true)
  const [faixas, setFaixas] = useState<Faixa[]>([])
  const [salvandoFaixas, setSalvandoFaixas] = useState(false)
  const [tipoComissao, setTipoComissao] = useState<"fixa" | "variavel">("fixa")
  const [comissaoFixa, setComissaoFixa] = useState("")

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/representadas/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setRep(data)
          setFaixas(data.faixasComissao || [])
          if (data.comissao) setComissaoFixa(String(data.comissao))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleExcluir = async () => {
    if (!confirm("Excluir esta representada?")) return
    const res = await fetch(`/api/representadas/${params.id}`, { method: "DELETE" })
    if (res.ok) { alert("Excluida!"); router.push("/representadas") }
    else alert("Erro ao excluir.")
  }

  const addFaixa = () => {
    setFaixas([...faixas, { descontoAte: 0, percentualComissao: 0, ordem: faixas.length + 1 }])
  }

  const removeFaixa = (idx: number) => setFaixas(faixas.filter((_, i) => i !== idx))

  const updateFaixa = (idx: number, field: string, value: number) => {
    const novas = [...faixas]
    novas[idx] = { ...novas[idx], [field]: value }
    setFaixas(novas)
  }

  const salvarComissaoFixa = async () => {
    setSalvandoFaixas(true)
    const res = await fetch(`/api/representadas/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rep, comissao: parseFloat(comissaoFixa) }),
    })
    if (res.ok) alert("Comissao fixa salva!")
    else alert("Erro ao salvar.")
    setSalvandoFaixas(false)
  }

  const salvarFaixas = async () => {
    setSalvandoFaixas(true)
    const res = await fetch(`/api/representadas/${params.id}/comissao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faixas }),
    })
    if (res.ok) alert("Faixas salvas!")
    else alert("Erro ao salvar faixas.")
    setSalvandoFaixas(false)
  }

  if (loading) return <div className="p-8">Carregando...</div>
  if (!rep) return <div className="p-8">Representada nao encontrada.</div>

  const sim = { backgroundColor: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 as const }
  const nao = { backgroundColor: "#fee2e2", color: "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 as const }
  const statusStyle = { backgroundColor: rep.status === "Ativa" ? "#dcfce7" : "#fee2e2", color: rep.status === "Ativa" ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 as const }

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/representadas")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-1" />Inicio
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{rep.nome}</h2>
          <span style={statusStyle}>{rep.status}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => router.push(`/representadas/${rep.id}/editar`)}>
            <Pencil className="h-4 w-4 mr-1" />Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={handleExcluir}>
            <Trash2 className="h-4 w-4 mr-1" />Excluir
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{rep.nome}</p></div>
            <div><p className="text-sm text-muted-foreground">CNPJ</p><p className="font-medium">{rep.cnpj || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Contrato Assinado</p><span style={rep.contratoAssinado ? sim : nao}>{rep.contratoAssinado ? "Sim" : "Nao"}</span></div>
            <div><p className="text-sm text-muted-foreground">Emite NF</p><span style={rep.emiteNF ? sim : nao}>{rep.emiteNF ? "Sim" : "Nao"}</span></div>
            <div><p className="text-sm text-muted-foreground">Fechamento Comissao</p><p className="font-medium">{rep.fechamentoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Pagamento Comissao</p><p className="font-medium">{rep.pagamentoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Banco</p><p className="font-medium">{rep.bancoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Site</p><p className="font-medium">{rep.site || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Politica de Comissao</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant={tipoComissao === "fixa" ? "default" : "outline"} onClick={() => setTipoComissao("fixa")}>
                Comissao Fixa
              </Button>
              <Button size="sm" variant={tipoComissao === "variavel" ? "default" : "outline"} onClick={() => setTipoComissao("variavel")}>
                Comissao Variavel
              </Button>
            </div>
            {tipoComissao === "fixa" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Percentual de Comissao Fixa (%)</p>
                <div className="flex gap-2 items-center">
                  <Input type="number" step="0.1" value={comissaoFixa} onChange={(e) => setComissaoFixa(e.target.value)} placeholder="Ex: 5" className="w-40" />
                  <Button size="sm" onClick={salvarComissaoFixa} disabled={salvandoFaixas}>
                    {salvandoFaixas ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            )}
            {tipoComissao === "variavel" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground px-2">
                  <span>Desconto ate (%)</span>
                  <span>Comissao (%)</span>
                  <span></span>
                </div>
                {faixas.map((f, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <Input type="number" step="0.1" value={f.descontoAte} onChange={(e) => updateFaixa(idx, "descontoAte", parseFloat(e.target.value))} placeholder="Ex: 5" />
                    <Input type="number" step="0.1" value={f.percentualComissao} onChange={(e) => updateFaixa(idx, "percentualComissao", parseFloat(e.target.value))} placeholder="Ex: 4" />
                    <Button size="sm" variant="ghost" onClick={() => removeFaixa(idx)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={addFaixa}>
                    <Plus className="h-4 w-4 mr-1" />Adicionar Faixa
                  </Button>
                  <Button size="sm" onClick={salvarFaixas} disabled={salvandoFaixas}>
                    {salvandoFaixas ? "Salvando..." : "Salvar Faixas"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contato Principal</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{rep.contatoPrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{rep.emailPrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{rep.telefonePrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">WhatsApp</p><p className="font-medium">{rep.whatsappPrincipal || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Contato</p><p className="font-medium">{rep.contatoFinanceiro || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{rep.emailFinanceiro || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{rep.telefoneFinanceiro || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Logistica</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Contato</p><p className="font-medium">{rep.contatoLogistica || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{rep.emailLogistica || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{rep.telefoneLogistica || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Endereco</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><p className="text-sm text-muted-foreground">Endereco</p><p className="font-medium">{rep.endereco || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Cidade/UF</p><p className="font-medium">{rep.cidade && rep.estado ? rep.cidade + "/" + rep.estado : "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">CEP</p><p className="font-medium">{rep.cep || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Observacoes</CardTitle></CardHeader>
          <CardContent><p>{rep.observacoes || "Nenhuma observacao."}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pedidos desta Representada</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Nenhum pedido registrado ainda.</p></CardContent>
        </Card>
      </div>
    </div>
  )
}