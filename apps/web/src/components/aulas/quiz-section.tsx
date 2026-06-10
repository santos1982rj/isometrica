'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FileQuestion, CheckCircle, Sparkles } from 'lucide-react'
import type { Questao } from '@/lib/types'

interface QuizSectionProps {
  questoes: Questao[]
  carregando: boolean
  onAttempt: (attempts: { questionId: string; selectedId: string; correct: boolean }[]) => void
}

export function QuizSection({ questoes, carregando, onAttempt }: QuizSectionProps) {
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [quizEnviado, setQuizEnviado] = useState(false)

  if (carregando) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (questoes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
        <FileQuestion className="mx-auto mb-2 size-8 text-muted-foreground/30" />
        <p className="text-sm font-medium">Nenhuma questão disponível</p>
        <p className="mt-1 text-xs text-muted-foreground">Questões relacionadas ao conteúdo aparecerão aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questoes.length} questão{questoes.length > 1 ? 'ões' : ''}
          {quizEnviado && (
            <span className="ml-2 font-semibold text-isometrica-success">
              — {questoes.filter((q, i) => respostas[q.id] === q.alternatives.find((a) => a.isCorrect)?.id).length}/{questoes.length} acertos
            </span>
          )}
        </p>
        {!quizEnviado && Object.keys(respostas).length === questoes.length && (
          <button
            onClick={() => {
              setQuizEnviado(true)
              const attempts = questoes.map((q) => {
                const esc = respostas[q.id]
                const correta = q.alternatives.find((a) => a.isCorrect)
                return { questionId: q.id, selectedId: esc ?? '', correct: esc === correta?.id }
              })
              onAttempt(attempts)
            }}
            className="rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90"
          >
            Corrigir
          </button>
        )}
        {quizEnviado && (
          <button
            onClick={() => { setRespostas({}); setQuizEnviado(false) }}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            Tentar novamente
          </button>
        )}
      </div>

      {questoes.map((q, idx) => {
        const esc = respostas[q.id]
        const correta = q.alternatives.find((a) => a.isCorrect)
        const acertou = esc === correta?.id
        return (
          <div
            key={q.id}
            className={cn(
              'rounded-xl border p-4 sm:p-5 transition-colors',
              quizEnviado
                ? acertou
                  ? 'border-isometrica-success/40 bg-isometrica-success/[0.02]'
                  : 'border-isometrica-danger/40 bg-isometrica-danger/[0.02]'
                : 'border-border bg-card',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {q.topic?.name} · {q.difficulty === 'EASY' ? 'Fácil' : q.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {q.alternatives.map((alt) => {
                const sel = esc === alt.id; const feedback = quizEnviado
                return (
                  <button
                    key={alt.id}
                    onClick={() => { if (!quizEnviado) setRespostas((p) => ({ ...p, [q.id]: alt.id })) }}
                    disabled={quizEnviado}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 text-left text-sm transition-all',
                      feedback
                        ? alt.isCorrect
                          ? 'border-isometrica-success/50 bg-isometrica-success/[0.03]'
                          : sel && !alt.isCorrect
                            ? 'border-isometrica-danger/50 bg-isometrica-danger/[0.03]'
                            : 'border-border'
                        : sel
                          ? 'border-isometrica-accent/50 bg-isometrica-accent/[0.03]'
                          : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium',
                        sel && !feedback
                          ? 'border-isometrica-accent bg-isometrica-accent text-white'
                          : 'border-border',
                      )}
                    >
                      {String.fromCharCode(65 + q.alternatives.indexOf(alt))}
                    </span>
                    <span className="flex-1">{alt.text}</span>
                    {feedback && alt.isCorrect && <CheckCircle className="size-4 shrink-0 text-isometrica-success" />}
                  </button>
                )
              })}
            </div>
            {quizEnviado && !acertou && (
              <Link
                href={`/tutor?pergunta=${encodeURIComponent(`Explique por que errei esta questão: "${q.text}". A resposta correta era "${correta?.text}".`)}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[11px] font-semibold text-muted-foreground transition-all hover:border-isometrica-accent hover:text-isometrica-accent"
              >
                <Sparkles className="size-3.5" /> Explique por que errei
              </Link>
            )}
            {quizEnviado && q.explanation && (
              <p className="mt-3 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground leading-relaxed">
                {q.explanation}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
