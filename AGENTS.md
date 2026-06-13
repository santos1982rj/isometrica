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
| TanStack Query | ^5.101.0 | Data fetching |
| Clerk | latest | Autenticação |
| Zod | latest | Validação |
| Docker | latest | Containerização |
| Render | — | Host NestJS API |
| Vercel | — | Host Next.js Frontend |
| Cloudflare | — | DNS + Proxy |
| Neon | — | PostgreSQL gerenciado |
| GitHub Actions | — | CI/CD |

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
- `packages/`: **contracts** (tipos compartilhados) e **ui** (cn, tokens) — únicos com runtime real
- Pacotes mortos deletados: domain, config, ai, analytics, notifications (stubs vazios)

### Banco
- PostgreSQL único para MVP (Neon gerenciado)
- Réplica separada para BI (Metabase) quando escalar
- PgVector para buscas semânticas da IA (futuro)

### Deploy — Arquitetura em Produção
```
isometrica.eng.br → Cloudflare (DNS + proxy) → Vercel (Next.js) → proxy /api/* → Render (NestJS) → Neon (PostgreSQL)
```

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

## Mudanças Realizadas — Todas as Sessões

---

### Sessão 1 — Fundação (Fases 0–6)

#### Fase 0 — Hotfixes (4 bugs críticos corrigidos)
1. **Gamificação nunca funcionou**: handler em `gamification.handler.ts` escutava `QUESTION_ANSWERED`, mas o `LearningService` nunca emitia esse evento — emitia `QUESTION_CORRECT`/`QUESTION_INCORRECT`. Handler migrado.
2. **esqueceuSenha type errado**: `api.ts` declarava `reset_token?` na resposta — API não retorna mais token. Tipo simplificado.
3. **Cursos sem `@Public()`**: `CoursesController`, `ContentController`, `KnowledgeController` sem decorator — retornavam 401. Adicionado `@Public()` nos endpoints GET e search.
4. **Scrollbar quebrada**: `hsl(var(--border))` inválido em `globals.css` — corrigido para `var(--border)`.

#### Fase 1 — Fundação (Packages Compartilhados)
- **`@isometrica/contracts`**: 20+ tipos compartilhados (Usuario, Curso, Questao, etc.)
- **`@isometrica/domain`**: Zod schemas (SignupSchema, LoginSchema, SubmitAttemptSchema, etc.)
- **`@isometrica/ui`**: `cn()` utility, constantes de cores e breakpoints
- **`@isometrica/config`**: Constantes de app, rotas de API, paginação
- Frontend `types.ts` re-exporta de `@isometrica/contracts`
- Frontend `utils.ts` re-exporta de `@isometrica/ui`
- APIs e Web dependem dos 4 packages como `workspace:*`

#### Fase 2 — Design Refinamento
1. **`tokens.css`**: Tokens separados do globals.css — tema inline, `:root`, `.dark`, tipografia
2. **26 emojis substituídos** em 5 arquivos (`gamificacao`, `banco-questoes`, `cursos/[id]`, `dashboard`, `erros`) por lucide-react

#### Fase 3 — Refatoração Backend
1. **Global Exception Filter**: `AllExceptionsFilter` — padroniza erros com `{ statusCode, message, timestamp }`
2. **DTOs com class-validator**: Criados para Courses (create/update/module/lesson), Learning (enroll/progress/attempt), Knowledge (subject/topic), Questions (create), Profile (update)
3. **N+1 fixes**: `learning.service.ts` (`getNextLessons` — batching), `analytics.service.ts` (`getProfessorAnalytics` + `getCourseStudents` — batch + groupBy)

#### Fase 4 — Frontend
- **TanStack React Query**: Instalado, `QueryProvider` criado, configurado no layout raiz

#### Fase 5 — Testes
- **API**: 16 testes passando (2 spec files)
- **Frontend**: Vitest + Testing Library configurados, 3 testes do Button passando
- **Cobertura total**: `pnpm test` no root executa ambos os apps

