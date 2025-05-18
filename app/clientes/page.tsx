"use client"

import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { SpreadsheetHandler } from "@/components/spreadsheet-handler"
import { Building2, MapPin, Phone, Plus, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ClientesPage() {
  const [filtroStatus, setFiltroStatus] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("");

const clientesFiltrados = clientesData.filter((cliente) => {
  const termo = searchTerm.toLowerCase();

  const matchTexto =
    cliente.nome.toLowerCase().includes(termo) ||
    cliente.categoria.toLowerCase().includes(termo) ||
    cliente.cidade.toLowerCase().includes(termo);

  const matchStatus =
    filtroStatus === "Todos" || cliente.status === filtroStatus;

  return matchTexto && matchStatus;
});


  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SidebarLayout>          
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <div className="flex items-center space-x-2">
              <SpreadsheetHandler moduleType="clientes" data={clientesData} />
              <Link href="/clientes/novo">
                <Button size="sm" className="h-9 gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Novo Cliente</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="w-full bg-white pl-8 dark:bg-gray-950"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {["Todos", "Ativo", "Inativo", "Potencial"].map((status) => (
                <Button
                  key={status}
                  variant={filtroStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Gerencie todos os seus clientes em um só lugar</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div>{cliente.nome}</div>
                            <div className="text-xs text-muted-foreground">{cliente.cnpj}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.categoria}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{cliente.telefone}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{cliente.responsavel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {cliente.cidade}/{cliente.estado}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.ultimaCompra}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cliente.status === "Ativo"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : cliente.status === "Inativo"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                        >
                          {cliente.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/clientes/${cliente.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </SidebarLayout>
      </div>
    </div>
  )
}

const clientesData = [
  {
    id: 1,
    nome: "Distribuidora ABC Ltda",
    cnpj: "12.345.678/0001-90",
    categoria: "Distribuidor",
    telefone: "(11) 98765-4321",
    responsavel: "João Silva",
    cidade: "São Paulo",
    estado: "SP",
    ultimaCompra: "15/03/2023",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "Supermercado Silva",
    cnpj: "23.456.789/0001-01",
    categoria: "Varejo",
    telefone: "(11) 91234-5678",
    responsavel: "Maria Oliveira",
    cidade: "Campinas",
    estado: "SP",
    ultimaCompra: "22/02/2023",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Confeitaria Doce Sabor",
    cnpj: "34.567.890/0001-12",
    categoria: "Confeitaria",
    telefone: "(11) 97654-3210",
    responsavel: "Ana Santos",
    cidade: "Ribeirão Preto",
    estado: "SP",
    ultimaCompra: "05/01/2023",
    status: "Inativo",
  },
  {
    id: 4,
    nome: "Atacadão Produtos",
    cnpj: "45.678.901/0001-23",
    categoria: "Atacado",
    telefone: "(11) 96543-2109",
    responsavel: "Carlos Ferreira",
    cidade: "Santos",
    estado: "SP",
    ultimaCompra: "18/03/2023",
    status: "Ativo",
  },
  {
    id: 5,
    nome: "Mercado Central",
    cnpj: "56.789.012/0001-34",
    categoria: "Varejo",
    telefone: "(11) 95432-1098",
    responsavel: "Paulo Souza",
    cidade: "São José dos Campos",
    estado: "SP",
    ultimaCompra: "10/03/2023",
    status: "Ativo",
  },
  {
    id: 6,
    nome: "Padaria Pão Quente",
    cnpj: "67.890.123/0001-45",
    categoria: "Padaria",
    telefone: "(11) 94321-0987",
    responsavel: "Fernanda Lima",
    cidade: "Sorocaba",
    estado: "SP",
    ultimaCompra: "01/12/2022",
    status: "Potencial",
  },
]

