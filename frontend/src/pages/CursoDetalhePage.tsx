/**
 * @file CursoDetalhePage.tsx
 * @description Página de detalhes de um curso com opção de matrícula.
 * Refatorada com Design System: Button, Badge, GlassPanel.
 * 
 * @route /cursos/:slug
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Badge } from '../components/ui/atoms/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/useAuth';
import {
  fetchCursoPorSlug,
  matricular,
  fetchMeusCursos,
  type CursoDetalhe,
} from '../services/api';
import {
  BookOpen,
  Clock,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  Unlock,
  ArrowLeft,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const NIVEL_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' }> = {
  INICIANTE: { label: 'Iniciante', variant: 'success' },
  INTERMEDIARIO: { label: 'Intermediário', variant: 'info' },
  AVANCADO: { label: 'Avançado', variant: 'warning' },
};

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const CursoDetalhePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { usuario, token } = useAuth();

  const [curso, setCurso] = useState<CursoDetalhe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [matriculando, setMatriculando] = useState<boolean>(false);
  const [matriculado, setMatriculado] = useState<boolean>(false);
  const [moduloAberto, setModuloAberto] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function carregarDados(): Promise<void> {
      try {
        const data = await fetchCursoPorSlug(slug as string);
        setCurso(data.curso);

        if (data.curso.modulos.length > 0) {
          setModuloAberto(data.curso.modulos[0].id);
        }

        if (token) {
            try {
              const meusCursos = await fetchMeusCursos(token);
              setMatriculado(meusCursos.cursos.some((c) => c.slug === slug));
            } catch {
              // Ignora silenciosamente (usuário pode não estar matriculado)
            }
          }
      } catch {
        toast.error('Curso não encontrado');
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [slug, token]);

  async function handleMatricula(): Promise<void> {
    if (!usuario) {
      toast.error('Faça login para se matricular.');
      navigate('/login');
      return;
    }
    if (!token || !curso) return;
    setMatriculando(true);
    try {
      const resposta = await matricular(curso.id, token);
      if (resposta.requerPagamento) {
        toast.info('Pagamento necessário');
      } else {
        toast.success('Matrícula realizada!');
        setMatriculado(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao matricular');
    } finally {
      setMatriculando(false);
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );

  if (!curso) {
    return (
      <div className="text-center py-20">
        <BookOpen size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curso não encontrado</h1>
        <Link to="/cursos" className="inline-block mt-4 text-primary-500">Ver todos os cursos</Link>
      </div>
    );
  }

  const nivelInfo = NIVEL_MAP[curso.nivel] || NIVEL_MAP.INICIANTE;
  const totalAulas = curso.modulos.reduce((acc, mod) => acc + mod.aulas.length, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500">
        <ArrowLeft size={16} /> Voltar para cursos
      </Link>

      {/* Banner */}
      <GlassPanel className="p-0! overflow-hidden" glow>
        <div className="h-48 bg-linear-to-br from-primary-400 via-primary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
          {curso.imagem ? (
            <img src={curso.imagem} alt={curso.titulo} className="w-full h-full object-cover" />
          ) : (
            <BookOpen size={64} className="text-white/40" />
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={curso.preco && curso.preco > 0 ? 'warning' : 'success'}>
              {curso.preco && curso.preco > 0 ? `R$ ${curso.preco.toFixed(2)}` : 'GRATUITO'}
            </Badge>
            <Badge variant={nivelInfo.variant}>{nivelInfo.label}</Badge>
            {matriculado && <Badge variant="primary">Matriculado</Badge>}
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{curso.titulo}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><BookOpen size={16} /> {totalAulas} aulas</span>
            {curso.cargaHoraria && <span className="flex items-center gap-1"><Clock size={16} /> {curso.cargaHoraria}h</span>}
            <span className="flex items-center gap-1"><Users size={16} /> {curso._count.matriculas} alunos</span>
            {curso.categoria && <span className="flex items-center gap-1"><BarChart3 size={16} /> {curso.categoria}</span>}
          </div>

          <div className="mt-6">
            {matriculado ? (
              <Button
                variant="primary"
                icon={Play}
                onClick={() => {
                  const primeiraAula = curso.modulos[0]?.aulas[0];
                  if (primeiraAula) navigate(`/cursos/${curso.slug}/aulas/${primeiraAula.slug || primeiraAula.id}`);
                }}
              >
                Acessar curso
              </Button>
            ) : (
              <Button variant="primary" loading={matriculando} onClick={handleMatricula}>
                {matriculando ? 'Matriculando...' : curso.preco && curso.preco > 0 ? `Comprar por R$ ${curso.preco.toFixed(2)}` : 'Matricular-se gratuitamente'}
              </Button>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Descrição */}
      <GlassPanel className="p-8!" glow>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sobre este curso</h2>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: curso.descricao }} />
      </GlassPanel>

      {/* Conteúdo Programático */}
      <GlassPanel className="p-8!" glow>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Conteúdo Programático</h2>
        <div className="space-y-2">
          {curso.modulos.map((modulo) => {
            const isOpen = moduloAberto === modulo.id;
            return (
              <div key={modulo.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setModuloAberto(isOpen ? null : modulo.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">{modulo.ordem}</div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{modulo.titulo}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{modulo.aulas.length} aula{modulo.aulas.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                </button>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-gray-200 dark:border-gray-700">
                    {modulo.aulas.map((aula) => (
                      matriculado || aula.gratuito ? (
                        <Link key={aula.id} to={`/cursos/${curso.slug}/aulas/${aula.slug || aula.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                          <Play size={14} className="text-gray-400 group-hover:text-primary-500 shrink-0" />
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-500">{aula.titulo}</span>
                          <span className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                            {aula.gratuito && (
                              <span className="text-green-500 flex items-center gap-1">
                                <Unlock size={12} /> Grátis
                              </span>
                            )}
                            {aula.duracao && `${aula.duracao}min`}
                          </span>
                        </Link>
                      ) : (
                        <div key={aula.id} className="flex items-center gap-3 px-6 py-3 text-gray-400 dark:text-gray-500">
                          <Lock size={14} className="shrink-0" />
                          <span className="flex-1 text-sm">{aula.titulo}</span>
                          <span className="text-xs shrink-0">{aula.duracao && `${aula.duracao}min`}</span>
                        </div>
                      )
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export default CursoDetalhePage;