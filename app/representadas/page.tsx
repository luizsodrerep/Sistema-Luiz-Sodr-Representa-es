"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Home,
  Plus,
  Trash2,
  Building2,
  Search,
} from "lucide-react"

interface Representada {
  id: string
  nome: string
  codigo: string | null
  cnpj: string | null
  contatoPrincipal: string | null
  telefonePrincipal: string | null
  status: string
}

/*
 * Normaliza textos para pesquisa.
 *
 * Exemplos:
 * "São Paulo" -> "sao paulo"
 * "STRAWPLAST SUL" -> "strawplast sul"
 *
 * A pesquisa deixa de depender de acentos,
 * maiúsculas/minúsculas e pontuação.
 */
const normalizarTextoBusca = (
  valor: string | null | undefined
) => {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/*
 * Pesquisa nos principais dados de identificação
 * da representada.
 *
 * Cada palavra digitada precisa existir no conjunto
 * de informações da representada.
 *
 * Exemplos:
 * "strawplast"
 * "strawplast sp"
 * "strawplast sul"
 * "rep 000001"
 */
const representadaCorrespondeBusca = (
  representada: Representada,
  busca: string
) => {
  const textoBusca =
    normalizarTextoBusca(busca)

  if (!textoBusca) {
    return true
  }

  const termos =
    textoBusca
      .split(/\s+/)
      .filter(Boolean)

  const conteudoPesquisavel =
    normalizarTextoBusca(
      [
        representada.nome,
        representada.codigo,
        representada.cnpj,
        representada.contatoPrincipal,
        representada.telefonePrincipal,
        representada.status,
      ]
        .filter(Boolean)
        .join(" ")
    )

  return termos.every((termo) =>
    conteudoPesquisavel.includes(termo)
  )
}

export default function RepresentadasPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [busca, setBusca] = useState("")

  const [representadas, setRepresentadas] = useState<
    Representada[]
  >([])

  useEffect(() => {
    carregarRepresentadas()
  }, [])

  async function carregarRepresentadas() {
    try {
      const response = await fetch("/api/representadas")

      if (!response.ok) {
        throw new Error("Erro ao carregar representadas")
      }

      const data = await response.json()

      setRepresentadas(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(error)
      setRepresentadas([])
      alert("Erro ao carregar representadas")
    } finally {
      setLoading(false)
    }
  }

  async function excluirRepresentada(
    id: string,
    nome: string
  ) {
    const confirmar = confirm(
      `Excluir representada "${nome}" ?`
    )

    if (!confirmar) return

    try {
      const response = await fetch(
        `/api/representadas/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      setRepresentadas((old) =>
        old.filter((item) => item.id !== id)
      )
    } catch {
      alert("Erro ao excluir representada")
    }
  }

  const representadasFiltradas =
    representadas.filter((representada) =>
      representadaCorrespondeBusca(
        representada,
        busca
      )
    )

  const ativas = representadas.filter(
    (r) => r.status === "Ativa"
  ).length

  const inativas = representadas.filter(
    (r) => r.status !== "Ativa"
  ).length

  if (loading) {
    return (
      <div className="p-6">
        Carregando...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <div className="sticky top-0 z-50 bg-white pb-4">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold">
              Representadas
            </h1>

            <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              {ativas} Ativas
            </div>

            <div className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              {inativas} Inativas
            </div>

          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-1" />
              Início
            </Button>

            <Button
              onClick={() =>
                router.push("/representadas/nova")
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>

          </div>
        </div>

        <div className="relative max-w-lg">

          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Buscar por nome, região, código, CNPJ, contato..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            className="pl-8 h-9"
          />

        </div>

      </div>

      <div className="border rounded-lg overflow-hidden mt-4">

        <div className="grid grid-cols-12 bg-muted px-4 py-3 text-xs font-semibold">

          <div className="col-span-4">
            Nome
          </div>

          <div className="col-span-2">
            Código
          </div>

          <div className="col-span-2">
            CNPJ
          </div>

          <div className="col-span-2">
            Telefone
          </div>

          <div className="col-span-1">
            Status
          </div>

          <div className="col-span-1 text-right">
            Ações
          </div>

        </div>

        {representadasFiltradas.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            Nenhuma representada encontrada.
          </div>
        )}

        {representadasFiltradas.map((rep, index) => (
          <div
            key={rep.id}
            className={`grid grid-cols-12 px-4 py-3 text-sm items-center border-t hover:bg-muted/30 transition ${
              index % 2 === 0
                ? "bg-white"
                : "bg-muted/10"
            }`}
          >

            <div
              className="col-span-4 flex items-center gap-2 font-medium hover:text-primary cursor-pointer"
              onClick={() =>
                router.push(
                  `/representadas/${rep.id}`
                )
              }
            >
              <Building2 className="h-4 w-4" />

              <div>
                <div>
                  {rep.nome}
                </div>

                {rep.contatoPrincipal && (
                  <div className="text-xs text-muted-foreground font-normal">
                    {rep.contatoPrincipal}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 text-muted-foreground">
              {rep.codigo || "-"}
            </div>

            <div className="col-span-2 text-muted-foreground">
              {rep.cnpj || "-"}
            </div>

            <div className="col-span-2 text-muted-foreground">
              {rep.telefonePrincipal || "-"}
            </div>

            <div className="col-span-1">

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  rep.status === "Ativa"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {rep.status}
              </span>

            </div>

            <div className="col-span-1 flex justify-end">

              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  excluirRepresentada(
                    rep.id,
                    rep.nome
                  )
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}