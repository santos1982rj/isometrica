# ISOMÉTRICA — Contexto do Projeto

## Visão Geral

Plataforma inteligente de evolução acadêmica para estudantes de Engenharia, começando por **Engenharia Civil** (todos os períodos). Não é um catálogo de cursos — é um ambiente que **entende a dificuldade do aluno** e propõe melhorias continuamente.

## Diferenciais

- **Mapeamento contínuo de dificuldades** — sem prova diagnóstica formal, a plataforma constrói o perfil do aluno por tentativas de questões, tempo de resposta, matérias evitadas, dúvidas no tutor
- **Tutor IA reativo + proativo** — tira dúvidas E sugere estudos/alerta dificuldades
- **BI + AI trabalhando juntos** — BI mostra padrões coletivos, IA entende o indivíduo
- **Dashboards por papel** — aluno (evolução), professor (turma), admin (retenção/receita)

## Stack Definida

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| pnpm | 11.5.2 | Gerenciador |
| Node.js | 22.14 LTS | Runtime |
| Turborepo | 2.9.16 | Monorepo |
| NestJS | 11.1.24 | Backend |
| Next.js | 16.2.7 | Frontend |
| React | 19.2.7 | UI |
| Prisma | 7.8.0 | ORM |
| PostgreSQL | 17 | Banco principal |
| Redis | 7 | Cache + Event Bus |
| shadcn/ui | latest | Design system |
| Tailwind CSS | v4 | Estilização |
| Clerk | latest | Autenticação |
| Zod | latest | Validação |

## Domínio — Entidades Principais

### Pessoas e Conteúdo
- **User** (Student | Professor | Admin) — perfil, universidade, período
- **Course** — ex: "Resistência dos Materiais", ligado a um Subject
- **Module** — módulo dentro de um curso
- **Lesson** — aula (vídeo/texto), com access_type (free | subscription | premium)
- **Question** — ligada a um Topic, com difficulty, bloom_level, alternativas

### Conhecimento (coração do sistema)
- **Subject** — ex: "Cálculo I", "Resistência dos Materiais"
- **Topic** — tópico atômico de conhecimento (ex: "Derivadas", "Flexão em Vigas")
- **Question** → Topic (cada questão testa um tópico)
- **StudentModel** — proficiência estimada por Topic (0.0 a 1.0)
- **StudentModel** é atualizado por QuestionAttempt e alimenta Tutor IA + BI + Recomendações

### Aprendizado
- **Enrollment** — matrícula em curso
- **LessonProgress** — progresso em aula
- **QuestionAttempt** — cada resposta do aluno (acerto/erro, tempo, hint)
- **Diagnostic** — snapshot do StudentModel num instante

### IA
- **Conversation** — sessão com o tutor
- **Message** — pergunta/resposta
- **Recommendation** — gerada pela IA (reativa ou proativa)
- **TutorAction** — ação proativa do tutor (sugeriu revisão, alertou)

### BI
- **Event** — cada interação vira um evento padronizado (49+ tipos)
- **Dashboard** — visão por papel (aluno, professor, admin)

### Gamificação
- **GamificationProfile** — XP, level, streak
- **Achievement**, **Mission**

### Financeiro
- **Plan**, **Subscription**, **Payment**, **Coupon**, **Purchase**

## Arquitetura — Decisões

### Event Bus (para evitar "gatilhos em cascata")
- **Único barramento de eventos** (Redis pub/sub), não cada módulo com sua fila
- Consumidores desacoplados: AI, BI, Gamificação, Notificações escutam o mesmo barramento
- Fluxo principal (ação do usuário) fica limpo, sem acoplamento

### Monorepo
- Turborepo + pnpm workspaces
- `apps/web` (Next.js) e `apps/api` (NestJS)
- `packages/`: domain, contracts, ui, config, analytics, ai, notifications

### Banco
- PostgreSQL único para MVP
- Réplica separada para BI (Metabase) quando escalar
- PgVector para buscas semânticas da IA (futuro)

## Direção Visual — Isométrica

### Paleta
- **Azul petróleo** (`#1a2e3c`) + **Laranja construção** (`#e85d32`) como assinatura
- Neutros baseados em Radix Colors (12 tons)

### Tokens (CSS Variables)
- Paleta completa de 12 neutros + cores semânticas
- Dark mode com `color-mix()`
- Design tokenizado e consistente

### Estilo
- Clean, cards sólidos, sem glassmorfismo exagerado
- Bento grid (cards assimétricos)
- shadcn/ui como base, customizado com tokens
- Tipografia: Inter (corpo) + DM Sans (display)
- **NUNCA usar emojis na interface** — substituir por ícones de biblioteca (lucide-react, Phosphor, Tabler, etc.)

### Protótipo Criado
- Local: `C:\dev\prototipo-isometrica\dashboard.html`
- Funcionalidades: sidebar colapsável, dark mode, sparkline SVG, donut chart, heatmap, bento grid, timeline de atividade

## Skills Instaladas

- **skill-creator** — em `~/.config/opencode/skills/skill-creator/`, para criar/editar skills

## Mudanças Realizadas (Sessão 09/06/2026)

### Fase 0 — Hotfixes (4 bugs críticos corrigidos)
1. **Gamificação nunca funcionou**: handler em `gamification.handler.ts` escutava `QUESTION_ANSWERED`, mas o `LearningService` nunca emitia esse evento — emitia `QUESTION_CORRECT`/`QUESTION_INCORRECT`. Handler migrado.
2. **esqueceuSenha type errado**: `api.ts` declarava `reset_token?` na resposta — API não retorna mais token. Tipo simplificado.
3. **Cursos sem `@Public()`**: `CoursesController`, `ContentController`, `KnowledgeController` sem decorator — retornavam 401. Adicionado `@Public()` nos endpoints GET e search.
4. **Scrollbar quebrada**: `hsl(var(--border))` inválido em `globals.css` — corrigido para `var(--border)`.

