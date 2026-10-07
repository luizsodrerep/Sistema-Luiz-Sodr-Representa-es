"use client"

import {
  type FormEvent,
  useEffect,
  useState,
} from "react"

import {
  useParams,
  useRouter,
} from "next/navigation"

import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"

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
  Input,
} from "@/components/ui/input"

import {
  Label,
} from "@/components/ui/label"

import {
  Textarea,
} from "@/components/ui/textarea"

type Cliente = {
  id: string
  codigo: string | null
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string | null
  status: string
}

type Contrato = {
  id: string
  tipoFormalizacao: string
  descricao: string | null
  dataInicio: string | null
  dataEncerramento: string | null
  vigente: boolean
}

type RegraComercial = {
  id: string
  representadaId: string
  clienteId: string | null
  contratoId: string | null

  nome: string
  tipoEscopo: string

  vigenciaInicio: string
  vigenciaFim: string | null

  ativa: boolean

  pedidoMinimo: number | null
  minimoParcela: number | null

  prazoEntregaDias: number | null
  prazoFaturamentoDias: number | null

  frete: string | null
  regiao: string | null

  tipoComissao: string | null
  percentualComissao: number | null
  faixasComissao: string | null

  reconhecimentoComissao: string | null
  fechamentoComissao: string | null
  pagamentoComissao: string | null

  observacoes: string | null

  cliente: Cliente | null
  contrato: Contrato | null

  _count: {
    vendas: number
  }
}

type Representada = {
  id: string
  nome: string
  codigo: string | null

  comissao: number | null

  tipoComissao:
    | "fixa"
    | "variada"
    | null

  faixasComissao: string | null

  pedidoMinimo: number | null
  minimoParcela: number | null

  politicaFrete: string | null
  regiaoAtendimento: string | null

  prazoEntregaDias: number | null
  prazoFaturamentoDias: number | null

  regraReconhecimentoComissao: string | null
  fechamentoComissao: string | null
  pagamentoComissao: string | null
}

type Faixa = {
  desconto: string
  comissao: string
}

type FormRegra = {
  nome: string
  tipoEscopo: string

  clienteId: string
  contratoId: string

  vigenciaInicio: string
  vigenciaFim: string

  ativa: boolean

  pedidoMinimo: string
  minimoParcela: string

  prazoEntregaDias: string
  prazoFaturamentoDias: string

  frete: string
  regiao: string

  tipoComissao: string
  percentualComissao: string

  reconhecimentoComissao: string
  fechamentoComissao: string
  pagamentoComissao: string

  observacoes: string
}

const FORM_INICIAL: FormRegra = {
  nome: "",
  tipoEscopo: "Padrao",

  clienteId: "",
  contratoId: "",

  vigenciaInicio: "",
  vigenciaFim: "",

  ativa: true,

  pedidoMinimo: "",
  minimoParcela: "",

  prazoEntregaDias: "",
  prazoFaturamentoDias: "",

  frete: "",
  regiao: "",

  tipoComissao: "",
  percentualComissao: "",

  reconhecimentoComissao: "",
  fechamentoComissao: "",
  pagamentoComissao: "",

  observacoes: "",
}

function numeroParaInput(
  valor: number | null
) {
  return valor === null
    ? ""
    : String(valor)
}

function converterDataParaInput(
  valor: string | null
) {
  if (!valor) {
    return ""
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return ""
  }

  return data
    .toISOString()
    .slice(
      0,
      10
    )
}

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return "-"
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "-"
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(
    data
  )
}

function formatarValor(
  valor: number | null
) {
  if (
    valor === null
  ) {
    return "-"
  }

  if (
    valor === 0
  ) {
    return "Não se aplica"
  }

  return valor.toLocaleString(
    "pt-BR",
    {
      style:
        "currency",
      currency:
        "BRL",
    }
  )
}

function parseFaixas(
  valor: string | null
): Faixa[] {
  if (!valor) {
    return [
      {
        desconto: "",
        comissao: "",
      },
    ]
  }

  try {
    const resultado =
      JSON.parse(
        valor
      )

    if (
      Array.isArray(
        resultado
      ) &&
      resultado.length >
        0
    ) {
      return resultado.map(
        (
          faixa
        ) => ({
          desconto:
            String(
              faixa?.desconto ??
                ""
            ),

          comissao:
            String(
              faixa?.comissao ??
                ""
            ),
        })
      )
    }
  } catch {
    // usa faixa vazia
  }

  return [
    {
      desconto: "",
      comissao: "",
    },
  ]
}

function percentualFormulario(
  valor: string
): number | null {
  const texto =
    valor
      .trim()
      .replace(
        ",",
        "."
      )

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      texto
    )
  ) {
    return null
  }

  const numero =
    Number(
      texto
    )

  return (
    Number.isFinite(
      numero
    ) &&
    numero >= 0 &&
    numero <= 100
  )
    ? numero
    : null
}

