"use client"

import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  MapPin,
  Users,
  MessageSquare,
  Instagram,
  Home,
  Wallet,
  FileText,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SocialMediaSummary } from "@/components/social-media-summary"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header com logotipo reduzido e botões em uma linha */}
      <div className="w-full bg-gradient-to-r from-primary/90 to-primary p-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center mb-4">
          <Image
            src="/images/logo-large.jpeg"
            alt="Luiz Sodré Representações"
            width={189} // Aproximadamente 5cm em 96 DPI
            height={94} // Mantendo a proporção
            className="mb-2"
          />
          <h1 className="text-white text-lg font-bold">Sistema de CRM e Gestão Comercial</h1>
        </div>

        {/* Menu principal com todos os botões em uma linha */}
        <div className="flex flex-wrap justify-center gap-2 w-full max-w-6xl">
          {[
            { name: "Home", icon: <Home className="h-4 w-4" />, href: "/" },
            { name: "Dashboard", icon: <BarChart3 className="h-4 w-4" />, href: "/dashboard" },
            { name: "Clientes", icon: <Users className="h-4 w-4" />, href: "/clientes" },
            { name: "Vendas", icon: <DollarSign className="h-4 w-4" />, href: "/vendas" },
            { name: "Interações", icon: <MessageSquare className="h-4 w-4" />, href: "/interacoes" },
            { name: "Representadas", icon: <Building2 className="h-4 w-4" />, href: "/representadas" },
            { name: "Agenda", icon: <Calendar className="h-4 w-4" />, href: "/agenda" },
            { name: "Mapa", icon: <MapPin className="h-4 w-4" />, href: "/mapa" },
            { name: "Relatórios", icon: <BarChart3 className="h-4 w-4" />, href: "/relatorios" },
            { name: "Financeiro", icon: <Wallet className="h-4 w-4" />, href: "/financeiro" },
            { name: "Contabilidade", icon: <FileText className="h-4 w-4" />, href: "/contabilidade" },
            { name: "Configurações", icon: <CreditCard className="h-4 w-4" />, href: "/configuracoes" },
          ].map((item, i) => (
            <Button
              key={i}
              variant="secondary"
              className="flex items-center justify-center h-10 w-[110px] bg-white/90 hover:bg-white text-primary hover:text-primary"
              onClick={() => router.push(item.href)}
            >
              {item.icon}
              <span className="ml-1 text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Conteúdo do dashboard */}
      <div className="flex-1 p-4 bg-gray-50">
        <h2 className="text-lg font-bold text-primary mb-4">Visão Geral</h2>

        <div className="grid gap-2 md:grid-cols-4">
          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Vendas Totais</p>
                <p className="text-xs-plus font-bold">R$ 45.231,89</p>
                <p className="text-xxxs text-green-600">+20.1% mês</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Clientes Ativos</p>
                <p className="text-xs-plus font-bold">573</p>
                <p className="text-xxxs text-green-600">+12 novos</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Ticket Médio</p>
                <p className="text-xs-plus font-bold">R$ 1.792</p>
                <p className="text-xxxs text-green-600">+2.5% mês</p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">Comissões</p>
                <p className="text-xs-plus font-bold">R$ 6.784,42</p>
                <p className="text-xxxs text-green-600">+18.7% mês</p>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Representadas, Ações Rápidas e Follow-up - Acima da Visão Geral */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {/* Representadas */}
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Representadas</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-1">
                {[
                  { nome: "Descartáveis Premium", vendas: "R$ 18.450", perc: "42%" },
                  { nome: "Embalagens Eco", vendas: "R$ 12.320", perc: "28%" },
                  { nome: "Papel & Cia", vendas: "R$ 8.760", perc: "20%" },
                  { nome: "Plásticos Nobre", vendas: "R$ 4.380", perc: "10%" },
                ].map((rep, i) => (
                  <div key={i} className="flex items-center gap-1 text-xxs">
                    <div className="w-full space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{rep.nome}</p>
                        <p className="font-medium">{rep.perc}</p>
                      </div>
                      <div className="flex items-center justify-between text-xxxs text-muted-foreground">
                        <span>Vendas: {rep.vendas}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div className="h-1 rounded-full bg-secondary" style={{ width: rep.perc }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas - Botões na vertical */}
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="flex flex-col gap-1">
                <Link href="/clientes/novo" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <Users className="h-3 w-3 mr-1" />
                    Novo Cliente
                  </Button>
                </Link>
                <Link href="/vendas/nova" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Nova Venda
                  </Button>
                </Link>
                <Link href="/interacoes/nova" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Interação
                  </Button>
                </Link>
                <Link href="/financeiro" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <Wallet className="h-3 w-3 mr-1" />
                    Financeiro
                  </Button>
                </Link>
                <Link href="/contabilidade" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <FileText className="h-3 w-3 mr-1" />
                    Contabilidade
                  </Button>
                </Link>
                <Link href="/redes-sociais" className="w-full">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xxs justify-start">
                    <Instagram className="h-3 w-3 mr-1" />
                    Redes Sociais
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="flex flex-col gap-1">
                {[
                  { nome: "Atacadão", acao: "Ligar", data: "Hoje", urgente: true },
                  { nome: "Mercado Central", acao: "Proposta", data: "Amanhã", urgente: false },
                  { nome: "Padaria Pão", acao: "Visita", data: "23/03", urgente: false },
                  { nome: "Distribuidora XYZ", acao: "Apresentação", data: "25/03", urgente: false },
                ].map((followup, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className={`w-full h-8 text-xxs flex-col items-start justify-start p-1 ${
                      followup.urgente ? "border-red-400" : ""
                    }`}
                  >
                    <p className="font-medium truncate w-full">{followup.nome}</p>
                    <div className="flex justify-between w-full">
                      <span className="text-muted-foreground">{followup.acao}</span>
                      <span className={followup.urgente ? "text-red-500" : "text-muted-foreground"}>
                        {followup.data}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visão Geral de Vendas e Clientes Recentes */}
        <div className="grid gap-2 md:grid-cols-4 mt-2">
          <Card className="col-span-3 card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Visão Geral de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[140px] w-full bg-muted/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Clientes Recentes</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-1">
                {[
                  { nome: "Distribuidora ABC", categoria: "Distribuidor" },
                  { nome: "Supermercado Silva", categoria: "Varejo" },
                  { nome: "Confeitaria Doce", categoria: "Confeitaria" },
                ].map((cliente, i) => (
                  <div key={i} className="flex items-center gap-1 p-1 rounded-sm hover:bg-muted/20 text-xxs">
                    <div className="rounded-full bg-primary/10 p-1">
                      <Building2 className="h-2 w-2 text-primary" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-medium truncate">{cliente.nome}</p>
                      <p className="text-xxxs text-muted-foreground">{cliente.categoria}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Redes Sociais e Mapa de Clientes */}
        <div className="grid gap-2 md:grid-cols-4 mt-2">
          {/* Resumo de Redes Sociais - 3/4 da largura */}
          <Card className="col-span-3 card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <SocialMediaSummary />
            </CardContent>
          </Card>

          {/* Mapa de Clientes - 1/4 da largura, lado direito inferior */}
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Mapa de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[120px] w-full bg-muted/10 flex items-center justify-center relative">
                <MapPin className="h-5 w-5 text-muted-foreground" />

                {/* Simulação de pontos no mapa */}
                <div className="absolute top-1/4 left-1/4">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div className="absolute top-1/3 right-1/3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
                <div className="absolute bottom-1/4 right-1/4">
                  <div className="h-2 w-2 rounded-full bg-secondary"></div>
                </div>

                <Link href="/mapa" className="absolute bottom-1 right-1">
                  <Button variant="ghost" size="sm" className="h-5 text-xxxs p-1">
                    Ver mapa completo
                    <ArrowUpRight className="h-2 w-2 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

