"use client";

import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

import Link from "next/link";

import {
    AlertCircle,
    Ban,
    BarChart3,
    Building2,
    Calendar,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Factory,
    FileCheck2,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    ShoppingCart,
    Target,
    TrendingUp,
} from "lucide-react";

import {
    NavigationButtons,
} from "@/components/navigation-buttons";

import {
    SpreadsheetHandler,
} from "@/components/spreadsheet-handler";

import {
    Button,
} from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Input,
} from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type InteracaoOrigemResumo = {
    id: string;
    numeroSequencial: number;
    tipo?: string;
    assunto?: string | null;
};

type OrcamentoOrigemResumo = {
    id: string;
    numeroSequencial: number;
    status: string;
    interacaoOrigem?: InteracaoOrigemResumo | null;
};

type UsuarioResumo = {
    id: string;
    nome: string;
    perfil: string;
};

interface Venda {
    id: string;
    numeroSequencial: number;
    data: string;
    valorTotal: number | null;
    comissao: number | null;
    valorComissaoPrevista: number | null;
    percentualComissaoAplicado: number | null;
    status: string;
    condicaoPagamento: string | null;
    numeroPedido: string | null;
    numeroPedidoRepresentada: string | null;
    numeroOCCliente: string | null;
    pedidoEnviadoEm: string | null;
    confirmadoEm: string | null;

    cliente: {
        id: string;
        codigo: string | null;
        razaoSocial: string;
        nomeFantasia: string | null;
        cnpj: string | null;
    };

    representada: {
        id: string;
        codigo: string | null;
        nome: string;
        cnpj: string | null;
    };

    orcamentoOrigem: OrcamentoOrigemResumo | null;
    criadoPor: UsuarioResumo | null;
    responsavel: UsuarioResumo | null;
}

type MetaRepresentada = {
    id: string;
    representadaId: string;
    tipo: string;
    ano: number;
    mes: number;
    valorMeta: number;
    ativa: boolean;
    fonte: string | null;
    referencia: string | null;
    observacoes: string | null;
    criadoEm: string;
    atualizadoEm: string;

    representada: {
        id: string;
        nome: string;
        status: string;
    };
};

type FiltroStatus =
    | "todos"
    | "aguardando-envio"
    | "aguardando-confirmacao"
    | "confirmados"
    | "faturados"
    | "cancelados";

type FiltroPeriodo =
    | "mes-atual"
    | "mes-anterior"
    | "trimestre-atual"
    | "ano-atual"
    | "personalizado"
    | "todo-historico";

type IntervaloPeriodo = {
    inicio: Date | null;
    fimExclusivo: Date | null;
    valido: boolean;
};

type MesReferencia = {
    ano: number;
    mes: number;
};

type DesempenhoRepresentada = {
    id: string;
    nome: string;
    meta: number | null;
    vendido: number;
    quantidade: number;
};

type IndicadorCardProps = {
    titulo: string;
    valor: ReactNode;
    detalhe: ReactNode;
    icone: ReactNode;
    classeIcone?: string;
};

function IndicadorCard({
    titulo,
    valor,
    detalhe,
    icone,
    classeIcone = "bg-blue-50 text-blue-700",
}: IndicadorCardProps) {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            {titulo}
                        </p>

                        <div className="mt-2 text-2xl font-bold tracking-tight">
                            {valor}
                        </div>

                        <div className="mt-1 text-xs leading-5 text-muted-foreground">
                            {detalhe}
                        </div>
                    </div>

                    <div
                        className={`shrink-0 rounded-xl p-2.5 ${classeIcone}`}
                    >
                        {icone}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatarCodigoVenda(numero: number) {
    return `VEN-${String(numero).padStart(6, "0")}`;
}

function formatarCodigoOrcamento(numero: number) {
    return `ORC-${String(numero).padStart(6, "0")}`;
}

function formatarCodigoInteracao(numero: number) {
    return `INT-${String(numero).padStart(6, "0")}`;
}

function formatarMoeda(valor: number | null) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    ).format(
        Number(valor || 0)
    );
}

function formatarPercentual(valor: number | null) {
    if (
        valor === null ||
        !Number.isFinite(valor)
    ) {
        return "—";
    }

    return `${valor.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }
    )}%`;
}

function formatarData(dataISO: string | null) {
    if (!dataISO) {
        return "—";
    }

    const data =
        new Date(dataISO);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "—";
    }

    return data.toLocaleDateString(
        "pt-BR"
    );
}

function dataParaInput(data: Date) {
    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function inputParaData(
    valor: string
): Date | null {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            valor
        )
    ) {
        return null;
    }

    const [
        anoTexto,
        mesTexto,
        diaTexto,
    ] = valor.split("-");

    const ano =
        Number(anoTexto);

    const mes =
        Number(mesTexto);

    const dia =
        Number(diaTexto);

    const data =
        new Date(
            ano,
            mes - 1,
            dia,
            0,
            0,
            0,
            0
        );

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        return null;
    }

    return data;
}

function adicionarDias(
    data: Date,
    dias: number
) {
    const copia =
        new Date(data);

    copia.setDate(
        copia.getDate() + dias
    );

    return copia;
}

function nomeCliente(venda: Venda) {
    return (
        venda.cliente.nomeFantasia ||
        venda.cliente.razaoSocial
    );
}

