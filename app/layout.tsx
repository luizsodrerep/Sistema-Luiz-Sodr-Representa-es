import type React from "react"

import "@/app/globals.css"

import {
  ThemeProvider,
} from "@/components/theme-provider"

import {
  Toaster,
} from "@/components/ui/toaster"

import {
  UserSessionMenu,
} from "@/components/auth/user-session-menu"

export const metadata = {
  title:
    "CRM Luiz Sodré Representações",

  description:
    "Sistema de CRM e Gestão Comercial da Luiz Sodré Representações",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserSessionMenu>
            {children}
          </UserSessionMenu>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}