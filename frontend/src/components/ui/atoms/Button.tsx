/**
 * @file Button.tsx
 * @description Componente de botão do Design System.
 * 
 * Encapsula todas as variantes, tamanhos, estados e ícones.
 * É o componente mais usado da plataforma.
 * 
 * @example
 * <Button variant="primary">Salvar</Button>
 * <Button variant="danger" size="sm" loading>Excluir</Button>
 * <Button variant="ghost" icon={Settings} />
 */

import React from 'react';
import { Spinner } from './Spinner';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Ícone Lucide (renderizado antes do texto) */
  icon?: React.FC<{ size?: number; className?: string }>;
  /** Exibe spinner e desabilita o botão */
  loading?: boolean;
  /** Conteúdo do botão */
  children?: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Classes
   ═══════════════════════════════════════════════════════════════ */

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 ' +
    'shadow-lg shadow-primary-500/25 dark:shadow-primary-500/10',
  secondary:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300 ' +
    'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 ' +
    'shadow-lg shadow-red-500/25',
  ghost:
    'text-gray-600 hover:bg-gray-100 focus:ring-gray-300 ' +
    'dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-600',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export function Button({
  variant = 'primary',
  size = 'md',
  icon: IconComponent,
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `.replace(/\s+/g, ' ')}
      {...props}
    >
      {loading ? (
        <Spinner
          size={size === 'lg' ? 'md' : 'sm'}
          variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
        />
      ) : IconComponent ? (
        <IconComponent size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />
      ) : null}

      {children && <span>{children}</span>}
    </button>
  );
}