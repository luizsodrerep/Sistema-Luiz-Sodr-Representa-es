// app/components/Navigation.tsx
import { useRouter } from 'next/router';
import type { MenuItem, User } from '@/app/types/system';
import { useEffect, useState } from 'react';

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: '📊', href: "/dashboard", permissions: ['all'] },
  { name: 'Database', icon: '🗄️', href: "/databases", permissions: ['admin', 'dba'] },
  { name: 'Clientes', icon: '👥', href: "/clientes", permissions: ['sales', 'admin'] },
  { name: 'Vendas', icon: '💰', href: "/vendas", permissions: ['sales', 'admin'] },
  { name: 'Intenções', icon: '🤖', href: "/intrences", permissions: ['marketing', 'admin'] },
  { name: 'Representantes', icon: '🏢', href: "/representades", permissions: ['sales', 'admin'] },
  { name: 'Agenda', icon: '📅', href: "/agenda", permissions: ['all'] },
  { name: 'Contabilidade', icon: '🧮', href: "/contabilidad", permissions: ['accounting', 'admin'] },
  { name: 'Configurações', icon: '⚙️', href: "/configurances", permissions: ['admin'] }
];

export default function MainNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Recupera dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const hasPermission = (item: MenuItem): boolean => {
    if (!user) return false;
    if (item.permissions.includes('all')) return true;
    return item.permissions.some(perm => 
      user.permissions.includes(perm) || user.role === 'admin'
    );
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-4">
      {/* ... cabeçalho ... */}
      
      <nav>
        <ul className="space-y-2">
          {menuItems.filter(hasPermission).map((item, index) => (
            <li key={index}>
              <button
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center p-2 rounded-md hover:bg-gray-700 ${
                  router.pathname === item.href ? 'bg-gray-700' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* ... botão de logout ... */}
    </div>
  );
}