/**
 * @file LandingPage.tsx
 * @description Página inicial pública refatorada com Design System e Tailwind v4.
 * 
 * Utiliza os componentes Button e Badge do Design System.
 * 
 * @route /
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/atoms/Button';
import { Badge } from '../../components/ui/atoms/Badge';
import {
  BookOpen,
  Calculator,
  Award,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

const RECURSOS = [
  {
    icon: Calculator,
    titulo: 'Cálculo Estrutural',
    descricao: 'Ferramentas completas para dimensionamento de vigas, pilares e lajes conforme a NBR 6118:2023.',
    cor: 'bg-blue-500',
  },
  {
    icon: BookOpen,
    titulo: 'Cursos Didáticos',
    descricao: 'Aulas em vídeo com teoria e prática, exercícios resolvidos passo a passo e material de apoio.',
    cor: 'bg-green-500',
  },
  {
    icon: Award,
    titulo: 'Gamificação do Estudo',
    descricao: 'Ganhe XP, suba de nível e conquiste badges enquanto avança nos estudos de engenharia.',
    cor: 'bg-amber-500',
  },
  {
    icon: TrendingUp,
    titulo: 'Acompanhe seu Progresso',
    descricao: 'Visualize horas de estudo, aulas concluídas e compare seu desempenho com colegas no ranking.',
    cor: 'bg-purple-500',
  },
  {
    icon: Shield,
    titulo: 'Conteúdo Atualizado',
    descricao: 'Todo material segue a NBR 6118:2023, garantindo que você estude com a norma mais recente.',
    cor: 'bg-red-500',
  },
  {
    icon: Users,
    titulo: 'Comunidade de Alunos',
    descricao: 'Tire dúvidas, troque experiências e estude junto com outros futuros engenheiros civis.',
    cor: 'bg-indigo-500',
  },
];

const PLANOS = [
  {
    nome: 'Plano Gratuito',
    preco: 'R$ 0',
    descricao: 'Para começar a estudar',
    recursos: [
      'Acesso a cursos gratuitos',
      'Calculadoras básicas',
      'Ranking e gamificação',
      'Comunidade de alunos',
    ],
    destaque: false,
  },
  {
    nome: 'Plano Premium',
    preco: 'R$ 29,90',
    descricao: 'Acesso completo',
    recursos: [
      'Todos os cursos (incluindo avançados)',
      'Calculadoras completas',
      'Certificados de conclusão',
      'Material didático para download',
      'Suporte prioritário',
    ],
    destaque: true,
  },
];

/* ═══════════════════════════════════════════════════════════════
   Subcomponentes
   ═══════════════════════════════════════════════════════════════ */

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className="text-lg font-bold bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Nó na Armadura
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors"
            >
              Entrar
            </Link>
            <Link to="/registro">
              <Button variant="primary" size="sm">
                Criar conta gratuita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="primary" size="md" className="mb-6">
            Plataforma educacional para engenharia civil
          </Badge>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Aprenda{' '}
            <span className="bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Concreto Armado
            </span>{' '}
            na prática
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Estude com cursos completos, exercícios resolvidos e ferramentas de cálculo 
            estrutural. Tudo alinhado à NBR 6118:2023 e 100% gratuito para começar.
          </p>

          <Link to="/registro">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Começar a estudar agora
            </Button>
          </Link>

          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            {[
              { valor: '3+', label: 'Cursos disponíveis' },
              { valor: '12+', label: 'Aulas completas' },
              { valor: '100%', label: 'Gratuito para começar' },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{m.valor}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RecursosSection() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Por que estudar aqui?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Recursos pensados para facilitar sua jornada de aprendizado em engenharia civil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECURSOS.map((recurso, index) => {
            const Icon = recurso.icon;
            return (
              <motion.div
                key={recurso.titulo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${recurso.cor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {recurso.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {recurso.descricao}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlanosSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Planos de estudo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha como quer aprender
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-2xl p-8 border-2 relative ${
                plano.destaque
                  ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-xl shadow-primary-500/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-2">
                {plano.nome}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{plano.descricao}</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {plano.preco}
                <span className="text-lg font-normal text-gray-500">/mês</span>
              </p>
              <ul className="space-y-3 mb-8">
                {plano.recursos.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              <Link to="/registro">
                <Button
                  variant={plano.destaque ? 'primary' : 'secondary'}
                  className="w-full text-center"
                >
                  Começar
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Nó na Armadura
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 Nó na Armadura. Plataforma educacional gratuita para engenharia.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/cursos" className="text-gray-500 hover:text-primary-500 transition-colors">
              Cursos
            </Link>
            <Link to="/login" className="text-gray-500 hover:text-primary-500 transition-colors">
              Entrar
            </Link>
            <Link to="/registro" className="text-gray-500 hover:text-primary-500 transition-colors">
              Criar conta
            </Link>
            <Link to="/contato" className="text-gray-500 hover:text-primary-500 transition-colors">
  Contato
</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Componente Principal
   ═══════════════════════════════════════════════════════════════ */

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <HeroSection />
      <RecursosSection />
      <PlanosSection />
      <Footer />
    </div>
  );
};

export default LandingPage;