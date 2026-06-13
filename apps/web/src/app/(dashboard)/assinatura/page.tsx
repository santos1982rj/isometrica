'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { usePlans, useSubscriptions, useSubscribe } from '@/lib/queries'
import type { Plano, Assinatura } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Loader2, CreditCard, Shield, Star } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function AssinaturaPage() {
  const { usuario } = useAuth()
  const { data: planos, isLoading: carregando } = usePlans()
  const { data: subscriptions } = useSubscriptions(usuario?.id ?? '')
  const subscribe = useSubscribe()
  const [assinando, setAssinando] = useState<string | null>(null)

  const assinaturaAtiva = useMemo(
    () => subscriptions?.find((s: Assinatura) => s.status === 'active') ?? null,
    [subscriptions]
  )

  const isPremium = assinaturaAtiva?.plan?.name !== 'Gratuito'

  async function assinar(planId: string) {
    if (!usuario) return
    setAssinando(planId)
    try {
      await subscribe.mutateAsync({ userId: usuario.id, planId })
    } catch {
      toast.error('Erro ao processar assinatura')
    } finally {
      setAssinando(null)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-4xl space-y-6">
      <motion.div variants={item} className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 shadow-md">
          <Crown className="size-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Planos</h1>
        <p className="mt-1.5 text-muted-foreground">Escolha o plano ideal para sua evolução</p>
        {isPremium && (
          <Badge className="mt-3 bg-isometrica-accent/10 text-isometrica-accent border-isometrica-accent/20 text-xs px-3 py-1">
            <Crown className="size-3 mr-1" />
            Plano Premium ativo
          </Badge>
        )}
      </motion.div>

      {carregando || !planos ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : planos.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nenhum plano disponível no momento.</p>
      ) : (
        <motion.div variants={container} className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {planos.map((plano, idx) => {
            const isPremiumPlan = plano.name !== 'Gratuito'
            const isAtivo = assinaturaAtiva?.planId === plano.id
            const price = Number(plano.price)

            return (
              <motion.div
                key={plano.id}
                variants={item}
                className={`bento-card relative rounded-xl border-2 p-6 transition-all ${
                  isPremiumPlan ? 'border-isometrica-accent/30 shadow-lg shadow-isometrica-accent/5' : 'border-border'
                }`}
              >
                {isPremiumPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-isometrica-accent to-orange-400 px-4 py-1 text-[10px] font-bold text-white shadow-sm">
                    MAIS POPULAR
                  </div>
                )}

                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-isometrica-accent/10 to-orange-400/10">
                  {isPremiumPlan ? <Crown className="size-5 text-isometrica-accent" /> : <Star className="size-5 text-muted-foreground" />}
                </div>

                <h3 className="font-display text-lg font-bold">{plano.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plano.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold">
                    {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2).replace('.', ',')}`}
                  </span>
                  {price > 0 && <span className="text-sm text-muted-foreground">/mês</span>}
                </div>

                <ul className="mt-5 space-y-2.5">
                  {(isPremiumPlan ? [
                    'Acesso a todos os cursos',
                    'Tutor IA ilimitado',
                    'Questões ilimitadas',
                    'BI completo com insights',
                    'Gamificação completa',
                    'Certificados com proficiência',
                  ] : [
                    'Acesso a 5 cursos',
                    'Tutor IA limitado',
                    '10 questões/dia',
                    'Dashboard básico',
                  ]).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 size-4 shrink-0 ${isPremiumPlan ? 'text-isometrica-accent' : 'text-isometrica-success'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => assinar(plano.id)}
                  disabled={assinando !== null || isAtivo}
                  className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    isAtivo
                      ? 'bg-isometrica-success/10 text-isometrica-success border border-isometrica-success/30 cursor-default'
                      : isPremiumPlan
                      ? 'bg-gradient-to-r from-isometrica-accent to-orange-400 text-white shadow-md hover:shadow-lg'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {assinando === plano.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isAtivo ? (
                    <>Plano atual <Check className="size-4" /></>
                  ) : price === 0 ? (
                    'Plano gratuito'
                  ) : (
                    <>Assinar Premium <Sparkles className="size-4" /></>
                  )}
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Shield className="size-8 text-isometrica-success shrink-0" />
          <div>
            <p className="text-sm font-semibold">Pagamento seguro</p>
            <p className="text-xs text-muted-foreground">Pagamento processado pelo MercadoPago. Seus dados estão protegidos.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
