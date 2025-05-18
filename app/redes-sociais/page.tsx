
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { PageLayout } from "@/components/page-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Filter,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Facebook,
  Twitter,
  ArrowUpRight,
  CalendarIcon,
} from "lucide-react"

export default function RedesSociaisPage() {
  return (
    <SidebarLayout>
      <PageLayout title="Gestão de Redes Sociais">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input type="search" placeholder="Buscar postagens..." className="w-full h-8 pl-7 text-xxs" />
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
            <Button size="sm" className="h-8 text-xxs gap-1">
              <Plus className="h-3 w-3" />
              Nova Postagem
            </Button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <Card className="card-container">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-pink-100 px-2">
                <Instagram className="h-4 w-4 text-pink-500" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Instagram</p>
                <p className="text-xs-plus font-bold">2.845</p>
                <p className="text-xxxs text-green-600">+12% seguidores</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-blue-100 px-2">
                <Linkedin className="h-4 w-4 text-blue-600" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">LinkedIn</p>
                <p className="text-xs-plus font-bold">1.250</p>
                <p className="text-xxxs text-green-600">+8% seguidores</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-blue-100 px-2">
                <Facebook className="h-4 w-4 text-blue-500" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Facebook</p>
                <p className="text-xs-plus font-bold">1.850</p>
                <p className="text-xxxs text-green-600">+5% seguidores</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-blue-100 px-2">
                <Twitter className="h-4 w-4 text-blue-400" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">X (Twitter)</p>
                <p className="text-xs-plus font-bold">950</p>
                <p className="text-xxxs text-green-600">+3% seguidores</p>
              </CardContent>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="todas" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-6 h-8">
            <TabsTrigger value="todas" className="text-xxs">
              Todas
            </TabsTrigger>
            <TabsTrigger value="instagram" className="text-xxs">
              Instagram
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="text-xxs">
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="facebook" className="text-xxs">
              Facebook
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xxs">
              X (Twitter)
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="text-xxs">
              TikTok
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-2">
            <div className="grid gap-2 md:grid-cols-3">
              <Card className="md:col-span-2 card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Desempenho das Redes Sociais</CardTitle>
                  <CardDescription className="card-description">Análise comparativa de engajamento</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[200px] w-full bg-muted/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Mensagens Pendentes</CardTitle>
                  <CardDescription className="card-description">Interações que precisam de resposta</CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-2">
                    {[
                      {
                        rede: "Instagram",
                        usuario: "@cliente_distribuidora",
                        mensagem: "Gostaria de saber mais sobre os copos descartáveis premium.",
                        tempo: "2h atrás",
                        icon: <Instagram className="h-3 w-3 text-pink-500" />,
                      },
                      {
                        rede: "LinkedIn",
                        usuario: "Maria Silva",
                        mensagem: "Temos interesse em conhecer as embalagens biodegradáveis.",
                        tempo: "5h atrás",
                        icon: <Linkedin className="h-3 w-3 text-blue-600" />,
                      },
                      {
                        rede: "Facebook",
                        usuario: "Supermercado Central",
                        mensagem: "Qual o prazo de entrega para São Paulo?",
                        tempo: "1d atrás",
                        icon: <Facebook className="h-3 w-3 text-blue-500" />,
                      },
                      {
                        rede: "X (Twitter)",
                        usuario: "@padaria_paofresco",
                        mensagem: "Vocês têm embalagens personalizadas?",
                        tempo: "2d atrás",
                        icon: <Twitter className="h-3 w-3 text-blue-400" />,
                      },
                    ].map((mensagem, i) => (
                      <div key={i} className="flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                        <div className="rounded-full bg-muted/20 p-1">{mensagem.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xxs font-medium">{mensagem.usuario}</span>
                              <span className="text-xxxs text-muted-foreground">via {mensagem.rede}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2 text-muted-foreground" />
                              <span className="text-xxxs text-muted-foreground">{mensagem.tempo}</span>
                            </div>
                          </div>
                          <p className="text-xxs">{mensagem.mensagem}</p>
                          <div className="flex gap-1 mt-1">
                            <Button variant="outline" size="sm" className="h-6 text-xxxs">
                              Responder
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-xxxs">
                              Marcar como Lida
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-2 card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Últimas Postagens</CardTitle>
                <CardDescription className="card-description">Histórico de conteúdos publicados</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-sm">
                  <div className="grid grid-cols-7 text-xxs font-medium bg-muted/20 p-1">
                    <div>Rede</div>
                    <div>Data</div>
                    <div>Tipo</div>
                    <div>Conteúdo</div>
                    <div>Engajamento</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {[
                    {
                      rede: "Instagram",
                      data: "15/03/2023 14:30",
                      tipo: "Carrossel",
                      conteudo: "Lançamento da nova linha de embalagens biodegradáveis",
                      engajamento: { curtidas: 156, comentarios: 23, compartilhamentos: 18 },
                      status: "Publicado",
                      icon: <Instagram className="h-3 w-3 text-pink-500" />,
                    },
                    {
                      rede: "LinkedIn",
                      data: "14/03/2023 10:15",
                      tipo: "Artigo",
                      conteudo: "Como escolher os melhores descartáveis para seu negócio",
                      engajamento: { curtidas: 87, comentarios: 12, compartilhamentos: 9 },
                      status: "Publicado",
                      icon: <Linkedin className="h-3 w-3 text-blue-600" />,
                    },
                    {
                      rede: "Facebook",
                      data: "12/03/2023 16:45",
                      tipo: "Vídeo",
                      conteudo: "Demonstração de uso dos novos copos térmicos",
                      engajamento: { curtidas: 65, comentarios: 8, compartilhamentos: 12 },
                      status: "Publicado",
                      icon: <Facebook className="h-3 w-3 text-blue-500" />,
                    },
                    {
                      rede: "X (Twitter)",
                      data: "10/03/2023 09:30",
                      tipo: "Texto",
                      conteudo: "Dicas para reduzir o uso de plástico em restaurantes",
                      engajamento: { curtidas: 32, comentarios: 5, compartilhamentos: 7 },
                      status: "Publicado",
                      icon: <Twitter className="h-3 w-3 text-blue-400" />,
                    },
                    {
                      rede: "Instagram",
                      data: "20/03/2023 11:00",
                      tipo: "Reels",
                      conteudo: "Processo de fabricação das embalagens sustentáveis",
                      engajamento: { curtidas: 0, comentarios: 0, compartilhamentos: 0 },
                      status: "Agendado",
                      icon: <Instagram className="h-3 w-3 text-pink-500" />,
                    },
                  ].map((post, i) => (
                    <div key={i} className="grid grid-cols-7 text-xxs p-1 border-t">
                      <div className="flex items-center gap-1">
                        {post.icon}
                        <span>{post.rede}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{post.data}</span>
                      </div>
                      <div>{post.tipo}</div>
                      <div className="truncate">{post.conteudo}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <Heart className="h-2 w-2 text-red-500" />
                          <span>{post.engajamento.curtidas}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <MessageCircle className="h-2 w-2 text-blue-500" />
                          <span>{post.engajamento.comentarios}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Share2 className="h-2 w-2 text-green-500" />
                          <span>{post.engajamento.compartilhamentos}</span>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[8px] ${post.status === "Publicado"
                              ? "bg-green-100 text-green-800"
                              : post.status === "Agendado"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Search className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2 md:grid-cols-2 mt-2">
              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Campanhas Patrocinadas</CardTitle>
                  <CardDescription className="card-description">Desempenho de anúncios pagos</CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-2">
                    {[
                      {
                        nome: "Lançamento Copos Premium",
                        rede: "Instagram",
                        periodo: "01/03 - 15/03",
                        orcamento: "R$ 500,00",
                        cpc: "R$ 0,85",
                        conversoes: 28,
                        status: "Ativo",
                        icon: <Instagram className="h-3 w-3 text-pink-500" />,
                      },
                      {
                        nome: "Embalagens Biodegradáveis",
                        rede: "Facebook",
                        periodo: "05/03 - 20/03",
                        orcamento: "R$ 350,00",
                        cpc: "R$ 0,92",
                        conversoes: 15,
                        status: "Ativo",
                        icon: <Facebook className="h-3 w-3 text-blue-500" />,
                      },
                      {
                        nome: "Soluções para Restaurantes",
                        rede: "LinkedIn",
                        periodo: "10/02 - 10/03",
                        orcamento: "R$ 600,00",
                        cpc: "R$ 1,25",
                        conversoes: 12,
                        status: "Finalizado",
                        icon: <Linkedin className="h-3 w-3 text-blue-600" />,
                      },
                    ].map((campanha, i) => (
                      <div key={i} className="border rounded-sm p-2">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1">
                            {campanha.icon}
                            <span className="text-xxs font-medium">{campanha.nome}</span>
                          </div>
                          <span
                            className={`text-xxxs px-1.5 py-0.5 rounded-full ${campanha.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                              }`}
                          >
                            {campanha.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xxxs">
                          <div>
                            <span className="text-muted-foreground">Período:</span>
                            <p>{campanha.periodo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Orçamento:</span>
                            <p>{campanha.orcamento}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CPC:</span>
                            <p>{campanha.cpc}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xxs">
                            <span className="font-medium">{campanha.conversoes}</span>
                            <span className="text-muted-foreground"> conversões</span>
                          </div>
                          <Button variant="outline" size="sm" className="h-6 text-xxxs">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-container">
                <CardHeader className="card-header">
                  <CardTitle className="card-title">Leads das Redes Sociais</CardTitle>
                  <CardDescription className="card-description">Contatos captados via redes sociais</CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-2">
                    {[
                      {
                        nome: "Distribuidora XYZ",
                        origem: "Instagram",
                        data: "15/03/2023",
                        interesse: "Copos descartáveis",
                        status: "Novo",
                        icon: <Instagram className="h-3 w-3 text-pink-500" />,
                      },
                      {
                        nome: "Restaurante Sabor & Cia",
                        origem: "LinkedIn",
                        data: "12/03/2023",
                        interesse: "Embalagens para delivery",
                        status: "Qualificado",
                        icon: <Linkedin className="h-3 w-3 text-blue-600" />,
                      },
                      {
                        nome: "Supermercado Bom Preço",
                        origem: "Facebook",
                        data: "10/03/2023",
                        interesse: "Sacolas biodegradáveis",
                        status: "Cliente",
                        icon: <Facebook className="h-3 w-3 text-blue-500" />,
                      },
                      {
                        nome: "Padaria Pão Dourado",
                        origem: "X (Twitter)",
                        data: "08/03/2023",
                        interesse: "Embalagens personalizadas",
                        status: "Qualificado",
                        icon: <Twitter className="h-3 w-3 text-blue-400" />,
                      },
                    ].map((lead, i) => (
                      <div key={i} className="flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                        <div className="rounded-full bg-muted/20 p-1">{lead.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xxs font-medium">{lead.nome}</span>
                            <span
                              className={`text-xxxs px-1.5 py-0.5 rounded-full ${lead.status === "Novo"
                                  ? "bg-blue-100 text-blue-800"
                                  : lead.status === "Qualificado"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xxxs text-muted-foreground">
                            <CalendarIcon className="h-2 w-2" />
                            <span>{lead.data}</span>
                            <span>via {lead.origem}</span>
                          </div>
                          <p className="text-xxs mt-0.5">Interesse: {lead.interesse}</p>
                          <div className="flex gap-1 mt-1">
                            <Button variant="outline" size="sm" className="h-6 text-xxxs">
                              Converter
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-xxxs">
                              Ver Perfil
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conteúdo para as outras abas (Instagram, LinkedIn, etc.) */}
          <TabsContent value="instagram" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Instagram Analytics</CardTitle>
                <CardDescription className="card-description">Métricas detalhadas do Instagram</CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xxs">Conteúdo específico do Instagram será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linkedin" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">LinkedIn Analytics</CardTitle>
                <CardDescription className="card-description">Métricas detalhadas do LinkedIn</CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xxs">Conteúdo específico do LinkedIn será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Facebook Analytics</CardTitle>
                <CardDescription className="card-description">Métricas detalhadas do Facebook</CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xxs">Conteúdo específico do Facebook será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="twitter" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">X (Twitter) Analytics</CardTitle>
                <CardDescription className="card-description">Métricas detalhadas do X (Twitter)</CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xxs">Conteúdo específico do X (Twitter) será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiktok" className="mt-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">TikTok Analytics</CardTitle>
                <CardDescription className="card-description">Métricas detalhadas do TikTok</CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                <p className="text-xxs">Conteúdo específico do TikTok será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageLayout>
    </SidebarLayout>
  )
}

