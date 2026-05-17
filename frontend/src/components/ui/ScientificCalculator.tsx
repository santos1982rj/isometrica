/**
 * @file ScientificCalculator.tsx
 * @description Calculadora científica flutuante integrada à plataforma.
 * 
 * Funcionalidades: operações básicas, trigonométricas, logarítmicas,
 * constantes (π, e), memória e histórico.
 * 
 * Atalho: Ctrl+Shift+C
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Constantes ────────────────────────────────────── */
const BUTTONS = [
  ['Rad', 'Deg', 'MC', 'MR', 'M+', 'M-'],
  ['sen', 'cos', 'tan', '√', 'x²', '%'],
  ['log', 'ln', 'eˣ', '10ˣ', 'π', 'e'],
  ['7', '8', '9', 'DEL', 'AC'],
  ['4', '5', '6', '×', '÷'],
  ['1', '2', '3', '+', '-'],
  ['0', '.', '(', ')', '='],
];

const SCIENTIFIC_FUNCTIONS: Record<string, (x: number) => number> = {
  sen: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  'eˣ': (x) => Math.exp(x),
  '10ˣ': (x) => Math.pow(10, x),
  '√': (x) => Math.sqrt(x),
  'x²': (x) => Math.pow(x, 2),
};

/* ─── Componente ────────────────────────────────────── */
const ScientificCalculator: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);

  const evaluate = useCallback((expression: string): string => {
    try {
      const exp = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/(?<!\w)e(?!\w)/g, String(Math.E));
      
      const result = Function(`"use strict"; return (${exp})`)();
      const formatted = Number.isInteger(result) ? String(result) : result.toFixed(6);
      setHistory(prev => [...prev.slice(-9), `${expression} = ${formatted}`]);
      return formatted;
    } catch {
      return 'Erro';
    }
  }, []);

  const handleClick = useCallback((btn: string) => {
    setDisplay(prev => {
      if (btn === 'AC') return '0';
      if (btn === 'DEL') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (btn === '=') return evaluate(prev);
      
      // Funções científicas
      if (SCIENTIFIC_FUNCTIONS[btn]) {
        const num = parseFloat(prev);
        if (isNaN(num)) return prev;
        let angle = num;
        if (!isRad && ['sen', 'cos', 'tan'].includes(btn)) {
          angle = num * Math.PI / 180;
        }
        return String(SCIENTIFIC_FUNCTIONS[btn](angle));
      }
      
      // Constantes
      if (btn === 'π') return prev === '0' ? 'π' : prev + 'π';
      if (btn === 'e') return prev === '0' ? 'e' : prev + 'e';
      
      // Modo Rad/Deg
      if (btn === 'Rad' || btn === 'Deg') {
        setIsRad(btn === 'Rad');
        return prev;
      }
      
      // Memória
      if (btn === 'MC') { setMemory(0); return prev; }
      if (btn === 'MR') return String(memory);
      if (btn === 'M+') { setMemory(m => m + parseFloat(prev || '0')); return prev; }
      if (btn === 'M-') { setMemory(m => m - parseFloat(prev || '0')); return prev; }
      
      // Números e operadores
      if (prev === '0' && !isNaN(Number(btn))) return btn;
      return prev + btn;
    });
  }, [evaluate, memory, isRad]);

  const copyDisplay = () => {
    navigator.clipboard.writeText(display);
    toast.success('Valor copiado!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center text-white text-xs">fx</span>
                Calculadora {isRad ? '(RAD)' : '(DEG)'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <X size={16} />
              </button>
            </div>

            {/* Visor */}
            <div className="relative mb-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-right font-mono">
              <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{display}</p>
              <button onClick={copyDisplay} className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400">
                <Copy size={14} />
              </button>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-5 gap-1">
              {BUTTONS.flat().map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleClick(btn)}
                  className={`py-2 text-xs font-medium rounded-lg transition-colors
                    ${btn === '=' ? 'bg-primary-500 text-white hover:bg-primary-600 col-span-2' : ''}
                    ${['Rad', 'Deg', 'MC', 'MR', 'M+', 'M-', 'AC', 'DEL'].includes(btn)
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : ''}
                    ${['sen', 'cos', 'tan', 'log', 'ln', 'eˣ', '10ˣ', '√', 'x²'].includes(btn)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40'
                      : ''}
                    ${!['=', 'Rad', 'Deg', 'MC', 'MR', 'M+', 'M-', 'AC', 'DEL', 'sen', 'cos', 'tan', 'log', 'ln', 'eˣ', '10ˣ', '√', 'x²'].includes(btn)
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      : ''}
                  `}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Histórico */}
            {history.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Histórico</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {history.map((h, i) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400 font-mono">{h}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScientificCalculator;