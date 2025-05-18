'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

const publicRoutes = ['/login'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  console.log('[ProtectedRoute] Pathname atual:', pathname);
  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (publicRoutes.includes(pathname)) {
      console.log('[ProtectedRoute] Rota pública, renderizando:', pathname);
      setCanRender(true);
      return;
    }

    if (!isAuthenticated) {
      console.log('[ProtectedRoute] Usuário não autenticado. Redirecionando para /login...');
      router.push('/login');
    } else {
      console.log('[ProtectedRoute] Usuário autenticado. Renderizando app...');
      setCanRender(true);
    }
  }, [isAuthenticated, pathname, router]);

  if (!canRender) {
    console.log('[ProtectedRoute] Aguardando permissão para renderizar...');
    return null;
  }

  return <>{children}</>;
}
