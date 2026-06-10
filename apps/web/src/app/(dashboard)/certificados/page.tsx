'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCertificates } from '@/lib/queries'
import { Award, Download, ChevronRight, GraduationCap, Calendar, BarChart3, Clock, CheckCircle, Share2 } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function CertificadosPage() {
  const { data: certificados = [], isLoading: carregando } = useCertificates()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Meus Certificados</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Certificados emitidos por cursos concluídos</p>
      </motion.div>

      {carregando ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : certificados.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Award className="mb-3 size-14 text-muted-foreground/30" />
          <h3 className="font-display text-lg font-semibold">Nenhum certificado ainda</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Complete 100% de um curso e volte aqui para obter seu certificado.
          </p>
          <Link href="/cursos" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white">
            Ver cursos <ChevronRight className="size-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificados.map((cert) => (
            <motion.div key={cert.id} variants={item}>
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md">
                <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-isometrica-accent/5 to-orange-400/5" />

                <div className="relative">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-isometrica-accent to-orange-400 shadow-sm">
                    <Award className="size-6 text-white" />
                  </div>

                  <h3 className="font-display text-base font-bold leading-snug">{cert.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cert.course?.subject?.name ?? 'Engenharia'}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="size-3" /> Proficiência
                      </span>
                      <span className="font-semibold">{cert.proficiency}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" /> Carga horária
                      </span>
                      <span className="font-semibold">{cert.totalHours}h</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" /> Emitido em
                      </span>
                      <span className="font-semibold">
                        {new Date(cert.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold transition-all hover:bg-muted"
                    >
                      <Download className="size-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/u/${cert.userId}`)}&title=${encodeURIComponent(`Certificado: ${cert.title} — Isométrica`)}&summary=${encodeURIComponent(`Concluí o curso "${cert.title}" na Isométrica com ${cert.proficiency}% de proficiência e ${cert.totalHours}h de carga horária.`)}`;
                        window.open(url, '_blank', 'width=600,height=600');
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-isometrica-accent/30 bg-isometrica-accent/[0.03] py-2 text-xs font-semibold text-isometrica-accent transition-all hover:bg-isometrica-accent/10"
                    >
                      <Share2 className="size-3.5" />
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
