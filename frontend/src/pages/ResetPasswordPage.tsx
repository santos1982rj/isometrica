/**
 * @file ResetPasswordPage.tsx
 * @description Página de redefinição de senha refatorada com Design System.
 */

import React, { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { InputPassword } from '../components/ui/atoms/InputPassword';
import { redefinirSenha } from '../services/api';
import { Save, AlertTriangle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string>('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErro('');

    if (!novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    if (!token) {
      setErro('Token inválido. Solicite um novo link.');
      return;
    }

    setSalvando(true);

    try {
      await redefinirSenha(token, novaSenha);
      navigate('/login');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassPanel className="p-8!" glow>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 mx-auto mb-4">N</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Digite sua nova senha.</p>
          </div>

          {erro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              {erro}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputPassword
              label="Nova senha (mínimo 6 caracteres)"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
              variant="glass"
            />

            <InputPassword
              label="Confirmar nova senha"
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
              loading={salvando}
              icon={Save}
              className="w-full"
            >
              {salvando ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </form>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;