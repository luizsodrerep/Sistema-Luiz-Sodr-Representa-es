"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react"
import Link from "next/link"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

const TIPOS = ["WhatsApp", "E-mail", "Visita", "Ligação", "Outro"]

function toDatetimeLocal(isoString: string) {
  const d = new Date(isoString)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export default function EditarInteracaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingDados, setLoadingDados] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState({
    clienteId: "",
    tipo: "",
    data: "",
    assunto: "",
    descricao: "",
    resultado: "",
    proximosPasso: "",
  })

  useEffect(() => {
    async function carregarTudo() {
      setLoadingDados(true)
      setErro(null)

      try {
        const [resClientes, resInteracao] = await Promise.all([
          fetch("/api/clientes"),
          fetch(`/api/interacoes/${id}`),
        ])

        if (!resClientes.ok) {
          throw new Error("Erro ao carregar clientes")
        }

        if (resInteracao.status === 404) {
          setErro("Interação não encontrada.")
          return
        }

        if (!resInteracao.ok) {
          throw new Error("Erro ao carregar interação")
        }

        const [dadosClientes, dadosInteracao] = await Promise.all([
          resClientes.json(),
          resInteracao.json(),
        ])

        setClientes(dadosClientes)

        setForm({
          clienteId: dadosInteracao.clienteId,
          tipo: dadosInteracao.tipo,
          data: toDatetimeLocal(dadosInteracao.data),
          assunto: dadosInteracao.assunto || "",
          descricao: dadosInteracao.descricao || "",
          resultado: dadosInteracao.resultado || "",
          proximosPasso: dadosInteracao.proximosPasso || "",
        })
      } catch {
        setErro("Erro ao carregar dados. Tente novamente.")
      } finally {
        setLoadingDados(false)
      }
    }

    carregarTudo()
  }, [id])

  function handleChange(campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))

    if (erro) {
      setErro(null)
    }
  }

  async function handleSalvar() {
    if (!form.clienteId) {
      setErro("Selecione um cliente.")
      return
    }

    if (!form.tipo) {
      setErro("Selecione o tipo de interação.")
      return
    }

    if (!form.data) {
      setErro("Informe a data da interação.")
      return
    }

    setSalvando(true)
    setErro(null)

    try {
      const res = await fetch(`/api/interacoes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: form.clienteId,
          tipo: form.tipo,
          data: new Date(form.data).toISOString(),
          assunto: form.assunto || null,
          descricao: form.descricao || null,
          resultado: form.resultado || null,
          proximosPasso: form.proximosPasso || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.message || "Erro ao salvar alterações.")
        return
      }

      router.push(`/interacoes/${id}`)
    } catch {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  if (loadingDados) {
    return (
      <PageLayout title="Carregando...">
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-xxs">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dados...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Editar Interação">
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/interacoes/${id}`}>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
        </Link>

        <span className="text-xs-plus font-medium text-muted-foreground">
          Interações / Editar
        </span>
      </div>

      <Card className="card-container">
        <CardHeader className="card-header">
          <CardTitle className="card-title">
            Editar Interação
          </CardTitle>

          <CardDescription className="card-description">
            Atualize os dados desta interação
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          {erro && (
            <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-xxs">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  htmlFor="clienteId"
                  className="text-xxs"
                >
                  Cliente <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={form.clienteId}
                  onValueChange={(v) =>
                    handleChange("clienteId", v)
                  }
                >
                  <SelectTrigger
                    id="clienteId"
                    className="h-8 text-xxs"
                  >
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>

                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-xxs"
                      >
                        {c.nomeFantasia || c.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="tipo"
                  className="text-xxs"
                >
                  Tipo de Interação{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    handleChange("tipo", v)
                  }
                >
                  <SelectTrigger
                    id="tipo"
                    className="h-8 text-xxs"
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>

                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className="text-xxs"
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="data"
                  className="text-xxs"
                >
                  Data e Hora{" "}
                  <span className="text-red-500">*</span>
                </Label>

                <Input
                  id="data"
                  type="datetime-local"
                  className="h-8 text-xxs"
                  value={form.data}
                  onChange={(e) =>
                    handleChange("data", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="assunto"
                  className="text-xxs"
                >
                  Assunto
                </Label>

                <Input
                  id="assunto"
                  className="h-8 text-xxs"
                  placeholder="Ex: Apresentação de produtos, Follow-up proposta..."
                  value={form.assunto}
                  onChange={(e) =>
                    handleChange("assunto", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  htmlFor="descricao"
                  className="text-xxs"
                >
                  Descrição
                </Label>

                <Textarea
                  id="descricao"
                  className="min-h-[80px] text-xxs"
                  placeholder="Descreva o que foi tratado na interação..."
                  value={form.descricao}
                  onChange={(e) =>
                    handleChange("descricao", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="resultado"
                  className="text-xxs"
                >
                  Resultado
                </Label>

                <Textarea
                  id="resultado"
                  className="min-h-[60px] text-xxs"
                  placeholder="Qual foi o resultado desta interação?"
                  value={form.resultado}
                  onChange={(e) =>
                    handleChange("resultado", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="proximosPasso"
                  className="text-xxs"
                >
                  Próximos Passos
                </Label>

                <Textarea
                  id="proximosPasso"
                  className="min-h-[60px] text-xxs"
                  placeholder="O que precisa ser feito depois desta interação?"
                  value={form.proximosPasso}
                  onChange={(e) =>
                    handleChange(
                      "proximosPasso",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Link href={`/interacoes/${id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xxs"
                disabled={salvando}
              >
                Cancelar
              </Button>
            </Link>

            <Button
              size="sm"
              className="h-8 text-xxs gap-1"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}