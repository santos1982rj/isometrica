'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useProfile, useNextLessons, useLearningModel, useEventLogs } from '@/lib/queries'
import type { EventLog } from '@/lib/types'
import { StatSkeleton, CardSkeleton } from '@/components/skeleton-loading'
import { DonutChart } from '@/components/dashboard/donut-chart'
import { Sparkline } from '@/components/dashboard/sparkline'
import { Heatmap } from '@/components/dashboard/heatmap'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Flame,
  GraduationCap,
  LayoutGrid,
  Play,
  Sparkles,
  Trophy,
  Zap,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Loader2,
} from 'lucide-react'

interface ProficienciaItem {
  proficiency: number
  topic?: {
    id: string
    name: string
    subject?: {
      id: string
      name: string
    }
  }
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const mockRecommendations = [
  { icon: AlertTriangle, emojiBg: 'bg-isometrica-accent/10', title: 'Concreto Armado crítico', desc: '70% de erro em Lajes. Revisar conteúdo.', meta: 'Últimas 15 tentativas', action: 'Revisar' },
  { icon: CheckCircle, emojiBg: 'bg-isometrica-success/10', title: 'Cálculo III em alta', desc: '+23% esta semana em Derivadas Parciais.', meta: '12 acertos consecutivos', action: 'Praticar' },
  { icon: Star, emojiBg: 'bg-isometrica-warning/10', title: 'Missão: Canteiro de Obras', desc: '10 questões = 200 XP extras.', meta: 'Expira em 2 dias', action: 'Aceitar' },
]

const sparklineData = [12, 18, 8, 22, 30, 16, 28]
const heatmapData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 15))

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const periodoOptions = ['Semana', 'Mês', 'Semestre']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardPage() {
  const { usuario, carregando } = useAuth()
  const { data: profileData, isLoading: profileLoading } = useProfile()
  const { data: lessonsData, isLoading: lessonsLoading } = useNextLessons(usuario?.id ?? '')
  const { data: proficiencia = [] as ProficienciaItem[], isLoading: modelLoading } = useLearningModel(usuario?.id ?? '')
  const { data: eventos = [], isLoading: eventsLoading } = useEventLogs(usuario?.id ?? '')

  const nextLessons = lessonsData?.nextLessons ?? []

  const loading = carregando || profileLoading || lessonsLoading || modelLoading || eventsLoading

  const gamification = profileData?.gamification
  const stats = profileData?.stats
  const enrollments = profileData?.enrollments ?? []

  const kpis = gamification ? ([
    { label: 'XP Total', value: (gamification.xp ?? 0).toLocaleString('pt-BR'), icon: Zap, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Streak', value: `${gamification.streak ?? 0} dias`, icon: Flame, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Nível', value: String(gamification.level ?? 0), icon: Trophy, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10' },
    { label: 'Cursos Ativos', value: String(enrollments.length), icon: BookOpen, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
  ]) : [
    { label: 'XP Total', value: '0', icon: Zap, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Streak', value: '0 dias', icon: Flame, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Nível', value: '0', icon: Trophy, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10' },
    { label: 'Cursos Ativos', value: String(enrollments.length), icon: BookOpen, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
  ]

  const subjects = proficiencia.reduce<{ name: string; desc: string; pct: number; char: string; color: string; bg: string; barColor: string }[]>((acc, item) => {
    const subjectName = item.topic?.subject?.name ?? item.topic?.name ?? 'Geral'
    const existing = acc.find(s => s.name === subjectName)
    const pct = Math.round((item.proficiency ?? 0) * 100)
    if (existing) {
      existing.pct = Math.round((existing.pct + pct) / 2)
    } else {
      const colors = [
        { color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10', barColor: 'bg-isometrica-accent' },
        { color: 'text-isometrica-success', bg: 'bg-isometrica-success/10', barColor: 'bg-isometrica-success' },
        { color: 'text-isometrica-danger', bg: 'bg-isometrica-danger/10', barColor: 'bg-isometrica-danger' },
        { color: 'text-isometrica-warning', bg: 'bg-isometrica-warning/10', barColor: 'bg-isometrica-warning' },
      ]
      const style = colors[acc.length % colors.length]
      acc.push({ name: subjectName, desc: '', pct, char: subjectName[0], ...style })
    }
    return acc
  }, [])

  const activityEvents = eventos.slice(0, 4).map((e: EventLog) => {
    const labels: Record<string, string> = {
      LESSON_COMPLETED: 'Concluiu uma aula',
      QUESTION_CORRECT: 'Acertou uma questão',
      QUESTION_INCORRECT: 'Errou uma questão',
      CONVERSATION_STARTED: 'Iniciou conversa com Tutor IA',
      ENROLLMENT_CREATED: 'Matriculou-se em um curso',
      ACHIEVEMENT_UNLOCKED: 'Desbloqueou uma conquista',
      LEVEL_UP: 'Subiu de nível',
      STREAK_UPDATED: 'Streak atualizado',
    }
    return {
      title: labels[e.type] ?? e.type,
      time: new Date(e.createdAt).toLocaleString('pt-BR'),
      color: e.type === 'QUESTION_INCORRECT' ? 'bg-isometrica-danger' : e.type === 'QUESTION_CORRECT' ? 'bg-isometrica-success' : 'bg-isometrica-accent',
    }
  })

  const profMedia = proficiencia.length > 0
    ? Math.round(proficiencia.reduce((s, i) => s + (i.proficiency ?? 0), 0) / proficiencia.length * 100)
    : stats?.accuracy ?? 55

  const topicosCriticos = proficiencia.filter(i => (i.proficiency ?? 0) < 0.4).length
  const topicosDominados = proficiencia.filter(i => (i.proficiency ?? 0) >= 0.7).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemAnim} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight">
            {getGreeting()}, <span className="text-isometrica-accent">{usuario?.name?.split(' ')[0] ?? 'Estudante'}</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {gamification?.streak ? `${gamification.streak} de 7 dias esta semana` : 'Comece sua jornada'} &mdash;{' '}
            <span className="font-medium text-isometrica-success">
              {stats?.accuracy ? `${stats.accuracy}% de acertos` : 'Bem-vindo!'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          {periodoOptions.map((opt) => (
            <button
              key={opt}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                opt === 'Semana' ? 'bg-isometrica-accent text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemAnim} className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`size-4 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-none tabular-nums">{kpi.value}</p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Sparkline data={sparklineData} labels={diasSemana} />
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-4">
        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
                <Play className="size-3.5 text-isometrica-info" />
              </div>
              <h3 className="text-sm font-semibold">Continue de onde parou</h3>
            </div>
            <Link href="/cursos" className="text-xs font-medium text-muted-foreground hover:text-isometrica-accent transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {nextLessons.length === 0 ? (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">Todos os cursos concluídos! <Sparkles className="size-3 text-isometrica-accent" /></span>
              </p>
            ) : (
              nextLessons.map((item) => (
                <Link key={item.lessonId} href={`/aulas/${item.lessonId}`} className="flex items-start gap-3 group">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-isometrica-accent/10 group-hover:bg-isometrica-accent/20 transition-colors">
                    {item.type === 'video' ? <Play className="size-4 text-isometrica-accent" /> : <FileText className="size-4 text-isometrica-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{item.courseName}</p>
                    <h4 className="mt-0.5 text-sm font-semibold leading-tight group-hover:text-isometrica-accent transition-colors">{item.lessonTitle}</h4>
                    <p className="text-xs text-muted-foreground">{item.completedLessons} de {item.totalLessons} aulas</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-isometrica-accent"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{item.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
                <Sparkles className="size-3.5 text-isometrica-accent" />
              </div>
              <h3 className="text-sm font-semibold">IA Sugere</h3>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {mockRecommendations.map((rec, i) => (
              <div
                key={rec.title}
                className={`flex items-start gap-3 py-3 ${i < mockRecommendations.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${rec.emojiBg}`}>
                  <rec.icon className="size-3 text-isometrica-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{rec.title}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{rec.desc}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{rec.meta}</p>
                </div>
                <button className="shrink-0 rounded-md border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground transition-all hover:border-isometrica-accent hover:bg-isometrica-accent hover:text-white">
                  {rec.action}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-success/10">
                <BarChart3 className="size-3.5 text-isometrica-success" />
              </div>
              <h3 className="text-sm font-semibold">Diagnóstico Geral</h3>
            </div>
            <Link href="/progresso" className="text-xs font-medium text-muted-foreground hover:text-isometrica-accent transition-colors">
              Detalhes →
            </Link>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <DonutChart value={profMedia} label="Geral" />
            <div className="flex flex-1 flex-col gap-0">
              {subjects.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Nenhum dado de proficiência disponível</p>
              ) : (
                subjects.map((subj) => (
                  <div key={subj.name} className="flex items-center gap-3 py-2">
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${subj.bg}`}>
                      <span className={`text-[10px] font-bold ${subj.color}`}>{subj.char}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{subj.name}</span>
                        <span className={`text-xs font-bold tabular-nums ${subj.color}`}>{subj.pct}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{subj.desc}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className={`h-full rounded-full ${subj.barColor}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${subj.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-isometrica-success" />
              <span>Bom (&ge;70%)</span>
              <span className="font-semibold text-foreground">{topicosDominados}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-isometrica-accent" />
              <span>Médio (40-70%)</span>
              <span className="font-semibold text-foreground">{proficiencia.length - topicosCriticos - topicosDominados}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-isometrica-danger" />
              <span>Crítico (&lt;40%)</span>
              <span className="font-semibold text-foreground">{topicosCriticos}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
                <TrendingUp className="size-3.5 text-isometrica-accent" />
              </div>
              <h3 className="text-sm font-semibold">Atividade</h3>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            {activityEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade recente</p>
            ) : (
              activityEvents.map((act, i) => (
                <div key={act.title} className="flex items-start gap-3 py-2.5">
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <div className={`size-2 rounded-full ${act.color} ${i === 0 ? 'animate-pulse' : ''}`} />
                    {i < activityEvents.length - 1 && <div className="mt-0.5 h-full w-0.5 bg-border" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug">{act.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
                <LayoutGrid className="size-3.5 text-isometrica-info" />
              </div>
              <h3 className="text-sm font-semibold">Últimos 30 Dias</h3>
            </div>
          </div>
          <Heatmap data={heatmapData} />
        </motion.div>
      </div>

      <motion.div variants={itemAnim}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0d1b2a] to-[#1b2d45] p-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-20 size-96 rounded-full bg-isometrica-accent/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-isometrica-accent/5" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Brain className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Tutor IA identificou uma oportunidade</h4>
                <p className="mt-0.5 text-sm text-white/70">
                  Você revisa Flexão há 3 dias. Que tal praticar com questões inéditas?
                </p>
              </div>
            </div>
            <Link
              href="/tutor"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-isometrica-accent to-[#f07a4a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-isometrica-accent/30"
            >
              Praticar agora
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
