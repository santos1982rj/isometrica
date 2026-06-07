'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/sidebar';

const itensMenu = [
  { rotulo: 'Dashboard', href: '/dashboard', icone: '' },
  { rotulo: 'Meus Cursos', href: '/cursos', icone: '' },
  { rotulo: 'Tutor IA', href: '/tutor', icone: '' },
  { rotulo: 'Progresso', href: '/progresso', icone: '' },
  { rotulo: 'Tutor IA', href: '/tutor', icone: '' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-border px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-isometrica-primary text-sm font-bold text-white">
              I
            </div>
            <span className="font-display text-lg font-semibold text-isometrica-primary">
              Isométrica
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {itensMenu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton isActive={pathname === item.href}>
                        <span>{item.rotulo}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4">
          {usuario && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-isometrica-accent text-xs font-bold text-white">
                  {usuario.name?.[0] ?? usuario.email[0].toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{usuario.name ?? 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{usuario.email}</p>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sair
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
