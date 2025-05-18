"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PageLayout } from "@/components/page-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  User,
} from "lucide-react"

export default function InteracaoDetalhesPage({ params }: { params: { id: string } }) {
  const [novoComentario, setNovoComentario] = useState("")

  // Na implementação real, buscaríamos os dados da interação com base no ID
  const interacao = {
    id: params.id,
    cliente: {
      id: "1",
      nome: "Distribuidora ABC Ltda",
      contato: "João Silva",
      telefone: "(11) 98765-4321",
      email: "joao@distribuidoraabc.com.br",
    },
    tipo: "WhatsApp",
    data: "15/03/2023 14:30",
    responsavel: "Luiz Sodré",
    descricao:
      "Envio de catálogo de produtos conforme solicitado pelo cliente. Apresentação das novas linhas de embalagens biodegradáveis e copos descartáveis premium.",
    status: "Concluído",
    anexos: [
      { nome: "Catálogo_2023.pdf", tamanho: "2.4 MB" },
      { nome: "Tabela_Preços.xlsx", tamanho: "1.1 MB" },
    ],
    historico: [
      {
        data: "15/03/2023 14:30",
        usuario: "Luiz Sodré",
        acao: "Interação criada",
        comentario: "Primeiro contato com o cliente via WhatsApp.",
      },
      {
        data: "15/03/2023 14:45",
        usuario: "Luiz Sodré",
        acao: "Anexo adicionado",
        comentario: "Enviado catálogo de produtos.",
      },
      {
        data: "15/03/2023 15:10",
        usuario: "Maria Silva",
        acao: "Status atualizado",
        comentario: "Cliente confirmou recebimento do catálogo.",
      },
    ],
    followups: [
      {
        data: "20/03/2023",
        motivo: "Retorno sobre catálogo",
        responsavel: "Luiz Sodré",
        status: "Pendente",
      },
    ],
    mensagens: [
      {
        data: "15/03/2023 14:30",
        remetente: "Luiz Sodré",
        mensagem:
          "Bom dia! Conforme conversamos, segue o catálogo de produtos que você solicitou. Estou à disposição para qualquer dúvida.",
        status: "Enviado e Lido",
      },
      {
        data: "15/03/2023 14:40",
        remetente: "João Silva",
        mensagem: "Obrigado! Vou analisar e retorno em breve com nosso pedido.",
        status: "Recebido",
      },
      {
        data: "15/03/2023 14:42",
        remetente: "Luiz Sodré",
        mensagem: "Perfeito! Estou à disposição. Temos condições especiais para os itens da página 5.",
        status: "Enviado e Lido",
      },
    ],
  }

  return (
    <PageLayout title="Detalhes da Interação">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/interacoes">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-3 w-3" />
          </Button>
        </Link>
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-xs-plus font-medium">{interacao.cliente.nome}</span>
        </div>
        <div
          className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xxxs font-semibold ${
            interacao.tipo === "WhatsApp"
              ? "bg-green-100 text-green-800"
              : interacao.tipo === "E-mail"
                ? "bg-blue-100 text-blue-800"
                : interacao.tipo === "Visita"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-purple-100 text-purple-800"
          }`}
        >
          {interacao.tipo}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Card className="card-container md:col-span-2">
          <CardHeader className="card-header">
            <CardTitle className="card-title">Informações da Interação</CardTitle>
            <CardDescription className="card-description">Detalhes do contato realizado</CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xxs text-muted-foreground">Data e Hora</p>
                  <p className="text-xxs font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {interacao.data}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xxs text-muted-foreground">Responsável</p>
                  <p className="text-xxs font-medium flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {interacao.responsavel}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xxs text-muted-foreground">Contato do Cliente</p>
                  <p className="text-xxs font-medium">{interacao.cliente.contato}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xxs text-muted-foreground">Status</p>
                  <p
                    className={`text-xxs font-medium inline-flex items-center rounded-full px-2 py-0.5 ${
                      interacao.status === "Concluído"
                        ? "bg-green-100 text-green-800"
                        : interacao.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {interacao.status}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">Descrição</p>
                <p className="text-xxs border rounded-sm p-2">{interacao.descricao}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">Anexos</p>
                <div className="flex flex-wrap gap-2">
                  {interacao.anexos.map((anexo, i) => (
                    <div key={i} className="flex items-center gap-1 border rounded-sm p-1">
                      <span className="text-xxs">{anexo.nome}</span>
                      <span className="text-xxxs text-muted-foreground">({anexo.tamanho})</span>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xxs text-muted-foreground">Follow-ups Agendados</p>
                  <Button variant="outline" size="sm" className="h-6 text-xxxs gap-1">
                    <Plus className="h-2 w-2" />
                    Agendar
                  </Button>
                </div>
                {interacao.followups.map((followup, i) => (
                  <div key={i} className="flex items-center justify-between border rounded-sm p-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span className="text-xxs">{followup.data}</span>
                    </div>
                    <span className="text-xxs">{followup.motivo}</span>
                    <span className="text-xxs text-muted-foreground">{followup.responsavel}</span>
                    <span className="text-xxxs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                      {followup.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-container">
          <CardHeader className="card-header">
            <CardTitle className="card-title">Dados do Cliente</CardTitle>
            <CardDescription className="card-description">Informações de contato</CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">Empresa</p>
                <p className="text-xxs font-medium">{interacao.cliente.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">Contato</p>
                <p className="text-xxs font-medium">{interacao.cliente.contato}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">Telefone</p>
                <div className="flex items-center gap-1">
                  <p className="text-xxs">{interacao.cliente.telefone}</p>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Phone className="h-3 w-3 text-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <MessageSquare className="h-3 w-3 text-green-500" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">E-mail</p>
                <div className="flex items-center gap-1">
                  <p className="text-xxs">{interacao.cliente.email}</p>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Mail className="h-3 w-3 text-blue-500" />
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/clientes/${interacao.cliente.id}`}>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xxs">
                    Ver Cadastro Completo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="historico" className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="historico" className="text-xxs">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="mensagens" className="text-xxs">
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="comentarios" className="text-xxs">
            Comentários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="mt-2">
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Histórico de Ações</CardTitle>
              <CardDescription className="card-description">Registro de atividades nesta interação</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-2">
                {interacao.historico.map((item, i) => (
                  <div key={i} className="border-l-2 border-primary pl-2 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xxs text-muted-foreground">{item.data}</span>
                      </div>
                      <span className="text-xxs font-medium">{item.usuario}</span>
                    </div>
                    <p className="text-xxs font-medium">{item.acao}</p>
                    <p className="text-xxs">{item.comentario}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensagens" className="mt-2">
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Mensagens Trocadas</CardTitle>
              <CardDescription className="card-description">Histórico de conversas com o cliente</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-2">
                {interacao.mensagens.map((msg, i) => (
                  <div key={i} className={`flex ${msg.remetente === "Luiz Sodré" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-2 ${
                        msg.remetente === "Luiz Sodré" ? "bg-primary/10 text-primary" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xxs font-medium">{msg.remetente}</span>
                        <span className="text-xxxs text-muted-foreground">{msg.data}</span>
                      </div>
                      <p className="text-xxs">{msg.mensagem}</p>
                      {msg.remetente === "Luiz Sodré" && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Check className="h-2 w-2 text-green-500" />
                          <span className="text-xxxs text-green-500">{msg.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xxs font-medium">Enviar Nova Mensagem</p>
                  <Select defaultValue="whatsapp">
                    <SelectTrigger className="h-6 text-xxxs w-28">
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp" className="text-xxxs">
                        WhatsApp
                      </SelectItem>
                      <SelectItem value="email" className="text-xxxs">
                        E-mail
                      </SelectItem>
                      <SelectItem value="sms" className="text-xxxs">
                        SMS
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea className="min-h-[80px] text-xxs" placeholder="Digite sua mensagem..." />
                <div className="flex justify-end">
                  <Button size="sm" className="h-7 text-xxs">
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comentarios" className="mt-2">
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Comentários Internos</CardTitle>
              <CardDescription className="card-description">Observações visíveis apenas para a equipe</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-2">
                <div className="border rounded-sm p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xxs font-medium">Maria Silva</span>
                    <span className="text-xxxs text-muted-foreground">15/03/2023 15:30</span>
                  </div>
                  <p className="text-xxs">
                    Cliente demonstrou interesse nos produtos da linha premium. Podemos oferecer desconto de 5% para
                    fechar pedido.
                  </p>
                </div>

                <div className="border rounded-sm p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xxs font-medium">João Santos</span>
                    <span className="text-xxxs text-muted-foreground">15/03/2023 16:15</span>
                  </div>
                  <p className="text-xxs">Verificar histórico de pagamentos antes de oferecer condições especiais.</p>
                </div>

                <div className="space-y-1 mt-4">
                  <p className="text-xxs font-medium">Adicionar Comentário</p>
                  <Textarea
                    className="min-h-[80px] text-xxs"
                    placeholder="Digite seu comentário interno..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" className="h-7 text-xxs" disabled={!novoComentario.trim()}>
                      Salvar Comentário
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}