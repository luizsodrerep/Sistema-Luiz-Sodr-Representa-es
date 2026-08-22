"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function NovaRepresentadaPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [tipoComissao, setTipoComissao] = useState("fixa")

  const [faixas, setFaixas] = useState([
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
  ])

  const [formData, setFormData] = useState({
    nome: "",
    codigo: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    if (name === "fechamentoComissao" || name === "pagamentoComissao") {
      setFormData({
        ...formData,
        [name]: formatarData(value),
      })
      return
    }

    if (name === "cnpj") {
      setFormData({
        ...formData,
        [name]: formatarCNPJ(value),
      })
      return
    }

    setFormData({
      ...formData,
      [name]: value,
    })

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleFaixaChange = (index: number, campo: string, valor: string) => {
    const novasFaixas = [...faixas]
    novasFaixas[index] = { ...novasFaixas[index], [campo]: valor }
    setFaixas(novasFaixas)

    if (errors.faixas) {
      setErrors({
        ...errors,
        faixas: "",
      })
    }
  }

  const adicionarFaixa = () => {
    setFaixas([...faixas, { desconto: "", comissao: "" }])
  }

  const removerFaixa = (index: number) => {
    if (faixas.length > 1) {
      const novasFaixas = [...faixas]
      novasFaixas.splice(index, 1)
      setFaixas(novasFaixas)
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
        const faixasValidas = faixas.every(
          (f) => f.desconto.trim() && f.comissao.trim()
        )

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
        faixasComissao:
          tipoComissao === "variada" ? JSON.stringify(faixas) : null,
      }

      const response = await fetch("/api/representadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erro ao cadastrar representada")
      }

      alert("Representada cadastrada com sucesso")
      router.push("/representadas")
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar representada"

      alert(mensagem)
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            Nova Representada
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="codigo">Código</Label>

                  <Input
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>

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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cnpj}
                    </p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contatoPrincipal">
                    Contato Principal
                  </Label>

                  <Input
                    id="contatoPrincipal"
                    name="contatoPrincipal"
                    value={formData.contatoPrincipal}
                    onChange={handleChange}
                    placeholder="Nome do contato"
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
                    placeholder="email@exemplo.com"
                    disabled={loading}
                    className={
                      errors.emailPrincipal ? "border-red-500" : ""
                    }
                  />

                  {errors.emailPrincipal && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.emailPrincipal}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefonePrincipal">Telefone *</Label>

                  <Input
                    id="telefonePrincipal"
                    name="telefonePrincipal"
                    value={formData.telefonePrincipal}
                    onChange={handleChange}
                    placeholder="(00) 0000-0000"
                    disabled={loading}
                    className={
                      errors.telefonePrincipal ? "border-red-500" : ""
                    }
                  />

                  {errors.telefonePrincipal && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.telefonePrincipal}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="whatsappPrincipal">WhatsApp</Label>

                  <Input
                    id="whatsappPrincipal"
                    name="whatsappPrincipal"
                    value={formData.whatsappPrincipal}
                    onChange={handleChange}
                    placeholder="(00) 99999-9999"
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
                  placeholder="Rua, número, complemento"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>

                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>

                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="SP"
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
              <CardTitle>Comissão</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="fixa"
                    name="tipoComissao"
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
                    name="tipoComissao"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comissao">Comissão (%) *</Label>

                    <Input
                      id="comissao"
                      name="comissao"
                      type="number"
                      step="0.01"
                      value={formData.comissao}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={loading}
                      className={errors.comissao ? "border-red-500" : ""}
                    />

                    {errors.comissao && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.comissao}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bancoComissao">
                      Banco para Comissão
                    </Label>

                    <Input
                      id="bancoComissao"
                      name="bancoComissao"
                      value={formData.bancoComissao}
                      onChange={handleChange}
                      placeholder="Nome do banco"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {tipoComissao === "variada" && (
                <div className="space-y-4">
                  {errors.faixas && (
                    <p className="text-red-500 text-sm">
                      {errors.faixas}
                    </p>
                  )}

                  <div className="space-y-3">
                    {faixas.map((faixa, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-end"
                      >
                        <div className="flex-1">
                          <Label>Desconto Mínimo (%)</Label>

                          <Input
                            type="number"
                            step="0.01"
                            value={faixa.desconto}
                            onChange={(e) =>
                              handleFaixaChange(
                                index,
                                "desconto",
                                e.target.value
                              )
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
                              handleFaixaChange(
                                index,
                                "comissao",
                                e.target.value
                              )
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechamentoComissao">
                    Fechamento Comissão
                  </Label>

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
                  <Label htmlFor="pagamentoComissao">
                    Pagamento Comissão
                  </Label>

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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>

            <CardContent>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Adicione observações sobre esta representada"
                disabled={loading}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Representada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}