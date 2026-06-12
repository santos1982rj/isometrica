# Refatoração Geral 2026 — Plano de Implementação

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir falhas críticas, bugs, gaps de segurança, type safety, e gargalos de manutenção identificados na varredura do projeto.

**Architecture:** Monorepo Turborepo com apps/api (NestJS) + apps/web (Next.js) + packages/{contracts,ui}. Correções são focadas em cada app independentemente.

**Tech Stack:** NestJS 11, Next.js 16, React 19, Prisma 7, PostgreSQL 17, Redis 7, TanStack Query 5

---

## Fase 1: Correções Críticas — Banco + Dependências

### Task 1.1: Fix Prisma Schema — Relations + Cascade Deletes

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

**Context:** `StudentModel` e `SimuladoSession` têm `userId` como String solta sem `@relation` para User. Nenhum modelo filho tem `onDelete: Cascade`. Missing indexes em Course, Question, LessonProgress, SimuladoSession.

**Changes:**
1. Add `@relation` to `StudentModel.userId` → `User`
2. Add `@relation` to `SimuladoSession.userId` → `User` (nome: `user`)
3. Add `onDelete: Cascade` nas relations filhas (Enrollment, LessonProgress, QuestionAttempt, etc.)
4. Add indexes: `Course.@@index([category])`, `Question.@@index([status])`, `Question.@@index([difficulty])`, `LessonProgress.@@index([userId, completed])`, `SimuladoSession.@@index([status])`
5. Run `pnpm --filter @isometrica/api exec prisma migrate dev --name fix_relations_cascades` to generate migration

**Verification:** `pnpm --filter @isometrica/api exec prisma validate`

### Task 1.2: Fix 4 Backend Bugs

**Files:**
- Modify: `apps/api/src/gamification/gamification.service.ts:126-136`
- Modify: `apps/api/src/questions/services/exam.service.ts:95-104`
- Modify: `apps/api/src/learning/services/certificate.service.ts:28`
- Modify: `apps/api/src/courses/content.service.ts:33`

**Bug 1 — gamification.service.ts:**
`updateMission` usa `where: { id: missionName }` mas `id` é cuid. Mudar para usar `where: { userId_type: { userId, type: missionName } }` ou campo apropriado. Se não existir unique constraint no nome da missão, adicionar no schema.

**Bug 2 — exam.service.ts deleteExam:**
Adicionar `onDelete: Cascade` na relação `SimuladoSession.exam` no schema, ou limpar sessions antes de deletar o exam.

**Bug 3 — certificate.service.ts:28:**
Trocar `subjectId: undefined` por `subjectId: null` + `is: null` OU pular o filtro se `subjectId` for null. O undefined no Prisma v7 faz match em TODOS os registros.

**Bug 4 — content.service.ts:33:**
Unificar `videoUrl` / `contentUrl`. Escolher um nome (ex: `contentUrl`), criar mapping consistente.

