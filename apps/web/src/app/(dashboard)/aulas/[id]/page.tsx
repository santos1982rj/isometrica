'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useNote, useSaveNote, useMarkProgress, useSubmitAttempt } from '@/lib/queries'
import type { Aula, Questao } from '@/lib/types'
import {
  ChevronRight, BookOpen, StickyNote, FileQuestion, Lightbulb, CheckCircle, FileText, Menu,
} from 'lucide-react'
import { VideoPlayer } from '@/components/aulas/video-player'
import { QuizSection } from '@/components/aulas/quiz-section'
import { LessonSidebar } from '@/components/aulas/lesson-sidebar'
import { ActionBar } from '@/components/aulas/action-bar'

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
  const [notas, setNotas] = useState('')
  const [notasSalvas, setNotasSalvas] = useState(false)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const notasTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const { data: notaData } = useNote(usuario?.id ?? '', id)
  const saveNoteMutation = useSaveNote()
  const submitAttemptMutation = useSubmitAttempt()
  const markProgressMutation = useMarkProgress()

  useEffect(() => {
    if (notaData?.notes !== undefined) setNotas(notaData.notes)
  }, [notaData])

  useEffect(() => {
    if (id) {
      setQuestoesCarregando(true)
      api.conteudo.questoes(id).then(setQuestoes).catch(() => {}).finally(() => setQuestoesCarregando(false))
    }
  }, [id])

  useEffect(() => {
    setCarregando(true)
    api.conteudo.aula(id).then((d) => {
      setAula(d)
    }).catch(console.error).finally(() => setCarregando(false))
  }, [id])

  const salvarNotas = useCallback(async (texto: string) => {
    if (!usuario) return
    try {
      await saveNoteMutation.mutateAsync({ userId: usuario.id, lessonId: id, notes: texto })
      setNotasSalvas(true)
      setTimeout(() => setNotasSalvas(false), 2000)
    } catch {}
  }, [usuario, id, saveNoteMutation])

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
      await markProgressMutation.mutateAsync({ userId: usuario.id, lessonId: id, completed: novo })
      setCompleta(novo)
    } catch {} finally { setCompletando(false) }
  }

  function handleQuizAttempt(attempts: { questionId: string; selectedId: string }[]) {
    if (usuario) {
      attempts.forEach((a) => {
        submitAttemptMutation.mutate({ questionId: a.questionId, selectedId: a.selectedId })
      })
    }
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
  const prof = aula.professor
  const materials = aula.materials ?? []

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
            <VideoPlayer videoUrl={videoEmbedUrl} title={aula.title} />
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
                <QuizSection
                  questoes={questoes}
                  carregando={questoesCarregando}
                  onAttempt={handleQuizAttempt}
                />
              )}
            </div>
          </div>

          {/* Ações Inferiores */}
          <ActionBar
            prevLessonId={aula.prevLessonId}
            nextLessonId={aula.nextLessonId}
            completa={completa}
            completando={completando}
            onToggleComplete={toggleCompletar}
            onNavigate={() => setSidebarAberta(false)}
          />
        </div>

        {/* COLUNA LATERAL */}
        <LessonSidebar
          moduloId={moduloId ?? ''}
          aulasModulo={aulasModulo}
          aula={aula}
          completa={completa}
          id={id}
          sidebarAberta={sidebarAberta}
          setSidebarAberta={setSidebarAberta}
          professor={prof}
          materials={materials}
          subjectName={curso?.subject?.name}
        />
      </div>
    </div>
  )
}
