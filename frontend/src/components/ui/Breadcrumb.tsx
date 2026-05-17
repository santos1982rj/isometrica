/**
 * @file Breadcrumb.tsx
 * @description Componente de breadcrumb (navegação estrutural).
 * 
 * Exibe o caminho hierárquico da página atual e permite navegação rápida.
 * Segue o padrão WAI-ARIA para acessibilidade.
 * 
 * @example
 * // Uso básico
 * <Breadcrumb items={[
 *   { label: 'Dashboard', path: '/' },
 *   { label: 'Perfil', path: '/perfil' },
 * ]} />
 * 
 * @example
 * // Com ícones
 * <Breadcrumb items={[
 *   { label: 'Dashboard', path: '/', icon: LayoutDashboard },
 *   { label: 'Configurações' }, // item atual (sem link)
 * ]} />
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

/** Item individual do breadcrumb */
export interface BreadcrumbItem {
  /** Rótulo exibido */
  label: string;
  /** Caminho da rota (opcional: omitir no item atual) */
  path?: string;
  /** Ícone opcional */
  icon?: React.FC<{ size?: number; className?: string }>;
}

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

/**
 * Breadcrumb acessível com suporte a ícones e dark mode.
 * 
 * @param items - Array de itens do breadcrumb (do mais geral ao mais específico)
 * @param className - Classes CSS adicionais (opcional)
 */
export function Breadcrumb({
  items,
  className = '',
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separador (exceto no primeiro item) */}
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {/* Item (link ou texto) */}
              {isLast || !item.path ? (
                /* ─── Item atual (sem link) ────────────────── */
                <span
                  className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {IconComponent && (
                    <IconComponent size={14} className="text-primary-500 flex-shrink-0" />
                  )}
                  {item.label}
                </span>
              ) : (
                /* ─── Item com link ────────────────────────── */
                <Link
                  to={item.path}
                  className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate max-w-[200px] interactive"
                >
                  {IconComponent && (
                    <IconComponent size={14} className="flex-shrink-0" />
                  )}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb automático baseado no pathname atual.
 * 
 * Gera os itens a partir de um mapa de rotas pré-definido.
 * Ideal para uso no layout do dashboard.
 * 
 * @param pathname - Caminho atual (ex: '/perfil')
 * @param routeMap - Mapa de rotas com labels e ícones
 * 
 * @example
 * <AutoBreadcrumb
 *   pathname="/clientes/detalhes/123"
 *   routeMap={{
 *     '/': { label: 'Visão Geral', icon: LayoutDashboard },
 *     '/clientes': { label: 'Clientes', icon: Users },
 *     '/perfil': { label: 'Perfil', icon: User },
 *   }}
 * />
 */

export function AutoBreadcrumb({
  pathname,
  routeMap,
}: {
  pathname: string;
  routeMap: Record<string, { label: string; icon?: React.FC<{ size?: number }> }>;
}) {
  // Divide o caminho em segmentos
  const segments = pathname.split('/').filter(Boolean);

  // Constrói os itens do breadcrumb acumulando os paths
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', path: '/', icon: Home },
  ];

  let accumulatedPath = '';
  segments.forEach((segment) => {
    accumulatedPath += `/${segment}`;
    const route = routeMap[accumulatedPath];

    if (route) {
      items.push({
        label: route.label,
        path: accumulatedPath,
        icon: route.icon,
      });
    }
  });

  return <Breadcrumb items={items} />;
}