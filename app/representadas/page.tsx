"use client"

import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NavigationButtons } from "@/components/navigation-buttons"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Edit, Plus, Search, Target, Trash, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RepresentadasPage() {
  const [anoSelecionado, setAnoSelecionado] = useState("2023")

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons />

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Representadas</h2>
          <div className="flex items-center space-x-2">
            {/* Componente de importação/exportação de planilhas */}
            <SpreadsheetHandler moduleType="representadas" data={representadasData} />

            <Button size="sm" className="h-9 gap-1">
              <Plus className="h-4 w-4" />
              <span>Nova Representada</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar representadas..."
                className="w-full bg-white pl-8 dark:bg-gray-950"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="lista">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lista">Lista de Representadas</TabsTrigger>
            <TabsTrigger value="metas">Metas e Desempenho</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Representadas</CardTitle>
                <CardDescription>Empresas representadas e seus contatos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {representadasData.map((representada) => (
                      <TableRow key={representada.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <Link href={`/representadas/${representada.id}`} className="hover:underline">
                                <div>{representada.nome}</div>
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                {representada.cidade}/{representada.estado}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{representada.segmento}</TableCell>
                        <TableCell>{representada.contato}</TableCell>
                        <TableCell>{representada.telefone}</TableCell>
                        <TableCell>{representada.email}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${representada.status === "Ativa"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                          >
                            {representada.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/representadas/${representada.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Metas e Desempenho</CardTitle>
                <CardDescription>Acompanhamento de metas por representada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {representadasData.map((representada) => (
                    <div key={representada.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-lg font-bold">{representada.nome}</h3>
                        </div>
                        <Button size="sm" className="gap-1">
                          <Target className="h-4 w-4" />
                          <span>Definir Metas</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm">Meta Anual ({anoSelecionado})</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-xl font-bold">R$ {representada.metaAnual}</div>
                            <div className="flex items-center text-xs">
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-green-500">+5% vs ano anterior</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm">Vendas Realizadas</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-xl font-bold">R$ {representada.vendasRealizadas}</div>
                            <div className="text-xs text-muted-foreground">
                              {representada.percentualMeta}% da meta anual
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm">Comissões Geradas</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-xl font-bold">R$ {representada.comissoesGeradas}</div>
                            <div className="text-xs text-muted-foreground">
                              {representada.percentualComissao}% sobre vendas
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Progresso Anual</h4>
                          <span className="text-sm">{representada.percentualMeta}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${representada.percentualMeta}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Produtos por Representada</CardTitle>
                <CardDescription>Catálogo de produtos disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <SpreadsheetHandler moduleType="representadas" />
                </div>
                <p>Conteúdo dos produtos será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const representadasData = [
  {
    id: 1,
    nome: "Descartáveis Premium Ltda",
    segmento: "Descartáveis",
    cidade: "São Paulo",
    estado: "SP",
    contato: "Carlos Mendes",
    telefone: "(11) 3456-7890",
    email: "contato@descartaveispremium.com.br",
    status: "Ativa",
    metaAnual: "960.000,00",
    vendasRealizadas: "680.450,00",
    percentualMeta: 70.9,
    comissoesGeradas: "68.045,00",
    percentualComissao: 10,
    metasMensais: [
      { meta: "80.000,00", realizado: "78.500,00" },
      { meta: "80.000,00", realizado: "82.300,00" },
      { meta: "80.000,00", realizado: "68.450,00" },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
      { meta: "80.000,00", realizado: null },
    ],
  },
  {
    id: 2,
    nome: "Embalagens Eco Ltda",
    segmento: "Embalagens Sustentáveis",
    cidade: "Campinas",
    estado: "SP",
    contato: "Ana Oliveira",
    telefone: "(19) 2345-6789",
    email: "contato@embalagemeco.com.br",
    status: "Ativa",
    metaAnual: "600.000,00",
    vendasRealizadas: "423.200,00",
    percentualMeta: 70.5,
    comissoesGeradas: "42.320,00",
    percentualComissao: 10,
    metasMensais: [
      { meta: "50.000,00", realizado: "48.200,00" },
      { meta: "50.000,00", realizado: "53.100,00" },
      { meta: "50.000,00", realizado: "42.320,00" },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
      { meta: "50.000,00", realizado: null },
    ],
  },
  {
    id: 3,
    nome: "Papel & Cia",
    segmento: "Produtos de Papel",
    cidade: "Ribeirão Preto",
    estado: "SP",
    contato: "Roberto Santos",
    telefone: "(16) 3456-7890",
    email: "contato@papelecia.com.br",
    status: "Ativa",
    metaAnual: "360.000,00",
    vendasRealizadas: "287.600,00",
    percentualMeta: 79.9,
    comissoesGeradas: "28.760,00",
    percentualComissao: 10,
    metasMensais: [
      { meta: "30.000,00", realizado: "32.100,00" },
      { meta: "30.000,00", realizado: "29.800,00" },
      { meta: "30.000,00", realizado: "28.760,00" },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
      { meta: "30.000,00", realizado: null },
    ],
  },
  {
    id: 4,
    nome: "Plásticos Nobre",
    segmento: "Produtos Plásticos",
    cidade: "Sorocaba",
    estado: "SP",
    contato: "Fernanda Lima",
    telefone: "(15) 2345-6789",
    email: "contato@plasticosnobre.com.br",
    status: "Inativa",
    metaAnual: "240.000,00",
    vendasRealizadas: "128.500,00",
    percentualMeta: 53.5,
    comissoesGeradas: "12.850,00",
    percentualComissao: 10,
    metasMensais: [
      { meta: "20.000,00", realizado: "18.200,00" },
      { meta: "20.000,00", realizado: "15.300,00" },
      { meta: "20.000,00", realizado: "12.850,00" },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
      { meta: "20.000,00", realizado: null },
    ],
  },
]

