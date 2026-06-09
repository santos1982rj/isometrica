'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Aula, Questao } from '@/lib/types'
import {
  ChevronRight, Play, FileText, CheckCircle, Circle, Check, ArrowLeft, ArrowRight,
  BookOpen, Download, FileDown, User, StickyNote, Lightbulb, FileQuestion, Sparkles, Menu, X,
} from 'lucide-react'

export default function AulaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const { usuario } = useAuth()
  const [aula, setAula] = useState<Aula | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [completa, setCompleta] = useState(false)
  const [completando, setCompletando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('descricao')
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [questoesCarregando, setQuestoesCarregando] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [quizEnviado, setQuizEnviado] = useState(false)
  const [notas, setNotas] = useState('')
  const [notasSalvas, setNotasSalvas] = useState(false)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const notasTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (id) {
      setQuestoesCarregando(true)
      api.conteudo.questoes(id).then(setQuestoes).catch(() => {}).finally(() => setQuestoesCarregando(false))
      setRespostas({}); setQuizEnviado(false)
      if (usuario) api.learning.anotacao(usuario.id, id).then((r) => setNotas(r.notes)).catch(() => {})
    }
  }, [id, usuario])

  useEffect(() => {
    setCarregando(true)
    api.conteudo.aula(id).then((d) => {
      setAula(d)
    }).catch(console.error).finally(() => setCarregando(false))
  }, [id])

  // Auto-save notas com debounce
  const salvarNotas = useCallback(async (texto: string) => {
    if (!usuario) return
    try {
      await api.learning.salvarAnotacao(usuario.id, id, texto)
      setNotasSalvas(true)
      setTimeout(() => setNotasSalvas(false), 2000)
    } catch {}
  }, [usuario, id])

  function handleNotasChange(v: string) {
    setNotas(v)
    if (notasTimer.current) clearTimeout(notasTimer.current)
    notasTimer.current = setTimeout(() => salvarNotas(v), 1500)
  }

  async function toggleCompletar() {
    if (!usuario) return
    setCompletando(true)
    const novo = !completa
    try {
      await api.learning.marcarProgresso(usuario.id, id, novo)
      setCompleta(novo)
    } catch {} finally { setCompletando(false) }
  }

  if (carregando) return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="aspect-video animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="hidden w-80 shrink-0 space-y-4 lg:block">
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )

  if (!aula) return (
    <div className="flex flex-col items-center justify-center py-24">
      <FileText className="mb-3 size-12 text-muted-foreground/40" />
      <h2 className="font-display text-xl font-bold">Aula não encontrada</h2>
      <Link href="/cursos" className="mt-2 text-sm text-isometrica-accent hover:underline no-underline">Ver cursos</Link>
    </div>
  )

  const curso = aula.module?.course
  const moduloId = aula.module?.id
  const aulasModulo = aula.moduleLessons ?? []
  const videoEmbedUrl = aula.contentUrl?.replace('watch?v=', 'embed/')?.split('&')[0]
  const prof = (aula as any).professor
  const materials: { name: string; url: string }[] = (aula as any).materials ?? []

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* COLUNA PRINCIPAL */}
        <div className="min-w-0 flex-1 px-4 pt-4 lg:px-0 lg:pt-8">

          {/* Breadcrumb + Mobile hamburger */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setSidebarAberta(true)} className="flex size-8 items-center justify-center rounded-lg border border-border lg:hidden hover:bg-muted">
              <Menu className="size-4" />
            </button>
            <nav className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground overflow-hidden">
              <Link href="/dashboard" className="hover:text-foreground transition-colors no-underline shrink-0">Dashboard</Link>
              <ChevronRight className="size-3 shrink-0" />
              <Link href="/cursos" className="hover:text-foreground transition-colors no-underline shrink-0">Cursos</Link>
              <ChevronRight className="size-3 shrink-0" />
              <Link href={`/cursos/${curso?.id}`} className="hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-[160px] no-underline shrink-0">{curso?.name ?? 'Curso'}</Link>
              <ChevronRight className="size-3 shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[100px] sm:max-w-[200px]">{aula.title}</span>
            </nav>
          </div>

          {/* Título */}
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{aula.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-[10px]">{aula.type === 'video' ? 'Vídeo' : 'Texto'}</Badge>
            {aula.free && <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px]">Grátis</Badge>}
            <span>{aula.module?.name}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>aula {aula.currentLessonIndex} de {aula.totalLessons}</span>
          </div>

          {/* Player */}
          <div className="mt-4 sm:mt-5">
            {videoEmbedUrl ? (
              <div className="relative overflow-hidden rounded-xl bg-black shadow-lg" style={{ aspectRatio: '16/9' }}>
                <iframe src={videoEmbedUrl} className="absolute inset-0 size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-gradient-to-br from-isometrica-primary/[0.03] to-isometrica-accent/[0.03] border border-border">
                <Play className="mb-3 size-14 sm:size-16 text-muted-foreground/15" />
                <p className="text-sm text-muted-foreground">Vídeo em produção</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 sm:mt-8">
            <div className="flex gap-4 sm:gap-6 border-b border-border overflow-x-auto">
              {[
                { key: 'descricao', label: 'Descrição', icon: BookOpen },
                { key: 'anotacoes', label: 'Anotações', icon: StickyNote },
                { key: 'exercicios', label: 'Exercícios', icon: FileQuestion },
              ].map((a) => (
                <button key={a.key} onClick={() => setAbaAtiva(a.key)}
                  className={`flex items-center gap-1.5 border-b-2 pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    abaAtiva === a.key ? 'border-isometrica-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  <a.icon className="size-4" /> {a.label}
                </button>
              ))}
            </div>

            <div className="pt-4">
              {abaAtiva === 'descricao' && (
                aula.content ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-a:text-isometrica-accent" dangerouslySetInnerHTML={{ __html: aula.content }} />
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
                    <Lightbulb className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Descrição sendo preparada</p>
                  </div>
                )
              )}

              {abaAtiva === 'anotacoes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Suas anotações</p>
                      <p className="text-xs text-muted-foreground">Salvamento automático após 1,5s parado</p>
                    </div>
                    {notasSalvas && <span className="text-[10px] font-medium text-isometrica-success flex items-center gap-1"><CheckCircle className="size-3" />Salvo</span>}
                    {!notasSalvas && notas && <span className="text-[10px] text-muted-foreground">Salvando...</span>}
                  </div>
                  <textarea value={notas} onChange={(e) => handleNotasChange(e.target.value)} rows={6}
                    className="w-full resize-none rounded-lg border border-border bg-background p-4 text-sm outline-none transition-all focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"
                    placeholder="Escreva suas anotações sobre esta aula..." />
                </div>
              )}

              {abaAtiva === 'exercicios' && (
                <div>
                  {questoesCarregando ? (
                    <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
                  ) : questoes.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
                      <FileQuestion className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                      <p className="text-sm font-medium">Nenhuma questão disponível</p>
                      <p className="mt-1 text-xs text-muted-foreground">Questões relacionadas ao conteúdo aparecerão aqui.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{questoes.length} questão{questoes.length > 1 ? 'ões' : ''}
                          {quizEnviado && <span className="ml-2 font-semibold text-isometrica-success">— {questoes.filter((q, i) => respostas[q.id] === q.alternatives.find((a) => a.isCorrect)?.id).length}/{questoes.length} acertos</span>}
                        </p>
                        {!quizEnviado && Object.keys(respostas).length === questoes.length && (
                          <button onClick={async () => {
                            setQuizEnviado(true)
                            if (usuario) questoes.forEach((q) => {
                              const esc = respostas[q.id]; const correta = q.alternatives.find((a) => a.isCorrect)
                              api.learning.enviarTentativa({ userId: usuario.id, questionId: q.id, selectedId: esc ?? '', correct: esc === correta?.id }).catch(() => {})
                            })
                          }} className="rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90">Corrigir</button>
                        )}
                        {quizEnviado && <button onClick={() => { setRespostas({}); setQuizEnviado(false) }} className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">Tentar novamente</button>}
                      </div>

                      {questoes.map((q, idx) => {
                        const esc = respostas[q.id]
                        const correta = q.alternatives.find((a) => a.isCorrect)
                        const acertou = esc === correta?.id
                        return (
                          <div key={q.id} className={cn('rounded-xl border p-4 sm:p-5 transition-colors', quizEnviado ? acertou ? 'border-isometrica-success/40 bg-isometrica-success/[0.02]' : 'border-isometrica-danger/40 bg-isometrica-danger/[0.02]' : 'border-border bg-card')}>
                            <div className="flex items-start gap-3">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">{idx + 1}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">{q.topic?.name} · {q.difficulty === 'EASY' ? 'Fácil' : q.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}</p>
                              </div>
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {q.alternatives.map((alt) => {
                                const sel = esc === alt.id; const feedback = quizEnviado
                                return (
                                  <button key={alt.id} onClick={() => { if (!quizEnviado) setRespostas((p) => ({ ...p, [q.id]: alt.id })) }} disabled={quizEnviado}
                                    className={cn('flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 text-left text-sm transition-all',
                                      feedback ? alt.isCorrect ? 'border-isometrica-success/50 bg-isometrica-success/[0.03]' : sel && !alt.isCorrect ? 'border-isometrica-danger/50 bg-isometrica-danger/[0.03]' : 'border-border'
                                      : sel ? 'border-isometrica-accent/50 bg-isometrica-accent/[0.03]' : 'border-border hover:bg-muted/50')}>
                                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium', sel && !feedback ? 'border-isometrica-accent bg-isometrica-accent text-white' : 'border-border')}>
                                      {String.fromCharCode(65 + q.alternatives.indexOf(alt))}
                                    </span>
                                    <span className="flex-1">{alt.text}</span>
                                    {feedback && alt.isCorrect && <CheckCircle className="size-4 shrink-0 text-isometrica-success" />}
                                  </button>
                                )
                              })}
                            </div>
                            {quizEnviado && !acertou && (
                              <Link href={`/tutor?pergunta=${encodeURIComponent(`Explique por que errei esta questão: "${q.text}". A resposta correta era "${correta?.text}".`)}`}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[11px] font-semibold text-muted-foreground transition-all hover:border-isometrica-accent hover:text-isometrica-accent">
                                <Sparkles className="size-3.5" /> Explique por que errei
                              </Link>
                            )}
                            {quizEnviado && q.explanation && (
                              <p className="mt-3 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ações Inferiores */}
          <div className="mt-6 sm:mt-8 mb-6 rounded-xl border border-border bg-card p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {aula.prevLessonId ? (
                <Link href={`/aulas/${aula.prevLessonId}`} onClick={() => setSidebarAberta(false)} className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted no-underline">
                  <ArrowLeft className="size-4" /> Anterior
                </Link>
              ) : (
                <span className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
                  <ArrowLeft className="size-4" /> Anterior
                </span>
              )}
              {aula.nextLessonId ? (
                <Link href={`/aulas/${aula.nextLessonId}`} onClick={() => setSidebarAberta(false)} className="flex items-center justify-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 no-underline">
                  Próxima <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
                  Próxima <ArrowRight className="size-4" />
                </span>
              )}
            </div>

            <button onClick={toggleCompletar} disabled={completando}
              className={cn('mt-2 sm:mt-0 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 sm:py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60',
                completa ? 'bg-isometrica-success/10 text-isometrica-success border border-isometrica-success/30' : 'bg-isometrica-accent text-white hover:bg-isometrica-accent/90')}>
              {completando ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : completa ? <CheckCircle className="size-4" /> : <Circle className="size-4" />}
              {completa ? 'Concluída' : 'Marcar como concluída'}
            </button>

            <div className="hidden sm:flex items-center justify-between gap-4 mt-3">
              <div>
                {aula.prevLessonId ? (
                  <Link href={`/aulas/${aula.prevLessonId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-all hover:bg-muted no-underline">
                    <ArrowLeft className="size-4" /> Anterior
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground opacity-40 cursor-not-allowed">
                    <ArrowLeft className="size-4" /> Anterior
                  </span>
                )}
              </div>
              <div>
                {aula.nextLessonId ? (
                  <Link href={`/aulas/${aula.nextLessonId}`} className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 no-underline">
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
        </div>

        {/* COLUNA LATERAL */}
        {sidebarAberta && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarAberta(false)} />}

        <aside className={`fixed inset-y-0 right-0 z-40 w-80 border-l border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 lg:border-l-0 ${sidebarAberta ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="flex h-full flex-col">
            {/* Header mobile */}
            <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
              <h3 className="text-sm font-semibold">Conteúdo</h3>
              <button onClick={() => setSidebarAberta(false)} className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-0 lg:pt-8 space-y-5">
              {/* Accordion de Módulos */}
              <div className="rounded-xl border border-border bg-card overflow-hidden lg:border-0">
                <div className="border-b border-border bg-muted/50 px-4 py-3 hidden lg:block">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold"><BookOpen className="size-4 text-isometrica-accent" /> Conteúdo do curso</h3>
                </div>
                <div className="p-2">
                  <Accordion defaultValue={[moduloId ?? '']} className="space-y-0.5">
                    {(aula.module ? [{ ...aula.module, lessons: aulasModulo }] : []).map((mod: any) => (
                      <AccordionItem key={mod.id} value={mod.id} className="border-0">
                        <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted/60 [&[data-state=open]]:bg-muted/60 no-underline transition-colors">
                          <span className="text-left leading-snug"><span className="text-xs text-muted-foreground font-normal">Módulo {mod.order}</span><br />{mod.name}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pt-0.5">
                          <div className="space-y-0.5 pl-1">
                            {mod.lessons.map((l: any) => {
                              const ativa = l.id === id; const concluida = completa && ativa
                              return (
                                <Link key={l.id} href={`/aulas/${l.id}`} onClick={() => setSidebarAberta(false)}
                                  className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors no-underline',
                                    ativa ? 'bg-isometrica-accent/10 text-isometrica-accent font-semibold' : concluida ? 'text-isometrica-success' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
                                  {concluida ? <CheckCircle className="size-3.5 shrink-0 text-isometrica-success" /> : ativa ? <Play className="size-3.5 shrink-0 text-isometrica-accent" /> : <Circle className="size-3.5 shrink-0 text-muted-foreground/40" />}
                                  <span className="line-clamp-2 leading-snug flex-1">{l.order}. {l.title}</span>
                                  {l.free && <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[8px] px-1 py-0">Livre</Badge>}
                                </Link>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>

              {/* Card Professor */}
              {prof && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professor</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-bold text-white shadow-sm">
                      {prof.name?.[0] ?? 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{prof.name ?? 'Professor'}</p>
                      {prof.title && <p className="text-xs text-muted-foreground">{prof.title}</p>}
                      <p className="text-[10px] text-muted-foreground/70">{curso?.subject?.name ?? 'Engenharia'}</p>
                      {(prof.lattes || prof.linkedin) && (
                        <div className="mt-1 flex items-center gap-2">
                          {prof.lattes && <a href={prof.lattes} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">Lattes</a>}
                          {prof.linkedin && <a href={prof.linkedin} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">LinkedIn</a>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Materiais da Aula */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileDown className="size-3.5" /> Materiais da aula
                </h4>
                {materials.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhum material disponível</p>
                ) : (
                  <div className="space-y-2">
                    {materials.map((mat: any, i: number) => (
                      <a key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-isometrica-accent/10">
                          <Download className="size-3.5 text-isometrica-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-tight truncate">{mat.name ?? 'Material'}</p>
                          {mat.url && <p className="text-[10px] text-muted-foreground truncate">{mat.url.split('/').pop()}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
