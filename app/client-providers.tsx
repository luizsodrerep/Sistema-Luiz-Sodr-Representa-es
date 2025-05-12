'use client'

import { AlertReminder } from '@/app/components/alert-reminder'
//import { usePostpone } from '@/hooks/use-postpone'
//import { useDismiss } from '@/hooks/use-dismiss'

export function ClientProviders() {
  const handlePostpone = (minutes: number) => {
    console.log(`Adiado por ${minutes} minutos`)
    // Lógica de adiamento aqui
  }

  const handleDismiss = () => {
    console.log('Lembrete dispensado')
    // Lógica de dismiss aqui
  }

  return (
    <AlertReminder
      title="Relatório de Comissão"
      description="Emitir relatório de comissão para Descartáveis Premium"
      date="Vence hoje às 18:00"
      type="deadline"
      onDismiss={handleDismiss}
      onPostpone={handlePostpone}
    />
  )
}