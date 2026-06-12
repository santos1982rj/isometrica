'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Brain, BarChart3, Gamepad2, BookOpen, MessageCircle, Target,
  ChevronRight, GraduationCap, Sparkles, Check, Send, Quote, Star,
  Shield, Zap, ChevronDown, ArrowRight,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const features = [
  { icon: Brain, title: 'Tutor IA', desc: 'Tire dúvidas e receba explicações personalizadas com IA treinada em engenharia.', color: 'from-orange-500 to-rose-500', gradient: 'from-orange-500/20 to-rose-500/10' },
  { icon: Target, title: 'Mapa de Dificuldades', desc: 'A plataforma mapeia seus pontos fracos automaticamente — sem provas diagnósticas.', color: 'from-blue-500 to-cyan-500', gradient: 'from-blue-500/20 to-cyan-500/10' },
  { icon: BarChart3, title: 'BI do Aluno', desc: 'Dashboards inteligentes mostram sua evolução, tempo de estudo e áreas críticas.', color: 'from-emerald-500 to-teal-500', gradient: 'from-emerald-500/20 to-teal-500/10' },
  { icon: BookOpen, title: 'Conteúdo Estruturado', desc: 'Cursos organizados por disciplina, período e tópico — alinhados com a grade de Engenharia.', color: 'from-violet-500 to-purple-500', gradient: 'from-violet-500/20 to-purple-500/10' },
  { icon: Gamepad2, title: 'Gamificação', desc: 'Ganhe XP, suba de nível, desbloqueie conquistas e compita no ranking da turma.', color: 'from-amber-500 to-orange-500', gradient: 'from-amber-500/20 to-orange-500/10' },
  { icon: MessageCircle, title: 'Recomendações', desc: 'A IA sugere revisões, exercícios e conteúdos baseados no seu desempenho real.', color: 'from-pink-500 to-rose-500', gradient: 'from-pink-500/20 to-rose-500/10' },
]

const steps = [
  { number: '01', title: 'Crie sua conta', desc: 'Cadastro gratuito em segundos. Sem cartão de crédito.' },
  { number: '02', title: 'Escolha seu curso', desc: 'Navegue por disciplinas organizadas por período da sua grade.' },
  { number: '03', title: 'Estude com IA', desc: 'Aulas, exercícios e tutor disponíveis 24 horas por dia.' },
  { number: '04', title: 'Acompanhe', desc: 'Veja seu progresso em tempo real com dashboards inteligentes.' },
]

const plans = [
  {
    name: 'Gratuito', price: 'R$ 0', period: '/mês', desc: 'Para começar sua jornada',
    features: ['Acesso a 5 cursos', 'Tutor IA limitado', 'Dashboard básico', '10 questões/dia'],
    cta: 'Começar grátis', href: '/cadastro', featured: false,
  },
  {
    name: 'Premium', price: 'R$ 29,90', period: '/mês', desc: 'Para evoluir sem limites',
    features: ['Todos os cursos', 'Tutor IA ilimitado', 'BI completo + insights', 'Questões ilimitadas', 'Gamificação completa', 'Certificados'],
    cta: 'Assinar Premium', href: '/cadastro', featured: true,
  },
]

const testimonials = [
  { quote: 'O tutor IA me salvou em Resistência dos Materiais. Explicou de um jeito que o professor não conseguiu.', name: 'Ana Oliveira', role: '5º semestre', rating: 5 },
  { quote: 'Finalmente uma plataforma que entende o que é ser estudante de engenharia. O mapeamento de dificuldades é preciso demais.', name: 'Carlos Mendes', role: '3º semestre', rating: 5 },
  { quote: 'A gamificação me fez estudar muito mais. Subir de nível virou vício — e minha notas melhoraram junto.', name: 'Julia Torres', role: '4º semestre', rating: 5 },
]

const faqs = [
  { q: 'Preciso pagar para começar?', a: 'Não! O plano Gratuito dá acesso a 5 cursos completos, tutor IA limitado e dashboard básico. Sem cartão de crédito.' },
  { q: 'O tutor IA funciona para qualquer matéria?', a: 'Sim, o tutor é treinado em todo o conteúdo de Engenharia Civil, do 1º ao 10º período. Cálculo, Física, Resistência, Geotecnia e muito mais.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim! Você pode migrar do Gratuito para o Premium a qualquer momento. Seu progresso é mantido.' },
  { q: 'Como funciona o mapa de dificuldades?', a: 'A IA analisa suas tentativas de questões, tempo de resposta e matérias evitadas para construir um perfil de dificuldade preciso — sem prova diagnóstica.' },
]

