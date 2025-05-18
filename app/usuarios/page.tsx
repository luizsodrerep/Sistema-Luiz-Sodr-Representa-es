"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Download, Edit, Plus, Search, Trash, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UsuariosPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons />

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline-block">Exportar</span>
            </Button>
            <Button size="sm" className="h-9 gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Usuário</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar usuários..." className="w-full bg-white pl-8 dark:bg-gray-950" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Todos
            </Button>
            <Button variant="outline" size="sm">
              Ativos
            </Button>
            <Button variant="outline" size="sm">
              Inativos
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Gerencie os usuários do sistema</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    id: "paula-ferreira",
                    nome: "Paula Ferreira",
                    cargo: "Gerente Comercial",
                    departamento: "Comercial",
                    email: "paula@luizsodre.com.br",
                    telefone: "(11) 98765-4321",
                    status: "Ativo",
                  },
                  {
                    id: "luiz-sodre",
                    nome: "Luiz Sodré",
                    cargo: "Vendedor Externo",
                    departamento: "Vendas",
                    email: "luiz@luizsodre.com.br",
                    telefone: "(11) 99876-5432",
                    status: "Ativo",
                  },
                  {
                    id: "maria-silva",
                    nome: "Maria Silva",
                    cargo: "Assistente Administrativo",
                    departamento: "Administrativo",
                    email: "maria@luizsodre.com.br",
                    telefone: "(11) 97654-3210",
                    status: "Ativo",
                  },
                  {
                    id: "joao-santos",
                    nome: "João Santos",
                    cargo: "Vendedor Interno",
                    departamento: "Vendas",
                    email: "joao@luizsodre.com.br",
                    telefone: "(11) 96543-2109",
                    status: "Inativo",
                  },
                ].map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <Link href={`/usuarios/${usuario.id}`} className="hover:underline">
                          <span>{usuario.nome}</span>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{usuario.cargo}</TableCell>
                    <TableCell>{usuario.departamento}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.telefone}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          usuario.status === "Ativo"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {usuario.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/usuarios/${usuario.id}`}>
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
      </div>
    </div>
  )
}

