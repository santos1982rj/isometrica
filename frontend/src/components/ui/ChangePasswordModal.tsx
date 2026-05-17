/**
 * @file ChangePasswordModal.tsx
 * @description Modal para alteração de senha do usuário.
 * 
 * Exibe formulário com campos: senha atual, nova senha e confirmação.
 * Validações: campos obrigatórios, senha mínima de 6 caracteres,
 * nova senha diferente da atual, confirmação igual à nova senha.
 * 
 * @see authService: src/services/authService.ts
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { alterarSenha } from '../../services/authService';
import GlassPanel from './GlassPanel';
import NeumorphicButton from './NeumorphicButton';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface ChangePasswordModalProps {
  /** Controla a visibilidade do modal */
  isOpen: boolean;
  /** Função para fechar o modal */
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { usuario, token } = useAuth();

  /* ─── Estado do formulário ──────────────────────────────── */
  const [senhaAtual, setSenhaAtual] = useState<string>('');
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');

  /* ─── Estado de visibilidade das senhas ─────────────────── */
  const [mostrarAtual, setMostrarAtual] = useState<boolean>(false);
  const [mostrarNova, setMostrarNova] = useState<boolean>(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState<boolean>(false);

  /**
   * Fecha o modal e limpa os campos.
   */
  function handleClose(): void {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
    onClose();
  }

  /**
   * Submete o formulário de alteração de senha.
   * Valida todos os campos antes de enviar para a API.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErro('');

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha === senhaAtual) {
      setErro('A nova senha deve ser diferente da senha atual.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    if (!usuario || !token) return;

    setCarregando(true);

    try {
      await alterarSenha(usuario.id, senhaAtual, novaSenha, token);

      toast.success('Senha alterada!', {
        description: 'Sua senha foi atualizada com sucesso.',
      });

      handleClose();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao alterar senha.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <GlassPanel className="w-full max-w-md !p-6" glow>
              {/* Cabeçalho */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock size={20} className="text-primary-500" />
                  Alterar Senha
                </h2>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors interactive"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Mensagem de erro */}
              {erro && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-4"
                >
                  {erro}
                </motion.div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Senha Atual */}
                <div>
                  <label
                    htmlFor="senhaAtual"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Senha atual
                  </label>
                  <div className="relative">
                    <input
                      id="senhaAtual"
                      type={mostrarAtual ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-10 rounded-xl bg-white/50 dark:bg-gray-800/50 
                                 border border-gray-200 dark:border-gray-700 
                                 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/50 
                                 focus:border-primary-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarAtual(!mostrarAtual)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {mostrarAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div>
                  <label
                    htmlFor="novaSenha"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="novaSenha"
                      type={mostrarNova ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2 pr-10 rounded-xl bg-white/50 dark:bg-gray-800/50 
                                 border border-gray-200 dark:border-gray-700 
                                 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/50 
                                 focus:border-primary-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNova(!mostrarNova)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {mostrarNova ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label
                    htmlFor="confirmarSenha"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmarSenha"
                      type={mostrarConfirmar ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-4 py-2 pr-10 rounded-xl bg-white/50 dark:bg-gray-800/50 
                                 border border-gray-200 dark:border-gray-700 
                                 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/50 
                                 focus:border-primary-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {mostrarConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2 pt-2">
                  <NeumorphicButton className="flex-1" variant="primary">
                    <button
                      type="submit"
                      disabled={carregando}
                      className="w-full h-full bg-transparent border-none text-inherit font-inherit cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock size={16} />
                      {carregando ? 'Alterando...' : 'Alterar senha'}
                    </button>
                  </NeumorphicButton>
                  <NeumorphicButton className="flex-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full h-full bg-transparent border-none text-inherit font-inherit cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </NeumorphicButton>
                </div>
              </form>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;