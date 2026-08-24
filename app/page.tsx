"use client"

import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Instagram,
  MapPin,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Button,
} from "@/components/ui/button"

import {
  SocialMediaSummary,
} from "@/components/social-media-summary"

export default function HomePage() {
  const router =
    useRouter()

  const menuPrincipal = [
    {
      name: "Home",
      icon: (
        <Home className="h-4 w-4" />
      ),
      href: "/",
    },
    {
      name: "Dashboard",
      icon: (
        <BarChart3 className="h-4 w-4" />
      ),
      href: "/dashboard",
    },
    {
      name: "Clientes",
      icon: (
        <Users className="h-4 w-4" />
      ),
      href: "/clientes",
    },
    {
      name: "Interações",
      icon: (
        <MessageSquare className="h-4 w-4" />
      ),
      href: "/interacoes",
    },
    {
      name: "Orçamentos",
      icon: (
        <FileText className="h-4 w-4" />
      ),
      href: "/orcamentos",
    },
    {
      name: "Vendas",
      icon: (
        <DollarSign className="h-4 w-4" />
      ),
      href: "/vendas",
    },
    {
      name: "Representadas",
      icon: (
        <Building2 className="h-4 w-4" />
      ),
      href: "/representadas",
    },
    {
      name: "Agenda",
      icon: (
        <Calendar className="h-4 w-4" />
      ),
      href: "/agenda",
    },
    {
      name: "Mapa",
      icon: (
        <MapPin className="h-4 w-4" />
      ),
      href: "/mapa",
    },
    {
      name: "Relatórios",
      icon: (
        <BarChart3 className="h-4 w-4" />
      ),
      href: "/relatorios",
    },
    {
      name: "Financeiro",
      icon: (
        <Wallet className="h-4 w-4" />
      ),
      href: "/financeiro",
    },
    {
      name: "Contabilidade",
      icon: (
        <FileText className="h-4 w-4" />
      ),
      href: "/contabilidade",
    },
    {
      name: "Configurações",
      icon: (
        <CreditCard className="h-4 w-4" />
      ),
      href: "/configuracoes",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex w-full flex-col items-center justify-center bg-gradient-to-r from-primary/90 to-primary p-4">
        <div className="mb-4 flex flex-col items-center justify-center">
          <Image
            src="/images/logo-large.jpeg"
            alt="Luiz Sodré Representações"
            width={189}
            height={94}
            className="mb-2"
          />

          <h1 className="text-lg font-bold text-white">
            Sistema de CRM e Gestão Comercial
          </h1>
        </div>

        <div className="flex w-full max-w-7xl flex-wrap justify-center gap-2">
          {menuPrincipal.map(
            (
              item
            ) => (
              <Button
                key={
                  item.href
                }
                variant="secondary"
                className="flex h-10 w-[110px] items-center justify-center bg-white/90 text-primary hover:bg-white hover:text-primary"
                onClick={() =>
                  router.push(
                    item.href
                  )
                }
              >
                {item.icon}

                <span className="ml-1 text-xs">
                  {item.name}
                </span>
              </Button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-4">
        <h2 className="mb-4 text-lg font-bold text-primary">
          Visão Geral
        </h2>

        <div className="grid gap-2 md:grid-cols-4">
          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>

              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">
                  Vendas Totais
                </p>

                <p className="text-xs-plus font-bold">
                  R$ 45.231,89
                </p>

                <p className="text-xxxs text-green-600">
                  +20.1% mês
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">
                  Clientes Ativos
                </p>

                <p className="text-xs-plus font-bold">
                  573
                </p>

                <p className="text-xxxs text-green-600">
                  +12 novos
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>

              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">
                  Ticket Médio
                </p>

                <p className="text-xs-plus font-bold">
                  R$ 1.792
                </p>

                <p className="text-xxxs text-green-600">
                  +2.5% mês
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="card-container h-16">
            <div className="flex h-full">
              <div className="flex items-center justify-center bg-primary/10 px-2">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>

              <CardContent className="flex flex-col justify-center p-2">
                <p className="text-xxs text-muted-foreground">
                  Comissões
                </p>

                <p className="text-xs-plus font-bold">
                  R$ 6.784,42
                </p>

                <p className="text-xxxs text-green-600">
                  +18.7% mês
                </p>
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Representadas
              </CardTitle>
            </CardHeader>

            <CardContent className="card-content">
              <div className="space-y-1">
                {[
                  {
                    nome:
                      "Descartáveis Premium",
                    vendas:
                      "R$ 18.450",
                    perc:
                      "42%",
                  },
                  {
                    nome:
                      "Embalagens Eco",
                    vendas:
                      "R$ 12.320",
                    perc:
                      "28%",
                  },
                  {
                    nome:
                      "Papel & Cia",
                    vendas:
                      "R$ 8.760",
                    perc:
                      "20%",
                  },
                  {
                    nome:
                      "Plásticos Nobre",
                    vendas:
                      "R$ 4.380",
                    perc:
                      "10%",
                  },
                ].map(
                  (
                    rep
                  ) => (
                    <div
                      key={
                        rep.nome
                      }
                      className="flex items-center gap-1 text-xxs"
                    >
                      <div className="w-full space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="truncate font-medium">
                            {
                              rep.nome
                            }
                          </p>

                          <p className="font-medium">
                            {
                              rep.perc
                            }
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xxxs text-muted-foreground">
                          <span>
                            Vendas:{" "}
                            {
                              rep.vendas
                            }
                          </span>
                        </div>

                        <div className="h-1 w-full rounded-full bg-muted">
                          <div
                            className="h-1 rounded-full bg-secondary"
                            style={{
                              width:
                                rep.perc,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Ações Rápidas
              </CardTitle>
            </CardHeader>

            <CardContent className="card-content">
              <div className="flex flex-col gap-1">
                <Link
                  href="/clientes/novo"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <Users className="mr-1 h-3 w-3" />

                    Novo Cliente
                  </Button>
                </Link>

                <Link
                  href="/interacoes/nova"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />

                    Nova Interação
                  </Button>
                </Link>

                <Link
                  href="/orcamentos/novo"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <FileText className="mr-1 h-3 w-3" />

                    Novo Orçamento
                  </Button>
                </Link>

                <Link
                  href="/vendas/nova"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <DollarSign className="mr-1 h-3 w-3" />

                    Nova Venda
                  </Button>
                </Link>

                <Link
                  href="/financeiro"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <Wallet className="mr-1 h-3 w-3" />

                    Financeiro
                  </Button>
                </Link>

                <Link
                  href="/contabilidade"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <FileText className="mr-1 h-3 w-3" />

                    Contabilidade
                  </Button>
                </Link>

                <Link
                  href="/redes-sociais"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xxs"
                  >
                    <Instagram className="mr-1 h-3 w-3" />

                    Redes Sociais
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Follow-ups
              </CardTitle>
            </CardHeader>

            <CardContent className="card-content">
              <div className="flex flex-col gap-1">
                {[
                  {
                    nome:
                      "Atacadão",
                    acao:
                      "Ligar",
                    data:
                      "Hoje",
                    urgente:
                      true,
                  },
                  {
                    nome:
                      "Mercado Central",
                    acao:
                      "Proposta",
                    data:
                      "Amanhã",
                    urgente:
                      false,
                  },
                  {
                    nome:
                      "Padaria Pão",
                    acao:
                      "Visita",
                    data:
                      "23/03",
                    urgente:
                      false,
                  },
                  {
                    nome:
                      "Distribuidora XYZ",
                    acao:
                      "Apresentação",
                    data:
                      "25/03",
                    urgente:
                      false,
                  },
                ].map(
                  (
                    followup
                  ) => (
                    <Button
                      key={
                        followup.nome
                      }
                      variant="outline"
                      size="sm"
                      className={`h-8 w-full flex-col items-start justify-start p-1 text-xxs ${
                        followup.urgente
                          ? "border-red-400"
                          : ""
                      }`}
                    >
                      <p className="w-full truncate font-medium">
                        {
                          followup.nome
                        }
                      </p>

                      <div className="flex w-full justify-between">
                        <span className="text-muted-foreground">
                          {
                            followup.acao
                          }
                        </span>

                        <span
                          className={
                            followup.urgente
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }
                        >
                          {
                            followup.data
                          }
                        </span>
                      </div>
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <Card className="card-container col-span-3">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Visão Geral de Vendas
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex h-[140px] w-full items-center justify-center bg-muted/10">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Clientes Recentes
              </CardTitle>
            </CardHeader>

            <CardContent className="card-content">
              <div className="space-y-1">
                {[
                  {
                    nome:
                      "Distribuidora ABC",
                    categoria:
                      "Distribuidor",
                  },
                  {
                    nome:
                      "Supermercado Silva",
                    categoria:
                      "Varejo",
                  },
                  {
                    nome:
                      "Confeitaria Doce",
                    categoria:
                      "Confeitaria",
                  },
                ].map(
                  (
                    cliente
                  ) => (
                    <div
                      key={
                        cliente.nome
                      }
                      className="flex items-center gap-1 rounded-sm p-1 text-xxs hover:bg-muted/20"
                    >
                      <div className="rounded-full bg-primary/10 p-1">
                        <Building2 className="h-2 w-2 text-primary" />
                      </div>

                      <div className="flex-1 truncate">
                        <p className="truncate font-medium">
                          {
                            cliente.nome
                          }
                        </p>

                        <p className="text-xxxs text-muted-foreground">
                          {
                            cliente.categoria
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <Card className="card-container col-span-3">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Redes Sociais
              </CardTitle>
            </CardHeader>

            <CardContent className="card-content">
              <SocialMediaSummary />
            </CardContent>
          </Card>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">
                Mapa de Clientes
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="relative flex h-[120px] w-full items-center justify-center bg-muted/10">
                <MapPin className="h-5 w-5 text-muted-foreground" />

                <div className="absolute left-1/4 top-1/4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>

                <div className="absolute right-1/3 top-1/3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>

                <div className="absolute bottom-1/4 right-1/4">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                </div>

                <Link
                  href="/mapa"
                  className="absolute bottom-1 right-1"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 p-1 text-xxxs"
                  >
                    Ver mapa completo

                    <ArrowUpRight className="ml-1 h-2 w-2" />
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