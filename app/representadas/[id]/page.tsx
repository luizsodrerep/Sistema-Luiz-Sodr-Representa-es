"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  ArrowLeft,
  Home,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react"

interface Faixa {
  id?: string
  descontoAte: number
  percentualComissao: number
  ordem: number
}

interface Representada {
  id: string
  nome: string
  cnpj: string | null
  contratoAssinado: boolean
  emiteNF: boolean
  comissao: number | null

  fechamentoComissao: string | null
  pagamentoComissao: string | null
  bancoComissao: string | null

  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null

  contatoFinanceiro: string | null
  emailFinanceiro: string | null
  telefoneFinanceiro: string | null

  contatoLogistica: string | null
  emailLogistica: string | null
  telefoneLogistica: string | null

  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null

  site: string | null
  status: string
  observacoes: string | null

  faixasComissao: Faixa[]
}

export default function RepresentadaPage() {
  const router = useRouter()
  const params = useParams()

  const [rep, setRep] = useState<Representada | null>(null)
  const [loading, setLoading] = useState(true)

  const [faixas, setFaixas] = useState<Faixa[]>([])
  const [salvandoFaixas, setSalvandoFaixas] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const id = String(params?.id || "")

        if (!id) {
          setLoading(false)
          return
        }

        const res = await fetch(`/api/representadas/${id}`)

        if (!res.ok) {
          setLoading(false)
          return
        }

        const data = await res.json()

        setRep(data)
        setFaixas(data.faixasComissao || [])

        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    carregar()
  }, [params])

  async function handleExcluir() {
    if (!confirm("Deseja excluir esta representada?")) return

    const res = await fetch(`/api/representadas/${rep?.id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      alert("Representada excluída!")
      router.push("/representadas")
    } else {
      alert("Erro ao excluir.")
    }
  }

  function addFaixa() {
    setFaixas([
      ...faixas,
      {
        descontoAte: 0,
        percentualComissao: 0,
        ordem: faixas.length + 1,
      },
    ])
  }

  function removeFaixa(index: number) {
    setFaixas(faixas.filter((_, i) => i !== index))
  }

  function updateFaixa(
    index: number,
    field: keyof Faixa,
    value: number
  ) {
    const novas = [...faixas]

    novas[index] = {
      ...novas[index],
      [field]: value,
    }

    setFaixas(novas)
  }

  async function salvarFaixas() {
    try {
      setSalvandoFaixas(true)

      const res = await fetch(
        `/api/representadas/${rep?.id}/comissao`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            faixas,
          }),
        }
      )

      if (res.ok) {
        alert("Faixas salvas!")
      } else {
        alert("Erro ao salvar.")
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar.")
    } finally {
      setSalvandoFaixas(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Carregando...
      </div>
    )
  }

  if (!rep) {
    return (
      <div className="p-8">
        Representada não encontrada.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            onClick={() => router.push("/representadas")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Início
          </Button>

        </div>

        <div className="flex gap-2">

          <Button
            onClick={() =>
              router.push(`/representadas/${rep.id}/editar`)
            }
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <Button
            variant="destructive"
            onClick={handleExcluir}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

        </div>

      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {rep.nome}
        </h1>

        <p className="text-muted-foreground">
          Status: {rep.status}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Dados Cadastrais
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Nome
            </p>

            <p className="font-medium">
              {rep.nome}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              CNPJ
            </p>

            <p className="font-medium">
              {rep.cnpj || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Contrato Assinado
            </p>

            <p className="font-medium">
              {rep.contratoAssinado ? "Sim" : "Não"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Emite NF
            </p>

            <p className="font-medium">
              {rep.emiteNF ? "Sim" : "Não"}
            </p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Política de Comissão
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Comissão Fixa
            </p>

            <p className="text-xl font-bold">
              {rep.comissao
                ? `${rep.comissao}%`
                : "Não definida"}
            </p>
          </div>

          <div className="border-t pt-4">

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-semibold">
                Comissão Variável
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={addFaixa}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Faixa
              </Button>

            </div>

            <div className="space-y-2">

              {faixas.map((faixa, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2"
                >

                  <Input
                    type="number"
                    step="0.1"
                    value={faixa.descontoAte}
                    onChange={(e) =>
                      updateFaixa(
                        index,
                        "descontoAte",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Desconto até (%)"
                  />

                  <Input
                    type="number"
                    step="0.1"
                    value={faixa.percentualComissao}
                    onChange={(e) =>
                      updateFaixa(
                        index,
                        "percentualComissao",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Comissão (%)"
                  />

                  <Button
                    variant="ghost"
                    onClick={() => removeFaixa(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>

                </div>
              ))}

            </div>

            <div className="pt-4">

              <Button
                onClick={salvarFaixas}
                disabled={salvandoFaixas}
              >
                {salvandoFaixas
                  ? "Salvando..."
                  : "Salvar Faixas"}
              </Button>

            </div>

          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Contato Principal
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Nome
            </p>

            <p>{rep.contatoPrincipal || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p>{rep.emailPrincipal || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Telefone
            </p>

            <p>{rep.telefonePrincipal || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              WhatsApp
            </p>

            <p>{rep.whatsappPrincipal || "-"}</p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Financeiro
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Contato
            </p>

            <p>{rep.contatoFinanceiro || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p>{rep.emailFinanceiro || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Telefone
            </p>

            <p>{rep.telefoneFinanceiro || "-"}</p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Logística
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-sm text-muted-foreground">
              Contato
            </p>

            <p>{rep.contatoLogistica || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p>{rep.emailLogistica || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Telefone
            </p>

            <p>{rep.telefoneLogistica || "-"}</p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Endereço
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">
              Endereço
            </p>

            <p>{rep.endereco || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Cidade / Estado
            </p>

            <p>
              {rep.cidade || "-"} / {rep.estado || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              CEP
            </p>

            <p>{rep.cep || "-"}</p>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Observações
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            {rep.observacoes || "Nenhuma observação"}
          </p>
        </CardContent>
      </Card>

    </div>
  )
}