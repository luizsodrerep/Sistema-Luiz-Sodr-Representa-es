
"use client"

import { use, useEffect, useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Factory,
  Loader2,
  Save,
  Search,
  X,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Cliente = {
  id: string
  codigo?: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj?: string | null
  status?: string
}

type Representada = {
  id: string
  codigo?: string | null
  nome: string
  cnpj?: string | null
  status?: string
}

type InteracaoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  clienteId: string | null
  representadaId: string | null
  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null
  assunto: string | null
}

type Orcamento = {
  id: string
  numeroSequencial: number
  clienteId: string
  representadaId: string
  interacaoOrigemId: string | null
  interacaoOrigem: {
    id: string
    numeroSequencial: number
    tipo: string
    assunto: string | null
  } | null
  vendaGerada: { id: string } | null
  validadeEm: string
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  observacoes: string | null
  status: string
  cliente: Cliente
  representada: Representada
}

function rotuloCliente(cliente: Cliente) {
  return cliente.nomeFantasia || cliente.razaoSocial
}

function numeroParaInput(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function valorMonetario(valor: string): number | null {
  let texto = valor.trim().replace(/\s|R\$/gi, "")
  if (!texto) return null
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".")
  const numero = Number(texto)
  return Number.isFinite(numero) && numero > 0 &&
    Math.abs(numero * 100 - Math.round(numero * 100)) < 0.000001
    ? Number(numero.toFixed(2)) : null
}

