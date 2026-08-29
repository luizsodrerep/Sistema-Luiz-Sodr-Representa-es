"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  WalletCards,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial:
    | string
    | null
  nomeFantasia:
    | string
    | null
}

type Representada = {
  id: string
  nome: string

  regraReconhecimentoComissao?:
    | string
    | null

  fechamentoComissao?:
    | string
    | null

  pagamentoComissao?:
    | string
    | null

  exigeNFComissao?:
    | boolean
    | null
}

type Faturamento = {
  id: string
  numeroSequencial: number
  numeroNF:
    | string
    | null
  dataFaturamento: string
  valorFaturado: number
  status: string
}

type MovimentoVendaResumo = {
  id: string
  numeroSequencial: number
  tipo: string
  data: string
  valor: number
  status: string
}

type Previsao = {
  id: string
  numeroSequencial: number
  data: string
  status: string
  valorVenda: number
  baseCalculo:
    | number
    | null
  percentual:
    | number
    | null
  valorPrevisto: number
  regraReconhecimento:
    | string
    | null
  bonificacaoValor: number
  cliente: Cliente
  representada: Representada
  faturamentos: Faturamento[]
  totalFaturado: number
  quantidadeFaturamentos: number
  movimentosExistentes:
    MovimentoVendaResumo[]
  quantidadeMovimentos: number
  possuiMovimento: boolean
}

type Parcela = {
  id: string
  comissaoMovimentoId: string
  numeroParcela: number
  vencimento: string
  valor: number
  status: string
  recebidoEm:
    | string
    | null
  observacoes:
    | string
    | null
}

type VendaMovimento = {
  id: string
  numeroSequencial: number
  data: string
  status: string
  valorTotal:
    | number
    | null
  percentualComissaoAplicado:
    | number
    | null
  regraReconhecimentoComissao:
    | string
    | null
  baseCalculoComissao:
    | number
    | null
  valorComissaoPrevista:
    | number
    | null
  cliente: Cliente
  representada: {
    id: string
    nome: string
  }
}

type TituloVenda = {
  id: string
  numeroSequencial: number
  numeroParcela:
    | number
    | null
  numeroTituloExterno:
    | string
    | null
  vencimento: string
  prorrogadoPara:
    | string
    | null
  valor: number
  status: string
  pagoEm:
    | string
    | null
}

type TituloVendaBaixa = {
  id: string
  data: string
  valor: number
  origemInformacao:
    | string
    | null
  referencia:
    | string
    | null
}

type NFComissao = {
  id: string
  numeroSequencial: number
  numero:
    | string
    | null
  dataEmissao: string
  valorBruto: number
  valorLiquido:
    | number
    | null
  vencimento:
    | string
    | null
  pagoEm:
    | string
    | null
  status: string
  representada: {
    id: string
    nome: string
  }
  empresaEscritorio: {
    id: string
    razaoSocial: string
    nomeFantasia:
      | string
      | null
  }
}

type MovimentoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  data: string
  valor: number
  status: string
}

type Movimento = {
  id: string
  numeroSequencial: number
  tipo: string
  data: string
  competencia:
    | string
    | null
  baseCalculo:
    | number
    | null
  valor: number
  percentual:
    | number
    | null
  status: string
  descricao:
    | string
    | null
  venda:
    | VendaMovimento
    | null
  faturamento:
    | Faturamento
    | null
  tituloVenda:
    | TituloVenda
    | null
  tituloVendaBaixa:
    | TituloVendaBaixa
    | null
  nfComissao:
    | NFComissao
    | null
  movimentoOrigem:
    | MovimentoOrigem
    | null
  parcelas: Parcela[]
  quantidadeParcelas: number
  valorParcelado: number
  quantidadeParcelasPendentes: number
  valorParcelasPendentes: number
}

type ResumoTipo = {
  quantidade: number
  valor: number
}

