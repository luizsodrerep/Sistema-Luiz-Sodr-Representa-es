"use client"

import { useEffect, useState } from "react"

import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Wallet,
} from "lucide-react"

export default function RepresentadaPage() {

  const params = useParams()

  const router = useRouter()

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [representada, setRepresentada] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    async function carregar() {

      try {

        const response = await fetch(
          `/api/representadas/${id}`
        )

        const data = await response.json()

        setRepresentada(data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    }

    if (id) carregar()

  }, [id])

  if (loading) {

    return (
      <div className="p-6">
        Carregando...
      </div>
    )

  }

  if (!representada) {

    return (
      <div className="p-6">
        Representada não encontrada
      </div>
    )

  }

  let faixas = []

  try {

    faixas =
      representada.faixasComissao
        ? JSON.parse(
            representada.faixasComissao
          )
        : []

  } catch {

    faixas = []

  }

  return (

    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            onClick={() =>
              router.push("/representadas")
            }
          >

            <ArrowLeft className="h-4 w-4 mr-2" />

            Voltar

          </Button>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">

              {representada.nome}

            </h1>

            <p className="text-sm text-slate-500">

              Código:
              {" "}
              {representada.codigo ||
                `REP-${representada.id
                  .slice(-6)
                  .toUpperCase()}`}

            </p>

          </div>

        </div>

        <Button
          onClick={() =>
            router.push(
              `/representadas/${id}/editar`
            )
          }
        >

          Editar

        </Button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2 shadow-sm border rounded-2xl">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-lg">

              <Building2 className="h-5 w-5" />

              Dados da Representada

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-6">

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <p className="text-sm text-slate-500">
                  Nome
                </p>

                <p className="font-medium">
                  {representada.nome || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  CNPJ
                </p>

                <p className="font-medium">
                  {representada.cnpj || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="font-medium">
                  {representada.status || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Fechamento Comissão
                </p>

                <p className="font-medium">
                  {representada.fechamentoComissao || "-"}
                </p>

              </div>

            </div>

            <div className="border-t pt-5">

              <h3 className="font-semibold text-slate-700 mb-4">

                Comissão

              </h3>

              {representada.tipoComissao ===
              "variada" ? (

                <div className="space-y-3">

                  {Array.isArray(faixas) &&
                    faixas.map(
                      (
                        faixa: any,
                        index: number
                      ) => (

                        <div
                          key={index}
                          className="grid grid-cols-2 gap-4 bg-slate-50 border rounded-xl p-4"
                        >

                          <div>

                            <p className="text-xs text-slate-500">

                              Desconto

                            </p>

                            <p className="font-semibold text-slate-800">

                              {faixa.desconto}%

                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-slate-500">

                              Comissão

                            </p>

                            <p className="font-semibold text-emerald-600">

                              {faixa.comissao}%

                            </p>

                          </div>

                        </div>

                      )
                    )}

                </div>

              ) : (

                <div className="bg-slate-50 border rounded-xl p-4">

                  <p className="text-sm text-slate-500">

                    Comissão fixa

                  </p>

                  <p className="text-2xl font-bold text-emerald-600">

                    {representada.comissao || 0}%

                  </p>

                </div>

              )}

            </div>

            <div className="border-t pt-5">

              <h3 className="font-semibold text-slate-700 mb-4">

                Dados Bancários

              </h3>

              <div>

                <p className="text-sm text-slate-500">

                  Banco Pagador

                </p>

                <p className="font-medium">

                  {representada.bancoComissao || "-"}

                </p>

              </div>

            </div>

          </CardContent>

        </Card>

        <div className="space-y-6">

          <Card className="shadow-sm border rounded-2xl">

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-lg">

                <Phone className="h-5 w-5" />

                Contato

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              <div>

                <p className="text-sm text-slate-500">
                  Contato Principal
                </p>

                <p className="font-medium">
                  {representada.contatoPrincipal || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Telefone
                </p>

                <p className="font-medium">
                  {representada.telefonePrincipal || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  WhatsApp
                </p>

                <p className="font-medium">
                  {representada.whatsappPrincipal || "-"}
                </p>

              </div>

            </CardContent>

          </Card>

          <Card className="shadow-sm border rounded-2xl">

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-lg">

                <Mail className="h-5 w-5" />

                Email

              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="font-medium break-all">

                {representada.emailPrincipal || "-"}

              </p>

            </CardContent>

          </Card>

          <Card className="shadow-sm border rounded-2xl">

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-lg">

                <MapPin className="h-5 w-5" />

                Endereço

              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              <p>
                {representada.endereco || "-"}
              </p>

              <p>
                {representada.cidade || "-"} -
                {" "}
                {representada.estado || "-"}
              </p>

              <p>
                CEP:
                {" "}
                {representada.cep || "-"}
              </p>

            </CardContent>

          </Card>

        </div>

      </div>

      <Card className="shadow-sm border rounded-2xl">

        <CardHeader>

          <CardTitle>

            Observações

          </CardTitle>

        </CardHeader>

        <CardContent>

          <p className="text-slate-700 whitespace-pre-line">

            {representada.observacoes || "Sem observações"}

          </p>

        </CardContent>

      </Card>

    </div>

  )

}