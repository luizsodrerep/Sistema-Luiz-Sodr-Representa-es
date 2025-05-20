'use client'

import { useEffect, useState } from 'react'

type Venda = {
  id: string
  data: string
  valor: string
  valorFaturado: string
  comissao: string
  cliente: string
  representada: string
  representadaId: number
  status: string
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendas')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar vendas')
        return res.json()
      })
      .then((data: Venda[]) => {
        console.log("Vendas recebidas:", data)
        setVendas(data)
      })
      .catch((err) => {
        console.error(err)
        setErro('Erro ao carregar dados')
      })
  }, [])

  if (erro) return <div className="text-red-500">{erro}</div>
  if (!vendas.length) return <div>Carregando vendas...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vendas</h1>
      <ul className="space-y-2">
        {vendas.map((venda) => (
          <li key={venda.id} className="border p-4 rounded-md shadow-sm">
            <p><strong>Data:</strong> {venda.data}</p>
            <p><strong>Cliente:</strong> {venda.cliente}</p>
            <p><strong>Representada:</strong> {venda.representada}</p>
            <p><strong>Valor:</strong> R$ {venda.valor}</p>
            <p><strong>Comissão:</strong> R$ {venda.comissao}</p>
            <p><strong>Status:</strong> {venda.status}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
