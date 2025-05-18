"use client"

import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { ShareButtons } from "@/components/share-buttons"
import { SalesComparison } from "@/components/sales-comparison"
import { NavigationButtons } from "@/components/navigation-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Building2, Calendar, CircleDollarSign, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function VendasPage() {
  const [totalDifference, setTotalDifference] = useState(0)
  const [statusFiltro, setStatusFiltro] = useState("Todos")
  const [filtroStatus, setFiltroStatus] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("");

  const vendasFiltradas = vendasData.filter((venda) => {
    const termo = searchTerm.toLowerCase();

    const matchTexto =
      venda.id.toLowerCase().includes(termo) ||
      venda.cliente.toLowerCase().includes(termo) ||
      venda.representada.toLowerCase().includes(termo);
      venda.valor.toLowerCase().includes(termo);      
      
    const matchStatus =
      statusFiltro === "Todos" || venda.status === filtroStatus;

    return matchTexto && matchStatus;
  });


  // Função para atualizar o montante total de diferenças
  const handleTotalDifferenceChange = (difference: number) => {
    setTotalDifference(difference)
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          {/* Botões de navegação */}
          {/* <NavigationButtons /> */}
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
            <div className="flex items-center space-x-2">
              {/* Componente de importação/exportação de planilhas */}
              <SpreadsheetHandler moduleType="vendas" data={vendasData} />

              <Link href="/vendas/novo">
                <Button size="sm" className="h-9 gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nova Venda</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Adicionar card para mostrar o montante total de diferenças */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(
                    vendasData.reduce((acc, venda) => {
                      return acc + Number(venda.valor.replace(".", "").replace(",", "."))
                    }, 0),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(
                    vendasData.reduce((acc, venda) => {
                      if (!venda.valorFaturado) return acc
                      return acc + Number(venda.valorFaturado.replace(".", "").replace(",", "."))
                    }, 0),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Diferença Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${totalDifference < 0 ? "text-red-500" : totalDifference > 0 ? "text-green-500" : ""}`}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalDifference)}
                </div>
                {totalDifference < 0 && <div className="text-xs text-red-500 mt-1">Perda no faturamento</div>}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar vendas..."
                  className="w-full bg-white pl-8 dark:bg-gray-950"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {["Todos", "Faturado", "Pendente", "Cancelado"].map((status) => (
                <Button
                  key={status}
                  variant={statusFiltro === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFiltro(status)}
                >
                  {status}
                </Button>
              ))}
            </div>

            {/* <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Todos
              </Button>
              <Button variant="outline" size="sm">
                Faturados
              </Button>
              <Button variant="outline" size="sm">
                Pendentes
              </Button>
              <Button variant="outline" size="sm">
                Cancelados
              </Button>
            </div> */}
          </div>
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>Acompanhe todas as vendas realizadas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Representada</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Vendido</TableHead>
                    <TableHead>Valor Faturado</TableHead>
                    <TableHead>Diferença</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.map((venda, i) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">#{venda.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <Link href={`/clientes/${venda.id}`} className="hover:underline">
                            <span>{venda.cliente}</span>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/representadas/${venda.representadaId || i + 1}`}
                          className="text-primary hover:underline"
                        >
                          {venda.representada}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{venda.data}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CircleDollarSign className="h-3 w-3" />
                          <span>R$ {venda.valor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CircleDollarSign className="h-3 w-3" />
                          <span>R$ {venda.valorFaturado || venda.valor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {venda.valorFaturado && venda.valorFaturado !== venda.valor ? (
                          <div
                            className={`text-xs font-medium ${Number(venda.valorFaturado.replace(".", "").replace(",", ".")) < Number(venda.valor.replace(".", "").replace(",", ".")) ? "text-red-500" : "text-green-500"}`}
                          >
                            {Number(venda.valorFaturado.replace(".", "").replace(",", ".")) <
                              Number(venda.valor.replace(".", "").replace(",", "."))
                              ? `-R$ ${(Number(venda.valor.replace(".", "").replace(",", ".")) - Number(venda.valorFaturado.replace(".", "").replace(",", "."))).toFixed(2).replace(".", ",")}`
                              : `+R$ ${(Number(venda.valorFaturado.replace(".", "").replace(",", ".")) - Number(venda.valor.replace(".", "").replace(",", "."))).toFixed(2).replace(".", ",")}`}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem diferença</span>
                        )}
                      </TableCell>
                      <TableCell>R$ {venda.comissao}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${venda.status === "Faturado"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : venda.status === "Cancelado"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : venda.status === "Pendente"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                        >
                          {venda.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vendas/${venda.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                          <ShareButtons
                            fileUrl={`/pedidos/${venda.id}.pdf`}
                            fileName={`Pedido_${venda.id}.pdf`}
                            clientId={venda.id}
                            clientName={venda.cliente}
                            orderId={venda.id}
                            orderInfo={`R$ ${venda.valor}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Análise de Cortes no Faturamento */}
          <div className="mt-6">
            <SalesComparison onTotalDifferenceChange={handleTotalDifferenceChange} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

const vendasData = [
  {
    id: "12345",
    cliente: "Distribuidora ABC Ltda",
    representada: "Descartáveis Premium Ltda",
    representadaId: "1",
    data: "15/03/2023",
    valor: "5.200,00",
    valorFaturado: "4.950,00",
    comissao: "495,00",
    pagamento: "30/60/90 dias",
    status: "Faturado",
  },
  {
    id: "12348",
    cliente: "Atacadão Produtos",
    representada: "Plásticos Nobre",
    representadaId: "4",
    data: "10/03/2023",
    valor: "8.500,00",
    valorFaturado: null,
    comissao: "850,00",
    pagamento: "30/60 dias",
    status: "Pendente",
  },
  {
    id: "12349",
    cliente: "Mercado Central",
    representada: "Descartáveis Premium Ltda",
    representadaId: "1",
    data: "08/03/2023",
    valor: "2.300,00",
    valorFaturado: "2.300,00",
    comissao: "230,00",
    pagamento: "30 dias",
    status: "Atrasado",
  },
  {
    id: "12350",
    cliente: "Padaria Pão Quente",
    representada: "Embalagens Eco Ltda",
    representadaId: "2",
    data: "05/03/2023",
    valor: "950,00",
    valorFaturado: "0,00",
    comissao: "0,00",
    pagamento: "À vista",
    status: "Cancelado",
  },
]

