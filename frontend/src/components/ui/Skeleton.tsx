/**
 * @file Skeleton.tsx
 * @description Componentes de skeleton loading para estados de carregamento.
 * 
 * Exibe placeholders animados com pulso enquanto o conteúdo real carrega.
 * Melhora a experiência do usuário reduzindo a sensação de espera.
 * 
 * @example
 * // Linha de texto
 * <SkeletonText />
 * 
 * @example
 * // Card completo
 * <SkeletonCard />
 * 
 * @example
 * // Avatar circular
 * <SkeletonAvatar />
 */



/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

/**
 * Classe base compartilhada por todos os skeletons.
 * Animação de pulso + fundo cinza com dark mode.
 */
const BASE_CLASSES = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

/* ═══════════════════════════════════════════════════════════════
   Componentes
   ═══════════════════════════════════════════════════════════════ */

/**
 * Placeholder de linha de texto.
 * Aceita largura customizada via className.
 */
export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`${BASE_CLASSES} h-4 w-full ${className}`} />;
}

/**
 * Placeholder de título (mais alto e mais grosso).
 */
export function SkeletonTitle({ className = '' }: { className?: string }) {
  return <div className={`${BASE_CLASSES} h-8 w-3/4 ${className}`} />;
}

/**
 * Placeholder de avatar circular.
 */
export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return (
    <div
      className={`${BASE_CLASSES} rounded-full flex-shrink-0`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Placeholder de card completo com avatar, título, texto e botão.
 * Ideal para estados de loading de cards de conteúdo.
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-3xl p-6 space-y-4 border border-gray-200 dark:border-gray-700/30">
      <div className="flex items-center gap-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonTitle />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText className="w-5/6" />
        <SkeletonText className="w-4/6" />
      </div>
      <div className={`${BASE_CLASSES} h-10 w-32`} />
    </div>
  );
}

/**
 * Placeholder de tabela/lista com várias linhas.
 * 
 * @param rows - Número de linhas (default: 5)
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className={`${BASE_CLASSES} h-10 w-10 rounded-lg`} />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-1/2" />
          </div>
          <div className={`${BASE_CLASSES} h-8 w-20`} />
        </div>
      ))}
    </div>
  );
}

/**
 * Placeholder de grid de estatísticas (4 cards lado a lado).
 */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800/30 rounded-3xl p-4 space-y-3 border border-gray-200 dark:border-gray-700/30"
        >
          <div className={`${BASE_CLASSES} h-8 w-8 rounded-lg`} />
          <SkeletonTitle className="w-1/2" />
          <SkeletonText className="w-3/4" />
        </div>
      ))}
    </div>
  );
}