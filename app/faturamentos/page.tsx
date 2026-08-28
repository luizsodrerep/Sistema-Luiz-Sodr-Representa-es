"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Home,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react"

import {
  PageLayout,
} from "@/components/page-layout"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Input,
} from "@/components/ui/input"

import {
  Label,
} from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Textarea,
} from "@/components/ui/textarea"

type TituloVenda = {
  id: string
  numeroSequencial: number
  numeroParcela: number | null
  vencimento: string
  valor: number
  status: string
  prorrogadoPara: string | null
  pagoEm: string | null
  atrasoInformadoEm: string | null
  numeroTituloExterno: string | null
}

type FaturamentoVenda = {
  id: string
  numeroNF: string | null
  dataFaturamento: string
  valorFaturado: number
  faturamentoParcial: boolean
  saldoPedido: number | null
  percentualCorte: number | null
  valorCorte: number | null
  motivoCorte: string | null
  status: string
  observacoes: string | null
  titulos: TituloVenda[]
}

type FaturamentoGlobal =
  FaturamentoVenda & {
    venda: {
      id: string
      numeroSequencial: number
      data: string
      valorTotal: number | null
      status: string
      condicaoPagamento: string | null

      cliente: {
        id: string
        codigo: string | null
        razaoSocial: string
        nomeFantasia: string | null
      }

      representada: {
        id: string
        codigo: string | null
        nome: string
      }
    }
  }

type Venda = {
  id: string
  numeroSequencial: number
  data: string
  valorTotal: number | null
  status: string
  condicaoPagamento: string | null
  previsaoFaturamento: string | null
  numeroPedidoRepresentada: string | null
  numeroOCCliente: string | null

  cliente: {
    id: string
    codigo: string | null
    razaoSocial: string
    nomeFantasia: string | null
  }

  representada: {
    id: string
    codigo: string | null
    nome: string
  }
}

type RespostaCriacao = {
  message?: string

  resumo?: {
    vendaId: string
    numeroSequencialVenda: number
    valorVenda: number
    totalFaturadoAnterior: number
    totalCortadoAnterior: number
    valorFaturado: number
    valorCorte: number
    totalFaturadoAtual: number
    totalCortadoAtual: number
    saldoAntes: number
    saldoDepois: number
    faturamentoParcial: boolean
    statusVenda: string
  }
}

type SituacaoFaturamento =
  | "Previsão vencida"
  | "Previsto para hoje"
  | "Sem previsão"
  | "Parcialmente faturado"
  | "Aguardando faturamento"

type PendenciaFaturamento = {
  venda: Venda
  totalFaturado: number
  totalCortado: number
  saldo: number
  quantidadeNFs: number
  situacao: SituacaoFaturamento
  ordem: number
}

function formatarCodigoVenda(
  numero: number
) {
  return `VEN-${String(
    numero
  ).padStart(6, "0")}`
}

function formatarMoeda(
  valor:
    | number
    | null
    | undefined
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "—"
  }

  return Number(
    valor
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )
}

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return "—"
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return data.toLocaleDateString(
    "pt-BR"
  )
}

