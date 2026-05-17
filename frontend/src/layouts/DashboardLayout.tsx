/**
 * @file DashboardLayout.tsx
 * @description Layout principal do dashboard com sidebar colapsável,
 *              navegação por ícones, barra superior com breadcrumb,
 *              busca rápida, notificações, tema, perfil, conversor de unidades e calculadora científica.
 * 
 * Atalhos:
 * - Ctrl+K: Busca rápida
 * - Ctrl+Shift+U: Conversor de unidades
 * - Ctrl+Shift+C: Calculadora científica
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  GraduationCap,
  Trophy,
  Shield,
  Bell,
  Ruler,
  Calculator,
} from 'lucide-react';
import { Button } from '../components/ui/atoms/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { AutoBreadcrumb } from '../components/ui/Breadcrumb';
import SearchModal from '../components/ui/SearchModal';
import UnitConverter from '../components/ui/UnitConverter';
import ScientificCalculator from '../components/ui/ScientificCalculator';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../contexts/useTheme';
import { useNotificacoesStore } from '../stores/notificacoesStore';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

/* ═══════════════════════════════════════════════════════════════
   Mapa de Rotas para Breadcrumb
   ═══════════════════════════════════════════════════════════════ */

const ROUTE_MAP: Record<string, { label: string; icon?: React.FC<{ size?: number }> }> = {
  '/': { label: 'Visão Geral', icon: LayoutDashboard },
  '/cursos': { label: 'Cursos', icon: BookOpen },
  '/meus-cursos': { label: 'Meus Cursos', icon: GraduationCap },
  '/ranking': { label: 'Ranking', icon: Trophy },
  '/admin/cursos': { label: 'Gerenciar Cursos', icon: BookOpen },
  '/admin': { label: 'Admin', icon: Shield },
  '/notificacoes': { label: 'Notificações', icon: Bell },
  '/perfil': { label: 'Perfil', icon: User },
  '/configuracoes': { label: 'Configurações', icon: Settings },
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [showConverter, setShowConverter] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { isDark, alternarTema } = useTheme();
  const { naoLidas } = useNotificacoesStore();

  /* ─── Itens de navegação ───────────────────────────────── */

  const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'Visão Geral', icon: LayoutDashboard },
    { path: '/cursos', label: 'Cursos', icon: BookOpen },
    { path: '/meus-cursos', label: 'Meus Cursos', icon: GraduationCap },
    { path: '/ranking', label: 'Ranking', icon: Trophy },
    ...(usuario?.role === 'PROFESSOR' || usuario?.role === 'ADMIN'
      ? [{ path: '/admin/cursos', label: 'Gerenciar Cursos', icon: BookOpen }]
      : []),
    ...(usuario?.role === 'ADMIN'
      ? [{ path: '/admin', label: 'Admin', icon: Shield }]
      : []),
  ];

  /* ─── Atalhos de teclado ───────────────────────────────── */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+U: Conversor de Unidades
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        setShowConverter(prev => !prev);
      }
      // Ctrl+Shift+C: Calculadora Científica
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowCalculator(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ─── Handlers ─────────────────────────────────────────── */

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  function getIniciais(nome: string): string {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  /* ─── Renderização ─────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 flex">
      {/* ─── Sidebar Expandida ──────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden shrink-0"
          >
            <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-3 p-4 h-16 border-b border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/30">
                  N
                </div>
                <span className="text-lg font-bold bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent whitespace-nowrap">
                  Nó na Armadura
                </span>
              </div>

              {/* Navegação */}
              <nav className="flex-1 space-y-1 p-3">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 interactive
                        ${isActive
                          ? 'bg-primary-500/15 text-primary-700 dark:bg-primary-500/25 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <IconComponent size={20} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout} className="w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Sair
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Sidebar Colapsada ──────────────────────────────── */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 64, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden shrink-0"
          >
            <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-1">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-4">
                N
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <Tooltip key={item.path} content={item.label} side="right">
                    <Link
                      to={item.path}
                      className={`p-2 rounded-xl transition-all duration-300 interactive
                        ${isActive
                          ? 'bg-primary-500/15 text-primary-700 dark:bg-primary-500/25 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <IconComponent size={20} />
                    </Link>
                  </Tooltip>
                );
              })}
              <div className="mt-auto">
                <Tooltip content="Sair" side="right">
                  <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" />
                </Tooltip>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Conteúdo Principal ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Barra Superior */}
        <div className="sticky top-0 z-10 flex items-center gap-4 px-4 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          {/* Toggle Sidebar */}
          <Tooltip content={isSidebarOpen ? 'Recolher' : 'Expandir'}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </Tooltip>

          {/* Breadcrumb */}
          <div className="flex-1">
            <AutoBreadcrumb pathname={location.pathname} routeMap={ROUTE_MAP} />
          </div>

          {/* Ações da Barra Superior */}
          <div className="flex items-center gap-2">
            {/* Calculadora Científica */}
            <Tooltip content="Calculadora (Ctrl+Shift+C)">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive text-gray-500"
              >
                <Calculator size={18} />
              </button>
            </Tooltip>

            {/* Conversor de Unidades */}
            <Tooltip content="Conversor de Unidades (Ctrl+Shift+U)">
              <button
                onClick={() => setShowConverter(!showConverter)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive text-gray-500"
              >
                <Ruler size={18} />
              </button>
            </Tooltip>

            {/* Busca */}
            <Tooltip content="Buscar (Ctrl+K)">
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive text-gray-500"
              >
                <Search size={18} />
              </button>
            </Tooltip>

            {/* Notificações */}
            <Tooltip content="Notificações">
              <Link
                to="/notificacoes"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive text-gray-500"
              >
                <Bell size={18} />
                {naoLidas > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {naoLidas > 9 ? '9+' : naoLidas}
                  </span>
                )}
              </Link>
            </Tooltip>

            {/* Tema */}
            <Tooltip content={isDark ? 'Modo claro' : 'Modo escuro'}>
              <button
                onClick={alternarTema}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive text-gray-500"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </Tooltip>

            {/* Perfil */}
            <Tooltip content="Perfil">
              <Link
                to="/perfil"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive ml-2"
              >
                <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {usuario ? getIniciais(usuario.nome) : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {usuario?.nome?.split(' ')[0]}
                </span>
              </Link>
            </Tooltip>
          </div>
        </div>

        {/* Conteúdo da Página */}
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Modais Flutuantes */}
      <SearchModal />
      <UnitConverter isOpen={showConverter} onClose={() => setShowConverter(false)} />
      <ScientificCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default DashboardLayout;