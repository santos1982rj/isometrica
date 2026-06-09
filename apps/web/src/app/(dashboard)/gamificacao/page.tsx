'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  Trophy,
  Target,
  Star,
  Zap,
  Medal,
  Crown,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Gift,
  Sparkles,
  TrendingUp,
  PersonStanding,
  Moon,
  Ruler,
  Lightbulb,
  Building,
  TriangleAlert,
  RefreshCw,
  Quote,
} from 'lucide-react'

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

function getLevelColor(level: number) {
  if (level >= 20) return 'from-purple-500 to-pink-500'
  if (level >= 10) return 'from-isometrica-accent to-orange-400'
  if (level >= 5) return 'from-isometrica-info to-blue-400'
  return 'from-isometrica-primary to-isometrica-accent'
}

export default function GamificacaoPage() {
  const { usuario } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) return
    api.gamification.perfil(usuario.id).then(setProfile).catch(console.error).finally(() => setCarregando(false))
  }, [usuario])

  const xp = profile?.xp ?? 2450
  const level = profile?.level ?? 8
  const streak = profile?.streak ?? 7
  const achievements = profile?.achievements ?? achievementsList.filter(a => a.unlocked)
  const missions = profile?.missions ?? mockMissions

  function getStreakNarrative(days: number) {
    if (days === 0) return { title: 'Hora de começar!', desc: 'Cada grande engenheiro começou com um primeiro passo. Que tal estudar hoje?', color: 'from-slate-400 to-slate-300' }
    if (days < 3) return { title: 'Primeiros passos', desc: 'A consistência é o alicerce de toda obra. Mantenha o ritmo!', color: 'from-isometrica-info to-blue-400' }
    if (days < 7) return { title: 'Ritmo de obra', desc: 'Três dias seguidos mostram disciplina de engenheiro. A fundação está firme.', color: 'from-isometrica-success to-emerald-400' }
    if (days < 14) return { title: 'Concreto curado', desc: 'Uma semana! Seu hábito já está mais resistente que concreto armado.', color: 'from-isometrica-accent to-orange-400' }
    if (days < 30) return { title: 'Estrutura metálica', desc: 'Duas semanas de consistência. Você já é referência de determinação.', color: 'from-purple-500 to-pink-500' }
    if (days < 60) return { title: 'Arranha-céu', desc: '30 dias! Você não está apenas estudando — está construindo um legado.', color: 'from-yellow-500 to-amber-400' }
    return { title: 'Monumento', desc: 'Mais de 60 dias de streak. Você é uma verdadeira obra-prima da engenharia.', color: 'from-isometrica-accent via-purple-500 to-pink-500' }
  }

  const narrative = getStreakNarrative(streak)

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

        <motion.div variants={itemAnim} className="lg:col-span-2">
          <div className="grid h-full grid-cols-3 gap-4">
            <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-accent/10">
                <Flame className="size-5 text-isometrica-accent" />
              </div>
              <p className="font-display text-2xl font-bold tabular-nums">{streak}</p>
              <p className="text-[10px] font-medium text-muted-foreground">Streak atual</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-isometrica-accent"><Flame className="size-3" /> Melhor: 12 dias</p>
            </div>
            <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-success/10">
                <Trophy className="size-5 text-isometrica-success" />
              </div>
              <p className="font-display text-2xl font-bold tabular-nums">{achievements.length}</p>
              <p className="text-[10px] font-medium text-muted-foreground">Conquistas</p>
              <p className="mt-1 text-[10px] text-muted-foreground">de {achievementsList.length} disponíveis</p>
            </div>
            <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-info/10">
                <Target className="size-5 text-isometrica-info" />
              </div>
              <p className="font-display text-2xl font-bold tabular-nums">{missions.filter((m: any) => m.progress >= m.target).length}</p>
              <p className="text-[10px] font-medium text-muted-foreground">Missões</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{missions.length} ativas</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemAnim} className={`bento-card relative overflow-hidden rounded-xl border border-border bg-card p-5`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${narrative.color} opacity-[0.03]`} />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-isometrica-accent/10">
            <Quote className="size-6 text-isometrica-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">{narrative.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{narrative.desc}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
                <Star className="size-3.5 text-isometrica-accent" />
              </div>
              <h3 className="text-sm font-semibold">Conquistas</h3>
            </div>
            <span className="text-xs text-muted-foreground">{achievements.length}/{achievementsList.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {achievementsList.map((ach) => {
              const isUnlocked = ach.unlocked || achievements.some((a: any) => a.name === ach.name)
              return (
                <div
                  key={ach.name}
                  className={`relative flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                    isUnlocked
                      ? 'border-isometrica-accent/30 bg-isometrica-accent/[0.03]'
                      : 'border-border bg-muted/30 opacity-50'
                  }`}
                >
                  <ach.icon className="mb-1.5 size-6" />
                  <p className={`text-xs font-semibold leading-tight ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                    {ach.name}
                  </p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground leading-tight">{ach.desc}</p>
                  {!isUnlocked && ach.progress !== undefined && ach.target !== undefined && (
                    <div className="mt-2 w-full">
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-isometrica-accent/50"
                          style={{ width: `${(ach.progress / ach.target) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[8px] text-muted-foreground tabular-nums">
                        {ach.progress}/{ach.target}
                      </p>
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="mt-1.5 flex items-center gap-0.5 text-[9px] font-medium text-isometrica-success">
                      <CheckCircle className="size-3" />
                      Desbloqueado
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-warning/10">
                <Target className="size-3.5 text-isometrica-warning" />
              </div>
              <h3 className="text-sm font-semibold">Missões Ativas</h3>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {mockMissions.map((mission, i) => (
              <div
                key={mission.name}
                className={`py-4 ${i < mockMissions.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <mission.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{mission.name}</p>
                    <p className="text-[11px] text-muted-foreground">{mission.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-isometrica-accent to-orange-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        {mission.progress}/{mission.target}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-isometrica-accent">
                      <Gift className="size-3" />
                      <span>{mission.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
                <TrendingUp className="size-3.5 text-isometrica-info" />
              </div>
              <h3 className="text-sm font-semibold">Histórico de XP</h3>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {xpHistory.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 py-3 ${i < xpHistory.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-[11px] text-muted-foreground">{item.time}</p>
                </div>
                {item.xp > 0 && (
                  <Badge variant="secondary" className="shrink-0 bg-isometrica-success/10 text-isometrica-success text-[10px] font-semibold">
                    +{item.xp} XP
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-primary/10">
              <Medal className="size-3.5 text-isometrica-primary" />
            </div>
            <h3 className="text-sm font-semibold">Ranking</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { pos: 1, name: 'Ana Oliveira', xp: 8450, level: 15 },
              { pos: 2, name: 'Carlos Mendes', xp: 6720, level: 13 },
              { pos: 3, name: 'Você', xp: 2450, level: 8, isMe: true },
              { pos: 4, name: 'Lucas Silva', xp: 2100, level: 7 },
              { pos: 5, name: 'Maria Costa', xp: 1890, level: 6 },
            ].map((user) => (
              <div
                key={user.pos}
                className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                  user.isMe ? 'bg-isometrica-accent/5 ring-1 ring-isometrica-accent/20' : 'hover:bg-muted'
                }`}
              >
                <span className="flex w-5 justify-center">
                  {user.pos === 1 ? <Medal className="size-5 text-yellow-500" /> :
                   user.pos === 2 ? <Medal className="size-5 text-slate-400" /> :
                   user.pos === 3 ? <Medal className="size-5 text-amber-700" /> :
                   <span className="text-sm font-bold text-muted-foreground">{user.pos}</span>}
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                  {user.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">Nível {user.level}</p>
                </div>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {user.xp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
