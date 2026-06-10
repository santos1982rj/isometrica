'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useProfile, useNextLessons, useLearningModel, useEventLogs } from '@/lib/queries'
import type { EventLog } from '@/lib/types'
import { Loader2, Play, LayoutGrid, Sparkles, BookOpen } from 'lucide-react'
import { Heatmap } from '@/components/dashboard/heatmap'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { ContinueStudying } from '@/components/dashboard/continue-studying'
import { IaSuggestions } from '@/components/dashboard/ia-suggestions'
import { DiagnosticoGeral } from '@/components/dashboard/diagnostico-geral'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { CtaBanner } from '@/components/dashboard/cta-banner'
import {
  AlertTriangle,
  CheckCircle,
  Star,
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

const heatmapData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 15))

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

      <KpiCards
        xp={gamification?.xp ?? 0}
        streak={gamification?.streak ?? 0}
        level={gamification?.level ?? 0}
        activeCourses={profileData?.enrollments?.length ?? 0}
      />

      <div className="grid gap-5 lg:grid-cols-4">
        <ContinueStudying nextLessons={nextLessons} />

        <IaSuggestions recommendations={mockRecommendations} />
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <DiagnosticoGeral proficiencia={proficiencia} />

        <ActivityTimeline eventos={eventos} />

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

      <CtaBanner />
    </motion.div>
  )
}
