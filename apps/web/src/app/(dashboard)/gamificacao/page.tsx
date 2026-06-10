'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useGamification } from '@/lib/queries'
import type { Conquista, Missao } from '@/lib/types'
import {
  Flame,
  Trophy,
  Target,
  Zap,
  Crown,
  BookOpen,
  Brain,
  Clock,
  PersonStanding,
  Moon,
  Ruler,
  Lightbulb,
  Building,
  TriangleAlert,
  RefreshCw,
} from 'lucide-react'
import { StreakCards } from '@/components/gamificacao/streak-cards'
import { NarrativeCard } from '@/components/gamificacao/narrative-card'
import { AchievementsGrid } from '@/components/gamificacao/achievements-grid'
import { MissionsList } from '@/components/gamificacao/missions-list'
import { XpTimeline } from '@/components/gamificacao/xp-timeline'
import { RankingList } from '@/components/gamificacao/ranking-list'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const achievementsList = [
  { name: 'Primeiro Passo', desc: 'Complete sua primeira aula', icon: Target, unlocked: true },
  { name: 'Três dias seguidos', desc: 'Estude por 3 dias consecutivos', icon: Flame, unlocked: true },
  { name: 'Maratonista', desc: '7 dias consecutivos de estudo', icon: PersonStanding, unlocked: true },
  { name: 'Mestre das Questões', desc: 'Responda 100 questões', icon: BookOpen, unlocked: false, progress: 67, target: 100 },
  { name: 'Lenda', desc: '30 dias consecutivos', icon: Crown, unlocked: false, progress: 7, target: 30 },
  { name: 'Colecionador', desc: 'Desbloqueie 10 conquistas', icon: Trophy, unlocked: false, progress: 3, target: 10 },
  { name: 'Calculista', desc: '100% em Cálculo III', icon: Ruler, unlocked: false, progress: 82, target: 100 },
  { name: 'Engenheiro Noturno', desc: 'Estude após as 22h por 5 dias', icon: Moon, unlocked: false, progress: 2, target: 5 },
  { name: 'Velocista', desc: 'Responda 10 questões em 5 minutos', icon: Zap, unlocked: false, progress: 6, target: 10 },
  { name: 'Mentor', desc: 'Ajude 3 colegas no tutor IA', icon: Lightbulb, unlocked: false, progress: 1, target: 3 },
  { name: 'Dedicação Total', desc: 'Complete 50 aulas', icon: BookOpen, unlocked: false, progress: 18, target: 50 },
  { name: 'Construtor', desc: 'Finalize um curso completo', icon: Building, unlocked: false, progress: 1, target: 4 },
]

const mockMissions = [
  { name: 'Canteiro de Obras', desc: 'Responda 10 questões de Resistência dos Materiais', icon: TriangleAlert, progress: 8, target: 10, xpReward: 200 },
  { name: 'Mestre das Fórmulas', desc: 'Complete 4 aulas de Cálculo III', icon: Ruler, progress: 3, target: 4, xpReward: 150 },
  { name: 'Desafio Diário', desc: 'Estude por 30 minutos hoje', icon: Clock, progress: 22, target: 30, xpReward: 50 },
  { name: 'Revisão Geral', desc: 'Acerte 5 questões seguidas de Concreto Armado', icon: RefreshCw, progress: 3, target: 5, xpReward: 100 },
]

const xpHistory = [
  { action: 'Aula concluída: Diagrama de Momento Fletor', xp: 50, time: 'Há 2 horas', icon: BookOpen },
  { action: 'Acertou questão de Derivadas Parciais', xp: 10, time: 'Há 3 horas', icon: Brain },
  { action: 'Acertou questão de Tensão Normal', xp: 10, time: 'Há 4 horas', icon: Brain },
  { action: 'Streak atualizado: 7 dias', xp: 0, time: 'Há 5 horas', icon: Flame },
  { action: 'Aula concluída: Propriedades do Concreto', xp: 50, time: 'Ontem', icon: BookOpen },
]

const rankingData = [
  { pos: 1, name: 'Ana Oliveira', xp: 8450, level: 15 },
  { pos: 2, name: 'Carlos Mendes', xp: 6720, level: 13 },
  { pos: 3, name: 'Você', xp: 2450, level: 8, isMe: true },
  { pos: 4, name: 'Lucas Silva', xp: 2100, level: 7 },
  { pos: 5, name: 'Maria Costa', xp: 1890, level: 6 },
]

function getLevelColor(level: number) {
  if (level >= 20) return 'from-purple-500 to-pink-500'
  if (level >= 10) return 'from-isometrica-accent to-orange-400'
  if (level >= 5) return 'from-isometrica-info to-blue-400'
  return 'from-isometrica-primary to-isometrica-accent'
}

export default function GamificacaoPage() {
  const { usuario } = useAuth()
  const { data: profileData, isLoading: carregando } = useGamification(usuario?.id ?? '')

  const xp = profileData?.xp ?? 2450
  const level = profileData?.level ?? 8
  const streak = profileData?.streak ?? 7
  const achievements: { name: string }[] = profileData?.achievements ?? achievementsList.filter(a => a.unlocked)
  const missions: { progress: number; target: number }[] = profileData?.missions ?? mockMissions

  const nextLevelXp = 100 * level * (level + 1) / 2
  const currentLevelXp = 100 * (level - 1) * level / 2
  const xpProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemAnim}>
        <h1 className="font-display text-2xl font-bold">Gamificação</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Acompanhe suas conquistas, missões e progresso</p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="bento-card relative overflow-hidden rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(level)} opacity-5`} />
          <div className="relative z-10 text-center">
            <div className={`mx-auto mb-3 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${getLevelColor(level)} shadow-lg`}>
              <span className="font-display text-3xl font-extrabold text-white">{level}</span>
            </div>
            <h2 className="font-display text-xl font-bold">Nível {level}</h2>
            <p className="text-xs text-muted-foreground">
              {xp.toLocaleString()} XP
            </p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Próximo nível</span>
                <span className="font-medium tabular-nums">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(level)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {Math.round(nextLevelXp - xp).toLocaleString()} XP para o próximo nível
              </p>
            </div>
          </div>
        </motion.div>

        <StreakCards
          streak={streak}
          achievements={achievements.length}
          missions={missions.filter((m) => m.progress >= m.target).length}
          totalAchievements={achievementsList.length}
          totalMissions={missions.length}
        />
      </div>

      <NarrativeCard streak={streak} level={level} />

      <div className="grid gap-5 lg:grid-cols-3">
        <AchievementsGrid achievements={achievementsList} unlockedAchievements={achievements} />
        <MissionsList missions={mockMissions} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <XpTimeline xpHistory={xpHistory} />
        <RankingList ranking={rankingData} />
      </div>
    </motion.div>
  )
}
