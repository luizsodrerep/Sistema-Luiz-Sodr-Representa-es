import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ClientProviders } from './client-providers'
import '@/app/globals.css'
import { AuthProvider } from '@/app/context/AuthContext'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { BodyWrapper } from './BodyWrapper' // 👈 importa aqui

export const metadata: Metadata = {
  title: 'CRM e Sistema de Gestão Comercial',
  description: 'Sistema completo de CRM e Gestão Comercial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProtectedRoute>
              <BodyWrapper> {/* 👈 envolve o conteúdo principal */}
                {children}
              </BodyWrapper>
            </ProtectedRoute>
          </AuthProvider>
          <Toaster />
          <ClientProviders />
        </ThemeProvider>
      </body>
    </html>
  )
}
