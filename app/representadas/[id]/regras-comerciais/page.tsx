"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
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

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type Contrato = {
  id: string
  tipoFormalizacao: string
  descricao: string | null
  dataInicio: string | null
  dataEncerramento: string | null
  vigente: boolean
}

type RegraComercial = {
  id: string
  representadaId: string
  clienteId: string | null
  contratoId: string | null
  nome: string
  tipoEscopo: string
  vigenciaInicio: string
  vigenciaFim: string | null
  ativa: boolean
  pedidoMinimo: number | null
  minimoParcela: number | null
  prazoEntregaDias: number | null
  prazoFaturamentoDias: number | null
  frete: string | null
  regiao: string | null
  tipoComissao: string | null
  percentualComissao: number | null
  faixasComissao: string | null
  reconhecimentoComissao: string | null
  fechamentoComissao: string | null
  pagamentoComissao: string | null
  observacoes: string | null

  cliente: Cliente | null
  contrato: Contrato | null

  _count: {
    vendas: number
  }
}

type Representada = {
  id: string
  nome: string
  codigo: string | null
}

type Faixa = {
  desconto: string
  comissao: string
}

type FormRegra = {
  nome: string
  tipoEscopo: string
  clienteId: string
  contratoId: string
  vigenciaInicio: string
  vigenciaFim: string
  ativa: boolean
  pedidoMinimo: string
  minimoParcela: string
  prazoEntregaDias: string
  prazoFaturamentoDias: string
  frete: string
  regiao: string
  tipoComissao: string
  percentualComissao: string
  reconhecimentoComissao: string
  fechamentoComissao: string
  pagamentoComissao: string
  observacoes: string
}

const FORM_INICIAL: FormRegra = {
  nome: "",
  tipoEscopo: "Padrao",
  clienteId: "",
  contratoId: "",
  vigenciaInicio: "",
  vigenciaFim: "",
  ativa: true,
  pedidoMinimo: "",
  minimoParcela: "",
  prazoEntregaDias: "",
  prazoFaturamentoDias: "",
  frete: "",
  regiao: "",
  tipoComissao: "fixa",
  percentualComissao: "",
  reconhecimentoComissao: "",
  fechamentoComissao: "",
  pagamentoComissao: "",
  observacoes: "",
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

  return data.toISOString().slice(0, 10)
}

function formatarData(valor: string | null) {
  if (!valor) {
    return "-"
  }

  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(data)
}

