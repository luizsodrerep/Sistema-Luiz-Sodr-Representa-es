
"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
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

type InteracaoOrigem = {
  id: string
  numeroSequencial: number
  tipo: string
  clienteId: string | null
  representadaId: string | null
  nomeProspect: string | null
  empresaProspect: string | null
  origemProspeccao: string | null
}

const DADOS_INICIAIS = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  contato: "",
  cargo: "",
  email: "",
  telefone: "",
  whatsapp: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  regiao: "",
  rota: "",
  categoria: "",
  status: "Ativo",
  aceitaEmail: true,
  observacoes: "",
}

export default function NovoClientePage() {
  const router = useRouter()

  const [formData, setFormData] = useState(DADOS_INICIAIS)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [parametrosLidos, setParametrosLidos] = useState(false)
  const [interacaoId, setInteracaoId] = useState<string | null>(null)
  const [origem, setOrigem] = useState<InteracaoOrigem | null>(null)
  const [carregandoOrigem, setCarregandoOrigem] = useState(false)
  const [identidadeConfirmada, setIdentidadeConfirmada] = useState(false)

  const modoPreCadastro = Boolean(interacaoId)

  useEffect(() => {
    let ativo = true

    const id = new URLSearchParams(
      window.location.search
    ).get("interacaoId")?.trim()

    if (!id) {
      setParametrosLidos(true)
      return
    }

    setInteracaoId(id)
    setCarregandoOrigem(true)
    setParametrosLidos(true)

    async function carregarOrigem() {
      try {
        const response = await fetch(
          `/api/interacoes/${encodeURIComponent(id!)}`,
          { cache: "no-store" }
        )

        const data = await response.json().catch(() => null)

        if (!ativo) return

        if (!response.ok || !data?.id) {
          setErro(
            data?.message ||
              "Não foi possível carregar a Prospecção de origem."
          )
          return
        }

        const interacao = data as InteracaoOrigem

        if (
          interacao.id !== id ||
          interacao.tipo !== "Prospecção" ||
          interacao.clienteId !== null ||
          interacao.representadaId !== null ||
          !interacao.nomeProspect?.trim()
        ) {
          setErro(
            "Esta interação não é uma Prospecção sem Cliente válida para pré-cadastro."
          )
          return
        }

        setOrigem(interacao)
      } catch {
        if (ativo) {
          setErro("Erro de comunicação ao consultar a Prospecção.")
        }
      } finally {
        if (ativo) {
          setCarregandoOrigem(false)
        }
      }
    }

    void carregarOrigem()

    return () => {
      ativo = false
    }
  }, [])

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target

    setFormData((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading || !parametrosLidos || carregandoOrigem) {
      return
    }

    setErro(null)

    if (!formData.razaoSocial.trim()) {
      setErro("Informe a razão social verdadeira da empresa.")
      return
    }

    if (modoPreCadastro && (!origem || origem.id !== interacaoId)) {
      setErro("A Prospecção de origem precisa ser validada.")
      return
    }

    if (modoPreCadastro && !identidadeConfirmada) {
      setErro(
        "Confirme que o cadastro corresponde à empresa real da Prospecção."
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          razaoSocial: formData.razaoSocial.trim(),
          status: modoPreCadastro ? "Em qualificação" : "Ativo",
          ...(modoPreCadastro
            ? {
                interacaoOrigemId: interacaoId,
                confirmarIdentidadeProspeccao: identidadeConfirmada,
              }
            : {}),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setErro(
          data?.message ||
            "Não foi possível cadastrar a empresa."
        )
        return
      }

      if (!data?.id) {
        setErro(
          "O servidor não confirmou o identificador do cadastro criado."
        )
        return
      }

      if (modoPreCadastro && interacaoId) {
        router.push(
          `/orcamentos/novo?interacaoId=${encodeURIComponent(interacaoId)}`
        )
      } else {
        router.push("/clientes")
      }
    } catch {
      setErro("Erro de comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const formularioBloqueado =
    !parametrosLidos ||
    carregandoOrigem ||
    loading ||
    (modoPreCadastro && !origem)

  return (
    <div className="mx-auto flex max-w-4xl flex-col p-8 pt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {modoPreCadastro
            ? "Pré-cadastro de empresa"
            : "Novo Cliente"}
        </h2>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </div>

      {erro && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregandoOrigem && (
        <div className="mb-5 rounded-md border p-4 text-sm">
          Carregando Prospecção de origem...
        </div>
      )}

      {modoPreCadastro && origem && (
        <Card className="mb-5 border-blue-200 bg-blue-50/40">
          <CardHeader>
            <CardTitle>
              Prospecção de origem
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Interação:</strong>{" "}
              INT-{String(origem.numeroSequencial).padStart(6, "0")}
            </p>

            <p>
              <strong>Contato:</strong>{" "}
              {origem.nomeProspect || "Não informado"}
            </p>

            <p>
              <strong>Empresa informada:</strong>{" "}
              {origem.empresaProspect || "Não informada"}
            </p>

            <p>
              <strong>Origem comercial:</strong>{" "}
              {origem.origemProspeccao || "Não informada"}
            </p>

            <p className="pt-2 text-xs text-blue-800">
              Informe somente dados verdadeiros e conhecidos.
              A razão social deve corresponder à empresa real;
              não utilize o nome do contato como razão social
              nem invente um CNPJ. Confira se a empresa já
              possui cadastro no CRM antes de prosseguir.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {modoPreCadastro && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                  <strong>Situação: Em qualificação.</strong>{" "}
                  Este é um pré-cadastro da empresa real, não
                  a formalização definitiva de Cliente. O CNPJ
                  pode ficar em branco se ainda não for conhecido.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">
                    Razão Social *
                  </Label>

                  <Input
                    id="razaoSocial"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    required
                    disabled={formularioBloqueado}
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
                    disabled={formularioBloqueado}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">
                    CNPJ
                  </Label>

                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0001-00"
                    disabled={formularioBloqueado}
                  />
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
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">
                    Categoria
                  </Label>

                  <Select
                    value={formData.categoria}
                    onValueChange={(valor) =>
                      setFormData((anterior) => ({
                        ...anterior,
                        categoria: valor,
                      }))
                    }
                    disabled={formularioBloqueado}
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
                  Endereço Completo
                </Label>

                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  disabled={formularioBloqueado}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">UF</Label>
                  <Input
                    id="estado"
                    name="estado"
                    maxLength={2}
                    value={formData.estado}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Região/Zona</Label>

                  <Select
                    value={formData.regiao}
                    onValueChange={(valor) =>
                      setFormData((anterior) => ({
                        ...anterior,
                        regiao: valor,
                      }))
                    }
                    disabled={formularioBloqueado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                      <SelectItem value="Zona Sul">Zona Sul</SelectItem>
                      <SelectItem value="Zona Leste">Zona Leste</SelectItem>
                      <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                      <SelectItem value="Centro">Centro</SelectItem>
                      <SelectItem value="Grande SP">Grande SP</SelectItem>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Outro Estado">Outro Estado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rota de Visita</Label>

                  <Select
                    value={formData.rota}
                    onValueChange={(valor) =>
                      setFormData((anterior) => ({
                        ...anterior,
                        rota: valor,
                      }))
                    }
                    disabled={formularioBloqueado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Segunda">Segunda-feira</SelectItem>
                      <SelectItem value="Terca">Terça-feira</SelectItem>
                      <SelectItem value="Quarta">Quarta-feira</SelectItem>
                      <SelectItem value="Quinta">Quinta-feira</SelectItem>
                      <SelectItem value="Sexta">Sexta-feira</SelectItem>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contato">Nome do Contato</Label>
                  <Input
                    id="contato"
                    name="contato"
                    value={formData.contato}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={formularioBloqueado}
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
                rows={3}
                disabled={formularioBloqueado}
              />
            </CardContent>
          </Card>

          {modoPreCadastro && origem && (
            <label className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0"
                checked={identidadeConfirmada}
                onChange={(event) =>
                  setIdentidadeConfirmada(event.target.checked)
                }
                disabled={loading}
              />

              <span>
                Confirmo que a razão social informada corresponde
                à empresa real da Prospecção{" "}
                <strong>
                  INT-{String(origem.numeroSequencial).padStart(6, "0")}
                </strong>
                . Verifiquei se já existe cadastro dessa empresa
                e não estou utilizando dados fictícios.
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              type="submit"
              disabled={
                formularioBloqueado ||
                (modoPreCadastro && !identidadeConfirmada)
              }
            >
              {loading
                ? "Salvando..."
                : modoPreCadastro
                  ? "Salvar pré-cadastro"
                  : "Salvar Cliente"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}