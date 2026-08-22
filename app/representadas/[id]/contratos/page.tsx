"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
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

type EmpresaEscritorio = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type Contrato = {
  id: string
  representadaId: string
  empresaEscritorioId: string | null
  tipoFormalizacao: string
  descricao: string | null
  dataInicio: string | null
  dataEncerramento: string | null
  vigente: boolean
  ultimaRevisaoEm: string | null
  proximaRevisaoEm: string | null
  motivoEncerramento: string | null
  arquivoUrl: string | null
  origemDocumento: string | null
  observacoes: string | null

  empresaEscritorio: EmpresaEscritorio | null

  _count: {
    regrasComerciais: number
  }
}

type Representada = {
  id: string
  nome: string
  codigo: string | null
}

type FormContrato = {
  empresaEscritorioId: string
  tipoFormalizacao: string
  descricao: string
  dataInicio: string
  dataEncerramento: string
  vigente: boolean
  ultimaRevisaoEm: string
  proximaRevisaoEm: string
  motivoEncerramento: string
  arquivoUrl: string
  origemDocumento: string
  observacoes: string
}

const FORM_INICIAL: FormContrato = {
  empresaEscritorioId: "",
  tipoFormalizacao: "",
  descricao: "",
  dataInicio: "",
  dataEncerramento: "",
  vigente: true,
  ultimaRevisaoEm: "",
  proximaRevisaoEm: "",
  motivoEncerramento: "",
  arquivoUrl: "",
  origemDocumento: "",
  observacoes: "",
}

