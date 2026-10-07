"use client"

import {
  use,
  useEffect,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"

import {
  PageLayout,
} from "@/components/page-layout"
import {
  NavigationButtons,
} from "@/components/navigation-buttons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Button,
} from "@/components/ui/button"
import {
  Input,
} from "@/components/ui/input"
import {
  Label,
} from "@/components/ui/label"
import {
  Textarea,
} from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertCircle,
  Building2,
  Clock,
  Factory,
  Loader2,
  Save,
  Search,
  UserSearch,
  X,
} from "lucide-react"

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

type Vinculo =
  | "cliente"
  | "representada"
  | "prospeccao"

const TIPOS = [
  "WhatsApp",
  "E-mail",
  "Visita",
  "Ligação",
]

const ORIGENS_PROSPECCAO = [
  "Visita presencial",
  "Instagram",
  "WhatsApp",
  "Indicação",
  "Telefone",
  "E-mail",
  "Site / Internet",
  "Feira / Evento",
]

const STATUS = [
  "Aberto",
  "Em acompanhamento",
  "Finalizado",
  "Sem acompanhamento",
]

function converterParaDataLocal(
  valor: string | null
) {
  if (!valor) {
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

  const local =
    new Date(
      data.getTime() -
        data.getTimezoneOffset() *
          60000
    )

  return local
    .toISOString()
    .slice(0, 16)
}

function formatarData(
  valor: string
) {
  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return data.toLocaleString(
    "pt-BR"
  )
}

function rotuloCliente(
  cliente: Cliente
) {
  return (
    cliente.nomeFantasia ||
    cliente.razaoSocial
  )
}

export default function EditarInteracaoPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } =
    use(params)

  const router =
    useRouter()

  const [
    buscaCliente,
    setBuscaCliente,
  ] =
    useState("")

  const [
    resultadosClientes,
    setResultadosClientes,
  ] =
    useState<Cliente[]>(
      []
    )

  const [
    clienteSelecionado,
    setClienteSelecionado,
  ] =
    useState<Cliente | null>(
      null
    )

  const [
    carregandoClientes,
    setCarregandoClientes,
  ] =
    useState(false)

  const [
    listaClientesAberta,
    setListaClientesAberta,
  ] =
    useState(false)

  const [
    buscaRepresentada,
    setBuscaRepresentada,
  ] =
    useState("")

  const [
    resultadosRepresentadas,
    setResultadosRepresentadas,
  ] =
    useState<Representada[]>(
      []
    )

  const [
    representadaSelecionada,
    setRepresentadaSelecionada,
  ] =
    useState<Representada | null>(
      null
    )

  const [
    carregandoRepresentadas,
    setCarregandoRepresentadas,
  ] =
    useState(false)

  const [
    listaRepresentadasAberta,
    setListaRepresentadasAberta,
  ] =
    useState(false)

  const [
    vinculo,
    setVinculo,
  ] =
    useState<Vinculo>(
      "cliente"
    )

  const [
    dataOriginal,
    setDataOriginal,
  ] =
    useState("")

  const [
    autorOriginal,
    setAutorOriginal,
  ] =
    useState("")

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    salvando,
    setSalvando,
  ] =
    useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    form,
    setForm,
  ] = useState({
    clienteId: "",
    representadaId: "",

    nomeProspect: "",
    empresaProspect: "",
    origemProspeccao: "",

    tipo: "",
    assunto: "",
    descricao: "",
    resultado: "",
    proximosPasso: "",
    proximoContatoEm: "",

    statusFollowUp:
      "Sem acompanhamento",
  })

  useEffect(() => {
    const controller =
      new AbortController()

    async function carregar() {
      try {
        setCarregando(
          true
        )

        setErro(
          null
        )

        const resposta =
          await fetch(
            `/api/interacoes/${id}`,
            {
              cache:
                "no-store",

              signal:
                controller.signal,
            }
          )

        const dados =
          await resposta
            .json()
            .catch(
              () => null
            )

        if (
          !resposta.ok
        ) {
          throw new Error(
            dados?.message ||
              "Não foi possível carregar a interação."
          )
        }

        if (!dados) {
          throw new Error(
            "Resposta inválida ao carregar a interação."
          )
        }

        const possuiCliente =
          Boolean(
            dados.clienteId
          )

        const possuiRepresentada =
          Boolean(
            dados.representadaId
          )

        const possuiProspeccao =
          Boolean(
            dados.nomeProspect ||
              dados.empresaProspect ||
              dados.origemProspeccao
          )

        if (
          possuiCliente
        ) {
          setVinculo(
            "cliente"
          )

          if (
            dados.cliente
          ) {
            setClienteSelecionado(
              dados.cliente
            )

            setBuscaCliente(
              dados.cliente
                .nomeFantasia ||
                dados.cliente
                  .razaoSocial
            )
          }
        } else if (
          possuiRepresentada
        ) {
          setVinculo(
            "representada"
          )

          if (
            dados.representada
          ) {
            setRepresentadaSelecionada(
              dados.representada
            )

            setBuscaRepresentada(
              dados.representada
                .nome
            )
          }
        } else if (
          possuiProspeccao
        ) {
          setVinculo(
            "prospeccao"
          )
        } else {
          setVinculo(
            "cliente"
          )
        }

        setDataOriginal(
          dados.data ||
            ""
        )

        setAutorOriginal(
          dados.criadoPor
            ? `${dados.criadoPor.nome} — ${dados.criadoPor.perfil}`
            : "Usuário não identificado"
        )

        setForm({
          clienteId:
            dados.clienteId ||
            "",

          representadaId:
            dados.representadaId ||
            "",

          nomeProspect:
            dados.nomeProspect ||
            "",

          empresaProspect:
            dados.empresaProspect ||
            "",

          origemProspeccao:
            dados.origemProspeccao ||
            "",

          tipo:
            dados.tipo ||
            "",

          assunto:
            dados.assunto ||
            "",

          descricao:
            dados.descricao ||
            "",

          resultado:
            dados.resultado ||
            "",

          proximosPasso:
            dados.proximosPasso ||
            "",

          proximoContatoEm:
            converterParaDataLocal(
              dados.proximoContatoEm
            ),

          statusFollowUp:
            dados.statusFollowUp ||
            "Sem acompanhamento",
        })
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return
        }

        setErro(
          error instanceof
            Error
            ? error.message
            : "Erro ao carregar a interação."
        )
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setCarregando(
            false
          )
        }
      }
    }

    carregar()

    return () =>
      controller.abort()
  }, [
    id,
  ])

  useEffect(() => {
    if (
      vinculo !==
        "cliente" ||
      clienteSelecionado
    ) {
      setResultadosClientes(
        []
      )

      setCarregandoClientes(
        false
      )

      return
    }

    const termo =
      buscaCliente.trim()

    if (
      termo.length <
      2
    ) {
      setResultadosClientes(
        []
      )

      setCarregandoClientes(
        false
      )

      return
    }

    const controller =
      new AbortController()

    const timer =
      window.setTimeout(
        async () => {
          setCarregandoClientes(
            true
          )

          try {
            const query =
              new URLSearchParams({
                seletor:
                  "1",

                busca:
                  termo,

                limit:
                  "10",

                somenteAtivos:
                  "1",
              })

            const resposta =
              await fetch(
                `/api/clientes?${query.toString()}`,
                {
                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                }
              )

            const dados =
              await resposta
                .json()
                .catch(
                  () => []
                )

            if (
              !resposta.ok
            ) {
              throw new Error(
                dados?.message ||
                  "Não foi possível pesquisar Clientes."
              )
            }

            setResultadosClientes(
              Array.isArray(
                dados
              )
                ? dados
                : []
            )
          } catch (error) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return
            }

            console.error(
              "Erro ao pesquisar Clientes:",
              error
            )

            setResultadosClientes(
              []
            )
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setCarregandoClientes(
                false
              )
            }
          }
        },
        350
      )

    return () => {
      window.clearTimeout(
        timer
      )

      controller.abort()
    }
  }, [
    vinculo,
    buscaCliente,
    clienteSelecionado,
  ])

  useEffect(() => {
    if (
      vinculo !==
        "representada" ||
      representadaSelecionada
    ) {
      setResultadosRepresentadas(
        []
      )

      setCarregandoRepresentadas(
        false
      )

      return
    }

    const termo =
      buscaRepresentada.trim()

    if (
      termo.length <
      2
    ) {
      setResultadosRepresentadas(
        []
      )

      setCarregandoRepresentadas(
        false
      )

      return
    }

    const controller =
      new AbortController()

    const timer =
      window.setTimeout(
        async () => {
          setCarregandoRepresentadas(
            true
          )

          try {
            const query =
              new URLSearchParams({
                seletor:
                  "1",

                busca:
                  termo,

                limit:
                  "10",

                somenteAtivas:
                  "1",
              })

            const resposta =
              await fetch(
                `/api/representadas?${query.toString()}`,
                {
                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                }
              )

            const dados =
              await resposta
                .json()
                .catch(
                  () => []
                )

            if (
              !resposta.ok
            ) {
              throw new Error(
                dados?.message ||
                  "Não foi possível pesquisar Representadas."
              )
            }

            setResultadosRepresentadas(
              Array.isArray(
                dados
              )
                ? dados
                : []
            )
          } catch (error) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return
            }

            console.error(
              "Erro ao pesquisar Representadas:",
              error
            )

            setResultadosRepresentadas(
              []
            )
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setCarregandoRepresentadas(
                false
              )
            }
          }
        },
        350
      )

    return () => {
      window.clearTimeout(
        timer
      )

      controller.abort()
    }
  }, [
    vinculo,
    buscaRepresentada,
    representadaSelecionada,
  ])

  function alterarCampo(
    campo: keyof typeof form,
    valor: string
  ) {
    setForm(
      (
        anterior
      ) => ({
        ...anterior,
        [campo]:
          valor,
      })
    )

    if (erro) {
      setErro(
        null
      )
    }
  }

  function limparCliente() {
    setClienteSelecionado(
      null
    )

    setBuscaCliente(
      ""
    )

    setResultadosClientes(
      []
    )

    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        clienteId:
          "",
      })
    )
  }

  function limparRepresentada() {
    setRepresentadaSelecionada(
      null
    )

    setBuscaRepresentada(
      ""
    )

    setResultadosRepresentadas(
      []
    )

    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        representadaId:
          "",
      })
    )
  }

  function selecionarCliente(
    cliente: Cliente
  ) {
    setClienteSelecionado(
      cliente
    )

    setBuscaCliente(
      rotuloCliente(
        cliente
      )
    )

    setResultadosClientes(
      []
    )

    setListaClientesAberta(
      false
    )

    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        clienteId:
          cliente.id,
      })
    )

    setErro(
      null
    )
  }

  function selecionarRepresentada(
    representada:
      Representada
  ) {
    setRepresentadaSelecionada(
      representada
    )

    setBuscaRepresentada(
      representada.nome
    )

    setResultadosRepresentadas(
      []
    )

    setListaRepresentadasAberta(
      false
    )

    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        representadaId:
          representada.id,
      })
    )

    setErro(
      null
    )
  }

  function alterarVinculo(
    novoVinculo: Vinculo
  ) {
    setVinculo(
      novoVinculo
    )

    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        clienteId:
          novoVinculo ===
          "cliente"
            ? anterior.clienteId
            : "",

        representadaId:
          novoVinculo ===
          "representada"
            ? anterior.representadaId
            : "",

        nomeProspect:
          novoVinculo ===
          "prospeccao"
            ? anterior.nomeProspect
            : "",

        empresaProspect:
          novoVinculo ===
          "prospeccao"
            ? anterior.empresaProspect
            : "",

        origemProspeccao:
          novoVinculo ===
          "prospeccao"
            ? anterior.origemProspeccao
            : "",
      })
    )

    if (
      novoVinculo !==
      "cliente"
    ) {
      setClienteSelecionado(
        null
      )

      setBuscaCliente(
        ""
      )

      setResultadosClientes(
        []
      )
    }

    if (
      novoVinculo !==
      "representada"
    ) {
      setRepresentadaSelecionada(
        null
      )

      setBuscaRepresentada(
        ""
      )

      setResultadosRepresentadas(
        []
      )
    }

    setErro(
      null
    )
  }

  async function salvar() {
    if (
      vinculo ===
        "cliente" &&
      !form.clienteId
    ) {
      setErro(
        "Selecione o cliente."
      )

      return
    }

    if (
      vinculo ===
        "representada" &&
      !form.representadaId
    ) {
      setErro(
        "Selecione a representada."
      )

      return
    }

    if (
      vinculo ===
        "prospeccao" &&
      !form.nomeProspect.trim()
    ) {
      setErro(
        "Informe o nome ou a referência da prospecção."
      )

      return
    }

    if (
      vinculo ===
        "prospeccao" &&
      !form.origemProspeccao
    ) {
      setErro(
        "Selecione a origem da prospecção."
      )

      return
    }

    if (!form.tipo) {
      setErro(
        "Selecione o tipo de interação."
      )

      return
    }

    if (
      (
        form.statusFollowUp ===
          "Aberto" ||
        form.statusFollowUp ===
          "Em acompanhamento"
      ) &&
      !form.proximoContatoEm
    ) {
      setErro(
        "Informe a data do prÃ³ximo acompanhamento."
      )

      return
    }

    try {
      setSalvando(
        true
      )

      setErro(
        null
      )

      const resposta =
        await fetch(
          `/api/interacoes/${id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                clienteId:
                  vinculo ===
                  "cliente"
                    ? form.clienteId
                    : null,

                representadaId:
                  vinculo ===
                  "representada"
                    ? form.representadaId
                    : null,

                nomeProspect:
                  vinculo ===
                  "prospeccao"
                    ? form.nomeProspect.trim()
                    : null,

                empresaProspect:
                  vinculo ===
                    "prospeccao" &&
                  form.empresaProspect.trim()
                    ? form.empresaProspect.trim()
                    : null,

                origemProspeccao:
                  vinculo ===
                  "prospeccao"
                    ? form.origemProspeccao
                    : null,

                tipo:
                  form.tipo,

                assunto:
                  form.assunto ||
                  null,

                descricao:
                  form.descricao ||
                  null,

                resultado:
                  form.resultado ||
                  null,

                proximosPasso:
                  form.proximosPasso ||
                  null,

                proximoContatoEm:
                  form.proximoContatoEm
                    ? new Date(
                        form.proximoContatoEm
                      ).toISOString()
                    : null,

                statusFollowUp:
                  form.statusFollowUp,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () => null
          )

      if (
        !resposta.ok
      ) {
        setErro(
          dados?.message ||
            "Não foi possível salvar as alterações."
        )

        return
      }

      router.push(
        `/interacoes/${id}`
      )

      router.refresh()
    } catch {
      setErro(
        "Erro de conexÃ£o ao salvar as alterações."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  if (
    carregando
  ) {
    return (
      <PageLayout title="Editar Interação">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando interação...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Editar Interação">
      <NavigationButtons
        backLabel="Voltar para Interação"
        backHref={`/interacoes/${id}`}
      />

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>
            Editar Interação
          </CardTitle>

          <CardDescription>
            Corrija ou atualize este registro. A data, a hora e o usuÃ¡rio que criou a interação permanecem preservados.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {erro && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              {erro}
            </div>
          )}

          <div className="grid gap-4 rounded-md border bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Data e hora original
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />

                {dataOriginal
                  ? formatarData(
                      dataOriginal
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Registrado por
              </p>

              <p className="mt-1 text-sm font-medium">
                {autorOriginal}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Relacionado a *
            </Label>

            <Select
              value={
                vinculo
              }
              onValueChange={(
                valor
              ) =>
                alterarVinculo(
                  valor as Vinculo
                )
              }
              disabled={
                salvando
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="cliente">
                  Cliente
                </SelectItem>

                <SelectItem value="representada">
                  Representada
                </SelectItem>

                <SelectItem value="prospeccao">
                  Prospecção / Lead
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {vinculo ===
            "cliente" && (
            <div className="space-y-2">
              <Label>
                Cliente *
              </Label>

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
                  onBlur={() => {
                    window.setTimeout(
                      () =>
                        setListaClientesAberta(
                          false
                        ),
                      150
                    )
                  }}
                  onChange={(
                    evento
                  ) => {
                    setBuscaCliente(
                      evento.target.value
                    )

                    setClienteSelecionado(
                      null
                    )

                    alterarCampo(
                      "clienteId",
                      ""
                    )

                    setListaClientesAberta(
                      true
                    )
                  }}
                  disabled={
                    salvando
                  }
                  placeholder="Digite nome, fantasia, código ou CNPJ..."
                  className="pl-9 pr-10"
                  autoComplete="off"
                />

                {(clienteSelecionado ||
                  buscaCliente) && (
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onMouseDown={(
                      evento
                    ) => {
                      evento.preventDefault()

                      limparCliente()
                    }}
                    aria-label="Limpar Cliente"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {listaClientesAberta && (
                  <div className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                    {clienteSelecionado ? (
                      <div className="px-3 py-3 text-sm text-emerald-700">
                        Cliente selecionado. Limpe o campo para pesquisar outro.
                      </div>
                    ) : buscaCliente.trim().length <
                      2 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Digite pelo menos 2 caracteres.
                      </div>
                    ) : carregandoClientes ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Pesquisando Clientes...
                      </div>
                    ) : resultadosClientes.length ===
                      0 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Nenhum Cliente ativo encontrado.
                      </div>
                    ) : (
                      resultadosClientes.map(
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
                              evento
                            ) => {
                              evento.preventDefault()

                              selecionarCliente(
                                cliente
                              )
                            }}
                          >
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Building2 className="h-4 w-4 text-blue-600" />

                              {rotuloCliente(
                                cliente
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                A pesquisa consulta o servidor e respeita o escopo de acesso do usuário.
              </p>
            </div>
          )}

          {vinculo ===
            "representada" && (
            <div className="space-y-2">
              <Label>
                Representada *
              </Label>

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
                  onBlur={() => {
                    window.setTimeout(
                      () =>
                        setListaRepresentadasAberta(
                          false
                        ),
                      150
                    )
                  }}
                  onChange={(
                    evento
                  ) => {
                    setBuscaRepresentada(
                      evento.target.value
                    )

                    setRepresentadaSelecionada(
                      null
                    )

                    alterarCampo(
                      "representadaId",
                      ""
                    )

                    setListaRepresentadasAberta(
                      true
                    )
                  }}
                  disabled={
                    salvando
                  }
                  placeholder="Digite nome, código ou CNPJ..."
                  className="pl-9 pr-10"
                  autoComplete="off"
                />

                {(representadaSelecionada ||
                  buscaRepresentada) && (
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onMouseDown={(
                      evento
                    ) => {
                      evento.preventDefault()

                      limparRepresentada()
                    }}
                    aria-label="Limpar Representada"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {listaRepresentadasAberta && (
                  <div className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                    {representadaSelecionada ? (
                      <div className="px-3 py-3 text-sm text-emerald-700">
                        Representada selecionada. Limpe o campo para pesquisar outra.
                      </div>
                    ) : buscaRepresentada.trim().length <
                      2 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Digite pelo menos 2 caracteres.
                      </div>
                    ) : carregandoRepresentadas ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Pesquisando Representadas...
                      </div>
                    ) : resultadosRepresentadas.length ===
                      0 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Nenhuma Representada ativa encontrada.
                      </div>
                    ) : (
                      resultadosRepresentadas.map(
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
                              evento
                            ) => {
                              evento.preventDefault()

                              selecionarRepresentada(
                                representada
                              )
                            }}
                          >
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Factory className="h-4 w-4 text-orange-600" />

                              {
                                representada.nome
                              }
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                A tela não carrega a relação completa de Representadas.
              </p>
            </div>
          )}

          {vinculo ===
            "prospeccao" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="mb-4 flex items-start gap-2">
                <UserSearch className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Dados da Prospecção / Lead
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Edite os dados iniciais deste possível cliente sem necessidade de cadastrá-lo formalmente.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Nome / ReferÃªncia *
                  </Label>

                  <Input
                    value={
                      form.nomeProspect
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarCampo(
                        "nomeProspect",
                        evento.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                    placeholder="Ex.: Michel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Empresa / Estabelecimento
                  </Label>

                  <Input
                    value={
                      form.empresaProspect
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarCampo(
                        "empresaProspect",
                        evento.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                    placeholder="Ex.: Casa das Formas"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>
                  Origem da Prospecção *
                </Label>

                <Select
                  value={
                    form.origemProspeccao
                  }
                  onValueChange={(
                    valor
                  ) =>
                    alterarCampo(
                      "origemProspeccao",
                      valor
                    )
                  }
                  disabled={
                    salvando
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>

                  <SelectContent>
                    {ORIGENS_PROSPECCAO.map(
                      (
                        origem
                      ) => (
                        <SelectItem
                          key={
                            origem
                          }
                          value={
                            origem
                          }
                        >
                          {
                            origem
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Quando a prospecção virar um cliente real, altere o vínculo para Cliente e selecione o cadastro correspondente.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Tipo de Interação *
              </Label>

              <Select
                value={
                  form.tipo
                }
                onValueChange={(
                  valor
                ) =>
                  alterarCampo(
                    "tipo",
                    valor
                  )
                }
                disabled={
                  salvando
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>

                <SelectContent>
                  {TIPOS.map(
                    (
                      tipo
                    ) => (
                      <SelectItem
                        key={
                          tipo
                        }
                        value={
                          tipo
                        }
                      >
                        {
                          tipo
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Assunto
              </Label>

              <Input
                value={
                  form.assunto
                }
                onChange={(
                  evento
                ) =>
                  alterarCampo(
                    "assunto",
                    evento.target.value
                  )
                }
                disabled={
                  salvando
                }
                placeholder={
                  vinculo ===
                  "prospeccao"
                    ? "Ex.: Envio de catálogo e apresentação comercial"
                    : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Descrição
            </Label>

            <Textarea
              className="min-h-[80px]"
              value={
                form.descricao
              }
              onChange={(
                evento
              ) =>
                alterarCampo(
                  "descricao",
                  evento.target.value
                )
              }
              disabled={
                salvando
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Resultado
            </Label>

            <Textarea
              className="min-h-[70px]"
              value={
                form.resultado
              }
              onChange={(
                evento
              ) =>
                alterarCampo(
                  "resultado",
                  evento.target.value
                )
              }
              disabled={
                salvando
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Próximos Passos
            </Label>

            <Textarea
              className="min-h-[70px]"
              value={
                form.proximosPasso
              }
              onChange={(
                evento
              ) =>
                alterarCampo(
                  "proximosPasso",
                  evento.target.value
                )
              }
              disabled={
                salvando
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Próximo acompanhamento
              </Label>

              <Input
                type="datetime-local"
                value={
                  form.proximoContatoEm
                }
                onChange={(
                  evento
                ) =>
                  alterarCampo(
                    "proximoContatoEm",
                    evento.target.value
                  )
                }
                disabled={
                  salvando
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Situação
              </Label>

              <Select
                value={
                  form.statusFollowUp
                }
                onValueChange={(
                  valor
                ) =>
                  alterarCampo(
                    "statusFollowUp",
                    valor
                  )
                }
                disabled={
                  salvando
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS.map(
                    (
                      status
                    ) => (
                      <SelectItem
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button
              onClick={
                salvar
              }
              disabled={
                salvando
              }
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />

                  Salvar AlteraÃ§Ãµes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}