'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, ArrowUpRight, Receipt, Calendar } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminFinanceiroPage() {
  const [data, setData] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.financeiro.adminOverview().then(setData).catch(console.error).finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  const overview = data?.overview ?? {}
  const planDistribution = data?.planDistribution ?? []
  const recentPayments = data?.recentPayments ?? []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Financeiro</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Visão geral das assinaturas e receita</p>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'MRR', value: formatCurrency(overview.mrr ?? 0), icon: DollarSign, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10', trend: '+8% vs mês passado' },
          { label: 'Assinaturas Ativas', value: overview.activeSubscriptions ?? 0, icon: Users, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10', trend: `${overview.newSubscriptionsThisMonth ?? 0} novas este mês` },
          { label: 'Churn Rate', value: `${overview.churnRate ?? 0}%`, icon: TrendingDown, color: 'text-isometrica-danger', bg: 'bg-isometrica-danger/10', trend: 'taxa de cancelamento' },
          { label: 'Receita Total', value: formatCurrency(overview.totalRevenue ?? 0), icon: CreditCard, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10', trend: `${overview.totalSubscriptions ?? 0} assinaturas` },
        ].map((s) => (
          <div key={s.label} className="bento-card rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className={`flex size-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`size-5 ${s.color}`} />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/60">{s.trend}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-primary/10">
              <Receipt className="size-3.5 text-isometrica-primary" />
            </div>
            <h3 className="text-sm font-semibold">Pagamentos Recentes</h3>
          </div>
          {recentPayments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
          ) : (
            <div className="space-y-1">
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                    {p.userName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{p.userName}</p>
                    <p className="text-[11px] text-muted-foreground">{p.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">{formatCurrency(p.amount)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className={`text-[10px] ${p.status === 'active' ? 'text-isometrica-success' : 'text-muted-foreground'}`}>
                        {p.status === 'active' ? 'Ativo' : p.status === 'cancelled' ? 'Cancelado' : p.status}
                      </span>
                      {p.status === 'active' && <span className="size-1.5 rounded-full bg-isometrica-success" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-warning/10">
              <ArrowUpRight className="size-3.5 text-isometrica-warning" />
            </div>
            <h3 className="text-sm font-semibold">Distribuição</h3>
          </div>
          <div className="space-y-4">
            {planDistribution.map((plan: any) => {
              const total = planDistribution.reduce((a: number, p: any) => a + p.count, 0)
              const pct = total > 0 ? Math.round((plan.count / total) * 100) : 0
              const colors = ['bg-isometrica-accent', 'bg-muted-foreground', 'bg-isometrica-info', 'bg-isometrica-success']
              return (
                <div key={plan.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{plan.name}</span>
                    <div className="text-right">
                      <span className="font-semibold tabular-nums">{plan.count}</span>
                      <span className="text-muted-foreground ml-1 text-xs">({pct}%)</span>
                    </div>
                  </div>
                  {plan.count > 0 && (
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${colors[planDistribution.indexOf(plan) % colors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  {plan.price > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(plan.price)}/mês por assinatura</p>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
