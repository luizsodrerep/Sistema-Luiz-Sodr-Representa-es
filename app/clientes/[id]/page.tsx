"use client"

import {
  type Dispatch,
  type SetStateAction,
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
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react"

interface Cliente {
  id: string
  codigo?: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  inscricaoEstadual: string | null
  contato: string | null
  cargo: string | null
  email: string | null
  telefone: string | null
  whatsapp: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  regiao: string | null
  rota: string | null
  categoria: string | null
  status: string
  termometroRelacionamento: string | null
  aceitaEmail?: boolean
  observacoes: string | null
  ultimoPedidoEm?: string | null
  criadoEm: string
  atualizadoEm?: string
  atencoesComerciais: AtencaoComercial[]
}

interface UsuarioResumo {
  id: string
  nome: string
  perfil: string
}

interface RepresentadaResumo {
  id: string
  codigo?: string | null
  nome: string
}

interface UsuarioAtencao {
  id: string
  nome: string
}

interface AtencaoComercial {
  id: string
  tipo: string
  titulo: string
  descricao: string
  status: string
  resolucao: string | null
  resolvidoEm: string | null
  criadoEm: string
  atualizadoEm: string
  representada: RepresentadaResumo | null
  criadoPor: UsuarioAtencao | null
  resolvidoPor: UsuarioAtencao | null
}

type AbaCliente =
  | "visao-geral"
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "faturamentos"
  | "agenda"
  | "representadas"

interface RepresentadaCompra {
  id: string
  codigo: string | null
  nome: string
  status: string
  quantidadeVendas: number
  ultimaVendaEm: string | null
}

interface RespostaRepresentadasCompras {
  totalRepresentadas: number
  representadas: RepresentadaCompra[]
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
  proximoContatoEm: string | null
  statusFollowUp: string
  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
  criadoEm: string
  atualizadoEm: string
}

interface Orcamento {
  id: string
  numeroSequencial: number
  data: string
  validadeEm: string
  valorTotal: number
  condicaoPagamento: string | null
  descricao: string | null
  status: string
  representada: RepresentadaResumo
  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

interface Venda {
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
  representada: RepresentadaResumo
  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null
}

interface Tarefa {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  prioridade: string
  status: string
  inicioEm: string | null
  fimEm: string | null
  vencimentoEm: string | null
  representada: RepresentadaResumo | null
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

interface Faturamento {
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
    representada: RepresentadaResumo
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

  const data = new Date(valor)

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

  const data = new Date(valor)

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

function formatarMoeda(
  valor: number | null
) {
  if (
    valor === null ||
    !Number.isFinite(valor)
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

function formatarCodigo(
  prefixo: string,
  numeroSequencial: number
) {
  return `${prefixo}-${String(
    numeroSequencial
  ).padStart(6, "0")}`
}

function foiEditada(
  criadoEm: string,
  atualizadoEm: string
) {
  const criado =
    new Date(criadoEm).getTime()

  const atualizado =
    new Date(atualizadoEm).getTime()

  if (
    Number.isNaN(criado) ||
    Number.isNaN(atualizado)
  ) {
    return false
  }

  return atualizado - criado > 2000
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
    normalizado === "concluída" ||
    normalizado === "concluida" ||
    normalizado === "concluído" ||
    normalizado === "concluido"
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

function montarUrl(
  endpoint: string,
  clienteId: string,
  pagina: number,
  parametros: Record<string, string>
) {
  const searchParams =
    new URLSearchParams({
      clienteId,
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
          const url =
            montarUrl(
              endpoint,
              id,
              pagina,
              parametros
            )

          const response =
            await fetch(
              url,
              {
                method: "GET",
                cache: "no-store",
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
            error instanceof
              DOMException &&
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
            !controller.signal
              .aborted
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

function BarraFiltros({
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
  statusOpcoes?: OpcaoFiltro[]
  tipoOpcoes?: OpcaoFiltro[]
  placeholderBusca: string
}) {
  return (
    <div className="mb-4 rounded-lg border bg-muted/20 p-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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

        {statusOpcoes && (
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
        )}

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

function LoadingSecao() {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Carregando registros...
    </div>
  )
}

function ErroSecao({
  mensagem,
}: {
  mensagem: string
}) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {
        mensagem
      }
    </div>
  )
}

const STATUS_INTERACOES:
  OpcaoFiltro[] =
  [
    {
      valor: "Aberto",
      rotulo: "Aberto",
    },
    {
      valor:
        "Em acompanhamento",
      rotulo:
        "Em acompanhamento",
    },
    {
      valor: "Finalizado",
      rotulo: "Finalizado",
    },
    {
      valor:
        "Sem acompanhamento",
      rotulo:
        "Sem acompanhamento",
    },
  ]

const TIPO_INTERACOES:
  OpcaoFiltro[] =
  [
    {
      valor: "WhatsApp",
      rotulo: "WhatsApp",
    },
    {
      valor: "E-mail",
      rotulo: "E-mail",
    },
    {
      valor: "Visita",
      rotulo: "Visita",
    },
    {
      valor: "Ligação",
      rotulo: "Ligação",
    },
  ]

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
      valor:
        "Compromisso",
      rotulo:
        "Compromisso",
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

const TERMOMETROS = [
  { valor: "", rotulo: "Não classificado" },
  { valor: "Verde", rotulo: "🟢 Verde — Relacionamento consolidado" },
  { valor: "Azul", rotulo: "🔵 Azul — Bom relacionamento / em desenvolvimento" },
  { valor: "Amarelo", rotulo: "🟡 Amarelo — Atenção / relacionamento irregular" },
  { valor: "Laranja", rotulo: "🟠 Laranja — Cautela comercial" },
  { valor: "Vermelho", rotulo: "🔴 Vermelho — Relacionamento crítico" },
]

const TIPOS_ATENCAO = [
  "Informação importante",
  "Atenção",
  "Restrição",
]

function classeTermometro(
  valor: string | null
) {
  switch (valor) {
    case "Verde":
      return "border-green-200 bg-green-50 text-green-800"
    case "Azul":
      return "border-blue-200 bg-blue-50 text-blue-800"
    case "Amarelo":
      return "border-yellow-200 bg-yellow-50 text-yellow-800"
    case "Laranja":
      return "border-orange-200 bg-orange-50 text-orange-800"
    case "Vermelho":
      return "border-red-200 bg-red-50 text-red-800"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function rotuloTermometro(
  valor: string | null
) {
  const encontrado =
    TERMOMETROS.find(
      (item) => item.valor === (valor || "")
    )

  return encontrado?.rotulo || "Não classificado"
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

function extrairRepresentadas(
  valor: unknown
): RepresentadaResumo[] {
  const candidatas: unknown[] = []

  if (Array.isArray(valor)) {
    candidatas.push(...valor)
  } else if (
    valor &&
    typeof valor === "object"
  ) {
    const objeto =
      valor as Record<string, unknown>

    for (const chave of [
      "dados",
      "representadas",
      "items",
      "data",
    ]) {
      const lista = objeto[chave]

      if (Array.isArray(lista)) {
        candidatas.push(...lista)
      }
    }
  }

  const resultado = new Map<
    string,
    RepresentadaResumo
  >()

  for (const item of candidatas) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue
    }

    const registro =
      item as Record<string, unknown>

    if (
      typeof registro.id !== "string" ||
      typeof registro.nome !== "string"
    ) {
      continue
    }

    resultado.set(
      registro.id,
      {
        id: registro.id,
        nome: registro.nome,
        codigo:
          typeof registro.codigo === "string"
            ? registro.codigo
            : null,
      }
    )
  }

  return Array.from(
    resultado.values()
  ).sort((a, b) =>
    a.nome.localeCompare(
      b.nome,
      "pt-BR"
    )
  )
}

export default function ClientePage() {
  const router =
    useRouter()

  const params =
    useParams()

  const id =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id

  const [
    cliente,
    setCliente,
  ] =
    useState<Cliente | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    refreshHistorico,
    setRefreshHistorico,
  ] =
    useState(0)

  const [
    refreshCliente,
    setRefreshCliente,
  ] =
    useState(0)

  const [
    abaAtiva,
    setAbaAtiva,
  ] =
    useState<AbaCliente>(
      "visao-geral"
    )

  const [
    termometroSelecionado,
    setTermometroSelecionado,
  ] =
    useState("")

  const [
    salvandoTermometro,
    setSalvandoTermometro,
  ] =
    useState(false)

  const [
    formularioAtencaoAberto,
    setFormularioAtencaoAberto,
  ] =
    useState(false)

  const [
    novaAtencaoTipo,
    setNovaAtencaoTipo,
  ] =
    useState("Atenção")

  const [
    novaAtencaoTitulo,
    setNovaAtencaoTitulo,
  ] =
    useState("")

  const [
    novaAtencaoDescricao,
    setNovaAtencaoDescricao,
  ] =
    useState("")

  const [
    novaAtencaoRepresentadaId,
    setNovaAtencaoRepresentadaId,
  ] =
    useState("")

  const [
    salvandoAtencao,
    setSalvandoAtencao,
  ] =
    useState(false)

  const [
    atencaoResolvendoId,
    setAtencaoResolvendoId,
  ] =
    useState<string | null>(
      null
    )

  const [
    resolucaoAtencao,
    setResolucaoAtencao,
  ] =
    useState("")

  const [
    mensagemAcao,
    setMensagemAcao,
  ] =
    useState<{
      tipo: "sucesso" | "erro"
      texto: string
    } | null>(null)

  const [
    representadasDisponiveis,
    setRepresentadasDisponiveis,
  ] =
    useState<RepresentadaResumo[]>([])

  const [
    representadasCompras,
    setRepresentadasCompras,
  ] =
    useState<RespostaRepresentadasCompras>({
      totalRepresentadas: 0,
      representadas: [],
    })

  const [
    loadingRepresentadas,
    setLoadingRepresentadas,
  ] =
    useState(true)

  const [
    erroRepresentadas,
    setErroRepresentadas,
  ] =
    useState<string | null>(
      null
    )

  const [
    paginaInteracoes,
    setPaginaInteracoes,
  ] =
    useState(1)

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
    filtrosInteracoes,
    setFiltrosInteracoes,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

  const [
    filtrosInteracoesAplicados,
    setFiltrosInteracoesAplicados,
  ] =
    useState<FiltrosHistorico>({
      ...FILTROS_VAZIOS,
    })

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
    if (!id) {
      setLoading(false)
      return
    }

    fetch(
      `/api/clientes/${id}`,
      {
        cache: "no-store",
      }
    )
      .then(
        async (
          res
        ) => {
          if (!res.ok) {
            throw new Error(
              "Cliente não encontrado."
            )
          }

          return res.json()
        }
      )
      .then(
        (
          data
        ) => {
          const clienteCarregado =
            data as Cliente

          setCliente(
            clienteCarregado
          )

          setTermometroSelecionado(
            clienteCarregado.termometroRelacionamento || ""
          )
        }
      )
      .catch(
        (
          error
        ) => {
          console.error(
            "Erro ao carregar cliente:",
            error
          )

          setCliente(
            null
          )
        }
      )
      .finally(() => {
        setLoading(false)
      })
  }, [
    id,
    refreshCliente,
  ])

  useEffect(() => {
    if (!id) {
      setRepresentadasCompras({
        totalRepresentadas: 0,
        representadas: [],
      })
      setLoadingRepresentadas(false)
      setErroRepresentadas(null)
      return
    }

    const controller =
      new AbortController()

    const carregar =
      async () => {
        setLoadingRepresentadas(true)
        setErroRepresentadas(null)

        try {
          const response =
            await fetch(
              `/api/clientes/${id}/representadas-compras`,
              {
                method: "GET",
                cache: "no-store",
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
              data?.message ||
                "Não foi possível carregar as Representadas deste Cliente."
            )
          }

          if (
            !data ||
            !Array.isArray(
              data.representadas
            ) ||
            typeof data.totalRepresentadas !==
              "number"
          ) {
            throw new Error(
              "Resposta inválida ao carregar as Representadas deste Cliente."
            )
          }

          setRepresentadasCompras(
            data as RespostaRepresentadasCompras
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
            "Erro ao carregar Representadas do Cliente:",
            error
          )

          setRepresentadasCompras({
            totalRepresentadas: 0,
            representadas: [],
          })

          setErroRepresentadas(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as Representadas deste Cliente."
          )
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoadingRepresentadas(false)
          }
        }
      }

    carregar()

    return () => {
      controller.abort()
    }
  }, [
    id,
    refreshHistorico,
  ])

  useEffect(() => {
    const controller =
      new AbortController()

    const carregar = async () => {
      try {
        const response = await fetch(
          "/api/representadas?limit=500",
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          return
        }

        const data = await response
          .json()
          .catch(() => null)

        if (
          controller.signal.aborted
        ) {
          return
        }

        setRepresentadasDisponiveis(
          extrairRepresentadas(data)
        )
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }

        console.error(
          "Erro ao carregar Representadas para Atenções Comerciais:",
          error
        )
      }
    }

    carregar()

    return () => {
      controller.abort()
    }
  }, [])

  const historicoInteracoes =
    useHistoricoPaginado<Interacao>({
      id,
      endpoint:
        "/api/interacoes",
      pagina:
        paginaInteracoes,
      parametros: {
        busca:
          filtrosInteracoesAplicados.busca,
        statusFollowUp:
          filtrosInteracoesAplicados.status,
        tipo:
          filtrosInteracoesAplicados.tipo,
        dataInicio:
          filtrosInteracoesAplicados.dataInicio,
        dataFim:
          filtrosInteracoesAplicados.dataFim,
      },
      refreshKey:
        refreshHistorico,
      mensagemErro:
        "Não foi possível carregar as interações deste cliente.",
    })

  const historicoOrcamentos =
    useHistoricoPaginado<Orcamento>({
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
        refreshHistorico,
      mensagemErro:
        "Não foi possível carregar os orçamentos deste cliente.",
    })

  const historicoVendas =
    useHistoricoPaginado<Venda>({
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
        refreshHistorico,
      mensagemErro:
        "Não foi possível carregar as vendas deste cliente.",
    })

  const historicoTarefas =
    useHistoricoPaginado<Tarefa>({
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
        refreshHistorico,
      mensagemErro:
        "Não foi possível carregar a Agenda deste cliente.",
    })

  const historicoFaturamentos =
    useHistoricoPaginado<Faturamento>({
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
        refreshHistorico,
      mensagemErro:
        "Não foi possível carregar os faturamentos deste cliente.",
    })

  const historicoCarregando =
    historicoInteracoes.loading ||
    historicoOrcamentos.loading ||
    historicoVendas.loading ||
    historicoTarefas.loading ||
    historicoFaturamentos.loading ||
    loadingRepresentadas

  const enviarAtualizacaoCliente =
    async (
      dados: Record<string, unknown>
    ) => {
      const response = await fetch(
        `/api/clientes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(dados),
        }
      )

      const resposta = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          resposta?.error ||
            "Não foi possível concluir a operação."
        )
      }

      return resposta
    }

  const salvarTermometro =
    async () => {
      if (!cliente) {
        return
      }

      const atual =
        cliente.termometroRelacionamento ||
        ""

      if (
        atual ===
        termometroSelecionado
      ) {
        setMensagemAcao({
          tipo: "sucesso",
          texto:
            "A classificação já está atualizada.",
        })
        return
      }

      setSalvandoTermometro(true)
      setMensagemAcao(null)

      try {
        await enviarAtualizacaoCliente({
          termometroRelacionamento:
            termometroSelecionado ||
            null,
        })

        setMensagemAcao({
          tipo: "sucesso",
          texto:
            "Relacionamento atualizado com sucesso.",
        })

        setRefreshCliente(
          (atual) => atual + 1
        )
      } catch (error) {
        setMensagemAcao({
          tipo: "erro",
          texto:
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar o relacionamento.",
        })
      } finally {
        setSalvandoTermometro(false)
      }
    }

  const criarAtencaoComercial =
    async () => {
      if (
        !novaAtencaoTitulo.trim() ||
        !novaAtencaoDescricao.trim()
      ) {
        setMensagemAcao({
          tipo: "erro",
          texto:
            "Informe o título e a descrição da Atenção Comercial.",
        })
        return
      }

      setSalvandoAtencao(true)
      setMensagemAcao(null)

      try {
        await enviarAtualizacaoCliente({
          acaoAtencaoComercial:
            "CRIAR",
          tipo: novaAtencaoTipo,
          titulo:
            novaAtencaoTitulo.trim(),
          descricao:
            novaAtencaoDescricao.trim(),
          representadaId:
            novaAtencaoRepresentadaId ||
            null,
        })

        setNovaAtencaoTipo(
          "Atenção"
        )
        setNovaAtencaoTitulo("")
        setNovaAtencaoDescricao("")
        setNovaAtencaoRepresentadaId("")
        setFormularioAtencaoAberto(false)

        setMensagemAcao({
          tipo: "sucesso",
          texto:
            "Atenção Comercial registrada com sucesso.",
        })

        setRefreshCliente(
          (atual) => atual + 1
        )
      } catch (error) {
        setMensagemAcao({
          tipo: "erro",
          texto:
            error instanceof Error
              ? error.message
              : "Não foi possível registrar a Atenção Comercial.",
        })
      } finally {
        setSalvandoAtencao(false)
      }
    }

  const resolverAtencaoComercial =
    async (
      atencaoId: string
    ) => {
      if (
        !resolucaoAtencao.trim()
      ) {
        setMensagemAcao({
          tipo: "erro",
          texto:
            "Informe o desfecho antes de resolver a Atenção Comercial.",
        })
        return
      }

      setSalvandoAtencao(true)
      setMensagemAcao(null)

      try {
        await enviarAtualizacaoCliente({
          acaoAtencaoComercial:
            "RESOLVER",
          atencaoId,
          resolucao:
            resolucaoAtencao.trim(),
        })

        setAtencaoResolvendoId(null)
        setResolucaoAtencao("")

        setMensagemAcao({
          tipo: "sucesso",
          texto:
            "Atenção Comercial resolvida e preservada no histórico.",
        })

        setRefreshCliente(
          (atual) => atual + 1
        )
      } catch (error) {
        setMensagemAcao({
          tipo: "erro",
          texto:
            error instanceof Error
              ? error.message
              : "Não foi possível resolver a Atenção Comercial.",
        })
      } finally {
        setSalvandoAtencao(false)
      }
    }

  const statusCor = (
    status: string
  ) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800"
      case "Inativo":
        return "bg-red-100 text-red-800"
      case "Inativo 6 meses":
        return "bg-orange-100 text-orange-800"
      case "Prospect":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const atualizarHistorico =
    () => {
      setRefreshHistorico(
        (
          atual
        ) =>
          atual + 1
      )

      setRefreshCliente(
        (
          atual
        ) =>
          atual + 1
      )
    }

  const limparInteracoes =
    () => {
      const vazio = {
        ...FILTROS_VAZIOS,
      }

      setFiltrosInteracoes(
        vazio
      )
      setFiltrosInteracoesAplicados(
        vazio
      )
      setPaginaInteracoes(1)
    }

  const limparOrcamentos =
    () => {
      const vazio = {
        ...FILTROS_VAZIOS,
      }

      setFiltrosOrcamentos(
        vazio
      )
      setFiltrosOrcamentosAplicados(
        vazio
      )
      setPaginaOrcamentos(1)
    }

  const limparVendas =
    () => {
      const vazio = {
        ...FILTROS_VAZIOS,
      }

      setFiltrosVendas(
        vazio
      )
      setFiltrosVendasAplicados(
        vazio
      )
      setPaginaVendas(1)
    }

  const limparTarefas =
    () => {
      const vazio = {
        ...FILTROS_VAZIOS,
      }

      setFiltrosTarefas(
        vazio
      )
      setFiltrosTarefasAplicados(
        vazio
      )
      setPaginaTarefas(1)
    }

  const limparFaturamentos =
    () => {
      const vazio = {
        ...FILTROS_VAZIOS,
      }

      setFiltrosFaturamentos(
        vazio
      )
      setFiltrosFaturamentosAplicados(
        vazio
      )
      setPaginaFaturamentos(1)
    }

  const atencoesAtivas =
    cliente?.atencoesComerciais?.filter(
      (item) => item.status === "Ativa"
    ) || []

  const atencoesResolvidas =
    cliente?.atencoesComerciais?.filter(
      (item) => item.status !== "Ativa"
    ) || []

  const mapaRepresentadas =
    new Map<string, RepresentadaResumo>()

  for (
    const representada of
      representadasDisponiveis
  ) {
    mapaRepresentadas.set(
      representada.id,
      representada
    )
  }

  for (
    const representada of
      representadasCompras.representadas
  ) {
    mapaRepresentadas.set(
      representada.id,
      {
        id: representada.id,
        codigo: representada.codigo,
        nome: representada.nome,
      }
    )
  }

  const representadasParaAtencao =
    Array.from(
      mapaRepresentadas.values()
    ).sort((a, b) =>
      a.nome.localeCompare(
        b.nome,
        "pt-BR"
      )
    )

  const ultimaCompraConfirmada =
    representadasCompras.representadas.reduce<
      string | null
    >(
      (
        maisRecente,
        representada
      ) => {
        const valor =
          representada.ultimaVendaEm

        if (!valor) {
          return maisRecente
        }

        if (!maisRecente) {
          return valor
        }

        return new Date(valor).getTime() >
          new Date(maisRecente).getTime()
          ? valor
          : maisRecente
      },
      null
    )

  const ultimaInteracao =
    historicoInteracoes.dados[0]?.data ||
    null

  if (loading) {
    return (
      <div className="p-6">
        Carregando...
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="p-6">
        Cliente não encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  "/clientes"
                )
              }
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>

            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight lg:text-3xl">
                {cliente.razaoSocial}
              </h1>

              {cliente.nomeFantasia && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {cliente.nomeFantasia}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {cliente.codigo && (
                  <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    Código: {cliente.codigo}
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCor(
                    cliente.status
                  )}`}
                >
                  {cliente.status}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${classeTermometro(
                    cliente.termometroRelacionamento
                  )}`}
                >
                  Relacionamento: {rotuloTermometro(
                    cliente.termometroRelacionamento
                  )}
                </span>

                {atencoesAtivas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAbaAtiva(
                        "visao-geral"
                      )
                      document
                        .getElementById(
                          "atencoes-comerciais"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                    }}
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 transition hover:bg-orange-100"
                  >
                    ⚠ {atencoesAtivas.length}{" "}
                    {atencoesAtivas.length === 1
                      ? "Atenção Comercial ativa"
                      : "Atenções Comerciais ativas"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={
                atualizarHistorico
              }
              disabled={
                historicoCarregando
              }
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${
                  historicoCarregando
                    ? "animate-spin"
                    : ""
                }`}
              />
              Atualizar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(
                  "/interacoes/nova"
                )
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova Interação
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(
                  "/orcamentos/novo"
                )
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo Orçamento
            </Button>

            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/clientes/${cliente.id}/editar`
                )
              }
            >
              <Pencil className="mr-1 h-4 w-4" />
              Editar cadastro
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 overflow-x-auto">
            {[
              ["visao-geral", "Visão Geral"],
              ["interacoes", `Interações (${historicoInteracoes.paginacao.total})`],
              ["orcamentos", `Orçamentos (${historicoOrcamentos.paginacao.total})`],
              ["vendas", `Vendas (${historicoVendas.paginacao.total})`],
              ["faturamentos", `Faturamentos (${historicoFaturamentos.paginacao.total})`],
              ["agenda", `Agenda (${historicoTarefas.paginacao.total})`],
              ["representadas", `Representadas (${representadasCompras.totalRepresentadas})`],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() =>
                  setAbaAtiva(
                    valor as AbaCliente
                  )
                }
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  abaAtiva === valor
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {mensagemAcao && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagemAcao.tipo ===
            "sucesso"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {mensagemAcao.texto}
        </div>
      )}

      {abaAtiva === "visao-geral" && (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>
                  Dados principais
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CNPJ
                    </p>
                    <p className="font-medium">
                      {cliente.cnpj || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Inscrição Estadual
                    </p>
                    <p className="font-medium">
                      {cliente.inscricaoEstadual || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Categoria
                    </p>
                    <p className="font-medium">
                      {cliente.categoria || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>
                    <p className="font-medium">
                      {cliente.contato || "—"}
                    </p>
                    {cliente.cargo && (
                      <p className="text-xs text-muted-foreground">
                        {cliente.cargo}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone / WhatsApp
                    </p>
                    <p className="font-medium">
                      {cliente.telefone || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp: {cliente.whatsapp || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>
                    <p className="break-all font-medium">
                      {cliente.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Localização
                  </p>

                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Endereço
                      </p>
                      <p className="font-medium">
                        {cliente.endereco || "—"}
                        {cliente.bairro
                          ? ` · ${cliente.bairro}`
                          : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cidade / UF
                      </p>
                      <p className="font-medium">
                        {cliente.cidade || "—"}
                        {cliente.estado
                          ? ` / ${cliente.estado}`
                          : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        CEP
                      </p>
                      <p className="font-medium">
                        {cliente.cep || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Região
                      </p>
                      <p className="font-medium">
                        {cliente.regiao || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Rota
                      </p>
                      <p className="font-medium">
                        {cliente.rota || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  Resumo Comercial
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div
                  className={`rounded-lg border p-3 ${classeTermometro(
                    cliente.termometroRelacionamento
                  )}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    Relacionamento
                  </p>
                  <p className="mt-1 font-semibold">
                    {rotuloTermometro(
                      cliente.termometroRelacionamento
                    )}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Alterar classificação manual
                  </label>
                  <select
                    value={termometroSelecionado}
                    onChange={(event) =>
                      setTermometroSelecionado(
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {TERMOMETROS.map((item) => (
                      <option
                        key={item.valor || "nao-classificado"}
                        value={item.valor}
                      >
                        {item.rotulo}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 w-full"
                    disabled={salvandoTermometro}
                    onClick={salvarTermometro}
                  >
                    {salvandoTermometro ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Salvar relacionamento
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setAbaAtiva(
                        "vendas"
                      )
                    }
                    className="rounded-lg border p-3 text-left hover:bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground">
                      Vendas
                    </p>
                    <p className="text-xl font-bold">
                      {historicoVendas.paginacao.total}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAbaAtiva(
                        "representadas"
                      )
                    }
                    className="rounded-lg border p-3 text-left hover:bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground">
                      Representadas
                    </p>
                    <p className="text-xl font-bold">
                      {representadasCompras.totalRepresentadas}
                    </p>
                  </button>
                </div>

                <div className="grid gap-3 border-t pt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Última compra confirmada
                    </p>
                    <p className="font-medium">
                      {formatarDataCurta(
                        ultimaCompraConfirmada
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Último pedido informado
                    </p>
                    <p className="font-medium">
                      {formatarDataCurta(
                        cliente.ultimoPedidoEm || null
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Última interação visível
                    </p>
                    <p className="font-medium">
                      {formatarDataCurta(
                        ultimaInteracao
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card
            id="atencoes-comerciais"
            className="scroll-mt-6"
          >
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Atenções Comerciais do Cliente
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Memória comercial manual. Pode ser geral do Cliente ou vinculada a uma Representada. Não altera cobrança, crédito ou financeiro.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setFormularioAtencaoAberto(
                      (atual) => !atual
                    )
                    setMensagemAcao(null)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Atenção
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {atencoesAtivas.length > 0 ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
                  <strong>
                    ⚠ Este Cliente possui {atencoesAtivas.length}{" "}
                    {atencoesAtivas.length === 1
                      ? "Atenção Comercial ativa."
                      : "Atenções Comerciais ativas."}
                  </strong>{" "}
                  Consulte os registros antes de nova abordagem, orçamento ou negociação.
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  Nenhuma Atenção Comercial ativa neste momento.
                </div>
              )}

              {formularioAtencaoAberto && (
                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Tipo
                      </label>
                      <select
                        value={novaAtencaoTipo}
                        onChange={(event) =>
                          setNovaAtencaoTipo(
                            event.target.value
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        {TIPOS_ATENCAO.map((tipo) => (
                          <option
                            key={tipo}
                            value={tipo}
                          >
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Escopo / Representada
                      </label>
                      <select
                        value={novaAtencaoRepresentadaId}
                        onChange={(event) =>
                          setNovaAtencaoRepresentadaId(
                            event.target.value
                          )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">
                          Geral do Cliente
                        </option>
                        {representadasParaAtencao.map(
                          (representada) => (
                            <option
                              key={representada.id}
                              value={representada.id}
                            >
                              {representada.codigo
                                ? `${representada.codigo} · `
                                : ""}
                              {representada.nome}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Título
                    </label>
                    <input
                      value={novaAtencaoTitulo}
                      onChange={(event) =>
                        setNovaAtencaoTitulo(
                          event.target.value
                        )
                      }
                      maxLength={160}
                      placeholder="Ex.: Cliente com estoque elevado após compra antecipada"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Descrição objetiva
                    </label>
                    <textarea
                      value={novaAtencaoDescricao}
                      onChange={(event) =>
                        setNovaAtencaoDescricao(
                          event.target.value
                        )
                      }
                      maxLength={5000}
                      rows={4}
                      placeholder="Registre fatos comerciais, contexto e cuidados para próximas abordagens. Evite suposições ou acusações não verificadas."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={salvandoAtencao}
                      onClick={criarAtencaoComercial}
                    >
                      {salvandoAtencao ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Registrar Atenção
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={salvandoAtencao}
                      onClick={() => {
                        setFormularioAtencaoAberto(false)
                        setNovaAtencaoTipo("Atenção")
                        setNovaAtencaoTitulo("")
                        setNovaAtencaoDescricao("")
                        setNovaAtencaoRepresentadaId("")
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {atencoesAtivas.map(
                  (atencao) => (
                    <div
                      key={atencao.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${classeTipoAtencao(
                                atencao.tipo
                              )}`}
                            >
                              {atencao.tipo}
                            </span>

                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-800">
                              Ativa
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {atencao.representada
                                ? `Representada: ${atencao.representada.nome}`
                                : "Geral do Cliente"}
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-slate-900">
                            {atencao.titulo}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {atencao.descricao}
                          </p>

                          <p className="mt-3 text-xs text-muted-foreground">
                            Registrada em {formatarData(
                              atencao.criadoEm
                            )}
                            {atencao.criadoPor?.nome
                              ? ` por ${atencao.criadoPor.nome}`
                              : ""}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              atencaoResolvendoId ===
                              atencao.id
                            ) {
                              setAtencaoResolvendoId(null)
                              setResolucaoAtencao("")
                            } else {
                              setAtencaoResolvendoId(
                                atencao.id
                              )
                              setResolucaoAtencao("")
                            }
                          }}
                        >
                          Resolver
                        </Button>
                      </div>

                      {atencaoResolvendoId ===
                        atencao.id && (
                        <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Desfecho / resolução
                          </label>
                          <textarea
                            value={resolucaoAtencao}
                            onChange={(event) =>
                              setResolucaoAtencao(
                                event.target.value
                              )
                            }
                            rows={3}
                            maxLength={5000}
                            placeholder="Registre o que ocorreu e por que esta Atenção pode ser considerada resolvida."
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          />

                          <div className="mt-2 flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={salvandoAtencao}
                              onClick={() =>
                                resolverAtencaoComercial(
                                  atencao.id
                                )
                              }
                            >
                              {salvandoAtencao ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Confirmar resolução
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={salvandoAtencao}
                              onClick={() => {
                                setAtencaoResolvendoId(null)
                                setResolucaoAtencao("")
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {atencoesResolvidas.length > 0 && (
                <details className="rounded-xl border">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                    Histórico de Atenções resolvidas ({atencoesResolvidas.length})
                  </summary>

                  <div className="space-y-3 border-t p-4">
                    {atencoesResolvidas.map(
                      (atencao) => (
                        <div
                          key={atencao.id}
                          className="rounded-lg border bg-slate-50 p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${classeTipoAtencao(
                                atencao.tipo
                              )}`}
                            >
                              {atencao.tipo}
                            </span>
                            <span className="rounded-full border bg-white px-2 py-1 text-xs text-slate-600">
                              Resolvida
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {atencao.representada
                                ? `Representada: ${atencao.representada.nome}`
                                : "Geral do Cliente"}
                            </span>
                          </div>

                          <p className="mt-2 font-semibold">
                            {atencao.titulo}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            {atencao.descricao}
                          </p>

                          {atencao.resolucao && (
                            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                              <p className="text-xs font-semibold text-green-800">
                                Desfecho
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-green-900">
                                {atencao.resolucao}
                              </p>
                            </div>
                          )}

                          <p className="mt-2 text-xs text-muted-foreground">
                            Resolvida em {formatarData(
                              atencao.resolvidoEm
                            )}
                            {atencao.resolvidoPor?.nome
                              ? ` por ${atencao.resolvidoPor.nome}`
                              : ""}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Observações gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {cliente.observacoes ||
                  "Nenhuma observação geral cadastrada."}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card
        id="historico-representadas"
        className={
          abaAtiva === "representadas"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Representadas com compras confirmadas
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Relação derivada de Vendas com status Confirmado, Parcialmente faturado ou Faturado. Clique no nome para abrir a Representada.
          </p>
        </CardHeader>

        <CardContent>
          {loadingRepresentadas ? (
            <LoadingSecao />
          ) : erroRepresentadas ? (
            <ErroSecao
              mensagem={
                erroRepresentadas
              }
            />
          ) : representadasCompras.representadas.length ===
            0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Este Cliente ainda não possui compra confirmada vinculada a uma Representada.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {representadasCompras.representadas.map(
                (
                  representada
                ) => (
                  <button
                    key={
                      representada.id
                    }
                    type="button"
                    onClick={() =>
                      router.push(
                        `/representadas/${representada.id}`
                      )
                    }
                    className="group rounded-lg border bg-background px-3 py-2 text-left transition hover:border-primary/50 hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground group-hover:text-primary">
                        {
                          representada.nome
                        }
                      </span>

                      {representada.status !==
                        "Ativa" && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {
                            representada.status
                          }
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {
                        representada.quantidadeVendas
                      }{" "}
                      venda
                      {
                        representada.quantidadeVendas ===
                        1
                          ? ""
                          : "s"
                      }{" "}
                      confirmada
                      {
                        representada.quantidadeVendas ===
                        1
                          ? ""
                          : "s"
                      }

                      {representada.ultimaVendaEm && (
                        <>
                          {" "}· última em{" "}
                          {formatarDataCurta(
                            representada.ultimaVendaEm
                          )}
                        </>
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        id="historico-interacoes"
        className={
          abaAtiva === "interacoes"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Interações
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Histórico comercial relacionado exclusivamente a este cliente.
              </p>
            </div>

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
        </CardHeader>

        <CardContent>
          <BarraFiltros
            filtros={
              filtrosInteracoes
            }
            setFiltros={
              setFiltrosInteracoes
            }
            aplicar={() => {
              setFiltrosInteracoesAplicados({
                ...filtrosInteracoes,
              })
              setPaginaInteracoes(1)
            }}
            limpar={
              limparInteracoes
            }
            statusOpcoes={
              STATUS_INTERACOES
            }
            tipoOpcoes={
              TIPO_INTERACOES
            }
            placeholderBusca="INT-000123, assunto, descrição, resultado..."
          />

          {historicoInteracoes.loading ? (
            <LoadingSecao />
          ) : historicoInteracoes.erro ? (
            <ErroSecao
              mensagem={
                historicoInteracoes.erro
              }
            />
          ) : historicoInteracoes.dados.length ===
            0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma interação encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="space-y-3">
              {historicoInteracoes.dados.map(
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

                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
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
                            <p className="font-semibold text-slate-900">
                              {
                                interacao.assunto ||
                                "Sem assunto"
                              }
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
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

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

                            <div className="flex items-start gap-2">
                              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Autor
                                </p>

                                <p>
                                  {
                                    interacao.criadoPor?.nome ||
                                    "—"
                                  }
                                </p>
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
                                {
                                  interacao.responsavel?.nome ||
                                  "—"
                                }
                              </p>
                            </div>
                          </div>

                          {interacao.resultado && (
                            <div className="rounded-md bg-muted/40 p-3">
                              <p className="text-xs font-medium text-muted-foreground">
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

          <PaginacaoHistorico
            paginacao={
              historicoInteracoes.paginacao
            }
            pagina={
              paginaInteracoes
            }
            setPagina={
              setPaginaInteracoes
            }
          />
        </CardContent>
      </Card>

      <Card
        id="historico-orcamentos"
        className={
          abaAtiva === "orcamentos"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Orçamentos
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Propostas comerciais vinculadas a este cliente.
              </p>
            </div>

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
        </CardHeader>

        <CardContent>
          <BarraFiltros
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
              setPaginaOrcamentos(1)
            }}
            limpar={
              limparOrcamentos
            }
            statusOpcoes={
              STATUS_ORCAMENTOS
            }
            placeholderBusca="ORC-000123, Representada, descrição, condição..."
          />

          {historicoOrcamentos.loading ? (
            <LoadingSecao />
          ) : historicoOrcamentos.erro ? (
            <ErroSecao
              mensagem={
                historicoOrcamentos.erro
              }
            />
          ) : historicoOrcamentos.dados.length ===
            0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum orçamento encontrado com os filtros atuais.
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
                          Representada
                        </p>

                        <p className="font-medium">
                          {
                            orcamento.representada?.nome ||
                            "—"
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
                          até{" "}
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
                          {formatarMoeda(
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
        id="historico-vendas"
        className={
          abaAtiva === "vendas"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Vendas
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Pedidos e vendas efetivamente vinculados a este cliente.
              </p>
            </div>

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
        </CardHeader>

        <CardContent>
          <BarraFiltros
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
              setPaginaVendas(1)
            }}
            limpar={
              limparVendas
            }
            statusOpcoes={
              STATUS_VENDAS
            }
            placeholderBusca="VEN-000123, pedido, OC, produto, Representada..."
          />

          {historicoVendas.loading ? (
            <LoadingSecao />
          ) : historicoVendas.erro ? (
            <ErroSecao
              mensagem={
                historicoVendas.erro
              }
            />
          ) : historicoVendas.dados.length ===
            0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma venda encontrada com os filtros atuais.
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
                          Representada
                        </p>

                        <p className="font-medium">
                          {
                            venda.representada?.nome ||
                            "—"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Data
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
                          {formatarMoeda(
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
        id="historico-agenda"
        className={
          abaAtiva === "agenda"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Agenda
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Tarefas e compromissos relacionados a este cliente.
              </p>
            </div>

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
        </CardHeader>

        <CardContent>
          <BarraFiltros
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
              setPaginaTarefas(1)
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
            placeholderBusca="Título, descrição, Representada ou responsável..."
          />

          {historicoTarefas.loading ? (
            <LoadingSecao />
          ) : historicoTarefas.erro ? (
            <ErroSecao
              mensagem={
                historicoTarefas.erro
              }
            />
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

                        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
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
        id="historico-faturamentos"
        className={
          abaAtiva === "faturamentos"
            ? "scroll-mt-6"
            : "hidden"
        }
      >
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Faturamentos
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Notas e faturamentos das vendas deste cliente.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  "/faturamentos"
                )
              }
            >
              Abrir Faturamento
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <BarraFiltros
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
              setPaginaFaturamentos(1)
            }}
            limpar={
              limparFaturamentos
            }
            statusOpcoes={
              STATUS_FATURAMENTOS
            }
            placeholderBusca="NF, VEN-000123, pedido, OC ou Representada..."
          />

          {historicoFaturamentos.loading ? (
            <LoadingSecao />
          ) : historicoFaturamentos.erro ? (
            <ErroSecao
              mensagem={
                historicoFaturamentos.erro
              }
            />
          ) : historicoFaturamentos.dados.length ===
            0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum faturamento encontrado com os filtros atuais.
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
                          Representada
                        </p>

                        <p>
                          {
                            faturamento.venda.representada?.nome ||
                            "—"
                          }
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
                          {formatarMoeda(
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
                      Ver Venda
                    </Button>
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

    </div>
  )
}