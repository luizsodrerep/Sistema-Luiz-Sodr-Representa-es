"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  status: string
}

export default function RepresentadasPage() {
  const [representadas, setRepresentadas] = useState<Representada[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/representadas")
      .then((res) => res.json())
      .then((data) => {
        setRepresentadas(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Representadas
        </h1>

        <Link href="/representadas/nova">
          <Button>
            Nova Representada
          </Button>
        </Link>
      </div>

      {representadas.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            Nenhuma representada cadastrada.
          </CardContent>
        </Card>
      ) : (
        representadas.map((rep) => (
          <Card key={rep.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  {rep.nome}
                </h2>

                <p className="text-sm text-muted-foreground">
                  CNPJ: {rep.cnpj || "-"}
                </p>

                <p className="text-sm">
                  Status: {rep.status}
                </p>
              </div>

              <Link href={`/representadas/${rep.id}`}>
                <Button variant="outline">
                  Abrir
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}