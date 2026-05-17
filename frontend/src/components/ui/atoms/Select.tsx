/**
 * @file Select.tsx
 * @description Componente de dropdown (select) do Design System.
 * 
 * Encapsula todos os estilos de select, labels, ícones e estados de erro.
 * Resolve definitivamente o problema de contraste no modo escuro.
 * 
 * @example
 * <Select label="Nível" value={nivel} onChange={setNivel}>
 *   <option value="INICIANTE">Iniciante</option>
 *   <option value="AVANCADO">Avançado</option>
 * </Select>
 */

import React, { forwardRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type SelectVariant = 'default' | 'glass';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Rótulo do campo */
  label?: string;
  /** Texto de ajuda abaixo do campo */
  hint?: string;
  /** Mensagem de erro */
  error?: string;
  /** Variante visual */
  variant?: SelectVariant;
  /** Opções (alternativa a children) */
  options?: { value: string; label: string }[];
  /** Placeholder (primeira opção desabilitada) */
  placeholder?: string;
  /** Classes adicionais para o container */
  containerClassName?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Classes
   ═══════════════════════════════════════════════════════════════ */

const VARIANT_CLASSES: Record<SelectVariant, string> = {
  default:
    'bg-white dark:bg-gray-800 ' +
    'border-gray-300 dark:border-gray-600 ' +
    'text-gray-900 dark:text-gray-100 ' +
    'focus:ring-primary-500/50 focus:border-primary-500',
  glass:
    'bg-white/50 dark:bg-gray-800/50 ' +
    'backdrop-blur-sm ' +
    'border-gray-200 dark:border-gray-700 ' +
    'text-gray-900 dark:text-gray-100 ' +
    'focus:ring-primary-500/50 focus:border-primary-500',
};

const BASE_CLASSES =
  'w-full rounded-xl border px-4 py-2.5 text-sm ' +
  'transition-all duration-200 ' +
  'focus:outline-none focus:ring-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'appearance-none cursor-pointer';

const ERROR_CLASSES =
  'border-red-400 dark:border-red-500 ' +
  'focus:ring-red-500/50 focus:border-red-500';

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      variant = 'default',
      options,
      placeholder,
      children,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Select wrapper com seta customizada */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              ${BASE_CLASSES}
              ${error ? ERROR_CLASSES : VARIANT_CLASSES[variant]}
              ${className}
            `.replace(/\s+/g, ' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Seta customizada */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-500 dark:text-red-400 animate-fade-in">
            {error}
          </p>
        )}

        {/* Texto de ajuda */}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';