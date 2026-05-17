/**
 * @file Modal.tsx
 * @description Componente de modal (diálogo) do Design System.
 * 
 * Encapsula overlay, painel, animações e acessibilidade.
 * 
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirmar">
 *   <p>Tem certeza?</p>
 *   <div className="flex gap-2 mt-4">
 *     <Button variant="danger">Sim, excluir</Button>
 *     <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
 *   </div>
 * </Modal>
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  /** Controla a visibilidade do modal */
  isOpen: boolean;
  /** Função chamada ao fechar (overlay, botão X, tecla Escape) */
  onClose: () => void;
  /** Título do modal */
  title?: string;
  /** Tamanho do modal */
  size?: ModalSize;
  /** Conteúdo do modal (corpo e ações) */
  children: React.ReactNode;
  /** Classes adicionais para o painel */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Mapeamento de Tamanhos
   ═══════════════════════════════════════════════════════════════ */

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fecha ao pressionar Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Retorna foco ao elemento que abriu o modal ao fechar
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Painel do Modal */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            className={`
              relative w-full ${SIZE_CLASSES[size]}
              bg-white dark:bg-gray-800
              rounded-2xl shadow-xl
              border border-gray-200 dark:border-gray-700
              focus:outline-none
              ${className}
            `.replace(/\s+/g, ' ')}
          >
            {/* Cabeçalho */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Fechar modal"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Corpo */}
            <div className="px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}