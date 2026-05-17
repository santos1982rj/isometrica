/**
 * @file Input.tsx
 * @description Componente de campo de texto do Design System.
 * 
 * Encapsula todos os estilos de input, labels, ícones e estados de erro.
 * Resolve definitivamente o problema de contraste no modo escuro.
 * 
 * @example
 * <Input label="Email" type="email" placeholder="seu@email.com" />
 * <Input label="Senha" type="password" error="Senha muito curta" />
 * <Input icon={Search} placeholder="Buscar..." />
 */

import React, { forwardRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type InputVariant = 'default' | 'glass';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo do campo */
  label?: string;
  /** Texto de ajuda abaixo do campo */
  hint?: string;
  /** Mensagem de erro (exibe borda vermelha e texto de erro) */
  error?: string;
  /** Ícone Lucide (renderizado à esquerda) */
  icon?: React.FC<{ size?: number; className?: string }>;
  /** Ícone clicável à direita (ex: toggle de visibilidade de senha) */
  rightIcon?: React.FC<{ size?: number; className?: string }>;
  /** Ação ao clicar no ícone direito */
  onRightIconClick?: () => void;
  /** Variante visual */
  variant?: InputVariant;
  /** Classes adicionais para o container */
  containerClassName?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Classes
   ═══════════════════════════════════════════════════════════════ */

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default:
    'bg-white dark:bg-gray-800 ' +
    'border-gray-300 dark:border-gray-600 ' +
    'text-gray-900 dark:text-gray-100 ' +
    'placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:ring-primary-500/50 focus:border-primary-500',
  glass:
    'bg-white/50 dark:bg-gray-800/50 ' +
    'backdrop-blur-sm ' +
    'border-gray-200 dark:border-gray-700 ' +
    'text-gray-900 dark:text-gray-100 ' +
    'placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:ring-primary-500/50 focus:border-primary-500',
};

const BASE_CLASSES =
  'w-full rounded-xl border px-4 py-2.5 text-sm ' +
  'transition-all duration-200 ' +
  'focus:outline-none focus:ring-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const ERROR_CLASSES =
  'border-red-400 dark:border-red-500 ' +
  'focus:ring-red-500/50 focus:border-red-500 ' +
  'text-red-900 dark:text-red-100 ' +
  'placeholder-red-300 dark:placeholder-red-400';

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      icon: IconComponent,
      rightIcon: RightIconComponent,
      onRightIconClick,
      variant = 'default',
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Ícone esquerdo */}
          {IconComponent && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <IconComponent size={18} />
            </div>
          )}

          {/* Campo de input */}
          <input
            ref={ref}
            id={inputId}
            className={`
              ${BASE_CLASSES}
              ${IconComponent ? 'pl-10' : ''}
              ${RightIconComponent ? 'pr-10' : ''}
              ${error ? ERROR_CLASSES : VARIANT_CLASSES[variant]}
              ${className}
            `.replace(/\s+/g, ' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {/* Ícone direito (clicável) */}
          {RightIconComponent && (
            <button
              type="button"
              onClick={onRightIconClick}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <RightIconComponent size={18} />
            </button>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500 dark:text-red-400 animate-fade-in">
            {error}
          </p>
        )}

        {/* Texto de ajuda */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';