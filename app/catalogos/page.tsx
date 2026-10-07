"use client"

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  Archive,
  ArrowLeft,
  Building2,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Home,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  Upload,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

type PerfilUsuario =
  | "Diretor"
  | "Administrativo"
  | "Preposto"

type PastaRepresentada = {
  id: string
  codigo: string | null
  nome: string
  status: string

  catalogos: {
    ativos: number
    arquivados: number
    outros: number
    total: number
    ultimoCatalogoEm:
      string | null
  }
}

type Catalogo = {
  id: string
  nome: string
  descricao: string | null

  nomeArquivoOriginal:
    string

  tipoMime: string
  extensao: string | null
  tamanhoBytes: number

  versao: string | null

  dataReferencia:
    string | null

  origem: string | null
  status: string

  arquivadoEm:
    string | null

  observacoes:
    string | null

  criadoEm: string
  atualizadoEm: string

  representada: {
    id: string
    codigo: string | null
    nome: string
    status: string
  }

  criadoPor: {
    id: string
    nome: string
  } | null
}

type Paginacao = {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
}

type NavigatorCompartilhamento =
  Navigator & {
    share?: (
      dados: {
        title?: string
        text?: string
        files?: File[]
      }
    ) => Promise<void>

    canShare?: (
      dados: {
        files?: File[]
      }
    ) => boolean
  }

const TAMANHO_MAXIMO_CATALOGO_MB =
  300

const TAMANHO_MAXIMO_CATALOGO_BYTES =
  TAMANHO_MAXIMO_CATALOGO_MB *
  1024 *
  1024

const MENSAGEM_ARQUIVO_MUITO_GRANDE =
  `Arquivo superior a ${TAMANHO_MAXIMO_CATALOGO_MB} MB. Compacte o arquivo e tente novamente ou solicite uma versão otimizada do catálogo à Representada.`

function formatarData(
  valor:
    | string
    | null
    | undefined
) {
  if (!valor) {
    return "—"
  }

  const data =
    new Date(
      valor
    )

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    data
  )
}

function formatarDataHora(
  valor:
    | string
    | null
    | undefined
) {
  if (!valor) {
    return "—"
  }

  const data =
    new Date(
      valor
    )

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    data
  )
}

function formatarTamanho(
  bytes: number
) {
  if (
    !Number.isFinite(
      bytes
    ) ||
    bytes <= 0
  ) {
    return "0 KB"
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.max(
      1,
      Math.round(
        bytes / 1024
      )
    )} KB`
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`
}

function normalizarBusca(
  valor: string
) {
  return valor
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
}

function mensagemResposta(
  valor: unknown,
  padrao: string
) {
  if (
    valor &&
    typeof valor ===
      "object" &&
    "message" in valor &&
    typeof (
      valor as {
        message?: unknown
      }
    ).message ===
      "string"
  ) {
    return (
      valor as {
        message: string
      }
    ).message
  }

  return padrao
}

