'use client'

import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TreeChild {
  id: string
  name: string
  count: number
}

interface TreeItem {
  id: string
  name: string
  totalQuestions?: number
  children: TreeChild[]
}

interface SubjectTreeProps {
  arvore: TreeItem[]
  topicSelecionado: string
  onSelectTopic: (id: string) => void
  arvoreAberta: Record<string, boolean>
  onToggleArvore: (id: string) => void
}

export function SubjectTree({ arvore, topicSelecionado, onSelectTopic, arvoreAberta, onToggleArvore }: SubjectTreeProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disciplinas</h3>
      <div className="space-y-1">
        {arvore.map((s) => (
          <div key={s.id}>
            <button
              onClick={() => onToggleArvore(s.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted/50"
            >
              {arvoreAberta[s.id] ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />}
              <BookOpen className="size-3 shrink-0 text-isometrica-accent" />
              <span className="flex-1 truncate">{s.name}</span>
              <span className="text-[9px] text-muted-foreground">{s.totalQuestions}</span>
            </button>
            {arvoreAberta[s.id] && (
              <div className="ml-4 mt-0.5 space-y-0.5">
                {s.children.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTopic(topicSelecionado === t.id ? '' : t.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition-colors',
                      topicSelecionado === t.id
                        ? 'bg-isometrica-accent/10 font-semibold text-isometrica-accent'
                        : 'text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-current" />
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
  )
}
