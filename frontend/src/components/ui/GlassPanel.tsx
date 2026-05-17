/**
 * @file GlassPanel.tsx
 * @description Componente de painel com efeito "Liquid Glass" (vidro líquido).
 * 
 * Tendência de UX/UI 2025/2026: evolução do glassmorphism, com fundo translúcido,
 * desfoque de fundo (backdrop-blur), bordas semitransparentes e brilho dinâmico no hover.
 * 
 * @see Design System: tokens em src/index.css
 * 
 * @example
 * // Uso básico
 * <GlassPanel>
 *   <h2>Título</h2>
 *   <p>Conteúdo do card...</p>
 * </GlassPanel>
 * 
 * @example
 * // Com brilho ativado (recomendado para cards de destaque)
 * <GlassPanel glow>
 *   <p>Card com efeito luminoso ao passar o mouse</p>
 * </GlassPanel>
 * 
 * @param children - Conteúdo interno do painel.
 * @param className - Classes CSS adicionais (opcional).
 * @param glow - Ativa efeito de brilho na borda superior ao hover (opcional, default: false).
 */

import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      /**
       * Classes base do painel:
       * - Fundo semitransparente (claro/escuro)
       * - Desfoque de fundo (backdrop-blur) → efeito vidro
       * - Bordas suaves e arredondadas
       * - Sombra e anel de profundidade
       * - Transição suave (500ms) para hover
       */
      className={`
        relative bg-white/10 dark:bg-gray-800/30 
        backdrop-blur-xl 
        border border-white/20 dark:border-gray-700/30 
        rounded-3xl shadow-xl 
        ring-1 ring-black/5 dark:ring-white/10 
        transition-all duration-500 ease-out
        hover:bg-white/20 dark:hover:bg-gray-800/40 
        hover:shadow-2xl hover:scale-[1.01] 
        group
        ${glow ? 'hover:border-primary-400/50 dark:hover:border-primary-500/50' : ''} 
        p-6 ${className}
      `.trim()}
    >
      {/* 
        Efeito de brilho no topo (Liquid Glass):
        - Linha horizontal com gradiente (transparente → cor primária → transparente)
        - Visível apenas no hover (opacity 0 → opacity 100)
        - Duração de 700ms para suavidade
      */}
      <div className="absolute inset-x-4 -top-px h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent dark:via-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {children}
    </div>
  );
};

export default GlassPanel;