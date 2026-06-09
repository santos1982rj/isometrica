'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, HelpCircle, AlertCircle, Clock, BarChart3, ChevronRight, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const examasMock = [
  { id: '1', nome: 'Concurso PF – Engenharia Civil', questoes: 25, tempo: 120, dificuldade: 'Médio', area: 'Concurso Público' },
  { id: '2', nome: 'ENEM – Matemática e suas Tecnologias', questoes: 45, tempo: 180, dificuldade: 'Difícil', area: 'Vestibular' },
  { id: '3', nome: 'OAB – Direito', questoes: 80, tempo: 300, dificuldade: 'Difícil', area: 'Exame de Ordem' },
  { id: '4', nome: 'Simulado Concreto Armado', questoes: 15, tempo: 60, dificuldade: 'Fácil', area: 'Engenharia' },
  { id: '5', nome: 'Vestibular ITA – Física', questoes: 30, tempo: 150, dificuldade: 'Muito Difícil', area: 'Vestibular' },
  { id: '6', nome: 'Simulado Estruturas Metálicas', questoes: 20, tempo: 90, dificuldade: 'Médio', area: 'Engenharia' },
]

function diffColor(dificuldade: string) {
  switch (dificuldade) {
    case 'Fácil': return 'bg-isometrica-success/10 text-isometrica-success'
    case 'Médio': return 'bg-isometrica-info/10 text-isometrica-info'
    case 'Difícil': return 'bg-isometrica-warning/10 text-isometrica-warning'
    default: return 'bg-isometrica-danger/10 text-isometrica-danger'
  }
}

export default function ConcursoPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemAnim}>
        <h1 className="font-display text-2xl font-bold">Modo Concurso</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Simule condições reais de prova com tempo cronometrado, questões inéditas e correção automática
        </p>
      </motion.div>

      {!selectedExam ? (
        <>
          <motion.div variants={itemAnim} className="grid gap-4 sm:grid-cols-3">
            <div className="bento-card flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-accent/10">
                <Timer className="size-5 text-isometrica-accent" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{examasMock.length}</p>
                <p className="text-[10px] text-muted-foreground">Simulados disponíveis</p>
              </div>
            </div>
            <div className="bento-card flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-info/10">
                <Clock className="size-5 text-isometrica-info" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">Cronometrado</p>
                <p className="text-[10px] text-muted-foreground">Tempo real</p>
              </div>
            </div>
            <div className="bento-card flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-isometrica-success/10">
                <Award className="size-5 text-isometrica-success" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">Correção automática</p>
                <p className="text-[10px] text-muted-foreground">Resultado na hora</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examasMock.map((exam) => (
              <motion.div key={exam.id} variants={itemAnim}>
                <Card className="bento-card cursor-pointer transition-all hover:border-isometrica-accent/30" onClick={() => setSelectedExam(exam.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-display text-base">{exam.nome}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary" className={diffColor(exam.dificuldade)}>{exam.dificuldade}</Badge>
                      <span className="text-xs text-muted-foreground">{exam.area}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><HelpCircle className="size-3" /> {exam.questoes} questões</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {exam.tempo}min</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-isometrica-accent">
                      Iniciar simulado <ChevronRight className="size-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemAnim}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Simulado em andamento</CardTitle>
              <CardDescription>
                Interface de prova será implementada na próxima fase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-lg bg-isometrica-info/5 p-4 text-sm text-muted-foreground">
                <AlertCircle className="size-4 shrink-0 text-isometrica-info" />
                <p>O modo prova com cronômetro, questões ranqueadas e correção automática estará disponível em breve.</p>
              </div>
              <Button variant="ghost" className="mt-4" onClick={() => setSelectedExam(null)}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
