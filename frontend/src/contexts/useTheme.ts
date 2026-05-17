/**
 * @file useTheme.ts
 * @description Hook personalizado para acessar o contexto de tema.
 * 
 * @see Definições: src/contexts/themeContextDefinition.ts
 * @example
 * const { tema, alternarTema, isDark } = useTheme();
 */

import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from './themeContextDefinition';

/**
 * Hook para acessar o contexto de tema.
 * 
 * @returns Objeto com tema atual, função de alternar e flag isDark
 * @throws Erro se usado fora do ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const contexto = useContext(ThemeContext);

  if (contexto === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider.');
  }

  return contexto;
}