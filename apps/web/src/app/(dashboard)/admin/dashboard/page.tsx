'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useAdminFinanceiro, useAdminUsuarios, useCourses } from '@/lib/queries'
import type { AdminFinanceiro, UsuarioAdmin, Curso } from '@/lib/types'
import {
  Users,
  DollarSign,
  BookOpen,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  BarChart3,
  UserPlus,
  CreditCard,
  GraduationCap,
  Loader2,
} from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function AdminDashboardPage() {
  const { usuario } = useAuth()
  const { data: financeiro, isLoading: loadingFinanceiro } = useAdminFinanceiro()
  const { data: usuarios = [], isLoading: loadingUsuarios } = useAdminUsuarios()
  const { data: cursos = [], isLoading: loadingCursos } = useCourses()
  const loading = loadingFinanceiro || loadingUsuarios || loadingCursos

  const totalUsuarios = usuarios.length
  const cursosAtivos = cursos.length
  const stats = financeiro ? [
    { label: 'Usuários Totais', value: totalUsuarios.toLocaleString('pt-BR'), variacao: '+12%', icon: Users, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10', up: true },
    { label: 'Receita Mensal', value: `R$ ${financeiro.overview.mrr.toLocaleString('pt-BR')}`, variacao: `+${financeiro.overview.newSubscriptionsThisMonth}`, icon: DollarSign, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10', up: true },
    { label: 'Cursos Ativos', value: String(cursosAtivos), variacao: '+3', icon: BookOpen, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10', up: true },
    { label: 'Churn Rate', value: `${financeiro.overview.churnRate}%`, variacao: '-0.8%', icon: TrendingDown, color: 'text-isometrica-danger', bg: 'bg-isometrica-danger/10', up: false },
  ] : []

  const usuariosRecentes = usuarios.slice(0, 5).map((u) => ({
    nome: u.name ?? 'Usuário',
    email: u.email,
    papel: u.role === 'ADMIN' ? 'Admin' : u.role === 'PROFESSOR' ? 'Professor' : 'Estudante',
    data: new Date(u.createdAt).toLocaleDateString('pt-BR'),
  }))

  const planData: AdminFinanceiro['planDistribution'] = financeiro?.planDistribution ?? []
  const maxPlanCount = Math.max(...planData.map(p => p.count), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">
          Admin Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Visão geral da plataforma — em preparação para o beta</p>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bento-card rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className={`flex size-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-5 ${s.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                s.up ? 'text-isometrica-success' : 'text-isometrica-danger'
              }`}>
                {s.variacao}
                {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
                <Activity className="size-3.5 text-isometrica-info" />
              </div>
              <h3 className="text-sm font-semibold">Usuários por Plano</h3>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {planData.map((plano) => (
              <div key={plano.name} className="text-center">
                <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-border">
                  <div>
                    <p className="font-display text-xl font-bold">{Math.round(plano.count / maxPlanCount * 100)}%</p>
                    <p className="text-[10px] text-muted-foreground">{plano.count}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{plano.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-success/10">
              <GraduationCap className="size-3.5 text-isometrica-success" />
            </div>
            <h3 className="text-sm font-semibold">Indicadores</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Usuários Ativos (30d)', value: String(financeiro?.overview.activeSubscriptions ?? 0), pct: Math.min(100, Math.round(((financeiro?.overview.activeSubscriptions ?? 0) / Math.max(totalUsuarios, 1)) * 100)), cor: 'bg-isometrica-accent' },
              { label: 'Novos Usuários (mês)', value: String(financeiro?.overview.newSubscriptionsThisMonth ?? 0), pct: 12, cor: 'bg-isometrica-info' },
              { label: 'Assinaturas Ativas', value: String(financeiro?.overview.activeSubscriptions ?? 0), pct: Math.min(100, Math.round(((financeiro?.overview.activeSubscriptions ?? 0) / Math.max(totalUsuarios, 1)) * 100)), cor: 'bg-isometrica-success' },
              { label: 'Receita Mensal Recorrente', value: `R$ ${(financeiro?.overview.mrr ?? 0).toLocaleString('pt-BR')}`, pct: Math.min(100, Math.round(((financeiro?.overview.mrr ?? 0) / 50000) * 100)), cor: 'bg-isometrica-warning' },
            ].map((ind) => (
              <div key={ind.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{ind.label}</span>
                  <span className="font-semibold tabular-nums">{ind.value}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${ind.cor}`} style={{ width: `${ind.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
        <div className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-primary/10">
                <UserPlus className="size-3.5 text-isometrica-primary" />
              </div>
              <h3 className="text-sm font-semibold">Usuários Recentes</h3>
            </div>
          </div>
          <div className="space-y-1">
            {usuariosRecentes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário encontrado</p>
            ) : (
              usuariosRecentes.map((u) => (
                <div key={u.email} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                    {u.nome[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{u.nome}</p>
                    <p className="text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">{u.papel}</span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{u.data}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-warning/10">
                <CreditCard className="size-3.5 text-isometrica-warning" />
              </div>
              <h3 className="text-sm font-semibold">Financeiro Rápido</h3>
            </div>
          </div>
          <div className="space-y-4">
            {financeiro ? [
              { label: 'Assinaturas Ativas', value: String(financeiro.overview.activeSubscriptions), variacao: `+${financeiro.overview.newSubscriptionsThisMonth} este mês` },
              { label: 'Receita Total', value: `R$ ${financeiro.overview.totalRevenue.toLocaleString('pt-BR')}`, variacao: `${financeiro.overview.totalSubscriptions} assinaturas` },
              { label: 'Ticket Médio', value: financeiro.planDistribution.filter(p => p.price > 0).length > 0 ? `R$ ${(financeiro.overview.mrr / Math.max(financeiro.overview.activeSubscriptions, 1)).toFixed(2)}` : 'R$ 0', variacao: 'por assinante' },
              { label: 'MRR', value: `R$ ${financeiro.overview.mrr.toLocaleString('pt-BR')}`, variacao: `+${financeiro.overview.newSubscriptionsThisMonth} novos` },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-muted-foreground">{f.label}</p>
                  <p className="font-display text-lg font-bold tabular-nums">{f.value}</p>
                </div>
                <span className="text-xs text-muted-foreground">{f.variacao}</span>
              </div>
            )) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum dado financeiro</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
