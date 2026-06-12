'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useQuestions, useSubjectTree, useQuestionStats, useTopicMastery } from '@/lib/queries'
import type { Questao, QuestionTreeItem, QuestionStats, TopicMastery } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Pagination } from '@/components/pagination'
import { SubjectTree } from '@/components/banco-questoes/subject-tree'
import { QuestionCard } from '@/components/banco-questoes/question-card'
import { Search, FileQuestion, ArrowUpDown } from 'lucide-react'

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
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [bloomFiltro, setBloomFiltro] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [arvoreAberta, setArvoreAberta] = useState<Record<string, boolean>>({})
  const [pagina, setPagina] = useState(1)
  const [questaoSelecionada, setQuestaoSelecionada] = useState<Questao | null>(null)

  const params: Record<string, string> = { page: String(pagina), limit: '15', sort: sortBy }
  if (searchTerm) params.search = searchTerm
  if (topicSelecionado) params.topicId = topicSelecionado
  if (dificuldade) params.difficulty = dificuldade
  if (tipoFiltro) params.type = tipoFiltro
  if (bloomFiltro) params.bloomLevel = bloomFiltro

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

  useEffect(() => { setPagina(1) }, [topicSelecionado, dificuldade, searchTerm, tipoFiltro, bloomFiltro, sortBy])

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
        {/* Sidebar — Busca + Filtros + Árvore */}
        <motion.div variants={item} className="space-y-4 lg:col-span-1">
          {/* Busca */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-isometrica-accent">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchTerm(busca); setPagina(1) } }}
              placeholder="Buscar questões..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>

          {/* Dificuldade */}
          <div className="flex flex-wrap gap-1.5">
            {diffs.map((d) => (
              <button key={d} onClick={() => setDificuldade(dificuldade === d ? '' : d)}
                className={cn('rounded-full px-3 py-1 text-[10px] font-semibold transition-all', dificuldade === d ? diffColor[d] : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                {diffLabel[d]}
              </button>
            ))}
          </div>

          {/* Tipo */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">TIPO</p>
            <div className="flex flex-wrap gap-1.5">
              {[{ v: '', l: 'Todos' }, { v: 'MULTIPLA_ESCOLHA', l: 'Múltipla' }, { v: 'VERDADEIRO_FALSO', l: 'V/F' }].map((t) => (
                <button key={t.v} onClick={() => setTipoFiltro(t.v)}
                  className={cn('rounded-full px-3 py-1 text-[10px] font-semibold transition-all', tipoFiltro === t.v ? 'bg-isometrica-accent/10 text-isometrica-accent' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {/* Bloom Level */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">NÍVEL DE BLOOM</p>
            <div className="flex flex-wrap gap-1.5">
              {[{ v: '', l: 'Todos' }, { v: 'REMEMBER', l: 'Lembrar' }, { v: 'UNDERSTAND', l: 'Entender' }, { v: 'APPLY', l: 'Aplicar' }].map((b) => (
                <button key={b.v} onClick={() => setBloomFiltro(b.v)}
                  className={cn('rounded-full px-3 py-1 text-[10px] font-semibold transition-all', bloomFiltro === b.v ? 'bg-isometrica-accent/10 text-isometrica-accent' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                  {b.l}
                </button>
              ))}
            </div>
          </div>

          {/* Árvore de Tópicos */}
          <SubjectTree
            arvore={arvore}
            topicSelecionado={topicSelecionado}
            onSelectTopic={setTopicSelecionado}
            arvoreAberta={arvoreAberta}
            onToggleArvore={toggleArvore}
          />
        </motion.div>

        {/* Lista de Questões */}
        <motion.div variants={item} className="space-y-4 lg:col-span-3">
          {carregando ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
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
                <div className="flex items-center gap-2">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] outline-none">
                    <option value="recent">Mais recentes</option>
                    <option value="oldest">Mais antigas</option>
                    <option value="difficulty_desc">Difícil primeiro</option>
                    <option value="difficulty_asc">Fácil primeiro</option>
                  </select>
                  {topicSelecionado && <button onClick={() => setTopicSelecionado('')} className="text-isometrica-accent hover:underline">Limpar</button>}
                </div>
              </div>

              {questoes.map((q) => (
                <QuestionCard
                  key={q.id}
                  questao={q}
                  selecionada={questaoSelecionada?.id === q.id}
                  statsQuestao={questaoSelecionada?.id === q.id ? statsQuestao : undefined}
                  dominio={questaoSelecionada?.id === q.id ? dominio : undefined}
                  onVerQuestao={verQuestao}
                />
              ))}

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
