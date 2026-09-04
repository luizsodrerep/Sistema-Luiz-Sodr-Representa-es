"use client"

import Image from "next/image"

import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react"

type ModuloAssistente =
  | "interacoes"
  | "orcamentos"
  | "vendas"
  | "titulos"
  | "faturamentos"
  | "comissoes"
  | "redes-sociais"

type SituacaoTemporal =
  | "atrasado"
  | "hoje"
  | "proximos"
  | "futuro"
  | "sem-data"

type PrioridadeAssistente =
  | "critica"
  | "alta"
  | "normal"
  | "informativa"

type AlertaCritico = {
  id: string
  modulo: ModuloAssistente
  entidadeId: string
  codigo: string | null
  titulo: string
  descricao: string
  relacionadoA: string | null
  responsavel: string | null
  dataReferencia: string | null
  situacaoTemporal: SituacaoTemporal
  prioridade: PrioridadeAssistente
  status: string | null
  href: string
  origem: string | null
}

type RespostaAssistente = {
  alertasCriticos?: AlertaCritico[]
}

type AlertaCriticoGlobalProps = {
  nomeUsuario: string
}

const TEMPO_SILENCIADO_MS =
  30 * 60 * 1000

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return null
  }

  const data =
    new Date(valor)

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null
  }

  return data.toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    }
  )
}

function alertaEstaSilenciado(
  alertaId: string
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return false
  }

  const chave =
    `alerta-critico-silenciado:${alertaId}`

  const valor =
    window.sessionStorage.getItem(
      chave
    )

  if (!valor) {
    return false
  }

  const silenciadoEm =
    Number(valor)

  if (
    !Number.isFinite(
      silenciadoEm
    )
  ) {
    window.sessionStorage.removeItem(
      chave
    )

    return false
  }

  const aindaSilenciado =
    Date.now() -
      silenciadoEm <
    TEMPO_SILENCIADO_MS

  if (
    !aindaSilenciado
  ) {
    window.sessionStorage.removeItem(
      chave
    )
  }

  return aindaSilenciado
}

export function AlertaCriticoGlobal({
  nomeUsuario,
}: AlertaCriticoGlobalProps) {
  const router =
    useRouter()

  const pathname =
    usePathname()

  const [
    alertas,
    setAlertas,
  ] =
    useState<AlertaCritico[]>(
      []
    )

  const [
    carregando,
    setCarregando,
  ] =
    useState(false)

  const carregarAlertas =
    useCallback(
      async () => {
        try {
          setCarregando(
            true
          )

          const response =
            await fetch(
              "/api/meu-assistente-pessoal",
              {
                method: "GET",
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            setAlertas(
              []
            )

            return
          }

          const dados:
            RespostaAssistente =
            await response.json()

          const recebidos =
            Array.isArray(
              dados.alertasCriticos
            )
              ? dados.alertasCriticos
              : []

          setAlertas(
            recebidos.filter(
              (
                alerta
              ) =>
                !alertaEstaSilenciado(
                  alerta.id
                )
            )
          )
        } catch (error) {
          console.error(
            "Erro ao carregar alertas críticos:",
            error
          )

          setAlertas(
            []
          )
        } finally {
          setCarregando(
            false
          )
        }
      },
      []
    )

  useEffect(() => {
    carregarAlertas()
  }, [
    carregarAlertas,
    pathname,
  ])

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          carregarAlertas()
        },
        5 * 60 * 1000
      )

    return () => {
      window.clearInterval(
        intervalo
      )
    }
  }, [
    carregarAlertas,
  ])

  function silenciarAlerta(
    alerta: AlertaCritico
  ) {
    const chave =
      `alerta-critico-silenciado:${alerta.id}`

    window.sessionStorage.setItem(
      chave,
      String(
        Date.now()
      )
    )

    setAlertas(
      (
        atuais
      ) =>
        atuais.filter(
          (
            item
          ) =>
            item.id !==
            alerta.id
        )
    )
  }

  if (
    carregando &&
    alertas.length ===
      0
  ) {
    return null
  }

  const alerta =
    alertas[0]

  if (!alerta) {
    return null
  }

  const quantidade =
    alertas.length

  const dataFormatada =
    formatarData(
      alerta.dataReferencia
    )

  return (
    <div
      className="
        fixed
        bottom-4
        left-4
        right-4
        z-[70]
        sm:left-auto
        sm:right-5
        sm:w-[430px]
        lg:right-6
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-red-200
          bg-white
          shadow-2xl
          ring-1
          ring-black/5
        "
      >
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-1
            bg-red-500
          "
        />

        <button
          type="button"
          onClick={() =>
            silenciarAlerta(
              alerta
            )
          }
          aria-label="Lembrar novamente em 30 minutos"
          title="Lembrar novamente em 30 minutos"
          className="
            absolute
            right-3
            top-3
            z-10
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-end gap-3 px-4 pt-4">

          <div
            className="
              relative
              h-[118px]
              w-[92px]
              shrink-0
              overflow-hidden
            "
          >
            <Image
              src="/assistente-alerta-paula.jpeg"
              alt="Assistente do CRM"
              fill
              priority
              sizes="92px"
              className="
                object-cover
                object-top
              "
            />
          </div>

          <div className="min-w-0 flex-1 pb-4 pr-7">

            <div
              className="
                mb-1
                flex
                items-center
                gap-2
                text-xs
                font-bold
                uppercase
                tracking-[0.12em]
                text-red-600
              "
            >
              <AlertTriangle className="h-4 w-4" />

              Atenção importante
            </div>

            <p
              className="
                text-base
                font-bold
                leading-tight
                text-slate-950
              "
            >
              {nomeUsuario},
              existe uma demanda que
              precisa de ação.
            </p>

            <p
              className="
                mt-2
                text-sm
                font-semibold
                leading-snug
                text-slate-900
              "
            >
              {
                alerta.titulo
              }
            </p>

            {alerta.relacionadoA && (
              <p
                className="
                  mt-1
                  line-clamp-1
                  text-sm
                  text-slate-600
                "
              >
                {
                  alerta.relacionadoA
                }
              </p>
            )}

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-3
                gap-y-1
                text-xs
                text-slate-500
              "
            >
              {alerta.responsavel && (
                <span>
                  Responsável:{" "}
                  <strong
                    className="
                      font-semibold
                      text-slate-700
                    "
                  >
                    {
                      alerta.responsavel
                    }
                  </strong>
                </span>
              )}

              {dataFormatada && (
                <span
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >
                  <Clock3 className="h-3.5 w-3.5" />

                  {
                    dataFormatada
                  }
                </span>
              )}
            </div>

          </div>

        </div>

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-slate-100
            bg-slate-50/80
            px-4
            py-3
          "
        >
          <div
            className="
              min-w-0
              text-xs
              text-slate-500
            "
          >
            {quantidade > 1
              ? `${quantidade} alertas críticos ativos`
              : "1 alerta crítico ativo"}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                alerta.href
              )
            }
            className="
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-lg
              bg-[#071a2f]
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-900
            "
          >
            Ver agora

            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

      </div>
    </div>
  )
}