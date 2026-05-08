"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

interface Cliente {
  id: string
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
      .then((data) => { setCliente(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="p-8">Carregando...</div>
  if (!cliente) return <div className="p-8">Cliente nao encontrado.</div>

  return (
    <div className="flex flex-col p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/clientes")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{cliente.razaoSocial}</h2>
        </div>
        <Button size="sm" className="gap-1" onClick={() => router.push(`/clientes/${cliente.id}/editar`)}>
          <Pencil className="h-4 w-4" />Editar
        </Button>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Razao Social</p><p className="font-medium">{cliente.razaoSocial}</p></div>
            <div><p className="text-sm text-muted-foreground">Nome Fantasia</p><p className="font-medium">{cliente.nomeFantasia || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">CNPJ</p><p className="font-medium">{cliente.cnpj || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Inscricao Estadual</p><p className="font-medium">{cliente.inscricaoEstadual || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Categoria</p><p className="font-medium">{cliente.categoria || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium">{cliente.status}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Endereco</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><p className="text-sm text-muted-foreground">Endereco</p><p className="font-medium">{cliente.endereco || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Bairro</p><p className="font-medium">{cliente.bairro || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Cidade/UF</p><p className="font-medium">{cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">CEP</p><p className="font-medium">{cliente.cep || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Regiao/Zona</p><p className="font-medium">{cliente.regiao || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Rota de Visita</p><p className="font-medium">{cliente.rota || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contato</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Nome do Contato</p><p className="font-medium">{cliente.contato || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Cargo</p><p className="font-medium">{cliente.cargo || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{cliente.telefone || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">WhatsApp</p><p className="font-medium">{cliente.whatsapp || "-"}</p></div>
            <div className="col-span-2"><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{cliente.email || "-"}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Observacoes</CardTitle></CardHeader>
          <CardContent><p>{cliente.observacoes || "Nenhuma observacao cadastrada."}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Historico de Pedidos</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground text-sm">Nenhum pedido registrado ainda.</p></CardContent>
        </Card>
      </div>
    </div>
  )
}