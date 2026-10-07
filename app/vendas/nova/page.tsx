"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Factory,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  Save,
  Search,
  ShoppingCart,
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

type UsuarioResumo = {
  id: string
  nome: string
}

type RepresentadaResumo = {
  id: string
  codigo?: string | null
  nome: string
}

type AtencaoComercial = {
  id: string
  tipo: string
  titulo: string
  descricao: string
  status: string
  resolucao: string | null
  criadoEm: string
  resolvidoEm: string | null
  representada: RepresentadaResumo | null
  criadoPor: UsuarioResumo | null
  resolvidoPor: UsuarioResumo | null
}

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type ClienteDetalhado = Cliente & {
  termometroRelacionamento: string | null
  atencoesComerciais?: AtencaoComercial[]
}

type Representada = {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  status: string
  comissao: number | null
}

type Orcamento = {
  id: string
  numeroSequencial: number
  clienteId: string
  representadaId: string
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  observacoes: string | null
  status: string
  data: string
  validadeEm: string
  cliente: {
    id: string
    codigo: string | null
    razaoSocial: string
    nomeFantasia: string | null
    cnpj: string | null
  } | null
  representada: {
    id: string
    nome: string
    cnpj: string | null
    comissao?: number | null
  }
  vendaGerada?: { id: string } | null
}

type RegraComercial = {
  id: string
  representadaId: string
  clienteId: string | null
  nome: string
  tipoEscopo: string
  vigenciaInicio: string
  vigenciaFim: string | null
  ativa: boolean
}

function formatarCodigoOrcamento(numero: number) {
  return `ORC-${String(numero).padStart(6, "0")}`
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatarData(valor: string | null) {
  if (!valor) return "—"

  const data = new Date(valor)

  return Number.isNaN(data.getTime())
    ? "—"
    : data.toLocaleDateString("pt-BR")
}

function dataHojeInput() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, "0")
  const dia = String(agora.getDate()).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function converterValorBR(valor: string): number | null {
  const limpo = valor.trim().replace(/\s/g, "")

  if (!limpo) return null

  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo

  const numero = Number(normalizado)

  return Number.isFinite(numero)
    ? numero
    : null
}

