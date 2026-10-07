"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import Link from "next/link"

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
  X,
} from "lucide-react"

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

type ClienteDetalhado =
  Cliente & {
    termometroRelacionamento:
      | string
      | null

    atencoesComerciais?:
      AtencaoComercial[]
  }

type Representada = {
  id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  status: string
}

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

type Vinculo =
  | "cliente"
  | "cliente_representada"
  | "representada"
  | "prospeccao"

function rotuloCliente(
  cliente: Cliente
) {
  return (
    cliente.nomeFantasia ||
    cliente.razaoSocial
  )
}

function descricaoTermometro(
  valor: string | null
) {
  switch (valor) {
    case "Verde":
      return {
        emoji: "🟢",
        titulo:
          "Relacionamento consolidado",
        classe:
          "border-green-200 bg-green-50 text-green-900",
      }

    case "Azul":
      return {
        emoji: "🔵",
        titulo:
          "Bom relacionamento / em desenvolvimento",
        classe:
          "border-blue-200 bg-blue-50 text-blue-900",
      }

    case "Amarelo":
      return {
        emoji: "🟡",
        titulo:
          "Atenção / relacionamento irregular",
        classe:
          "border-yellow-200 bg-yellow-50 text-yellow-900",
      }

    case "Laranja":
      return {
        emoji: "🟠",
        titulo:
          "Cautela comercial",
        classe:
          "border-orange-200 bg-orange-50 text-orange-900",
      }

    case "Vermelho":
      return {
        emoji: "🔴",
        titulo:
          "Relacionamento crítico",
        classe:
          "border-red-200 bg-red-50 text-red-900",
      }

    default:
      return {
        emoji: "⚪",
        titulo:
          "Não classificado",
        classe:
          "border-slate-200 bg-slate-50 text-slate-700",
      }
  }
}

