"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
} from "lucide-react"

interface Faixa {
  desconto: string
  comissao: string
}

interface Representada {
  id: string
  codigo: string
  nome: string
  cnpj: string
  comissao: string
  tipoComissao: "fixa" | "variada"
  faixasComissao?: string
  fechamentoComissao: string
  pagamentoComissao: string
  bancoComissao: string
  contatoPrincipal: string
  emailPrincipal: string
  telefonePrincipal: string
  whatsappPrincipal: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  status: string
  observacoes: string
}

interface FormData {
  codigo: string
  nome: string
  cnpj: string
  comissao: string
  fechamentoComissao: string
  pagamentoComissao: string
  bancoComissao: string
  contatoPrincipal: string
  emailPrincipal: string
  telefonePrincipal: string
  whatsappPrincipal: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  status: string
  observacoes: string
}

export default function EditarRepresentadaPage() {
  const router = useRouter()
  const params = useParams()

  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tipoComissao, setTipoComissao] = useState("fixa")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [faixas, setFaixas] = useState<Faixa[]>([
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
  ])

  const [formData, setFormData] = useState<FormData>({
    codigo: "",
    nome: "",
    cnpj: "",
    comissao: "",
    fechamentoComissao: "",
    pagamentoComissao: "",
    bancoComissao: "",
    contatoPrincipal: "",
    emailPrincipal: "",
    telefonePrincipal: "",
    whatsappPrincipal: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    status: "Ativa",
    observacoes: "",
  })

  useEffect(() => {
    if (!id) return

    async function carregar() {
      try {
        setErro(null)

        const response = await fetch(`/api/representadas/${id}`)

        if (!response.ok) {
          throw new Error("Erro ao carregar representada")
        }

        const data: Representada = await response.json()

        setFormData({
          codigo: data.codigo || "",
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          comissao: data.comissao?.toString() || "",
          fechamentoComissao: data.fechamentoComissao || "",
          pagamentoComissao: data.pagamentoComissao || "",
          bancoComissao: data.bancoComissao || "",
          contatoPrincipal: data.contatoPrincipal || "",
          emailPrincipal: data.emailPrincipal || "",
          telefonePrincipal: data.telefonePrincipal || "",
          whatsappPrincipal: data.whatsappPrincipal || "",
          endereco: data.endereco || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          cep: data.cep || "",
          status: data.status || "Ativa",
          observacoes: data.observacoes || "",
        })

        setTipoComissao(data.tipoComissao || "fixa")

        if (data.faixasComissao) {
          try {
            const parsed =
              typeof data.faixasComissao === "string"
                ? JSON.parse(data.faixasComissao)
                : data.faixasComissao

            if (Array.isArray(parsed) && parsed.length > 0) {
              setFaixas(parsed)
            }
          } catch (error) {
            console.error("Erro ao fazer parse de faixas:", error)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar:", error)
        setErro("Erro ao carregar a representada")
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [id])

  function formatarData(valor: string) {
    const numeros = valor.replace(/\D/g, "")

    if (numeros.length <= 2) {
      return numeros
    }

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`
  }

  function formatarCNPJ(valor: string) {
    const numeros = valor.replace(/\D/g, "")

    if (numeros.length <= 2) {
      return numeros
    }

    if (numeros.length <= 5) {
      return `${numeros.slice(0, 2)}.${numeros.slice(2)}`
    }

    if (numeros.length <= 8) {
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`
    }

    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === "fechamentoComissao" || name === "pagamentoComissao") {
      setFormData({
        ...formData,
        [name]: formatarData(value),
      })
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" })
      }
      return
    }

    if (name === "cnpj") {
      setFormData({
        ...formData,
        [name]: formatarCNPJ(value),
      })
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" })
      }
      return
    }

    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleFaixaChange = (index: number, campo: string, valor: string) => {
    const novas = [...faixas]
    novas[index] = { ...novas[index], [campo]: valor }
    setFaixas(novas)

    if (errors.faixas) {
      setErrors({ ...errors, faixas: "" })
    }
  }

  const adicionarFaixa = () => {
    setFaixas([...faixas, { desconto: "", comissao: "" }])
  }

  const removerFaixa = (index: number) => {
    if (faixas.length > 1) {
      const novas = [...faixas]
      novas.splice(index, 1)
      setFaixas(novas)
    }
  }

  const validarFormulario = (): boolean => {
    const novoErros: Record<string, string> = {}

    if (!formData.nome.trim()) {
      novoErros.nome = "Nome é obrigatório"
    }

    if (!formData.cnpj.trim()) {
      novoErros.cnpj = "CNPJ é obrigatório"
    } else if (formData.cnpj.replace(/\D/g, "").length !== 14) {
      novoErros.cnpj = "CNPJ deve conter 14 dígitos"
    }

    if (!formData.emailPrincipal.trim()) {
      novoErros.emailPrincipal = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailPrincipal)) {
      novoErros.emailPrincipal = "Email inválido"
    }

    if (!formData.telefonePrincipal.trim()) {
      novoErros.telefonePrincipal = "Telefone é obrigatório"
    }

    if (tipoComissao === "fixa") {
      if (!formData.comissao.trim()) {
        novoErros.comissao = "Comissão fixa é obrigatória"
      } else if (isNaN(parseFloat(formData.comissao))) {
        novoErros.comissao = "Comissão deve ser um número"
      } else if (parseFloat(formData.comissao) <= 0) {
        novoErros.comissao = "Comissão deve ser maior que zero"
      }
    } else if (tipoComissao === "variada") {
      if (faixas.length === 0) {
        novoErros.faixas = "Adicione pelo menos uma faixa de comissão"
      } else {
        const faixasValidas = faixas.every((f) => f.desconto.trim() && f.comissao.trim())
        if (!faixasValidas) {
          novoErros.faixas = "Todas as faixas devem ter desconto e comissão"
        }
      }
    }

    setErrors(novoErros)
    return Object.keys(novoErros).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formData,
        tipoComissao,
        faixasComissao: tipoComissao === "variada" ? JSON.stringify(faixas) : null,
      }

      const response = await fetch(`/api/representadas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao atualizar representada")
      }

      alert("Representada atualizada com sucesso")
      router.push(`/representadas/${id}`)
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao atualizar representada"
      alert(mensagem)
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="font-semibold text-red-900">{erro}</h2>
            <p className="text-red-700 text-sm mt-1">Tente recarregar a página</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/representadas")}
          >
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/representadas/${id}`)}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Representada</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da representada"
                    disabled={loading}
                    className={errors.nome ? "border-red-500" : ""}
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    disabled={loading}
                    className={errors.cnpj ? "border-red-500" : ""}
                  />
                  {errors.cnpj && (
                    <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Inativa">Inativa</option>
                    <option value="Suspensa">Suspensa</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fechamentoComissao">Fechamento Comissão</Label>
                  <Input
                    id="fechamentoComissao"
                    name="fechamentoComissao"
                    value={formData.fechamentoComissao}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="pagamentoComissao">Pagamento Comissão</Label>
                  <Input
                    id="pagamentoComissao"
                    name="pagamentoComissao"
                    value={formData.pagamentoComissao}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="bancoComissao">Banco Pagador</Label>
                  <Input
                    id="bancoComissao"
                    name="bancoComissao"
                    value={formData.bancoComissao}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-900 mb-4">Tipo de Comissão</h3>

                <div className="flex gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="fixa"
                      value="fixa"
                      checked={tipoComissao === "fixa"}
                      onChange={(e) => setTipoComissao(e.target.value)}
                      disabled={loading}
                    />
                    <Label htmlFor="fixa" className="cursor-pointer">
                      Fixa
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="variada"
                      value="variada"
                      checked={tipoComissao === "variada"}
                      onChange={(e) => setTipoComissao(e.target.value)}
                      disabled={loading}
                    />
                    <Label htmlFor="variada" className="cursor-pointer">
                      Variada
                    </Label>
                  </div>
                </div>

                {tipoComissao === "fixa" && (
                  <div className="max-w-xs">
                    <Label htmlFor="comissao">Comissão (%) *</Label>
                    <Input
                      id="comissao"
                      type="number"
                      step="0.01"
                      name="comissao"
                      value={formData.comissao}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={loading}
                      className={errors.comissao ? "border-red-500" : ""}
                    />
                    {errors.comissao && (
                      <p className="text-red-500 text-sm mt-1">{errors.comissao}</p>
                    )}
                  </div>
                )}

                {tipoComissao === "variada" && (
                  <div className="space-y-4">
                    {errors.faixas && (
                      <p className="text-red-500 text-sm">{errors.faixas}</p>
                    )}
                    <div className="space-y-3">
                      {faixas.map((faixa, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Label>Desconto Mínimo (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={faixa.desconto}
                              onChange={(e) =>
                                handleFaixaChange(index, "desconto", e.target.value)
                              }
                              placeholder="0.00"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Comissão (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={faixa.comissao}
                              onChange={(e) =>
                                handleFaixaChange(index, "comissao", e.target.value)
                              }
                              placeholder="0.00"
                              disabled={loading}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removerFaixa(index)}
                            disabled={loading || faixas.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={adicionarFaixa}
                      disabled={loading}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Faixa
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contatoPrincipal">Contato Principal</Label>
                  <Input
                    id="contatoPrincipal"
                    name="contatoPrincipal"
                    value={formData.contatoPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="emailPrincipal">Email *</Label>
                  <Input
                    id="emailPrincipal"
                    name="emailPrincipal"
                    type="email"
                    value={formData.emailPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.emailPrincipal ? "border-red-500" : ""}
                  />
                  {errors.emailPrincipal && (
                    <p className="text-red-500 text-sm mt-1">{errors.emailPrincipal}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefonePrincipal">Telefone *</Label>
                  <Input
                    id="telefonePrincipal"
                    name="telefonePrincipal"
                    value={formData.telefonePrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.telefonePrincipal ? "border-red-500" : ""}
                  />
                  {errors.telefonePrincipal && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefonePrincipal}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="whatsappPrincipal">WhatsApp</Label>
                  <Input
                    id="whatsappPrincipal"
                    name="whatsappPrincipal"
                    value={formData.whatsappPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="estado">UF</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    maxLength={2}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Adicione observações sobre esta representada"
                disabled={loading}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Atualizar Representada"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/representadas/${id}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}