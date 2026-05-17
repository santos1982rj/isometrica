/**
 * @file seed.ts
 * @description Script para popular o banco de dados com cursos, módulos e aulas reais.
 * 
 * Executar com: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url:  'file:./prisma/dev.db'
});

const prisma = new PrismaClient({ adapter });

/* ═══════════════════════════════════════════════════════════════
   DADOS DOS CURSOS
   ═══════════════════════════════════════════════════════════════ */

async function seed(): Promise<void> {
  console.log('🌱 Iniciando seed...\n');

  // Limpa dados existentes (ordem importa por causa das relações)
  await prisma.progressoAula.deleteMany();
  await prisma.progressoDiario.deleteMany();
  await prisma.usuarioConquista.deleteMany();
  await prisma.conquista.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.curso.deleteMany();

  console.log('🧹 Dados antigos removidos.\n');

  // ═══════════════════════════════════════════════════════════
  // CURSO 1: Fundamentos do Concreto Armado (GRATUITO)
  // ═══════════════════════════════════════════════════════════

  const curso1 = await prisma.curso.create({
    data: {
      titulo: 'Fundamentos do Concreto Armado',
      slug: 'fundamentos-concreto-armado',
      descricao: `
        <p>Aprenda os conceitos essenciais do concreto armado, desde as propriedades dos materiais até o comportamento estrutural. Este curso é ideal para estudantes de engenharia civil e profissionais que desejam revisar os fundamentos.</p>
        <p>Abordamos a <strong>NBR 6118:2023</strong> com exemplos práticos e exercícios resolvidos.</p>
      `,
      resumo: 'Domine os conceitos essenciais do concreto armado conforme a NBR 6118:2023.',
      preco: null,
      cargaHoraria: 40,
      nivel: 'INICIANTE',
      categoria: 'Fundamentos',
      modulos: {
        create: [
          {
            titulo: 'Introdução ao Concreto Armado',
            descricao: 'Conceitos básicos e fundamentos do concreto armado',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'O que é Concreto Armado?',
                  slug: 'oque-e-concreto-armado',
                  duracao: 18,
                  ordem: 1,
                  gratuito: true,
                  videoUrl: 'https://www.youtube.com/watch?v=gk3gQzBINKk',
                  conteudo: `
                    <h2>O que é Concreto Armado?</h2>
                    <p>O concreto armado é um material composto resultante da associação entre <strong>concreto simples</strong> e <strong>armadura de aço</strong>. Enquanto o concreto resiste bem à compressão, o aço é excelente para resistir à tração.</p>
                    <p>Esta combinação torna o concreto armado um dos materiais estruturais mais versáteis e econômicos da construção civil.</p>
                    
                    <h3>Por que usar Concreto Armado?</h3>
                    <ul>
                      <li>Alta resistência à compressão</li>
                      <li>Durabilidade e baixa manutenção</li>
                      <li>Versatilidade de formas</li>
                      <li>Disponibilidade de materiais</li>
                      <li>Custo competitivo</li>
                    </ul>

                    <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4 rounded">
                      <p class="font-bold text-blue-700 dark:text-blue-400">💡 Dica importante</p>
                      <p class="text-blue-600 dark:text-blue-300">O coeficiente de dilatação térmica do aço e do concreto são muito próximos, o que garante que os dois materiais trabalhem juntos sem descolamento.</p>
                    </div>
                  `,
                },
                {
                  titulo: 'Vantagens e Desvantagens',
                  slug: 'vantagens-desvantagens',
                  duracao: 15,
                  ordem: 2,
                  videoUrl: 'https://www.youtube.com/watch?v=gk3gQzBINKk',
                  conteudo: `
                    <h2>Vantagens e Desvantagens do Concreto Armado</h2>
                    
                    <h3>✅ Vantagens</h3>
                    <ul>
                      <li><strong>Econômico:</strong> Material de baixo custo relativo</li>
                      <li><strong>Durável:</strong> Longa vida útil com pouca manutenção</li>
                      <li><strong>Versátil:</strong> Adapta-se a qualquer forma arquitetônica</li>
                      <li><strong>Resistente ao fogo:</strong> Boa proteção das armaduras</li>
                      <li><strong>Mão de obra:</strong> Não exige especialização extrema</li>
                    </ul>

                    <h3>❌ Desvantagens</h3>
                    <ul>
                      <li>Peso próprio elevado</li>
                      <li>Dificuldade em reformas e demolições</li>
                      <li>Necessidade de formas e escoramentos</li>
                      <li>Tempo de cura do concreto</li>
                    </ul>
                  `,
                },
              ],
            },
          },
          {
            titulo: 'Propriedades dos Materiais',
            descricao: 'Características do concreto e do aço para dimensionamento',
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: 'Propriedades do Concreto',
                  slug: 'propriedades-concreto',
                  duracao: 25,
                  ordem: 1,
                  conteudo: `
                    <h2>Propriedades do Concreto</h2>
                    <p>O concreto é caracterizado principalmente pela sua <strong>resistência à compressão</strong>, medida pelo fck (resistência característica à compressão).</p>
                    
                    <h3>Classes de Resistência</h3>
                    <table>
                      <thead>
                        <tr><th>Classe</th><th>fck (MPa)</th><th>Uso comum</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>C20</td><td>20</td><td>Obras de pequeno porte</td></tr>
                        <tr><td>C25</td><td>25</td><td>Edifícios residenciais</td></tr>
                        <tr><td>C30</td><td>30</td><td>Edifícios comerciais</td></tr>
                        <tr><td>C40</td><td>40</td><td>Obras especiais</td></tr>
                      </tbody>
                    </table>
                  `,
                },
                {
                  titulo: 'Propriedades do Aço',
                  slug: 'propriedades-aco',
                  duracao: 20,
                  ordem: 2,
                  conteudo: `
                    <h2>Propriedades do Aço para Armadura</h2>
                    <p>O aço utilizado em armaduras passivas é classificado pela sua <strong>resistência característica de escoamento (fyk)</strong>.</p>
                    
                    <h3>Categorias</h3>
                    <ul>
                      <li><strong>CA-25:</strong> fyk = 250 MPa (uso limitado)</li>
                      <li><strong>CA-50:</strong> fyk = 500 MPa (mais comum)</li>
                      <li><strong>CA-60:</strong> fyk = 600 MPa (telas soldadas)</li>
                    </ul>
                  `,
                },
              ],
            },
          },
        ],
      },
    },
  });

