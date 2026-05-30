"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building2, Phone, Mail, MapPin, Trash2, Pencil } from "lucide-react"

export default function RepresentadaPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [representada, setRepresentada] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(`/api/representadas/${id}`)
        const data = await response.json()
        setRepresentada(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (id) carregar()
  }, [id])

  async function excluirRepresentada() {
    const confirmar = confirm("Deseja realmente excluir esta representada?")
    if (!confirmar) return
    try {
      setExcluindo(true)
      const response = await fetch(`/api/representadas/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error()
      alert("Representada excluida com sucesso")
      router.push("/representadas")
    } catch (error) {
      console.error(error)
      alert("Erro ao excluir representada")
    } finally {
      setExcluindo(false)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!representada) {
    return <div className="p-6">Representada nao encontrada</div>
  }

  let faixas: any[] = []
  try {
    faixas = representada.faixasComissao ? JSON.parse(representada.faixasComissao) : []
  } catch {
    faixas = []
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/representadas")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{representada.nome}</h1>
            <p className="text-sm text-slate-500">Codigo: {representada.codigo || "-"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/representadas/${id}/editar`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" disabled={excluindo} onClick={excluirRepresentada}>
            <Trash2 className="h-4 w-4 mr-2" />
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2 shadow-sm border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Dados da Representada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-slate-500">Nome</p>
                <p className="font-medium">{representada.nome || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">CNPJ</p>
                <p className="font-medium">{representada.cnpj || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-medium">{representada.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fechamento Comissao</p>
                <p className="font-medium">{representada.fechamentoComissao || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Pagamento Comissao</p>
                <p className="font-medium">{representada.pagamentoComissao || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Banco Pagador</p>
                <p className="font-medium">{representada.bancoComissao || "-"}</p>
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-semibold text-slate-700 mb-4">Comissao</h3>
              {representada.tipoComissao === "variada" ? (
                <div className="space-y-3">
                  {Array.isArray(faixas) && faixas.map((faixa: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-4 bg-slate-50 border rounded-xl px-4 py-3">
                      <div>