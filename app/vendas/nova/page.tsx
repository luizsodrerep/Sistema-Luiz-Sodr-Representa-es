"use client"

import { useEffect, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"

export default function NovaVendaPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [representadas, setRepresentadas] = useState<any[]>([])

  const [formData, setFormData] = useState({
    clienteId: "",
    representadaId: "",
    data: new Date().toISOString().split("T")[0],
    valorTotal: "",
    comissao: "",
    status: "Pendente",
    observacoes: "",
  })

  useEffect(() => {
    carregarClientes()
    carregarRepresentadas()
  }, [])

  async function carregarClientes() {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function carregarRepresentadas() {
    try {
      const response = await fetch("/api/representadas")
      const data = await response.json()
      setRepresentadas(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function salvarVenda() {
    try {
      if (!formData.clienteId) {
        toast({
          title: "Selecione um cliente",
          variant: "destructive",
        })
        return
      }

      if (!formData.representadaId) {
        toast({
          title: "Selecione uma representada",
          variant: "destructive",
        })
        return
      }

      if (!formData.valorTotal) {
        toast({
          title: "Informe o valor da venda",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: Number(formData.clienteId),
          representadaId: Number(formData.representadaId),
          data: formData.data,
          valorTotal: Number(formData.valorTotal),
          comissao: Number(formData.comissao || 0),
          status: formData.status,
          observacoes: formData.observacoes,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar venda")
      }

      toast({
        title: "Venda cadastrada com sucesso",
      })

      window.location.href = "/vendas"
    } catch (error) {
      console.error(error)

      toast({
        title: "Erro ao salvar venda",
        variant: "destructive",
      })
    }
  }

  return (
    <PageLayout title="Nova Venda">
      <NavigationButtons backLabel="Voltar para Vendas" />

      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Venda</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Cliente</Label>

            <Select
              value={formData.clienteId}
              onValueChange={(value) =>
                setFormData({ ...formData, clienteId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>

              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem
                    key={cliente.id}
                    value={String(cliente.id)}
                  >
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Representada</Label>

            <Select
              value={formData.representadaId}
              onValueChange={(value) =>
                setFormData({ ...formData, representadaId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma representada" />
              </SelectTrigger>

              <SelectContent>
                {representadas.map((representada) => (
                  <SelectItem
                    key={representada.id}
                    value={String(representada.id)}
                  >
                    {representada.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data da Venda</Label>

            <Input
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Valor da Venda (R$)</Label>

            <Input
              type="number"
              step="0.01"
              value={formData.valorTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valorTotal: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Comissão (R$)</Label>

            <Input
              type="number"
              step="0.01"
              value={formData.comissao}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comissao: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Status</Label>

            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Pendente">
                  Pendente
                </SelectItem>

                <SelectItem value="Faturado">
                  Faturado
                </SelectItem>

                <SelectItem value="Cancelado">
                  Cancelado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>

            <Textarea
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  observacoes: e.target.value,
                })
              }
            />
          </div>

          <Button
            onClick={salvarVenda}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Venda
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  )
}