function classeStatus(status: string) {
    if (
        status === "Faturado"
    ) {
        return "bg-green-100 text-green-800";
    }

    if (
        status === "Confirmado"
    ) {
        return "bg-emerald-100 text-emerald-800";
    }

    if (
        status ===
        "Aguardando confirmação"
    ) {
        return "bg-blue-100 text-blue-800";
    }

    if (
        status ===
        "Aguardando envio"
    ) {
        return "bg-amber-100 text-amber-800";
    }

    if (
        status === "Cancelado"
    ) {
        return "bg-red-100 text-red-800";
    }

    if (
        status === "Pendente"
    ) {
        return "bg-yellow-100 text-yellow-800";
    }

    return "bg-slate-100 text-slate-800";
}

function correspondeStatus(
    venda: Venda,
    filtro: FiltroStatus
) {
    if (
        filtro === "todos"
    ) {
        return true;
    }

    if (
        filtro ===
        "aguardando-envio"
    ) {
        return (
            venda.status ===
            "Aguardando envio"
        );
    }

    if (
        filtro ===
        "aguardando-confirmacao"
    ) {
        return (
            venda.status ===
            "Aguardando confirmação"
        );
    }

    if (
        filtro ===
        "confirmados"
    ) {
        return (
            venda.status ===
            "Confirmado"
        );
    }

    if (
        filtro ===
        "faturados"
    ) {
        return (
            venda.status ===
            "Faturado"
        );
    }

    if (
        filtro ===
        "cancelados"
    ) {
        return (
            venda.status ===
            "Cancelado"
        );
    }

    return true;
}

function obterIntervaloPeriodo(
    filtro: FiltroPeriodo,
    inicioPersonalizado: string,
    fimPersonalizado: string
): IntervaloPeriodo {
    if (
        filtro === "todo-historico"
    ) {
        return {
            inicio: null,
            fimExclusivo: null,
            valido: true,
        };
    }

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        hoje.getMonth();

    if (
        filtro === "mes-atual"
    ) {
        return {
            inicio:
                new Date(
                    ano,
                    mes,
                    1
                ),

            fimExclusivo:
                new Date(
                    ano,
                    mes + 1,
                    1
                ),

            valido: true,
        };
    }

    if (
        filtro === "mes-anterior"
    ) {
        return {
            inicio:
                new Date(
                    ano,
                    mes - 1,
                    1
                ),

            fimExclusivo:
                new Date(
                    ano,
                    mes,
                    1
                ),

            valido: true,
        };
    }

    if (
        filtro === "trimestre-atual"
    ) {
        const primeiroMesTrimestre =
            Math.floor(mes / 3) * 3;

        return {
            inicio:
                new Date(
                    ano,
                    primeiroMesTrimestre,
                    1
                ),

            fimExclusivo:
                new Date(
                    ano,
                    primeiroMesTrimestre + 3,
                    1
                ),

            valido: true,
        };
    }

    if (
        filtro === "ano-atual"
    ) {
        return {
            inicio:
                new Date(
                    ano,
                    0,
                    1
                ),

            fimExclusivo:
                new Date(
                    ano + 1,
                    0,
                    1
                ),

            valido: true,
        };
    }

    const inicio =
        inputParaData(
            inicioPersonalizado
        );

    const fim =
        inputParaData(
            fimPersonalizado
        );

    if (
        !inicio ||
        !fim ||
        fim < inicio
    ) {
        return {
            inicio,

            fimExclusivo:
                fim
                    ? adicionarDias(
                        fim,
                        1
                    )
                    : null,

            valido: false,
        };
    }

    return {
        inicio,

        fimExclusivo:
            adicionarDias(
                fim,
                1
            ),

        valido: true,
    };
}

function pertenceAoPeriodo(
    venda: Venda,
    intervalo: IntervaloPeriodo
) {
    if (!intervalo.valido) {
        return false;
    }

    if (
        intervalo.inicio === null ||
        intervalo.fimExclusivo === null
    ) {
        return true;
    }

    const dataVenda =
        new Date(venda.data);

    if (
        Number.isNaN(
            dataVenda.getTime()
        )
    ) {
        return false;
    }

    return (
        dataVenda >= intervalo.inicio &&
        dataVenda < intervalo.fimExclusivo
    );
}

function mesesDoIntervalo(
    intervalo: IntervaloPeriodo
): MesReferencia[] {
    if (
        !intervalo.valido ||
        !intervalo.inicio ||
        !intervalo.fimExclusivo
    ) {
        return [];
    }

    const ultimoDia =
        adicionarDias(
            intervalo.fimExclusivo,
            -1
        );

    const cursor =
        new Date(
            intervalo.inicio.getFullYear(),
            intervalo.inicio.getMonth(),
            1
        );

    const limite =
        new Date(
            ultimoDia.getFullYear(),
            ultimoDia.getMonth(),
            1
        );

    const meses: MesReferencia[] =
        [];

    while (
        cursor <= limite
    ) {
        meses.push({
            ano:
                cursor.getFullYear(),

            mes:
                cursor.getMonth() + 1,
        });

        cursor.setMonth(
            cursor.getMonth() + 1
        );
    }

    return meses;
}