type Resumo = {
  vendasComComissaoPrevista: number
  valorComissaoPrevistaVendas: number
  movimentos: number
  valorTotalMovimentos: number
  previstas: ResumoTipo
  devidas: ResumoTipo
  recebidas: ResumoTipo
  estornadas: ResumoTipo
  recuperadas: ResumoTipo
  ajustes: ResumoTipo
  parcelasPendentes: ResumoTipo
}

type RespostaApi = {
  referencia: {
    agora: string
  }
  resumo: Resumo
  previsoes: Previsao[]
  movimentos: Movimento[]
}

type Aba =
  | "previsoes"
  | "movimentos"

function formatarMoeda(
  valor: number
) {
  return new Intl
    .NumberFormat(
      "pt-BR",
      {
        style:
          "currency",
        currency:
          "BRL",
      }
    )
    .format(
      Number(
        valor || 0
      )
    )
}

function formatarData(
  valor:
    | string
    | null
    | undefined
) {
  if (
    !valor
  ) {
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

  return data
    .toLocaleDateString(
      "pt-BR",
      {
        timeZone:
          "UTC",
      }
    )
}

function codigo(
  prefixo: string,
  numero:
    | number
    | null
    | undefined
) {
  if (
    !numero
  ) {
    return `${prefixo}-—`
  }

  return `${prefixo}-${String(
    numero
  ).padStart(
    6,
    "0"
  )}`
}

function nomeCliente(
  cliente:
    | Cliente
    | null
    | undefined
) {
  if (
    !cliente
  ) {
    return "Cliente não informado"
  }

  return (
    cliente.nomeFantasia ||
    cliente.razaoSocial ||
    "Cliente não informado"
  )
}

function normalizar(
  valor:
    | string
    | null
    | undefined
) {
  return (
    valor ||
    ""
  )
    .trim()
    .toLowerCase()
}

function classeTipo(
  tipo: string
) {
  const valor =
    normalizar(
      tipo
    )

  if (
    valor ===
    "recebida"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (
    valor ===
    "devida"
  ) {
    return "border-orange-200 bg-orange-50 text-orange-700"
  }

  if (
    valor ===
    "estornada"
  ) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (
    valor ===
    "recuperada"
  ) {
    return "border-violet-200 bg-violet-50 text-violet-700"
  }

  if (
    valor ===
    "ajuste"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-700"
  }

  return "border-blue-200 bg-blue-50 text-blue-700"
}

function CardResumo({
  titulo,
  quantidade,
  valor,
  destaque,
  icone,
}: {
  titulo: string
  quantidade:
    | number
    | string
  valor?: number
  destaque?: boolean
  icone: ReactNode
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm transition",
        destaque
          ? "border-orange-200 bg-orange-50/70"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md",
      ].join(
        " "
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {quantidade}
          </p>

          {valor !==
            undefined && (
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {formatarMoeda(
                valor
              )}
            </p>
          )}
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            destaque
              ? "bg-orange-100 text-orange-600"
              : "bg-blue-50 text-blue-700",
          ].join(
            " "
          )}
        >
          {icone}
        </div>
      </div>
    </div>
  )
}

