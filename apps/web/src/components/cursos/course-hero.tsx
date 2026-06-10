'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, Play, Loader2, BookOpen, Clock, Star } from 'lucide-react'
import type { Curso } from '@/lib/types'

const levelLabel: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

interface CourseHeroProps {
  curso: Curso
  temAcesso: boolean
  needsPurchase: boolean
  totalLessons: number
  matriculando: boolean
  comprando: boolean
  onEnroll: () => void
  onPurchase: () => void
}

export function CourseHero({
  curso, temAcesso, needsPurchase, totalLessons,
  matriculando, comprando, onEnroll, onPurchase,
}: CourseHeroProps) {
  const grad = curso.color ?? 'from-violet-600 to-purple-700'

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-8 lg:p-10 text-white`}>
      <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 size-52 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/25 text-[10px]">
            {curso.subject?.name ?? 'Geral'}
          </Badge>
          {curso.premium && (
            <Badge className="bg-amber-400/20 text-amber-300 border-0 text-[10px] flex items-center gap-1">
              <Crown className="size-3" /> Premium
            </Badge>
          )}
          {curso.certificateEnabled && (
            <Badge className="bg-emerald-400/20 text-emerald-300 border-0 text-[10px]">
              Certificado
            </Badge>
          )}
        </div>

        <h1 className="font-display text-3xl font-extrabold leading-tight lg:text-4xl">{curso.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{curso.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
          <span className="flex items-center gap-1.5"><BookOpen className="size-4" />{curso.modules?.length ?? 0} módulos</span>
          <span className="flex items-center gap-1.5"><Play className="size-4" />{totalLessons} aulas</span>
          <span className="flex items-center gap-1.5"><Clock className="size-4" />{curso.estimatedHours ?? '—'}h</span>
          <span className="flex items-center gap-1.5"><Star className="size-4" />{levelLabel[curso.level ?? 'iniciante'] ?? curso.level}</span>
        </div>

        {!temAcesso && !needsPurchase && (
          <button onClick={onEnroll} disabled={matriculando}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 disabled:opacity-60">
            {matriculando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {matriculando ? 'Matriculando...' : 'Matricular grátis'}
          </button>
        )}

        {needsPurchase && (
          <button onClick={onPurchase} disabled={comprando}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-400/30 border border-amber-400/30 disabled:opacity-60">
            {comprando ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
            {comprando ? 'Processando...' : `Comprar R$ ${Number(curso.price ?? 0).toFixed(2).replace('.', ',')}`}
          </button>
        )}

        {temAcesso && (
          <Link href={`/aulas/${curso.modules?.[0]?.lessons?.[0]?.id ?? '#'}`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 no-underline">
            <Play className="size-4" /> Continuar estudando
          </Link>
        )}
      </div>
    </div>
  )
}
