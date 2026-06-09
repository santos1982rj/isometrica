import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as bcrypt from 'bcrypt';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

interface LessonInput {
  title: string
  type: 'video' | 'text'
  content?: string
  contentUrl?: string
}

interface ModuleInput {
  name: string
  order: number
  lessons: LessonInput[]
}

interface CourseInput {
  name: string
  description: string
  imageUrl?: string
  modules: ModuleInput[]
}

interface SubjectInput {
  name: string
  description: string
  courses: CourseInput[]
}

const subjects: SubjectInput[] = [
  {
    name: 'Cálculo Diferencial e Integral I',
    description: 'Limites, derivadas e integrais de funções reais de uma variável.',
    courses: [
      {
        name: 'Cálculo I',
        description: 'Fundamentos do Cálculo Diferencial e Integral: limites, derivadas e integrais.',
        imageUrl: 'https://i.ytimg.com/vi/PLEfwqyY2ox86LhxKybOY3_IG-7R5herLC/maxresdefault.jpg',
        modules: [
          {
            name: 'Limites', order: 1,
            lessons: [
              { title: 'Noção Intuitiva de Limite', type: 'video', contentUrl: 'https://www.youtube.com/watch?v=dTwd5hifflE', content: '<p>Introdução ao conceito de limite de uma função. Abordagem gráfica e intuitiva.</p>' },
              { title: 'Limites Laterais', type: 'video', contentUrl: 'https://www.youtube.com/watch?v=3QhU0vD2fAM', content: '<p>Limites laterais: definição e exemplos. Condição para existência do limite.</p>' },
              { title: 'Limites no Infinito', type: 'video', content: '<p>Comportamento de funções quando x tende a infinito. Limites infinitos e assíntotas.</p>' },
              { title: 'Limites Fundamentais', type: 'video', content: '<p>Principais limites fundamentais: sen(x)/x, (e^x - 1)/x e (1 + x)^(1/x).</p>' },
              { title: 'Continuidade de Funções', type: 'video', content: '<p>Definição de continuidade. Funções contínuas e o Teorema do Valor Intermediário.</p>' },
            ],
          },
          {
            name: 'Derivadas', order: 2,
            lessons: [
              { title: 'Taxa de Variação e Reta Tangente', type: 'video', content: '<p>Interpretação geométrica da derivada como inclinação da reta tangente.</p>' },
              { title: 'Regras de Derivação', type: 'video', content: '<p>Regras básicas: soma, produto, quociente e potência.</p>' },
              { title: 'Regra da Cadeia', type: 'video', content: '<p>Derivada de funções compostas. Aplicações da regra da cadeia.</p>' },
              { title: 'Derivada de Funções Trigonométricas', type: 'video', content: '<p>Derivadas de seno, cosseno, tangente e demais funções trigonométricas.</p>' },
            ],
          },
          {
            name: 'Aplicações de Derivadas', order: 3,
            lessons: [
              { title: 'Máximos e Mínimos', type: 'video', content: '<p>Pontos críticos, teste da primeira e segunda derivada para otimização.</p>' },
              { title: 'Teorema do Valor Médio', type: 'video', content: '<p>Teorema de Rolle e Teorema do Valor Médio de Lagrange.</p>' },
              { title: 'Regra de L\'Hôpital', type: 'video', content: '<p>Cálculo de limites indeterminados usando a regra de L\'Hôpital.</p>' },
              { title: 'Esboço de Gráficos', type: 'video', content: '<p>Roteiro completo para esboçar gráficos de funções usando derivadas.</p>' },
            ],
          },
          {
            name: 'Integrais', order: 4,
            lessons: [
              { title: 'Integral Indefinida', type: 'video', content: '<p>Primitivas e integral indefinida. Tabela de integrais imediatas.</p>' },
              { title: 'Integral Definida', type: 'video', content: '<p>Definição pela soma de Riemann. Teorema Fundamental do Cálculo.</p>' },
              { title: 'Técnicas de Integração', type: 'video', content: '<p>Integração por substituição simples e por partes.</p>' },
              { title: 'Cálculo de Áreas', type: 'video', content: '<p>Cálculo de áreas entre curvas usando integrais definidas.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Cálculo Diferencial e Integral II',
    description: 'Integrais impróprias, sequências, séries e funções de várias variáveis.',
    courses: [
      {
        name: 'Cálculo II',
        description: 'Aprofundamento em cálculo: técnicas de integração, séries e cálculo multivariável.',
        imageUrl: 'https://img.youtube.com/vi/PLEfwqyY2ox86LhxKybOY3_IG-7R5herLC/maxresdefault.jpg',
        modules: [
          {
            name: 'Técnicas Avançadas de Integração', order: 1,
            lessons: [
              { title: 'Integração por Frações Parciais', type: 'video', content: '<p>Decomposição de funções racionais em frações parciais para integração.</p>' },
              { title: 'Integrais Trigonométricas', type: 'video', content: '<p>Técnicas para integrar potências de seno, cosseno, tangente e secante.</p>' },
              { title: 'Substituição Trigonométrica', type: 'video', content: '<p>Integrais envolvendo raízes quadradas usando substituições trigonométricas.</p>' },
              { title: 'Integrais Impróprias', type: 'video', content: '<p>Integrais com limites infinitos e integrandos descontínuos. Convergência.</p>' },
            ],
          },
          {
            name: 'Sequências e Séries', order: 2,
            lessons: [
              { title: 'Sequências Numéricas', type: 'video', content: '<p>Definição de sequência, limites e convergência de sequências.</p>' },
              { title: 'Séries Numéricas', type: 'video', content: '<p>Séries convergentes e divergentes. Série geométrica e telescópica.</p>' },
              { title: 'Testes de Convergência', type: 'video', content: '<p>Teste da divergência, da comparação, da razão e da raiz.</p>' },
              { title: 'Séries de Potências', type: 'video', content: '<p>Raio e intervalo de convergência. Série de Taylor e Maclaurin.</p>' },
            ],
          },
          {
            name: 'Funções de Várias Variáveis', order: 3,
            lessons: [
              { title: 'Curvas de Nível e Gráficos', type: 'video', content: '<p>Representação de funções de duas variáveis. Curvas de nível.</p>' },
              { title: 'Derivadas Parciais', type: 'video', content: '<p>Derivadas parciais de primeira e segunda ordem. Interpretação.</p>' },
              { title: 'Gradiente e Derivada Direcional', type: 'video', content: '<p>Vetor gradiente, derivada direcional e taxa de variação máxima.</p>' },
              { title: 'Máximos e Mínimos em 2D', type: 'video', content: '<p>Pontos críticos, teste da segunda derivada para funções de duas variáveis.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Álgebra Linear',
    description: 'Vetores, matrizes, espaços vetoriais e transformações lineares.',
    courses: [
      {
        name: 'Álgebra Linear',
        description: 'Fundamentos de álgebra linear para engenharia.',
        imageUrl: 'https://img.youtube.com/vi/PLrOyM49ctTx8go5KFpSr-EMScIPygZNob/maxresdefault.jpg',
        modules: [
          {
            name: 'Matrizes e Sistemas Lineares', order: 1,
            lessons: [
              { title: 'Operações com Matrizes', type: 'video', content: '<p>Adição, multiplicação, transposição e inversão de matrizes.</p>' },
              { title: 'Eliminação Gaussiana', type: 'video', content: '<p>Resolução de sistemas lineares por escalonamento. Método de Gauss-Jordan.</p>' },
              { title: 'Determinantes', type: 'video', content: '<p>Cálculo de determinantes. Propriedades e aplicações. Regra de Cramer.</p>' },
            ],
          },
          {
            name: 'Espaços Vetoriais', order: 2,
            lessons: [
              { title: 'Vetores no R² e R³', type: 'video', content: '<p>Operações vetoriais, produto escalar e produto vetorial.</p>' },
              { title: 'Subespaços Vetoriais', type: 'video', content: '<p>Definição e exemplos de subespaços. Base e dimensão.</p>' },
              { title: 'Combinação Linear e Dependência', type: 'video', content: '<p>Combinação linear, vetores LI e LD. Base canônica.</p>' },
              { title: 'Produto Interno e Ortogonalidade', type: 'video', content: '<p>Espaços com produto interno. Ortogonalidade e projeções.</p>' },
            ],
          },
          {
            name: 'Transformações Lineares', order: 3,
            lessons: [
              { title: 'Definição e Exemplos', type: 'video', content: '<p>Transformações lineares, núcleo e imagem. Matriz associada.</p>' },
              { title: 'Autovalores e Autovetores', type: 'video', content: '<p>Cálculo de autovalores e autovetores. Polinômio característico.</p>' },
              { title: 'Diagonalização', type: 'video', content: '<p>Matrizes diagonalizáveis. Aplicações em sistemas dinâmicos.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Física Geral',
    description: 'Princípios da mecânica clássica e suas aplicações na engenharia.',
    courses: [
      {
        name: 'Física I — Mecânica Clássica',
        description: 'Cinemática, dinâmica, trabalho, energia e conservação.',
        modules: [
          {
            name: 'Cinemática', order: 1,
            lessons: [
              { title: 'Movimento Retilíneo Uniforme', type: 'video', content: '<p>MRU: posição, velocidade constante e equação horária.</p>' },
              { title: 'Movimento Uniformemente Variado', type: 'video', content: '<p>MUV: aceleração constante, equações de movimento e queda livre.</p>' },
              { title: 'Movimento Circular', type: 'video', content: '<p>Movimento circular uniforme: velocidade angular, aceleração centrípeta.</p>' },
              { title: 'Lançamento de Projéteis', type: 'video', content: '<p>Movimento bidimensional: decomposição vetorial e alcance máximo.</p>' },
            ],
          },
          {
            name: 'Dinâmica', order: 2,
            lessons: [
              { title: 'Leis de Newton', type: 'video', content: '<p>As três leis de Newton. Diagrama de corpo livre e aplicações.</p>' },
              { title: 'Força de Atrito', type: 'video', content: '<p>Atrito estático e dinâmico. Coeficiente de atrito e plano inclinado.</p>' },
              { title: 'Trabalho e Energia Cinética', type: 'video', content: '<p>Definição de trabalho. Teorema trabalho-energia cinética.</p>' },
              { title: 'Energia Potencial e Conservação', type: 'video', content: '<p>Energia potencial gravitacional e elástica. Conservação da energia mecânica.</p>' },
            ],
          },
          {
            name: 'Rotação e Gravitação', order: 3,
            lessons: [
              { title: 'Momento de Inércia', type: 'video', content: '<p>Cálculo de momento de inércia para corpos rígidos. Teorema dos eixos paralelos.</p>' },
              { title: 'Torque e Rotação', type: 'video', content: '<p>Torque, segunda lei de Newton para rotação e movimento de rotação.</p>' },
              { title: 'Conservação do Momentum Angular', type: 'video', content: '<p>Momento angular e sua conservação em sistemas isolados.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Resistência dos Materiais',
    description: 'Estudo dos esforços internos, tensões e deformações em corpos sólidos.',
    courses: [
      {
        name: 'Resistência dos Materiais I',
        description: 'Conceitos fundamentais: tração, compressão, cisalhamento, flexão e torção. Curso baseado na disciplina da UNIVESP.',
        imageUrl: 'https://i.ytimg.com/vi/PLjwt3qVhiyAJy1AiBEdkYkRhKSYXmsava/maxresdefault.jpg',
        modules: [
          {
            name: 'Conceitos Fundamentais', order: 1,
            lessons: [
              { title: 'Introdução à Resistência dos Materiais', type: 'video', contentUrl: 'https://www.youtube.com/watch?v=WOdHwBpTiiQ', content: '<p>Visão geral da disciplina. Conceitos de tensão e deformação. Tipos de esforços.</p>' },
              { title: 'Tipos de Apoios e Vínculos', type: 'video', content: '<p>Apoios móveis, fixos e engastes. Graus de liberdade e reações de apoio.</p>' },
              { title: 'Equações de Equilíbrio', type: 'video', content: '<p>Equilíbrio estático: somatório de forças e momentos. Condições de equilíbrio.</p>' },
            ],
          },
          {
            name: 'Tensão e Deformação', order: 2,
            lessons: [
              { title: 'Tensão Normal', type: 'video', content: '<p>Tensão normal axial: definição, cálculo e exemplos em barras.</p>' },
              { title: 'Deformação Específica', type: 'video', content: '<p>Deformação longitudinal e transversal. Diagrama tensão-deformação.</p>' },
              { title: 'Lei de Hooke', type: 'video', content: '<p>Relação linear entre tensão e deformação. Módulo de elasticidade.</p>' },
              { title: 'Coeficiente de Poisson', type: 'video', content: '<p>Deformação transversal. Relação entre constantes elásticas.</p>' },
            ],
          },
          {
            name: 'Solicitações em Vigas', order: 3,
            lessons: [
              { title: 'Esforço Cortante e Momento Fletor', type: 'video', content: '<p>Definição de esforço cortante e momento fletor em vigas.</p>' },
              { title: 'Diagramas de Esforços', type: 'video', content: '<p>Construção dos diagramas de esforço cortante e momento fletor.</p>' },
              { title: 'Relação entre Carga, Cortante e Momento', type: 'video', content: '<p>Relações diferenciais aplicadas à construção de diagramas.</p>' },
            ],
          },
          {
            name: 'Flexão', order: 4,
            lessons: [
              { title: 'Tensão de Flexão', type: 'video', content: '<p>Tensões normais na flexão pura. Fórmula da flexão.</p>' },
              { title: 'Momento de Inércia', type: 'video', content: '<p>Cálculo do momento de inércia de seções transversais. Teorema dos eixos paralelos.</p>' },
              { title: 'Linha Elástica', type: 'video', content: '<p>Equação diferencial da linha elástica. Deflexão em vigas.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Concreto Armado',
    description: 'Princípios do concreto armado, dimensionamento de vigas, lajes e pilares.',
    courses: [
      {
        name: 'Concreto Armado I',
        description: 'Fundamentos do concreto armado: propriedades dos materiais, ELU e ELS, dimensionamento à flexão.',
        modules: [
          {
            name: 'Propriedades dos Materiais', order: 1,
            lessons: [
              { title: 'Concreto: Composição e Propriedades', type: 'video', content: '<p>Cimento, agregados, água e aditivos. Resistência à compressão e tração.</p>' },
              { title: 'Aço para Concreto Armado', type: 'video', content: '<p>Tipos de aço CA-25, CA-50 e CA-60. Diagrama tensão-deformação do aço.</p>' },
              { title: 'Aderência Aço-Concreto', type: 'video', content: '<p>Mecanismo de aderência: adesão, atrito e engrenamento. Ancoragem.</p>' },
            ],
          },
          {
            name: 'Estados Limites', order: 2,
            lessons: [
              { title: 'Estado Limite Último (ELU)', type: 'video', content: '<p>Definição de ELU. Combinações de carregamento. Coeficientes de segurança.</p>' },
              { title: 'Estado Limite de Serviço (ELS)', type: 'video', content: '<p>Fissuração, deformação excessiva e vibrações. Controle de ELS.</p>' },
              { title: 'Domínios de Deformação', type: 'video', content: '<p>Domínios do ELU para flexão. Posição da linha neutra.</p>' },
            ],
          },
          {
            name: 'Dimensionamento à Flexão', order: 3,
            lessons: [
              { title: 'Vigas de Seção Retangular', type: 'video', content: '<p>Dimensionamento de vigas submetidas à flexão simples. Armadura simples.</p>' },
              { title: 'Armadura Dupla', type: 'video', content: '<p>Dimensionamento com armadura dupla quando a seção é insuficiente.</p>' },
              { title: 'Seção T', type: 'video', content: '<p>Dimensionamento de vigas de seção T. Mesa colaborante.</p>' },
              { title: 'Cisalhamento em Vigas', type: 'video', content: '<p>Dimensionamento ao esforço cortante. Estribos e armadura transversal.</p>' },
            ],
          },
          {
            name: 'Lajes', order: 4,
            lessons: [
              { title: 'Classificação de Lajes', type: 'video', content: '<p>Lajes maciças, nervuradas e pré-fabricadas. Direção de armadura.</p>' },
              { title: 'Lajes Armadas em Uma Direção', type: 'video', content: '<p>Cálculo de momentos fletores e reações em lajes armadas em uma direção.</p>' },
              { title: 'Lajes Armadas em Duas Direções', type: 'video', content: '<p>Cálculo de lajes armadas em cruz. Tabelas de cálculo.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Geotecnia',
    description: 'Mecânica dos solos, tensões, compressibilidade e empuxo de terra.',
    courses: [
      {
        name: 'Mecânica dos Solos I',
        description: 'Propriedades físicas dos solos, tensões, adensamento e resistência ao cisalhamento.',
        modules: [
          {
            name: 'Propriedades dos Solos', order: 1,
            lessons: [
              { title: 'Origem e Formação dos Solos', type: 'video', content: '<p>Intemperismo, solos residuais e transportados. Mineralogia das argilas.</p>' },
              { title: 'Índices Físicos', type: 'video', content: '<p>Teor de umidade, porosidade, índice de vazios e grau de saturação.</p>' },
              { title: 'Granulometria', type: 'video', content: '<p>Curva granulométrica. Coeficientes de uniformidade e curvatura.</p>' },
              { title: 'Limites de Atterberg', type: 'video', content: '<p>Limite de liquidez, plasticidade e contração. Índice de plasticidade.</p>' },
            ],
          },
          {
            name: 'Tensões em Solos', order: 2,
            lessons: [
              { title: 'Tensões Totais e Efetivas', type: 'video', content: '<p>Princípio das tensões efetivas de Terzaghi. Poropressão.</p>' },
              { title: 'Tensões Geostáticas', type: 'video', content: '<p>Cálculo de tensões verticais e horizontais no solo devido ao peso próprio.</p>' },
              { title: 'Permeabilidade dos Solos', type: 'video', content: '<p>Lei de Darcy. Coeficiente de permeabilidade. Ensaios de permeabilidade.</p>' },
              { title: 'Redes de Fluxo', type: 'video', content: '<p>Construção de redes de fluxo. Cálculo de vazão e subpressão.</p>' },
            ],
          },
          {
            name: 'Adensamento e Compressibilidade', order: 3,
            lessons: [
              { title: 'Ensaio de Adensamento', type: 'video', content: '<p>Ensaio oedométrico. Curva de compressibilidade. Pré-adensamento.</p>' },
              { title: 'Teoria do Adensamento de Terzaghi', type: 'video', content: '<p>Equação diferencial do adensamento. Grau de adensamento.</p>' },
              { title: 'Cálculo de Recalques', type: 'video', content: '<p>Cálculo de recalques por adensamento primário. Exemplos práticos.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Fenômenos dos Transportes',
    description: 'Mecânica dos fluidos, transferência de calor e massa.',
    courses: [
      {
        name: 'Fenômenos dos Transportes',
        description: 'Princípios de mecânica dos fluidos, hidrostática, escoamento e perda de carga.',
        modules: [
          {
            name: 'Hidrostática', order: 1,
            lessons: [
              { title: 'Propriedades dos Fluidos', type: 'video', content: '<p>Massa específica, peso específico, viscosidade dinâmica e cinemática.</p>' },
              { title: 'Pressão e Empuxo', type: 'video', content: '<p>Pressão hidrostática. Lei de Pascal. Empuxo e princípio de Arquimedes.</p>' },
              { title: 'Manometria', type: 'video', content: '<p>Medição de pressão. Piezômetros, manômetros e barômetros.</p>' },
            ],
          },
          {
            name: 'Cinemática dos Fluidos', order: 2,
            lessons: [
              { title: 'Tipos de Escoamento', type: 'video', content: '<p>Laminar, turbulento, permanente e variado. Número de Reynolds.</p>' },
              { title: 'Equação da Continuidade', type: 'video', content: '<p>Vazão mássica e volumétrica. Conservação da massa em escoamentos.</p>' },
              { title: 'Equação de Bernoulli', type: 'video', content: '<p>Princípio de Bernoulli. Aplicações: tubo de Venturi, tubo de Pitot.</p>' },
            ],
          },
          {
            name: 'Escoamento em Condutos', order: 3,
            lessons: [
              { title: 'Perda de Carga Distribuída', type: 'video', content: '<p>Equação de Darcy-Weisbach. Fator de atrito. Diagrama de Moody.</p>' },
              { title: 'Perda de Carga Localizada', type: 'video', content: '<p>Perdas em conexões, válvulas e singularidades. Comprimento equivalente.</p>' },
              { title: 'Condutos Forçados e Canais', type: 'video', content: '<p>Escoamento em tubulações sob pressão. Canais abertos. Fórmula de Manning.</p>' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Análise Estrutural',
    description: 'Métodos de análise de estruturas isostáticas e hiperestáticas.',
    courses: [
      {
        name: 'Análise Estrutural I',
        description: 'Classificação de estruturas, reações de apoio, diagramas e linhas de estado.',
        modules: [
          {
            name: 'Introdução à Análise Estrutural', order: 1,
            lessons: [
              { title: 'Classificação das Estruturas', type: 'video', content: '<p>Estruturas isostáticas, hiperestáticas e hipostáticas. Graus de liberdade.</p>' },
              { title: 'Ações e Solicitações', type: 'video', content: '<p>Cargas permanentes, variáveis e excepcionais. Combinações de carregamento.</p>' },
            ],
          },
          {
            name: 'Vigas e Pórticos Isostáticos', order: 2,
            lessons: [
              { title: 'Reações de Apoio em Vigas', type: 'video', content: '<p>Cálculo de reações em vigas biapoiadas, engastadas e com balanços.</p>' },
              { title: 'Diagramas de Esforços Internos', type: 'video', content: '<p>Diagramas de esforço normal, cortante e momento fletor.</p>' },
              { title: 'Pórticos Planos', type: 'video', content: '<p>Análise de pórticos isostáticos. Diagramas em quadros.</p>' },
            ],
          },
          {
            name: 'Treliças', order: 3,
            lessons: [
              { title: 'Método dos Nós', type: 'video', content: '<p>Análise de treliças pelo equilíbrio dos nós. Esforços normais.</p>' },
              { title: 'Método das Seções', type: 'video', content: '<p>Método de Ritter para determinação de esforços em treliças.</p>' },
            ],
          },
        ],
      },
    ],
  },
]

const topicDefs = [
  { name: 'Limites', subjectName: 'Cálculo Diferencial e Integral I' },
  { name: 'Derivadas', subjectName: 'Cálculo Diferencial e Integral I' },
  { name: 'Aplicações de Derivadas', subjectName: 'Cálculo Diferencial e Integral I' },
  { name: 'Integrais', subjectName: 'Cálculo Diferencial e Integral I' },
  { name: 'Técnicas Avançadas de Integração', subjectName: 'Cálculo Diferencial e Integral II' },
  { name: 'Sequências e Séries', subjectName: 'Cálculo Diferencial e Integral II' },
  { name: 'Funções de Várias Variáveis', subjectName: 'Cálculo Diferencial e Integral II' },
  { name: 'Matrizes e Sistemas Lineares', subjectName: 'Álgebra Linear' },
  { name: 'Espaços Vetoriais', subjectName: 'Álgebra Linear' },
  { name: 'Transformações Lineares', subjectName: 'Álgebra Linear' },
  { name: 'Cinemática', subjectName: 'Física Geral' },
  { name: 'Dinâmica', subjectName: 'Física Geral' },
  { name: 'Conceitos Fundamentais', subjectName: 'Resistência dos Materiais' },
  { name: 'Tensão e Deformação', subjectName: 'Resistência dos Materiais' },
  { name: 'Solicitações em Vigas', subjectName: 'Resistência dos Materiais' },
  { name: 'Flexão', subjectName: 'Resistência dos Materiais' },
  { name: 'Propriedades dos Materiais', subjectName: 'Concreto Armado' },
  { name: 'Estados Limites', subjectName: 'Concreto Armado' },
  { name: 'Dimensionamento à Flexão', subjectName: 'Concreto Armado' },
  { name: 'Lajes', subjectName: 'Concreto Armado' },
  { name: 'Propriedades dos Solos', subjectName: 'Geotecnia' },
  { name: 'Tensões em Solos', subjectName: 'Geotecnia' },
  { name: 'Adensamento e Compressibilidade', subjectName: 'Geotecnia' },
  { name: 'Hidrostática', subjectName: 'Fenômenos dos Transportes' },
  { name: 'Cinemática dos Fluidos', subjectName: 'Fenômenos dos Transportes' },
  { name: 'Escoamento em Condutos', subjectName: 'Fenômenos dos Transportes' },
  { name: 'Introdução à Análise Estrutural', subjectName: 'Análise Estrutural' },
  { name: 'Vigas e Pórticos Isostáticos', subjectName: 'Análise Estrutural' },
  { name: 'Treliças', subjectName: 'Análise Estrutural' },
]

const questionsByTopic = [
  { topic: 'Limites', difficulty: 'EASY', bloom: 'REMEMBER', text: 'Qual o valor do limite lim(x→2) (x² − 4)/(x − 2)?', alternatives: ['0', '2', '4', '∞', '-4'], correct: 2 },
  { topic: 'Limites', difficulty: 'MEDIUM', bloom: 'UNDERSTAND', text: 'Se lim(x→a) f(x) = L e lim(x→a) g(x) = M, qual o valor de lim(x→a) [f(x) + g(x)]?', alternatives: ['L · M', 'L + M', 'L − M', 'L/M', 'Não existe'], correct: 1 },
  { topic: 'Derivadas', difficulty: 'EASY', bloom: 'APPLY', text: 'Qual a derivada de f(x) = 3x⁵?', alternatives: ['15x⁴', '5x⁴', '15x⁶', '3x⁴', '5x⁶'], correct: 0 },
  { topic: 'Derivadas', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Qual a derivada de f(x) = sen(2x)?', alternatives: ['cos(2x)', '2cos(2x)', '−2cos(2x)', '−cos(2x)', '2sen(2x)'], correct: 1 },
  { topic: 'Integrais', difficulty: 'EASY', bloom: 'APPLY', text: 'Qual o valor da integral ∫ 3x² dx?', alternatives: ['x³ + C', '3x³ + C', '6x + C', 'x² + C', '3x² + C'], correct: 0 },
  { topic: 'Integrais', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Qual o valor da integral definida ∫₀¹ x² dx?', alternatives: ['0', '1/3', '1/2', '1', '2/3'], correct: 1 },
  { topic: 'Tensão e Deformação', difficulty: 'EASY', bloom: 'REMEMBER', text: 'Qual a unidade de tensão no SI?', alternatives: ['N', 'Pa', 'kg/m³', 'J', 'W'], correct: 1 },
  { topic: 'Tensão e Deformação', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Uma barra de aço (E = 200 GPa) de 2 m de comprimento e seção 5 cm² é submetida a uma força de 50 kN. Qual a deformação longitudinal?', alternatives: ['0,5 mm', '1,0 mm', '2,0 mm', '0,25 mm', '1,5 mm'], correct: 1 },
  { topic: 'Flexão', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Em uma viga biapoiada com carga uniformemente distribuída q, onde ocorre o momento fletor máximo?', alternatives: ['Nos apoios', 'No centro do vão', 'A 1/4 do vão', 'A 1/3 do vão', 'Depende da seção'], correct: 1 },
  { topic: 'Flexão', difficulty: 'HARD', bloom: 'ANALYZE', text: 'A fórmula da flexão σ = M·c/I é válida sob qual condição principal?', alternatives: ['Material elástico não linear', 'Seção assimétrica', 'Material elástico linear dentro do regime de Hooke', 'Para qualquer tipo de carregamento', 'Apenas para vigas engastadas'], correct: 2 },
  { topic: 'Conceitos Fundamentais', difficulty: 'EASY', bloom: 'REMEMBER', text: 'Quantas equações de equilíbrio existem no plano?', alternatives: ['2', '3', '4', '5', '6'], correct: 1 },
  { topic: 'Propriedades dos Solos', difficulty: 'EASY', bloom: 'REMEMBER', text: 'Qual o índice físico que representa a relação entre o volume de vazios e o volume total?', alternatives: ['Porosidade', 'Índice de vazios', 'Grau de saturação', 'Teor de umidade', 'Compacidade'], correct: 0 },
  { topic: 'Propriedades dos Materiais', difficulty: 'EASY', bloom: 'REMEMBER', text: 'Qual a resistência característica do concreto mais comum em estruturas de edifícios?', alternatives: ['C15', 'C20', 'C25', 'C30', 'C35'], correct: 2 },
  { topic: 'Hidrostática', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Qual a pressão a 10 m de profundidade em água (ρ = 1000 kg/m³, g = 10 m/s²)?', alternatives: ['10 kPa', '50 kPa', '100 kPa', '150 kPa', '200 kPa'], correct: 2 },
  { topic: 'Vigas e Pórticos Isostáticos', difficulty: 'MEDIUM', bloom: 'APPLY', text: 'Para uma viga biapoiada de vão L com carga concentrada P no centro, qual o valor da reação em cada apoio?', alternatives: ['P/4', 'P/2', 'P', '2P', 'Depende da seção'], correct: 1 },
]

async function main() {
  console.log('🌱 Iniciando seed...\n')

  // Cleanup existing seed data (respecting FK order)
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.tutorAction.deleteMany()
  await prisma.event.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.diagnostic.deleteMany()
  await prisma.studentModel.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.questionAttempt.deleteMany()
  await prisma.alternative.deleteMany()
  await prisma.question.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.mission.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.gamificationProfile.deleteMany()
  console.log('  Dados anteriores limpos\n')

  // Users
  const senhaHash = await bcrypt.hash('123456', 10)

  const users = [
    { email: 'admin@isometrica.com', name: 'Admin Isométrica', role: 'ADMIN' as const },
    { email: 'professor@isometrica.com', name: 'Prof. Carlos Mendes', role: 'PROFESSOR' as const },
    { email: 'aluno@isometrica.com', name: 'Gabriel Santos', role: 'STUDENT' as const },
  ]

  const createdUsers = []
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: senhaHash, university: 'Universidade Federal', period: u.role === 'STUDENT' ? 5 : undefined },
    })
    createdUsers.push(user)
    console.log(`  Usuário: ${user.name} (${user.role})`)
  }

  // Plans
  const plansCount = await prisma.plan.count()
  if (plansCount === 0) {
    await prisma.plan.createMany({
      data: [
        { name: 'Gratuito', description: 'Acesso básico a 5 cursos, tutor IA limitado, 10 questões/dia', price: 0, duration: 30, active: true },
        { name: 'Premium', description: 'Acesso completo a todos os cursos, tutor IA ilimitado, questões ilimitadas, gamificação e certificados', price: 29.90, duration: 30, active: true },
      ],
    })
    console.log('  Planos criados: Gratuito, Premium')
  }

  // Subjects, Courses, Modules, Lessons
  let totalCursos = 0
  let totalModulos = 0
  let totalAulas = 0

  for (const s of subjects) {
    const subject = await prisma.subject.create({
      data: { name: s.name, description: s.description },
    })

    const colors = ['from-violet-600 to-purple-700', 'from-emerald-600 to-teal-700', 'from-orange-500 to-rose-600', 'from-blue-600 to-cyan-700', 'from-pink-500 to-fuchsia-600', 'from-amber-500 to-yellow-600', 'from-sky-600 to-indigo-700', 'from-lime-600 to-green-700', 'from-red-600 to-rose-700']
    for (const [ci, c] of s.courses.entries()) {
      const isPremium = ['Concreto Armado I', 'Mecânica dos Solos I', 'Fenômenos dos Transportes'].includes(c.name)
      const totalLessons = c.modules.reduce((a, m) => a + m.lessons.length, 0)
      const course = await prisma.course.create({
        data: {
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          subjectId: subject.id,
          color: colors[ci % colors.length],
          estimatedHours: Math.max(4, Math.round(totalLessons * 0.8)),
          level: isPremium ? 'avançado' : 'iniciante',
          premium: isPremium,
          certificateEnabled: isPremium,
          price: isPremium ? 49.90 : 0,
        },
      })

      for (const m of c.modules) {
        const module = await prisma.module.create({
          data: {
            name: m.name,
            order: m.order,
            courseId: course.id,
          },
        })

        for (let i = 0; i < m.lessons.length; i++) {
          const l = m.lessons[i]
          await prisma.lesson.create({
            data: {
              title: l.title,
              type: l.type,
              order: i + 1,
              content: l.content ?? `<h2>${l.title}</h2><p>Conteúdo em desenvolvimento.</p>`,
              contentUrl: l.contentUrl,
              moduleId: module.id,
            },
          })
          totalAulas++
        }
        totalModulos++
      }
      totalCursos++
      const modCount = c.modules.length
      const lessCount = c.modules.reduce((a, m) => a + m.lessons.length, 0)
      console.log(`  Curso: ${c.name} (${modCount} módulos, ${lessCount} aulas)`)
    }
  }
  console.log(`\n  Total: ${totalCursos} cursos, ${totalModulos} módulos, ${totalAulas} aulas`)

  // Topics
  const createdTopics: Record<string, string> = {}
  for (const tDef of topicDefs) {
    const subject = await prisma.subject.findUnique({ where: { name: tDef.subjectName } })
    if (!subject) continue
    let topic = await prisma.topic.findFirst({ where: { name: tDef.name, subjectId: subject.id } })
    if (!topic) {
      topic = await prisma.topic.create({ data: { name: tDef.name, description: `Tópico: ${tDef.name}`, subjectId: subject.id } })
    }
    createdTopics[tDef.name] = topic.id
  }
  console.log(`  ${Object.keys(createdTopics).length} tópicos criados`)

  // Questions
  let qCount = 0
  for (const q of questionsByTopic) {
    const topicId = createdTopics[q.topic]
    if (!topicId) continue
    await prisma.question.create({
      data: {
        topicId,
        difficulty: q.difficulty as any,
        bloomLevel: q.bloom as any,
        text: q.text,
        alternatives: {
          create: q.alternatives.map((text, i) => ({
            text,
            isCorrect: i === q.correct,
          })),
        },
      },
    })
    qCount++
  }
  console.log(`  ${qCount} questões criadas`)

  // Gamification profile for student
  const student = createdUsers.find(u => u.role === 'STUDENT')
  if (student) {
    await prisma.gamificationProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        xp: 2450,
        level: 8,
        streak: 7,
      },
    })
    console.log('  Perfil de gamificação criado para estudante')

    await prisma.achievement.createMany({
      data: [
        { gamificationProfileId: (await prisma.gamificationProfile.findUnique({ where: { userId: student.id } }))!.id, name: 'Primeiro Passo', description: 'Complete sua primeira aula', icon: '🎯' },
        { gamificationProfileId: (await prisma.gamificationProfile.findUnique({ where: { userId: student.id } }))!.id, name: 'Três dias seguidos', description: 'Estude por 3 dias consecutivos', icon: '🔥' },
        { gamificationProfileId: (await prisma.gamificationProfile.findUnique({ where: { userId: student.id } }))!.id, name: 'Maratonista', description: '7 dias consecutivos de estudo', icon: '🏃' },
      ],
    })
    console.log('  Conquistas criadas para estudante')
  }

  // Enrollment
  const firstCourse = await prisma.course.findFirst()
  if (student && firstCourse) {
    const exists = await prisma.enrollment.findFirst({ where: { userId: student.id, courseId: firstCourse.id } })
    if (!exists) {
      await prisma.enrollment.create({ data: { userId: student.id, courseId: firstCourse.id } })
      console.log(`  Matrícula: ${student.name} → ${firstCourse.name}`)
    }
  }

  console.log('\n✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
