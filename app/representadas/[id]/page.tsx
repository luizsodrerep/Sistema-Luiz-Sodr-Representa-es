"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

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
}

export default function RepresentadaPage() {
  const router = useRouter()
  const params = useParams()
  const [representada, setRepresentada] = useState<Representada | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/representadas/${params.id}`)
      .then((res) => res.json())
      .then((data) => { setRepresentada(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja excluir esta representada?")) return
    const response = await fetch(`/api/representadas/${params.id}`, { method: "DELETE" })
    if (response.ok) {
      alert("Representada excluida com sucesso!")
      router.push("/representadas")
    } else {
      alert("Erro ao excluir.")
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>
  if (!representada) return <div className="p-8">Representada nao encontrada.</div>

  const sim = { backgroundColor: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }
  const nao = { backgroundColor: "#fee2e2", color: "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/representadas")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{representada.nome}</h2>
          <span style={{ backgroundColor: representada.status === "Ativa" ? "#dcfce7" : "#fee2e2", color: representada.status === "Ativa" ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
            {representada.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => router.push(`/representadas/${representada.id}/editar`)}>
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
            <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{representada.nome}</p></div>
            <div><p className="text-sm text-muted-foreground">CNPJ</p><p className="font-medium">{representada.cnpj || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Comissao</p><p className="font-medium">{representada.comissao ? representada.comissao + "%" : "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Banco Pagamento</p><p className="font-medium">{representada.bancoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Fechamento Comissao</p><p className="font-medium">{representada.fechamentoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Pagamento Comissao</p><p className="font-medium">{representada.pagamentoComissao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Contrato Assinado</p><span style={representada.contratoAssinado ? sim : nao}>{representada.contratoAssinado ? "Sim" : "Nao"}</span></div>
            <div><p className="text-sm text-muted-foreground">Emite NF</p><span style={representada.emiteNF ? sim : nao}>{representada.emiteNF ? "Sim" : "Nao"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contato Principal</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{representada.contatoPrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{representada.emailPrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{representada.telefonePrincipal || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">WhatsApp</p><p className="font-medium">{representada.whatsappPrincipal || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Contato</p><p className="font-medium">{representada.contatoFinanceiro || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{representada.emailFinanceiro || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{representada.telefoneFinanceiro || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Logistica</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Contato</p><p className="font-medium">{representada.contatoLogistica || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{representada.emailLogistica || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{representada.telefoneLogistica || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Endereco</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><p className="text-sm text-muted-foreground">Endereco</p><p className="font-medium">{representada.endereco || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Cidade/UF</p><p className="font-medium">{representada.cidade && representada.estado ? representada.cidade + "/" + representada.estado : "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">CEP</p><p className="font-medium">{representada.cep || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Site</p><p className="font-medium">{representada.site || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Observacoes</CardTitle></CardHeader>
          <CardContent><p>{representada.observacoes || "Nenhuma observacao."}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pedidos desta Representada</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Nenhum pedido registrado ainda.</p></CardContent>
        </Card>
      </div>
    </div>
  )
}