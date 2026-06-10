'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { ChevronRight, BookOpen, AlignLeft, Link2, Briefcase } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCourse, useCourseAccess, useCourseProgress, useEnroll, usePurchase, useGenerateCertificate,
} from '@/lib/queries'
import type { Modulo } from '@/lib/types'
import { CourseHero } from '@/components/cursos/course-hero'
import { ModuleAccordion } from '@/components/cursos/module-accordion'
import { SidebarCard } from '@/components/cursos/sidebar-card'
import { ProgressCard } from '@/components/cursos/progress-card'

const levelLabel: Record<string, string> = {
  iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado',
}

export default function CursoDetalhePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const { usuario } = useAuth()
  const qc = useQueryClient()
  const { data: curso, isLoading } = useCourse(id)
  const { data: acessoInfo } = useCourseAccess(id)
  const temAcesso = acessoInfo?.hasAccess ?? false
  const { data: progresso } = useCourseProgress(
    temAcesso ? (usuario?.id ?? '') : '',
    temAcesso ? id : '',
  )
  const enrollMutation = useEnroll()
  const purchaseMutation = usePurchase()
  const certificateMutation = useGenerateCertificate()

  async function matricular() {
    if (!usuario) return
    try {
      await enrollMutation.mutateAsync({ userId: usuario.id, courseId: id })
      await qc.invalidateQueries({ queryKey: ['courses', id, 'access'] })
      toast.success('Matrícula realizada!')
    } catch {
      toast.error('Erro ao matricular')
    }
  }

  async function comprar() {
    try {
      await purchaseMutation.mutateAsync(id)
      await qc.invalidateQueries({ queryKey: ['courses', id, 'access'] })
      toast.success('Curso adquirido!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao comprar')
    }
  }

  async function gerarCertificado() {
    try {
      await certificateMutation.mutateAsync(id)
      window.open('/certificados', '_blank')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar certificado')
    }
  }

  if (isLoading) return (
    <div className="mx-auto max-w-6xl space-y-5 p-5">
      <div className="h-52 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )

  if (!curso) return (
    <div className="flex flex-col items-center justify-center py-24">
      <BookOpen className="mb-3 size-12 text-muted-foreground/40" />
      <h2 className="font-display text-xl font-bold">Curso não encontrado</h2>
      <Link href="/cursos" className="mt-2 text-sm text-isometrica-accent hover:underline">Ver todos</Link>
    </div>
  )

  const totalAulas = (curso.modules ?? []).reduce((a: number, m: Modulo) => a + (m.lessons?.length ?? 0), 0)
  const grad = curso.color ?? 'from-violet-600 to-purple-700'
  const precisaCompra = !!(acessoInfo?.needsPurchase && !temAcesso)
  const firstLessonId = curso.modules?.[0]?.lessons?.[0]?.id ?? '#'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl space-y-8 px-4 lg:px-0 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground pt-5 lg:pt-8">
        <Link href="/dashboard" className="hover:text-foreground transition-colors no-underline">Dashboard</Link>
        <ChevronRight className="size-3" />
        <Link href="/cursos" className="hover:text-foreground transition-colors no-underline">Cursos</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium truncate">{curso.name}</span>
      </nav>

      <CourseHero
        curso={curso}
        temAcesso={temAcesso}
        needsPurchase={precisaCompra}
        totalLessons={totalAulas}
        matriculando={enrollMutation.isPending}
        comprando={purchaseMutation.isPending}
        onEnroll={matricular}
        onPurchase={comprar}
      />

      {/* Grid principal */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ementa */}
          <div>
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <AlignLeft className="size-5 text-isometrica-accent" />
              Ementa — {curso.modules?.length ?? 0} módulos · {totalAulas} aulas
            </h2>
            <ModuleAccordion
              modules={curso.modules ?? []}
              progresso={progresso}
              isPremium={!!curso.premium}
              temAcesso={temAcesso}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SidebarCard
            cursoId={id}
            isPremium={!!curso.premium}
            certificateEnabled={!!curso.certificateEnabled}
            temAcesso={temAcesso}
            needsPurchase={precisaCompra}
            price={acessoInfo?.price ?? 0}
            totalLessons={totalAulas}
            estimatedHours={curso.estimatedHours}
            grad={grad}
            firstLessonId={firstLessonId}
            progresso={progresso}
            matriculando={enrollMutation.isPending}
            comprando={purchaseMutation.isPending}
            onEnroll={matricular}
            onPurchase={comprar}
            onCertificate={gerarCertificado}
          />

          {temAcesso && progresso && (
            <ProgressCard progresso={progresso} grad={grad} />
          )}

          {/* Card Professor */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ministrado por</h4>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-base font-bold text-white shadow-sm">
                P
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">Prof. Carlos Mendes</p>
                <p className="text-xs text-muted-foreground">Doutor em Engenharia Civil</p>
                <p className="text-[10px] text-muted-foreground/70">{curso.subject?.name ?? 'Engenharia'}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <a href="#" className="inline-flex items-center gap-1 text-[10px] text-isometrica-accent hover:underline"><Link2 className="size-3" /> Lattes</a>
                  <a href="#" className="inline-flex items-center gap-1 text-[10px] text-isometrica-accent hover:underline"><Briefcase className="size-3" /> LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informações</h4>
            <div className="space-y-2.5">
              {[
                ['Módulos', String(curso.modules?.length ?? 0)],
                ['Aulas', String(totalAulas)],
                ['Carga Horária', `${curso.estimatedHours ?? '—'}h`],
                ['Nível', levelLabel[curso.level ?? 'iniciante'] ?? curso.level],
                ['Disciplina', curso.subject?.name ?? 'Geral'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
