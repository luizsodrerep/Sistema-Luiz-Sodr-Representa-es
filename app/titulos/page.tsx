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
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
  X,
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

type AcaoTitulo =
  | {
      tipo: "prorrogar"
      titulo: Titulo
    }
  | {
      tipo: "baixa"
      titulo: Titulo
    }
  | null

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

function dataParaInput(
  valor:
    | string
    | null
    | undefined
) {
  if (
    !valor
  ) {
    return ""
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return ""
  }

  const ano =
    data.getUTCFullYear()

  const mes =
    String(
      data.getUTCMonth() +
        1
    ).padStart(
      2,
      "0"
    )

  const dia =
    String(
      data.getUTCDate()
    ).padStart(
      2,
      "0"
    )

  return `${ano}-${mes}-${dia}`
}

function hojeParaInput() {
  const agora =
    new Date()

  const ano =
    agora.getFullYear()

  const mes =
    String(
      agora.getMonth() +
        1
    ).padStart(
      2,
      "0"
    )

  const dia =
    String(
      agora.getDate()
    ).padStart(
      2,
      "0"
    )

  return `${ano}-${mes}-${dia}`
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

function converterMoedaDigitada(
  valor: string
) {
  const texto =
    valor
      .trim()
      .replace(
        /\s/g,
        ""
      )
      .replace(
        /R\$/gi,
        ""
      )

  if (
    !texto
  ) {
    return null
  }

  let normalizado =
    texto

  if (
    texto.includes(
      ","
    )
  ) {
    normalizado =
      texto
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        )
  }

  const numero =
    Number(
      normalizado
    )

  if (
    !Number.isFinite(
      numero
    )
  ) {
    return null
  }

  return Number(
    numero.toFixed(2)
  )
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

function ModalBase({
  titulo,
  subtitulo,
  children,
  onFechar,
}: {
  titulo: string
  subtitulo: string
  children: ReactNode
  onFechar: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {titulo}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {subtitulo}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onFechar
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
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
    sucesso,
    setSucesso,
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
    filtro,
    setFiltro,
  ] =
    useState<FiltroSituacao>(
      "Todos"
    )

  const [
    acao,
    setAcao,
  ] =
    useState<AcaoTitulo>(
      null
    )

  const [
    processando,
    setProcessando,
  ] =
    useState(
      false
    )

  const [
    novaData,
    setNovaData,
  ] =
    useState(
      ""
    )

  const [
    dataBaixa,
    setDataBaixa,
  ] =
    useState(
      hojeParaInput()
    )

  const [
    valorBaixa,
    setValorBaixa,
  ] =
    useState(
      ""
    )

  const [
    origemInformacao,
    setOrigemInformacao,
  ] =
    useState(
      ""
    )

  const [
    referenciaBaixa,
    setReferenciaBaixa,
  ] =
    useState(
      ""
    )

  const [
    observacoesBaixa,
    setObservacoesBaixa,
  ] =
    useState(
      ""
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

  const abrirProrrogacao =
    (
      titulo: Titulo
    ) => {
      setErro(
        null
      )

      setSucesso(
        null
      )

      setNovaData(
        ""
      )

      setAcao({
        tipo:
          "prorrogar",
        titulo,
      })
    }

  const abrirBaixa =
    (
      titulo: Titulo
    ) => {
      setErro(
        null
      )

      setSucesso(
        null
      )

      setDataBaixa(
        hojeParaInput()
      )

      setValorBaixa(
        titulo.saldo
          .toFixed(
            2
          )
          .replace(
            ".",
            ","
          )
      )

      setOrigemInformacao(
        ""
      )

      setReferenciaBaixa(
        ""
      )

      setObservacoesBaixa(
        ""
      )

      setAcao({
        tipo:
          "baixa",
        titulo,
      })
    }

  const fecharAcao =
    () => {
      if (
        processando
      ) {
        return
      }

      setAcao(
        null
      )
    }

  const confirmarProrrogacao =
    async () => {
      if (
        !acao ||
        acao.tipo !==
          "prorrogar"
      ) {
        return
      }

      if (
        !novaData
      ) {
        setErro(
          "Informe a nova data de vencimento."
        )
        return
      }

      const vencimentoAtual =
        dataParaInput(
          acao.titulo
            .vencimentoEfetivo
        )

      if (
        novaData <=
        vencimentoAtual
      ) {
        setErro(
          "A nova data deve ser posterior ao vencimento atual."
        )
        return
      }

      const confirmado =
        window.confirm(
          `Confirmar a prorrogação de ${codigo(
            "TIT",
            acao.titulo
              .numeroSequencial
          )} de ${formatarData(
            acao.titulo
              .vencimentoEfetivo
          )} para ${formatarData(
            `${novaData}T12:00:00.000Z`
          )}?`
        )

      if (
        !confirmado
      ) {
        return
      }

      try {
        setProcessando(
          true
        )

        setErro(
          null
        )

        setSucesso(
          null
        )

        const resposta =
          await fetch(
            `/api/titulos/${acao.titulo.id}/prorrogar`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  prorrogadoPara:
                    novaData,
                }),
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
              "Não foi possível prorrogar o vencimento."
          )
        }

        setAcao(
          null
        )

        setSucesso(
          corpo.message ||
            "Vencimento prorrogado com sucesso."
        )

        await carregar()
      } catch (
        error
      ) {
        setErro(
          error instanceof
            Error
            ? error.message
            : "Não foi possível prorrogar o vencimento."
        )
      } finally {
        setProcessando(
          false
        )
      }
    }

  const confirmarBaixa =
    async () => {
      if (
        !acao ||
        acao.tipo !==
          "baixa"
      ) {
        return
      }

      if (
        !dataBaixa
      ) {
        setErro(
          "Informe a data da baixa."
        )
        return
      }

      const valor =
        converterMoedaDigitada(
          valorBaixa
        )

      if (
        valor === null ||
        valor <= 0
      ) {
        setErro(
          "Informe um valor de baixa maior que zero."
        )
        return
      }

      if (
        valor >
        acao.titulo.saldo
      ) {
        setErro(
          `O valor da baixa não pode ultrapassar o saldo de ${formatarMoeda(
            acao.titulo
              .saldo
          )}.`
        )
        return
      }

      const baixaTotal =
        Math.abs(
          valor -
            acao.titulo
              .saldo
        ) <
        0.005

      const confirmado =
        window.confirm(
          baixaTotal
            ? `Confirmar a baixa total de ${formatarMoeda(
                valor
              )} em ${codigo(
                "TIT",
                acao.titulo
                  .numeroSequencial
              )}? O título ficará marcado como Pago.`
            : `Confirmar a baixa parcial de ${formatarMoeda(
                valor
              )} em ${codigo(
                "TIT",
                acao.titulo
                  .numeroSequencial
              )}? Permanecerá saldo em aberto.`
        )

      if (
        !confirmado
      ) {
        return
      }

      try {
        setProcessando(
          true
        )

        setErro(
          null
        )

        setSucesso(
          null
        )

        const resposta =
          await fetch(
            `/api/titulos/${acao.titulo.id}/baixas`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  data:
                    dataBaixa,

                  valor,

                  origemInformacao:
                    origemInformacao ||
                    null,

                  referencia:
                    referenciaBaixa ||
                    null,

                  observacoes:
                    observacoesBaixa ||
                    null,
                }),
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
              "Não foi possível registrar a baixa."
          )
        }

        setAcao(
          null
        )

        setSucesso(
          corpo.message ||
            "Baixa registrada com sucesso."
        )

        await carregar()
      } catch (
        error
      ) {
        setErro(
          error instanceof
            Error
            ? error.message
            : "Não foi possível registrar a baixa."
        )
      } finally {
        setProcessando(
          false
        )
      }
    }

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
              ].join(
                " "
              )}
            />

            Atualizar
          </button>
        </div>

        {sucesso && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Operação concluída
              </p>

              <p className="mt-1">
                {sucesso}
              </p>
            </div>
          </div>
        )}

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Atenção
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
                    Os títulos aparecem aqui depois que um
                    faturamento é registrado e suas parcelas são
                    geradas.
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
                                ].join(
                                  " "
                                )}
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

                            {titulo.saldo >
                              0 && (
                              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      abrirProrrogacao(
                                        titulo
                                      )
                                  }
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                >
                                  <CalendarClock className="h-4 w-4" />

                                  Prorrogar vencimento
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      abrirBaixa(
                                        titulo
                                      )
                                  }
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
                                >
                                  <CheckCircle2 className="h-4 w-4" />

                                  Registrar baixa
                                </button>
                              </div>
                            )}

                            {titulo.baixas.length >
                              0 && (
                              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                  Histórico de baixas
                                </p>

                                <div className="mt-3 grid gap-2">
                                  {titulo.baixas.map(
                                    (
                                      baixa
                                    ) => (
                                      <div
                                        key={
                                          baixa.id
                                        }
                                        className="flex flex-col gap-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div>
                                          <span className="font-semibold text-slate-700">
                                            {formatarData(
                                              baixa.data
                                            )}
                                          </span>

                                          {baixa.referencia && (
                                            <span className="ml-2 text-xs text-slate-500">
                                              {
                                                baixa.referencia
                                              }
                                            </span>
                                          )}
                                        </div>

                                        <span className="font-bold text-emerald-700">
                                          {formatarMoeda(
                                            baixa.valor
                                          )}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
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

      {acao?.tipo ===
        "prorrogar" && (
        <ModalBase
          titulo="Prorrogar vencimento"
          subtitulo={`${codigo(
            "TIT",
            acao.titulo
              .numeroSequencial
          )} • ${nomeEntidade(
            acao.titulo
              .venda
              .cliente
          )}`}
          onFechar={
            fecharAcao
          }
        >
          <div className="p-6">
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Vencimento atual
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatarData(
                    acao.titulo
                      .vencimentoEfetivo
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Saldo
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatarMoeda(
                    acao.titulo
                      .saldo
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  NF
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {acao.titulo
                    .faturamento
                    .numeroNF ||
                    "Não informada"}
                </p>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-700">
                Novo vencimento
              </span>

              <input
                type="date"
                value={
                  novaData
                }
                min={
                  dataParaInput(
                    acao.titulo
                      .vencimentoEfetivo
                  )
                }
                onChange={
                  (
                    event
                  ) =>
                    setNovaData(
                      event
                        .target
                        .value
                    )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  fecharAcao
                }
                disabled={
                  processando
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmarProrrogacao
                }
                disabled={
                  processando ||
                  !novaData
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processando && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Confirmar prorrogação
              </button>
            </div>
          </div>
        </ModalBase>
      )}

      {acao?.tipo ===
        "baixa" && (
        <ModalBase
          titulo="Registrar baixa"
          subtitulo={`${codigo(
            "TIT",
            acao.titulo
              .numeroSequencial
          )} • ${nomeEntidade(
            acao.titulo
              .venda
              .cliente
          )}`}
          onFechar={
            fecharAcao
          }
        >
          <div className="p-6">
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Valor do título
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatarMoeda(
                    acao.titulo
                      .valor
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Já baixado
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {formatarMoeda(
                    acao.titulo
                      .totalBaixado
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Saldo atual
                </p>

                <p className="mt-1 font-bold text-orange-600">
                  {formatarMoeda(
                    acao.titulo
                      .saldo
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Data da baixa
                </span>

                <input
                  type="date"
                  value={
                    dataBaixa
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDataBaixa(
                        event
                          .target
                          .value
                      )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Valor da baixa
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    valorBaixa
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setValorBaixa(
                        event
                          .target
                          .value
                      )
                  }
                  placeholder="0,00"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Origem da informação
                </span>

                <input
                  type="text"
                  value={
                    origemInformacao
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setOrigemInformacao(
                        event
                          .target
                          .value
                      )
                  }
                  placeholder="Ex.: Representada, cliente, extrato..."
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Referência
                </span>

                <input
                  type="text"
                  value={
                    referenciaBaixa
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setReferenciaBaixa(
                        event
                          .target
                          .value
                      )
                  }
                  placeholder="Ex.: comprovante ou identificação"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">
                Observações
              </span>

              <textarea
                value={
                  observacoesBaixa
                }
                onChange={
                  (
                    event
                  ) =>
                    setObservacoesBaixa(
                      event
                        .target
                        .value
                    )
                }
                rows={
                  3
                }
                placeholder="Informações adicionais sobre esta baixa, se necessário."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  fecharAcao
                }
                disabled={
                  processando
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmarBaixa
                }
                disabled={
                  processando ||
                  !dataBaixa ||
                  !valorBaixa.trim()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processando && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Confirmar baixa
              </button>
            </div>
          </div>
        </ModalBase>
      )}
    </main>
  )
}