'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const router = useRouter();
  const qc = useQueryClient();

  const { data: usuario, isLoading: carregando } = useQuery<Usuario | null>({
    queryKey: ['auth', 'perfil'],
    queryFn: () => api.auth.perfil().catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      api.auth.login({ email, senha }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'perfil'] });
      const perfil = qc.getQueryData<Usuario>(['auth', 'perfil']);
      if (perfil) router.push(rotaInicial(perfil.role));
    },
  });

  const cadastroMutation = useMutation({
    mutationFn: ({ email, senha, nome }: { email: string; senha: string; nome?: string }) =>
      api.auth.cadastro({ email, senha, nome }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'perfil'] });
      const perfil = qc.getQueryData<Usuario>(['auth', 'perfil']);
      if (perfil) router.push(rotaInicial(perfil.role));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      qc.clear();
      router.push('/entrar');
    },
  });

  const login = useCallback(async (email: string, senha: string) => {
    await loginMutation.mutateAsync({ email, senha });
  }, [loginMutation]);

  const cadastro = useCallback(async (email: string, senha: string, nome?: string) => {
    await cadastroMutation.mutateAsync({ email, senha, nome });
  }, [cadastroMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <AuthContext.Provider value={{ usuario: usuario ?? null, carregando, login, cadastro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function rotaInicial(role: string) {
  switch (role) {
    case 'PROFESSOR': return '/professor/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/dashboard';
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
