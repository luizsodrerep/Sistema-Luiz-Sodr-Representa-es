

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Home,
  Instagram,
  MapPin,
  MessageSquare,
  Settings,
  Users,
  Wallet,
} from "lucide-react"

export function Sidebar() {
  return (
    <div className="h-screen w-64 border-r bg-background p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="rounded-full bg-primary/10 p-2">
          <Home className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold">CRM Luiz Sodré</span>
      </div>

      <div className="space-y-1 flex-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/clientes">
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </Button>
        </Link>
        <Link href="/vendas">
          <Button variant="ghost" className="w-full justify-start">
            <DollarSign className="mr-2 h-4 w-4" />
            Vendas
          </Button>
        </Link>
        <Link href="/interacoes">
          <Button variant="ghost" className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" />
            Interações
          </Button>
        </Link>
        <Link href="/representadas">
          <Button variant="ghost" className="w-full justify-start">
            <Building2 className="mr-2 h-4 w-4" />
            Representadas
          </Button>
        </Link>
        <Link href="/agenda">
          <Button variant="ghost" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Agenda
          </Button>
        </Link>
        <Link href="/mapa">
          <Button variant="ghost" className="w-full justify-start">
            <MapPin className="mr-2 h-4 w-4" />
            Mapa
          </Button>
        </Link>
        <Link href="/redes-sociais">
          <Button variant="ghost" className="w-full justify-start">
            <Instagram className="mr-2 h-4 w-4" />
            Redes Sociais
          </Button>
        </Link>
        <Link href="/financeiro">
          <Button variant="ghost" className="w-full justify-start">
            <Wallet className="mr-2 h-4 w-4" />
            Financeiro
          </Button>
        </Link>
        <Link href="/contabilidade">
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Contabilidade
          </Button>
        </Link>
        <Link href="/configuracoes">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </Link>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">LS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Luiz Sodré</span>
            <span className="text-xs text-muted-foreground">Administrador</span>
          </div>
        </div>
      </div>
    </div>
  )
}

