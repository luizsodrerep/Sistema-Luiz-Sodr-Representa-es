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
} from "lucide-react"

export default function EditarRepresentadaPage() {

  const router = useRouter()

  const params = useParams()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [loading, setLoading] = useState(false)

  const [tipoComissao, setTipoComissao] =
    useState("fixa")

  const [faixas, setFaixas] = useState([
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
    { desconto: "", comissao: "" },
  ])

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
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

    async function carregarRepresentada() {

      try {

        const response = await fetch(
          `/api/representadas/${id}`
        )

        if (!response.ok) {
          throw new Error("Erro ao carregar")
        }

        const data = await response.json()

        setFormData((prev) => ({
  ...prev,
  ...data,
}))

setTipoComissao(
  data.tipoComissao || "fixa"
)

if (data.faixasComissao) {
  try {
    setFaixas(
      JSON.parse(data.faixasComissao)
    )
  } catch {
    console.log("Erro ao carregar faixas")
  }
}

        if (data.tipoComissao) {
          setTipoComissao(data.tipoComissao)
        }

        if (data.faixasComissao) {

          try {

            setFaixas(
              JSON.parse(data.faixasComissao)
            )

          } catch (error) {

            console.error(error)

          }

        }

      } catch (error) {

        console.error(error)

        alert("Erro ao carregar representada")

      }

    }

    carregarRepresentada()

  }, [id])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

  }

  const handleFaixaChange = (
    index: number,
    campo: string,
    valor: string
  ) => {

    const novasFaixas = [...faixas]

    novasFaixas[index] = {
      ...novasFaixas[index],
      [campo]: valor,
    }

    setFaixas(novasFaixas)

  }

  const adicionarFaixa = () => {

    setFaixas([
      ...faixas,
      {
        desconto: "",
        comissao: "",
      },
    ])

  }

  const removerFaixa = (index: number) => {

    const novasFaixas = [...faixas]

    novasFaixas.splice(index, 1)

    setFaixas(novasFaixas)

  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    setLoading(true)

    try {

      const payload = {
        ...formData,

        tipoComissao,

        faixasComissao:
          tipoComissao === "variada"
            ? JSON.stringify(faixas)
            : null,
      }

      const response = await fetch(
        `/api/representadas/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error()
      }

      alert(
        "Representada atualizada com sucesso"
      )

      router.push(
        `/representadas/${id}`
      )

    } catch {

      alert(
        "Erro ao atualizar representada"
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="flex flex-col p-8 pt-6 max-w-5xl mx-auto">

      <div className="flex items-center gap-3 mb-6">

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              `/representadas/${id}`
            )
          }
        >

          <ArrowLeft className="h-4 w-4 mr-1" />

          Voltar

        </Button>

        <h1 className="text-3xl font-bold">

          Editar Representada

        </h1>

      </div>

      <form onSubmit={handleSubmit}>

        <div className="space-y-4">

          <Card>

            <CardHeader>

              <CardTitle>
                Dados Cadastrais
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <Label>
                    Nome *
                  </Label>

                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div>

                  <Label>
                    CNPJ
                  </Label>

                  <Input
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="grid grid-cols-3 gap-4">

                <div>

                  <Label>
                    Tipo Comissão
                  </Label>

                  <select
                    className="w-full border rounded-md h-10 px-3"
                    value={tipoComissao}
                    onChange={(e) =>
                      setTipoComissao(
                        e.target.value
                      )
                    }
                  >

                    <option value="fixa">
                      Fixa
                    </option>

                    <option value="variada">
                      Variada
                    </option>

                  </select>

                </div>

                <div>

                  <Label>
                    Fechamento Comissão
                  </Label>

                  <Input
                    name="fechamentoComissao"
                    value={
                      formData.fechamentoComissao
                    }
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>
                    Pagamento Comissão
                  </Label>

                  <Input
                    name="pagamentoComissao"
                    value={
                      formData.pagamentoComissao
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div>

                <Label>
                  Banco Comissão
                </Label>

                <Input
                  name="bancoComissao"
                  value={
                    formData.bancoComissao
                  }
                  onChange={handleChange}
                />

              </div>

              {tipoComissao === "fixa" && (

                <div>

                  <Label>
                    Comissão %
                  </Label>

                  <Input
                    name="comissao"
                    type="number"
                    step="0.01"
                    value={formData.comissao}
                    onChange={handleChange}
                  />

                </div>

              )}

              {tipoComissao === "variada" && (

                <div className="space-y-3">

                  <div className="font-medium">

                    Faixas de Comissão

                  </div>

                  {faixas.map(
                    (faixa, index) => (

                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-end"
                      >

                        <div className="col-span-5">

                          <Label>
                            % Desconto
                          </Label>

                          <Input
                            value={
                              faixa.desconto
                            }
                            onChange={(e) =>
                              handleFaixaChange(
                                index,
                                "desconto",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <div className="col-span-5">

                          <Label>
                            % Comissão
                          </Label>

                          <Input
                            value={
                              faixa.comissao
                            }
                            onChange={(e) =>
                              handleFaixaChange(
                                index,
                                "comissao",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <div className="col-span-2">

                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              removerFaixa(index)
                            }
                          >

                            <Trash2 className="h-4 w-4" />

                          </Button>

                        </div>

                      </div>

                    )
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={adicionarFaixa}
                  >

                    <Plus className="h-4 w-4 mr-1" />

                    Adicionar Faixa

                  </Button>

                </div>

              )}

            </CardContent>

          </Card>

          <Card>

            <CardHeader>

              <CardTitle>
                Contato Principal
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <Label>
                    Contato
                  </Label>

                  <Input
                    name="contatoPrincipal"
                    value={
                      formData.contatoPrincipal
                    }
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>
                    Email
                  </Label>

                  <Input
                    name="emailPrincipal"
                    value={
                      formData.emailPrincipal
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <Label>
                    Telefone
                  </Label>

                  <Input
                    name="telefonePrincipal"
                    value={
                      formData.telefonePrincipal
                    }
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>
                    WhatsApp
                  </Label>

                  <Input
                    name="whatsappPrincipal"
                    value={
                      formData.whatsappPrincipal
                    }
                    onChange={handleChange}
                  />

                </div>

              </div>

            </CardContent>

          </Card>

          <Card>

            <CardHeader>

              <CardTitle>
                Endereço
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div>

                <Label>
                  Endereço
                </Label>

                <Input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                />

              </div>

              <div className="grid grid-cols-3 gap-4">

                <div>

                  <Label>
                    Cidade
                  </Label>

                  <Input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>
                    UF
                  </Label>

                  <Input
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  />

                </div>

                <div>

                  <Label>
                    CEP
                  </Label>

                  <Input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                  />

                </div>

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

              <Textarea
                name="observacoes"
                value={
                  formData.observacoes
                }
                onChange={handleChange}
                rows={4}
              />

            </CardContent>

          </Card>

          <div className="flex gap-3">

            <Button
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Salvando..."
                : "Atualizar Representada"}

            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${id}`
                )
              }
            >

              Cancelar

            </Button>

          </div>

        </div>

      </form>

    </div>

  )

}