"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Cliente {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  estado: string | null
  categoria: string | null
  status: string
}

const statusCor = (status: string) => {
  if (status === "Ativo") {
    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
    }
  }

  if (status === "Inativo") {
    return {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    }
  }

  if (status === "Inativo 6 meses") {
    return {
      backgroundColor: "#ffedd5",
      color: "#9a3412",
    }
  }

  if (status === "Prospect") {
    return {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    }
  }

  return {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  }
}

export default function ClientesPage() {
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("Todos")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")
  const [loading, setLoading] = useState(true)
  const [importando, setImportando] = useState(false)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [alterandoStatusId, setAlterandoStatusId] = useState<string | null>(
    null
  )

  const carregarClientes = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/clientes", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar clientes")
      }

      const data = await response.json()

      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setClientes([])
      alert("Erro ao carregar os clientes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  const categorias = Array.from(
    new Set(
      clientes
        .map((cliente) => cliente.categoria)
        .filter(
          (categoria): categoria is string =>
            Boolean(categoria && categoria.trim())
        )
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busca.trim().toLowerCase()

    const correspondeBusca =
      !texto ||
      cliente.razaoSocial?.toLowerCase().includes(texto) ||
      cliente.nomeFantasia?.toLowerCase().includes(texto) ||
      cliente.cidade?.toLowerCase().includes(texto) ||
      cliente.estado?.toLowerCase().includes(texto) ||
      cliente.categoria?.toLowerCase().includes(texto) ||
      cliente.codigo?.toLowerCase().includes(texto) ||
      cliente.cnpj?.toLowerCase().includes(texto) ||
      cliente.email?.toLowerCase().includes(texto) ||
      cliente.telefone?.toLowerCase().includes(texto)

    const correspondeStatus =
      filtroStatus === "Todos" || cliente.status === filtroStatus

    const correspondeCategoria =
      filtroCategoria === "Todas" ||
      cliente.categoria === filtroCategoria

    return (
      correspondeBusca &&
      correspondeStatus &&
      correspondeCategoria
    )
  })

  const limparFiltros = () => {
    setBusca("")
    setFiltroStatus("Todos")
    setFiltroCategoria("Todas")
  }

  const baixarModelo = () => {
    window.open(
      "/api/clientes/exportar?tipo=modelo",
      "_blank"
    )
  }

  const baixarDados = () => {
    window.open(
      "/api/clientes/exportar?tipo=dados",
      "_blank"
    )
  }

  const handleImportar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    setImportando(true)

    try {
      const formData = new FormData()

      formData.append("file", file)

      const response = await fetch(
        "/api/clientes/importar",
        {
          method: "POST",
          body: formData,
        }
      )

      const result = await response.json()

      if (response.ok) {
        alert(
          `${result.importados} cliente(s) importado(s) com sucesso!`
        )

        await carregarClientes()
      } else {
        alert("Erro: " + (result.error || "Erro ao importar."))
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao importar.")
    } finally {
      setImportando(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExcluir = async (cliente: Cliente) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o cliente "${cliente.razaoSocial}"?`
    )

    if (!confirmar) return

    setExcluindoId(cliente.id)

    try {
      const response = await fetch(
        `/api/clientes/${cliente.id}`,
        {
          method: "DELETE",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Erro ao excluir cliente."
        )
      }

      setClientes((clientesAtuais) =>
        clientesAtuais.filter(
          (item) => item.id !== cliente.id
        )
      )

      alert("Cliente excluído com sucesso.")
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao excluir cliente."
      )
    } finally {
      setExcluindoId(null)
    }
  }

  const handleAlterarStatus = async (
    cliente: Cliente,
    novoStatus: string
  ) => {
    if (novoStatus === cliente.status) return

    setAlterandoStatusId(cliente.id)

    try {
      const response = await fetch(
        `/api/clientes/${cliente.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...cliente,
            status: novoStatus,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Erro ao alterar status."
        )
      }

      setClientes((clientesAtuais) =>
        clientesAtuais.map((item) =>
          item.id === cliente.id
            ? {
                ...item,
                status: novoStatus,
              }
            : item
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status."
      )
    } finally {
      setAlterandoStatusId(null)
    }
  }

  return (
    <div className="flex flex-col p-8 pt-6">

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">

        <h2 className="text-3xl font-bold tracking-tight">
          Clientes
        </h2>

        <div className="flex gap-2 flex-wrap">

          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Início
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={baixarModelo}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Modelo Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={baixarDados}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={importando}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload className="h-4 w-4" />
            {importando
              ? "Importando..."
              : "Importar"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleImportar}
          />

          <Link href="/clientes/novo">
            <Button
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>

        </div>
      </div>

      <div className="flex gap-3 flex-wrap mb-4">

        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Buscar por nome, código, cidade, CNPJ..."
            className="pl-8"
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) =>
            setFiltroStatus(e.target.value)
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="Todos">
            Todos os status
          </option>
          <option value="Ativo">
            Ativo
          </option>
          <option value="Prospect">
            Prospect
          </option>
          <option value="Inativo">
            Inativo
          </option>
          <option value="Inativo 6 meses">
            Inativo 6 meses
          </option>
        </select>

        <select
          value={filtroCategoria}
          onChange={(e) =>
            setFiltroCategoria(e.target.value)
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="Todas">
            Todas as categorias
          </option>

          {categorias.map((categoria) => (
            <option
              key={categoria}
              value={categoria}
            >
              {categoria}
            </option>
          ))}
        </select>

        {(busca ||
          filtroStatus !== "Todos" ||
          filtroCategoria !== "Todas") && (
          <Button
            variant="outline"
            onClick={limparFiltros}
          >
            Limpar filtros
          </Button>
        )}

      </div>

      <Card>

        <CardHeader>

          <CardTitle>
            Lista de Clientes
          </CardTitle>

          <CardDescription>
            {loading
              ? "Carregando..."
              : `${clientesFiltrados.length} de ${clientes.length} cliente(s)`}
          </CardDescription>

        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">

          <Table>

            <TableHeader>
              <TableRow>

                <TableHead>
                  Código
                </TableHead>

                <TableHead>
                  Razão Social
                </TableHead>

                <TableHead>
                  Categoria
                </TableHead>

                <TableHead>
                  Cidade
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Ações
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                  >
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map(
                  (cliente) => (
                    <TableRow
                      key={cliente.id}
                    >

                      <TableCell>
                        {cliente.codigo || "-"}
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={() =>
                            router.push(
                              `/clientes/${cliente.id}`
                            )
                          }
                        >
                          {cliente.razaoSocial}
                        </button>

                        {cliente.nomeFantasia && (
                          <div className="text-xs text-muted-foreground">
                            {cliente.nomeFantasia}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {cliente.categoria || "-"}
                      </TableCell>

                      <TableCell>
                        {cliente.cidade || "-"}
                        {cliente.estado
                          ? ` / ${cliente.estado}`
                          : ""}
                      </TableCell>

                      <TableCell>

                        <select
                          value={cliente.status}
                          disabled={
                            alterandoStatusId ===
                            cliente.id
                          }
                          onChange={(e) =>
                            handleAlterarStatus(
                              cliente,
                              e.target.value
                            )
                          }
                          className="rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer disabled:opacity-50"
                          style={{
                            ...statusCor(
                              cliente.status
                            ),
                          }}
                        >
                          <option value="Ativo">
                            Ativo
                          </option>

                          <option value="Prospect">
                            Prospect
                          </option>

                          <option value="Inativo">
                            Inativo
                          </option>

                          <option value="Inativo 6 meses">
                            Inativo 6 meses
                          </option>
                        </select>

                      </TableCell>

                      <TableCell>

                        <div className="flex justify-end gap-1">

                          <Button
                            size="sm"
                            variant="outline"
                            title="Entrar"
                            onClick={() =>
                              router.push(
                                `/clientes/${cliente.id}`
                              )
                            }
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Entrar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            title="Editar cliente"
                            onClick={() =>
                              router.push(
                                `/clientes/${cliente.id}/editar`
                              )
                            }
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            title="Excluir cliente"
                            disabled={
                              excluindoId ===
                              cliente.id
                            }
                            onClick={() =>
                              handleExcluir(cliente)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>

                        </div>

                      </TableCell>

                    </TableRow>
                  )
                )
              )}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  )
}