function formatarData(valor: string | null) {
  if (!valor) {
    return "-"
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-BR").format(data)
}

function converterDataParaInput(
  valor: string | null
) {
  if (!valor) {
    return ""
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return ""
  }

  const ano = data.getUTCFullYear()
  const mes = String(
    data.getUTCMonth() + 1
  ).padStart(2, "0")
  const dia = String(
    data.getUTCDate()
  ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

export default function ContratosRepresentadaPage() {
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

  const [empresas, setEmpresas] =
    useState<EmpresaEscritorio[]>([])

  const [contratos, setContratos] =
    useState<Contrato[]>([])

  const [form, setForm] =
    useState<FormContrato>(FORM_INICIAL)

  const [contratoEditandoId, setContratoEditandoId] =
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
          responseRepresentada,
          responseContratos,
          responseEmpresas,
        ] = await Promise.all([
          fetch(
            `/api/representadas/${representadaId}`
          ),
          fetch(
            `/api/representadas/${representadaId}/contratos`
          ),
          fetch("/api/empresas-escritorio"),
        ])

        if (!responseRepresentada.ok) {
          throw new Error(
            "Erro ao carregar representada."
          )
        }

        if (!responseContratos.ok) {
          throw new Error(
            "Erro ao carregar contratos."
          )
        }

        if (!responseEmpresas.ok) {
          throw new Error(
            "Erro ao carregar empresas do escritório."
          )
        }

        const dadosRepresentada: Representada =
          await responseRepresentada.json()

        const dadosContratos: Contrato[] =
          await responseContratos.json()

        const dadosEmpresas: EmpresaEscritorio[] =
          await responseEmpresas.json()

        setRepresentada(dadosRepresentada)
        setContratos(dadosContratos)
        setEmpresas(dadosEmpresas)
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
    K extends keyof FormContrato,
  >(
    campo: K,
    valor: FormContrato[K]
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
    setContratoEditandoId(null)
    setErro(null)
  }

  function editarContrato(contrato: Contrato) {
    setContratoEditandoId(contrato.id)

    setForm({
      empresaEscritorioId:
        contrato.empresaEscritorioId || "",

      tipoFormalizacao:
        contrato.tipoFormalizacao,

      descricao:
        contrato.descricao || "",

      dataInicio:
        converterDataParaInput(
          contrato.dataInicio
        ),

      dataEncerramento:
        converterDataParaInput(
          contrato.dataEncerramento
        ),

      vigente:
        contrato.vigente,

      ultimaRevisaoEm:
        converterDataParaInput(
          contrato.ultimaRevisaoEm
        ),

      proximaRevisaoEm:
        converterDataParaInput(
          contrato.proximaRevisaoEm
        ),

      motivoEncerramento:
        contrato.motivoEncerramento || "",

      arquivoUrl:
        contrato.arquivoUrl || "",

      origemDocumento:
        contrato.origemDocumento || "",

      observacoes:
        contrato.observacoes || "",
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function recarregarContratos() {
    if (!representadaId) {
      return
    }

    const response = await fetch(
      `/api/representadas/${representadaId}/contratos`
    )

    if (!response.ok) {
      throw new Error(
        "Erro ao atualizar lista de contratos."
      )
    }

    const dados: Contrato[] =
      await response.json()

    setContratos(dados)
  }

  async function salvarContrato(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!representadaId) {
      setErro(
        "ID da representada não encontrado."
      )
      return
    }

    if (!form.tipoFormalizacao.trim()) {
      setErro(
        "Informe o tipo de formalização."
      )
      return
    }

    if (
      form.vigente &&
      form.dataEncerramento
    ) {
      setErro(
        "Contrato vigente não pode possuir data de encerramento."
      )
      return
    }

    try {
      setSalvando(true)
      setErro(null)

      const payload = {
        empresaEscritorioId:
          form.empresaEscritorioId || null,

        tipoFormalizacao:
          form.tipoFormalizacao.trim(),

        descricao:
          form.descricao || null,

        dataInicio:
          form.dataInicio || null,

        dataEncerramento:
          form.dataEncerramento || null,

        vigente:
          form.vigente,

        ultimaRevisaoEm:
          form.ultimaRevisaoEm || null,

        proximaRevisaoEm:
          form.proximaRevisaoEm || null,

        motivoEncerramento:
          form.motivoEncerramento || null,

        arquivoUrl:
          form.arquivoUrl || null,

        origemDocumento:
          form.origemDocumento || null,

        observacoes:
          form.observacoes || null,
      }

      const url =
        contratoEditandoId
          ? `/api/representadas/${representadaId}/contratos/${contratoEditandoId}`
          : `/api/representadas/${representadaId}/contratos`

      const response = await fetch(url, {
        method:
          contratoEditandoId
            ? "PUT"
            : "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      })

      const dados = await response.json()

      if (!response.ok) {
        throw new Error(
          dados.message ||
            "Erro ao salvar contrato."
        )
      }

      await recarregarContratos()

      limparFormulario()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao salvar contrato."

      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirContrato(
    contrato: Contrato
  ) {
    if (!representadaId) {
      return
    }

    if (
      contrato._count.regrasComerciais > 0
    ) {
      alert(
        "Este contrato possui regras comerciais vinculadas e não pode ser excluído."
      )
      return
    }

    const confirmado = window.confirm(
      `Excluir o contrato "${contrato.tipoFormalizacao}"?`
    )

    if (!confirmado) {
      return
    }

    try {
      const response = await fetch(
        `/api/representadas/${representadaId}/contratos/${contrato.id}`,
        {
          method: "DELETE",
        }
      )

      const dados = await response.json()

      if (!response.ok) {
        throw new Error(
          dados.message ||
            "Erro ao excluir contrato."
        )
      }

      await recarregarContratos()

      if (
        contratoEditandoId === contrato.id
      ) {
        limparFormulario()
      }
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao excluir contrato."

      alert(mensagem)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando contratos...
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
                Contratos
              </h1>

              <p className="text-sm text-muted-foreground">
                {representada?.nome || "Representada"}
                {representada?.codigo
                  ? ` • ${representada.codigo}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {contratos.length} contrato
            {contratos.length === 1
              ? ""
              : "s"}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />

                {contratoEditandoId
                  ? "Editar contrato"
                  : "Novo contrato"}
              </CardTitle>

              {contratoEditandoId && (
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
              onSubmit={salvarContrato}
              className="space-y-5"
            >
              {erro && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-3 text-sm">
                  {erro}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="tipoFormalizacao">
                    Tipo de formalização *
                  </Label>

                  <select
                    id="tipoFormalizacao"
                    value={
                      form.tipoFormalizacao
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "tipoFormalizacao",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="Fisico">
                      Físico
                    </option>
                    <option value="Digital">
                      Digital
                    </option>
                    <option value="E-mail">
                      E-mail
                    </option>
                    <option value="Verbal">
                      Verbal
                    </option>
                    <option value="Outro">
                      Outro
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="empresaEscritorioId">
                    Empresa do escritório
                  </Label>

                  <select
                    id="empresaEscritorioId"
                    value={
                      form.empresaEscritorioId
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "empresaEscritorioId",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Sem empresa vinculada
                    </option>

                    {empresas.map((empresa) => (
                      <option
                        key={empresa.id}
                        value={empresa.id}
                      >
                        {empresa.nomeFantasia ||
                          empresa.razaoSocial}
                        {empresa.cnpj
                          ? ` - ${empresa.cnpj}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="descricao">
                  Descrição
                </Label>

                <Input
                  id="descricao"
                  value={form.descricao}
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dataInicio">
                    Início
                  </Label>

                  <Input
                    id="dataInicio"
                    type="date"
                    value={form.dataInicio}
                    onChange={(event) =>
                      atualizarCampo(
                        "dataInicio",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dataEncerramento">
                    Encerramento
                  </Label>

                  <Input
                    id="dataEncerramento"
                    type="date"
                    value={
                      form.dataEncerramento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "dataEncerramento",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando ||
                      form.vigente
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ultimaRevisaoEm">
                    Última revisão
                  </Label>

                  <Input
                    id="ultimaRevisaoEm"
                    type="date"
                    value={
                      form.ultimaRevisaoEm
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "ultimaRevisaoEm",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="proximaRevisaoEm">
                    Próxima revisão
                  </Label>

                  <Input
                    id="proximaRevisaoEm"
                    type="date"
                    value={
                      form.proximaRevisaoEm
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "proximaRevisaoEm",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="vigente"
                  type="checkbox"
                  checked={form.vigente}
                  onChange={(event) => {
                    const vigente =
                      event.target.checked

                    setForm((anterior) => ({
                      ...anterior,
                      vigente,
                      dataEncerramento:
                        vigente
                          ? ""
                          : anterior.dataEncerramento,
                    }))
                  }}
                  disabled={salvando}
                />

                <Label htmlFor="vigente">
                  Contrato vigente
                </Label>
              </div>

              {!form.vigente && (
                <div className="space-y-1">
                  <Label htmlFor="motivoEncerramento">
                    Motivo do encerramento
                  </Label>

                  <Input
                    id="motivoEncerramento"
                    value={
                      form.motivoEncerramento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "motivoEncerramento",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="origemDocumento">
                    Origem do documento
                  </Label>

                  <Input
                    id="origemDocumento"
                    value={
                      form.origemDocumento
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "origemDocumento",
                        event.target.value
                      )
                    }
                    placeholder="E-mail, físico, Drive..."
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="arquivoUrl">
                    URL do arquivo
                  </Label>

                  <Input
                    id="arquivoUrl"
                    value={form.arquivoUrl}
                    onChange={(event) =>
                      atualizarCampo(
                        "arquivoUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="observacoes">
                  Observações
                </Label>

                <Textarea
                  id="observacoes"
                  value={form.observacoes}
                  onChange={(event) =>
                    atualizarCampo(
                      "observacoes",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                  className="min-h-[90px]"
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
                      {contratoEditandoId ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}

                      {contratoEditandoId
                        ? "Salvar alterações"
                        : "Adicionar contrato"}
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
              Histórico de contratos
            </CardTitle>
          </CardHeader>

          <CardContent>
            {contratos.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Nenhum contrato cadastrado.
              </div>
            ) : (
              <div className="space-y-3">
                {contratos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-semibold">
                            {contrato.tipoFormalizacao}
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              contrato.vigente
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {contrato.vigente
                              ? "Vigente"
                              : "Encerrado"}
                          </span>

                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {
                              contrato._count
                                .regrasComerciais
                            }{" "}
                            regra
                            {contrato._count
                              .regrasComerciais === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        {contrato.descricao && (
                          <p className="text-sm">
                            {contrato.descricao}
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Início:{" "}
                            {formatarData(
                              contrato.dataInicio
                            )}
                          </p>

                          <p>
                            Encerramento:{" "}
                            {formatarData(
                              contrato.dataEncerramento
                            )}
                          </p>

                          <p>
                            Próxima revisão:{" "}
                            {formatarData(
                              contrato.proximaRevisaoEm
                            )}
                          </p>

                          <p>
                            Empresa:{" "}
                            {contrato
                              .empresaEscritorio
                              ?.nomeFantasia ||
                              contrato
                                .empresaEscritorio
                                ?.razaoSocial ||
                              "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            editarContrato(
                              contrato
                            )
                          }
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={
                            contrato._count
                              .regrasComerciais > 0
                          }
                          onClick={() =>
                            excluirContrato(
                              contrato
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