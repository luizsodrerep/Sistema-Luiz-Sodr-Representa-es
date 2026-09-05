"use client"

import { useState } from "react"
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
} from "date-fns"
import { ptBR } from "date-fns/locale"
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

import { NavigationButtons } from "@/components/navigation-buttons"
import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type TipoObrigacao = "imposto" | "declaracao"
type StatusObrigacao = "pendente" | "pago" | "enviado"

type ObrigacaoFiscal = {
  id: number
  nome: string
  vencimento: Date
  valor?: number
  status: StatusObrigacao
  tipo: TipoObrigacao
  descricao?: string
}

type DocumentoFiscal = {
  id: number
  nome: string
  arquivo?: string
}

/*
 * Não preencher estas estruturas com exemplos, estimativas ou
 * obrigações tributárias presumidas.
 *
 * Elas deverão receber somente dados fiscais reais quando houver
 * integração ou cadastro contábil efetivamente implementado.
 */
const obrigacoesFiscais: ObrigacaoFiscal[] = []
const documentosFiscais: DocumentoFiscal[] = []

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

export default function CalendarioFiscalPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [filtroTipo, setFiltroTipo] = useState("todos")

  const informarIntegracaoPendente = (funcionalidade: string) => {
    toast({
      title: `${funcionalidade} preservada`,
      description:
        "A funcionalidade está mantida, mas ainda não possui integração fiscal real. Nenhum dado foi gravado ou alterado.",
    })
  }

  const getObrigacoesDoMes = () => {
    return obrigacoesFiscais.filter(
      (obrigacao) =>
        obrigacao.vencimento.getMonth() === month.getMonth() &&
        obrigacao.vencimento.getFullYear() === month.getFullYear(),
    )
  }

  const getObrigacoesDoDia = (dia: Date | undefined) => {
    if (!dia) {
      return []
    }

    return obrigacoesFiscais.filter((obrigacao) =>
      isSameDay(obrigacao.vencimento, dia),
    )
  }

  const getStatusDia = (dia: Date | undefined) => {
    if (!dia) {
      return null
    }

    const obrigacoesNoDia = obrigacoesFiscais.filter((obrigacao) =>
      isSameDay(obrigacao.vencimento, dia),
    )

    if (obrigacoesNoDia.length === 0) {
      return null
    }

    const atrasados = obrigacoesNoDia.some(
      (obrigacao) =>
        obrigacao.status === "pendente" &&
        isBefore(obrigacao.vencimento, new Date()),
    )

    if (atrasados) {
      return "atrasado"
    }

    const pendentes = obrigacoesNoDia.some(
      (obrigacao) => obrigacao.status === "pendente",
    )

    if (pendentes) {
      return "pendente"
    }

    return "concluido"
  }

  const datasUnicas = obrigacoesFiscais.filter(
    (obrigacao, index, lista) =>
      lista.findIndex((item) =>
        isSameDay(item.vencimento, obrigacao.vencimento),
      ) === index,
  )

  const diasAtrasados = datasUnicas
    .filter(
      (obrigacao) =>
        getStatusDia(obrigacao.vencimento) === "atrasado",
    )
    .map((obrigacao) => obrigacao.vencimento)

  const diasPendentes = datasUnicas
    .filter(
      (obrigacao) =>
        getStatusDia(obrigacao.vencimento) === "pendente",
    )
    .map((obrigacao) => obrigacao.vencimento)

  const diasConcluidos = datasUnicas
    .filter(
      (obrigacao) =>
        getStatusDia(obrigacao.vencimento) === "concluido",
    )
    .map((obrigacao) => obrigacao.vencimento)

  const concluirObrigacao = (obrigacao: ObrigacaoFiscal) => {
    informarIntegracaoPendente(
      obrigacao.tipo === "imposto"
        ? "Pagamento de obrigação fiscal"
        : "Envio de declaração",
    )
  }

  const obrigacoesDoMes = getObrigacoesDoMes()

  const obrigacoesFiltradasDoMes = obrigacoesDoMes.filter(
    (obrigacao) =>
      filtroTipo === "todos" || obrigacao.tipo === filtroTipo,
  )

  const obrigacoesDoDia = getObrigacoesDoDia(date)

  const proximosVencimentos = obrigacoesFiscais
    .filter(
      (obrigacao) =>
        obrigacao.status === "pendente" &&
        isAfter(obrigacao.vencimento, new Date()),
    )
    .sort(
      (a, b) =>
        a.vencimento.getTime() - b.vencimento.getTime(),
    )
    .slice(0, 5)

  return (
    <PageLayout title="Calendário Fiscal">
      <NavigationButtons
        backLabel="Voltar para Contabilidade"
        backHref="/contabilidade"
      />

      <div className="mb-4 rounded-md border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />

          <div>
            <p className="font-medium">
              Calendário fiscal sem dados simulados
            </p>

            <p className="text-sm text-muted-foreground">
              Datas, obrigações, declarações, valores e documentos
              aparecerão aqui somente quando houver dados fiscais
              reais integrados ou cadastrados.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>
                  Calendário de Obrigações Fiscais
                </CardTitle>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMonth(
                        new Date(
                          month.getFullYear(),
                          month.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
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
                    size="sm"
                    onClick={() =>
                      setMonth(
                        new Date(
                          month.getFullYear(),
                          month.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    aria-label="Próximo mês"
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
                onSelect={(novaData) => {
                  if (novaData) {
                    setDate(novaData)
                  }
                }}
                month={month}
                onMonthChange={setMonth}
                locale={ptBR}
                className="rounded-md border"
                modifiers={{
                  atrasado: diasAtrasados,
                  pendente: diasPendentes,
                  concluido: diasConcluidos,
                }}
                modifiersClassNames={{
                  atrasado:
                    "font-bold underline decoration-red-500 decoration-2 underline-offset-4",
                  pendente:
                    "font-bold underline decoration-yellow-500 decoration-2 underline-offset-4",
                  concluido:
                    "font-bold underline decoration-green-500 decoration-2 underline-offset-4",
                }}
              />

              <div className="mt-4 flex flex-wrap justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs">Concluídas</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-xs">Pendentes</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs">Atrasadas</span>
                </div>
              </div>

              {obrigacoesFiscais.length === 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Nenhuma marcação será exibida até que existam
                  obrigações fiscais reais.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Obrigações do Mês</CardTitle>

                <div className="flex gap-2">
                  <Select
                    value={filtroTipo}
                    onValueChange={setFiltroTipo}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de Obrigação" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos
                      </SelectItem>
                      <SelectItem value="imposto">
                        Impostos
                      </SelectItem>
                      <SelectItem value="declaracao">
                        Declarações
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      informarIntegracaoPendente(
                        "Impressão das obrigações fiscais",
                      )
                    }
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden md:inline">
                      Imprimir
                    </span>
                  </Button>
                </div>
              </div>

              <CardDescription>
                {format(month, "MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </CardDescription>
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
                  {obrigacoesFiltradasDoMes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nenhuma obrigação fiscal real integrada para
                        o período selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    obrigacoesFiltradasDoMes.map((obrigacao) => (
                      <TableRow key={obrigacao.id}>
                        <TableCell className="font-medium">
                          {obrigacao.nome}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              obrigacao.tipo === "imposto"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800",
                            )}
                          >
                            {obrigacao.tipo === "imposto"
                              ? "Imposto"
                              : "Declaração"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {format(
                              obrigacao.vencimento,
                              "dd/MM/yyyy",
                            )}

                            {isToday(obrigacao.vencimento) && (
                              <Badge
                                variant="outline"
                                className="border-yellow-300 bg-yellow-100 text-yellow-800"
                              >
                                Hoje
                              </Badge>
                            )}

                            {!isToday(obrigacao.vencimento) &&
                              isBefore(
                                obrigacao.vencimento,
                                new Date(),
                              ) &&
                              obrigacao.status === "pendente" && (
                                <Badge
                                  variant="outline"
                                  className="border-red-300 bg-red-100 text-red-800"
                                >
                                  Atrasado
                                </Badge>
                              )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {typeof obrigacao.valor === "number" ? (
                            <div className="flex items-center gap-1">
                              <ArrowUpCircle className="h-3 w-3 text-red-500" />
                              <span>
                                {formatarMoeda(obrigacao.valor)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              obrigacao.status === "pendente" &&
                                "border-yellow-500 text-yellow-500",
                              (obrigacao.status === "enviado" ||
                                obrigacao.status === "pago") &&
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
                                onClick={() =>
                                  concluirObrigacao(obrigacao)
                                }
                              >
                                <Check className="h-3 w-3" />

                                {obrigacao.tipo === "imposto" ? (
                                  <span>Pagar</span>
                                ) : (
                                  <span>Enviar</span>
                                )}
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                informarIntegracaoPendente(
                                  "Detalhes da obrigação fiscal",
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
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Dia</CardTitle>

              <CardDescription>
                {format(date, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {obrigacoesDoDia.length > 0 ? (
                <div className="space-y-4">
                  {obrigacoesDoDia.map((obrigacao) => (
                    <div
                      key={obrigacao.id}
                      className="rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {obrigacao.nome}
                        </h3>

                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            obrigacao.status === "pendente" &&
                              "border-yellow-500 text-yellow-500",
                            (obrigacao.status === "enviado" ||
                              obrigacao.status === "pago") &&
                              "border-green-500 text-green-500",
                          )}
                        >
                          {obrigacao.status}
                        </Badge>
                      </div>

                      {obrigacao.descricao && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {obrigacao.descricao}
                        </p>
                      )}

                      {typeof obrigacao.valor === "number" && (
                        <p className="mt-2 text-sm">
                          Valor:{" "}
                          {formatarMoeda(obrigacao.valor)}
                        </p>
                      )}

                      <div className="mt-3 flex flex-col gap-2">
                        {obrigacao.status === "pendente" && (
                          <Button
                            size="sm"
                            className="w-full gap-1"
                            onClick={() =>
                              concluirObrigacao(obrigacao)
                            }
                          >
                            <Check className="h-3 w-3" />

                            {obrigacao.tipo === "imposto" ? (
                              <span>Marcar como Pago</span>
                            ) : (
                              <span>Marcar como Enviado</span>
                            )}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1"
                          onClick={() =>
                            informarIntegracaoPendente(
                              "Detalhes da obrigação fiscal",
                            )
                          }
                        >
                          <FileText className="h-3 w-3" />
                          <span>Ver Detalhes</span>
                        </Button>

                        {obrigacao.tipo === "declaracao" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1"
                            onClick={() =>
                              informarIntegracaoPendente(
                                "Protocolo da declaração",
                              )
                            }
                          >
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
                  <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />

                  <h3 className="font-medium">
                    Nenhuma obrigação real neste dia
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    O calendário ainda não possui obrigações fiscais
                    reais integradas para a data selecionada.
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
                {proximosVencimentos.length > 0 ? (
                  proximosVencimentos.map((obrigacao) => (
                    <div
                      key={obrigacao.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {obrigacao.nome}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Vence em{" "}
                          {format(
                            obrigacao.vencimento,
                            "dd/MM/yyyy",
                          )}
                        </p>
                      </div>

                      {typeof obrigacao.valor === "number" ? (
                        <div className="text-sm font-medium">
                          {formatarMoeda(obrigacao.valor)}
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {obrigacao.tipo === "imposto"
                            ? "Imposto"
                            : "Declaração"}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Info className="mb-2 h-8 w-8 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      Nenhum vencimento fiscal real integrado.
                    </p>
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
              {documentosFiscais.length > 0 ? (
                <div className="space-y-3">
                  {documentosFiscais.map((documento) => (
                    <div
                      key={documento.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">
                          {documento.nome}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          informarIntegracaoPendente(
                            "Download de documento fiscal",
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    Nenhum documento fiscal real integrado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}