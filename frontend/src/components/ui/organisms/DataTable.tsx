/**
 * @file DataTable.tsx
 * @description Componente de tabela de dados do Design System.
 * 
 * Totalmente tipado com genéricos. Aceita qualquer tipo de dados.
 * 
 * @example
 * <DataTable
 *   columns={[
 *     { key: 'nome', label: 'Nome' },
 *     { key: 'email', label: 'Email', render: (u) => <Badge>{u.email}</Badge> },
 *   ]}
 *   data={usuarios}
 * />
 */

import React from 'react';
import { Spinner } from '../atoms/Spinner';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

/** Definição de uma coluna */
interface Column<T> {
  /** Chave do objeto T a ser exibida (opcional se usar render) */
  key?: keyof T;
  /** Rótulo do cabeçalho */
  label: string;
  /** Função de renderização customizada */
  render?: (item: T, index: number) => React.ReactNode;
  /** Alinhamento da coluna */
  align?: 'left' | 'center' | 'right';
  /** Classes adicionais para a coluna */
  className?: string;
  /** Responsividade: esconde em telas menores que o breakpoint */
  responsive?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DataTableProps<T> {
  /** Definição das colunas */
  columns: Column<T>[];
  /** Dados tipados */
  data: T[];
  /** Estado de carregamento */
  loading?: boolean;
  /** Mensagem de estado vazio */
  emptyMessage?: string;
  /** Mensagem de erro */
  error?: string;
  /** Classes adicionais */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const RESPONSIVE_CLASSES: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

const ALIGN_CLASSES: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/* ═══════════════════════════════════════════════════════════════
   Subcomponentes
   ═══════════════════════════════════════════════════════════════ */

function EmptyState({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Componente Principal (Genérico)
   ═══════════════════════════════════════════════════════════════ */

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado.',
  error,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {columns.map((col) => (
              <th
                key={String(col.key ?? col.label)}
                className={`
                  px-4 py-3 font-semibold text-gray-700 dark:text-gray-300
                  ${ALIGN_CLASSES[col.align || 'left']}
                  ${col.responsive ? RESPONSIVE_CLASSES[col.responsive] : ''}
                  ${col.className || ''}
                `.replace(/\s+/g, ' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <Spinner size="lg" variant="primary" className="mx-auto" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <EmptyState colSpan={columns.length} message={emptyMessage} />
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {columns.map((col) => {
                  const value = col.render
                    ? col.render(item, index)
                    : col.key
                      ? String(item[col.key] ?? '-')
                      : '-';

                  return (
                    <td
                      key={String(col.key ?? col.label)}
                      className={`
                        px-4 py-3 text-gray-700 dark:text-gray-300
                        ${ALIGN_CLASSES[col.align || 'left']}
                        ${col.responsive ? RESPONSIVE_CLASSES[col.responsive] : ''}
                        ${col.className || ''}
                      `.replace(/\s+/g, ' ')}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}