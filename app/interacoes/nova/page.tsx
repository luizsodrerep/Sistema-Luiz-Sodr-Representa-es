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

const TIPOS = [
  "WhatsApp",
  "E-mail",
  "Visita",
  "Ligação",
]

type Vinculo =
  | "cliente"
  | "representada"

export default function NovaInteracaoPage() {
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
    vinculo,
    setVinculo,
  ] =
    useState<Vinculo>(
      "cliente"
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
  })

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true)
        setErro(null)

        const [
          respostaClientes,
          respostaRepresentadas,
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
        ])

        if (!respostaClientes.ok) {
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
      } catch (error) {
        console.error(error)

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar os dados necessários."
        )
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  function handleChange(
    campo: keyof typeof form,
    valor: string
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))

    if (erro) {
      setErro(null)
    }
  }

  function alterarVinculo(
    novoVinculo: Vinculo
  ) {
    setVinculo(
      novoVinculo
    )

    setForm((prev) => ({
      ...prev,

      clienteId:
        novoVinculo ===
        "cliente"
          ? prev.clienteId
          : "",

      representadaId:
        novoVinculo ===
        "representada"
          ? prev.representadaId
          : "",
    }))

    setErro(null)
  }

  async function handleSalvar() {
    if (
      vinculo === "cliente" &&
      !form.clienteId
    ) {
      setErro(
        "Selecione o cliente relacionado à interação."
      )

      return
    }

    if (
      vinculo ===
        "representada" &&
      !form.representadaId
    ) {
      setErro(
        "Selecione a representada relacionada à interação."
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
      setSalvando(true)
      setErro(null)

      const response =
        await fetch(
          "/api/interacoes",
          {
            method: "POST",

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
      console.error(error)

      setErro(
        "Erro de conexão ao salvar a interação."
      )
    } finally {
      setSalvando(false)
    }
  }

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
            Registre contatos com clientes ou representadas. O usuário, a data e a hora da interação são registrados automaticamente pelo sistema.
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
                Data e hora da interação são registradas automaticamente no momento do salvamento.
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
                carregando ||
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
              </SelectContent>
            </Select>
          </div>

          {vinculo ===
            "cliente" && (
            <div className="space-y-2">
              <Label>
                Cliente{" "}
                <span className="text-red-500">
                  *
                </span>
              </Label>

              <Select
                value={
                  form.clienteId
                }
                onValueChange={(
                  value
                ) =>
                  handleChange(
                    "clienteId",
                    value
                  )
                }
                disabled={
                  carregando ||
                  salvando ||
                  clientes.length ===
                    0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      carregando
                        ? "Carregando clientes..."
                        : clientes.length ===
                            0
                          ? "Nenhum cliente disponível"
                          : "Selecione o cliente"
                    }
                  />
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

              {clientes.length ===
                0 &&
                !carregando && (
                  <Link href="/clientes/novo">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      Cadastrar Cliente
                    </Button>
                  </Link>
                )}
            </div>
          )}

          {vinculo ===
            "representada" && (
            <div className="space-y-2">
              <Label>
                Representada{" "}
                <span className="text-red-500">
                  *
                </span>
              </Label>

              <Select
                value={
                  form.representadaId
                }
                onValueChange={(
                  value
                ) =>
                  handleChange(
                    "representadaId",
                    value
                  )
                }
                disabled={
                  carregando ||
                  salvando ||
                  representadas.length ===
                    0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      carregando
                        ? "Carregando representadas..."
                        : representadas.length ===
                            0
                          ? "Nenhuma representada disponível"
                          : "Selecione a representada"
                    }
                  />
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
                  carregando ||
                  salvando
                }
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

              <p className="text-xs text-muted-foreground">
                Novos tipos padronizados serão administrados posteriormente pela configuração do CRM.
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
              placeholder="Descreva o que foi tratado."
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
              placeholder="Informe o que deverá ser feito depois."
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
              Opcional. Preencha quando houver nova cobrança, retorno, visita ou acompanhamento futuro.
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
                carregando ||
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