'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  ChevronLeft, Save, Loader2, BookOpen, Image, Settings,
  Check, ChevronRight, ArrowLeft, Crown, Plus, Trash2, Play, FileText, Edit3,
} from 'lucide-react'

type AulaTemp = { title: string; videoUrl: string; free: boolean; materials: { name: string; url: string }[] }
type ModuloTemp = { name: string; order: number; aulas: AulaTemp[] }

const steps = [
  { key: 'curso', label: 'Curso', icon: BookOpen },
  { key: 'modulos', label: 'Módulos', icon: Edit3 },
  { key: 'aulas', label: 'Aulas', icon: Play },
  { key: 'revisar', label: 'Revisar', icon: Settings },
]

const colors = [
  { value: 'from-violet-600 to-purple-700', label: 'Roxo' },
  { value: 'from-emerald-600 to-teal-700', label: 'Verde' },
  { value: 'from-orange-500 to-rose-600', label: 'Laranja' },
  { value: 'from-blue-600 to-cyan-700', label: 'Azul' },
  { value: 'from-pink-500 to-fuchsia-600', label: 'Rosa' },
  { value: 'from-amber-500 to-yellow-600', label: 'Âmbar' },
]

export default function CriarCursoPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState(0)
  const [enviando, setEnviando] = useState(false)

  // Etapa 1 — Curso
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState(10)
  const [nivel, setNivel] = useState('iniciante')
  const [color, setColor] = useState(colors[0].value)

  // Etapa 2 — Módulos
  const [modulos, setModulos] = useState<ModuloTemp[]>([])
  const [novoModNome, setNovoModNome] = useState('')

  // Etapa 3 — Aulas (qual módulo está sendo editado)
  const [moduloEditando, setModuloEditando] = useState<number | null>(null)
  const [novaAulaTitulo, setNovaAulaTitulo] = useState('')
  const [novaAulaUrl, setNovaAulaUrl] = useState('')
  const [novaAulaFree, setNovaAulaFree] = useState(false)
  const [novaAulaMaterial, setNovaAulaMaterial] = useState('')
  const [novaAulaMaterialNome, setNovaAulaMaterialNome] = useState('')

  // Etapa 4 — Config
  const [premium, setPremium] = useState(false)
  const [preco, setPreco] = useState(49.90)
  const [certificado, setCertificado] = useState(true)

  // Actions
  function addModulo() {
    if (!novoModNome.trim()) return
    setModulos([...modulos, { name: novoModNome.trim(), order: modulos.length + 1, aulas: [] }])
    setNovoModNome('')
  }

  function removeModulo(idx: number) {
    setModulos(modulos.filter((_, i) => i !== idx).map((m, i) => ({ ...m, order: i + 1 })))
    if (moduloEditando === idx) setModuloEditando(null)
  }

  function addAula() {
    if (!novaAulaTitulo.trim() || moduloEditando === null) return
    const materials: { name: string; url: string }[] = []
    if (novaAulaMaterial.trim() && novaAulaMaterialNome.trim()) {
      materials.push({ name: novaAulaMaterialNome.trim(), url: novaAulaMaterial.trim() })
    }
    const novo = [...modulos]
    novo[moduloEditando].aulas.push({ title: novaAulaTitulo.trim(), videoUrl: novaAulaUrl, free: novaAulaFree, materials })
    setModulos(novo)
    setNovaAulaTitulo('')
    setNovaAulaUrl('')
    setNovaAulaFree(false)
    setNovaAulaMaterial('')
    setNovaAulaMaterialNome('')
  }

  function removeAula(modIdx: number, aulaIdx: number) {
    const novo = [...modulos]
    novo[modIdx].aulas = novo[modIdx].aulas.filter((_, i) => i !== aulaIdx)
    setModulos(novo)
  }

  function podeAvancar() {
    if (etapa === 0) return nome.trim() && descricao.trim()
    if (etapa === 1) return modulos.length > 0
    if (etapa === 2) return true
    return true
  }

  async function salvarTudo() {
    if (!nome.trim() || !descricao.trim()) { toast.error('Preencha os dados do curso'); return }
    if (modulos.length === 0) { toast.error('Adicione pelo menos um módulo'); return }

    setEnviando(true)
    try {
      // 1. Criar curso
      const curso = await api.courses.criar({
        name: nome, description: descricao, color, estimatedHours: cargaHoraria,
        level: nivel, premium, certificateEnabled: certificado, price: premium ? preco : 0,
      })

      // 2. Criar módulos e aulas
      for (const mod of modulos) {
        const modulo = await api.courses.criarModulo(curso.id, { name: mod.name, order: mod.order })
        for (let i = 0; i < mod.aulas.length; i++) {
          const a = mod.aulas[i]
          await api.courses.criarAula(modulo.id, {
            title: a.title, type: 'video', order: i + 1, free: a.free,
            videoUrl: a.videoUrl || undefined,
          })
        }
      }

      toast.success(`Curso criado com ${modulos.length} módulos e ${modulos.reduce((a, m) => a + m.aulas.length, 0)} aulas!`)
      router.push(`/professor/cursos/${curso.id}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao criar curso')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/professor/cursos" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" /> Voltar aos cursos
        </Link>
        <h1 className="font-display text-2xl font-bold">Novo Curso</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Crie curso, módulos e aulas em etapas</p>
      </div>

      {/* Progresso */}
      <div className="flex items-center gap-1 sm:gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 sm:gap-2 flex-1">
            <div className={`flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${
              i <= etapa ? 'bg-isometrica-accent text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {i < etapa ? <Check className="size-3 sm:size-4" /> : i + 1}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium truncate ${i <= etapa ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < etapa ? 'bg-isometrica-accent' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Conteúdo das etapas */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {/* ETAPA 1 — DADOS DO CURSO */}
          {etapa === 0 && (
            <motion.div key="curso" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-display text-lg font-bold">Dados do Curso</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Curso *</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"
                  placeholder="Ex: Resistência dos Materiais I" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição *</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-isometrica-accent"
                  placeholder="Descreva o que o aluno vai aprender..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Carga Horária (h)</label>
                  <input type="number" value={cargaHoraria} onChange={e => setCargaHoraria(Number(e.target.value))} min={1}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-isometrica-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nível</label>
                  <select value={nivel} onChange={e => setNivel(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-isometrica-accent">
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor do Curso</label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((c) => (
                    <button key={c.value} onClick={() => setColor(c.value)}
                      className={`relative h-12 rounded-xl bg-gradient-to-br ${c.value} transition-all ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-isometrica-accent scale-105' : 'hover:scale-105'
                      }`}>
                      {color === c.value && <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ETAPA 2 — MÓDULOS */}
          {etapa === 1 && (
            <motion.div key="modulos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-display text-lg font-bold">Módulos do Curso</h2>
              <p className="text-sm text-muted-foreground">Adicione os módulos do curso. Depois você pode adicionar aulas em cada um.</p>

              {/* Lista de módulos */}
              <div className="space-y-2">
                {modulos.map((mod, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">{mod.order}</span>
                    <span className="flex-1 text-sm font-medium">{mod.name}</span>
                    <span className="text-xs text-muted-foreground">{mod.aulas.length} aulas</span>
                    <button onClick={() => { setModuloEditando(i); setEtapa(2) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                      <Play className="size-3.5" />
                    </button>
                    <button onClick={() => removeModulo(i)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-isometrica-danger/10 hover:text-isometrica-danger">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar módulo */}
              <div className="flex gap-2">
                <input value={novoModNome} onChange={e => setNovoModNome(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addModulo()}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-isometrica-accent"
                  placeholder="Nome do módulo..." />
                <button onClick={addModulo} disabled={!novoModNome.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-isometrica-accent px-4 py-2 text-xs font-semibold text-white hover:bg-isometrica-accent/90 disabled:opacity-50">
                  <Plus className="size-3.5" /> Adicionar
                </button>
              </div>

              {modulos.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum módulo ainda. Adicione o primeiro!</p>
              )}
            </motion.div>
          )}

          {/* ETAPA 3 — AULAS POR MÓDULO */}
          {etapa === 2 && (
            <motion.div key="aulas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Aulas</h2>
                  {moduloEditando !== null && (
                    <p className="text-sm text-muted-foreground">Módulo: {modulos[moduloEditando]?.name}</p>
                  )}
                </div>
                {moduloEditando !== null && (
                  <button onClick={() => { setEtapa(1); setModuloEditando(null) }}
                    className="text-xs text-muted-foreground hover:text-foreground">Trocar módulo</button>
                )}
              </div>

              {moduloEditando === null ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Selecione um módulo para adicionar aulas:</p>
                  {modulos.map((mod, i) => (
                    <button key={i} onClick={() => setModuloEditando(i)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">{mod.order}</span>
                      <span className="flex-1 text-sm font-medium">{mod.name}</span>
                      <span className="text-xs text-muted-foreground">{mod.aulas.length} aulas</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Lista de aulas do módulo */}
                  <div className="space-y-1">
                    {modulos[moduloEditando].aulas.map((aula, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                        <Play className="size-3.5 shrink-0 text-isometrica-accent" />
                        <span className="flex-1 text-sm truncate">{i + 1}. {aula.title}</span>
                        {aula.free && <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">Degustação</span>}
                        {aula.materials.length > 0 && <span className="text-[10px] text-muted-foreground">{aula.materials.length} material(is)</span>}
                        <button onClick={() => removeAula(moduloEditando, i)} className="rounded-lg p-1 text-muted-foreground hover:text-isometrica-danger">
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Form de nova aula */}
                  <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                    <input value={novaAulaTitulo} onChange={e => setNovaAulaTitulo(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                      placeholder="Título da aula..." />

                    <input value={novaAulaUrl} onChange={e => setNovaAulaUrl(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                      placeholder="URL do YouTube..." />

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`relative size-7 rounded-full transition-colors ${novaAulaFree ? 'bg-amber-500' : 'bg-muted'}`}>
                        <div onClick={() => setNovaAulaFree(!novaAulaFree)} className="absolute inset-0 cursor-pointer" />
                        <div className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform ${novaAulaFree ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-xs font-medium">Aula de degustação (grátis sem matrícula)</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <input value={novaAulaMaterialNome} onChange={e => setNovaAulaMaterialNome(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                        placeholder="Nome do material..." />
                      <input value={novaAulaMaterial} onChange={e => setNovaAulaMaterial(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-isometrica-accent"
                        placeholder="URL do material..." />
                    </div>

                    <button onClick={addAula} disabled={!novaAulaTitulo.trim()}
                      className="inline-flex items-center gap-1 rounded-lg bg-isometrica-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-isometrica-accent/90 disabled:opacity-50">
                      <Plus className="size-3" /> Adicionar Aula
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ETAPA 4 — REVISAR */}
          {etapa === 3 && (
            <motion.div key="revisar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-display text-lg font-bold">Revisar e Publicar</h2>

              {/* Config */}
              <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Crown className={`size-5 ${premium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <div><p className="text-sm font-semibold">Curso Premium</p><p className="text-xs text-muted-foreground">Alunos pagam avulso</p></div>
                </div>
                <div className={`relative size-9 rounded-full transition-colors ${premium ? 'bg-isometrica-accent' : 'bg-muted'}`}>
                  <div onClick={() => setPremium(!premium)} className="absolute inset-0 cursor-pointer" />
                  <div className={`absolute top-0.5 size-8 rounded-full bg-white shadow-sm transition-transform ${premium ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0.5'}`} />
                </div>
              </label>

              {premium && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Preço (R$)</label>
                  <input type="number" value={preco} onChange={e => setPreco(Number(e.target.value))} min={0} step={0.5}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-isometrica-accent" />
                </div>
              )}

              <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Check className={`size-5 ${certificado ? 'text-isometrica-success' : 'text-muted-foreground'}`} />
                  <div><p className="text-sm font-semibold">Certificado</p><p className="text-xs text-muted-foreground">Alunos recebem ao concluir</p></div>
                </div>
                <div className={`relative size-9 rounded-full transition-colors ${certificado ? 'bg-isometrica-success' : 'bg-muted'}`}>
                  <div onClick={() => setCertificado(!certificado)} className="absolute inset-0 cursor-pointer" />
                  <div className={`absolute top-0.5 size-8 rounded-full bg-white shadow-sm transition-transform ${certificado ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0.5'}`} />
                </div>
              </label>

              {/* Resumo */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <p className="text-sm font-semibold">Resumo do Curso</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Nome: <strong className="text-foreground">{nome}</strong></span>
                  <span>Nível: <strong className="text-foreground">{nivel}</strong></span>
                  <span>Carga: <strong className="text-foreground">{cargaHoraria}h</strong></span>
                  <span>Preço: <strong className="text-foreground">{premium ? `R$ ${preco.toFixed(2).replace('.', ',')}` : 'Grátis'}</strong></span>
                </div>
                <div className="border-t border-border pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Estrutura:</p>
                  <ul className="space-y-1">
                    {modulos.map((mod, i) => (
                      <li key={i} className="text-xs flex items-center gap-2">
                        <BookOpen className="size-3 shrink-0 text-isometrica-accent" />
                        <span className="text-foreground font-medium">{mod.name}</span>
                        <span className="text-muted-foreground">({mod.aulas.length} aulas)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button onClick={() => setEtapa(Math.max(0, etapa - 1))} disabled={etapa === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted disabled:opacity-30">
          <ArrowLeft className="size-4" /> Anterior
        </button>

        {etapa < steps.length - 1 ? (
          <button onClick={() => setEtapa(etapa + 1)} disabled={!podeAvancar()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 disabled:opacity-50">
            Próximo <ChevronRight className="size-4" />
          </button>
        ) : (
          <button onClick={salvarTudo} disabled={enviando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 disabled:opacity-50">
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {enviando ? 'Publicando...' : 'Publicar Curso'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
