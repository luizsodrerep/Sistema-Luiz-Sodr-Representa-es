// app/vendas/[id]/page.tsx
import { notFound } from "next/navigation"
import SidebarLayout from "@/app/components/menu"
import { NavigationButtons } from "@/components/navigation-buttons"

type Props = {
  params: { id: string }
}

export default function VendaPage({ params }: Props) {
  const { id } = params

  // Aqui você faria uma busca real. Exemplo de mock:
  const venda = {
    id,
    data: "15/03/2023",
    valor: "R$ 5.200,00",
  }

  if (!venda) {
    return notFound()
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mt-4">
          <NavigationButtons backLabel="Voltar para Vendas" backHref="/vendas" />
        </h1>
        <h1 className="text-2xl font-bold mt-4">Detalhes da Venda</h1>
        <p>ID: {venda.id}</p>
        <p>Data: {venda.data}</p>
        <p>Valor: {venda.valor}</p>
      </div>
    </SidebarLayout>
  )
}
