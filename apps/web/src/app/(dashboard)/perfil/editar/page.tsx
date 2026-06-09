'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'

export default function EditarPerfilPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [title, setTitle] = useState('')
  const [university, setUniversity] = useState('')
  const [period, setPeriod] = useState('')
  const [lattes, setLattes] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    api.profile.me().then((data) => {
      const u = data.user
      setNome(u.name ?? '')
      setBio(u.bio ?? '')
      setTitle(u.title ?? '')
      setUniversity(u.university ?? '')
      setPeriod(u.period ? String(u.period) : '')
      setLattes(u.lattes ?? '')
      setLinkedin(u.linkedin ?? '')
      setInstagram(u.instagram ?? '')
      setTwitter(u.twitter ?? '')
      setImageUrl(u.imageUrl ?? '')
      setRole(u.role ?? '')
    }).catch(console.error).finally(() => setCarregando(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { toast.error('Nome é obrigatório'); return }
    setEnviando(true)
    try {
      await api.profile.atualizar({
        name: nome, bio, title, university,
        period: period ? Number(period) : undefined,
        lattes, linkedin, instagram, twitter, imageUrl,
      })
      toast.success('Perfil atualizado!')
      router.push('/perfil')
    } catch { toast.error('Erro ao atualizar perfil') }
    finally { setEnviando(false) }
  }

  if (carregando) return <div className="mx-auto max-w-xl space-y-4 p-5"><div className="h-96 animate-pulse rounded-xl bg-muted" /></div>

  const fieldClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-isometrica-accent focus:ring-2 focus:ring-isometrica-accent/15"

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl space-y-6 pb-12">
      <div>
        <Link href="/perfil" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" /> Voltar ao perfil
        </Link>
        <h1 className="font-display text-2xl font-bold">Editar Perfil</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Atualize suas informações públicas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Informações Básicas</h2>
          <div className="space-y-2"><label className="text-sm font-medium">Nome *</label><input value={nome} onChange={e => setNome(e.target.value)} className={fieldClass} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={`${fieldClass} resize-none`} placeholder="Conte um pouco sobre você..." /></div>
          <div className="space-y-2"><label className="text-sm font-medium">URL da Foto</label><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={fieldClass} placeholder="https://..." /></div>
        </div>

        {(role === 'STUDENT' || true) && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Acadêmico</h2>
            {role === 'STUDENT' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Universidade</label><input value={university} onChange={e => setUniversity(e.target.value)} className={fieldClass} placeholder="Ex: Universidade Federal..." /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Período</label><input type="number" value={period} onChange={e => setPeriod(e.target.value)} min={1} max={12} className={fieldClass} /></div>
              </>
            )}
            {role === 'PROFESSOR' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Título *</label><input value={title} onChange={e => setTitle(e.target.value)} className={fieldClass} placeholder="Ex: Doutor em Engenharia Civil" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Universidade / Instituição</label><input value={university} onChange={e => setUniversity(e.target.value)} className={fieldClass} /></div>
              </>
            )}
          </div>
        )}

        {role === 'PROFESSOR' && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Redes e Credenciais</h2>
            <div className="space-y-2"><label className="text-sm font-medium">Lattes</label><input value={lattes} onChange={e => setLattes(e.target.value)} className={fieldClass} placeholder="http://lattes.cnpq.br/..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">LinkedIn</label><input value={linkedin} onChange={e => setLinkedin(e.target.value)} className={fieldClass} placeholder="https://linkedin.com/in/..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><label className="text-sm font-medium">Instagram</label><input value={instagram} onChange={e => setInstagram(e.target.value)} className={fieldClass} placeholder="@usuario" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Twitter</label><input value={twitter} onChange={e => setTwitter(e.target.value)} className={fieldClass} placeholder="@usuario" /></div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={enviando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90 disabled:opacity-50">
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {enviando ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          <Link href="/perfil" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-muted">Cancelar</Link>
        </div>
      </form>
    </motion.div>
  )
}