function descreverPeriodo(
    filtro: FiltroPeriodo,
    intervalo: IntervaloPeriodo
) {
    const hoje =
        new Date();

    if (
        filtro === "mes-atual"
    ) {
        const descricao =
            hoje.toLocaleDateString(
                "pt-BR",
                {
                    month: "long",
                    year: "numeric",
                }
            );

        return `Mês atual · ${descricao}`;
    }

    if (
        filtro === "mes-anterior"
    ) {
        const mesAnterior =
            new Date(
                hoje.getFullYear(),
                hoje.getMonth() - 1,
                1
            );

        const descricao =
            mesAnterior.toLocaleDateString(
                "pt-BR",
                {
                    month: "long",
                    year: "numeric",
                }
            );

        return `Mês anterior · ${descricao}`;
    }

    if (
        filtro === "trimestre-atual"
    ) {
        const trimestre =
            Math.floor(
                hoje.getMonth() / 3
            ) + 1;

        return `${trimestre}º trimestre · ${hoje.getFullYear()}`;
    }

    if (
        filtro === "ano-atual"
    ) {
        return `Ano atual · ${hoje.getFullYear()}`;
    }

    if (
        filtro === "todo-historico"
    ) {
        return "Todo o histórico";
    }

    if (
        !intervalo.valido ||
        !intervalo.inicio ||
        !intervalo.fimExclusivo
    ) {
        return "Período personalizado inválido";
    }

    const fim =
        adicionarDias(
            intervalo.fimExclusivo,
            -1
        );

    return `Personalizado · ${intervalo.inicio.toLocaleDateString(
        "pt-BR"
    )} a ${fim.toLocaleDateString(
        "pt-BR"
    )}`;
}

function contarDiasUteisRestantes(
    intervalo: IntervaloPeriodo
): number | null {
    if (
        !intervalo.valido ||
        !intervalo.inicio ||
        !intervalo.fimExclusivo
    ) {
        return null;
    }

    const hoje =
        new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );

    const inicio =
        hoje > intervalo.inicio
            ? hoje
            : new Date(
                intervalo.inicio
            );

    if (
        inicio >=
        intervalo.fimExclusivo
    ) {
        return 0;
    }

    let diasUteis = 0;

    const cursor =
        new Date(inicio);

    while (
        cursor <
        intervalo.fimExclusivo
    ) {
        const diaSemana =
            cursor.getDay();

        if (
            diaSemana !== 0 &&
            diaSemana !== 6
        ) {
            diasUteis += 1;
        }

        cursor.setDate(
            cursor.getDate() + 1
        );
    }

    return diasUteis;
}

function somaValorVendas(
    vendas: Venda[]
) {
    return vendas.reduce(
        (
            total,
            venda
        ) =>
            total +
            Number(
                venda.valorTotal || 0
            ),
        0
    );
}

function somaComissoes(
    vendas: Venda[]
) {
    return vendas.reduce(
        (
            total,
            venda
        ) =>
            total +
            Number(
                venda.valorComissaoPrevista ??
                venda.comissao ??
                0
            ),
        0
    );
}

