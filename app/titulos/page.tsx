"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react"

type Baixa = {
  id: string
  data: string
  valor: number
  origemInformacao:
    | string
    | null
  referencia:
    | string
    | null
  observacoes:
    | string
    | null
}

type Cliente = {
  id: string
  nomeFantasia?:
    | string
    | null
  razaoSocial?:
    | string
    | null
  nome?:
    | string
    | null
}

type Representada = {
  id: string
  nomeFantasia?:
    | string
    | null
  razaoSocial?:
    | string
    | null
  nome?:
    | string
    | null
}

type Titulo = {
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
  vencimentoEfetivo: string
  valor: number
  totalBaixado: number
  saldo: number
  status: string
  situacao: string
  pagoEm:
    | string
    | null
  atrasoInformadoEm:
    | string
    | null
  observacoes:
    | string
    | null
  quantidadeBaixas: number
  baixas: Baixa[]

  faturamento: {
    id: string
    numeroSequencial: number
    numeroNF:
      | string
      | null
    dataFaturamento: string
    valorFaturado: number
  }

  venda: {
    id: string
    numeroSequencial: number
    data: string
    status: string
    cliente: Cliente
    representada: Representada
  }
}

type Resumo = {
  quantidade: number
  valorTotal: number
  totalBaixado: number
  saldoAberto: number
  vencidos: number
  valorVencido: number
  venceHoje: number
  valorVenceHoje: number
  aVencer: number
  prorrogados: number
  pagos: number
}

type RespostaApi = {
  referencia: {
    agora: string
    inicioHoje: string
    fimHoje: string
  }
  resumo: Resumo
  titulos: Titulo[]
}

type FiltroSituacao =
  | "Todos"
  | "Vencido"
  | "Vence hoje"
  | "A vencer"
  | "Prorrogado"
  | "Pago"

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

function nomeEntidade(
  entidade:
    | Cliente
    | Representada
    | null
    | undefined
) {
  if (
    !entidade
  ) {
    return "Não informado"
  }

  return (
    entidade.nomeFantasia ||
    entidade.razaoSocial ||
    entidade.nome ||
    "Não informado"
  )
}

function classesSituacao(
  situacao: string
) {
  if (
    situacao ===
    "Vencido"
  ) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (
    situacao ===
    "Vence hoje"
  ) {
    return "border-orange-200 bg-orange-50 text-orange-700"
  }

  if (
    situacao ===
    "Prorrogado"
  ) {
    return "border-violet-200 bg-violet-50 text-violet-700"
  }

  if (
    situacao ===
    "Pago"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
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
  icone:
    React.ReactNode
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm transition",
        destaque
          ? "border-orange-200 bg-orange-50/70"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {titulo}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {quantidade}
          </p>

          {valor !== undefined && (
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
          ].join(" ")}
        >
          {icone}
        </div>
      </div>
    </div>
  )
}

