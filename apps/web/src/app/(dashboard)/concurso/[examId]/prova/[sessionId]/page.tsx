'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useResultadoSimulado } from '@/lib/queries'
import { api, type SimuladoStartResponse } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock, Flag, Loader2, AlertTriangle } from 'lucide-react'

type QuestaoProva = SimuladoStartResponse['questions'][number]
type ExamInfo = SimuladoStartResponse['exam']

export default function ProvaPage() {
  const params = useParams()
  const router = useRouter()
  const { usuario } = useAuth()
  const examId = params.examId as string
  const sessionId = params.sessionId as string

  const [questoes, setQuestoes] = useState<QuestaoProva[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const startTimes = useRef<Record<string, number>>({})

  // Load questions from the simulado
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/questions/simulado/${examId}/start`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examId }),
        })
        // If session already exists from the concurso page, just get the questions
        const data = await res.json()
        if (data.questions) {
          setQuestoes(data.questions)
          setExamInfo(data.exam)
          if (data.exam?.timeLimit) setTimeLeft(data.exam.timeLimit * 60)
        }
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [examId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // Track time per question
  useEffect(() => {
    if (questoes.length === 0) return
    const q = questoes[currentIndex]
    if (!startTimes.current[q.questionId]) {
      startTimes.current[q.questionId] = Date.now()
    }
  }, [currentIndex, questoes])

  const answerQuestion = useCallback((questionId: string, alternativeId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: alternativeId }))
  }, [])

  function goToQuestion(idx: number) {
    // Record time for current question
    const q = questoes[currentIndex]
    if (q && startTimes.current[q.questionId]) {
      const spent = Math.round((Date.now() - startTimes.current[q.questionId]) / 1000)
      setTimeSpent((prev) => ({ ...prev, [q.questionId]: (prev[q.questionId] ?? 0) + spent }))
    }
    startTimes.current = {}
    setCurrentIndex(idx)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Record time for last question
      const q = questoes[currentIndex]
      if (q && startTimes.current[q.questionId]) {
        const spent = Math.round((Date.now() - startTimes.current[q.questionId]) / 1000)
        setTimeSpent((prev) => ({ ...prev, [q.questionId]: (prev[q.questionId] ?? 0) + spent }))
      }

      const answerList = questoes.map((q) => ({
        questionId: q.questionId,
        selectedId: answers[q.questionId] ?? null,
        timeSpent: timeSpent[q.questionId] ?? 0,
      }))

      await api.questions.submeterSimulado(sessionId ?? '', answerList)
      router.push(`/concurso/${examId}/resultado/${sessionId}`)
    } catch {} finally { setSubmitting(false) }
  }

  if (loading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
  }

  if (questoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-3 size-10 text-muted-foreground/30" />
        <p className="text-sm font-medium">Nenhuma questão disponível</p>
        <p className="mt-1 text-xs text-muted-foreground">Este simulado não possui questões publicadas.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/concurso')}>Voltar</Button>
      </div>
    )
  }

  const total = questoes.length
  const answeredCount = Object.keys(answers).length
  const question = questoes[currentIndex]
  const isLast = currentIndex === total - 1

  function formatTime(seconds: number | null) {
    if (seconds === null) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      {/* Question navigator sidebar */}
      <div className="order-last shrink-0 lg:order-first lg:w-56">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Progresso</span>
            <span className="text-muted-foreground">{answeredCount}/{total}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-isometrica-accent transition-all" style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>

          {timeLeft !== null && (
            <div className={`mt-3 flex items-center gap-1.5 text-sm font-semibold ${timeLeft < 120 ? 'text-isometrica-danger' : 'text-muted-foreground'}`}>
              <Clock className="size-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}

          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {questoes.map((q, i) => (
              <button
                key={q.questionId}
                onClick={() => goToQuestion(i)}
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  i === currentIndex
                    ? 'bg-isometrica-accent text-white'
                    : answers[q.questionId]
                      ? 'bg-isometrica-accent/10 text-isometrica-accent border border-isometrica-accent/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {!confirmEnd ? (
              <Button
                variant="outline"
                className="w-full gap-1.5 text-xs"
                onClick={() => setConfirmEnd(true)}
              >
                <Flag className="size-3.5" /> Finalizar
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {total - answeredCount} questão{total - answeredCount !== 1 ? 'ões' : ''} não respondida{total - answeredCount !== 1 ? 's' : ''}.
                  Deseja finalizar?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => setConfirmEnd(false)}>Continuar</Button>
                  <Button size="sm" className="flex-1 text-xs gap-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="size-3 animate-spin" /> : null}
                    Finalizar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current question */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 rounded-xl border border-border bg-card p-6 lg:p-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span className="rounded-md bg-muted px-2 py-0.5 font-medium">Questão {currentIndex + 1} de {total}</span>
            <span className="rounded-md bg-muted px-2 py-0.5">{question.difficulty === 'EASY' ? 'Fácil' : question.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}</span>
          </div>

          <p className="text-sm leading-relaxed lg:text-base">{question.text}</p>

          <div className="mt-6 space-y-2.5">
            {question.alternatives?.map((alt: { id: string; text: string }) => {
              const selected = answers[question.questionId] === alt.id
              return (
                <button
                  key={alt.id}
                  onClick={() => answerQuestion(question.questionId, alt.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                    selected
                      ? 'border-isometrica-accent/50 bg-isometrica-accent/[0.03]'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                    selected ? 'border-isometrica-accent bg-isometrica-accent text-white' : 'border-border'
                  }`}>
                    {String.fromCharCode(65 + question.alternatives.indexOf(alt))}
                  </span>
                  <span className="flex-1">{alt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="gap-1.5 text-sm"
          >
            <ChevronLeft className="size-4" /> Anterior
          </Button>

          {isLast ? (
            <Button onClick={() => setConfirmEnd(true)} className="gap-1.5 text-sm">
              <Flag className="size-4" /> Finalizar
            </Button>
          ) : (
            <Button onClick={() => goToQuestion(currentIndex + 1)} className="gap-1.5 text-sm">
              Próxima <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
