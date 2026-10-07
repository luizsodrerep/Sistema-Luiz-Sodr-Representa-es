
"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

type ClienteForm = {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string
  categoria: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  regiao: string
  rota: string
  contato: string
  cargo: string
  telefone: string
  whatsapp: string
  email: string
  observacoes: string
  status: string
}

function texto(
  dados: Record<string, unknown>,
  campo: keyof ClienteForm
): string {
  const valor = dados[campo]
  return typeof valor === "string" ? valor : ""
}

function prepararFormulario(
  dados: Record<string, unknown>
): ClienteForm {
  return {
    razaoSocial: texto(dados, "razaoSocial"),
    nomeFantasia: texto(dados, "nomeFantasia"),
    cnpj: texto(dados, "cnpj"),
    inscricaoEstadual: texto(dados, "inscricaoEstadual"),
    categoria: texto(dados, "categoria"),
    endereco: texto(dados, "endereco"),
    bairro: texto(dados, "bairro"),
    cidade: texto(dados, "cidade"),
    estado: texto(dados, "estado"),
    cep: texto(dados, "cep"),
    regiao: texto(dados, "regiao"),
    rota: texto(dados, "rota"),
    contato: texto(dados, "contato"),
    cargo: texto(dados, "cargo"),
    telefone: texto(dados, "telefone"),
    whatsapp: texto(dados, "whatsapp"),
    email: texto(dados, "email"),
    observacoes: texto(dados, "observacoes"),
    status: texto(dados, "status"),
  }
}

