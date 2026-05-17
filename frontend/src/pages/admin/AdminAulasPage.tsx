/**
 * @file AdminAulasPage.tsx
 * @description Interface para gerenciar módulos e aulas de um curso.
 * Refatorada com Design System (Input, Button, Modal, Badge, RichTextEditor).
 * 
 * @route /admin/cursos/:cursoId/aulas
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../../components/ui/GlassPanel';
import { Button } from '../../components/ui/atoms/Button';
import { Input } from '../../components/ui/atoms/Input';
import { Modal } from '../../components/ui/molecules/Modal';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { useAuth } from '../../contexts/useAuth';
import {
  fetchCursoPorSlug,
  criarModulo,
  atualizarModulo,
  deletarModulo,
  criarAula,
  atualizarAula,
  deletarAula,
  type CursoDetalhe,
} from '../../services/api';
import {
  Plus,
  Save,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const AdminAulasPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const { token } = useAuth();

  const [curso, setCurso] = useState<CursoDetalhe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modulosAbertos, setModulosAbertos] = useState<number[]>([]);

  // Módulo
  const [showModuloForm, setShowModuloForm] = useState<boolean>(false);
  const [editandoModulo, setEditandoModulo] = useState<number | null>(null);
  const [moduloTitulo, setModuloTitulo] = useState<string>('');
  const [moduloDescricao, setModuloDescricao] = useState<string>('');

  // Aula
  const [showAulaForm, setShowAulaForm] = useState<number | null>(null);
  const [editandoAula, setEditandoAula] = useState<number | null>(null);
  const [aulaTitulo, setAulaTitulo] = useState<string>('');
  const [aulaVideoUrl, setAulaVideoUrl] = useState<string>('');
  const [aulaDuracao, setAulaDuracao] = useState<string>('');
  const [aulaGratuito, setAulaGratuito] = useState<boolean>(false);
  const [aulaConteudo, setAulaConteudo] = useState<string>('');

  useEffect(() => {
    const id = cursoId;
    if (!id || !token) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    carregarCurso(id);
  }, [cursoId, token]);

  async function carregarCurso(id: string): Promise<void> {
    try {
      const data = await fetchCursoPorSlug(id);
      setCurso(data.curso);
      if (data.curso.modulos.length > 0) {
        setModulosAbertos([data.curso.modulos[0].id]);
      }
    } catch {
      toast.error('Curso não encontrado');
    } finally {
      setLoading(false);
    }
  }

  /* ─── Handlers de Módulo ───────────────────────────────── */

  function abrirFormModulo(modulo?: CursoDetalhe['modulos'][0]): void {
    if (modulo) {
      setEditandoModulo(modulo.id);
      setModuloTitulo(modulo.titulo);
      setModuloDescricao(modulo.descricao || '');
    } else {
      setEditandoModulo(null);
      setModuloTitulo('');
      setModuloDescricao('');
    }
    setShowModuloForm(true);
  }

  async function handleSaveModulo(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!token || !curso) return;

    try {
      if (editandoModulo) {
        await atualizarModulo(curso.id, editandoModulo, {
          titulo: moduloTitulo.trim(),
          descricao: moduloDescricao.trim() || undefined,
        }, token);
        toast.success('Módulo atualizado!');
      } else {
        await criarModulo(curso.id, {
          titulo: moduloTitulo.trim(),
          descricao: moduloDescricao.trim() || undefined,
        }, token);
        toast.success('Módulo criado!');
      }
      setShowModuloForm(false);
      carregarCurso(String(curso.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar módulo.');
    }
  }

  async function handleDeleteModulo(moduloId: number): Promise<void> {
    if (!token || !curso) return;
    if (!confirm('Excluir este módulo e todas as suas aulas?')) return;

    try {
      await deletarModulo(curso.id, moduloId, token);
      toast.success('Módulo excluído!');
      carregarCurso(String(curso.id));
    } catch {
      toast.error('Erro ao excluir módulo.');
    }
  }

  /* ─── Handlers de Aula ─────────────────────────────────── */

  function abrirFormAula(moduloId: number, aula?: CursoDetalhe['modulos'][0]['aulas'][0]): void {
    if (aula) {
      setEditandoAula(aula.id);
      setAulaTitulo(aula.titulo);
      setAulaDuracao(aula.duracao?.toString() || '');
      setAulaGratuito(aula.gratuito || false);
      setAulaVideoUrl(aula.videoUrl || '');
      setAulaConteudo(aula.conteudo || '');
    } else {
      setEditandoAula(null);
      setAulaTitulo('');
      setAulaVideoUrl('');
      setAulaDuracao('');
      setAulaGratuito(false);
      setAulaConteudo('');
    }
    setShowAulaForm(moduloId);
  }

  async function handleSaveAula(e: FormEvent, moduloId: number): Promise<void> {
    e.preventDefault();
    if (!token || !curso) return;

    try {
      const dados = {
        titulo: aulaTitulo.trim(),
        videoUrl: aulaVideoUrl.trim() || undefined,
        duracao: aulaDuracao ? Number(aulaDuracao) : undefined,
        gratuito: aulaGratuito,
        conteudo: aulaConteudo.trim() || undefined,
      };

      if (editandoAula) {
        await atualizarAula(curso.id, moduloId, editandoAula, dados, token);
        toast.success('Aula atualizada!');
      } else {
        await criarAula(curso.id, moduloId, dados, token);
        toast.success('Aula criada!');
      }
      setShowAulaForm(null);
      carregarCurso(String(curso.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar aula.');
    }
  }

  async function handleDeleteAula(moduloId: number, aulaId: number): Promise<void> {
    if (!token || !curso) return;
    if (!confirm('Excluir esta aula?')) return;

    try {
      await deletarAula(curso.id, moduloId, aulaId, token);
      toast.success('Aula excluída!');
      carregarCurso(String(curso.id));
    } catch {
      toast.error('Erro ao excluir aula.');
    }
  }

  /* ─── Render ──────────────────────────────────────────── */

  if (loading) return <div className="max-w-5xl mx-auto"><GlassPanel className="p-8!">Carregando...</GlassPanel></div>;
  if (!curso) return (
    <div className="text-center py-20">
      <BookOpen size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curso não encontrado</h1>
      <Link to="/admin/cursos" className="inline-block mt-4 text-primary-500">Voltar para cursos</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/admin/cursos" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Voltar para cursos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{curso.titulo}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie módulos e aulas deste curso</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => abrirFormModulo()}>
          Novo Módulo
        </Button>
      </div>

      {/* Lista de Módulos e Aulas */}
      {curso.modulos.length === 0 ? (
        <GlassPanel className="p-8! text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nenhum módulo criado</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Crie o primeiro módulo para adicionar aulas.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {curso.modulos.map((modulo) => {
            const isOpen = modulosAbertos.includes(modulo.id);
            return (
              <GlassPanel key={modulo.id} className="p-4!" glow>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setModulosAbertos(prev => prev.includes(modulo.id) ? prev.filter(m => m !== modulo.id) : [...prev, modulo.id])}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-primary-500"
                  >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs font-bold">Módulo {modulo.ordem}</span>
                    {modulo.titulo}
                    <span className="text-xs text-gray-400 font-normal ml-2">({modulo.aulas.length} aula{modulo.aulas.length !== 1 ? 's' : ''})</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirFormModulo(modulo)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-500" title="Editar módulo"><Edit3 size={14} /></button>
                    <button onClick={() => handleDeleteModulo(modulo.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500" title="Excluir módulo"><Trash2 size={14} /></button>
                  </div>
                </div>

                {modulo.descricao && isOpen && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-10">{modulo.descricao}</p>
                )}

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                        {modulo.aulas.map((aula) => (
                          <div key={aula.id} className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg group transition-colors">
                            {aula.gratuito ? <Play size={14} className="text-green-500 shrink-0" /> : <Lock size={14} className="text-gray-400 shrink-0" />}
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{aula.titulo}</span>
                            {aula.duracao && <span className="text-xs text-gray-400 shrink-0">{aula.duracao}min</span>}
                            <span className="text-xs text-gray-400 shrink-0">Aula {aula.ordem}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => abrirFormAula(modulo.id, aula)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Editar aula"><Edit3 size={12} /></button>
                              <button onClick={() => handleDeleteAula(modulo.id, aula.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500" title="Excluir aula"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => abrirFormAula(modulo.id)} className="flex items-center gap-2 py-2 px-3 text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg w-full transition-colors">
                          <Plus size={14} /> Adicionar aula
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Formulário de Aula (inline) */}
                <AnimatePresence>
                  {showAulaForm === modulo.id && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={(e) => handleSaveAula(e, modulo.id)} className="mt-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{editandoAula ? 'Editar Aula' : 'Nova Aula'}</h3>

                      <Input
                        label="Título da aula"
                        value={aulaTitulo}
                        onChange={(e) => setAulaTitulo(e.target.value)}
                        placeholder="Título da aula *"
                        required
                        autoFocus
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="URL do vídeo"
                          value={aulaVideoUrl}
                          onChange={(e) => setAulaVideoUrl(e.target.value)}
                          placeholder="YouTube ou .mp4"
                        />
                        <Input
                          label="Duração (minutos)"
                          type="number"
                          value={aulaDuracao}
                          onChange={(e) => setAulaDuracao(e.target.value)}
                          placeholder="Ex: 15"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={aulaGratuito} onChange={(e) => setAulaGratuito(e.target.checked)} className="w-4 h-4 rounded" />
                        Aula gratuita (demo)
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conteúdo da aula</label>
                        <RichTextEditor value={aulaConteudo} onChange={setAulaConteudo} placeholder="Escreva o conteúdo da aula aqui..." />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" variant="primary" icon={Save}>
                          {editandoAula ? 'Atualizar Aula' : 'Criar Aula'}
                        </Button>
                        <Button type="button" variant="ghost" icon={X} onClick={() => setShowAulaForm(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Modal de Módulo */}
      <Modal
        isOpen={showModuloForm}
        onClose={() => setShowModuloForm(false)}
        title={editandoModulo ? 'Editar Módulo' : 'Novo Módulo'}
        size="md"
      >
        <form onSubmit={handleSaveModulo} className="space-y-4">
          <Input
            label="Título"
            value={moduloTitulo}
            onChange={(e) => setModuloTitulo(e.target.value)}
            placeholder="Ex: Introdução ao Concreto Armado"
            required
          />
          <Input
            label="Descrição (opcional)"
            value={moduloDescricao}
            onChange={(e) => setModuloDescricao(e.target.value)}
            placeholder="Breve descrição do módulo"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModuloForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" icon={Save}>
              {editandoModulo ? 'Atualizar Módulo' : 'Criar Módulo'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default AdminAulasPage;