function validarFaixasFormulario(
  valores: Faixa[]
): string | null {
  if (
    valores.length ===
    0
  ) {
    return "Cadastre ao menos uma faixa de comissão."
  }

  const descontosVistos =
    new Set<number>()

  for (
    const faixa of
      valores
  ) {
    const desconto =
      percentualFormulario(
        faixa.desconto
      )

    const comissao =
      percentualFormulario(
        faixa.comissao
      )

    if (
      desconto === null ||
      comissao === null ||
      comissao <= 0
    ) {
      return "Cada faixa deve ter desconto entre 0% e 100% e comissão maior que 0% e até 100%, com no máximo duas casas decimais."
    }

    if (
      descontosVistos.has(
        desconto
      )
    ) {
      return `O desconto de ${desconto}% está repetido. Cada percentual de desconto deve possuir uma única comissão.`
    }

    descontosVistos.add(
      desconto
    )
  }

  return null
}


function montarFormularioDoCadastro(
  representada: Representada
): FormRegra {
  return {
    nome:
      `Regra padrão - ${representada.nome}`,

    tipoEscopo:
      "Padrao",

    clienteId:
      "",

    contratoId:
      "",

    /*
     * A vigência não é presumida.
     * O usuário deve informar a data real
     * em que esta versão passa a valer.
     */
    vigenciaInicio:
      "",

    vigenciaFim:
      "",

    ativa:
      true,

    pedidoMinimo:
      numeroParaInput(
        representada.pedidoMinimo
      ),

    minimoParcela:
      numeroParaInput(
        representada.minimoParcela
      ),

    prazoEntregaDias:
      numeroParaInput(
        representada.prazoEntregaDias
      ),

    prazoFaturamentoDias:
      numeroParaInput(
        representada.prazoFaturamentoDias
      ),

    frete:
      representada.politicaFrete ||
      "",

    regiao:
      representada.regiaoAtendimento ||
      "",

    tipoComissao:
      representada.tipoComissao ||
      "",

    percentualComissao:
      representada.comissao ===
      null
        ? ""
        : String(
            representada.comissao
          ),

    reconhecimentoComissao:
      representada.regraReconhecimentoComissao ||
      "",

    fechamentoComissao:
      representada.fechamentoComissao ||
      "",

    pagamentoComissao:
      representada.pagamentoComissao ||
      "",

    observacoes:
      "",
  }
}

