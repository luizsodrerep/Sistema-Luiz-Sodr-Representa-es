"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Badge,
} from "@/components/ui/badge"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Landmark,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react"

type TipoFinanceiro =
  | "Entrada"
  | "Saida"
  | "SaldoInicial"

type StatusFinanceiro =
  | "Pendente"
  | "Realizado"
  | "Cancelado"

type ResumoFinanceiro = {
  saldoInicial: number
  entradasRealizadas: number
  saidasRealizadas: number
  saldoRealizado: number
  entradasPendentes: number
  saidasPendentes: number
  saldoProjetado: number
  quantidadeVencidas: number
  valorVencido: number
}

type ContaBancariaResumo = {
  id: string
  nome: string
  banco: string | null
  agencia?: string | null
  conta?: string | null
  ativa?: boolean
}

type MovimentoFinanceiro = {
  id: string
  data: string
  tipo: TipoFinanceiro
  categoria: string | null
  descricao: string | null
  origem: string | null
  origemExterna: boolean
  valor: number
  status: StatusFinanceiro
  vencimento: string | null
  contaBancariaId: string | null
  contaBancaria: ContaBancariaResumo | null
  criadoEm: string
  atualizadoEm: string
}

type ContaFinanceira = {
  id: string
  nome: string
  banco: string
  tipoTitular: string
  titular: string | null
  agencia: string | null
  conta: string | null
  pix: string | null
  ativa: boolean
  empresaEscritorioId: string | null
  usuarioTitularId: string | null
  resumo: ResumoFinanceiro
}

type RespostaFinanceiro = {
  movimentos: MovimentoFinanceiro[]
  resumo: ResumoFinanceiro
  contas: ContaFinanceira[]
  semConta: {
    quantidade: number
    resumo: ResumoFinanceiro
  }
}

type FormularioFinanceiro = {
  tipo: TipoFinanceiro
  valor: string
  data: string
  descricao: string
  categoria: string
  origem: string
  origemExterna: boolean
  status: StatusFinanceiro
  vencimento: string
  parcelas: string
  intervaloMeses: string
  contaBancariaId: string
}

type FormularioConta = {
  nome: string
  banco: string
  tipoTitular:
    | "PF"
    | "PJ"
  titular: string
  agencia: string
  conta: string
  pix: string
  observacoes: string
}

type FormularioTransferencia = {
  contaOrigemId: string
  contaDestinoId: string
  valor: string
  data: string
}

type UsuarioSessao = {
  id: string
  escritorioId: string
  nome: string
  email: string
  perfil: string
}

type RespostaSessao = {
  autenticado: boolean
  usuario: UsuarioSessao | null
}

type PartesData = {
  ano: number
  mes: number
  dia: number
}

type TomConfirmacao =
  | "info"
  | "atencao"
  | "perigo"

type DetalheConfirmacao = {
  rotulo: string
  valor: string
  destaque?:
    | "positivo"
    | "negativo"
    | "neutro"
}

type ConfirmacaoInterna = {
  titulo: string
  descricao: string
  tom: TomConfirmacao
  detalhes: DetalheConfirmacao[]
  impactoTitulo?: string
  impactoTexto?: string
  textoBotaoConfirmar: string
  textoBotaoCancelar: string
}

type MovimentoExtratoComSaldo = {
  movimento: MovimentoFinanceiro
  saldoApos: number | null
}

const CATEGORIA_TRANSFERENCIA =
  "Transferência entre contas"

const resumoVazio: ResumoFinanceiro = {
  saldoInicial: 0,
  entradasRealizadas: 0,
  saidasRealizadas: 0,
  saldoRealizado: 0,
  entradasPendentes: 0,
  saidasPendentes: 0,
  saldoProjetado: 0,
  quantidadeVencidas: 0,
  valorVencido: 0,
}

function hojeInput() {
  const agora =
    new Date()

  const ano =
    agora.getFullYear()

  const mes =
    String(
      agora.getMonth() + 1
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

function partesDataOperacional(
  valor: string | null
): PartesData | null {
  if (!valor) {
    return null
  }

  const texto =
    valor.trim()

  const somenteData =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      texto
    )

  if (
    somenteData
  ) {
    return {
      ano:
        Number(
          somenteData[1]
        ),

      mes:
        Number(
          somenteData[2]
        ),

      dia:
        Number(
          somenteData[3]
        ),
    }
  }

  const data =
    new Date(texto)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return {
    ano:
      data.getUTCFullYear(),

    mes:
      data.getUTCMonth() + 1,

    dia:
      data.getUTCDate(),
  }
}

function chaveDia(
  valor: string | null
) {
  const partes =
    partesDataOperacional(
      valor
    )

  if (
    !partes
  ) {
    return null
  }

  return [
    String(
      partes.ano
    ).padStart(
      4,
      "0"
    ),

    String(
      partes.mes
    ).padStart(
      2,
      "0"
    ),

    String(
      partes.dia
    ).padStart(
      2,
      "0"
    ),
  ].join("-")
}

function dataBrasileira(
  valor: string | null
) {
  const partes =
    partesDataOperacional(
      valor
    )

  if (
    !partes
  ) {
    return "-"
  }

  return [
    String(
      partes.dia
    ).padStart(
      2,
      "0"
    ),

    String(
      partes.mes
    ).padStart(
      2,
      "0"
    ),

    String(
      partes.ano
    ).padStart(
      4,
      "0"
    ),
  ].join("/")
}

function dataHojeBrasileira() {
  return dataBrasileira(
    hojeInput()
  )
}

function moeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    }
  ).format(
    valor
  )
}

function normalizarValor(
  valor: string
) {
  const limpo =
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
    !limpo
  ) {
    return Number.NaN
  }

  if (
    limpo.includes(",")
  ) {
    return Number(
      limpo
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        )
    )
  }

  return Number(
    limpo
  )
}

function statusBadge(
  status: StatusFinanceiro
) {
  if (
    status ===
    "Realizado"
  ) {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Realizado
      </Badge>
    )
  }

  if (
    status ===
    "Cancelado"
  ) {
    return (
      <Badge variant="secondary">
        Cancelado
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500 text-amber-700"
    >
      Pendente
    </Badge>
  )
}

function tipoVisivel(
  tipo: TipoFinanceiro
) {
  if (
    tipo ===
    "SaldoInicial"
  ) {
    return "Saldo inicial"
  }

  if (
    tipo ===
    "Saida"
  ) {
    return "Saída"
  }

  return "Entrada"
}

function ehTransferencia(
  movimento: MovimentoFinanceiro
) {
  return (
    movimento.categoria ===
    CATEGORIA_TRANSFERENCIA
  )
}

function descricaoVisivel(
  movimento: MovimentoFinanceiro
) {
  if (
    ehTransferencia(
      movimento
    )
  ) {
    return CATEGORIA_TRANSFERENCIA
  }

  return (
    movimento.descricao ||
    "-"
  )
}

function origemVisivel(
  movimento: MovimentoFinanceiro
) {
  if (
    ehTransferencia(
      movimento
    )
  ) {
    return "Movimentação interna"
  }

  return (
    movimento.origem ||
    "Origem não informada"
  )
}

function valorOriginalAssinado(
  movimento: MovimentoFinanceiro
) {
  if (
    movimento.tipo ===
    "Entrada"
  ) {
    return movimento.valor
  }

  if (
    movimento.tipo ===
    "Saida"
  ) {
    return -movimento.valor
  }

  return movimento.valor
}

function classesTomConfirmacao(
  tom: TomConfirmacao
) {
  if (
    tom ===
    "perigo"
  ) {
    return {
      cabecalho:
        "border-red-200 bg-red-50",
      titulo:
        "text-red-900",
      destaque:
        "border-red-200 bg-red-50 text-red-900",
    }
  }

  if (
    tom ===
    "atencao"
  ) {
    return {
      cabecalho:
        "border-amber-200 bg-amber-50",
      titulo:
        "text-amber-900",
      destaque:
        "border-amber-200 bg-amber-50 text-amber-900",
    }
  }

  return {
    cabecalho:
      "border-blue-200 bg-blue-50",
    titulo:
      "text-blue-900",
    destaque:
      "border-blue-200 bg-blue-50 text-blue-900",
  }
}

function movimentoVencido(
  movimento: MovimentoFinanceiro
) {
  if (
    movimento.status !==
      "Pendente" ||
    movimento.tipo !==
      "Saida" ||
    !movimento.vencimento
  ) {
    return false
  }

  const dia =
    chaveDia(
      movimento.vencimento
    )

  if (
    !dia
  ) {
    return false
  }

  return (
    dia <
    hojeInput()
  )
}

function movimentoHoje(
  movimento: MovimentoFinanceiro
) {
  if (
    movimento.status !==
      "Pendente" ||
    !movimento.vencimento
  ) {
    return false
  }

  return (
    chaveDia(
      movimento.vencimento
    ) ===
    hojeInput()
  )
}

function movimentoFuturo(
  movimento: MovimentoFinanceiro
) {
  if (
    movimento.status !==
      "Pendente" ||
    !movimento.vencimento
  ) {
    return false
  }

  const dia =
    chaveDia(
      movimento.vencimento
    )

  if (
    !dia
  ) {
    return false
  }

  return (
    dia >
    hojeInput()
  )
}

function formularioInicial():
  FormularioFinanceiro {
  return {
    tipo:
      "Saida",

    valor:
      "",

    data:
      hojeInput(),

    descricao:
      "",

    categoria:
      "",

    origem:
      "",

    origemExterna:
      false,

    status:
      "Pendente",

    vencimento:
      hojeInput(),

    parcelas:
      "1",

    intervaloMeses:
      "1",

    contaBancariaId:
      "",
  }
}

function formularioContaInicial():
  FormularioConta {
  return {
    nome:
      "",

    banco:
      "",

    tipoTitular:
      "PF",

    titular:
      "",

    agencia:
      "",

    conta:
      "",

    pix:
      "",

    observacoes:
      "",
  }
}

function formularioTransferenciaInicial():
  FormularioTransferencia {
  return {
    contaOrigemId:
      "",

    contaDestinoId:
      "",

    valor:
      "",

    data:
      hojeInput(),
  }
}

