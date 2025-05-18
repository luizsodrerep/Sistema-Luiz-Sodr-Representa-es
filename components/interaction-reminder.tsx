"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BellRing, CalendarIcon, Check, Clock, MessageSquare, Phone, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface InteractionReminderProps {
  clientId?: string
  clientName?: string
  representadaId?: string
  representadaName?: string
  defaultDate?: Date
  defaultType?: string
  onReminderCreated?: (data: any) => void
}

export function InteractionReminder({
  clientId,
  clientName,
  representadaId,
  representadaName,
  defaultDate = new Date(),
  defaultType = "ligacao",
  onReminderCreated,
}: InteractionReminderProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate)
  const [time, setTime] = useState("09:00")
  const [type, setType] = useState(defaultType)
  const [notes, setNotes] = useState("")
  const [addToCalendar, setAddToCalendar] = useState(true)

  const handleCreateReminder = () => {
    // Criar o lembrete (em uma implementação real, isso seria salvo no banco de dados)
    const reminderData = {
      clientId,
      clientName,
      representadaId,
      representadaName,
      date,
      time,
      type,
      notes,
      addToCalendar,
    }

    // Notificar o componente pai
    if (onReminderCreated) {
      onReminderCreated(reminderData)
    }

    // Mostrar confirmação
    toast({
      title: "Lembrete criado com sucesso!",
      description: `Lembrete agendado para ${format(date!, "dd/MM/yyyy", { locale: ptBR })} às ${time}.`,
    })

    // Limpar o formulário
    setNotes("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <span>Agendar Lembrete de Interação</span>
        </CardTitle>
        <CardDescription>
          {clientName ? `Agendar lembrete para contatar ${clientName}` : "Agendar lembrete para próxima interação"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Data do Lembrete</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Horário</div>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">08:00</SelectItem>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="13:00">13:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Tipo de Interação</div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de interação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ligacao">Ligação Telefônica</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="visita">Visita</SelectItem>
              <SelectItem value="reuniao">Reunião</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Observações</div>
          <Textarea
            placeholder="Adicione observações ou motivo do contato..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex h-5 items-center space-x-2">
            <input
              type="checkbox"
              id="add-to-calendar"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
          <div className="leading-none">
            <label
              htmlFor="add-to-calendar"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Adicionar ao Google Calendar
            </label>
          </div>
        </div>

        <div className="rounded-md border p-4 space-y-2">
          <div className="text-sm font-medium">Resumo do Lembrete</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Data não selecionada"} às {time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {type === "ligacao" && <Phone className="h-4 w-4 text-muted-foreground" />}
              {type === "whatsapp" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
              {type === "email" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
              {type === "visita" && <User className="h-4 w-4 text-muted-foreground" />}
              {type === "reuniao" && <User className="h-4 w-4 text-muted-foreground" />}
              <span>
                {type === "ligacao" && "Ligação Telefônica"}
                {type === "whatsapp" && "WhatsApp"}
                {type === "email" && "E-mail"}
                {type === "visita" && "Visita"}
                {type === "reuniao" && "Reunião"}
              </span>
            </div>
            {clientName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Cliente: {clientName}</span>
              </div>
            )}
            {representadaName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Representada: {representadaName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateReminder} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Criar Lembrete
        </Button>
      </CardFooter>
    </Card>
  )
}

