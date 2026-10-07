"use client"

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react"

import {
  useParams,
  useRouter,
} from "next/navigation"

import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Save,
  Settings2,
  Trash2,
  Users,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Input,
} from "@/components/ui/input"

import {
  Label,
} from "@/components/ui/label"

import {
  Textarea,
} from "@/components/ui/textarea"

type SimNao =
  | ""
  | "sim"
  | "nao"

type Faixa = {
  desconto: string
  comissao: string
}

type RepresentadaAPI = {
  id: string
  codigo: string | null
  nome: string
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

  regraReconhecimentoComissao:
    | string
    | null

  contratoAssinado: boolean

  emiteNF: boolean

  exigeNFComissao: boolean

  status: string

  observacoes:
    | string
    | null
}

type FormData = {
  codigo: string
  nome: string
  cnpj: string

  contatoPrincipal: string
  emailPrincipal: string
  telefonePrincipal: string
  whatsappPrincipal: string

  endereco: string
  cidade: string
  estado: string
  cep: string

  comissao: string

  fechamentoComissao:
    string

  pagamentoComissao:
    string

  bancoComissao:
    string

  possuiPedidoMinimo:
    SimNao

  pedidoMinimo:
    string

  possuiMinimoParcela:
    SimNao

  minimoParcela:
    string

  politicaFrete:
    string

  regiaoAtendimento:
    string

  prazoEntregaDias:
    string

  prazoFaturamentoDias:
    string

  regraReconhecimentoComissao:
    string

  contratoAssinado:
    SimNao

  emiteNF:
    SimNao

  exigeNFComissao:
    SimNao

  status: string

  observacoes: string
}

type TituloSecaoProps = {
  icone: ReactNode
  titulo: string
  descricao?: string
}

function TituloSecao({
  icone,
  titulo,
  descricao,
}: TituloSecaoProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icone}
      </div>

      <div>
        <CardTitle className="text-lg">
          {titulo}
        </CardTitle>

        {descricao && (
          <CardDescription className="mt-1">
            {descricao}
          </CardDescription>
        )}
      </div>
    </div>
  )
}

