'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const devOverlay = document.querySelector('[data-nextjs-dev-overlay]')
    if (devOverlay) {
      devOverlay.setAttribute('style', 'display: none')
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui pode ir sua lógica de envio real
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white border border-gray-150 rounded-lg shadow-md p-6 w-80 text-center">
        <h1 className="text-lg font-bold mb-6">Alterar Senha</h1>
        <form onSubmit={handleSubmit} className="space-y-2 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full border border-gray-500 rounded px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
            >
              Enviar
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 text-sm font-medium rounded hover:bg-gray-400 transition"
              onClick={() => router.push('/login')}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
