// app/pagebase/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import type { AuthCredentials, User } from '@/app/types/system';

export default function LoginPage() {
    const router = useRouter();
    const [credentials, setCredentials] = useState<AuthCredentials>({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Substituir por chamada real à API
            const response = await fakeAuthService(credentials);

            if (response.success && response.token && response.user) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                router.push('/dashboard');
            }
            else {
                setError(response.message || 'Credenciais inválidas');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            {/* ... mesmo JSX do exemplo anterior, mas com tipagem */}
        </div>
    );
}

// Serviço de autenticação mockado (substituir por implementação real)
async function fakeAuthService(credentials: AuthCredentials): Promise<{
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
}> {
    return new Promise(resolve => {
        setTimeout(() => {
            if (credentials.username === 'admin' && credentials.password === 'admin123') {
                resolve({
                    success: true,
                    token: 'fake-jwt-token',
                    user: {
                        id: '1',
                        name: 'Admin',
                        email: 'admin@system.com',
                        role: 'admin',
                        permissions: ['all'],
                        passwordHash: '$2a$10$fakehash'
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }
        }, 1000);
    });
}