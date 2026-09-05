"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertCircle,
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
  Wallet,
} from "lucide-react"

import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type StatusNota = "emitida" | "paga" | "cancelada"
type TipoNota = "servico" | "produto"

type NotaFiscal = {
  id: number
  numero: string
  tipo: TipoNota
  parteRelacionada: string
  destino?: string
  valor: number
  emissao: string
  vencimento?: string
  status: StatusNota
  arquivo?: string
}

type StatusImposto = "pendente" | "pago" | "atrasado"

type Imposto = {
  id: number
  tipo: string
  aliquota?: string
  baseCalculo?: number
  valor: number
  vencimento: string
  status: StatusImposto
  notaFiscal?: string
}

type ObrigacaoFiscal = {
  id: number
  obrigacao: string
  vencimento: string
  referencia?: string
  status: StatusImposto
  valor?: number
}

type RelatorioRecente = {
  id: number
  nome: string
  geradoEm: string
}

/*
 * REGRA REAL ATUAL INFORMADA PELO ESCRITÓRIO:
 *
 * Atualmente é considerado 6% sobre o valor das notas emitidas
 * para as representadas.
 *
 * Esta regra NÃO representa toda a composição fiscal definitiva.
 * Outros impostos, obrigações e custos contábeis serão cadastrados
 * posteriormente, somente com informações reais fornecidas pela
 * contabilidade.
 */
const ALIQUOTA_ATUAL_SOBRE_NOTAS = 0.06

/*
 * Não preencher estes arrays com exemplos, estimativas ou dados fictícios.
 * Eles deverão receber somente dados contábeis reais quando houver
 * integração ou cadastro efetivamente implementado.
 */
const notasFiscais: NotaFiscal[] = []
const impostos: Imposto[] = []
const calendarioFiscal: ObrigacaoFiscal[] = []
const relatoriosRecentes: RelatorioRecente[] = []

const relatoriosDisponiveis = [
  {
    titulo: "Relatório de Notas Fiscais",
    descricao: "Relatório completo de notas fiscais emitidas no período",
    icone: FileText,
  },
  {
    titulo: "Relatório de Impostos",
    descricao: "Detalhamento dos impostos pagos e a pagar",
    icone: CircleDollarSign,
  },
  {
    titulo: "Análise Fiscal",
    descricao: "Análise detalhada da carga tributária por período",
    icone: BarChart3,
  },
  {
    titulo: "Evolução Tributária",
    descricao: "Gráficos e análises da evolução da carga tributária",
    icone: LineChart,
  },
  {
    titulo: "Obrigações Acessórias",
    descricao: "Relatório de obrigações acessórias e status de entrega",
    icone: FileCheck,
  },
  {
    titulo: "Relatório para Contador",
    descricao: "Resumo mensal para envio ao contador externo",
    icone: Wallet,
  },
  {
    titulo: "Impacto de Cortes na Contabilidade",
    descricao:
      "Análise do impacto dos cortes de faturamento nos resultados contábeis",
    icone: TrendingDown,
  },
]

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

function formatarData(valor: string) {
  return format(new Date(`${valor}T12:00:00`), "dd/MM/yyyy")
}

function calcularRegraAtualSobreNota(valor: number) {
  return valor * ALIQUOTA_ATUAL_SOBRE_NOTAS
}

