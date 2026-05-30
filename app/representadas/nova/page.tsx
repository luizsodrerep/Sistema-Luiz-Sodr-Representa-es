"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  Lock,
  Gem,
  Ban,
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
  ie: string
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
  numero: string
  complemento: string
  bairro: string
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
  ie: string
  comissao: string
  fechamentoComissao: string
  pagamentoComissao: string
  bancoComissao: string
  contatoPrincipal: string
  emailPrincipal: string
  telefonePrincipal: string
  whatsappPrincipal: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
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
    ie: "",
    comissao: "",
    fechamentoComissao: "",
    pagamentoComissao: "",
    bancoComissao: "",
    contatoPrincipal: "",
    emailPrincipal: "",
    telefonePrincipal: "",
    whatsappPrincipal: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
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
        if (!response.ok) throw new Error("Erro ao carregar representada")
        const data: Representada = await response.json()
        setFormData({
          codigo: data.codigo || "",
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          ie: data.ie || "",
          comissao: data.comissao?.toString() || "",
          fechamentoComissao: data.fechamentoComissao || "",
          pagamentoComissao: data.pagamentoComissao || "",
          bancoComissao: data.bancoComissao || "",
          contatoPrincipal: data.contatoPrincipal || "",
          emailPrincipal: data.emailPrincipal || "",
          telefonePrincipal: data.telefonePrincipal || "",
          whatsappPrincipal: data.whatsappPrincipal || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
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
            if (Array.isArray(parsed) && parsed.length > 0) setFaixas(parsed)
          } catch (error) {
            console.error("Erro ao fazer parse de faixas:", error)
          }
        }
      } catch (error) {
        setErro("Erro ao carregar a representada")
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

  function formatarCNPJ(valor: string) {
    const numeros = valor.replace(/\D/g, "")
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`
    if (numeros.length <= 8)
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === "cnpj") {
      setFormData({ ...formData, [name]: formatarCNPJ(value) })
      if (errors[name]) setErrors({ ...errors, [name]: "" })
      return
    }
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const handleFaixaChange = (index: number, campo: string, valor: string) => {
    const novas = [...faixas]
    novas[index] = { ...novas[index], [campo]: valor }
    setFaixas(novas)
    if (errors.faixas) setErrors({ ...errors, faixas: "" })
  }

  const adicionarFaixa = () => setFaixas([...faixas, { desconto: "", comissao: "" }])
  const removerFaixa = (index: number) => {
    if (faixas.length > 1) {
      const novas = [...faixas]
      novas.splice(index, 1)
      setFaixas(novas)
    }
  }

  const validarFormulario = (): boolean => {
    const novoErros: Record<string, string> = {}
    if (!formData.nome.trim()) novoErros.nome = "Nome é obrigatório"
    if (!formData.cnpj.trim()) novoErros.cnpj = "CNPJ é obrigatório"
    else if (formData.cnpj.replace(/\D/g, "").length !== 14)
      novoErros.cnpj = "CNPJ deve conter 14 dígitos"
    if (!formData.emailPrincipal.trim()) novoErros.emailPrincipal = "Email é obrigatório"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailPrincipal))
      novoErros.emailPrincipal = "Email inválido"
    if (!formData.telefonePrincipal.trim()) novoErros.telefonePrincipal = "Telefone é obrigatório"
    if (tipoComissao === "fixa") {
      if (!formData.comissao.trim()) novoErros.comissao = "Comissão fixa é obrigatória"
      else if (isNaN(parseFloat(formData.comissao))) novoErros.comissao = "Comissão deve ser um número"
      else if (parseFloat(formData.comissao) <= 0) novoErros.comissao = "Comissão deve ser maior que zero"
    } else if (tipoComissao === "variada") {
      if (faixas.length === 0) novoErros.faixas = "Adicione pelo menos uma faixa de comissão"
      else {
        const faixasValidas = faixas.some((f) => f.desconto.trim() && f.comissao.trim())
        if (!faixasValidas) novoErros.faixas = "Preencha pelo menos uma faixa de comissão"
      }
    }
    setErrors(novoErros)
    return Object.keys(novoErros).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return
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
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar representada"
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto p-4 space-y-6">

        {/* ===== HEADER COM CÓDIGO E STATUS ===== */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/representadas/${id}`)}
              disabled={loading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Editar Representada</h1>
          </div>

          {/* CÓDIGO E STATUS LADO A LADO */}
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Código:</span>
              <span className="text-sm font-bold text-blue-600">{formData.codigo || "—"}</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Status:</span>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="px-2 py-1 text-xs font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="Ativa">Ativa</option>
                <option value="Inativa">Inativa</option>
                <option value="Suspensa">Suspensa</option>
              </select>

              {/* ÍCONES COM EMOJIS BASEADO NO STATUS */}
              <div className="flex items-center gap-1">
                {formData.status === "Ativa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-md">
                    <Gem className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                )}
                {formData.status === "Inativa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                )}
                {formData.status === "Suspensa" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-md">
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== FORMULÁRIO PRINCIPAL ===== */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ===== CARD: DADOS CADASTRAIS ===== */}
          <Card className="shadow border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* LINHA 1: Nome */}
              <div>
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={loading}
                  className={`mt-1 ${errors.nome ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="Nome da representada"
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                )}
              </div>

              {/* LINHA 2: CNPJ e I.E. */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                    CNPJ *
                  </Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    maxLength={18}
                    disabled={loading}
                    className={`mt-1 ${errors.cnpj ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ie" className="text-sm font-medium text-gray-700">
                    Inscrição Estadual
                  </Label>
                  <Input
                    id="ie"
                    name="ie"
                    value={formData.ie}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="I.E."
                  />
                </div>
              </div>

              {/* LINHA 3: Datas e Banco */}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="fechamentoComissao" className="text-sm font-medium text-gray-700">
                    Fechamento Comissão
                  </Label>
                  <Input
                    id="fechamentoComissao"
                    name="fechamentoComissao"
                    value={formData.fechamentoComissao}
                    onChange={handleChange}
                    maxLength={10}
                    disabled={loading}
                    className="mt-1"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <Label htmlFor="pagamentoComissao" className="text-sm font-medium text-gray-700">
                    Pagamento Comissão
                  </Label>
                  <Input
                    id="pagamentoComissao"
                    name="pagamentoComissao"
                    value={formData.pagamentoComissao}
                    onChange={handleChange}
                    maxLength={10}
                    disabled={loading}
                    className="mt-1"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <Label htmlFor="bancoComissao" className="text-sm font-medium text-gray-700">
                    Banco Pagador
                  </Label>
                  <Input
                    id="bancoComissao"
                    name="bancoComissao"
                    value={formData.bancoComissao}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Banco"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== CARD: TIPO DE COMISSÃO ===== */}
          <Card className="shadow border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Tipo de Comissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* SELETOR: FIXA OU VARIADA */}
              <div className="flex gap-6 mb-6">
                <button
                  type="button"
                  onClick={() => setTipoComissao("fixa")}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    tipoComissao === "fixa"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                  } disabled:opacity-50`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoComissao === "fixa"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-400"
                  }`}>
                    {tipoComissao === "fixa" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Comissão Fixa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoComissao("variada")}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    tipoComissao === "variada"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                  } disabled:opacity-50`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    tipoComissao === "variada"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-400"
                  }`}>
                    {tipoComissao === "variada" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Comissão Variada</span>
                </button>
              </div>

              {/* COMISSÃO FIXA */}
              {tipoComissao === "fixa" && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="comissao" className="text-sm font-semibold text-gray-900 block mb-2">
                    Percentual de Comissão *
                  </Label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <Input
                      id="comissao"
                      type="number"
                      step="0.01"
                      name="comissao"
                      value={formData.comissao}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={loading}
                      className={`text-lg font-bold text-blue-600 ${errors.comissao ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    <span className="text-lg font-bold text-blue-600">%</span>
                  </div>
                  {errors.comissao && (
                    <p className="text-red-500 text-xs mt-2">{errors.comissao}</p>
                  )}
                </div>
              )}

              {/* COMISSÃO VARIADA */}
              {tipoComissao === "variada" && (
                <div className="space-y-3">
                  {errors.faixas && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-700 text-xs font-medium">{errors.faixas}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {faixas.map((faixa, index) => (
                      <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <Label className="text-xs font-semibold text-gray-700 uppercase">Desconto (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={faixa.desconto}
                            onChange={(e) =>
                              handleFaixaChange(index, "desconto", e.target.value)
                            }
                            placeholder="0.00"
                            disabled={loading}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs font-semibold text-gray-700 uppercase">Comissão (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={faixa.comissao}
                            onChange={(e) =>
                              handleFaixaChange(index, "comissao", e.target.value)
                            }
                            placeholder="0.00"
                            disabled={loading}
                            className="mt-1 text-sm"
                          />
                        </div>
                        {faixas.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removerFaixa(index)}
                            disabled={loading}
                            className="h-10 w-10"
                            title="Remover faixa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {faixas.length < 10 && (
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
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ===== CARD: CONTATO ===== */}
          <Card className="shadow border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="contatoPrincipal" className="text-sm font-medium text-gray-700">
                    Nome do Contato
                  </Label>
                  <Input
                    id="contatoPrincipal"
                    name="contatoPrincipal"
                    value={formData.contatoPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Contato"
                  />
                </div>
                <div>
                  <Label htmlFor="emailPrincipal" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="emailPrincipal"
                    name="emailPrincipal"
                    type="email"
                    value={formData.emailPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className={`mt-1 ${errors.emailPrincipal ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="email@example.com"
                  />
                  {errors.emailPrincipal && (
                    <p className="text-red-500 text-xs mt-1">{errors.emailPrincipal}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telefonePrincipal" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </Label>
                  <Input
                    id="telefonePrincipal"
                    name="telefonePrincipal"
                    value={formData.telefonePrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className={`mt-1 ${errors.telefonePrincipal ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefonePrincipal && (
                    <p className="text-red-500 text-xs mt-1">{errors.telefonePrincipal}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="whatsappPrincipal" className="text-sm font-medium text-gray-700">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsappPrincipal"
                    name="whatsappPrincipal"
                    value={formData.whatsappPrincipal}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== CARD: ENDEREÇO ===== */}
          <Card className="shadow border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              
              {/* LOGRADOURO E NÚMERO NA MESMA LINHA */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-4">
                  <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                    Logradouro
                  </Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                    Nº
                  </Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={5}
                    className="mt-1 text-center"
                    placeholder="000"
                  />
                </div>
              </div>

              {/* COMPLEMENTO E BAIRRO */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                    Complemento
                  </Label>
                  <Input
                    id="complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Apto, sala, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                    Bairro
                  </Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Bairro"
                  />
                </div>
              </div>

              {/* CIDADE, UF E CEP */}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                    UF
                  </Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    maxLength={2}
                    disabled={loading}
                    className="mt-1"
                    placeholder="SP"
                  />
                </div>
                <div>
                  <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== CARD: OBSERVAÇÕES ===== */}
          <Card className="shadow border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Adicione observações sobre esta representada..."
                disabled={loading}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Atualizar"
              )}
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