export default function TitulosPage() {
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
    useState(true)

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
    useState("")

  const [
    filtro,
    setFiltro,
  ] =
    useState<FiltroSituacao>(
      "Todos"
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
              "/api/titulos",
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
                "Não foi possível carregar os títulos."
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
              : "Não foi possível carregar os títulos."
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

  const titulosFiltrados =
    useMemo(
      () => {
        const termo =
          busca
            .trim()
            .toLowerCase()

        return (
          dados?.titulos ||
          []
        ).filter(
          (
            titulo
          ) => {
            if (
              filtro !==
                "Todos" &&
              titulo.situacao !==
                filtro
            ) {
              return false
            }

            if (
              !termo
            ) {
              return true
            }

            const texto =
              [
                codigo(
                  "TIT",
                  titulo.numeroSequencial
                ),
                codigo(
                  "FAT",
                  titulo
                    .faturamento
                    .numeroSequencial
                ),
                codigo(
                  "VEN",
                  titulo
                    .venda
                    .numeroSequencial
                ),
                titulo
                  .faturamento
                  .numeroNF ||
                  "",
                titulo
                  .numeroTituloExterno ||
                  "",
                nomeEntidade(
                  titulo
                    .venda
                    .cliente
                ),
                nomeEntidade(
                  titulo
                    .venda
                    .representada
                ),
                titulo.situacao,
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
        filtro,
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
              <WalletCards className="h-4 w-4" />

              Financeiro comercial
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Títulos e Vencimentos
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe os títulos gerados pelos faturamentos,
              vencimentos, saldos e situação de pagamento dos
              clientes às representadas.
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
              ].join(" ")}
            />

            Atualizar
          </button>
        </div>

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Não foi possível carregar os títulos
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
                Carregando títulos e vencimentos...
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <CardResumo
                titulo="Saldo em aberto"
                quantidade={
                  resumo
                    ? formatarMoeda(
                        resumo.saldoAberto
                      )
                    : formatarMoeda(
                        0
                      )
                }
                icone={
                  <WalletCards className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Vencidos"
                quantidade={
                  resumo?.vencidos ||
                  0
                }
                valor={
                  resumo?.valorVencido ||
                  0
                }
                destaque={
                  Boolean(
                    resumo?.vencidos
                  )
                }
                icone={
                  <AlertCircle className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Vencem hoje"
                quantidade={
                  resumo?.venceHoje ||
                  0
                }
                valor={
                  resumo?.valorVenceHoje ||
                  0
                }
                destaque={
                  Boolean(
                    resumo?.venceHoje
                  )
                }
                icone={
                  <Clock3 className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="A vencer"
                quantidade={
                  resumo?.aVencer ||
                  0
                }
                icone={
                  <CalendarClock className="h-5 w-5" />
                }
              />

              <CardResumo
                titulo="Pagos"
                quantidade={
                  resumo?.pagos ||
                  0
                }
                icone={
                  <CheckCircle2 className="h-5 w-5" />
                }
              />
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Controle operacional
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        titulosFiltrados.length
                      }{" "}
                      título(s) exibido(s)
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative min-w-0 lg:w-[360px]">
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
                        placeholder="Buscar cliente, representada, NF, VEN, FAT ou TIT..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <select
                      value={
                        filtro
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setFiltro(
                            event
                              .target
                              .value as FiltroSituacao
                          )
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="Todos">
                        Todas as situações
                      </option>

                      <option value="Vencido">
                        Vencidos
                      </option>

                      <option value="Vence hoje">
                        Vencem hoje
                      </option>

                      <option value="A vencer">
                        A vencer
                      </option>

                      <option value="Prorrogado">
                        Prorrogados
                      </option>

                      <option value="Pago">
                        Pagos
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {titulosFiltrados.length ===
              0 ? (
                <div className="px-6 py-16 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 text-base font-semibold text-slate-800">
                    Nenhum título encontrado
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Os títulos aparecem aqui depois que um faturamento
                    é registrado e suas parcelas são geradas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {titulosFiltrados.map(
                    (
                      titulo
                    ) => (
                      <article
                        key={
                          titulo.id
                        }
                        className="p-5 transition hover:bg-blue-50/30 lg:p-6"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-blue-800">
                                {codigo(
                                  "TIT",
                                  titulo.numeroSequencial
                                )}
                              </span>

                              <span
                                className={[
                                  "rounded-full border px-2.5 py-1 text-xs font-bold",
                                  classesSituacao(
                                    titulo.situacao
                                  ),
                                ].join(" ")}
                              >
                                {
                                  titulo.situacao
                                }
                              </span>

                              {titulo.numeroParcela && (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  Parcela{" "}
                                  {
                                    titulo.numeroParcela
                                  }
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 truncate text-lg font-bold text-slate-950">
                              {nomeEntidade(
                                titulo
                                  .venda
                                  .cliente
                              )}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              {nomeEntidade(
                                titulo
                                  .venda
                                  .representada
                              )}
                            </p>

                            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Vencimento
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {formatarData(
                                    titulo.vencimentoEfetivo
                                  )}
                                </p>

                                {titulo.prorrogadoPara && (
                                  <p className="mt-1 text-xs text-violet-600">
                                    Original:{" "}
                                    {formatarData(
                                      titulo.vencimento
                                    )}
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Valor do título
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {formatarMoeda(
                                    titulo.valor
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Baixado
                                </p>

                                <p className="mt-1 font-semibold text-slate-800">
                                  {formatarMoeda(
                                    titulo.totalBaixado
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Saldo
                                </p>

                                <p className="mt-1 font-bold text-slate-950">
                                  {formatarMoeda(
                                    titulo.saldo
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2 xl:w-[390px]">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Venda
                              </p>

                              <Link
                                href={`/vendas/${titulo.venda.id}`}
                                className="mt-1 inline-block font-bold text-blue-700 hover:text-orange-600"
                              >
                                {codigo(
                                  "VEN",
                                  titulo
                                    .venda
                                    .numeroSequencial
                                )}
                              </Link>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Faturamento
                              </p>

                              <p className="mt-1 font-bold text-slate-700">
                                {codigo(
                                  "FAT",
                                  titulo
                                    .faturamento
                                    .numeroSequencial
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                NF
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {titulo
                                  .faturamento
                                  .numeroNF ||
                                  "Não informada"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Título externo
                              </p>

                              <p className="mt-1 font-semibold text-slate-700">
                                {titulo.numeroTituloExterno ||
                                  "Não informado"}
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