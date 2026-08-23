"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  AlertCircle,
  Plus,
  Save,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

type Representada = {
  id: string
  nome: string
  comissao: number | string | null
}

export default function NovaVendaPage() {
  const [clientes, setClientes] =
    useState<Cliente[]>([])

  const [representadas, setRepresentadas] =
    useState<Representada[]>([])

  const [carregandoClientes, setCarregandoClientes] =
    useState(true)

  const [
    carregandoRepresentadas,
    setCarregandoRepresentadas,
  ] = useState(true)

  const [erroClientes, setErroClientes] =
    useState<string | null>(null)

  const [
    erroRepresentadas,
    setErroRepresentadas,
  ] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clienteId: "",
    representadaId: "",
    data: new Date()
      .toISOString()
      .split("T")[0],
    valorTotal: "",
    comissao: "",
    status: "Pendente",
    observacoes: "",
  })

  useEffect(() => {
    carregarClientes()
    carregarRepresentadas()
  }, [])

  useEffect(() => {
    calcularComissao()
  }, [
    formData.representadaId,
    formData.valorTotal,
    representadas,
  ])

  async function carregarClientes() {
    try {
      setCarregandoClientes(true)
      setErroClientes(null)

      const response =
        await fetch("/api/clientes")

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os clientes."
        )
      }

      const data = await response.json()

      setClientes(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(error)

      setClientes([])
      setErroClientes(
        "Não foi possível carregar os clientes."
      )
    } finally {
      setCarregandoClientes(false)
    }
  }

  async function carregarRepresentadas() {
    try {
      setCarregandoRepresentadas(true)
      setErroRepresentadas(null)

      const response =
        await fetch("/api/representadas")

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as representadas."
        )
      }

      const data = await response.json()

      setRepresentadas(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(error)

      setRepresentadas([])
      setErroRepresentadas(
        "Não foi possível carregar as representadas."
      )
    } finally {
      setCarregandoRepresentadas(false)
    }
  }

  function calcularComissao() {
    const representada =
      representadas.find(
        (item) =>
          item.id ===
          formData.representadaId
      )

    if (!representada) {
      setFormData((prev) => ({
        ...prev,
        comissao: "",
      }))
      return
    }

    const percentual = Number(
      representada.comissao || 0
    )

    const valorVenda = Number(
      formData.valorTotal || 0
    )

    const valorComissao =
      (valorVenda * percentual) / 100

    setFormData((prev) => {
      const novaComissao =
        valorComissao.toFixed(2)

      if (
        prev.comissao === novaComissao
      ) {
        return prev
      }

      return {
        ...prev,
        comissao: novaComissao,
      }
    })
  }

  async function salvarVenda() {
    if (!formData.clienteId) {
      toast({
        title: "Cliente obrigatório",
        description:
          "Selecione um cliente antes de salvar a venda.",
        variant: "destructive",
      })
      return
    }

    if (!formData.representadaId) {
      toast({
        title: "Representada obrigatória",
        description:
          "Selecione uma representada antes de salvar a venda.",
        variant: "destructive",
      })
      return
    }

    if (!formData.data) {
      toast({
        title: "Data obrigatória",
        description:
          "Informe a data da venda.",
        variant: "destructive",
      })
      return
    }

    const valorTotal = Number(
      formData.valorTotal
    )

    if (
      !formData.valorTotal ||
      !Number.isFinite(valorTotal) ||
      valorTotal <= 0
    ) {
      toast({
        title: "Valor inválido",
        description:
          "Informe um valor de venda maior que zero.",
        variant: "destructive",
      })
      return
    }

    try {
      const payload = {
        clienteId: formData.clienteId,
        representadaId:
          formData.representadaId,
        data: formData.data,
        valorTotal,
        comissao: Number(
          formData.comissao || 0
        ),
        status: formData.status,
        observacoes:
          formData.observacoes,
      }

      const response =
        await fetch("/api/vendas", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        })

      const data = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Erro ao salvar venda."
        )
      }

      toast({
        title:
          "Venda cadastrada com sucesso",
      })

      window.location.href = "/vendas"
    } catch (error) {
      console.error(error)

      toast({
        title: "Erro ao salvar venda",
        description:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao salvar a venda.",
        variant: "destructive",
      })
    }
  }

  const semClientes =
    !carregandoClientes &&
    !erroClientes &&
    clientes.length === 0

  const semRepresentadas =
    !carregandoRepresentadas &&
    !erroRepresentadas &&
    representadas.length === 0

  return (
    <PageLayout title="Nova Venda">
      <NavigationButtons
        backLabel="Voltar para Vendas"
        backHref="/vendas"
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Cadastro de Venda
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {erroClientes && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                {erroClientes}
              </span>
            </div>
          )}

          {semClientes && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Nenhum cliente cadastrado
                    </p>

                    <p className="text-sm text-amber-800">
                      Para registrar uma venda,
                      primeiro cadastre um
                      cliente.
                    </p>
                  </div>

                  <Link href="/clientes/novo">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Cliente
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {erroRepresentadas && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                {erroRepresentadas}
              </span>
            </div>
          )}

          {semRepresentadas && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                Nenhuma representada está
                disponível. Cadastre uma
                representada antes de registrar
                a venda.
              </span>
            </div>
          )}

          <div>
            <Label>
              Cliente{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Select
              value={formData.clienteId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  clienteId: value,
                }))
              }
              disabled={
                carregandoClientes ||
                clientes.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    carregandoClientes
                      ? "Carregando clientes..."
                      : clientes.length === 0
                        ? "Nenhum cliente disponível"
                        : "Selecione um cliente"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nomeFantasia ||
                      cliente.razaoSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Representada{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Select
              value={
                formData.representadaId
              }
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  representadaId: value,
                }))
              }
              disabled={
                carregandoRepresentadas ||
                representadas.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    carregandoRepresentadas
                      ? "Carregando representadas..."
                      : representadas.length === 0
                        ? "Nenhuma representada disponível"
                        : "Selecione uma representada"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {representadas.map(
                  (representada) => (
                    <SelectItem
                      key={representada.id}
                      value={representada.id}
                    >
                      {representada.nome}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Data da Venda{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Input
              type="date"
              value={formData.data}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  data: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>
              Valor da Venda (R$){" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.valorTotal}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  valorTotal:
                    event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>
              Comissão Calculada (R$)
            </Label>

            <Input
              value={formData.comissao}
              disabled
            />
          </div>

          <div>
            <Label>Status</Label>

            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value,
                }))
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
              value={
                formData.observacoes
              }
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  observacoes:
                    event.target.value,
                }))
              }
            />
          </div>

          <Button
            type="button"
            onClick={salvarVenda}
            className="w-full"
            disabled={
              carregandoClientes ||
              carregandoRepresentadas ||
              clientes.length === 0 ||
              representadas.length === 0
            }
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Venda
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  )
}