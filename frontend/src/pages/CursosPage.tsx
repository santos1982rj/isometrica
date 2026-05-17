/**
 * @file CursosPage.tsx
 * @description Catálogo de cursos disponíveis na plataforma.
 * Refatorada com Design System: GlassPanel, Badge.
 * 
 * @route /cursos
 * @see api.ts: src/services/api.ts
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../components/ui/GlassPanel';
import { Badge } from '../components/ui/atoms/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { fetchCursos, type CursoCard } from '../services/api';
import {
  BookOpen,
  Clock,
  Users,
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

const CursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<CursoCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCursos()
      .then((data) => setCursos(data.cursos))
      .catch(() => toast.error('Erro ao carregar cursos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen size={28} className="text-primary-500" />
          Cursos
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Explore nossa biblioteca de cursos de engenharia estrutural
        </p>
      </div>

      {cursos.length === 0 ? (
        <GlassPanel className="p-8! text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nenhum curso disponível
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Novos cursos serão adicionados em breve.
          </p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso, index) => {
            const totalAulas = curso.modulos.reduce((acc, mod) => acc + mod.aulas.length, 0);
            const nivelInfo = NIVEL_MAP[curso.nivel] || NIVEL_MAP.INICIANTE;

            return (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link to={`/cursos/${curso.slug}`} className="block group">
                  <GlassPanel className="p-0! overflow-hidden h-full" glow>
                    {/* Imagem de capa */}
                    <div className="h-40 bg-linear-to-br from-primary-400 via-primary-500 to-secondary-500 flex items-center justify-center relative overflow-hidden">
                      {curso.imagem ? (
                        <img
                          src={curso.imagem}
                          alt={curso.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen size={48} className="text-white/60" />
                      )}

                      {/* Badge de preço */}
                      <div className="absolute top-3 right-3">
                        <Badge variant={curso.preco && curso.preco > 0 ? 'warning' : 'success'}>
                          {curso.preco && curso.preco > 0
                            ? `R$ ${curso.preco.toFixed(2)}`
                            : 'GRATUITO'
                          }
                        </Badge>
                      </div>

                      {/* Badge de nível */}
                      <div className="absolute bottom-3 left-3">
                        <Badge variant={nivelInfo.variant} size="sm">
                          {nivelInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2">
                        {curso.titulo}
                      </h3>

                      {curso.resumo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {curso.resumo}
                        </p>
                      )}

                      {/* Metadados */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <BookOpen size={14} />
                          <span>{totalAulas} aulas</span>
                        </div>

                        {curso.cargaHoraria && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>{curso.cargaHoraria}h</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          <Users size={14} />
                          <span>{curso._count.matriculas}</span>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CursosPage;