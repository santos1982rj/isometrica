/**
 * @file Spinner.tsx
 * @description Indicador de carregamento animado do Design System.
 * 
 * Usado em botões, cards e qualquer componente que precise
 * indicar processamento assíncrono.
 * 
 * @example
 * <Spinner />
 * <Spinner size="lg" variant="primary" />
 */


/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'primary' | 'white' | 'current';

interface SpinnerProps {
  /** Tamanho do spinner */
  size?: SpinnerSize;
  /** Variante de cor */
  variant?: SpinnerVariant;
  /** Classes adicionais */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Classes
   ═══════════════════════════════════════════════════════════════ */

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
};

const VARIANT_CLASSES: Record<SpinnerVariant, string> = {
  primary: 'border-primary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  current: 'border-current border-t-transparent',
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export function Spinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`rounded-full animate-spin
        ${SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${className}`}
    />
  );
}