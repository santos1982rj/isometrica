'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useGamification, useLeaderboard, useXpHistory } from '@/lib/queries'
import { TrendingUp, Star, Flame, Trophy, Crown, CheckCircle, Play, FileCheck, Target, type LucideIcon } from 'lucide-react'
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

function getLevelColor(level: number) {
  if (level >= 20) return 'from-purple-500 to-pink-500'
  if (level >= 10) return 'from-isometrica-accent to-orange-400'
  if (level >= 5) return 'from-isometrica-info to-blue-400'
  return 'from-isometrica-primary to-isometrica-accent'
}

export default function GamificacaoPage() {
  const { usuario } = useAuth()
  const { data: profileData, isLoading: carregando } = useGamification(usuario?.id ?? '')
  const { data: leaderboard = [] } = useLeaderboard()
  const { data: xpHistoryData = [] } = useXpHistory(usuario?.id ?? '')

  const xp = profileData?.xp ?? 0
  const level = profileData?.level ?? 0
  const streak = profileData?.streak ?? 0
  const achievementsCount = profileData?.achievements?.length ?? 0
  const completedMissions = (profileData?.missions ?? []).filter((m) => m.progress >= m.target).length
  const totalMissions = profileData?.missions?.length ?? 0

  const nextLevelXp = level > 0 ? 100 * level * (level + 1) / 2 : 100
  const currentLevelXp = level > 1 ? 100 * (level - 1) * level / 2 : 0
  const xpProgress = nextLevelXp > currentLevelXp ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0

  const rankingData = leaderboard.map((entry, i) => ({
    pos: i + 1,
    name: entry.name ?? 'Anônimo',
    level: entry.level,
    xp: entry.xp,
    isMe: entry.userId === usuario?.id,
  }))

  const iconMap: Record<string, LucideIcon> = {
    Star, Flame, Trophy, Crown, CheckCircle, Play, FileCheck, TrendingUp,
  }

  const xpHistoryItems = xpHistoryData.map((entry) => ({
    icon: TrendingUp,
    action: entry.action,
    time: new Date(entry.date).toLocaleDateString('pt-BR'),
    xp: entry.xp,
  }))

  const achievements = (profileData?.achievements ?? []).map((a) => ({
    name: a.name,
    desc: a.description ?? '',
    icon: iconMap[a.icon as string] ?? Star,
    unlocked: true,
  }))

  const missions = (profileData?.missions ?? []).map((m) => ({
    name: m.name,
    desc: m.description ?? '',
    icon: Target,
    progress: m.progress,
    target: m.target,
    xpReward: 50,
  }))

  if (carregando) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={itemAnim}>
          <h1 className="font-display text-2xl font-bold">Gamificação</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Acompanhe suas conquistas, missões e progresso</p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
          <div className="bento-card rounded-xl border border-border bg-card p-6 lg:col-span-1 animate-pulse">
            <div className="mx-auto mb-3 size-20 rounded-2xl bg-muted" />
            <div className="mx-auto h-6 w-24 rounded bg-muted" />
            <div className="mx-auto mt-1 h-4 w-16 rounded bg-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-12 rounded-lg bg-muted" />
              <div className="h-2.5 rounded-full bg-muted" />
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bento-card rounded-xl border border-border bg-card p-5 animate-pulse">
                <div className="mx-auto mb-3 size-10 rounded-xl bg-muted" />
                <div className="mx-auto h-6 w-16 rounded bg-muted" />
                <div className="mx-auto mt-1 h-3 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card rounded-xl border border-border bg-card p-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 bento-card rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="bento-card rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemAnim}>
        <h1 className="font-display text-2xl font-bold">Gamificação</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Acompanhe suas conquistas, missões e progresso</p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
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
                {Math.round(Math.max(nextLevelXp - xp, 0)).toLocaleString()} XP para o próximo nível
              </p>
            </div>
          </div>
        </motion.div>

        <StreakCards
          streak={streak}
          achievements={achievementsCount}
          missions={completedMissions}
          totalAchievements={achievementsCount}
          totalMissions={totalMissions}
        />
      </div>

      <NarrativeCard streak={streak} level={level} />

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
        <AchievementsGrid achievements={achievements} unlockedAchievements={profileData?.achievements ?? []} />
        <MissionsList missions={missions} />
      </div>

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
        <XpTimeline xpHistory={xpHistoryItems} />
        <RankingList ranking={rankingData} />
      </div>
    </motion.div>
  )
}
