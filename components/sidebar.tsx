"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3,
  Building2,
  Calendar,
  CircleDollarSign,
  Home,
  Map,
  Menu,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: "Home - Início", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Vendas", href: "/vendas", icon: CircleDollarSign },
    { name: "Interações", href: "/interacoes", icon: MessageSquare },
    { name: "Representadas", href: "/representadas", icon: Building2 },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "Mapa de Clientes", href: "/mapa", icon: Map },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ]

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile menu button - visible on small screens */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                  <Image src="/images/logo.png" alt="Luiz Sodré Representações" width={32} height={32} />
                  <span className="text-primary">LSR</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium">
                  <NavLinks />
                </nav>
              </div>
              <div className="mt-auto p-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Luiz Sodré</p>
                    <p className="text-xs leading-none text-muted-foreground">Administrador</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar - hidden on small screens */}
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/images/logo.png" alt="Luiz Sodré Representações" width={32} height={32} />
              <span className="text-primary">Luiz Sodré Representações</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLinks />
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Luiz Sodré</p>
                <p className="text-xs leading-none text-muted-foreground">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

