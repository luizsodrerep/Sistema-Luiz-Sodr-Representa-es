'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        const devOverlay = document.querySelector('[data-nextjs-dev-overlay]')
        if (devOverlay) {
            devOverlay.setAttribute('style', 'display: none')
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (email === 'admin@email.com' && password === 'Syst3m123') {
            login();
            router.push('/');
        } else {
            setError('Email ou senha inválidos.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="bg-white border border-gray-150 rounded-lg shadow-md p-6 w-80 text-center">
                <h1 className="text-lg font-bold mb-6">Acesso ao Sistema</h1>
                <form onSubmit={handleLogin} className="space-y-2 text-left">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-1">
                            Usuário:
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            className="w-full border border-gray-500 rounded px-2 py-1 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-1">
                            Senha:
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full border border-gray-500 rounded px-2 py-1 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                            onClick={() => router.push('/change-password')}
                        >
                            Esqueceu a Senha?
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
