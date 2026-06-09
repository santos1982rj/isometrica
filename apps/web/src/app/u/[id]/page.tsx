'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Award, BookOpen, ExternalLink, Flame, Star, Trophy, Zap, User, GraduationCap, Target, Crown } from 'lucide-react'

export default function PerfilPublicoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const [data, setData] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.profile.publico(id).then(setData).catch(console.error).finally(() => setCarregando(false))
  }, [id])

  if (carregando) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-lg px-5">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  )

  if (!data?.user) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <User className="mb-3 size-12 text-muted-foreground/40" />
      <h1 className="font-display text-xl font-bold">Perfil não encontrado</h1>
      <p className="mt-1 text-sm text-muted-foreground">Este usuário não existe ou o perfil está inativo.</p>
      <Link href="/" className="mt-4 text-sm text-isometrica-accent hover:underline">Voltar ao início</Link>
    </div>
  )

  const { user, certificates, gamification, coursesCreated } = data
  const isProfessor = user.role === 'PROFESSOR'
  const inicial = user.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Card Principal */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-isometrica-primary via-isometrica-primary/95 to-isometrica-accent/20 p-8 text-center text-white">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-isometrica-accent/10" />

            <div className="relative z-10">
              <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 shadow-lg shadow-black/10">
                <span className="font-display text-4xl font-extrabold text-white">{inicial}</span>
              </div>

              <h1 className="font-display text-2xl font-bold">{user.name}</h1>
              {user.title && <p className="mt-1 text-base text-white/80 font-medium">{user.title}</p>}
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge className={isProfessor ? 'bg-amber-400/20 text-amber-300 border-0' : 'bg-emerald-400/20 text-emerald-300 border-0'}>
                  {isProfessor ? 'Professor' : 'Estudante'}
                </Badge>
                {gamification && <Badge className="bg-white/10 text-white/80 border-0">Nível {gamification.level}</Badge>}
              </div>

              {user.bio && <p className="mt-4 text-sm text-white/80 max-w-md mx-auto leading-relaxed">{user.bio}</p>}

              {(user.lattes || user.linkedin || user.instagram) && (
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                  {user.lattes && <a href={user.lattes} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">Lattes <ExternalLink className="size-3" /></a>}
                  {user.linkedin && <a href={user.linkedin} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">LinkedIn <ExternalLink className="size-3" /></a>}
                  {user.instagram && <a href={user.instagram} target="_blank" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20 transition-colors">Instagram <ExternalLink className="size-3" /></a>}
                </div>
              )}
            </div>
          </div>

          {/* Stats — Aluno */}
          {gamification && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'XP', value: gamification.xp.toLocaleString(), icon: Zap },
                { label: 'Nível', value: gamification.level, icon: Trophy },
                { label: 'Streak', value: `${gamification.streak} dias`, icon: Flame },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <s.icon className="mx-auto mb-1 size-5 text-isometrica-accent" />
                  <p className="font-display text-xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Certificados */}
          {certificates.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Award className="size-4 text-isometrica-accent" /> Certificados</h2>
              <div className="space-y-2">
                {certificates.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-white"><Award className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-[10px] text-muted-foreground">{c.proficiency}% proficiência · {c.totalHours}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professor: Cursos Criados */}
          {isProfessor && coursesCreated.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><BookOpen className="size-4 text-isometrica-accent" /> Cursos</h2>
              <div className="space-y-2">
                {coursesCreated.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <GraduationCap className="size-4 shrink-0 text-isometrica-accent" />
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-foreground">
            Isométrica — Plataforma de evolução acadêmica
          </p>
        </motion.div>
      </div>
    </div>
  )
}
