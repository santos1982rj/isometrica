/**
 * @file Badge.tsx
 * @description Componente de badge (etiqueta/status) do Design System.
 * 
 * Encapsula todas as variantes de cor, tamanho e estados visuais.
 * Substitui a duplicação de spans estilizados nas páginas.
 * 
 * @example
 * <Badge variant="success">Concluído</Badge>
 * <Badge variant="danger" size="sm">Admin</Badge>
 */

import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  /** Variante de cor do badge */
  variant?: BadgeVariant;
  /** Tamanho do badge */
  size?: BadgeSize;
  /** Conteúdo do badge */
  children: React.ReactNode;
  /** Classes adicionais (uso raro) */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Classes
   ═══════════════════════════════════════════════════════════════ */

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}`}
    >
      {children}
    </span>
  );
}