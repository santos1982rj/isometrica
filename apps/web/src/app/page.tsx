'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  Brain,
  BarChart3,
  Gamepad2,
  BookOpen,
  MessageCircle,
  Target,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Check,
  Send,
  Quote,
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
  { icon: Brain, title: 'Tutor IA', desc: 'Tire dúvidas e receba explicações personalizadas com IA treinada em engenharia.', color: 'from-orange-500 to-rose-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { icon: Target, title: 'Mapa de Dificuldades', desc: 'A plataforma mapeia seus pontos fracos automaticamente — sem provas diagnósticas.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { icon: BarChart3, title: 'BI do Aluno', desc: 'Dashboards inteligentes mostram sua evolução, tempo de estudo e áreas críticas.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { icon: BookOpen, title: 'Conteúdo Estruturado', desc: 'Cursos organizados por disciplina, período e tópico — alinhados com a grade de Engenharia.', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { icon: Gamepad2, title: 'Gamificação', desc: 'Ganhe XP, suba de nível, desbloqueie conquistas e compita no ranking.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { icon: MessageCircle, title: 'Recomendações Ativas', desc: 'A IA sugere revisões, exercícios e conteúdos baseados no seu desempenho.', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
]

const steps = [
  { number: '01', title: 'Cadastre-se', desc: 'Crie sua conta gratuita em segundos. Sem compromisso.' },
  { number: '02', title: 'Escolha seu curso', desc: 'Navegue por disciplinas de Engenharia organizadas por período.' },
  { number: '03', title: 'Estude no seu ritmo', desc: 'Aulas, exercícios e tutor IA disponíveis 24/7.' },
  { number: '04', title: 'Evolua com dados', desc: 'Acompanhe seu progresso e receba recomendações inteligentes.' },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Para começar sua jornada',
    features: ['Acesso a 5 cursos', 'Tutor IA limitado', 'Dashboard básico', '10 questões/dia'],
    cta: 'Começar grátis',
    href: '/cadastro',
    featured: false,
  },
  {
    name: 'Premium',
    price: 'R$ 29,90',
    period: '/mês',
    desc: 'Para evoluir sem limites',
    features: ['Todos os cursos', 'Tutor IA ilimitado', 'BI completo + insights', 'Questões ilimitadas', 'Gamificação completa', 'Certificados'],
    cta: 'Assinar Premium',
    href: '/cadastro',
    featured: true,
  },
]

const testimonials = [
  { quote: 'O tutor IA me salvou em Resistência dos Materiais. Explicou de um jeito que o professor não conseguiu.', name: 'Ana Oliveira', role: '5º semestre', avatar: 'A' },
  { quote: 'Finalmente uma plataforma que entende o que é ser estudante de engenharia. O mapeamento de dificuldades é preciso demais.', name: 'Carlos Mendes', role: '3º semestre', avatar: 'C' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-extrabold text-white shadow-sm">
            I
          </div>
          <div className="leading-tight">
            <span className="font-display text-base font-bold text-foreground">Isométrica</span>
            <span className="block text-[7px] font-medium uppercase tracking-[0.3px] text-muted-foreground">Plataforma de evolução</span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Recursos</Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Planos</Link>
          <Link href="#contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Contato</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/entrar" className="text-sm font-semibold text-foreground transition-colors hover:text-isometrica-accent">Entrar</Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 hover:shadow-md"
          >
            Cadastre-se
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="flex size-9 items-center justify-center rounded-lg border border-border md:hidden">
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-border bg-card px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="#features" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Recursos</Link>
            <Link href="#pricing" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Planos</Link>
            <Link href="#contact" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Contato</Link>
            <hr className="my-2 border-border" />
            <Link href="/entrar" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted">Entrar</Link>
            <Link href="/cadastro" onClick={() => setMobileOpen(false)} className="rounded-lg bg-isometrica-accent px-3 py-2.5 text-center text-sm font-semibold text-white">Cadastre-se</Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 size-96 rounded-full bg-isometrica-accent/5 blur-3xl" />
        <div className="absolute -right-40 top-20 size-96 rounded-full bg-isometrica-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 size-64 -translate-x-1/2 rounded-full bg-isometrica-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-isometrica-accent/20 bg-isometrica-accent/5 px-4 py-1.5 text-xs font-semibold text-isometrica-accent">
            <Sparkles className="size-3" />
            Plataforma inteligente de evolução acadêmica
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Sua evolução na{' '}
            <span className="bg-gradient-to-r from-isometrica-accent to-orange-400 bg-clip-text text-transparent">
              Engenharia
            </span>{' '}
            começa aqui.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Não é um catálogo de cursos. É um ambiente que entende sua dificuldade, 
            mapeia seu progresso e propõe melhorias continuamente — com IA, dados e gamificação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar grátis
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Ver recursos
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#e85d32', '#f07a4a', '#f8a07a'].map((c, i) => (
                  <div key={i} className="size-7 rounded-full border-2 border-background" style={{ background: c }} />
                ))}
              </div>
              <span><strong className="text-foreground">2.400+</strong> estudantes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              <span><strong className="text-foreground">15+</strong> disciplinas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="size-4" />
              <span><strong className="text-foreground">IA</strong> adaptativa</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            { value: '2.400+', label: 'Estudantes ativos' },
            { value: '15+', label: 'Disciplinas' },
            { value: '120+', label: 'Aulas' },
            { value: '4.8', label: 'Avaliação média' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-isometrica-accent">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
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
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group bento-card rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1"
            >
              <div className={`mb-4 flex size-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`size-5 bg-gradient-to-br ${f.color} bg-clip-text text-transparent`} />
              </div>
              <h3 className="text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
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
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s) => (
            <motion.div key={s.number} variants={fadeUp} className="relative text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 text-lg font-extrabold text-white shadow-md">
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
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">DEPOIMENTOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Quem usa recomenda
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUp} className="bento-card rounded-xl border border-border bg-card p-6">
              <Quote className="mb-3 size-6 text-isometrica-accent/30" />
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 mx-auto grid max-w-3xl gap-6 md:grid-cols-2"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`bento-card relative rounded-xl border p-6 transition-all ${
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
                    ? 'bg-gradient-to-r from-isometrica-accent to-orange-400 text-white shadow-md hover:shadow-lg'
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

function ContactSection() {
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviado(true)
    setTimeout(() => setEnviado(false), 4000)
  }

  return (
    <section id="contact" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center">
            <p className="mb-2 text-sm font-semibold text-isometrica-accent">CONTATO</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Vamos conversar</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">Tem dúvidas ou sugestões? Mande uma mensagem.</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nome</label>
                <input
                  id="name"
                  required
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium">Mensagem</label>
              <textarea
                id="message"
                required
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"
                placeholder="Como podemos ajudar?"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              {enviado ? (
                <>Mensagem enviada <Check className="size-4" /></>
              ) : (
                <>Enviar mensagem <Send className="size-4" /></>
              )}
            </button>
          </motion.form>
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
      <ContactSection />
      <Footer />
    </div>
  )
}
