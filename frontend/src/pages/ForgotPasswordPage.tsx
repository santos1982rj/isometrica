/**
 * @file ForgotPasswordPage.tsx
 * @description Página de "Esqueci minha senha" refatorada com Design System.
 */

import React, { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { esqueciSenha } from '../services/api';
import { Mail, Send, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!email.trim()) return;

    setEnviando(true);
    try {
      await esqueciSenha(email.trim());
      setEnviado(true);
    } catch  {
      // Erro é tratado silenciosamente por segurança
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassPanel className="p-8!" glow>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 mx-auto mb-4">N</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Esqueci minha senha</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {enviado ? 'Email enviado!' : 'Digite seu email para receber o link de recuperação.'}
            </p>
          </div>

          {enviado ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-green-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
              <Link to="/login" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoFocus
                variant="glass"
              />

              <Button type="submit" variant="primary" size="lg" loading={enviando} icon={Send} className="w-full">
                {enviando ? 'Enviando...' : 'Enviar link'}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Voltar para o login
                </Link>
              </p>
            </form>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;