function dataHojeInput() {
  const agora =
    new Date()

  const ano =
    agora.getFullYear()

  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      agora.getDate()
    ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function dataParaComparacao(
  valor: string | null
) {
  if (!valor) {
    return null
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  const ano =
    data.getFullYear()

  const mes =
    String(
      data.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      data.getDate()
    ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function interpretarCondicaoPagamento(
  valor: string | null
) {
  if (!valor) {
    return null
  }

  const normalizada =
    valor
      .trim()
      .replace(
        /\s+/g,
        ""
      )
      .replace(
        /-/g,
        "/"
      )

  if (
    !/^\d+(?:\/\d+)*$/.test(
      normalizada
    )
  ) {
    return null
  }

  const prazos =
    normalizada
      .split("/")
      .map(
        (
          parte
        ) =>
          Number(
            parte
          )
      )

  if (
    prazos.length === 1 &&
    prazos[0] === 0
  ) {
    return {
      normalizada: "0",
      prazos: [0],
    }
  }

  if (
    prazos.some(
      (
        prazo
      ) =>
        !Number.isInteger(
          prazo
        ) ||
        prazo <= 0
    )
  ) {
    return null
  }

  for (
    let indice = 1;
    indice < prazos.length;
    indice += 1
  ) {
    if (
      prazos[indice] <=
      prazos[indice - 1]
    ) {
      return null
    }
  }

  return {
    normalizada,
    prazos,
  }
}

function adicionarDias(
  dataBase: Date,
  dias: number
) {
  const resultado =
    new Date(
      dataBase.getTime()
    )

  resultado.setDate(
    resultado.getDate() +
      dias
  )

  return resultado
}

function dividirValorEmParcelas(
  valor: number,
  quantidade: number
) {
  const totalCentavos =
    Math.round(
      valor * 100
    )

  const baseCentavos =
    Math.floor(
      totalCentavos /
        quantidade
    )

  const resto =
    totalCentavos %
    quantidade

  return Array.from(
    {
      length:
        quantidade,
    },
    (
      _,
      indice
    ) =>
      (
        baseCentavos +
        (
          indice < resto
            ? 1
            : 0
        )
      ) /
      100
  )
}

function formatarCodigoTitulo(
  numero: number
) {
  return `TIT-${String(
    numero
  ).padStart(6, "0")}`
}

function classeSituacao(
  situacao:
    SituacaoFaturamento
) {
  if (
    situacao ===
    "Previsão vencida"
  ) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (
    situacao ===
    "Previsto para hoje"
  ) {
    return "border-orange-200 bg-orange-50 text-orange-700"
  }

  if (
    situacao ===
    "Sem previsão"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800"
  }

  if (
    situacao ===
    "Parcialmente faturado"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700"
  }

  return "border-slate-200 bg-slate-50 text-slate-700"
}

export default function FaturamentosPage() {
  const [
    vendas,
    setVendas,
  ] = useState<Venda[]>([])

  const [
    faturamentos,
    setFaturamentos,
  ] = useState<
    FaturamentoVenda[]
  >([])

  const [
    faturamentosGerais,
    setFaturamentosGerais,
  ] = useState<
    FaturamentoGlobal[]
  >([])

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    carregandoFaturamentos,
    setCarregandoFaturamentos,
  ] = useState(false)

  const [
    carregandoPendencias,
    setCarregandoPendencias,
  ] = useState(true)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [
    erro,
    setErro,
  ] = useState<
    string | null
  >(null)

  const [
    sucesso,
    setSucesso,
  ] = useState<
    string | null
  >(null)

  const [
    vendaId,
    setVendaId,
  ] = useState("")

  const [
    numeroNF,
    setNumeroNF,
  ] = useState("")

  const [
    dataFaturamento,
    setDataFaturamento,
  ] = useState(
    dataHojeInput()
  )

  const [
    valorFaturado,
    setValorFaturado,
  ] = useState("")

  const [
    valorCorte,
    setValorCorte,
  ] = useState("")

  const [
    motivoCorte,
    setMotivoCorte,
  ] = useState("")

  const [
    observacoes,
    setObservacoes,
  ] = useState("")

  async function carregarVendas() {
    try {
      setCarregando(true)
      setErro(null)

      const response =
        await fetch(
          "/api/vendas",
          {
            cache:
              "no-store",
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (!response.ok) {
        setErro(
          data?.message ||
            "Não foi possível carregar as Vendas."
        )

        return
      }

      setVendas(
        Array.isArray(data)
          ? data
          : []
      )
    } catch {
      setErro(
        "Erro de comunicação ao carregar Vendas."
      )
    } finally {
      setCarregando(false)
    }
  }

  async function carregarFaturamentosGerais() {
    try {
      setCarregandoPendencias(
        true
      )

      const response =
        await fetch(
          "/api/faturamentos",
          {
            cache:
              "no-store",
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (!response.ok) {
        setFaturamentosGerais(
          []
        )

        setErro(
          data?.message ||
            "Não foi possível carregar a situação geral dos faturamentos."
        )

        return
      }

      setFaturamentosGerais(
        Array.isArray(data)
          ? data
          : []
      )
    } catch {
      setFaturamentosGerais(
        []
      )

      setErro(
        "Erro de comunicação ao carregar a situação geral dos faturamentos."
      )
    } finally {
      setCarregandoPendencias(
        false
      )
    }
  }

  async function carregarFaturamentos(
    idVenda: string
  ) {
    if (!idVenda) {
      setFaturamentos([])
      return
    }

    try {
      setCarregandoFaturamentos(
        true
      )

      const response =
        await fetch(
          `/api/faturamentos?vendaId=${encodeURIComponent(
            idVenda
          )}`,
          {
            cache:
              "no-store",
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (!response.ok) {
        setFaturamentos([])

        setErro(
          data?.message ||
            "Não foi possível carregar os faturamentos da Venda."
        )

        return
      }

      setFaturamentos(
        Array.isArray(data)
          ? data
          : []
      )
    } catch {
      setFaturamentos([])

      setErro(
        "Erro de comunicação ao carregar os faturamentos da Venda."
      )
    } finally {
      setCarregandoFaturamentos(
        false
      )
    }
  }

  async function carregarTudo() {
    setErro(null)

    await Promise.all([
      carregarVendas(),
      carregarFaturamentosGerais(),
    ])

    if (vendaId) {
      await carregarFaturamentos(
        vendaId
      )
    }
  }

  useEffect(() => {
    Promise.all([
      carregarVendas(),
      carregarFaturamentosGerais(),
    ])
  }, [])

  useEffect(() => {
    setErro(null)
    setSucesso(null)

    if (!vendaId) {
      setFaturamentos([])
      return
    }

    carregarFaturamentos(
      vendaId
    )
  }, [vendaId])

  const vendasElegiveis =
    useMemo(
      () =>
        vendas.filter(
          (venda) =>
            [
              "Confirmado",
              "Parcialmente faturado",
            ].includes(
              venda.status
            )
        ),
      [vendas]
    )

  const resumoFaturamentosPorVenda =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          {
            totalFaturado: number
            totalCortado: number
            quantidadeNFs: number
          }
        >()

      faturamentosGerais.forEach(
        (
          faturamento
        ) => {
          const idVenda =
            faturamento.venda?.id

          if (!idVenda) {
            return
          }

          const atual =
            mapa.get(
              idVenda
            ) || {
              totalFaturado: 0,
              totalCortado: 0,
              quantidadeNFs: 0,
            }

          atual.totalFaturado +=
            Number(
              faturamento.valorFaturado ||
                0
            )

          atual.totalCortado +=
            Number(
              faturamento.valorCorte ||
                0
            )

          atual.quantidadeNFs +=
            1

          mapa.set(
            idVenda,
            atual
          )
        }
      )

      return mapa
    }, [
      faturamentosGerais,
    ])

  const pendenciasFaturamento =
    useMemo<
      PendenciaFaturamento[]
    >(() => {
      const hoje =
        dataHojeInput()

      return vendas
        .filter(
          (
            venda
          ) =>
            [
              "Confirmado",
              "Parcialmente faturado",
            ].includes(
              venda.status
            )
        )
        .map(
          (
            venda
          ) => {
            const resumo =
              resumoFaturamentosPorVenda.get(
                venda.id
              ) || {
                totalFaturado: 0,
                totalCortado: 0,
                quantidadeNFs: 0,
              }

            const valorVenda =
              Number(
                venda.valorTotal ||
                  0
              )

            const saldo =
              Math.max(
                valorVenda -
                  resumo.totalFaturado -
                  resumo.totalCortado,
                0
              )

            const previsao =
              dataParaComparacao(
                venda.previsaoFaturamento
              )

            let situacao:
              SituacaoFaturamento

            let ordem =
              5

            if (
              venda.status ===
                "Parcialmente faturado" &&
              saldo > 0
            ) {
              situacao =
                "Parcialmente faturado"

              ordem = 1
            } else if (
              !previsao
            ) {
              situacao =
                "Sem previsão"

              ordem = 2
            } else if (
              previsao <
              hoje
            ) {
              situacao =
                "Previsão vencida"

              ordem = 0
            } else if (
              previsao ===
              hoje
            ) {
              situacao =
                "Previsto para hoje"

              ordem = 1
            } else {
              situacao =
                "Aguardando faturamento"

              ordem = 3
            }

            return {
              venda,
              totalFaturado:
                resumo.totalFaturado,
              totalCortado:
                resumo.totalCortado,
              saldo,
              quantidadeNFs:
                resumo.quantidadeNFs,
              situacao,
              ordem,
            }
          }
        )
        .filter(
          (
            item
          ) =>
            item.saldo >
            0
        )
        .sort(
          (
            a,
            b
          ) => {
            if (
              a.ordem !==
              b.ordem
            ) {
              return (
                a.ordem -
                b.ordem
              )
            }

            const previsaoA =
              dataParaComparacao(
                a.venda.previsaoFaturamento
              ) || "9999-12-31"

            const previsaoB =
              dataParaComparacao(
                b.venda.previsaoFaturamento
              ) || "9999-12-31"

            if (
              previsaoA !==
              previsaoB
            ) {
              return previsaoA.localeCompare(
                previsaoB
              )
            }

            return (
              b.venda.numeroSequencial -
              a.venda.numeroSequencial
            )
          }
        )
    }, [
      vendas,
      resumoFaturamentosPorVenda,
    ])

  const quantidadeVencidas =
    useMemo(
      () =>
        pendenciasFaturamento.filter(
          (
            item
          ) =>
            item.situacao ===
            "Previsão vencida"
        ).length,
      [
        pendenciasFaturamento,
      ]
    )

  const quantidadeHoje =
    useMemo(
      () =>
        pendenciasFaturamento.filter(
          (
            item
          ) =>
            item.situacao ===
            "Previsto para hoje"
        ).length,
      [
        pendenciasFaturamento,
      ]
    )

  const quantidadeSemPrevisao =
    useMemo(
      () =>
        pendenciasFaturamento.filter(
          (
            item
          ) =>
            item.situacao ===
            "Sem previsão"
        ).length,
      [
        pendenciasFaturamento,
      ]
    )

  const quantidadeParciais =
    useMemo(
      () =>
        pendenciasFaturamento.filter(
          (
            item
          ) =>
            item.situacao ===
            "Parcialmente faturado"
        ).length,
      [
        pendenciasFaturamento,
      ]
    )

  const saldoTotalPendente =
    useMemo(
      () =>
        pendenciasFaturamento.reduce(
          (
            total,
            item
          ) =>
            total +
            item.saldo,
          0
        ),
      [
        pendenciasFaturamento,
      ]
    )

  const vendaSelecionada =
    useMemo(
      () =>
        vendas.find(
          (venda) =>
            venda.id ===
            vendaId
        ) || null,
      [
        vendaId,
        vendas,
      ]
    )

  const totalFaturado =
    useMemo(
      () =>
        faturamentos.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.valorFaturado ||
                0
            ),
          0
        ),
      [faturamentos]
    )

  const totalCortado =
    useMemo(
      () =>
        faturamentos.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.valorCorte ||
                0
            ),
          0
        ),
      [faturamentos]
    )

  const saldoAtual =
    useMemo(() => {
      if (
        !vendaSelecionada
      ) {
        return 0
      }

      return Math.max(
        Number(
          vendaSelecionada
            .valorTotal || 0
        ) -
          totalFaturado -
          totalCortado,
        0
      )
    }, [
      vendaSelecionada,
      totalFaturado,
      totalCortado,
    ])

  const previsaoTitulos =
    useMemo(() => {
      if (
        !vendaSelecionada ||
        !dataFaturamento ||
        !valorFaturado.trim()
      ) {
        return null
      }

      const condicao =
        interpretarCondicaoPagamento(
          vendaSelecionada.condicaoPagamento
        )

      if (!condicao) {
        return null
      }

      const valor =
        Number(
          valorFaturado.replace(
            ",",
            "."
          )
        )

      if (
        !Number.isFinite(
          valor
        ) ||
        valor <= 0
      ) {
        return null
      }

      const dataBase =
        new Date(
          `${dataFaturamento}T12:00:00`
        )

      if (
        Number.isNaN(
          dataBase.getTime()
        )
      ) {
        return null
      }

      const valores =
        dividirValorEmParcelas(
          valor,
          condicao.prazos.length
        )

      return {
        condicao:
          condicao.normalizada,

        parcelas:
          condicao.prazos.map(
            (
              prazo,
              indice
            ) => ({
              numero:
                indice + 1,

              total:
                condicao.prazos.length,

              prazo,

              vencimento:
                adicionarDias(
                  dataBase,
                  prazo
                ),

              valor:
                valores[indice],
            })
          ),
      }
    }, [
      vendaSelecionada,
      dataFaturamento,
      valorFaturado,
    ])

  function selecionarVendaPendente(
    idVenda: string
  ) {
    setVendaId(
      idVenda
    )

    setErro(null)
    setSucesso(null)

    window.setTimeout(
      () => {
        document
          .getElementById(
            "registro-faturamento"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          })
      },
      50
    )
  }

  function limparFormulario() {
    setNumeroNF("")
    setValorFaturado("")
    setValorCorte("")
    setMotivoCorte("")
    setObservacoes("")

    setDataFaturamento(
      dataHojeInput()
    )
  }

  async function registrarFaturamento(
    event:
      React.FormEvent
  ) {
    event.preventDefault()

    setErro(null)
    setSucesso(null)

    if (!vendaId) {
      setErro(
        "Selecione uma Venda."
      )
      return
    }

    if (
      !numeroNF.trim()
    ) {
      setErro(
        "Informe o número da NF."
      )
      return
    }

    if (!dataFaturamento) {
      setErro(
        "Informe a data do faturamento."
      )
      return
    }

    const valor =
      Number(
        valorFaturado.replace(
          ",",
          "."
        )
      )

    if (
      !Number.isFinite(
        valor
      ) ||
      valor <= 0
    ) {
      setErro(
        "Informe um valor faturado maior que zero."
      )
      return
    }

    const corte =
      valorCorte.trim()
        ? Number(
            valorCorte.replace(
              ",",
              "."
            )
          )
        : null

    if (
      corte !== null &&
      (
        !Number.isFinite(
          corte
        ) ||
        corte < 0
      )
    ) {
      setErro(
        "Informe um valor de corte válido."
      )
      return
    }

    if (
      corte !== null &&
      corte > 0 &&
      !motivoCorte.trim()
    ) {
      setErro(
        "Informe o motivo do corte."
      )
      return
    }

    try {
      setSalvando(true)

      const response =
        await fetch(
          "/api/faturamentos",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                vendaId,

                numeroNF:
                  numeroNF.trim(),

                dataFaturamento:
                  new Date(
                    `${dataFaturamento}T12:00:00`
                  ).toISOString(),

                valorFaturado:
                  valor,

                valorCorte:
                  corte,

                motivoCorte:
                  motivoCorte.trim() ||
                  null,

                observacoes:
                  observacoes.trim() ||
                  null,
              }),
          }
        )

      const data:
        RespostaCriacao =
        await response
          .json()
          .catch(
            () => ({})
          )

      if (!response.ok) {
        setErro(
          data.message ||
            "Não foi possível registrar o faturamento."
        )

        return
      }

      const resumo =
        data.resumo

      setSucesso(
        resumo
          ? `Faturamento registrado. Saldo atual: ${formatarMoeda(
              resumo.saldoDepois
            )}. Status da Venda: ${resumo.statusVenda}.`
          : "Faturamento registrado com sucesso."
      )

      limparFormulario()

      await Promise.all([
        carregarVendas(),
        carregarFaturamentosGerais(),
        carregarFaturamentos(
          vendaId
        ),
      ])
    } catch {
      setErro(
        "Erro de comunicação ao registrar o faturamento."
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <PageLayout title="Faturamentos">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>

          <Link href="/vendas">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vendas
            </Button>
          </Link>
        </div>

        <Button
          variant="outline"
          onClick={
            carregarTudo
          }
          disabled={
            carregando ||
            carregandoFaturamentos ||
            carregandoPendencias
          }
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {sucesso}
        </div>
      )}

      <Card className="mb-5 overflow-hidden border-slate-200">
        <CardHeader className="border-b bg-slate-50/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-slate-900">
                Faturamentos Pendentes
              </CardTitle>

              <CardDescription className="mt-1">
                Visão operacional das Vendas confirmadas que ainda possuem saldo a faturar. A lista é calculada a partir das Vendas e NFs já registradas.
              </CardDescription>
            </div>

            {!carregandoPendencias && (
              <div className="rounded-lg border bg-white px-4 py-2 text-right">
                <p className="text-xs text-muted-foreground">
                  Saldo total pendente
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {formatarMoeda(
                    saldoTotalPendente
                  )}
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {carregando ||
          carregandoPendencias ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando faturamentos pendentes...
            </div>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-muted-foreground">
                    Pendências
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      pendenciasFaturamento.length
                    }
                  </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-700">
                    Previsão vencida
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-700">
                    {
                      quantidadeVencidas
                    }
                  </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-xs text-orange-700">
                    Previsto para hoje
                  </p>

                  <p className="mt-1 text-2xl font-bold text-orange-700">
                    {
                      quantidadeHoje
                    }
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800">
                    Sem previsão
                  </p>

                  <p className="mt-1 text-2xl font-bold text-amber-800">
                    {
                      quantidadeSemPrevisao
                    }
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    Parciais
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {
                      quantidadeParciais
                    }
                  </p>
                </div>
              </div>

              {pendenciasFaturamento.length ===
              0 ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Não existem Vendas confirmadas com saldo pendente de faturamento neste momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendenciasFaturamento.map(
                    (
                      item
                    ) => {
                      const nomeCliente =
                        item.venda
                          .cliente
                          .nomeFantasia ||
                        item.venda
                          .cliente
                          .razaoSocial

                      return (
                        <div
                          key={
                            item.venda.id
                          }
                          className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                        >
                          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.8fr_0.8fr_auto] xl:items-center">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {formatarCodigoVenda(
                                    item.venda.numeroSequencial
                                  )}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${classeSituacao(
                                    item.situacao
                                  )}`}
                                >
                                  {
                                    item.situacao
                                  }
                                </span>
                              </div>

                              <p className="mt-2 font-medium text-slate-900">
                                {
                                  nomeCliente
                                }
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {
                                  item.venda
                                    .representada
                                    .nome
                                }
                              </p>
                            </div>

                            <div className="text-sm">
                              <p className="text-xs text-muted-foreground">
                                Previsão de faturamento
                              </p>

                              <p className="mt-1 font-medium">
                                {item.venda.previsaoFaturamento
                                  ? formatarData(
                                      item.venda.previsaoFaturamento
                                    )
                                  : "Não informada"}
                              </p>

                              <p className="mt-2 text-xs text-muted-foreground">
                                Venda em{" "}
                                {formatarData(
                                  item.venda.data
                                )}
                              </p>
                            </div>

                            <div className="text-sm">
                              <p className="text-xs text-muted-foreground">
                                Valor da Venda
                              </p>

                              <p className="mt-1 font-medium">
                                {formatarMoeda(
                                  item.venda.valorTotal
                                )}
                              </p>

                              <p className="mt-2 text-xs text-muted-foreground">
                                Faturado:{" "}
                                {formatarMoeda(
                                  item.totalFaturado
                                )}
                              </p>
                            </div>

                            <div className="text-sm">
                              <p className="text-xs text-muted-foreground">
                                Saldo a faturar
                              </p>

                              <p className="mt-1 font-bold text-slate-900">
                                {formatarMoeda(
                                  item.saldo
                                )}
                              </p>

                              <p className="mt-2 text-xs text-muted-foreground">
                                {item.quantidadeNFs ===
                                0
                                  ? "Nenhuma NF registrada"
                                  : `${item.quantidadeNFs} NF(s) registrada(s)`}
                              </p>

                              {item.totalCortado >
                                0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Cortes:{" "}
                                  {formatarMoeda(
                                    item.totalCortado
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 xl:justify-end">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  selecionarVendaPendente(
                                    item.venda.id
                                  )
                                }
                              >
                                Registrar NF
                              </Button>

                              <Link
                                href={`/vendas/${item.venda.id}`}
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                >
                                  Abrir Venda
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div
        id="registro-faturamento"
        className="scroll-mt-6"
      >
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                <FileText className="mr-2 inline h-5 w-5" />
                Registrar Faturamento
              </CardTitle>

              <CardDescription>
                Registre somente uma NF efetivamente emitida pela Representada. Uma Venda pode possuir uma ou várias NFs.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {carregando ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando Vendas...
                </div>
              ) : (
                <form
                  onSubmit={
                    registrarFaturamento
                  }
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label>
                      Venda *
                    </Label>

                    <Select
                      value={
                        vendaId
                      }
                      onValueChange={
                        setVendaId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a Venda confirmada" />
                      </SelectTrigger>

                      <SelectContent>
                        {vendasElegiveis.map(
                          (
                            venda
                          ) => (
                            <SelectItem
                              key={
                                venda.id
                              }
                              value={
                                venda.id
                              }
                            >
                              {formatarCodigoVenda(
                                venda.numeroSequencial
                              )}{" "}
                              —{" "}
                              {venda
                                .cliente
                                .nomeFantasia ||
                                venda
                                  .cliente
                                  .razaoSocial}{" "}
                              —{" "}
                              {
                                venda
                                  .representada
                                  .nome
                              }{" "}
                              —{" "}
                              {formatarMoeda(
                                venda.valorTotal
                              )}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    {vendasElegiveis.length ===
                      0 && (
                      <p className="text-sm text-muted-foreground">
                        Não há Vendas confirmadas disponíveis para faturamento.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="numeroNF">
                        Número da NF *
                      </Label>

                      <Input
                        id="numeroNF"
                        value={
                          numeroNF
                        }
                        onChange={(
                          event
                        ) =>
                          setNumeroNF(
                            event.target.value
                          )
                        }
                        placeholder="Ex.: 123456"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataFaturamento">
                        Data do faturamento *
                      </Label>

                      <Input
                        id="dataFaturamento"
                        type="date"
                        value={
                          dataFaturamento
                        }
                        onChange={(
                          event
                        ) =>
                          setDataFaturamento(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorFaturado">
                        Valor faturado *
                      </Label>

                      <Input
                        id="valorFaturado"
                        inputMode="decimal"
                        value={
                          valorFaturado
                        }
                        onChange={(
                          event
                        ) =>
                          setValorFaturado(
                            event.target.value
                          )
                        }
                        placeholder="0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorCorte">
                        Valor do corte
                      </Label>

                      <Input
                        id="valorCorte"
                        inputMode="decimal"
                        value={
                          valorCorte
                        }
                        onChange={(
                          event
                        ) =>
                          setValorCorte(
                            event.target.value
                          )
                        }
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivoCorte">
                      Motivo do corte
                    </Label>

                    <Input
                      id="motivoCorte"
                      value={
                        motivoCorte
                      }
                      onChange={(
                        event
                      ) =>
                        setMotivoCorte(
                          event.target.value
                        )
                      }
                      placeholder="Obrigatório quando houver corte"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">
                      Observações
                    </Label>

                    <Textarea
                      id="observacoes"
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
                      placeholder="Informações adicionais sobre a NF ou faturamento"
                    />
                  </div>

                  {vendaSelecionada && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <div className="mb-3">
                        <p className="font-semibold">
                          Previsão dos títulos internos
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Controle interno do escritório calculado pela data do faturamento e pela condição de pagamento registrada na Venda.
                        </p>
                      </div>

                      {!vendaSelecionada.condicaoPagamento ? (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          A Venda não possui condição de pagamento registrada. O faturamento será bloqueado até a correção da condição comercial.
                        </div>
                      ) : !interpretarCondicaoPagamento(
                          vendaSelecionada.condicaoPagamento
                        ) ? (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          Condição de pagamento inválida:{" "}
                          {vendaSelecionada.condicaoPagamento}. Use 0 para à vista ou prazos crescentes separados por barra ou hífen, como 21/28/35 ou 21-28-35.
                        </div>
                      ) : !previsaoTitulos ? (
                        <p className="text-sm text-muted-foreground">
                          Informe a data e o valor faturado para visualizar os vencimentos previstos.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              Condição:
                            </span>{" "}
                            {previsaoTitulos.condicao ===
                            "0"
                              ? "À vista (0)"
                              : previsaoTitulos.condicao}
                          </div>

                          {previsaoTitulos.parcelas.map(
                            (
                              parcela
                            ) => (
                              <div
                                key={
                                  parcela.numero
                                }
                                className="grid gap-2 rounded-md border bg-white p-3 text-sm md:grid-cols-[auto_1fr_auto]"
                              >
                                <div className="font-medium">
                                  Parcela{" "}
                                  {parcela.numero}/
                                  {parcela.total}
                                </div>

                                <div className="text-muted-foreground">
                                  Vencimento previsto:{" "}
                                  {parcela.vencimento.toLocaleDateString(
                                    "pt-BR"
                                  )}
                                  {parcela.prazo ===
                                  0
                                    ? " — à vista"
                                    : ` — ${parcela.prazo} dia(s)`}
                                </div>

                                <div className="font-medium">
                                  {formatarMoeda(
                                    parcela.valor
                                  )}
                                </div>
                              </div>
                            )
                          )}

                          <p className="pt-1 text-xs text-muted-foreground">
                            Prorrogações e pagamentos reais não substituirão esta previsão original; serão registrados separadamente nos Títulos.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      salvando ||
                      !vendaId ||
                      carregandoFaturamentos
                    }
                  >
                    {salvando ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}

                    Registrar Faturamento
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Resumo da Venda
                </CardTitle>

                <CardDescription>
                  O saldo considera os faturamentos e cortes já registrados no banco.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!vendaSelecionada ? (
                  <p className="text-sm text-muted-foreground">
                    Selecione uma Venda para visualizar o resumo.
                  </p>
                ) : carregandoFaturamentos ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculando saldo...
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">
                        Venda:
                      </span>{" "}
                      {formatarCodigoVenda(
                        vendaSelecionada.numeroSequencial
                      )}
                    </div>

                    <div>
                      <span className="font-medium">
                        Cliente:
                      </span>{" "}
                      {vendaSelecionada
                        .cliente
                        .nomeFantasia ||
                        vendaSelecionada
                          .cliente
                          .razaoSocial}
                    </div>

                    <div>
                      <span className="font-medium">
                        Representada:
                      </span>{" "}
                      {
                        vendaSelecionada
                          .representada
                          .nome
                      }
                    </div>

                    <div>
                      <span className="font-medium">
                        Data da Venda:
                      </span>{" "}
                      {formatarData(
                        vendaSelecionada.data
                      )}
                    </div>

                    <div>
                      <span className="font-medium">
                        Previsão de faturamento:
                      </span>{" "}
                      {vendaSelecionada.previsaoFaturamento
                        ? formatarData(
                            vendaSelecionada.previsaoFaturamento
                          )
                        : "Não informada"}
                    </div>

                    <div>
                      <span className="font-medium">
                        Valor da Venda:
                      </span>{" "}
                      {formatarMoeda(
                        vendaSelecionada.valorTotal
                      )}
                    </div>

                    <div>
                      <span className="font-medium">
                        Condição de pagamento:
                      </span>{" "}
                      {vendaSelecionada.condicaoPagamento ||
                        "Não informada"}
                    </div>

                    <div>
                      <span className="font-medium">
                        Já faturado:
                      </span>{" "}
                      {formatarMoeda(
                        totalFaturado
                      )}
                    </div>

                    <div>
                      <span className="font-medium">
                        Cortes:
                      </span>{" "}
                      {formatarMoeda(
                        totalCortado
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <span className="font-semibold">
                        Saldo atual:
                      </span>{" "}
                      <span className="font-semibold">
                        {formatarMoeda(
                          saldoAtual
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium">
                        Status:
                      </span>{" "}
                      {
                        vendaSelecionada.status
                      }
                    </div>

                    <div>
                      <span className="font-medium">
                        NFs registradas:
                      </span>{" "}
                      {
                        faturamentos.length
                      }
                    </div>

                    <Link
                      href={`/vendas/${vendaSelecionada.id}`}
                      className="inline-block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Abrir Venda
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {vendaSelecionada &&
              !carregandoFaturamentos &&
              faturamentos.length >
                0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Histórico de NFs
                    </CardTitle>

                    <CardDescription>
                      Faturamentos já registrados para esta Venda.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {faturamentos.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.id
                            }
                            className="rounded-md border p-3 text-sm"
                          >
                            <div className="font-medium">
                              NF{" "}
                              {item.numeroNF ||
                                "—"}
                            </div>

                            <div className="mt-1 text-muted-foreground">
                              {formatarData(
                                item.dataFaturamento
                              )}{" "}
                              •{" "}
                              {formatarMoeda(
                                item.valorFaturado
                              )}
                            </div>

                            {Number(
                              item.valorCorte ||
                                0
                            ) > 0 && (
                              <div className="mt-1 text-muted-foreground">
                                Corte:{" "}
                                {formatarMoeda(
                                  item.valorCorte
                                )}
                                {item.motivoCorte
                                  ? ` — ${item.motivoCorte}`
                                  : ""}
                              </div>
                            )}

                            <div className="mt-1 text-muted-foreground">
                              Saldo após a NF:{" "}
                              {formatarMoeda(
                                item.saldoPedido
                              )}
                            </div>

                            {Array.isArray(
                              item.titulos
                            ) &&
                              item.titulos.length >
                                0 && (
                              <div className="mt-3 border-t pt-3">
                                <div className="mb-2 font-medium">
                                  Títulos internos
                                </div>

                                <div className="space-y-2">
                                  {item.titulos.map(
                                    (
                                      titulo
                                    ) => (
                                      <div
                                        key={
                                          titulo.id
                                        }
                                        className="rounded-md bg-slate-50 p-2"
                                      >
                                        <div className="font-medium">
                                          {formatarCodigoTitulo(
                                            titulo.numeroSequencial
                                          )}{" "}
                                          • Parcela{" "}
                                          {titulo.numeroParcela ||
                                            "—"}{" "}
                                          •{" "}
                                          {formatarMoeda(
                                            titulo.valor
                                          )}
                                        </div>

                                        <div className="mt-1 text-muted-foreground">
                                          Previsto:{" "}
                                          {formatarData(
                                            titulo.vencimento
                                          )}
                                          {" • "}
                                          Prorrogado:{" "}
                                          {formatarData(
                                            titulo.prorrogadoPara
                                          )}
                                          {" • "}
                                          Pago em:{" "}
                                          {formatarData(
                                            titulo.pagoEm
                                          )}
                                        </div>

                                        <div className="mt-1 text-muted-foreground">
                                          Status:{" "}
                                          {titulo.status}
                                          {" • "}
                                          Título externo:{" "}
                                          {titulo.numeroTituloExterno ||
                                            "Não informado"}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}