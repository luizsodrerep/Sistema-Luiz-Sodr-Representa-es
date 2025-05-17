"use client"

import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  MapPin,
  Users,
  MessageSquare,
  Home,
  Wallet,
  FileText,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SidebarToggleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: "Home", icon: <Home className="h-4 w-4" />, href: "/" },
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
  ]

  return (

    <div className="flex min-h-screen">

      <Button
        className="absolute top-4 left-4 z-20 p-2 rounded-md bg-Blue4-800 text-white hover:bg-Blue4-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <List className="h-6 w-6" />

      </Button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col gap-2">
          {menuItems.map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className="flex justify-start items-center gap-2 text-sm hover:bg-Blue4-100"
              onClick={() => {
                router.push(item.href)
                setIsOpen(false)
              }}
            >
              {item.icon}
              {item.name}
            </Button>
          ))}
        </div>        
      </aside>

      <main className="flex-1 p-6 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
