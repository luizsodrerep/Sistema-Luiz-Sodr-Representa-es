"use client"

import {
  Suspense,
} from "react"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  ArrowLeft,
  Home,
  Loader2,
  ShieldX,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function AcessoNegadoContent() {
  const router = useRouter()

  const searchParams =
    useSearchParams()

  const origem =
    searchParams.get("origem")

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3 text-red-600">
            <ShieldX className="h-7 w-7 flex-shrink-0" />

            <div>
              <CardTitle>
                Acesso não autorizado
              </CardTitle>

              <CardDescription className="mt-1">
                Seu usuário está autenticado, mas não possui permissão para acessar esta área.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {origem && (
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs text-slate-500">
                Rota solicitada
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-800">
                {origem}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Se você considera que precisa desta permissão para executar sua função, solicite a liberação ao Diretor do sistema.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                router.back()
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="button"
              className="flex-1"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
            >
              <Home className="mr-2 h-4 w-4" />
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CarregandoAcessoNegado() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />

        <span>
          Verificando acesso...
        </span>
      </div>
    </div>
  )
}

export default function AcessoNegadoPage() {
  return (
    <Suspense
      fallback={
        <CarregandoAcessoNegado />
      }
    >
      <AcessoNegadoContent />
    </Suspense>
  )
}