function formatoCnpjPossivel(valor: string): boolean {
  const normalizado = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")

  return (
    /^[A-Z0-9]{12}[0-9]{2}$/.test(normalizado) &&
    !/^([A-Z0-9])\1{13}$/.test(normalizado)
  )
}

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] =
    useState<ClienteForm | null>(null)

  const [erro, setErro] = useState<string | null>(null)

  const [formalizar, setFormalizar] = useState(false)
  const [identidadeConfirmada, setIdentidadeConfirmada] =
    useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarCliente() {
      try {
        setLoading(true)
        setErro(null)

        const resposta = await fetch(
          `/api/clientes/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        const recebido: unknown = await resposta
          .json()
          .catch(() => null)

        if (
          !recebido ||
          typeof recebido !== "object" ||
          Array.isArray(recebido)
        ) {
          throw new Error(
            "O servidor não retornou um cadastro válido."
          )
        }

        const dados = recebido as Record<string, unknown>

        if (!resposta.ok) {
          throw new Error(
            typeof dados.error === "string"
              ? dados.error
              : "Não foi possível carregar o Cliente."
          )
        }

        if (dados.id !== id) {
          throw new Error(
            "O cadastro retornado não corresponde ao Cliente solicitado."
          )
        }

        if (controller.signal.aborted) return

        const formulario = prepararFormulario(dados)

        if (!formulario.status) {
          throw new Error(
            "O cadastro não possui situação definida. Verifique os dados antes de editar."
          )
        }

        setFormData(formulario)
        setFormalizar(false)
        setIdentidadeConfirmada(false)
      } catch (falha) {
        if (controller.signal.aborted) return

        setErro(
          falha instanceof Error
            ? falha.message
            : "Erro ao carregar o Cliente."
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void carregarCliente()

    return () => controller.abort()
  }, [id])

  function alterarCampo(
    campo: keyof ClienteForm,
    valor: string
  ) {
    setFormData((atual) =>
      atual
        ? {
            ...atual,
            [campo]: valor,
          }
        : atual
    )

    if (
      campo === "razaoSocial" ||
      campo === "nomeFantasia" ||
      campo === "cnpj"
    ) {
      setIdentidadeConfirmada(false)
    }
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    alterarCampo(
      event.target.name as keyof ClienteForm,
      event.target.value
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!formData || saving) return

    setErro(null)

    if (!formData.razaoSocial.trim()) {
      setErro("Informe a razão social real da empresa.")
      return
    }

    const estaFormalizando =
      formData.status === "Em qualificação" &&
      formalizar

    if (estaFormalizando) {
      if (!formatoCnpjPossivel(formData.cnpj)) {
        setErro(
          "Informe o CNPJ verdadeiro da empresa, com 14 caracteres em formato válido. " +
            "A conferência de formato não verifica a titularidade na Receita Federal."
        )
        return
      }

      if (!identidadeConfirmada) {
        setErro(
          "Confirme que o CNPJ e a razão social pertencem à mesma empresa do pré-cadastro e da Prospecção."
        )
        return
      }

      const confirmou = window.confirm(
        "CONFIRMAR FORMALIZAÇÃO DO CLIENTE\n\n" +
          `Razão social: ${formData.razaoSocial.trim()}\n` +
          `CNPJ: ${formData.cnpj.trim()}\n\n` +
          "Você conferiu a identidade da empresa e o aceite real do comprador?\n\n" +
          "O CRM atualizará ESTE mesmo cadastro para Ativo, " +
          "sem criar outro Cliente e sem gerar uma Venda automaticamente. " +
          "A API recusará a operação se não localizar um Orçamento aprovado elegível."
      )

      if (!confirmou) return
    }

    try {
      setSaving(true)

      const resposta = await fetch(
        `/api/clientes/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            razaoSocial: formData.razaoSocial.trim(),
            status: estaFormalizando
              ? "Ativo"
              : formData.status,
            ...(estaFormalizando
              ? { confirmarFormalizacao: true }
              : {}),
          }),
        }
      )

      const recebido: unknown = await resposta
        .json()
        .catch(() => null)

      const dados =
        recebido &&
        typeof recebido === "object" &&
        !Array.isArray(recebido)
          ? (recebido as Record<string, unknown>)
          : null

      if (!resposta.ok) {
        setErro(
          typeof dados?.error === "string"
            ? dados.error
            : "Não foi possível atualizar o Cliente."
        )
        return
      }

      if (dados?.id !== id) {
        setErro(
          "O servidor não confirmou a atualização do Cliente. " +
            "Confira o cadastro antes de tentar novamente."
        )
        return
      }

      if (
        estaFormalizando &&
        dados.status !== "Ativo"
      ) {
        setErro(
          "A resposta do servidor não confirmou a formalização. " +
            "Confira a situação do Cliente antes de continuar."
        )
        return
      }

      router.push(
        `/clientes/${encodeURIComponent(id)}`
      )
      router.refresh()
    } catch {
      setErro(
        "Erro de comunicação ao salvar. Confira o cadastro antes de tentar novamente."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando Cliente...
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/clientes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Clientes
        </Button>

        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {erro || "Cliente não encontrado."}
        </div>
      </div>
    )
  }

  const emQualificacao =
    formData.status === "Em qualificação"

  const bloqueado = saving

  return (
    <div className="mx-auto flex max-w-4xl flex-col p-8 pt-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={bloqueado}
            onClick={() =>
              router.push(
                `/clientes/${encodeURIComponent(id)}`
              )
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>

          <h2 className="text-3xl font-bold tracking-tight">
            Editar Cliente
          </h2>
        </div>
      </div>

      {erro && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {erro}
        </div>
      )}

      {emQualificacao && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">
            Empresa em qualificação
          </p>

          <p className="mt-2">
            Você pode corrigir os dados deste cadastro
            sem formalizá-lo. Para torná-lo Ativo,
            primeiro deve existir um Orçamento desta
            empresa com Prospecção de origem e
            aprovação real do comprador registrada.
          </p>

          <p className="mt-2">
            A formalização preserva o mesmo Cliente e
            seus vínculos. Não crie outro cadastro
            nem preencha CNPJ fictício.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
              <CardDescription>
                Situação atual:{" "}
                <strong>{formData.status}</strong>.
                {emQualificacao
                  ? " A mudança para Ativo exige a confirmação de formalização abaixo."
                  : " Esta tela preserva a situação cadastral atual."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">
                    Razão Social *
                  </Label>

                  <Input
                    id="razaoSocial"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    disabled={bloqueado}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">
                    Nome Fantasia
                  </Label>

                  <Input
                    id="nomeFantasia"
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">
                    CNPJ {formalizar ? "*" : ""}
                  </Label>

                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    disabled={bloqueado}
                    required={emQualificacao && formalizar}
                    placeholder="CNPJ verdadeiro da empresa"
                  />

                  <p className="text-xs text-muted-foreground">
                    Esta tela não consulta a Receita
                    Federal. Confira os dados em
                    fonte confiável.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscricaoEstadual">
                    Inscrição Estadual
                  </Label>

                  <Input
                    id="inscricaoEstadual"
                    name="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">
                    Categoria
                  </Label>

                  <Select
                    value={formData.categoria}
                    disabled={bloqueado}
                    onValueChange={(valor) =>
                      alterarCampo("categoria", valor)
                    }
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Distribuidor">
                        Distribuidor
                      </SelectItem>
                      <SelectItem value="Atacado">
                        Atacado
                      </SelectItem>
                      <SelectItem value="Varejo">
                        Varejo
                      </SelectItem>
                      <SelectItem value="Industria">
                        Indústria
                      </SelectItem>
                      <SelectItem value="Confeitaria">
                        Confeitaria
                      </SelectItem>
                      <SelectItem value="Supermercado">
                        Supermercado
                      </SelectItem>
                      <SelectItem value="Outros">
                        Outros
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">
                  Endereço
                </Label>

                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  disabled={bloqueado}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">
                    Bairro
                  </Label>

                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">
                    Cidade
                  </Label>

                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">
                    UF
                  </Label>

                  <Input
                    id="estado"
                    name="estado"
                    maxLength={2}
                    value={formData.estado}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">
                    CEP
                  </Label>

                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regiao">
                    Região/Zona
                  </Label>

                  <Select
                    value={formData.regiao}
                    disabled={bloqueado}
                    onValueChange={(valor) =>
                      alterarCampo("regiao", valor)
                    }
                  >
                    <SelectTrigger id="regiao">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Zona Norte">
                        Zona Norte
                      </SelectItem>
                      <SelectItem value="Zona Sul">
                        Zona Sul
                      </SelectItem>
                      <SelectItem value="Zona Leste">
                        Zona Leste
                      </SelectItem>
                      <SelectItem value="Zona Oeste">
                        Zona Oeste
                      </SelectItem>
                      <SelectItem value="Centro">
                        Centro
                      </SelectItem>
                      <SelectItem value="Grande SP">
                        Grande SP
                      </SelectItem>
                      <SelectItem value="Interior">
                        Interior
                      </SelectItem>
                      <SelectItem value="Outro Estado">
                        Outro Estado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rota">
                    Rota de Visita
                  </Label>

                  <Select
                    value={formData.rota}
                    disabled={bloqueado}
                    onValueChange={(valor) =>
                      alterarCampo("rota", valor)
                    }
                  >
                    <SelectTrigger id="rota">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Segunda">
                        Segunda-feira
                      </SelectItem>
                      <SelectItem value="Terca">
                        Terça-feira
                      </SelectItem>
                      <SelectItem value="Quarta">
                        Quarta-feira
                      </SelectItem>
                      <SelectItem value="Quinta">
                        Quinta-feira
                      </SelectItem>
                      <SelectItem value="Sexta">
                        Sexta-feira
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contato">
                    Nome do Contato
                  </Label>

                  <Input
                    id="contato"
                    name="contato"
                    value={formData.contato}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">
                    Cargo
                  </Label>

                  <Input
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    Telefone
                  </Label>

                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    WhatsApp
                  </Label>

                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-mail
                  </Label>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={bloqueado}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>

            <CardContent>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                disabled={bloqueado}
                rows={3}
              />
            </CardContent>
          </Card>

          {emQualificacao && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>
                  Formalização do pré-cadastro
                </CardTitle>

                <CardDescription>
                  Esta opção só altera a situação
                  do mesmo Cliente depois de um
                  aceite real registrado em Orçamento.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <label className="flex items-start gap-3 rounded-md border bg-slate-50 p-4 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0"
                    checked={formalizar}
                    disabled={bloqueado}
                    onChange={(event) => {
                      setFormalizar(event.target.checked)
                      setIdentidadeConfirmada(false)
                    }}
                  />

                  <span>
                    <strong>
                      Formalizar este mesmo cadastro como Ativo
                    </strong>
                    <br />
                    Selecione somente depois que
                    houver um Orçamento aprovado
                    com confirmação real do comprador.
                    A API verificará essa condição.
                  </span>
                </label>

                {formalizar && (
                  <>
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Confira a razão social e o
                      CNPJ verdadeiro. A validação
                      de formato não confirma, por si
                      só, que a empresa é a mesma
                      da Prospecção.
                    </div>

                    <label className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0"
                        checked={identidadeConfirmada}
                        disabled={bloqueado}
                        onChange={(event) =>
                          setIdentidadeConfirmada(
                            event.target.checked
                          )
                        }
                      />

                      <span>
                        Conferi a identidade da
                        empresa, o CNPJ, a Prospecção
                        vinculada e a aprovação
                        original do comprador.
                        Confirmo que estou
                        formalizando o{" "}
                        <strong>mesmo cadastro</strong>,
                        sem criar duplicidade ou
                        informar dados fictícios.
                      </span>
                    </label>

                    {identidadeConfirmada && (
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmação informada.
                        A API ainda verificará
                        o Orçamento elegível.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={
                bloqueado ||
                (formalizar && !identidadeConfirmada)
              }
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {saving
                ? "Salvando..."
                : formalizar
                  ? "Confirmar formalização"
                  : "Salvar alterações"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={bloqueado}
              onClick={() =>
                router.push(
                  `/clientes/${encodeURIComponent(id)}`
                )
              }
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}