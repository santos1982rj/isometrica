/**
 * @file Tooltip.tsx
 * @description Componente de tooltip acessível usando Radix UI.
 * 
 * Exibe informações adicionais ao passar o mouse sobre um elemento.
 * Totalmente acessível (teclado + leitores de tela).
 * 
 * @see https://www.radix-ui.com/primitives/docs/components/tooltip
 * 
 * @example
 * <Tooltip content="Editar perfil">
 *   <button>
 *     <Edit3 />
 *   </button>
 * </Tooltip>
 */

import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface TooltipProps {
  /** Texto exibido no tooltip */
  content: string;
  /** Elemento que dispara o tooltip */
  children: React.ReactNode;
  /** Posição do tooltip (default: 'top') */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay em ms antes de aparecer (default: 500) */
  delayDuration?: number;
}

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

/**
 * Tooltip acessível com design glassmorphism.
 * Envolve o elemento filho e exibe o texto ao hover/focus.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delayDuration = 500,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        {/* Elemento disparador */}
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>

        {/* Conteúdo do tooltip */}
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className="
              z-[9999] px-3 py-1.5 rounded-lg
              bg-white/90 dark:bg-gray-800/90
              backdrop-blur-md
              border border-gray-200 dark:border-gray-700
              text-xs font-medium text-gray-700 dark:text-gray-300
              shadow-lg
              animate-fade-in
              select-none
            "
            // Evita que o tooltip pisca ao passar o mouse
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {content}
            {/* Setinha do tooltip */}
            <RadixTooltip.Arrow className="fill-white/90 dark:fill-gray-800/90" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}