const modulosCurso1 = await prisma.modulo.count({ where: { cursoId: curso1.id } });
console.log(`   ${modulosCurso1} módulos criados\n`);

  // ═══════════════════════════════════════════════════════════
  // CURSO 2: Dimensionamento de Vigas (PAGO)
  // ═══════════════════════════════════════════════════════════

  const curso2 = await prisma.curso.create({
    data: {
      titulo: 'Dimensionamento de Vigas de Concreto Armado',
      slug: 'dimensionamento-vigas',
      descricao: `
        <p>Aprenda a dimensionar vigas retangulares e T conforme a <strong>NBR 6118:2023</strong>. Curso completo com teoria, exemplos resolvidos e exercícios práticos.</p>
        <p>Abordamos flexão simples, cisalhamento, ancoragem e verificação em serviço.</p>
      `,
      resumo: 'Domine o dimensionamento de vigas: flexão, cisalhamento, ancoragem e muito mais.',
      preco: 97.00,
      cargaHoraria: 60,
      nivel: 'INTERMEDIARIO',
      categoria: 'Vigas',
      modulos: {
        create: [
          {
            titulo: 'Flexão Simples',
            descricao: 'Dimensionamento à flexão de vigas retangulares',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Hipóteses de Cálculo',
                  slug: 'hipoteses-calculo-vigas',
                  duracao: 30,
                  ordem: 1,
                  gratuito: true,
                  videoUrl: 'https://www.youtube.com/watch?v=gk3gQzBINKk',
                  conteudo: `
                    <h2>Hipóteses de Cálculo para Flexão Simples</h2>
                    <p>As hipóteses básicas para o dimensionamento à flexão simples conforme a NBR 6118:2023 são:</p>
                    <ol>
                      <li>Seções planas permanecem planas após a deformação</li>
                      <li>Solidariedade perfeita entre concreto e aço</li>
                      <li>Resistência à tração do concreto é desprezada</li>
                      <li>Diagrama tensão-deformação do concreto é parábola-retângulo</li>
                    </ol>
                  `,
                },
                {
                  titulo: 'Domínios de Deformação',
                  slug: 'dominios-deformacao',
                  duracao: 35,
                  ordem: 2,
                  conteudo: `
                    <h2>Domínios de Deformação</h2>
                    <p>A NBR 6118:2023 define 5 domínios de deformação para o estado limite último:</p>
                    <ul>
                      <li><strong>Domínio 1:</strong> Tração não uniforme</li>
                      <li><strong>Domínio 2:</strong> Flexão simples ou composta com ruptura dúctil</li>
                      <li><strong>Domínio 3:</strong> Flexão simples (seção subarmada) - IDEAL</li>
                      <li><strong>Domínio 4:</strong> Flexão simples (seção superarmada) - EVITAR</li>
                      <li><strong>Domínio 5:</strong> Compressão não uniforme</li>
                    </ul>
                  `,
                },
                {
                  titulo: 'Cálculo da Armadura Longitudinal',
                  slug: 'armadura-longitudinal',
                  duracao: 40,
                  ordem: 3,
                  conteudo: `
                    <h2>Cálculo da Armadura Longitudinal</h2>
                    <p>Para uma viga de seção retangular submetida à flexão simples:</p>
                    
                    <pre><code>
// Dados de entrada
const bw = 20;    // cm (largura da viga)
const h = 50;     // cm (altura da viga)
const d = 45;     // cm (altura útil)
const Mk = 80;    // kN.m (momento característico)
const fck = 25;   // MPa (resistência do concreto)
const fyk = 500;  // MPa (resistência do aço)

// Cálculo
const Md = 1.4 * Mk;  // Momento de cálculo (kN.m)
const fcd = fck / 1.4; // Resistência de cálculo do concreto
const fyd = fyk / 1.15; // Resistência de cálculo do aço

const Kc = (bw * d * d) / Md;
const As = Md / (fyd * d * 0.9);
                    </code></pre>
                  `,
                },
              ],
            },
          },
          {
            titulo: 'Cisalhamento',
            descricao: 'Dimensionamento à força cortante',
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: 'Verificação da Biela Comprimida',
                  slug: 'biela-comprimida',
                  duracao: 28,
                  ordem: 1,
                  conteudo: `
                    <h2>Verificação da Biela Comprimida</h2>
                    <p>A biela comprimida deve ser verificada para evitar o esmagamento do concreto:</p>
                    <pre><code>Vsd <= Vrd2</code></pre>
                    <p>Onde Vrd2 é a força cortante resistente de cálculo da biela comprimida.</p>
                  `,
                },
                {
                  titulo: 'Cálculo da Armadura Transversal',
                  slug: 'armadura-transversal',
                  duracao: 32,
                  ordem: 2,
                  conteudo: `
                    <h2>Cálculo da Armadura Transversal (Estribos)</h2>
                    <p>A armadura transversal é calculada pela soma das parcelas:</p>
                    <pre><code>Vsw = Vsd - Vc</code></pre>
                    <p>Onde Vc é a parcela resistida pelo concreto.</p>
                  `,
                },
              ],
            },
          },
        ],
      },
    },
  });

