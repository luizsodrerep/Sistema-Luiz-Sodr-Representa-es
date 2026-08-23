"use client"

import {
  use,
  useEffect,
  useState,
} from "react"
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
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Factory,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  User,
} from "lucide-react"

type Cliente = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  whatsapp: string | null
  telefone: string | null
  email: string | null
  contato: string | null
  cargo: string | null
}

type Representada = {
  id: string
  nome: string
  cnpj: string | null
  contatoPrincipal: string | null
  emailPrincipal: string | null
  telefonePrincipal: string | null
  whatsappPrincipal: string | null
}

type UsuarioResumo = {
  id: string
  nome: string
  perfil: string
}

type Interacao = {
  id: string
  data: string

  tipo: string

  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null

  proximoContatoEm: string | null
  statusFollowUp: string

  clienteId: string | null
  representadaId: string | null

  cliente: Cliente | null
  representada: Representada | null

  criadoPor: UsuarioResumo | null
  responsavel: UsuarioResumo | null

  criadoEm: string
  atualizadoEm: string
}

const corTipo: Record<string, string> = {
  WhatsApp:
    "bg-green-100 text-green-800",

  "E-mail":
    "bg-blue-100 text-blue-800",

  Visita:
    "bg-orange-100 text-orange-800",

  Ligação:
    "bg-purple-100 text-purple-800",

  Outro:
    "bg-gray-100 text-gray-800",
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

  /*
   * Evita marcar como editada apenas
   * pela diferença mínima natural
   * existente no momento da criação.
   */
  return atualizado - criado > 2000
}

