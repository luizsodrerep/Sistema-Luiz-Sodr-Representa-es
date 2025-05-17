

import { Button } from "@/components/ui/button"
import { BarChart3, Download, LineChart, PieChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select defaultValue="month">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="atacado">Atacado</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                  <SelectItem value="confeitaria">Confeitaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Representada</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma representada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as representadas</SelectItem>
                  <SelectItem value="rep1">Representada A</SelectItem>
                  <SelectItem value="rep2">Representada B</SelectItem>
                  <SelectItem value="rep3">Representada C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button>Aplicar Filtros</Button>
        </div>

        <Tabs defaultValue="vendas">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 152.380,45</div>
                  <p className="text-xs text-muted-foreground">+12.5% em relação ao período anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 3.842,50</div>
                  <p className="text-xs text-muted-foreground">+5.2% em relação ao período anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">+8.3% em relação ao período anterior</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Vendas por Período</CardTitle>
                  <CardDescription>Evolução das vendas nos últimos meses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <LineChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Vendas por Categoria</CardTitle>
                  <CardDescription>Distribuição de vendas por categoria de cliente</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <PieChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Produto</CardTitle>
                <CardDescription>Produtos mais vendidos no período</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Clientes</CardTitle>
                <CardDescription>Informações e métricas sobre a base de clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo da análise de clientes será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comissoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Comissões</CardTitle>
                <CardDescription>Comissões geradas e pagas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo do relatório de comissões será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desempenho" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho da Equipe</CardTitle>
                <CardDescription>Métricas de desempenho da equipe de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo do desempenho da equipe será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

