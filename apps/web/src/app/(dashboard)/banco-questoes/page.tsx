'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useQuestions, useSubjectTree, useQuestionStats, useTopicMastery } from '@/lib/queries'
import type { Questao, QuestionTreeItem, QuestionStats, TopicMastery } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import {
  Search, Filter, ChevronRight, ChevronDown, BookOpen, BarChart3, Clock, CheckCircle,
  XCircle, Sparkles, GraduationCap, Target, ChevronLeft, FileQuestion, Brain, Lightbulb,
} from 'lucide-react'

type ExtendedQuestao = Questao & {
  exam?: { id: string; name: string } | null
  estimatedTime?: number
  tags: { id: string; tag: string }[]
}
type ExtendedQuestionStats = QuestionStats & { avgTimeSeconds?: number }
type ExtendedTopicMastery = TopicMastery & { isMastered?: boolean; consecutiveCorrect?: number; targetToMaster?: number }
type ExtendedTreeItem = Omit<QuestionTreeItem, 'children'> & { totalQuestions?: number; children: { id: string; name: string; count: number }[] }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } } }

const diffs = ['FACIL', 'MEDIO', 'DIFICIL']
const diffLabel: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' }
const diffColor: Record<string, string> = { FACIL: 'text-isometrica-success bg-isometrica-success/10', MEDIO: 'text-isometrica-warning bg-isometrica-warning/10', DIFICIL: 'text-isometrica-danger bg-isometrica-danger/10' }

