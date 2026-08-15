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
  MessageCircle,
  Mail,
  Users,
  UserCheck,
  UserX,
  Target,
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
  whatsapp: string | null
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

  /*
   * CONTADORES DE STATUS
   *
   * Os números são calculados diretamente a partir dos clientes
   * carregados da API. Não existe informação duplicada no banco.
   */
  const totalClientes = clientes.length

  const totalAtivos = clientes.filter(
    (cliente) => cliente.status === "Ativo"
  ).length

  const totalProspects = clientes.filter(
    (cliente) => cliente.status === "Prospect"
  ).length

  const totalInativos = clientes.filter(
    (cliente) => cliente.status === "Inativo"
  ).length

  const totalInativos6Meses = clientes.filter(
    (cliente) => cliente.status === "Inativo 6 meses"
  ).length

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
      cliente.telefone?.toLowerCase().includes(texto) ||
      cliente.whatsapp?.toLowerCase().includes(texto)

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

  const aplicarFiltroStatus = (status: string) => {
    setFiltroStatus(status)
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
        alert(
          "Erro: " +
            (result.error || "Erro ao importar.")
        )
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

  /*
   * Remove caracteres não numéricos do telefone.
   *
   * Se o número brasileiro já estiver com DDI 55,
   * mantém o 55. Caso contrário, adiciona 55.
   */
  const prepararWhatsApp = (telefone: string) => {
    const numero = telefone.replace(/\D/g, "")

    if (!numero) return ""

    if (numero.startsWith("55")) {
      return numero
    }

    return `55${numero}`
  }

  const abrirWhatsApp = (cliente: Cliente) => {
    const contato = cliente.whatsapp || cliente.telefone

    if (!contato) {
      alert(
        "Este cliente não possui telefone ou WhatsApp cadastrado."
      )
      return
    }

    const numero = prepararWhatsApp(contato)

    if (!numero) {
      alert(
        "O telefone ou WhatsApp cadastrado não possui um número válido."
      )
      return
    }

    window.open(
      `https://wa.me/${numero}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const abrirEmail = (cliente: Cliente) => {
    if (!cliente.email) {
      alert(
        "Este cliente não possui e-mail cadastrado."
      )
      return
    }

    window.location.href = `mailto:${cliente.email}`
  }

  return (
    <div className="flex flex-col p-8 pt-6">

      {/* CABEÇALHO */}

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

      {/* CONTADORES */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">

        <button
          type="button"
          onClick={() => aplicarFiltroStatus("Todos")}
          className="text-left"
        >
          <Card
            className={`transition hover:shadow-md ${
              filtroStatus === "Todos"
                ? "ring-2 ring-primary"
                : ""
            }`}
          >
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Total
                  </p>

                  <p className="text-2xl font-bold">
                    {totalClientes}
                  </p>
                </div>

                <Users className="h-6 w-6 text-muted-foreground" />

              </div>

            </CardContent>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroStatus("Ativo")}
          className="text-left"
        >
          <Card
            className={`transition hover:shadow-md ${
              filtroStatus === "Ativo"
                ? "ring-2 ring-green-500"
                : ""
            }`}
          >
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Ativos
                  </p>

                  <p className="text-2xl font-bold text-green-700">
                    {totalAtivos}
                  </p>
                </div>

                <UserCheck className="h-6 w-6 text-green-600" />

              </div>

            </CardContent>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroStatus("Prospect")}
          className="text-left"
        >
          <Card
            className={`transition hover:shadow-md ${
              filtroStatus === "Prospect"
                ? "ring-2 ring-blue-500"
                : ""
            }`}
          >
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Prospects
                  </p>

                  <p className="text-2xl font-bold text-blue-700">
                    {totalProspects}
                  </p>
                </div>

                <Target className="h-6 w-6 text-blue-600" />

              </div>

            </CardContent>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroStatus("Inativo")}
          className="text-left"
        >
          <Card
            className={`transition hover:shadow-md ${
              filtroStatus === "Inativo"
                ? "ring-2 ring-red-500"
                : ""
            }`}
          >
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Inativos
                  </p>

                  <p className="text-2xl font-bold text-red-700">
                    {totalInativos}
                  </p>
                </div>

                <UserX className="h-6 w-6 text-red-600" />

              </div>

            </CardContent>
          </Card>
        </button>

        <button
          type="button"
          onClick={() =>
            aplicarFiltroStatus("Inativo 6 meses")
          }
          className="text-left"
        >
          <Card
            className={`transition hover:shadow-md ${
              filtroStatus === "Inativo 6 meses"
                ? "ring-2 ring-orange-500"
                : ""
            }`}
          >
            <CardContent className="p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Inativos +6 meses
                  </p>

                  <p className="text-2xl font-bold text-orange-700">
                    {totalInativos6Meses}
                  </p>
                </div>

                <UserX className="h-6 w-6 text-orange-600" />

              </div>

            </CardContent>
          </Card>
        </button>

      </div>

      {/* BUSCA E FILTROS */}

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

      {/* LISTA */}

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

                      {/* CÓDIGO */}

                      <TableCell>
                        {cliente.codigo || "-"}
                      </TableCell>

                      {/* RAZÃO SOCIAL */}

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

                      {/* CATEGORIA */}

                      <TableCell>
                        {cliente.categoria || "-"}
                      </TableCell>

                      {/* CIDADE */}

                      <TableCell>

                        {cliente.cidade || "-"}

                        {cliente.estado
                          ? ` / ${cliente.estado}`
                          : ""}

                      </TableCell>

                      {/* STATUS */}

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

                      {/* AÇÕES */}

                      <TableCell>

                        <div className="flex justify-end gap-1">

                          {/* WHATSAPP */}

                          <Button
                            size="sm"
                            variant="outline"
                            title={
                              cliente.whatsapp ||
                              cliente.telefone
                                ? "Abrir WhatsApp"
                                : "Sem telefone/WhatsApp cadastrado"
                            }
                            disabled={
                              !(
                                cliente.whatsapp ||
                                cliente.telefone
                              )
                            }
                            onClick={() =>
                              abrirWhatsApp(cliente)
                            }
                            className="px-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="sr-only">
                              WhatsApp
                            </span>
                          </Button>

                          {/* E-MAIL */}

                          <Button
                            size="sm"
                            variant="outline"
                            title={
                              cliente.email
                                ? "Enviar e-mail"
                                : "Sem e-mail cadastrado"
                            }
                            disabled={!cliente.email}
                            onClick={() =>
                              abrirEmail(cliente)
                            }
                            className="px-2"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">
                              E-mail
                            </span>
                          </Button>

                          {/* ENTRAR */}

                          <Button
                            size="sm"
                            variant="outline"
                            title="Entrar no cadastro"
                            onClick={() =>
                              router.push(
                                `/clientes/${cliente.id}`
                              )
                            }
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Entrar
                          </Button>

                          {/* EDITAR */}

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

                          {/* EXCLUIR */}

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