function classeTipoAtencao(
  tipo: string
) {
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

export default function NovaInteracaoPage() {
  const router =
    useRouter()

  const [
    salvando,
    setSalvando,
  ] =
    useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  const [
    vinculo,
    setVinculo,
  ] =
    useState<Vinculo>(
      "cliente"
    )

  const usaCliente =
    vinculo === "cliente" ||
    vinculo ===
      "cliente_representada"

  const usaRepresentada =
    vinculo ===
      "representada" ||
    vinculo ===
      "cliente_representada"

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
    clienteDetalhado,
    setClienteDetalhado,
  ] =
    useState<ClienteDetalhado | null>(
      null
    )

  const [
    carregandoClienteDetalhado,
    setCarregandoClienteDetalhado,
  ] =
    useState(false)

  const [
    erroClienteDetalhado,
    setErroClienteDetalhado,
  ] =
    useState<string | null>(
      null
    )

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
    form,
    setForm,
  ] =
    useState({
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
    })

  /*
   * CLIENTE
   *
   * Busca real no servidor.
   * Nenhuma lista completa de Clientes
   * é carregada nesta tela.
   */
  useEffect(() => {
    if (
      !usaCliente ||
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
            const params =
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

            const response =
              await fetch(
                `/api/clientes?${params.toString()}`,
                {
                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                }
              )

            const data =
              await response
                .json()
                .catch(
                  () => []
                )

            if (
              !response.ok
            ) {
              throw new Error(
                data?.message ||
                  "Não foi possível pesquisar Clientes."
              )
            }

            setResultadosClientes(
              Array.isArray(
                data
              )
                ? data
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
    usaCliente,
    buscaCliente,
    clienteSelecionado,
  ])

  /*
   * Após selecionar um Cliente,
   * busca a ficha completa para exibir
   * Termômetro e Atenções Comerciais.
   *
   * Esses alertas são informativos:
   * não bloqueiam o registro da interação.
   */
  useEffect(() => {
    if (
      !clienteSelecionado?.id
    ) {
      setClienteDetalhado(
        null
      )

      setCarregandoClienteDetalhado(
        false
      )

      setErroClienteDetalhado(
        null
      )

      return
    }

    const controller =
      new AbortController()

    const carregar =
      async () => {
        setCarregandoClienteDetalhado(
          true
        )

        setErroClienteDetalhado(
          null
        )

        try {
          const response =
            await fetch(
              `/api/clientes/${clienteSelecionado.id}`,
              {
                method: "GET",
                cache:
                  "no-store",

                signal:
                  controller.signal,
              }
            )

          const data =
            await response
              .json()
              .catch(
                () => null
              )

          if (!response.ok) {
            throw new Error(
              data?.error ||
                data?.message ||
                "Não foi possível carregar as informações comerciais do Cliente."
            )
          }

          setClienteDetalhado(
            data as
              ClienteDetalhado
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
            "Erro ao carregar informações comerciais do Cliente:",
            error
          )

          setClienteDetalhado(
            null
          )

          setErroClienteDetalhado(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as informações comerciais do Cliente."
          )
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setCarregandoClienteDetalhado(
              false
            )
          }
        }
      }

    carregar()

    return () => {
      controller.abort()
    }
  }, [
    clienteSelecionado?.id,
  ])

  /*
   * REPRESENTADA
   *
   * Mesmo padrão escalável utilizado
   * para Clientes.
   */
  useEffect(() => {
    if (
      !usaRepresentada ||
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
            const params =
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

            const response =
              await fetch(
                `/api/representadas?${params.toString()}`,
                {
                  cache:
                    "no-store",

                  signal:
                    controller.signal,
                }
              )

            const data =
              await response
                .json()
                .catch(
                  () => []
                )

            if (
              !response.ok
            ) {
              throw new Error(
                data?.message ||
                  "Não foi possível pesquisar Representadas."
              )
            }

            setResultadosRepresentadas(
              Array.isArray(
                data
              )
                ? data
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
    usaRepresentada,
    buscaRepresentada,
    representadaSelecionada,
  ])

  function handleChange(
    campo:
      keyof typeof form,
    valor: string
  ) {
    setForm(
      (
        atual
      ) => ({
        ...atual,

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
    setBuscaCliente(
      ""
    )

    setClienteSelecionado(
      null
    )

    setClienteDetalhado(
      null
    )

    setErroClienteDetalhado(
      null
    )

    setResultadosClientes(
      []
    )

    setForm(
      (
        atual
      ) => ({
        ...atual,

        clienteId:
          "",
      })
    )
  }

  function limparRepresentada() {
    setBuscaRepresentada(
      ""
    )

    setRepresentadaSelecionada(
      null
    )

    setResultadosRepresentadas(
      []
    )

    setForm(
      (
        atual
      ) => ({
        ...atual,

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

    setClienteDetalhado(
      null
    )

    setErroClienteDetalhado(
      null
    )

    setForm(
      (
        atual
      ) => ({
        ...atual,

        clienteId:
          cliente.id,
      })
    )

    setListaClientesAberta(
      false
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

    setForm(
      (
        atual
      ) => ({
        ...atual,

        representadaId:
          representada.id,
      })
    )

    setListaRepresentadasAberta(
      false
    )

    setErro(
      null
    )
  }

  function alterarVinculo(
    novoVinculo: Vinculo
  ) {
    const novoUsaCliente =
      novoVinculo ===
        "cliente" ||
      novoVinculo ===
        "cliente_representada"

    const novoUsaRepresentada =
      novoVinculo ===
        "representada" ||
      novoVinculo ===
        "cliente_representada"

    const novaProspeccao =
      novoVinculo ===
      "prospeccao"

    setVinculo(
      novoVinculo
    )

    if (
      !novoUsaCliente
    ) {
      setBuscaCliente(
        ""
      )

      setClienteSelecionado(
        null
      )

      setClienteDetalhado(
        null
      )

      setErroClienteDetalhado(
        null
      )

      setResultadosClientes(
        []
      )
    }

    if (
      !novoUsaRepresentada
    ) {
      setBuscaRepresentada(
        ""
      )

      setRepresentadaSelecionada(
        null
      )

      setResultadosRepresentadas(
        []
      )
    }

    setForm(
      (
        atual
      ) => ({
        ...atual,

        clienteId:
          novoUsaCliente
            ? atual.clienteId
            : "",

        representadaId:
          novoUsaRepresentada
            ? atual.representadaId
            : "",

        nomeProspect:
          novaProspeccao
            ? atual.nomeProspect
            : "",

        empresaProspect:
          novaProspeccao
            ? atual.empresaProspect
            : "",

        origemProspeccao:
          novaProspeccao
            ? atual.origemProspeccao
            : "",
      })
    )

    setErro(
      null
    )
  }

  async function handleSalvar() {
    if (
      usaCliente &&
      !form.clienteId
    ) {
      setErro(
        "Selecione o Cliente relacionado à interação."
      )

      return
    }

    if (
      usaRepresentada &&
      !form.representadaId
    ) {
      setErro(
        "Selecione a Representada relacionada à interação."
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

    try {
      setSalvando(
        true
      )

      setErro(
        null
      )

      const response =
        await fetch(
          "/api/interacoes",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                clienteId:
                  usaCliente
                    ? form.clienteId
                    : null,

                representadaId:
                  usaRepresentada
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
                  form.proximoContatoEm ||
                  null,
              }),
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
            "Erro ao salvar interação."
        )

        return
      }

      router.push(
        "/interacoes"
      )

      router.refresh()
    } catch (error) {
      console.error(
        error
      )

      setErro(
        "Erro de conexão ao salvar a interação."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  const atencoesAtivas =
    (
      clienteDetalhado
        ?.atencoesComerciais ||
      []
    ).filter(
      (
        atencao
      ) =>
        atencao.status ===
        "Ativa"
    )

  const termometro =
    descricaoTermometro(
      clienteDetalhado
        ?.termometroRelacionamento ||
        null
    )

  return (
    <PageLayout title="Nova Interação">
      <NavigationButtons
        backLabel="Voltar para Interações"
        backHref="/interacoes"
      />

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>
            Registrar Interação
          </CardTitle>

          <CardDescription>
            Registre contatos com
            Clientes, Representadas,
            Cliente + Representada ou
            novas prospecções. As buscas
            são realizadas sob demanda
            para manter a tela rápida
            mesmo com uma base grande.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {erro && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                {erro}
              </span>
            </div>
          )}

          <div className="rounded-md border bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4" />

              <span>
                Data e hora da interação
                são registradas
                automaticamente no
                momento do salvamento.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Relacionar interação com{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Select
              value={
                vinculo
              }
              onValueChange={(
                value
              ) =>
                alterarVinculo(
                  value as Vinculo
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

                <SelectItem value="cliente_representada">
                  Cliente + Representada
                </SelectItem>

                <SelectItem value="representada">
                  Representada
                </SelectItem>

                <SelectItem value="prospeccao">
                  Prospecção / Lead sem
                  cadastro
                </SelectItem>
              </SelectContent>
            </Select>

            {vinculo ===
              "cliente_representada" && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                Use esta opção quando a
                interação envolver um
                Cliente já cadastrado e
                uma Representada
                específica, inclusive em
                prospecção comercial de
                uma nova Representada
                para esse Cliente.
              </div>
            )}

            {vinculo ===
              "representada" && (
              <p className="text-xs text-muted-foreground">
                Esta opção representa
                uma interação
                institucional diretamente
                com a Representada, sem
                vincular um Cliente.
              </p>
            )}
          </div>

          {usaCliente && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>
                  Cliente{" "}
                  <span className="text-red-500">
                    *
                  </span>
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
                      event
                    ) => {
                      const valor =
                        event.target.value

                      setBuscaCliente(
                        valor
                      )

                      setClienteSelecionado(
                        null
                      )

                      setClienteDetalhado(
                        null
                      )

                      setErroClienteDetalhado(
                        null
                      )

                      setForm(
                        (
                          atual
                        ) => ({
                          ...atual,

                          clienteId:
                            "",
                        })
                      )

                      setListaClientesAberta(
                        true
                      )

                      setErro(
                        null
                      )
                    }}
                    placeholder="Digite nome, fantasia, código ou CNPJ..."
                    className="pl-9 pr-10"
                    autoComplete="off"
                    disabled={
                      salvando
                    }
                  />

                  {(clienteSelecionado ||
                    buscaCliente) && (
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault()

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
                          Cliente
                          selecionado.
                          Limpe o campo
                          para pesquisar
                          outro.
                        </div>
                      ) : buscaCliente
                          .trim()
                          .length <
                        2 ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                          Digite pelo
                          menos 2
                          caracteres.
                        </div>
                      ) : carregandoClientes ? (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Pesquisando
                          Clientes...
                        </div>
                      ) : resultadosClientes
                          .length ===
                        0 ? (
                        <div className="space-y-3 px-3 py-4">
                          <p className="text-sm text-muted-foreground">
                            Nenhum
                            Cliente
                            ativo
                            encontrado.
                          </p>

                          <Link href="/clientes/novo">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              Cadastrar
                              Cliente
                            </Button>
                          </Link>
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
                                event
                              ) => {
                                event.preventDefault()

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
                                      Razão
                                      social:{" "}
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
                  A pesquisa consulta o
                  servidor e respeita o
                  escopo de acesso do
                  usuário.
                </p>
              </div>

              {clienteSelecionado && (
                <div className="space-y-3">
                  {carregandoClienteDetalhado && (
                    <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando
                      Termômetro e
                      Atenções Comerciais
                      do Cliente...
                    </div>
                  )}

                  {erroClienteDetalhado && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                      <div>
                        <p className="font-medium">
                          Não foi possível
                          carregar o
                          resumo comercial
                          do Cliente.
                        </p>

                        <p className="mt-1">
                          {
                            erroClienteDetalhado
                          }
                        </p>

                        <p className="mt-1 text-xs">
                          A interação não
                          está bloqueada,
                          mas confira a
                          ficha do Cliente
                          se precisar das
                          informações antes
                          de continuar.
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
                              Termômetro
                              de
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
                            href={`/clientes/${clienteSelecionado.id}`}
                            className="text-sm font-medium underline underline-offset-4"
                          >
                            Ver ficha do
                            Cliente
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
                                Este
                                Cliente
                                possui{" "}
                                {
                                  atencoesAtivas.length
                                }{" "}
                                Atenção
                                Comercial
                                ativa
                                {atencoesAtivas.length ===
                                1
                                  ? ""
                                  : "s"}
                                .
                              </p>

                              <p className="mt-1 text-sm text-orange-900">
                                As
                                informações
                                abaixo são
                                alertas
                                comerciais.
                                Elas não
                                bloqueiam
                                automaticamente
                                esta
                                interação.
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {atencoesAtivas
                              .slice(
                                0,
                                4
                              )
                              .map(
                                (
                                  atencao
                                ) => (
                                  <div
                                    key={
                                      atencao.id
                                    }
                                    className="rounded-md border border-orange-200 bg-white/80 p-3"
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

                                      {atencao.representada && (
                                        <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                          Representada:{" "}
                                          {
                                            atencao
                                              .representada
                                              .nome
                                          }
                                        </span>
                                      )}

                                      {!atencao.representada && (
                                        <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                                          Geral do
                                          Cliente
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
                              )}

                            {atencoesAtivas.length >
                              4 && (
                              <p className="text-sm font-medium text-orange-900">
                                Existem
                                mais{" "}
                                {atencoesAtivas.length -
                                  4}{" "}
                                Atenção
                                {atencoesAtivas.length -
                                  4 ===
                                1
                                  ? ""
                                  : "ões"}{" "}
                                ativa
                                {atencoesAtivas.length -
                                  4 ===
                                1
                                  ? ""
                                  : "s"}{" "}
                                na ficha do
                                Cliente.
                              </p>
                            )}
                          </div>

                          <div className="mt-3">
                            <Link
                              href={`/clientes/${clienteSelecionado.id}`}
                              className="text-sm font-semibold text-orange-950 underline underline-offset-4"
                            >
                              Ver todas as
                              Atenções do
                              Cliente
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                          Nenhuma Atenção
                          Comercial ativa
                          registrada para
                          este Cliente.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {usaRepresentada && (
            <div className="space-y-2">
              <Label>
                Representada{" "}
                <span className="text-red-500">
                  *
                </span>
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
                    event
                  ) => {
                    const valor =
                      event.target.value

                    setBuscaRepresentada(
                      valor
                    )

                    setRepresentadaSelecionada(
                      null
                    )

                    setForm(
                      (
                        atual
                      ) => ({
                        ...atual,

                        representadaId:
                          "",
                      })
                    )

                    setListaRepresentadasAberta(
                      true
                    )

                    setErro(
                      null
                    )
                  }}
                  placeholder="Digite nome, código ou CNPJ..."
                  className="pl-9 pr-10"
                  autoComplete="off"
                  disabled={
                    salvando
                  }
                />

                {(representadaSelecionada ||
                  buscaRepresentada) && (
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onMouseDown={(
                      event
                    ) => {
                      event.preventDefault()

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
                        Representada
                        selecionada.
                        Limpe o campo
                        para pesquisar
                        outra.
                      </div>
                    ) : buscaRepresentada
                        .trim()
                        .length <
                      2 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Digite pelo menos
                        2 caracteres.
                      </div>
                    ) : carregandoRepresentadas ? (
                      <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Pesquisando
                        Representadas...
                      </div>
                    ) : resultadosRepresentadas
                        .length ===
                      0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground">
                        Nenhuma
                        Representada
                        ativa encontrada.
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
                              event
                            ) => {
                              event.preventDefault()

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
                A tela pesquisa
                Representadas ativas sob
                demanda e não carrega a
                relação completa.
              </p>

              {vinculo ===
                "cliente_representada" &&
                clienteSelecionado &&
                representadaSelecionada && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    Esta interação será
                    registrada com os
                    dois vínculos:{" "}
                    <strong>
                      {rotuloCliente(
                        clienteSelecionado
                      )}
                    </strong>{" "}
                    +{" "}
                    <strong>
                      {
                        representadaSelecionada.nome
                      }
                    </strong>
                    .
                  </div>
                )}
            </div>
          )}

          {vinculo ===
            "prospeccao" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900">
                  Prospecção / Lead
                  ainda sem cadastro
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Use este fluxo quando
                  ainda não existe um
                  Cliente cadastrado no
                  CRM. Se o Cliente já
                  existir e a prospecção
                  for para uma nova
                  Representada, use
                  "Cliente +
                  Representada".
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Nome / Referência{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </Label>

                  <Input
                    value={
                      form.nomeProspect
                    }
                    disabled={
                      salvando
                    }
                    placeholder="Ex.: Michel"
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "nomeProspect",
                        event.target.value
                      )
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Nome da pessoa ou
                    outra referência que
                    permita identificar o
                    contato.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Empresa /
                    Estabelecimento
                  </Label>

                  <Input
                    value={
                      form.empresaProspect
                    }
                    disabled={
                      salvando
                    }
                    placeholder="Ex.: Casa das Formas"
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "empresaProspect",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>
                  Origem da Prospecção{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </Label>

                <Select
                  value={
                    form.origemProspeccao
                  }
                  onValueChange={(
                    value
                  ) =>
                    handleChange(
                      "origemProspeccao",
                      value
                    )
                  }
                  disabled={
                    salvando
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione como esta prospecção chegou ao escritório" />
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

                <p className="text-xs text-muted-foreground">
                  A origem permitirá
                  medir futuramente quais
                  canais geram mais
                  oportunidades
                  comerciais.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Tipo de Interação{" "}
                <span className="text-red-500">
                  *
                </span>
              </Label>

              <Select
                value={
                  form.tipo
                }
                onValueChange={(
                  value
                ) =>
                  handleChange(
                    "tipo",
                    value
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

              <p className="text-xs text-muted-foreground">
                Informe como ocorreu
                esta interação.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Assunto
              </Label>

              <Input
                value={
                  form.assunto
                }
                disabled={
                  salvando
                }
                placeholder={
                  vinculo ===
                  "representada"
                    ? "Ex.: Cobrança de relatório de comissão"
                    : vinculo ===
                        "prospeccao"
                      ? "Ex.: Envio de catálogo e apresentação comercial"
                      : vinculo ===
                          "cliente_representada"
                        ? "Ex.: Apresentação da Representada ao Cliente"
                        : "Ex.: Retorno sobre proposta comercial"
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "assunto",
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Descrição
            </Label>

            <Textarea
              className="min-h-[90px]"
              value={
                form.descricao
              }
              disabled={
                salvando
              }
              placeholder={
                vinculo ===
                "prospeccao"
                  ? "Descreva o contato, interesse demonstrado e demais informações conhecidas sobre a prospecção."
                  : vinculo ===
                      "cliente_representada"
                    ? "Descreva o contato entre este Cliente e a Representada, interesse, necessidade, catálogo apresentado ou demais informações comerciais."
                    : "Descreva o que foi tratado."
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "descricao",
                  event.target.value
                )
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
              disabled={
                salvando
              }
              placeholder="Registre o resultado da interação."
              onChange={(
                event
              ) =>
                handleChange(
                  "resultado",
                  event.target.value
                )
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
              disabled={
                salvando
              }
              placeholder={
                vinculo ===
                "prospeccao"
                  ? "Ex.: Enviar catálogo e retornar contato para verificar interesse."
                  : vinculo ===
                      "cliente_representada"
                    ? "Ex.: Enviar catálogo da Representada e retornar ao Cliente para verificar interesse."
                    : "Informe o que deverá ser feito depois."
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "proximosPasso",
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Próximo acompanhamento
            </Label>

            <Input
              type="datetime-local"
              value={
                form.proximoContatoEm
              }
              disabled={
                salvando
              }
              onChange={(
                event
              ) =>
                handleChange(
                  "proximoContatoEm",
                  event.target.value
                )
              }
            />

            <p className="text-xs text-muted-foreground">
              Opcional. Preencha quando
              houver nova cobrança,
              retorno, visita ou
              acompanhamento futuro.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
            <Link href="/interacoes">
              <Button
                type="button"
                variant="outline"
                disabled={
                  salvando
                }
              >
                Cancelar
              </Button>
            </Link>

            <Button
              type="button"
              onClick={
                handleSalvar
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
                  Salvar Interação
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}