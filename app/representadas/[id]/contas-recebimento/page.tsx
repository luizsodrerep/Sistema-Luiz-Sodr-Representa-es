"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Landmark,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"

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

type ContaBancaria = {
  id: string
  escritorioId: string
  empresaEscritorioId: string | null
  usuarioTitularId: string | null
  nome: string
  banco: string
  tipoTitular: string
  titular: string | null
  agencia: string | null
  conta: string | null
  pix: string | null
  ativa: boolean

  empresaEscritorio?: {
    id: string
    razaoSocial: string
    nomeFantasia: string | null
    cnpj: string | null
    status: string
  } | null

  usuarioTitular?: {
    id: string
    nome: string
    email: string | null
    ativo: boolean
  } | null
}

type VinculoRecebimento = {
  id: string
  representadaId: string
  contaBancariaId: string
  tipoRecebimento: string
  percentualDestino: number | null
  ativa: boolean
  observacoes: string | null
  contaBancaria: ContaBancaria
}

type Representada = {
  id: string
  nome: string
  codigo: string | null
}

type FormRecebimento = {
  contaBancariaId: string
  tipoRecebimento: string
  percentualDestino: string
  ativa: boolean
  observacoes: string
}

const FORM_INICIAL: FormRecebimento = {
  contaBancariaId: "",
  tipoRecebimento: "Comissao",
  percentualDestino: "100",
  ativa: true,
  observacoes: "",
}