export default function ComissoesPage() {
  const [
    dados,
    setDados,
  ] =
    useState<
      RespostaApi
      | null
    >(null)

  const [
    carregando,
    setCarregando,
  ] =
    useState(
      true
    )

  const [
    erro,
    setErro,
  ] =
    useState<
      string
      | null
    >(null)

  const [
    busca,
    setBusca,
  ] =
    useState(
      ""
    )

  const [
    aba,
    setAba,
  ] =
    useState<Aba>(
      "previsoes"
    )

  const carregar =
    useCallback(
      async () => {
        try {
          setCarregando(
            true
          )

          setErro(
            null
          )

          const resposta =
            await fetch(
              "/api/comissoes",
              {
                cache:
                  "no-store",
              }
            )

          const corpo =
            await resposta
              .json()

          if (
            !resposta.ok
          ) {
            throw new Error(
              corpo.message ||
                "Não foi possível carregar as comissões."
            )
          }

          setDados(
            corpo
          )
        } catch (
          error
        ) {
          setErro(
            error instanceof
              Error
              ? error.message
              : "Não foi possível carregar as comissões."
          )
        } finally {
          setCarregando(
            false
          )
        }
      },
      []
    )

  useEffect(
    () => {
      carregar()
    },
    [
      carregar,
    ]
  )

  const previsoesFiltradas =
    useMemo(
      () => {
        const termo =
          normalizar(
            busca
          )

        return (
          dados?.previsoes ||
          []
        ).filter(
          (
            previsao
          ) => {
            if (
              !termo
            ) {
              return true
            }

            const texto =
              [
                codigo(
                  "VEN",
                  previsao.numeroSequencial
                ),
                nomeCliente(
                  previsao.cliente
                ),
                previsao
                  .representada
                  .nome,
                previsao.status,
                previsao
                  .regraReconhecimento ||
                  "",
                previsao
                  .faturamentos
                  .map(
                    (
                      faturamento
                    ) =>
                      [
                        codigo(
                          "FAT",
                          faturamento
                            .numeroSequencial
                        ),
                        faturamento
                          .numeroNF ||
                          "",
                      ].join(
                        " "
                      )
                  )
                  .join(
                    " "
                  ),
              ]
                .join(
                  " "
                )
                .toLowerCase()

            return texto
              .includes(
                termo
              )
          }
        )
      },
      [
        dados,
        busca,
      ]
    )

  const movimentosFiltrados =
    useMemo(
      () => {
        const termo =
          normalizar(
            busca
          )

        return (
          dados?.movimentos ||
          []
        ).filter(
          (
            movimento
          ) => {
            if (
              !termo
            ) {
              return true
            }

            const texto =
              [
                codigo(
                  "COM",
                  movimento.numeroSequencial
                ),
                movimento.tipo,
                movimento.status,
                movimento
                  .competencia ||
                  "",
                movimento
                  .descricao ||
                  "",
                movimento.venda
                  ? codigo(
                      "VEN",
                      movimento
                        .venda
                        .numeroSequencial
                    )
                  : "",
                movimento.venda
                  ? nomeCliente(
                      movimento
                        .venda
                        .cliente
                    )
                  : "",
                movimento.venda
                  ? movimento
                      .venda
                      .representada
                      .nome
                  : "",
                movimento
                  .faturamento
                  ?.numeroNF ||
                  "",
                movimento
                  .nfComissao
                  ?.numero ||
                  "",
              ]
                .join(
                  " "
                )
                .toLowerCase()

            return texto
              .includes(
                termo
              )
          }
        )
      },
      [
        dados,
        busca,
      ]
    )

  const resumo =
    dados?.resumo

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              <BadgeDollarSign className="h-4 w-4" />

              Financeiro comercial
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Comissões
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe a comissão prevista nas vendas e os movimentos
              financeiros de comissão já registrados pelo escritório.
            </p>
          </div>

          <button
            type="button"
            onClick={
              carregar
            }
            disabled={
              carregando
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={[
                "h-4 w-4",
                carregando
                  ? "animate-spin"
                  : "",
              ].join(
                " "
              )}
            />

            Atualizar
          </button>
        </div>

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Não foi possível carregar as comissões
              </p>

              <p className="mt-1">
                {erro}
              </p>
            </div>
          </div>
        )}

        {carregando &&
        !dados ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Carregando comissões...
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <CardResumo
                titulo="Prevista nas vendas"
                quantidade={
                  resumo
                    ? formatarMoeda(
                        resumo
                          .valorComissaoPrevistaVendas
                      )
                    : formatarMoeda(
                        0
                      )
                }
                icone={
                  <TrendingUp className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Comissões devidas"
                quantidade={
                  resumo?.devidas
                    .quantidade ||
                  0
                }
                valor={
                  resumo?.devidas
                    .valor ||
                  0
                }
                destaque={
                  Boolean(
                    resumo?.devidas
                      .quantidade
                  )
                }
                icone={
                  <Clock3 className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Comissões recebidas"
                quantidade={
                  resumo?.recebidas
                    .quantidade ||
                  0
                }
                valor={
                  resumo?.recebidas
                    .valor ||
                  0
                }
                icone={
                  <CheckCircle2 className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Parcelas pendentes"
                quantidade={
                  resumo
                    ?.parcelasPendentes
                    .quantidade ||
                  0
                }
                valor={
                  resumo
                    ?.parcelasPendentes
                    .valor ||
                  0
                }
                destaque={
                  Boolean(
                    resumo
                      ?.parcelasPendentes
                      .quantidade
                  )
                }
                icone={
                  <WalletCards className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Movimentos"
                quantidade={
                  resumo?.movimentos ||
                  0
                }
                valor={
                  resumo
                    ?.valorTotalMovimentos ||
                  0
                }
                icone={
                  <BadgeDollarSign className="h-5 w-5" />
                }
              />
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Controle de comissões
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Visualização operacional sem geração automática
                      de movimentos.
                    </p>
                  </div>

                  <div className="relative min-w-0 xl:w-[420px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={
                        busca
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setBusca(
                            event
                              .target
                              .value
                          )
                      }
                      placeholder="Buscar venda, cliente, representada, NF ou comissão..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      () =>
                        setAba(
                          "previsoes"
                        )
                    }
                    className={[
                      "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      aba ===
                      "previsoes"
                        ? "bg-blue-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
                    ].join(
                      " "
                    )}
                  >
                    Previsão das vendas
                  </button>

                  <button
                    type="button"
                    onClick={
                      () =>
                        setAba(
                          "movimentos"
                        )
                    }
                    className={[
                      "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      aba ===
                      "movimentos"
                        ? "bg-blue-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
                    ].join(
                      " "
                    )}
                  >
                    Movimentos de comissão
                  </button>
                </div>
              </div>

              {aba ===
              "previsoes" ? (
                previsoesFiltradas.length ===
                0 ? (
                  <div className="px-6 py-16 text-center">
                    <TrendingUp className="mx-auto h-10 w-10 text-slate-300" />

                    <h3 className="mt-4 text-base font-semibold text-slate-800">
                      Nenhuma previsão de comissão encontrada
                    </h3>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      As previsões aparecerão aqui quando houver vendas
                      válidas com valor de comissão prevista registrado.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {previsoesFiltradas.map(
                      (
                        previsao
                      ) => (
                        <article
                          key={
                            previsao.id
                          }
                          className="p-5 transition hover:bg-blue-50/30 lg:p-6"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/vendas/${previsao.id}`}
                                  className="text-sm font-bold text-blue-800 transition hover:text-orange-600"
                                >
                                  {codigo(
                                    "VEN",
                                    previsao.numeroSequencial
                                  )}
                                </Link>

                                {previsao.possuiMovimento && (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                    Possui movimento
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-3 text-lg font-bold text-slate-950">
                                {nomeCliente(
                                  previsao.cliente
                                )}
                              </h3>

                              <p className="mt-1 text-sm font-medium text-slate-600">
                                {
                                  previsao
                                    .representada
                                    .nome
                                }
                              </p>

                              <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Venda
                                  </p>

                                  <p className="mt-1 font-semibold text-slate-800">
                                    {formatarMoeda(
                                      previsao.valorVenda
                                    )}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Base de cálculo
                                  </p>

                                  <p className="mt-1 font-semibold text-slate-800">
                                    {previsao.baseCalculo !==
                                    null
                                      ? formatarMoeda(
                                          previsao.baseCalculo
                                        )
                                      : "Não informada"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Percentual
                                  </p>

                                  <p className="mt-1 font-semibold text-slate-800">
                                    {previsao.percentual !==
                                    null
                                      ? `${previsao.percentual}%`
                                      : "Não informado"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Comissão prevista
                                  </p>

                                  <p className="mt-1 font-bold text-orange-600">
                                    {formatarMoeda(
                                      previsao.valorPrevisto
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2 xl:w-[420px]">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Data da venda
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {formatarData(
                                    previsao.data
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Faturado
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {formatarMoeda(
                                    previsao.totalFaturado
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Faturamentos
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {
                                    previsao.quantidadeFaturamentos
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Movimentos
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {
                                    previsao.quantidadeMovimentos
                                  }
                                </p>
                              </div>

                              <div className="sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Regra de reconhecimento
                                </p>

                                <p className="mt-1 font-semibold text-slate-700">
                                  {previsao.regraReconhecimento ||
                                    "Não informada"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )
              ) : movimentosFiltrados.length ===
                0 ? (
                <div className="px-6 py-16 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 text-base font-semibold text-slate-800">
                    Nenhum movimento de comissão encontrado
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Nenhum movimento financeiro de comissão foi
                    registrado até o momento.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {movimentosFiltrados.map(
                    (
                      movimento
                    ) => (
                      <article
                        key={
                          movimento.id
                        }
                        className="p-5 transition hover:bg-blue-50/30 lg:p-6"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-blue-800">
                                {codigo(
                                  "COM",
                                  movimento.numeroSequencial
                                )}
                              </span>

                              <span
                                className={[
                                  "rounded-full border px-2.5 py-1 text-xs font-bold",
                                  classeTipo(
                                    movimento.tipo
                                  ),
                                ].join(
                                  " "
                                )}
                              >
                                {
                                  movimento.tipo
                                }
                              </span>

                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {
                                  movimento.status
                                }
                              </span>
                            </div>

                            <h3 className="mt-3 text-lg font-bold text-slate-950">
                              {movimento.venda
                                ? nomeCliente(
                                    movimento
                                      .venda
                                      .cliente
                                  )
                                : movimento
                                    .nfComissao
                                    ?.representada
                                    .nome ||
                                  "Movimento de comissão"}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              {movimento.venda
                                ? movimento
                                    .venda
                                    .representada
                                    .nome
                                : movimento
                                    .nfComissao
                                    ?.representada
                                    .nome ||
                                  "Representada não informada"}
                            </p>

                            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Data
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {formatarData(
                                    movimento.data
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Base
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {movimento.baseCalculo !==
                                  null
                                    ? formatarMoeda(
                                        movimento.baseCalculo
                                      )
                                    : "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Percentual
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {movimento.percentual !==
                                  null
                                    ? `${movimento.percentual}%`
                                    : "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Valor
                                </p>

                                <p className="mt-1 font-bold text-slate-950">
                                  {formatarMoeda(
                                    movimento.valor
                                  )}
                                </p>
                              </div>
                            </div>

                            {movimento.descricao && (
                              <p className="mt-4 text-sm leading-6 text-slate-600">
                                {
                                  movimento.descricao
                                }
                              </p>
                            )}
                          </div>

                          <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2 xl:w-[420px]">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Venda
                              </p>

                              {movimento.venda ? (
                                <Link
                                  href={`/vendas/${movimento.venda.id}`}
                                  className="mt-1 inline-block font-bold text-blue-700 hover:text-orange-600"
                                >
                                  {codigo(
                                    "VEN",
                                    movimento
                                      .venda
                                      .numeroSequencial
                                  )}
                                </Link>
                              ) : (
                                <p className="mt-1 font-semibold text-slate-500">
                                  —
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Faturamento
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {movimento.faturamento
                                  ? codigo(
                                      "FAT",
                                      movimento
                                        .faturamento
                                        .numeroSequencial
                                    )
                                  : "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Título
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {movimento.tituloVenda
                                  ? codigo(
                                      "TIT",
                                      movimento
                                        .tituloVenda
                                        .numeroSequencial
                                    )
                                  : "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                NF comissão
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {movimento.nfComissao
                                  ? codigo(
                                      "NFC",
                                      movimento
                                        .nfComissao
                                        .numeroSequencial
                                    )
                                  : "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Parcelas
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {
                                  movimento.quantidadeParcelas
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Pendente em parcelas
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {formatarMoeda(
                                  movimento.valorParcelasPendentes
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}