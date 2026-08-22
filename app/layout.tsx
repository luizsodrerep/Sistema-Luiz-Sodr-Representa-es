import type React from "react"
import "@/app/globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AlertReminder } from "@/app/components/alert-reminder"

export const metadata = {
  title: "CRM e Sistema de Gestão Comercial",
  description: "Sistema completo de CRM e Gestão Comercial",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster />

          <AlertReminder
            title="Relatório de Comissão"
            description="Emitir relatório de comissão para Descartáveis Premium"
            time="Vence hoje às 18:00"
          />
        </ThemeProvider>
      </body>
    </html>
  )
}