export default function ContabilidadePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const [buscaNotas, setBuscaNotas] = useState("")
  const [filtroStatusNotas, setFiltroStatusNotas] = useState("todos")
  const [filtroTipoNotas, setFiltroTipoNotas] = useState("todos")

  const [buscaImpostos, setBuscaImpostos] = useState("")
  const [filtroStatusImpostos, setFiltroStatusImpostos] =
    useState("todos")
  const [filtroTipoImpostos, setFiltroTipoImpostos] =
    useState("todos")

  const [filtroPeriodo, setFiltroPeriodo] = useState("mes-atual")

  const informarIntegracaoPendente = (funcionalidade: string) => {
    toast({
      title: `${funcionalidade} preservada`,
      description:
        "A funcionalidade permanece disponível na interface, mas ainda não possui integração contábil real. Nenhum dado foi gravado.",
    })
  }

  const handleAddNF = () => {
    informarIntegracaoPendente("Nova nota fiscal")
  }

  const handleAddImposto = () => {
    informarIntegracaoPendente("Novo imposto")
  }

  const handlePagarImposto = () => {
    informarIntegracaoPendente("Pagamento de imposto")
  }

  const notasFiltradas = useMemo(() => {
    const termo = buscaNotas.trim().toLowerCase()

    return notasFiscais.filter((nota) => {
      const correspondeBusca =
        !termo ||
        nota.numero.toLowerCase().includes(termo) ||
        nota.parteRelacionada.toLowerCase().includes(termo)

      const correspondeStatus =
        filtroStatusNotas === "todos" ||
        nota.status === filtroStatusNotas

      const correspondeTipo =
        filtroTipoNotas === "todos" ||
        nota.tipo === filtroTipoNotas

      return correspondeBusca && correspondeStatus && correspondeTipo
    })
  }, [buscaNotas, filtroStatusNotas, filtroTipoNotas])

  const impostosFiltrados = useMemo(() => {
    const termo = buscaImpostos.trim().toLowerCase()

    return impostos.filter((imposto) => {
      const correspondeBusca =
        !termo ||
        imposto.tipo.toLowerCase().includes(termo) ||
        imposto.notaFiscal?.toLowerCase().includes(termo)

      const correspondeStatus =
        filtroStatusImpostos === "todos" ||
        imposto.status === filtroStatusImpostos

      const correspondeTipo =
        filtroTipoImpostos === "todos" ||
        imposto.tipo === filtroTipoImpostos

      return correspondeBusca && correspondeStatus && correspondeTipo
    })
  }, [buscaImpostos, filtroStatusImpostos, filtroTipoImpostos])

  const proximosVencimentos = calendarioFiscal
    .filter((obrigacao) => obrigacao.status === "pendente")
    .slice(0, 4)

  const totalNotas =
    notasFiscais.length > 0
      ? notasFiscais.reduce((total, nota) => total + nota.valor, 0)
      : null

  const totalRegraAtual =
    totalNotas !== null
      ? calcularRegraAtualSobreNota(totalNotas)
      : null

  return (
    <PageLayout title="Contabilidade">
      <NavigationButtons backLabel="Voltar" backHref="/dashboard" />

      <div className="mb-4 rounded-md border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />

          <div>
            <p className="font-medium">
              Contabilidade com regra fiscal atual preservada
            </p>

            <p className="text-sm text-muted-foreground">
              Regra atual informada: 6% sobre o valor das notas
              emitidas para as representadas. Demais impostos,
              obrigações e custos contábeis serão acrescentados
              posteriormente somente com informações reais da
              contabilidade.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notas Emitidas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {notasFiscais.length > 0
                ? notasFiscais.length
                : "—"}
            </div>

            <p className="text-xs text-muted-foreground">
              {notasFiscais.length > 0
                ? "Notas fiscais cadastradas"
                : "Sem notas reais integradas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalNotas !== null
                ? formatarMoeda(totalNotas)
                : "—"}
            </div>

            <p className="text-xs text-muted-foreground">
              {totalNotas !== null
                ? "Valor das notas cadastradas"
                : "Sem faturamento contábil integrado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Regra Atual sobre NFs
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">6%</div>

            <p className="text-xs text-muted-foreground">
              Sobre notas emitidas
            </p>

            {totalRegraAtual !== null && (
              <p className="mt-1 text-xs font-medium">
                {formatarMoeda(totalRegraAtual)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notas Pendentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">—</div>

            <p className="text-xs text-muted-foreground">
              Sem dados reais integrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Impostos a Vencer
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">—</div>

            <p className="text-xs text-muted-foreground">
              Sem calendário fiscal real integrado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Impostos por Período</CardTitle>

              <div className="flex gap-2">
                <Select
                  value={filtroPeriodo}
                  onValueChange={setFiltroPeriodo}
                >
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="mes-atual">
                      Mês Atual
                    </SelectItem>
                    <SelectItem value="mes-anterior">
                      Mês Anterior
                    </SelectItem>
                    <SelectItem value="ultimos-3-meses">
                      Últimos 3 Meses
                    </SelectItem>
                    <SelectItem value="ano-atual">
                      Ano Atual
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() =>
                    informarIntegracaoPendente(
                      "Exportação do gráfico de impostos",
                    )
                  }
                >
                  <Download className="h-3 w-3" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="h-[220px] w-full">
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md bg-muted/20">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />

                <span className="text-center text-sm text-muted-foreground">
                  Regra atual de 6% configurada. O gráfico será
                  alimentado quando houver notas e demais informações
                  fiscais reais.
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Regra atual confirmada: 6% sobre o valor das notas
              emitidas. Demais componentes fiscais ainda não
              cadastrados.
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendário Fiscal</CardTitle>
            <CardDescription>
              Vencimentos e obrigações fiscais
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-2 border-t px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Nenhuma obrigação fiscal real integrada.
            </span>

            <Link
              href="/contabilidade/calendario"
              className="text-xs text-primary hover:underline"
            >
              Ver calendário completo
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="notas-fiscais" className="mt-4">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="notas-fiscais">
            Notas Fiscais
          </TabsTrigger>
          <TabsTrigger value="impostos">
            Impostos
          </TabsTrigger>
          <TabsTrigger value="calendario-fiscal">
            Calendário Fiscal
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notas-fiscais" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                <Input
                  type="search"
                  value={buscaNotas}
                  onChange={(event) =>
                    setBuscaNotas(event.target.value)
                  }
                  placeholder="Buscar nota fiscal..."
                  className="w-full pl-8 md:w-[250px]"
                />
              </div>

              <Select
                value={filtroStatusNotas}
                onValueChange={setFiltroStatusNotas}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">
                    Todos os Status
                  </SelectItem>
                  <SelectItem value="emitida">
                    Emitidas
                  </SelectItem>
                  <SelectItem value="paga">
                    Pagas
                  </SelectItem>
                  <SelectItem value="cancelada">
                    Canceladas
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filtroTipoNotas}
                onValueChange={setFiltroTipoNotas}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">
                    Todos os Tipos
                  </SelectItem>
                  <SelectItem value="servico">
                    Serviço
                  </SelectItem>
                  <SelectItem value="produto">
                    Produto
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Filtros de notas fiscais"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <SpreadsheetHandler moduleType="contabilidade" />

              <Button className="gap-1" onClick={handleAddNF}>
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
                    <TableHead>
                      Cliente/Representada
                    </TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Regra Atual (6%)</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {notasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nenhuma nota fiscal real integrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    notasFiltradas.map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-medium">
                          {nota.numero}
                        </TableCell>

                        <TableCell>
                          {nota.destino ? (
                            <Link
                              href={nota.destino}
                              className="text-primary hover:underline"
                            >
                              {nota.parteRelacionada}
                            </Link>
                          ) : (
                            nota.parteRelacionada
                          )}
                        </TableCell>

                        <TableCell>
                          {formatarMoeda(nota.valor)}
                        </TableCell>

                        <TableCell>
                          {formatarMoeda(
                            calcularRegraAtualSobreNota(
                              nota.valor,
                            ),
                          )}
                        </TableCell>

                        <TableCell>
                          {formatarData(nota.emissao)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              nota.status === "emitida" &&
                                "border-yellow-500 text-yellow-500",
                              nota.status === "paga" &&
                                "border-green-500 text-green-500",
                              nota.status === "cancelada" &&
                                "border-red-500 text-red-500",
                            )}
                          >
                            {nota.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Visualização da nota fiscal",
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Download da nota fiscal",
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Exclusão da nota fiscal",
                                )
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="border-t px-6 py-3">
              <div className="text-xs text-muted-foreground">
                {notasFiscais.length === 0
                  ? "Sem notas fiscais reais integradas."
                  : `Mostrando ${notasFiltradas.length} de ${notasFiscais.length} notas fiscais.`}
              </div>
            </CardFooter>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Notas Fiscais por Cliente
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-[200px] w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md bg-muted/20">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Gráfico preservado — aguardando notas reais
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Últimas Notas Emitidas
                </CardTitle>
              </CardHeader>

              <CardContent>
                {notasFiscais.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nenhuma nota fiscal real integrada.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notasFiscais
                      .filter(
                        (nota) => nota.status === "emitida",
                      )
                      .slice(0, 4)
                      .map((nota) => (
                        <div
                          key={nota.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {nota.numero} -{" "}
                              {nota.parteRelacionada}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {formatarData(nota.emissao)}
                            </span>
                          </div>

                          <div className="text-sm font-medium">
                            {formatarMoeda(nota.valor)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <Button
                  variant="link"
                  className="mt-4 h-8 p-0 text-xs"
                  onClick={() =>
                    informarIntegracaoPendente(
                      "Consulta completa de notas fiscais",
                    )
                  }
                >
                  Ver todas as notas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impostos" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                <Input
                  type="search"
                  value={buscaImpostos}
                  onChange={(event) =>
                    setBuscaImpostos(event.target.value)
                  }
                  placeholder="Buscar imposto..."
                  className="w-full pl-8 md:w-[250px]"
                />
              </div>

              <Select
                value={filtroStatusImpostos}
                onValueChange={setFiltroStatusImpostos}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">
                    Todos os Status
                  </SelectItem>
                  <SelectItem value="pendente">
                    Pendentes
                  </SelectItem>
                  <SelectItem value="pago">
                    Pagos
                  </SelectItem>
                  <SelectItem value="atrasado">
                    Atrasados
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filtroTipoImpostos}
                onValueChange={setFiltroTipoImpostos}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">
                    Todos os Tipos
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Filtros de impostos"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <SpreadsheetHandler moduleType="contabilidade" />

              <Button
                className="gap-1"
                onClick={handleAddImposto}
              >
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
                    <TableHead className="text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {impostosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nenhum imposto adicional real integrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    impostosFiltrados.map((imposto) => (
                      <TableRow key={imposto.id}>
                        <TableCell className="font-medium">
                          {imposto.tipo}
                        </TableCell>

                        <TableCell>
                          {imposto.aliquota || "—"}
                        </TableCell>

                        <TableCell>
                          {typeof imposto.baseCalculo === "number"
                            ? formatarMoeda(
                                imposto.baseCalculo,
                              )
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {formatarMoeda(imposto.valor)}
                        </TableCell>

                        <TableCell>
                          {formatarData(imposto.vencimento)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              imposto.status === "pendente" &&
                                "border-yellow-500 text-yellow-500",
                              imposto.status === "pago" &&
                                "border-green-500 text-green-500",
                              imposto.status === "atrasado" &&
                                "border-red-500 text-red-500",
                            )}
                          >
                            {imposto.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {imposto.notaFiscal || "—"}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {imposto.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={handlePagarImposto}
                              >
                                <Check className="h-3 w-3" />
                                <span>Pagar</span>
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Documento do imposto",
                                )
                              }
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="border-t px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Regra atual de 6% sobre notas emitidas já está
                registrada no módulo. A tabela acima será usada para
                outros impostos reais que forem posteriormente
                informados pela contabilidade.
              </div>
            </CardFooter>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Composição Tributária
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Regra atual sobre notas emitidas
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Regra real informada pelo escritório
                      </p>
                    </div>

                    <div className="text-lg font-bold">
                      6%
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Outros impostos e custos contábeis ainda não
                  cadastrados.
                </div>

                <div className="mt-4 h-[120px] w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md bg-muted/20">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Gráfico aguardando composição fiscal completa
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>

              <CardContent>
                {proximosVencimentos.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nenhum vencimento fiscal real integrado.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proximosVencimentos.map(
                      (obrigacao) => (
                        <div
                          key={obrigacao.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {obrigacao.obrigacao}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              Vencimento:{" "}
                              {formatarData(
                                obrigacao.vencimento,
                              )}
                            </span>
                          </div>

                          <div className="text-sm font-medium">
                            {typeof obrigacao.valor === "number"
                              ? formatarMoeda(
                                  obrigacao.valor,
                                )
                              : "—"}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <Button
                  variant="link"
                  className="mt-4 h-8 p-0 text-xs"
                  asChild
                >
                  <Link href="/contabilidade/calendario">
                    Ver todos os vencimentos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="calendario-fiscal"
          className="space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row">
              <Select
                value={filtroPeriodo}
                onValueChange={setFiltroPeriodo}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="mes-atual">
                    Mês Atual
                  </SelectItem>
                  <SelectItem value="mes-anterior">
                    Mês Anterior
                  </SelectItem>
                  <SelectItem value="proximo-mes">
                    Próximo Mês
                  </SelectItem>
                  <SelectItem value="ano-atual">
                    Ano Atual
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() =>
                  informarIntegracaoPendente(
                    "Atualização do calendário fiscal",
                  )
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-1"
                onClick={() =>
                  informarIntegracaoPendente(
                    "Impressão do calendário fiscal",
                  )
                }
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir</span>
              </Button>

              <Button
                variant="outline"
                className="gap-1"
                onClick={() =>
                  informarIntegracaoPendente(
                    "Exportação do calendário fiscal",
                  )
                }
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calendário Fiscal</CardTitle>
              <CardDescription>
                Obrigações fiscais e tributárias do período
              </CardDescription>
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
                    <TableHead className="text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {calendarioFiscal.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nenhuma obrigação fiscal real integrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    calendarioFiscal.map((obrigacao) => (
                      <TableRow key={obrigacao.id}>
                        <TableCell className="font-medium">
                          {obrigacao.obrigacao}
                        </TableCell>

                        <TableCell>
                          {formatarData(
                            obrigacao.vencimento,
                          )}
                        </TableCell>

                        <TableCell>
                          {obrigacao.referencia || "—"}
                        </TableCell>

                        <TableCell>
                          {typeof obrigacao.valor === "number"
                            ? formatarMoeda(
                                obrigacao.valor,
                              )
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              obrigacao.status === "pendente" &&
                                "border-yellow-500 text-yellow-500",
                              obrigacao.status === "pago" &&
                                "border-green-500 text-green-500",
                              obrigacao.status === "atrasado" &&
                                "border-red-500 text-red-500",
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
                                onClick={handlePagarImposto}
                              >
                                <Check className="h-3 w-3" />
                                <span>Pagar</span>
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Documento da obrigação fiscal",
                                )
                              }
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visão Anual</CardTitle>
                <CardDescription>
                  Obrigações fiscais do ano
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[250px] w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md bg-muted/20">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />

                    <span className="text-sm text-muted-foreground">
                      Visão anual preservada — aguardando dados reais
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Lembretes Importantes
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="rounded-md border border-dashed p-6 text-center">
                  <AlertCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    Nenhum lembrete fiscal real cadastrado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {relatoriosDisponiveis.map((relatorio) => {
              const Icone = relatorio.icone

              return (
                <Card
                  key={relatorio.titulo}
                  className="flex cursor-pointer flex-col items-center justify-center p-6 transition-colors hover:bg-muted/50"
                  onClick={() =>
                    informarIntegracaoPendente(
                      relatorio.titulo,
                    )
                  }
                >
                  <Icone className="mb-2 h-10 w-10 text-primary" />

                  <h3 className="text-center text-lg font-medium">
                    {relatorio.titulo}
                  </h3>

                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {relatorio.descricao}
                  </p>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>

              <CardDescription>
                Últimos relatórios contábeis efetivamente gerados
              </CardDescription>
            </CardHeader>

            <CardContent>
              {relatoriosRecentes.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhum relatório contábil real foi gerado ou
                  integrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {relatoriosRecentes.map((relatorio) => (
                    <div
                      key={relatorio.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />

                        <div>
                          <p className="text-sm font-medium">
                            {relatorio.nome}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Gerado em{" "}
                            {formatarData(
                              relatorio.geradoEm,
                            )}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() =>
                          informarIntegracaoPendente(
                            "Download do relatório contábil",
                          )
                        }
                      >
                        <Download className="h-3 w-3" />
                        <span>Baixar</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}