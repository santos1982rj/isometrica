'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { useExams, useExamBoards, useCreateExam, useUpdateExam, useDeleteExam, useSubjectTree } from '@/lib/queries'
import type { ExamListItem } from '@/lib/api'
import { Plus, Pencil, Trash2, Search, BookOpen, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

function difficultyColor(d: string | null) {
  switch (d) {
    case 'Fácil': return 'bg-isometrica-success/10 text-isometrica-success'
    case 'Médio': return 'bg-isometrica-info/10 text-isometrica-info'
    case 'Difícil': return 'bg-isometrica-warning/10 text-isometrica-warning'
    default: return 'bg-muted text-muted-foreground'
  }
}

interface ExamForm {
  name: string; board: string; year: number | ''; timeLimit: number | ''
  difficulty: string; area: string; questionIds: string[]
}

const emptyForm: ExamForm = { name: '', board: '', year: '', timeLimit: '', difficulty: '', area: '', questionIds: [] }

export default function ProfessorConcursosPage() {
  const [search, setSearch] = useState('')
  const [boardFilter, setBoardFilter] = useState('')
  const { data: examsData } = useExams({ search, board: boardFilter })
  const { data: boards } = useExamBoards()
  const { data: tree } = useSubjectTree()
  const createExam = useCreateExam()
  const updateExam = useUpdateExam()
  const deleteExam = useDeleteExam()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ExamForm>(emptyForm)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())

  const exams = examsData?.data ?? []
  const total = examsData?.total ?? 0

  function openNew() {
    setEditId(null)
    setForm(emptyForm)
    setSelectedTopics(new Set())
    setModalOpen(true)
  }

  function openEdit(exam: ExamListItem) {
    setEditId(exam.id)
    setForm({
      name: exam.title ?? '',
      board: exam.board ?? '',
      year: exam.year ? Number(exam.year) : '',
      timeLimit: exam.timeLimit ?? '',
      difficulty: exam.difficulty ?? '',
      area: exam.area ?? '',
      questionIds: [],
    })
    setSelectedTopics(new Set())
    setModalOpen(true)
  }

  async function handleSave() {
    const data = {
      name: form.name,
      board: form.board || undefined,
      year: form.year ? Number(form.year) : undefined,
      timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
      difficulty: form.difficulty || undefined,
      area: form.area || undefined,
    }
    try {
      if (editId) {
        await updateExam.mutateAsync({ id: editId, data })
      } else {
        await createExam.mutateAsync(data)
      }
      setModalOpen(false)
    } catch {}
  }

  async function handleDelete(id: string) {
    if (confirm('Excluir este concurso? Esta ação não pode ser desfeita.')) {
      await deleteExam.mutateAsync(id)
    }
  }

  function toggleTopic(topicId: string) {
    const next = new Set(selectedTopics)
    if (next.has(topicId)) next.delete(topicId)
    else next.add(topicId)
    setSelectedTopics(next)
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-6">
      <motion.div variants={itemAnim} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gerenciar Concursos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} concurso{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="size-4" /> Novo Concurso
        </Button>
      </motion.div>

      <motion.div variants={itemAnim} className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar concurso..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <select
          value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none"
        >
          <option value="">Todas as bancas</option>
          {(boards ?? []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </motion.div>

      <motion.div variants={itemAnim} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam: ExamListItem) => (
          <div key={exam.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-bold truncate">{exam.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {exam.board}{exam.year ? ` · ${exam.year}` : ''}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(exam)} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => handleDelete(exam.id)} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={difficultyColor(exam.difficulty)}>{exam.difficulty ?? '—'}</Badge>
              {exam.area && <Badge variant="outline" className="text-xs">{exam.area}</Badge>}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="size-3.5" /> {exam.questionCount} questões</span>
              {exam.timeLimit && <span className="flex items-center gap-1"><Clock className="size-3.5" /> {exam.timeLimit}min</span>}
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm font-medium">Nenhum concurso encontrado</p>
            <p className="mt-1 text-xs text-muted-foreground">Crie um novo concurso para começar.</p>
            <Button variant="outline" className="mt-4 gap-1.5" onClick={openNew}>
              <Plus className="size-3.5" /> Novo Concurso
            </Button>
          </div>
        )}
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Concurso' : 'Novo Concurso'}</DialogTitle>
            <DialogDescription>Preencha os dados do concurso ou exame.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nome *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Concurso PF - Engenharia" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Banca</label>
                <Input value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} placeholder="Ex: CESPE, FCC" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ano</label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : '' })} placeholder="2024" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Dificuldade</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none">
                  <option value="">Selecionar</option>
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Área</label>
                <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ex: Concurso Público" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tempo Limite (min)</label>
                <Input type="number" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: e.target.value ? Number(e.target.value) : '' })} placeholder="120" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name || createExam.isPending || updateExam.isPending}>
              {editId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
