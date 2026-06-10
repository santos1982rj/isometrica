'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, CheckCircle, Circle } from 'lucide-react'

interface ActionBarProps {
  prevLessonId?: string | null
  nextLessonId?: string | null
  completa: boolean
  completando?: boolean
  onToggleComplete: () => void
  onNavigate: (id: string) => void
}

export function ActionBar({
  prevLessonId,
  nextLessonId,
  completa,
  completando = false,
  onToggleComplete,
  onNavigate,
}: ActionBarProps) {
  return (
    <div className="mt-6 sm:mt-8 mb-6 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {prevLessonId ? (
          <Link
            href={`/aulas/${prevLessonId}`}
            onClick={() => onNavigate(prevLessonId)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted no-underline"
          >
            <ArrowLeft className="size-4" /> Anterior
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
            <ArrowLeft className="size-4" /> Anterior
          </span>
        )}
        {nextLessonId ? (
          <Link
            href={`/aulas/${nextLessonId}`}
            onClick={() => onNavigate(nextLessonId)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 no-underline"
          >
            Próxima <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
            Próxima <ArrowRight className="size-4" />
          </span>
        )}
      </div>

      <button
        onClick={onToggleComplete}
        disabled={completando}
        className={cn(
          'mt-2 sm:mt-0 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 sm:py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60',
          completa
            ? 'bg-isometrica-success/10 text-isometrica-success border border-isometrica-success/30'
            : 'bg-isometrica-accent text-white hover:bg-isometrica-accent/90',
        )}
      >
        {completando ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : completa ? (
          <CheckCircle className="size-4" />
        ) : (
          <Circle className="size-4" />
        )}
        {completa ? 'Concluída' : 'Marcar como concluída'}
      </button>

      <div className="hidden sm:flex items-center justify-between gap-4 mt-3">
        <div>
          {prevLessonId ? (
            <Link
              href={`/aulas/${prevLessonId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-all hover:bg-muted no-underline"
            >
              <ArrowLeft className="size-4" /> Anterior
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
              <ArrowLeft className="size-4" /> Anterior
            </span>
          )}
        </div>
        <div>
          {nextLessonId ? (
            <Link
              href={`/aulas/${nextLessonId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 no-underline"
            >
              Próxima <ArrowRight className="size-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
              Próxima <ArrowRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
