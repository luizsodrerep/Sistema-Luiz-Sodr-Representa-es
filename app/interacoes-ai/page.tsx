"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BarChart3,
  Building2,
  Calendar,
  Check,
  Download,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  User,
  Brain,
  Sparkles,
  AlertCircle,
  Lightbulb,
  FileText,
  Send,
} from "lucide-react"
import Link from "next/link"

export default function InteracoesAIPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [novaInteracao, setNovaInteracao] = useState({
    cliente: "",
    representante: "",
    representada: "",
    tipo: "WhatsApp",
    direcao: "Ativo",
    detalhes: "",
    data: new Date().toISOString().split("T")[0],
  })
  const [interacoes, setInteracoes] = useState([
    {
      id: 1,
      cliente: "Distribuidora ABC",
      clienteId: "1",
      representante: "Luiz Sodré",
      representanteId: "luiz-sodre",
      representada: "Descartáveis Premium",
      representadaId: "1",
      tipo: "WhatsApp",
      direcao: "Ativo",
      detalhes: "Envio de catálogo de produtos",
      data: "15/03/2023 14:30",
      status: "Concluído",
      sentimento: "positivo",
    },
    {
      id: 2,
      cliente: "Supermercado Silva",
      clienteId: "2",
      representante: "Paula Ferreira",
      representanteId: "paula-ferreira",
      representada: "Embalagens Eco",
      representadaId: "2",
      tipo: "E-mail",
      direcao: "Receptivo",
      detalhes: "Cliente solicitou proposta comercial para embalagens biodegradáveis",
      data: "15/03/2023 11:20",
      status: "Aguardando Retorno",
      sentimento: "neutro",
    },
    {
      id: 3,
      cliente: "Confeitaria Doce",
      clienteId: "3",
      representante: "Luiz Sodré",
      representanteId: "luiz-sodre",
      representada: "Papel & Cia",
      representadaId: "3",
      tipo: "Visita",
      direcao: "Ativo",
      detalhes: "Apresentação de novos produtos. Cliente demonstrou interesse nos guardanapos personalizados.",
      data: "14/03/2023 10:00",
      status: "Concluído",
      sentimento: "positivo",
    },
    {
      id: 4,
      cliente: "Atacadão Produtos",
      clienteId: "4",
      representante: "Paula Ferreira",
      representanteId: "paula-ferreira",
      representada: "Plásticos Nobre",
      representadaId: "4",
      tipo: "Ligação",
      direcao: "Receptivo",
      detalhes: "Cliente reclamou do atraso na entrega do último pedido. Prometemos resolver em 48h.",
      data: "14/03/2023 09:15",
      status: "Agendado",
      sentimento: "negativo",
    },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNovaInteracao((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNovaInteracao((prev) => ({ ...prev, [name]: value }))
  }

  const adicionarInteracao = () => {
    const novaInteracaoCompleta = {
      id: interacoes.length + 1,
      ...novaInteracao,
      data: new Date().toLocaleString(),
      status: "Pendente",
      sentimento: "neutro",
      clienteId: "1",
      representanteId: "luiz-sodre",
      representadaId: "1",
    }

    setInteracoes([novaInteracaoCompleta, ...interacoes])

    // Limpar o formulário
    setNovaInteracao({
      cliente: "",
      representante: "",
      representada: "",
      tipo: "WhatsApp",
      direcao: "Ativo",
      detalhes: "",
      data: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <PageLayout title="Interações com IA">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
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
              <Button variant="outline" size="sm" className="h-8 text-xxs gap-1">
                <Download className="h-3 w-3" />
                Exportar
              </Button>
              <Link href="/interacoes/nova">
                <Button size="sm" className="h-8 text-xxs gap-1">
                  <Plus className="h-3 w-3" />
                  Nova Interação
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nova Interação</CardTitle>
              <CardDescription>Registre uma nova interação com cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select
                      value={novaInteracao.cliente}
                      onValueChange={(value) => handleSelectChange("cliente", value)}
                    >
                      <SelectTrigger id="cliente">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Distribuidora ABC">Distribuidora ABC</SelectItem>
                        <SelectItem value="Supermercado Silva">Supermercado Silva</SelectItem>
                        <SelectItem value="Confeitaria Doce">Confeitaria Doce</SelectItem>
                        <SelectItem value="Atacadão Produtos">Atacadão Produtos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="representante">Representante</Label>
                    <Select
                      value={novaInteracao.representante}
                      onValueChange={(value) => handleSelectChange("representante", value)}
                    >
                      <SelectTrigger id="representante">
                        <SelectValue placeholder="Selecione o representante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Luiz Sodré">Luiz Sodré</SelectItem>
                        <SelectItem value="Paula Ferreira">Paula Ferreira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="representada">Representada</Label>
                    <Select
                      value={novaInteracao.representada}
                      onValueChange={(value) => handleSelectChange("representada", value)}
                    >
                      <SelectTrigger id="representada">
                        <SelectValue placeholder="Selecione a representada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Descartáveis Premium">Descartáveis Premium</SelectItem>
                        <SelectItem value="Embalagens Eco">Embalagens Eco</SelectItem>
                        <SelectItem value="Papel & Cia">Papel & Cia</SelectItem>
                        <SelectItem value="Plásticos Nobre">Plásticos Nobre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={novaInteracao.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="E-mail">E-mail</SelectItem>
                          <SelectItem value="Ligação">Ligação</SelectItem>
                          <SelectItem value="Visita">Visita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="direcao">Direção</Label>
                      <Select
                        value={novaInteracao.direcao}
                        onValueChange={(value) => handleSelectChange("direcao", value)}
                      >
                        <SelectTrigger id="direcao">
                          <SelectValue placeholder="Selecione a direção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Receptivo">Receptivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" name="data" type="date" value={novaInteracao.data} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="detalhes">Detalhes</Label>
                    <Textarea
                      id="detalhes"
                      name="detalhes"
                      placeholder="Descreva os detalhes da interação"
                      value={novaInteracao.detalhes}
                      onChange={handleInputChange}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={adicionarInteracao} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar Interação
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-8">
              <TabsTrigger value="todas" className="text-xxs">
                Todas
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xxs">
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xxs">
                E-mail
              </TabsTrigger>
              <TabsTrigger value="visitas" className="text-xxs">
                Visitas
              </TabsTrigger>
              <TabsTrigger value="ligacoes" className="text-xxs">
                Ligações
              </TabsTrigger>
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

                    {interacoes
                      .filter(
                        (interacao) =>
                          searchTerm === "" ||
                          interacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          interacao.detalhes.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((interacao) => (
                        <div key={interacao.id} className="grid grid-cols-7 text-xxs p-1 border-t">
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
                            <span className="text-[8px] text-muted-foreground ml-1">({interacao.direcao})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{interacao.data}</span>
                          </div>
                          <div>
                            <Link href={`/usuarios/${interacao.representanteId}`} className="hover:underline">
                              {interacao.representante}
                            </Link>
                          </div>
                          <div className="truncate">
                            <Link
                              href={`/representadas/${interacao.representadaId}`}
                              className="hover:underline text-primary"
                            >
                              {interacao.representada}
                            </Link>
                            : {interacao.detalhes}
                          </div>
                          <div>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                                interacao.status === "Concluído"
                                  ? "bg-green-100 text-green-800"
                                  : interacao.status === "Aguardando Retorno"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {interacao.status}
                            </span>
                            <span
                              className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${
                                interacao.sentimento === "positivo"
                                  ? "bg-green-100 text-green-800"
                                  : interacao.sentimento === "neutro"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {interacao.sentimento === "positivo"
                                ? "😊"
                                : interacao.sentimento === "neutro"
                                  ? "😐"
                                  : "😟"}
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
            </TabsContent>

            {/* Conteúdo para as outras abas (WhatsApp, E-mail, etc.) */}
            <TabsContent value="whatsapp" className="mt-2">
              {/* Conteúdo específico para WhatsApp */}
            </TabsContent>

            <TabsContent value="email" className="mt-2">
              {/* Conteúdo específico para E-mail */}
            </TabsContent>

            <TabsContent value="visitas" className="mt-2">
              {/* Conteúdo específico para Visitas */}
            </TabsContent>

            <TabsContent value="ligacoes" className="mt-2">
              {/* Conteúdo específico para Ligações */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Painel lateral de IA */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Assistente de IA
                </CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <CardDescription>Insights e sugestões baseados em interações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <h4 className="text-sm font-medium">Insights</h4>
                  </div>
                  <p className="text-xs">
                    O cliente <span className="font-medium">Atacadão Produtos</span> demonstrou insatisfação com o prazo
                    de entrega. Recomendo priorizar a resolução deste problema e agendar um follow-up para confirmar a
                    satisfação do cliente.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <h4 className="text-sm font-medium">Próximas Ações</h4>
                  </div>
                  <ul className="text-xs space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Enviar proposta para Supermercado Silva
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Verificar entrega do pedido #12348
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Agendar visita de follow-up com Confeitaria Doce
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-medium">Análise de Sentimento</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Positivo</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Neutro</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Negativo</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recursos Úteis</CardTitle>
              <CardDescription>Materiais para interações eficientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/20">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <p className="font-medium">Catálogo de Produtos 2023</p>
                    <p className="text-muted-foreground">Descartáveis Premium</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/20">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <p className="font-medium">Tabela de Preços</p>
                    <p className="text-muted-foreground">Atualizada em 10/03/2023</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/20">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <p className="font-medium">Scripts de Atendimento</p>
                    <p className="text-muted-foreground">Modelos para diferentes situações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pergunte à IA</CardTitle>
              <CardDescription>Tire dúvidas sobre clientes e interações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-muted/20 rounded-md">
                  <p className="text-xs mb-1">Como devo abordar o cliente Atacadão Produtos após a reclamação?</p>
                  <p className="text-xs text-muted-foreground">
                    Recomendo iniciar reconhecendo o problema, oferecer uma solução concreta para o atraso e, se
                    possível, um pequeno desconto ou benefício como compensação. Mantenha o tom empático e profissional.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Faça uma pergunta..." className="text-xs" />
                  <Button size="sm" className="h-8 w-8 p-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