### Task 1.3: Fix Dependencies

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/web/package.json`
- Modify: `packages/contracts/package.json`
- Modify: `packages/ui/package.json`

**Changes:**
1. Remove `"@isometrica/contracts": "workspace:*"` de `apps/api/package.json`
2. Remove `"@prisma/adapter-pg"`, `"pg"`, `"@types/pg"` de `apps/api/package.json`
3. Add `"dotenv"` a `apps/api/package.json`
4. Move `"shadcn"` de `dependencies` para `devDependencies` em `apps/web/package.json`
5. Remove `"class-variance-authority"` de `apps/web/package.json` (não usado)
6. Add `"build": "tsc"` (ou `"build": ""`) aos scripts de `packages/contracts/package.json` e `packages/ui/package.json`
7. Fix TS version em `apps/web/package.json`: `"typescript": "~5.8.0"`

### Task 1.4: Fix Middleware + Activity Timeline Key + API_URL

**Files:**
- Modify: `apps/web/src/middleware.ts`
- Modify: `apps/web/src/components/dashboard/activity-timeline.tsx:50`
- Modify: `apps/web/src/app/(dashboard)/layout.tsx:104`

**Changes:**
1. middleware.ts: Remover blocos de re-checagem de rotas públicas após early return (linhas 20-24)
2. activity-timeline.tsx: Trocar `act.title` como key para `act.id` ou index composto
3. layout.tsx: Trocar fallback de `'http://localhost:3001/api'` para `'/api'`

---

## Fase 2: Segurança

### Task 2.1: SanitizePipe Global + Auth Fixes

**Files:**
- Modify: `apps/api/src/main.ts`
- Modify: `apps/api/src/common/pipes/sanitize.pipe.ts`
- Modify: `apps/api/src/analytics/analytics.controller.ts`
- Modify: `apps/api/src/courses/content.service.ts`

**Changes:**
1. Aplicar `SanitizePipe` globalmente em `main.ts` via `app.useGlobalPipes(new SanitizePipe())`
2. Adicionar `@Roles(Role.Admin)` ou `@UseGuards(RolesGuard)` em `analytics.controller.ts:trackEvent`
3. Adicionar verificação de autorização em `ContentService.createLesson` para `free = true` (só admin/professor)
4. Adicionar `@UsePipes(ValidationPipe)` em `QuestionsController.importQuestions`

### Task 2.2: Rate Limiting + Password Reset

**Files:**
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/auth/auth.controller.ts`

**Changes:**
1. Configurar rate limiting diferenciado: login 10 req/min, demais endpoints 60 req/min
2. Adicionar rate limiting no `esqueceu-senha` endpoint

---

## Fase 3: Type Safety — Eliminar `any`

### Task 3.1: Backend `any` Removal

**Files:**
- Modify: `apps/api/src/common/pipes/sanitize.pipe.ts:35` — `value: any` → `value: unknown`
- Modify: `apps/api/src/common/interceptors/cache-header.interceptor.ts:7` — `Observable<any>` → tipar corretamente
- Modify: `apps/api/src/auth/guards/jwt-auth.guard.ts:23` — tipar `err` e `user`
- Modify: `apps/api/src/questions/services/question-crud.service.ts:15,36,88` — tipar `where`, `orderBy`, `data`
- Modify: `apps/api/src/questions/services/exam.service.ts:16,75` — tipar `where`, remover `as any`
- Modify: `apps/api/src/questions/services/question-generator.service.ts:51` — tipar `a`
- Modify: `apps/api/src/questions/questions.service.ts:17,19,20,24` — remover `as any`
- Modify: `apps/api/src/learning/services/progress.service.ts:99` — tipar `m`
- Modify: `apps/api/src/analytics/analytics.service.ts:11` — tipar `metadata`

### Task 3.2: Frontend `any` Removal

**Files:**
- Modify: `apps/web/src/lib/api.ts:201-214` — tipar request helper
- Modify: `apps/web/src/lib/queries.ts:383` — tipar `useUpdateExam`
- Modify: `apps/web/src/app/(dashboard)/layout.tsx:90,121,130,200` — tipar states e callbacks
- Modify: `apps/web/src/app/(dashboard)/concurso/page.tsx:114` — tipar `exam`
- Modify: `apps/web/src/app/(dashboard)/concurso/[examId]/prova/[sessionId]/page.tsx:18,24,211` — tipar states
- Modify: `apps/web/src/app/(dashboard)/concurso/[examId]/resultado/[sessionId]/page.tsx:37,118,148` — tipar params
- Modify: `apps/web/src/app/(dashboard)/professor/concursos/page.tsx:62,140` — tipar `exam`
- Modify: `apps/web/src/components/gamificacao/missions-list.tsx:12, achievements-grid.tsx:12, ranking-list.tsx:12, xp-timeline.tsx:13` — tipar props com interfaces de contracts

---

## Fase 4: DRY + Config Centralizada

### Task 4.1: Extrair Hook de Chat do Tutor

**Files:**
- Create: `apps/web/src/hooks/use-tutor-chat.ts`
- Modify: `apps/web/src/app/(dashboard)/tutor/page.tsx`
- Modify: `apps/web/src/components/tutor/tutor-modal.tsx`

