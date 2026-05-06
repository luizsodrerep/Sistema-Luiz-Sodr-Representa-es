"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nome: string
  empresa: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  estado: string | null
  categoria: string | null
  status: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        setClientes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(busca.toLowerCase())) ||
    (c.cidade && c.cidade.toLowerCase().includes(busca.toLowerCase()))
  )

  return (
    <div className="flex flex-col p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Link href="/clientes/novo">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>
      <div className="relative w-full md:w-80 mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar clientes..."
          className="pl-8"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : `${clientesFiltrados.length} cliente(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Carregando clientes...</TableCell>
                </TableRow>
              ) : clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Nenhum cliente encontrado.</TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.empresa || "-"}</TableCell>
                    <TableCell>{cliente.email || "-"}</TableCell>
                    <TableCell>{cliente.telefone || "-"}</TableCell>
                    <TableCell>{cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : "-"}</TableCell>
                    <TableCell>{cliente.categoria || "-"}</TableCell>
                    <TableCell>{cliente.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
