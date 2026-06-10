'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/queries'
import { useAuth } from '@/contexts/auth-context'
import { Badge } from '@/components/ui/badge'
import { StatSkeleton } from '@/components/skeleton-loading'
import {
  User, Award, Flame, Trophy, GraduationCap, BarChart3, Target,
  Settings, ExternalLink, BookOpen, CheckCircle, TrendingUp,
  Zap, Medal, Star, Crown, Share2, Edit,
} from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } }

const levelColors = ['from-zinc-400 to-zinc-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-600', 'from-isometrica-accent to-orange-500']

function getLevelColor(lvl: number) { return levelColors[Math.min(Math.floor(lvl / 5), levelColors.length - 1)] }

export default function MeuPerfilPage() {
  const { usuario } = useAuth()
  const { data, isLoading: carregando } = useProfile()

  if (carregando) return (
    <div className="max-w-5xl mx-auto space-y-5 p-5">
      <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      <StatSkeleton count={4} />
    </div>
  )

  if (!data) return null

  const isProfessor = data.user?.role === 'PROFESSOR'
  const u = data.user
  const g = data.gamification
  const stats = data.stats
  const certs = data.certificates ?? []
  const enrollments = data.enrollments ?? []
  const nome = u.name ?? 'Usuário'
  const inicial = nome[0]?.toUpperCase() ?? '?'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header / Card de Perfil */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-isometrica-primary via-isometrica-primary/95 to-isometrica-accent/20 p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-isometrica-accent/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className={`relative flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${g ? getLevelColor(g.level) : 'from-isometrica-accent to-orange-500'} shadow-lg shadow-black/10`}>
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">{inicial}</span>
            {g && <div className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-isometrica-primary shadow-sm">{g.level}</div>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{nome}</h1>
              {isProfessor && <Badge className="bg-amber-400/20 text-amber-300 border-0">Professor</Badge>}
              {!isProfessor && <Badge className="bg-emerald-400/20 text-emerald-300 border-0">Estudante</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-white/70">{u.email}</p>
            {u.title && <p className="text-sm text-white/80 font-medium mt-1">{u.title}</p>}
            {u.university && <p className="text-xs text-white/60 mt-1">{u.university}{u.period ? ` · ${u.period}º período` : ''}</p>}
            {u.bio && <p className="mt-2 text-sm text-white/80 max-w-lg leading-relaxed">{u.bio}</p>}

            {(u.lattes || u.linkedin || u.instagram || u.twitter) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {u.lattes && <a href={u.lattes} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">Lattes <ExternalLink className="size-3" /></a>}
                {u.linkedin && <a href={u.linkedin} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">LinkedIn <ExternalLink className="size-3" /></a>}
                {u.instagram && <a href={u.instagram} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">Instagram <ExternalLink className="size-3" /></a>}
                {u.twitter && <a href={u.twitter} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">Twitter <ExternalLink className="size-3" /></a>}
              </div>
            )}
          </div>

          <Link href="/perfil/editar" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/25">
            <Edit className="size-3.5" /> Editar Perfil
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      {!isProfessor && g && (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'XP Total', value: g.xp.toLocaleString(), icon: Zap, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
            { label: 'Nível', value: g.level, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Streak', value: `${g.streak} dias`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Precisão', value: `${stats.accuracy}%`, icon: Target, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
          ].map((s) => (
            <div key={s.label} className="bento-card rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`size-5 ${s.color}`} /></div>
              <div><p className="font-display text-lg font-bold tabular-nums">{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
            </div>
          ))}
        </motion.div>
      )}

      {isProfessor && (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cursos', value: stats.coursesCreated, icon: BookOpen, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
            { label: 'Alunos', value: stats.totalAttempts > 0 ? stats.totalAttempts : '—', icon: User, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10' },
            { label: 'Certificados', value: stats.totalCertificates, icon: Award, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
            { label: 'Acerto Médio', value: `${stats.accuracy}%`, icon: TrendingUp, color: 'text-isometrica-warning', bg: 'bg-isometrica-warning/10' },
          ].map((s) => (
            <div key={s.label} className="bento-card rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}><s.icon className={`size-5 ${s.color}`} /></div>
              <div><p className="font-display text-lg font-bold tabular-nums">{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Grid: Certificados + Cursos em andamento */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Certificados */}
        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10"><Award className="size-3.5 text-isometrica-accent" /></div>
              <h3 className="text-sm font-semibold">Certificados</h3>
            </div>
            {certs.length > 0 && <Link href="/certificados" className="text-xs text-muted-foreground hover:text-isometrica-accent transition-colors">Ver todos</Link>}
          </div>
          {certs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum certificado ainda.</p>
          ) : (
            <div className="space-y-2">
              {certs.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-white shadow-sm">
                    <Award className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">{c.proficiency}% proficiência · {c.totalHours}h</p>
                  </div>
                  <Star className="size-3.5 shrink-0 text-amber-500" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cursos em Andamento */}
        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10"><BookOpen className="size-3.5 text-isometrica-info" /></div>
              <h3 className="text-sm font-semibold">{isProfessor ? 'Cursos Criados' : 'Cursando'}</h3>
            </div>
            <Link href="/cursos" className="text-xs text-muted-foreground hover:text-isometrica-accent transition-colors">Ver todos</Link>
          </div>
          {enrollments.length === 0 && !isProfessor ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum curso em andamento.</p>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((e) => (
                <Link key={e.id} href={`/cursos/${e.courseId}`} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 no-underline">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-isometrica-info/10"><GraduationCap className="size-4 text-isometrica-info" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight truncate">{e.courseName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div className="h-full rounded-full bg-isometrica-info" initial={{ width: 0 }} animate={{ width: `${e.progress}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{e.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Rodapé — perfil público */}
      <motion.div variants={item} className="flex items-center justify-center gap-2 pt-2">
        <Share2 className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Perfil público: </span>
        <a href={`/u/${u.id}`} target="_blank" className="text-xs font-medium text-isometrica-accent hover:underline">isometrica.com/u/{u.id.slice(0, 8)}</a>
      </motion.div>
    </motion.div>
  )
}
