'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useErrors, useClearErrors, useSubmitAttempt } from '@/lib/queries'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Questao } from '@/lib/types'
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  BookOpen,
  Trash2,
  BarChart3,
  ChevronRight,
} from 'lucide-react'

interface ErrorEntry {
  id: string
  question: Questao
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function ErrosPage() {
  const { usuario } = useAuth()
  const { data: erros = [], isLoading: carregando } = useErrors(usuario?.id ?? '') as { data: ErrorEntry[] | undefined; isLoading: boolean; isError: boolean }
  const { mutateAsync: limparErros } = useClearErrors()
  const { mutate: enviarTentativa } = useSubmitAttempt()
  const [expandido, setExpandido] = useState<string | null>(null)
  const [refazendo, setRefazendo] = useState<Record<string, string>>({})
  const [mostrarFeedback, setMostrarFeedback] = useState<Record<string, boolean>>({})

  async function limpar() {
    if (!usuario || !confirm('Limpar histórico de erros?')) return
    await limparErros(usuario.id)
  }

  function responder(questionId: string, alternativeId: string) {
    setRefazendo((prev) => ({ ...prev, [questionId]: alternativeId }))
  }

  function conferir(err: ErrorEntry) {
    const esc = refazendo[err.question.id]
    if (!esc) return
    setMostrarFeedback((prev) => ({ ...prev, [err.question.id]: true }))
    if (usuario) {
      const correta = err.question.alternatives.find((a) => a.isCorrect)
      enviarTentativa({
        userId: usuario.id, questionId: err.question.id, selectedId: esc,
        correct: esc === correta?.id,
      })
    }
  }

  const stats = {
    total: erros.length,
    porMateria: new Map<string, number>(),
  }
  erros.forEach((e) => {
    const nome = e.question?.topic?.subject?.name ?? 'Geral'
    stats.porMateria.set(nome, (stats.porMateria.get(nome) ?? 0) + 1)
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Feed de Erros</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Revise e refaça as questões que você errou</p>
        </div>
        {erros.length > 0 && (
          <button onClick={limpar} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:text-isometrica-danger hover:border-isometrica-danger/30">
            <Trash2 className="size-3.5" />
            Limpar histórico
          </button>
        )}
      </motion.div>

      {carregando ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : erros.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <CheckCircle className="mb-3 size-12 text-isometrica-success/50" />
          <h3 className="font-display text-lg font-semibold">Nenhum erro registrado</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Quando você errar uma questão nos exercícios das aulas, ela aparecerá aqui para revisão.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-4">
          <motion.div variants={item} className="space-y-5 lg:col-span-3">
            {erros.map((err) => {
              const q = err.question
              const correta = q.alternatives.find((a) => a.isCorrect)
              const esc = refazendo[q.id]
              const feedback = mostrarFeedback[q.id]
              const acertou = feedback && esc === correta?.id

              return (
                <div key={err.id} className="bento-card rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-isometrica-danger/10">
                      <XCircle className="size-4 text-isometrica-danger" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px]">
                              {q.topic?.name ?? 'Tópico'}
                            </Badge>
                            <Badge variant="secondary" className="text-[9px]">
                              {q.difficulty === 'EASY' ? 'Fácil' : q.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}
                            </Badge>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandido(expandido === q.id ? null : q.id)}
                          className="shrink-0 rounded-lg border border-border px-3 py-1 text-[10px] font-semibold transition-all hover:bg-muted"
                        >
                          {expandido === q.id ? 'Fechar' : 'Refazer'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandido === q.id && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <p className="text-xs font-semibold text-muted-foreground">Tente novamente:</p>
                      {q.alternatives.map((alt) => {
                        let classe = 'border-border hover:bg-muted/50'
                        if (feedback) {
                          if (alt.isCorrect) classe = 'border-isometrica-success/50 bg-isometrica-success/[0.03]'
                          else if (esc === alt.id && !alt.isCorrect) classe = 'border-isometrica-danger/50 bg-isometrica-danger/[0.03]'
                        } else if (esc === alt.id) {
                          classe = 'border-isometrica-accent/50 bg-isometrica-accent/[0.03]'
                        }
                        return (
                          <button
                            key={alt.id}
                            onClick={() => !feedback && responder(q.id, alt.id)}
                            disabled={feedback}
                            className={cn('flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all', classe)}
                          >
                            <span className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium',
                              esc === alt.id && !feedback ? 'border-isometrica-accent bg-isometrica-accent text-white' : 'border-border'
                            )}>
                              {String.fromCharCode(65 + q.alternatives.indexOf(alt))}
                            </span>
                            <span className="flex-1">{alt.text}</span>
                            {feedback && alt.isCorrect && <CheckCircle className="size-4 shrink-0 text-isometrica-success" />}
                          </button>
                        )
                      })}
                      <div className="flex items-center gap-2 pt-1">
                        {!feedback && esc && (
                          <button
                            onClick={() => conferir(err)}
                            className="rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90"
                          >
                            Conferir
                          </button>
                        )}
                        {feedback && (
                          <button
                            onClick={() => { setMostrarFeedback((prev) => ({ ...prev, [q.id]: false })); setRefazendo((prev) => { const n = { ...prev }; delete n[q.id]; return n }) }}
                            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                          >
                            Tentar de novo
                          </button>
                        )}
                        {feedback && (
                          <span className={cn('text-xs font-semibold', acertou ? 'text-isometrica-success' : 'text-isometrica-danger')}>
                            {acertou ? <span className="inline-flex items-center gap-1"><CheckCircle className="size-3" /> Correto!</span> : <span className="inline-flex items-center gap-1"><XCircle className="size-3" /> Ainda errado. Reveja o conteúdo.</span>}
                          </span>
                        )}
                        {feedback && q.explanation && (
                          <p className="text-xs text-muted-foreground">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="size-4 text-isometrica-accent" />
                <h3 className="text-sm font-semibold">Resumo</h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-isometrica-danger">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">questões erradas</p>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  {Array.from(stats.porMateria.entries()).map(([materia, qtd]) => (
                    <div key={materia} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate">{materia}</span>
                      <span className="font-semibold">{qtd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="size-4 text-isometrica-info" />
                <h3 className="text-sm font-semibold">Dica</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Refazer questões erradas é uma das formas mais eficientes de fixar o conteúdo. Tente acertar cada questão 3 vezes seguidas em dias diferentes.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
