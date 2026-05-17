/**
 * @file authContextDefinition.ts
 * @description Definição do contexto de autenticação, tipos e constantes.
 * 
 * Separado do AuthProvider para seguir a regra do react-refresh:
 * "um arquivo, um componente OU definições".
 * 
 * @see AuthProvider: src/contexts/AuthContext.tsx
 * @see useAuth: src/contexts/useAuth.ts
 */

import { createContext } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Tipos e Interfaces
   ═══════════════════════════════════════════════════════════════ */

/**
 * Dados do usuário autenticado expostos ao frontend.
 * A senha NUNCA é incluída aqui (segurança).
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
  nivel: number;  // ← Adicionar esta linha
  createdAt: string;
  avatar: string | null;
}

/**
 * Formato do valor exposto pelo contexto.
 * Inclui estado (usuário, token, loading) e funções de ação.
 */
export interface AuthContextType {
  /** Usuário logado, ou null se não autenticado */
  usuario: Usuario | null;
  /** Token JWT atual para requisições autenticadas */
  token: string | null;
  /** Indica se está verificando token salvo (evita flicker na UI) */
  loading: boolean;
  /** Realiza login e atualiza estado global */
  fazerLogin: (email: string, senha: string) => Promise<void>;
  /** Realiza registro e atualiza estado global */
  fazerRegistro: (nome: string, email: string, senha: string) => Promise<void>;
  /** Remove token e usuário (logout completo) */
  logout: () => void;
  /** Atualiza dados do usuário no estado global (após edição de perfil) */
  atualizarUsuario: (dados: Usuario) => void;
    /** Atualiza apenas o avatar do usuário */
  atualizarAvatar: (avatar: string | null) => void; // ← Adicionar esta linha
}

/* ═══════════════════════════════════════════════════════════════
   Criação do Contexto
   ═══════════════════════════════════════════════════════════════ */

/**
 * Contexto de autenticação.
 * Inicializado como undefined para detecção de uso fora do Provider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Chaves usadas no localStorage para persistir sessão */
export const STORAGE_KEYS = {
  token: '@no-na-armadura:token',
  usuario: '@no-na-armadura:usuario',
} as const;