function numeroParaInputBR(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function rotuloCliente(cliente: Cliente) {
  return cliente.nomeFantasia || cliente.razaoSocial
}

function descricaoTermometro(valor: string | null) {
  switch (valor) {
    case "Verde":
      return {
        emoji: "🟢",
        titulo: "Relacionamento consolidado",
        classe: "border-green-200 bg-green-50 text-green-900",
      }

    case "Azul":
      return {
        emoji: "🔵",
        titulo: "Bom relacionamento / em desenvolvimento",
        classe: "border-blue-200 bg-blue-50 text-blue-900",
      }

    case "Amarelo":
      return {
        emoji: "🟡",
        titulo: "Atenção / relacionamento irregular",
        classe: "border-yellow-200 bg-yellow-50 text-yellow-900",
      }

    case "Laranja":
      return {
        emoji: "🟠",
        titulo: "Cautela comercial",
        classe: "border-orange-200 bg-orange-50 text-orange-900",
      }

    case "Vermelho":
      return {
        emoji: "🔴",
        titulo: "Relacionamento crítico",
        classe: "border-red-200 bg-red-50 text-red-900",
      }

    default:
      return {
        emoji: "⚪",
        titulo: "Não classificado",
        classe: "border-slate-200 bg-slate-50 text-slate-700",
      }
  }
}

function classeTipoAtencao(tipo: string) {
  switch (tipo) {
    case "Restrição":
      return "border-red-200 bg-red-50 text-red-800"

    case "Atenção":
      return "border-orange-200 bg-orange-50 text-orange-800"

    case "Informação importante":
      return "border-blue-200 bg-blue-50 text-blue-800"

    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function moedaValidaNaoNegativa(valor: string) {
  if (valor.trim() === "") return 0

  const numero = converterValorBR(valor)

  if (
    numero === null ||
    numero < 0 ||
    !Number.isSafeInteger(Math.round(numero * 100)) ||
    Math.abs(numero * 100 - Math.round(numero * 100)) > 0.000001
  ) {
    return null
  }

  return Math.round(numero * 100) / 100
}

function regraEstaVigente(
  regra: RegraComercial,
  dataVenda: string
) {
  const inicio = regra.vigenciaInicio.slice(0, 10)
  const fim = regra.vigenciaFim?.slice(0, 10) || null

  return (
    regra.ativa &&
    /^\d{4}-\d{2}-\d{2}$/.test(dataVenda) &&
    inicio <= dataVenda &&
    (fim === null || dataVenda <= fim)
  )
}

export default function NovaVendaPage() {
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [representadas, setRepresentadas] = useState<Representada[]>([])
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)

  const [
    orcamentoOrigemId,
    setOrcamentoOrigemId,
  ] = useState<string | null>(null)

  const [clienteId, setClienteId] = useState("")
  const [buscaCliente, setBuscaCliente] = useState("")
  const [listaClientesAberta, setListaClientesAberta] = useState(false)
  const [carregandoClientes, setCarregandoClientes] = useState(false)

  const [representadaId, setRepresentadaId] = useState("")
  const [buscaRepresentada, setBuscaRepresentada] = useState("")
  const [listaRepresentadasAberta, setListaRepresentadasAberta] = useState(false)
  const [carregandoRepresentadas, setCarregandoRepresentadas] = useState(false)

  const [dataVenda, setDataVenda] = useState(dataHojeInput())
  const [valorTotal, setValorTotal] = useState("")
  const [condicaoPagamento, setCondicaoPagamento] = useState("")
  const [numeroPedido, setNumeroPedido] = useState("")
  const [numeroPedidoRepresentada, setNumeroPedidoRepresentada] = useState("")
  const [numeroOCCliente, setNumeroOCCliente] = useState("")
  const [produto, setProduto] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [desconto, setDesconto] = useState("")
  const [bonificacaoValor, setBonificacaoValor] = useState("")
  const [previsaoFaturamento, setPrevisaoFaturamento] = useState("")
  const [observacoes, setObservacoes] = useState("")

  const [carregandoOrcamento, setCarregandoOrcamento] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const [
    clienteDetalhado,
    setClienteDetalhado,
  ] = useState<ClienteDetalhado | null>(null)

  const [
    carregandoClienteDetalhado,
    setCarregandoClienteDetalhado,
  ] = useState(false)

  const [
    erroClienteDetalhado,
    setErroClienteDetalhado,
  ] = useState<string | null>(null)

  const [
    regrasComerciais,
    setRegrasComerciais,
  ] = useState<RegraComercial[]>([])

  const [regraComercialId, setRegraComercialId] = useState("")
  const [carregandoRegras, setCarregandoRegras] = useState(false)
  const [erroRegras, setErroRegras] = useState<string | null>(null)

  useEffect(() => {
    const parametros = new URLSearchParams(
      window.location.search
    )

    const id = parametros.get("orcamentoId")

    if (id) {
      setOrcamentoOrigemId(id)

      router.replace(
        `/orcamentos/${encodeURIComponent(id)}`
      )
    }
  }, [router])

  useEffect(() => {
    if (!orcamentoOrigemId) return

    const id = orcamentoOrigemId

    async function carregarOrcamento() {
      try {
        setCarregandoOrcamento(true)
        setErro(null)

        const response = await fetch(
          `/api/orcamentos/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        )

        const data = await response
          .json()
          .catch(() => null)

        if (!response.ok) {
          setErro(
            data?.message ||
              "Não foi possível carregar o orçamento de origem."
          )

          return
        }

        if (data.status !== "Aprovado") {
          setErro(
            "Somente orçamento aprovado pode ser convertido em venda."
          )

          return
        }

        if (data.vendaGerada) {
          setErro(
            "Este orçamento já possui uma venda vinculada."
          )

          return
        }

        const origem = data as Orcamento

        setOrcamento(origem)

        if (origem.cliente) {
          setClientes([
            {
              ...origem.cliente,
              status: "Ativo",
            },
          ])
        }

        if (origem.representada) {
          setRepresentadas([
            {
              id: origem.representada.id,
              codigo: null,
              nome: origem.representada.nome,
              cnpj: origem.representada.cnpj,
              status: "Ativa",
              comissao: origem.representada.comissao ?? null,
            },
          ])
        }

        setClienteId(origem.clienteId)
        setRepresentadaId(origem.representadaId)

        setValorTotal(
          numeroParaInputBR(
            Number(origem.valorTotal)
          )
        )

        setCondicaoPagamento(
          origem.condicaoPagamento || ""
        )

        if (origem.descricao) {
          setObservacoes(
            `Origem ${formatarCodigoOrcamento(
              origem.numeroSequencial
            )}: ${origem.descricao}`
          )
        }
      } catch {
        setErro(
          "Erro ao carregar o orçamento de origem."
        )
      } finally {
        setCarregandoOrcamento(false)
      }
    }

    void carregarOrcamento()
  }, [orcamentoOrigemId])

  useEffect(() => {
    if (orcamentoOrigemId || clienteId) {
      setCarregandoClientes(false)
      return
    }

    const termo = buscaCliente.trim()

    if (termo.length < 2) {
      setClientes([])
      setCarregandoClientes(false)
      return
    }

    const controller = new AbortController()

    const timer = window.setTimeout(
      async () => {
        setCarregandoClientes(true)

        try {
          const params = new URLSearchParams({
            seletor: "1",
            busca: termo,
            limit: "20",
            somenteAtivos: "1",
          })

          const response = await fetch(
            `/api/clientes?${params.toString()}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          )

          const data = await response
            .json()
            .catch(() => [])

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Não foi possível pesquisar Clientes."
            )
          }

          const resultados: Cliente[] =
            Array.isArray(data)
              ? data
                  .filter(
                    (cliente: Cliente) =>
                      Boolean(
                        cliente?.cnpj?.trim()
                      )
                  )
                  .slice(0, 10)
              : []

          setClientes(resultados)
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return
          }

          console.error(
            "Erro ao pesquisar Clientes:",
            error
          )

          setClientes([])
        } finally {
          if (!controller.signal.aborted) {
            setCarregandoClientes(false)
          }
        }
      },
      350
    )

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [
    orcamentoOrigemId,
    buscaCliente,
    clienteId,
  ])

  /*
   * Carrega o Termômetro e as Atenções Comerciais
   * do Cliente selecionado.
   *
   * Esses dados são informativos e não alteram
   * as regras de salvamento da Venda.
   */
  useEffect(() => {
    if (!clienteId) {
      setClienteDetalhado(null)
      setCarregandoClienteDetalhado(false)
      setErroClienteDetalhado(null)
      return
    }

    const controller = new AbortController()

    const carregarClienteDetalhado = async () => {
      setCarregandoClienteDetalhado(true)
      setErroClienteDetalhado(null)

      try {
        const response = await fetch(
          `/api/clientes/${encodeURIComponent(
            clienteId
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        const data = await response
          .json()
          .catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Não foi possível carregar as informações comerciais do Cliente."
          )
        }

        if (!controller.signal.aborted) {
          setClienteDetalhado(
            data as ClienteDetalhado
          )
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        console.error(
          "Erro ao carregar informações comerciais do Cliente:",
          error
        )

        setClienteDetalhado(null)

        setErroClienteDetalhado(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as informações comerciais do Cliente."
        )
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoClienteDetalhado(false)
        }
      }
    }

    void carregarClienteDetalhado()

    return () => controller.abort()
  }, [clienteId])

  useEffect(() => {
    if (orcamentoOrigemId || representadaId) {
      setCarregandoRepresentadas(false)
      return
    }

    const termo = buscaRepresentada.trim()

    if (termo.length < 2) {
      setRepresentadas([])
      setCarregandoRepresentadas(false)
      return
    }

    const controller = new AbortController()

    const timer = window.setTimeout(
      async () => {
        setCarregandoRepresentadas(true)

        try {
          const params = new URLSearchParams({
            seletor: "1",
            busca: termo,
            limit: "10",
            somenteAtivas: "1",
          })

          const response = await fetch(
            `/api/representadas?${params.toString()}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          )

          const data = await response
            .json()
            .catch(() => [])

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Não foi possível pesquisar Representadas."
            )
          }

          setRepresentadas(
            Array.isArray(data)
              ? data
              : []
          )
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return
          }

          console.error(
            "Erro ao pesquisar Representadas:",
            error
          )

          setRepresentadas([])
        } finally {
          if (!controller.signal.aborted) {
            setCarregandoRepresentadas(false)
          }
        }
      },
      350
    )

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [
    orcamentoOrigemId,
    buscaRepresentada,
    representadaId,
  ])

  useEffect(() => {
    setRegraComercialId("")
    setRegrasComerciais([])
    setErroRegras(null)

    if (
      !representadaId ||
      orcamentoOrigemId
    ) {
      setCarregandoRegras(false)
      return
    }

    const controller = new AbortController()

    setCarregandoRegras(true)

    const carregarRegras = async () => {
      try {
        const response = await fetch(
          `/api/representadas/${encodeURIComponent(
            representadaId
          )}/regras-comerciais`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        const dados = await response
          .json()
          .catch(() => null)

        if (
          !response.ok ||
          !Array.isArray(dados)
        ) {
          throw new Error(
            dados?.message ||
              "Não foi possível consultar as regras comerciais da Representada."
          )
        }

        if (!controller.signal.aborted) {
          setRegrasComerciais(
            dados as RegraComercial[]
          )
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setErroRegras(
          error instanceof Error
            ? error.message
            : "Não foi possível consultar as regras comerciais da Representada."
        )
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoRegras(false)
        }
      }
    }

    void carregarRegras()

    return () => controller.abort()
  }, [
    representadaId,
    orcamentoOrigemId,
  ])

  const vendaViaOrcamento = Boolean(
    orcamentoOrigemId
  )

  const clientesDisponiveis = useMemo(
    () =>
      clientes.filter(
        (cliente) =>
          cliente.status === "Ativo" &&
          Boolean(
            cliente.cnpj?.trim()
          )
      ),
    [clientes]
  )

  const representadasDisponiveis = useMemo(
    () =>
      representadas.filter(
        (representada) =>
          representada.status === "Ativa"
      ),
    [representadas]
  )

  const clientesFiltrados = useMemo(
    () =>
      clientesDisponiveis.slice(
        0,
        10
      ),
    [clientesDisponiveis]
  )

  const representadasFiltradas = useMemo(
    () =>
      representadasDisponiveis.slice(
        0,
        10
      ),
    [representadasDisponiveis]
  )

  const clienteSelecionado = useMemo(
    () =>
      clientes.find(
        (cliente) =>
          cliente.id === clienteId
      ) || null,
    [
      clientes,
      clienteId,
    ]
  )

  const representadaSelecionada = useMemo(
    () =>
      representadas.find(
        (representada) =>
          representada.id ===
          representadaId
      ) || null,
    [
      representadas,
      representadaId,
    ]
  )

  const atencoesAtivas = useMemo(
    () =>
      (
        clienteDetalhado?.atencoesComerciais ||
        []
      ).filter(
        (atencao) =>
          atencao.status === "Ativa"
      ),
    [clienteDetalhado]
  )

  const atencoesAtivasOrdenadas = useMemo(
    () => {
      if (!representadaId) {
        return atencoesAtivas
      }

      return [
        ...atencoesAtivas,
      ].sort(
        (
          a,
          b
        ) => {
          const aEspecifica =
            a.representada?.id ===
            representadaId

          const bEspecifica =
            b.representada?.id ===
            representadaId

          if (
            aEspecifica ===
            bEspecifica
          ) {
            return 0
          }

          return aEspecifica
            ? -1
            : 1
        }
      )
    },
    [
      atencoesAtivas,
      representadaId,
    ]
  )

  const termometro = descricaoTermometro(
    clienteDetalhado
      ?.termometroRelacionamento ||
      null
  )

  const regrasElegiveis = useMemo(
    () => {
      const vigentes =
        regrasComerciais.filter(
          (regra) =>
            regra.representadaId ===
              representadaId &&
            regraEstaVigente(
              regra,
              dataVenda
            )
        )

      const especificas =
        vigentes.filter(
          (regra) =>
            regra.clienteId ===
              clienteId &&
            regra.tipoEscopo !==
              "Padrao"
        )

      return especificas.length > 0
        ? especificas
        : vigentes.filter(
            (regra) =>
              regra.clienteId ===
                null &&
              regra.tipoEscopo ===
                "Padrao"
          )
    },
    [
      regrasComerciais,
      representadaId,
      clienteId,
      dataVenda,
    ]
  )

  const regraSelecionadaValida =
    !regraComercialId ||
    regrasElegiveis.some(
      (regra) =>
        regra.id ===
        regraComercialId
    )

  /*
   * Políticas de Cliente também exigem
   * confirmação explícita: podem ser
   * condições excepcionais, não necessariamente
   * aplicáveis a toda compra.
   */
  const exigeEscolhaRegra =
    regrasElegiveis.length > 1 ||
    (
      regrasElegiveis.length === 1 &&
      regrasElegiveis[0].tipoEscopo !==
        "Padrao"
    )

  const regraPrecisaSelecao =
    exigeEscolhaRegra &&
    !regraComercialId

  const valorNumerico = useMemo(
    () =>
      converterValorBR(
        valorTotal
      ),
    [valorTotal]
  )

  const descontoNumerico = useMemo(
    () =>
      moedaValidaNaoNegativa(
        desconto
      ),
    [desconto]
  )

  const bonificacaoNumerica = useMemo(
    () =>
      moedaValidaNaoNegativa(
        bonificacaoValor
      ),
    [bonificacaoValor]
  )

  const valorTotalValido =
    valorNumerico !== null &&
    valorNumerico > 0 &&
    Number.isSafeInteger(
      Math.round(
        valorNumerico * 100
      )
    ) &&
    Math.abs(
      valorNumerico * 100 -
        Math.round(
          valorNumerico * 100
        )
    ) <= 0.000001

  const valorOriginal =
    valorTotalValido &&
    descontoNumerico !== null &&
    valorNumerico !== null
      ? (
          Math.round(
            valorNumerico * 100
          ) +
          Math.round(
            descontoNumerico * 100
          )
        ) /
        100
      : null

  const percentualDesconto =
    valorOriginal !== null &&
    valorOriginal > 0 &&
    descontoNumerico !== null
      ? (
          descontoNumerico /
          valorOriginal
        ) *
        100
      : null

  const podeSalvar = Boolean(
    !vendaViaOrcamento &&
      clienteId &&
      representadaId &&
      dataVenda &&
      valorTotalValido &&
      descontoNumerico !== null &&
      bonificacaoNumerica !== null &&
      !carregandoRegras &&
      !erroRegras &&
      regraSelecionadaValida &&
      !regraPrecisaSelecao &&
      !salvando
  )

  function selecionarCliente(
    cliente: Cliente
  ) {
    setClienteId(
      cliente.id
    )

    setClientes([
      cliente,
    ])

    setClienteDetalhado(
      null
    )

    setErroClienteDetalhado(
      null
    )

    setBuscaCliente(
      rotuloCliente(
        cliente
      )
    )

    setListaClientesAberta(
      false
    )

    setRegraComercialId(
      ""
    )

    setErro(
      null
    )
  }

  function selecionarRepresentada(
    representada: Representada
  ) {
    setRepresentadaId(
      representada.id
    )

    setRepresentadas([
      representada,
    ])

    setBuscaRepresentada(
      representada.nome
    )

    setListaRepresentadasAberta(
      false
    )

    setRegraComercialId(
      ""
    )

    setErro(
      null
    )
  }

  async function salvarVenda(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setErro(
      null
    )

    setSucesso(
      null
    )

    if (orcamentoOrigemId) {
      router.replace(
        `/orcamentos/${encodeURIComponent(
          orcamentoOrigemId
        )}`
      )

      return
    }

    if (
      !clienteId ||
      !clienteSelecionado
    ) {
      setErro(
        "Selecione o Cliente."
      )

      return
    }

    if (
      !clienteSelecionado
        .cnpj
        ?.trim()
    ) {
      setErro(
        "O Cliente precisa possuir CNPJ cadastrado para registrar Venda."
      )

      return
    }

    if (
      !representadaId ||
      !representadaSelecionada
    ) {
      setErro(
        "Selecione a Representada."
      )

      return
    }

    if (!dataVenda) {
      setErro(
        "Informe a data da Venda."
      )

      return
    }

    if (
      !valorTotalValido ||
      valorNumerico === null
    ) {
      setErro(
        "Informe o valor final da Venda maior que zero, em reais e com até duas casas decimais."
      )

      return
    }

    if (
      descontoNumerico === null ||
      bonificacaoNumerica === null
    ) {
      setErro(
        "Desconto e bonificação devem ser valores não negativos, com até duas casas decimais."
      )

      return
    }

    if (
      carregandoRegras ||
      erroRegras
    ) {
      setErro(
        erroRegras ||
          "Aguarde a consulta das regras comerciais da Representada."
      )

      return
    }

    if (
      !regraSelecionadaValida ||
      regraPrecisaSelecao
    ) {
      setErro(
        "Selecione uma regra comercial válida para a Representada, Cliente e data da Venda."
      )

      return
    }

    const quantidadeNumero =
      quantidade.trim() !== ""
        ? Number(
            quantidade
          )
        : null

    try {
      setSalvando(
        true
      )

      const response = await fetch(
        "/api/vendas",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              orcamentoOrigemId:
                null,

              clienteId,

              representadaId,

              regraComercialId:
                regraComercialId ||
                null,

              data:
                dataVenda,

              valorTotal:
                valorNumerico,

              condicaoPagamento,

              numeroPedido,

              numeroPedidoRepresentada,

              numeroOCCliente,

              produto,

              quantidade:
                quantidadeNumero,

              desconto:
                descontoNumerico,

              bonificacaoValor:
                bonificacaoNumerica,

              previsaoFaturamento:
                previsaoFaturamento ||
                null,

              status:
                "Pendente",

              observacoes,
            }),
        }
      )

      const data = await response
        .json()
        .catch(
          () => null
        )

      if (!response.ok) {
        if (
          response.status === 409 &&
          data?.vendaId
        ) {
          setErro(
            "Este Orçamento já foi convertido em Venda."
          )

          return
        }

        setErro(
          data?.message ||
            "Não foi possível registrar a Venda."
        )

        return
      }

      setSucesso(
        "Venda registrada com sucesso."
      )

      if (data?.id) {
        router.push(
          `/vendas/${data.id}`
        )

        router.refresh()

        return
      }

      router.push(
        "/vendas"
      )
    } catch {
      setErro(
        "Erro de comunicação ao registrar a Venda."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  return (
    <PageLayout title="Nova Venda">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.back()
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Link href="/vendas">
            <Button
              type="button"
              variant="outline"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Vendas
            </Button>
          </Link>
        </div>

        <div
          className={`rounded-md border px-3 py-2 text-xs font-medium ${
            vendaViaOrcamento
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {vendaViaOrcamento
            ? "Conversão pelo Orçamento"
            : "Venda direta / retroativa"}
        </div>
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {erro}
          </span>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />

          {sucesso}
        </div>
      )}

      {vendaViaOrcamento &&
        orcamentoOrigemId && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Para preservar o aceite e o
            vínculo com o Orçamento,
            conclua a conversão na página
            do próprio Orçamento.{" "}

            <Link
              href={`/orcamentos/${encodeURIComponent(
                orcamentoOrigemId
              )}`}
              className="font-semibold underline"
            >
              Abrir Orçamento
            </Link>
          </div>
        )}

      {carregandoOrcamento && (
        <div className="mb-4 flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando Orçamento aprovado...
        </div>
      )}

      {orcamento && (
        <Card className="mb-4 border-green-200 bg-green-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck2 className="h-5 w-5 text-green-700" />

              Origem da Venda
            </CardTitle>

            <CardDescription>
              A conversão deve ser feita
              na página do Orçamento,
              com verificação do aceite
              registrado.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Orçamento
                </p>

                <Link
                  href={`/orcamentos/${orcamento.id}`}
                  className="font-mono text-sm font-bold text-blue-700 hover:underline"
                >
                  {formatarCodigoOrcamento(
                    orcamento.numeroSequencial
                  )}
                </Link>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="text-sm font-semibold text-green-700">
                  {
                    orcamento.status
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Valor aprovado
                </p>

                <p className="text-sm font-semibold">
                  {formatarMoeda(
                    Number(
                      orcamento.valorTotal
                    )
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Validade
                </p>

                <p className="text-sm">
                  {formatarData(
                    orcamento.validadeEm
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-md border bg-white p-3 text-xs text-muted-foreground">
              Cliente, Representada, valor
              e condição de pagamento são
              preservados pelo servidor
              conforme o Orçamento
              aprovado.
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={salvarVenda}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Dados da Venda
                </CardTitle>

                <CardDescription>
                  Registre pedidos atuais
                  ou retroativos. A data
                  informada representa a
                  data real da Venda.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Cliente *
                  </Label>

                  {vendaViaOrcamento ? (
                    <div className="rounded-md border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Building2 className="h-4 w-4 text-blue-600" />

                        {orcamento?.cliente
                          ? orcamento.cliente.nomeFantasia ||
                            orcamento.cliente.razaoSocial
                          : "Carregando Cliente..."}
                      </div>

                      {orcamento?.cliente && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {orcamento.cliente.codigo
                            ? `${orcamento.cliente.codigo} — `
                            : ""}

                          CNPJ:{" "}
                          {orcamento.cliente.cnpj ||
                            "não informado"}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-green-700">
                        Definido pelo Orçamento
                        aprovado.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        value={
                          buscaCliente
                        }
                        onFocus={() =>
                          setListaClientesAberta(
                            true
                          )
                        }
                        onBlur={() =>
                          window.setTimeout(
                            () =>
                              setListaClientesAberta(
                                false
                              ),
                            150
                          )
                        }
                        onChange={(
                          event
                        ) => {
                          setBuscaCliente(
                            event.target.value
                          )

                          setClienteId(
                            ""
                          )

                          setClientes(
                            []
                          )

                          setClienteDetalhado(
                            null
                          )

                          setErroClienteDetalhado(
                            null
                          )

                          setRegraComercialId(
                            ""
                          )

                          setListaClientesAberta(
                            true
                          )
                        }}
                        placeholder="Digite nome, fantasia, código ou CNPJ..."
                        className="pl-9"
                        autoComplete="off"
                      />

                      {listaClientesAberta && (
                        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                          {buscaCliente
                            .trim()
                            .length < 2 ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Digite pelo menos 2
                              caracteres.
                            </div>
                          ) : carregandoClientes ? (
                            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />

                              Pesquisando Clientes...
                            </div>
                          ) : clientesFiltrados.length >
                            0 ? (
                            clientesFiltrados.map(
                              (
                                cliente
                              ) => (
                                <button
                                  key={
                                    cliente.id
                                  }
                                  type="button"
                                  className="block w-full border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                                  onMouseDown={(
                                    event
                                  ) => {
                                    event.preventDefault()

                                    selecionarCliente(
                                      cliente
                                    )
                                  }}
                                >
                                  <div className="text-sm font-medium">
                                    {rotuloCliente(
                                      cliente
                                    )}
                                  </div>

                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    {cliente.codigo && (
                                      <span>
                                        {
                                          cliente.codigo
                                        }
                                      </span>
                                    )}

                                    {cliente.nomeFantasia &&
                                      cliente.nomeFantasia !==
                                        cliente.razaoSocial && (
                                        <span>
                                          Razão social:{" "}
                                          {
                                            cliente.razaoSocial
                                          }
                                        </span>
                                      )}

                                    {cliente.cnpj && (
                                      <span>
                                        CNPJ:{" "}
                                        {
                                          cliente.cnpj
                                        }
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            )
                          ) : (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Nenhum Cliente ativo
                              com CNPJ encontrado para
                              esta busca.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {clienteId && (
                  <div className="space-y-3">
                    {carregandoClienteDetalhado && (
                      <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Carregando Termômetro e
                        Atenções Comerciais do
                        Cliente...
                      </div>
                    )}

                    {erroClienteDetalhado && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                          <p className="font-medium">
                            Não foi possível carregar
                            o resumo comercial do
                            Cliente.
                          </p>

                          <p className="mt-1">
                            {
                              erroClienteDetalhado
                            }
                          </p>

                          <p className="mt-1 text-xs">
                            A Venda não está
                            bloqueada por este aviso.
                            Consulte a ficha do
                            Cliente se precisar dessas
                            informações antes de
                            continuar.
                          </p>
                        </div>
                      </div>
                    )}

                    {clienteDetalhado && (
                      <>
                        <div
                          className={`rounded-md border p-3 ${termometro.classe}`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                Termômetro de
                                relacionamento
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  termometro.emoji
                                }{" "}
                                {
                                  termometro.titulo
                                }
                              </p>
                            </div>

                            <Link
                              href={`/clientes/${clienteId}`}
                              className="text-sm font-medium underline underline-offset-4"
                            >
                              Ver ficha do Cliente
                            </Link>
                          </div>
                        </div>

                        {atencoesAtivas.length >
                        0 ? (
                          <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-orange-950">
                                  Este Cliente possui{" "}
                                  {
                                    atencoesAtivas.length
                                  }{" "}
                                  {atencoesAtivas.length ===
                                  1
                                    ? "Atenção Comercial ativa"
                                    : "Atenções Comerciais ativas"}
                                  .
                                </p>

                                <p className="mt-1 text-sm text-orange-900">
                                  Leia as informações
                                  antes de registrar o
                                  pedido. Elas são
                                  alertas comerciais e
                                  não bloqueiam
                                  automaticamente a
                                  Venda.
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {atencoesAtivasOrdenadas
                                .slice(
                                  0,
                                  5
                                )
                                .map(
                                  (
                                    atencao
                                  ) => {
                                    const atencaoDaRepresentada =
                                      Boolean(
                                        representadaId &&
                                          atencao
                                            .representada
                                            ?.id ===
                                            representadaId
                                      )

                                    return (
                                      <div
                                        key={
                                          atencao.id
                                        }
                                        className={`rounded-md border p-3 ${
                                          atencaoDaRepresentada
                                            ? "border-orange-400 bg-orange-100"
                                            : "border-orange-200 bg-white/80"
                                        }`}
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span
                                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${classeTipoAtencao(
                                              atencao.tipo
                                            )}`}
                                          >
                                            {
                                              atencao.tipo
                                            }
                                          </span>

                                          {atencao.representada ? (
                                            <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                              Representada:{" "}
                                              {
                                                atencao
                                                  .representada
                                                  .nome
                                              }
                                            </span>
                                          ) : (
                                            <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                              Geral do
                                              Cliente
                                            </span>
                                          )}

                                          {atencaoDaRepresentada && (
                                            <span className="rounded-full border border-orange-400 bg-orange-200 px-2 py-0.5 text-xs font-semibold text-orange-950">
                                              Relacionada à
                                              Representada
                                              desta Venda
                                            </span>
                                          )}
                                        </div>

                                        <p className="mt-2 font-medium text-slate-900">
                                          {
                                            atencao.titulo
                                          }
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                          {
                                            atencao.descricao
                                          }
                                        </p>
                                      </div>
                                    )
                                  }
                                )}

                              {atencoesAtivas.length >
                                5 && (
                                <p className="text-sm font-medium text-orange-900">
                                  Existem mais{" "}
                                  {atencoesAtivas.length -
                                    5}{" "}
                                  {atencoesAtivas.length -
                                    5 ===
                                  1
                                    ? "Atenção ativa"
                                    : "Atenções ativas"}{" "}
                                  na ficha do Cliente.
                                </p>
                              )}
                            </div>

                            <div className="mt-3">
                              <Link
                                href={`/clientes/${clienteId}`}
                                className="text-sm font-semibold text-orange-950 underline underline-offset-4"
                              >
                                Ver todas as Atenções
                                do Cliente
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                            Nenhuma Atenção Comercial
                            ativa registrada para este
                            Cliente.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    Representada *
                  </Label>

                  {vendaViaOrcamento ? (
                    <div className="rounded-md border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Factory className="h-4 w-4 text-orange-600" />

                        {orcamento
                          ?.representada
                          ?.nome ||
                          "Carregando Representada..."}
                      </div>

                      <p className="mt-2 text-xs text-green-700">
                        Definida pelo Orçamento
                        aprovado.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        value={
                          buscaRepresentada
                        }
                        onFocus={() =>
                          setListaRepresentadasAberta(
                            true
                          )
                        }
                        onBlur={() =>
                          window.setTimeout(
                            () =>
                              setListaRepresentadasAberta(
                                false
                              ),
                            150
                          )
                        }
                        onChange={(
                          event
                        ) => {
                          setBuscaRepresentada(
                            event.target.value
                          )

                          setRepresentadaId(
                            ""
                          )

                          setRepresentadas(
                            []
                          )

                          setRegraComercialId(
                            ""
                          )

                          setListaRepresentadasAberta(
                            true
                          )
                        }}
                        placeholder="Digite nome, código ou CNPJ..."
                        className="pl-9"
                        autoComplete="off"
                      />

                      {listaRepresentadasAberta && (
                        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                          {buscaRepresentada
                            .trim()
                            .length < 2 ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Digite pelo menos 2
                              caracteres.
                            </div>
                          ) : carregandoRepresentadas ? (
                            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />

                              Pesquisando
                              Representadas...
                            </div>
                          ) : representadasFiltradas.length >
                            0 ? (
                            representadasFiltradas.map(
                              (
                                representada
                              ) => (
                                <button
                                  key={
                                    representada.id
                                  }
                                  type="button"
                                  className="block w-full border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                                  onMouseDown={(
                                    event
                                  ) => {
                                    event.preventDefault()

                                    selecionarRepresentada(
                                      representada
                                    )
                                  }}
                                >
                                  <div className="text-sm font-medium">
                                    {
                                      representada.nome
                                    }
                                  </div>

                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                    {representada.codigo && (
                                      <span>
                                        {
                                          representada.codigo
                                        }
                                      </span>
                                    )}

                                    {representada.cnpj && (
                                      <span>
                                        CNPJ:{" "}
                                        {
                                          representada.cnpj
                                        }
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            )
                          ) : (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                              Nenhuma Representada
                              ativa encontrada para
                              esta busca.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataVenda">
                      Data da Venda *
                    </Label>

                    <Input
                      id="dataVenda"
                      type="date"
                      value={
                        dataVenda
                      }
                      onChange={(
                        event
                      ) => {
                        setDataVenda(
                          event.target.value
                        )

                        setRegraComercialId(
                          ""
                        )
                      }}
                    />

                    <p className="text-xs text-muted-foreground">
                      Aceita datas anteriores para
                      lançamento retroativo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorTotal">
                      Valor final do pedido (R$) *
                    </Label>

                    <Input
                      id="valorTotal"
                      value={
                        valorTotal
                      }
                      onChange={(
                        event
                      ) =>
                        setValorTotal(
                          event.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="Ex.: 12.500,00"
                      disabled={
                        vendaViaOrcamento
                      }
                    />

                    <p className="text-xs text-muted-foreground">
                      Informe o valor já com os
                      descontos negociados.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicaoPagamento">
                    Condição de pagamento
                  </Label>

                  <Input
                    id="condicaoPagamento"
                    value={
                      condicaoPagamento
                    }
                    onChange={(
                      event
                    ) =>
                      setCondicaoPagamento(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: 28/35/42 dias"
                    disabled={
                      vendaViaOrcamento
                    }
                  />

                  {vendaViaOrcamento && (
                    <p className="text-xs text-green-700">
                      Condição preservada do
                      Orçamento aprovado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Identificação do Pedido
                </CardTitle>

                <CardDescription>
                  Informações utilizadas para
                  rastrear o pedido junto ao
                  Cliente e à Representada.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPedido">
                      Número do Pedido
                    </Label>

                    <Input
                      id="numeroPedido"
                      value={
                        numeroPedido
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroPedido(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroPedidoRepresentada">
                      Pedido Representada
                    </Label>

                    <Input
                      id="numeroPedidoRepresentada"
                      value={
                        numeroPedidoRepresentada
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroPedidoRepresentada(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroOCCliente">
                      OC do Cliente
                    </Label>

                    <Input
                      id="numeroOCCliente"
                      value={
                        numeroOCCliente
                      }
                      onChange={(
                        event
                      ) =>
                        setNumeroOCCliente(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="produto">
                      Produto / resumo
                    </Label>

                    <Input
                      id="produto"
                      value={
                        produto
                      }
                      onChange={(
                        event
                      ) =>
                        setProduto(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">
                      Quantidade
                    </Label>

                    <Input
                      id="quantidade"
                      type="number"
                      min="0"
                      step="1"
                      value={
                        quantidade
                      }
                      onChange={(
                        event
                      ) =>
                        setQuantidade(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Ajustes Comerciais
                </CardTitle>

                <CardDescription>
                  O valor final da Venda já
                  contém o desconto. A
                  bonificação é registrada
                  para o histórico do Cliente,
                  sem reduzir automaticamente
                  a base de comissão.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="desconto">
                      Desconto já concedido (R$)
                    </Label>

                    <Input
                      id="desconto"
                      value={
                        desconto
                      }
                      onChange={(
                        event
                      ) =>
                        setDesconto(
                          event.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="0,00"
                    />

                    <p className="text-xs text-muted-foreground">
                      Não será subtraído
                      novamente. É usado para
                      identificar a faixa de
                      comissão e o valor original
                      do pedido.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonificacaoValor">
                      Bonificação concedida (R$)
                    </Label>

                    <Input
                      id="bonificacaoValor"
                      value={
                        bonificacaoValor
                      }
                      onChange={(
                        event
                      ) =>
                        setBonificacaoValor(
                          event.target.value
                        )
                      }
                      inputMode="decimal"
                      placeholder="0,00"
                    />

                    <p className="text-xs text-muted-foreground">
                      Registre apenas o valor
                      conhecido. A bonificação não
                      diminui automaticamente a
                      base da comissão.
                    </p>
                  </div>
                </div>

                {(descontoNumerico === null ||
                  bonificacaoNumerica === null) && (
                  <p className="text-sm text-red-700">
                    Informe desconto e
                    bonificação válidos, sem
                    valores negativos e com até
                    duas casas decimais.
                  </p>
                )}

                {valorOriginal !== null && (
                  <div className="rounded-md border bg-slate-50 p-3 text-sm">
                    <p>
                      Valor original reconstruído:{" "}
                      <strong>
                        {formatarMoeda(
                          valorOriginal
                        )}
                      </strong>
                    </p>

                    <p>
                      Valor final para comissão:{" "}
                      <strong>
                        {formatarMoeda(
                          valorNumerico!
                        )}
                      </strong>
                    </p>

                    <p>
                      Desconto registrado:{" "}
                      <strong>
                        {formatarMoeda(
                          descontoNumerico!
                        )}
                      </strong>

                      {percentualDesconto !==
                        null &&
                        ` (${percentualDesconto.toLocaleString(
                          "pt-BR",
                          {
                            maximumFractionDigits:
                              4,
                          }
                        )}%)`}
                    </p>

                    <p>
                      Bonificação informada:{" "}
                      <strong>
                        {formatarMoeda(
                          bonificacaoNumerica ??
                            0
                        )}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="previsaoFaturamento">
                    Previsão de faturamento
                  </Label>

                  <Input
                    id="previsaoFaturamento"
                    type="date"
                    value={
                      previsaoFaturamento
                    }
                    onChange={(
                      event
                    ) =>
                      setPrevisaoFaturamento(
                        event.target.value
                      )
                    }
                  />
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
                  value={
                    observacoes
                  }
                  onChange={(
                    event
                  ) =>
                    setObservacoes(
                      event.target.value
                    )
                  }
                  rows={
                    5
                  }
                  placeholder="Informações comerciais, histórico, faturamento já realizado ou detalhes de desconto/bonificação..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Situação Inicial
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Label>
                  Status
                </Label>

                <div className="rounded-md border bg-slate-50 p-3 text-sm font-medium">
                  Pendente
                </div>

                <div className="rounded-md border bg-slate-50 p-3 text-xs text-muted-foreground">
                  Toda nova Venda manual começa
                  como Pendente. Registre os
                  eventos e a situação real após
                  salvar, conforme o fluxo da
                  Venda.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Comissão Prevista
                </CardTitle>

                <CardDescription>
                  A API determina e registra a
                  comissão oficial ao salvar.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {!representadaId ? (
                  <div className="text-sm text-muted-foreground">
                    Selecione uma Representada
                    para consultar a política.
                  </div>
                ) : carregandoRegras ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Consultando regras
                    comerciais...
                  </div>
                ) : erroRegras ? (
                  <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    {
                      erroRegras
                    }
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="regraComercialId">
                      Regra comercial aplicável
                    </Label>

                    {exigeEscolhaRegra ? (
                      <>
                        <select
                          id="regraComercialId"
                          value={
                            regraSelecionadaValida
                              ? regraComercialId
                              : ""
                          }
                          onChange={(
                            event
                          ) =>
                            setRegraComercialId(
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">
                            Confirme a regra desta
                            negociação *
                          </option>

                          {regrasElegiveis.map(
                            (
                              regra
                            ) => (
                              <option
                                key={
                                  regra.id
                                }
                                value={
                                  regra.id
                                }
                              >
                                {
                                  regra.nome
                                }{" "}
                                —{" "}
                                {regra.tipoEscopo ===
                                "Padrao"
                                  ? "Padrão"
                                  : "Cliente específico"}
                              </option>
                            )
                          )}
                        </select>

                        <p className="text-xs text-amber-700">
                          Confirme a política
                          aplicável a esta
                          negociação. Regras
                          específicas do Cliente
                          podem ser excepcionais.
                        </p>
                      </>
                    ) : regrasElegiveis.length ===
                      1 ? (
                      <div className="rounded-md border bg-slate-50 p-3 text-sm">
                        {
                          regrasElegiveis[0]
                            .nome
                        }

                        <p className="mt-1 text-xs text-muted-foreground">
                          Única regra vigente para
                          este Cliente e data.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border bg-slate-50 p-3 text-sm">
                        Nenhuma regra versionada
                        vigente para esta
                        negociação.

                        <p className="mt-1 text-xs text-muted-foreground">
                          O servidor verificará a
                          política do cadastro
                          principal da
                          Representada. Caso não
                          haja comissão válida, a
                          Venda não será
                          registrada.
                        </p>
                      </div>
                    )}

                    {!regraSelecionadaValida && (
                      <p className="text-sm text-red-700">
                        A regra escolhida não é
                        válida para o Cliente e a
                        data atuais. Selecione
                        outra.
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-md border bg-blue-50 p-3 text-xs text-blue-800">
                  <Info className="mb-1 inline h-4 w-4" />{" "}
                  A comissão não é estimada pelo
                  percentual fixo do cadastro: o
                  servidor consulta a política
                  vigente, identifica a faixa pelo
                  desconto já concedido e calcula
                  sobre o valor final da Venda. O
                  percentual e o valor oficiais
                  aparecerão após salvar.
                </div>
              </CardContent>
            </Card>

            {clienteSelecionado && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Cliente
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium">
                    {rotuloCliente(
                      clienteSelecionado
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    CNPJ:{" "}
                    {clienteSelecionado.cnpj ||
                      "não informado"}
                  </p>
                </CardContent>
              </Card>
            )}

            {representadaSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Representada
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium">
                    {
                      representadaSelecionada.nome
                    }
                  </p>

                  {representadaSelecionada.cnpj && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      CNPJ:{" "}
                      {
                        representadaSelecionada.cnpj
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  Fluxo
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />

                    Data real da Venda
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />

                    {vendaViaOrcamento
                      ? "ORC aprovado vinculado"
                      : "Venda direta / retroativa"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    Auditoria registrada no
                    servidor
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={
              !podeSalvar
            }
          >
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Registrando Venda...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />

                Registrar Venda
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={
              salvando
            }
            onClick={() =>
              router.back()
            }
          >
            Cancelar
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}