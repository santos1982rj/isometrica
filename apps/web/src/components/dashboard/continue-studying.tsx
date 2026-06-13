'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, FileText, Sparkles } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface NextLessonItem {
  courseId: string
  courseName: string
  lessonId: string
  lessonTitle: string
  type: string
  progress: number
  totalLessons: number
  completedLessons: number
}

interface ContinueStudyingProps {
  nextLessons: NextLessonItem[]
}

export function ContinueStudying({ nextLessons }: ContinueStudyingProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
            <Play className="size-3.5 text-isometrica-info" />
          </div>
          <h3 className="text-sm font-semibold">Continue de onde parou</h3>
        </div>
        <Link href="/cursos" className="text-xs font-medium text-muted-foreground hover:text-isometrica-accent transition-colors">
          Ver todos →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {nextLessons.length === 0 ? (
          <p className="col-span-1 sm:col-span-2 py-8 text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">Todos os cursos concluídos! <Sparkles className="size-3 text-isometrica-accent" /></span>
          </p>
        ) : (
          nextLessons.map((item) => (
            <Link key={item.lessonId} href={`/aulas/${item.lessonId}`} className="flex items-start gap-3 group">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-isometrica-accent/10 group-hover:bg-isometrica-accent/20 transition-colors">
                {item.type === 'video' ? <Play className="size-4 text-isometrica-accent" /> : <FileText className="size-4 text-isometrica-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{item.courseName}</p>
                <h4 className="mt-0.5 text-sm font-semibold leading-tight group-hover:text-isometrica-accent transition-colors">{item.lessonTitle}</h4>
                <p className="text-xs text-muted-foreground">{item.completedLessons} de {item.totalLessons} aulas</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-isometrica-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{item.progress}%</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </motion.div>
  )
}
