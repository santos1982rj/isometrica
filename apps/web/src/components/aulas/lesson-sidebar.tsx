'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BookOpen, CheckCircle, Play, Circle, X, FileDown, Download } from 'lucide-react'
import type { Modulo, Aula } from '@/lib/types'

interface LessonSidebarProps {
  moduloId: string
  aulasModulo: Aula[]
  aula: Aula
  completa: boolean
  id: string
  sidebarAberta: boolean
  setSidebarAberta: (v: boolean) => void
  professor?: { name?: string | null; title?: string | null; lattes?: string | null; linkedin?: string | null } | null
  materials?: { name: string; url: string; type: string }[]
  subjectName?: string | null
}

export function LessonSidebar({
  moduloId,
  aulasModulo,
  aula,
  completa,
  id,
  sidebarAberta,
  setSidebarAberta,
  professor,
  materials = [],
  subjectName,
}: LessonSidebarProps) {
  return (
    <>
      {sidebarAberta && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarAberta(false)} />}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-80 border-l border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 lg:border-l-0 ${sidebarAberta ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
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
                  {(aula.module ? [{ ...aula.module, order: 0, lessons: aulasModulo }] : []).map((mod: Modulo) => (
                    <AccordionItem key={mod.id} value={mod.id} className="border-0">
                      <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted/60 [&[data-state=open]]:bg-muted/60 no-underline transition-colors">
                        <span className="text-left leading-snug"><span className="text-xs text-muted-foreground font-normal">Módulo {mod.order}</span><br />{mod.name}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-1 pt-0.5">
                        <div className="space-y-0.5 pl-1">
                          {mod.lessons.map((l: Aula) => {
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
            {professor && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professor</h4>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-bold text-white shadow-sm">
                    {professor.name?.[0] ?? 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{professor.name ?? 'Professor'}</p>
                    {professor.title && <p className="text-xs text-muted-foreground">{professor.title}</p>}
                    <p className="text-[10px] text-muted-foreground/70">{subjectName ?? 'Engenharia'}</p>
                    {(professor.lattes || professor.linkedin) && (
                      <div className="mt-1 flex items-center gap-2">
                        {professor.lattes && <a href={professor.lattes} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">Lattes</a>}
                        {professor.linkedin && <a href={professor.linkedin} target="_blank" className="text-[10px] text-isometrica-accent hover:underline">LinkedIn</a>}
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
                  {materials.map((mat, i) => (
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
    </>
  )
}
