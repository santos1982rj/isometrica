'use client'

import { motion } from 'framer-motion'
import { Brain, Target, BarChart3, BookOpen, Gamepad2, MessageCircle } from 'lucide-react'

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

export function FeaturesSection() {
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
