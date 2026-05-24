"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  status: string
}

export default function Page() {
  const router = useRouter()
  const params = useParams()

  const id =
    typeof params.id === "string"
      ? params.id
      : params.id?.[0]

  const [rep, setRep] = useState<Representada | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function carregar() {
      try {
        const response = await fetch(`/api/representadas/${id}`)

        const data = await response.json()

        setRep(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  if (!rep) {
    return <div className="p-8">Representada não encontrada</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/representadas")}
        >
          Voltar
        </Button>

        <Button
          onClick={() =>
            router.push(`/representadas/${rep.id}/editar`)
          }
        >
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{rep.nome}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p>
            <strong>CNPJ:</strong> {rep.cnpj || "-"}
          </p>

          <p>
            <strong>Status:</strong> {rep.status}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}