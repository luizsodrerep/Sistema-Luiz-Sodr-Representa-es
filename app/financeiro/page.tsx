"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
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

type ContaBancariaResumo = {
  id: string
  nome: string
  banco: string | null
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

type ResumoFinanceiro = {
  saldoRealizado: number
  entradasRealizadas: number
  saidasRealizadas: number
  entradasPendentes: number
  saidasPendentes: number
  saldoProjetado: number
  quantidadeVencidas: number
  valorVencido: number
}

type RespostaFinanceiro = {
  movimentos: MovimentoFinanceiro[]
  resumo: ResumoFinanceiro
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

const resumoVazio: ResumoFinanceiro = {
  saldoRealizado: 0,
  entradasRealizadas: 0,
  saidasRealizadas: 0,
  entradasPendentes: 0,
  saidasPendentes: 0,
  saldoProjetado: 0,
  quantidadeVencidas: 0,
  valorVencido: 0,
}

function hojeInput() {
  const agora = new Date()

  const ano = agora.getFullYear()

  const mes = String(
    agora.getMonth() + 1
  ).padStart(2, "0")

  const dia = String(
    agora.getDate()
  ).padStart(2, "0")

  return `${ano}-${mes}-${dia}`
}

function moeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor)
}

function dataBrasileira(
  valor: string | null
) {
  if (!valor) {
    return "-"
  }

  const data = new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "-"
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(data)
}

function normalizarValor(
  valor: string
) {
  const limpo = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")

  if (!limpo) {
    return Number.NaN
  }

  if (
    limpo.includes(",")
  ) {
    return Number(
      limpo
        .replace(/\./g, "")
        .replace(",", ".")
    )
  }

  return Number(limpo)
}

function statusBadge(
  status: StatusFinanceiro
) {
  if (
    status === "Realizado"
  ) {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Realizado
      </Badge>
    )
  }

  if (
    status === "Cancelado"
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
    tipo === "SaldoInicial"
  ) {
    return "Saldo inicial"
  }

  if (
    tipo === "Saida"
  ) {
    return "Saída"
  }

  return "Entrada"
}

function movimentoVencido(
  movimento: MovimentoFinanceiro
) {
  if (
    movimento.status !== "Pendente" ||
    movimento.tipo !== "Saida" ||
    !movimento.vencimento
  ) {
    return false
  }

  const vencimento =
    new Date(
      movimento.vencimento
    )

  const hoje = new Date()

  hoje.setHours(
    23,
    59,
    59,
    999
  )

  return (
    vencimento.getTime() <
    hoje.getTime()
  )
}

function formularioInicial(): FormularioFinanceiro {
  return {
    tipo: "Saida",
    valor: "",
    data: hojeInput(),
    descricao: "",
    categoria: "",
    origem: "",
    origemExterna: false,
    status: "Realizado",
    vencimento: "",
    parcelas: "1",
    intervaloMeses: "1",
    contaBancariaId: "",
  }
}

