/**
 * @file ConfigPage.tsx
 * @description Página de configurações do usuário refatorada com Design System.
 * 
 * @route /configuracoes
 * @see useTheme: src/contexts/useTheme.ts
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Keyboard } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { Badge } from '../components/ui/atoms/Badge';
import { useTheme } from '../contexts/useTheme';

const ConfigPage: React.FC = () => {
  const { isDark, alternarTema } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Monitor size={28} className="text-primary-500" />
          Configurações
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Personalize sua experiência na plataforma
        </p>
      </div>

      {/* Aparência */}
      <GlassPanel className="p-6!" glow>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Monitor size={20} />
          Aparência
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Escolha o tema da interface
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => isDark && alternarTema()}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center
              ${!isDark
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <Sun size={24} className={`mx-auto mb-2 ${!isDark ? 'text-primary-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${!isDark ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Claro
            </span>
          </button>

          <button
            onClick={() => !isDark && alternarTema()}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center
              ${isDark
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            <Moon size={24} className={`mx-auto mb-2 ${isDark ? 'text-primary-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Escuro
            </span>
          </button>

          <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center opacity-50 cursor-not-allowed">
            <Monitor size={24} className="mx-auto mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Sistema</span>
            <span className="block text-[10px] text-gray-400 mt-1">Em breve</span>
          </div>
        </div>
      </GlassPanel>

      {/* Atalhos de Teclado */}
      <GlassPanel className="p-6!" glow>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Keyboard size={20} />
          Atalhos de Teclado
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Combinações de teclas para agilizar sua navegação
        </p>

        <div className="space-y-2">
          {[
            { keys: ['Ctrl', 'K'], description: 'Abrir busca rápida' },
            { keys: ['Ctrl', 'D'], description: 'Alternar modo escuro (em breve)' },
            { keys: ['Ctrl', 'P'], description: 'Ir para o Perfil (em breve)' },
            { keys: ['Ctrl', 'H'], description: 'Ir para o Dashboard (em breve)' },
            { keys: ['Esc'], description: 'Fechar modais e menus' },
          ].map((atalho) => (
            <div
              key={atalho.description}
              className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {atalho.description}
              </span>
              <div className="flex items-center gap-1">
                {atalho.keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 font-mono border border-gray-200 dark:border-gray-600">
                      {key}
                    </kbd>
                    {i < atalho.keys.length - 1 && (
                      <span className="text-xs text-gray-400">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Sobre */}
      <GlassPanel className="p-6!" glow>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sobre
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong className="text-gray-900 dark:text-white">Nó na Armadura</strong> v1.0.0
          </p>
          <p>
            Plataforma educacional gratuita para dimensionamento de estruturas
            de concreto armado conforme a NBR 6118:2023.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="success">React 19</Badge>
            <Badge variant="info">Tailwind v4</Badge>
            <Badge variant="warning">Prisma 7</Badge>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export default ConfigPage;