function dataParaInput(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ""
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

function dataComercialValida(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T12:00:00-03:00`)
  return !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
}

function codigoInteracao(numero: number) {
  return `INT-${String(numero).padStart(6, "0")}`
}

function extrairIdInteracao(valor: string): string | null {
  const texto = valor.trim()
  if (!texto) return null
  if (/^[a-zA-Z0-9_-]{8,128}$/.test(texto)) return texto
  try {
    const url = new URL(texto, window.location.origin)
    const partes = url.pathname.match(/^\/interacoes\/([^/]+)\/?$/)
    if (!partes) return null
    const id = decodeURIComponent(partes[1])
    return /^[a-zA-Z0-9_-]{8,128}$/.test(id) ? id : null
  } catch {
    return null
  }
}

function prospeccaoSemCliente(origem: InteracaoOrigem | null): origem is InteracaoOrigem {
  return Boolean(origem?.id && origem.tipo === "Prospecção" &&
    origem.clienteId === null && origem.representadaId === null &&
    origem.nomeProspect?.trim())
}

export default function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [clienteId, setClienteId] = useState("")
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [buscaCliente, setBuscaCliente] = useState("")
  const [resultadosClientes, setResultadosClientes] = useState<Cliente[]>([])
  const [carregandoClientes, setCarregandoClientes] = useState(false)
  const [listaClientesAberta, setListaClientesAberta] = useState(false)

  const [representadaId, setRepresentadaId] = useState("")
  const [representadaSelecionada, setRepresentadaSelecionada] = useState<Representada | null>(null)
  const [buscaRepresentada, setBuscaRepresentada] = useState("")
  const [resultadosRepresentadas, setResultadosRepresentadas] = useState<Representada[]>([])
  const [carregandoRepresentadas, setCarregandoRepresentadas] = useState(false)
  const [listaRepresentadasAberta, setListaRepresentadasAberta] = useState(false)

  const [valorTotal, setValorTotal] = useState("")
  const [validadeEm, setValidadeEm] = useState("")
  const [condicaoPagamento, setCondicaoPagamento] = useState("")
  const [descricao, setDescricao] = useState("")
  const [observacoes, setObservacoes] = useState("")

  const [enderecoOrigem, setEnderecoOrigem] = useState("")
  const [origemAtualValidada, setOrigemAtualValidada] = useState<InteracaoOrigem | null>(null)
  const [origemConferida, setOrigemConferida] = useState<InteracaoOrigem | null>(null)
  const [vinculoConfirmado, setVinculoConfirmado] = useState(false)
  const [conferindoOrigem, setConferindoOrigem] = useState(false)
  const [avisoOrigem, setAvisoOrigem] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const podeEditar = orcamento?.status === "Pendente" && !orcamento.vendaGerada
  const bloqueado = salvando || !podeEditar
  const origemEfetiva = enderecoOrigem.trim()
    ? origemConferida
    : origemAtualValidada
  const existeProspeccaoValida = prospeccaoSemCliente(origemEfetiva)
  const alterouVinculo = Boolean(orcamento && existeProspeccaoValida &&
    (origemEfetiva?.id !== orcamento.interacaoOrigemId ||
      clienteId !== orcamento.clienteId))

  useEffect(() => {
    const controller = new AbortController()

    async function carregar() {
      try {
        setLoading(true)
        setErro(null)
        setAvisoOrigem(null)
        const resposta = await fetch(`/api/orcamentos/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const dados = await resposta.json().catch(() => null)
        if (!resposta.ok || !dados?.id || !dados?.clienteId || !dados?.representadaId) {
          throw new Error(dados?.message || "Não foi possível carregar o orçamento.")
        }
        if (controller.signal.aborted) return
        const atual = dados as Orcamento
        setOrcamento(atual)
        setClienteId(atual.clienteId)
        setClienteSelecionado(atual.cliente)
        setBuscaCliente(atual.cliente ? rotuloCliente(atual.cliente) : "")
        setRepresentadaId(atual.representadaId)
        setRepresentadaSelecionada(atual.representada)
        setBuscaRepresentada(atual.representada?.nome || "")
        setValorTotal(numeroParaInput(atual.valorTotal))
        setValidadeEm(dataParaInput(atual.validadeEm))
        setCondicaoPagamento(atual.condicaoPagamento || "")
        setDescricao(atual.descricao || "")
        setObservacoes(atual.observacoes || "")
        setOrigemAtualValidada(null)
        setOrigemConferida(null)
        setEnderecoOrigem("")
        setVinculoConfirmado(false)

        if (atual.interacaoOrigemId &&
            (atual.cliente.status === "Em qualificação" ||
              atual.interacaoOrigem?.tipo === "Prospecção")) {
          try {
            const respostaOrigem = await fetch(
              `/api/interacoes/${encodeURIComponent(atual.interacaoOrigemId)}`,
              { cache: "no-store", signal: controller.signal }
            )
            const dadosOrigem = await respostaOrigem.json().catch(() => null)
            if (controller.signal.aborted) return
            if (!respostaOrigem.ok || !dadosOrigem?.id ||
                dadosOrigem.id !== atual.interacaoOrigemId) {
              setAvisoOrigem("Não foi possível validar a Prospecção atualmente vinculada. Confira a origem antes de salvar.")
            } else {
              const origem = dadosOrigem as InteracaoOrigem
              if (prospeccaoSemCliente(origem)) {
                setOrigemAtualValidada(origem)
              } else {
                setAvisoOrigem("A origem vinculada não atende às condições de Prospecção sem Cliente. Confira a origem antes de salvar.")
              }
            }
          } catch (falha) {
            if (controller.signal.aborted) return
            setAvisoOrigem(falha instanceof Error
              ? `Não foi possível conferir a Prospecção: ${falha.message}`
              : "Erro ao conferir a Prospecção atual.")
          }
        }
      } catch (falha) {
        if (controller.signal.aborted) return
        setErro(falha instanceof Error ? falha.message : "Erro ao carregar orçamento.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void carregar()
    return () => controller.abort()
  }, [id])

  useEffect(() => {
    if (!podeEditar || clienteSelecionado || buscaCliente.trim().length < 2) {
      setResultadosClientes([])
      setCarregandoClientes(false)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setCarregandoClientes(true)
      try {
        const parametros = new URLSearchParams({
          seletor: "1", busca: buscaCliente.trim(), limit: "10",
          somenteAtivos: existeProspeccaoValida ? "0" : "1",
        })
        const resposta = await fetch(`/api/clientes?${parametros}`, {
          cache: "no-store", signal: controller.signal,
        })
        const dados = await resposta.json().catch(() => null)
        if (!resposta.ok) throw new Error(dados?.message || "Erro na pesquisa de Clientes.")
        if (!controller.signal.aborted) {
          setResultadosClientes(Array.isArray(dados)
            ? (dados as Cliente[]).filter((c) => c.status === "Ativo" ||
                (existeProspeccaoValida && c.status === "Em qualificação"))
            : [])
        }
      } catch (falha) {
        if (controller.signal.aborted) return
        setResultadosClientes([])
        setErro(falha instanceof Error ? falha.message : "Erro na pesquisa de Clientes.")
      } finally {
        if (!controller.signal.aborted) setCarregandoClientes(false)
      }
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [buscaCliente, clienteSelecionado, existeProspeccaoValida, podeEditar])

  useEffect(() => {
    if (!podeEditar || representadaSelecionada || buscaRepresentada.trim().length < 2) {
      setResultadosRepresentadas([])
      setCarregandoRepresentadas(false)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setCarregandoRepresentadas(true)
      try {
        const parametros = new URLSearchParams({
          seletor: "1", busca: buscaRepresentada.trim(), limit: "10", somenteAtivas: "1",
        })
        const resposta = await fetch(`/api/representadas?${parametros}`, {
          cache: "no-store", signal: controller.signal,
        })
        const dados = await resposta.json().catch(() => null)
        if (!resposta.ok) throw new Error(dados?.message || "Erro na pesquisa de Representadas.")
        if (!controller.signal.aborted) {
          setResultadosRepresentadas(Array.isArray(dados) ? dados : [])
        }
      } catch (falha) {
        if (controller.signal.aborted) return
        setResultadosRepresentadas([])
        setErro(falha instanceof Error ? falha.message : "Erro na pesquisa de Representadas.")
      } finally {
        if (!controller.signal.aborted) setCarregandoRepresentadas(false)
      }
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [buscaRepresentada, representadaSelecionada, podeEditar])

  async function conferirOrigem() {
    const idOrigem = extrairIdInteracao(enderecoOrigem)
    setOrigemConferida(null)
    setVinculoConfirmado(false)
    if (!idOrigem) {
      setErro("Cole o endereço completo da Prospecção ou seu identificador válido.")
      return
    }
    try {
      setConferindoOrigem(true)
      setErro(null)
      const resposta = await fetch(`/api/interacoes/${encodeURIComponent(idOrigem)}`, {
        cache: "no-store",
      })
      const dados = await resposta.json().catch(() => null)
      if (!resposta.ok) throw new Error(dados?.message || "Interação não encontrada ou sem acesso.")
      const origem = dados as InteracaoOrigem
      if (!prospeccaoSemCliente(origem) ||
          !Number.isInteger(origem.numeroSequencial) || origem.id !== idOrigem) {
        throw new Error("A origem deve ser uma Prospecção sem Cliente e sem Representada, com nome do contato.")
      }
      setOrigemConferida(origem)
      setAvisoOrigem(null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível conferir a Prospecção.")
    } finally {
      setConferindoOrigem(false)
    }
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!orcamento || salvando) return
    setErro(null)
    if (!podeEditar) {
      setErro("Somente Orçamentos pendentes sem Venda podem ser editados. A aprovação já registrada deve ser preservada.")
      return
    }
    if (!clienteId || !clienteSelecionado || clienteSelecionado.id !== clienteId) {
      setErro("Selecione um cadastro de empresa válido.")
      return
    }
    if (clienteSelecionado.status === "Em qualificação") {
      if (!existeProspeccaoValida) {
        setErro("Pré-cadastro exige uma Prospecção de origem conferida e válida.")
        return
      }
    } else if (clienteSelecionado.status !== "Ativo" || !clienteSelecionado.cnpj?.trim()) {
      setErro("Para Cliente formalizado, selecione um cadastro Ativo com CNPJ verdadeiro.")
      return
    }
    if (!representadaId || !representadaSelecionada || representadaSelecionada.id !== representadaId ||
        representadaSelecionada.status && representadaSelecionada.status !== "Ativa") {
      setErro("Selecione uma Representada ativa.")
      return
    }
    const valorNumerico = valorMonetario(valorTotal)
    if (valorNumerico === null || !dataComercialValida(validadeEm)) {
      setErro("Informe valor total positivo, com até duas casas decimais, e uma data de validade válida.")
      return
    }
    if (enderecoOrigem.trim() &&
        (!origemConferida || extrairIdInteracao(enderecoOrigem) !== origemConferida.id)) {
      setErro("O endereço da Prospecção ainda não foi conferido ou foi alterado após a conferência.")
      return
    }
    if (alterouVinculo && !vinculoConfirmado) {
      setErro("Confirme expressamente que a Prospecção realmente pertence à empresa selecionada.")
      return
    }

    const alteracoes: Record<string, unknown> = {}
    if (clienteId !== orcamento.clienteId) alteracoes.clienteId = clienteId
    if (representadaId !== orcamento.representadaId) alteracoes.representadaId = representadaId
    if (valorNumerico !== orcamento.valorTotal) alteracoes.valorTotal = valorTotal
    if (validadeEm !== dataParaInput(orcamento.validadeEm)) {
      alteracoes.validadeEm = `${validadeEm}T12:00:00-03:00`
    }
    if (condicaoPagamento !== (orcamento.condicaoPagamento || "")) {
      alteracoes.condicaoPagamento = condicaoPagamento
    }
    if (descricao !== (orcamento.descricao || "")) alteracoes.descricao = descricao
    if (observacoes !== (orcamento.observacoes || "")) alteracoes.observacoes = observacoes
    if (origemConferida && origemConferida.id !== orcamento.interacaoOrigemId) {
      alteracoes.interacaoOrigemId = origemConferida.id
    }
    if (alterouVinculo) alteracoes.confirmarVinculoProspeccao = true
    if (Object.keys(alteracoes).length === 0) {
      setErro("Nenhuma alteração foi informada.")
      return
    }

    try {
      setSalvando(true)
      setErro(null)
      const resposta = await fetch(`/api/orcamentos/${encodeURIComponent(orcamento.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alteracoes),
      })
      const dados = await resposta.json().catch(() => null)
      if (!resposta.ok) {
        setErro(dados?.message || "Não foi possível salvar o Orçamento.")
        return
      }
      if (!dados?.id) {
        setErro("O servidor não confirmou a atualização do Orçamento.")
        return
      }
      router.push(`/orcamentos/${encodeURIComponent(orcamento.id)}`)
      router.refresh()
    } catch {
      setErro("Erro de comunicação ao salvar o Orçamento.")
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Editar Orçamento">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando orçamento...
        </div>
      </PageLayout>
    )
  }

  if (!orcamento) {
    return (
      <PageLayout title="Editar Orçamento">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro || "Orçamento não encontrado."}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Editar Orçamento">
      <div className="mb-5">
        <Button type="button" variant="outline" onClick={() => router.push(`/orcamentos/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" /> {erro}
        </div>
      )}

      {!podeEditar && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Este Orçamento está {orcamento.status.toLowerCase()}
          {orcamento.vendaGerada ? " e já gerou uma Venda" : ""}.
          A edição comercial fica bloqueada nesta tela. Preserve a aprovação e o histórico.
          {orcamento.status === "Aprovado" && !orcamento.vendaGerada && (
            <> Consulte a página de detalhes para formalizar o mesmo Cliente e gerar a Venda pela ação específica.</>
          )}
        </div>
      )}

      <form onSubmit={salvar} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dados comerciais</CardTitle>
            <CardDescription>
              As alterações são registradas na auditoria. Pré-cadastros só podem ser
              utilizados com Prospecção de origem válida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Cliente / empresa *</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={buscaCliente}
                  disabled={bloqueado}
                  className="pl-9 pr-10"
                  placeholder="Digite nome, fantasia, código ou CNPJ..."
                  autoComplete="off"
                  onFocus={() => setListaClientesAberta(true)}
                  onBlur={() => window.setTimeout(() => setListaClientesAberta(false), 150)}
                  onChange={(event) => {
                    setBuscaCliente(event.target.value)
                    setClienteId("")
                    setClienteSelecionado(null)
                    setVinculoConfirmado(false)
                    setListaClientesAberta(true)
                  }}
                />
                {(clienteSelecionado || buscaCliente) && !bloqueado && (
                  <button type="button" aria-label="Limpar Cliente"
                    className="absolute right-3 top-3 text-muted-foreground"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setClienteId("")
                      setClienteSelecionado(null)
                      setBuscaCliente("")
                      setResultadosClientes([])
                      setVinculoConfirmado(false)
                    }}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                {listaClientesAberta && !bloqueado && !clienteSelecionado && (
                  <div className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                    {carregandoClientes ? (
                      <div className="p-3 text-sm">Pesquisando Clientes...</div>
                    ) : buscaCliente.trim().length < 2 ? (
                      <div className="p-3 text-sm text-muted-foreground">Digite pelo menos 2 caracteres.</div>
                    ) : resultadosClientes.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">Nenhum cadastro elegível encontrado.</div>
                    ) : (
                      resultadosClientes.map((cliente) => (
                        <button key={cliente.id} type="button"
                          className="block w-full border-b p-3 text-left text-sm hover:bg-muted/60"
                          onMouseDown={(event) => {
                            event.preventDefault()
                            setClienteId(cliente.id)
                            setClienteSelecionado(cliente)
                            setBuscaCliente(rotuloCliente(cliente))
                            setListaClientesAberta(false)
                            setResultadosClientes([])
                            setVinculoConfirmado(false)
                          }}>
                          <Building2 className="mr-2 inline h-4 w-4 text-blue-600" />
                          {rotuloCliente(cliente)} — {cliente.status === "Em qualificação" ? "Em qualificação" : "Ativo"}
                          {cliente.cnpj ? ` — CNPJ: ${cliente.cnpj}` : " — sem CNPJ"}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {clienteSelecionado && (
                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  <strong>{rotuloCliente(clienteSelecionado)}</strong> — {clienteSelecionado.status || "Situação não informada"}
                  {clienteSelecionado.cnpj ? ` — CNPJ: ${clienteSelecionado.cnpj}` : " — sem CNPJ"}
                </div>
              )}
              {clienteSelecionado?.status === "Em qualificação" && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Este é um pré-cadastro, não um Cliente formalizado. A Prospecção de
                  origem deve estar conferida. A aprovação do Orçamento não criará Venda
                  antes da formalização do mesmo cadastro.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Representada *</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={buscaRepresentada} disabled={bloqueado} className="pl-9 pr-10"
                  placeholder="Digite nome, código ou CNPJ..." autoComplete="off"
                  onFocus={() => setListaRepresentadasAberta(true)}
                  onBlur={() => window.setTimeout(() => setListaRepresentadasAberta(false), 150)}
                  onChange={(event) => {
                    setBuscaRepresentada(event.target.value)
                    setRepresentadaId("")
                    setRepresentadaSelecionada(null)
                    setListaRepresentadasAberta(true)
                  }} />
                {(representadaSelecionada || buscaRepresentada) && !bloqueado && (
                  <button type="button" aria-label="Limpar Representada"
                    className="absolute right-3 top-3 text-muted-foreground"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setRepresentadaId("")
                      setRepresentadaSelecionada(null)
                      setBuscaRepresentada("")
                      setResultadosRepresentadas([])
                    }}>
                    <X className="h-4 w-4" />
                  </button>
                )}
                {listaRepresentadasAberta && !bloqueado && !representadaSelecionada && (
                  <div className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                    {carregandoRepresentadas ? (
                      <div className="p-3 text-sm">Pesquisando Representadas...</div>
                    ) : buscaRepresentada.trim().length < 2 ? (
                      <div className="p-3 text-sm text-muted-foreground">Digite pelo menos 2 caracteres.</div>
                    ) : resultadosRepresentadas.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">Nenhuma Representada ativa encontrada.</div>
                    ) : resultadosRepresentadas.map((representada) => (
                      <button key={representada.id} type="button"
                        className="block w-full border-b p-3 text-left text-sm hover:bg-muted/60"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          setRepresentadaId(representada.id)
                          setRepresentadaSelecionada(representada)
                          setBuscaRepresentada(representada.nome)
                          setListaRepresentadasAberta(false)
                          setResultadosRepresentadas([])
                        }}>
                        <Factory className="mr-2 inline h-4 w-4 text-orange-600" />
                        {representada.nome}{representada.cnpj ? ` — CNPJ: ${representada.cnpj}` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor total *</Label>
                <Input id="valorTotal" value={valorTotal} disabled={bloqueado}
                  inputMode="decimal" onChange={(event) => setValorTotal(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validadeEm">Validade *</Label>
                <Input id="validadeEm" type="date" value={validadeEm} disabled={bloqueado}
                  onChange={(event) => setValidadeEm(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condicaoPagamento">Condição de pagamento</Label>
              <Input id="condicaoPagamento" value={condicaoPagamento} disabled={bloqueado}
                onChange={(event) => setCondicaoPagamento(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" rows={5} value={descricao} disabled={bloqueado}
                onChange={(event) => setDescricao(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações internas</Label>
              <Textarea id="observacoes" rows={4} value={observacoes} disabled={bloqueado}
                onChange={(event) => setObservacoes(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        {podeEditar && (
          <Card>
            <CardHeader>
              <CardTitle>Origem: Prospecção existente</CardTitle>
              <CardDescription>
                Confira a Prospecção real antes de vinculá-la. Não crie outra
                Prospecção ou outra empresa só para registrar o vínculo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orcamento.interacaoOrigem && (
                <div className="rounded-md border bg-blue-50 p-3 text-sm">
                  Origem atualmente vinculada:{" "}
                  <Link className="font-semibold text-blue-700 underline"
                    href={`/interacoes/${orcamento.interacaoOrigem.id}`}>
                    {codigoInteracao(orcamento.interacaoOrigem.numeroSequencial)}
                  </Link>. Deixe o campo abaixo vazio para preservá-la.
                </div>
              )}
              {avisoOrigem && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {avisoOrigem}
                </div>
              )}
              {prospeccaoSemCliente(origemAtualValidada) && !enderecoOrigem.trim() && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Prospecção vinculada conferida: {codigoInteracao(origemAtualValidada.numeroSequencial)}
                  {origemAtualValidada.empresaProspect ? ` — ${origemAtualValidada.empresaProspect}` : ""}.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="enderecoOrigem">Endereço de outra Prospecção (opcional)</Label>
                <Input id="enderecoOrigem" value={enderecoOrigem}
                  disabled={bloqueado || conferindoOrigem}
                  placeholder="Cole o endereço da página /interacoes/..."
                  onChange={(event) => {
                    setEnderecoOrigem(event.target.value)
                    setOrigemConferida(null)
                    setVinculoConfirmado(false)
                  }} />
                <p className="text-xs text-muted-foreground">
                  A conferência não altera a Interação original. Se não desejar trocar
                  a origem, deixe este campo vazio.
                </p>
              </div>
              <Button type="button" variant="outline"
                disabled={bloqueado || conferindoOrigem || !enderecoOrigem.trim()}
                onClick={() => void conferirOrigem()}>
                {conferindoOrigem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Search className="mr-2 h-4 w-4" />}
                Conferir Prospecção
              </Button>

              {origemConferida && (
                <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-4 text-sm">
                  <p className="font-semibold text-green-800">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    {codigoInteracao(origemConferida.numeroSequencial)} — {origemConferida.nomeProspect}
                  </p>
                  {origemConferida.empresaProspect && <p>Empresa informada: {origemConferida.empresaProspect}</p>}
                  {origemConferida.assunto && <p>Assunto: {origemConferida.assunto}</p>}
                  <p className="text-xs text-muted-foreground">
                    Compare a empresa e o contato com o cadastro selecionado. O nome
                    do contato não substitui a identidade da empresa.
                  </p>
                </div>
              )}

              {alterouVinculo && (
                <label className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0"
                    checked={vinculoConfirmado} disabled={bloqueado}
                    onChange={(event) => setVinculoConfirmado(event.target.checked)} />
                  <span>
                    Conferi a empresa real, o contato e a Prospecção{" "}
                    <strong>{origemEfetiva ? codigoInteracao(origemEfetiva.numeroSequencial) : ""}</strong>.
                    Confirmo que pertencem ao cadastro selecionado, sem criar
                    duplicidade ou inventar CNPJ.
                  </span>
                </label>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={bloqueado || conferindoOrigem ||
            (alterouVinculo && !vinculoConfirmado)}>
            {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" disabled={salvando}
            onClick={() => router.push(`/orcamentos/${id}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}