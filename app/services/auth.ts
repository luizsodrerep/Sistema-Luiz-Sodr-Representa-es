// app/services/auth.ts
import type { AuthCredentials, User } from '@/app/types/system';

export const login = async (credentials: AuthCredentials): Promise<{
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro na autenticação'
      };
    }

    return {
      success: true,
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor'
    };
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};