export default function CatalogosPage() {
  const router =
    useRouter()

  const arquivoRef =
    useRef<HTMLInputElement | null>(
      null
    )

  const [
    carregandoInicial,
    setCarregandoInicial,
  ] =
    useState(
      true
    )

  const [
    carregandoCatalogos,
    setCarregandoCatalogos,
  ] =
    useState(
      false
    )

  const [
    enviandoArquivo,
    setEnviandoArquivo,
  ] =
    useState(
      false
    )

  const [
    alterandoCatalogoId,
    setAlterandoCatalogoId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    compartilhandoId,
    setCompartilhandoId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    perfil,
    setPerfil,
  ] =
    useState<
      PerfilUsuario | null
    >(
      null
    )

  const [
    pastas,
    setPastas,
  ] =
    useState<
      PastaRepresentada[]
    >(
      []
    )

  const [
    representadaSelecionadaId,
    setRepresentadaSelecionadaId,
  ] =
    useState<
      string | null
    >(
      null
    )

  const [
    buscaPastas,
    setBuscaPastas,
  ] =
    useState(
      ""
    )

  const [
    catalogos,
    setCatalogos,
  ] =
    useState<
      Catalogo[]
    >(
      []
    )

  const [
    buscaCatalogos,
    setBuscaCatalogos,
  ] =
    useState(
      ""
    )

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<
      "Ativo" |
      "Arquivado" |
      "todos"
    >(
      "Ativo"
    )

  const [
    pagina,
    setPagina,
  ] =
    useState(
      1
    )

  const [
    paginacao,
    setPaginacao,
  ] =
    useState<Paginacao>(
      {
        pagina: 1,
        limite: 20,
        total: 0,
        totalPaginas: 1,
      }
    )

  const [
    mostrarUpload,
    setMostrarUpload,
  ] =
    useState(
      false
    )

  const [
    arquivo,
    setArquivo,
  ] =
    useState<
      File | null
    >(
      null
    )

  const [
    nome,
    setNome,
  ] =
    useState(
      ""
    )

  const [
    descricao,
    setDescricao,
  ] =
    useState(
      ""
    )

  const [
    versao,
    setVersao,
  ] =
    useState(
      ""
    )

  const [
    dataReferencia,
    setDataReferencia,
  ] =
    useState(
      ""
    )

  const podeAlterar =
    perfil ===
      "Diretor" ||
    perfil ===
      "Administrativo"

  const representadaSelecionada =
    useMemo(
      () =>
        pastas.find(
          (
            item
          ) =>
            item.id ===
            representadaSelecionadaId
        ) ??
        null,
      [
        pastas,
        representadaSelecionadaId,
      ]
    )

  const pastasFiltradas =
    useMemo(
      () => {
        const busca =
          normalizarBusca(
            buscaPastas
          )

        if (!busca) {
          return pastas
        }

        const termos =
          busca
            .split(
              /\s+/
            )
            .filter(
              Boolean
            )

        return pastas.filter(
          (
            item
          ) => {
            const texto =
              normalizarBusca(
                [
                  item.codigo,
                  item.nome,
                  item.status,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " "
                  )
              )

            return termos.every(
              (
                termo
              ) =>
                texto.includes(
                  termo
                )
            )
          }
        )
      },
      [
        buscaPastas,
        pastas,
      ]
    )

  const totais =
    useMemo(
      () =>
        pastas.reduce(
          (
            acumulado,
            item
          ) => {
            acumulado.representadas +=
              1

            acumulado.ativos +=
              item.catalogos.ativos

            acumulado.arquivados +=
              item.catalogos.arquivados

            acumulado.total +=
              item.catalogos.total

            return acumulado
          },
          {
            representadas: 0,
            ativos: 0,
            arquivados: 0,
            total: 0,
          }
        ),
      [
        pastas,
      ]
    )

  const carregarSessao =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/auth/me",
              {
                cache:
                  "no-store",
              }
            )

          if (
            !response.ok
          ) {
            return
          }

          const data =
            await response.json()

          const perfilRecebido =
            data?.usuario
              ?.perfil

          if (
            perfilRecebido ===
              "Diretor" ||
            perfilRecebido ===
              "Administrativo" ||
            perfilRecebido ===
              "Preposto"
          ) {
            setPerfil(
              perfilRecebido
            )
          }
        } catch (
          error
        ) {
          console.error(
            "Erro ao consultar perfil:",
            error
          )
        }
      },
      []
    )

  const carregarPastas =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/catalogos/representadas",
              {
                cache:
                  "no-store",
              }
            )

          const data =
            await response.json()

          if (
            !response.ok
          ) {
            throw new Error(
              mensagemResposta(
                data,
                "Erro ao carregar Representadas."
              )
            )
          }

          setPastas(
            Array.isArray(
              data?.dados
            )
              ? data.dados
              : []
          )
        } catch (
          error
        ) {
          console.error(
            error
          )

          setPastas(
            []
          )

          alert(
            error instanceof Error
              ? error.message
              : "Erro ao carregar Representadas."
          )
        }
      },
      []
    )

  const carregarCatalogos =
    useCallback(
      async (
        representadaId: string,
        paginaAtual: number,
        statusAtual:
          | "Ativo"
          | "Arquivado"
          | "todos",
        buscaAtual: string
      ) => {
        setCarregandoCatalogos(
          true
        )

        try {
          const parametros =
            new URLSearchParams()

          parametros.set(
            "representadaId",
            representadaId
          )

          parametros.set(
            "pagina",
            String(
              paginaAtual
            )
          )

          parametros.set(
            "limite",
            "20"
          )

          parametros.set(
            "status",
            statusAtual
          )

          if (
            buscaAtual.trim()
          ) {
            parametros.set(
              "busca",
              buscaAtual.trim()
            )
          }

          const response =
            await fetch(
              `/api/catalogos?${parametros.toString()}`,
              {
                cache:
                  "no-store",
              }
            )

          const data =
            await response.json()

          if (
            !response.ok
          ) {
            throw new Error(
              mensagemResposta(
                data,
                "Erro ao carregar catálogos."
              )
            )
          }

          setCatalogos(
            Array.isArray(
              data?.dados
            )
              ? data.dados
              : []
          )

          setPaginacao(
            data?.paginacao &&
            typeof data.paginacao ===
              "object"
              ? data.paginacao
              : {
                  pagina:
                    paginaAtual,
                  limite:
                    20,
                  total:
                    0,
                  totalPaginas:
                    1,
                }
          )
        } catch (
          error
        ) {
          console.error(
            error
          )

          setCatalogos(
            []
          )

          alert(
            error instanceof Error
              ? error.message
              : "Erro ao carregar catálogos."
          )
        } finally {
          setCarregandoCatalogos(
            false
          )
        }
      },
      []
    )

  useEffect(
    () => {
      async function iniciar() {
        try {
          await Promise.all([
            carregarSessao(),
            carregarPastas(),
          ])
        } finally {
          setCarregandoInicial(
            false
          )
        }
      }

      void iniciar()
    },
    [
      carregarPastas,
      carregarSessao,
    ]
  )

  useEffect(
    () => {
      if (
        !representadaSelecionadaId
      ) {
        setCatalogos(
          []
        )

        return
      }

      const temporizador =
        window.setTimeout(
          () => {
            void carregarCatalogos(
              representadaSelecionadaId,
              pagina,
              filtroStatus,
              buscaCatalogos
            )
          },
          250
        )

      return () => {
        window.clearTimeout(
          temporizador
        )
      }
    },
    [
      buscaCatalogos,
      carregarCatalogos,
      filtroStatus,
      pagina,
      representadaSelecionadaId,
    ]
  )

  function abrirPasta(
    id: string
  ) {
    setRepresentadaSelecionadaId(
      id
    )

    setBuscaCatalogos(
      ""
    )

    setFiltroStatus(
      "Ativo"
    )

    setPagina(
      1
    )

    setMostrarUpload(
      false
    )

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    })
  }

  function voltarPastas() {
    setRepresentadaSelecionadaId(
      null
    )

    setCatalogos(
      []
    )

    setMostrarUpload(
      false
    )

    setBuscaCatalogos(
      ""
    )

    setPagina(
      1
    )
  }

  function limparFormularioUpload() {
    setArquivo(
      null
    )

    setNome(
      ""
    )

    setDescricao(
      ""
    )

    setVersao(
      ""
    )

    setDataReferencia(
      ""
    )

    if (
      arquivoRef.current
    ) {
      arquivoRef.current.value =
        ""
    }
  }

  function selecionarArquivo(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const selecionado =
      event.target
        .files?.[0] ??
      null

    if (
      selecionado &&
      selecionado.size >
        TAMANHO_MAXIMO_CATALOGO_BYTES
    ) {
      alert(
        MENSAGEM_ARQUIVO_MUITO_GRANDE
      )

      event.target.value =
        ""

      setArquivo(
        null
      )

      return
    }

    setArquivo(
      selecionado
    )
  }

  async function enviarCatalogo(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !representadaSelecionada
    ) {
      alert(
        "Selecione uma Representada."
      )

      return
    }

    if (
      !arquivo
    ) {
      alert(
        "Selecione o arquivo do catálogo."
      )

      return
    }

    setEnviandoArquivo(
      true
    )

    try {
      const formData =
        new FormData()

      formData.append(
        "representadaId",
        representadaSelecionada.id
      )

      formData.append(
        "arquivo",
        arquivo
      )

      if (
        nome.trim()
      ) {
        formData.append(
          "nome",
          nome.trim()
        )
      }

      if (
        descricao.trim()
      ) {
        formData.append(
          "descricao",
          descricao.trim()
        )
      }

      if (
        versao.trim()
      ) {
        formData.append(
          "versao",
          versao.trim()
        )
      }

      if (
        dataReferencia
      ) {
        formData.append(
          "dataReferencia",
          dataReferencia
        )
      }

      formData.append(
        "origem",
        "Upload manual"
      )

      const response =
        await fetch(
          "/api/catalogos",
          {
            method:
              "POST",

            body:
              formData,
          }
        )

      const data =
        await response.json()

      if (
        !response.ok
      ) {
        throw new Error(
          mensagemResposta(
            data,
            "Erro ao cadastrar catálogo."
          )
        )
      }

      limparFormularioUpload()

      setMostrarUpload(
        false
      )

      setFiltroStatus(
        "Ativo"
      )

      setPagina(
        1
      )

      await Promise.all([
        carregarPastas(),

        carregarCatalogos(
          representadaSelecionada.id,
          1,
          "Ativo",
          buscaCatalogos
        ),
      ])

      alert(
        "Catálogo cadastrado com sucesso."
      )
    } catch (
      error
    ) {
      console.error(
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar catálogo."
      )
    } finally {
      setEnviandoArquivo(
        false
      )
    }
  }

  function abrirCatalogo(
    catalogo: Catalogo
  ) {
    window.open(
      `/api/catalogos/${catalogo.id}/arquivo`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  function baixarCatalogo(
    catalogo: Catalogo
  ) {
    const link =
      document.createElement(
        "a"
      )

    link.href =
      `/api/catalogos/${catalogo.id}/arquivo?download=1`

    link.download =
      catalogo.nomeArquivoOriginal

    document.body.appendChild(
      link
    )

    link.click()

    link.remove()
  }

  async function compartilharCatalogo(
    catalogo: Catalogo
  ) {
    setCompartilhandoId(
      catalogo.id
    )

    try {
      const response =
        await fetch(
          `/api/catalogos/${catalogo.id}/arquivo`,
          {
            cache:
              "no-store",
          }
        )

      if (
        !response.ok
      ) {
        let data:
          unknown =
          null

        try {
          data =
            await response.json()
        } catch {
          data =
            null
        }

        throw new Error(
          mensagemResposta(
            data,
            "Não foi possível preparar o catálogo para compartilhamento."
          )
        )
      }

      const blob =
        await response.blob()

      const arquivoCompartilhar =
        new File(
          [
            blob,
          ],
          catalogo.nomeArquivoOriginal,
          {
            type:
              catalogo.tipoMime ||
              blob.type ||
              "application/octet-stream",
          }
        )

      const navegador =
        navigator as NavigatorCompartilhamento

      const suportaCompartilhar =
        typeof navegador.share ===
          "function"

      const suportaArquivo =
        typeof navegador.canShare !==
          "function" ||
        navegador.canShare({
          files: [
            arquivoCompartilhar,
          ],
        })

      if (
        suportaCompartilhar &&
        suportaArquivo &&
        navegador.share
      ) {
        await navegador.share({
          title:
            catalogo.nome,

          text:
            `${catalogo.nome} - ${catalogo.representada.nome}`,

          files: [
            arquivoCompartilhar,
          ],
        })

        return
      }

      baixarCatalogo(
        catalogo
      )

      alert(
        "Este navegador não permite compartilhar o arquivo diretamente. O catálogo foi enviado para download para que você possa anexá-lo no WhatsApp ou em outro aplicativo."
      )
    } catch (
      error
    ) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return
      }

      console.error(
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao compartilhar catálogo."
      )
    } finally {
      setCompartilhandoId(
        null
      )
    }
  }

  async function alterarStatus(
    catalogo: Catalogo,
    acao:
      | "arquivar"
      | "restaurar"
  ) {
    const textoAcao =
      acao ===
      "arquivar"
        ? "arquivar"
        : "restaurar"

    const confirmar =
      window.confirm(
        `Deseja ${textoAcao} o catálogo "${catalogo.nome}"?`
      )

    if (
      !confirmar
    ) {
      return
    }

    setAlterandoCatalogoId(
      catalogo.id
    )

    try {
      const response =
        await fetch(
          `/api/catalogos/${catalogo.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                acao,
              }),
          }
        )

      const data =
        await response.json()

      if (
        !response.ok
      ) {
        throw new Error(
          mensagemResposta(
            data,
            "Erro ao alterar catálogo."
          )
        )
      }

      if (
        representadaSelecionadaId
      ) {
        await Promise.all([
          carregarPastas(),

          carregarCatalogos(
            representadaSelecionadaId,
            pagina,
            filtroStatus,
            buscaCatalogos
          ),
        ])
      }
    } catch (
      error
    ) {
      console.error(
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao alterar catálogo."
      )
    } finally {
      setAlterandoCatalogoId(
        null
      )
    }
  }

  if (
    carregandoInicial
  ) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando Catálogos...
        </div>
      </div>
    )
  }

  if (
    representadaSelecionada
  ) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={
                voltarPastas
              }
              className="mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Todas as Representadas
            </Button>

            <div className="flex items-start gap-3">
              <div className="rounded-xl border bg-muted/40 p-3">
                <FolderOpen className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {representadaSelecionada.nome}
                </h1>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {representadaSelecionada.codigo && (
                    <span>
                      Código{" "}
                      {representadaSelecionada.codigo}
                    </span>
                  )}

                  <span>
                    {
                      representadaSelecionada.catalogos.ativos
                    }{" "}
                    ativos
                  </span>

                  <span>
                    {
                      representadaSelecionada.catalogos.arquivados
                    }{" "}
                    arquivados
                  </span>

                  <span>
                    {
                      representadaSelecionada.catalogos.total
                    }{" "}
                    no total
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={
                () =>
                  router.push(
                    `/representadas/${representadaSelecionada.id}`
                  )
              }
            >
              <Building2 className="h-4 w-4 mr-1" />
              Representada 360
            </Button>

            {podeAlterar && (
              <Button
                onClick={
                  () =>
                    setMostrarUpload(
                      (
                        atual
                      ) =>
                        !atual
                    )
                }
              >
                <Upload className="h-4 w-4 mr-1" />
                Novo catálogo
              </Button>
            )}
          </div>
        </div>

        {mostrarUpload &&
          podeAlterar && (
            <form
              onSubmit={
                enviarCatalogo
              }
              className="rounded-xl border bg-card p-4 md:p-5 space-y-4"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  Adicionar catálogo
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  O arquivo ficará vinculado a{" "}
                  <strong>
                    {
                      representadaSelecionada.nome
                    }
                  </strong>
                  .
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1.5">
                    Arquivo *
                  </label>

                  <Input
                    ref={
                      arquivoRef
                    }
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.docx,.pptx,.zip"
                    onChange={
                      selecionarArquivo
                    }
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, imagens, Excel, Word, PowerPoint ou ZIP. Limite de 300 MB.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Nome do catálogo
                  </label>

                  <Input
                    value={
                      nome
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setNome(
                          event.target.value
                        )
                    }
                    placeholder="Opcional — será usado o nome do arquivo"
                    maxLength={
                      160
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Versão
                  </label>

                  <Input
                    value={
                      versao
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setVersao(
                          event.target.value
                        )
                    }
                    placeholder="Ex.: 2026, Set/2026, V3"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Data de referência
                  </label>

                  <Input
                    type="date"
                    value={
                      dataReferencia
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setDataReferencia(
                          event.target.value
                        )
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Descrição
                  </label>

                  <Input
                    value={
                      descricao
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setDescricao(
                          event.target.value
                        )
                    }
                    placeholder="Ex.: Catálogo geral de produtos"
                  />
                </div>
              </div>

              {arquivo && (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <strong>
                    Arquivo selecionado:
                  </strong>{" "}
                  {
                    arquivo.name
                  }{" "}
                  ·{" "}
                  {
                    formatarTamanho(
                      arquivo.size
                    )
                  }
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    enviandoArquivo
                  }
                  onClick={
                    () => {
                      limparFormularioUpload()

                      setMostrarUpload(
                        false
                      )
                    }
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={
                    enviandoArquivo ||
                    !arquivo
                  }
                >
                  {enviandoArquivo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Salvar catálogo
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

              <Input
                value={
                  buscaCatalogos
                }
                onChange={
                  (
                    event
                  ) => {
                    setBuscaCatalogos(
                      event.target.value
                    )

                    setPagina(
                      1
                    )
                  }
                }
                placeholder="Buscar catálogo, arquivo, versão ou Representada..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={
                  filtroStatus ===
                  "Ativo"
                    ? "default"
                    : "outline"
                }
                onClick={
                  () => {
                    setFiltroStatus(
                      "Ativo"
                    )

                    setPagina(
                      1
                    )
                  }
                }
              >
                Ativos
              </Button>

              <Button
                type="button"
                size="sm"
                variant={
                  filtroStatus ===
                  "Arquivado"
                    ? "default"
                    : "outline"
                }
                onClick={
                  () => {
                    setFiltroStatus(
                      "Arquivado"
                    )

                    setPagina(
                      1
                    )
                  }
                }
              >
                Arquivados
              </Button>

              <Button
                type="button"
                size="sm"
                variant={
                  filtroStatus ===
                  "todos"
                    ? "default"
                    : "outline"
                }
                onClick={
                  () => {
                    setFiltroStatus(
                      "todos"
                    )

                    setPagina(
                      1
                    )
                  }
                }
              >
                Todos
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  carregandoCatalogos
                }
                onClick={
                  () =>
                    void carregarCatalogos(
                      representadaSelecionada.id,
                      pagina,
                      filtroStatus,
                      buscaCatalogos
                    )
                }
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    carregandoCatalogos
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {carregandoCatalogos ? (
          <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
            Carregando catálogos...
          </div>
        ) : catalogos.length ===
          0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <FileText className="h-9 w-9 mx-auto text-muted-foreground mb-3" />

            <h2 className="font-semibold">
              Nenhum catálogo encontrado
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              {filtroStatus ===
              "Ativo"
                ? "Esta Representada ainda não possui catálogo ativo com estes filtros."
                : "Nenhum arquivo corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {catalogos.map(
              (
                catalogo
              ) => (
                <div
                  key={
                    catalogo.id
                  }
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex gap-3">
                      <div className="shrink-0 rounded-lg bg-muted p-2.5">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold break-words">
                            {
                              catalogo.nome
                            }
                          </h3>

                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              catalogo.status ===
                              "Ativo"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {
                              catalogo.status
                            }
                          </span>

                          {catalogo.extensao && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase">
                              {
                                catalogo.extensao
                              }
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground break-all">
                          {
                            catalogo.nomeArquivoOriginal
                          }
                        </p>

                        {catalogo.descricao && (
                          <p className="mt-2 text-sm">
                            {
                              catalogo.descricao
                            }
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Tamanho:{" "}
                            {
                              formatarTamanho(
                                catalogo.tamanhoBytes
                              )
                            }
                          </span>

                          <span>
                            Versão:{" "}
                            {
                              catalogo.versao ||
                              "—"
                            }
                          </span>

                          <span>
                            Referência:{" "}
                            {
                              formatarData(
                                catalogo.dataReferencia
                              )
                            }
                          </span>

                          <span>
                            Cadastrado:{" "}
                            {
                              formatarDataHora(
                                catalogo.criadoEm
                              )
                            }
                          </span>

                          {catalogo.criadoPor?.nome && (
                            <span>
                              Por:{" "}
                              {
                                catalogo.criadoPor.nome
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={
                          () =>
                            abrirCatalogo(
                              catalogo
                            )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Abrir
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={
                          () =>
                            baixarCatalogo(
                              catalogo
                            )
                        }
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={
                          compartilhandoId ===
                          catalogo.id
                        }
                        onClick={
                          () =>
                            void compartilharCatalogo(
                              catalogo
                            )
                        }
                      >
                        {compartilhandoId ===
                        catalogo.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4 mr-1" />
                        )}
                        Compartilhar
                      </Button>

                      {podeAlterar &&
                        catalogo.status ===
                          "Ativo" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              alterandoCatalogoId ===
                              catalogo.id
                            }
                            onClick={
                              () =>
                                void alterarStatus(
                                  catalogo,
                                  "arquivar"
                                )
                            }
                          >
                            {alterandoCatalogoId ===
                            catalogo.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Archive className="h-4 w-4 mr-1" />
                            )}
                            Arquivar
                          </Button>
                        )}

                      {podeAlterar &&
                        catalogo.status ===
                          "Arquivado" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              alterandoCatalogoId ===
                              catalogo.id
                            }
                            onClick={
                              () =>
                                void alterarStatus(
                                  catalogo,
                                  "restaurar"
                                )
                            }
                          >
                            {alterandoCatalogoId ===
                            catalogo.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-1" />
                            )}
                            Restaurar
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {paginacao.total >
          0 && (
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {
                paginacao.total
              }{" "}
              catálogo
              {
                paginacao.total ===
                1
                  ? ""
                  : "s"
              }{" "}
              · página{" "}
              {
                paginacao.pagina
              }{" "}
              de{" "}
              {
                paginacao.totalPaginas
              }
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  pagina <=
                  1
                }
                onClick={
                  () =>
                    setPagina(
                      (
                        atual
                      ) =>
                        Math.max(
                          1,
                          atual -
                            1
                        )
                    )
                }
              >
                Anterior
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  pagina >=
                  paginacao.totalPaginas
                }
                onClick={
                  () =>
                    setPagina(
                      (
                        atual
                      ) =>
                        Math.min(
                          paginacao.totalPaginas,
                          atual +
                            1
                        )
                    )
                }
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border bg-muted/40 p-3">
              <FolderOpen className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Catálogos
              </h1>

              <p className="text-sm text-muted-foreground mt-1">
                Biblioteca comercial organizada por Representada.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={
              () =>
                router.push(
                  "/"
                )
            }
          >
            <Home className="h-4 w-4 mr-1" />
            Início
          </Button>

          <Button
            variant="outline"
            onClick={
              () =>
                void carregarPastas()
            }
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Representadas
          </div>

          <div className="mt-1 text-2xl font-bold">
            {
              totais.representadas
            }
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Catálogos ativos
          </div>

          <div className="mt-1 text-2xl font-bold">
            {
              totais.ativos
            }
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Arquivados
          </div>

          <div className="mt-1 text-2xl font-bold">
            {
              totais.arquivados
            }
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Arquivos totais
          </div>

          <div className="mt-1 text-2xl font-bold">
            {
              totais.total
            }
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

          <Input
            value={
              buscaPastas
            }
            onChange={
              (
                event
              ) =>
                setBuscaPastas(
                  event.target.value
                )
            }
            placeholder="Buscar Representada ou código..."
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Pastas por Representada
        </h2>

        {pastasFiltradas.length ===
        0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <FolderOpen className="h-9 w-9 mx-auto text-muted-foreground mb-3" />

            <p className="font-medium">
              Nenhuma Representada encontrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pastasFiltradas.map(
              (
                item
              ) => (
                <button
                  type="button"
                  key={
                    item.id
                  }
                  onClick={
                    () =>
                      abrirPasta(
                        item.id
                      )
                  }
                  className="text-left rounded-xl border bg-card p-4 transition hover:border-foreground/30 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-muted p-2.5">
                      <FolderOpen className="h-5 w-5" />
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status ===
                        "Ativa"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {
                        item.status
                      }
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="font-semibold leading-tight">
                      {
                        item.nome
                      }
                    </div>

                    {item.codigo && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {
                          item.codigo
                        }
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-lg font-semibold">
                        {
                          item.catalogos.ativos
                        }
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Ativos
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-lg font-semibold">
                        {
                          item.catalogos.arquivados
                        }
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Arquivados
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-lg font-semibold">
                        {
                          item.catalogos.total
                        }
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Total
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Última movimentação:{" "}
                    {
                      formatarData(
                        item.catalogos.ultimoCatalogoEm
                      )
                    }
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}