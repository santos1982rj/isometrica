'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronUp, ChevronDown, Play, Lock } from 'lucide-react'
import type { Modulo, ProgressoCurso } from '@/lib/types'

interface ModuleAccordionProps {
  modules: Modulo[]
  progresso?: ProgressoCurso | null
  isPremium: boolean
  temAcesso: boolean
}

export function ModuleAccordion({ modules, progresso, isPremium, temAcesso }: ModuleAccordionProps) {
  const [moduloAberto, setModuloAberto] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {modules.map((modulo) => {
        const aulas = modulo.lessons ?? []
        const aulasCompletas = progresso ? aulas.filter((a) => a.id && progresso.completed >= a.order).length : 0
        return (
          <div key={modulo.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button onClick={() => setModuloAberto(moduloAberto === modulo.id ? null : modulo.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-isometrica-accent/10">
                <BookOpen className="size-4 text-isometrica-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Módulo {modulo.order}: {modulo.name}</p>
                <p className="text-xs text-muted-foreground">{aulas.length} aulas</p>
              </div>
              {temAcesso && progresso && (
                <span className="text-[10px] font-medium text-isometrica-success">{aulasCompletas}/{aulas.length}</span>
              )}
              {moduloAberto === modulo.id ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
            </button>

            {moduloAberto === modulo.id && (
              <div className="border-t border-border divide-y divide-border">
                {aulas.map((aula) => {
                  const isFree = !isPremium || temAcesso
                  return (
                    <div key={aula.id} className="flex items-center gap-3 px-5 py-3">
                      <Play className="size-4 shrink-0 text-isometrica-accent" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{aula.order}. {aula.title}</p>
                          {aula.free && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">Grátis</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Vídeo</span>
                          {aula.materials && aula.materials.length > 0 && <span>· {aula.materials.length} material(is)</span>}
                        </div>
                      </div>
                      {(isFree || aula.free) ? (
                        <Link href={`/aulas/${aula.id}`} className="shrink-0 rounded-md border border-border px-3 py-1 text-[11px] font-semibold transition-all hover:border-isometrica-accent hover:text-isometrica-accent no-underline">
                          Assistir
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" /> Bloqueado</div>
                      )}
                    </div>
                  )
                })}
                {aulas.length === 0 && <p className="px-5 py-3 text-xs text-muted-foreground">Nenhuma aula ainda.</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