#### Fase 6 — Novas Features
1. **Compartilhar Certificado no LinkedIn**: Botão em `/certificados` com `Share2` → LinkedIn share intent
2. **Ritual de Streak (Narrativa)**: Card no `/gamificacao` com mensagens progressivas (0 → 60+ dias)
3. **Modo Concurso**: Página `/concurso` com lista de simulados mock + KPIs; sidebar atualizada

---

### Sessão 2 — Segurança & Infraestrutura (09/06/2026)

#### CI/CD
- **GitHub Actions** (`.github/workflows/ci.yml`): executa `pnpm install`, TypeScript check, Prisma validate, build, test em todo PR/push na `main`

#### Docker
- **Dockerfile web**: multi-stage com Next.js standalone output (`node:22-alpine`), expõe porta 3000
- **Dockerfile api**: multi-stage com NestJS build, expõe porta 4000
- **docker-compose.yml**: Postgres 17 + Redis 7 + API com healthchecks, rede interna
- **`.dockerignore`** em ambos os apps
- **`.env.example`** com todas as variáveis documentadas

#### Segurança
- **CORS**: função customizada com allowlist de origens conhecidas + callback de validação de origin
- **Validação de ambiente**: `validateEnv()` no bootstrap checa `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `CLERK_SECRET_KEY` — app falha rápido se faltar
- **JWT**: segredo forte com 64 hex chars
- **SanitizePipe**: sanitização XSS com `sanitize-html` em todas as entradas de texto
- **Índices Prisma**: 37 índices em todas as FKs (migration `20260609223541_add_indexes`)
- **Rate limiting**: `ThrottlerModule` global configurado para 60 requisições/minuto
- **Cache headers**: `CacheHeaderInterceptor` global adiciona `Cache-Control` em todas as respostas GET

#### API Docs
- **Swagger/OpenAPI** disponível em `/api/docs` com metadata completa, tags por módulo

#### Git Hooks
- **Husky**: pre-commit hook roda lint-staged nos arquivos staged

#### Frontend — Resiliência
- **Middleware Next.js**: proteção de rotas (redireciona para `/` se não autenticado), `/api/*` público
- **Error boundaries**: componente global `ErrorBoundary` + loading states com skeleton

#### SEO
- **OG tags**: metadata dinâmica em todas as páginas
- **`sitemap.ts`**: geração automática de sitemap
- **`robots.ts`**: configuração de robots.txt

---

### Sessão 3 — Auth & Eventos (09/06/2026)

#### Autenticação
- **Cookie httpOnly**: `Set-Cookie` com `httpOnly`, `secure`, `sameSite:none`(produção)/`lax`(desenvolvimento), `credentials:include`
- **JwtStrategy**: extrai token de cookie (`jwt`) ou header `Bearer` — ambas as fontes funcionam

#### Event Handlers
- **`AiEventHandler`**: persiste recomendações no banco ao escutar `QUESTION_INCORRECT` e `ENROLLMENT_CREATED`
- **`AnalyticsEventHandler`**: `trackEvent()` tratando 18 tipos de eventos diferentes

#### Dashboards Reais
- **Admin**: financeiro (MRR, churn), usuários (total, novos, ativos), cursos ativos
- **Student**: profile, learning progress, analytics de performance

#### Banco
- **Migration `add_missing_event_types`**: adiciona 21 novos `EventType` ao enum

#### Infra Packages (Stubs)
- **`@isometrica/ai`**: estrutura para handlers de IA
- **`@isometrica/analytics`**: estrutura para trackeamento de eventos
- **`@isometrica/notifications`**: estrutura para notificações

#### Testes Expandidos
- **18 novos testes**:
  - `AiEventHandler`: 5 testes (cria recomendação em `QUESTION_INCORRECT` e `ENROLLMENT_CREATED`, não cria em `QUESTION_CORRECT`, etc.)
  - `AnalyticsEventHandler`: 5 testes (trackEvent com diferentes tipos, lida com eventos desconhecidos)
  - `FinancialService`: 8 testes (cálculo de MRR, churn rate, assinaturas ativas, receita por período, etc.)
- **Total: 34 testes API + 3 Frontend = 37 testes**

---

### Sessão 4 — Deploy & Correções Cross-Origin (10/06/2026)

#### Build API
- Corrigido `--tsConfigPath` → `--path` no `build` script (compatibilidade NestJS CLI v11)

#### CORS cross-origin
- `sameSite`: `'none'` em produção (`isometrica.eng.br` → `isometrica-api.onrender.com`)

#### Next.js Proxy
- `rewrites()` em `next.config.ts`: roteia `/api/*` para `API_BACKEND_URL` (Render)
- `api.ts` no frontend: `baseURL` padrão mudado para `/api` (relativo), eliminando hardcode de origem

#### Seed de Produção
- Seed executado no Neon (PostgreSQL gerenciado):
  - 3 usuários (admin, professor, aluno)
  - 9 cursos
  - 103 aulas
  - 74 questões

#### Deploy Vercel — Problema Conhecido
- **Projeto Vercel criado**, domínio `isometrica.eng.br` configurado
- Cloudflare na frente como DNS + proxy
- **Primeiro deploy funcionou** via `turbo build` manual
- **Redeploys falham**: `Root Directory` configurado como `.` em vez de `apps/web`
- **Pendente**: corrigir rootDirectory ou migrar para monorepo setup do Vercel

#### Arquitetura Final (Produção)
```
isometrica.eng.br (Cloudflare)
  └→ Vercel (Next.js — apps/web)
       └→ rewrite /api/* → Render (NestJS — apps/api)
            └→ Neon (PostgreSQL)
                 └→ Redis (gerenciado)
```

---

### Sessão 5 — Refatoração Massiva (10/06/2026)

#### Segurança
- **Fallback JWT removido**: `configService.getOrThrow('JWT_SECRET')` com ≥ 32 chars
- **`localStorage` removido do tutor**: cookie `httpOnly`
- **`env.ts` expandido**: `GROQ_API_KEY`, `REDIS_URL`, `RESEND_API_KEY` required
- **CORS com regex**: qualquer `*.eng.br`
- **⚠️ Credenciais expostas**: senha Neon, GROQ_API_KEY, JWT_SECRET — pendente rotação manual

#### Estrutura
- **5 pacotes mortos deletados**: domain, config, ai, analytics, notifications
- **`LearningService` (324 linhas)** → 4 serviços (enrollment, progress, certificate, attempt)
- **`QuestionsService` (252 linhas)** → 4 serviços (crud, exam, stats, generator)
- **`forwardRef` circular removido** via reordenação de imports
- **25 componentes extraídos** de 5 páginas para `components/{dashboard,aulas,cursos,banco-questoes,gamificacao}/`

#### Type Safety
- **Zero `any` na API e frontend**: DTOs com class-validator, `api.ts` tipado
- **`contracts` expandido**: 15+ interfaces (`Diagnostic`, `WeekPlan`, `ProfileResponse`, `QuestionStats`, `SimuladoResponse`, etc.)
- **Enums Prisma** tipados nos DTOs e services

#### TanStack Query
- **QueryProvider era dead code** → **17 páginas migradas**, ~50 hooks em `@/lib/queries`
- **Auth context**: `useEffect` → `useQuery` com `staleTime: 5min`
- **Mutações com cache automático**: `useEnroll()`, `useSubmitAttempt()`, etc.

#### CI/Quality
- **CI**: `continue-on-error` removido, `turbo typecheck` adicionado
- **`turbo.json`**: task `typecheck`, lint `"cache": false`
- **Dockerfiles**: layer caching, `ARG NEXT_PUBLIC_API_URL`, `HEALTHCHECK`, `pnpm prune --prod`
- **pnpm sincronizado** (`11.5.2`)
- **`.vercelignore`**: exclui `.turbo` (26GB)

#### Deploy
- [isometrica.eng.br](https://isometrica.eng.br) em produção via Vercel
- Deploys automáticos via GitHub (projeto `web`, `turbo build`)

---

## Status Atual — 26 Rotas (Junho 2026)

### ESTUDANTE
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

### PROFESSOR
| Página | O que faz | Status |
|--------|-----------|--------|
| `/professor/dashboard` | Overview com analytics reais (cursos, alunos, acertos) | ✅ |
| `/professor/cursos` | Lista de cursos com gerenciar/excluir | ✅ |
| `/professor/cursos/novo` | Wizard completo: curso → módulos → aulas → config | ✅ |
| `/professor/cursos/[id]` | Gerenciar módulos/aulas/questões (CRUD inline) | ✅ |

### ADMIN
| Página | O que faz | Status |
|--------|-----------|--------|
| `/admin/dashboard` | Overview: plataforma (usuários, receita, cursos ativos) | ✅ |
| `/admin/usuarios` | Gestão de usuários (listar, buscar, mudar papel, remover) | ✅ |
| `/admin/financeiro` | MRR, assinaturas ativas, churn, pagamentos recentes | ✅ |

### PÁGINAS PÚBLICAS
| Página | O que faz | Status |
|--------|-----------|--------|
| `/` | Landing page (hero, features, planos, contato) | ✅ |
| `/u/[id]` | Perfil público compartilhável (certificados, gamificação) | ✅ |
| `/404` | Página não encontrada customizada | ✅ |

---

## Lições do Projeto Anterior

- Projeto anterior em `C:\engenharia-plataforma` era funcional mas sofria de:
  - **Muitos gatilhos em cascata** (cada ação disparava analytics + audit + notificação + fila)
  - **Módulos globais demais** (Prisma, Redis, Analytics, Audit, Notifications todos globais)
  - **Design pesado** — glassmorfismo, muitas variantes, difícil de manter
  - **Eventos acoplados** — sem barramento central
- A correção: event bus único, módulos isolados, design tokenizado enxuto

---

## Resumo de Testes

| Categoria | Quantidade |
|-----------|-----------|
| API (Service specs) | 34 |
| Frontend (Vitest) | 3 |
| **Total** | **37** |

## Pendências Conhecidas

1. **Rotação de credenciais**: senha do Neon, GROQ_API_KEY e JWT_SECRET expostas no git — precisa gerar novos tokens nos dashboards
2. **Vercel rootDirectory**: verificar se deploy automático está funcionando (projeto `web`, `turbo build`)
3. **Render deploy**: confirmar que build automático da API funciona
4. **SSL/HTTPS**: garantir que Cloudflare → Vercel → Render esteja totalmente em HTTPS
5. **Variáveis de ambiente**: replicar `.env.example` nos dashboards de Vercel e Render
6. **Open Design**: MCP server configurado no opencode.json, mas aguardando instalação do daemon (desktop app ou portable)

---

## Sessão 6 — Refatoração Massiva + Laboratório + Open Design (12/06/2026)

### Varredura do Projeto
Identificadas 20+ categorias de falhas e gargalos:
- **Banco**: StudentModel e SimuladoSession sem `@relation` → User; nenhum cascade delete; 5 índices faltando
- **Bugs**: Mission upsert (usava nome como id); Certificate filter (subjectId:undefined retornava TUDO); videoUrl vs contentUrl; middleware dead code
- **Dependências**: Ghost dep `@isometrica/contracts` na API; shadcn em runtime; class-variance-authority não usado; TS versões inconsistentes; packages sem build script
- **Segurança**: SanitizePipe não global; rate limiting sem diferenciação; analytics trackEvent sem @Roles ou DTO
- **Type Safety**: 30 `any` na produção (14 backend + 16 frontend)
- **Performance**: ProfileService com 5 queries sequenciais; N+1 em ContentService.findLesson

### Fase 1 — Correções Críticas
- **Task 1.1**: Prisma schema — adicionados `@relation` em StudentModel e SimuladoSession; `onDelete: Cascade` em 30+ relações filhas; Payment.subscription → SetNull; Certificate.courseId nullable + SetNull; SimuladoAnswer index. Migrações geradas (x2)
- **Task 1.2**: Mission upsert corrigido (compound unique `gamificationProfileId_name`); Certificate filter com operador ternário; `videoUrl` → `contentUrl` padronizado em backend + frontend; Middleware dead code removido; 9 novos testes
- **Task 1.3**: Dependências — removidas ghost deps; adicionado dotenv; shadcn movido para devDeps; TS versões padronizadas (~5.8.0); packages com script `build`
- **Task 1.4**: activity-timeline key fix (`act.title` → `${act.title}-${i}`); API_URL fallback `localhost:3001` → `/api`

### Fase 2 — Segurança
- SanitizePipe global no main.ts
- `@Roles(ADMIN)` + DTO com class-validator no analytics.trackEvent
- Rate limiting: auth endpoints em 10 req/min

### Fase 3 — Type Safety
- 30 `any` eliminados (zero na produção)
- Backend: Prisma types (`QuestionWhereInput`, `ExamWhereInput`)
- Frontend: interfaces em gamificação, concurso, api.ts

### Fase 4 — DRY + Config Centralizada
- Hook `useTutorChat` extraído (tutor page + modal: 250→50 linhas)
- `CONFIG` centralizado em `common/config.ts`: GROQ, JWT, BKT, XP, port, email

### Fase 5 — Performance + Cleanup
- ProfileService: 5 queries em `Promise.all`
- ContentService N+1 eliminado
- COLORS/BREAKPOINTS removidos do package ui

### Fase 6 — Landing Page
- page.tsx: 586 → 18 linhas (10 componentes em `components/landing/`)

### Bugfix — Tutor IA Streaming
- **Causa raiz**: `break` só saía do `for` no streaming loop + `useEffect` sobrescrevia mensagens com TanStack Query cache stale + placeholder perdia match por re-renders
- **Solução final**: Reescrevido `use-tutor-chat.ts` com fetch puro (sem TanStack Query), `useCallback` com deps explícitas, `streamingDone` flag, e `findLastIndex` por role+content vazio

### Laboratório (`laboratorio/`)
- `svg/viga-biapoiada-v1.svg` — primeira versão (DMF para cima)
- `svg/viga-biapoiada.svg` — v2 corrigida (DMF lado tracionado)
- `svg/tipos-apoio.svg` — 3 tipos de apoio com reações
- `aula-tipos-apoio.html` — página de aula completa com exercícios
- `design.pen` — designs no Pencil: cards + tabela + desenhos estruturais + dashboard glass
- Scripts e output (vazios, preparados)

### Open Design (nexu-io/open-design)
- MCP server `open-design-mcp` instalado via pnpm
- Configurado no `opencode.json` como `mcpServers.open-design`
- Aguardando daemon (desktop app ou portable) em `localhost:7456`
- 259+ skills, 142+ design systems disponíveis via MCP

---

### Sessão 7 — Fix Resend MCP / Zod email regex (12/06/2026)

#### Problema
- **GPT 5.5** (e outros JSON Schema validators strictos) rejeitam as tools do Resend MCP
- Erro: `Invalid JSON schema: regex lookaround is not supported. Found at $.properties.email.pattern`
- **Causa raiz**: Zod v4.4.3 (usado pelo `resend-mcp`) define `z.email()` com regex:
  ```
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@(...)$/
  ```
  Os `(?!...)` são **negative lookaheads** — válidos em JavaScript, mas **inválidos em JSON Schema** (ECMA-262 regex não suporta lookaround).

#### Solução
1. **Wrapper permanente** (`~/.config/opencode/scripts/resend-mcp-wrapper.cmd`):
   - Localiza o cache do npx para `resend-mcp`
   - Procura por lookahead no Zod `regexes.js`/`regexes.cjs` — se encontrar, substitui por:
     ```
     /^([A-Za-z0-9_'+\-\.]+)@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
     ```
   - Executa o `resend-mcp` original com os argumentos recebidos
2. **Global `~/.config/opencode/opencode.json`**: comando alterado de `npx -y resend-mcp` para `cmd.exe /c ...resend-mcp-wrapper.cmd`
3. **Patch manual**: caso o wrapper não seja usado (ex: execução direta via `npx`), o patch foi aplicado diretamente em:
   - `zod/v4/core/regexes.js:31` (ESM)
   - `zod/v4/core/regexes.cjs:62` (CJS)

#### Observações
- O patch é refeito automaticamente toda vez que o MCP server inicia (o wrapper detecta lookahead)
- Se o `resend-mcp` for atualizado para uma versão com Zod sem esse bug, o wrapper não faz nada
- O patch está no cache do npx (`_npx/5b00477b7fe701ab/`); se o npx limpar o cache, o wrapper reaplica
- O wrapper está documentado inline (cabeçalho do `.cmd`)
