/**
 * @file AdminCursosPage.tsx
 * @description Painel administrativo: listagem de cursos refatorada com Design System.
 * 
 * Utiliza DataTable, Badge e Button do Design System.
 * 
 * @route /admin/cursos
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/useAuth';
import { fetchCursos, deletarCurso, type CursoCard } from '../../services/api';
import { DataTable } from '../../components/ui/organisms/DataTable';
import { Badge } from '../../components/ui/atoms/Badge';
import { Button } from '../../components/ui/atoms/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Plus, Edit3, Trash2, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const NIVEL_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' }> = {
  INICIANTE: { label: 'Iniciante', variant: 'success' },
  INTERMEDIARIO: { label: 'Intermediário', variant: 'info' },
  AVANCADO: { label: 'Avançado', variant: 'warning' },
};

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

const AdminCursosPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<CursoCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchCursos()
      .then((data: { cursos: CursoCard[] }) => setCursos(data.cursos))
      .catch(() => toast.error('Erro ao carregar cursos'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleDelete(id: number): Promise<void> {
    if (!token) return;
    try {
      await deletarCurso(id, token);
      setCursos((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Curso excluído!');
    } catch {
      toast.error('Erro ao excluir curso.');
    }
  }

  if (loading) return <SkeletonTable rows={5} />;

  const columns = [
    {
      key: 'titulo' as keyof CursoCard,
      label: 'Curso',
      render: (curso: CursoCard) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{curso.titulo}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {curso.modulos.reduce((acc: number, mod) => acc + mod.aulas.length, 0)} aulas
          </p>
        </div>
      ),
    },
    {
      key: 'nivel' as keyof CursoCard,
      label: 'Nível',
      responsive: 'md' as const,
      render: (curso: CursoCard) => {
        const nivelInfo = NIVEL_MAP[curso.nivel] || NIVEL_MAP.INICIANTE;
        return <Badge variant={nivelInfo.variant} size="sm">{nivelInfo.label}</Badge>;
      },
    },
    {
      key: 'preco' as keyof CursoCard,
      label: 'Preço',
      responsive: 'md' as const,
      render: (curso: CursoCard) => (
        <span className={curso.preco ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-green-600 dark:text-green-400 font-medium'}>
          {curso.preco ? `R$ ${curso.preco.toFixed(2)}` : 'Gratuito'}
        </span>
      ),
    },
    {
      key: '_count' as keyof CursoCard,
      label: 'Alunos',
      responsive: 'lg' as const,
      render: (curso: CursoCard) => (
        <span className="text-gray-500 dark:text-gray-400">{curso._count?.matriculas || 0}</span>
      ),
    },
    {
      key: 'id' as keyof CursoCard,
      label: 'Ações',
      align: 'right' as const,
      render: (curso: CursoCard) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/cursos/${curso.slug}`} target="_blank" className="p-2 rounded-lg text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Ver curso">
            <ExternalLink size={16} />
          </Link>
          <Link to={`/admin/cursos/${curso.slug}/aulas`} className="p-2 rounded-lg text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Gerenciar aulas">
            <BookOpen size={16} />
          </Link>
          <button onClick={() => navigate(`/admin/cursos/${curso.id}/editar`)} className="p-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Editar curso">
            <Edit3 size={16} />
          </button>
          <button onClick={() => setDeleteConfirm(deleteConfirm === curso.id ? null : curso.id)} className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Excluir curso">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={28} className="text-primary-500" />
            Gerenciar Cursos
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} cadastrado{cursos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/cursos/novo')}>
          Novo Curso
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={cursos}
        emptyMessage="Nenhum curso cadastrado. Clique em 'Novo Curso' para começar."
      />

      {/* Modal de confirmação de exclusão */}
      {deleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Confirmar exclusão</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Sim, excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminCursosPage;