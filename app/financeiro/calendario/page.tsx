"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { format, isToday, isSameDay, isAfter, isBefore, addDays } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, ArrowUpCircle, Check, ChevronLeft, ChevronRight, FileText, Info } from "lucide-react"

export default function CalendarioFiscalPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [filtroTipo, setFiltroTipo] = useState("todos")

  // Dados simulados de impostos
  const impostos = [
    { id: 1, nome: "ISS", vencimento: new Date(2023, 3, 20), valor: 675.0, status: "pendente", tipo: "municipal" },
    {
      id: 2,
      nome: "PIS/COFINS",
      vencimento: new Date(2023, 3, 25),
      valor: 492.75,
      status: "pendente",
      tipo: "federal",
    },
    { id: 3, nome: "IRPJ/CSLL", vencimento: new Date(2023, 3, 30), valor: 130.0, status: "pendente", tipo: "federal" },
    {
      id: 4,
      nome: "DARF Simples",
      vencimento: new Date(2023, 3, 20),
      valor: 1350.0,
      status: "pendente",
      tipo: "federal",
    },
    { id: 5, nome: "FGTS", vencimento: new Date(2023, 3, 7), valor: 240.0, status: "pago", tipo: "trabalhista" },
    { id: 6, nome: "ISS", vencimento: new Date(2023, 2, 20), valor: 625.0, status: "pago", tipo: "municipal" },
    { id: 7, nome: "PIS/COFINS", vencimento: new Date(2023, 2, 25), valor: 456.25, status: "pago", tipo: "federal" },
    {
      id: 8,
      nome: "INSS",
      vencimento: new Date(2023, 3, 15),
      valor: 380.0,
      status: "pendente",
      tipo: "previdenciario",
    },
    { id: 9, nome: "ICMS", vencimento: new Date(2023, 3, 10), valor: 0, status: "isento", tipo: "estadual" },
  ]

  // Função para obter impostos de um dia específico
  const getImpostosDoMes = () => {
    return impostos.filter(
      (imposto) =>
        imposto.vencimento.getMonth() === month.getMonth() && imposto.vencimento.getFullYear() === month.getFullYear(),
    )
  }

  const getImpostosDodia = (dia: Date | undefined) => {
    if (!dia) return []
    return impostos.filter((imposto) => isSameDay(imposto.vencimento, dia))
  }

  // Função para verificar se tem imposto em um dia
  const temImpostoDia = (dia: Date | undefined) => {
    if (!dia) return false
    return impostos.some((imposto) => isSameDay(imposto.vencimento, dia))
  }

  // Função para obter o status de um dia
  const getStatusDia = (dia: Date | undefined) => {
    if (!dia) return null
    const impostosNoDia = impostos.filter((imposto) => isSameDay(imposto.vencimento, dia))
    if (impostosNoDia.length === 0) return null

    const pendentes = impostosNoDia.some((imposto) => imposto.status === "pendente")
    const atrasados = impostosNoDia.some((imposto) => imposto.status === "atrasado")

    if (atrasados) return "atrasado"
    if (pendentes) return "pendente"
    return "pago"
  }

  // Função para renderizar o dia no calendário
  const renderDia = (dia: Date, items: React.ReactNode[]) => {
    const status = getStatusDia(dia)

    return (
      <div className="relative">
        {status && (
          <div
            className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
              status === "atrasado" ? "bg-red-500" : status === "pendente" ? "bg-yellow-500" : "bg-green-500"
            }`}
          />
        )}
        {items}
      </div>
    )
  }

  // Função para pagar imposto
  const pagarImposto = (id: number) => {
    // Lógica para marcar imposto como pago
    console.log("Pagando imposto:", id)
  }

  // Impostos do mês atual
  const impostosDoMes = getImpostosDoMes()

  // Impostos do dia selecionado
  const impostosDoDia = getImpostosDodia(date)

  return (
    <PageLayout title="Calendário Fiscal">
      <NavigationButtons backLabel="Voltar para Financeiro" backHref="/financeiro" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendário de Vencimentos</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                components={{
                  Day: ({ day, displayValue }) => {
                    return renderDia(day, [displayValue])
                  },
                }}
              />

              <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Pagos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Atrasados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Impostos do Mês</CardTitle>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de Imposto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="previdenciario">Previdenciário</SelectItem>
                    <SelectItem value="trabalhista">Trabalhista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>{format(month, "MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imposto</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impostosDoMes
                    .filter((imposto) => filtroTipo === "todos" || imposto.tipo === filtroTipo)
                    .map((imposto) => (
                      <TableRow key={imposto.id}>
                        <TableCell className="font-medium">{imposto.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {format(imposto.vencimento, "dd/MM/yyyy")}
                            {isToday(imposto.vencimento) && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Hoje
                              </Badge>
                            )}
                            {!isToday(imposto.vencimento) &&
                              isBefore(imposto.vencimento, new Date()) &&
                              imposto.status !== "pago" && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                  Atrasado
                                </Badge>
                              )}
                            {isAfter(imposto.vencimento, new Date()) &&
                              isBefore(imposto.vencimento, addDays(new Date(), 5)) && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                  Próximo
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {imposto.valor > 0 ? (
                            <div className="flex items-center gap-1">
                              <ArrowUpCircle className="h-3 w-3 text-red-500" />
                              <span>R$ {imposto.valor.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Isento</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              imposto.status === "pendente" && "border-yellow-500 text-yellow-500",
                              imposto.status === "pago" && "border-green-500 text-green-500",
                              imposto.status === "atrasado" && "border-red-500 text-red-500",
                              imposto.status === "isento" && "border-gray-500 text-gray-500",
                            )}
                          >
                            {imposto.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {imposto.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => pagarImposto(imposto.id)}
                              >
                                <Check className="h-3 w-3" />
                                <span>Pagar</span>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Dia</CardTitle>
              <CardDescription>{format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
            </CardHeader>
            <CardContent>
              {impostosDoDia.length > 0 ? (
                <div className="space-y-4">
                  {impostosDoDia.map((imposto) => (
                    <div key={imposto.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{imposto.nome}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            imposto.status === "pendente" && "border-yellow-500 text-yellow-500",
                            imposto.status === "pago" && "border-green-500 text-green-500",
                            imposto.status === "atrasado" && "border-red-500 text-red-500",
                            imposto.status === "isento" && "border-gray-500 text-gray-500",
                          )}
                        >
                          {imposto.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Vencimento: {format(imposto.vencimento, "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm mt-1">Valor: R$ {imposto.valor.toFixed(2)}</p>
                      <div className="mt-3 flex gap-2">
                        {imposto.status === "pendente" && (
                          <Button size="sm" className="gap-1 w-full" onClick={() => pagarImposto(imposto.id)}>
                            <Check className="h-3 w-3" />
                            <span>Marcar como Pago</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1 w-full">
                          <FileText className="h-3 w-3" />
                          <span>Ver Detalhes</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">Nenhum imposto neste dia</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione outra data no calendário para visualizar os impostos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {impostos
                  .filter((imposto) => imposto.status === "pendente" && isAfter(imposto.vencimento, new Date()))
                  .sort((a, b) => a.vencimento.getTime() - b.vencimento.getTime())
                  .slice(0, 5)
                  .map((imposto) => (
                    <div key={imposto.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{imposto.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence em {format(imposto.vencimento, "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-sm font-medium">R$ {imposto.valor.toFixed(2)}</div>
                    </div>
                  ))}
                {impostos.filter((imposto) => imposto.status === "pendente" && isAfter(imposto.vencimento, new Date()))
                  .length === 0 && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Não há impostos pendentes para os próximos dias</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