export default function VendasPage() {
    const hojeInicial =
        new Date();

    const inicioMesInicial =
        new Date(
            hojeInicial.getFullYear(),
            hojeInicial.getMonth(),
            1
        );

    const [
        vendas,
        setVendas,
    ] =
        useState<Venda[]>(
            []
        );

    const [
        metas,
        setMetas,
    ] =
        useState<MetaRepresentada[]>(
            []
        );

    const [
        carregando,
        setCarregando,
    ] =
        useState(true);

    const [
        carregandoMetas,
        setCarregandoMetas,
    ] =
        useState(true);

    const [
        erro,
        setErro,
    ] =
        useState<
            string | null
        >(null);

    const [
        erroMetas,
        setErroMetas,
    ] =
        useState<
            string | null
        >(null);

    const [
        busca,
        setBusca,
    ] =
        useState("");

    const [
        filtroStatus,
        setFiltroStatus,
    ] =
        useState<FiltroStatus>(
            "todos"
        );

    const [
        filtroPeriodo,
        setFiltroPeriodo,
    ] =
        useState<FiltroPeriodo>(
            "mes-atual"
        );

    const [
        inicioPersonalizado,
        setInicioPersonalizado,
    ] =
        useState(
            dataParaInput(
                inicioMesInicial
            )
        );

    const [
        fimPersonalizado,
        setFimPersonalizado,
    ] =
        useState(
            dataParaInput(
                hojeInicial
            )
        );

    async function carregarDados(
        silencioso = false
    ) {
        try {
            if (!silencioso) {
                setCarregando(true);
                setCarregandoMetas(true);
            }

            setErro(null);
            setErroMetas(null);

            const [
                responseVendas,
                responseMetas,
            ] =
                await Promise.all([
                    fetch(
                        "/api/vendas",
                        {
                            cache:
                                "no-store",
                        }
                    ),

                    fetch(
                        "/api/metas-representadas?tipo=Vendas",
                        {
                            cache:
                                "no-store",
                        }
                    ),
                ]);

            const dataVendas =
                await responseVendas
                    .json()
                    .catch(
                        () => []
                    );

            if (
                !responseVendas.ok
            ) {
                throw new Error(
                    dataVendas?.message ||
                    "Erro ao buscar vendas."
                );
            }

            setVendas(
                Array.isArray(
                    dataVendas
                )
                    ? dataVendas
                    : []
            );

            const dataMetas =
                await responseMetas
                    .json()
                    .catch(
                        () => []
                    );

            if (
                responseMetas.ok &&
                Array.isArray(
                    dataMetas
                )
            ) {
                setMetas(
                    dataMetas
                );
            } else {
                setErroMetas(
                    dataMetas?.message ||
                    "Não foi possível carregar as metas das Representadas."
                );
            }
        } catch (error) {
            console.error(
                error
            );

            setErro(
                "Não foi possível carregar as vendas."
            );
        } finally {
            if (!silencioso) {
                setCarregando(
                    false
                );

                setCarregandoMetas(
                    false
                );
            }
        }
    }

    useEffect(() => {
        carregarDados();

        const intervalo =
            window.setInterval(
                () => {
                    carregarDados(
                        true
                    );
                },
                15000
            );

        return () => {
            window.clearInterval(
                intervalo
            );
        };
    }, []);

    const intervaloPeriodo =
        useMemo(
            () =>
                obterIntervaloPeriodo(
                    filtroPeriodo,
                    inicioPersonalizado,
                    fimPersonalizado
                ),
            [
                filtroPeriodo,
                inicioPersonalizado,
                fimPersonalizado,
            ]
        );

    const descricaoPeriodo =
        useMemo(
            () =>
                descreverPeriodo(
                    filtroPeriodo,
                    intervaloPeriodo
                ),
            [
                filtroPeriodo,
                intervaloPeriodo,
            ]
        );

    const mesesPeriodo =
        useMemo(
            () =>
                mesesDoIntervalo(
                    intervaloPeriodo
                ),
            [
                intervaloPeriodo,
            ]
        );

    const vendasNoPeriodo =
        useMemo(
            () =>
                vendas.filter(
                    (venda) =>
                        pertenceAoPeriodo(
                            venda,
                            intervaloPeriodo
                        )
                ),
            [
                vendas,
                intervaloPeriodo,
            ]
        );

    const vendasFiltradas =
        useMemo(() => {
            const termo =
                busca
                    .trim()
                    .toLowerCase();

            return vendasNoPeriodo.filter(
                (venda) => {
                    if (
                        !correspondeStatus(
                            venda,
                            filtroStatus
                        )
                    ) {
                        return false;
                    }

                    if (!termo) {
                        return true;
                    }

                    const codigoVenda =
                        formatarCodigoVenda(
                            venda.numeroSequencial
                        ).toLowerCase();

                    const codigoOrcamento =
                        venda.orcamentoOrigem
                            ? formatarCodigoOrcamento(
                                venda.orcamentoOrigem.numeroSequencial
                            ).toLowerCase()
                            : "";

                    const codigoInteracao =
                        venda.orcamentoOrigem
                            ?.interacaoOrigem
                            ? formatarCodigoInteracao(
                                venda.orcamentoOrigem
                                    .interacaoOrigem
                                    .numeroSequencial
                            ).toLowerCase()
                            : "";

                    return (
                        codigoVenda.includes(
                            termo
                        ) ||
                        codigoOrcamento.includes(
                            termo
                        ) ||
                        codigoInteracao.includes(
                            termo
                        ) ||
                        nomeCliente(
                            venda
                        )
                            .toLowerCase()
                            .includes(
                                termo
                            ) ||
                        venda.cliente.razaoSocial
                            .toLowerCase()
                            .includes(
                                termo
                            ) ||
                        venda.representada.nome
                            .toLowerCase()
                            .includes(
                                termo
                            ) ||
                        venda.status
                            .toLowerCase()
                            .includes(
                                termo
                            ) ||
                        (
                            venda.numeroPedido
                                ?.toLowerCase()
                                .includes(
                                    termo
                                ) ??
                            false
                        ) ||
                        (
                            venda.numeroPedidoRepresentada
                                ?.toLowerCase()
                                .includes(
                                    termo
                                ) ??
                            false
                        ) ||
                        (
                            venda.numeroOCCliente
                                ?.toLowerCase()
                                .includes(
                                    termo
                                ) ??
                            false
                        )
                    );
                }
            );
        }, [
            vendasNoPeriodo,
            busca,
            filtroStatus,
        ]);

    /*
     * Venda cancelada permanece no histórico,
     * mas não compõe Realizado, Valor Vendido
     * nem Comissão Prevista.
     */
    const vendasRealizadas =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status !==
                        "Cancelado"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const canceladas =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status ===
                        "Cancelado"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const aguardandoEnvio =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status ===
                        "Aguardando envio"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const aguardandoConfirmacao =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status ===
                        "Aguardando confirmação"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const confirmadas =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status ===
                        "Confirmado"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const faturadas =
        useMemo(
            () =>
                vendasNoPeriodo.filter(
                    (venda) =>
                        venda.status ===
                        "Faturado"
                ),
            [
                vendasNoPeriodo,
            ]
        );

    const valorVendido =
        useMemo(
            () =>
                somaValorVendas(
                    vendasRealizadas
                ),
            [
                vendasRealizadas,
            ]
        );

    const totalComissoes =
        useMemo(
            () =>
                somaComissoes(
                    vendasRealizadas
                ),
            [
                vendasRealizadas,
            ]
        );

    const metasDoPeriodo =
        useMemo(() => {
            if (
                filtroPeriodo ===
                "todo-historico" ||
                mesesPeriodo.length === 0
            ) {
                return [];
            }

            const chaves =
                new Set(
                    mesesPeriodo.map(
                        (item) =>
                            `${item.ano}-${item.mes}`
                    )
                );

            return metas.filter(
                (meta) =>
                    meta.ativa &&
                    chaves.has(
                        `${meta.ano}-${meta.mes}`
                    )
            );
        }, [
            metas,
            mesesPeriodo,
            filtroPeriodo,
        ]);

    const metaPeriodo =
        useMemo(() => {
            if (
                filtroPeriodo ===
                "todo-historico" ||
                metasDoPeriodo.length === 0
            ) {
                return null;
            }

            return metasDoPeriodo.reduce(
                (
                    total,
                    meta
                ) =>
                    total +
                    Number(
                        meta.valorMeta || 0
                    ),
                0
            );
        }, [
            metasDoPeriodo,
            filtroPeriodo,
        ]);

    const representadasComMeta =
        useMemo(
            () =>
                new Set(
                    metasDoPeriodo.map(
                        (meta) =>
                            meta.representadaId
                    )
                ).size,
            [
                metasDoPeriodo,
            ]
        );

    const percentualAtingido =
        useMemo(() => {
            if (
                metaPeriodo === null ||
                metaPeriodo <= 0
            ) {
                return null;
            }

            return (
                valorVendido /
                metaPeriodo
            ) * 100;
        }, [
            valorVendido,
            metaPeriodo,
        ]);

    const faltaVender =
        useMemo(() => {
            if (
                metaPeriodo === null
            ) {
                return null;
            }

            return Math.max(
                metaPeriodo -
                valorVendido,
                0
            );
        }, [
            metaPeriodo,
            valorVendido,
        ]);

    const diasUteisRestantes =
        useMemo(
            () =>
                contarDiasUteisRestantes(
                    intervaloPeriodo
                ),
            [
                intervaloPeriodo,
            ]
        );

    const mediaNecessariaPorDiaUtil =
        useMemo(() => {
            if (
                faltaVender === null
            ) {
                return null;
            }

            if (
                faltaVender <= 0
            ) {
                return 0;
            }

            if (
                diasUteisRestantes === null ||
                diasUteisRestantes <= 0
            ) {
                return null;
            }

            return (
                faltaVender /
                diasUteisRestantes
            );
        }, [
            faltaVender,
            diasUteisRestantes,
        ]);

    const progressoMeta =
        useMemo(() => {
            if (
                percentualAtingido === null
            ) {
                return 0;
            }

            return Math.min(
                Math.max(
                    percentualAtingido,
                    0
                ),
                100
            );
        }, [
            percentualAtingido,
        ]);

    const desempenhoRepresentadas =
        useMemo<
            DesempenhoRepresentada[]
        >(
            () => {
                const mapa =
                    new Map<
                        string,
                        DesempenhoRepresentada
                    >();

                for (
                    const meta of
                    metasDoPeriodo
                ) {
                    const atual =
                        mapa.get(
                            meta.representadaId
                        );

                    if (atual) {
                        atual.meta =
                            Number(
                                atual.meta || 0
                            ) +
                            Number(
                                meta.valorMeta || 0
                            );
                    } else {
                        mapa.set(
                            meta.representadaId,
                            {
                                id:
                                    meta.representadaId,

                                nome:
                                    meta.representada.nome,

                                meta:
                                    Number(
                                        meta.valorMeta || 0
                                    ),

                                vendido:
                                    0,

                                quantidade:
                                    0,
                            }
                        );
                    }
                }

                for (
                    const venda of
                    vendasRealizadas
                ) {
                    const atual =
                        mapa.get(
                            venda.representada.id
                        );

                    if (atual) {
                        atual.vendido +=
                            Number(
                                venda.valorTotal || 0
                            );

                        atual.quantidade +=
                            1;
                    } else {
                        mapa.set(
                            venda.representada.id,
                            {
                                id:
                                    venda.representada.id,

                                nome:
                                    venda.representada.nome,

                                meta:
                                    null,

                                vendido:
                                    Number(
                                        venda.valorTotal || 0
                                    ),

                                quantidade:
                                    1,
                            }
                        );
                    }
                }

                return Array.from(
                    mapa.values()
                ).sort(
                    (a, b) =>
                        Math.max(
                            b.meta || 0,
                            b.vendido
                        ) -
                        Math.max(
                            a.meta || 0,
                            a.vendido
                        )
                );
            },
            [
                metasDoPeriodo,
                vendasRealizadas,
            ]
        );

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <NavigationButtons />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Vendas
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Acompanhe volume vendido, andamento dos pedidos,
                            comissão prevista e Meta x Realizado.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <SpreadsheetHandler
                            moduleType="vendas"
                            data={
                                vendasNoPeriodo
                            }
                        />

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1"
                            onClick={() =>
                                carregarDados()
                            }
                        >
                            <RefreshCw className="h-4 w-4" />

                            Atualizar
                        </Button>

                        <Link href="/vendas/nova">
                            <Button
                                size="sm"
                                className="h-9 gap-1"
                            >
                                <Plus className="h-4 w-4" />

                                Nova Venda
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-950">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <p className="text-sm font-semibold">
                                Período de análise
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {descricaoPeriodo}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="w-full md:w-[230px]">
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    Visualização
                                </p>

                                <Select
                                    value={
                                        filtroPeriodo
                                    }
                                    onValueChange={(
                                        value
                                    ) =>
                                        setFiltroPeriodo(
                                            value as FiltroPeriodo
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o período" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="mes-atual">
                                            Mês atual
                                        </SelectItem>

                                        <SelectItem value="mes-anterior">
                                            Mês anterior
                                        </SelectItem>

                                        <SelectItem value="trimestre-atual">
                                            Trimestre atual
                                        </SelectItem>

                                        <SelectItem value="ano-atual">
                                            Ano atual
                                        </SelectItem>

                                        <SelectItem value="personalizado">
                                            Período personalizado
                                        </SelectItem>

                                        <SelectItem value="todo-historico">
                                            Todo o histórico
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {filtroPeriodo ===
                                "personalizado" && (
                                <>
                                    <div className="w-full md:w-[165px]">
                                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                            Início
                                        </p>

                                        <Input
                                            type="date"
                                            value={
                                                inicioPersonalizado
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setInicioPersonalizado(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="w-full md:w-[165px]">
                                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                            Fim
                                        </p>

                                        <Input
                                            type="date"
                                            value={
                                                fimPersonalizado
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setFimPersonalizado(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {!intervaloPeriodo.valido && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                            <AlertCircle className="h-4 w-4" />

                            Informe um período personalizado válido, com a
                            data final igual ou posterior à inicial.
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <IndicadorCard
                        titulo="Quantidade de Vendas"
                        valor={
                            vendasRealizadas.length
                        }
                        detalhe={
                            canceladas.length > 0
                                ? `${canceladas.length} cancelada(s) fora deste total`
                                : "Vendas não canceladas no período"
                        }
                        icone={
                            <ShoppingCart className="h-5 w-5" />
                        }
                        classeIcone="bg-blue-50 text-blue-700"
                    />

                    <IndicadorCard
                        titulo="Valor Vendido"
                        valor={
                            formatarMoeda(
                                valorVendido
                            )
                        }
                        detalhe="Soma das Vendas não canceladas"
                        icone={
                            <CircleDollarSign className="h-5 w-5" />
                        }
                        classeIcone="bg-emerald-50 text-emerald-700"
                    />

                    <IndicadorCard
                        titulo="Confirmadas"
                        valor={
                            confirmadas.length
                        }
                        detalhe={
                            formatarMoeda(
                                somaValorVendas(
                                    confirmadas
                                )
                            )
                        }
                        icone={
                            <CheckCircle2 className="h-5 w-5" />
                        }
                        classeIcone="bg-emerald-50 text-emerald-700"
                    />

                    <IndicadorCard
                        titulo="Aguardando Envio"
                        valor={
                            aguardandoEnvio.length
                        }
                        detalhe={
                            formatarMoeda(
                                somaValorVendas(
                                    aguardandoEnvio
                                )
                            )
                        }
                        icone={
                            <Clock3 className="h-5 w-5" />
                        }
                        classeIcone="bg-amber-50 text-amber-700"
                    />

                    <IndicadorCard
                        titulo="Aguardando Confirmação"
                        valor={
                            aguardandoConfirmacao.length
                        }
                        detalhe={
                            formatarMoeda(
                                somaValorVendas(
                                    aguardandoConfirmacao
                                )
                            )
                        }
                        icone={
                            <Clock3 className="h-5 w-5" />
                        }
                        classeIcone="bg-blue-50 text-blue-700"
                    />

                    <IndicadorCard
                        titulo="Faturadas"
                        valor={
                            faturadas.length
                        }
                        detalhe={
                            formatarMoeda(
                                somaValorVendas(
                                    faturadas
                                )
                            )
                        }
                        icone={
                            <FileCheck2 className="h-5 w-5" />
                        }
                        classeIcone="bg-green-50 text-green-700"
                    />

                    <IndicadorCard
                        titulo="Canceladas"
                        valor={
                            canceladas.length
                        }
                        detalhe={
                            formatarMoeda(
                                somaValorVendas(
                                    canceladas
                                )
                            )
                        }
                        icone={
                            <Ban className="h-5 w-5" />
                        }
                        classeIcone="bg-red-50 text-red-700"
                    />

                    <IndicadorCard
                        titulo="Comissão Prevista"
                        valor={
                            formatarMoeda(
                                totalComissoes
                            )
                        }
                        detalhe="Calculada somente sobre Vendas não canceladas"
                        icone={
                            <TrendingUp className="h-5 w-5" />
                        }
                        classeIcone="bg-violet-50 text-violet-700"
                    />
                </div>

                <Card className="overflow-hidden border-blue-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="bg-blue-50/80 p-4 dark:bg-blue-950/20">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-700 p-2.5 text-white">
                                        <Target className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-slate-950 dark:text-slate-100">
                                            Meta x Realizado
                                        </p>

                                        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                                            A meta consolidada é a soma das
                                            metas mensais cadastradas nas
                                            Representadas para o período
                                            selecionado.
                                        </p>
                                    </div>
                                </div>

                                {erroMetas && (
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                                        <AlertCircle className="h-4 w-4" />

                                        {erroMetas}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                <div className="rounded-xl border border-blue-100 bg-white/90 p-3 dark:bg-slate-950/70">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Meta do período
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {carregandoMetas
                                            ? "Carregando..."
                                            : metaPeriodo !== null
                                                ? formatarMoeda(
                                                    metaPeriodo
                                                )
                                                : filtroPeriodo ===
                                                    "todo-historico"
                                                    ? "Não aplicável"
                                                    : "Não cadastrada"}
                                    </p>

                                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                        {metaPeriodo !== null
                                            ? `${representadasComMeta} Representada(s) · ${metasDoPeriodo.length} meta(s) mensal(is)`
                                            : "Nenhuma meta ativa encontrada para esta comparação."}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-white/90 p-3 dark:bg-slate-950/70">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Realizado
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-300">
                                        {formatarMoeda(
                                            valorVendido
                                        )}
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Vendas não canceladas
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-white/90 p-3 dark:bg-slate-950/70">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        % atingido
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {formatarPercentual(
                                            percentualAtingido
                                        )}
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Realizado ÷ meta cadastrada
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-white/90 p-3 dark:bg-slate-950/70">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Falta vender
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {faltaVender !== null
                                            ? formatarMoeda(
                                                faltaVender
                                            )
                                            : "—"}
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {faltaVender === 0
                                            ? "Meta atingida no período"
                                            : "Diferença até a meta consolidada"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-white/90 p-3 dark:bg-slate-950/70">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Média necessária / dia útil
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {mediaNecessariaPorDiaUtil !== null
                                            ? formatarMoeda(
                                                mediaNecessariaPorDiaUtil
                                            )
                                            : "—"}
                                    </p>

                                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                        {diasUteisRestantes !== null
                                            ? `${diasUteisRestantes} dia(s) útil(eis) restante(s), considerando segunda a sexta.`
                                            : "Disponível apenas para períodos com datas definidas."}
                                    </p>
                                </div>
                            </div>

                            {metaPeriodo !== null && (
                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                            Progresso da meta
                                        </span>

                                        <span className="font-semibold text-blue-800 dark:text-blue-300">
                                            {formatarPercentual(
                                                percentualAtingido
                                            )}
                                        </span>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950">
                                        <div
                                            className="h-full rounded-full bg-blue-700 transition-all"
                                            style={{
                                                width:
                                                    `${progressoMeta}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {filtroPeriodo ===
                                "personalizado" &&
                                intervaloPeriodo.valido && (
                                    <p className="mt-3 text-[11px] leading-4 text-slate-600 dark:text-slate-300">
                                        No período personalizado, como as
                                        metas são mensais, o sistema soma
                                        as metas dos meses abrangidos
                                        pelas datas selecionadas.
                                    </p>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {filtroPeriodo !==
                    "todo-historico" && (
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-700" />

                                    <div>
                                        <CardTitle className="text-base">
                                            Meta x Realizado por Representada
                                        </CardTitle>

                                        <CardDescription>
                                            Comparação das metas cadastradas
                                            com as Vendas não canceladas
                                            do mesmo período.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {desempenhoRepresentadas.length ===
                                    0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        Ainda não há metas nem Vendas para
                                        detalhar neste período.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Representada
                                                    </TableHead>

                                                    <TableHead className="text-right">
                                                        Meta
                                                    </TableHead>

                                                    <TableHead className="text-right">
                                                        Realizado
                                                    </TableHead>

                                                    <TableHead className="text-right">
                                                        Vendas
                                                    </TableHead>

                                                    <TableHead className="text-right">
                                                        % atingido
                                                    </TableHead>

                                                    <TableHead className="text-right">
                                                        Falta vender
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {desempenhoRepresentadas.map(
                                                    (item) => {
                                                        const percentual =
                                                            item.meta !== null &&
                                                            item.meta > 0
                                                                ? (
                                                                    item.vendido /
                                                                    item.meta
                                                                ) * 100
                                                                : null;

                                                        const falta =
                                                            item.meta !== null
                                                                ? Math.max(
                                                                    item.meta -
                                                                    item.vendido,
                                                                    0
                                                                )
                                                                : null;

                                                        return (
                                                            <TableRow
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <TableCell>
                                                                    <Link
                                                                        href={`/representadas/${item.id}`}
                                                                        className="font-medium text-blue-700 hover:underline"
                                                                    >
                                                                        {
                                                                            item.nome
                                                                        }
                                                                    </Link>
                                                                </TableCell>

                                                                <TableCell className="text-right font-medium">
                                                                    {item.meta !==
                                                                        null
                                                                        ? formatarMoeda(
                                                                            item.meta
                                                                        )
                                                                        : "Sem meta"}
                                                                </TableCell>

                                                                <TableCell className="text-right font-medium">
                                                                    {formatarMoeda(
                                                                        item.vendido
                                                                    )}
                                                                </TableCell>

                                                                <TableCell className="text-right">
                                                                    {
                                                                        item.quantidade
                                                                    }
                                                                </TableCell>

                                                                <TableCell className="text-right font-semibold">
                                                                    {formatarPercentual(
                                                                        percentual
                                                                    )}
                                                                </TableCell>

                                                                <TableCell className="text-right">
                                                                    {falta !==
                                                                        null
                                                                        ? formatarMoeda(
                                                                            falta
                                                                        )
                                                                        : "—"}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                        <Input
                            type="search"
                            placeholder="VEN, ORC, INT, cliente, pedido..."
                            className="w-full bg-white pl-8 dark:bg-gray-950"
                            value={
                                busca
                            }
                            onChange={(
                                event
                            ) =>
                                setBusca(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={
                                filtroStatus ===
                                    "todos"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "todos"
                                )
                            }
                        >
                            Todos
                        </Button>

                        <Button
                            variant={
                                filtroStatus ===
                                    "aguardando-envio"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "aguardando-envio"
                                )
                            }
                        >
                            Aguardando envio
                        </Button>

                        <Button
                            variant={
                                filtroStatus ===
                                    "aguardando-confirmacao"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "aguardando-confirmacao"
                                )
                            }
                        >
                            Aguardando confirmação
                        </Button>

                        <Button
                            variant={
                                filtroStatus ===
                                    "confirmados"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "confirmados"
                                )
                            }
                        >
                            Confirmados
                        </Button>

                        <Button
                            variant={
                                filtroStatus ===
                                    "faturados"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "faturados"
                                )
                            }
                        >
                            Faturados
                        </Button>

                        <Button
                            variant={
                                filtroStatus ===
                                    "cancelados"
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setFiltroStatus(
                                    "cancelados"
                                )
                            }
                        >
                            Cancelados
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>
                            Histórico de Vendas
                        </CardTitle>

                        <CardDescription>
                            {vendasFiltradas.length}{" "}
                            registro(s) exibido(s) em{" "}
                            {descricaoPeriodo.toLowerCase()}.
                            Atualização automática a cada 15 segundos.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {carregando ? (
                            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />

                                Carregando vendas...
                            </div>
                        ) : erro ? (
                            <div className="flex items-center gap-2 p-6 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />

                                {erro}
                            </div>
                        ) : vendasFiltradas.length ===
                            0 ? (
                            <div className="p-6 text-sm text-muted-foreground">
                                Nenhuma venda encontrada para o período e
                                filtros selecionados.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Venda
                                            </TableHead>

                                            <TableHead>
                                                Origem
                                            </TableHead>

                                            <TableHead>
                                                Cliente
                                            </TableHead>

                                            <TableHead>
                                                Representada
                                            </TableHead>

                                            <TableHead>
                                                Data
                                            </TableHead>

                                            <TableHead>
                                                Valor
                                            </TableHead>

                                            <TableHead>
                                                Comissão
                                            </TableHead>

                                            <TableHead>
                                                Status
                                            </TableHead>

                                            <TableHead className="text-right">
                                                Ações
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {vendasFiltradas.map(
                                            (venda) => {
                                                const codigoVenda =
                                                    formatarCodigoVenda(
                                                        venda.numeroSequencial
                                                    );

                                                const orcamento =
                                                    venda.orcamentoOrigem;

                                                const interacao =
                                                    orcamento?.interacaoOrigem;

                                                return (
                                                    <TableRow
                                                        key={
                                                            venda.id
                                                        }
                                                    >
                                                        <TableCell>
                                                            <Link
                                                                href={`/vendas/${venda.id}`}
                                                                className="font-mono font-bold text-blue-700 hover:underline"
                                                            >
                                                                {
                                                                    codigoVenda
                                                                }
                                                            </Link>

                                                            {venda.numeroPedidoRepresentada && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Pedido
                                                                    Rep.:{" "}
                                                                    {
                                                                        venda.numeroPedidoRepresentada
                                                                    }
                                                                </p>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            {orcamento ? (
                                                                <div className="space-y-1">
                                                                    {interacao && (
                                                                        <Link
                                                                            href={`/interacoes/${interacao.id}`}
                                                                            className="flex items-center gap-1 font-mono text-xs font-semibold text-blue-700 hover:underline"
                                                                        >
                                                                            <FileText className="h-3 w-3" />

                                                                            {formatarCodigoInteracao(
                                                                                interacao.numeroSequencial
                                                                            )}
                                                                        </Link>
                                                                    )}

                                                                    <Link
                                                                        href={`/orcamentos/${orcamento.id}`}
                                                                        className="flex items-center gap-1 font-mono text-xs font-semibold text-green-700 hover:underline"
                                                                    >
                                                                        <FileCheck2 className="h-3 w-3" />

                                                                        {formatarCodigoOrcamento(
                                                                            orcamento.numeroSequencial
                                                                        )}
                                                                    </Link>

                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {interacao
                                                                            ? "Interação → Orçamento → Venda"
                                                                            : "Orçamento → Venda"}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <ShoppingCart className="h-4 w-4 text-slate-500" />

                                                                    <div>
                                                                        <p className="text-xs font-medium">
                                                                            Venda
                                                                            direta
                                                                        </p>

                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            Direta
                                                                            /
                                                                            retroativa
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="rounded-full bg-primary/10 p-2">
                                                                    <Building2 className="h-4 w-4 text-primary" />
                                                                </div>

                                                                <div>
                                                                    <Link
                                                                        href={`/clientes/${venda.cliente.id}`}
                                                                        className="font-medium hover:underline"
                                                                    >
                                                                        {nomeCliente(
                                                                            venda
                                                                        )}
                                                                    </Link>

                                                                    {venda.cliente.codigo && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                venda.cliente.codigo
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Link
                                                                href={`/representadas/${venda.representada.id}`}
                                                                className="flex items-center gap-2 text-primary hover:underline"
                                                            >
                                                                <Factory className="h-4 w-4" />

                                                                {
                                                                    venda.representada.nome
                                                                }
                                                            </Link>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />

                                                                <span>
                                                                    {formatarData(
                                                                        venda.data
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <CircleDollarSign className="h-3 w-3" />

                                                                <span className="font-medium">
                                                                    {formatarMoeda(
                                                                        venda.valorTotal
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {formatarMoeda(
                                                                        venda.valorComissaoPrevista ??
                                                                        venda.comissao
                                                                    )}
                                                                </p>

                                                                {venda.percentualComissaoAplicado !==
                                                                    null && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {Number(
                                                                                venda.percentualComissaoAplicado
                                                                            ).toLocaleString(
                                                                                "pt-BR",
                                                                                {
                                                                                    maximumFractionDigits:
                                                                                        4,
                                                                                }
                                                                            )}
                                                                            %
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classeStatus(
                                                                    venda.status
                                                                )}`}
                                                            >
                                                                {
                                                                    venda.status
                                                                }
                                                            </div>

                                                            {venda.pedidoEnviadoEm && (
                                                                <p className="mt-1 text-[10px] text-muted-foreground">
                                                                    Enviado:{" "}
                                                                    {formatarData(
                                                                        venda.pedidoEnviadoEm
                                                                    )}
                                                                </p>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <Link
                                                                href={`/vendas/${venda.id}`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    Ver Venda
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}