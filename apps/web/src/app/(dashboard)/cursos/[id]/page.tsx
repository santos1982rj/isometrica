'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRight, Play, FileText, BookOpen, GraduationCap, Clock, CheckCircle, Lock, Loader2,
  ChevronDown, ChevronUp, Sparkles, BarChart3, Users, Award, Crown, Star, AlignLeft, Link2, Briefcase,
} from 'lucide-react'

const levelLabel: Record<string, string> = {
  iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado',
}

export default function CursoDetalhePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const { usuario } = useAuth()
  const [curso, setCurso] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [temAcesso, setTemAcesso] = useState(false)
  const [matriculando, setMatriculando] = useState(false)
  const [comprando, setComprando] = useState(false)
  const [moduloAberto, setModuloAberto] = useState<string | null>(null)
  const [progresso, setProgresso] = useState<{ total: number; completed: number; percentage: number } | null>(null)
  const [acessoInfo, setAcessoInfo] = useState<any>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [data, acesso] = await Promise.all([
          api.courses.detalhe(id),
          api.courses.verificarAcesso(id).catch(() => null),
        ])
        setCurso(data)
        setAcessoInfo(acesso)
        if (acesso?.hasAccess) setTemAcesso(true)
        if (usuario && acesso?.hasAccess) {
          api.learning.progressoCurso(usuario.id, id).then(setProgresso).catch(() => {})
        }
      } catch {
        toast.error('Erro ao carregar curso')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id, usuario])

  async function matricular() {
    if (!usuario) return
    setMatriculando(true)
    try {
      await api.learning.matricular(usuario.id, id)
      setTemAcesso(true)
      setAcessoInfo((p: any) => ({ ...p, hasAccess: true }))
      toast.success('Matrícula realizada!')
    } catch { toast.error('Erro ao matricular') }
    finally { setMatriculando(false) }
  }

  async function comprar() {
    setComprando(true)
    try {
      await api.courses.comprar(id)
      setTemAcesso(true)
      setAcessoInfo((p: any) => ({ ...p, hasAccess: true }))
      toast.success('Curso adquirido!')
    } catch (err: any) { toast.error(err.message ?? 'Erro ao comprar') }
    finally { setComprando(false) }
  }

  if (carregando) return (
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

  const totalAulas = (curso.modules ?? []).reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0)
  const grad = curso.color ?? 'from-violet-600 to-purple-700'
  const precisaCompra = acessoInfo?.needsPurchase && !temAcesso

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

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-8 lg:p-10 text-white`}>
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-52 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/25 text-[10px]">
              {curso.subject?.name ?? 'Geral'}
            </Badge>
            {curso.premium && (
              <Badge className="bg-amber-400/20 text-amber-300 border-0 text-[10px] flex items-center gap-1">
                <Crown className="size-3" /> Premium
              </Badge>
            )}
            {curso.certificateEnabled && (
              <Badge className="bg-emerald-400/20 text-emerald-300 border-0 text-[10px]">
                Certificado
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl font-extrabold leading-tight lg:text-4xl">{curso.name}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{curso.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><BookOpen className="size-4" />{curso.modules?.length ?? 0} módulos</span>
            <span className="flex items-center gap-1.5"><Play className="size-4" />{totalAulas} aulas</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" />{curso.estimatedHours ?? '—'}h</span>
            <span className="flex items-center gap-1.5"><Star className="size-4" />{levelLabel[curso.level ?? 'iniciante'] ?? curso.level}</span>
          </div>

          {!temAcesso && !precisaCompra && (
            <button onClick={matricular} disabled={matriculando}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 disabled:opacity-60">
              {matriculando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {matriculando ? 'Matriculando...' : 'Matricular grátis'}
            </button>
          )}

          {precisaCompra && (
            <button onClick={comprar} disabled={comprando}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-400/30 border border-amber-400/30 disabled:opacity-60">
              {comprando ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
              {comprando ? 'Processando...' : `Comprar R$ ${Number(acessoInfo?.price ?? curso.price ?? 0).toFixed(2).replace('.', ',')}`}
            </button>
          )}

          {temAcesso && (
            <Link href={`/aulas/${curso.modules?.[0]?.lessons?.[0]?.id ?? '#'}`}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 no-underline">
              <Play className="size-4" /> Continuar estudando
            </Link>
          )}
        </div>
      </div>

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
            <div className="space-y-2">
              {(curso.modules ?? []).map((modulo: any, idx: number) => {
                const aulas = modulo.lessons ?? []
                const aulasCompletas = progresso ? aulas.filter((a: any) => a.id && progresso.completed >= a.order).length : 0
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
                        {aulas.map((aula: any) => {
                          const isFree = !curso.premium || temAcesso
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* Card de Ação */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className={`mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-br ${grad}`}>
                {curso.premium ? <Crown className="size-6 text-white" /> : <GraduationCap className="size-6 text-white" />}
              </div>
              <h3 className="font-display text-lg font-bold">
                {temAcesso ? 'Acesso Liberado' : precisaCompra ? 'Curso Premium' : 'Grátis'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {temAcesso ? 'Aproveite todo o conteúdo do curso.' : precisaCompra ? `Adquira por R$ ${Number(acessoInfo?.price ?? 0).toFixed(2).replace('.', ',')}` : 'Matricule-se grátis.'}
              </p>
              <ul className="mt-4 space-y-2 text-left text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-isometrica-success shrink-0" />{totalAulas} aulas em vídeo</li>
                <li className="flex items-center gap-2"><CheckCircle className="size-3.5 text-isometrica-success shrink-0" />{curso.estimatedHours ?? '—'}h de conteúdo</li>
                {curso.certificateEnabled && <li className="flex items-center gap-2"><Award className="size-3.5 text-isometrica-accent shrink-0" />Certificado ao concluir</li>}
              </ul>

              {temAcesso ? (
                <Link href={`/aulas/${curso.modules?.[0]?.lessons?.[0]?.id ?? '#'}`}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg no-underline">
                  <Play className="size-4" /> Continuar
                </Link>
              ) : precisaCompra ? (
                <button onClick={comprar} disabled={comprando}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60">
                  {comprando ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
                  {comprando ? 'Processando...' : `Comprar R$ ${Number(acessoInfo?.price ?? 0).toFixed(2).replace('.', ',')}`}
                </button>
              ) : (
                <button onClick={matricular} disabled={matriculando}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60">
                  {matriculando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {matriculando ? 'Matriculando...' : 'Matricular grátis'}
                </button>
              )}

              {temAcesso && progresso?.percentage === 100 && curso.certificateEnabled && (
                <button onClick={async () => { try { await api.learning.gerarCertificado(id); window.open('/certificados', '_blank') } catch (err: any) { toast.error(err.message) } }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-isometrica-accent/30 px-5 py-2.5 text-sm font-semibold text-isometrica-accent transition-all hover:bg-isometrica-accent/5">
                  <Award className="size-4" /> Obter Certificado
                </button>
              )}
            </div>

            {/* Progresso */}
            {temAcesso && progresso && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold text-isometrica-accent">{progresso.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                    initial={{ width: 0 }} animate={{ width: `${progresso.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{progresso.completed} de {progresso.total} aulas</p>
              </div>
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
      </div>
    </motion.div>
  )
}