export default function FinanceiroPage() {
  const [
    movimentos,
    setMovimentos,
  ] = useState<
    MovimentoFinanceiro[]
  >([])

  const [
    resumo,
    setResumo,
  ] = useState<ResumoFinanceiro>(
    resumoVazio
  )

  const [
    formulario,
    setFormulario,
  ] = useState<FormularioFinanceiro>(
    formularioInicial()
  )

  const [
    usuario,
    setUsuario,
  ] = useState<UsuarioSessao | null>(
    null
  )

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [
    excluindoId,
    setExcluindoId,
  ] = useState<string | null>(
    null
  )

  const [
    erro,
    setErro,
  ] = useState<string | null>(
    null
  )

  const [
    mensagem,
    setMensagem,
  ] = useState<string | null>(
    null
  )

  const [
    busca,
    setBusca,
  ] = useState("")

  const [
    filtroTipo,
    setFiltroTipo,
  ] = useState("todos")

  const [
    filtroStatus,
    setFiltroStatus,
  ] = useState("todos")

  const podeExcluirDefinitivamente =
    usuario?.perfil === "Diretor"

  const carregarSessao =
    useCallback(
      async () => {
        try {
          const resposta =
            await fetch(
              "/api/auth/me",
              {
                method: "GET",
                cache: "no-store",
              }
            )

          if (!resposta.ok) {
            setUsuario(null)
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
          setUsuario(null)
        }
      },
      []
    )

  const carregarFinanceiro =
    useCallback(
      async () => {
        try {
          setCarregando(true)
          setErro(null)

          const resposta =
            await fetch(
              "/api/financeiro",
              {
                method: "GET",
                cache: "no-store",
              }
            )

          const dados =
            await resposta.json()

          if (!resposta.ok) {
            throw new Error(
              dados?.erro ||
                "Não foi possível carregar o Financeiro."
            )
          }

          const respostaFinanceiro =
            dados as RespostaFinanceiro

          setMovimentos(
            Array.isArray(
              respostaFinanceiro.movimentos
            )
              ? respostaFinanceiro.movimentos
              : []
          )

          setResumo(
            respostaFinanceiro.resumo ??
              resumoVazio
          )
        } catch (error) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar o Financeiro."
          )
        } finally {
          setCarregando(false)
        }
      },
      []
    )

  useEffect(() => {
    void carregarSessao()
    void carregarFinanceiro()
  }, [
    carregarSessao,
    carregarFinanceiro,
  ])

  function alterarFormulario<
    K extends keyof FormularioFinanceiro
  >(
    campo: K,
    valor: FormularioFinanceiro[K]
  ) {
    setFormulario(
      (atual) => ({
        ...atual,
        [campo]: valor,
      })
    )
  }

  function prepararEntradaExtra() {
    setErro(null)
    setMensagem(null)

    setFormulario({
      ...formularioInicial(),
      tipo: "Entrada",
      categoria: "Receita Extra",
      origem: "Atividade Externa",
      origemExterna: true,
      status: "Realizado",
    })
  }

  function prepararSaidaExtra() {
    setErro(null)
    setMensagem(null)

    setFormulario({
      ...formularioInicial(),
      tipo: "Saida",
      categoria: "Despesa Extra",
      origem: "Despesa Externa",
      origemExterna: true,
      status: "Realizado",
    })
  }

  function prepararDivida() {
    setErro(null)
    setMensagem(null)

    setFormulario({
      ...formularioInicial(),
      tipo: "Saida",
      categoria: "Dívida",
      origem: "Obrigação Financeira",
      origemExterna: false,
      status: "Pendente",
      vencimento: hojeInput(),
    })
  }

  function prepararSaldoInicial() {
    setErro(null)
    setMensagem(null)

    setFormulario({
      ...formularioInicial(),
      tipo: "SaldoInicial",
      categoria: "Saldo inicial",
      origem: "Abertura financeira",
      origemExterna: false,
      status: "Realizado",
    })
  }

  async function salvarLancamento() {
    try {
      setErro(null)
      setMensagem(null)

      const valor =
        normalizarValor(
          formulario.valor
        )

      if (
        !Number.isFinite(valor)
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

      const parcelas =
        Number(
          formulario.parcelas
        )

      const intervaloMeses =
        Number(
          formulario.intervaloMeses
        )

      const confirmacao =
        window.confirm(
          [
            "CONFIRMAR LANÇAMENTO FINANCEIRO",
            "",
            `Tipo: ${tipoVisivel(formulario.tipo)}`,
            `Valor: ${moeda(valor)}`,
            `Data: ${dataBrasileira(formulario.data)}`,
            `Situação: ${
              formulario.tipo === "SaldoInicial"
                ? "Realizado"
                : formulario.status
            }`,
            `Descrição: ${formulario.descricao.trim()}`,
            "",
            "Este lançamento afetará os saldos financeiros do sistema.",
            "",
            "Confira principalmente valor, tipo, data e situação antes de continuar.",
            "",
            "Deseja salvar este lançamento?",
          ].join("\n")
        )

      if (!confirmacao) {
        return
      }

      setSalvando(true)

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
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
                formulario.origemExterna,
              status:
                formulario.tipo ===
                "SaldoInicial"
                  ? "Realizado"
                  : formulario.status,
              vencimento:
                formulario.status ===
                  "Pendente" &&
                formulario.vencimento
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
        await resposta.json()

      if (!resposta.ok) {
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
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar o lançamento."
      )
    } finally {
      setSalvando(false)
    }
  }

  async function executarAcao(
    id: string,
    acao:
      | "realizar"
      | "cancelar"
  ) {
    try {
      setErro(null)
      setMensagem(null)

      if (
        acao === "cancelar"
      ) {
        const confirmado =
          window.confirm(
            [
              "Cancelar este lançamento?",
              "",
              "O lançamento continuará registrado no histórico, mas deixará de afetar os saldos financeiros.",
              "",
              "Deseja continuar?",
            ].join("\n")
          )

        if (!confirmado) {
          return
        }
      }

      const resposta =
        await fetch(
          "/api/financeiro",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id,
              acao,
            }),
          }
        )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados?.erro ||
            "Não foi possível atualizar o lançamento."
        )
      }

      setMensagem(
        acao === "realizar"
          ? "Lançamento realizado com sucesso."
          : "Lançamento cancelado com sucesso."
      )

      await carregarFinanceiro()
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar o lançamento."
      )
    }
  }

  async function excluirDefinitivamente(
    movimento: MovimentoFinanceiro
  ) {
    try {
      setErro(null)
      setMensagem(null)

      if (
        !podeExcluirDefinitivamente
      ) {
        throw new Error(
          "Somente o Diretor pode excluir definitivamente um lançamento financeiro."
        )
      }

      const primeiraConfirmacao =
        window.confirm(
          [
            "ATENÇÃO — EXCLUSÃO DEFINITIVA",
            "",
            `Descrição: ${movimento.descricao || "-"}`,
            `Tipo: ${tipoVisivel(movimento.tipo)}`,
            `Valor: ${moeda(movimento.valor)}`,
            `Status: ${movimento.status}`,
            "",
            "A exclusão remove este registro definitivamente do Financeiro e recalcula os saldos.",
            "",
            "Para erros operacionais comuns, prefira CANCELAR.",
            "",
            "Deseja realmente continuar?",
          ].join("\n")
        )

      if (
        !primeiraConfirmacao
      ) {
        return
      }

      const segundaConfirmacao =
        window.confirm(
          [
            "ÚLTIMA CONFIRMAÇÃO",
            "",
            "Este lançamento será apagado definitivamente.",
            "",
            "Use esta função somente quando o cadastro estiver realmente errado e não deva permanecer no histórico.",
            "",
            "Confirmar exclusão definitiva?",
          ].join("\n")
        )

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
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id:
                movimento.id,
            }),
          }
        )

      const dados =
        await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados?.erro ||
            "Não foi possível excluir definitivamente o lançamento."
        )
      }

      setMensagem(
        dados?.mensagem ||
          "Lançamento excluído definitivamente. Os saldos foram recalculados."
      )

      await carregarFinanceiro()
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir o lançamento."
      )
    } finally {
      setExcluindoId(null)
    }
  }

  const contasPagar =
    useMemo(
      () =>
        movimentos.filter(
          (movimento) =>
            movimento.tipo ===
              "Saida" &&
            movimento.status ===
              "Pendente"
        ),
      [movimentos]
    )

  const contasReceber =
    useMemo(
      () =>
        movimentos.filter(
          (movimento) =>
            movimento.tipo ===
              "Entrada" &&
            movimento.status ===
              "Pendente"
        ),
      [movimentos]
    )

  const realizados =
    useMemo(
      () =>
        movimentos.filter(
          (movimento) =>
            movimento.status ===
            "Realizado"
        ),
      [movimentos]
    )

  const movimentosFiltrados =
    useMemo(() => {
      const texto =
        busca
          .trim()
          .toLocaleLowerCase(
            "pt-BR"
          )

      return movimentos.filter(
        (movimento) => {
          const atendeBusca =
            !texto ||
            [
              movimento.descricao,
              movimento.categoria,
              movimento.origem,
              movimento
                .contaBancaria
                ?.nome,
            ]
              .filter(Boolean)
              .some((valor) =>
                String(valor)
                  .toLocaleLowerCase(
                    "pt-BR"
                  )
                  .includes(texto)
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
    }, [
      movimentos,
      busca,
      filtroTipo,
      filtroStatus,
    ])

  function tabelaMovimentos(
    lista: MovimentoFinanceiro[]
  ) {
    if (carregando) {
      return (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando lançamentos...
        </div>
      )
    }

    if (
      lista.length === 0
    ) {
      return (
        <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Nenhum lançamento encontrado.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Tipo
              </TableHead>

              <TableHead>
                Descrição
              </TableHead>

              <TableHead>
                Categoria
              </TableHead>

              <TableHead>
                Data
              </TableHead>

              <TableHead>
                Vencimento
              </TableHead>

              <TableHead className="text-right">
                Valor
              </TableHead>

              <TableHead className="text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lista.map(
              (movimento) => {
                const vencido =
                  movimentoVencido(
                    movimento
                  )

                const excluindo =
                  excluindoId ===
                  movimento.id

                return (
                  <TableRow
                    key={
                      movimento.id
                    }
                    className={
                      vencido
                        ? "bg-red-50"
                        : undefined
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {statusBadge(
                          movimento.status
                        )}

                        {vencido && (
                          <span className="text-xs font-medium text-red-600">
                            Vencido
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium">
                        {tipoVisivel(
                          movimento.tipo
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-[220px]">
                        <div className="font-medium">
                          {movimento.descricao ||
                            "-"}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {movimento.origem
                            ? `Origem: ${movimento.origem}`
                            : "Origem não informada"}
                        </div>

                        {movimento
                          .contaBancaria
                          ?.nome && (
                          <div className="text-xs text-muted-foreground">
                            Conta:{" "}
                            {
                              movimento
                                .contaBancaria
                                .nome
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {movimento.categoria ||
                        "-"}
                    </TableCell>

                    <TableCell>
                      {dataBrasileira(
                        movimento.data
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={
                          vencido
                            ? "font-semibold text-red-600"
                            : undefined
                        }
                      >
                        {dataBrasileira(
                          movimento.vencimento
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={
                          movimento.tipo ===
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

                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {movimento.status ===
                          "Pendente" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void executarAcao(
                                  movimento.id,
                                  "realizar"
                                )
                              }
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />

                              {movimento.tipo ===
                              "Entrada"
                                ? "Receber"
                                : "Pagar"}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                void executarAcao(
                                  movimento.id,
                                  "cancelar"
                                )
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
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
                              onClick={() =>
                                void executarAcao(
                                  movimento.id,
                                  "cancelar"
                                )
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Cancelar
                            </Button>
                          )}

                        {podeExcluirDefinitivamente && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={excluindo}
                            onClick={() =>
                              void excluirDefinitivamente(
                                movimento
                              )
                            }
                          >
                            {excluindo ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1 h-4 w-4" />
                            )}

                            Excluir
                          </Button>
                        )}
                      </div>
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

      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Controle financeiro operacional
            </h2>

            <p className="text-sm text-muted-foreground">
              Registre o que realmente entrou ou saiu e também
              compromissos futuros. O saldo realizado representa
              dinheiro já movimentado; o saldo projetado considera
              também valores pendentes.
            </p>
          </div>
        </div>

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo realizado
              </CardTitle>

              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div
                className={`text-2xl font-bold ${
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

              <p className="mt-1 text-xs text-muted-foreground">
                Somente valores efetivamente realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                A pagar
              </CardTitle>

              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {moeda(
                  resumo.saidasPendentes
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Obrigações e despesas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                A receber
              </CardTitle>

              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {moeda(
                  resumo.entradasPendentes
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Recebimentos futuros cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo projetado
              </CardTitle>

              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div
                className={`text-2xl font-bold ${
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

              <p className="mt-1 text-xs text-muted-foreground">
                Realizado + entradas e saídas pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Entradas realizadas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {moeda(
                  resumo.entradasRealizadas
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Saídas realizadas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-xl font-bold text-red-600">
                {moeda(
                  resumo.saidasRealizadas
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Contas vencidas
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-xl font-bold text-red-600">
                {
                  resumo.quantidadeVencidas
                }
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Total vencido:{" "}
                {moeda(
                  resumo.valorVencido
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Novo lançamento
            </CardTitle>

            <CardDescription>
              Use os atalhos para agilizar os registros mais
              frequentes. Categoria e origem continuam editáveis.
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
                    Todo lançamento financeiro pode alterar o saldo
                    realizado ou projetado. Confira principalmente
                    valor, tipo, data, situação e vencimento antes de
                    confirmar.
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Se houver erro depois do lançamento, prefira
                    cancelar para preservar o histórico. A exclusão
                    definitiva é uma ação excepcional e restrita ao
                    Diretor.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Atalhos
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
                  Entrada Extra
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararSaidaExtra
                  }
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-red-600" />
                  Saída Extra
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararDivida
                  }
                >
                  <Clock3 className="mr-2 h-4 w-4" />
                  Cadastrar Dívida
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    prepararSaldoInicial
                  }
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Saldo Inicial
                </Button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                “Extra” serve para receitas ou despesas que não
                pertencem diretamente ao fluxo normal da
                representação. A descrição informa exatamente o que
                ocorreu.
              </p>
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

                    alterarFormulario(
                      "tipo",
                      tipo
                    )

                    if (
                      tipo ===
                      "SaldoInicial"
                    ) {
                      alterarFormulario(
                        "status",
                        "Realizado"
                      )
                    }
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
                  onChange={(evento) =>
                    alterarFormulario(
                      "valor",
                      evento.target.value
                    )
                  }
                  placeholder={
                    formulario.tipo ===
                    "SaldoInicial"
                      ? "Ex.: -1500,00"
                      : "Ex.: 250,00"
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
                  onChange={(evento) =>
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
                      Pendente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Descrição
                </Label>

                <Input
                  value={
                    formulario.descricao
                  }
                  onChange={(evento) =>
                    alterarFormulario(
                      "descricao",
                      evento.target.value
                    )
                  }
                  placeholder="Ex.: combustível, recebimento externo, cartão, aluguel..."
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Categoria
                </Label>

                <Input
                  value={
                    formulario.categoria
                  }
                  onChange={(evento) =>
                    alterarFormulario(
                      "categoria",
                      evento.target.value
                    )
                  }
                  placeholder="Use uma categoria simples"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Origem
                </Label>

                <Input
                  value={
                    formulario.origem
                  }
                  onChange={(evento) =>
                    alterarFormulario(
                      "origem",
                      evento.target.value
                    )
                  }
                  placeholder="Ex.: representação, atividade externa, obrigação financeira"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Origem externa
                </Label>

                <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                  <input
                    id="origem-externa"
                    type="checkbox"
                    checked={
                      formulario.origemExterna
                    }
                    onChange={(evento) =>
                      alterarFormulario(
                        "origemExterna",
                        evento.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <Label
                    htmlFor="origem-externa"
                    className="cursor-pointer font-normal"
                  >
                    Movimento fora da representação
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
                      Dados do compromisso
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Para dívida parcelada, informe o valor total.
                      O sistema distribuirá o valor entre as
                      parcelas.
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
                O saldo inicial representa a posição financeira
                trazida do período anterior. Ele pode ser negativo.
                Exemplo: <strong>-1500,00</strong>.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={salvando}
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
                disabled={salvando}
                onClick={() => {
                  setFormulario(
                    formularioInicial()
                  )
                  setErro(null)
                  setMensagem(null)
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs
          defaultValue="pagar"
          className="space-y-4"
        >
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="pagar">
              A pagar (
              {contasPagar.length})
            </TabsTrigger>

            <TabsTrigger value="receber">
              A receber (
              {contasReceber.length})
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

          <TabsContent value="pagar">
            <Card>
              <CardHeader>
                <CardTitle>
                  Contas a pagar
                </CardTitle>

                <CardDescription>
                  Dívidas, despesas e obrigações ainda não realizadas.
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

          <TabsContent value="realizados">
            <Card>
              <CardHeader>
                <CardTitle>
                  Movimentos realizados
                </CardTitle>

                <CardDescription>
                  Valores que já afetaram o saldo financeiro
                  realizado.
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
                      Consulte movimentos realizados, pendentes e
                      cancelados.
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
                      value={busca}
                      onChange={(
                        evento
                      ) =>
                        setBusca(
                          evento.target.value
                        )
                      }
                      placeholder="Buscar descrição, categoria ou origem..."
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