export default function ContasRecebimentoPage() {
  const params = useParams()
  const router = useRouter()

  const idParam = params.id

  const representadaId =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
        ? idParam[0]
        : undefined

  const [representada, setRepresentada] =
    useState<Representada | null>(null)

  const [contas, setContas] =
    useState<ContaBancaria[]>([])

  const [vinculos, setVinculos] =
    useState<VinculoRecebimento[]>([])

  const [form, setForm] =
    useState<FormRecebimento>(FORM_INICIAL)

  const [vinculoEditandoId, setVinculoEditandoId] =
    useState<string | null>(null)

  const [carregando, setCarregando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  const [erro, setErro] =
    useState<string | null>(null)

  useEffect(() => {
    if (!representadaId) {
      setErro("ID da representada não encontrado.")
      setCarregando(false)
      return
    }

    async function carregarDados() {
      try {
        setCarregando(true)
        setErro(null)

        const [
          respostaRepresentada,
          respostaVinculos,
          respostaContas,
        ] = await Promise.all([
          fetch(
            `/api/representadas/${representadaId}`
          ),
          fetch(
            `/api/representadas/${representadaId}/contas-recebimento`
          ),
          fetch("/api/contas-bancarias"),
        ])

        if (!respostaRepresentada.ok) {
          throw new Error(
            "Erro ao carregar representada."
          )
        }

        if (!respostaVinculos.ok) {
          throw new Error(
            "Erro ao carregar contas de recebimento."
          )
        }

        if (!respostaContas.ok) {
          throw new Error(
            "Erro ao carregar contas bancárias."
          )
        }

        const dadosRepresentada: Representada =
          await respostaRepresentada.json()

        const dadosVinculos: VinculoRecebimento[] =
          await respostaVinculos.json()

        const dadosContas: ContaBancaria[] =
          await respostaContas.json()

        setRepresentada(dadosRepresentada)
        setVinculos(dadosVinculos)
        setContas(
          dadosContas.filter(
            (conta) => conta.ativa
          )
        )
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Erro ao carregar dados."

        setErro(mensagem)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [representadaId])

  function atualizarCampo<
    K extends keyof FormRecebimento,
  >(
    campo: K,
    valor: FormRecebimento[K]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))

    if (erro) {
      setErro(null)
    }
  }

  function limparFormulario() {
    setForm(FORM_INICIAL)
    setVinculoEditandoId(null)
    setErro(null)
  }

  function editarVinculo(
    vinculo: VinculoRecebimento
  ) {
    setVinculoEditandoId(vinculo.id)

    setForm({
      contaBancariaId:
        vinculo.contaBancariaId,

      tipoRecebimento:
        vinculo.tipoRecebimento,

      percentualDestino:
        vinculo.percentualDestino?.toString() ||
        "",

      ativa:
        vinculo.ativa,

      observacoes:
        vinculo.observacoes || "",
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function recarregarVinculos() {
    if (!representadaId) {
      return
    }

    const resposta = await fetch(
      `/api/representadas/${representadaId}/contas-recebimento`
    )

    if (!resposta.ok) {
      throw new Error(
        "Erro ao atualizar contas de recebimento."
      )
    }

    const dados: VinculoRecebimento[] =
      await resposta.json()

    setVinculos(dados)
  }

  async function salvarVinculo(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!representadaId) {
      setErro(
        "ID da representada não encontrado."
      )
      return
    }

    if (!form.contaBancariaId) {
      setErro(
        "Selecione uma conta bancária."
      )
      return
    }

    if (!form.tipoRecebimento.trim()) {
      setErro(
        "Informe o tipo de recebimento."
      )
      return
    }

    if (
      form.percentualDestino &&
      (
        Number(form.percentualDestino) <= 0 ||
        Number(form.percentualDestino) > 100
      )
    ) {
      setErro(
        "Percentual de destino deve ser maior que zero e menor ou igual a 100."
      )
      return
    }

    try {
      setSalvando(true)
      setErro(null)

      const payload = {
        contaBancariaId:
          form.contaBancariaId,

        tipoRecebimento:
          form.tipoRecebimento.trim(),

        percentualDestino:
          form.percentualDestino || null,

        ativa:
          form.ativa,

        observacoes:
          form.observacoes || null,
      }

      const url =
        vinculoEditandoId
          ? `/api/representadas/${representadaId}/contas-recebimento/${vinculoEditandoId}`
          : `/api/representadas/${representadaId}/contas-recebimento`

      const resposta = await fetch(url, {
        method:
          vinculoEditandoId
            ? "PUT"
            : "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      })

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            "Erro ao salvar conta de recebimento."
        )
      }

      await recarregarVinculos()
      limparFormulario()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao salvar conta de recebimento."

      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirVinculo(
    vinculo: VinculoRecebimento
  ) {
    if (!representadaId) {
      return
    }

    const confirmado =
      window.confirm(
        `Excluir o vínculo com a conta "${vinculo.contaBancaria.nome}"?`
      )

    if (!confirmado) {
      return
    }

    try {
      const resposta = await fetch(
        `/api/representadas/${representadaId}/contas-recebimento/${vinculo.id}`,
        {
          method: "DELETE",
        }
      )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            "Erro ao excluir conta de recebimento."
        )
      }

      await recarregarVinculos()

      if (
        vinculoEditandoId === vinculo.id
      ) {
        limparFormulario()
      }
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao excluir conta de recebimento."

      alert(mensagem)
    }
  }

  function descricaoConta(
    conta: ContaBancaria
  ) {
    const partes = [
      conta.nome,
      conta.banco,
      conta.tipoTitular,
    ]

    if (conta.titular) {
      partes.push(conta.titular)
    }

    return partes.join(" - ")
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando contas de recebimento...
        </div>
      </div>
    )
  }

  if (!representadaId) {
    return (
      <div className="p-6">
        ID da representada não encontrado.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${representadaId}`
                )
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div>
              <h1 className="text-2xl font-bold">
                Contas de Recebimento
              </h1>

              <p className="text-sm text-muted-foreground">
                {representada?.nome ||
                  "Representada"}
                {representada?.codigo
                  ? ` • ${representada.codigo}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {vinculos.length} vínculo
            {vinculos.length === 1
              ? ""
              : "s"}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />

                {vinculoEditandoId
                  ? "Editar conta de recebimento"
                  : "Nova conta de recebimento"}
              </CardTitle>

              {vinculoEditandoId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={limparFormulario}
                  disabled={salvando}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar edição
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={salvarVinculo}
              className="space-y-5"
            >
              {erro && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-3 text-sm">
                  {erro}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="contaBancariaId">
                    Conta bancária *
                  </Label>

                  <select
                    id="contaBancariaId"
                    value={
                      form.contaBancariaId
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "contaBancariaId",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Selecione
                    </option>

                    {contas.map((conta) => (
                      <option
                        key={conta.id}
                        value={conta.id}
                      >
                        {descricaoConta(conta)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tipoRecebimento">
                    Tipo de recebimento *
                  </Label>

                  <select
                    id="tipoRecebimento"
                    value={
                      form.tipoRecebimento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "tipoRecebimento",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Comissao">
                      Comissão
                    </option>
                    <option value="Rateio">
                      Rateio
                    </option>
                    <option value="Principal">
                      Principal
                    </option>
                    <option value="Outro">
                      Outro
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="percentualDestino">
                    Percentual de destino (%)
                  </Label>

                  <Input
                    id="percentualDestino"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={
                      form.percentualDestino
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "percentualDestino",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ativa">
                    Status
                  </Label>

                  <select
                    id="ativa"
                    value={
                      form.ativa
                        ? "ativa"
                        : "inativa"
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "ativa",
                        event.target.value ===
                          "ativa"
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="ativa">
                      Ativa
                    </option>
                    <option value="inativa">
                      Inativa
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="observacoes">
                  Observações
                </Label>

                <Textarea
                  id="observacoes"
                  value={
                    form.observacoes
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "observacoes",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {vinculoEditandoId ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}

                      {vinculoEditandoId
                        ? "Salvar alterações"
                        : "Adicionar conta"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Contas vinculadas
            </CardTitle>
          </CardHeader>

          <CardContent>
            {vinculos.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                Nenhuma conta de recebimento vinculada.
              </div>
            ) : (
              <div className="space-y-3">
                {vinculos.map((vinculo) => (
                  <div
                    key={vinculo.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="font-semibold">
                            {
                              vinculo
                                .contaBancaria
                                .nome
                            }
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              vinculo.ativa
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {vinculo.ativa
                              ? "Ativa"
                              : "Inativa"}
                          </span>

                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {
                              vinculo.tipoRecebimento
                            }
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          <p>
                            Banco:{" "}
                            {
                              vinculo
                                .contaBancaria
                                .banco
                            }
                          </p>

                          <p>
                            Titular:{" "}
                            {vinculo
                              .contaBancaria
                              .titular || "-"}
                          </p>

                          <p>
                            Tipo titular:{" "}
                            {
                              vinculo
                                .contaBancaria
                                .tipoTitular
                            }
                          </p>

                          <p>
                            Agência:{" "}
                            {vinculo
                              .contaBancaria
                              .agencia || "-"}
                          </p>

                          <p>
                            Conta:{" "}
                            {vinculo
                              .contaBancaria
                              .conta || "-"}
                          </p>

                          <p>
                            PIX:{" "}
                            {vinculo
                              .contaBancaria
                              .pix || "-"}
                          </p>

                          <p>
                            Destino:{" "}
                            {vinculo.percentualDestino ??
                              "-"}
                            {vinculo.percentualDestino !==
                            null
                              ? "%"
                              : ""}
                          </p>
                        </div>

                        {vinculo.observacoes && (
                          <p className="text-sm text-muted-foreground">
                            {vinculo.observacoes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            editarVinculo(
                              vinculo
                            )
                          }
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            excluirVinculo(
                              vinculo
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}