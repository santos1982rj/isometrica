/**
 * @file AuthContext.tsx
 * @description Provedor do contexto de autenticação (componente).
 * 
 * Gerencia o estado global de autenticação e persiste no localStorage.
 * Inclui role e avatar no objeto do usuário.
 * 
 * @see Definições: src/contexts/authContextDefinition.ts
 * @see useAuth: src/contexts/useAuth.ts
 * @see authService: src/services/authService.ts
 * @see Backend: backend/src/routes/auth.ts
 */

import { useState, useEffect, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { AuthContext, STORAGE_KEYS, type Usuario } from './authContextDefinition';

/* ═══════════════════════════════════════════════════════════════
   Provedor do Contexto
   ═══════════════════════════════════════════════════════════════ */

/**
 * Provedor do contexto de autenticação.
 * 
 * Gerencia o estado global de autenticação e persiste no localStorage.
 * Deve envolver toda a aplicação (ou pelo menos as rotas).
 * 
 * @param children - Componentes filhos que terão acesso ao contexto
 */
export function AuthProvider({ children }: { children: ReactNode }) {

  /* ─── Estado ──────────────────────────────────────────────── */
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* ─── Helpers internos (DEVEM vir antes do useEffect) ────── */

  /**
   * Persiste token e dados do usuário no localStorage.
   * Chamado após login, registro e atualização de perfil.
   * 
   * @param novoToken - Token JWT a ser armazenado
   * @param novoUsuario - Dados do usuário a serem armazenados
   */
  function persistirSessao(novoToken: string, novoUsuario: Usuario): void {
    localStorage.setItem(STORAGE_KEYS.token, novoToken);
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(novoUsuario));
  }

  /**
   * Remove dados de autenticação do localStorage.
   * Chamado no logout e quando dados estão corrompidos.
   */
  function limparStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.usuario);
  }

  /* ─── Efeito: verificar sessão salva ao iniciar ──────────── */

  /**
   * Ao montar o componente, verifica se existe token e dados
   * do usuário salvos no localStorage (sessão anterior).
   * 
   * setTimeout(0) é necessário no React 19 para evitar o erro
   * de setState síncrono dentro de useEffect.
   */
  useEffect(() => {
    const tokenSalvo = localStorage.getItem(STORAGE_KEYS.token);
    const usuarioSalvo = localStorage.getItem(STORAGE_KEYS.usuario);

    if (tokenSalvo && usuarioSalvo) {
      try {
        const usuarioParsed: Usuario = JSON.parse(usuarioSalvo);

        // Garante que campos novos tenham valor padrão
        const usuarioNormalizado: Usuario = {
            id: usuarioParsed.id,
  nome: usuarioParsed.nome,
  email: usuarioParsed.email,
  role: usuarioParsed.role || 'ALUNO',
  nivel: usuarioParsed.nivel || 1,  // ← Adicionar
  avatar: usuarioParsed.avatar || null,
  createdAt: usuarioParsed.createdAt,
        };

        setTimeout(() => {
          setToken(tokenSalvo);
          setUsuario(usuarioNormalizado);
          setLoading(false);
        }, 0);
      } catch {
        limparStorage();
        setTimeout(() => setLoading(false), 0);
      }
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  /* ─── Funções de ação ────────────────────────────────────── */

  /**
   * Constrói um objeto Usuario completo a partir da resposta da API.
   * Garante que todos os campos obrigatórios tenham valor.
   * 
   * @param dados - Dados parciais retornados pela API
   * @returns Objeto Usuario completo e normalizado
   */
function normalizarUsuario(dados: {
  id: number;
  nome: string;
  email: string;
  role?: string;
  nivel?: number;
  avatar?: string | null;
  createdAt: string;
}): Usuario {
  return {
    id: dados.id,
    nome: dados.nome,
    email: dados.email,
    role: (dados.role as 'ALUNO' | 'PROFESSOR' | 'ADMIN') || 'ALUNO',
    nivel: dados.nivel || 1,
    avatar: dados.avatar || null,
    createdAt: dados.createdAt,
  };
}

  /**
   * Realiza login chamando a API e atualiza estado + localStorage.
   * 
   * @param email - Email cadastrado
   * @param senha - Senha da conta
   * @throws Propaga erro da API se credenciais inválidas
   */
  async function fazerLogin(email: string, senha: string): Promise<void> {
    const resposta = await authService.login(email, senha);
    const usuarioCompleto = normalizarUsuario(resposta.usuario);

    if (resposta.token) {
      setToken(resposta.token);
      persistirSessao(resposta.token, usuarioCompleto);
    }

    setUsuario(usuarioCompleto);
  }

  /**
   * Realiza registro chamando a API e atualiza estado + localStorage.
   * Após registro bem-sucedido, o usuário já fica autenticado.
   * 
   * @param nome - Nome completo
   * @param email - Email (deve ser único)
   * @param senha - Senha (mínimo 6 caracteres)
   * @throws Propaga erro da API se email já existir
   */
  async function fazerRegistro(nome: string, email: string, senha: string): Promise<void> {
    const resposta = await authService.registrar(nome, email, senha);
    const usuarioCompleto = normalizarUsuario(resposta.usuario);

    if (resposta.token) {
      setToken(resposta.token);
      persistirSessao(resposta.token, usuarioCompleto);
    }

    setUsuario(usuarioCompleto);
  }

  /**
   * Realiza logout: limpa estado e localStorage.
   * Após logout, o usuário perde acesso às rotas protegidas.
   */
  function logout(): void {
    setToken(null);
    setUsuario(null);
    limparStorage();
  }

  /**
   * Atualiza dados do usuário no estado global e localStorage.
   * Chamado após edição de perfil bem-sucedida.
   * 
   * @param dados - Novos dados do usuário (parciais ou completos)
   */
  function atualizarUsuario(dados: Usuario): void {
    const usuarioCompleto = normalizarUsuario(dados);
    setUsuario(usuarioCompleto);
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuarioCompleto));
  }

  /**
   * Atualiza apenas o avatar do usuário no estado global e localStorage.
   * 
   * @param avatar - URL base64 da imagem ou null para remover
   */
  function atualizarAvatar(avatar: string | null): void {
    if (!usuario) return;

    const usuarioAtualizado: Usuario = {
      ...usuario,
      avatar,
    };

    setUsuario(usuarioAtualizado);
    localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(usuarioAtualizado));
  }

  /* ─── Renderização ───────────────────────────────────────── */

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        fazerLogin,
        fazerRegistro,
        logout,
        atualizarUsuario,
        atualizarAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}