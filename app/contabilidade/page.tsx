"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowUpCircle,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  LineChart,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

export default function ContabilidadePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAddNF, setShowAddNF] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes-atual")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Dados simulados
  const resumoContabil = {
    totalNotasEmitidas: 15,
    valorTotalNotas: 22500.0,
    totalImpostos: 1350.0,
    notasPendentes: 3,
    notasVencendo: 2,
  }

  const notasFiscais = [
    {
      id: 1,
      numero: "NF-001",
      tipo: "servico",
      cliente: "Descartáveis Premium",
      valor: 5200.0,
      emissao: "2023-03-15",
      vencimento: "2023-04-15",
      status: "emitida",
      arquivo: "nf-001.pdf",
    },
    {
      id: 2,
      numero: "NF-002",
      tipo: "servico",
      cliente: "Embalagens Eco",
      valor: 3800.0,
      emissao: "2023-03-15",
      vencimento: "2023-04-15",
      status: "emitida",
      arquivo: "nf-002.pdf",
    },
    {
      id: 3,
      numero: "NF-003",
      tipo: "servico",
      cliente: "Papel & Cia",
      valor: 4500.0,
      emissao: "2023-03-20",
      vencimento: "2023-04-20",
      status: "emitida",
      arquivo: "nf-003.pdf",
    },
    {
      id: 4,
      numero: "NF-004",
      tipo: "servico",
      cliente: "Plásticos Nobre",
      valor: 6200.0,
      emissao: "2023-02-15",
      vencimento: "2023-03-15",
      status: "paga",
      arquivo: "nf-004.pdf",
    },
    {
      id: 5,
      numero: "NF-005",
      tipo: "servico",
      cliente: "ABC Consultoria",
      valor: 2500.0,
      emissao: "2023-02-10",
      vencimento: "2023-03-10",
      status: "paga",
      arquivo: "nf-005.pdf",
    },
    {
      id: 6,
      numero: "NF-006",
      tipo: "servico",
      cliente: "XYZ Corporation",
      valor: 3800.0,
      emissao: "2023-02-05",
      vencimento: "2023-03-05",
      status: "paga",
      arquivo: "nf-006.pdf",
    },
    {
      id: 7,
      numero: "NF-007",
      tipo: "servico",
      cliente: "Descartáveis Premium",
      valor: 4800.0,
      emissao: "2023-01-15",
      vencimento: "2023-02-15",
      status: "paga",
      arquivo: "nf-007.pdf",
    },
  ]

  const impostos = [
    {
      id: 1,
      tipo: "ISS",
      aliquota: "5%",
      baseCalculo: 5200.0,
      valor: 260.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-001",
    },
    {
      id: 2,
      tipo: "PIS",
      aliquota: "0.65%",
      baseCalculo: 5200.0,
      valor: 33.8,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-001",
    },
    {
      id: 3,
      tipo: "COFINS",
      aliquota: "3%",
      baseCalculo: 5200.0,
      valor: 156.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-001",
    },
    {
      id: 4,
      tipo: "IRPJ",
      aliquota: "1.5%",
      baseCalculo: 5200.0,
      valor: 78.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-001",
    },
    {
      id: 5,
      tipo: "CSLL",
      aliquota: "1%",
      baseCalculo: 5200.0,
      valor: 52.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-001",
    },
    {
      id: 6,
      tipo: "ISS",
      aliquota: "5%",
      baseCalculo: 3800.0,
      valor: 190.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-002",
    },
    {
      id: 7,
      tipo: "PIS",
      aliquota: "0.65%",
      baseCalculo: 3800.0,
      valor: 24.7,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-002",
    },
    {
      id: 8,
      tipo: "COFINS",
      aliquota: "3%",
      baseCalculo: 3800.0,
      valor: 114.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-002",
    },
    {
      id: 9,
      tipo: "ISS",
      aliquota: "5%",
      baseCalculo: 4500.0,
      valor: 225.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-003",
    },
    {
      id: 10,
      tipo: "PIS",
      aliquota: "0.65%",
      baseCalculo: 4500.0,
      valor: 29.25,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-003",
    },
    {
      id: 11,
      tipo: "COFINS",
      aliquota: "3%",
      baseCalculo: 4500.0,
      valor: 135.0,
      vencimento: "2023-04-20",
      status: "pendente",
      notaFiscal: "NF-003",
    },
  ]

  const calendarioFiscal = [
    { id: 1, obrigacao: "ISS", vencimento: "2023-04-20", referencia: "Março/2023", status: "pendente", valor: 675.0 },
    {
      id: 2,
      obrigacao: "PIS/COFINS",
      vencimento: "2023-04-25",
      referencia: "Março/2023",
      status: "pendente",
      valor: 492.75,
    },
    {
      id: 3,
      obrigacao: "IRPJ/CSLL",
      vencimento: "2023-04-30",
      referencia: "Março/2023",
      status: "pendente",
      valor: 130.0,
    },
    {
      id: 4,
      obrigacao: "DARF SIMPLES",
      vencimento: "2023-04-20",
      referencia: "Março/2023",
      status: "pendente",
      valor: 1350.0,
    },
    { id: 5, obrigacao: "ISS", vencimento: "2023-03-20", referencia: "Fevereiro/2023", status: "pago", valor: 625.0 },
    {
      id: 6,
      obrigacao: "PIS/COFINS",
      vencimento: "2023-03-25",
      referencia: "Fevereiro/2023",
      status: "pago",
      valor: 456.25,
    },
    {
      id: 7,
      obrigacao: "IRPJ/CSLL",
      vencimento: "2023-03-30",
      referencia: "Fevereiro/2023",
      status: "pago",
      valor: 125.0,
    },
  ]

  const tiposImpostos = [
    { id: "ISS", nome: "ISS", aliquota: "5%", valor: 675.0 },
    { id: "PIS", nome: "PIS", aliquota: "0.65%", valor: 87.75 },
    { id: "COFINS", nome: "COFINS", aliquota: "3%", valor: 405.0 },
    { id: "IRPJ", nome: "IRPJ", aliquota: "1.5%", valor: 78.0 },
    { id: "CSLL", nome: "CSLL", aliquota: "1%", valor: 52.0 },
    { id: "SIMPLES", nome: "Simples Nacional", aliquota: "6%", valor: 1350.0 },
  ]

  // Funções
  const handleAddNF = () => {
    toast({
      title: "Nota fiscal adicionada com sucesso!",
      description: "A nova nota fiscal foi registrada no sistema.",
    })
    setShowAddNF(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handlePagarImposto = (id: number) => {
    toast({
      title: "Pagamento de imposto registrado!",
      description: "O pagamento do imposto foi registrado com sucesso.",
    })
  }

  const filtrarNotas = (notas: any[], status: string) => {
    if (status === "todos") return notas
    return notas.filter((nota) => nota.status === status)
  }

  const calcularTotalImpostos = (valor: number) => {
    // Cálculo simplificado de 6% de impostos totais
    return valor * 0.06
  }

  return (
    <SidebarLayout>
      <PageLayout title="Contabilidade">
        {/* Botões de navegação */}
        {/* <NavigationButtons backLabel="Voltar" backHref="/dashboard" /> */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas Emitidas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoContabil.totalNotasEmitidas}</div>
              <p className="text-xs text-muted-foreground">Total de notas fiscais emitidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {resumoContabil.valorTotalNotas.toFixed(2)}</div>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+8% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Impostos</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {resumoContabil.totalImpostos.toFixed(2)}</div>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground ml-1">6% sobre faturamento</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{resumoContabil.notasPendentes}</div>
              <div className="flex items-center pt-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-500 ml-1">Aguardando pagamento</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impostos a Vencer</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{resumoContabil.notasVencendo}</div>
              <div className="flex items-center pt-1">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-500 ml-1">Próximos 7 dias</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Impostos por Período</CardTitle>
                <div className="flex gap-2">
                  <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                    <SelectTrigger className="h-8 w-[150px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes-atual">Mês Atual</SelectItem>
                      <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                      <SelectItem value="ultimos-3-meses">Últimos 3 Meses</SelectItem>
                      <SelectItem value="ano-atual">Ano Atual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3 w-3" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-3">
              {tiposImpostos.slice(0, 5).map((imposto) => (
                <div key={imposto.id} className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${imposto.id === "ISS"
                      ? "bg-blue-500"
                      : imposto.id === "PIS"
                        ? "bg-green-500"
                        : imposto.id === "COFINS"
                          ? "bg-purple-500"
                          : imposto.id === "IRPJ"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {imposto.nome}: R$ {imposto.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendário Fiscal</CardTitle>
              <CardDescription>Vencimentos de impostos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} className="rounded-md border" />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 border-t px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs">4 impostos a vencer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs">3 impostos pagos</span>
              </div>
              <Link href="/contabilidade/calendario" className="text-xs text-primary hover:underline">
                Ver calendário completo
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="notas-fiscais" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="notas-fiscais">Notas Fiscais</TabsTrigger>
            <TabsTrigger value="impostos">Impostos</TabsTrigger>
            <TabsTrigger value="calendario-fiscal">Calendário Fiscal</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="notas-fiscais" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar nota fiscal..." className="w-full md:w-[250px] pl-8" />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="emitida">Emitidas</SelectItem>
                    <SelectItem value="paga">Pagas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="produto">Produto</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Componente de importação/exportação de planilhas */}
                <SpreadsheetHandler moduleType="contabilidade" />

                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nova Nota Fiscal</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente/Representada</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Impostos</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrarNotas(notasFiscais, filtroStatus).map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-medium">{nota.numero}</TableCell>
                        <TableCell>
                          <Link
                            href={`/representadas/${nota.cliente.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-primary hover:underline"
                          >
                            {nota.cliente}
                          </Link>
                        </TableCell>
                        <TableCell>R$ {nota.valor.toFixed(2)}</TableCell>
                        <TableCell>R$ {calcularTotalImpostos(nota.valor).toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(nota.emissao), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              nota.status === "emitida" && "border-yellow-500 text-yellow-500",
                              nota.status === "paga" && "border-green-500 text-green-500",
                              nota.status === "cancelada" && "border-red-500 text-red-500",
                            )}
                          >
                            {nota.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filtrarNotas(notasFiscais, filtroStatus).length} de {notasFiscais.length} notas fiscais
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    2
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    3
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notas Fiscais por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Últimas Notas Emitidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notasFiscais
                      .filter((nota) => nota.status === "emitida")
                      .slice(0, 4)
                      .map((nota) => (
                        <div key={nota.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {nota.numero} - {nota.cliente}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(nota.emissao), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="text-sm font-medium">R$ {nota.valor.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                  <Button variant="link" className="mt-4 h-8 p-0 text-xs">
                    Ver todas as notas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impostos" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar imposto..." className="w-full md:w-[250px] pl-8" />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="ISS">ISS</SelectItem>
                    <SelectItem value="PIS">PIS</SelectItem>
                    <SelectItem value="COFINS">COFINS</SelectItem>
                    <SelectItem value="IRPJ">IRPJ</SelectItem>
                    <SelectItem value="CSLL">CSLL</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Componente de importação/exportação de planilhas */}
                <SpreadsheetHandler moduleType="contabilidade" />

                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Novo Imposto</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Alíquota</TableHead>
                      <TableHead>Base de Cálculo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nota Fiscal</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {impostos.map((imposto) => (
                      <TableRow key={imposto.id}>
                        <TableCell className="font-medium">{imposto.tipo}</TableCell>
                        <TableCell>{imposto.aliquota}</TableCell>
                        <TableCell>R$ {imposto.baseCalculo.toFixed(2)}</TableCell>
                        <TableCell>R$ {imposto.valor.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(imposto.vencimento), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              imposto.status === "pendente" && "border-yellow-500 text-yellow-500",
                              imposto.status === "pago" && "border-green-500 text-green-500",
                              imposto.status === "atrasado" && "border-red-500 text-red-500",
                              imposto.status === "pago" && "border-green-500 text-green-500",
                              imposto.status === "atrasado" && "border-red-500 text-red-500",
                            )}
                          >
                            {imposto.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/contabilidade/notas/${imposto.notaFiscal.toLowerCase()}`}
                            className="text-primary hover:underline"
                          >
                            {imposto.notaFiscal}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {imposto.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => handlePagarImposto(imposto.id)}
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
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">Mostrando {impostos.length} impostos</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    2
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Impostos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tiposImpostos.map((imposto) => (
                      <div key={imposto.id} className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full ${imposto.id === "ISS"
                            ? "bg-blue-500"
                            : imposto.id === "PIS"
                              ? "bg-green-500"
                              : imposto.id === "COFINS"
                                ? "bg-purple-500"
                                : imposto.id === "IRPJ"
                                  ? "bg-red-500"
                                  : imposto.id === "CSLL"
                                    ? "bg-yellow-500"
                                    : "bg-gray-500"
                            } mr-2`}
                        />
                        <div className="flex-1 text-sm">
                          {imposto.nome} ({imposto.aliquota})
                        </div>
                        <div className="font-medium">R$ {imposto.valor.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-[160px] w-full">
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Próximos Vencimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarioFiscal
                      .filter((obrigacao) => obrigacao.status === "pendente")
                      .slice(0, 4)
                      .map((obrigacao) => (
                        <div key={obrigacao.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{obrigacao.obrigacao}</span>
                            <span className="text-xs text-muted-foreground">
                              Vencimento: {format(new Date(obrigacao.vencimento), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="text-sm font-medium">R$ {obrigacao.valor.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                  <Button variant="link" className="mt-4 h-8 p-0 text-xs">
                    Ver todos os vencimentos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendario-fiscal" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes-atual">Mês Atual</SelectItem>
                    <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                    <SelectItem value="proximo-mes">Próximo Mês</SelectItem>
                    <SelectItem value="ano-atual">Ano Atual</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1">
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </Button>
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Calendário Fiscal - Abril/2023</CardTitle>
                <CardDescription>Obrigações fiscais e tributárias do período</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Obrigação</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendarioFiscal.map((obrigacao) => (
                      <TableRow key={obrigacao.id}>
                        <TableCell className="font-medium">{obrigacao.obrigacao}</TableCell>
                        <TableCell>{format(new Date(obrigacao.vencimento), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{obrigacao.referencia}</TableCell>
                        <TableCell>R$ {obrigacao.valor.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              obrigacao.status === "pendente" && "border-yellow-500 text-yellow-500",
                              obrigacao.status === "pago" && "border-green-500 text-green-500",
                              obrigacao.status === "atrasado" && "border-red-500 text-red-500",
                            )}
                          >
                            {obrigacao.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {obrigacao.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => handlePagarImposto(obrigacao.id)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visão Anual</CardTitle>
                  <CardDescription>Obrigações fiscais do ano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lembretes Importantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-yellow-50 dark:bg-yellow-950">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="text-sm font-medium">Declaração Anual de Faturamento</h4>
                        <p className="text-xs text-muted-foreground">Prazo final: 31/05/2023</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-md bg-blue-50 dark:bg-blue-950">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium">Certificado Digital</h4>
                        <p className="text-xs text-muted-foreground">Renovar até: 15/06/2023</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-md bg-red-50 dark:bg-red-950">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="text-sm font-medium">DARF Trimestral</h4>
                        <p className="text-xs text-muted-foreground">Vencimento: 30/04/2023</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Relatório de Notas Fiscais</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Relatório completo de notas fiscais emitidas no período
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <CircleDollarSign className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Relatório de Impostos</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Detalhamento dos impostos pagos e a pagar
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Análise Fiscal</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Análise detalhada da carga tributária por período
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <LineChart className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Evolução Tributária</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Gráficos e análises da evolução da carga tributária
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Obrigações Acessórias</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Relatório de obrigações acessórias e status de entrega
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Relatório para Contador</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Resumo mensal para envio ao contador externo
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <TrendingDown className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Impacto de Cortes na Contabilidade</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Análise do impacto dos cortes de faturamento nos resultados contábeis
                </p>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Recentes</CardTitle>
                <CardDescription>Últimos relatórios gerados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Relatório de Notas Fiscais - Março/2023</p>
                        <p className="text-xs text-muted-foreground">Gerado em 01/04/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Relatório de Impostos - 1º Trimestre/2023</p>
                        <p className="text-xs text-muted-foreground">Gerado em 31/03/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Análise Fiscal - Fevereiro/2023</p>
                        <p className="text-xs text-muted-foreground">Gerado em 05/03/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Relatório para Contador - Janeiro/2023</p>
                        <p className="text-xs text-muted-foreground">Gerado em 10/02/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageLayout>
    </SidebarLayout>
  )
}