export default function EditarRepresentadaPage() {
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
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    carregando,
    setCarregando,
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
    erroGeral,
    setErroGeral,
  ] =
    useState<
      string | null
    >(null)

  const [
    alterado,
    setAlterado,
  ] =
    useState(false)

  const [
    tipoComissao,
    setTipoComissao,
  ] =
    useState<
      "fixa" | "variada"
    >("fixa")

  const [
    errors,
    setErrors,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({})

  const [
    faixas,
    setFaixas,
  ] =
    useState<Faixa[]>([
      {
        desconto: "",
        comissao: "",
      },
    ])

  const [
    formData,
    setFormData,
  ] =
    useState<FormData>({
      codigo: "",
      nome: "",
      cnpj: "",

      contatoPrincipal:
        "",

      emailPrincipal:
        "",

      telefonePrincipal:
        "",

      whatsappPrincipal:
        "",

      endereco: "",
      cidade: "",
      estado: "",
      cep: "",

      comissao: "",

      fechamentoComissao:
        "",

      pagamentoComissao:
        "",

      bancoComissao:
        "",

      possuiPedidoMinimo:
        "",

      pedidoMinimo:
        "",

      possuiMinimoParcela:
        "",

      minimoParcela:
        "",

      politicaFrete:
        "",

      regiaoAtendimento:
        "",

      prazoEntregaDias:
        "",

      prazoFaturamentoDias:
        "",

      regraReconhecimentoComissao:
        "",

      contratoAssinado:
        "",

      emiteNF:
        "",

      exigeNFComissao:
        "",

      status:
        "Em configuração",

      observacoes:
        "",
    })

  useEffect(() => {
    if (!id) {
      return
    }

    async function carregar() {
      try {
        setErro(null)

        const response =
          await fetch(
            `/api/representadas/${id}`,
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
          !response.ok ||
          !data
        ) {
          throw new Error(
            data?.message ||
              "Erro ao carregar Representada."
          )
        }

        const representada =
          data as RepresentadaAPI

        const possuiPedidoMinimo:
          SimNao =
          representada.pedidoMinimo ===
          null
            ? ""
            : representada.pedidoMinimo >
                0
              ? "sim"
              : "nao"

        const possuiMinimoParcela:
          SimNao =
          representada.minimoParcela ===
          null
            ? ""
            : representada.minimoParcela >
                0
              ? "sim"
              : "nao"

        setFormData({
          codigo:
            representada.codigo ||
            "",

          nome:
            representada.nome ||
            "",

          cnpj:
            representada.cnpj ||
            "",

          contatoPrincipal:
            representada.contatoPrincipal ||
            "",

          emailPrincipal:
            representada.emailPrincipal ||
            "",

          telefonePrincipal:
            representada.telefonePrincipal ||
            "",

          whatsappPrincipal:
            representada.whatsappPrincipal ||
            "",

          endereco:
            representada.endereco ||
            "",

          cidade:
            representada.cidade ||
            "",

          estado:
            representada.estado ||
            "",

          cep:
            representada.cep ||
            "",

          comissao:
            representada.comissao !==
            null
              ? String(
                  representada.comissao
                )
              : "",

          fechamentoComissao:
            representada.fechamentoComissao ||
            "",

          pagamentoComissao:
            representada.pagamentoComissao ||
            "",

          bancoComissao:
            representada.bancoComissao ||
            "",

          possuiPedidoMinimo,

          pedidoMinimo:
            representada.pedidoMinimo !==
              null &&
            representada.pedidoMinimo >
              0
              ? String(
                  representada.pedidoMinimo
                )
              : "",

          possuiMinimoParcela,

          minimoParcela:
            representada.minimoParcela !==
              null &&
            representada.minimoParcela >
              0
              ? String(
                  representada.minimoParcela
                )
              : "",

          politicaFrete:
            representada.politicaFrete ||
            "",

          regiaoAtendimento:
            representada.regiaoAtendimento ||
            "",

          prazoEntregaDias:
            representada.prazoEntregaDias !==
            null
              ? String(
                  representada.prazoEntregaDias
                )
              : "",

          prazoFaturamentoDias:
            representada.prazoFaturamentoDias !==
            null
              ? String(
                  representada.prazoFaturamentoDias
                )
              : "",

          regraReconhecimentoComissao:
            representada.regraReconhecimentoComissao ||
            "",

          contratoAssinado:
            representada.contratoAssinado
              ? "sim"
              : "nao",

          emiteNF:
            representada.emiteNF
              ? "sim"
              : "nao",

          exigeNFComissao:
            representada.exigeNFComissao
              ? "sim"
              : "nao",

          status:
            representada.status ||
            "Em configuração",

          observacoes:
            representada.observacoes ||
            "",
        })

        const tipo =
          representada.tipoComissao ===
          "variada"
            ? "variada"
            : "fixa"

        setTipoComissao(
          tipo
        )

        if (
          representada.faixasComissao
        ) {
          try {
            const parsed =
              JSON.parse(
                representada.faixasComissao
              )

            if (
              Array.isArray(
                parsed
              ) &&
              parsed.length >
                0
            ) {
              setFaixas(
                parsed.map(
                  (
                    faixa
                  ) => ({
                    desconto:
                      String(
                        faixa.desconto ??
                          ""
                      ),

                    comissao:
                      String(
                        faixa.comissao ??
                          ""
                      ),
                  })
                )
              )
            }
          } catch {
            setFaixas([
              {
                desconto:
                  "",

                comissao:
                  "",
              },
            ])
          }
        }

        setAlterado(
          false
        )
      } catch (
        error
      ) {
        console.error(
          "Erro ao carregar Representada:",
          error
        )

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar Representada."
        )
      } finally {
        setCarregando(
          false
        )
      }
    }

    carregar()
  }, [id])

  useEffect(() => {
    if (!alterado) {
      return
    }

    function avisarSaida(
      event:
        BeforeUnloadEvent
    ) {
      event.preventDefault()

      event.returnValue =
        ""
    }

    window.addEventListener(
      "beforeunload",
      avisarSaida
    )

    return () => {
      window.removeEventListener(
        "beforeunload",
        avisarSaida
      )
    }
  }, [alterado])

  function navegarComConfirmacao(
    destino: string
  ) {
    if (
      alterado &&
      !loading
    ) {
      const confirmar =
        window.confirm(
          "Existem alterações não salvas nesta Representada. Deseja sair sem salvar?"
        )

      if (!confirmar) {
        return
      }
    }

    router.push(
      destino
    )
  }

  function formatarCNPJ(
    valor: string
  ) {
    const numeros =
      valor.replace(
        /\D/g,
        ""
      )

    if (
      numeros.length <=
      2
    ) {
      return numeros
    }

    if (
      numeros.length <=
      5
    ) {
      return `${numeros.slice(
        0,
        2
      )}.${numeros.slice(
        2
      )}`
    }

    if (
      numeros.length <=
      8
    ) {
      return `${numeros.slice(
        0,
        2
      )}.${numeros.slice(
        2,
        5
      )}.${numeros.slice(
        5
      )}`
    }

    return `${numeros.slice(
      0,
      2
    )}.${numeros.slice(
      2,
      5
    )}.${numeros.slice(
      5,
      8
    )}/${numeros.slice(
      8,
      12
    )}-${numeros.slice(
      12,
      14
    )}`
  }

  function limparErro(
    campo: string
  ) {
    if (
      !errors[campo]
    ) {
      return
    }

    setErrors(
      (
        anterior
      ) => ({
        ...anterior,

        [campo]:
          "",
      })
    )
  }

  function atualizarCampo(
    campo:
      keyof FormData,
    valor: string
  ) {
    setFormData(
      (
        anterior
      ) => ({
        ...anterior,

        [campo]:
          valor,
      })
    )

    setAlterado(
      true
    )

    limparErro(
      campo
    )
  }

  function handleChange(
    event:
      ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >
  ) {
    const {
      name,
      value,
    } =
      event.target

    if (
      name ===
      "cnpj"
    ) {
      atualizarCampo(
        "cnpj",
        formatarCNPJ(
          value
        )
      )

      return
    }

    atualizarCampo(
      name as keyof FormData,
      value
    )
  }

  function handleFaixaChange(
    index: number,
    campo:
      | "desconto"
      | "comissao",
    valor: string
  ) {
    setFaixas(
      (
        anterior
      ) => {
        const novas =
          [
            ...anterior,
          ]

        novas[
          index
        ] = {
          ...novas[
            index
          ],

          [campo]:
            valor,
        }

        return novas
      }
    )

    setAlterado(
      true
    )

    limparErro(
      "faixas"
    )
  }

  function adicionarFaixa() {
    setFaixas(
      (
        anterior
      ) => [
        ...anterior,

        {
          desconto:
            "",

          comissao:
            "",
        },
      ]
    )

    setAlterado(
      true
    )
  }

  function removerFaixa(
    index: number
  ) {
    if (
      faixas.length <=
      1
    ) {
      return
    }

    setFaixas(
      (
        anterior
      ) =>
        anterior.filter(
          (
            _,
            indice
          ) =>
            indice !==
            index
        )
    )

    setAlterado(
      true
    )
  }

  function validarFormulario() {
    const novosErros:
      Record<
        string,
        string
      > = {}

    if (
      !formData.nome.trim()
    ) {
      novosErros.nome =
        "Nome é obrigatório."
    }

    if (
      !formData.cnpj.trim()
    ) {
      novosErros.cnpj =
        "CNPJ é obrigatório."
    } else if (
      formData.cnpj.replace(
        /\D/g,
        ""
      ).length !==
      14
    ) {
      novosErros.cnpj =
        "CNPJ deve conter 14 dígitos."
    }

    if (
      !formData.emailPrincipal.trim()
    ) {
      novosErros.emailPrincipal =
        "E-mail é obrigatório."
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.emailPrincipal
      )
    ) {
      novosErros.emailPrincipal =
        "E-mail inválido."
    }

    if (
      !formData.telefonePrincipal.trim()
    ) {
      novosErros.telefonePrincipal =
        "Telefone é obrigatório."
    }

    if (
      tipoComissao ===
      "fixa"
    ) {
      const comissao =
        Number(
          formData.comissao
        )

      if (
        !formData.comissao.trim()
      ) {
        novosErros.comissao =
          "Comissão fixa é obrigatória."
      } else if (
        !Number.isFinite(
          comissao
        ) ||
        comissao <= 0 ||
        comissao > 100
      ) {
        novosErros.comissao =
          "Informe percentual maior que zero e até 100%."
      }
    }

    if (
      tipoComissao ===
      "variada"
    ) {
      const validas =
        faixas.every(
          (
            faixa
          ) => {
            const desconto =
              Number(
                faixa.desconto
              )

            const comissao =
              Number(
                faixa.comissao
              )

            return (
              faixa.desconto.trim() !==
                "" &&
              faixa.comissao.trim() !==
                "" &&
              Number.isFinite(
                desconto
              ) &&
              desconto >=
                0 &&
              desconto <=
                100 &&
              Number.isFinite(
                comissao
              ) &&
              comissao >
                0 &&
              comissao <=
                100
            )
          }
        )

      if (
        !validas
      ) {
        novosErros.faixas =
          "Preencha corretamente todas as faixas da comissão variável."
      }
    }

    if (
      !formData.fechamentoComissao.trim()
    ) {
      novosErros.fechamentoComissao =
        "Informe a regra de fechamento da comissão."
    }

    if (
      !formData.pagamentoComissao.trim()
    ) {
      novosErros.pagamentoComissao =
        "Informe a regra de pagamento da comissão."
    }

    if (
      ![
        "Faturamento",
        "Liquidez",
      ].includes(
        formData.regraReconhecimentoComissao
      )
    ) {
      novosErros.regraReconhecimentoComissao =
        "Selecione se a comissão é calculada sobre Faturamento ou Liquidez."
    }

    if (
      !formData.possuiPedidoMinimo
    ) {
      novosErros.possuiPedidoMinimo =
        "Informe se existe pedido mínimo."
    }

    if (
      formData.possuiPedidoMinimo ===
      "sim"
    ) {
      const valor =
        Number(
          formData.pedidoMinimo
        )

      if (
        !formData.pedidoMinimo.trim() ||
        !Number.isFinite(
          valor
        ) ||
        valor <= 0
      ) {
        novosErros.pedidoMinimo =
          "Informe o valor do pedido mínimo."
      }
    }

    if (
      !formData.possuiMinimoParcela
    ) {
      novosErros.possuiMinimoParcela =
        "Informe se existe valor mínimo por parcela."
    }

    if (
      formData.possuiMinimoParcela ===
      "sim"
    ) {
      const valor =
        Number(
          formData.minimoParcela
        )

      if (
        !formData.minimoParcela.trim() ||
        !Number.isFinite(
          valor
        ) ||
        valor <= 0
      ) {
        novosErros.minimoParcela =
          "Informe o valor mínimo por parcela."
      }
    }

    if (
      !formData.politicaFrete.trim()
    ) {
      novosErros.politicaFrete =
        "Política de frete é obrigatória."
    }

    if (
      formData.prazoEntregaDias.trim()
    ) {
      const prazo =
        Number(
          formData.prazoEntregaDias
        )

      if (
        !Number.isInteger(
          prazo
        ) ||
        prazo < 0
      ) {
        novosErros.prazoEntregaDias =
          "Informe quantidade inteira de dias."
      }
    }

    if (
      formData.prazoFaturamentoDias.trim()
    ) {
      const prazo =
        Number(
          formData.prazoFaturamentoDias
        )

      if (
        !Number.isInteger(
          prazo
        ) ||
        prazo < 0
      ) {
        novosErros.prazoFaturamentoDias =
          "Informe quantidade inteira de dias."
      }
    }

    if (
      !formData.contratoAssinado
    ) {
      novosErros.contratoAssinado =
        "Informe se existe contrato assinado."
    }

    if (
      !formData.emiteNF
    ) {
      novosErros.emiteNF =
        "Informe se a Representada emite NF de venda."
    }

    if (
      !formData.exigeNFComissao
    ) {
      novosErros.exigeNFComissao =
        "Informe se exige NF de comissão."
    }

    setErrors(
      novosErros
    )

    if (
      Object.keys(
        novosErros
      ).length >
      0
    ) {
      setErroGeral(
        "Cadastro incompleto. Complete ou confirme os campos destacados antes de atualizar a Representada."
      )

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      })

      return false
    }

    setErroGeral(
      null
    )

    return true
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !validarFormulario()
    ) {
      return
    }

    setLoading(
      true
    )

    setErroGeral(
      null
    )

    try {
      const payload = {
        ...formData,

        tipoComissao,

        comissao:
          tipoComissao ===
          "fixa"
            ? formData.comissao
            : null,

        faixasComissao:
          tipoComissao ===
          "variada"
            ? JSON.stringify(
                faixas
              )
            : null,

        possuiPedidoMinimo:
          formData.possuiPedidoMinimo ===
          "sim",

        pedidoMinimo:
          formData.possuiPedidoMinimo ===
          "sim"
            ? formData.pedidoMinimo
            : 0,

        possuiMinimoParcela:
          formData.possuiMinimoParcela ===
          "sim",

        minimoParcela:
          formData.possuiMinimoParcela ===
          "sim"
            ? formData.minimoParcela
            : 0,

        prazoEntregaDias:
          formData.prazoEntregaDias.trim()
            ? formData.prazoEntregaDias
            : null,

        prazoFaturamentoDias:
          formData.prazoFaturamentoDias.trim()
            ? formData.prazoFaturamentoDias
            : null,

        contratoAssinado:
          formData.contratoAssinado ===
          "sim",

        emiteNF:
          formData.emiteNF ===
          "sim",

        exigeNFComissao:
          formData.exigeNFComissao ===
          "sim",
      }

      const response =
        await fetch(
          `/api/representadas/${id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
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
            "Erro ao atualizar Representada."
        )
      }

      setAlterado(
        false
      )

      alert(
        "Cadastro principal da Representada atualizado com sucesso."
      )

      router.push(
        `/representadas/${id}`
      )
    } catch (
      error
    ) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar Representada."

      setErroGeral(
        mensagem
      )

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      })
    } finally {
      setLoading(
        false
      )
    }
  }

  function classeErro(
    campo: string
  ) {
    return errors[
      campo
    ]
      ? "border-red-500"
      : ""
  }

  function ErroCampo({
    campo,
  }: {
    campo: string
  }) {
    if (
      !errors[
        campo
      ]
    ) {
      return null
    }

    return (
      <p className="mt-1 text-sm text-red-600">
        {
          errors[
            campo
          ]
        }
      </p>
    )
  }

  if (
    carregando
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />

          <p className="text-gray-600">
            Carregando dados...
          </p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />

          <div className="flex-1">
            <h2 className="font-semibold text-red-900">
              {erro}
            </h2>

            <p className="mt-1 text-sm text-red-700">
              Verifique o acesso ou tente novamente.
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  navegarComConfirmacao(
                    `/representadas/${id}`
                  )
                }
                disabled={
                  loading
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />

                Voltar
              </Button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                    Cadastro principal da Representada
                  </h1>

                  {alterado ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5" />

                      Alterações não salvas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Dados carregados
                    </span>
                  )}
                </div>

                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  Aqui você altera o cadastro e a política principal da
                  Representada. Regras com vigência, versões históricas ou
                  condições específicas de clientes são administradas em
                  Regras Comerciais.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navegarComConfirmacao(
                    `/representadas/${id}/regras-comerciais`
                  )
                }
                disabled={
                  loading
                }
              >
                <Settings2 className="mr-2 h-4 w-4" />

                Regras comerciais
              </Button>

              <Button
                type="submit"
                form="form-editar-representada"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />

                    Salvar alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-2 shadow-sm">
          <a
            href="#dados-principais"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Dados principais
          </a>

          <a
            href="#contato-endereco"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Contato e endereço
          </a>

          <a
            href="#politica-operacional"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Política operacional
          </a>

          <a
            href="#comissao"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Comissão
          </a>

          <a
            href="#contrato-fiscal"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Contrato e fiscal
          </a>

          <a
            href="#observacoes"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Observações
          </a>
        </div>

        {erroGeral && (
          <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Não foi possível salvar
              </p>

              <p className="mt-1">
                {erroGeral}
              </p>
            </div>
          </div>
        )}

        <form
          id="form-editar-representada"
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <Card
            id="dados-principais"
            className="scroll-mt-6"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <Building2 className="h-5 w-5" />
                }
                titulo="Dados principais"
                descricao="Identificação e situação atual da Representada."
              />
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 p-4 pt-2 md:grid-cols-2">
              <div>
                <Label>
                  Código interno
                </Label>

                <Input
                  value={
                    formData.codigo
                  }
                  disabled
                  className="mt-1 bg-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="nome">
                  Nome *
                </Label>

                <Input
                  id="nome"
                  name="nome"
                  value={
                    formData.nome
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className={`mt-1 ${classeErro(
                    "nome"
                  )}`}
                />

                <ErroCampo campo="nome" />
              </div>

              <div>
                <Label htmlFor="cnpj">
                  CNPJ *
                </Label>

                <Input
                  id="cnpj"
                  name="cnpj"
                  value={
                    formData.cnpj
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={
                    18
                  }
                  disabled={
                    loading
                  }
                  placeholder="00.000.000/0000-00"
                  className={`mt-1 ${classeErro(
                    "cnpj"
                  )}`}
                />

                <ErroCampo campo="cnpj" />
              </div>

              <div>
                <Label htmlFor="status">
                  Status
                </Label>

                <select
                  id="status"
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="Em configuração">
                    Em configuração
                  </option>

                  <option value="Ativa">
                    Ativa
                  </option>

                  <option value="Inativa">
                    Inativa
                  </option>

                  <option value="Suspensa">
                    Suspensa
                  </option>
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  A ativação comercial depende das regras vigentes da
                  Representada.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="contato-endereco"
            className="scroll-mt-6"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <Users className="h-5 w-5" />
                }
                titulo="Contato e endereço"
                descricao="Dados de comunicação e localização da Representada."
              />
            </CardHeader>

            <CardContent className="space-y-4 p-4 pt-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="contatoPrincipal">
                    Contato principal
                  </Label>

                  <Input
                    id="contatoPrincipal"
                    name="contatoPrincipal"
                    value={
                      formData.contatoPrincipal
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="emailPrincipal">
                    E-mail *
                  </Label>

                  <Input
                    id="emailPrincipal"
                    name="emailPrincipal"
                    type="email"
                    value={
                      formData.emailPrincipal
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 ${classeErro(
                      "emailPrincipal"
                    )}`}
                  />

                  <ErroCampo campo="emailPrincipal" />
                </div>

                <div>
                  <Label htmlFor="telefonePrincipal">
                    Telefone *
                  </Label>

                  <Input
                    id="telefonePrincipal"
                    name="telefonePrincipal"
                    value={
                      formData.telefonePrincipal
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 ${classeErro(
                      "telefonePrincipal"
                    )}`}
                  />

                  <ErroCampo campo="telefonePrincipal" />
                </div>

                <div>
                  <Label htmlFor="whatsappPrincipal">
                    WhatsApp
                  </Label>

                  <Input
                    id="whatsappPrincipal"
                    name="whatsappPrincipal"
                    value={
                      formData.whatsappPrincipal
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />

                  <p className="text-sm font-semibold text-slate-800">
                    Endereço
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                  <div className="md:col-span-6">
                    <Label htmlFor="endereco">
                      Endereço
                    </Label>

                    <Input
                      id="endereco"
                      name="endereco"
                      value={
                        formData.endereco
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label htmlFor="cidade">
                      Cidade
                    </Label>

                    <Input
                      id="cidade"
                      name="cidade"
                      value={
                        formData.cidade
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="estado">
                      Estado
                    </Label>

                    <Input
                      id="estado"
                      name="estado"
                      value={
                        formData.estado
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={
                        2
                      }
                      disabled={
                        loading
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="cep">
                      CEP
                    </Label>

                    <Input
                      id="cep"
                      name="cep"
                      value={
                        formData.cep
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            id="politica-operacional"
            className="scroll-mt-6 border-blue-200"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <Settings2 className="h-5 w-5 text-blue-700" />
                }
                titulo="Política operacional principal"
                descricao="Condições padrão usadas como referência operacional da Representada."
              />
            </CardHeader>

            <CardContent className="space-y-4 p-4 pt-2">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                Estes dados formam a referência principal do cadastro.
                Regras comerciais com vigência própria ou condições
                específicas devem ser cadastradas em
                <strong> Regras Comerciais</strong>.
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="possuiPedidoMinimo">
                    Possui pedido mínimo? *
                  </Label>

                  <select
                    id="possuiPedidoMinimo"
                    name="possuiPedidoMinimo"
                    value={
                      formData.possuiPedidoMinimo
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                      "possuiPedidoMinimo"
                    )}`}
                  >
                    <option value="">
                      Selecione
                    </option>

                    <option value="sim">
                      Sim
                    </option>

                    <option value="nao">
                      Não possui
                    </option>
                  </select>

                  <ErroCampo campo="possuiPedidoMinimo" />
                </div>

                {formData.possuiPedidoMinimo ===
                  "sim" && (
                  <div>
                    <Label htmlFor="pedidoMinimo">
                      Pedido mínimo (R$) *
                    </Label>

                    <Input
                      id="pedidoMinimo"
                      name="pedidoMinimo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formData.pedidoMinimo
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className={`mt-1 ${classeErro(
                        "pedidoMinimo"
                      )}`}
                    />

                    <ErroCampo campo="pedidoMinimo" />
                  </div>
                )}

                <div>
                  <Label htmlFor="possuiMinimoParcela">
                    Possui valor mínimo por parcela? *
                  </Label>

                  <select
                    id="possuiMinimoParcela"
                    name="possuiMinimoParcela"
                    value={
                      formData.possuiMinimoParcela
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                      "possuiMinimoParcela"
                    )}`}
                  >
                    <option value="">
                      Selecione
                    </option>

                    <option value="sim">
                      Sim
                    </option>

                    <option value="nao">
                      Não possui
                    </option>
                  </select>

                  <ErroCampo campo="possuiMinimoParcela" />
                </div>

                {formData.possuiMinimoParcela ===
                  "sim" && (
                  <div>
                    <Label htmlFor="minimoParcela">
                      Mínimo por parcela (R$) *
                    </Label>

                    <Input
                      id="minimoParcela"
                      name="minimoParcela"
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formData.minimoParcela
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className={`mt-1 ${classeErro(
                        "minimoParcela"
                      )}`}
                    />

                    <ErroCampo campo="minimoParcela" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="politicaFrete">
                    Política de frete *
                  </Label>

                  <Input
                    id="politicaFrete"
                    name="politicaFrete"
                    value={
                      formData.politicaFrete
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder="Ex.: CIF, FOB, sob consulta..."
                    className={`mt-1 ${classeErro(
                      "politicaFrete"
                    )}`}
                  />

                  <ErroCampo campo="politicaFrete" />
                </div>

                <div>
                  <Label htmlFor="regiaoAtendimento">
                    Região de atendimento
                  </Label>

                  <Input
                    id="regiaoAtendimento"
                    name="regiaoAtendimento"
                    value={
                      formData.regiaoAtendimento
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="prazoEntregaDias">
                    Prazo de entrega padrão (dias)
                  </Label>

                  <Input
                    id="prazoEntregaDias"
                    name="prazoEntregaDias"
                    type="number"
                    step="1"
                    min="0"
                    value={
                      formData.prazoEntregaDias
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder="Vazio = sob consulta"
                    className={`mt-1 ${classeErro(
                      "prazoEntregaDias"
                    )}`}
                  />

                  <ErroCampo campo="prazoEntregaDias" />
                </div>

                <div>
                  <Label htmlFor="prazoFaturamentoDias">
                    Prazo de faturamento padrão (dias)
                  </Label>

                  <Input
                    id="prazoFaturamentoDias"
                    name="prazoFaturamentoDias"
                    type="number"
                    step="1"
                    min="0"
                    value={
                      formData.prazoFaturamentoDias
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder="Vazio = sob consulta"
                    className={`mt-1 ${classeErro(
                      "prazoFaturamentoDias"
                    )}`}
                  />

                  <ErroCampo campo="prazoFaturamentoDias" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            id="comissao"
            className="scroll-mt-6 border-emerald-200"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <BadgePercent className="h-5 w-5 text-emerald-700" />
                }
                titulo="Comissão principal"
                descricao="Parâmetros comerciais padrão atualmente cadastrados na Representada."
              />
            </CardHeader>

            <CardContent className="space-y-4 p-4 pt-2">
              <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Esta seção mantém a política principal. Para criar
                  histórico de vigência e versões comerciais, utilize
                  Regras Comerciais.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navegarComConfirmacao(
                      `/representadas/${id}/regras-comerciais`
                    )
                  }
                  disabled={
                    loading
                  }
                  className="shrink-0 bg-white"
                >
                  Abrir regras comerciais
                </Button>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    checked={
                      tipoComissao ===
                      "fixa"
                    }
                    onChange={() => {
                      if (
                        tipoComissao !==
                        "fixa"
                      ) {
                        setTipoComissao(
                          "fixa"
                        )

                        setAlterado(
                          true
                        )
                      }

                      limparErro(
                        "faixas"
                      )
                    }}
                    disabled={
                      loading
                    }
                  />

                  Fixa
                </label>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    checked={
                      tipoComissao ===
                      "variada"
                    }
                    onChange={() => {
                      if (
                        tipoComissao !==
                        "variada"
                      ) {
                        setTipoComissao(
                          "variada"
                        )

                        setAlterado(
                          true
                        )
                      }

                      limparErro(
                        "comissao"
                      )
                    }}
                    disabled={
                      loading
                    }
                  />

                  Variada
                </label>
              </div>

              {tipoComissao ===
                "fixa" && (
                <div className="max-w-md">
                  <Label htmlFor="comissao">
                    Comissão (%) *
                  </Label>

                  <Input
                    id="comissao"
                    name="comissao"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={
                      formData.comissao
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 ${classeErro(
                      "comissao"
                    )}`}
                  />

                  <ErroCampo campo="comissao" />
                </div>
              )}

              {tipoComissao ===
                "variada" && (
                <div className="space-y-3">
                  {faixas.map(
                    (
                      faixa,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="grid grid-cols-1 items-end gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <Label>
                            Desconto / faixa (%)
                          </Label>

                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={
                              faixa.desconto
                            }
                            onChange={(
                              event
                            ) =>
                              handleFaixaChange(
                                index,
                                "desconto",
                                event.target.value
                              )
                            }
                            disabled={
                              loading
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>
                            Comissão (%)
                          </Label>

                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={
                              faixa.comissao
                            }
                            onChange={(
                              event
                            ) =>
                              handleFaixaChange(
                                index,
                                "comissao",
                                event.target.value
                              )
                            }
                            disabled={
                              loading
                            }
                            className="mt-1"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            removerFaixa(
                              index
                            )
                          }
                          disabled={
                            loading ||
                            faixas.length ===
                              1
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}

                  <ErroCampo campo="faixas" />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={
                      adicionarFaixa
                    }
                    disabled={
                      loading
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />

                    Adicionar faixa
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="regraReconhecimentoComissao">
                    Comissão calculada sobre *
                  </Label>

                  <select
                    id="regraReconhecimentoComissao"
                    name="regraReconhecimentoComissao"
                    value={
                      formData.regraReconhecimentoComissao
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                      "regraReconhecimentoComissao"
                    )}`}
                  >
                    <option value="">
                      Selecione
                    </option>

                    <option value="Faturamento">
                      Faturamento
                    </option>

                    <option value="Liquidez">
                      Liquidez
                    </option>
                  </select>

                  <ErroCampo campo="regraReconhecimentoComissao" />
                </div>

                <div>
                  <Label htmlFor="fechamentoComissao">
                    Regra de fechamento *
                  </Label>

                  <Input
                    id="fechamentoComissao"
                    name="fechamentoComissao"
                    value={
                      formData.fechamentoComissao
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder="Ex.: fecha todo dia 25"
                    className={`mt-1 ${classeErro(
                      "fechamentoComissao"
                    )}`}
                  />

                  <ErroCampo campo="fechamentoComissao" />
                </div>

                <div>
                  <Label htmlFor="pagamentoComissao">
                    Regra de pagamento *
                  </Label>

                  <Input
                    id="pagamentoComissao"
                    name="pagamentoComissao"
                    value={
                      formData.pagamentoComissao
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder="Ex.: paga dia 10 do mês seguinte"
                    className={`mt-1 ${classeErro(
                      "pagamentoComissao"
                    )}`}
                  />

                  <ErroCampo campo="pagamentoComissao" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bancoComissao">
                    Informação bancária antiga / observação
                  </Label>

                  <Input
                    id="bancoComissao"
                    name="bancoComissao"
                    value={
                      formData.bancoComissao
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="mt-1"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    As contas efetivas continuam sendo controladas em
                    Contas de Recebimento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            id="contrato-fiscal"
            className="scroll-mt-6"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <FileText className="h-5 w-5" />
                }
                titulo="Contrato e documentos fiscais"
                descricao="Informações básicas sobre formalização e emissão de documentos."
              />
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 p-4 pt-2 md:grid-cols-3">
              <div>
                <Label htmlFor="contratoAssinado">
                  Existe contrato assinado? *
                </Label>

                <select
                  id="contratoAssinado"
                  name="contratoAssinado"
                  value={
                    formData.contratoAssinado
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                    "contratoAssinado"
                  )}`}
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="sim">
                    Sim
                  </option>

                  <option value="nao">
                    Não
                  </option>
                </select>

                <ErroCampo campo="contratoAssinado" />
              </div>

              <div>
                <Label htmlFor="emiteNF">
                  Representada emite NF de venda? *
                </Label>

                <select
                  id="emiteNF"
                  name="emiteNF"
                  value={
                    formData.emiteNF
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                    "emiteNF"
                  )}`}
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="sim">
                    Sim
                  </option>

                  <option value="nao">
                    Não
                  </option>
                </select>

                <ErroCampo campo="emiteNF" />
              </div>

              <div>
                <Label htmlFor="exigeNFComissao">
                  Exige NF de comissão? *
                </Label>

                <select
                  id="exigeNFComissao"
                  name="exigeNFComissao"
                  value={
                    formData.exigeNFComissao
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className={`mt-1 h-10 w-full rounded-md border px-3 text-sm ${classeErro(
                    "exigeNFComissao"
                  )}`}
                >
                  <option value="">
                    Selecione
                  </option>

                  <option value="sim">
                    Sim
                  </option>

                  <option value="nao">
                    Não
                  </option>
                </select>

                <ErroCampo campo="exigeNFComissao" />
              </div>

              <div className="md:col-span-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Data de início, encerramento, vigência e documentos do
                  contrato pertencem ao controle contratual da Representada
                  e não devem ser confundidos com este cadastro principal.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            id="observacoes"
            className="scroll-mt-6"
          >
            <CardHeader className="p-4 pb-2">
              <TituloSecao
                icone={
                  <FileText className="h-5 w-5" />
                }
                titulo="Observações"
                descricao="Particularidades gerais do cadastro principal."
              />
            </CardHeader>

            <CardContent className="p-4 pt-2">
              <Textarea
                rows={
                  4
                }
                name="observacoes"
                value={
                  formData.observacoes
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading
                }
                placeholder="Particularidades reais da Representada."
              />
            </CardContent>
          </Card>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

              <div className="text-sm text-emerald-950">
                <p className="font-semibold">
                  Revisão de cadastros antigos
                </p>

                <p className="mt-1">
                  Confira os dados reais antes de salvar. Não preencha
                  valores fictícios apenas para completar o cadastro.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {alterado ? (
                <span className="inline-flex items-center gap-2 font-medium text-amber-700">
                  <AlertCircle className="h-4 w-4" />

                  Existem alterações ainda não salvas.
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                  Nenhuma alteração pendente.
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navegarComConfirmacao(
                    `/representadas/${id}`
                  )
                }
                disabled={
                  loading
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Validando e salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />

                    Salvar alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}