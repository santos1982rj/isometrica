'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  TrendingUp,
  Search,
  Flame,
  Bell,
  LogOut,
  GraduationCap,
  Award,
  CreditCard,
  Gamepad2,
  Users,
  User,
  Settings,
  DollarSign,
  BarChart3,
  FilePlus,
  PenSquare,
  AlertTriangle,
} from 'lucide-react'

const menuEstudante = [
  { rotulo: 'Dashboard', href: '/dashboard', icone: LayoutDashboard },
  { rotulo: 'Meu Perfil', href: '/perfil', icone: User },
  { rotulo: 'Meus Cursos', href: '/cursos', icone: BookOpen },
  { rotulo: 'Gamificação', href: '/gamificacao', icone: Gamepad2 },
  { rotulo: 'Tutor IA', href: '/tutor', icone: Bot },
  { rotulo: 'Progresso', href: '/progresso', icone: TrendingUp },
  { rotulo: 'Feed de Erros', href: '/erros', icone: AlertTriangle },
]

const menuEstudanteExtra = [
  { rotulo: 'Certificados', href: '/certificados', icone: Award },
  { rotulo: 'Assinatura', href: '/assinatura', icone: CreditCard },
]

const menuProfessor = [
  { rotulo: 'Dashboard', href: '/professor/dashboard', icone: LayoutDashboard },
  { rotulo: 'Meus Cursos', href: '/professor/cursos', icone: BookOpen },
  { rotulo: 'Criar Curso', href: '/professor/cursos/novo', icone: FilePlus },
  { rotulo: 'Turmas', href: '#', icone: Users },
]

const menuAdmin = [
  { rotulo: 'Dashboard', href: '/admin/dashboard', icone: LayoutDashboard },
  { rotulo: 'Cursos', href: '/professor/cursos', icone: BookOpen },
  { rotulo: 'Criar Curso', href: '/professor/cursos/novo', icone: FilePlus },
  { rotulo: 'Usuários', href: '/admin/usuarios', icone: Users },
  { rotulo: 'Financeiro', href: '/admin/financeiro', icone: DollarSign },
  { rotulo: 'Analytics', href: '#', icone: BarChart3 },
]

function SidebarNav({ pathname, role }: { pathname: string; role: string }) {
  const isActive = (href: string) => {
    if (href === '#') return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (role === 'PROFESSOR') {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Professor</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuProfessor.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={isActive(item.href)}>
                    <item.icone className="size-4" />
                    <span>{item.rotulo}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (role === 'ADMIN') {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuAdmin.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={isActive(item.href)}>
                    <item.icone className="size-4" />
                    <span>{item.rotulo}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navegação</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuEstudante.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={isActive(item.href)}>
                    <item.icone className="size-4" />
                    <span>{item.rotulo}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Acadêmico</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuEstudanteExtra.map((item) => (
              <SidebarMenuItem key={item.rotulo}>
                <SidebarMenuButton>
                  <item.icone className="size-4" />
                  <span>{item.rotulo}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { usuario, logout } = useAuth()
  const role = usuario?.role ?? 'STUDENT'
  const homeHref = role === 'PROFESSOR' ? '/professor/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-border px-5 py-4">
          <Link href={homeHref} className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-[#f07a4a] text-sm font-extrabold text-white shadow-sm">
              I
            </div>
            <div className="leading-tight">
              <span className="font-display text-base font-bold text-foreground">Isométrica</span>
              <span className="block text-[8px] font-medium uppercase tracking-[0.3px] text-muted-foreground">Plataforma de evolução</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav pathname={pathname} role={role} />
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          {usuario && (
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-[#f07a4a] text-xs font-bold text-white shadow-sm">
                {usuario.name?.[0] ?? usuario.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{usuario.name ?? 'Usuário'}</p>
                <p className="truncate text-[11px] text-muted-foreground">{usuario.email}</p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-3 lg:px-4 lg:gap-3">
          <SidebarTrigger />
          <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-isometrica-accent focus-within:bg-card focus-within:shadow-[0_0_0_3px_rgba(232,93,50,0.12)] max-w-xs flex-1">
            <Search className="size-3.5 shrink-0" />
            <input
              placeholder="Buscar..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-isometrica-accent/10 px-3 py-1 text-xs font-semibold text-isometrica-accent border border-isometrica-accent/15">
              <Flame className="size-3" />
              7 dias
            </div>

            <button className="relative flex size-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-isometrica-accent border-2 border-card" />
            </button>

            <ThemeToggle />

            <button
              onClick={logout}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
