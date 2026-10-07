"use client"

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  useParams,
  useRouter,
} from "next/navigation"

import {
  Button,
} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  formatarCodigoInteracao,
} from "@/lib/interacoes/codigo"

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ClipboardList,
  Eye,
  FileText,
  Landmark,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react"

interface Faixa {
  desconto: string
  comissao: string
}

interface Representada {
  id: string
  nome: string
  codigo: string | null
  cnpj: string | null

  comissao: number | null

  tipoComissao:
    | "fixa"
    | "variada"
    | null

  faixasComissao:
    | string
    | null

  fechamentoComissao:
    | string
    | null

  pagamentoComissao:
    | string
    | null

  regraReconhecimentoComissao:
    | string
    | null

  bancoComissao:
    | string
    | null

  contatoPrincipal:
    | string
    | null

  emailPrincipal:
    | string
    | null

  telefonePrincipal:
    | string
    | null

  whatsappPrincipal:
    | string
    | null

  endereco:
    | string
    | null

  cidade:
    | string
    | null

  estado:
    | string
    | null

  cep:
    | string
    | null

  pedidoMinimo:
    | number
    | null

  minimoParcela:
    | number
    | null

  politicaFrete:
    | string
    | null

  regiaoAtendimento:
    | string
    | null

  prazoEntregaDias:
    | number
    | null

  prazoFaturamentoDias:
    | number
    | null

  status: string

  observacoes:
    | string
    | null
}

interface RegraComercial {
  id: string
  representadaId: string

  clienteId:
    | string
    | null

  contratoId:
    | string
    | null

  nome: string
  tipoEscopo: string

  vigenciaInicio: string

  vigenciaFim:
    | string
    | null

  ativa: boolean

  pedidoMinimo:
    | number
    | null

  minimoParcela:
    | number
    | null

  prazoEntregaDias:
    | number
    | null

  prazoFaturamentoDias:
    | number
    | null

  frete:
    | string
    | null

  regiao:
    | string
    | null

  tipoComissao:
    | string
    | null

  percentualComissao:
    | number
    | null

  faixasComissao:
    | string
    | null

  reconhecimentoComissao:
    | string
    | null

  fechamentoComissao:
    | string
    | null

  pagamentoComissao:
    | string
    | null

  observacoes:
    | string
    | null

  _count: {
    vendas: number
  }
}

interface UsuarioResumo {
  id: string
  nome: string
  perfil: string
}

interface Interacao {
  id: string

  numeroSequencial: number

  data: string
  tipo: string

  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null

  proximoContatoEm:
    | string
    | null

  statusFollowUp: string

  criadoPor:
    | UsuarioResumo
    | null

  responsavel:
    | UsuarioResumo
    | null

  criadoEm: string
  atualizadoEm: string
}

interface ClienteCompra {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
  quantidadeVendas: number
  ultimaVendaEm: string | null
}

interface RespostaClientesCompras {
  busca: string
  total: number
  clientes: ClienteCompra[]
}

interface ClienteResumo {
  id: string
  codigo?: string | null
  razaoSocial: string
  nomeFantasia: string | null
}

interface OrcamentoRepresentada {
  id: string
  numeroSequencial: number
  data: string
  validadeEm: string
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  status: string
  cliente: ClienteResumo
  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

interface VendaRepresentada {
  id: string
  numeroSequencial: number
  data: string
  valorTotal: number | null
  status: string
  numeroPedidoInterno: string | null
  numeroPedido: string | null
  numeroPedidoRepresentada: string | null
  numeroOCCliente: string | null
  produto: string | null
  condicaoPagamento: string | null
  cliente: ClienteResumo
  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

interface MetaRepresentada {
  id: string
  escritorioId: string
  representadaId: string
  criadoPorId: string | null
  tipo: string
  ano: number
  mes: number
  valorMeta: number
  ativa: boolean
  fonte: string | null
  referencia: string | null
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
  criadoPor: UsuarioResumo | null
}

interface FormularioMetaRepresentada {
  ano: string
  mes: string
  valorMeta: string
  fonte: string
  referencia: string
  observacoes: string
}

interface TarefaRepresentada {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  prioridade: string
  status: string
  inicioEm: string | null
  fimEm: string | null
  vencimentoEm: string | null
  cliente: ClienteResumo | null
  responsavel: UsuarioResumo | null
}

interface TituloFaturamento {
  id: string
  numeroSequencial: number
  numeroParcela: number | null
  vencimento: string
  valor: number
  status: string
}

interface FaturamentoRepresentada {
  id: string
  numeroSequencial: number
  numeroNF: string | null
  dataFaturamento: string
  valorFaturado: number
  faturamentoParcial: boolean
  saldoPedido: number | null
  percentualCorte: number | null
  valorCorte: number | null
  status: string
  venda: {
    id: string
    numeroSequencial: number
    data: string
    valorTotal: number | null
    status: string
    condicaoPagamento: string | null
    cliente: ClienteResumo
  }
  titulos: TituloFaturamento[]
}

interface Paginacao {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
}

interface RespostaPaginada<T> {
  dados: T[]
  paginacao: Paginacao
}

interface FiltrosHistorico {
  busca: string
  status: string
  tipo: string
  dataInicio: string
  dataFim: string
}

interface OpcaoFiltro {
  valor: string
  rotulo: string
}

const LIMITE_POR_SECAO = 5

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function formularioMetaVazio(
  ano: string,
  mes = ""
): FormularioMetaRepresentada {
  return {
    ano,
    mes,
    valorMeta: "",
    fonte: "",
    referencia: "",
    observacoes: "",
  }
}

const PAGINACAO_INICIAL: Paginacao = {
  pagina: 1,
  limite: LIMITE_POR_SECAO,
  total: 0,
  totalPaginas: 1,
}

const FILTROS_VAZIOS: FiltrosHistorico = {
  busca: "",
  status: "",
  tipo: "",
  dataInicio: "",
  dataFim: "",
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

  return data.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

function formatarDataCurta(
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

function formatarCodigo(
  prefixo: string,
  numeroSequencial: number
) {
  return `${prefixo}-${String(
    numeroSequencial
  ).padStart(6, "0")}`
}

function corStatusRegistro(
  status: string
) {
  const normalizado =
    status.toLocaleLowerCase(
      "pt-BR"
    )

  if (
    normalizado.includes("aprov") ||
    normalizado.includes("confirm") ||
    normalizado === "faturado" ||
    normalizado === "realizado" ||
    normalizado.includes("conclu")
  ) {
    return "bg-green-100 text-green-800"
  }

  if (
    normalizado.includes("cancel") ||
    normalizado.includes("recus")
  ) {
    return "bg-red-100 text-red-800"
  }

  if (
    normalizado.includes("venc") ||
    normalizado.includes("atras")
  ) {
    return "bg-orange-100 text-orange-800"
  }

  if (
    normalizado.includes("parcial")
  ) {
    return "bg-blue-100 text-blue-800"
  }

  return "bg-slate-100 text-slate-700"
}

function montarUrlHistorico(
  endpoint: string,
  representadaId: string,
  pagina: number,
  parametros: Record<string, string>
) {
  const searchParams =
    new URLSearchParams({
      representadaId,
      paginado: "1",
      page: String(pagina),
      limit: String(
        LIMITE_POR_SECAO
      ),
    })

  for (
    const [
      chave,
      valor,
    ] of Object.entries(
      parametros
    )
  ) {
    const texto =
      valor.trim()

    if (texto !== "") {
      searchParams.set(
        chave,
        texto
      )
    }
  }

  return `${endpoint}?${searchParams.toString()}`
}

function useHistoricoPaginado<T>({
  id,
  endpoint,
  pagina,
  parametros,
  refreshKey,
  mensagemErro,
}: {
  id: string | undefined
  endpoint: string
  pagina: number
  parametros: Record<string, string>
  refreshKey: number
  mensagemErro: string
}) {
  const [
    dados,
    setDados,
  ] =
    useState<T[]>([])

  const [
    paginacao,
    setPaginacao,
  ] =
    useState<Paginacao>(
      PAGINACAO_INICIAL
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  const assinaturaParametros =
    JSON.stringify(
      parametros
    )

  useEffect(() => {
    if (!id) {
      setDados([])
      setPaginacao(
        PAGINACAO_INICIAL
      )
      setLoading(false)
      return
    }

    const controller =
      new AbortController()

    const carregar =
      async () => {
        setLoading(true)
        setErro(null)

        try {
          const response =
            await fetch(
              montarUrlHistorico(
                endpoint,
                id,
                pagina,
                parametros
              ),
              {
                cache:
                  "no-store",
                signal:
                  controller.signal,
              }
            )

          if (!response.ok) {
            const erroApi =
              await response
                .json()
                .catch(
                  () => null
                )

            throw new Error(
              erroApi?.message ||
                mensagemErro
            )
          }

          const resposta =
            await response.json() as
              RespostaPaginada<T>

          if (
            !resposta ||
            !Array.isArray(
              resposta.dados
            ) ||
            !resposta.paginacao
          ) {
            throw new Error(
              mensagemErro
            )
          }

          setDados(
            resposta.dados
          )
          setPaginacao(
            resposta.paginacao
          )
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name ===
              "AbortError"
          ) {
            return
          }

          console.error(
            mensagemErro,
            error
          )

          setDados([])
          setPaginacao(
            PAGINACAO_INICIAL
          )
          setErro(
            error instanceof Error
              ? error.message
              : mensagemErro
          )
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setLoading(false)
          }
        }
      }

    carregar()

    return () => {
      controller.abort()
    }
  }, [
    id,
    endpoint,
    pagina,
    assinaturaParametros,
    refreshKey,
    mensagemErro,
  ])

  return {
    dados,
    paginacao,
    loading,
    erro,
  }
}

function BarraFiltrosComerciais({
  filtros,
  setFiltros,
  aplicar,
  limpar,
  statusOpcoes,
  tipoOpcoes,
  placeholderBusca,
}: {
  filtros: FiltrosHistorico
  setFiltros:
    Dispatch<
      SetStateAction<FiltrosHistorico>
    >
  aplicar: () => void
  limpar: () => void
  statusOpcoes: OpcaoFiltro[]
  tipoOpcoes?: OpcaoFiltro[]
  placeholderBusca: string
}) {
  return (
    <div className="mb-4 rounded-lg border bg-muted/20 p-3">
      <div
        className={`grid gap-3 md:grid-cols-2 ${
          tipoOpcoes
            ? "xl:grid-cols-6"
            : "xl:grid-cols-5"
        }`}
      >
        <div className="xl:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Buscar
          </label>

          <input
            value={
              filtros.busca
            }
            onChange={(
              event
            ) =>
              setFiltros(
                (
                  atual
                ) => ({
                  ...atual,
                  busca:
                    event.target.value,
                })
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                aplicar()
              }
            }}
            placeholder={
              placeholderBusca
            }
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status
          </label>

          <select
            value={
              filtros.status
            }
            onChange={(
              event
            ) =>
              setFiltros(
                (
                  atual
                ) => ({
                  ...atual,
                  status:
                    event.target.value,
                })
              )
            }
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">
              Todos
            </option>

            {statusOpcoes.map(
              (
                opcao
              ) => (
                <option
                  key={
                    opcao.valor
                  }
                  value={
                    opcao.valor
                  }
                >
                  {
                    opcao.rotulo
                  }
                </option>
              )
            )}
          </select>
        </div>

        {tipoOpcoes && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Tipo
            </label>

            <select
              value={
                filtros.tipo
              }
              onChange={(
                event
              ) =>
                setFiltros(
                  (
                    atual
                  ) => ({
                    ...atual,
                    tipo:
                      event.target.value,
                  })
                )
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">
                Todos
              </option>

              {tipoOpcoes.map(
                (
                  opcao
                ) => (
                  <option
                    key={
                      opcao.valor
                    }
                    value={
                      opcao.valor
                    }
                  >
                    {
                      opcao.rotulo
                    }
                  </option>
                )
              )}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            De
          </label>

          <input
            type="date"
            value={
              filtros.dataInicio
            }
            onChange={(
              event
            ) =>
              setFiltros(
                (
                  atual
                ) => ({
                  ...atual,
                  dataInicio:
                    event.target.value,
                })
              )
            }
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Até
          </label>

          <input
            type="date"
            value={
              filtros.dataFim
            }
            onChange={(
              event
            ) =>
              setFiltros(
                (
                  atual
                ) => ({
                  ...atual,
                  dataFim:
                    event.target.value,
                })
              )
            }
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          type="button"
          onClick={
            aplicar
          }
        >
          <Search className="mr-2 h-4 w-4" />
          Aplicar filtros
        </Button>

        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={
            limpar
          }
        >
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  )
}

function PaginacaoHistorico({
  paginacao,
  pagina,
  setPagina,
}: {
  paginacao: Paginacao
  pagina: number
  setPagina:
    Dispatch<
      SetStateAction<number>
    >
}) {
  if (
    paginacao.total ===
    0
  ) {
    return null
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Total:{" "}
        <strong className="text-foreground">
          {
            paginacao.total
          }
        </strong>
        {" "}registro
        {
          paginacao.total === 1
            ? ""
            : "s"
        }
        {" "}· Página{" "}
        {
          paginacao.pagina
        } de{" "}
        {
          paginacao.totalPaginas
        }
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={
            pagina <= 1
          }
          onClick={() =>
            setPagina(
              (
                atual
              ) =>
                Math.max(
                  1,
                  atual - 1
                )
            )
          }
        >
          Anterior
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={
            pagina >=
            paginacao.totalPaginas
          }
          onClick={() =>
            setPagina(
              (
                atual
              ) =>
                Math.min(
                  paginacao.totalPaginas,
                  atual + 1
                )
            )
          }
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}

const STATUS_ORCAMENTOS:
  OpcaoFiltro[] =
  [
    {
      valor: "Pendente",
      rotulo: "Pendente",
    },
    {
      valor: "Aprovado",
      rotulo: "Aprovado",
    },
    {
      valor: "Recusado",
      rotulo: "Recusado",
    },
    {
      valor: "Vencido",
      rotulo: "Vencido",
    },
  ]

const STATUS_VENDAS:
  OpcaoFiltro[] =
  [
    {
      valor: "Pendente",
      rotulo: "Pendente",
    },
    {
      valor:
        "Aguardando envio",
      rotulo:
        "Aguardando envio",
    },
    {
      valor:
        "Aguardando confirmação",
      rotulo:
        "Aguardando confirmação",
    },
    {
      valor: "Confirmado",
      rotulo: "Confirmado",
    },
    {
      valor:
        "Parcialmente faturado",
      rotulo:
        "Parcialmente faturado",
    },
    {
      valor: "Faturado",
      rotulo: "Faturado",
    },
    {
      valor: "Cancelado",
      rotulo: "Cancelado",
    },
  ]

const STATUS_TAREFAS:
  OpcaoFiltro[] =
  [
    {
      valor: "Pendente",
      rotulo: "Pendente",
    },
    {
      valor: "Concluida",
      rotulo: "Concluída",
    },
    {
      valor: "Cancelada",
      rotulo: "Cancelada",
    },
  ]

const TIPO_TAREFAS:
  OpcaoFiltro[] =
  [
    {
      valor: "Tarefa",
      rotulo: "Tarefa",
    },
    {
      valor: "Compromisso",
      rotulo: "Compromisso",
    },
  ]

const STATUS_FATURAMENTOS:
  OpcaoFiltro[] =
  [
    {
      valor: "Faturado",
      rotulo: "Faturado",
    },
  ]

function formatarValor(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "—"
  }

  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  )
}

function formatarPedidoMinimo(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "Não informado"
  }

  if (
    valor === 0
  ) {
    return "Sem pedido mínimo"
  }

  return formatarValor(
    valor
  )
}

function formatarMinimoParcela(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "Não informado"
  }