export default function RegrasComerciaisPage() {
  const params =
    useParams()

  const router =
    useRouter()

  const idParam =
    params.id

  const representadaId =
    typeof idParam ===
    "string"
      ? idParam
      : Array.isArray(
            idParam
          )
        ? idParam[0]
        : undefined

  const [
    representada,
    setRepresentada,
  ] =
    useState<Representada | null>(
      null
    )

  const [
    clientes,
    setClientes,
  ] =
    useState<Cliente[]>(
      []
    )

  const [
    contratos,
    setContratos,
  ] =
    useState<Contrato[]>(
      []
    )

  const [
    regras,
    setRegras,
  ] =
    useState<RegraComercial[]>(
      []
    )

  const [
    form,
    setForm,
  ] =
    useState<FormRegra>(
      FORM_INICIAL
    )

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
    regraEditandoId,
    setRegraEditandoId,
  ] =
    useState<
      string | null
    >(null)

  const [
    dadosReaproveitados,
    setDadosReaproveitados,
  ] =
    useState(false)

  const [
    novaVersaoOrigem,
    setNovaVersaoOrigem,
  ] =
    useState<string | null>(
      null
    )

  const [
    carregando,
    setCarregando,
  ] =
    useState(true)

  const [
    salvando,
    setSalvando,
  ] =
    useState(false)

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    if (
      !representadaId
    ) {
      setErro(
        "ID da representada não encontrado."
      )

      setCarregando(
        false
      )

      return
    }

    async function carregarDados() {
      try {
        setCarregando(
          true
        )

        setErro(
          null
        )

        const [
          respostaRepresentada,
          respostaRegras,
          respostaContratos,
          respostaClientes,
        ] =
          await Promise.all([
            fetch(
              `/api/representadas/${representadaId}`,
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              `/api/representadas/${representadaId}/regras-comerciais`,
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              `/api/representadas/${representadaId}/contratos`,
              {
                cache:
                  "no-store",
              }
            ),

            fetch(
              "/api/clientes",
              {
                cache:
                  "no-store",
              }
            ),
          ])

        if (
          !respostaRepresentada.ok
        ) {
          throw new Error(
            "Erro ao carregar representada."
          )
        }

        if (
          !respostaRegras.ok
        ) {
          throw new Error(
            "Erro ao carregar regras comerciais."
          )
        }

        if (
          !respostaContratos.ok
        ) {
          throw new Error(
            "Erro ao carregar contratos."
          )
        }

        if (
          !respostaClientes.ok
        ) {
          throw new Error(
            "Erro ao carregar clientes."
          )
        }

        const dadosRepresentada:
          Representada =
          await respostaRepresentada.json()

        const dadosRegras:
          RegraComercial[] =
          await respostaRegras.json()

        const dadosContratos:
          Contrato[] =
          await respostaContratos.json()

        const dadosClientes:
          Cliente[] =
          await respostaClientes.json()

        setRepresentada(
          dadosRepresentada
        )

        setRegras(
          dadosRegras
        )

        setContratos(
          dadosContratos
        )

        setClientes(
          dadosClientes
        )

        /*
         * Se ainda não existe uma regra padrão ativa,
         * aproveitamos os dados comerciais já gravados
         * no cadastro principal da Representada.
         *
         * Não há nova gravação no banco neste momento.
         */
        const existeRegraPadraoAtiva =
          dadosRegras.some(
            (
              regra
            ) =>
              regra.tipoEscopo ===
                "Padrao" &&
              regra.ativa
          )

        if (
          !existeRegraPadraoAtiva
        ) {
          setForm(
            montarFormularioDoCadastro(
              dadosRepresentada
            )
          )

          setFaixas(
            parseFaixas(
              dadosRepresentada.faixasComissao
            )
          )

          setDadosReaproveitados(
            true
          )
        }
      } catch (error) {
        const mensagem =
          error instanceof
          Error
            ? error.message
            : "Erro ao carregar dados."

        setErro(
          mensagem
        )
      } finally {
        setCarregando(
          false
        )
      }
    }

    carregarDados()
  }, [
    representadaId,
  ])

  function atualizarCampo<
    K extends keyof FormRegra,
  >(
    campo: K,
    valor: FormRegra[K]
  ) {
    setForm(
      (
        anterior
      ) => ({
        ...anterior,

        [campo]:
          valor,
      })
    )

    if (erro) {
      setErro(
        null
      )
    }
  }

  function reaproveitarCadastroPrincipal() {
    if (
      !representada
    ) {
      return
    }

    setForm(
      montarFormularioDoCadastro(
        representada
      )
    )

    setFaixas(
      parseFaixas(
        representada.faixasComissao
      )
    )

    setRegraEditandoId(
      null
    )

    setDadosReaproveitados(
      true
    )

    setNovaVersaoOrigem(
      null
    )

    setErro(
      null
    )
  }

  function limparFormulario() {
    setForm(
      FORM_INICIAL
    )

    setFaixas([
      {
        desconto: "",
        comissao: "",
      },
    ])

    setRegraEditandoId(
      null
    )

    setDadosReaproveitados(
      false
    )

    setNovaVersaoOrigem(
      null
    )

    setErro(
      null
    )
  }

  function editarRegra(
    regra:
      RegraComercial
  ) {
    if (
      regra._count.vendas >
        0
    ) {
      setErro(
        "Esta regra já foi utilizada em Venda e está congelada. Utilize Nova versão para preservar o histórico."
      )

      return
    }

    setRegraEditandoId(
      regra.id
    )

    setDadosReaproveitados(
      false
    )

    setNovaVersaoOrigem(
      null
    )

    setForm({
      nome:
        regra.nome,

      tipoEscopo:
        regra.tipoEscopo ||
        "Padrao",

      clienteId:
        regra.clienteId ||
        "",

      contratoId:
        regra.contratoId ||
        "",

      vigenciaInicio:
        converterDataParaInput(
          regra.vigenciaInicio
        ),

      vigenciaFim:
        converterDataParaInput(
          regra.vigenciaFim
        ),

      ativa:
        regra.ativa,

      pedidoMinimo:
        numeroParaInput(
          regra.pedidoMinimo
        ),

      minimoParcela:
        numeroParaInput(
          regra.minimoParcela
        ),

      prazoEntregaDias:
        numeroParaInput(
          regra.prazoEntregaDias
        ),

      prazoFaturamentoDias:
        numeroParaInput(
          regra.prazoFaturamentoDias
        ),

      frete:
        regra.frete ||
        "",

      regiao:
        regra.regiao ||
        "",

      tipoComissao:
        regra.tipoComissao ||
        "",

      percentualComissao:
        numeroParaInput(
          regra.percentualComissao
        ),

      reconhecimentoComissao:
        regra.reconhecimentoComissao ||
        "",

      fechamentoComissao:
        regra.fechamentoComissao ||
        "",

      pagamentoComissao:
        regra.pagamentoComissao ||
        "",

      observacoes:
        regra.observacoes ||
        "",
    })

    setFaixas(
      parseFaixas(
        regra.faixasComissao
      )
    )

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    })
  }

  function novaVersaoRegra(
    regra:
      RegraComercial
  ) {
    setRegraEditandoId(
      null
    )

    setDadosReaproveitados(
      false
    )

    setNovaVersaoOrigem(
      regra.nome
    )

    setForm({
      nome:
        regra.nome,

      tipoEscopo:
        regra.tipoEscopo ||
        "Padrao",

      clienteId:
        regra.clienteId ||
        "",

      contratoId:
        regra.contratoId ||
        "",

      /*
       * Nova versão nunca herda datas de vigência.
       * O usuário informa conscientemente quando
       * a nova política comercial passa a valer.
       */
      vigenciaInicio:
        "",

      vigenciaFim:
        "",

      ativa:
        true,

      pedidoMinimo:
        numeroParaInput(
          regra.pedidoMinimo
        ),

      minimoParcela:
        numeroParaInput(
          regra.minimoParcela
        ),

      prazoEntregaDias:
        numeroParaInput(
          regra.prazoEntregaDias
        ),

      prazoFaturamentoDias:
        numeroParaInput(
          regra.prazoFaturamentoDias
        ),

      frete:
        regra.frete ||
        "",

      regiao:
        regra.regiao ||
        "",

      tipoComissao:
        regra.tipoComissao ||
        "",

      percentualComissao:
        numeroParaInput(
          regra.percentualComissao
        ),

      reconhecimentoComissao:
        regra.reconhecimentoComissao ||
        "",

      fechamentoComissao:
        regra.fechamentoComissao ||
        "",

      pagamentoComissao:
        regra.pagamentoComissao ||
        "",

      observacoes:
        regra.observacoes ||
        "",
    })

    setFaixas(
      parseFaixas(
        regra.faixasComissao
      )
    )

    setErro(
      null
    )

    window.scrollTo({
      top:
        0,
      behavior:
        "smooth",
    })
  }

  async function recarregarRegras() {
    if (
      !representadaId
    ) {
      return
    }

    const resposta =
      await fetch(
        `/api/representadas/${representadaId}/regras-comerciais`,
        {
          cache:
            "no-store",
        }
      )

    if (
      !resposta.ok
    ) {
      throw new Error(
        "Erro ao atualizar regras comerciais."
      )
    }

    const dados:
      RegraComercial[] =
      await resposta.json()

    setRegras(
      dados
    )
  }

  function atualizarFaixa(
    index: number,
    campo:
      keyof Faixa,
    valor: string
  ) {
    setFaixas(
      (
        anteriores
      ) =>
        anteriores.map(
          (
            faixa,
            indice
          ) =>
            indice ===
            index
              ? {
                  ...faixa,

                  [campo]:
                    valor,
                }
              : faixa
        )
    )
  }

  function adicionarFaixa() {
    setFaixas(
      (
        anteriores
      ) => [
        ...anteriores,

        {
          desconto: "",
          comissao: "",
        },
      ]
    )
  }

  function removerFaixa(
    index: number
  ) {
    setFaixas(
      (
        anteriores
      ) => {
        if (
          anteriores.length <=
          1
        ) {
          return anteriores
        }

        return anteriores.filter(
          (
            _,
            indice
          ) =>
            indice !==
            index
        )
      }
    )
  }

  async function salvarRegra(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !representadaId
    ) {
      setErro(
        "ID da representada não encontrado."
      )

      return
    }

    if (
      !form.nome.trim()
    ) {
      setErro(
        "Informe o nome da regra comercial."
      )

      return
    }

    if (
      !form.vigenciaInicio
    ) {
      setErro(
        "Informe o início real da vigência da regra comercial."
      )

      return
    }

    if (
      form.vigenciaFim &&
      form.vigenciaFim <
        form.vigenciaInicio
    ) {
      setErro(
        "O fim da vigência não pode ser anterior ao início."
      )

      return
    }

    if (
      form.tipoEscopo !==
        "Padrao" &&
      form.tipoEscopo !==
        "Cliente"
    ) {
      setErro(
        "Tipo de regra comercial inválido."
      )

      return
    }

    if (
      form.tipoEscopo ===
        "Padrao" &&
      form.clienteId
    ) {
      setErro(
        "Regra padrão não deve possuir cliente específico."
      )

      return
    }

    if (
      form.tipoEscopo ===
        "Cliente" &&
      !form.clienteId
    ) {
      setErro(
        "Selecione o cliente para uma regra específica."
      )

      return
    }

    if (
      form.tipoComissao ===
        "fixa"
    ) {
      const percentual =
        percentualFormulario(
          form.percentualComissao
        )

      if (
        percentual === null ||
        percentual <= 0
      ) {
        setErro(
          "Informe comissão fixa maior que 0% e até 100%, com no máximo duas casas decimais."
        )

        return
      }
    }

    if (
      form.tipoComissao ===
        "variada"
    ) {
      const erroFaixas =
        validarFaixasFormulario(
          faixas
        )

      if (
        erroFaixas
      ) {
        setErro(
          erroFaixas
        )

        return
      }
    }

    if (
      form.tipoComissao !==
        "" &&
      form.tipoComissao !==
        "fixa" &&
      form.tipoComissao !==
        "variada"
    ) {
      setErro(
        "Tipo de comissão inválido."
      )

      return
    }

    try {
      setSalvando(
        true
      )

      setErro(
        null
      )

      const payload = {
        nome:
          form.nome.trim(),

        tipoEscopo:
          form.tipoEscopo,

        clienteId:
          form.tipoEscopo ===
          "Padrao"
            ? null
            : form.clienteId ||
              null,

        contratoId:
          form.contratoId ||
          null,

        vigenciaInicio:
          form.vigenciaInicio,

        vigenciaFim:
          form.vigenciaFim ||
          null,

        ativa:
          form.ativa,

        pedidoMinimo:
          form.pedidoMinimo ===
          ""
            ? null
            : form.pedidoMinimo,

        minimoParcela:
          form.minimoParcela ===
          ""
            ? null
            : form.minimoParcela,

        prazoEntregaDias:
          form.prazoEntregaDias ===
          ""
            ? null
            : form.prazoEntregaDias,

        prazoFaturamentoDias:
          form.prazoFaturamentoDias ===
          ""
            ? null
            : form.prazoFaturamentoDias,

        frete:
          form.frete ||
          null,

        regiao:
          form.regiao ||
          null,

        tipoComissao:
          form.tipoComissao,

        percentualComissao:
          form.tipoComissao ===
          "fixa"
            ? form.percentualComissao
            : null,

        faixasComissao:
          form.tipoComissao ===
          "variada"
            ? JSON.stringify(
                faixas
              )
            : null,

        reconhecimentoComissao:
          form.reconhecimentoComissao ||
          null,

        fechamentoComissao:
          form.fechamentoComissao ||
          null,

        pagamentoComissao:
          form.pagamentoComissao ||
          null,

        observacoes:
          form.observacoes ||
          null,
      }

      const url =
        regraEditandoId
          ? `/api/representadas/${representadaId}/regras-comerciais/${regraEditandoId}`
          : `/api/representadas/${representadaId}/regras-comerciais`

      const resposta =
        await fetch(
          url,
          {
            method:
              regraEditandoId
                ? "PUT"
                : "POST",

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

      const dados =
        await resposta.json()

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados.message ||
            "Erro ao salvar regra comercial."
        )
      }

      await recarregarRegras()

      limparFormulario()
    } catch (error) {
      const mensagem =
        error instanceof
        Error
          ? error.message
          : "Erro ao salvar regra comercial."

      setErro(
        mensagem
      )
    } finally {
      setSalvando(
        false
      )
    }
  }

  async function excluirRegra(
    regra:
      RegraComercial
  ) {
    if (
      !representadaId
    ) {
      return
    }

    if (
      regra._count.vendas >
      0
    ) {
      alert(
        "Esta regra já foi utilizada em vendas e não pode ser excluída."
      )

      return
    }

    const confirmado =
      window.confirm(
        `Excluir a regra "${regra.nome}"?`
      )

    if (
      !confirmado
    ) {
      return
    }

    try {
      const resposta =
        await fetch(
          `/api/representadas/${representadaId}/regras-comerciais/${regra.id}`,
          {
            method:
              "DELETE",
          }
        )

      const dados =
        await resposta.json()

      if (
        !resposta.ok
      ) {
        throw new Error(
          dados.message ||
            "Erro ao excluir regra comercial."
        )
      }

      await recarregarRegras()

      if (
        regraEditandoId ===
        regra.id
      ) {
        limparFormulario()
      }
    } catch (error) {
      const mensagem =
        error instanceof
        Error
          ? error.message
          : "Erro ao excluir regra comercial."

      alert(
        mensagem
      )
    }
  }

  if (
    carregando
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />

          Carregando regras comerciais...
        </div>
      </div>
    )
  }

  if (
    !representadaId
  ) {
    return (
      <div className="p-6">
        ID da representada não encontrado.
      </div>
    )
  }

  const regraPadrao =
    form.tipoEscopo ===
    "Padrao"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/representadas/${representadaId}`
                )
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />

              Voltar
            </Button>

            <div>
              <h1 className="text-2xl font-bold">
                Regras Comerciais
              </h1>

              <p className="text-sm text-muted-foreground">
                {representada?.nome ||
                  "Representada"}

                {representada?.codigo
                  ? ` • ${representada.codigo}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!regraEditandoId &&
              representada && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                  reaproveitarCadastroPrincipal
                }
                disabled={
                  salvando
                }
              >
                Reaproveitar cadastro principal
              </Button>
            )}

            <div className="text-sm text-muted-foreground">
              {regras.length}{" "}
              regra
              {regras.length ===
              1
                ? ""
                : "s"}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>
                {regraEditandoId
                  ? "Editar regra comercial"
                  : novaVersaoOrigem
                    ? "Nova versão da regra comercial"
                    : "Nova regra comercial"}
              </CardTitle>

              {(regraEditandoId ||
                novaVersaoOrigem) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    limparFormulario
                  }
                  disabled={
                    salvando
                  }
                >
                  <X className="mr-1 h-4 w-4" />

                  {regraEditandoId
                    ? "Cancelar edição"
                    : "Cancelar nova versão"}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={
                salvarRegra
              }
              className="space-y-5"
            >
              {dadosReaproveitados &&
                !regraEditandoId && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-900">
                    Dados reaproveitados automaticamente
                  </p>

                  <p className="mt-1 text-sm text-emerald-800">
                    Pedido mínimo, parcela mínima, comissão, frete, região e prazos foram carregados do cadastro principal da Representada.
                  </p>

                  <p className="mt-1 text-sm font-medium text-emerald-900">
                    Confira os dados e informe principalmente a data real de início da vigência antes de salvar.
                  </p>
                </div>
              )}

              {novaVersaoOrigem && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900">
                    Nova versão baseada em “{novaVersaoOrigem}”
                  </p>

                  <p className="mt-1 text-sm text-blue-800">
                    Os dados comerciais foram copiados, mas nenhuma regra histórica será alterada. Informe obrigatoriamente a data real em que esta nova versão começa a valer e revise todos os campos antes de salvar.
                  </p>
                </div>
              )}

              {erro && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="nome">
                    Nome da regra *
                  </Label>

                  <Input
                    id="nome"
                    value={
                      form.nome
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "nome",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                    placeholder={
                      regraPadrao
                        ? "Ex.: Regra padrão da Representada"
                        : "Ex.: Regra especial Cliente X"
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ativa">
                    Status
                  </Label>

                  <select
                    id="ativa"
                    value={
                      form.ativa
                        ? "ativa"
                        : "inativa"
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "ativa",
                        event.target.value ===
                          "ativa"
                      )
                    }
                    disabled={
                      salvando
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="ativa">
                      Ativa
                    </option>

                    <option value="inativa">
                      Inativa
                    </option>
                  </select>
                </div>
              </div>

              <div
                className={`rounded-lg border p-4 ${
                  regraPadrao
                    ? "border-blue-200 bg-blue-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <p
                  className={`font-semibold ${
                    regraPadrao
                      ? "text-blue-900"
                      : "text-amber-900"
                  }`}
                >
                  {regraPadrao
                    ? "Regra padrão da Representada"
                    : "Regra específica para um Cliente"}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    regraPadrao
                      ? "text-blue-800"
                      : "text-amber-800"
                  }`}
                >
                  {regraPadrao
                    ? "Será utilizada como condição geral para clientes sem regra específica."
                    : "Será utilizada somente para o cliente selecionado e prevalecerá sobre a regra padrão."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="tipoEscopo">
                    Tipo da regra *
                  </Label>

                  <select
                    id="tipoEscopo"
                    value={
                      form.tipoEscopo
                    }
                    onChange={(
                      event
                    ) => {
                      const valor =
                        event.target.value

                      setForm(
                        (
                          anterior
                        ) => ({
                          ...anterior,

                          tipoEscopo:
                            valor,

                          clienteId:
                            valor ===
                            "Padrao"
                              ? ""
                              : anterior.clienteId,
                        })
                      )

                      if (
                        erro
                      ) {
                        setErro(
                          null
                        )
                      }
                    }}
                    disabled={
                      salvando
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Padrao">
                      Padrão — todos os clientes
                    </option>

                    <option value="Cliente">
                      Cliente específico
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clienteId">
                    {regraPadrao
                      ? "Cliente — não se aplica"
                      : "Cliente específico *"}
                  </Label>

                  <select
                    id="clienteId"
                    value={
                      form.clienteId
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "clienteId",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando ||
                      regraPadrao
                    }
                    className={`h-10 w-full rounded-md border border-input px-3 text-sm ${
                      regraPadrao
                        ? "cursor-not-allowed bg-gray-100 text-gray-500"
                        : "bg-background"
                    }`}
                  >
                    <option value="">
                      {regraPadrao
                        ? "Todos os clientes"
                        : "Selecione o cliente"}
                    </option>

                    {!regraPadrao &&
                      clientes.map(
                        (
                          cliente
                        ) => (
                          <option
                            key={
                              cliente.id
                            }
                            value={
                              cliente.id
                            }
                          >
                            {cliente.nomeFantasia ||
                              cliente.razaoSocial}
                          </option>
                        )
                      )}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="contratoId">
                    Contrato
                  </Label>

                  <select
                    id="contratoId"
                    value={
                      form.contratoId
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "contratoId",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Sem contrato
                    </option>

                    {contratos.map(
                      (
                        contrato
                      ) => (
                        <option
                          key={
                            contrato.id
                          }
                          value={
                            contrato.id
                          }
                        >
                          {
                            contrato.tipoFormalizacao
                          }

                          {contrato.descricao
                            ? ` - ${contrato.descricao}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="vigenciaInicio">
                    Início da vigência *
                  </Label>

                  <Input
                    id="vigenciaInicio"
                    type="date"
                    value={
                      form.vigenciaInicio
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "vigenciaInicio",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />

                  {dadosReaproveitados &&
                    !form.vigenciaInicio && (
                    <p className="text-xs font-medium text-amber-700">
                      Informe a data real. O sistema não presume a vigência histórica.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vigenciaFim">
                    Fim da vigência
                  </Label>

                  <Input
                    id="vigenciaFim"
                    type="date"
                    value={
                      form.vigenciaFim
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "vigenciaFim",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Deixe vazio enquanto a regra não possuir data final definida.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="pedidoMinimo">
                    Pedido mínimo
                  </Label>

                  <Input
                    id="pedidoMinimo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.pedidoMinimo
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "pedidoMinimo",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="minimoParcela">
                    Mínimo parcela
                  </Label>

                  <Input
                    id="minimoParcela"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.minimoParcela
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "minimoParcela",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prazoEntregaDias">
                    Prazo entrega
                  </Label>

                  <Input
                    id="prazoEntregaDias"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.prazoEntregaDias
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "prazoEntregaDias",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prazoFaturamentoDias">
                    Prazo faturamento
                  </Label>

                  <Input
                    id="prazoFaturamentoDias"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.prazoFaturamentoDias
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "prazoFaturamentoDias",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="frete">
                    Frete
                  </Label>

                  <Input
                    id="frete"
                    value={
                      form.frete
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "frete",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="regiao">
                    Região
                  </Label>

                  <Input
                    id="regiao"
                    value={
                      form.regiao
                    }
                    onChange={(
                      event
                    ) =>
                      atualizarCampo(
                        "regiao",
                        event.target.value
                      )
                    }
                    disabled={
                      salvando
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="tipoComissao">
                      Tipo de comissão
                    </Label>

                    <select
                      id="tipoComissao"
                      value={
                        form.tipoComissao
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampo(
                          "tipoComissao",
                          event.target.value
                        )
                      }
                      disabled={
                        salvando
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">
                        Usar política principal da Representada
                      </option>

                      <option value="fixa">
                        Fixa
                      </option>

                      <option value="variada">
                        Variada
                      </option>
                    </select>

                    {form.tipoComissao ===
                      "" && (
                      <p className="text-xs text-muted-foreground">
                        Esta regra não substituirá a comissão principal cadastrada na Representada.
                      </p>
                    )}
                  </div>

                  {form.tipoComissao ===
                    "fixa" && (
                    <div className="space-y-1">
                      <Label htmlFor="percentualComissao">
                        Comissão (%)
                      </Label>

                      <Input
                        id="percentualComissao"
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={
                          form.percentualComissao
                        }
                        onChange={(
                          event
                        ) =>
                          atualizarCampo(
                            "percentualComissao",
                            event.target.value
                          )
                        }
                        disabled={
                          salvando
                        }
                      />
                    </div>
                  )}
                </div>

                {form.tipoComissao ===
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
                          className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
                        >
                          <div className="space-y-1">
                            <Label>
                              Desconto (%)
                            </Label>

                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={
                                faixa.desconto
                              }
                              onChange={(
                                event
                              ) =>
                                atualizarFaixa(
                                  index,
                                  "desconto",
                                  event.target.value
                                )
                              }
                              disabled={
                                salvando
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>
                              Comissão (%)
                            </Label>

                            <Input
                              type="number"
                              min="0.01"
                              max="100"
                              step="0.01"
                              value={
                                faixa.comissao
                              }
                              onChange={(
                                event
                              ) =>
                                atualizarFaixa(
                                  index,
                                  "comissao",
                                  event.target.value
                                )
                              }
                              disabled={
                                salvando
                              }
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              removerFaixa(
                                index
                              )
                            }
                            disabled={
                              salvando ||
                              faixas.length <=
                                1
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={
                        adicionarFaixa
                      }
                      disabled={
                        salvando
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />

                      Adicionar faixa
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div>
                  <p className="font-semibold text-blue-900">
                    Política desta regra comercial
                  </p>

                  <p className="mt-1 text-sm text-blue-800">
                    Estes campos pertencem à versão da regra que será salva. Use-os quando esta regra possuir política própria de reconhecimento, fechamento ou pagamento.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="reconhecimentoComissao">
                      Reconhecimento da comissão
                    </Label>

                    <Input
                      id="reconhecimentoComissao"
                      value={
                        form.reconhecimentoComissao
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampo(
                          "reconhecimentoComissao",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Faturamento ou Liquidez"
                      disabled={
                        salvando
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="fechamentoComissao">
                      Regra de fechamento
                    </Label>

                    <Input
                      id="fechamentoComissao"
                      value={
                        form.fechamentoComissao
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampo(
                          "fechamentoComissao",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: apuração de 01 a 30"
                      disabled={
                        salvando
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pagamentoComissao">
                      Regra de pagamento
                    </Label>

                    <Input
                      id="pagamentoComissao"
                      value={
                        form.pagamentoComissao
                      }
                      onChange={(
                        event
                      ) =>
                        atualizarCampo(
                          "pagamentoComissao",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: pagamento dia 10 do mês seguinte"
                      disabled={
                        salvando
                      }
                    />
                  </div>
                </div>

                <p className="text-xs text-blue-800">
                  Quando estes campos estiverem vazios, a regra não cria uma informação própria para esse item. A comissão fixa/variada acima também pode ser deixada como “Usar política principal da Representada”.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <p className="font-semibold text-slate-900">
                    Referência do cadastro principal da Representada
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Use esta referência para conferir a política principal. Os campos acima mostram o que será efetivamente salvo nesta versão da regra.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">
                      Reconhecimento da comissão
                    </p>

                    <p className="font-medium text-slate-900">
                      {representada?.regraReconhecimentoComissao ||
                        "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Regra de fechamento
                    </p>

                    <p className="font-medium text-slate-900">
                      {representada?.fechamentoComissao ||
                        "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Regra de pagamento
                    </p>

                    <p className="font-medium text-slate-900">
                      {representada?.pagamentoComissao ||
                        "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="observacoes">
                  Observações
                </Label>

                <Textarea
                  id="observacoes"
                  value={
                    form.observacoes
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarCampo(
                      "observacoes",
                      event.target.value
                    )
                  }
                  disabled={
                    salvando
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
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
                      {regraEditandoId ? (
                        <Save className="mr-2 h-4 w-4" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}

                      {regraEditandoId
                        ? "Salvar alterações"
                        : "Adicionar regra"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de regras comerciais
            </CardTitle>
          </CardHeader>

          <CardContent>
            {regras.length ===
            0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma regra comercial versionada cadastrada.
              </div>
            ) : (
              <div className="space-y-3">
                {regras.map(
                  (
                    regra
                  ) => (
                    <div
                      key={
                        regra.id
                      }
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                              {
                                regra.nome
                              }
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                regra.ativa
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {regra.ativa
                                ? "Ativa"
                                : "Inativa"}
                            </span>

                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                              {regra.tipoEscopo ===
                              "Padrao"
                                ? "Padrão — todos os clientes"
                                : "Cliente específico"}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {
                                regra._count.vendas
                              }{" "}
                              venda
                              {regra._count.vendas ===
                              1
                                ? ""
                                : "s"}
                            </span>

                            {regra._count.vendas >
                              0 && (
                              <span className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">
                                Histórica — congelada
                              </span>
                            )}
                          </div>

                          <div className="grid gap-1 text-sm md:grid-cols-2 md:gap-x-8">
                            <p>
                              Vigência:{" "}
                              {formatarData(
                                regra.vigenciaInicio
                              )}{" "}
                              até{" "}
                              {formatarData(
                                regra.vigenciaFim
                              )}
                            </p>

                            <p>
                              Aplicação:{" "}
                              {regra.tipoEscopo ===
                              "Padrao"
                                ? "Todos os clientes sem regra específica"
                                : regra.cliente
                                      ?.nomeFantasia ||
                                  regra.cliente
                                    ?.razaoSocial ||
                                  "Cliente não identificado"}
                            </p>

                            <p>
                              Pedido mínimo:{" "}
                              {formatarValor(
                                regra.pedidoMinimo
                              )}
                            </p>

                            <p>
                              Mínimo parcela:{" "}
                              {formatarValor(
                                regra.minimoParcela
                              )}
                            </p>

                            <p>
                              Prazo entrega:{" "}
                              {regra.prazoEntregaDias !==
                              null
                                ? `${regra.prazoEntregaDias} dia(s)`
                                : "-"}
                            </p>

                            <p>
                              Prazo faturamento:{" "}
                              {regra.prazoFaturamentoDias !==
                              null
                                ? `${regra.prazoFaturamentoDias} dia(s)`
                                : "-"}
                            </p>

                            <p>
                              Frete:{" "}
                              {regra.frete ||
                                "-"}
                            </p>

                            <p>
                              Região:{" "}
                              {regra.regiao ||
                                "-"}
                            </p>

                            <p>
                              Comissão:{" "}
                              {regra.tipoComissao ===
                              "fixa"
                                ? `${
                                    regra.percentualComissao ??
                                    0
                                  }%`
                                : regra.tipoComissao ===
                                    "variada"
                                  ? "Variada"
                                  : "Política principal da Representada"}
                            </p>

                            <p>
                              Reconhecimento:{" "}
                              {regra.reconhecimentoComissao ||
                                "Sem regra própria"}
                            </p>

                            <p>
                              Contrato:{" "}
                              {regra.contrato
                                ?.tipoFormalizacao ||
                                "-"}
                            </p>
                          </div>

                          {regra.tipoComissao ===
                            "variada" &&
                            regra.faixasComissao && (
                            <div className="mt-2 rounded-md border bg-blue-50 p-3 text-sm text-blue-900">
                              <span className="font-medium">
                                Faixas de comissão:{" "}
                              </span>

                              {parseFaixas(
                                regra.faixasComissao
                              )
                                .map(
                                  (
                                    faixa
                                  ) =>
                                    `${faixa.desconto}% desconto → ${faixa.comissao}% comissão`
                                )
                                .join(
                                  " • "
                                )}
                            </div>
                          )}

                          {regra.observacoes && (
                            <div className="mt-2 rounded-md bg-muted/40 p-3 text-sm">
                              <span className="font-medium">
                                Observações:{" "}
                              </span>

                              {
                                regra.observacoes
                              }
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {regra._count.vendas >
                          0 ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                novaVersaoRegra(
                                  regra
                                )
                              }
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Nova versão
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                editarRegra(
                                  regra
                                )
                              }
                            >
                              Editar
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={
                              regra._count.vendas >
                              0
                            }
                            title={
                              regra._count.vendas >
                              0
                                ? "Regra utilizada em Venda: exclusão bloqueada para preservar o histórico."
                                : "Excluir regra comercial"
                            }
                            onClick={() =>
                              excluirRegra(
                                regra
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}