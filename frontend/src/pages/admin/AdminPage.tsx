/**
 * @file AdminPage.tsx
 * @description Painel administrativo para gerenciamento completo de usuários.
 * Permite criar, editar, bloquear/desbloquear e excluir usuários.
 * Acesso restrito a ADMIN.
 * 
 * Totalmente tipado – sem `any`.
 * Corrigido para React 19: setState assíncrono em useEffect.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/useAuth';
import {
  fetchUsuarios,
  criarUsuario,
  editarUsuario,
  alterarStatusUsuario,
  excluirUsuario,
  type AdminUsuario,
} from '../../services/api';
import GlassPanel from '../../components/ui/GlassPanel';
import { Button } from '../../components/ui/atoms/Button';
import { Input } from '../../components/ui/atoms/Input';
import { InputPassword } from '../../components/ui/atoms/InputPassword';
import { Select } from '../../components/ui/atoms/Select';
import { Badge } from '../../components/ui/atoms/Badge';
import { Modal } from '../../components/ui/molecules/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import {
  Users, Plus, Edit3, Trash2, Lock, Unlock, Shield,
} from 'lucide-react';

/* ─── Constantes tipadas ──────────────────────────────── */
const ROLE_OPTIONS: { value: AdminUsuario['role']; label: string }[] = [
  { value: 'ALUNO', label: 'Aluno' },
  { value: 'PROFESSOR', label: 'Professor' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS: { value: AdminUsuario['status']; label: string }[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
];

const ROLE_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  ALUNO: { label: 'Aluno', variant: 'success' },
  PROFESSOR: { label: 'Professor', variant: 'warning' },
  ADMIN: { label: 'Admin', variant: 'danger' },
};

/* ─── Componente ─────────────────────────────────────── */
const AdminPage: React.FC = () => {
  const { usuario, token } = useAuth();
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de criação/edição
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formRole, setFormRole] = useState<AdminUsuario['role']>('ALUNO');
  const [formStatus, setFormStatus] = useState<AdminUsuario['status']>('ATIVO');
  const [salvando, setSalvando] = useState(false);

  // Função de carregamento memoizada, com setState assíncrono
const carregar = useCallback(async () => {
  if (!token) return;
  setLoading(true);
  try {
    const data = await fetchUsuarios(token);
    // setTimeout evita setState síncrono no efeito (React 19)
    setTimeout(() => {
      setUsuarios(data.usuarios);
      setLoading(false);
    }, 0);
  } catch {
    setTimeout(() => {
      toast.error('Erro ao carregar usuários.');
      setLoading(false);
    }, 0);
  }
}, [token]);

useEffect(() => {
  const timer = setTimeout(() => {
    carregar();
  }, 0);
  return () => clearTimeout(timer);
}, [carregar]);

  function abrirNovo(): void {
    setEditandoId(null);
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setFormRole('ALUNO');
    setFormStatus('ATIVO');
    setShowModal(true);
  }

  function abrirEdicao(u: AdminUsuario): void {
    setEditandoId(u.id);
    setFormNome(u.nome);
    setFormEmail(u.email);
    setFormSenha('');
    setFormRole(u.role);
    setFormStatus(u.status);
    setShowModal(true);
  }

  async function handleSalvar(): Promise<void> {
    if (!formNome.trim() || !formEmail.trim()) {
      toast.error('Preencha nome e email.');
      return;
    }
    if (!editandoId && !formSenha) {
      toast.error('Senha é obrigatória para novo usuário.');
      return;
    }
    if (!token) return;

    setSalvando(true);
    try {
      if (editandoId) {
        await editarUsuario(editandoId, {
          nome: formNome.trim(),
          email: formEmail.trim(),
          role: formRole,
          status: formStatus,
        }, token);
        toast.success('Usuário atualizado!');
      } else {
        await criarUsuario({
          nome: formNome.trim(),
          email: formEmail.trim(),
          senha: formSenha,
          role: formRole,
          status: formStatus,
        }, token);
        toast.success('Usuário criado!');
      }
      setShowModal(false);
      carregar();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar usuário.';
      toast.error(message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggleStatus(u: AdminUsuario): Promise<void> {
    const novoStatus: AdminUsuario['status'] = u.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    if (!token) return;
    try {
      await alterarStatusUsuario(u.id, novoStatus, token);
      setUsuarios(prev => prev.map(user => user.id === u.id ? { ...user, status: novoStatus } : user));
      toast.success(`Usuário ${novoStatus === 'ATIVO' ? 'desbloqueado' : 'bloqueado'}.`);
    } catch {
      toast.error('Erro ao alterar status.');
    }
  }

  async function handleExcluir(id: number): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    if (!token) return;
    try {
      await excluirUsuario(id, token);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      toast.success('Usuário excluído.');
    } catch {
      toast.error('Erro ao excluir usuário.');
    }
  }

  if (usuario?.role !== 'ADMIN') {
    return (
      <div className="text-center py-20">
        <Shield size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acesso Restrito</h1>
        <p className="text-gray-500 dark:text-gray-400">Apenas administradores.</p>
      </div>
    );
  }

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={28} /> Gerenciar Usuários
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{usuarios.length} usuários</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={abrirNovo}>Novo Usuário</Button>
      </div>

      <GlassPanel className="p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 font-semibold">Nome</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Email</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Nível</th>
                <th className="text-left p-4 font-semibold hidden sm:table-cell">Role</th>
                <th className="text-left p-4 font-semibold hidden sm:table-cell">Status</th>
                <th className="text-right p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{u.nome}</td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{u.email}</td>
                  <td className="p-4 hidden md:table-cell">{u.nivel}</td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={ROLE_BADGE_MAP[u.role]?.variant || 'success'} size="sm">
                      {ROLE_BADGE_MAP[u.role]?.label || u.role}
                    </Badge>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={u.status === 'ATIVO' ? 'success' : 'danger'} size="sm">
                      {u.status === 'ATIVO' ? 'Ativo' : 'Bloqueado'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEdicao(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title="Editar"><Edit3 size={16} /></button>
                      <button onClick={() => handleToggleStatus(u)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title={u.status === 'ATIVO' ? 'Bloquear' : 'Desbloquear'}>
                        {u.status === 'ATIVO' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button onClick={() => handleExcluir(u.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Modal de criação/edição */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editandoId ? 'Editar Usuário' : 'Novo Usuário'} size="md">
        <div className="space-y-4">
          <Input label="Nome" value={formNome} onChange={e => setFormNome(e.target.value)} />
          <Input label="Email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
          {!editandoId && (
            <InputPassword label="Senha" value={formSenha} onChange={e => setFormSenha(e.target.value)} />
          )}
          <Select label="Role" value={formRole} onChange={e => setFormRole(e.target.value as AdminUsuario['role'])} options={ROLE_OPTIONS} />
          <Select label="Status" value={formStatus} onChange={e => setFormStatus(e.target.value as AdminUsuario['status'])} options={STATUS_OPTIONS} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={salvando} onClick={handleSalvar}>{editandoId ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminPage;