"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react"
import Link from "next/link"

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

type Interacao = {
  id: string
  data: string
  tipo: string
  assunto: string | null
  descricao: string | null
  resultado: string | null
  proximosPasso: string | null
  clienteId: string
  cliente: Cliente
  criadoEm: string
  atualizadoEm: string
}

const corTipo: Record<string, string> = {
  WhatsApp: "bg-green-100 text-green-800",
  "E-mail": "bg-blue-100 text-blue-800",
  Visita: "bg-orange-100 text-orange-800",
  Ligação: "bg-purple-100 text-purple-800",
  Outro: "bg-gray-100 text-gray-800",
}

function formatarData(dataISO: string) {
  const d = new Date(dataISO)

  return (
    d.toLocaleDateString("pt-BR") +
    " às " +
    d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  )
}

export default function InteracaoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [interacao, setInteracao] = useState<Interacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      setErro(null)

      try {
        const res = await fetch(`/api/interacoes/${id}`)

        if (res.status === 404) {
          setErro("Interação não encontrada.")
          return
        }

        if (!res.ok) {
          throw new Error()
        }

        const data = await res.json()
        setInteracao(data)
      } catch {
        setErro("Erro ao carregar interação. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  async function handleExcluir() {
    if (!confirmandoExclusao) {
      setConfirmandoExclusao(true)
      return
    }

    setExcluindo(true)

    try {
      const res = await fetch(`/api/interacoes/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error()
      }

      router.push("/interacoes")
    } catch {
      setErro("Erro ao excluir interação.")
      setExcluindo(false)
      setConfirmandoExclusao(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Carregando...">
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-xxs">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando interação...
        </div>
      </PageLayout>
    )
  }

  if (erro && !interacao) {
    return (
      <PageLayout title="Erro">
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-xxs">
          <AlertCircle className="h-6 w-6 text-red-500" />

          <p className="text-red-500">{erro}</p>

          <Link href="/interacoes">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xxs"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Voltar para Interações
            </Button>
          </Link>
        </div>
      </PageLayout>
    )
  }

  if (!interacao) {
    return null
  }

  return (
    <PageLayout title="Detalhes da Interação">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link href="/interacoes">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4 text-primary" />

            <span className="text-xs-plus font-medium">
              {interacao.cliente.nomeFantasia ||
                interacao.cliente.razaoSocial}
            </span>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxxs font-semibold ${
              corTipo[interacao.tipo] ??
              "bg-gray-100 text-gray-800"
            }`}
          >
            {interacao.tipo}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/interacoes/${id}/editar`}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xxs gap-1"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </Button>
          </Link>

          {confirmandoExclusao ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xxs"
                onClick={handleExcluir}
                disabled={excluindo}
              >
                {excluindo ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Sim, excluir"
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xxs"
                onClick={() => setConfirmandoExclusao(false)}
                disabled={excluindo}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xxs gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={handleExcluir}
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {erro && (
        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-xxs">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {erro}
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-3">
        <Card className="card-container md:col-span-2">
          <CardHeader className="card-header">
            <CardTitle className="card-title">
              Detalhes da Interação
            </CardTitle>

            <CardDescription className="card-description">
              Registrada em {formatarData(interacao.criadoEm)}
            </CardDescription>
          </CardHeader>

          <CardContent className="card-content space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Data e Hora
                </p>

                <p className="text-xxs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {formatarData(interacao.data)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Tipo
                </p>

                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-medium ${
                    corTipo[interacao.tipo] ??
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {interacao.tipo}
                </span>
              </div>
            </div>

            {interacao.assunto && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Assunto
                </p>

                <p className="text-xxs font-medium">
                  {interacao.assunto}
                </p>
              </div>
            )}

            {interacao.descricao && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Descrição
                </p>

                <p className="text-xxs border rounded-sm p-2 bg-muted/10 whitespace-pre-wrap">
                  {interacao.descricao}
                </p>
              </div>
            )}

            {interacao.resultado && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Resultado
                </p>

                <p className="text-xxs border rounded-sm p-2 bg-green-50 whitespace-pre-wrap">
                  {interacao.resultado}
                </p>
              </div>
            )}

            {interacao.proximosPasso && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-blue-500" />
                  Próximos Passos
                </p>

                <p className="text-xxs border rounded-sm p-2 bg-blue-50 whitespace-pre-wrap">
                  {interacao.proximosPasso}
                </p>
              </div>
            )}

            {!interacao.assunto &&
              !interacao.descricao &&
              !interacao.resultado &&
              !interacao.proximosPasso && (
                <p className="text-xxs text-muted-foreground italic">
                  Nenhum detalhe adicional registrado.
                </p>
              )}

            <div className="pt-2 border-t">
              <p className="text-xxxs text-muted-foreground">
                Última atualização:{" "}
                {formatarData(interacao.atualizadoEm)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-container">
          <CardHeader className="card-header">
            <CardTitle className="card-title">
              Dados do Cliente
            </CardTitle>

            <CardDescription className="card-description">
              Informações de contato
            </CardDescription>
          </CardHeader>

          <CardContent className="card-content space-y-2">
            <div className="space-y-1">
              <p className="text-xxs text-muted-foreground">
                Empresa
              </p>

              <p className="text-xxs font-medium">
                {interacao.cliente.razaoSocial}
              </p>

              {interacao.cliente.nomeFantasia && (
                <p className="text-xxs text-muted-foreground">
                  {interacao.cliente.nomeFantasia}
                </p>
              )}
            </div>

            {interacao.cliente.contato && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Contato
                </p>

                <p className="text-xxs font-medium">
                  {interacao.cliente.contato}

                  {interacao.cliente.cargo && (
                    <span className="text-muted-foreground">
                      {" "}
                      — {interacao.cliente.cargo}
                    </span>
                  )}
                </p>
              </div>
            )}

            {interacao.cliente.whatsapp && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  WhatsApp
                </p>

                <div className="flex items-center gap-1">
                  <p className="text-xxs">
                    {interacao.cliente.whatsapp}
                  </p>

                  <a
                    href={`https://wa.me/55${interacao.cliente.whatsapp.replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                    >
                      <MessageSquare className="h-3 w-3 text-green-500" />
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {interacao.cliente.telefone && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  Telefone
                </p>

                <div className="flex items-center gap-1">
                  <p className="text-xxs">
                    {interacao.cliente.telefone}
                  </p>

                  <a
                    href={`tel:${interacao.cliente.telefone.replace(
                      /\D/g,
                      ""
                    )}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                    >
                      <Phone className="h-3 w-3 text-primary" />
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {interacao.cliente.email && (
              <div className="space-y-1">
                <p className="text-xxs text-muted-foreground">
                  E-mail
                </p>

                <div className="flex items-center gap-1">
                  <p className="text-xxs truncate">
                    {interacao.cliente.email}
                  </p>

                  <a href={`mailto:${interacao.cliente.email}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                    >
                      <Mail className="h-3 w-3 text-blue-500" />
                    </Button>
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link href={`/clientes/${interacao.cliente.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xxs gap-1"
                >
                  <User className="h-3 w-3" />
                  Ver Cadastro Completo
                </Button>
              </Link>
            </div>

            <div className="pt-1">
              <Link
                href={`/interacoes/nova?clienteId=${interacao.cliente.id}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xxs gap-1"
                >
                  <ClipboardList className="h-3 w-3" />
                  Nova Interação com este Cliente
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}