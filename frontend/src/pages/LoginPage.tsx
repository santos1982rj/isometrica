/**
 * @file LoginPage.tsx
 * @description Página de login refatorada com Design System e Tailwind v4.
 * 
 * Utiliza os componentes Input, InputPassword e Button do Design System,
 * eliminando classes duplicadas e garantindo acessibilidade e contraste.
 * 
 * @route /login
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { InputPassword } from '../components/ui/atoms/InputPassword';
import { useAuth } from '../contexts/useAuth';
import { Mail, LogIn, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { fazerLogin } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      await fazerLogin(email.trim(), senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Email ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <GlassPanel className="p-8" glow>
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30 mx-auto mb-4">
              N
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2"
            >
              <span className="text-base">⚠️</span>
              {erro}
            </motion.div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              variant="glass"
            />

            <InputPassword
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              variant="glass"
            />

            {/* Link "Esqueci minha senha" */}
            <div className="text-right">
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={carregando}
              icon={carregando ? undefined : LogIn}
              className="w-full"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Link para registro */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <Link
              to="/registro"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors inline-flex items-center gap-1"
            >
              Criar conta gratuita
              <ArrowRight size={14} />
            </Link>
          </p>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-800 px-3 text-gray-400">
                ou
              </span>
            </div>
          </div>

          {/* Voltar para home */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              Voltar para página inicial
            </Link>
          </p>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default LoginPage;