export default function BancoQuestoesPage() {
  const { usuario } = useAuth()

  const [busca, setBusca] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [topicSelecionado, setTopicSelecionado] = useState('')
  const [dificuldade, setDificuldade] = useState('')
  const [arvoreAberta, setArvoreAberta] = useState<Record<string, boolean>>({})
  const [pagina, setPagina] = useState(1)
  const [questaoSelecionada, setQuestaoSelecionada] = useState<Questao | null>(null)

  const params: Record<string, string> = { page: String(pagina), limit: '15' }
  if (searchTerm) params.search = searchTerm
  if (topicSelecionado) params.topicId = topicSelecionado
  if (dificuldade) params.difficulty = dificuldade

  const { data: questionsResponse, isLoading: carregando } = useQuestions(params)
  const { data: rawArvore = [] } = useSubjectTree()
  const { data: rawStats } = useQuestionStats(questaoSelecionada?.id ?? '')
  const { data: rawDominio } = useTopicMastery(usuario && questaoSelecionada ? questaoSelecionada.topicId : '')

  const questoes = (questionsResponse?.data ?? []) as ExtendedQuestao[]
  const total = questionsResponse?.total ?? 0
  const totalPaginas = questionsResponse?.totalPages ?? 1
  const arvore = rawArvore as unknown as ExtendedTreeItem[]
  const statsQuestao = rawStats as ExtendedQuestionStats | undefined
  const dominio = rawDominio as ExtendedTopicMastery | undefined

  useEffect(() => { setPagina(1) }, [topicSelecionado, dificuldade, searchTerm])

  function verQuestao(q: Questao) {
    setQuestaoSelecionada(q)
  }

  const toggleArvore = (id: string) => setArvoreAberta((p) => ({ ...p, [id]: !p[id] }))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-12">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Banco de Questões</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{total} questões disponíveis na plataforma</p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Sidebar — Árvore + Filtros */}
        <motion.div variants={item} className="space-y-4 lg:col-span-1">
          {/* Busca */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-isometrica-accent">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchTerm(busca); setPagina(1) } }}
              placeholder="Buscar questões..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>

          {/* Dificuldade */}
          <div className="flex gap-1.5 flex-wrap">
            {diffs.map((d) => (
              <button key={d} onClick={() => setDificuldade(dificuldade === d ? '' : d)}
                className={cn('rounded-full px-3 py-1 text-[10px] font-semibold transition-all', dificuldade === d ? diffColor[d] : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                {diffLabel[d]}
              </button>
            ))}
          </div>

          {/* Árvore de Tópicos */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Disciplinas</h3>
            <div className="space-y-1">
              {arvore.map((s) => (
                <div key={s.id}>
                  <button onClick={() => toggleArvore(s.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted/50">
                    {arvoreAberta[s.id] ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />}
                    <BookOpen className="size-3 shrink-0 text-isometrica-accent" />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-[9px] text-muted-foreground">{s.totalQuestions}</span>
                  </button>
                  {arvoreAberta[s.id] && (
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {s.children.map((t) => (
                        <button key={t.id} onClick={() => setTopicSelecionado(topicSelecionado === t.id ? '' : t.id)}
                          className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors',
                            topicSelecionado === t.id ? 'bg-isometrica-accent/10 text-isometrica-accent font-semibold' : 'text-muted-foreground hover:bg-muted/50')}>
                          <span className="size-1.5 rounded-full bg-current shrink-0" />
                          <span className="flex-1 truncate">{t.name}</span>
                          <span className="text-[9px]">{t.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista de Questões */}
        <motion.div variants={item} className="lg:col-span-3 space-y-4">
          {carregando ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : questoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <FileQuestion className="mb-3 size-10 text-muted-foreground/40" />
              <h3 className="text-sm font-semibold">Nenhuma questão encontrada</h3>
              <p className="mt-1 text-xs text-muted-foreground">Tente ajustar os filtros ou buscar por outro termo.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{total} questão{(total ?? 0) !== 1 ? 'ões' : ''}</span>
                {topicSelecionado && <button onClick={() => setTopicSelecionado('')} className="text-isometrica-accent hover:underline">Limpar filtro</button>}
              </div>

              {questoes.map((q) => {
                const isSelected = questaoSelecionada?.id === q.id
                return (
                  <div key={q.id} className={cn('rounded-xl border p-4 transition-all cursor-pointer',
                    isSelected ? 'border-isometrica-accent/40 bg-isometrica-accent/[0.02]' : 'border-border bg-card hover:border-isometrica-accent/20')}
                    onClick={() => verQuestao(q)}>
                    <div className="flex items-start gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">Q</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-relaxed line-clamp-2">{q.text}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[9px]">{q.topic?.name}</Badge>
                          <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', diffColor[q.difficulty])}>{diffLabel[q.difficulty]}</span>
                          {q.exam && <Badge variant="outline" className="text-[9px]">{q.exam.name}</Badge>}
                          <span className="text-[9px] text-muted-foreground">{q.estimatedTime}min</span>
                        </div>
                        {q.tags?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {q.tags.map((t) => (
                              <span key={t.id} className="rounded bg-muted/50 px-1.5 py-0.5 text-[8px] text-muted-foreground">#{t.tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={cn('size-4 shrink-0 transition-all', isSelected ? 'text-isometrica-accent rotate-90' : 'text-muted-foreground')} />
                    </div>

                    {/* Expandido */}
                    {isSelected && (
                      <div className="mt-4 border-t border-border pt-4 space-y-4">
                        {/* Alternativas */}
                        <div className="space-y-1.5">
                          {q.alternatives?.map((alt, i: number) => (
                            <div key={alt.id} className={cn('flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm', alt.isCorrect ? 'border-isometrica-success/40 bg-isometrica-success/[0.02]' : 'border-border')}>
                              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium border', alt.isCorrect ? 'border-isometrica-success bg-isometrica-success text-white' : 'border-border text-muted-foreground')}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1">{alt.text}</span>
                              {alt.isCorrect && <CheckCircle className="size-4 shrink-0 text-isometrica-success" />}
                            </div>
                          ))}
                        </div>

                        {/* Explicação */}
                        {q.explanation && (
                          <div className="rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center gap-1 mb-1"><Lightbulb className="size-3 text-muted-foreground" /><p className="text-xs font-semibold">Explicação</p></div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                          </div>
                        )}

                        {/* Estatísticas e Domínio */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {statsQuestao && (
                            <>
                              <div className="rounded-lg border border-border p-3 text-center">
                                <p className="font-display text-lg font-bold">{statsQuestao.accuracy}%</p>
                                <p className="text-[9px] text-muted-foreground">Acerto geral</p>
                              </div>
                              <div className="rounded-lg border border-border p-3 text-center">
                                <p className="font-display text-lg font-bold">{statsQuestao.totalAttempts}</p>
                                <p className="text-[9px] text-muted-foreground">Tentativas</p>
                              </div>
                              <div className="rounded-lg border border-border p-3 text-center">
                                <p className="font-display text-lg font-bold">{statsQuestao.avgTimeSeconds}s</p>
                                <p className="text-[9px] text-muted-foreground">Tempo médio</p>
                              </div>
                            </>
                          )}
                          {dominio && (
                            <div className={cn('rounded-lg border p-3 text-center', dominio.isMastered ? 'border-isometrica-success/30 bg-isometrica-success/[0.02]' : 'border-border')}>
                              <p className={cn('font-display text-lg font-bold', dominio.isMastered ? 'text-isometrica-success' : '')}>
                                {dominio.consecutiveCorrect}/{dominio.targetToMaster}
                              </p>
                              <p className="text-[9px] text-muted-foreground">{dominio.isMastered ? <span className="inline-flex items-center gap-1">Dominado! <Sparkles className="size-3 text-isometrica-success" /></span> : 'Acertos consecutivos'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {totalPaginas > 1 && (
                <Pagination currentPage={pagina} totalPages={totalPaginas} onPageChange={(p) => setPagina(p)} />
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
