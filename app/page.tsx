import Image from "next/image"
import Link from "next/link"

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileBarChart,
  FileText,
  Landmark,
  Map,
  MessageSquareText,
  Plus,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
} from "lucide-react"

type Modulo = {
  titulo: string
  descricao: string
  href: string
  icon: typeof Users
}

type AcaoRapida = {
  titulo: string
  descricao: string
  href: string
  icon: typeof Users
  destaque?: boolean
}

const ACOES_RAPIDAS: AcaoRapida[] = [
  {
    titulo: "Nova Venda",
    descricao:
      "Inicie um novo registro comercial.",
    href: "/vendas/nova",
    icon: ReceiptText,
    destaque: true,
  },
  {
    titulo: "Nova Interação",
    descricao:
      "Registre um novo contato com cliente.",
    href: "/interacoes/nova",
    icon: MessageSquareText,
  },
  {
    titulo: "Dashboard",
    descricao:
      "Acesse a visão consolidada da gestão.",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    titulo: "Faturamentos",
    descricao:
      "Acesse o fluxo de faturamento.",
    href: "/faturamentos",
    icon: WalletCards,
  },
]

const MODULOS_PRINCIPAIS: Modulo[] = [
  {
    titulo: "Clientes",
    descricao:
      "Consulte, cadastre e mantenha as informações comerciais dos clientes.",
    href: "/clientes",
    icon: Users,
  },
  {
    titulo: "Interações",
    descricao:
      "Registre contatos, acompanhamentos e histórico de relacionamento.",
    href: "/interacoes",
    icon: MessageSquareText,
  },
  {
    titulo: "Orçamentos",
    descricao:
      "Crie, acompanhe e consulte as propostas comerciais do escritório.",
    href: "/orcamentos",
    icon: FileText,
  },
  {
    titulo: "Vendas",
    descricao:
      "Acompanhe pedidos confirmados e o fluxo comercial das vendas.",
    href: "/vendas",
    icon: ReceiptText,
  },
  {
    titulo: "Faturamentos",
    descricao:
      "Registre notas fiscais, valores faturados, cortes e condições de pagamento.",
    href: "/faturamentos",
    icon: WalletCards,
  },
  {
    titulo: "Representadas",
    descricao:
      "Consulte as indústrias representadas e seus dados comerciais.",
    href: "/representadas",
    icon: Building2,
  },
]

const MODULOS_APOIO: Modulo[] = [
  {
    titulo: "Dashboard",
    descricao:
      "Acesse a área consolidada de gestão comercial.",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    titulo: "Agenda",
    descricao:
      "Organize compromissos e atividades comerciais.",
    href: "/agenda",
    icon: CalendarDays,
  },
  {
    titulo: "Financeiro",
    descricao:
      "Acesse os controles financeiros do escritório.",
    href: "/financeiro",
    icon: CircleDollarSign,
  },
  {
    titulo: "Relatórios",
    descricao:
      "Consulte relatórios e informações gerenciais.",
    href: "/relatorios",
    icon: FileBarChart,
  },
  {
    titulo: "Mapa",
    descricao:
      "Visualize informações geográficas relacionadas à operação.",
    href: "/mapa",
    icon: Map,
  },
  {
    titulo: "Contabilidade",
    descricao:
      "Acesse informações destinadas ao suporte contábil.",
    href: "/contabilidade",
    icon: Landmark,
  },
  {
    titulo: "Configurações",
    descricao:
      "Acesse os parâmetros e configurações disponíveis no sistema.",
    href: "/configuracoes",
    icon: Settings,
  },
]

