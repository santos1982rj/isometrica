'use client'

import Link from 'next/link'
import { Crown, GraduationCap, Play, Sparkles, Loader2, CheckCircle, Award } from 'lucide-react'
import type { ProgressoCurso } from '@/lib/types'

interface SidebarCardProps {
  cursoId: string
  isPremium: boolean
  certificateEnabled: boolean
  temAcesso: boolean
  needsPurchase: boolean
  price: number
  totalLessons: number
  estimatedHours: number | null | undefined
  grad: string
  firstLessonId: string
  progresso?: ProgressoCurso | null
  matriculando: boolean
  comprando: boolean
  onEnroll: () => void
  onPurchase: () => void
  onCertificate: () => void
}

export function SidebarCard({
  isPremium, certificateEnabled, temAcesso, needsPurchase, price,
  totalLessons, estimatedHours, grad, firstLessonId, progresso,
  matriculando, comprando, onEnroll, onPurchase, onCertificate,
}: SidebarCardProps) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className={`mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-br ${grad}`}>
          {isPremium ? <Crown className="size-6 text-white" /> : <GraduationCap className="size-6 text-white" />}
        </div>
        <h3 className="font-display text-lg font-bold">
          {temAcesso ? 'Acesso Liberado' : needsPurchase ? 'Curso Premium' : 'Grátis'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {temAcesso ? 'Aproveite todo o conteúdo do curso.' : needsPurchase ? `Adquira por R$ ${Number(price ?? 0).toFixed(2).replace('.', ',')}` : 'Matricule-se grátis.'}
        </p>
        <ul className="mt-4 space-y-2 text-left text-xs text-muted-foreground">
          <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-isometrica-success shrink-0" />{totalLessons} aulas em vídeo</li>
          <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-isometrica-success shrink-0" />{estimatedHours ?? '—'}h de conteúdo</li>
          {certificateEnabled && <li className="flex items-center gap-2"><Award className="size-3.5 text-isometrica-accent shrink-0" />Certificado ao concluir</li>}
        </ul>

        {temAcesso ? (
          <Link href={`/aulas/${firstLessonId}`}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg no-underline">
            <Play className="size-4" /> Continuar
          </Link>
        ) : needsPurchase ? (
          <button onClick={onPurchase} disabled={comprando}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60">
            {comprando ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
            {comprando ? 'Processando...' : `Comprar R$ ${Number(price ?? 0).toFixed(2).replace('.', ',')}`}
          </button>
        ) : (
          <button onClick={onEnroll} disabled={matriculando}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60">
            {matriculando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {matriculando ? 'Matriculando...' : 'Matricular grátis'}
          </button>
        )}

        {temAcesso && progresso?.percentage === 100 && certificateEnabled && (
          <button onClick={onCertificate}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-isometrica-accent/30 px-5 py-2.5 text-sm font-semibold text-isometrica-accent transition-all hover:bg-isometrica-accent/5">
            <Award className="size-4" /> Obter Certificado
          </button>
        )}
      </div>
    </div>
  )
}
