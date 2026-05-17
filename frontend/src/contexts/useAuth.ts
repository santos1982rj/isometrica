/**
 * @file useAuth.ts
 * @description Hook personalizado para acessar o contexto de autenticação.
 * 
 * @see Definições: src/contexts/authContextDefinition.ts
 * 
 * @example
 * const { usuario, fazerLogin, logout, atualizarUsuario } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from './authContextDefinition';

/**
 * Hook para acessar estado e funções de autenticação.
 * 
 * @returns Objeto com usuário, token, loading e funções de ação
 * @throws Erro se usado fora de um AuthProvider
 */
export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext);

  if (contexto === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }

  return contexto;
}