"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, Trash2, Plus } from "lucide-react"

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  telefonePrincipal: string | null
  contatoPrincipal: string | null
  status: string
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

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"?`)) return
    const res = await fetch(`/api/representadas/${id}`, { method: "DELETE" })
    if (res.ok) setRepresentadas(representadas.filter((r) => r.id !== id))
    else alert("Erro ao excluir.")
  }

  const ativas = representadas.filter((r) => r.status === "Ativa").length
  const inativas = representadas.filter((r) => r.status !== "Ativa").length

  if (loading) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Representadas</h1>
          <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
            {ativas} Ativas
          </span>
          <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
            {inativas} Inativas
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-1" />Inicio
          </Button>
          <Link href="/representadas/nova">
            <Button><Plus className="h-4 w-4 mr-1" />Nova Representada</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span className="col-span-3">Nome</span>
          <span className="col-span-2">CNPJ</span>
          <span className="col-span-2">Telefone</span>
          <span className="col-span-2">Contato</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2 text-right">Acoes</span>
        </div>
        {representadas.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma representada cadastrada.</div>
        ) : (
          representadas.map((rep, idx) => (
            <div key={rep.id} className={`grid grid-cols-12 px-4 py-3 text-sm items-center ${idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
              <span className="col-span-3 font-medium truncate">{rep.nome}</span>
              <span className="col-span-2 text-muted-foreground truncate">{rep.cnpj || "-"}</span>
              <span className="col-span-2 text-muted-foreground truncate">{rep.telefonePrincipal || "-"}</span>
              <span className="col-span-2 text-muted-foreground truncate">{rep.contatoPrincipal || "-"}</span>
              <span className="col-span-1">
                <span style={{ backgroundColor: rep.status === "Ativa" ? "#dcfce7" : "#fee2e2", color: rep.status === "Ativa" ? "#166534" : "#991b1b", padding: "2px 8px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}>
                  {rep.status}
                </span>
              </span>
              <div className="col-span-2 flex gap-1 justify-end">
                <Link href={`/representadas/${rep.id}`}>
                  <Button variant="outline" size="sm">Abrir</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleExcluir(rep.id, rep.nome)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}