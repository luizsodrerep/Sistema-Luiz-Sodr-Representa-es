"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, isToday, isSameDay, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  ArrowUpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  Info,
  Printer,
} from "lucide-react"

export default function CalendarioFiscalPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [filtroTipo, setFiltroTipo] = useState("todos")

  // Dados simulados de obrigações fiscais
  const obrigacoesFiscais = [
    {
      id: 1,
      nome: "ISS",
      vencimento: new Date(2023, 3, 20),
      valor: 675.0,
      status: "pendente",
      tipo: "imposto",
      descricao: "Imposto Sobre Serviços referente a março/2023",
    },
    {
      id: 2,
      nome: "PIS/COFINS",
      vencimento: new Date(2023, 3, 25),
      valor: 492.75,
      status: "pendente",
      tipo: "imposto",
      descricao: "PIS e COFINS referentes a março/2023",
    },
    {
      id: 3,
      nome: "IRPJ/CSLL",
      vencimento: new Date(2023, 3, 30),
      valor: 130.0,
      status: "pendente",
      tipo: "imposto",
      descricao: "Imposto de Renda e Contribuição Social referentes a março/2023",
    },
    {
      id: 4,
      nome: "DARF Simples",
      vencimento: new Date(2023, 3, 20),
      valor: 1350.0,
      status: "pendente",
      tipo: "imposto",
      descricao: "Simples Nacional referente a março/2023",
    },
    {
      id: 5,
      nome: "GFIP",
      vencimento: new Date(2023, 3, 7),
      valor: 0.0,
      status: "enviado",
      tipo: "declaracao",
      descricao: "Guia de Recolhimento do FGTS e de Informações à Previdência Social",
    },
    {
      id: 6,
      nome: "DCTF",
      vencimento: new Date(2023, 3, 15),
      valor: 0.0,
      status: "pendente",
      tipo: "declaracao",
      descricao: "Declaração de Débitos e Créditos Tributários Federais",
    },
    {
      id: 7,
      nome: "EFD-Contribuições",
      vencimento: new Date(2023, 3, 10),
      valor: 0.0,
      status: "enviado",
      tipo: "declaracao",
      descricao: "Escrituração Fiscal Digital de Contribuições",
    },
    {
      id: 8,
      nome: "PGDAS-D",
      vencimento: new Date(2023, 3, 20),
      valor: 0.0,
      status: "pendente",
      tipo: "declaracao",
      descricao: "Programa Gerador do Documento de Arrecadação do Simples Nacional",
    },
    {
      id: 9,
      nome: "ECD",
      vencimento: new Date(2023, 4, 31),
      valor: 0.0,
      status: "pendente",
      tipo: "declaracao",
      descricao: "Escrituração Contábil Digital referente ao ano-calendário de 2022",
    },
  ]

  // Função para obter obrigações de um dia específico
  const getObrigacoesDoMes = () => {
    return obrigacoesFiscais.filter(
      (obrigacao) =>
        obrigacao.vencimento.getMonth() === month.getMonth() &&
        obrigacao.vencimento.getFullYear() === month.getFullYear(),
    )
  }

  const getObrigacoesDoDia = (dia: Date | undefined) => {
    if (!dia) return []
    return obrigacoesFiscais.filter((obrigacao) => isSameDay(obrigacao.vencimento, dia))
  }

  // Função para verificar se tem obrigação em um dia
  const temObrigacaoDia = (dia: Date | undefined) => {
    if (!dia) return false
    return obrigacoesFiscais.some((obrigacao) => isSameDay(obrigacao.vencimento, dia))
  }

  // Função para obter o status de um dia
  const getStatusDia = (dia: Date | undefined) => {
    if (!dia) return null
    const obrigacoesNoDia = obrigacoesFiscais.filter((obrigacao) => isSameDay(obrigacao.vencimento, dia))
    if (obrigacoesNoDia.length === 0) return null

    const pendentes = obrigacoesNoDia.some((obrigacao) => obrigacao.status === "pendente")
    const atrasados = obrigacoesNoDia.some(
      (obrigacao) => obrigacao.status === "pendente" && isBefore(obrigacao.vencimento, new Date()),
    )

    if (atrasados) return "atrasado"
    if (pendentes) return "pendente"
    return "concluido"
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

  // Função para concluir obrigação
  const concluirObrigacao = (id: number) => {
    // Lógica para marcar obrigação como concluída
    console.log("Concluindo obrigação:", id)
  }

  // Obrigações do mês atual
  const obrigacoesDoMes = getObrigacoesDoMes()

  // Obrigações do dia selecionado
  const obrigacoesDoDia = getObrigacoesDoDia(date)

  return (
    <PageLayout title="Calendário Fiscal">
      <NavigationButtons backLabel="Voltar para Contabilidade" backHref="/contabilidade" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendário de Obrigações Fiscais</CardTitle>
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
                  <span className="text-xs">Concluídas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Atrasadas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Obrigações do Mês</CardTitle>
                <div className="flex gap-2">
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de Obrigação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="imposto">Impostos</SelectItem>
                      <SelectItem value="declaracao">Declarações</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="h-4 w-4" />
                    <span className="hidden md:inline">Imprimir</span>
                  </Button>
                </div>
              </div>
              <CardDescription>{format(month, "MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obrigação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obrigacoesDoMes
                    .filter((obrigacao) => filtroTipo === "todos" || obrigacao.tipo === filtroTipo)
                    .map((obrigacao) => (
                      <TableRow key={obrigacao.id}>
                        <TableCell className="font-medium">{obrigacao.nome}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              obrigacao.tipo === "imposto"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800",
                            )}
                          >
                            {obrigacao.tipo === "imposto" ? "Imposto" : "Declaração"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {format(obrigacao.vencimento, "dd/MM/yyyy")}
                            {isToday(obrigacao.vencimento) && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Hoje
                              </Badge>
                            )}
                            {!isToday(obrigacao.vencimento) &&
                              isBefore(obrigacao.vencimento, new Date()) &&
                              obrigacao.status === "pendente" && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                  Atrasado
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {obrigacao.valor > 0 ? (
                            <div className="flex items-center gap-1">
                              <ArrowUpCircle className="h-3 w-3 text-red-500" />
                              <span>R$ {obrigacao.valor.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              obrigacao.status === "pendente" && "border-yellow-500 text-yellow-500",
                              (obrigacao.status === "enviado" || obrigacao.status === "pago") &&
                                "border-green-500 text-green-500",
                            )}
                          >
                            {obrigacao.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {obrigacao.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => concluirObrigacao(obrigacao.id)}
                              >
                                <Check className="h-3 w-3" />
                                {obrigacao.tipo === "imposto" ? <span>Pagar</span> : <span>Enviar</span>}
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

              {obrigacoesDoMes.filter((obrigacao) => filtroTipo === "todos" || obrigacao.tipo === filtroTipo).length ===
                0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">Nenhuma obrigação encontrada</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há obrigações fiscais para o período e filtro selecionados
                  </p>
                </div>
              )}
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
              {obrigacoesDoDia.length > 0 ? (
                <div className="space-y-4">
                  {obrigacoesDoDia.map((obrigacao) => (
                    <div key={obrigacao.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{obrigacao.nome}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            obrigacao.status === "pendente" && "border-yellow-500 text-yellow-500",
                            (obrigacao.status === "enviado" || obrigacao.status === "pago") &&
                              "border-green-500 text-green-500",
                          )}
                        >
                          {obrigacao.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{obrigacao.descricao}</p>
                      {obrigacao.valor > 0 && <p className="text-sm mt-2">Valor: R$ {obrigacao.valor.toFixed(2)}</p>}
                      <div className="mt-3 flex gap-2">
                        {obrigacao.status === "pendente" && (
                          <Button size="sm" className="gap-1 w-full" onClick={() => concluirObrigacao(obrigacao.id)}>
                            <Check className="h-3 w-3" />
                            {obrigacao.tipo === "imposto" ? (
                              <span>Marcar como Pago</span>
                            ) : (
                              <span>Marcar como Enviado</span>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1 w-full">
                          <FileText className="h-3 w-3" />
                          <span>Ver Detalhes</span>
                        </Button>
                        {obrigacao.tipo === "declaracao" && (
                          <Button variant="outline" size="sm" className="gap-1 w-full">
                            <FileCheck className="h-3 w-3" />
                            <span>Protocolo</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium">Nenhuma obrigação neste dia</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione outra data no calendário para visualizar as obrigações
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
                {obrigacoesFiscais
                  .filter((obrigacao) => obrigacao.status === "pendente" && isAfter(obrigacao.vencimento, new Date()))
                  .sort((a, b) => a.vencimento.getTime() - b.vencimento.getTime())
                  .slice(0, 5)
                  .map((obrigacao) => (
                    <div key={obrigacao.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{obrigacao.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence em {format(obrigacao.vencimento, "dd/MM/yyyy")}
                        </p>
                      </div>
                      {obrigacao.valor > 0 ? (
                        <div className="text-sm font-medium">R$ {obrigacao.valor.toFixed(2)}</div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {obrigacao.tipo === "imposto" ? "Imposto" : "Declaração"}
                        </Badge>
                      )}
                    </div>
                  ))}
                {obrigacoesFiscais.filter(
                  (obrigacao) => obrigacao.status === "pendente" && isAfter(obrigacao.vencimento, new Date()),
                ).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Não há obrigações pendentes para os próximos dias</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">Guia ISS - Março/2023</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">DARF PIS/COFINS - Março/2023</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">Certificado de Regularidade</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

