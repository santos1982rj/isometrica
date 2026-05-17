/**
 * @file AulaPage.tsx
 * @description Player de aula completo refatorado com Design System.
 * 
 * Mantém sidebar, navegação, player de vídeo e conclusão de aula,
 * agora usando Button, GlassPanel e classes Tailwind v4.
 * 
 * @route /cursos/:cursoSlug/aulas/:aulaSlug
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';
import { fetchAula, concluirAula, type AulaDetalhe, type CursoNav } from '../services/api';
import { SkeletonCard } from '../components/ui/Skeleton';
import CustomVideoPlayer from '../components/ui/CustomVideoPlayer';
import TutorChat from '../components/ui/TutorChat';
import { Button } from '../components/ui/atoms/Button';
import AnexosAula from '../components/ui/AnexosAula';

import {
  Play, Lock, CheckCircle, ChevronDown, ChevronRight,
  ArrowLeft, ArrowRight, BookOpen, Clock, Menu, X
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────── */
function getAulasConcluidas(cursoId: number): number[] {
  try {
    const data = localStorage.getItem(`@concluidas-${cursoId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}
function salvarAulasConcluidas(cursoId: number, ids: number[]): void {
  localStorage.setItem(`@concluidas-${cursoId}`, JSON.stringify(ids));
}

const AulaPage: React.FC = () => {
  const { aulaSlug } = useParams<{ cursoSlug: string; aulaSlug: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [aula, setAula] = useState<AulaDetalhe | null>(null);
  const [curso, setCurso] = useState<CursoNav | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modulosAbertos, setModulosAbertos] = useState<number[]>([]);
  const [sidebarAberta, setSidebarAberta] = useState<boolean>(true);
  const [concluindo, setConcluindo] = useState<boolean>(false);
  const [aulaConcluida, setAulaConcluida] = useState<boolean>(false);
  const [aulasConcluidasIds, setAulasConcluidasIds] = useState<number[]>([]);

  useEffect(() => {
    if (!aulaSlug) return;
    let cancelado = false;
    async function carregarAula(): Promise<void> {
      setLoading(true);
      try {
        const data = await fetchAula(aulaSlug as string, token);
        if (cancelado) return;
        setAula(data.aula);
        setCurso(data.curso);
        setAulaConcluida(data.progresso?.concluida || false);
        const concluidas = getAulasConcluidas(data.curso.id);
        setAulasConcluidasIds(concluidas);
        if (data.progresso?.concluida && !concluidas.includes(data.aula.id)) {
          const novas = [...concluidas, data.aula.id];
          setAulasConcluidasIds(novas);
          salvarAulasConcluidas(data.curso.id, novas);
        }
        const moduloAtual = data.curso.modulos.find(m =>
          m.aulas.some(a => a.slug === aulaSlug || a.id.toString() === aulaSlug)
        );
        if (moduloAtual) setModulosAbertos(prev => prev.includes(moduloAtual.id) ? prev : [...prev, moduloAtual.id]);
      } catch { if (!cancelado) toast.error('Aula não encontrada'); }
      finally { if (!cancelado) setLoading(false); }
    }
    carregarAula();
    return () => { cancelado = true; };
  }, [aulaSlug, token]);

  function toggleModulo(id: number) { setModulosAbertos(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]); }

  async function handleConcluir(): Promise<void> {
    if (!aula || !token || !curso) return;
    setConcluindo(true);
    try {
      await concluirAula(aula.id, token);
      setAulaConcluida(true);
      const novas = [...new Set([...aulasConcluidasIds, aula.id])];
      setAulasConcluidasIds(novas);
      salvarAulasConcluidas(curso.id, novas);
      toast.success('Aula concluída! +10 XP');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao concluir aula.');
    } finally { setConcluindo(false); }
  }

  function navegar(direcao: 'anterior' | 'proximo'): void {
    if (!curso || !aula) return;
    const todas = curso.modulos.flatMap(m => m.aulas);
    const idx = todas.findIndex(a => a.slug === aula.slug || a.id === aula.id);
    const novo = direcao === 'anterior' ? idx - 1 : idx + 1;
    if (novo >= 0 && novo < todas.length) {
      const a = todas[novo];
      navigate(`/cursos/${curso.slug}/aulas/${a.slug || a.id}`);
    }
  }

  if (!aulaSlug) return <div className="flex items-center justify-center h-[80vh]"><BookOpen size={48} className="text-gray-300 dark:text-gray-600" /></div>;
  if (loading) return <div className="flex items-center justify-center h-[80vh]"><SkeletonCard /></div>;
  if (!aula || !curso) return null;

  const todas = curso.modulos.flatMap(m => m.aulas);
  const idx = todas.findIndex(a => a.slug === aula.slug || a.id === aula.id);
  const temAnterior = idx > 0;
  const temProximo = idx < todas.length - 1;

  return (
    <div className="flex h-[calc(100vh-73px)] -m-6 lg:-m-8">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarAberta && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link to={`/cursos/${curso.slug}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 flex items-center gap-1 mb-2">
                  <ArrowLeft size={14} /> Voltar ao curso
                </Link>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{curso.titulo}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {curso.modulos.map(mod => {
                  const aberto = modulosAbertos.includes(mod.id);
                  const concluidas = mod.aulas.filter(a => aulasConcluidasIds.includes(a.id)).length;
                  return (
                    <div key={mod.id} className="mb-1">
                      <button onClick={() => toggleModulo(mod.id)} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left">
                        {aberto ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{mod.titulo}</span>
                        {concluidas > 0 && <span className="text-xs text-green-500 font-medium">{concluidas}/{mod.aulas.length}</span>}
                      </button>
                      <AnimatePresence>
                        {aberto && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            {mod.aulas.map(a => {
                              const ativa = a.slug === aula.slug || a.id === aula.id;
                              const concl = aulasConcluidasIds.includes(a.id);
                              return (
                                <Link key={a.id} to={`/cursos/${curso.slug}/aulas/${a.slug || a.id}`}
                                  className={`flex items-center gap-2 pl-10 pr-3 py-2 text-sm rounded-lg transition-all
                                    ${ativa ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                  {concl ? <CheckCircle size={14} className="text-green-500 shrink-0" /> : a.gratuito ? <Play size={14} className="shrink-0" /> : <Lock size={14} className="shrink-0" />}
                                  <span className="truncate flex-1">{a.titulo}</span>
                                  {a.duracao && <span className="text-xs text-gray-400 shrink-0">{a.duracao}min</span>}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button onClick={() => setSidebarAberta(!sidebarAberta)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
            {sidebarAberta ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{aula.titulo}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => navegar('anterior')} disabled={!temAnterior} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"><ArrowLeft size={18} /></button>
            <button onClick={() => navegar('proximo')} disabled={!temProximo} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"><ArrowRight size={18} /></button>
            {!aula.bloqueada && (
              <Button
                variant={aulaConcluida ? 'secondary' : 'primary'}
                size="sm"
                loading={concluindo}
                icon={aulaConcluida ? CheckCircle : undefined}
                onClick={handleConcluir}
                disabled={aulaConcluida || concluindo}
              >
                {aulaConcluida ? 'Concluída' : 'Marcar como concluída'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {aula.bloqueada ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Lock size={48} className="text-gray-300 dark:text-gray-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aula Bloqueada</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Matricule-se para acessar este conteúdo.</p>
              <Link to={`/cursos/${curso.slug}`}><Button variant="primary">Ver detalhes do curso</Button></Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-8">
              {aula.videoUrl && (
                <div className="mb-8">
                  {(aula.videoUrl.includes('youtube.com') || aula.videoUrl.includes('youtu.be')) ? (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      <iframe width="100%" height="100%" src={aula.videoUrl.replace('watch?v=', 'embed/')} title={aula.titulo} allowFullScreen className="w-full h-full" />
                    </div>
                  ) : (
                    <CustomVideoPlayer src={aula.videoUrl} onEnded={() => { if (!aulaConcluida) handleConcluir(); }} />
                  )}
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{aula.titulo}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                {aula.duracao && <span className="flex items-center gap-1"><Clock size={14} /> {aula.duracao} min</span>}
                <span className="flex items-center gap-1"><BookOpen size={14} /> Aula {aula.ordem}</span>
              </div>
              {aula.conteudo ? (
                <div className="conteudo-aula" dangerouslySetInnerHTML={{ __html: aula.conteudo }} />
              ) : (
                <div className="text-center py-16 text-gray-400">Conteúdo em breve...</div>
              )}

                {/* ⬇️ ADICIONE ESTE BLOCO AQUI ⬇️ */}
                {!aula.bloqueada && (
                  <AnexosAula aulaId={aula.id} />
                )}

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => navegar('anterior')} disabled={!temAnterior} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg disabled:opacity-30"><ArrowLeft size={16} /> Anterior</button>
                <span className="text-xs text-gray-400">{idx + 1} de {todas.length}</span>
                <button onClick={() => navegar('proximo')} disabled={!temProximo} className="flex items-center gap-2 text-sm bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-lg disabled:opacity-30">Próximo <ArrowRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TutorChat contextoAula={`Aula: ${aula.titulo}. Curso: ${curso.titulo}. Conteúdo: ${aula.conteudo?.substring(0, 500) || 'N/A'}`} />
    </div>
  );
};

export default AulaPage;