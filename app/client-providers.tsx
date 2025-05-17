'use client'

import { usePathname } from 'next/navigation'
import { AlertReminder } from '@/app/components/alert-reminder'

export function ClientProviders() {
  const pathname = usePathname()

  const handlePostpone = (minutes: number) => {
    console.log(`Adiado por ${minutes} minutos`)
  }

  const handleDismiss = () => {
    console.log('Lembrete dispensado')
  }

  // Não mostrar o AlertReminder na tela de login
  //if (pathname === '/login' || pathname === '/change-password') return null

  if (pathname !== '/') return null

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <AlertReminder
        title="Relatório de Comissão"
        description="Emitir relatório de comissão para Descartáveis Premium"
        date="Vence hoje às 18:00"
        type="deadline"
        onDismiss={handleDismiss}
        onPostpone={handlePostpone}
      />
    </div>
  )
}
