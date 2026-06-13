'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAdminUsuarios, useUpdateUser, useDeleteUser } from '@/lib/queries'
import type { UsuarioAdmin } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import { ListSkeleton, StatSkeleton } from '@/components/skeleton-loading'
import { Users, Search, Shield, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
}

type Papel = 'STUDENT' | 'PROFESSOR' | 'ADMIN'

const papelLabel: Record<Papel, string> = { STUDENT: 'Estudante', PROFESSOR: 'Professor', ADMIN: 'Admin' }
const papelColor: Record<Papel, string> = {
  STUDENT: 'bg-isometrica-info/10 text-isometrica-info',
  PROFESSOR: 'bg-isometrica-accent/10 text-isometrica-accent',
  ADMIN: 'bg-isometrica-success/10 text-isometrica-success',
}

export default function AdminUsuariosPage() {
  const { data: usuarios = [], isLoading: carregando } = useAdminUsuarios()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [busca, setBusca] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novoPapel, setNovoPapel] = useState<Papel>('STUDENT')
  const ITENS_POR_PAGINA = 10
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [confirmNome, setConfirmNome] = useState('')

  async function mudarPapel(userId: string, papel: Papel) {
    try {
      await updateUser.mutateAsync({ id: userId, data: { role: papel } })
      setEditandoId(null)
    } catch { toast.error('Erro ao atualizar usuário') }
  }

  function remover(userId: string, nome: string) {
    setConfirmNome(nome)
    setPendingAction(() => async () => {
      try {
        await deleteUser.mutateAsync(userId)
      } catch { toast.error('Erro ao remover usuário') }
    })
    setConfirmOpen(true)
  }

  const filtrados = usuarios.filter((u) =>
    !busca || u.name?.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
  )

  const stats = {
    total: usuarios.length,
    students: usuarios.filter((u) => u.role === 'STUDENT').length,
    professors: usuarios.filter((u) => u.role === 'PROFESSOR').length,
    admins: usuarios.filter((u) => u.role === 'ADMIN').length,
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Usuários</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Gerencie todos os usuários da plataforma</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-isometrica-info">{stats.students}</p>
          <p className="text-xs text-muted-foreground">Estudantes</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-isometrica-accent">{stats.professors}</p>
          <p className="text-xs text-muted-foreground">Professores</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-isometrica-success">{stats.admins}</p>
          <p className="text-xs text-muted-foreground">Admins</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-isometrica-accent">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </motion.div>

      {carregando ? (
        <ListSkeleton items={5} />
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/40" />
          <h3 className="text-sm font-semibold">Nenhum usuário encontrado</h3>
          <p className="mt-1 text-xs text-muted-foreground">{busca ? 'Tente outro termo de busca' : 'Nenhum usuário cadastrado na plataforma'}</p>
        </div>
      ) : (
        <motion.div variants={container} className="space-y-2">
          {filtrados.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA).map((u) => (
            <motion.div key={u.id} variants={item} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-isometrica-accent/20">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-sm font-bold text-white">
                  {u.name?.[0] ?? u.email[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{u.name ?? 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  {u.university && <p className="text-[10px] text-muted-foreground">{u.university}{u.period ? ` · ${u.period}º período` : ''}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${papelColor[u.role as Papel]}`}>
                    {papelLabel[u.role as Papel]}
                  </span>
                </div>
                <button
                  onClick={() => setEditandoId(editandoId === u.id ? null : u.id)}
                  className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all"
                >
                  {editandoId === u.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              </div>

              {editandoId === u.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-muted-foreground" />
                    <select
                      value={u.role}
                      onChange={(e) => mudarPapel(u.id, e.target.value as Papel)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-isometrica-accent"
                    >
                      <option value="STUDENT">Estudante</option>
                      <option value="PROFESSOR">Professor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <button
                    onClick={() => remover(u.id, u.name ?? u.email)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-isometrica-danger transition-all hover:bg-isometrica-danger/5"
                  >
                    <Trash2 className="size-3.5" />
                    Remover
                  </button>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    Criado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
      {filtrados.length > ITENS_POR_PAGINA && (
        <Pagination
          currentPage={paginaAtual}
          totalPages={Math.ceil(filtrados.length / ITENS_POR_PAGINA)}
          onPageChange={setPaginaAtual}
        />
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>Remover {confirmNome}? Esta ação não pode ser desfeita. O usuário será removido permanentemente da plataforma.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => { pendingAction?.(); setConfirmOpen(false) }}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