### Fase 1 — Fundação (Packages Compartilhados)
- **`@isometrica/contracts`**: 20+ tipos compartilhados (Usuario, Curso, Questao, etc.)
- **`@isometrica/domain`**: Zod schemas (SignupSchema, LoginSchema, SubmitAttemptSchema, etc.)
- **`@isometrica/ui`**: `cn()` utility, constantes de cores e breakpoints
- **`@isometrica/config`**: Constantes de app, rotas de API, paginação
- Frontend `types.ts` agora re-exporta de `@isometrica/contracts`
- Frontend `utils.ts` agora re-exporta de `@isometrica/ui`
- APIs e Web dependem dos 4 packages como `workspace:*`

### Fase 2 — Design Refinamento
1. **`tokens.css`**: Tokens separados do globals.css — tema inline, :root, .dark, tipografia
2. **26 emojis substituídos** em 5 arquivos (`gamificacao`, `banco-questoes`, `cursos/[id]`, `dashboard`, `erros`) por lucide-react

### Fase 3 — Refatoração Backend
1. **Global Exception Filter**: `AllExceptionsFilter` — padroniza erros com `{ statusCode, message, timestamp }`
2. **DTOs com class-validator**: Criados para Courses (create/update/module/lesson), Learning (enroll/progress/attempt), Knowledge (subject/topic), Questions (create), Profile (update)
3. **N+1 fixes**: `learning.service.ts` (`getNextLessons` — batching), `analytics.service.ts` (`getProfessorAnalytics` + `getCourseStudents` — batch + groupBy)

### Fase 4 — Frontend
- **TanStack React Query**: Instalado, `QueryProvider` criado, configurado no layout raiz

### Fase 5 — Testes
- **API**: 16 testes passando (2 spec files)
- **Frontend**: Vitest + Testing Library configurados, 3 testes do Button passando
- **Cobertura total**: `pnpm test` no root executa ambos os apps

### Fase 6 — Novas Features
1. **Compartilhar Certificado no LinkedIn**: Botão em `/certificados` com `Share2` → LinkedIn share intent
2. **Ritual de Streak (Narrativa)**: Card no `/gamificacao` com mensagens progressivas (0 → 60+ dias)
3. **Modo Concurso**: Página `/concurso` com lista de simulados mock + KPIs; sidebar atualizada

## Status Atual — 26 Rotas (Junho 2026)

### 🎓 ESTUDANTE
| Página | O que faz | Status |
|--------|-----------|--------|
| `/dashboard` | KPIs, continuar estudos, proficiência, atividade, heatmap | ✅ |
| `/cursos` | Catálogo com cards + gradiente dinâmico | ✅ |
| `/cursos/[id]` | Landing page com hero dinâmico, badges, ementa, professor, matrícula/compra | ✅ |
| `/aulas/[id]` | Player vídeo embed, quiz, anotações (auto-save), materiais, professor, degustação | ✅ |
| `/gamificacao` | XP, level, streak, conquistas, ranking | ✅ |
| `/tutor` | Chat com Tutor IA (OpenAI streaming) | ✅ |
| `/progresso` | Proficiência por tópico, donut, diagnósticos | ✅ |
| `/certificados` | Certificados emitidos (só cursos com certificateEnabled) | ✅ |
| `/assinatura` | Planos Gratuito vs Premium com assinatura | ✅ |
| `/erros` | Feed de Erros com refazer questões | ✅ |
| `/perfil` | Perfil com XP, streak, certificados, cursos em andamento | ✅ |
| `/perfil/editar` | Editar perfil (nome, bio, universidade, período) | ✅ |
| `/banco-questoes` | Banco de Questões com árvore, filtros, estatísticas, modo domínio | ✅ |
| `/concurso` | Modo Concurso/Vestibular com simulados cronometrados | ✅ |

### 👨‍🏫 PROFESSOR
| Página | O que faz | Status |
|--------|-----------|--------|
| `/professor/dashboard` | Overview com analytics reais (cursos, alunos, acertos) | ✅ |
| `/professor/cursos` | Lista de cursos com gerenciar/excluir | ✅ |
| `/professor/cursos/novo` | **Wizard completo**: curso → módulos → aulas → config | ✅ |
| `/professor/cursos/[id]` | Gerenciar módulos/aulas/questões (CRUD inline) | ✅ |

### 🔧 ADMIN
| Página | O que faz | Status |
|--------|-----------|--------|
| `/admin/dashboard` | Overview: plataforma (usuários, receita, cursos ativos) | ✅ |
| `/admin/usuarios` | Gestão de usuários (listar, buscar, mudar papel, remover) | ✅ |
| `/admin/financeiro` | MRR, assinaturas ativas, churn, pagamentos recentes | ✅ |

### 🌐 Páginas Públicas
| Página | O que faz | Status |
|--------|-----------|--------|
| `/` | Landing page (hero, features, planos, contato) | ✅ |
| `/u/[id]` | Perfil público compartilhável (certificados, gamificação) | ✅ |
| `/404` | Página não encontrada customizada | ✅ |

## Lições do Projeto Anterior

- Projeto anterior em `C:\engenharia-plataforma` era funcional mas sofria de:
  - **Muitos gatilhos em cascata** (cada ação disparava analytics + audit + notificação + fila)
  - **Módulos globais demais** (Prisma, Redis, Analytics, Audit, Notifications todos globais)
  - **Design pesado** — glassmorfismo, muitas variantes, difícil de manter
  - **Eventos acoplados** — sem barramento central
- A correção: event bus único, módulos isolados, design tokenizado enxuto
