/**
 * @file themeContextDefinition.ts
 * @description Definições do contexto de tema: tipos, constantes e criação do contexto.
 * 
 * Separado do ThemeProvider para seguir a regra do react-refresh.
 * 
 * @see ThemeProvider: src/contexts/ThemeContext.tsx
 * @see useTheme: src/contexts/useTheme.ts
 */

import { createContext } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

export type Tema = 'light' | 'dark';

export interface ThemeContextType {
  /** Tema atual ('light' ou 'dark') */
  tema: Tema;
  /** Alterna entre light e dark */
  alternarTema: () => void;
  /** Indica se o tema atual é dark */
  isDark: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

export const STORAGE_KEY = '@no-na-armadura:tema';

/* ═══════════════════════════════════════════════════════════════
   Contexto
   ═══════════════════════════════════════════════════════════════ */

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
