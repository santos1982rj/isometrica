/**
 * @file PublicLayout.tsx
 * @description Layout para páginas públicas com navbar e footer.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/atoms/Button';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">I</div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Isométrica</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500">Entrar</Link>
            <Link to="/registro">
              <Button variant="primary" size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1 - Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">I</div>
                <span className="font-bold text-gray-900 dark:text-white">Isométrica</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Plataforma de aprendizado para engenharia. Estruture seu conhecimento.
              </p>
            </div>

            {/* Coluna 2 - Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/cursos" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Cursos</Link></li>
                <li><Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Entrar</Link></li>
                <li><Link to="/registro" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Criar conta</Link></li>
              </ul>
            </div>

            {/* Coluna 3 - Suporte */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contato" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Contato</Link></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Privacidade</a></li>
              </ul>
            </div>

            {/* Coluna 4 - Redes Sociais */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 Isométrica. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}