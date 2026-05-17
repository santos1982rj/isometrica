/**
 * @file DashboardHome.tsx
 * @description Dashboard principal com métricas, atividades e barra de XP.
 * Refatorado com Design System: Button, Badge, GlassPanel, XpBar.
 * 
 * @route /dashboard
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../components/ui/GlassPanel';
import XpBar from '../components/ui/XpBar';
import { Button } from '../components/ui/atoms/Button';
import { Badge } from '../components/ui/atoms/Badge';
import { SkeletonStats, SkeletonTable } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/useAuth';
import { useGamificacaoStore } from '../stores/gamificacaoStore';
import {
  fetchDashboard,
  fetchAtividades,
  type DashboardData,
  type Atividade,
} from '../services/api';
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  Activity,
  ArrowUp,
  BookOpen,
  GraduationCap,
  BarChart3,
  Plus,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

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

function iconeAtividade(tipo: string): string {
  const mapa: Record<string, string> = {
    login: '🔑',
    perfil: '👤',
    calculo: '📐',
    exercicio: '📝',
    curso: '📚',
  };
  return mapa[tipo] || '📌';
}

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const DashboardHome: React.FC = () => {
  const { usuario, token } = useAuth();
  const { dados: gamificacao, carregar: carregarGamificacao } = useGamificacaoStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) return;

    async function carregarDados(): Promise<void> {
      try {
        const [dadosDashboard, dadosAtividades] = await Promise.all([
          fetchDashboard(token!),
          fetchAtividades(token!),
        ]);
        setDashboard(dadosDashboard);
        setAtividades(dadosAtividades.atividades);
        await carregarGamificacao(token!);
      } catch {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [token, carregarGamificacao]);

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonTable />
          </div>
          <SkeletonStats />
        </div>
      </div>
    );
  }

  const stats = dashboard?.estatisticas;
  const role = usuario?.role || 'ALUNO';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ─── Cabeçalho ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Bem-vindo, {usuario?.nome?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Badge
              variant={
                role === 'ADMIN' ? 'danger' : role === 'PROFESSOR' ? 'warning' : 'info'
              }
              size="sm"
            >
              {role === 'ADMIN' ? 'Administrador' : role === 'PROFESSOR' ? 'Professor' : 'Aluno'}
            </Badge>
            Aqui está o resumo da sua jornada.
          </p>
        </div>

        <div className="flex gap-2">
          {(role === 'PROFESSOR' || role === 'ADMIN') && (
            <Link to="/admin/cursos/novo">
              <Button variant="primary" icon={Plus}>
                Novo Curso
              </Button>
            </Link>
          )}
          <Link to="/cursos">
            <Button variant="secondary" icon={BookOpen}>
              Ver Cursos
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Barra de XP ────────────────────────────────────── */}
      {gamificacao && (
        <GlassPanel className="p-4!" glow>
          <XpBar
            nivel={gamificacao.usuario.nivel}
            xpAtual={gamificacao.usuario.xpAtual}
            xpProximoNivel={gamificacao.usuario.xpProximoNivel}
            titulo={gamificacao.usuario.titulo}
            streak={gamificacao.usuario.streak}
          />
        </GlassPanel>
      )}

      {/* ─── Cards de Estatísticas ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Usuários Ativos', value: stats?.usuariosAtivos || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Seus Cálculos', value: stats?.calculosRealizados || 0, icon: TrendingUp, color: 'text-primary-500' },
          { label: 'Exercícios', value: stats?.exerciciosResolvidos || 0, icon: Award, color: 'text-green-500' },
          { label: 'Horas Estudo', value: `${stats?.horasEstudo || 0}h`, icon: Clock, color: 'text-purple-500' },
          { label: 'Pontuação', value: stats?.pontuacao || 0, icon: ArrowUp, color: 'text-amber-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <GlassPanel className="p-4!" glow>
                <Icon size={22} className={`mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('pt-BR') : stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Cards de Admin ──────────────────────────────────── */}
      {role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Cursos', value: '3', icon: BookOpen, color: 'text-indigo-500' },
            { label: 'Total de Alunos', value: stats?.usuariosAtivos || 0, icon: Users, color: 'text-green-500' },
            { label: 'Taxa de Conclusão', value: '67%', icon: BarChart3, color: 'text-purple-500' },
            { label: 'Receita Total', value: 'R$ 224,00', icon: TrendingUp, color: 'text-amber-500' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              >
                <GlassPanel className="p-4!" glow>
                  <Icon size={22} className={`mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Cards de Professor/Admin ────────────────────────── */}
      {(role === 'PROFESSOR' || role === 'ADMIN') && (
        <GlassPanel className="p-6!" glow>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={22} className="text-primary-500" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/cursos/novo" className="block group">
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all cursor-pointer">
                <Plus size={24} className="text-primary-500 mb-2" />
                <p className="font-semibold text-primary-700 dark:text-primary-400">Criar Curso</p>
                <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1">Adicione um novo curso à plataforma</p>
              </div>
            </Link>
            <Link to="/admin/cursos" className="block group">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all cursor-pointer">
                <BookOpen size={24} className="text-purple-500 mb-2" />
                <p className="font-semibold text-purple-700 dark:text-purple-400">Meus Cursos</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Gerencie seus cursos e aulas</p>
              </div>
            </Link>
            <Link to="/cursos" className="block group">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all cursor-pointer">
                <GraduationCap size={24} className="text-green-500 mb-2" />
                <p className="font-semibold text-green-700 dark:text-green-400">Catálogo</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Visualize o catálogo de cursos</p>
              </div>
            </Link>
          </div>
        </GlassPanel>
      )}

      {/* ─── Atividades Recentes + Resumo ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="lg:col-span-2 p-6!" glow>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={22} className="text-primary-500" />
            Atividades Recentes
          </h2>
          {atividades.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma atividade recente.</p>
          ) : (
            <div className="space-y-2">
              {atividades.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <span className="text-xl shrink-0">{iconeAtividade(atividade.tipo)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{atividade.descricao}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{tempoRelativo(atividade.data)}</span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        {/* Resumo */}
        <GlassPanel className="p-6!" glow>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumo</h2>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Dias ativo</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats?.diasAtivo || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Próxima meta</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {role === 'ADMIN' ? 'Alcançar 100 usuários' : role === 'PROFESSOR' ? 'Criar 5 cursos' : 'Completar 5 cálculos'}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((stats?.calculosRealizados || 0) / 5) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-amber-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats?.calculosRealizados || 0} de 5 concluídos</p>
            </div>
            {gamificacao && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">Seu nível</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{gamificacao.usuario.nivel}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{gamificacao.usuario.titulo}</p>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
};

export default DashboardHome;