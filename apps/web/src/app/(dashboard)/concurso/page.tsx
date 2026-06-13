'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useExams, useExamBoards, useIniciarSimulado } from '@/lib/queries'
import type { ExamListItem } from '@/lib/api'
import { Timer, HelpCircle, Clock, Search, Award, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const fullDiffColor = (d: string | null) => {
  switch (d) {
    case 'Fácil': return 'bg-isometrica-success/10 text-isometrica-success'
    case 'Médio': return 'bg-isometrica-info/10 text-isometrica-info'
    case 'Difícil': return 'bg-isometrica-warning/10 text-isometrica-warning'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function ConcursoPage() {
  const router = useRouter()
  const { usuario } = useAuth()
  const [search, setSearch] = useState('')
  const [boardFilter, setBoardFilter] = useState('')
  const { data: examsData, isLoading } = useExams({ search, board: boardFilter })
  const { data: boards } = useExamBoards()
  const iniciarSimulado = useIniciarSimulado()

  const exams = examsData?.data ?? []

  async function handleStart(examId: string) {
    if (!usuario) return
    try {
      const result = await iniciarSimulado.mutateAsync(examId)
      router.push(`/concurso/${result.exam.id}/prova/${result.sessionId}`)
    } catch {}
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemAnim}>
        <h1 className="font-display text-2xl font-bold">Modo Concurso</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Simule condições reais de prova com tempo cronometrado, questões inéditas e correção automática
        </p>
      </motion.div>

      <motion.div variants={itemAnim} className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-accent/10">
            <Timer className="size-5 text-isometrica-accent" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">{examsData?.total ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Simulados disponíveis</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-info/10">
            <Clock className="size-5 text-isometrica-info" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">Cronometrado</p>
            <p className="text-[10px] text-muted-foreground">Tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-success/10">
            <Award className="size-5 text-isometrica-success" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums">Correção automática</p>
            <p className="text-[10px] text-muted-foreground">Resultado na hora</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemAnim} className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar concurso..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <select
          value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none"
        >
          <option value="">Todas as bancas</option>
          {(boards ?? []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
      ) : exams.length === 0 ? (
        <motion.div variants={itemAnim} className="flex flex-col items-center justify-center py-20 text-center">
          <Award className="mb-3 size-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">Nenhum simulado disponível</p>
          <p className="mt-1 text-xs text-muted-foreground">Os professores ainda não cadastraram concursos.</p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam: ExamListItem) => (
            <motion.div key={exam.id} variants={itemAnim}>
              <Card
                data-testid={`simulado-card-${exam.id}`}
                className="cursor-pointer transition-all hover:border-isometrica-accent/30 hover:shadow-sm"
                onClick={() => handleStart(exam.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-display text-base">{exam.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary" className={fullDiffColor(exam.difficulty)}>
                      {exam.difficulty ?? '—'}
                    </Badge>
                    {exam.area && <span className="text-xs text-muted-foreground">{exam.area}</span>}
                    {exam.board && <span className="text-xs text-muted-foreground">· {exam.board}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><HelpCircle className="size-3" /> {exam.questionCount} questões</span>
                    {exam.timeLimit && <span className="flex items-center gap-1"><Clock className="size-3" /> {exam.timeLimit}min</span>}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-isometrica-accent">
                    Iniciar simulado <ChevronRight className="size-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