const modulosCurso2 = await prisma.modulo.count({ where: { cursoId: curso2.id } });
console.log(`   ${modulosCurso2} módulos criados\n`);

  // ═══════════════════════════════════════════════════════════
  // CONQUISTAS PADRÃO
  // ═══════════════════════════════════════════════════════════

  const conquistas = await Promise.all([
    prisma.conquista.create({
      data: {
        titulo: 'Primeiro Cálculo',
        descricao: 'Realizou seu primeiro dimensionamento',
        icone: 'award',
        cor: 'amber',
        xpRecompensa: 10,
      },
    }),
    prisma.conquista.create({
      data: {
        titulo: '5 Cálculos',
        descricao: 'Completou 5 dimensionamentos',
        icone: 'award',
        cor: 'amber',
        xpRecompensa: 50,
      },
    }),
    prisma.conquista.create({
      data: {
        titulo: 'Mestre das Vigas',
        descricao: 'Dimensionou 10 vigas corretamente',
        icone: 'shield',
        cor: 'emerald',
        xpRecompensa: 100,
      },
    }),
    prisma.conquista.create({
      data: {
        titulo: 'Madrugador',
        descricao: 'Acessou a plataforma por 7 dias seguidos',
        icone: 'clock',
        cor: 'purple',
        xpRecompensa: 30,
      },
    }),
    prisma.conquista.create({
      data: {
        titulo: 'Primeira Aula',
        descricao: 'Assistiu sua primeira aula completa',
        icone: 'play',
        cor: 'blue',
        xpRecompensa: 5,
      },
    }),
  ]);

  console.log(`✅ ${conquistas.length} conquistas criadas\n`);
  console.log('🎉 Seed concluído com sucesso!');
  console.log('📊 Resumo:');
  console.log('   - 2 cursos (1 gratuito, 1 pago)');
  console.log('   - 4 módulos');
  console.log('   - 9 aulas com conteúdo completo');
  console.log('   - 5 conquistas');
  console.log('\n🚀 Execute "npm run dev" e acesse http://localhost:5173/cursos');
  
  process.exit(0);
}

seed().catch((e: Error) => {
  console.error('❌ Erro no seed:', e);
  process.exit(1);
});