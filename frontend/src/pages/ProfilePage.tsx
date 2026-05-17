/**
 * @file ProfilePage.tsx
 * @description Página de perfil do usuário com edição, avatar, senha e gamificação.
 */

import React, { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';
import { atualizarPerfil, atualizarAvatar } from '../services/api';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { InputPassword } from '../components/ui/atoms/InputPassword';
import { Badge } from '../components/ui/atoms/Badge';
import { Modal } from '../components/ui/molecules/Modal';
import AvatarUpload from '../components/ui/AvatarUpload';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  Mail, Calendar, Award, Edit3, Save, X, Clock, Shield, Lock, Star
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────── */
function getIniciais(nome: string): string {
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ─── Conquistas de exemplo ───────────────────────────── */
const CONQUISTAS = [
  { id: '1', titulo: 'Primeiro Cálculo', descricao: 'Realizou seu primeiro dimensionamento', icone: Award, cor: 'text-amber-500', desbloqueada: true },
  { id: '2', titulo: '5 Cálculos', descricao: 'Completou 5 dimensionamentos', icone: Award, cor: 'text-gray-400 dark:text-gray-600', desbloqueada: false },
  { id: '3', titulo: 'Mestre das Vigas', descricao: 'Dimensionou 10 vigas corretamente', icone: Shield, cor: 'text-gray-400 dark:text-gray-600', desbloqueada: false },
  { id: '4', titulo: 'Madrugador', descricao: 'Acessou a plataforma por 7 dias seguidos', icone: Clock, cor: 'text-gray-400 dark:text-gray-600', desbloqueada: false },
];

/* ─── Componente principal ────────────────────────────── */
const ProfilePage: React.FC = () => {
  const { usuario, token, atualizarUsuario } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome || '');
  const [salvando, setSalvando] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [avatar, setAvatar] = useState<string | null>(usuario?.avatar || null);

  if (!usuario) return <SkeletonCard />;

  async function handleSaveAvatar(base64: string | null) {
    if (!usuario || !token) return;
    try {
      const resposta = await atualizarAvatar(usuario.id, base64, token);
      atualizarUsuario(resposta.usuario);
      setAvatar(base64);
      toast.success('Avatar atualizado!');
    } catch {
      toast.error('Erro ao salvar avatar.');
    }
  }

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('O nome não pode ficar vazio.');
      return;
    }
    if (!usuario || !token) return;
    setSalvando(true);
    try {
      const resposta = await atualizarPerfil(usuario.id, { nome: nome.trim() }, token);
      atualizarUsuario(resposta.usuario);
      toast.success('Perfil atualizado!');
      setEditando(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Gerencie suas informações e conquistas.</p>
      </div>

      {/* Card Principal */}
      <GlassPanel className="p-8!" glow>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <AvatarUpload
              currentAvatar={avatar}
              iniciais={getIniciais(usuario.nome)}
              onAvatarChange={handleSaveAvatar}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            {editando ? (
              <form onSubmit={handleSalvarPerfil} className="space-y-4">
                <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" loading={salvando} icon={Save}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="ghost" icon={X} onClick={() => setEditando(false)}>Cancelar</Button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{usuario.nome}</h2>
                <div className="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{usuario.email}</span>
                    <Badge variant="success" size="sm">Verificado</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Membro desde {formatarData(usuario.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" icon={Edit3} onClick={() => setEditando(true)}>Editar perfil</Button>
                  <Button variant="secondary" icon={Lock} onClick={() => setShowPasswordModal(true)}>Alterar senha</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Award} label="Cálculos" value="12" color="text-primary-500" />
        <StatCard icon={Shield} label="Exercícios" value="48" color="text-green-500" />
        <StatCard icon={Clock} label="Horas estudadas" value="32h" color="text-purple-500" />
        <StatCard icon={Star} label="Pontuação" value="1.250" color="text-amber-500" />
      </div>

      {/* Conquistas */}
      <GlassPanel className="p-8!" glow>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Award size={24} className="text-amber-500" />
          Conquistas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONQUISTAS.map((conquista, index) => {
            const IconComponent = conquista.icone;
            return (
              <motion.div
                key={conquista.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                  ${conquista.desbloqueada
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                  ${conquista.desbloqueada ? 'bg-amber-100 dark:bg-amber-800/40' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <IconComponent size={24} className={conquista.desbloqueada ? conquista.cor : 'text-gray-400 dark:text-gray-500'} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${conquista.desbloqueada ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {conquista.titulo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{conquista.descricao}</p>
                </div>
                {conquista.desbloqueada && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto shrink-0">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Modal de senha */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Alterar Senha" size="md">
        <AlterarSenhaForm onSuccess={() => setShowPasswordModal(false)} />
      </Modal>
    </motion.div>
  );
};

/* ─── Subcomponentes ──────────────────────────────────── */

function StatCard({ icon: IconComponent, label, value, color }: {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <GlassPanel className="p-4! text-center">
      <IconComponent size={24} className={`mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </GlassPanel>
  );
}

function AlterarSenhaForm({ onSuccess }: { onSuccess: () => void }) {
  const { usuario, token } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!senhaAtual || !novaSenha || !confirmarSenha) { setErro('Preencha todos os campos.'); return; }
    if (novaSenha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não conferem.'); return; }

    setCarregando(true);
    try {
      const { alterarSenha } = await import('../services/authService');
      if (!usuario || !token) return;
      await alterarSenha(usuario.id, senhaAtual, novaSenha, token);
      toast.success('Senha alterada com sucesso!');
      onSuccess();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><span>⚠️</span> {erro}</p>}
      <InputPassword label="Senha atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
      <InputPassword label="Nova senha (mínimo 6 caracteres)" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" />
      <InputPassword label="Confirmar nova senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={carregando} icon={Save}>{carregando ? 'Alterando...' : 'Alterar senha'}</Button>
      </div>
    </form>
  );
}

export default ProfilePage;