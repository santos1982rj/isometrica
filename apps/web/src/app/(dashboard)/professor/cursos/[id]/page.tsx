'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCourse, useTopics, useCreateQuestion, useModules, useLessons } from '@/lib/queries'
import type { Questao } from '@/lib/types'
import {
  ChevronLeft,
  Plus,
  Save,
  Trash2,
  Edit,
  X,
  Play,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileQuestion,
} from 'lucide-react'

interface Modulo {
  id: string
  name: string
  order: number
  lessons: Aula[]
}

interface Aula {
  id: string
  title: string
  type: string
  order: number
  content?: string
  contentUrl?: string
}

export default function CursoDetalheProfessor(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const queryClient = useQueryClient()
  const { data: curso, isLoading } = useCourse(id)
  const { data: allTopics } = useTopics()
  const [moduloAberto, setModuloAberto] = useState<string | null>(null)

  // Module form
  const [showModuloForm, setShowModuloForm] = useState(false)
  const [moduloNome, setModuloNome] = useState('')
  const [moduloOrdem, setModuloOrdem] = useState(1)
  const [editandoModulo, setEditandoModulo] = useState<string | null>(null)

  // Lesson form
  const [showAulaForm, setShowAulaForm] = useState<string | null>(null)
  const [aulaTitulo, setAulaTitulo] = useState('')
  const [aulaTipo, setAulaTipo] = useState<'video' | 'text'>('video')
  const [aulaOrdem, setAulaOrdem] = useState(1)
  const [aulaConteudo, setAulaConteudo] = useState('')
  const [aulaVideoUrl, setAulaVideoUrl] = useState('')
  const [editandoAula, setEditandoAula] = useState<string | null>(null)

  const [enviando, setEnviando] = useState(false)

  // Questions
  const [topics, setTopics] = useState<{ id: string; name: string; subjectId: string }[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [qText, setQText] = useState('')
  const [qDifficulty, setQDifficulty] = useState('EASY')
  const [qBloom, setQBloom] = useState('REMEMBER')
  const [qExplanation, setQExplanation] = useState('')
  const [qAlternatives, setQAlternatives] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }])
  const [criandoQuestao, setCriandoQuestao] = useState(false)
  const [questoesCurso, setQuestoesCurso] = useState<Questao[]>([])

  const createModule = useModules()
  const createLesson = useLessons()
  const createQuestion = useCreateQuestion()

  useEffect(() => {
    const subjectId = curso?.subject?.id
    if (subjectId && allTopics) {
      setTopics(allTopics.filter((t) => t.subjectId === subjectId))
    }
  }, [curso?.subject?.id, allTopics])

  // Module CRUD
  async function salvarModulo(e: React.FormEvent) {
    e.preventDefault()
    if (!moduloNome.trim()) return
    setEnviando(true)
    try {
      if (editandoModulo) {
        await api.courses.atualizarModulo(editandoModulo, { name: moduloNome, order: moduloOrdem })
      } else {
        await createModule.mutateAsync({ courseId: id, data: { name: moduloNome, order: moduloOrdem } })
      }
      setModuloNome('')
      setModuloOrdem((curso?.modules?.length ?? 0) + 1)
      setEditandoModulo(null)
      setShowModuloForm(false)
      queryClient.invalidateQueries({ queryKey: ['courses', id] })
    } catch {
      toast.error('Erro ao salvar módulo')
    } finally {
      setEnviando(false)
    }
  }

  function editarModulo(mod: Modulo) {
    setModuloNome(mod.name)
    setModuloOrdem(mod.order)
    setEditandoModulo(mod.id)
    setShowModuloForm(true)
  }

  async function removerModulo(modId: string) {
    if (!confirm('Remover este módulo e todas as suas aulas?')) return
    try {
      await api.courses.removerModulo(modId)
      queryClient.invalidateQueries({ queryKey: ['courses', id] })
    } catch {
      toast.error('Erro ao remover módulo')
    }
  }

  // Lesson CRUD
  function abrirAulaForm(moduloId: string, aula?: Aula) {
    setShowAulaForm(moduloId)
    if (aula) {
      setAulaTitulo(aula.title)
      setAulaTipo(aula.type as 'video' | 'text')
      setAulaOrdem(aula.order)
      setAulaConteudo(aula.content ?? '')
      setAulaVideoUrl(aula.contentUrl ?? '')
      setEditandoAula(aula.id)
    } else {
      setAulaTitulo('')
      setAulaTipo('video')
      setAulaOrdem(1)
      setAulaConteudo('')
      setAulaVideoUrl('')
      setEditandoAula(null)
    }
  }

  async function salvarAula(e: React.FormEvent) {
    e.preventDefault()
    if (!aulaTitulo.trim() || !showAulaForm) return
    setEnviando(true)
    try {
      if (editandoAula) {
        await api.courses.atualizarAula(editandoAula, { title: aulaTitulo, content: aulaConteudo || undefined, contentUrl: aulaVideoUrl || undefined })
      } else {
        await createLesson.mutateAsync({ moduleId: showAulaForm, data: { title: aulaTitulo, type: aulaTipo, order: aulaOrdem, content: aulaConteudo || undefined, contentUrl: aulaVideoUrl || undefined } })
      }
      setShowAulaForm(null)
      setEditandoAula(null)
      queryClient.invalidateQueries({ queryKey: ['courses', id] })
    } catch {
      toast.error('Erro ao salvar aula')
    } finally {
      setEnviando(false)
    }
  }

  async function removerAula(aulaId: string) {
    if (!confirm('Remover esta aula?')) return
    try {
      await api.courses.removerAula(aulaId)
      queryClient.invalidateQueries({ queryKey: ['courses', id] })
    } catch {
      toast.error('Erro ao remover aula')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!curso) return <p>Curso não encontrado</p>

  const modulos = (curso.modules ?? []) as Modulo[]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <Link href="/professor/cursos" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" />
          Meus Cursos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{curso.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{curso.description}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5">{curso.subject?.name}</span>
              <span>{modulos.length} módulos</span>
              <span>{modulos.reduce((a, m) => a + m.lessons.length, 0)} aulas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Módulos e Aulas</h2>
          <button
            onClick={() => { setShowModuloForm(true); setEditandoModulo(null); setModuloNome(''); setModuloOrdem(modulos.length + 1) }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-isometrica-accent/90"
          >
            <Plus className="size-3.5" />
            Adicionar Módulo
          </button>
        </div>

        <AnimatePresence>
          {showModuloForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={salvarModulo}
              className="overflow-hidden rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nome do módulo</label>
                  <input
                    value={moduloNome}
                    onChange={(e) => setModuloNome(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                    placeholder="Ex: Conceitos Básicos"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Ordem</label>
                  <input
                    type="number"
                    value={moduloOrdem}
                    onChange={(e) => setModuloOrdem(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button type="submit" disabled={enviando} className="rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90 disabled:opacity-50">
                    {enviando ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  </button>
                  <button type="button" onClick={() => setShowModuloForm(false)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {modulos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <BookOpen className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum módulo ainda. Adicione o primeiro!</p>
          </div>
        ) : (
          modulos.map((modulo) => (
            <div key={modulo.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => setModuloAberto(moduloAberto === modulo.id ? null : modulo.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-isometrica-accent/10">
                  <BookOpen className="size-4 text-isometrica-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Módulo {modulo.order}: {modulo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{modulo.lessons.length} aulas</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); editarModulo(modulo) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <Edit className="size-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removerModulo(modulo.id) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-isometrica-danger/10 hover:text-isometrica-danger">
                    <Trash2 className="size-3.5" />
                  </button>
                  {moduloAberto === modulo.id ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {moduloAberto === modulo.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="divide-y divide-border">
                      {modulo.lessons.map((aula) => (
                        <div key={aula.id} className="flex items-center gap-3 px-5 py-3">
                          {aula.type === 'video' ? (
                            <Play className="size-4 shrink-0 text-isometrica-accent" />
                          ) : (
                            <FileText className="size-4 shrink-0 text-isometrica-primary" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{aula.order}. {aula.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{aula.type}</p>
                          </div>
                          <button onClick={() => abrirAulaForm(modulo.id, aula)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                            <Edit className="size-3.5" />
                          </button>
                          <button onClick={() => removerAula(aula.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-isometrica-danger/10 hover:text-isometrica-danger">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showAulaForm === modulo.id && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={salvarAula}
                          className="border-t border-border p-4 space-y-3"
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Título da aula</label>
                              <input value={aulaTitulo} onChange={(e) => setAulaTitulo(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" placeholder="Ex: Introdução à Flexão" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                              <select value={aulaTipo} onChange={(e) => setAulaTipo(e.target.value as 'video' | 'text')} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent">
                                <option value="video">Vídeo</option>
                                <option value="text">Texto</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Ordem</label>
                              <input type="number" value={aulaOrdem} onChange={(e) => setAulaOrdem(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" />
                            </div>
                            {aulaTipo === 'video' && (
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">URL do Vídeo</label>
                                <input value={aulaVideoUrl} onChange={(e) => setAulaVideoUrl(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" placeholder="https://..." />
                              </div>
                            )}
                          </div>

                          {aulaTipo === 'text' && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Conteúdo (HTML)</label>
                              <textarea value={aulaConteudo} onChange={(e) => setAulaConteudo(e.target.value)} rows={4} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" />
                            </div>
                          )}

                          <div className="flex gap-1.5 pt-1">
                            <button type="submit" disabled={enviando} className="rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90 disabled:opacity-50">
                              {enviando ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                              {editandoAula ? 'Atualizar' : 'Adicionar'}
                            </button>
                            <button type="button" onClick={() => setShowAulaForm(null)} className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">Cancelar</button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="border-t border-border px-5 py-2.5">
                      <button
                        onClick={() => abrirAulaForm(modulo.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-isometrica-accent"
                      >
                        <Plus className="size-3.5" />
                        Adicionar aula
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Questões */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-success/10">
              <FileQuestion className="size-3.5 text-isometrica-success" />
            </div>
            <h2 className="font-display text-lg font-bold">Questões ({topics.length} tópicos disponíveis)</h2>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tópico</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
              >
                <option value="">Selecione um tópico</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {selectedTopic && (
              <div className="space-y-4 border-t border-border pt-4">
                <p className="text-sm font-semibold">Nova Questão</p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Enunciado *</label>
                  <textarea value={qText} onChange={(e) => setQText(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" placeholder="Digite o enunciado da questão" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Dificuldade</label>
                    <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent">
                      <option value="EASY">Fácil</option>
                      <option value="MEDIUM">Médio</option>
                      <option value="HARD">Difícil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Nível de Bloom</label>
                    <select value={qBloom} onChange={(e) => setQBloom(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent">
                      <option value="REMEMBER">Lembrar</option>
                      <option value="UNDERSTAND">Entender</option>
                      <option value="APPLY">Aplicar</option>
                      <option value="ANALYZE">Analisar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Explicação (opcional)</label>
                  <textarea value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent" placeholder="Explicação que aparece após o aluno responder" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Alternativas * (marque a correta)</p>
                  {qAlternatives.map((alt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        onClick={() => setQAlternatives(qAlternatives.map((a, j) => ({ ...a, isCorrect: j === i })))}
                        className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          alt.isCorrect ? 'bg-isometrica-success text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                      <input
                        value={alt.text}
                        onChange={(e) => {
                          const novo = [...qAlternatives]
                          novo[i].text = e.target.value
                          setQAlternatives(novo)
                        }}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                        placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  disabled={criandoQuestao || !qText.trim() || qAlternatives.some((a) => !a.text.trim()) || !qAlternatives.some((a) => a.isCorrect)}
                  onClick={async () => {
                    setCriandoQuestao(true)
                    try {
                      await createQuestion.mutateAsync({
                        text: qText, topicId: selectedTopic, difficulty: qDifficulty,
                        bloomLevel: qBloom, explanation: qExplanation || undefined,
                        alternatives: qAlternatives,
                      })
                      setQText(''); setQExplanation(''); setQDifficulty('EASY')
                      setQBloom('REMEMBER')
                      setQAlternatives(qAlternatives.map((a) => ({ ...a, text: '', isCorrect: false })))
                      qAlternatives[0].isCorrect = true
                      toast.success('Questão criada com sucesso!')
                    } catch {
                      toast.error('Erro ao criar questão')
                    } finally {
                      setCriandoQuestao(false)
                    }
                  }}
                  className="rounded-lg bg-isometrica-success px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-success/90 disabled:opacity-50"
                >
                  {criandoQuestao ? 'Salvando...' : 'Salvar Questão'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
