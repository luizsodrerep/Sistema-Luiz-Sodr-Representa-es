import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AlertReminder } from "@/app/components/alert-reminder"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CRM e Sistema de Gestão Comercial</title>
        <meta name="description" content="Sistema completo de CRM e Gestão Comercial" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <AlertReminder
            title="Relatório de Comissão"
            description="Emitir relatório de comissão para Descartáveis Premium"
            date="Vence hoje às 18:00"
            type="deadline"
            onDismiss={() => {}}
            onPostpone={(minutes) => {}}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
