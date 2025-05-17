"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MapaClientesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Mapa de Clientes</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader className="p-4">
              <CardTitle className="text-base">Filtros</CardTitle>
              <CardDescription>Filtre os clientes no mapa</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Nome do cliente..." className="w-full pl-8" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="distribuidor">Distribuidor</SelectItem>
                    <SelectItem value="atacado">Atacado</SelectItem>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="confeitaria">Confeitaria</SelectItem>
                    <SelectItem value="padaria">Padaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Região</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regiões</SelectItem>
                    <SelectItem value="sp-capital">São Paulo - Capital</SelectItem>
                    <SelectItem value="sp-interior">São Paulo - Interior</SelectItem>
                    <SelectItem value="sp-litoral">São Paulo - Litoral</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    <SelectItem value="mg">Minas Gerais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="potencial">Potencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Aplicar Filtros</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardContent className="p-0">
              <div className="relative h-[calc(100vh-12rem)] w-full bg-muted/20 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
                <div className="absolute text-center">
                  <p className="text-muted-foreground">Mapa de clientes será exibido aqui</p>
                  <p className="text-xs text-muted-foreground mt-2">Integração com Google Maps API</p>
                </div>

                {/* Simulação de marcadores no mapa */}
                <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div className="mt-1 bg-white rounded-md shadow-md p-2 text-xs">
                    <p className="font-medium">Distribuidora ABC</p>
                    <p className="text-muted-foreground">São Paulo/SP</p>
                  </div>
                </div>

                <div className="absolute top-1/3 right-1/3 flex flex-col items-center">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>

                <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 border-2 border-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle>Clientes Próximos</CardTitle>
            <CardDescription>Clientes na região visualizada no mapa</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start space-x-4 rounded-lg border p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Cliente {i}</p>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${i % 3 === 0
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}
                      >
                        {i % 3 === 0 ? "Potencial" : "Ativo"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba", "São José dos Campos"][i - 1]}
                      /SP
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        Ver detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        Traçar rota
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

