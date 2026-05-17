/**
 * @file RankingPage.tsx
 * @description Página de ranking de usuários refatorada com Design System.
 * 
 * Utiliza GlassPanel, Badge, Button e DataTable.
 * 
 * @route /ranking
 * @see useGamificacaoStore: src/stores/gamificacaoStore.ts
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useAuth } from '../contexts/useAuth';
import { useGamificacaoStore } from '../stores/gamificacaoStore';
import { SkeletonTable } from '../components/ui/Skeleton';

function getIniciais(nome: string): string {
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function medalha(posicao: number) {
  if (posicao === 1) return <Trophy size={20} className="text-amber-400" />;
  if (posicao === 2) return <Medal size={20} className="text-gray-400" />;
  if (posicao === 3) return <Award size={20} className="text-amber-600" />;
  return <span className="text-sm font-bold text-gray-400">{posicao}º</span>;
}

const RankingPage: React.FC = () => {
  const { usuario, token } = useAuth();
  const { ranking, loading, carregarRanking } = useGamificacaoStore();

  useEffect(() => {
    if (token) carregarRanking(token);
  }, [token, carregarRanking]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <SkeletonTable rows={10} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy size={28} className="text-amber-500" />
          Ranking
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Top engenheiros da plataforma
        </p>
      </div>

      {/* Card da sua posição */}
      {ranking && (
        <GlassPanel className="p-4!" glow>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {getIniciais(usuario?.nome || '')}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Sua posição</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ranking.minhaPosicao}º lugar • Nível {usuario?.nivel || 1}
              </p>
            </div>
            <div className="text-3xl font-bold text-primary-500">
              #{ranking.minhaPosicao}
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Lista de ranking */}
      <GlassPanel className="p-4!" glow>
        <div className="space-y-2">
          {ranking?.ranking.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${user.id === usuario?.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
            >
              <div className="w-8 text-center">{medalha(user.posicao)}</div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {getIniciais(user.nome)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.nome}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nível {user.nivel} • {user.xpTotal.toLocaleString()} XP
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600 dark:text-primary-400">
                  {user.xpTotal.toLocaleString()} XP
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp size={10} />
                  {user.streak} dias
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export default RankingPage;