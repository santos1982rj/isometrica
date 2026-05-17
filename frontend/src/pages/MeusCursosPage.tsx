/**
 * @file MeusCursosPage.tsx
 * @description Página com os cursos em que o usuário está matriculado.
 * Refatorada com Design System: GlassPanel, Badge, Button.
 * 
 * @route /meus-cursos
 * @see useAuth: src/contexts/useAuth.ts
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../components/ui/GlassPanel';
import { Button } from '../components/ui/atoms/Button';
import { Badge } from '../components/ui/atoms/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/useAuth';
import { fetchMeusCursos, type MeuCurso } from '../services/api';
import { BookOpen, CheckCircle, Play } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const MeusCursosPage: React.FC = () => {
  const { token } = useAuth();
  const [cursos, setCursos] = useState<MeuCurso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) return;
    fetchMeusCursos(token)
      .then((data) => setCursos(data.cursos))
      .catch(() => toast.error('Erro ao carregar seus cursos'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (<SkeletonCard key={i} />))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen size={28} className="text-primary-500" />
          Meus Cursos
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Continue de onde parou
        </p>
      </div>

      {cursos.length === 0 ? (
        <GlassPanel className="p-8! text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nenhum curso iniciado
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Explore nosso catálogo e matricule-se em um curso.
          </p>
          <Link to="/cursos" className="inline-block mt-4">
            <Button variant="primary">Ver catálogo</Button>
          </Link>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso, index) => (
            <motion.div
              key={curso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link to={`/cursos/${curso.slug}`}>
                <GlassPanel className="p-0! overflow-hidden h-full" glow>
                  {/* Imagem de capa */}
                  <div className="h-32 bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center relative overflow-hidden">
                    {curso.imagem ? (
                      <img src={curso.imagem} alt={curso.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={40} className="text-white/40" />
                    )}
                    {curso.concluido && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle size={24} className="text-green-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white">{curso.titulo}</h3>

                    {/* Barra de progresso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(curso.progresso)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${curso.progresso}%` }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} /> {curso.totalAulas} aulas
                      </span>
                      <Badge variant={curso.status === 'ATIVO' ? 'success' : 'warning'} size="sm">
                        {curso.status}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-primary-500 font-medium flex items-center gap-1">
                        <Play size={14} />
                        {curso.concluido ? 'Revisar' : 'Continuar'}
                      </span>
                    </div>
                  </div>
                </GlassPanel>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MeusCursosPage;