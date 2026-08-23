import type {
  PerfilUsuario,
} from "@/lib/auth/session"

export type RecursoSistema =
  | "dashboard"
  | "clientes"
  | "representadas"
  | "contratosRepresentada"
  | "regrasComerciais"
  | "contasRecebimento"
  | "vendas"
  | "interacoes"
  | "agenda"
  | "mapa"
  | "relatorios"
  | "financeiro"
  | "contabilidade"
  | "usuarios"
  | "configuracoes"
  | "auditoria"

export type AcaoSistema =
  | "ver"
  | "criar"
  | "editar"
  | "excluir"
  | "administrar"

export type EscopoDados =
  | "todos"
  | "operacional"
  | "proprios"
  | "nenhum"

type PermissaoRecurso = {
  acoes: readonly AcaoSistema[]
  escopo: EscopoDados
}

type MatrizPermissoes = Record<
  PerfilUsuario,
  Partial<
    Record<
      RecursoSistema,
      PermissaoRecurso
    >
  >
>

const TODAS_ACOES: readonly AcaoSistema[] = [
  "ver",
  "criar",
  "editar",
  "excluir",
  "administrar",
]

const ACOES_OPERACIONAIS: readonly AcaoSistema[] = [
  "ver",
  "criar",
  "editar",
]

const SOMENTE_LEITURA: readonly AcaoSistema[] = [
  "ver",
]

export const PERMISSOES: MatrizPermissoes = {
  Diretor: {
    dashboard: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    clientes: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    representadas: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    contratosRepresentada: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    regrasComerciais: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    contasRecebimento: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    vendas: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    interacoes: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    agenda: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    mapa: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    relatorios: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    financeiro: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    contabilidade: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    usuarios: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    configuracoes: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },

    auditoria: {
      acoes: TODAS_ACOES,
      escopo: "todos",
    },
  },

  Administrativo: {
    dashboard: {
      acoes: SOMENTE_LEITURA,
      escopo: "operacional",
    },

    clientes: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    representadas: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    contratosRepresentada: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    regrasComerciais: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    contasRecebimento: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    vendas: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    interacoes: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    agenda: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    mapa: {
      acoes: SOMENTE_LEITURA,
      escopo: "operacional",
    },

    relatorios: {
      acoes: SOMENTE_LEITURA,
      escopo: "operacional",
    },

    financeiro: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },

    contabilidade: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "operacional",
    },
  },

  Preposto: {
    dashboard: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    clientes: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    representadas: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    contratosRepresentada: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    regrasComerciais: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    vendas: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "proprios",
    },

    interacoes: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "proprios",
    },

    agenda: {
      acoes: ACOES_OPERACIONAIS,
      escopo: "proprios",
    },

    mapa: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },

    relatorios: {
      acoes: SOMENTE_LEITURA,
      escopo: "proprios",
    },
  },
}

export function obterPermissao(
  perfil: PerfilUsuario,
  recurso: RecursoSistema
): PermissaoRecurso | null {
  return (
    PERMISSOES[perfil][recurso] ??
    null
  )
}

export function podeExecutarAcao(
  perfil: PerfilUsuario,
  recurso: RecursoSistema,
  acao: AcaoSistema
): boolean {
  const permissao =
    obterPermissao(
      perfil,
      recurso
    )

  if (!permissao) {
    return false
  }

  return permissao.acoes.includes(
    acao
  )
}

export function escopoDoRecurso(
  perfil: PerfilUsuario,
  recurso: RecursoSistema
): EscopoDados {
  return (
    obterPermissao(
      perfil,
      recurso
    )?.escopo ?? "nenhum"
  )
}

export function podeAcessarRecurso(
  perfil: PerfilUsuario,
  recurso: RecursoSistema
): boolean {
  return podeExecutarAcao(
    perfil,
    recurso,
    "ver"
  )
}

export function recursoDaRota(
  pathname: string
): RecursoSistema | null {
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith(
      "/dashboard/"
    )
  ) {
    return "dashboard"
  }

  if (
    pathname === "/clientes" ||
    pathname.startsWith(
      "/clientes/"
    ) ||
    pathname.startsWith(
      "/api/clientes"
    )
  ) {
    return "clientes"
  }

  if (
    pathname.includes(
      "/contas-recebimento"
    ) ||
    pathname.startsWith(
      "/api/contas-bancarias"
    )
  ) {
    return "contasRecebimento"
  }

  if (
    pathname.includes(
      "/contratos"
    )
  ) {
    return "contratosRepresentada"
  }

  if (
    pathname.includes(
      "/regras-comerciais"
    )
  ) {
    return "regrasComerciais"
  }

  if (
    pathname ===
      "/representadas" ||
    pathname.startsWith(
      "/representadas/"
    ) ||
    pathname.startsWith(
      "/api/representadas"
    ) ||
    pathname.startsWith(
      "/api/empresas-escritorio"
    )
  ) {
    return "representadas"
  }

  if (
    pathname === "/vendas" ||
    pathname.startsWith(
      "/vendas/"
    ) ||
    pathname.startsWith(
      "/api/vendas"
    )
  ) {
    return "vendas"
  }

  if (
    pathname ===
      "/interacoes" ||
    pathname.startsWith(
      "/interacoes/"
    ) ||
    pathname ===
      "/interacoes-ai" ||
    pathname.startsWith(
      "/interacoes-ai/"
    ) ||
    pathname.startsWith(
      "/api/interacoes"
    )
  ) {
    return "interacoes"
  }

  if (
    pathname === "/agenda" ||
    pathname.startsWith(
      "/agenda/"
    )
  ) {
    return "agenda"
  }

  if (
    pathname === "/mapa" ||
    pathname.startsWith(
      "/mapa/"
    )
  ) {
    return "mapa"
  }

  if (
    pathname === "/relatorios" ||
    pathname.startsWith(
      "/relatorios/"
    ) ||
    pathname.startsWith(
      "/api/templates"
    )
  ) {
    return "relatorios"
  }

  if (
    pathname === "/financeiro" ||
    pathname.startsWith(
      "/financeiro/"
    )
  ) {
    return "financeiro"
  }

  if (
    pathname ===
      "/contabilidade" ||
    pathname.startsWith(
      "/contabilidade/"
    )
  ) {
    return "contabilidade"
  }

  if (
    pathname === "/usuarios" ||
    pathname.startsWith(
      "/usuarios/"
    )
  ) {
    return "usuarios"
  }

  if (
    pathname ===
      "/configuracoes" ||
    pathname.startsWith(
      "/configuracoes/"
    )
  ) {
    return "configuracoes"
  }

  return null
}