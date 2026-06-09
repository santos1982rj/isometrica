'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
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
} from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const stats = [
  { label: 'Usuários Totais', value: '2.847', variacao: '+12%', icon: Users, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10', up: true },
  { label: 'Receita Mensal', value: 'R$ 28.450', variacao: '+8%', icon: DollarSign, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10', up: true },
  { label: 'Cursos Ativos', value: '24', variacao: '+3', icon: BookOpen, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10', up: true },
  { label: 'Churn Rate', value: '4,2%', variacao: '-0.8%', icon: TrendingDown, color: 'text-isometrica-danger', bg: 'bg-isometrica-danger/10', up: false },
]

const usuariosRecentes = [
  { nome: 'Ana Oliveira', email: 'ana@email.com', papel: 'Estudante', data: 'Hoje' },
  { nome: 'Prof. Carlos Mendes', email: 'carlos@email.com', papel: 'Professor', data: 'Ontem' },
  { nome: 'Lucas Pereira', email: 'lucas@email.com', papel: 'Estudante', data: 'Ontem' },
  { nome: 'Marina Costa', email: 'marina@email.com', papel: 'Estudante', data: '2 dias atrás' },
  { nome: 'Dr. Rafael Souza', email: 'rafael@email.com', papel: 'Professor', data: '3 dias atrás' },
]

export default function AdminDashboardPage() {
  const { usuario } = useAuth()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">
          Admin Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Visão geral da plataforma</p>
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

      <div className="grid gap-5 lg:grid-cols-3">
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
            {[
              { label: 'Gratuito', total: 1890, pct: 66, cor: 'bg-muted-foreground' },
              { label: 'Premium', total: 892, pct: 31, cor: 'bg-isometrica-accent' },
              { label: 'Admin/Professor', total: 65, pct: 3, cor: 'bg-isometrica-info' },
            ].map((plano) => (
              <div key={plano.label} className="text-center">
                <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full border-4 border-border">
                  <div>
                    <p className="font-display text-xl font-bold">{plano.pct}%</p>
                    <p className="text-[10px] text-muted-foreground">{plano.total}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{plano.label}</p>
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
              { label: 'Usuários Ativos (30d)', value: '1.892', pct: 66, cor: 'bg-isometrica-accent' },
              { label: 'Novos Usuários (mês)', value: '347', pct: 12, cor: 'bg-isometrica-info' },
              { label: 'Aulas Concluídas (mês)', value: '4.231', pct: 100, cor: 'bg-isometrica-success' },
              { label: 'Receita Mensal Recorrente', value: 'R$ 22.450', pct: 79, cor: 'bg-isometrica-warning' },
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

      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
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
            {usuariosRecentes.map((u) => (
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
            ))}
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
            {[
              { label: 'Assinaturas Ativas', value: '892', variacao: '+23 este mês' },
              { label: 'Receita Pendente', value: 'R$ 3.450', variacao: '12 faturas' },
              { label: 'Ticket Médio', value: 'R$ 29,90', variacao: 'Premium' },
              { label: 'MRR', value: 'R$ 22.450', variacao: '+8% vs mês passado' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-muted-foreground">{f.label}</p>
                  <p className="font-display text-lg font-bold tabular-nums">{f.value}</p>
                </div>
                <span className="text-xs text-muted-foreground">{f.variacao}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
