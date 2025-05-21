"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Edit, Plus, Search, Target, Trash, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ✅ Interface com os campos esperados do backend
interface Representada {
  id: number
  nome: string
  segmento: string
  cidade: string
  estado: string
  contato: string
  telefone: string
  email: string
  status: string
  metaAnual: string | number
  vendasRealizadas: string | number
  percentualMeta: number
  comissoesGeradas: string | number
  percentualComissao: number
}

export default function RepresentadasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [representadas, setRepresentadas] = useState<Representada[]>([]) // ✅ Estado tipado
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRepresentadas = async () => {
      try {
        const response = await fetch("/api/representadas")
        const data = await response.json()
        setRepresentadas(data)
      } catch (error) {
        console.error("Erro ao buscar representadas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentadas()
  }, [])

  const filteredRepresentadas = representadas.filter((representada) => {
    const termo = searchTerm.toLowerCase()
    return (
      representada.nome?.toLowerCase().includes(termo) ||
      representada.segmento?.toLowerCase().includes(termo) ||
      representada.contato?.toLowerCase().includes(termo) ||
      representada.telefone?.toLowerCase().includes(termo) ||
      representada.email?.toLowerCase().includes(termo) ||
      representada.status?.toLowerCase().includes(termo)
    )
  })

  return (
    <SidebarLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Representadas</h2>
            <div className="flex items-center space-x-2">
              <SpreadsheetHandler moduleType="representadas" data={representadas} />
              <Link href="/representadas/nova">
                <Button size="sm" className="h-9 gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nova Representada</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar representadas..."
                className="w-full h-8 pl-7 text-xxs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  {loading ? (
                    <div className="p-4">Carregando...</div>
                  ) : (
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
                        {filteredRepresentadas.map((representada) => (
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
                  )}
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
                    {representadas.map((representada) => (
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
                            <CardContent className="p-3 pt-0">
                              <div className="text-xl font-bold">R$ {representada.metaAnual || "0,00"}</div>
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
                              <div className="text-xl font-bold">R$ {representada.vendasRealizadas || "0,00"}</div>
                              <div className="text-xs text-muted-foreground">
                                {representada.percentualMeta || 0}% da meta anual
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">Comissões Geradas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="text-xl font-bold">R$ {representada.comissoesGeradas || "0,00"}</div>
                              <div className="text-xs text-muted-foreground">
                                {representada.percentualComissao || 0}% sobre vendas
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Progresso Anual</h4>
                            <span className="text-sm">{representada.percentualMeta || 0}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted"></div>
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
    </SidebarLayout>
  )
}
