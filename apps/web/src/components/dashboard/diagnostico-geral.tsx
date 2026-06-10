'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { DonutChart } from '@/components/dashboard/donut-chart'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface ProficienciaItem {
  proficiency: number
  topic?: {
    id: string
    name: string
    subject?: {
      id: string
      name: string
    }
  }
}

interface DiagnosticoGeralProps {
  proficiencia: ProficienciaItem[]
}

export function DiagnosticoGeral({ proficiencia }: DiagnosticoGeralProps) {
  const subjects = proficiencia.reduce<{ name: string; desc: string; pct: number; char: string; color: string; bg: string; barColor: string }[]>((acc, item) => {
    const subjectName = item.topic?.subject?.name ?? item.topic?.name ?? 'Geral'
    const existing = acc.find(s => s.name === subjectName)
    const pct = Math.round((item.proficiency ?? 0) * 100)
    if (existing) {
      existing.pct = Math.round((existing.pct + pct) / 2)
    } else {
      const colors = [
        { color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10', barColor: 'bg-isometrica-accent' },
        { color: 'text-isometrica-success', bg: 'bg-isometrica-success/10', barColor: 'bg-isometrica-success' },
        { color: 'text-isometrica-danger', bg: 'bg-isometrica-danger/10', barColor: 'bg-isometrica-danger' },
        { color: 'text-isometrica-warning', bg: 'bg-isometrica-warning/10', barColor: 'bg-isometrica-warning' },
      ]
      const style = colors[acc.length % colors.length]
      acc.push({ name: subjectName, desc: '', pct, char: subjectName[0], ...style })
    }
    return acc
  }, [])

  const profMedia = proficiencia.length > 0
    ? Math.round(proficiencia.reduce((s, i) => s + (i.proficiency ?? 0), 0) / proficiencia.length * 100)
    : 55

  const topicosCriticos = proficiencia.filter(i => (i.proficiency ?? 0) < 0.4).length
  const topicosDominados = proficiencia.filter(i => (i.proficiency ?? 0) >= 0.7).length

  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-success/10">
            <BarChart3 className="size-3.5 text-isometrica-success" />
          </div>
          <h3 className="text-sm font-semibold">Diagnóstico Geral</h3>
        </div>
        <Link href="/progresso" className="text-xs font-medium text-muted-foreground hover:text-isometrica-accent transition-colors">
          Detalhes →
        </Link>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <DonutChart value={profMedia} label="Geral" />
        <div className="flex flex-1 flex-col gap-0">
          {subjects.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhum dado de proficiência disponível</p>
          ) : (
            subjects.map((subj) => (
              <div key={subj.name} className="flex items-center gap-3 py-2">
                <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${subj.bg}`}>
                  <span className={`text-[10px] font-bold ${subj.color}`}>{subj.char}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{subj.name}</span>
                    <span className={`text-xs font-bold tabular-nums ${subj.color}`}>{subj.pct}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{subj.desc}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${subj.barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${subj.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-isometrica-success" />
          <span>Bom (&ge;70%)</span>
          <span className="font-semibold text-foreground">{topicosDominados}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-isometrica-accent" />
          <span>Médio (40-70%)</span>
          <span className="font-semibold text-foreground">{proficiencia.length - topicosCriticos - topicosDominados}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-isometrica-danger" />
          <span>Crítico (&lt;40%)</span>
          <span className="font-semibold text-foreground">{topicosCriticos}</span>
        </div>
      </div>
    </motion.div>
  )
}