function formatarValor(valor: number | null) {
  if (valor === null) {
    return "-"
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function parseFaixas(
  valor: string | null
): Faixa[] {
  if (!valor) {
    return [
      { desconto: "", comissao: "" },
    ]
  }

  try {
    const resultado = JSON.parse(valor)

    if (
      Array.isArray(resultado) &&
      resultado.length > 0
    ) {
      return resultado
    }
  } catch {
    return [
      { desconto: "", comissao: "" },
    ]
  }

  return [
    { desconto: "", comissao: "" },
  ]
}

export default function RegrasComerciaisPage() {
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

  const [clientes, setClientes] =
    useState<Cliente[]>([])

  const [contratos, setContratos] =
    useState<Contrato[]>([])

  const [regras, setRegras] =
    useState<RegraComercial[]>([])

  const [form, setForm] =
    useState<FormRegra>(FORM_INICIAL)

  const [faixas, setFaixas] =
    useState<Faixa[]>([
      { desconto: "", comissao: "" },
    ])

  const [regraEditandoId, setRegraEditandoId] =
    useState<string | null>(null)

  const [carregando, setCarregando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  const [erro, setErro] =
    useState<string | null>(null)

  useEffect(() => {
    if (!representadaId) {
      setErro(
        "ID da representada não encontrado."
      )
      setCarregando(false)
      return
    }

    async function carregarDados() {
      try {
        setCarregando(true)
        setErro(null)

        const [
          respostaRepresentada,
          respostaRegras,
          respostaContratos,
          respostaClientes,
        ] = await Promise.all([
          fetch(
            `/api/representadas/${representadaId}`
          ),
          fetch(
            `/api/representadas/${representadaId}/regras-comerciais`
          ),
          fetch(
            `/api/representadas/${representadaId}/contratos`
          ),
          fetch("/api/clientes"),
        ])

        if (!respostaRepresentada.ok) {
          throw new Error(
            "Erro ao carregar representada."
          )
        }

        if (!respostaRegras.ok) {
          throw new Error(
            "Erro ao carregar regras comerciais."
          )
        }

        if (!respostaContratos.ok) {
          throw new Error(
            "Erro ao carregar contratos."
          )
        }

        if (!respostaClientes.ok) {
          throw new Error(
            "Erro ao carregar clientes."
          )
        }

        const dadosRepresentada: Representada =
          await respostaRepresentada.json()

        const dadosRegras: RegraComercial[] =
          await respostaRegras.json()

        const dadosContratos: Contrato[] =
          await respostaContratos.json()

        const dadosClientes: Cliente[] =
          await respostaClientes.json()

        setRepresentada(
          dadosRepresentada
        )

        setRegras(dadosRegras)
        setContratos(dadosContratos)
        setClientes(dadosClientes)
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
    K extends keyof FormRegra,
  >(
    campo: K,
    valor: FormRegra[K]
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

    setFaixas([
      {
        desconto: "",
        comissao: "",
      },
    ])

    setRegraEditandoId(null)
    setErro(null)
  }

  function editarRegra(
    regra: RegraComercial
  ) {
    setRegraEditandoId(regra.id)

    setForm({
      nome: regra.nome,
      tipoEscopo:
        regra.tipoEscopo || "Padrao",
      clienteId:
        regra.clienteId || "",
      contratoId:
        regra.contratoId || "",
      vigenciaInicio:
        converterDataParaInput(
          regra.vigenciaInicio
        ),
      vigenciaFim:
        converterDataParaInput(
          regra.vigenciaFim
        ),
      ativa: regra.ativa,
      pedidoMinimo:
        regra.pedidoMinimo?.toString() ||
        "",
      minimoParcela:
        regra.minimoParcela?.toString() ||
        "",
      prazoEntregaDias:
        regra.prazoEntregaDias?.toString() ||
        "",
      prazoFaturamentoDias:
        regra.prazoFaturamentoDias?.toString() ||
        "",
      frete:
        regra.frete || "",
      regiao:
        regra.regiao || "",
      tipoComissao:
        regra.tipoComissao || "fixa",
      percentualComissao:
        regra.percentualComissao?.toString() ||
        "",
      reconhecimentoComissao:
        regra.reconhecimentoComissao ||
        "",
      fechamentoComissao:
        regra.fechamentoComissao || "",
      pagamentoComissao:
        regra.pagamentoComissao || "",
      observacoes:
        regra.observacoes || "",
    })

    setFaixas(
      parseFaixas(
        regra.faixasComissao
      )
    )

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function recarregarRegras() {
    if (!representadaId) {
      return
    }

    const resposta = await fetch(
      `/api/representadas/${representadaId}/regras-comerciais`
    )

    if (!resposta.ok) {
      throw new Error(
        "Erro ao atualizar regras comerciais."
      )
    }

    const dados: RegraComercial[] =
      await resposta.json()

    setRegras(dados)
  }

  function atualizarFaixa(
    index: number,
    campo: keyof Faixa,
    valor: string
  ) {
    setFaixas((anteriores) =>
      anteriores.map(
        (faixa, indice) =>
          indice === index
            ? {
                ...faixa,
                [campo]: valor,
              }
            : faixa
      )
    )
  }

  function adicionarFaixa() {
    setFaixas((anteriores) => [
      ...anteriores,
      {
        desconto: "",
        comissao: "",
      },
    ])
  }

  function removerFaixa(index: number) {
    setFaixas((anteriores) => {
      if (anteriores.length <= 1) {
        return anteriores
      }

      return anteriores.filter(
        (_, indice) =>
          indice !== index
      )
    })
  }

  async function salvarRegra(
    event: React.FormEvent
  ) {
    event.preventDefault()

    if (!representadaId) {
      setErro(
        "ID da representada não encontrado."
      )
      return
    }

    if (!form.nome.trim()) {
      setErro(
        "Informe o nome da regra comercial."
      )
      return
    }

    if (!form.vigenciaInicio) {
      setErro(
        "Informe o início da vigência."
      )
      return
    }

    if (
      form.tipoEscopo === "Padrao" &&
      form.clienteId
    ) {
      setErro(
        "Regra padrão não deve possuir cliente específico."
      )
      return
    }

    if (
      form.tipoEscopo !== "Padrao" &&
      !form.clienteId
    ) {
      setErro(
        "Selecione o cliente para uma regra específica."
      )
      return
    }

    if (
      form.tipoComissao === "fixa" &&
      (
        !form.percentualComissao ||
        Number(
          form.percentualComissao
        ) <= 0
      )
    ) {
      setErro(
        "Informe o percentual da comissão fixa."
      )
      return
    }

    if (
      form.tipoComissao === "variada"
    ) {
      const faixasValidas =
        faixas.every(
          (faixa) =>
            faixa.desconto.trim() !== "" &&
            faixa.comissao.trim() !== ""
        )

      if (!faixasValidas) {
        setErro(
          "Preencha desconto e comissão em todas as faixas."
        )
        return
      }
    }

    try {
      setSalvando(true)
      setErro(null)

      const payload = {
        nome:
          form.nome.trim(),

        tipoEscopo:
          form.tipoEscopo,

        clienteId:
          form.tipoEscopo === "Padrao"
            ? null
            : form.clienteId || null,

        contratoId:
          form.contratoId || null,

        vigenciaInicio:
          form.vigenciaInicio,

        vigenciaFim:
          form.vigenciaFim || null,

        ativa:
          form.ativa,

        pedidoMinimo:
          form.pedidoMinimo || null,

        minimoParcela:
          form.minimoParcela || null,

        prazoEntregaDias:
          form.prazoEntregaDias || null,

        prazoFaturamentoDias:
          form.prazoFaturamentoDias ||
          null,

        frete:
          form.frete || null,

        regiao:
          form.regiao || null,

        tipoComissao:
          form.tipoComissao,

        percentualComissao:
          form.tipoComissao === "fixa"
            ? form.percentualComissao
            : null,

        faixasComissao:
          form.tipoComissao ===
          "variada"
            ? JSON.stringify(faixas)
            : null,

        reconhecimentoComissao:
          form.reconhecimentoComissao ||
          null,

        fechamentoComissao:
          form.fechamentoComissao ||
          null,

        pagamentoComissao:
          form.pagamentoComissao ||
          null,

        observacoes:
          form.observacoes || null,
      }

      const url =
        regraEditandoId
          ? `/api/representadas/${representadaId}/regras-comerciais/${regraEditandoId}`
          : `/api/representadas/${representadaId}/regras-comerciais`

      const resposta = await fetch(url, {
        method:
          regraEditandoId
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
            "Erro ao salvar regra comercial."
        )
      }

      await recarregarRegras()

      limparFormulario()
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao salvar regra comercial."

      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirRegra(
    regra: RegraComercial
  ) {
    if (!representadaId) {
      return
    }

    if (regra._count.vendas > 0) {
      alert(
        "Esta regra já foi utilizada em vendas e não pode ser excluída."
      )
      return
    }

    const confirmado =
      window.confirm(
        `Excluir a regra "${regra.nome}"?`
      )

    if (!confirmado) {
      return
    }

    try {
      const resposta = await fetch(
        `/api/representadas/${representadaId}/regras-comerciais/${regra.id}`,
        {
          method: "DELETE",
        }
      )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            "Erro ao excluir regra comercial."
        )
      }

      await recarregarRegras()

      if (
        regraEditandoId === regra.id
      ) {
        limparFormulario()
      }
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao excluir regra comercial."

      alert(mensagem)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando regras comerciais...
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
                Regras Comerciais
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
            {regras.length} regra
            {regras.length === 1
              ? ""
              : "s"}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {regraEditandoId
                  ? "Editar regra comercial"
                  : "Nova regra comercial"}
              </CardTitle>

              {regraEditandoId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    limparFormulario
                  }
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
              onSubmit={salvarRegra}
              className="space-y-5"
            >
              {erro && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-3 text-sm">
                  {erro}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="nome">
                    Nome da regra *
                  </Label>

                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(event) =>
                      atualizarCampo(
                        "nome",
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

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="tipoEscopo">
                    Escopo
                  </Label>

                  <select
                    id="tipoEscopo"
                    value={
                      form.tipoEscopo
                    }
                    onChange={(event) => {
                      const valor =
                        event.target.value

                      setForm(
                        (anterior) => ({
                          ...anterior,
                          tipoEscopo: valor,
                          clienteId:
                            valor ===
                            "Padrao"
                              ? ""
                              : anterior.clienteId,
                        })
                      )
                    }}
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Padrao">
                      Padrão
                    </option>
                    <option value="Cliente">
                      Cliente específico
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clienteId">
                    Cliente
                  </Label>

                  <select
                    id="clienteId"
                    value={
                      form.clienteId
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "clienteId",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando ||
                      form.tipoEscopo ===
                        "Padrao"
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Selecione
                    </option>

                    {clientes.map(
                      (cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.nomeFantasia ||
                            cliente.razaoSocial}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="contratoId">
                    Contrato
                  </Label>

                  <select
                    id="contratoId"
                    value={
                      form.contratoId
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "contratoId",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Sem contrato
                    </option>

                    {contratos.map(
                      (contrato) => (
                        <option
                          key={contrato.id}
                          value={contrato.id}
                        >
                          {contrato.tipoFormalizacao}
                          {contrato.descricao
                            ? ` - ${contrato.descricao}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="vigenciaInicio">
                    Início da vigência *
                  </Label>

                  <Input
                    id="vigenciaInicio"
                    type="date"
                    value={
                      form.vigenciaInicio
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "vigenciaInicio",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vigenciaFim">
                    Fim da vigência
                  </Label>

                  <Input
                    id="vigenciaFim"
                    type="date"
                    value={
                      form.vigenciaFim
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "vigenciaFim",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="pedidoMinimo">
                    Pedido mínimo
                  </Label>

                  <Input
                    id="pedidoMinimo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.pedidoMinimo
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "pedidoMinimo",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="minimoParcela">
                    Mínimo parcela
                  </Label>

                  <Input
                    id="minimoParcela"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.minimoParcela
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "minimoParcela",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prazoEntregaDias">
                    Prazo entrega
                  </Label>

                  <Input
                    id="prazoEntregaDias"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.prazoEntregaDias
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "prazoEntregaDias",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prazoFaturamentoDias">
                    Prazo faturamento
                  </Label>

                  <Input
                    id="prazoFaturamentoDias"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.prazoFaturamentoDias
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "prazoFaturamentoDias",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="frete">
                    Frete
                  </Label>

                  <Input
                    id="frete"
                    value={form.frete}
                    onChange={(event) =>
                      atualizarCampo(
                        "frete",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="regiao">
                    Região
                  </Label>

                  <Input
                    id="regiao"
                    value={form.regiao}
                    onChange={(event) =>
                      atualizarCampo(
                        "regiao",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="tipoComissao">
                      Tipo de comissão
                    </Label>

                    <select
                      id="tipoComissao"
                      value={
                        form.tipoComissao
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "tipoComissao",
                          event.target.value
                        )
                      }
                      disabled={salvando}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="fixa">
                        Fixa
                      </option>
                      <option value="variada">
                        Variada
                      </option>
                    </select>
                  </div>

                  {form.tipoComissao ===
                    "fixa" && (
                    <div className="space-y-1">
                      <Label htmlFor="percentualComissao">
                        Comissão (%)
                      </Label>

                      <Input
                        id="percentualComissao"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.percentualComissao
                        }
                        onChange={(event) =>
                          atualizarCampo(
                            "percentualComissao",
                            event.target.value
                          )
                        }
                        disabled={salvando}
                      />
                    </div>
                  )}
                </div>

                {form.tipoComissao ===
                  "variada" && (
                  <div className="space-y-3">
                    {faixas.map(
                      (faixa, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                        >
                          <div className="space-y-1">
                            <Label>
                              Desconto (%)
                            </Label>

                            <Input
                              type="number"
                              step="0.01"
                              value={
                                faixa.desconto
                              }
                              onChange={(
                                event
                              ) =>
                                atualizarFaixa(
                                  index,
                                  "desconto",
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                salvando
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>
                              Comissão (%)
                            </Label>

                            <Input
                              type="number"
                              step="0.01"
                              value={
                                faixa.comissao
                              }
                              onChange={(
                                event
                              ) =>
                                atualizarFaixa(
                                  index,
                                  "comissao",
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                salvando
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              removerFaixa(
                                index
                              )
                            }
                            disabled={
                              salvando ||
                              faixas.length <= 1
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={
                        adicionarFaixa
                      }
                      disabled={salvando}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar faixa
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reconhecimentoComissao">
                    Reconhecimento
                  </Label>

                  <Input
                    id="reconhecimentoComissao"
                    value={
                      form.reconhecimentoComissao
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "reconhecimentoComissao",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fechamentoComissao">
                    Fechamento
                  </Label>

                  <Input
                    id="fechamentoComissao"
                    value={
                      form.fechamentoComissao
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "fechamentoComissao",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pagamentoComissao">
                    Pagamento
                  </Label>

                  <Input
                    id="pagamentoComissao"
                    value={
                      form.pagamentoComissao
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "pagamentoComissao",
                        event.target.value
                      )
                    }
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
                      {regraEditandoId ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}

                      {regraEditandoId
                        ? "Salvar alterações"
                        : "Adicionar regra"}
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
              Histórico de regras comerciais
            </CardTitle>
          </CardHeader>

          <CardContent>
            {regras.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                Nenhuma regra comercial cadastrada.
              </div>
            ) : (
              <div className="space-y-3">
                {regras.map((regra) => (
                  <div
                    key={regra.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="font-semibold">
                            {regra.nome}
                          </span>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              regra.ativa
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {regra.ativa
                              ? "Ativa"
                              : "Inativa"}
                          </span>

                          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {
                              regra.tipoEscopo
                            }
                          </span>

                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {
                              regra._count
                                .vendas
                            }{" "}
                            venda
                            {regra._count
                              .vendas === 1
                              ? ""
                              : "s"}
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          <p>
                            Vigência:{" "}
                            {formatarData(
                              regra.vigenciaInicio
                            )}{" "}
                            até{" "}
                            {formatarData(
                              regra.vigenciaFim
                            )}
                          </p>

                          <p>
                            Cliente:{" "}
                            {regra.cliente
                              ?.nomeFantasia ||
                              regra.cliente
                                ?.razaoSocial ||
                              "Todos"}
                          </p>

                          <p>
                            Pedido mínimo:{" "}
                            {formatarValor(
                              regra.pedidoMinimo
                            )}
                          </p>

                          <p>
                            Comissão:{" "}
                            {regra.tipoComissao ===
                            "fixa"
                              ? `${
                                  regra.percentualComissao ??
                                  0
                                }%`
                              : regra.tipoComissao ===
                                  "variada"
                                ? "Variada"
                                : "-"}
                          </p>

                          <p>
                            Contrato:{" "}
                            {regra.contrato
                              ?.tipoFormalizacao ||
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
                            editarRegra(
                              regra
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
                            regra._count
                              .vendas > 0
                          }
                          onClick={() =>
                            excluirRegra(
                              regra
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