  if (
    valor === 0
  ) {
    return "Sem mínimo por parcela"
  }

  return formatarValor(
    valor
  )
}

function regraEstaVigente(
  regra: RegraComercial
) {
  if (
    !regra.ativa
  ) {
    return false
  }

  const agora =
    new Date()

  const inicio =
    new Date(
      regra.vigenciaInicio
    )

  if (
    Number.isNaN(
      inicio.getTime()
    )
  ) {
    return false
  }

  if (
    inicio > agora
  ) {
    return false
  }

  if (
    regra.vigenciaFim
  ) {
    const fim =
      new Date(
        regra.vigenciaFim
      )

    if (
      !Number.isNaN(
        fim.getTime()
      )
    ) {
      fim.setHours(
        23,
        59,
        59,
        999
      )

      if (
        fim < agora
      ) {
        return false
      }
    }
  }

  return true
}

function formatarComissaoRegra(
  regra: RegraComercial
) {
  if (
    regra.tipoComissao ===
    "fixa"
  ) {
    if (
      regra.percentualComissao ===
      null
    ) {
      return "Não informada"
    }

    return `${regra.percentualComissao.toLocaleString(
      "pt-BR",
      {
        maximumFractionDigits: 4,
      }
    )}%`
  }

  if (
    regra.tipoComissao ===
    "variada"
  ) {
    return "Comissão variável por faixas"
  }

  return "Não informada"
}

function formatarComissaoRepresentada(
  representada: Representada
) {
  if (
    representada.tipoComissao ===
    "variada"
  ) {
    return "Comissão variável por faixas"
  }

  if (
    representada.comissao ===
    null
  ) {
    return "Não informada"
  }

  return `${representada.comissao.toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 4,
    }
  )}%`
}

function foiEditada(
  criadoEm: string,
  atualizadoEm: string
) {
  const criado =
    new Date(
      criadoEm
    ).getTime()

  const atualizado =
    new Date(
      atualizadoEm
    ).getTime()

  if (
    Number.isNaN(criado) ||
    Number.isNaN(atualizado)
  ) {
    return false
  }

  return (
    atualizado - criado >
    2000
  )
}

function corTipo(
  tipo: string
) {
  switch (tipo) {
    case "WhatsApp":
      return "bg-green-100 text-green-800"

    case "E-mail":
      return "bg-blue-100 text-blue-800"

    case "Visita":
      return "bg-orange-100 text-orange-800"

    case "Ligação":
      return "bg-purple-100 text-purple-800"

    default:
      return "bg-gray-100 text-gray-800"
  }
}

function corStatusFollowUp(
  status: string
) {
  switch (status) {
    case "Aberto":
      return "bg-amber-100 text-amber-800"

    case "Em acompanhamento":
      return "bg-blue-100 text-blue-800"

    case "Finalizado":
      return "bg-green-100 text-green-800"

    case "Sem acompanhamento":
      return "bg-gray-100 text-gray-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function RepresentadaPage() {
  const params =
    useParams()

  const router =
    useRouter()

  const id =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id

  const [
    representada,
    setRepresentada,
  ] =
    useState<Representada | null>(
      null
    )

  const [
    regrasComerciais,
    setRegrasComerciais,
  ] =
    useState<RegraComercial[]>(
      []
    )

  const [
    interacoes,
    setInteracoes,
  ] =
    useState<Interacao[]>(
      []
    )

  const [
    metas,
    setMetas,
  ] =
    useState<MetaRepresentada[]>(
      []
    )

  const [
    anoMetas,
    setAnoMetas,
  ] =
    useState(
      String(
        new Date().getFullYear()
      )
    )

  const [
    loadingMetas,
    setLoadingMetas,
  ] =
    useState(true)

  const [
    erroMetas,
    setErroMetas,
  ] =
    useState<
      string | null
    >(null)

  const [
    mostrarFormularioMeta,
    setMostrarFormularioMeta,
  ] =
    useState(false)

  const [
    editandoMetaId,
    setEditandoMetaId,
  ] =
    useState<
      string | null
    >(null)

  const [
    salvandoMeta,
    setSalvandoMeta,
  ] =
    useState(false)

  const [
    formularioMeta,
    setFormularioMeta,
  ] =
    useState<FormularioMetaRepresentada>(
      formularioMetaVazio(
        String(
          new Date().getFullYear()
        )
      )
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    loadingRegras,
    setLoadingRegras,
  ] =
    useState(true)

  const [
    loadingInteracoes,
    setLoadingInteracoes,
  ] =
    useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  const [
    erroRegras,
    setErroRegras,
  ] =
    useState<
      string | null
    >(null)

  const [
    erroInteracoes,
    setErroInteracoes,
  ] =
    useState<
      string | null
    >(null)

  const [
    excluindo,
    setExcluindo,
  ] =
    useState(false)

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] =
    useState(false)

  const [
    buscaCliente,
    setBuscaCliente,
  ] =
    useState("")

  const [
    clientesCompras,
    setClientesCompras,
  ] =
    useState<ClienteCompra[]>(
      []
    )

  const [
    totalClientesCompras,
    setTotalClientesCompras,
  ] =
    useState(0)

  const [
    loadingClientesCompras,
    setLoadingClientesCompras,
  ] =
    useState(false)

  const [
    erroClientesCompras,
    setErroClientesCompras,
  ] =
    useState<
      string | null
    >(null)

  const [
    buscaClientesExecutada,
    setBuscaClientesExecutada,
  ] =
    useState(false)

  const [
    refreshHistoricoComercial,
    setRefreshHistoricoComercial,
  ] =
    useState(0)

  const [
    paginaOrcamentos,
    setPaginaOrcamentos,
  ] =
    useState(1)

  const [
    paginaVendas,
    setPaginaVendas,
  ] =
    useState(1)

  const [
    filtrosOrcamentos,
    setFiltrosOrcamentos,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosOrcamentosAplicados,
    setFiltrosOrcamentosAplicados,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosVendas,
    setFiltrosVendas,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosVendasAplicados,
    setFiltrosVendasAplicados,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    paginaTarefas,
    setPaginaTarefas,
  ] =
    useState(1)

  const [
    paginaFaturamentos,
    setPaginaFaturamentos,
  ] =
    useState(1)

  const [
    filtrosTarefas,
    setFiltrosTarefas,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosTarefasAplicados,
    setFiltrosTarefasAplicados,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosFaturamentos,
    setFiltrosFaturamentos,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosFaturamentosAplicados,
    setFiltrosFaturamentosAplicados,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  useEffect(() => {
    async function carregar() {
      try {
        setErro(null)

        if (!id) {
          setErro(
            "ID da representada não encontrado."
          )

          return
        }

        const response =
          await fetch(
            `/api/representadas/${id}`,
            {
              cache:
                "no-store",
            }
          )

        if (
          !response.ok
        ) {
          if (
            response.status ===
            404
          ) {
            setErro(
              "Representada não encontrada."
            )
          } else {
            setErro(
              "Erro ao carregar representada."
            )
          }

          return
        }

        const data:
          Representada =
          await response.json()

        setRepresentada(
          data
        )
      } catch (error) {
        console.error(
          "Erro ao carregar representada:",
          error
        )

        setErro(
          "Erro ao carregar os dados."
        )
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  const carregarRegrasComerciais =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (!id) {
          setRegrasComerciais(
            []
          )

          setLoadingRegras(
            false
          )

          return
        }

        if (
          !silencioso
        ) {
          setLoadingRegras(
            true
          )
        }

        setErroRegras(
          null
        )

        try {
          const response =
            await fetch(
              `/api/representadas/${id}/regras-comerciais`,
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Falha ao carregar regras comerciais."
            )
          }

          const data =
            await response.json()

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Resposta inválida da API."
            )
          }

          setRegrasComerciais(
            data
          )
        } catch (error) {
          console.error(
            "Erro ao carregar regras comerciais:",
            error
          )

          setErroRegras(
            "Não foi possível carregar as regras comerciais desta representada."
          )
        } finally {
          if (
            !silencioso
          ) {
            setLoadingRegras(
              false
            )
          }
        }
      },
      [id]
    )

  useEffect(() => {
    carregarRegrasComerciais()
  }, [
    carregarRegrasComerciais,
  ])

  const carregarMetas =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (!id) {
          setMetas(
            []
          )

          setLoadingMetas(
            false
          )

          return
        }

        const ano =
          Number.parseInt(
            anoMetas,
            10
          )

        if (
          !Number.isInteger(
            ano
          ) ||
          ano < 2000 ||
          ano > 2100
        ) {
          setMetas(
            []
          )

          setErroMetas(
            "Informe um ano válido entre 2000 e 2100."
          )

          setLoadingMetas(
            false
          )

          return
        }

        if (
          !silencioso
        ) {
          setLoadingMetas(
            true
          )
        }

        setErroMetas(
          null
        )

        try {
          const response =
            await fetch(
              `/api/representadas/${id}/metas?ano=${encodeURIComponent(
                String(
                  ano
                )
              )}&tipo=Vendas`,
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

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Não foi possível carregar as metas desta Representada."
            )
          }

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Resposta inválida da API de metas."
            )
          }

          setMetas(
            data
          )
        } catch (error) {
          console.error(
            "Erro ao carregar metas da Representada:",
            error
          )

          setMetas(
            []
          )

          setErroMetas(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as metas desta Representada."
          )
        } finally {
          if (
            !silencioso
          ) {
            setLoadingMetas(
              false
            )
          }
        }
      },
      [
        id,
        anoMetas,
      ]
    )

  useEffect(() => {
    carregarMetas()
  }, [
    carregarMetas,
  ])

  const carregarInteracoes =
    useCallback(
      async (
        silencioso =
          false
      ) => {
        if (!id) {
          setInteracoes(
            []
          )

          setLoadingInteracoes(
            false
          )

          return
        }

        if (
          !silencioso
        ) {
          setLoadingInteracoes(
            true
          )
        }

        setErroInteracoes(
          null
        )

        try {
          const response =
            await fetch(
              `/api/interacoes?representadaId=${encodeURIComponent(
                id
              )}`,
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Falha ao carregar interações."
            )
          }

          const data =
            await response.json()

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Resposta inválida da API."
            )
          }

          setInteracoes(
            data
          )
        } catch (error) {
          console.error(
            "Erro ao carregar interações:",
            error
          )

          setErroInteracoes(
            "Não foi possível carregar as interações desta representada."
          )
        } finally {
          if (
            !silencioso
          ) {
            setLoadingInteracoes(
              false
            )
          }
        }
      },
      [id]
    )

  useEffect(() => {
    carregarInteracoes()
  }, [
    carregarInteracoes,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarInteracoes(
            true
          )
        },
        15000
      )

    return () => {
      window.clearInterval(
        intervalo
      )
    }
  }, [
    carregarInteracoes,
  ])

  const historicoOrcamentos =
    useHistoricoPaginado<OrcamentoRepresentada>({
      id,
      endpoint:
        "/api/orcamentos",
      pagina:
        paginaOrcamentos,
      parametros: {
        busca:
          filtrosOrcamentosAplicados.busca,
        status:
          filtrosOrcamentosAplicados.status,
        dataInicio:
          filtrosOrcamentosAplicados.dataInicio,
        dataFim:
          filtrosOrcamentosAplicados.dataFim,
      },
      refreshKey:
        refreshHistoricoComercial,
      mensagemErro:
        "Não foi possível carregar os Orçamentos desta Representada.",
    })

  const historicoVendas =
    useHistoricoPaginado<VendaRepresentada>({
      id,
      endpoint:
        "/api/vendas",
      pagina:
        paginaVendas,
      parametros: {
        busca:
          filtrosVendasAplicados.busca,
        status:
          filtrosVendasAplicados.status,
        dataInicio:
          filtrosVendasAplicados.dataInicio,
        dataFim:
          filtrosVendasAplicados.dataFim,
      },
      refreshKey:
        refreshHistoricoComercial,
      mensagemErro:
        "Não foi possível carregar as Vendas desta Representada.",
    })

  const historicoTarefas =
    useHistoricoPaginado<TarefaRepresentada>({
      id,
      endpoint:
        "/api/tarefas",
      pagina:
        paginaTarefas,
      parametros: {
        busca:
          filtrosTarefasAplicados.busca,
        status:
          filtrosTarefasAplicados.status,
        tipo:
          filtrosTarefasAplicados.tipo,
        dataInicio:
          filtrosTarefasAplicados.dataInicio,
        dataFim:
          filtrosTarefasAplicados.dataFim,
      },
      refreshKey:
        refreshHistoricoComercial,
      mensagemErro:
        "Não foi possível carregar a Agenda desta Representada.",
    })

  const historicoFaturamentos =
    useHistoricoPaginado<FaturamentoRepresentada>({
      id,
      endpoint:
        "/api/faturamentos",
      pagina:
        paginaFaturamentos,
      parametros: {
        busca:
          filtrosFaturamentosAplicados.busca,
        status:
          filtrosFaturamentosAplicados.status,
        dataInicio:
          filtrosFaturamentosAplicados.dataInicio,
        dataFim:
          filtrosFaturamentosAplicados.dataFim,
      },
      refreshKey:
        refreshHistoricoComercial,
      mensagemErro:
        "Não foi possível carregar os Faturamentos desta Representada.",
    })

  function limparOrcamentos() {
    const vazio = {
      ...FILTROS_VAZIOS,
    }

    setFiltrosOrcamentos(
      vazio
    )
    setFiltrosOrcamentosAplicados(
      vazio
    )
    setPaginaOrcamentos(
      1
    )
  }

  function limparVendas() {
    const vazio = {
      ...FILTROS_VAZIOS,
    }

    setFiltrosVendas(
      vazio
    )
    setFiltrosVendasAplicados(
      vazio
    )
    setPaginaVendas(
      1
    )
  }

  function limparTarefas() {
    const vazio = {
      ...FILTROS_VAZIOS,
    }

    setFiltrosTarefas(
      vazio
    )
    setFiltrosTarefasAplicados(
      vazio
    )
    setPaginaTarefas(
      1
    )
  }

  function limparFaturamentos() {
    const vazio = {
      ...FILTROS_VAZIOS,
    }

    setFiltrosFaturamentos(
      vazio
    )
    setFiltrosFaturamentosAplicados(
      vazio
    )
    setPaginaFaturamentos(
      1
    )
  }

  function rolarPara(
    idSecao: string
  ) {
    document
      .getElementById(
        idSecao
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
  }

  const executarBuscaClientes =
    useCallback(
      async (
        termoBusca: string,
        signal?: AbortSignal
      ) => {
        const termo =
          termoBusca.trim()

        if (
          !id ||
          termo.length < 2
        ) {
          setClientesCompras(
            []
          )
          setTotalClientesCompras(
            0
          )
          setErroClientesCompras(
            null
          )
          setBuscaClientesExecutada(
            false
          )
          setLoadingClientesCompras(
            false
          )
          return
        }

        try {
          setLoadingClientesCompras(
            true
          )
          setErroClientesCompras(
            null
          )

          const response =
            await fetch(
              `/api/representadas/${id}/clientes-compras?busca=${encodeURIComponent(
                termo
              )}`,
              {
                cache:
                  "no-store",
                signal,
              }
            )

          const data =
            await response
              .json()
              .catch(
                () => null
              )

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Não foi possível buscar os Clientes desta Representada."
            )
          }

          if (
            !data ||
            !Array.isArray(
              data.clientes
            ) ||
            typeof data.total !==
              "number"
          ) {
            throw new Error(
              "Resposta inválida da busca de Clientes."
            )
          }

          if (
            signal?.aborted
          ) {
            return
          }

          const resposta =
            data as RespostaClientesCompras

          setClientesCompras(
            resposta.clientes
          )
          setTotalClientesCompras(
            resposta.total
          )
          setBuscaClientesExecutada(
            true
          )
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name ===
              "AbortError"
          ) {
            return
          }

          console.error(
            "Erro ao buscar Clientes da Representada:",
            error
          )

          setClientesCompras(
            []
          )
          setTotalClientesCompras(
            0
          )
          setBuscaClientesExecutada(
            true
          )

          setErroClientesCompras(
            error instanceof Error
              ? error.message
              : "Não foi possível buscar os Clientes desta Representada."
          )
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoadingClientesCompras(
              false
            )
          }
        }
      },
      [id]
    )

  useEffect(() => {
    const termo =
      buscaCliente.trim()

    if (
      !id ||
      termo.length < 2
    ) {
      setClientesCompras(
        []
      )
      setTotalClientesCompras(
        0
      )
      setErroClientesCompras(
        null
      )
      setBuscaClientesExecutada(
        false
      )
      setLoadingClientesCompras(
        false
      )
      return
    }

    setClientesCompras(
      []
    )
    setTotalClientesCompras(
      0
    )
    setErroClientesCompras(
      null
    )
    setBuscaClientesExecutada(
      false
    )
    setLoadingClientesCompras(
      false
    )

    const controller =
      new AbortController()

    const temporizador =
      window.setTimeout(
        () => {
          executarBuscaClientes(
            termo,
            controller.signal
          )
        },
        350
      )

    return () => {
      window.clearTimeout(
        temporizador
      )

      controller.abort()
    }
  }, [
    buscaCliente,
    executarBuscaClientes,
    id,
  ])

  async function buscarClientesCompras() {
    const termo =
      buscaCliente.trim()

    if (
      termo.length < 2
    ) {
      return
    }

    await executarBuscaClientes(
      termo
    )
  }

  function limparBuscaClientes() {
    setBuscaCliente(
      ""
    )
    setClientesCompras(
      []
    )
    setTotalClientesCompras(
      0
    )
    setErroClientesCompras(
      null
    )
    setBuscaClientesExecutada(
      false
    )
    setLoadingClientesCompras(
      false
    )
  }

  function abrirNovaMeta(
    mes?: number
  ) {
    const anoFormulario =
      /^\d{4}$/.test(
        anoMetas
      )
        ? anoMetas
        : String(
            new Date().getFullYear()
          )

    setEditandoMetaId(
      null
    )

    setFormularioMeta(
      formularioMetaVazio(
        anoFormulario,
        mes
          ? String(
              mes
            )
          : ""
      )
    )

    setMostrarFormularioMeta(
      true
    )
  }

  function abrirEdicaoMeta(
    meta: MetaRepresentada
  ) {
    setEditandoMetaId(
      meta.id
    )

    setFormularioMeta({
      ano:
        String(
          meta.ano
        ),

      mes:
        String(
          meta.mes
        ),

      valorMeta:
        meta.valorMeta.toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits:
              2,
            maximumFractionDigits:
              2,
          }
        ),

      fonte:
        meta.fonte ||
        "",

      referencia:
        meta.referencia ||
        "",

      observacoes:
        meta.observacoes ||
        "",
    })

    setMostrarFormularioMeta(
      true
    )
  }

  function cancelarFormularioMeta() {
    setMostrarFormularioMeta(
      false
    )

    setEditandoMetaId(
      null
    )

    setFormularioMeta(
      formularioMetaVazio(
        anoMetas
      )
    )
  }

  async function salvarMeta() {
    if (
      !id ||
      salvandoMeta
    ) {
      return
    }

    const ano =
      Number.parseInt(
        formularioMeta.ano,
        10
      )

    const mes =
      Number.parseInt(
        formularioMeta.mes,
        10
      )

    if (
      !Number.isInteger(
        ano
      ) ||
      ano < 2000 ||
      ano > 2100
    ) {
      alert(
        "Informe um ano válido entre 2000 e 2100."
      )

      return
    }

    if (
      !Number.isInteger(
        mes
      ) ||
      mes < 1 ||
      mes > 12
    ) {
      alert(
        "Selecione o mês da meta."
      )

      return
    }

    if (
      !formularioMeta.valorMeta.trim()
    ) {
      alert(
        "Informe o valor da meta de Vendas."
      )

      return
    }

    try {
      setSalvandoMeta(
        true
      )

      const response =
        await fetch(
          `/api/representadas/${id}/metas`,
          {
            method:
              editandoMetaId
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...(editandoMetaId
                  ? {
                      metaId:
                        editandoMetaId,
                    }
                  : {}),

                tipo:
                  "Vendas",

                ano,

                mes,

                valorMeta:
                  formularioMeta.valorMeta,

                fonte:
                  formularioMeta.fonte,

                referencia:
                  formularioMeta.referencia,

                observacoes:
                  formularioMeta.observacoes,
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ||
            "Não foi possível salvar a meta."
        )
      }

      setMostrarFormularioMeta(
        false
      )

      setEditandoMetaId(
        null
      )

      setFormularioMeta(
        formularioMetaVazio(
          String(
            ano
          )
        )
      )

      if (
        String(
          ano
        ) !==
        anoMetas
      ) {
        setAnoMetas(
          String(
            ano
          )
        )
      } else {
        await carregarMetas()
      }

      alert(
        editandoMetaId
          ? "Meta atualizada com sucesso."
          : "Meta cadastrada com sucesso."
      )
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a meta."

      alert(
        mensagem
      )
    } finally {
      setSalvandoMeta(
        false
      )
    }
  }

  async function alterarSituacaoMeta(
    meta: MetaRepresentada
  ) {
    if (
      !id ||
      salvandoMeta
    ) {
      return
    }

    const novaSituacao =
      !meta.ativa

    if (
      meta.ativa &&
      !window.confirm(
        `Deseja inativar a meta de ${MESES[meta.mes - 1]}/${meta.ano}? O histórico será preservado.`
      )
    ) {
      return
    }

    try {
      setSalvandoMeta(
        true
      )

      const response =
        await fetch(
          `/api/representadas/${id}/metas`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                metaId:
                  meta.id,

                ativa:
                  novaSituacao,
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => null
          )

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ||
            "Não foi possível alterar a situação da meta."
        )
      }

      await carregarMetas()

      alert(
        novaSituacao
          ? "Meta reativada com sucesso."
          : "Meta inativada com sucesso."
      )
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a situação da meta."

      alert(
        mensagem
      )
    } finally {
      setSalvandoMeta(
        false
      )
    }
  }

  function obterFaixas():
    Faixa[] {
    if (
      !representada
        ?.faixasComissao
    ) {
      return []
    }

    try {
      const parsed =
        JSON.parse(
          representada.faixasComissao
        )

      return Array.isArray(
        parsed
      )
        ? parsed
        : []
    } catch {
      return []
    }
  }

  async function excluirRepresentada() {
    setMostrarConfirmacao(
      false
    )

    try {
      setExcluindo(
        true
      )

      const response =
        await fetch(
          `/api/representadas/${id}`,
          {
            method:
              "DELETE",
          }
        )

      if (
        !response.ok
      ) {
        let mensagem =
          "Erro ao excluir representada."

        try {
          const dados =
            await response.json()

          if (
            typeof dados.message ===
            "string"
          ) {
            mensagem =
              dados.message
          }
        } catch {
          // mantém mensagem padrão
        }

        throw new Error(
          mensagem
        )
      }

      alert(
        "Representada excluída com sucesso."
      )

      router.push(
        "/representadas"
      )
    } catch (error) {
      const mensagem =
        error instanceof
        Error
          ? error.message
          : "Erro ao excluir representada."

      alert(mensagem)
    } finally {
      setExcluindo(
        false
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />

          <p>
            Carregando representada...
          </p>
        </div>
      </div>
    )
  }

  if (
    erro ||
    !representada
  ) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-red-600" />

            <div className="flex-1">
              <p className="font-semibold text-red-900">
                {erro ||
                  "Representada não encontrada."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  "/representadas"
                )
              }
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const faixas =
    obterFaixas()

  const metasAtivas =
    metas.filter(
      (
        meta
      ) =>
        meta.ativa
    )

  const totalMetasAno =
    metasAtivas.reduce(
      (
        total,
        meta
      ) =>
        total +
        Number(
          meta.valorMeta
        ),
      0
    )

  const anoAtual =
    new Date().getFullYear()

  const mesAtual =
    new Date().getMonth() +
    1

  const metaMesAtual =
    Number(
      anoMetas
    ) ===
      anoAtual
      ? metasAtivas.find(
          (
            meta
          ) =>
            meta.mes ===
            mesAtual
        ) ||
        null
      : null

  const regraPadraoVigente =
    regrasComerciais.find(
      (
        regra
      ) =>
        regra.tipoEscopo ===
          "Padrao" &&
        regraEstaVigente(
          regra
        )
    ) ||
    null

  const regrasEspecificasAtivas =
    regrasComerciais.filter(
      (
        regra
      ) =>
        regra.tipoEscopo !==
          "Padrao" &&
        regraEstaVigente(
          regra
        )
    ).length

  const possuiCondicoesComerciaisCadastro =
    representada.comissao !==
      null ||
    representada.tipoComissao ===
      "variada" ||
    representada.pedidoMinimo !==
      null ||
    representada.minimoParcela !==
      null ||
    Boolean(
      representada.politicaFrete
    ) ||
    Boolean(
      representada.regiaoAtendimento
    ) ||
    representada.prazoEntregaDias !==
      null ||
    representada.prazoFaturamentoDias !==
      null ||
    Boolean(
      representada.regraReconhecimentoComissao
    ) ||
    Boolean(
      representada.fechamentoComissao
    ) ||
    Boolean(
      representada.pagamentoComissao
    )

  const blocoRegrasComerciais = (
    <div
      id="representada-regras"
      className="mt-4 border-t pt-4"
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ListChecks className="h-4 w-4" />
            Regras Comerciais
          </h3>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Condições comerciais desta Representada.
          </p>
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-[11px]"
            onClick={() =>
              carregarRegrasComerciais()
            }
            disabled={loadingRegras}
          >
            <RefreshCw
              className={`mr-1 h-3.5 w-3.5 ${
                loadingRegras
                  ? "animate-spin"
                  : ""
              }`}
            />
            Atualizar
          </Button>

          <Button
            size="sm"
            className="h-7 px-2.5 text-[11px]"
            onClick={() =>
              router.push(
                `/representadas/${id}/regras-comerciais`
              )
            }
          >
            <ListChecks className="mr-1 h-3.5 w-3.5" />
            Gerenciar
          </Button>
        </div>
      </div>

      {loadingRegras ? (
        <div className="flex items-center justify-center gap-2 py-5 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando regras comerciais...
        </div>
      ) : erroRegras ? (
        <div className="flex flex-col items-center gap-2 py-5">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />

            {
              erroRegras
            }
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              carregarRegrasComerciais()
            }
          >
            Tentar novamente
          </Button>
        </div>
      ) : regraPadraoVigente ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Regra comercial padrão ativa e vigente
              </p>

              <p className="mt-0.5 text-base font-semibold text-emerald-950">
                {
                  regraPadraoVigente.nome
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                Ativa
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {
                  regraPadraoVigente._count.vendas
                }{" "}
                venda
                {regraPadraoVigente._count.vendas ===
                1
                  ? ""
                  : "s"}
              </span>
            </div>
          </div>

          <div className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Vigência
              </p>

              <p className="font-medium">
                {formatarDataCurta(
                  regraPadraoVigente.vigenciaInicio
                )}{" "}
                até{" "}
                {regraPadraoVigente.vigenciaFim
                  ? formatarDataCurta(
                      regraPadraoVigente.vigenciaFim
                    )
                  : "sem data final"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Pedido mínimo
              </p>

              <p className="font-medium">
                {formatarPedidoMinimo(
                  regraPadraoVigente.pedidoMinimo
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Mínimo por parcela
              </p>

              <p className="font-medium">
                {formatarMinimoParcela(
                  regraPadraoVigente.minimoParcela
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Comissão
              </p>

              <p className="font-medium">
                {formatarComissaoRegra(
                  regraPadraoVigente
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Prazo de entrega
              </p>

              <p className="font-medium">
                {regraPadraoVigente.prazoEntregaDias !==
                null
                  ? `${regraPadraoVigente.prazoEntregaDias} dia(s)`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Prazo de faturamento
              </p>

              <p className="font-medium">
                {regraPadraoVigente.prazoFaturamentoDias !==
                null
                  ? `${regraPadraoVigente.prazoFaturamentoDias} dia(s)`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Frete
              </p>

              <p className="font-medium">
                {regraPadraoVigente.frete ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Região
              </p>

              <p className="font-medium">
                {regraPadraoVigente.regiao ||
                  "—"}
              </p>
            </div>
          </div>

          {regraPadraoVigente.observacoes && (
            <div className="rounded-md bg-muted/40 p-2.5">
              <p className="text-xs font-medium">
                Observações da regra
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm">
                {
                  regraPadraoVigente.observacoes
                }
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Regras específicas de clientes ativas e vigentes:{" "}
              <span className="font-semibold text-foreground">
                {
                  regrasEspecificasAtivas
                }
              </span>
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/representadas/${id}/regras-comerciais`
                )
              }
            >
              Ver histórico completo
            </Button>
          </div>
        </div>
      ) : possuiCondicoesComerciaisCadastro ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Condições comerciais já cadastradas
            </p>

            <p className="mt-0.5 text-sm font-semibold text-amber-950">
              Os dados abaixo estão salvos no cadastro principal da Representada.
            </p>

            <p className="mt-0.5 text-xs text-amber-800">
              Ainda não existe uma regra comercial versionada ativa. No próximo passo estes dados serão reaproveitados automaticamente em “Gerenciar Regras”, evitando nova digitação.
            </p>
          </div>

          <div className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Pedido mínimo
              </p>

              <p className="font-medium">
                {formatarPedidoMinimo(
                  representada.pedidoMinimo
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Mínimo por parcela
              </p>

              <p className="font-medium">
                {formatarMinimoParcela(
                  representada.minimoParcela
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Comissão
              </p>

              <p className="font-medium">
                {formatarComissaoRepresentada(
                  representada
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Comissão calculada sobre
              </p>

              <p className="font-medium">
                {representada.regraReconhecimentoComissao ||
                  "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Prazo de entrega
              </p>

              <p className="font-medium">
                {representada.prazoEntregaDias !==
                null
                  ? `${representada.prazoEntregaDias} dia(s)`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Prazo de faturamento
              </p>

              <p className="font-medium">
                {representada.prazoFaturamentoDias !==
                null
                  ? `${representada.prazoFaturamentoDias} dia(s)`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Frete
              </p>

              <p className="font-medium">
                {representada.politicaFrete ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Região
              </p>

              <p className="font-medium">
                {representada.regiaoAtendimento ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Fechamento da comissão
              </p>

              <p className="font-medium">
                {representada.fechamentoComissao
                  ? `Dia ${representada.fechamentoComissao}`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Pagamento da comissão
              </p>

              <p className="font-medium">
                {representada.pagamentoComissao
                  ? `Dia ${representada.pagamentoComissao}`
                  : "—"}
              </p>
            </div>
          </div>

          {regrasComerciais.length >
            0 && (
            <p className="border-t pt-2 text-xs text-muted-foreground">
              Existem{" "}
              <span className="font-semibold text-foreground">
                {
                  regrasComerciais.length
                }
              </span>{" "}
              regra(s) no histórico, mas nenhuma regra padrão está ativa e vigente neste momento.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/representadas/${id}/regras-comerciais`
                )
              }
            >
              <ListChecks className="mr-2 h-4 w-4" />

              Gerenciar e versionar regras
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-5 text-center text-muted-foreground">
          <ListChecks className="h-8 w-8" />

          <div>
            <p className="font-medium text-foreground">
              Nenhuma condição comercial encontrada.
            </p>

            <p className="mt-1 text-sm">
              Não existem condições comerciais no cadastro principal nem regra padrão ativa e vigente.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/representadas/${id}/regras-comerciais`
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Abrir Regras Comerciais
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1500px] space-y-4 p-4 lg:p-5">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 px-3 text-xs"
                onClick={() =>
                  router.push(
                    "/representadas"
                  )
                }
                disabled={
                  excluindo
                }
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Voltar
              </Button>

              <div className="min-w-0 flex-1">
                <h1
                  className="truncate whitespace-nowrap text-base font-semibold leading-tight text-slate-900 xl:text-lg"
                  title={representada.nome}
                >
                  {representada.nome}
                </h1>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      representada.status === "Ativa"
                        ? "bg-emerald-100 text-emerald-800"
                        : representada.status === "Em configuração"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {representada.status}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      loadingRegras
                        ? "bg-slate-100 text-slate-600"
                        : regraPadraoVigente
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {loadingRegras
                      ? "Verificando política"
                      : regraPadraoVigente
                        ? "Apta para operar"
                        : "Política pendente"}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                  <span>
                    Código:{" "}
                    {representada.codigo || "-"}
                  </span>

                  <span>
                    CNPJ:{" "}
                    {representada.cnpj || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 xl:flex xl:flex-nowrap xl:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() =>
                  router.push(
                    "/interacoes/nova"
                  )
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Interação
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() =>
                  router.push(
                    `/representadas/${id}/contratos`
                  )
                }
              >
                <FileText className="mr-1 h-3.5 w-3.5" />
                Contratos
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() =>
                  router.push(
                    `/representadas/${id}/regras-comerciais`
                  )
                }
              >
                <ListChecks className="mr-1 h-3.5 w-3.5" />
                Regras
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() =>
                  router.push(
                    `/representadas/${id}/contas-recebimento`
                  )
                }
              >
                <Landmark className="mr-1 h-3.5 w-3.5" />
                Contas
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={() =>
                  router.push(
                    `/representadas/${id}/editar`
                  )
                }
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Editar
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                disabled={
                  excluindo
                }
                onClick={() =>
                  setMostrarConfirmacao(
                    true
                  )
                }
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        </div>

        {mostrarConfirmacao && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  Excluir Representada
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>
                  Tem certeza que deseja excluir{" "}
                  <strong>
                    {
                      representada.nome
                    }
                  </strong>
                  ?
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setMostrarConfirmacao(
                        false
                      )
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={
                      excluirRepresentada
                    }
                  >
                    Confirmar exclusão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-blue-300 bg-blue-100/70 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">
                  Resumo 360
                </CardTitle>

                <p className="mt-0.5 text-xs text-slate-600">
                  Indicadores rápidos desta Representada. Clique em um bloco para abrir a seção correspondente.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white/80 px-3 text-xs"
                onClick={() => {
                  setRefreshHistoricoComercial(
                    (
                      atual
                    ) =>
                      atual + 1
                  )

                  carregarMetas(
                    true
                  )
                }}
                disabled={
                  historicoOrcamentos.loading ||
                  historicoVendas.loading ||
                  historicoTarefas.loading ||
                  historicoFaturamentos.loading ||
                  loadingMetas
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    historicoOrcamentos.loading ||
                    historicoVendas.loading ||
                    historicoTarefas.loading ||
                    historicoFaturamentos.loading ||
                    loadingMetas
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Atualizar 360
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pb-4 pt-0">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-interacoes"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Interações
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    loadingInteracoes
                      ? "…"
                      : interacoes.length
                  }
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-orcamentos"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Orçamentos
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    historicoOrcamentos.loading
                      ? "…"
                      : historicoOrcamentos.paginacao.total
                  }
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-vendas"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Vendas
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    historicoVendas.loading
                      ? "…"
                      : historicoVendas.paginacao.total
                  }
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-agenda"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Agenda
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    historicoTarefas.loading
                      ? "…"
                      : historicoTarefas.paginacao.total
                  }
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-metas"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Meta do mês
                </p>

                <p className="mt-0.5 text-base font-bold leading-tight text-slate-900">
                  {loadingMetas
                    ? "…"
                    : Number(anoMetas) === anoAtual
                      ? metaMesAtual
                        ? formatarValor(
                            Number(
                              metaMesAtual.valorMeta
                            )
                          )
                        : "Sem meta"
                      : "Ver metas"}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {loadingMetas
                    ? ""
                    : `${metasAtivas.length}/12 meses com meta ativa`}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  rolarPara(
                    "representada-faturamentos"
                  )
                }
                className="group rounded-md border border-blue-100 bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-200/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Faturamentos
                </p>

                <p className="mt-0.5 text-xl font-bold text-slate-900">
                  {
                    historicoFaturamentos.loading
                      ? "…"
                      : historicoFaturamentos.paginacao.total
                  }
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Representada
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">
                    Nome
                  </p>

                  <p className="font-medium">
                    {
                      representada.nome
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    CNPJ
                  </p>

                  <p className="font-medium">
                    {representada.cnpj ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="font-medium">
                    {
                      representada.status
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Fechamento da comissão
                  </p>

                  <p className="font-medium">
                    {representada.fechamentoComissao
                      ? `Dia ${representada.fechamentoComissao}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pagamento da comissão
                  </p>

                  <p className="font-medium">
                    {representada.pagamentoComissao
                      ? `Dia ${representada.pagamentoComissao}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Banco Pagador
                  </p>

                  <p className="font-medium">
                    {representada.bancoComissao ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-sm font-semibold">
                  Comissão
                </h3>

                <div className="mb-3 rounded-lg border bg-blue-50 p-3">
                  <p className="text-sm text-slate-500">
                    Base para cálculo da comissão
                  </p>

                  <p className="text-base font-semibold text-slate-900">
                    {representada.regraReconhecimentoComissao ||
                      "Não informada"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {representada.regraReconhecimentoComissao ===
                    "Liquidez"
                      ? "A comissão é calculada conforme o pagamento do cliente."
                      : representada.regraReconhecimentoComissao ===
                        "Faturamento"
                      ? "A comissão é calculada a partir do faturamento da venda."
                      : "Edite o cadastro da Representada para definir Faturamento ou Liquidez."}
                  </p>
                </div>

                {representada.tipoComissao ===
                "variada" ? (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {faixas.length >
                    0 ? (
                      faixas.map(
                        (
                          faixa,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="grid grid-cols-2 gap-2 rounded-md border bg-slate-50 p-2.5"
                          >
                            <div>
                              <p className="text-xs text-slate-500">
                                Desconto
                              </p>

                              <p className="font-semibold">
                                {
                                  faixa.desconto
                                }
                                %
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                Comissão
                              </p>

                              <p className="font-semibold text-emerald-600">
                                {
                                  faixa.comissao
                                }
                                %
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhuma faixa configurada.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Comissão Fixa
                    </p>

                    <p className="text-2xl font-bold text-emerald-600">
                      {representada.comissao !==
                      null
                        ? representada.comissao.toLocaleString(
                            "pt-BR",
                            {
                              maximumFractionDigits: 4,
                            }
                          )
                        : "0"}
                      %
                    </p>
                  </div>
                )}
              </div>

              {blocoRegrasComerciais}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Situação Comercial
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div
                  className={`rounded-lg border p-3 ${
                    regraPadraoVigente
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      regraPadraoVigente
                        ? "text-emerald-900"
                        : "text-amber-900"
                    }`}
                  >
                    {loadingRegras
                      ? "Verificando política comercial..."
                      : regraPadraoVigente
                        ? "Política padrão ativa e vigente"
                        : "Política comercial pendente"}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      regraPadraoVigente
                        ? "text-emerald-800"
                        : "text-amber-800"
                    }`}
                  >
                    {loadingRegras
                      ? "Aguarde o carregamento das regras comerciais."
                      : regraPadraoVigente
                        ? "A Representada possui a regra padrão exigida para novas operações comerciais."
                        : "Regularize a regra padrão antes de gerar novos Orçamentos ou Vendas."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/representadas/${id}/regras-comerciais`
                    )
                  }
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Abrir Regras Comerciais
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Contato Principal
                  </p>

                  <p>
                    {representada.contatoPrincipal ||
                      "-"}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4" />

                  <p>
                    {representada.telefonePrincipal ||
                      "-"}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4" />

                  <p className="break-all">
                    {representada.emailPrincipal ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    WhatsApp
                  </p>

                  <p>
                    {representada.whatsappPrincipal ||
                      "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <p>
                  {representada.endereco ||
                    "-"}
                </p>

                <p>
                  {representada.cidade ||
                    "-"}
                  {" / "}
                  {representada.estado ||
                    "-"}
                </p>

                <p>
                  CEP:{" "}
                  {representada.cep ||
                    "-"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card
          id="representada-metas"
          className="scroll-mt-6 shadow-sm"
        >
          <CardHeader className="pb-3 pt-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg">
                  Metas de Vendas
                </CardTitle>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Metas mensais informadas pela Representada. O cadastro é manual e não bloqueia operações.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-1.5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Ano
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={
                      anoMetas
                    }
                    onChange={(
                      event
                    ) =>
                      setAnoMetas(
                        event.target.value
                      )
                    }
                    className="h-8 w-24 rounded-md border bg-background px-2.5 text-xs"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    carregarMetas()
                  }
                  disabled={
                    loadingMetas
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      loadingMetas
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Atualizar
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() =>
                    abrirNovaMeta()
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />

                  Cadastrar meta
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {mostrarFormularioMeta && (
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {editandoMetaId
                        ? "Editar meta mensal"
                        : "Nova meta mensal"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      A alteração fica registrada na Auditoria. Não é necessário apagar metas anteriores.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={
                      cancelarFormularioMeta
                    }
                    disabled={
                      salvandoMeta
                    }
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Ano
                    </label>

                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={
                        formularioMeta.ano
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            ano:
                              event.target.value,
                          })
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Mês
                    </label>

                    <select
                      value={
                        formularioMeta.mes
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            mes:
                              event.target.value,
                          })
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">
                        Selecione
                      </option>

                      {MESES.map(
                        (
                          nome,
                          index
                        ) => (
                          <option
                            key={
                              nome
                            }
                            value={
                              index +
                              1
                            }
                          >
                            {nome}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Meta de Vendas
                    </label>

                    <input
                      value={
                        formularioMeta.valorMeta
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            valorMeta:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Ex.: 150.000,00"
                      inputMode="decimal"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Fonte da meta
                    </label>

                    <input
                      list="fontes-meta-representada"
                      value={
                        formularioMeta.fonte
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            fonte:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Ex.: Mercos, e-mail, WhatsApp..."
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />

                    <datalist id="fontes-meta-representada">
                      <option value="Mercos" />
                      <option value="E-mail" />
                      <option value="WhatsApp" />
                      <option value="Portal da Representada" />
                      <option value="Informação direta da Representada" />
                    </datalist>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Referência
                    </label>

                    <input
                      value={
                        formularioMeta.referencia
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            referencia:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Ex.: painel outubro/2026, campanha, e-mail recebido..."
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Observações
                    </label>

                    <textarea
                      value={
                        formularioMeta.observacoes
                      }
                      onChange={(
                        event
                      ) =>
                        setFormularioMeta(
                          (
                            atual
                          ) => ({
                            ...atual,
                            observacoes:
                              event.target.value,
                          })
                        )
                      }
                      rows={
                        3
                      }
                      placeholder="Informações adicionais sobre a meta, sazonalidade ou orientação da Representada."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      cancelarFormularioMeta
                    }
                    disabled={
                      salvandoMeta
                    }
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={
                      salvarMeta
                    }
                    disabled={
                      salvandoMeta
                    }
                  >
                    {salvandoMeta && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    {editandoMetaId
                      ? "Salvar alterações"
                      : "Cadastrar meta"}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid overflow-hidden rounded-lg border bg-slate-50 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-b px-3 py-2 sm:border-r lg:border-b-0">
                <p className="text-[11px] text-muted-foreground">
                  Meta anual
                </p>

                <p className="mt-0.5 text-sm font-bold">
                  {loadingMetas
                    ? "…"
                    : formatarValor(
                        totalMetasAno
                      )}
                </p>
              </div>

              <div className="border-b px-3 py-2 lg:border-b-0 lg:border-r">
                <p className="text-[11px] text-muted-foreground">
                  Meses ativos
                </p>

                <p className="mt-0.5 text-sm font-bold">
                  {loadingMetas
                    ? "…"
                    : `${metasAtivas.length}/12`}
                </p>
              </div>

              <div className="border-b px-3 py-2 sm:border-b-0 sm:border-r">
                <p className="text-[11px] text-muted-foreground">
                  Meta do mês atual
                </p>

                <p className="mt-0.5 text-sm font-bold">
                  {loadingMetas
                    ? "…"
                    : Number(
                          anoMetas
                        ) ===
                        anoAtual
                      ? metaMesAtual
                        ? formatarValor(
                            Number(
                              metaMesAtual.valorMeta
                            )
                          )
                        : "Sem meta"
                      : "Ver ano atual"}
                </p>
              </div>

              <div className="px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  Regra
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  Mensal por Representada
                </p>
              </div>
            </div>

            {erroMetas ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erroMetas}
              </div>
            ) : loadingMetas ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando metas...
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {MESES.map(
                  (
                    nomeMes,
                    index
                  ) => {
                    const numeroMes =
                      index +
                      1

                    const meta =
                      metas.find(
                        (
                          item
                        ) =>
                          item.mes ===
                          numeroMes
                      ) ||
                      null

                    const ehMesAtual =
                      Number(
                        anoMetas
                      ) ===
                        anoAtual &&
                      numeroMes ===
                        mesAtual

                    return (
                      <div
                        key={
                          nomeMes
                        }
                        className={`rounded-md border p-2 transition ${
                          ehMesAtual
                            ? "border-blue-200 bg-blue-50/40"
                            : meta?.ativa === false
                              ? "bg-slate-50 opacity-80"
                              : "bg-background"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold leading-tight">
                                {nomeMes}
                              </p>

                              {ehMesAtual && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                                  Atual
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                              {anoMetas}
                            </p>
                          </div>

                          {meta && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                meta.ativa
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {meta.ativa
                                ? "Ativa"
                                : "Inativa"}
                            </span>
                          )}
                        </div>

                        {meta ? (
                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Meta
                            </p>

                            <p className="mt-0.5 text-sm font-bold">
                              {formatarValor(
                                Number(
                                  meta.valorMeta
                                )
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {meta.fonte
                                ? `Fonte: ${meta.fonte}`
                                : "Fonte não informada"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1 border-t pt-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                onClick={() =>
                                  abrirEdicaoMeta(
                                    meta
                                  )
                                }
                                disabled={
                                  salvandoMeta
                                }
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Editar
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[11px]"
                                onClick={() =>
                                  alterarSituacaoMeta(
                                    meta
                                  )
                                }
                                disabled={
                                  salvandoMeta
                                }
                              >
                                {meta.ativa
                                  ? "Inativar"
                                  : "Reativar"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
                            <p className="text-[11px] text-muted-foreground">
                              Sem meta
                            </p>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                              onClick={() =>
                                abrirNovaMeta(
                                  numeroMes
                                )
                              }
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Cadastrar
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          id="representada-clientes"
          className="scroll-mt-6"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Clientes com compras confirmadas
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Comece a digitar o Cliente e o sistema pesquisará automaticamente. São consideradas Vendas com status Confirmado, Parcialmente faturado ou Faturado.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={
                  buscaCliente
                }
                onChange={(
                  event
                ) =>
                  setBuscaCliente(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    buscarClientesCompras()
                  }
                }}
                placeholder="Digite nome, razão social, código ou CNPJ do Cliente"
                className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />

              <Button
                type="button"
                onClick={
                  buscarClientesCompras
                }
                disabled={
                  loadingClientesCompras ||
                  buscaCliente.trim().length <
                    2
                }
              >
                {loadingClientesCompras ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}

                Buscar
              </Button>

              {(buscaCliente ||
                buscaClientesExecutada) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    limparBuscaClientes
                  }
                  disabled={
                    loadingClientesCompras
                  }
                >
                  Limpar
                </Button>
              )}
            </div>

            {erroClientesCompras ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />

                {
                  erroClientesCompras
                }
              </div>
            ) : buscaClientesExecutada &&
              clientesCompras.length ===
                0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Cliente não encontrado nesta Representada.
              </div>
            ) : clientesCompras.length >
              0 ? (
              <div className="space-y-2">
                {clientesCompras.map(
                  (
                    cliente
                  ) => (
                    <button
                      key={
                        cliente.id
                      }
                      type="button"
                      onClick={() =>
                        router.push(
                          `/clientes/${cliente.id}`
                        )
                      }
                      className="group flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-left transition hover:border-primary/50 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground group-hover:text-primary">
                          {
                            cliente.nomeFantasia ||
                            cliente.razaoSocial
                          }
                        </p>

                        {cliente.nomeFantasia &&
                          cliente.nomeFantasia !==
                            cliente.razaoSocial && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {
                                cliente.razaoSocial
                              }
                            </p>
                          )}
                      </div>

                      <div className="shrink-0 text-xs text-muted-foreground sm:text-right">
                        <p>
                          {
                            cliente.quantidadeVendas
                          }{" "}
                          venda
                          {
                            cliente.quantidadeVendas ===
                            1
                              ? ""
                              : "s"
                          }{" "}
                          confirmada
                          {
                            cliente.quantidadeVendas ===
                            1
                              ? ""
                              : "s"
                          }
                        </p>

                        {cliente.ultimaVendaEm && (
                          <p>
                            Última em{" "}
                            {formatarDataCurta(
                              cliente.ultimaVendaEm
                            )}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                )}

                {totalClientesCompras >
                  clientesCompras.length && (
                  <p className="text-xs text-muted-foreground">
                    Mostrando os primeiros{" "}
                    {
                      clientesCompras.length
                    }{" "}
                    de{" "}
                    {
                      totalClientesCompras
                    }{" "}
                    Clientes encontrados. Refine a busca para localizar um Cliente específico.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {buscaCliente.trim().length ===
                1
                  ? "Digite mais 1 caractere para iniciar a busca automática."
                  : "Comece a digitar. A busca acontece automaticamente a partir de 2 caracteres, após uma breve pausa."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          id="representada-orcamentos"
          className="scroll-mt-6"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Orçamentos
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Orçamentos vinculados a esta Representada. A consulta é paginada no servidor.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRefreshHistoricoComercial(
                      (
                        atual
                      ) =>
                        atual + 1
                    )
                  }
                  disabled={
                    historicoOrcamentos.loading
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      historicoOrcamentos.loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Atualizar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/orcamentos/novo"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BarraFiltrosComerciais
              filtros={
                filtrosOrcamentos
              }
              setFiltros={
                setFiltrosOrcamentos
              }
              aplicar={() => {
                setFiltrosOrcamentosAplicados({
                  ...filtrosOrcamentos,
                })
                setPaginaOrcamentos(
                  1
                )
              }}
              limpar={
                limparOrcamentos
              }
              statusOpcoes={
                STATUS_ORCAMENTOS
              }
              placeholderBusca="ORC-000123, Cliente, assunto ou descrição..."
            />

            {historicoOrcamentos.loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando Orçamentos...
              </div>
            ) : historicoOrcamentos.erro ? (
              <div className="flex items-center gap-2 py-8 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {
                  historicoOrcamentos.erro
                }
              </div>
            ) : historicoOrcamentos.dados.length ===
              0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum Orçamento encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoOrcamentos.dados.map(
                  (
                    orcamento
                  ) => (
                    <div
                      key={
                        orcamento.id
                      }
                      className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Orçamento
                          </p>

                          <p className="font-mono text-sm font-semibold">
                            {formatarCodigo(
                              "ORC",
                              orcamento.numeroSequencial
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Cliente
                          </p>

                          <p className="font-medium">
                            {
                              orcamento.cliente.nomeFantasia ||
                              orcamento.cliente.razaoSocial
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Data / validade
                          </p>

                          <p>
                            {formatarDataCurta(
                              orcamento.data
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Validade:{" "}
                            {formatarDataCurta(
                              orcamento.validadeEm
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Valor
                          </p>

                          <p className="font-semibold">
                            {formatarValor(
                              Number(
                                orcamento.valorTotal
                              )
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>

                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${corStatusRegistro(
                              orcamento.status
                            )}`}
                          >
                            {
                              orcamento.status
                            }
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/orcamentos/${orcamento.id}`
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            <PaginacaoHistorico
              paginacao={
                historicoOrcamentos.paginacao
              }
              pagina={
                paginaOrcamentos
              }
              setPagina={
                setPaginaOrcamentos
              }
            />
          </CardContent>
        </Card>

        <Card
          id="representada-vendas"
          className="scroll-mt-6"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Vendas
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Pedidos e Vendas vinculados a esta Representada. A consulta é paginada no servidor.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRefreshHistoricoComercial(
                      (
                        atual
                      ) =>
                        atual + 1
                    )
                  }
                  disabled={
                    historicoVendas.loading
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      historicoVendas.loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Atualizar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/vendas/nova"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Venda
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BarraFiltrosComerciais
              filtros={
                filtrosVendas
              }
              setFiltros={
                setFiltrosVendas
              }
              aplicar={() => {
                setFiltrosVendasAplicados({
                  ...filtrosVendas,
                })
                setPaginaVendas(
                  1
                )
              }}
              limpar={
                limparVendas
              }
              statusOpcoes={
                STATUS_VENDAS
              }
              placeholderBusca="VEN-000123, Cliente, pedido, OC ou produto..."
            />

            {historicoVendas.loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando Vendas...
              </div>
            ) : historicoVendas.erro ? (
              <div className="flex items-center gap-2 py-8 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {
                  historicoVendas.erro
                }
              </div>
            ) : historicoVendas.dados.length ===
              0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma Venda encontrada com os filtros atuais.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoVendas.dados.map(
                  (
                    venda
                  ) => (
                    <div
                      key={
                        venda.id
                      }
                      className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Venda
                          </p>

                          <p className="font-mono text-sm font-semibold">
                            {formatarCodigo(
                              "VEN",
                              venda.numeroSequencial
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Cliente
                          </p>

                          <p className="font-medium">
                            {
                              venda.cliente.nomeFantasia ||
                              venda.cliente.razaoSocial
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Data / pedido
                          </p>

                          <p>
                            {formatarDataCurta(
                              venda.data
                            )}
                          </p>

                          {(venda.numeroPedidoRepresentada ||
                            venda.numeroPedido) && (
                            <p className="text-xs text-muted-foreground">
                              Pedido:{" "}
                              {
                                venda.numeroPedidoRepresentada ||
                                venda.numeroPedido
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Valor
                          </p>

                          <p className="font-semibold">
                            {formatarValor(
                              venda.valorTotal ===
                                null
                                ? null
                                : Number(
                                    venda.valorTotal
                                  )
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>

                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${corStatusRegistro(
                              venda.status
                            )}`}
                          >
                            {
                              venda.status
                            }
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/vendas/${venda.id}`
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}

            <PaginacaoHistorico
              paginacao={
                historicoVendas.paginacao
              }
              pagina={
                paginaVendas
              }
              setPagina={
                setPaginaVendas
              }
            />
          </CardContent>
        </Card>

        <Card
          id="representada-agenda"
          className="scroll-mt-6"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Agenda
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tarefas e compromissos vinculados a esta Representada.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRefreshHistoricoComercial(
                      (
                        atual
                      ) =>
                        atual + 1
                    )
                  }
                  disabled={
                    historicoTarefas.loading
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      historicoTarefas.loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Atualizar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/agenda"
                    )
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Abrir Agenda
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BarraFiltrosComerciais
              filtros={
                filtrosTarefas
              }
              setFiltros={
                setFiltrosTarefas
              }
              aplicar={() => {
                setFiltrosTarefasAplicados({
                  ...filtrosTarefas,
                })
                setPaginaTarefas(
                  1
                )
              }}
              limpar={
                limparTarefas
              }
              statusOpcoes={
                STATUS_TAREFAS
              }
              tipoOpcoes={
                TIPO_TAREFAS
              }
              placeholderBusca="Título, descrição, Cliente ou responsável..."
            />

            {historicoTarefas.loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando Agenda...
              </div>
            ) : historicoTarefas.erro ? (
              <div className="flex items-center gap-2 py-8 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {
                  historicoTarefas.erro
                }
              </div>
            ) : historicoTarefas.dados.length ===
              0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma tarefa ou compromisso encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoTarefas.dados.map(
                  (
                    tarefa
                  ) => (
                    <div
                      key={
                        tarefa.id
                      }
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {
                                tarefa.titulo
                              }
                            </p>

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {
                                tarefa.tipo
                              }
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${corStatusRegistro(
                                tarefa.status
                              )}`}
                            >
                              {
                                tarefa.status
                              }
                            </span>
                          </div>

                          {tarefa.descricao && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                              {
                                tarefa.descricao
                              }
                            </p>
                          )}

                          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-5">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Cliente
                              </p>

                              <p>
                                {
                                  tarefa.cliente?.nomeFantasia ||
                                  tarefa.cliente?.razaoSocial ||
                                  "—"
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Prioridade
                              </p>

                              <p>
                                {
                                  tarefa.prioridade
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Início
                              </p>

                              <p>
                                {formatarData(
                                  tarefa.inicioEm
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Vencimento
                              </p>

                              <p>
                                {formatarData(
                                  tarefa.vencimentoEm
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                Responsável
                              </p>

                              <p>
                                {
                                  tarefa.responsavel?.nome ||
                                  "—"
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {tarefa.cliente && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/clientes/${tarefa.cliente?.id}`
                              )
                            }
                          >
                            <User className="mr-2 h-4 w-4" />
                            Ver Cliente
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <PaginacaoHistorico
              paginacao={
                historicoTarefas.paginacao
              }
              pagina={
                paginaTarefas
              }
              setPagina={
                setPaginaTarefas
              }
            />
          </CardContent>
        </Card>

        <Card
          id="representada-faturamentos"
          className="scroll-mt-6"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Faturamentos
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Notas e faturamentos das Vendas desta Representada.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRefreshHistoricoComercial(
                      (
                        atual
                      ) =>
                        atual + 1
                    )
                  }
                  disabled={
                    historicoFaturamentos.loading
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      historicoFaturamentos.loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Atualizar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/faturamentos"
                    )
                  }
                >
                  Abrir Faturamentos
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BarraFiltrosComerciais
              filtros={
                filtrosFaturamentos
              }
              setFiltros={
                setFiltrosFaturamentos
              }
              aplicar={() => {
                setFiltrosFaturamentosAplicados({
                  ...filtrosFaturamentos,
                })
                setPaginaFaturamentos(
                  1
                )
              }}
              limpar={
                limparFaturamentos
              }
              statusOpcoes={
                STATUS_FATURAMENTOS
              }
              placeholderBusca="NF, VEN-000123, Cliente, pedido ou OC..."
            />

            {historicoFaturamentos.loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando Faturamentos...
              </div>
            ) : historicoFaturamentos.erro ? (
              <div className="flex items-center gap-2 py-8 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {
                  historicoFaturamentos.erro
                }
              </div>
            ) : historicoFaturamentos.dados.length ===
              0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum Faturamento encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoFaturamentos.dados.map(
                  (
                    faturamento
                  ) => (
                    <div
                      key={
                        faturamento.id
                      }
                      className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Faturamento
                          </p>

                          <p className="font-mono text-sm font-semibold">
                            {formatarCodigo(
                              "FAT",
                              faturamento.numeroSequencial
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            NF
                          </p>

                          <p className="font-medium">
                            {
                              faturamento.numeroNF ||
                              "—"
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Cliente
                          </p>

                          <p className="font-medium">
                            {
                              faturamento.venda.cliente.nomeFantasia ||
                              faturamento.venda.cliente.razaoSocial
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Venda
                          </p>

                          <p className="font-mono text-sm">
                            {formatarCodigo(
                              "VEN",
                              faturamento.venda.numeroSequencial
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Data / valor
                          </p>

                          <p>
                            {formatarDataCurta(
                              faturamento.dataFaturamento
                            )}
                          </p>

                          <p className="font-semibold">
                            {formatarValor(
                              Number(
                                faturamento.valorFaturado
                              )
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>

                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${corStatusRegistro(
                              faturamento.status
                            )}`}
                          >
                            {
                              faturamento.status
                            }
                          </span>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              faturamento.titulos.length
                            }{" "}
                            título
                            {
                              faturamento.titulos.length ===
                              1
                                ? ""
                                : "s"
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/clientes/${faturamento.venda.cliente.id}`
                            )
                          }
                        >
                          <User className="mr-2 h-4 w-4" />
                          Cliente
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/vendas/${faturamento.venda.id}`
                            )
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Venda
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <PaginacaoHistorico
              paginacao={
                historicoFaturamentos.paginacao
              }
              pagina={
                paginaFaturamentos
              }
              setPagina={
                setPaginaFaturamentos
              }
            />
          </CardContent>
        </Card>

        <Card
          id="representada-interacoes"
          className="scroll-mt-6"
        >
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Interações
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Histórico institucional relacionado exclusivamente a esta representada.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarInteracoes()
                  }
                  disabled={
                    loadingInteracoes
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      loadingInteracoes
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Atualizar
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      "/interacoes/nova"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Interação
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingInteracoes ? (
              <div className="flex items-center justify-center gap-2 py-10">
                <Loader2 className="h-4 w-4 animate-spin" />

                Carregando interações...
              </div>
            ) : erroInteracoes ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />

                  {
                    erroInteracoes
                  }
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    carregarInteracoes()
                  }
                >
                  Tentar novamente
                </Button>
              </div>
            ) : interacoes.length ===
              0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                <ClipboardList className="h-8 w-8" />

                <p>
                  Nenhuma interação registrada para esta representada.
                </p>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      "/interacoes/nova"
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />

                  Registrar primeira interação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {interacoes.map(
                  (
                    interacao
                  ) => {
                    const editada =
                      foiEditada(
                        interacao.criadoEm,
                        interacao.atualizadoEm
                      )

                    const codigo =
                      formatarCodigoInteracao(
                        interacao.numeroSequencial
                      )

                    return (
                      <div
                        key={
                          interacao.id
                        }
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/20"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                              {
                                codigo
                              }
                            </span>

                            <span className="text-xs text-muted-foreground">
                              Identificação permanente
                            </span>
                          </div>

                          {editada && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              Editada
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${corTipo(
                                  interacao.tipo
                                )}`}
                              >
                                {
                                  interacao.tipo
                                }
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${corStatusFollowUp(
                                  interacao.statusFollowUp
                                )}`}
                              >
                                {
                                  interacao.statusFollowUp
                                }
                              </span>
                            </div>

                            <div>
                              <p className="font-semibold">
                                {interacao.assunto ||
                                  "Sem assunto"}
                              </p>

                              {interacao.descricao && (
                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                  {
                                    interacao.descricao
                                  }
                                </p>
                              )}
                            </div>

                            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                              <div className="flex gap-2">
                                <Calendar className="mt-0.5 h-4 w-4" />

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Registrada em
                                  </p>

                                  <p>
                                    {formatarData(
                                      interacao.data
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <User className="mt-0.5 h-4 w-4" />

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Autor
                                  </p>

                                  <p>
                                    {interacao.criadoPor
                                      ?.nome ||
                                      "—"}
                                  </p>

                                  {interacao.criadoPor
                                    ?.perfil && (
                                    <p className="text-xs text-muted-foreground">
                                      {
                                        interacao.criadoPor.perfil
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Próximo acompanhamento
                                </p>

                                <p>
                                  {formatarData(
                                    interacao.proximoContatoEm
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Responsável
                                </p>

                                <p>
                                  {interacao.responsavel
                                    ?.nome ||
                                    "—"}
                                </p>
                              </div>
                            </div>

                            {interacao.resultado && (
                              <div className="rounded-md bg-muted/40 p-3">
                                <p className="text-xs font-medium">
                                  Resultado
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                  {
                                    interacao.resultado
                                  }
                                </p>
                              </div>
                            )}

                            {interacao.proximosPasso && (
                              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-medium text-amber-800">
                                  Próximos passos
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">
                                  {
                                    interacao.proximosPasso
                                  }
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/interacoes/${interacao.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />

                            Ver
                          </Button>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Observações
            </CardTitle>
          </CardHeader>

          <CardContent>
            {representada.observacoes ||
              "Nenhuma observação cadastrada."}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}