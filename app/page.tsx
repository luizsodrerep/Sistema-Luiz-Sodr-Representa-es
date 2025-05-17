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
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import SidebarLayout from "@/app/components/menu"

export default function HomePage() {
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="w-full h-72 bg-gradient-to-r from-primary/90 to-primary p-4 flex flex-col items-center justify-center">
        <Image
            src="/images/logo-large.jpeg"
            alt="Luiz Sodré Representações"
            width={189}
            height={94}
            className="absolute top-6"
          />

          <h1 className="absolute top-56 text-white text-lg font-bold">Sistema de CRM e Gestão Comercial</h1>
        <div className="flex flex-col items-center justify-center mb-4">

          <SidebarLayout>
            <div className="absolute top-8 right-8 flex flex-col items-center z-40" ref={menuRef}>

              <button onClick={() => setOpenMenu(!openMenu)} className="flex flex-col items-center group focus:outline-none">
                <Image
                  src="\images\piupiumaluko.png"
                  alt="Foto do usuário"
                  width={70}
                  height={70}
                  className="rounded-full border-2 border-white"
                />
                <span className="text-white text-xs mt-1 flex items-center">
                  admin
                  <ChevronDown className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform" />
                </span>
              </button>

              {openMenu && (
                <div className="mt-2 w-40 bg-white rounded-md shadow-lg text-sm text-gray-700 z-50">

                  <button onClick={() => router.push("/perfil")} className="block w-full text-left px-4 py-2 hover:bg-gray-100"            >
                    Configurações
                  </button>

                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      localStorage.removeItem("authToken")
                      router.push("/login")
                    }}
                  >
                    Sair do sistema
                  </button>
                </div>
              )}

            </div>
          </SidebarLayout>          

        </div>      
      </div>
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

        <div className="grid grid-cols-3 gap-2 mt-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Rotinas</CardTitle>
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
                    className={`w-full h-8 text-xxs flex-col items-start justify-start p-1 ${followup.urgente ? "border-red-400" : ""
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

        <div className="grid gap-2 md:grid-cols-4 mt-2">
          <Card className="col-span-3 card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="card-content">
              <SocialMediaSummary />
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Mapa de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[120px] w-full bg-muted/10 flex items-center justify-center relative">
                <MapPin className="h-5 w-5 text-muted-foreground" />

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

