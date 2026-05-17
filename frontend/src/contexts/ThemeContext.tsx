/**
 * @file ThemeContext.tsx
 * @description Provedor do contexto de tema (dark/light).
 * 
 * Persiste a preferência do usuário no localStorage e aplica
 * a classe 'dark' ao elemento <html> para o Tailwind.
 * 
 * @see Definições: src/contexts/themeContextDefinition.ts
 * @see useTheme: src/contexts/useTheme.ts
 */

import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, STORAGE_KEY, type Tema } from './themeContextDefinition';

/**
 * Provedor do contexto de tema.
 * Aplica classe 'dark' ao <html> e persiste preferência.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    const salvo = localStorage.getItem(STORAGE_KEY) as Tema | null;
    if (salvo) return salvo;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (tema === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  function alternarTema(): void {
    setTema((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  const isDark = tema === 'dark';

  return (
    <ThemeContext.Provider value={{ tema, alternarTema, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}