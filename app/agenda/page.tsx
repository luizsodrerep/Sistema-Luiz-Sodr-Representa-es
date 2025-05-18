"use client"

import Link from "next/link"
import { useState } from "react"
import { ptBR } from "date-fns/locale"
import { format, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { Calendar } from "@/components/ui/calendar"
import { PageLayout } from "@/components/page-layout"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  Phone,
  Users,
  Package,
} from "lucide-react"

export default function AgendaPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [view, setView] = useState<"mes" | "semana" | "dia">("mes")

  // Dados simulados de eventos
  const eventos = [
    {
      id: 1,
      titulo: "Visita - Distribuidora ABC",
      cliente: "Distribuidora ABC",
      clienteId: "1",
      data: new Date(2023, 3, 15, 10, 0),
      tipo: "visita",
      responsavel: "Luiz Sodré",
      responsavelId: "luiz-sodre",
      descricao: "Apresentação de novos produtos",
    },
    {
      id: 2,
      titulo: "Ligação - Supermercado Silva",
      cliente: "Supermercado Silva",
      clienteId: "2",
      data: new Date(2023, 3, 16, 14, 30),
      tipo: "ligacao",
      responsavel: "Maria Silva",
      responsavelId: "maria-silva",
      descricao: "Follow-up de proposta",
    },
    {
      id: 3,
      titulo: "Reunião Interna - Planejamento",
      cliente: null,
      clienteId: null,
      data: new Date(2023, 3, 17, 9, 0),
      tipo: "reuniao",
      responsavel: "Luiz Sodré",
      responsavelId: "luiz-sodre",
      descricao: "Planejamento semanal da equipe",
    },
    {
      id: 4,
      titulo: "Visita - Confeitaria Doce",
      cliente: "Confeitaria Doce",
      clienteId: "3",
      data: new Date(2023, 3, 18, 11, 0),
      tipo: "visita",
      responsavel: "João Santos",
      responsavelId: "joao-santos",
      descricao: "Demonstração de produtos",
    },
    {
      id: 5,
      titulo: "Entrega - Atacadão Produtos",
      cliente: "Atacadão Produtos",
      clienteId: "4",
      data: new Date(2023, 3, 19, 15, 0),
      tipo: "entrega",
      responsavel: "Ana Oliveira",
      responsavelId: "ana-oliveira",
      descricao: "Acompanhamento de entrega",
    },
  ]

  // Função para verificar se há eventos em um dia específico
  const hasEventOnDay = (day: Date) => {
    return eventos.some((evento) => isSameDay(evento.data, day))
  }

  // Função para obter eventos de um dia específico
  const getEventsForDay = (day: Date) => {
    return eventos.filter((evento) => isSameDay(evento.data, day))
  }

  // Eventos do dia selecionado
  const eventosHoje = getEventsForDay(date)

  return (
    <SidebarLayout>
      <PageLayout title="Agenda">
        {/* <NavigationButtons /> */}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={(v) => setView(v as "mes" | "semana" | "dia")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="dia">Dia</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const hoje = new Date()
                  setMonth(hoje)
                  setDate(hoje)
                }}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Componente de importação/exportação de planilhas */}
            <SpreadsheetHandler moduleType="agenda" data={eventos} />

            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Evento</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{format(month, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  month={month}
                  onMonthChange={setMonth}
                  locale={ptBR}
                  className="rounded-md border"
                // components={{
                //   Day: ({ day, displayValue }) => {
                //     const hasEvent = hasEventOnDay(day)
                //     return (
                //       <div className="relative">
                //         {hasEvent && <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-primary" />}
                //         {displayValue}
                //       </div>
                //     )
                //   },
                // }}
                />
              </CardContent>
            </Card>

            {view === "dia" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Agenda do Dia</CardTitle>
                  <CardDescription>{format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {eventosHoje.length > 0 ? (
                      eventosHoje.map((evento) => (
                        <div key={evento.id} className="flex items-start p-2 border rounded-md">
                          <div className="flex flex-col items-center mr-4">
                            <div className="text-sm font-medium">{format(evento.data, "HH:mm")}</div>
                            <div className="text-xs text-muted-foreground">{format(evento.data, "dd/MM")}</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{evento.titulo}</div>
                            <div className="text-sm text-muted-foreground">{evento.descricao}</div>
                            <div className="flex items-center gap-4 mt-1">
                              {evento.cliente && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-primary" />
                                  <Link href={`/clientes/${evento.clienteId}`} className="text-xs hover:underline">
                                    {evento.cliente}
                                  </Link>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <Link href={`/usuarios/${evento.responsavelId}`} className="text-xs hover:underline">
                                  {evento.responsavel}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum evento agendado para este dia</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventos
                    .filter((evento) => evento.data >= new Date())
                    .sort((a, b) => a.data.getTime() - b.data.getTime())
                    .slice(0, 5)
                    .map((evento) => (
                      <div key={evento.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div
                          className={`p-2 rounded-md ${evento.tipo === "visita"
                            ? "bg-blue-100 text-blue-700"
                            : evento.tipo === "ligacao"
                              ? "bg-green-100 text-green-700"
                              : evento.tipo === "reuniao"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                        >
                          {evento.tipo === "visita" && <User className="h-5 w-5" />}
                          {evento.tipo === "ligacao" && <Phone className="h-5 w-5" />}
                          {evento.tipo === "reuniao" && <Users className="h-5 w-5" />}
                          {evento.tipo === "entrega" && <Package className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{evento.titulo}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(evento.data, "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                          </div>
                          {evento.cliente && (
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 className="h-3 w-3 text-primary" />
                              <Link href={`/clientes/${evento.clienteId}`} className="text-xs hover:underline">
                                {evento.cliente}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Tipo de Evento</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" size="sm" className="justify-start">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        Visitas
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        Ligações
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        Reuniões
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        Entregas
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Responsável</label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Todos os responsáveis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="luiz-sodre">Luiz Sodré</SelectItem>
                        <SelectItem value="maria-silva">Maria Silva</SelectItem>
                        <SelectItem value="joao-santos">João Santos</SelectItem>
                        <SelectItem value="ana-oliveira">Ana Oliveira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cliente</label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Todos os clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="1">Distribuidora ABC</SelectItem>
                        <SelectItem value="2">Supermercado Silva</SelectItem>
                        <SelectItem value="3">Confeitaria Doce</SelectItem>
                        <SelectItem value="4">Atacadão Produtos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full mt-2">Aplicar Filtros</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </SidebarLayout>
  )
}

