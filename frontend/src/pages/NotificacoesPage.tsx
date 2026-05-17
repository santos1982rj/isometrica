/**
 * @file NotificacoesPage.tsx
 * @description Página de notificações refatorada com Design System.
 * 
 * Utiliza GlassPanel e Badge para exibir notificações com tipos
 * e ações de marcar como lida.
 * 
 * @route /notificacoes
 * @see useNotificacoesStore: src/stores/notificacoesStore.ts
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Check, Info, Trophy, Settings, Clock } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { Badge } from '../components/ui/atoms/Badge';
import { Button } from '../components/ui/atoms/Button';
import { useNotificacoesStore } from '../stores/notificacoesStore';
import { useAuth } from '../contexts/useAuth';
import { type Notificacao } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const ICONE_MAPA: Record<Notificacao['tipo'], React.FC<{ size?: number; className?: string }>> = {
  info: Info,
  conquista: Trophy,
  sistema: Settings,
  lembrete: Clock,
};

const COR_MAPA: Record<Notificacao['tipo'], string> = {
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  conquista: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  sistema: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  lembrete: 'text-green-500 bg-green-100 dark:bg-green-900/30',
};

function tempoRelativo(dataISO: string): string {
  const agora = Date.now();
  const data = new Date(dataISO).getTime();
  const diffMin = Math.floor((agora - data) / 60000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Há ${diffHoras} h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ontem';
  return `Há ${diffDias} dias`;
}

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const NotificacoesPage: React.FC = () => {
  const { token } = useAuth();
  const { notificacoes, naoLidas, loading, carregar, marcarComoLida, marcarTodasComoLidas } = useNotificacoesStore();

  useEffect(() => {
    if (token) carregar(token);
  }, [token, carregar]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={28} className="text-primary-500" />
            Notificações
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {naoLidas > 0 ? (
              <Badge variant="danger" size="sm">{naoLidas} não lida{naoLidas !== 1 ? 's' : ''}</Badge>
            ) : (
              'Todas lidas'
            )}
          </p>
        </div>

        {naoLidas > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={Check}
            onClick={marcarTodasComoLidas}
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Lista de Notificações */}
      {notificacoes.length === 0 ? (
        <GlassPanel className="p-8! text-center">
          <BellOff size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nenhuma notificação
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Você está em dia!
          </p>
        </GlassPanel>
      ) : (
        <div className="space-y-2">
          {notificacoes.map((notif, index) => {
            const Icone = ICONE_MAPA[notif.tipo];
            const cor = COR_MAPA[notif.tipo];

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div onClick={() => marcarComoLida(notif.id)} className="cursor-pointer">
                  <GlassPanel
                    className={`p-4! interactive transition-all duration-300 ${!notif.lida ? 'ring-2 ring-primary-500/30' : 'opacity-70'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${cor} shrink-0`}>
                        <Icone size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {notif.titulo}
                          </h3>
                          {!notif.lida && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notif.mensagem}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                        {tempoRelativo(notif.data)}
                      </span>
                    </div>
                  </GlassPanel>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default NotificacoesPage;