'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'

export function Navbar() {
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
