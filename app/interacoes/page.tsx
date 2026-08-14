"use client"

import { useEffect, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Calendar,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  User,
  Loader2,
  AlertCircle,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

type Interacao = {
  id: string
  data: string
  tipo: string
  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null
  clienteId: string
  cliente: Cliente
}

const corTipo: Record<string, string> = {
  WhatsApp: "bg-green-100 text-green-800",
  "E-mail": "bg-blue-100 text-blue-800",
  Visita: "bg-orange-100 text-orange-800",
  Ligação: "bg-purple-100 text-purple-800",
  Outro: "bg-gray-100 text-gray-800",
}

const iconeTipo = (tipo: string) => {
  switch (tipo) {
    case "WhatsApp": return <MessageSquare className="h-3 w-3 text-green-500" />
    case "E-mail": return <Mail className="h-3 w-3 text-blue-500" />
    case "Visita": return <User className="h-3 w-3 text-orange-500" />
    case "Ligação": return <Phone className="h-3 w-3 text-purple-500" />
    default: return <ClipboardList className="h-3 w-3 text-gray-500" />
  }
}

function formatarData(dataISO: string) {
  const d = new Date(dataISO)
  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  )
}

const TIPOS_ABA: Record<string, string> = {
  todas: "todas",
  whatsapp: "WhatsApp",
  email: "E-mail",
  visita: "Visita",
  ligacao: "Ligação",
  outro: "Outro",
}

export default function InteracoesPage() {
  const [interacoes, setInteracoes] = useState<Interacao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [abaAtiva, setAbaAtiva] = useState("todas")

  async function carregarInteracoes(aba: string) {
    setLoading(true)
    setErro(null)
    try {
      const tipo = TIPOS_ABA[aba]
      const params = tipo && tipo !== "todas" ? `?tipo=${encodeURIComponent(tipo)}` : ""
      const res = await fetch(`/api/interacoes${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInteracoes(data)
    } catch {
      setErro("Não foi possível carregar as interações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarInteracoes(abaAtiva)
  }, [abaAtiva])

  const interacoesFiltradas = interacoes.filter((i) => {
    if (!searchTerm) return true
    const termo = searchTerm.toLowerCase()
    return (
      i.cliente.razaoSocial.toLowerCase().includes(termo) ||
      (i.cliente.nomeFantasia?.toLowerCase().includes(termo) ?? false) ||
      (i.assunto?.toLowerCase().includes(termo) ?? false) ||
      (i.descricao?.toLowerCase().includes(termo) ?? false)
    )
  })

  const TabelaInteracoes = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-xxs">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando interações...
        </div>
      )
    }

    if (erro) {
      return (
        <div className="flex items-center justify-center py-8 gap-2 text-red-500 text-xxs">
          <AlertCircle className="h-4 w-4" />
          {erro}
        </div>
      )
    }

    if (interacoesFiltradas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground text-xxs">
          <ClipboardList className="h-6 w-6" />
          Nenhuma interação encontrada.
          <Link href="/interacoes/nova">
            <Button size="sm" variant="outline" className="h-7 text-xxs mt-1">
              <Plus className="h-3 w-3 mr-1" />
              Registrar primeira interação
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="border rounded-sm">
        <div className="grid grid-cols-6 text-xxs font-medium bg-muted/20 p-1 border-b">
          <div>Cliente</div>
          <div>Tipo</div>
          <div>Data/Hora</div>
          <div>Assunto</div>
          <div>Próximos Passos</div>
          <div className="text-right">Ações</div>
        </div>
        {interacoesFiltradas.map((interacao) => (
          <div key={interacao.id} className="grid grid-cols-6 text-xxs p-1 border-t hover:bg-muted/10">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">
                {interacao.cliente.nomeFantasia || interacao.cliente.razaoSocial}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {iconeTipo(interacao.tipo)}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                  corTipo[interacao.tipo] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {interacao.tipo}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{formatarData(interacao.data)}</span>
            </div>
            <div className="truncate text-muted-foreground">
              {interacao.assunto || "—"}
            </div>
            <div className="truncate text-muted-foreground">
              {interacao.proximosPasso || "—"}
            </div>
            <div className="flex items-center justify-end gap-1">
              <Link href={`/interacoes/${interacao.id}`}>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" title="Ver detalhes">
                  <Search className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <PageLayout title="Interações">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar interações..."
              className="w-full h-8 pl-7 text-xxs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xxs gap-1"
            onClick={() => carregarInteracoes(abaAtiva)}
          >
            <Filter className="h-3 w-3" />
            Atualizar
          </Button>
        </div>
        <Link href="/interacoes/nova">
          <Button size="sm" className="h-8 text-xxs gap-1">
            <Plus className="h-3 w-3" />
            Nova Interação
          </Button>
        </Link>
      </div>

      <Tabs
        defaultValue="todas"
        className="w-full"
        onValueChange={(val) => setAbaAtiva(val)}
      >
        <TabsList className="grid w-full grid-cols-6 h-8">
          <TabsTrigger value="todas" className="text-xxs">Todas</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xxs">WhatsApp</TabsTrigger>
          <TabsTrigger value="email" className="text-xxs">E-mail</TabsTrigger>
          <TabsTrigger value="visita" className="text-xxs">Visitas</TabsTrigger>
          <TabsTrigger value="ligacao" className="text-xxs">Ligações</TabsTrigger>
          <TabsTrigger value="outro" className="text-xxs">Outros</TabsTrigger>
        </TabsList>

        {Object.keys(TIPOS_ABA).map((aba) => (
          <TabsContent key={aba} value={aba} className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Histórico de Interações</CardTitle>
                <CardDescription className="card-description">
                  {interacoesFiltradas.length} registro(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TabelaInteracoes />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageLayout>
  )
}