export default function InteracaoDetalhesPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = use(params)

  const [
    interacao,
    setInteracao,
  ] =
    useState<Interacao | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    erro,
    setErro,
  ] =
    useState<string | null>(
      null
    )

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        setErro(null)

        const response =
          await fetch(
            `/api/interacoes/${id}`,
            {
              method: "GET",
              cache: "no-store",
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
              "Não foi possível carregar a interação."
          )

          return
        }

        setInteracao(
          data
        )
      } catch {
        setErro(
          "Erro ao carregar interação. Tente novamente."
        )
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  if (loading) {
    return (
      <PageLayout title="Carregando...">
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando interação...
        </div>
      </PageLayout>
    )
  }

  if (
    erro &&
    !interacao
  ) {
    return (
      <PageLayout title="Interação">
        <NavigationButtons
          backLabel="Voltar para Interações"
          backHref="/interacoes"
        />

        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          <AlertCircle className="h-6 w-6" />

          <p>
            {erro}
          </p>
        </div>
      </PageLayout>
    )
  }

  if (!interacao) {
    return null
  }

  const editada =
    foiEditada(
      interacao.criadoEm,
      interacao.atualizadoEm
    )

  const origemCliente =
    interacao.cliente !== null

  const nomeOrigem =
    interacao.cliente
      ? interacao.cliente
          .nomeFantasia ||
        interacao.cliente
          .razaoSocial
      : interacao
          .representada
        ? interacao
            .representada
            .nome
        : "Origem não disponível"

  return (
    <PageLayout title="Detalhes da Interação">
      <NavigationButtons
        backLabel="Voltar para Interações"
        backHref="/interacoes"
      />

      <div className="mb-3 mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {origemCliente ? (
            <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
          ) : (
            <Factory className="h-5 w-5 shrink-0 text-orange-600" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {nomeOrigem}
            </p>

            <p className="text-xs text-muted-foreground">
              {origemCliente
                ? "Cliente"
                : "Representada"}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              corTipo[
                interacao.tipo
              ] ??
              "bg-gray-100 text-gray-800"
            }`}
          >
            {interacao.tipo}
          </span>

          {editada && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              Editada
            </span>
          )}
        </div>

        <Link
          href={`/interacoes/${id}/editar`}
        >
          <Button
            variant="outline"
            size="sm"
          >
            <Pencil className="mr-2 h-4 w-4" />

            Editar
          </Button>
        </Link>
      </div>

      {erro && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          {erro}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Registro da Interação
            </CardTitle>

            <CardDescription>
              Histórico comercial preservado.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Data e hora
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />

                  {formatarData(
                    interacao.data
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Registrado por
                </p>

                <p className="mt-1 text-sm font-medium">
                  {interacao.criadoPor
                    ?.nome ||
                    "Usuário não identificado"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {interacao.criadoPor
                    ?.perfil ||
                    "—"}
                </p>
              </div>
            </div>

            {interacao.assunto && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Assunto
                </p>

                <p className="mt-1 text-sm font-medium">
                  {
                    interacao.assunto
                  }
                </p>
              </div>
            )}

            {interacao.descricao && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Descrição
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/10 p-3 text-sm">
                  {
                    interacao.descricao
                  }
                </div>
              </div>
            )}

            {interacao.resultado && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  Resultado
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-green-50 p-3 text-sm">
                  {
                    interacao.resultado
                  }
                </div>
              </div>
            )}

            {interacao.proximosPasso && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-blue-600" />

                  Próximos Passos
                </p>

                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-blue-50 p-3 text-sm">
                  {
                    interacao
                      .proximosPasso
                  }
                </div>
              </div>
            )}

            {interacao
              .proximoContatoEm && (
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-600" />

                  Próximo acompanhamento
                </p>

                <div className="mt-1 rounded-md border bg-amber-50 p-3">
                  <p className="text-sm font-medium">
                    {formatarData(
                      interacao
                        .proximoContatoEm
                    )}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Status:{" "}
                    {
                      interacao
                        .statusFollowUp
                    }
                  </p>

                  {interacao
                    .responsavel && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responsável:{" "}
                      {
                        interacao
                          .responsavel
                          .nome
                      }{" "}
                      —{" "}
                      {
                        interacao
                          .responsavel
                          .perfil
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {!interacao.assunto &&
              !interacao.descricao &&
              !interacao.resultado &&
              !interacao.proximosPasso &&
              !interacao.proximoContatoEm && (
                <p className="text-sm italic text-muted-foreground">
                  Nenhum detalhe adicional registrado.
                </p>
              )}

            <div className="border-t pt-3 text-xs text-muted-foreground">
              <p>
                Criada em:{" "}
                {formatarData(
                  interacao.criadoEm
                )}
              </p>

              {editada && (
                <p className="mt-1 font-medium text-amber-700">
                  Editada em:{" "}
                  {formatarData(
                    interacao
                      .atualizadoEm
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {origemCliente
                ? "Dados do Cliente"
                : "Dados da Representada"}
            </CardTitle>

            <CardDescription>
              Informações relacionadas ao registro.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {interacao.cliente && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Empresa
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao
                        .cliente
                        .razaoSocial
                    }
                  </p>

                  {interacao
                    .cliente
                    .nomeFantasia && (
                    <p className="text-xs text-muted-foreground">
                      {
                        interacao
                          .cliente
                          .nomeFantasia
                      }
                    </p>
                  )}
                </div>

                {interacao
                  .cliente
                  .contato && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao
                          .cliente
                          .contato
                      }

                      {interacao
                        .cliente
                        .cargo
                        ? ` — ${interacao.cliente.cargo}`
                        : ""}
                    </p>
                  </div>
                )}

                {interacao
                  .cliente
                  .whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao
                            .cliente
                            .whatsapp
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.cliente.whatsapp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao
                  .cliente
                  .telefone && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao
                            .cliente
                            .telefone
                        }
                      </p>

                      <a
                        href={`tel:${interacao.cliente.telefone.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao
                  .cliente
                  .email && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao
                            .cliente
                            .email
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.cliente.email}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                <Link
                  href={`/clientes/${interacao.cliente.id}`}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />

                    Ver Cliente
                  </Button>
                </Link>
              </>
            )}

            {interacao.representada && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Representada
                  </p>

                  <p className="text-sm font-medium">
                    {
                      interacao
                        .representada
                        .nome
                    }
                  </p>
                </div>

                {interacao
                  .representada
                  .cnpj && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CNPJ
                    </p>

                    <p className="text-sm">
                      {
                        interacao
                          .representada
                          .cnpj
                      }
                    </p>
                  </div>
                )}

                {interacao
                  .representada
                  .contatoPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contato
                    </p>

                    <p className="text-sm">
                      {
                        interacao
                          .representada
                          .contatoPrincipal
                      }
                    </p>
                  </div>
                )}

                {interacao
                  .representada
                  .whatsappPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao
                            .representada
                            .whatsappPrincipal
                        }
                      </p>

                      <a
                        href={`https://wa.me/55${interacao.representada.whatsappPrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao
                  .representada
                  .telefonePrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {
                          interacao
                            .representada
                            .telefonePrincipal
                        }
                      </p>

                      <a
                        href={`tel:${interacao.representada.telefonePrincipal.replace(
                          /\D/g,
                          ""
                        )}`}
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {interacao
                  .representada
                  .emailPrincipal && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      E-mail
                    </p>

                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm">
                        {
                          interacao
                            .representada
                            .emailPrincipal
                        }
                      </p>

                      <a
                        href={`mailto:${interacao.representada.emailPrincipal}`}
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {!interacao.cliente &&
              !interacao.representada && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />

                  Origem não disponível.
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}