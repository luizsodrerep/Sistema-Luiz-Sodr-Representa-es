"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
        className="absolute top-4 left-4 z-20 p-4 rounded-md bg-blue-800 text-white hover:bg-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <List className="h-6 w-6" />

      </Button>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-30 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-end p-6">
          <Button
            //variant="ghost"
            className="absolute top-4 left-4 p-4 text-blue-100 bg-blue-800 "
            onClick={() => setIsOpen(false)}
          >
            <List className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-4 flex flex-col gap-2">
          {menuItems.map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className="flex justify-start items-center gap-2 text-sm hover:bg-blue-100"
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
