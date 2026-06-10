'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Usuario } from '@/lib/types';

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (email: string, senha: string, nome?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.auth.perfil().then(setUsuario).catch(() => {
      setUsuario(null);
    }).finally(() => setCarregando(false));
  }, []);

  function rotaInicial(role: string) {
    switch (role) {
      case 'PROFESSOR': return '/professor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/dashboard';
    }
  }

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.auth.login({ email, senha });
    const perfil = await api.auth.perfil();
    setUsuario(perfil);
    router.push(rotaInicial(perfil.role));
  }, [router]);

  const cadastro = useCallback(async (email: string, senha: string, nome?: string) => {
    const res = await api.auth.cadastro({ email, senha, nome });
    const perfil = await api.auth.perfil();
    setUsuario(perfil);
    router.push(rotaInicial(perfil.role));
  }, [router]);

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {});
    setUsuario(null);
    router.push('/auth/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, cadastro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
