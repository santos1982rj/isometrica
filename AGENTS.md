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

## Status Atual — 24 Rotas (Junho 2026)

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
