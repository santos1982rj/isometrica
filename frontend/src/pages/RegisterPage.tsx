/**
 * @file RegisterPage.tsx
 * @description Página de registro refatorada com Design System e Tailwind v4.
 * 
 * Utiliza Input, InputPassword e Button do Design System.
 * Validação completa com feedback visual de erro.
 * 
 * @route /registro
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
import { User, Mail, UserPlus, ArrowRight } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { fazerRegistro } = useAuth();

  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setCarregando(true);

    try {
      await fazerRegistro(nome.trim(), email.trim(), senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar conta.');
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
        <GlassPanel className="p-8!" glow>
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30 mx-auto mb-4">
              N
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Criar sua conta
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Comece sua jornada de aprendizado
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
              label="Nome completo"
              icon={User}
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
              autoFocus
              variant="glass"
            />

            <Input
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              variant="glass"
            />

            <InputPassword
              label="Senha (mínimo 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              variant="glass"
            />

            <InputPassword
              label="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
              variant="glass"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={carregando}
              icon={carregando ? undefined : UserPlus}
              className="w-full"
            >
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          {/* Link para login */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors inline-flex items-center gap-1"
            >
              Fazer login
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

export default RegisterPage;