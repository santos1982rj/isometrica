export const exames = [
  { name: 'ENADE', board: 'INEP/MEC', year: 2024, role: 'Engenharia Civil', organization: 'MEC' },
  { name: 'CREA - Engenharia Civil', board: 'CESGRANRIO', year: 2023, role: 'Engenheiro Civil', organization: 'CREA' },
  { name: 'Petrobras', board: 'CESGRANRIO', year: 2024, role: 'Engenheiro Civil Júnior', organization: 'Petrobras' },
  { name: 'Concursos Prefeituras', board: 'VUNESP', year: 2024, role: 'Engenheiro Civil', organization: 'Prefeitura' },
  { name: 'ESA - Engenharia', board: 'Exército', year: 2023, role: 'Oficial Engenheiro', organization: 'Exército Brasileiro' },
]

export interface QuestaoSeed {
  text: string
  difficulty: string
  bloomLevel: string
  explanation?: string
  estimatedTime: number
  tags: string[]
  examIndex?: number
  alternatives: { text: string; isCorrect: boolean; feedback?: string }[]
}

export const questoesPorTopico: Record<string, QuestaoSeed[]> = {
  // === CÁLCULO I ===
  'Limites': [
    { text: 'Qual o valor de lim(x→0) (sen(2x))/x?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['limites', 'trigonométrico'], alternatives: [{ text: '1', isCorrect: false }, { text: '2', isCorrect: true, feedback: 'sen(2x)/x = 2·sen(2x)/(2x) → 2·1 = 2' }, { text: '0', isCorrect: false }, { text: '∞', isCorrect: false }] },
    { text: 'Qual o valor de lim(x→4) (x² − 16)/(x − 4)?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['limites', 'indeterminação', 'fatoração'], alternatives: [{ text: '4', isCorrect: false }, { text: '8', isCorrect: true }, { text: '0', isCorrect: false }, { text: '16', isCorrect: false }] },
    { text: 'Se lim(x→a) f(x) = L e lim(x→a) g(x) = M, então lim(x→a) [f(x)·g(x)] = ?', difficulty: 'MEDIUM', bloomLevel: 'UNDERSTAND', estimatedTime: 2, tags: ['limites', 'propriedades'], alternatives: [{ text: 'L + M', isCorrect: false }, { text: 'L·M', isCorrect: true }, { text: 'L/M', isCorrect: false }, { text: 'L − M', isCorrect: false }] },
    { text: 'Qual o valor de lim(x→2) (x³ − 8)/(x − 2)?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['limites', 'fatoração'], alternatives: [{ text: '8', isCorrect: false }, { text: '12', isCorrect: true, feedback: '(x-2)(x²+2x+4)/(x-2) = x²+2x+4 → 4+4+4 = 12' }, { text: '6', isCorrect: false }, { text: '4', isCorrect: false }] },
    { text: 'A função f(x) = 1/(x−3) tem que tipo de descontinuidade em x=3?', difficulty: 'MEDIUM', bloomLevel: 'ANALYZE', estimatedTime: 2, tags: ['limites', 'continuidade', 'descontinuidade'], alternatives: [{ text: 'Removível', isCorrect: false }, { text: 'Infinita (assíntota vertical)', isCorrect: true }, { text: 'Salto', isCorrect: false }, { text: 'Não tem descontinuidade', isCorrect: false }] },
    { text: 'Qual o valor de lim(x→0) (1 − cos(x))/x?', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 4, tags: ['limites', 'trigonométrico', 'identidade'], alternatives: [{ text: '0', isCorrect: true, feedback: 'Multiplica por (1+cos)/(1+cos): sen²(x)/(x(1+cos)) = (sen(x)/x)·(sen(x)/(1+cos)) → 0' }, { text: '1', isCorrect: false }, { text: '1/2', isCorrect: false }, { text: '−1', isCorrect: false }] },
    { text: 'Qual o valor de lim(x→0) (tg(x))/x?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['limites', 'trigonométrico'], alternatives: [{ text: '0', isCorrect: false }, { text: '1', isCorrect: true, feedback: 'tg(x)/x = sen(x)/(x·cos(x)) → 1/1 = 1' }, { text: '∞', isCorrect: false }, { text: '−1', isCorrect: false }] },
    { text: 'lim(x→−∞) (2x³ − x)/(x³ + 1) = ?', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['limites', 'infinito', 'assíntota'], alternatives: [{ text: '2', isCorrect: true, feedback: 'Divide por x³: (2 − 1/x²)/(1 + 1/x³) → 2' }, { text: '−2', isCorrect: false }, { text: '∞', isCorrect: false }, { text: '0', isCorrect: false }] },
  ],
  'Derivadas': [
    { text: 'Qual a derivada de f(x) = 3x⁵?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['derivadas', 'regra da potência'], examIndex: 0, alternatives: [{ text: '15x⁴', isCorrect: true, feedback: 'Regra da potência: 5×3x⁴ = 15x⁴' }, { text: '5x⁴', isCorrect: false }, { text: '15x⁶', isCorrect: false }, { text: '3x⁴', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = sen(2x)?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['derivadas', 'regra da cadeia', 'trigonométrico'], examIndex: 2, alternatives: [{ text: 'cos(2x)', isCorrect: false }, { text: '2cos(2x)', isCorrect: true, feedback: 'Regra da cadeia: cos(2x) × 2 = 2cos(2x)' }, { text: '-2cos(2x)', isCorrect: false }, { text: '2sen(2x)', isCorrect: false }] },
    { text: 'Se f(x) = x²·ln(x), qual f\'(x)?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['derivadas', 'regra do produto'], alternatives: [{ text: '2x·ln(x) + x', isCorrect: true, feedback: 'Regra do produto: 2x·ln(x) + x²·(1/x) = 2x·ln(x) + x' }, { text: '2x·ln(x)', isCorrect: false }, { text: 'x + ln(x)', isCorrect: false }, { text: '2x + 1/x', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = e^(3x)?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['derivadas', 'exponencial'], alternatives: [{ text: 'e^(3x)', isCorrect: false }, { text: '3e^(3x)', isCorrect: true, feedback: 'Regra da cadeia: e^(3x) × 3 = 3e^(3x)' }, { text: '3e^x', isCorrect: false }, { text: 'e^(3x)·ln(3)', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = (x² + 1)³?', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['derivadas', 'regra da cadeia', 'potência'], alternatives: [{ text: '3(x²+1)²', isCorrect: false }, { text: '6x(x²+1)²', isCorrect: true, feedback: '3(x²+1)² × 2x = 6x(x²+1)²' }, { text: '2x(x²+1)²', isCorrect: false }, { text: '6x(x²+1)³', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = ln(x² + 1)?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['derivadas', 'logaritmo', 'cadeia'], alternatives: [{ text: '1/(x²+1)', isCorrect: false }, { text: '2x/(x²+1)', isCorrect: true }, { text: '2x·ln(x²+1)', isCorrect: false }, { text: 'x/(x²+1)', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = cos(3x)?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['derivadas', 'trigonométrico', 'cadeia'], alternatives: [{ text: 'sen(3x)', isCorrect: false }, { text: '-sen(3x)', isCorrect: false }, { text: '-3sen(3x)', isCorrect: true }, { text: '3sen(3x)', isCorrect: false }] },
    { text: 'Se f(x) = x·e^x, qual f\'(x)?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['derivadas', 'produto', 'exponencial'], alternatives: [{ text: 'e^x', isCorrect: false }, { text: 'x·e^x + e^x', isCorrect: true }, { text: 'x·e^x', isCorrect: false }, { text: 'e^x + 1', isCorrect: false }] },
    { text: 'Qual a derivada de f(x) = tg(x)?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['derivadas', 'trigonométrico'], alternatives: [{ text: 'sec²(x)', isCorrect: true }, { text: 'sen(x)/cos(x)', isCorrect: false }, { text: 'cos²(x)', isCorrect: false }, { text: 'sec(x)·tg(x)', isCorrect: false }] },
    { text: 'A derivada de f(x) = a^x (a>0, a≠1) é:', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['derivadas', 'exponencial'], alternatives: [{ text: 'a^x·ln(a)', isCorrect: true }, { text: 'x·a^(x−1)', isCorrect: false }, { text: 'a^x·log(a)', isCorrect: false }, { text: 'a^x', isCorrect: false }] },
  ],
  'Integrais': [
    { text: 'Qual o valor de ∫ 3x² dx?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['integrais', 'indefinida'], examIndex: 0, alternatives: [{ text: 'x³ + C', isCorrect: true }, { text: '3x³ + C', isCorrect: false }, { text: '6x + C', isCorrect: false }, { text: 'x² + C', isCorrect: false }] },
    { text: 'Qual o valor de ∫₀¹ x² dx?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['integrais', 'definida'], examIndex: 1, alternatives: [{ text: '0', isCorrect: false }, { text: '1/3', isCorrect: true, feedback: '[x³/3]₀¹ = 1/3' }, { text: '1/2', isCorrect: false }, { text: '1', isCorrect: false }] },
    { text: 'Calcule ∫ x·e^x dx', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 5, tags: ['integrais', 'por partes'], alternatives: [{ text: 'e^x + C', isCorrect: false }, { text: 'x·e^x − e^x + C', isCorrect: true, feedback: 'Integração por partes: u=x, dv=e^x dx' }, { text: 'x·e^x + e^x + C', isCorrect: false }, { text: 'e^x(x−1) + C', isCorrect: false }] },
    { text: 'Qual a área entre y = x e y = x² no intervalo [0,1]?', difficulty: 'MEDIUM', bloomLevel: 'ANALYZE', estimatedTime: 4, tags: ['integrais', 'área entre curvas'], alternatives: [{ text: '1/2', isCorrect: false }, { text: '1/6', isCorrect: true, feedback: '∫(x-x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6' }, { text: '1/3', isCorrect: false }, { text: '1/4', isCorrect: false }] },
    { text: '∫ 1/(x·ln(x)) dx ?', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 4, tags: ['integrais', 'substituição'], alternatives: [{ text: 'ln|x| + C', isCorrect: false }, { text: 'ln|ln(x)| + C', isCorrect: true, feedback: 'u = ln(x), du = dx/x' }, { text: '1/ln(x) + C', isCorrect: false }, { text: 'x·ln(x) + C', isCorrect: false }] },
    { text: '∫ (3x² + 2x + 1) dx?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['integrais', 'polinômio'], alternatives: [{ text: 'x³ + x² + x + C', isCorrect: true }, { text: '3x³ + 2x² + x + C', isCorrect: false }, { text: 'x³ + x² + C', isCorrect: false }, { text: '6x + 2 + C', isCorrect: false }] },
    { text: '∫₀^π sen(x) dx = ?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['integrais', 'trigonométrico', 'definida'], alternatives: [{ text: '0', isCorrect: false }, { text: '1', isCorrect: false }, { text: '2', isCorrect: true }, { text: 'π', isCorrect: false }] },
    { text: 'Qual o volume do sólido gerado pela rotação de y = √x em [0,4] em torno do eixo x?', difficulty: 'HARD', bloomLevel: 'APPLY', estimatedTime: 5, tags: ['integrais', 'volume', 'rotação'], alternatives: [{ text: '4π', isCorrect: false }, { text: '8π', isCorrect: true, feedback: 'V = π∫(√x)²dx = π∫xdx = π[x²/2]₀⁴ = 8π' }, { text: '16π', isCorrect: false }, { text: '2π', isCorrect: false }] },
    { text: '∫ cos(3x) dx = ?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['integrais', 'trigonométrico', 'substituição'], alternatives: [{ text: 'sen(3x) + C', isCorrect: false }, { text: '(1/3)sen(3x) + C', isCorrect: true }, { text: '3sen(3x) + C', isCorrect: false }, { text: '-sen(3x) + C', isCorrect: false }] },
  ],

  // === RESISTÊNCIA DOS MATERIAIS ===
  'Conceitos Fundamentais': [
    { text: 'Quantas equações de equilíbrio existem no plano?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['equilíbrio', 'estática'], examIndex: 1, alternatives: [{ text: '2', isCorrect: false }, { text: '3', isCorrect: true, feedback: 'ΣFx=0, ΣFy=0, ΣM=0 no plano' }, { text: '4', isCorrect: false }, { text: '6', isCorrect: false }] },
    { text: 'O que é uma estrutura isostática?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['classificação', 'isostática'], examIndex: 2, alternatives: [{ text: 'Número de reações = número de equações de equilíbrio', isCorrect: true }, { text: 'Mais reações que equações', isCorrect: false }, { text: 'Menos reações que equações', isCorrect: false }, { text: 'Não tem reações de apoio', isCorrect: false }] },
    { text: 'Qual tipo de apoio impede translação vertical e horizontal mas permite rotação?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['apoios', 'vínculos'], examIndex: 0, alternatives: [{ text: 'Apoio móvel (1º gênero)', isCorrect: false }, { text: 'Apoio fixo (2º gênero)', isCorrect: true, feedback: 'Apoio fixo: 2 reações (Rx, Ry), permite rotação' }, { text: 'Engaste (3º gênero)', isCorrect: false }, { text: 'Apoio elástico', isCorrect: false }] },
    { text: 'O que é tensão normal média?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['tensão', 'normal'], alternatives: [{ text: 'σ = F·A', isCorrect: false }, { text: 'σ = F/A', isCorrect: true }, { text: 'σ = A/F', isCorrect: false }, { text: 'σ = F²/A', isCorrect: false }] },
    { text: 'Qual a diferença entre tensão normal e tensão cisalhante?', difficulty: 'MEDIUM', bloomLevel: 'UNDERSTAND', estimatedTime: 2, tags: ['tensão', 'cisalhamento', 'normal'], alternatives: [{ text: 'Normal é perpendicular à seção; cisalhante é paralelo', isCorrect: true }, { text: 'Normal é paralela; cisalhante é perpendicular', isCorrect: false }, { text: 'Ambas são iguais', isCorrect: false }, { text: 'Normal age em vigas; cisalhante em pilares', isCorrect: false }] },
    { text: 'O diagrama de corpo livre (DCL) serve para:', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['DCL', 'equilíbrio'], alternatives: [{ text: 'Calcular deformações', isCorrect: false }, { text: 'Identificar todas as forças atuantes no corpo', isCorrect: true }, { text: 'Traçar o diagrama de momento', isCorrect: false }, { text: 'Calcular a tensão máxima', isCorrect: false }] },
  ],
  'Tensão e Deformação': [
    { text: 'Qual a unidade de tensão no SI?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['tensão', 'unidades'], examIndex: 1, alternatives: [{ text: 'N', isCorrect: false }, { text: 'Pa (Pascal)', isCorrect: true }, { text: 'kg/m³', isCorrect: false }, { text: 'J', isCorrect: false }] },
    { text: 'Uma barra de aço (E = 200 GPa) de 2 m de comprimento e seção 5 cm² é submetida a 50 kN. Qual a deformação longitudinal?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 5, tags: ['tensão', 'deformação', 'Lei de Hooke'], examIndex: 2, alternatives: [{ text: '0,5 mm', isCorrect: false }, { text: '1,0 mm', isCorrect: true, feedback: 'σ = F/A = 50kN/5cm² = 100 MPa. ε = σ/E = 100/200000 = 0,0005. ΔL = ε·L = 0,0005·2000mm = 1,0mm' }, { text: '2,0 mm', isCorrect: false }, { text: '0,25 mm', isCorrect: false }] },
    { text: 'O que representa o módulo de elasticidade (E)?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['módulo de elasticidade', 'Lei de Hooke'], examIndex: 3, alternatives: [{ text: 'A resistência máxima do material', isCorrect: false }, { text: 'A relação entre tensão e deformação no regime elástico', isCorrect: true }, { text: 'A deformação na ruptura', isCorrect: false }, { text: 'O peso específico do material', isCorrect: false }] },
    { text: 'O coeficiente de Poisson (ν) é a razão entre:', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['Poisson', 'deformação transversal'], alternatives: [{ text: 'Tensão e deformação', isCorrect: false }, { text: 'Deformação transversal e deformação longitudinal', isCorrect: true }, { text: 'Força e área', isCorrect: false }, { text: 'Tensão normal e tensão cisalhante', isCorrect: false }] },
  ],
  'Flexão': [
    { text: 'Em uma viga biapoiada com carga uniformemente distribuída q, onde ocorre o momento fletor máximo?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['flexão', 'viga', 'diagrama'], examIndex: 2, alternatives: [{ text: 'Nos apoios', isCorrect: false }, { text: 'No centro do vão', isCorrect: true, feedback: 'Mmax = qL²/8 no centro' }, { text: 'A 1/4 do vão', isCorrect: false }, { text: 'A 1/3 do vão', isCorrect: false }] },
    { text: 'A fórmula da flexão σ = M·c/I é válida sob qual condição?', difficulty: 'HARD', bloomLevel: 'ANALYZE', estimatedTime: 3, tags: ['flexão', 'tensão normal'], examIndex: 4, alternatives: [{ text: 'Material elástico não linear', isCorrect: false }, { text: 'Material elástico linear no regime de Hooke', isCorrect: true }, { text: 'Para qualquer tipo de carregamento', isCorrect: false }, { text: 'Apenas para seções retangulares', isCorrect: false }] },
    { text: 'O momento de inércia de uma seção retangular de base b e altura h é:', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['momento de inércia', 'geometria'], examIndex: 1, alternatives: [{ text: 'bh³/12', isCorrect: true }, { text: 'bh²/6', isCorrect: false }, { text: 'b³h/12', isCorrect: false }, { text: 'bh³/3', isCorrect: false }] },
    { text: 'Uma viga engastada de 3m recebe carga concentrada P=10kN na extremidade livre. Qual o momento fletor no engaste?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['flexão', 'viga engastada'], alternatives: [{ text: '10 kN·m', isCorrect: false }, { text: '30 kN·m', isCorrect: true, feedback: 'M = P·L = 10·3 = 30 kN·m' }, { text: '15 kN·m', isCorrect: false }, { text: '45 kN·m', isCorrect: false }] },
  ],

  // === CONCRETO ARMADO ===
  'Propriedades dos Materiais': [
    { text: 'Qual a resistência característica do concreto mais comum em edifícios (fck)?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['concreto', 'fck', 'resistência'], examIndex: 2, alternatives: [{ text: '15 MPa', isCorrect: false }, { text: '20 MPa', isCorrect: false }, { text: '25 MPa', isCorrect: true, feedback: 'C25 é o mais comum' }, { text: '30 MPa', isCorrect: false }] },
    { text: 'Qual o módulo de elasticidade do aço CA-50?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['aço', 'CA-50', 'elasticidade'], examIndex: 3, alternatives: [{ text: '100 GPa', isCorrect: false }, { text: '200 GPa', isCorrect: true }, { text: '210 MPa', isCorrect: false }, { text: '25 GPa', isCorrect: false }] },
    { text: 'O que é o cobrimento nominal?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['cobrimento', 'durabilidade'], alternatives: [{ text: 'A distância da face da peça ao centro da armadura', isCorrect: false }, { text: 'A distância da face da peça até a armadura mais externa', isCorrect: true }, { text: 'A espessura total do concreto', isCorrect: false }, { text: 'A bitola do maior agregado', isCorrect: false }] },
  ],
  'Dimensionamento à Flexão': [
    { text: 'No dimensionamento de vigas de concreto armado, o que é a linha neutra?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['flexão', 'linha neutra', 'dimensionamento'], examIndex: 0, alternatives: [{ text: 'O eixo de simetria da viga', isCorrect: false }, { text: 'A linha que separa a zona tracionada da comprimida', isCorrect: true }, { text: 'A armadura longitudinal', isCorrect: false }, { text: 'O centro de gravidade da seção', isCorrect: false }] },
    { text: 'Em uma seção sub-armada, qual o tipo de ruptura esperado?', difficulty: 'HARD', bloomLevel: 'ANALYZE', estimatedTime: 3, tags: ['flexão', 'ruptura', 'sub-armada'], alternatives: [{ text: 'Ruptura frágil por compressão do concreto', isCorrect: false }, { text: 'Ruptura dúctil com escoamento do aço primeiro', isCorrect: true, feedback: 'Aço escoa antes do concreto romper → ruptura avisada' }, { text: 'Ruptura simultânea aço-concreto', isCorrect: false }, { text: 'Não há ruptura', isCorrect: false }] },
  ],

  // === GEOTECNIA ===
  'Propriedades dos Solos': [
    { text: 'Qual índice físico representa a relação entre volume de vazios e volume total?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['solos', 'porosidade', 'índices'], examIndex: 3, alternatives: [{ text: 'Porosidade (n)', isCorrect: true }, { text: 'Índice de vazios (e)', isCorrect: false }, { text: 'Grau de saturação (S)', isCorrect: false }, { text: 'Teor de umidade (w)', isCorrect: false }] },
    { text: 'O que é o índice de vazios (e)?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['solos', 'índice de vazios'], alternatives: [{ text: 'Vv/Vt', isCorrect: false }, { text: 'Vv/Vs', isCorrect: true }, { text: 'Vs/Vt', isCorrect: false }, { text: 'Vv/Va', isCorrect: false }] },
    { text: 'A Lei de Darcy é expressa por:', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['permeabilidade', 'Darcy', 'fluxo'], examIndex: 2, alternatives: [{ text: 'q = k·i·A', isCorrect: true }, { text: 'q = k·h·A', isCorrect: false }, { text: 'v = k·i', isCorrect: false }, { text: 'Q = k·A/h', isCorrect: false }] },
    { text: 'Solos com mais de 50% de partículas passando na peneira #200 são classificados como:', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['granulometria', 'classificação'], alternatives: [{ text: 'Solos granulares', isCorrect: false }, { text: 'Solos finos', isCorrect: true }, { text: 'Solos orgânicos', isCorrect: false }, { text: 'Pedregulhos', isCorrect: false }] },
  ],

  // === FENÔMENOS DOS TRANSPORTES ===
  'Hidrostática': [
    { text: 'Qual a pressão a 10 m de profundidade em água? (ρ = 1000 kg/m³, g = 10 m/s²)', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['hidrostática', 'pressão'], examIndex: 2, alternatives: [{ text: '10 kPa', isCorrect: false }, { text: '50 kPa', isCorrect: false }, { text: '100 kPa', isCorrect: true, feedback: 'p = ρgh = 1000·10·10 = 100.000 Pa = 100 kPa' }, { text: '200 kPa', isCorrect: false }] },
    { text: 'O princípio de Pascal afirma que:', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['Pascal', 'pressão'], alternatives: [{ text: 'A pressão diminui com a profundidade', isCorrect: false }, { text: 'A pressão se transmite integralmente a todos os pontos do fluido', isCorrect: true }, { text: 'A vazão é constante em qualquer seção', isCorrect: false }, { text: 'A energia se conserva no escoamento', isCorrect: false }] },
    { text: 'Qual a equação manométrica para cálculo de pressão?', difficulty: 'MEDIUM', bloomLevel: 'APPLY', estimatedTime: 3, tags: ['manometria', 'pressão'], alternatives: [{ text: 'p = ρgh', isCorrect: true }, { text: 'p = F/A', isCorrect: false }, { text: 'p = m·g', isCorrect: false }, { text: 'p = ρ·g', isCorrect: false }] },
  ],

  // === ANÁLISE ESTRUTURAL ===
  'Vigas e Pórticos Isostáticos': [
    { text: 'Para viga biapoiada de vão L com carga concentrada P no centro, qual a reação em cada apoio?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['reações', 'viga biapoiada'], examIndex: 2, alternatives: [{ text: 'P/4', isCorrect: false }, { text: 'P/2', isCorrect: true }, { text: 'P', isCorrect: false }, { text: 'Depende da seção', isCorrect: false }] },
    { text: 'Qual o método mais adequado para análise de treliças planas?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['treliças', 'método dos nós'], examIndex: 0, alternatives: [{ text: 'Método dos Nós', isCorrect: true }, { text: 'Método das Forças', isCorrect: false }, { text: 'Método dos Deslocamentos', isCorrect: false }, { text: 'Método de Cross', isCorrect: false }] },
    { text: 'Em um pórtico isostático, quantas incógnitas existem em um engaste?', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['pórticos', 'engaste', 'reações'], alternatives: [{ text: '1', isCorrect: false }, { text: '2', isCorrect: false }, { text: '3', isCorrect: true, feedback: 'Engaste: 2 forças + 1 momento = 3 reações' }, { text: '4', isCorrect: false }] },
  ],

  // === FÍSICA ===
  'Cinemática': [
    { text: 'Qual a equação horária do MRU?', difficulty: 'EASY', bloomLevel: 'REMEMBER', estimatedTime: 1, tags: ['MRU', 'cinemática'], examIndex: 0, alternatives: [{ text: 'S = S₀ + vt', isCorrect: true }, { text: 'S = S₀ + at²/2', isCorrect: false }, { text: 'v² = v₀² + 2aΔS', isCorrect: false }, { text: 'S = S₀ + v₀t + at²/2', isCorrect: false }] },
    { text: 'Um carro acelera de 0 a 108 km/h em 10s. Qual a aceleração média?', difficulty: 'EASY', bloomLevel: 'APPLY', estimatedTime: 2, tags: ['MUV', 'aceleração'], alternatives: [{ text: '1 m/s²', isCorrect: false }, { text: '3 m/s²', isCorrect: true, feedback: '108 km/h = 30 m/s. a = 30/10 = 3 m/s²' }, { text: '5 m/s²', isCorrect: false }, { text: '10 m/s²', isCorrect: false }] },
    { text: 'No movimento circular uniforme, a aceleração centrípeta é dada por:', difficulty: 'MEDIUM', bloomLevel: 'REMEMBER', estimatedTime: 2, tags: ['MCU', 'aceleração centrípeta'], examIndex: 1, alternatives: [{ text: 'v²/r', isCorrect: true }, { text: 'v·r', isCorrect: false }, { text: 'v/r', isCorrect: false }, { text: 'r/v²', isCorrect: false }] },
  ],
}

// Organize by topic for easy seeding
export const questionsByTopic: Record<string, { topicName: string; subjectName: string }> = {
  'Limites': { topicName: 'Limites', subjectName: 'Cálculo Diferencial e Integral I' },
  'Derivadas': { topicName: 'Derivadas', subjectName: 'Cálculo Diferencial e Integral I' },
  'Integrais': { topicName: 'Integrais', subjectName: 'Cálculo Diferencial e Integral I' },
  'Conceitos Fundamentais': { topicName: 'Conceitos Fundamentais', subjectName: 'Resistência dos Materiais' },
  'Tensão e Deformação': { topicName: 'Tensão e Deformação', subjectName: 'Resistência dos Materiais' },
  'Flexão': { topicName: 'Flexão', subjectName: 'Resistência dos Materiais' },
  'Propriedades dos Materiais': { topicName: 'Propriedades dos Materiais', subjectName: 'Concreto Armado' },
  'Dimensionamento à Flexão': { topicName: 'Dimensionamento à Flexão', subjectName: 'Concreto Armado' },
  'Propriedades dos Solos': { topicName: 'Propriedades dos Solos', subjectName: 'Geotecnia' },
  'Hidrostática': { topicName: 'Hidrostática', subjectName: 'Fenômenos dos Transportes' },
  'Vigas e Pórticos Isostáticos': { topicName: 'Vigas e Pórticos Isostáticos', subjectName: 'Análise Estrutural' },
  'Cinemática': { topicName: 'Cinemática', subjectName: 'Física Geral' },
}
