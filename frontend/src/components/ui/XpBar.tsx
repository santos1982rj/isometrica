import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XpBarProps {
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
  titulo: string;
  streak: number;
}

const XpBar: React.FC<XpBarProps> = ({ nivel, xpAtual, xpProximoNivel, titulo, streak }) => {
  const porcentagem = Math.min((xpAtual / xpProximoNivel) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            Nível {nivel}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {titulo}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
              🔥 {streak} dias
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {xpAtual} / {xpProximoNivel} XP
          </span>
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentagem}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
        />
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <Zap size={12} className="text-amber-500" />
        <span>{xpProximoNivel - xpAtual} XP para o próximo nível</span>
      </div>
    </div>
  );
};

export default XpBar;