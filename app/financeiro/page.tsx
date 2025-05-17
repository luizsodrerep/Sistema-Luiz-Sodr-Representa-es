"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  CalendarIcon,
  Check,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Filter,
  LineChart,
  Plus,
  RefreshCw,
  Search,
  Trash,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

export default function FinanceiroPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAddReceita, setShowAddReceita] = useState(false)
  const [showAddDespesa, setShowAddDespesa] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("mes-atual")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")

  // Dados simulados
  const resumoFinanceiro = {
    saldoAtual: 45680.75,
    contasReceber: 28500.0,
    contasPagar: 12450.3,
    receitasMes: 32500.0,
    despesasMes: 18750.5,
    previsaoProximoMes: 42250.2,
  }

  const contasReceber = [
    {
      id: 1,
      descricao: "Comissão Descartáveis Premium",
      cliente: "Descartáveis Premium",
      valor: 5200.0,
      vencimento: "2023-04-15",
      status: "pendente",
      categoria: "comissao",
      origem: "vendas",
      documento: "NF-001",
    },
    {
      id: 2,
      descricao: "Comissão Embalagens Eco",
      cliente: "Embalagens Eco",
      valor: 3800.0,
      vencimento: "2023-04-15",
      status: "pendente",
      categoria: "comissao",
      origem: "vendas",
      documento: "NF-002",
    },
    {
      id: 3,
      descricao: "Consultoria ABC Ltda",
      cliente: "ABC Consultoria",
      valor: 2500.0,
      vencimento: "2023-03-10",
      status: "recebido",
      categoria: "servico",
      origem: "servicos",
      documento: "NF-005",
    },
    {
      id: 4,
      descricao: "Treinamento XYZ Corp",
      cliente: "XYZ Corporation",
      valor: 3800.0,
      vencimento: "2023-03-05",
      status: "recebido",
      categoria: "servico",
      origem: "servicos",
      documento: "NF-006",
    },
    {
      id: 7,
      descricao: "Comissão Descartáveis Premium",
      cliente: "Descartáveis Premium",
      valor: 4800.0,
      vencimento: "2023-02-15",
      status: "recebido",
      categoria: "comissao",
      origem: "vendas",
      documento: "NF-007",
    },
  ]

  const contasPagar = [
    {
      id: 1,
      descricao: "Aluguel Escritório",
      fornecedor: "Imobiliária Central",
      valor: 3500.0,
      vencimento: "2023-04-10",
      status: "pendente",
      categoria: "aluguel",
      comprovante: "boleto-001.pdf",
    },
    {
      id: 2,
      descricao: "Internet Empresarial",
      fornecedor: "Telecom Brasil",
      valor: 450.3,
      vencimento: "2023-04-15",
      status: "pendente",
      categoria: "servicos",
      comprovante: "fatura-001.pdf",
    },
    {
      id: 3,
      descricao: "Energia Elétrica",
      fornecedor: "Energia SA",
      valor: 680.5,
      vencimento: "2023-04-20",
      status: "pendente",
      categoria: "servicos",
      comprovante: "fatura-002.pdf",
    },
    {
      id: 4,
      descricao: "Salário Assistente",
      fornecedor: "Maria Silva",
      valor: 2800.0,
      vencimento: "2023-04-05",
      status: "pendente",
      categoria: "pessoal",
      comprovante: "holerite-001.pdf",
    },
    {
      id: 5,
      descricao: "Impostos NF Serviços",
      fornecedor: "Receita Federal",
      valor: 1450.0,
      vencimento: "2023-04-20",
      status: "pendente",
      categoria: "impostos",
      comprovante: "darf-001.pdf",
    },
    {
      id: 6,
      descricao: "Material de Escritório",
      fornecedor: "Papelaria Central",
      valor: 350.8,
      vencimento: "2023-03-15",
      status: "pago",
      categoria: "material",
      comprovante: "nf-001.pdf",
    },
    {
      id: 7,
      descricao: "Manutenção Ar Condicionado",
      fornecedor: "Refrigeração Ideal",
      valor: 280.0,
      vencimento: "2023-03-10",
      status: "pago",
      categoria: "servicos",
      comprovante: "recibo-001.pdf",
    },
  ]

  const fluxoCaixa = [
    { data: "01/03/2023", descricao: "Saldo Inicial", tipo: "saldo", valor: 38500.25 },
    { data: "05/03/2023", descricao: "Comissão Plásticos Nobre", tipo: "entrada", valor: 6200.0 },
    { data: "10/03/2023", descricao: "Consultoria ABC Ltda", tipo: "entrada", valor: 2500.0 },
    { data: "10/03/2023", descricao: "Aluguel Escritório", tipo: "saida", valor: 3500.0 },
    { data: "12/03/2023", descricao: "Material de Escritório", tipo: "saida", valor: 350.8 },
    { data: "15/03/2023", descricao: "Manutenção Ar Condicionado", tipo: "saida", valor: 280.0 },
    { data: "15/03/2023", descricao: "Internet Empresarial", tipo: "saida", valor: 450.3 },
    { data: "20/03/2023", descricao: "Treinamento XYZ Corp", tipo: "entrada", valor: 3800.0 },
    { data: "25/03/2023", descricao: "Energia Elétrica", tipo: "saida", valor: 680.5 },
    { data: "31/03/2023", descricao: "Saldo Final", tipo: "saldo", valor: 45738.65 },
  ]

  const categoriasDespesas = [
    { id: "aluguel", nome: "Aluguel", cor: "bg-blue-500", valor: 3500.0 },
    { id: "servicos", nome: "Serviços", cor: "bg-green-500", valor: 1410.8 },
    { id: "pessoal", nome: "Pessoal", cor: "bg-purple-500", valor: 2800.0 },
    { id: "impostos", nome: "Impostos", cor: "bg-red-500", valor: 1450.0 },
    { id: "material", nome: "Material", cor: "bg-yellow-500", valor: 350.8 },
    { id: "outros", nome: "Outros", cor: "bg-gray-500", valor: 0.0 },
  ]

  const categoriasReceitas = [
    { id: "comissao", nome: "Comissões", cor: "bg-emerald-500", valor: 16200.0 },
    { id: "servico", nome: "Serviços", cor: "bg-blue-500", valor: 6300.0 },
    { id: "outros", nome: "Outros", cor: "bg-gray-500", valor: 0.0 },
  ]

  // Funções
  const handleAddReceita = () => {
    toast({
      title: "Receita adicionada com sucesso!",
      description: "A nova receita foi registrada no sistema.",
    })
    setShowAddReceita(false)
  }

  const handleAddDespesa = () => {
    toast({
      title: "Despesa adicionada com sucesso!",
      description: "A nova despesa foi registrada no sistema.",
    })
    setShowAddDespesa(false)
  }

  const handlePagarConta = (id: number) => {
    toast({
      title: "Pagamento registrado!",
      description: "O pagamento foi registrado com sucesso.",
    })
  }

  const handleReceberConta = (id: number) => {
    toast({
      title: "Recebimento registrado!",
      description: "O recebimento foi registrado com sucesso.",
    })
  }

  const filtrarContas = (contas: any[], status: string) => {
    if (status === "todos") return contas
    return contas.filter((conta) => conta.status === status)
  }

  return (
    <SidebarLayout>
      <PageLayout title="Financeiro">
        {/* Botões de navegação */}
        {/* <NavigationButtons backLabel="Voltar" backHref="/dashboard" /> */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {resumoFinanceiro.saldoAtual.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {resumoFinanceiro.contasReceber.toFixed(2)}</div>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 ml-1">+12% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {resumoFinanceiro.contasPagar.toFixed(2)}</div>
              <div className="flex items-center pt-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500 ml-1">-5% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Previsão Próximo Mês</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {resumoFinanceiro.previsaoProximoMes.toFixed(2)}</div>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 ml-1">Saldo previsto para o próximo mês</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Fluxo de Caixa</CardTitle>
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
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">
                  Receitas: R$ {resumoFinanceiro.receitasMes.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-muted-foreground">
                  Despesas: R$ {resumoFinanceiro.despesasMes.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">
                  Saldo: R$ {(resumoFinanceiro.receitasMes - resumoFinanceiro.despesasMes).toFixed(2)}
                </span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendário Financeiro</CardTitle>
              <CardDescription>Vencimentos e recebimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} className="rounded-md border" />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 border-t px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs">5 contas a pagar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs">3 contas a receber</span>
              </div>
              <Link href="/financeiro/calendario" className="text-xs text-primary hover:underline">
                Ver calendário completo
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="contas-receber" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
            <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="fluxo-caixa">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="contas-receber" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar conta..." className="w-full md:w-[250px] pl-8" />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="recebido">Recebidos</SelectItem>
                    <SelectItem value="atrasado">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="comissao">Comissões</SelectItem>
                    <SelectItem value="servico">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Componente de importação/exportação de planilhas */}
                <SpreadsheetHandler moduleType="financeiro" />

                <Dialog open={showAddReceita} onOpenChange={setShowAddReceita}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Nova Receita</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Receita</DialogTitle>
                      <DialogDescription>Preencha os dados da nova receita a ser registrada.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input id="descricao" placeholder="Descrição da receita" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="valor">Valor (R$)</Label>
                          <Input id="valor" type="number" step="0.01" min="0" placeholder="0,00" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="data-vencimento">Data de Vencimento</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select>
                            <SelectTrigger id="categoria">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comissao">Comissão</SelectItem>
                              <SelectItem value="servico">Serviço</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cliente">Cliente/Origem</Label>
                          <Select>
                            <SelectTrigger id="cliente">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="descartaveis-premium">Descartáveis Premium</SelectItem>
                              <SelectItem value="embalagens-eco">Embalagens Eco</SelectItem>
                              <SelectItem value="papel-cia">Papel & Cia</SelectItem>
                              <SelectItem value="plasticos-nobre">Plásticos Nobre</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="documento">Documento/NF</Label>
                        <Input id="documento" placeholder="Número do documento ou NF" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input id="observacoes" placeholder="Observações adicionais" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddReceita(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddReceita}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cliente/Origem</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrarContas(contasReceber, filtroStatus).map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell>
                          <Link
                            href={`/representadas/${conta.cliente.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-primary hover:underline"
                          >
                            {conta.cliente}
                          </Link>
                        </TableCell>
                        <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(conta.vencimento), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              conta.status === "pendente" && "border-yellow-500 text-yellow-500",
                              conta.status === "recebido" && "border-green-500 text-green-500",
                              conta.status === "atrasado" && "border-red-500 text-red-500",
                            )}
                          >
                            {conta.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              conta.categoria === "comissao" && "bg-emerald-100 text-emerald-800",
                              conta.categoria === "servico" && "bg-blue-100 text-blue-800",
                              conta.categoria === "outros" && "bg-gray-100 text-gray-800",
                            )}
                          >
                            {conta.categoria === "comissao"
                              ? "Comissão"
                              : conta.categoria === "servico"
                                ? "Serviço"
                                : "Outro"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {conta.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => handleReceberConta(conta.id)}
                              >
                                <Check className="h-3 w-3" />
                                <span>Receber</span>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
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
                  Mostrando {filtrarContas(contasReceber, filtroStatus).length} de {contasReceber.length} contas
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
                  <CardTitle className="text-sm">Receitas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoriasReceitas.map((categoria) => (
                      <div key={categoria.id} className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${categoria.cor} mr-2`} />
                        <div className="flex-1 text-sm">{categoria.nome}</div>
                        <div className="font-medium">R$ {categoria.valor.toFixed(2)}</div>
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
                  <CardTitle className="text-sm">Próximos Recebimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contasReceber
                      .filter((conta) => conta.status === "pendente")
                      .slice(0, 4)
                      .map((conta) => (
                        <div key={conta.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{conta.descricao}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conta.vencimento), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="text-sm font-medium">R$ {conta.valor.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                  <Button variant="link" className="mt-4 h-8 p-0 text-xs">
                    Ver todos os recebimentos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contas-pagar" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar conta..." className="w-full md:w-[250px] pl-8" />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="atrasado">Atrasados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="aluguel">Aluguel</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                    <SelectItem value="impostos">Impostos</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Componente de importação/exportação de planilhas */}
                <SpreadsheetHandler moduleType="financeiro" />

                <Dialog open={showAddDespesa} onOpenChange={setShowAddDespesa}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Nova Despesa</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                      <DialogDescription>Preencha os dados da nova despesa a ser registrada.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="descricao-despesa">Descrição</Label>
                        <Input id="descricao-despesa" placeholder="Descrição da despesa" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="valor-despesa">Valor (R$)</Label>
                          <Input id="valor-despesa" type="number" step="0.01" min="0" placeholder="0,00" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="data-vencimento-despesa">Data de Vencimento</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="categoria-despesa">Categoria</Label>
                          <Select>
                            <SelectTrigger id="categoria-despesa">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aluguel">Aluguel</SelectItem>
                              <SelectItem value="servicos">Serviços</SelectItem>
                              <SelectItem value="pessoal">Pessoal</SelectItem>
                              <SelectItem value="impostos">Impostos</SelectItem>
                              <SelectItem value="material">Material</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fornecedor">Fornecedor</Label>
                          <Input id="fornecedor" placeholder="Nome do fornecedor" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="comprovante">Comprovante</Label>
                        <Input id="comprovante" type="file" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="observacoes-despesa">Observações</Label>
                        <Input id="observacoes-despesa" placeholder="Observações adicionais" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDespesa(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddDespesa}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtrarContas(contasPagar, filtroStatus).map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell>{conta.fornecedor}</TableCell>
                        <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(conta.vencimento), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              conta.status === "pendente" && "border-yellow-500 text-yellow-500",
                              conta.status === "pago" && "border-green-500 text-green-500",
                              conta.status === "atrasado" && "border-red-500 text-red-500",
                            )}
                          >
                            {conta.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              conta.categoria === "aluguel" && "bg-blue-100 text-blue-800",
                              conta.categoria === "servicos" && "bg-green-100 text-green-800",
                              conta.categoria === "pessoal" && "bg-purple-100 text-purple-800",
                              conta.categoria === "impostos" && "bg-red-100 text-red-800",
                              conta.categoria === "material" && "bg-yellow-100 text-yellow-800",
                              conta.categoria === "outros" && "bg-gray-100 text-gray-800",
                            )}
                          >
                            {conta.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {conta.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => handlePagarConta(conta.id)}
                              >
                                <Check className="h-3 w-3" />
                                <span>Pagar</span>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
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
                  Mostrando {filtrarContas(contasPagar, filtroStatus).length} de {contasPagar.length} contas
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
                  <CardTitle className="text-sm">Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoriasDespesas.map((categoria) => (
                      <div key={categoria.id} className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${categoria.cor} mr-2`} />
                        <div className="flex-1 text-sm">{categoria.nome}</div>
                        <div className="font-medium">R$ {categoria.valor.toFixed(2)}</div>
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
                  <CardTitle className="text-sm">Próximos Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contasPagar
                      .filter((conta) => conta.status === "pendente")
                      .slice(0, 4)
                      .map((conta) => (
                        <div key={conta.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{conta.descricao}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conta.vencimento), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="text-sm font-medium">R$ {conta.valor.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                  <Button variant="link" className="mt-4 h-8 p-0 text-xs">
                    Ver todos os pagamentos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fluxo-caixa" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes-atual">Mês Atual</SelectItem>
                    <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                    <SelectItem value="ultimos-3-meses">Últimos 3 Meses</SelectItem>
                    <SelectItem value="ano-atual">Ano Atual</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {/* Componente de importação/exportação de planilhas */}
                <SpreadsheetHandler moduleType="financeiro" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa - Março/2023</CardTitle>
                <CardDescription>Movimentações financeiras do período</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fluxoCaixa.map((movimento, index) => {
                      // Calcular saldo acumulado
                      let saldoAcumulado = 0
                      for (let i = 0; i <= index; i++) {
                        if (fluxoCaixa[i].tipo === "entrada") {
                          saldoAcumulado += fluxoCaixa[i].valor
                        } else if (fluxoCaixa[i].tipo === "saida") {
                          saldoAcumulado -= fluxoCaixa[i].valor
                        } else if (fluxoCaixa[i].tipo === "saldo" && i === 0) {
                          saldoAcumulado = fluxoCaixa[i].valor
                        }
                      }

                      return (
                        <TableRow key={index}>
                          <TableCell>{movimento.data}</TableCell>
                          <TableCell className="font-medium">{movimento.descricao}</TableCell>
                          <TableCell>
                            {movimento.tipo === "entrada" ? (
                              <Badge className="bg-green-100 text-green-800">Entrada</Badge>
                            ) : movimento.tipo === "saida" ? (
                              <Badge className="bg-red-100 text-red-800">Saída</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">Saldo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {movimento.tipo === "entrada" ? (
                              <span className="text-green-600">+R$ {movimento.valor.toFixed(2)}</span>
                            ) : movimento.tipo === "saida" ? (
                              <span className="text-red-600">-R$ {movimento.valor.toFixed(2)}</span>
                            ) : (
                              <span>R$ {movimento.valor.toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R${" "}
                            {movimento.tipo === "saldo" && index === fluxoCaixa.length - 1
                              ? movimento.valor.toFixed(2)
                              : saldoAcumulado.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Saldo</CardTitle>
                  <CardDescription>Saldo ao longo do período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <LineChart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entradas vs Saídas</CardTitle>
                  <CardDescription>Comparativo do período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <CircleDollarSign className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Demonstrativo de Resultados</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Relatório completo de receitas, despesas e lucro do período
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Análise de Receitas</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Detalhamento das receitas por categoria e origem
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <TrendingDown className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Análise de Despesas</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Detalhamento das despesas por categoria e fornecedor
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <LineChart className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Fluxo de Caixa Projetado</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Projeção de entradas e saídas para os próximos meses
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <Clock className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Aging de Contas</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Análise de contas a receber e a pagar por tempo de vencimento
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <h3 className="text-lg font-medium">Relatório Fiscal</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Resumo de impostos e obrigações fiscais do período
                </p>
              </Card>
            </div>

            <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingDown className="h-10 w-10 text-primary mb-2" />
              <h3 className="text-lg font-medium">Análise de Perdas por Cortes</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Relatório detalhado das perdas por cortes nos faturamentos das representadas
              </p>
            </Card>

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
                        <p className="text-sm font-medium">Demonstrativo de Resultados - Março/2023</p>
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
                        <p className="text-sm font-medium">Fluxo de Caixa - 1º Trimestre/2023</p>
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
                        <p className="text-sm font-medium">Análise de Despesas - Fevereiro/2023</p>
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
                        <p className="text-sm font-medium">Relatório Fiscal - Janeiro/2023</p>
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

