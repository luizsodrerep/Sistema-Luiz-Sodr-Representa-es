"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  comissao: number | null
  contratoAssinado: boolean
  emiteNF: boolean
  status: string
  cidade: string | null
  estado: string | null
}

export default function RepresentadasPage() {
  const router = useRouter()
  const [representadas, setRepresentadas] = useState<Representada[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/representadas")
      .then((res) => res.json())
      .then((data) => { setRepresentadas(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Representadas</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>Inicio</Button>
          <Button size="sm" className="gap-1" onClick={() => router.push("/representadas/nova")}>
            <Plus className="h-4 w-4" />Nova Representada
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Lista de Representadas</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : representadas.length + " representada(s)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Comissao</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>NF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : representadas.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Nenhuma representada cadastrada.</TableCell></TableRow>
              ) : (
                representadas.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell>{r.cnpj || "-"}</TableCell>
                    <TableCell>{r.comissao ? r.comissao + "%" : "-"}</TableCell>
                    <TableCell>
                      <span style={{ backgroundColor: r.contratoAssinado ? "#dcfce7" : "#fee2e2", color: r.contratoAssinado ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {r.contratoAssinado ? "Sim" : "Nao"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ backgroundColor: r.emiteNF ? "#dcfce7" : "#fee2e2", color: r.emiteNF ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {r.emiteNF ? "Sim" : "Nao"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ backgroundColor: r.status === "Ativa" ? "#dcfce7" : "#fee2e2", color: r.status === "Ativa" ? "#166534" : "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => router.push("/representadas/" + r.id)}>
                        <LogIn className="h-3 w-3 mr-1" />Entrar
                      </Button>
                    </TableCell>
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