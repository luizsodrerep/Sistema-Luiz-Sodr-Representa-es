"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertCircle,
  Clock,
  Loader2,
  Save,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
}

type Representada = {
  id: string
  nome: string
}

type Vinculo =
  | "cliente"
  | "representada"

const TIPOS = [
  "WhatsApp",
  "E-mail",
  "Visita",
  "Ligação",
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

  const data = new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return ""
  }

  const local = new Date(
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
  const data = new Date(valor)

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

export default function EditarInteracaoPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = use(params)

  const router = useRouter()

  const [
    clientes,
    setClientes,
  ] = useState<Cliente[]>([])

  const [
    representadas,
    setRepresentadas,
  ] = useState<Representada[]>([])

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
  ] = useState("")

  const [
    autorOriginal,
    setAutorOriginal,
  ] = useState("")

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  const [
    form,
    setForm,
  ] = useState({
    clienteId: "",
    representadaId: "",
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
    async function carregar() {
      try {
        setCarregando(true)
        setErro(null)

        const [
          respostaClientes,
          respostaRepresentadas,
          respostaInteracao,
        ] = await Promise.all([
          fetch(
            "/api/clientes",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/representadas",
            {
              cache: "no-store",
            }
          ),

          fetch(
            `/api/interacoes/${id}`,
            {
              cache: "no-store",
            }
          ),
        ])

        const dadosInteracao =
          await respostaInteracao
            .json()
            .catch(() => null)

        if (
          !respostaInteracao.ok
        ) {
          throw new Error(
            dadosInteracao?.message ||
              "Não foi possível carregar a interação."
          )
        }

        if (
          !respostaClientes.ok
        ) {
          throw new Error(
            "Não foi possível carregar os clientes."
          )
        }

        if (
          !respostaRepresentadas.ok
        ) {
          throw new Error(
            "Não foi possível carregar as representadas."
          )
        }

        const dadosClientes =
          await respostaClientes.json()

        const dadosRepresentadas =
          await respostaRepresentadas.json()

        setClientes(
          Array.isArray(
            dadosClientes
          )
            ? dadosClientes
            : []
        )

        setRepresentadas(
          Array.isArray(
            dadosRepresentadas
          )
            ? dadosRepresentadas
            : []
        )

        const possuiRepresentada =
          Boolean(
            dadosInteracao.representadaId
          )

        setVinculo(
          possuiRepresentada
            ? "representada"
            : "cliente"
        )

        setDataOriginal(
          dadosInteracao.data ||
            ""
        )

        setAutorOriginal(
          dadosInteracao.criadoPor
            ? `${dadosInteracao.criadoPor.nome} — ${dadosInteracao.criadoPor.perfil}`
            : "Usuário não identificado"
        )

        setForm({
          clienteId:
            dadosInteracao
              .clienteId ||
            "",

          representadaId:
            dadosInteracao
              .representadaId ||
            "",

          tipo:
            dadosInteracao.tipo ||
            "",

          assunto:
            dadosInteracao
              .assunto ||
            "",

          descricao:
            dadosInteracao
              .descricao ||
            "",

          resultado:
            dadosInteracao
              .resultado ||
            "",

          proximosPasso:
            dadosInteracao
              .proximosPasso ||
            "",

          proximoContatoEm:
            converterParaDataLocal(
              dadosInteracao
                .proximoContatoEm
            ),

          statusFollowUp:
            dadosInteracao
              .statusFollowUp ||
            "Sem acompanhamento",
        })
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar a interação."
        )
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [id])

  function alterarCampo(
    campo: keyof typeof form,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))

    if (erro) {
      setErro(null)
    }
  }

  function alterarVinculo(
    novoVinculo: Vinculo
  ) {
    setVinculo(novoVinculo)

    setForm((anterior) => ({
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
    }))

    setErro(null)
  }

  async function salvar() {
    if (
      vinculo === "cliente" &&
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
        "Informe a data do próximo acompanhamento."
      )
      return
    }

    try {
      setSalvando(true)
      setErro(null)

      const resposta =
        await fetch(
          `/api/interacoes/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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

      if (!resposta.ok) {
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
        "Erro de conexão ao salvar as alterações."
      )
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
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
            Corrija ou atualize este registro. A data, a hora e o usuário que criou a interação permanecem preservados.
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
              value={vinculo}
              onValueChange={(
                valor
              ) =>
                alterarVinculo(
                  valor as Vinculo
                )
              }
              disabled={salvando}
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
              </SelectContent>
            </Select>
          </div>

          {vinculo ===
            "cliente" && (
            <div className="space-y-2">
              <Label>
                Cliente *
              </Label>

              <Select
                value={
                  form.clienteId
                }
                onValueChange={(
                  valor
                ) =>
                  alterarCampo(
                    "clienteId",
                    valor
                  )
                }
                disabled={salvando}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>

                <SelectContent>
                  {clientes.map(
                    (cliente) => (
                      <SelectItem
                        key={
                          cliente.id
                        }
                        value={
                          cliente.id
                        }
                      >
                        {cliente.nomeFantasia ||
                          cliente.razaoSocial}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {vinculo ===
            "representada" && (
            <div className="space-y-2">
              <Label>
                Representada *
              </Label>

              <Select
                value={
                  form.representadaId
                }
                onValueChange={(
                  valor
                ) =>
                  alterarCampo(
                    "representadaId",
                    valor
                  )
                }
                disabled={salvando}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a representada" />
                </SelectTrigger>

                <SelectContent>
                  {representadas.map(
                    (representada) => (
                      <SelectItem
                        key={
                          representada.id
                        }
                        value={
                          representada.id
                        }
                      >
                        {
                          representada.nome
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Tipo de Interação *
              </Label>

              <Select
                value={form.tipo}
                onValueChange={(
                  valor
                ) =>
                  alterarCampo(
                    "tipo",
                    valor
                  )
                }
                disabled={salvando}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>

                <SelectContent>
                  {TIPOS.map(
                    (tipo) => (
                      <SelectItem
                        key={tipo}
                        value={tipo}
                      >
                        {tipo}
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
                    evento.target
                      .value
                  )
                }
                disabled={salvando}
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
                  evento.target
                    .value
                )
              }
              disabled={salvando}
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
                  evento.target
                    .value
                )
              }
              disabled={salvando}
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
                  evento.target
                    .value
                )
              }
              disabled={salvando}
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
                    evento.target
                      .value
                  )
                }
                disabled={salvando}
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
                disabled={salvando}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS.map(
                    (status) => (
                      <SelectItem
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {status}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button
              onClick={salvar}
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}