export default function FinanceiroPage() {
  const [
    movimentos,
    setMovimentos,
  ] =
    useState<
      MovimentoFinanceiro[]
    >([])

  const [
    resumo,
    setResumo,
  ] =
    useState<
      ResumoFinanceiro
    >(
      resumoVazio
    )

  const [
    contas,
    setContas,
  ] =
    useState<
      ContaFinanceira[]
    >([])

  const [
    semConta,
    setSemConta,
  ] =
    useState<{
      quantidade:
        number

      resumo:
        ResumoFinanceiro
    }>({
      quantidade:
        0,

      resumo:
        resumoVazio,
    })

  const [
    formulario,
    setFormulario,
  ] =
    useState<
      FormularioFinanceiro
    >(
      formularioInicial()
    )

  const [
    formularioConta,
    setFormularioConta,
  ] =
    useState<
      FormularioConta
    >(
      formularioContaInicial()
    )

  const [
    formularioTransferencia,
    setFormularioTransferencia,
  ] =
    useState<
      FormularioTransferencia
    >(
      formularioTransferenciaInicial()
    )

  const [
    modalContaAberto,
    setModalContaAberto,
  ] =
    useState(
      false
    )

  const [
    modalTransferenciaAberto,
    setModalTransferenciaAberto,
  ] =
    useState(
      false
    )

  const [
    confirmacaoInterna,
    setConfirmacaoInterna,
  ] =
    useState<
      ConfirmacaoInterna | null
    >(
      null
    )

  const resolverConfirmacaoRef =
    useRef<
      ((
        confirmado: boolean
      ) => void) | null
    >(
      null
    )

  const [
    contaExtrato,
    setContaExtrato,
  ] =
    useState<
      ContaFinanceira | null
    >(
      null
    )

  const [
    usuario,
    setUsuario,
  ] =
    useState<
      UsuarioSessao | null
    >(
      null
    )

  const [
    carregando,
    setCarregando,
  ] =
    useState(
      true
    )

  const [
    salvando,
    setSalvando,
  ] =
    useState(
      false
    )

  const [
    salvandoConta,
    setSalvandoConta,
  ] =
    useState(
      false
    )

  const [
    transferindo,
    setTransferindo,
  ] =
    useState(
      false
    )

  const [
    excluindoId,
    setExcluindoId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    mensagem,
    setMensagem,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    busca,
    setBusca,
  ] =
    useState(
      ""
    )

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState(
      "todos"
    )

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState(
      "todos"
    )

  const podeExcluirDefinitivamente =
    usuario?.perfil ===
    "Diretor"

  const contasAtivas =
    useMemo(
      () =>
        contas.filter(
          (
            conta
          ) =>
            conta.ativa
        ),
      [
        contas,
      ]
    )

  const contasOrdenadasPorSaldo =
    useMemo(
      () =>
        [
          ...contas,
        ].sort(
          (
            contaA,
            contaB
          ) => {
            const saldoA =
              contaA.resumo
                .saldoRealizado

            const saldoB =
              contaB.resumo
                .saldoRealizado

            const negativaA =
              saldoA < 0

            const negativaB =
              saldoB < 0

            if (
              negativaA !==
              negativaB
            ) {
              return negativaA
                ? -1
                : 1
            }

            if (
              negativaA &&
              negativaB
            ) {
              return (
                saldoA -
                saldoB
              )
            }

            return (
              saldoB -
              saldoA
            )
          }
        ),
      [
        contas,
      ]
    )

  const contasPessoaJuridica =
    useMemo(
      () =>
        contasOrdenadasPorSaldo.filter(
          (
            conta
          ) =>
            conta.tipoTitular
              .trim()
              .toUpperCase() ===
            "PJ"
        ),
      [
        contasOrdenadasPorSaldo,
      ]
    )

  const contasPessoaFisica =
    useMemo(
      () =>
        contasOrdenadasPorSaldo.filter(
          (
            conta
          ) =>
            conta.tipoTitular
              .trim()
              .toUpperCase() ===
            "PF"
        ),
      [
        contasOrdenadasPorSaldo,
      ]
    )

  const contasSemClassificacao =
    useMemo(
      () =>
        contasOrdenadasPorSaldo.filter(
          (
            conta
          ) => {
            const tipo =
              conta.tipoTitular
                .trim()
                .toUpperCase()

            return (
              tipo !==
                "PJ" &&
              tipo !==
                "PF"
            )
          }
        ),
      [
        contasOrdenadasPorSaldo,
      ]
    )

  const contasNegativas =
    useMemo(
      () =>
        contasOrdenadasPorSaldo.filter(
          (
            conta
          ) =>
            conta.resumo
              .saldoRealizado <
            0
        ),
      [
        contasOrdenadasPorSaldo,
      ]
    )

  const saldoPessoaJuridica =
    useMemo(
      () =>
        contas.reduce(
          (
            total,
            conta
          ) =>
            conta.tipoTitular
              .trim()
              .toUpperCase() ===
            "PJ"
              ? total +
                conta.resumo
                  .saldoRealizado
              : total,
          0
        ),
      [
        contas,
      ]
    )

  const saldoPessoaFisica =
    useMemo(
      () =>
        contas.reduce(
          (
            total,
            conta
          ) =>
            conta.tipoTitular
              .trim()
              .toUpperCase() ===
            "PF"
              ? total +
                conta.resumo
                  .saldoRealizado
              : total,
          0
        ),
      [
        contas,
      ]
    )

  const necessidadeCobertura =
    useMemo(
      () =>
        contasNegativas.reduce(
          (
            total,
            conta
          ) =>
            total +
            Math.abs(
              conta.resumo
                .saldoRealizado
            ),
          0
        ),
      [
        contasNegativas,
      ]
    )

  const carregarSessao =
    useCallback(
      async () => {
        try {
          const resposta =
            await fetch(
              "/api/auth/me",
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            )

          if (
            !resposta.ok
          ) {
            setUsuario(
              null
            )

            return
          }

          const dados =
            (await resposta.json()) as RespostaSessao

          setUsuario(
            dados.autenticado
              ? dados.usuario
              : null
          )
        } catch {
          setUsuario(
            null
          )
        }
      },
      []
    )

  const carregarFinanceiro =
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
              "/api/financeiro",
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            )

          const dados =
            await resposta.json()

          if (
            !resposta.ok
          ) {
            throw new Error(
              dados?.erro ||
                "Não foi possível carregar o Financeiro."
            )
          }

          const financeiro =
            dados as RespostaFinanceiro

          setMovimentos(
            Array.isArray(
              financeiro.movimentos
            )
              ? financeiro.movimentos
              : []
          )

          setResumo(
            financeiro.resumo ??
              resumoVazio
          )

          setContas(
            Array.isArray(
              financeiro.contas
            )
              ? financeiro.contas
              : []
          )

          setSemConta(
            financeiro.semConta ?? {
              quantidade:
                0,

              resumo:
                resumoVazio,
            }
          )
        } catch (
          error
        ) {
          setErro(
            error instanceof
              Error
              ? error.message
              : "Erro ao carregar o Financeiro."
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
      void carregarSessao()

      void carregarFinanceiro()
    },
    [
      carregarSessao,
      carregarFinanceiro,
    ]
  )

  function solicitarConfirmacao(
    dados: ConfirmacaoInterna
  ) {
    return new Promise<boolean>(
      (
        resolver
      ) => {
        resolverConfirmacaoRef.current =
          resolver

        setConfirmacaoInterna(
          dados
        )
      }
    )
  }

  function responderConfirmacao(
    confirmado: boolean
  ) {
    const resolver =
      resolverConfirmacaoRef.current

    resolverConfirmacaoRef.current =
      null

    setConfirmacaoInterna(
      null
    )

    resolver?.(
      confirmado
    )
  }

  function alterarFormulario<
    K extends keyof FormularioFinanceiro
  >(
    campo: K,
    valor:
      FormularioFinanceiro[K]
  ) {
    setFormulario(
      (
        atual
      ) => ({
        ...atual,

        [campo]:
          valor,
      })
    )
  }

  function alterarFormularioConta<
    K extends keyof FormularioConta
  >(
    campo: K,
    valor:
      FormularioConta[K]
  ) {
    setFormularioConta(
      (
        atual
      ) => ({
        ...atual,

        [campo]:
          valor,
      })
    )
  }

  function alterarFormularioTransferencia<
    K extends keyof FormularioTransferencia
  >(
    campo: K,
    valor:
      FormularioTransferencia[K]
  ) {
    setFormularioTransferencia(
      (
        atual
      ) => ({
        ...atual,

        [campo]:
          valor,
      })
    )
  }

  function irParaLancamento() {
    window.setTimeout(
      () => {
        document
          .getElementById(
            "novo-lancamento"
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

  function abrirCadastroConta() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormularioConta(
      formularioContaInicial()
    )

    setModalContaAberto(
      true
    )
  }

  function fecharCadastroConta() {
    if (
      salvandoConta
    ) {
      return
    }

    setModalContaAberto(
      false
    )

    setFormularioConta(
      formularioContaInicial()
    )
  }

  function abrirTransferencia() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    if (
      contasAtivas.length <
      2
    ) {
      setErro(
        "Cadastre pelo menos duas contas ativas antes de fazer uma transferência entre contas."
      )

      return
    }

    setFormularioTransferencia(
      formularioTransferenciaInicial()
    )

    setModalTransferenciaAberto(
      true
    )
  }

  function fecharTransferencia() {
    if (
      transferindo
    ) {
      return
    }

    setModalTransferenciaAberto(
      false
    )

    setFormularioTransferencia(
      formularioTransferenciaInicial()
    )
  }

  function prepararLancamentoNormal() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario(
      formularioInicial()
    )

    irParaLancamento()
  }

  function prepararEntradaExtra() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "Entrada",

      categoria:
        "Receita Extra",

      origem:
        "Atividade Externa",

      origemExterna:
        true,

      status:
        "Pendente",
    })

    irParaLancamento()
  }

  function prepararSaidaExtra() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "Saida",

      categoria:
        "Despesa Extra",

      origem:
        "Despesa Externa",

      origemExterna:
        true,

      status:
        "Pendente",
    })

    irParaLancamento()
  }

  function prepararDivida() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "Saida",

      categoria:
        "Dívida",

      origem:
        "Obrigação Financeira",

      origemExterna:
        false,

      status:
        "Pendente",
    })

    irParaLancamento()
  }

  function prepararCartao() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "Saida",

      categoria:
        "Cartão de crédito",

      origem:
        "Cartão de crédito",

      origemExterna:
        false,

      status:
        "Pendente",

      descricao:
        "Fatura do cartão",
    })

    irParaLancamento()
  }

  function prepararAcordo() {
    setErro(
      null
    )

    setMensagem(
      null
    )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "Saida",

      categoria:
        "Acordo / Renegociação",

      origem:
        "Renegociação",

      origemExterna:
        false,

      status:
        "Pendente",
    })

    irParaLancamento()
  }

  function prepararSaldoInicial(
    contaId = ""
  ) {
    setErro(
      null
    )

    setMensagem(
      null
    )

    const contaSelecionada =
      contas.find(
        (
          conta
        ) =>
          conta.id ===
          contaId
      )

    setFormulario({
      ...formularioInicial(),

      tipo:
        "SaldoInicial",

      categoria:
        "Saldo inicial",

      origem:
        "Abertura financeira",

      origemExterna:
        false,

      status:
        "Realizado",

      vencimento:
        "",

      contaBancariaId:
        contaId,

      descricao:
        contaSelecionada
          ? `Saldo inicial ${contaSelecionada.nome}`
          : "Saldo inicial",
    })

    irParaLancamento()
  }

  function contaPossuiSaldoInicial(
    contaId: string
  ) {
    return movimentos.some(
      (
        movimento
      ) =>
        movimento.tipo ===
          "SaldoInicial" &&
        movimento.contaBancariaId ===
          contaId &&
        movimento.status !==
          "Cancelado"
    )
  }

  async function salvarConta() {
    try {
      setErro(
        null
      )

      setMensagem(
        null
      )

      if (
        !formularioConta.nome.trim()
      ) {
        throw new Error(
          "Informe um nome para identificar a conta."
        )
      }

      if (
        !formularioConta.banco.trim()
      ) {
        throw new Error(
          "Informe o banco ou instituição financeira."
        )
      }

      setSalvandoConta(
        true
      )

      const resposta =
        await fetch(
          "/api/contas-bancarias",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                nome:
                  formularioConta.nome.trim(),

                banco:
                  formularioConta.banco.trim(),

                tipoTitular:
                  formularioConta.tipoTitular,

                titular:
                  formularioConta.titular.trim() ||
                  null,

                agencia:
                  formularioConta.agencia.trim() ||
                  null,

                conta:
                  formularioConta.conta.trim() ||
                  null,

                pix:
                  formularioConta.pix.trim() ||
                  null,

                observacoes:
                  formularioConta.observacoes.trim() ||
                  null,

                ativa:
                  true,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () =>
              null
          )

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados?.message ||
            "Não foi possível cadastrar a conta."
        )
      }

      const novaContaId =
        typeof dados?.data?.id ===
        "string"
          ? dados.data.id
          : ""

      const novaContaNome =
        typeof dados?.data?.nome ===
        "string"
          ? dados.data.nome
          : "da conta"

      setFormularioConta(
        formularioContaInicial()
      )

      setModalContaAberto(
        false
      )

      await carregarFinanceiro()

      setMensagem(
        "Conta cadastrada com sucesso. Agora informe o saldo atual dela."
      )

      if (
        novaContaId
      ) {
        setFormulario({
          ...formularioInicial(),

          tipo:
            "SaldoInicial",

          categoria:
            "Saldo inicial",

          origem:
            "Abertura financeira",

          origemExterna:
            false,

          status:
            "Realizado",

          vencimento:
            "",

          contaBancariaId:
            novaContaId,

          descricao:
            `Saldo inicial ${novaContaNome}`,
        })

        irParaLancamento()
      }
    } catch (
      error
    ) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao cadastrar a conta."
      )
    } finally {
      setSalvandoConta(
        false
      )
    }
  }

  async function salvarTransferencia() {
    try {
      setErro(
        null
      )

      setMensagem(
        null
      )

      const contaOrigem =
        contasAtivas.find(
          (
            conta
          ) =>
            conta.id ===
            formularioTransferencia.contaOrigemId
        )

      const contaDestino =
        contasAtivas.find(
          (
            conta
          ) =>
            conta.id ===
            formularioTransferencia.contaDestinoId
        )

      if (
        !contaOrigem
      ) {
        throw new Error(
          "Selecione a conta de origem."
        )
      }

      if (
        !contaDestino
      ) {
        throw new Error(
          "Selecione a conta de destino."
        )
      }

      if (
        contaOrigem.id ===
        contaDestino.id
      ) {
        throw new Error(
          "A conta de origem e a conta de destino precisam ser diferentes."
        )
      }

      const valor =
        normalizarValor(
          formularioTransferencia.valor
        )

      if (
        !Number.isFinite(
          valor
        ) ||
        valor <= 0
      ) {
        throw new Error(
          "Informe um valor de transferência maior que zero."
        )
      }

      if (
        !formularioTransferencia.data
      ) {
        throw new Error(
          "Informe a data da transferência."
        )
      }

      const confirmacao =
        await solicitarConfirmacao({
          titulo:
            "Confirmar transferência",
          descricao:
            "Confira as duas contas e o valor antes de registrar a movimentação.",
          tom:
            "info",
          detalhes: [
            {
              rotulo:
                "Conta de origem",
              valor:
                `${contaOrigem.nome} — ${contaOrigem.banco}`,
            },
            {
              rotulo:
                "Saldo atual da origem",
              valor:
                moeda(
                  contaOrigem.resumo
                    .saldoRealizado
                ),
              destaque:
                contaOrigem.resumo
                  .saldoRealizado <
                0
                  ? "negativo"
                  : "neutro",
            },
            {
              rotulo:
                "Saldo após a transferência",
              valor:
                moeda(
                  contaOrigem.resumo
                    .saldoRealizado -
                    valor
                ),
              destaque:
                contaOrigem.resumo
                  .saldoRealizado -
                    valor <
                0
                  ? "negativo"
                  : "neutro",
            },
            {
              rotulo:
                "Conta de destino",
              valor:
                `${contaDestino.nome} — ${contaDestino.banco}`,
            },
            {
              rotulo:
                "Saldo atual do destino",
              valor:
                moeda(
                  contaDestino.resumo
                    .saldoRealizado
                ),
              destaque:
                contaDestino.resumo
                  .saldoRealizado <
                0
                  ? "negativo"
                  : "neutro",
            },
            {
              rotulo:
                "Saldo após o recebimento",
              valor:
                moeda(
                  contaDestino.resumo
                    .saldoRealizado +
                    valor
                ),
              destaque:
                contaDestino.resumo
                  .saldoRealizado +
                    valor <
                0
                  ? "negativo"
                  : "positivo",
            },
            {
              rotulo:
                "Valor",
              valor:
                moeda(
                  valor
                ),
            },
            {
              rotulo:
                "Data",
              valor:
                dataBrasileira(
                  formularioTransferencia.data
                ),
            },
          ],
          impactoTitulo:
            "Impacto da transferência",
          impactoTexto:
            "A conta de origem será reduzida, a conta de destino será aumentada e o saldo consolidado do escritório não será alterado. O CRM apenas registra a movimentação; ele não executa PIX ou transferência bancária.",
          textoBotaoConfirmar:
            "Registrar transferência",
          textoBotaoCancelar:
            "Voltar e corrigir",
        })

      if (
        !confirmacao
      ) {
        return
      }

      setTransferindo(
        true
      )

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                operacao:
                  "Transferencia",

                contaOrigemId:
                  contaOrigem.id,

                contaDestinoId:
                  contaDestino.id,

                valor,

                data:
                  formularioTransferencia.data,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () =>
              null
          )

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados?.erro ||
            "Não foi possível registrar a transferência."
        )
      }

      setModalTransferenciaAberto(
        false
      )

      setFormularioTransferencia(
        formularioTransferenciaInicial()
      )

      setMensagem(
        "Transferência entre contas registrada com sucesso."
      )

      await carregarFinanceiro()
    } catch (
      error
    ) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao registrar a transferência."
      )
    } finally {
      setTransferindo(
        false
      )
    }
  }

  async function salvarLancamento() {
    try {
      setErro(
        null
      )

      setMensagem(
        null
      )

      const valor =
        normalizarValor(
          formulario.valor
        )

      if (
        !Number.isFinite(
          valor
        )
      ) {
        throw new Error(
          "Informe um valor válido."
        )
      }

      if (
        formulario.tipo !==
          "SaldoInicial" &&
        valor <= 0
      ) {
        throw new Error(
          "Entradas e saídas devem ter valor maior que zero."
        )
      }

      if (
        formulario.tipo ===
          "SaldoInicial" &&
        valor === 0
      ) {
        throw new Error(
          "O saldo inicial não pode ser zero."
        )
      }

      if (
        !formulario.descricao.trim()
      ) {
        throw new Error(
          "Informe uma descrição."
        )
      }

      if (
        formulario.tipo ===
          "SaldoInicial" &&
        !formulario.contaBancariaId
      ) {
        throw new Error(
          "Selecione a conta para informar o saldo inicial."
        )
      }

      if (
        formulario.status ===
          "Pendente" &&
        formulario.tipo !==
          "SaldoInicial" &&
        !formulario.vencimento
      ) {
        throw new Error(
          "Informe a data de vencimento."
        )
      }

      const parcelas =
        Number(
          formulario.parcelas
        )

      const intervaloMeses =
        Number(
          formulario.intervaloMeses
        )

      if (
        !Number.isInteger(
          parcelas
        ) ||
        parcelas <= 0
      ) {
        throw new Error(
          "Informe uma quantidade válida de parcelas."
        )
      }

      if (
        !Number.isInteger(
          intervaloMeses
        ) ||
        intervaloMeses <= 0
      ) {
        throw new Error(
          "Informe um intervalo válido entre parcelas."
        )
      }

      const contaSelecionada =
        contas.find(
          (
            conta
          ) =>
            conta.id ===
            formulario.contaBancariaId
        )

      const situacaoLancamento =
        formulario.tipo ===
        "SaldoInicial"
          ? "Realizado"
          : formulario.status

      const detalhesConfirmacao:
        DetalheConfirmacao[] = [
          {
            rotulo:
              "Tipo",
            valor:
              tipoVisivel(
                formulario.tipo
              ),
          },
          {
            rotulo:
              "Descrição",
            valor:
              formulario.descricao.trim(),
          },
          {
            rotulo:
              "Categoria",
            valor:
              formulario.categoria.trim() ||
              "Não informada",
          },
          {
            rotulo:
              "Conta",
            valor:
              contaSelecionada
                ? `${contaSelecionada.nome} — ${contaSelecionada.banco}`
                : "Sem conta definida",
          },
          {
            rotulo:
              "Valor",
            valor:
              moeda(
                valor
              ),
            destaque:
              formulario.tipo ===
              "Entrada"
                ? "positivo"
                : formulario.tipo ===
                  "Saida"
                  ? "negativo"
                  : "neutro",
          },
          {
            rotulo:
              "Data",
            valor:
              dataBrasileira(
                formulario.data
              ),
          },
          {
            rotulo:
              "Situação",
            valor:
              situacaoLancamento,
          },
        ]

      if (
        formulario.status ===
          "Pendente" &&
        formulario.tipo !==
          "SaldoInicial"
      ) {
        detalhesConfirmacao.push({
          rotulo:
            "Vencimento",
          valor:
            dataBrasileira(
              formulario.vencimento
            ),
        })
      }

      if (
        parcelas >
        1
      ) {
        detalhesConfirmacao.push({
          rotulo:
            "Parcelas",
          valor:
            String(
              parcelas
            ),
        })
      }

      if (
        contaSelecionada &&
        situacaoLancamento ===
          "Realizado"
      ) {
        const impacto =
          formulario.tipo ===
          "Entrada"
            ? valor
            : formulario.tipo ===
              "Saida"
              ? -valor
              : valor

        const saldoDepois =
          contaSelecionada.resumo
            .saldoRealizado +
          impacto

        detalhesConfirmacao.push(
          {
            rotulo:
              "Saldo atual da conta",
            valor:
              moeda(
                contaSelecionada.resumo
                  .saldoRealizado
              ),
            destaque:
              contaSelecionada.resumo
                .saldoRealizado <
              0
                ? "negativo"
                : "neutro",
          },
          {
            rotulo:
              "Saldo após o lançamento",
            valor:
              moeda(
                saldoDepois
              ),
            destaque:
              saldoDepois <
              0
                ? "negativo"
                : "positivo",
          }
        )
      }

      const confirmacao =
        await solicitarConfirmacao({
          titulo:
            "Confirmar lançamento financeiro",
          descricao:
            "Confira os dados antes de gravar o lançamento no Financeiro.",
          tom:
            formulario.tipo ===
            "Saida"
              ? "atencao"
              : "info",
          detalhes:
            detalhesConfirmacao,
          impactoTitulo:
            situacaoLancamento ===
            "Realizado"
              ? "Impacto no saldo atual"
              : "Impacto no saldo projetado",
          impactoTexto:
            situacaoLancamento ===
            "Realizado"
              ? formulario.tipo ===
                "Entrada"
                ? `Esta entrada aumentará o saldo realizado em ${moeda(
                    valor
                  )}.`
                : formulario.tipo ===
                  "Saida"
                  ? `Esta saída reduzirá o saldo realizado em ${moeda(
                      valor
                    )}.`
                  : "O saldo inicial passará a compor o saldo realizado da conta selecionada."
              : `Este lançamento permanecerá pendente e afetará somente a projeção financeira até ser realizado.`,
          textoBotaoConfirmar:
            "Confirmar lançamento",
          textoBotaoCancelar:
            "Voltar e corrigir",
        })

      if (
        !confirmacao
      ) {
        return
      }

      setSalvando(
        true
      )

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                tipo:
                  formulario.tipo,

                valor,

                data:
                  formulario.data,

                descricao:
                  formulario.descricao.trim(),

                categoria:
                  formulario.categoria.trim() ||
                  null,

                origem:
                  formulario.origem.trim() ||
                  null,

                origemExterna:
                  formulario.tipo ===
                  "SaldoInicial"
                    ? false
                    : formulario.origemExterna,

                status:
                  formulario.tipo ===
                  "SaldoInicial"
                    ? "Realizado"
                    : formulario.status,

                vencimento:
                  formulario.status ===
                    "Pendente" &&
                  formulario.tipo !==
                    "SaldoInicial"
                    ? formulario.vencimento
                    : null,

                parcelas:
                  formulario.status ===
                    "Pendente"
                    ? parcelas
                    : 1,

                intervaloMeses:
                  formulario.status ===
                    "Pendente"
                    ? intervaloMeses
                    : 1,

                contaBancariaId:
                  formulario.contaBancariaId ||
                  null,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () =>
              null
          )

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados?.erro ||
            "Não foi possível salvar o lançamento."
        )
      }

      setMensagem(
        formulario.status ===
          "Pendente" &&
        parcelas > 1
          ? `${parcelas} parcelas cadastradas com sucesso.`
          : "Lançamento cadastrado com sucesso."
      )

      setFormulario(
        formularioInicial()
      )

      await carregarFinanceiro()
    } catch (
      error
    ) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao salvar o lançamento."
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  async function executarAcao(
    id: string,
    acao:
      | "realizar"
      | "cancelar"
  ) {
    try {
      setErro(
        null
      )

      setMensagem(
        null
      )

      if (
        acao ===
        "cancelar"
      ) {
        const movimento =
          movimentos.find(
            (
              item
            ) =>
              item.id ===
              id
          )

        const confirmado =
          await solicitarConfirmacao({
            titulo:
              "Cancelar lançamento?",
            descricao:
              "O registro continuará no histórico, mas deixará de afetar os saldos.",
            tom:
              "atencao",
            detalhes:
              movimento
                ? [
                    {
                      rotulo:
                        "Descrição",
                      valor:
                        descricaoVisivel(
                          movimento
                        ),
                    },
                    {
                      rotulo:
                        "Tipo",
                      valor:
                        tipoVisivel(
                          movimento.tipo
                        ),
                    },
                    {
                      rotulo:
                        "Valor",
                      valor:
                        moeda(
                          movimento.valor
                        ),
                      destaque:
                        movimento.tipo ===
                        "Entrada"
                          ? "positivo"
                          : movimento.tipo ===
                            "Saida"
                            ? "negativo"
                            : "neutro",
                    },
                    {
                      rotulo:
                        "Conta",
                      valor:
                        movimento.contaBancaria
                          ? `${movimento.contaBancaria.nome} — ${movimento.contaBancaria.banco || ""}`
                          : "Sem conta definida",
                    },
                  ]
                : [],
            impactoTitulo:
              "O que acontecerá",
            impactoTexto:
              movimento &&
              ehTransferencia(
                movimento
              )
                ? "As duas pontas da transferência serão canceladas juntas e permanecerão no histórico."
                : "O lançamento permanecerá no histórico e deixará de compor os saldos financeiros.",
            textoBotaoConfirmar:
              "Cancelar lançamento",
            textoBotaoCancelar:
              "Manter lançamento",
          })

        if (
          !confirmado
        ) {
          return
        }
      }

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id,
                acao,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () =>
              null
          )

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados?.erro ||
            "Não foi possível atualizar o lançamento."
        )
      }

      setMensagem(
        dados?.message ||
          (
            acao ===
            "realizar"
              ? "Lançamento realizado com sucesso."
              : "Lançamento cancelado com sucesso."
          )
      )

      await carregarFinanceiro()
    } catch (
      error
    ) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao atualizar o lançamento."
      )
    }
  }

  async function excluirDefinitivamente(
    movimento:
      MovimentoFinanceiro
  ) {
    try {
      setErro(
        null
      )

      setMensagem(
        null
      )

      if (
        !podeExcluirDefinitivamente
      ) {
        throw new Error(
          "Somente o Diretor pode excluir definitivamente um lançamento financeiro."
        )
      }

      const transferencia =
        ehTransferencia(
          movimento
        )

      const primeiraConfirmacao =
        await solicitarConfirmacao({
          titulo:
            "Excluir lançamento definitivamente?",
          descricao:
            "Esta é uma operação destrutiva. Para correções operacionais comuns, prefira Cancelar lançamento.",
          tom:
            "perigo",
          detalhes: [
            {
              rotulo:
                "Descrição",
              valor:
                descricaoVisivel(
                  movimento
                ),
            },
            {
              rotulo:
                "Tipo",
              valor:
                tipoVisivel(
                  movimento.tipo
                ),
            },
            {
              rotulo:
                "Valor",
              valor:
                moeda(
                  movimento.valor
                ),
              destaque:
                movimento.tipo ===
                "Entrada"
                  ? "positivo"
                  : movimento.tipo ===
                    "Saida"
                    ? "negativo"
                    : "neutro",
            },
            {
              rotulo:
                "Status",
              valor:
                movimento.status,
            },
            {
              rotulo:
                "Conta",
              valor:
                movimento.contaBancaria
                  ? `${movimento.contaBancaria.nome} — ${movimento.contaBancaria.banco || ""}`
                  : "Sem conta definida",
            },
          ],
          impactoTitulo:
            "Atenção",
          impactoTexto:
            transferencia
              ? "Esta é uma transferência entre contas. As duas pontas vinculadas serão excluídas definitivamente e os saldos serão recalculados."
              : "O registro será removido definitivamente do Financeiro e os saldos serão recalculados.",
          textoBotaoConfirmar:
            "Continuar para última confirmação",
          textoBotaoCancelar:
            "Não excluir",
        })

      if (
        !primeiraConfirmacao
      ) {
        return
      }

      const segundaConfirmacao =
        await solicitarConfirmacao({
          titulo:
            "Última confirmação",
          descricao:
            "Depois desta confirmação, a exclusão será executada.",
          tom:
            "perigo",
          detalhes: [
            {
              rotulo:
                "Registro",
              valor:
                descricaoVisivel(
                  movimento
                ),
            },
            {
              rotulo:
                "Valor",
              valor:
                moeda(
                  movimento.valor
                ),
              destaque:
                "negativo",
            },
          ],
          impactoTitulo:
            "Exclusão definitiva",
          impactoTexto:
            transferencia
              ? "A transferência completa será apagada definitivamente."
              : "Este lançamento será apagado definitivamente.",
          textoBotaoConfirmar:
            "Excluir definitivamente",
          textoBotaoCancelar:
            "Voltar sem excluir",
        })

      if (
        !segundaConfirmacao
      ) {
        return
      }

      setExcluindoId(
        movimento.id
      )

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id:
                  movimento.id,
              }),
          }
        )

      const dados =
        await resposta
          .json()
          .catch(
            () =>
              null
          )

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados?.erro ||
            "Não foi possível excluir definitivamente."
        )
      }

      setMensagem(
        dados?.mensagem ||
          "Lançamento excluído definitivamente."
      )

      await carregarFinanceiro()

      if (
        contaExtrato
      ) {
        const contaAtualizada =
          contas.find(
            (
              conta
            ) =>
              conta.id ===
              contaExtrato.id
          )

        if (
          contaAtualizada
        ) {
          setContaExtrato(
            contaAtualizada
          )
        }
      }
    } catch (
      error
    ) {
      setErro(
        error instanceof
          Error
          ? error.message
          : "Erro ao excluir o lançamento."
      )
    } finally {
      setExcluindoId(
        null
      )
    }
  }

  const contasPagar =
    useMemo(
      () =>
        movimentos.filter(
          (
            movimento
          ) =>
            movimento.tipo ===
              "Saida" &&
            movimento.status ===
              "Pendente"
        ),
      [
        movimentos,
      ]
    )

  const contasReceber =
    useMemo(
      () =>
        movimentos.filter(
          (
            movimento
          ) =>
            movimento.tipo ===
              "Entrada" &&
            movimento.status ===
              "Pendente"
        ),
      [
        movimentos,
      ]
    )

  const vencidas =
    useMemo(
      () =>
        movimentos.filter(
          movimentoVencido
        ),
      [
        movimentos,
      ]
    )

  const hoje =
    useMemo(
      () =>
        movimentos.filter(
          movimentoHoje
        ),
      [
        movimentos,
      ]
    )

  const futuras =
    useMemo(
      () =>
        movimentos.filter(
          movimentoFuturo
        ),
      [
        movimentos,
      ]
    )

  const realizados =
    useMemo(
      () =>
        movimentos.filter(
          (
            movimento
          ) =>
            movimento.status ===
            "Realizado"
        ),
      [
        movimentos,
      ]
    )

  const movimentosFiltrados =
    useMemo(
      () => {
        const texto =
          busca
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            )

        return movimentos.filter(
          (
            movimento
          ) => {
            const atendeBusca =
              !texto ||
              [
                descricaoVisivel(
                  movimento
                ),

                movimento.categoria,

                ehTransferencia(
                  movimento
                )
                  ? "transferência"
                  : movimento.origem,

                movimento
                  .contaBancaria
                  ?.nome,

                movimento
                  .contaBancaria
                  ?.banco,
              ]
                .filter(
                  Boolean
                )
                .some(
                  (
                    valor
                  ) =>
                    String(
                      valor
                    )
                      .toLocaleLowerCase(
                        "pt-BR"
                      )
                      .includes(
                        texto
                      )
                )

            const atendeTipo =
              filtroTipo ===
                "todos" ||
              movimento.tipo ===
                filtroTipo

            const atendeStatus =
              filtroStatus ===
                "todos" ||
              movimento.status ===
                filtroStatus

            return (
              atendeBusca &&
              atendeTipo &&
              atendeStatus
            )
          }
        )
      },
      [
        movimentos,
        busca,
        filtroTipo,
        filtroStatus,
      ]
    )

  const movimentosExtrato =
    useMemo(
      () => {
        if (
          !contaExtrato
        ) {
          return []
        }

        return movimentos.filter(
          (
            movimento
          ) =>
            movimento.contaBancariaId ===
            contaExtrato.id
        )
      },
      [
        movimentos,
        contaExtrato,
      ]
    )

  const movimentosExtratoComSaldo =
    useMemo<
      MovimentoExtratoComSaldo[]
    >(
      () => {
        const ordenados =
          [
            ...movimentosExtrato,
          ].sort(
            (
              movimentoA,
              movimentoB
            ) => {
              const dataA =
                new Date(
                  movimentoA.data
                ).getTime()

              const dataB =
                new Date(
                  movimentoB.data
                ).getTime()

              if (
                dataA !==
                dataB
              ) {
                return (
                  dataA -
                  dataB
                )
              }

              return (
                new Date(
                  movimentoA.criadoEm
                ).getTime() -
                new Date(
                  movimentoB.criadoEm
                ).getTime()
              )
            }
          )

        let saldo =
          0

        const calculados =
          ordenados.map(
            (
              movimento
            ) => {
              if (
                movimento.status ===
                "Realizado"
              ) {
                saldo +=
                  valorOriginalAssinado(
                    movimento
                  )
              }

              return {
                movimento,
                saldoApos:
                  movimento.status ===
                  "Realizado"
                    ? saldo
                    : null,
              }
            }
          )

        return calculados.reverse()
      },
      [
        movimentosExtrato,
      ]
    )

  function tabelaMovimentos(
    lista:
      MovimentoFinanceiro[]
  ) {
    if (
      carregando
    ) {
      return (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando lançamentos...
        </div>
      )
    }

    if (
      lista.length ===
      0
    ) {
      return (
        <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Nenhum lançamento encontrado.
        </div>
      )
    }

    return (
      <div className="max-h-[65vh] overflow-auto rounded-md border">
        <Table className="min-w-[820px] table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            <TableRow>
              <TableHead className="w-[175px]">
                Situação / Ações
              </TableHead>

              <TableHead className="w-[225px]">
                Descrição
              </TableHead>

              <TableHead className="w-[105px]">
                Categoria
              </TableHead>

              <TableHead className="w-[135px]">
                Conta
              </TableHead>

              <TableHead className="w-[115px]">
                Datas
              </TableHead>

              <TableHead className="w-[100px] text-right">
                Valor
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lista.map(
              (
                movimento
              ) => {
                const vencido =
                  movimentoVencido(
                    movimento
                  )

                const venceHoje =
                  movimentoHoje(
                    movimento
                  )

                const excluindo =
                  excluindoId ===
                  movimento.id

                const transferencia =
                  ehTransferencia(
                    movimento
                  )

                return (
                  <TableRow
                    key={
                      movimento.id
                    }
                    className={
                      vencido
                        ? "bg-red-50"
                        : venceHoje
                          ? "bg-amber-50"
                          : undefined
                    }
                  >
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {statusBadge(
                            movimento.status
                          )}

                          <span className="text-xs font-medium text-muted-foreground">
                            {tipoVisivel(
                              movimento.tipo
                            )}
                          </span>
                        </div>

                        {transferencia && (
                          <Badge
                            variant="outline"
                            className="w-fit text-[11px]"
                          >
                            Transferência
                          </Badge>
                        )}

                        {vencido && (
                          <span className="text-xs font-semibold text-red-600">
                            Vencido
                          </span>
                        )}

                        {venceHoje && (
                          <span className="text-xs font-semibold text-amber-700">
                            Vence hoje
                          </span>
                        )}

                        <div className="mt-1 grid gap-1 border-t pt-2">
                          {movimento.status ===
                            "Pendente" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-full justify-center px-2 text-xs"
                                onClick={() =>
                                  void executarAcao(
                                    movimento.id,
                                    "realizar"
                                  )
                                }
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />

                                {movimento.tipo ===
                                "Entrada"
                                  ? "Receber"
                                  : "Pagar"}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-full justify-center px-2 text-xs"
                                onClick={() =>
                                  void executarAcao(
                                    movimento.id,
                                    "cancelar"
                                  )
                                }
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />

                                Cancelar
                              </Button>
                            </>
                          )}

                          {movimento.status ===
                            "Realizado" &&
                            movimento.tipo !==
                              "SaldoInicial" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-full justify-center px-2 text-xs"
                                onClick={() =>
                                  void executarAcao(
                                    movimento.id,
                                    "cancelar"
                                  )
                                }
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />

                                {transferencia
                                  ? "Cancelar transf."
                                  : "Cancelar"}
                              </Button>
                            )}

                          {podeExcluirDefinitivamente && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-full justify-center px-2 text-xs"
                              disabled={
                                excluindo
                              }
                              onClick={() =>
                                void excluirDefinitivamente(
                                  movimento
                                )
                              }
                            >
                              {excluindo ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                              )}

                              Excluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="break-words">
                        <div className="font-medium">
                          {descricaoVisivel(
                            movimento
                          )}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {transferencia
                            ? "Movimentação entre contas próprias"
                            : `Origem: ${origemVisivel(
                                movimento
                              )}`}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top break-words">
                      {movimento.categoria ||
                        "-"}
                    </TableCell>

                    <TableCell className="align-top">
                      {movimento.contaBancaria ? (
                        <div className="break-words">
                          <div className="font-medium">
                            {
                              movimento
                                .contaBancaria
                                .nome
                            }
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {
                              movimento
                                .contaBancaria
                                .banco
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem conta definida
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                            Data
                          </span>

                          {dataBrasileira(
                            movimento.data
                          )}
                        </div>

                        {movimento.vencimento && (
                          <div>
                            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                              Venc.
                            </span>

                            <span
                              className={
                                vencido
                                  ? "font-semibold text-red-600"
                                  : venceHoje
                                    ? "font-semibold text-amber-700"
                                    : undefined
                              }
                            >
                              {dataBrasileira(
                                movimento.vencimento
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-right">
                      <span
                        className={
                          movimento.status ===
                          "Cancelado"
                            ? "text-muted-foreground line-through"
                            : movimento.tipo ===
                                "Entrada"
                              ? "font-semibold text-green-600"
                              : movimento.tipo ===
                                  "Saida"
                                ? "font-semibold text-red-600"
                                : movimento.valor <
                                    0
                                  ? "font-semibold text-red-600"
                                  : "font-semibold"
                        }
                      >
                        {moeda(
                          movimento.valor
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              }
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <PageLayout title="Financeiro">
      <NavigationButtons
        backLabel="Voltar"
        backHref="/dashboard"
      />

      {confirmacaoInterna && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
            <div
              className={`shrink-0 border-b px-5 py-4 sm:px-6 ${
                classesTomConfirmacao(
                  confirmacaoInterna.tom
                ).cabecalho
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className={`text-lg font-semibold sm:text-xl ${
                      classesTomConfirmacao(
                        confirmacaoInterna.tom
                      ).titulo
                    }`}
                  >
                    {
                      confirmacaoInterna.titulo
                    }
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      confirmacaoInterna.descricao
                    }
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    responderConfirmacao(
                      false
                    )
                  }
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {confirmacaoInterna.detalhes.length >
                0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {confirmacaoInterna.detalhes.map(
                    (
                      detalhe,
                      indice
                    ) => (
                      <div
                        key={`${detalhe.rotulo}-${indice}`}
                        className="rounded-lg border bg-background p-3"
                      >
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {
                            detalhe.rotulo
                          }
                        </div>

                        <div
                          className={`mt-1 break-words text-sm font-semibold ${
                            detalhe.destaque ===
                            "positivo"
                              ? "text-green-700"
                              : detalhe.destaque ===
                                  "negativo"
                                ? "text-red-700"
                                : ""
                          }`}
                        >
                          {
                            detalhe.valor
                          }
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {confirmacaoInterna.impactoTexto && (
                <div
                  className={`mt-4 rounded-lg border p-4 ${
                    classesTomConfirmacao(
                      confirmacaoInterna.tom
                    ).destaque
                  }`}
                >
                  {confirmacaoInterna.impactoTitulo && (
                    <div className="font-semibold">
                      {
                        confirmacaoInterna.impactoTitulo
                      }
                    </div>
                  )}

                  <p className="mt-1 text-sm leading-relaxed">
                    {
                      confirmacaoInterna.impactoTexto
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  responderConfirmacao(
                    false
                  )
                }
              >
                {
                  confirmacaoInterna.textoBotaoCancelar
                }
              </Button>

              <Button
                type="button"
                variant={
                  confirmacaoInterna.tom ===
                  "perigo"
                    ? "destructive"
                    : "default"
                }
                onClick={() =>
                  responderConfirmacao(
                    true
                  )
                }
              >
                {
                  confirmacaoInterna.textoBotaoConfirmar
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalContaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b bg-background px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Cadastrar nova conta
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre somente contas onde exista saldo financeiro.
                  Cartões de crédito devem ser registrados como
                  fatura/obrigação no lançamento financeiro.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={
                  salvandoConta
                }
                onClick={
                  fecharCadastroConta
                }
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Nome da conta *
                  </Label>

                  <Input
                    value={
                      formularioConta.nome
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "nome",
                        evento.target.value
                      )
                    }
                    placeholder="Ex.: Itaú Pessoal"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Banco / instituição *
                  </Label>

                  <Input
                    value={
                      formularioConta.banco
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "banco",
                        evento.target.value
                      )
                    }
                    placeholder="Ex.: Itaú"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Tipo de titular
                  </Label>

                  <Select
                    value={
                      formularioConta.tipoTitular
                    }
                    onValueChange={(
                      valor
                    ) =>
                      alterarFormularioConta(
                        "tipoTitular",
                        valor as
                          | "PF"
                          | "PJ"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="PF">
                        Pessoa Física
                      </SelectItem>

                      <SelectItem value="PJ">
                        Pessoa Jurídica
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Titular
                  </Label>

                  <Input
                    value={
                      formularioConta.titular
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "titular",
                        evento.target.value
                      )
                    }
                    placeholder="Nome do titular"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Agência
                  </Label>

                  <Input
                    value={
                      formularioConta.agencia
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "agencia",
                        evento.target.value
                      )
                    }
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Conta
                  </Label>

                  <Input
                    value={
                      formularioConta.conta
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "conta",
                        evento.target.value
                      )
                    }
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Pix
                  </Label>

                  <Input
                    value={
                      formularioConta.pix
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "pix",
                        evento.target.value
                      )
                    }
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Observações
                  </Label>

                  <Input
                    value={
                      formularioConta.observacoes
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioConta(
                        "observacoes",
                        evento.target.value
                      )
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Depois de cadastrar a conta, o sistema direcionará você
                para informar o saldo atual dela. O saldo poderá ser
                positivo ou negativo.
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    salvandoConta
                  }
                  onClick={
                    fecharCadastroConta
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  disabled={
                    salvandoConta
                  }
                  onClick={() =>
                    void salvarConta()
                  }
                >
                  {salvandoConta ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Salvando...
                    </>
                  ) : (
                    <>
                      <Landmark className="mr-2 h-4 w-4" />

                      Cadastrar conta
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalTransferenciaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Transferência entre contas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Transfere recursos entre duas contas próprias sem
                  criar receita ou despesa e sem alterar o saldo
                  consolidado.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={
                  transferindo
                }
                onClick={
                  fecharTransferencia
                }
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Conta de origem *
                  </Label>

                  <Select
                    value={
                      formularioTransferencia.contaOrigemId ||
                      "sem-origem"
                    }
                    onValueChange={(
                      valor
                    ) =>
                      alterarFormularioTransferencia(
                        "contaOrigemId",
                        valor ===
                          "sem-origem"
                          ? ""
                          : valor
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="sem-origem">
                        Selecione a conta
                      </SelectItem>

                      {contasAtivas.map(
                        (
                          conta
                        ) => (
                          <SelectItem
                            key={
                              conta.id
                            }
                            value={
                              conta.id
                            }
                            className={
                              conta.resumo
                                .saldoRealizado <
                              0
                                ? "font-semibold text-red-700 focus:text-red-700"
                                : undefined
                            }
                          >
                            {conta.nome} —{" "}
                            {conta.banco} —{" "}
                            {moeda(
                              conta.resumo
                                .saldoRealizado
                            )}
                            {conta.resumo
                              .saldoRealizado <
                            0
                              ? " — NEGATIVO"
                              : ""}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Conta de destino *
                  </Label>

                  <Select
                    value={
                      formularioTransferencia.contaDestinoId ||
                      "sem-destino"
                    }
                    onValueChange={(
                      valor
                    ) =>
                      alterarFormularioTransferencia(
                        "contaDestinoId",
                        valor ===
                          "sem-destino"
                          ? ""
                          : valor
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destino" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="sem-destino">
                        Selecione a conta
                      </SelectItem>

                      {contasAtivas.map(
                        (
                          conta
                        ) => (
                          <SelectItem
                            key={
                              conta.id
                            }
                            value={
                              conta.id
                            }
                            className={
                              conta.resumo
                                .saldoRealizado <
                              0
                                ? "font-semibold text-red-700 focus:text-red-700"
                                : undefined
                            }
                          >
                            {conta.nome} —{" "}
                            {conta.banco} —{" "}
                            {moeda(
                              conta.resumo
                                .saldoRealizado
                            )}
                            {conta.resumo
                              .saldoRealizado <
                            0
                              ? " — NEGATIVO"
                              : ""}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Valor *
                  </Label>

                  <Input
                    value={
                      formularioTransferencia.valor
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioTransferencia(
                        "valor",
                        evento.target.value
                      )
                    }
                    placeholder="Ex.: 827,57"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Data *
                  </Label>

                  <Input
                    type="date"
                    value={
                      formularioTransferencia.data
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormularioTransferencia(
                        "data",
                        evento.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                A transferência aparecerá no extrato das duas contas
                como <strong>Transferência entre contas</strong>. O
                motivo da transferência não será exibido.
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Registre no CRM somente quando a transferência bancária
                efetivamente ocorrer. O CRM não realiza o PIX no banco.
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    transferindo
                  }
                  onClick={
                    fecharTransferencia
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  disabled={
                    transferindo
                  }
                  onClick={() =>
                    void salvarTransferencia()
                  }
                >
                  {transferindo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Transferindo...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="mr-2 h-4 w-4" />

                      Registrar transferência
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {contaExtrato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b bg-background px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Extrato —{" "}
                  {contaExtrato.nome}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Movimentos financeiros registrados no CRM para esta
                  conta. Este extrato ainda não representa sincronização
                  automática com o banco.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setContaExtrato(
                    null
                  )
                }
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    Saldo atual
                  </div>

                  <div
                    className={`mt-1 font-bold ${
                      contaExtrato.resumo
                        .saldoRealizado <
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {moeda(
                      contaExtrato.resumo
                        .saldoRealizado
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    A receber
                  </div>

                  <div className="mt-1 font-bold text-green-600">
                    {moeda(
                      contaExtrato.resumo
                        .entradasPendentes
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    A pagar
                  </div>

                  <div className="mt-1 font-bold text-red-600">
                    {moeda(
                      contaExtrato.resumo
                        .saidasPendentes
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    Saldo projetado
                  </div>

                  <div
                    className={`mt-1 font-bold ${
                      contaExtrato.resumo
                        .saldoProjetado <
                      0
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {moeda(
                      contaExtrato.resumo
                        .saldoProjetado
                    )}
                  </div>
                </div>
              </div>

              {movimentosExtratoComSaldo.length ===
              0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhum movimento registrado nesta conta.
                </div>
              ) : (
                <div className="max-h-[58vh] overflow-auto rounded-md border">
                  <Table className="min-w-[1120px]">
                    <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                      <TableRow>
                        <TableHead className="min-w-[110px]">
                          Data
                        </TableHead>

                        <TableHead className="min-w-[260px]">
                          Descrição / origem
                        </TableHead>

                        <TableHead className="min-w-[170px]">
                          Categoria
                        </TableHead>

                        <TableHead className="min-w-[130px] text-right">
                          Débito
                        </TableHead>

                        <TableHead className="min-w-[130px] text-right">
                          Crédito
                        </TableHead>

                        <TableHead className="min-w-[160px] text-right">
                          Saldo após movimento
                        </TableHead>

                        <TableHead className="min-w-[130px]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {movimentosExtratoComSaldo.map(
                        (
                          item
                        ) => {
                          const movimento =
                            item.movimento

                          const valorOriginal =
                            valorOriginalAssinado(
                              movimento
                            )

                          const debito =
                            valorOriginal <
                            0
                              ? Math.abs(
                                  valorOriginal
                                )
                              : null

                          const credito =
                            valorOriginal >
                            0
                              ? valorOriginal
                              : null

                          return (
                            <TableRow
                              key={
                                movimento.id
                              }
                              className={
                                movimento.status ===
                                "Cancelado"
                                  ? "opacity-60"
                                  : undefined
                              }
                            >
                              <TableCell className="whitespace-nowrap">
                                {dataBrasileira(
                                  movimento.data
                                )}
                              </TableCell>

                              <TableCell>
                                <div className="min-w-[240px]">
                                  <div className="flex items-center gap-2 font-medium">
                                    {ehTransferencia(
                                      movimento
                                    ) ? (
                                      <ArrowLeftRight className="h-4 w-4 shrink-0 text-blue-600" />
                                    ) : movimento.tipo ===
                                      "Entrada" ? (
                                      <ArrowDownCircle className="h-4 w-4 shrink-0 text-green-600" />
                                    ) : movimento.tipo ===
                                      "Saida" ? (
                                      <ArrowUpCircle className="h-4 w-4 shrink-0 text-red-600" />
                                    ) : (
                                      <Wallet className="h-4 w-4 shrink-0 text-slate-600" />
                                    )}

                                    <span>
                                      {descricaoVisivel(
                                        movimento
                                      )}
                                    </span>
                                  </div>

                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {ehTransferencia(
                                      movimento
                                    )
                                      ? "Movimentação entre contas próprias"
                                      : `Origem: ${origemVisivel(
                                          movimento
                                        )}`}
                                  </div>

                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {tipoVisivel(
                                      movimento.tipo
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                {movimento.categoria ||
                                  "-"}
                              </TableCell>

                              <TableCell className="text-right">
                                {debito !==
                                null ? (
                                  <span
                                    className={
                                      movimento.status ===
                                      "Cancelado"
                                        ? "text-muted-foreground line-through"
                                        : "font-semibold text-red-600"
                                    }
                                  >
                                    {moeda(
                                      debito
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                {credito !==
                                null ? (
                                  <span
                                    className={
                                      movimento.status ===
                                      "Cancelado"
                                        ? "text-muted-foreground line-through"
                                        : "font-semibold text-green-600"
                                    }
                                  >
                                    {moeda(
                                      credito
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                {item.saldoApos !==
                                null ? (
                                  <span
                                    className={`font-bold ${
                                      item.saldoApos <
                                      0
                                        ? "text-red-600"
                                        : "text-blue-700"
                                    }`}
                                  >
                                    {moeda(
                                      item.saldoApos
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Não afeta saldo atual
                                  </span>
                                )}
                              </TableCell>

                              <TableCell>
                                {statusBadge(
                                  movimento.status
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {erro && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {mensagem}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>
                  Posição de caixa hoje
                </CardTitle>

                <CardDescription className="mt-1">
                  Veja o consolidado e a distribuição entre Pessoa
                  Jurídica e Pessoa Física sem precisar descer até as
                  contas. Um consolidado positivo pode coexistir com
                  uma conta individual negativa.
                </CardDescription>
              </div>

              <Wallet className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Consolidado
                </div>

                <div
                  className={`mt-1 text-xl font-bold ${
                    resumo.saldoRealizado <
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {moeda(
                    resumo.saldoRealizado
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Todas as contas e movimentos
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Pessoa Jurídica
                </div>

                <div
                  className={`mt-1 text-xl font-bold ${
                    saldoPessoaJuridica <
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {moeda(
                    saldoPessoaJuridica
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Contas cadastradas como PJ
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Pessoa Física
                </div>

                <div
                  className={`mt-1 text-xl font-bold ${
                    saldoPessoaFisica <
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {moeda(
                    saldoPessoaFisica
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Contas cadastradas como PF
                </div>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  necessidadeCobertura >
                  0
                    ? "border-red-200 bg-red-50"
                    : "bg-muted/20"
                }`}
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cobertura necessária
                </div>

                <div
                  className={`mt-1 text-xl font-bold ${
                    necessidadeCobertura >
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {moeda(
                    necessidadeCobertura
                  )}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Soma das contas com saldo negativo
                </div>
              </div>
            </div>

            {contasNegativas.length >
              0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-red-800">
                      <AlertTriangle className="h-4 w-4" />

                      Conta(s) que exigem atenção
                    </div>

                    <p className="mt-1 text-xs text-red-700">
                      O consolidado não elimina a necessidade de cobrir
                      uma conta negativa antes de juros, encargos ou
                      vencimentos.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={
                      abrirTransferencia
                    }
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />

                    Registrar transferência
                  </Button>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {contasNegativas.map(
                    (
                      conta
                    ) => (
                      <div
                        key={
                          conta.id
                        }
                        className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {
                              conta.nome
                            }
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {
                              conta.tipoTitular
                            }
                            {!conta.ativa
                              ? " • Inativa"
                              : ""}
                          </div>
                        </div>

                        <div className="shrink-0 text-sm font-bold text-red-600">
                          {moeda(
                            conta.resumo
                              .saldoRealizado
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">
                    Saldos por conta
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Pessoa Jurídica acima e Pessoa Física abaixo. Dentro de cada grupo, contas negativas aparecem primeiro.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={
                    carregando
                  }
                  onClick={() =>
                    void carregarFinanceiro()
                  }
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      carregando
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Atualizar
                </Button>
              </div>

              {contasOrdenadasPorSaldo.length ===
              0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma conta financeira cadastrada.
                </div>
              ) : (
                <div className="space-y-3">
                  {contasPessoaJuridica.length >
                    0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Pessoa Jurídica
                          </div>

                          <div className="text-xs text-blue-700/80">
                            Contas da empresa
                          </div>
                        </div>

                        <div
                          className={`text-sm font-bold ${
                            saldoPessoaJuridica <
                            0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          Total PJ:{" "}
                          {moeda(
                            saldoPessoaJuridica
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {contasPessoaJuridica.map(
                          (
                            conta
                          ) => (
                            <div
                              key={
                                conta.id
                              }
                              className={`flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                                conta.resumo
                                  .saldoRealizado <
                                0
                                  ? "border-red-300 bg-red-50"
                                  : "border-blue-200 bg-white/90"
                              } ${
                                !conta.ativa
                                  ? "opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {
                                    conta.nome
                                  }
                                </div>

                                <div className="truncate text-xs text-blue-700/70">
                                  {
                                    conta.banco
                                  }{" "}
                                  • PJ
                                </div>
                              </div>

                              <div
                                className={`shrink-0 text-sm font-bold ${
                                  conta.resumo
                                    .saldoRealizado <
                                  0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {moeda(
                                  conta.resumo
                                    .saldoRealizado
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {contasPessoaFisica.length >
                    0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            Pessoa Física
                          </div>

                          <div className="text-xs text-amber-700/80">
                            Contas pessoais
                          </div>
                        </div>

                        <div
                          className={`text-sm font-bold ${
                            saldoPessoaFisica <
                            0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          Total PF:{" "}
                          {moeda(
                            saldoPessoaFisica
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {contasPessoaFisica.map(
                          (
                            conta
                          ) => (
                            <div
                              key={
                                conta.id
                              }
                              className={`flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                                conta.resumo
                                  .saldoRealizado <
                                0
                                  ? "border-red-300 bg-red-50"
                                  : "border-amber-200 bg-white/90"
                              } ${
                                !conta.ativa
                                  ? "opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {
                                    conta.nome
                                  }
                                </div>

                                <div className="truncate text-xs text-amber-700/70">
                                  {
                                    conta.banco
                                  }{" "}
                                  • PF
                                </div>
                              </div>

                              <div
                                className={`shrink-0 text-sm font-bold ${
                                  conta.resumo
                                    .saldoRealizado <
                                  0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {moeda(
                                  conta.resumo
                                    .saldoRealizado
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {contasSemClassificacao.length >
                    0 && (
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Outras contas
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {contasSemClassificacao.map(
                          (
                            conta
                          ) => (
                            <div
                              key={
                                conta.id
                              }
                              className={`flex min-w-0 items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 ${
                                !conta.ativa
                                  ? "opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {
                                    conta.nome
                                  }
                                </div>

                                <div className="truncate text-xs text-muted-foreground">
                                  {
                                    conta.banco
                                  }{" "}
                                  •{" "}
                                  {
                                    conta.tipoTitular ||
                                    "Sem classificação"
                                  }
                                </div>
                              </div>

                              <div
                                className={`shrink-0 text-sm font-bold ${
                                  conta.resumo
                                    .saldoRealizado <
                                  0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {moeda(
                                  conta.resumo
                                    .saldoRealizado
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {semConta.quantidade >
              0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Existem{" "}
                <strong>
                  {
                    semConta.quantidade
                  }
                </strong>{" "}
                lançamento(s) sem conta vinculada. Saldo realizado
                desses lançamentos:{" "}
                <strong>
                  {moeda(
                    semConta.resumo
                      .saldoRealizado
                  )}
                </strong>
                .
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                A pagar
              </span>

              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            </div>

            <div className="mt-1 text-lg font-bold text-red-600">
              {moeda(
                resumo.saidasPendentes
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                A receber
              </span>

              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            </div>

            <div className="mt-1 text-lg font-bold text-green-600">
              {moeda(
                resumo.entradasPendentes
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Projetado
              </span>

              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>

            <div
              className={`mt-1 text-lg font-bold ${
                resumo.saldoProjetado <
                0
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {moeda(
                resumo.saldoProjetado
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Vencidas
            </div>

            <div className="mt-1 text-lg font-bold text-red-600">
              {
                vencidas.length
              }
            </div>

            <div className="text-xs text-muted-foreground">
              {moeda(
                resumo.valorVencido
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Vencem hoje
            </div>

            <div className="mt-1 text-lg font-bold text-amber-700">
              {
                hoje.length
              }
            </div>

            <div className="text-xs text-muted-foreground">
              {
                dataHojeBrasileira()
              }
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-medium text-muted-foreground">
              Futuros
            </div>

            <div className="mt-1 text-lg font-bold">
              {
                futuras.length
              }
            </div>

            <div className="text-xs text-muted-foreground">
              Após hoje
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold">
              Ações financeiras
            </h3>

            <p className="text-sm text-muted-foreground">
              Use Novo lançamento no dia a dia. Transferências entre
              contas próprias possuem fluxo separado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={
                prepararLancamentoNormal
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />

              Novo lançamento
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={
                abrirTransferencia
              }
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />

              Transferência entre contas
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={
                abrirCadastroConta
              }
            >
              <Landmark className="mr-2 h-4 w-4" />

              Cadastrar nova conta
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={
                carregando
              }
              onClick={() =>
                void carregarFinanceiro()
              }
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  carregando
                    ? "animate-spin"
                    : ""
                }`}
              />

              Atualizar
            </Button>
          </div>
        </div>

        <Card
          id="novo-lancamento"
        >
          <CardHeader>
            <CardTitle>
              Novo lançamento
            </CardTitle>

            <CardDescription>
              Use esta área para despesas, dívidas, cartões, acordos,
              receitas extras, saldos e compromissos futuros.
              Transferências entre contas próprias devem ser feitas
              pelo botão específico acima.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                <div>
                  <p className="font-semibold text-amber-900">
                    Confira antes de salvar
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Valor realizado altera o saldo atual. Valor pendente
                    altera o saldo projetado. Se houver erro, prefira
                    cancelar para preservar o histórico.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Atalhos de lançamento
              </Label>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararEntradaExtra
                  }
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4 text-green-600" />

                  Entrada
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararSaidaExtra
                  }
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-red-600" />

                  Saída
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararDivida
                  }
                >
                  <Clock3 className="mr-2 h-4 w-4" />

                  Dívida
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararCartao
                  }
                >
                  <CreditCard className="mr-2 h-4 w-4" />

                  Cartão de crédito
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararAcordo
                  }
                >
                  <RefreshCw className="mr-2 h-4 w-4" />

                  Acordo / Renegociação
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    prepararSaldoInicial()
                  }
                >
                  <Wallet className="mr-2 h-4 w-4" />

                  Saldo inicial
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>
                  Tipo
                </Label>

                <Select
                  value={
                    formulario.tipo
                  }
                  onValueChange={(
                    valor
                  ) => {
                    const tipo =
                      valor as TipoFinanceiro

                    if (
                      tipo ===
                      "SaldoInicial"
                    ) {
                      const contaAtual =
                        contas.find(
                          (
                            conta
                          ) =>
                            conta.id ===
                            formulario.contaBancariaId
                        )

                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,

                          tipo:
                            "SaldoInicial",

                          status:
                            "Realizado",

                          vencimento:
                            "",

                          categoria:
                            "Saldo inicial",

                          origem:
                            "Abertura financeira",

                          origemExterna:
                            false,

                          descricao:
                            contaAtual
                              ? `Saldo inicial ${contaAtual.nome}`
                              : "Saldo inicial",
                        })
                      )

                      return
                    }

                    if (
                      formulario.tipo ===
                      "SaldoInicial"
                    ) {
                      setFormulario({
                        ...formularioInicial(),

                        tipo,
                      })

                      return
                    }

                    alterarFormulario(
                      "tipo",
                      tipo
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Entrada">
                      Entrada
                    </SelectItem>

                    <SelectItem value="Saida">
                      Saída
                    </SelectItem>

                    <SelectItem value="SaldoInicial">
                      Saldo inicial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Valor
                </Label>

                <Input
                  value={
                    formulario.valor
                  }
                  onChange={(
                    evento
                  ) =>
                    alterarFormulario(
                      "valor",
                      evento.target.value
                    )
                  }
                  placeholder={
                    formulario.tipo ===
                    "SaldoInicial"
                      ? "Ex.: -1500,00 ou 5000,00"
                      : "Ex.: 850,00"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Data
                </Label>

                <Input
                  type="date"
                  value={
                    formulario.data
                  }
                  onChange={(
                    evento
                  ) =>
                    alterarFormulario(
                      "data",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Situação
                </Label>

                <Select
                  value={
                    formulario.tipo ===
                    "SaldoInicial"
                      ? "Realizado"
                      : formulario.status
                  }
                  disabled={
                    formulario.tipo ===
                    "SaldoInicial"
                  }
                  onValueChange={(
                    valor
                  ) =>
                    alterarFormulario(
                      "status",
                      valor as StatusFinanceiro
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Realizado">
                      Realizado
                    </SelectItem>

                    <SelectItem value="Pendente">
                      Pendente / Futuro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Conta financeira
                </Label>

                <Select
                  value={
                    formulario.contaBancariaId ||
                    "sem-conta"
                  }
                  onValueChange={(
                    valor
                  ) => {
                    const contaId =
                      valor ===
                      "sem-conta"
                        ? ""
                        : valor

                    if (
                      formulario.tipo ===
                      "SaldoInicial"
                    ) {
                      const contaSelecionada =
                        contas.find(
                          (
                            conta
                          ) =>
                            conta.id ===
                            contaId
                        )

                      setFormulario(
                        (
                          atual
                        ) => ({
                          ...atual,

                          contaBancariaId:
                            contaId,

                          origemExterna:
                            false,

                          descricao:
                            contaSelecionada
                              ? `Saldo inicial ${contaSelecionada.nome}`
                              : "Saldo inicial",
                        })
                      )

                      return
                    }

                    alterarFormulario(
                      "contaBancariaId",
                      contaId
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>

                  <SelectContent>
                    {formulario.tipo !==
                      "SaldoInicial" && (
                      <SelectItem value="sem-conta">
                        Conta ainda não definida
                      </SelectItem>
                    )}

                    {contasAtivas.map(
                      (
                        conta
                      ) => (
                        <SelectItem
                          key={
                            conta.id
                          }
                          value={
                            conta.id
                          }
                          className={
                            conta.resumo
                              .saldoRealizado <
                            0
                              ? "font-semibold text-red-700 focus:text-red-700"
                              : undefined
                          }
                        >
                          {conta.nome} —{" "}
                          {conta.banco} —{" "}
                          {moeda(
                            conta.resumo
                              .saldoRealizado
                          )}
                          {conta.resumo
                            .saldoRealizado <
                          0
                            ? " — NEGATIVO"
                            : ""}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Para saldo inicial a conta é obrigatória. Em
                  compromissos futuros, a conta pode ser definida
                  posteriormente.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Descrição
                </Label>

                <Input
                  value={
                    formulario.descricao
                  }
                  onChange={(
                    evento
                  ) =>
                    alterarFormulario(
                      "descricao",
                      evento.target.value
                    )
                  }
                  placeholder="Ex.: fatura Nubank setembro, aluguel, empréstimo..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Categoria
                </Label>

                <Input
                  value={
                    formulario.categoria
                  }
                  onChange={(
                    evento
                  ) =>
                    alterarFormulario(
                      "categoria",
                      evento.target.value
                    )
                  }
                  placeholder="Ex.: Cartão de crédito"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Origem / Credor
                </Label>

                <Input
                  value={
                    formulario.origem
                  }
                  onChange={(
                    evento
                  ) =>
                    alterarFormulario(
                      "origem",
                      evento.target.value
                    )
                  }
                  placeholder="Ex.: Nubank, Itaú, aluguel..."
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Origem externa
                </Label>

                <div
                  className={`flex h-10 items-center gap-3 rounded-md border px-3 ${
                    formulario.tipo ===
                    "SaldoInicial"
                      ? "bg-muted/40 text-muted-foreground"
                      : ""
                  }`}
                >
                  <input
                    id="origem-externa"
                    type="checkbox"
                    checked={
                      formulario.tipo ===
                      "SaldoInicial"
                        ? false
                        : formulario.origemExterna
                    }
                    disabled={
                      formulario.tipo ===
                      "SaldoInicial"
                    }
                    onChange={(
                      evento
                    ) =>
                      alterarFormulario(
                        "origemExterna",
                        evento.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <Label
                    htmlFor="origem-externa"
                    className={
                      formulario.tipo ===
                      "SaldoInicial"
                        ? "font-normal text-muted-foreground"
                        : "cursor-pointer font-normal"
                    }
                  >
                    {formulario.tipo ===
                    "SaldoInicial"
                      ? "Não aplicável ao saldo inicial"
                      : "Fora da representação"}
                  </Label>
                </div>
              </div>
            </div>

            {formulario.tipo !==
              "SaldoInicial" &&
              formulario.status ===
                "Pendente" && (
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-4">
                    <h3 className="font-medium">
                      Vencimento e parcelamento
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Para dívida, acordo ou renegociação parcelada,
                      informe o valor total. O sistema distribuirá o
                      valor entre as parcelas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>
                        Primeiro vencimento
                      </Label>

                      <Input
                        type="date"
                        value={
                          formulario.vencimento
                        }
                        onChange={(
                          evento
                        ) =>
                          alterarFormulario(
                            "vencimento",
                            evento.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Parcelas
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={
                          formulario.parcelas
                        }
                        onChange={(
                          evento
                        ) =>
                          alterarFormulario(
                            "parcelas",
                            evento.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Intervalo em meses
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        max="24"
                        value={
                          formulario.intervaloMeses
                        }
                        onChange={(
                          evento
                        ) =>
                          alterarFormulario(
                            "intervaloMeses",
                            evento.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

            {formulario.tipo ===
              "SaldoInicial" && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Informe o saldo bancário real desta conta neste
                momento. O valor pode ser positivo ou negativo. Saldo
                inicial não é receita nem despesa e não é classificado
                como origem externa.
              </div>
            )}

            {erro && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={
                  salvando
                }
                onClick={() =>
                  void salvarLancamento()
                }
              >
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Salvando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />

                    Revisar e salvar lançamento
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  salvando
                }
                onClick={() => {
                  setFormulario(
                    formularioInicial()
                  )

                  setErro(
                    null
                  )

                  setMensagem(
                    null
                  )
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Contas financeiras
                </CardTitle>

                <CardDescription>
                  Posição individual das contas e acesso ao extrato
                  financeiro interno registrado no CRM.
                </CardDescription>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={
                  abrirCadastroConta
                }
              >
                <Landmark className="mr-2 h-4 w-4" />

                Nova conta
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {contas.length ===
            0 ? (
              <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                Nenhuma conta financeira cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {contas.map(
                  (
                    conta
                  ) => {
                    const possuiSaldoInicial =
                      contaPossuiSaldoInicial(
                        conta.id
                      )

                    return (
                      <Card
                        key={
                          conta.id
                        }
                        className={
                          !conta.ativa
                            ? "opacity-60"
                            : undefined
                        }
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">
                                {
                                  conta.nome
                                }
                              </CardTitle>

                              <CardDescription>
                                {
                                  conta.banco
                                }

                                {conta.agencia
                                  ? ` • Ag. ${conta.agencia}`
                                  : ""}

                                {conta.conta
                                  ? ` • Cc. ${conta.conta}`
                                  : ""}
                              </CardDescription>
                            </div>

                            <Badge
                              variant={
                                conta.ativa
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {conta.ativa
                                ? "Ativa"
                                : "Inativa"}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Saldo atual
                              </div>

                              <div
                                className={`font-bold ${
                                  conta.resumo
                                    .saldoRealizado <
                                  0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {moeda(
                                  conta.resumo
                                    .saldoRealizado
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground">
                                Saldo projetado
                              </div>

                              <div
                                className={`font-bold ${
                                  conta.resumo
                                    .saldoProjetado <
                                  0
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {moeda(
                                  conta.resumo
                                    .saldoProjetado
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground">
                                A receber
                              </div>

                              <div className="font-semibold text-green-600">
                                {moeda(
                                  conta.resumo
                                    .entradasPendentes
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-muted-foreground">
                                A pagar
                              </div>

                              <div className="font-semibold text-red-600">
                                {moeda(
                                  conta.resumo
                                    .saidasPendentes
                                )}
                              </div>
                            </div>
                          </div>

                          {!possuiSaldoInicial && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                              Saldo inicial ainda não informado. Se o
                              saldo real desta conta for zero, não é
                              necessário criar saldo inicial.
                            </div>
                          )}

                          {possuiSaldoInicial && (
                            <div className="text-xs font-medium text-green-700">
                              Saldo inicial registrado
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setContaExtrato(
                                  conta
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />

                              Ver extrato
                            </Button>

                            {conta.ativa &&
                              !possuiSaldoInicial && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    prepararSaldoInicial(
                                      conta.id
                                    )
                                  }
                                >
                                  <Wallet className="mr-2 h-4 w-4" />

                                  Informar saldo inicial
                                </Button>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                )}
              </div>
            )}

            {semConta.quantidade >
              0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Existem{" "}
                <strong>
                  {
                    semConta.quantidade
                  }
                </strong>{" "}
                lançamento(s) ainda sem conta bancária vinculada. Eles
                continuam incluídos no consolidado geral.
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs
          defaultValue="vencidas"
          className="space-y-4"
        >
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="vencidas">
              Vencidas (
              {vencidas.length})
            </TabsTrigger>

            <TabsTrigger value="hoje">
              Hoje (
              {hoje.length})
            </TabsTrigger>

            <TabsTrigger value="pagar">
              A pagar (
              {contasPagar.length})
            </TabsTrigger>

            <TabsTrigger value="receber">
              A receber (
              {contasReceber.length})
            </TabsTrigger>

            <TabsTrigger value="futuras">
              Futuras (
              {futuras.length})
            </TabsTrigger>

            <TabsTrigger value="realizados">
              Realizados (
              {realizados.length})
            </TabsTrigger>

            <TabsTrigger value="todos">
              Todos (
              {movimentos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vencidas">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">
                  Contas vencidas
                </CardTitle>

                <CardDescription>
                  Saídas pendentes cujo vencimento já passou.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  vencidas
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hoje">
            <Card>
              <CardHeader>
                <CardTitle>
                  Vencimentos de hoje
                </CardTitle>

                <CardDescription>
                  Compromissos com vencimento na data atual. Eles não
                  são considerados atrasados durante o próprio dia.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  hoje
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagar">
            <Card>
              <CardHeader>
                <CardTitle>
                  Contas a pagar
                </CardTitle>

                <CardDescription>
                  Dívidas, cartões, acordos e demais saídas ainda
                  pendentes.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  contasPagar
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receber">
            <Card>
              <CardHeader>
                <CardTitle>
                  Contas a receber
                </CardTitle>

                <CardDescription>
                  Entradas previstas ainda não recebidas.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  contasReceber
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="futuras">
            <Card>
              <CardHeader>
                <CardTitle>
                  Compromissos futuros
                </CardTitle>

                <CardDescription>
                  Todos os lançamentos pendentes com vencimento após
                  hoje.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  futuras
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realizados">
            <Card>
              <CardHeader>
                <CardTitle>
                  Movimentos realizados
                </CardTitle>

                <CardDescription>
                  Valores que já afetaram o saldo financeiro atual.
                  Transferências são apresentadas como movimentos
                  internos entre contas próprias.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {tabelaMovimentos(
                  realizados
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>
                      Todos os lançamentos
                    </CardTitle>

                    <CardDescription>
                      Consulte realizados, pendentes, cancelados e
                      transferências entre contas.
                    </CardDescription>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      carregando
                    }
                    onClick={() =>
                      void carregarFinanceiro()
                    }
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        carregando
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    Atualizar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      className="pl-9"
                      value={
                        busca
                      }
                      onChange={(
                        evento
                      ) =>
                        setBusca(
                          evento.target.value
                        )
                      }
                      placeholder="Descrição, categoria, conta, banco..."
                    />
                  </div>

                  <Select
                    value={
                      filtroTipo
                    }
                    onValueChange={
                      setFiltroTipo
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos os tipos
                      </SelectItem>

                      <SelectItem value="Entrada">
                        Entrada
                      </SelectItem>

                      <SelectItem value="Saida">
                        Saída
                      </SelectItem>

                      <SelectItem value="SaldoInicial">
                        Saldo inicial
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={
                      filtroStatus
                    }
                    onValueChange={
                      setFiltroStatus
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todos">
                        Todos os status
                      </SelectItem>

                      <SelectItem value="Pendente">
                        Pendente
                      </SelectItem>

                      <SelectItem value="Realizado">
                        Realizado
                      </SelectItem>

                      <SelectItem value="Cancelado">
                        Cancelado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tabelaMovimentos(
                  movimentosFiltrados
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}