function Counter({ from = 0, to, suffix = '', duration = 2 }: { from?: number; to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = from
    const end = to
    const step = Math.ceil((end - from) / (duration * 60))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) } else setCount(start)
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, from, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 60], [0.5, 0.95])

  return (
    <motion.nav style={{ backgroundColor: useTransform(bgOpacity, (v) => `rgba(255,255,255,${v})`) }} className="fixed top-0 z-50 w-full border-b border-border backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-extrabold text-white shadow-sm transition-transform group-hover:scale-105">
            I
          </div>
          <div className="leading-tight">
            <span className="font-display text-base font-bold text-foreground">Isométrica</span>
            <span className="block text-[7px] font-medium uppercase tracking-[0.3px] text-muted-foreground">Plataforma de evolução</span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {['features', 'pricing', 'faq'].map((s) => (
            <Link key={s} href={`#${s}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {s === 'features' ? 'Recursos' : s === 'pricing' ? 'Planos' : 'FAQ'}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/entrar" className="text-sm font-semibold text-foreground transition-colors hover:text-isometrica-accent">Entrar</Link>
          <Link href="/cadastro" className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 hover:shadow-md hover:-translate-y-0.5">
            Cadastre-se <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex size-9 items-center justify-center rounded-lg border border-border md:hidden">
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-border bg-card px-5">
            <div className="flex flex-col gap-2 py-4">
              <Link href="#features" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Recursos</Link>
              <Link href="#pricing" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Planos</Link>
              <Link href="#faq" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">FAQ</Link>
              <hr className="border-border" />
              <Link href="/entrar" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted">Entrar</Link>
              <Link href="/cadastro" onClick={() => setMobileOpen(false)} className="rounded-lg bg-isometrica-accent px-3 py-2.5 text-center text-sm font-semibold text-white">Cadastre-se</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function HeroSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6])

  return (
    <motion.section style={{ y, opacity }} className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-96 rounded-full bg-isometrica-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-40 top-20 size-96 rounded-full bg-isometrica-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 left-1/2 size-64 -translate-x-1/2 rounded-full bg-isometrica-accent/5 blur-3xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute size-1 rounded-full bg-isometrica-accent/20" style={{ left: `${20 + i * 15}%`, top: `${10 + i * 12}%` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-isometrica-accent/20 bg-isometrica-accent/5 px-4 py-1.5 text-xs font-semibold text-isometrica-accent">
            <Sparkles className="size-3" />
            Plataforma inteligente de evolução acadêmica
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Sua evolução na{' '}
            <span className="bg-gradient-to-r from-isometrica-accent to-orange-400 bg-clip-text text-transparent">
              Engenharia
            </span>{' '}
            começa aqui.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Não é um catálogo de cursos. É um ambiente que entende sua dificuldade, 
            mapeia seu progresso e propõe melhorias continuamente — com IA, dados e gamificação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/cadastro"
              className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Ver recursos
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#e85d32', '#f07a4a', '#f8a07a'].map((c, i) => (
                  <div key={i} className="size-7 rounded-full border-2 border-background" style={{ background: c }} />
                ))}
              </div>
              <span><strong className="text-foreground"><Counter from={0} to={2400} />+</strong> estudantes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              <span><strong className="text-foreground"><Counter from={0} to={15} />+</strong> disciplinas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="size-4" />
              <span><strong className="text-foreground">IA</strong> adaptativa</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1"><strong className="text-foreground">4.8</strong></span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function StatsSection() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            { value: 2400, label: 'Estudantes ativos', suffix: '+' },
            { value: 15, label: 'Disciplinas', suffix: '+' },
            { value: 120, label: 'Aulas', suffix: '+' },
            { value: 48, label: 'Avaliação média', suffix: '', prefix: '' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <p className="font-display text-3xl font-extrabold text-isometrica-accent">
                {s.prefix}<Counter from={0} to={s.value} />{s.suffix}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">RECURSOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa para evoluir
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-muted-foreground">
            IA + dados + gamificação trabalhando juntos para acelerar seu aprendizado.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title} variants={fadeUp}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className={`mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-sm`}>
                  <f.icon className="size-5 text-white" />
                </div>
                <h3 className="text-base font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">COMO FUNCIONA</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Comece em 4 passos
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s) => (
            <motion.div key={s.number} variants={fadeUp} className="relative text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 text-lg font-extrabold text-white shadow-md transition-transform hover:scale-105">
                {s.number}
              </div>
              <h3 className="text-base font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">DEPOIMENTOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Quem usa recomenda
          </motion.h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Quote className="mb-3 size-6 text-isometrica-accent/30" />
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">PLANOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Invista na sua evolução
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 mx-auto grid max-w-3xl gap-6 md:grid-cols-2"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name} variants={fadeUp}
              className={`relative overflow-hidden rounded-xl border p-6 transition-all hover:-translate-y-1 ${
                plan.featured
                  ? 'border-isometrica-accent/30 bg-card shadow-lg shadow-isometrica-accent/5'
                  : 'border-border bg-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-isometrica-accent to-orange-400 px-4 py-1 text-[10px] font-bold text-white shadow-sm">
                  MAIS POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 size-4 shrink-0 ${plan.featured ? 'text-isometrica-accent' : 'text-isometrica-success'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-isometrica-accent to-orange-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-muted/50"
              >
                {faq.q}
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b2a] to-[#1b2d45] py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-isometrica-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-isometrica-accent/5 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold text-white sm:text-4xl">
            Pronto para transformar sua jornada?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-white/60">
            Junte-se a milhares de estudantes de Engenharia que já estão evoluindo com a Isométrica.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar grátis <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-white"
            >
              <Shield className="size-4" /> Sem compromisso
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-extrabold text-white">I</div>
              <div className="leading-tight">
                <span className="font-display text-base font-bold">Isométrica</span>
                <span className="block text-[7px] font-medium uppercase tracking-[0.3px] text-muted-foreground">Plataforma de evolução</span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma inteligente de evolução acadêmica para estudantes de Engenharia. IA, dados e gamificação trabalhando juntos.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Produto</h4>
            <div className="flex flex-col gap-2">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recursos</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Planos</Link>
              <Link href="/cadastro" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cadastro</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Empresa</h4>
            <div className="flex flex-col gap-2">
              <Link href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contato</Link>
              <span className="text-sm text-muted-foreground">Sobre</span>
              <span className="text-sm text-muted-foreground">Termos</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Isométrica. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
