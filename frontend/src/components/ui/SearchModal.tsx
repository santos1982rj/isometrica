/**
 * @file SearchModal.tsx
 * @description Modal de busca/comando estilo Spotlight (⌘K / Ctrl+K).
 * 
 * Inspirado no Apple Spotlight e no cmdk do Vercel.
 * Permite navegação rápida por teclado para qualquer página do sistema.
 * 
 * Atalho: Ctrl+K (Windows/Linux) ou ⌘K (Mac)
 * 
 * @see https://cmdk.paco.me
 * 
 * @example
 * // No layout principal:
 * <SearchModal />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  User,
  Settings,
  Search,
  ArrowRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Itens disponíveis na busca rápida */
const SEARCH_ITEMS = [
  {
    id: 'dashboard',
    label: 'Visão Geral',
    description: 'Dashboard principal com métricas',
    path: '/',
    icon: LayoutDashboard,
    category: 'Navegação',
  },
  {
    id: 'vendas',
    label: 'Vendas',
    description: 'Relatórios e métricas de vendas',
    path: '/vendas',
    icon: TrendingUp,
    category: 'Navegação',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    description: 'Gerenciamento de clientes',
    path: '/clientes',
    icon: Users,
    category: 'Navegação',
  },
  {
    id: 'perfil',
    label: 'Meu Perfil',
    description: 'Editar informações pessoais',
    path: '/perfil',
    icon: User,
    category: 'Navegação',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    description: 'Preferências do sistema',
    path: '/configuracoes',
    icon: Settings,
    category: 'Navegação',
  },
];

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

/**
 * Modal de busca/comando ativado por Ctrl+K.
 * 
 * Funcionalidades:
 * - Navegação por teclado (↑↓ para mover, Enter para selecionar, Esc para fechar)
 * - Busca por texto (filtra por label e description)
 * - Agrupamento por categorias
 * - Animações de entrada/saída
 */
const SearchModal: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Abre o modal ao pressionar Ctrl+K (ou ⌘K no Mac).
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  // Registra o listener de teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Navega para a rota selecionada e fecha o modal.
   */
  function handleSelect(path: string): void {
    navigate(path);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal de busca */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
          >
            <Command
              className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                         border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra de busca */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <Command.Input
                  placeholder="Buscar páginas, comandos..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white 
                             placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  autoFocus
                />
                {/* Tecla de atalho */}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md 
                                  bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 
                                  font-mono border border-gray-200 dark:border-gray-600">
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>K</span>
                </kbd>
              </div>

              {/* Lista de resultados */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                {/* Estado vazio */}
                <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Nenhum resultado encontrado.
                </Command.Empty>

                {/* Grupos de itens */}
                <Command.Group
                  heading="Navegação"
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1.5 
                             uppercase tracking-wider [&[hidden]]:hidden"
                >
                  {SEARCH_ITEMS.map((item) => {
                    const IconComponent = item.icon;

                    return (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.description}`}
                        onSelect={() => handleSelect(item.path)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                                   text-gray-700 dark:text-gray-300 cursor-pointer
                                   data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-900/20
                                   data-[selected=true]:text-primary-600 dark:data-[selected=true]:text-primary-400
                                   transition-colors duration-100"
                      >
                        <IconComponent size={18} className="flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="flex-shrink-0 text-gray-400 opacity-0 
                                     group-data-[selected=true]:opacity-100 transition-opacity"
                        />
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>

              {/* Rodapé com dicas */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-gray-700 
                              text-xs text-gray-400 dark:text-gray-500">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono">↑↓</kbd> Navegar
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono">Enter</kbd> Selecionar
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono">Esc</kbd> Fechar
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;