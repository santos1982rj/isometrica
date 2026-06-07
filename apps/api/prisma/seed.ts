import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@isometrica.com' },
    update: {},
    create: {
      email: 'admin@isometrica.com',
      name: 'Admin Isométrica',
      passwordHash: '$2b$10$Ih/b0UXoMkHsQDsaIiBLAOWboCcIqg3shPkPva4yXZ9qpiiXKiKv.',
      role: 'ADMIN',
    },
  });

  const existentes = await prisma.plan.count();
  if (existentes === 0) {
    await prisma.plan.createMany({
      data: [
        { name: 'Gratuito', description: 'Acesso básico', price: 0, duration: 30, active: true },
        { name: 'Premium', description: 'Acesso completo', price: 29.90, duration: 30, active: true },
      ],
    });
  }

  const subjects = [
    {
      name: 'Resistência dos Materiais',
      description: 'Estudo dos esforços internos, tensões e deformações em corpos sólidos.',
      courses: [
        {
          name: 'Resistência dos Materiais I',
          description: 'Conceitos fundamentais: tração, compressão, cisalhamento, flexão e torção.',
          modules: [
            { name: 'Conceitos Básicos', order: 1, lessons: [
              { title: 'Introdução à Resistência dos Materiais', type: 'video' },
              { title: 'Tipos de Esforços', type: 'video' },
              { title: 'Diagramas de Corpo Livre', type: 'video' },
            ]},
            { name: 'Tensão e Deformação', order: 2, lessons: [
              { title: 'Tensão Normal', type: 'video' },
              { title: 'Deformação Específica', type: 'video' },
              { title: 'Lei de Hooke', type: 'video' },
              { title: 'Coeficiente de Poisson', type: 'video' },
            ]},
            { name: 'Flexão em Vigas', order: 3, lessons: [
              { title: 'Diagramas de Momento Fletor', type: 'video' },
              { title: 'Tensão de Flexão', type: 'video' },
              { title: 'Linha Elástica', type: 'video' },
            ]},
          ],
        },
      ],
    },
    {
      name: 'Cálculo',
      description: 'Fundamentos matemáticos para engenharia.',
      courses: [
        {
          name: 'Cálculo Diferencial e Integral I',
          description: 'Limites, derivadas e integrais de funções reais.',
          modules: [
            { name: 'Limites', order: 1, lessons: [
              { title: 'Noção Intuitiva de Limite', type: 'video' },
              { title: 'Limites Laterais', type: 'video' },
              { title: 'Limites Infinitos', type: 'video' },
            ]},
            { name: 'Derivadas', order: 2, lessons: [
              { title: 'Taxa de Variação', type: 'video' },
              { title: 'Regras de Derivação', type: 'video' },
              { title: 'Derivada da Função Composta', type: 'video' },
              { title: 'Aplicações de Derivadas', type: 'video' },
            ]},
          ],
        },
      ],
    },
    {
      name: 'Física',
      description: 'Princípios físicos aplicados à engenharia.',
      courses: [
        {
          name: 'Física Geral I',
          description: 'Mecânica clássica: cinemática, dinâmica e leis de Newton.',
          modules: [
            { name: 'Cinemática', order: 1, lessons: [
              { title: 'Movimento Retilíneo Uniforme', type: 'video' },
              { title: 'Movimento Uniformemente Variado', type: 'video' },
              { title: 'Movimento Circular', type: 'video' },
            ]},
            { name: 'Dinâmica', order: 2, lessons: [
              { title: 'Leis de Newton', type: 'video' },
              { title: 'Força de Atrito', type: 'video' },
              { title: 'Trabalho e Energia', type: 'video' },
            ]},
          ],
        },
      ],
    },
    {
      name: 'Estruturas',
      description: 'Análise e projeto de estruturas de engenharia civil.',
      courses: [
        {
          name: 'Análise Estrutural I',
          description: 'Métodos de análise de estruturas isostáticas.',
          modules: [
            { name: 'Conceitos Fundamentais', order: 1, lessons: [
              { title: 'Graus de Liberdade', type: 'video' },
              { title: 'Classificação de Estruturas', type: 'video' },
            ]},
            { name: 'Vigas Isostáticas', order: 2, lessons: [
              { title: 'Reações de Apoio', type: 'video' },
              { title: 'Diagramas de Esforços', type: 'video' },
            ]},
            { name: 'Pórticos', order: 3, lessons: [
              { title: 'Pórticos Planos', type: 'video' },
              { title: 'Pórticos Espaciais', type: 'video' },
            ]},
          ],
        },
      ],
    },
  ];

  for (const s of subjects) {
    const subject = await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, description: s.description },
    });

    for (const c of s.courses) {
      const course = await prisma.course.create({
        data: {
          name: c.name,
          description: c.description,
          subjectId: subject.id,
          modules: {
            create: c.modules.map((m) => ({
              name: m.name,
              order: m.order,
              lessons: {
                create: m.lessons.map((l) => ({
                  title: l.title,
                  type: l.type,
                  order: m.lessons.indexOf(l) + 1,
                  content: `<h2>${l.title}</h2><p>Conteúdo da aula <strong>${l.title}</strong> será disponibilizado em breve.</p>`,
                })),
              },
            })),
          },
        },
        include: { modules: { include: { lessons: true } } },
      });

      console.log(`  Curso criado: ${course.name} (${course.modules.length} módulos, ${course.modules.reduce((a, m) => a + m.lessons.length, 0)} aulas)`);
    }
  }

  console.log('\nSeed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