**Changes:**
Extrair ~150 linhas de lógica duplicada (streaming, estado, mensagens) para hook `useTutorChat`:
- `useTutorChat()` retorna: `{ mensagens, input, setInput, enviar, enviando, streamContent, carregando, conversaId }`
- Ambos os componentes usam o hook em vez de duplicar a lógica

### Task 4.2: Centralizar Config (GROQ + Hardcoded Values)

**Files:**
- Create: `apps/api/src/common/config.ts`
- Modify: `apps/api/src/ai/ai.service.ts`
- Modify: `apps/api/src/questions/services/question-generator.service.ts`
- Modify: `apps/api/src/learning/student-model.service.ts`
- Modify: `apps/api/src/gamification/gamification.handler.ts`
- Modify: `apps/api/src/auth/auth.module.ts`
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/src/email/email.service.ts`
- Modify: `apps/api/src/main.ts`

**Changes:**
Criar `common/config.ts` com todos os valores centralizados:
```ts
export const CONFIG = {
  groq: { baseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1', model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile' },
  jwt: { expiration: process.env.JWT_EXPIRATION ?? '7d' },
  bcrypt: { saltRounds: 10 },
  bkt: { prior: 0.5, guess: 0.15, slip: 0.1, learnRate: 0.3, timeBonus: 0.05, hintPenalty: 0.1 },
  xp: { lesson: 50, question: 10 },
  pagination: { maxPerPage: 100 },
  ai: { maxHistoryMessages: 20, maxTokens: 600 },
  port: parseInt(process.env.PORT ?? '3001', 10),
  email: { from: process.env.EMAIL_FROM ?? 'Isométrica <naoresponda@isometrica.eng.br>' },
} as const;
```

---

## Fase 5: Performance + Cleanup

### Task 5.1: Fix N+1 em ContentService

**Files:**
- Modify: `apps/api/src/courses/content.service.ts`

**Changes:**
Em `findLesson`, em vez de `user.findFirst` toda vez, incluir professor no `course.include` ou cachear o resultado.

### Task 5.2: ProfileService — Parallelize Queries

**Files:**
- Modify: `apps/api/src/profile/profile.service.ts`

**Changes:**
Converte 5 queries sequenciais em `Promise.all`.

### Task 5.3: Remove Unused Exports + Fix TS

**Files:**
- Modify: `packages/ui/src/index.ts`
- Remove: `apps/api/src/questions/dto/start-simulado.dto.ts` (se não usado)

**Changes:**
1. Remove `COLORS` e `BREAKPOINTS` de `packages/ui/src/index.ts`
2. Remove dead DTOs não usados

---

## Fase 6: Extrair Landing Page + Refinar

### Task 6.1: Extract Landing Page Sections

**Files:**
- Create: `apps/web/src/components/landing/hero.tsx`
- Create: `apps/web/src/components/landing/navbar.tsx`
- Create: `apps/web/src/components/landing/stats-section.tsx`
- Create: `apps/web/src/components/landing/features-section.tsx`
- Create: `apps/web/src/components/landing/how-it-works.tsx`
- Create: `apps/web/src/components/landing/testimonials.tsx`
- Create: `apps/web/src/components/landing/pricing-section.tsx`
- Create: `apps/web/src/components/landing/faq-section.tsx`
- Create: `apps/web/src/components/landing/cta-section.tsx`
- Create: `apps/web/src/components/landing/footer.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Changes:**
Extrair cada seção da landing page (586 linhas) para componentes separados em `components/landing/`. A página principal importa e compõe.

### Task 6.2: Fix Unused Imports

**Files:**
- Modify: `apps/web/src/app/(dashboard)/dashboard/page.tsx`
- Modify: `apps/web/src/app/(dashboard)/admin/dashboard/page.tsx`
- Modify: `apps/web/src/app/(dashboard)/cursos/[id]/page.tsx`

**Changes:**
Remover imports não usados de lucide-react e cn.

---

## Execução

**Ordem:** Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6

Cada fase é executada por subagentes independentes via superpowers:subagent-driven-development.
