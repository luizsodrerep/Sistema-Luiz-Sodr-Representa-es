"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, RefreshCw, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface GoogleCalendarIntegrationProps {
  userId?: string
  userName?: string
}

export function GoogleCalendarIntegration({ userId, userName }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  // Simular verificação de conexão ao carregar o componente
  useEffect(() => {
    // Em um ambiente real, verificaríamos o status da conexão com a API do Google
    const checkConnection = () => {
      // Simulação: 50% de chance de estar conectado
      const connected = Math.random() > 0.5
      setIsConnected(connected)

      if (connected) {
        setLastSync("2023-04-02T14:30:00")
        setUpcomingEvents([
          { id: 1, title: "Visita Cliente ABC", start: "2023-04-05T10:00:00", end: "2023-04-05T11:00:00" },
          { id: 2, title: "Ligação Representada XYZ", start: "2023-04-06T14:00:00", end: "2023-04-06T14:30:00" },
          { id: 3, title: "Reunião Interna", start: "2023-04-07T09:00:00", end: "2023-04-07T10:00:00" },
        ])
      }
    }

    checkConnection()
  }, [])

  const handleConnect = () => {
    setIsLoading(true)

    // Simulação de conexão com o Google Calendar
    setTimeout(() => {
      setIsConnected(true)
      setLastSync(new Date().toISOString())
      setUpcomingEvents([
        { id: 1, title: "Visita Cliente ABC", start: "2023-04-05T10:00:00", end: "2023-04-05T11:00:00" },
        { id: 2, title: "Ligação Representada XYZ", start: "2023-04-06T14:00:00", end: "2023-04-06T14:30:00" },
        { id: 3, title: "Reunião Interna", start: "2023-04-07T09:00:00", end: "2023-04-07T10:00:00" },
      ])
      setIsLoading(false)

      toast({
        title: "Conectado com sucesso!",
        description: "Sua agenda Google foi conectada e sincronizada.",
      })
    }, 2000)
  }

  const handleDisconnect = () => {
    setIsLoading(true)

    // Simulação de desconexão
    setTimeout(() => {
      setIsConnected(false)
      setLastSync(null)
      setUpcomingEvents([])
      setIsLoading(false)

      toast({
        title: "Desconectado",
        description: "Sua agenda Google foi desconectada.",
      })
    }, 1000)
  }

  const handleSync = () => {
    setIsLoading(true)

    // Simulação de sincronização
    setTimeout(() => {
      setLastSync(new Date().toISOString())
      // Atualizar eventos com novos dados
      setUpcomingEvents([
        { id: 1, title: "Visita Cliente ABC", start: "2023-04-05T10:00:00", end: "2023-04-05T11:00:00" },
        { id: 2, title: "Ligação Representada XYZ", start: "2023-04-06T14:00:00", end: "2023-04-06T14:30:00" },
        { id: 3, title: "Reunião Interna", start: "2023-04-07T09:00:00", end: "2023-04-07T10:00:00" },
        { id: 4, title: "Novo Evento Sincronizado", start: "2023-04-08T11:00:00", end: "2023-04-08T12:00:00" },
      ])
      setIsLoading(false)

      toast({
        title: "Sincronização concluída",
        description: "Sua agenda foi sincronizada com sucesso.",
      })
    }, 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>Integração com Google Calendar</span>
        </CardTitle>
        <CardDescription>
          {isConnected
            ? `Conectado como ${userName || "Usuário"} (${userId || "ID não disponível"})`
            : "Conecte sua agenda do Google para sincronizar eventos e interações"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última sincronização:</span>
              <span>{lastSync ? formatDate(lastSync) : "Nunca"}</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Próximos eventos:</h4>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="rounded-md border p-2 text-sm">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(event.start)} - {formatDate(event.end)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Conecte sua conta do Google Calendar para sincronizar automaticamente suas interações e compromissos.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConnected ? (
          <>
            <Button variant="outline" onClick={handleDisconnect} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Desconectar
            </Button>
            <Button onClick={handleSync} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sincronizar Agora
            </Button>
          </>
        ) : (
          <Button onClick={handleConnect} disabled={isLoading} className="w-full">
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
            Conectar com Google Calendar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

