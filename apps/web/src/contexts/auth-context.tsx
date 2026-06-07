'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Usuario {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (email: string, senha: string, nome?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      api.auth.perfil().then(setUsuario).catch(() => {
        localStorage.removeItem('token');
      }).finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.auth.login({ email, senha });
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const perfil = await api.auth.perfil();
    setUsuario(perfil);
    router.push('/dashboard');
  }, [router]);

  const cadastro = useCallback(async (email: string, senha: string, nome?: string) => {
    const res = await api.auth.cadastro({ email, senha, nome });
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const perfil = await api.auth.perfil();
    setUsuario(perfil);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
    router.push('/entrar');
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, token, carregando, login, cadastro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
