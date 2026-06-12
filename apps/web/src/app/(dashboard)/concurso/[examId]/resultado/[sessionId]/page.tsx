'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useResultadoSimulado } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Award, BarChart3, ArrowLeft, Loader2 } from 'lucide-react'

export default function ResultadoPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const examId = params.examId as string
  const { data: resultado, isLoading } = useResultadoSimulado(sessionId)
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all')

  if (isLoading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
  }

  if (!resultado) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium">Resultado não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/concurso')}>Voltar</Button>
      </div>
    )
  }

  const total = resultado.totalQuestions ?? resultado.questions?.length ?? 0
  const correct = resultado.totalCorrect ?? 0
  const score = resultado.score ?? 0
  const wrong = total - correct

  const questions = resultado.questions ?? []
  const filteredQuestions = questions.filter((q: any) => {
    if (filter === 'correct') return q.correct === true
    if (filter === 'wrong') return q.correct === false || q.correct === null
    return true
  })

  function formatTime(seconds: number | null | undefined) {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const scoreColor = score >= 70 ? 'text-isometrica-success' : score >= 40 ? 'text-isometrica-warning' : 'text-isometrica-danger'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/concurso')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Resultado</h1>
          <p className="text-sm text-muted-foreground">Desempenho no simulado</p>
        </div>
      </div>

      {/* Score card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex size-20 items-center justify-center rounded-full border-4 ${
              score >= 70 ? 'border-isometrica-success/30' : score >= 40 ? 'border-isometrica-warning/30' : 'border-isometrica-danger/30'
            }`}>
              <span className={`font-display text-3xl font-extrabold ${scoreColor}`}>{score}%</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Award className={`size-5 ${scoreColor}`} />
                <span className="text-lg font-bold">{score >= 70 ? 'Mandou bem!' : score >= 40 ? 'Bom progresso' : 'Continue praticando'}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {correct} de {total} questões corretas
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-isometrica-success">
                <CheckCircle className="size-4" /> {correct}
              </p>
              <p className="text-xs text-muted-foreground">Acertos</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-isometrica-danger">
                <XCircle className="size-4" /> {wrong}
              </p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'correct', 'wrong'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? 'bg-isometrica-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'correct' ? 'Acertos' : 'Erros'}
          </button>
        ))}
      </div>

      {/* Questions review */}
      <div className="space-y-3">
        {filteredQuestions.map((q: any, idx: number) => (
          <div
            key={q.questionId}
            className={`rounded-xl border p-5 transition-colors ${
              q.correct === true
                ? 'border-isometrica-success/30 bg-isometrica-success/[0.02]'
                : q.correct === false
                  ? 'border-isometrica-danger/30 bg-isometrica-danger/[0.02]'
                  : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                q.correct === true
                  ? 'bg-isometrica-success/10 text-isometrica-success'
                  : q.correct === false
                    ? 'bg-isometrica-danger/10 text-isometrica-danger'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {q.correct === true ? <CheckCircle className="size-4" /> : q.correct === false ? <XCircle className="size-4" /> : '?'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.topic && <Badge variant="secondary" className="text-[10px]">{q.topic}</Badge>}
                  <Badge variant="outline" className="text-[10px]">
                    <Clock className="mr-1 size-3" /> {formatTime(q.timeSpent)}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1">
                  {q.alternatives?.map((alt: any) => {
                    const isSelected = alt.id === q.selectedId
                    const isCorrectAlt = alt.isCorrect
                    return (
                      <div
                        key={alt.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                          isCorrectAlt
                            ? 'border-isometrica-success/30 bg-isometrica-success/[0.03]'
                            : isSelected && !isCorrectAlt
                              ? 'border-isometrica-danger/30 bg-isometrica-danger/[0.03]'
                              : 'border-border'
                        }`}
                      >
                        {isCorrectAlt && <CheckCircle className="size-3.5 shrink-0 text-isometrica-success" />}
                        {isSelected && !isCorrectAlt && <XCircle className="size-3.5 shrink-0 text-isometrica-danger" />}
                        <span className="flex-1">{alt.text}</span>
                        {isSelected && <Badge variant="secondary" className="text-[9px]">Sua resposta</Badge>}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 rounded-lg bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 pb-8">
        <Button variant="outline" onClick={() => router.push('/concurso')}>Voltar para Concursos</Button>
      </div>
    </div>
  )
}
