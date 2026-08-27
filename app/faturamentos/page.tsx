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

type Venda = {
  id: string
  numeroSequencial: number
  data: string
  valorTotal: number | null
  status: string
  condicaoPagamento: string | null
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

  if (
    !/^\d+(?:-\d+)*$/.test(
      normalizada
    )
  ) {
    return null
  }

  const prazos =
    normalizada
      .split("-")
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
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    carregandoFaturamentos,
    setCarregandoFaturamentos,
  ] = useState(false)

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
    await carregarVendas()

    if (vendaId) {
      await carregarFaturamentos(
        vendaId
      )
    }
  }

  useEffect(() => {
    carregarVendas()
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
            carregandoFaturamentos
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
                        Condição de pagamento inválida: {vendaSelecionada.condicaoPagamento}. Use 0 para à vista ou prazos crescentes separados por hífen, como 21-28-35.
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
    </PageLayout>
  )
}