export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-800">
                <span className="h-2 w-2 rounded-full bg-orange-500" />

                Gestão Comercial
              </div>

              <div className="mt-5 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-[#071a2f] sm:text-4xl">
                  Luiz Sodré Representações
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  CRM para acompanhamento da operação comercial,
                  relacionamento com clientes, vendas,
                  faturamentos e gestão do escritório.
                </p>
              </div>

              <div className="mt-7">
                <div className="mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-orange-500" />

                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b315d]">
                    Ações rápidas
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ACOES_RAPIDAS.map(
                    (acao) => {
                      const Icone =
                        acao.icon

                      return (
                        <Link
                          key={acao.href}
                          href={acao.href}
                          className={[
                            "group flex min-h-[78px] items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200",
                            "hover:-translate-y-0.5 hover:shadow-md",
                            acao.destaque
                              ? "border-[#0b315d] bg-[#0b315d] text-white hover:border-blue-600 hover:bg-blue-700"
                              : "border-slate-200 bg-white text-[#071a2f] hover:border-blue-300 hover:bg-blue-50/70",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                              acao.destaque
                                ? "bg-white/10 text-orange-300 group-hover:bg-white/15"
                                : "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
                            ].join(" ")}
                          >
                            <Icone className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">
                              {acao.titulo}
                            </p>

                            <p
                              className={[
                                "mt-0.5 text-xs leading-5",
                                acao.destaque
                                  ? "text-blue-100"
                                  : "text-slate-500",
                              ].join(" ")}
                            >
                              {acao.descricao}
                            </p>
                          </div>

                          <ArrowRight
                            className={[
                              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                              acao.destaque
                                ? "text-orange-300"
                                : "text-blue-600",
                            ].join(" ")}
                          />
                        </Link>
                      )
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#071a2f] p-8 text-white lg:p-10">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-blue-600/20" />

              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[38px] border-orange-500/10" />

              <div className="relative flex h-full min-h-[250px] flex-col justify-between">
                <div>
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#101a24] shadow-lg ring-1 ring-white/10">
                    <Image
                      src="/branding/logo-lsr.png"
                      alt="Luiz Sodré Representações"
                      width={96}
                      height={96}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                    Sistema CRM
                  </p>

                  <p className="mt-2 text-xl font-bold leading-tight">
                    Gestão comercial em um único ambiente.
                  </p>
                </div>

                <p className="mt-6 text-sm leading-6 text-slate-300">
                  Utilize as ações rápidas, os módulos abaixo
                  ou o menu lateral para acessar sua rotina
                  comercial.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Operação Comercial
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#071a2f]">
              Módulos comerciais
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Principais áreas utilizadas na rotina comercial.
            </p>
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MODULOS_PRINCIPAIS.map(
              (modulo) => {
                const Icone =
                  modulo.icon

                return (
                  <Link
                    key={modulo.href}
                    href={modulo.href}
                    className="group flex min-h-[250px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-sm">
                        <Icone className="h-6 w-6" />
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-200 group-hover:border-blue-300 group-hover:bg-white group-hover:text-blue-700">
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-[#071a2f] transition-colors duration-200 group-hover:text-blue-700">
                        {modulo.titulo}
                      </h4>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {modulo.descricao}
                      </p>
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="h-1 w-10 rounded-full bg-slate-100 transition-all duration-200 group-hover:w-16 group-hover:bg-blue-500" />
                    </div>
                  </Link>
                )
              }
            )}
          </div>
        </section>

        <section className="mt-11">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Gestão e Apoio
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#071a2f]">
              Outras áreas do sistema
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Ferramentas complementares para gestão e
              administração do escritório.
            </p>
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {MODULOS_APOIO.map(
              (modulo) => {
                const Icone =
                  modulo.icon

                return (
                  <Link
                    key={modulo.href}
                    href={modulo.href}
                    className="group flex min-h-[155px] items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-sm">
                      <Icone className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-[#071a2f] transition-colors duration-200 group-hover:text-blue-700">
                          {modulo.titulo}
                        </h4>

                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {modulo.descricao}
                      </p>
                    </div>
                  </Link>
                )
              }
            )}
          </div>
        </section>

        <div className="mt-10 border-t border-slate-200 py-5">
          <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>
              Luiz Sodré Representações
            </span>

            <span>
              CRM e Gestão Comercial
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}