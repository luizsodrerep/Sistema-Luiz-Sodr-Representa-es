"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { PageLayout } from "@/components/page-layout"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Building2, Calendar, Filter, Mail, MessageSquare, Phone, Plus, Search, User } from "lucide-react"

export default function InteracoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [interacoes, setInteracoes] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/interacoes")
        const data = await res.json()
        setInteracoes(data)
      } catch (error) {
        console.error("Erro ao buscar interações:", error)
      }
    }

    const fetchFollowUps = async () => {
      try {
        const res = await fetch("/api/interacoes/followups")
        const data = await res.json()
        setFollowUps(data)
      } catch (error) {
        console.error("Erro ao buscar follow-ups:", error)
      }
    }

    fetchData()
    fetchFollowUps()
  }, [])

  const interacoesFiltradas = interacoes.filter((interacao) => {
    const termo = searchTerm.toLowerCase()
    return Object.values(interacao).some((valor) =>
      String(valor).toLowerCase().includes(termo)
    )
  })

  return (
    <SidebarLayout>
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
            <Button variant="outline" size="sm" className="h-8 text-xxs gap-1">
              <Filter className="h-3 w-3" />
              Filtros
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <SpreadsheetHandler moduleType="interacoes" data={interacoes} />
            <Link href="/interacoes/nova">
              <Button size="sm" className="h-8 text-xxs gap-1">
                <Plus className="h-3 w-3" />
                Nova Interação
              </Button>
            </Link>
            <Link href="/interacoes-ai">
              <Button
                size="sm"
                className="h-8 text-xxs gap-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <MessageSquare className="h-3 w-3" />
                Interações com IA
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="todas" className="text-xxs">Todas</TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xxs">WhatsApp</TabsTrigger>
            <TabsTrigger value="email" className="text-xxs">E-mail</TabsTrigger>
            <TabsTrigger value="visitas" className="text-xxs">Visitas</TabsTrigger>
            <TabsTrigger value="ligacoes" className="text-xxs">Ligações</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Histórico de Interações</CardTitle>
                <CardDescription className="card-description">Todas as interações com clientes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-sm">
                  <div className="grid grid-cols-7 text-xxs font-medium bg-muted/20 p-1">
                    <div>Cliente</div>
                    <div>Tipo</div>
                    <div>Data/Hora</div>
                    <div>Responsável</div>
                    <div>Descrição</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {interacoesFiltradas.map((interacao, i) => (
                    <div key={i} className="grid grid-cols-7 text-xxs p-1 border-t">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-primary" />
                        <Link href={`/clientes/${interacao.clienteId}`} className="hover:underline">
                          <span className="truncate">{interacao.cliente}</span>
                        </Link>
                      </div>
                      <div className="flex items-center gap-1">
                        {interacao.tipo === "WhatsApp" && <MessageSquare className="h-3 w-3 text-green-500" />}
                        {interacao.tipo === "E-mail" && <Mail className="h-3 w-3 text-blue-500" />}
                        {interacao.tipo === "Visita" && <User className="h-3 w-3 text-orange-500" />}
                        {interacao.tipo === "Ligação" && <Phone className="h-3 w-3 text-purple-500" />}
                        <span>{interacao.tipo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{interacao.data}</span>
                      </div>
                      <div>
                        <Link href={`/usuarios/${interacao.responsavelId}`} className="hover:underline">
                          {interacao.responsavel}
                        </Link>
                      </div>
                      <div className="truncate">
                        <Link href={`/representadas/${interacao.representadaId}`} className="hover:underline text-primary">
                          {interacao.representada}
                        </Link>: {interacao.descricao}
                      </div>
                      <div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${interacao.status === "Concluído"
                          ? "bg-green-100 text-green-800"
                          : interacao.status === "Aguardando Retorno"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                          }`}>
                          {interacao.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Link href={`/interacoes/${interacao.id}`}>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <Search className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2 md:grid-cols-2 mt-2">
              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Métricas de Interações</CardTitle>
                  <CardDescription className="card-description">Estatísticas de contatos com clientes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[140px] w-full bg-muted/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Follow-ups Pendentes</CardTitle>
                  <CardDescription className="card-description">Próximos contatos agendados</CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-1">
                    {followUps.map((followup, i) => (
                      <div key={i} className="flex items-center justify-between p-1 border-b last:border-0">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span className="text-xxs font-medium">{followup.cliente}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xxs">{followup.data}</span>
                        </div>
                        <div className="text-xxs">{followup.tipo}</div>
                        <div className="text-xxs text-muted-foreground">{followup.responsavel}</div>
                        <Button variant="ghost" size="sm" className="h-6 text-xxxs">
                          Concluir
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conteúdo específico das outras abas pode ser implementado com filtros adicionais */}
          <TabsContent value="whatsapp" className="mt-2" />
          <TabsContent value="email" className="mt-2" />
          <TabsContent value="visitas" className="mt-2" />
          <TabsContent value="ligacoes" className="mt-2" />
        </Tabs>
      </PageLayout>
    </SidebarLayout>
  )
}
