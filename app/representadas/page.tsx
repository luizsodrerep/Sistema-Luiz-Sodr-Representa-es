"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Home,
  Plus,
  Trash2,
  Building2,
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

      const data = await response.json()

      setRepresentadas(data)
    } catch (error) {
      console.error(error)
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
    representadas.filter((rep) =>
      rep.nome
        .toLowerCase()
        .includes(busca.toLowerCase())
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

        <Input
          placeholder="Localizar representada..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          className="max-w-sm h-9"
        />

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
            className={`grid grid-cols-12 px-4 py-3 text-sm items-center border-t hover:bg-muted/30 transition cursor-pointer ${
              index % 2 === 0
                ? "bg-white"
                : "bg-muted/10"
            }`}
          >

            <div
              className="col-span-4 flex items-center gap-2 font-medium hover:text-primary"
              onClick={() =>
                router.push(
                  `/representadas/${rep.id}`
                )
              }
            >
              <Building2 className="h-4 w-4" />

              {rep.nome}
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