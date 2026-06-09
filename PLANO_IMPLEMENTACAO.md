# Plano de Implementação — Isométrica

> Progresso atual: **20 rotas** · Fase: **Core completo, expandindo valor**
> Legenda: 🔥 Essa sprint | ⚡ Próxima | 💡 Futuro

---

## 📦 Fase 1 — Pagamentos & Assinatura (🔥)

**Por quê:** Sem monetização, a plataforma não se sustenta. O seed já tem planos (Gratuito/Premium), falta o checkout.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 1.1 | Modelo `Subscription` + `Payment` no Prisma | ✅ já existe | - |
| 1.2 | Backend: `POST /financial/subscribe` — criar assinatura | 🕐 2h | - |
| 1.3 | Backend: `POST /financial/webhook` — MercadoPago IPN | 🕐 2h | 1.2 |
| 1.4 | Backend: `GET /financial/subscriptions/:userId` | 🕐 30min | 1.2 |
| 1.5 | Frontend: Página `/assinatura` com planos e checkout | 🕐 3h | 1.2 |
| 1.6 | Frontend: Badge "Premium" no perfil + restrições por plano | 🕐 2h | 1.5 |
| 1.7 | Frontend: Página `/admin/financeiro` com MRR, churn, assinaturas | 🕐 3h | 1.5 |

---

## 📦 Fase 2 — "O Que Estudar Hoje?" Home Page Guiada (🔥)

**Por quê:** O dashboard atual é passivo. O diferencial da plataforma é **guiar** o aluno.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 2.1 | Backend: `GET /learning/next-lessons/:userId` — IA sugere próximas aulas | 🕐 2h | StudentModel |
| 2.2 | Backend: `GET /learning/week-plan/:userId` — plano semanal | 🕐 1h | 2.1 |
| 2.3 | Frontend: Rewrite do dashboard com "Continue sua jornada" | 🕐 4h | 2.1 |
| 2.4 | Frontend: Card "Meta da semana" com checklists | 🕐 1h | 2.2 |

---

## 📦 Fase 3 — Revisão Espaçada & Feed de Erros 2.0 (🔥)

**Por quê:** O feed de erros existe mas não tem algoritmo de repetição. O ouro está em fazer o erro voltar no momento certo.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 3.1 | Backend: Algoritmo de revisão espaçada (1d, 3d, 7d, 15d, 30d) | 🕐 3h | - |
| 3.2 | Backend: `GET /learning/review` — questões para revisar hoje | 🕐 1h | 3.1 |
| 3.3 | Frontend: Seção "Revisão do dia" no dashboard | 🕐 2h | 3.2 |
| 3.4 | Frontend: Modo "Revisão Rápida" — flashcards, uma por uma | 🕐 3h | 3.2 |

---

## 📦 Fase 4 — Integração LLM Completa (⚡)

**Por quê:** A base do LLM já está (OpenAI integrado), falta turbinar.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 4.1 | Streaming de resposta no chat (SSE ou WebSocket) | 🕐 4h | - |
| 4.2 | Contexto do StudentModel no prompt (proficiência do aluno) | 🕐 1h | - |
| 4.3 | Botão "Gerar questões com IA" no formulário do professor | 🕐 2h | - |
| 4.4 | Cache de respostas frequentes (Redis) | 🕐 2h | - |

---

## 📦 Fase 5 — Responsividade Mobile (⚡)

**Por quê:** Aluno estuda no celular. Várias páginas já funcionam, precisam de polimento.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 5.1 | Player de aula: sidebar vira bottom sheet no mobile | 🕐 2h | - |
| 5.2 | Dashboard: grid adaptável para telas pequenas | 🕐 1h | - |
| 5.3 | Curso landing page: empilhamento vertical | 🕐 1h | - |
| 5.4 | Gamificação: grid de conquistas responsivo | 🕐 30min | - |
| 5.5 | Professor CRUD: formulários em tela cheia no mobile | 🕐 1h | - |
| 5.6 | Tutor IA: input fixo no bottom + altura adaptável | 🕐 1h | - |
| 5.7 | Certificados: grid responsivo | 🕐 30min | - |
| 5.8 | Admin usuários: tabela → cards em mobile | 🕐 1h | - |

---

## 📦 Fase 6 — Dashboard do Professor Analytics (⚡)

**Por quê:** O professor tem CRUD mas não tem dados de desempenho dos alunos.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 6.1 | Backend: `GET /analytics/professor/:userId/courses` — stats por curso | 🕐 2h | - |
| 6.2 | Backend: `GET /analytics/professor/:userId/students` — top alunos em dificuldade | 🕐 1h | - |
| 6.3 | Frontend: Gráficos de desempenho no dashboard do professor | 🕐 3h | 6.1 |
| 6.4 | Frontend: Tabela de alunos por curso com filtros | 🕐 2h | 6.2 |

---

## 📦 Fase 7 — Certificado na Íntegra (💡)

**Por quê:** O certificado já é gerado, mas não tem visualização nem PDF para download.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 7.1 | Página pública do certificado (`/certificado/[id]`) com layout bonito | 🕐 3h | - |
| 7.2 | Geração de PDF (biblioteca tipo puppeteer ou html2canvas) | 🕐 3h | 7.1 |
| 7.3 | Selo de verificação com hash na blockchain (conceito) | 🕐 2h | 7.1 |

---

## 📦 Fase 8 — Comunidade & Feed (💡)

**Por quê:** Aluno avulso precisa de senso de pertencimento.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 8.1 | Backend: `POST /posts` + `GET /feed` — feed de atividades | 🕐 2h | - |
| 8.2 | Frontend: Feed estilo LinkedIn no dashboard | 🕐 3h | 8.1 |
| 8.3 | Perfil público (`/u/[username]`) | 🕐 2h | - |
| 8.4 | Badge "Top 10% da semana" automático | 🕐 1h | - |

---

## 📦 Fase 9 — Modo Foco & Timer (💡)

**Por quê:** Disciplina de estudo é o maior problema do aluno avulso.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 9.1 | Frontend: Timer Pomodoro 25/5 integrado | 🕐 2h | - |
| 9.2 | Backend: `POST /focus-sessions` — registrar sessão de foco | 🕐 30min | - |
| 9.3 | Frontend: Bloqueio de distrações durante o foco | 🕐 1h | - |
| 9.4 | XP bônus por sessão de foco concluída | 🕐 1h | 9.2 |

---

## 📦 Fase 10 — Modo Offline (PWA) (💡)

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 10.1 | Service worker + manifest.json | 🕐 2h | - |
| 10.2 | Cache de aulas assistidas para replay offline | 🕐 3h | - |
| 10.3 | Sincronizar respostas offline quando voltar | 🕐 2h | - |

---

## 📦 Fase 11 — Extensão Chrome (🌱)

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 11.1 | Detectar página de engenharia no YouTube | 🕐 2h | - |
| 11.2 | Oferecer "Salvar na trilha Isométrica" | 🕐 1h | - |
| 11.3 | Enviar para API da Isométrica | 🕐 1h | - |

---

## 📦 Fase 12 — Isométrica para Empresas (B2B) (🌱)

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 12.1 | Modelo `Organization` + `Team` no Prisma | 🕐 1h | - |
| 12.2 | Dashboard corporativo (gestão de funcionários) | 🕐 4h | - |
| 12.3 | Relatórios de progresso do time (PDF exportável) | 🕐 3h | - |

---

## 📦 Fase 13 — Simulador 3D no Navegador (🌱)

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 13.1 | Integração Three.js para pórtico 2D/3D | 🕐 6h | - |
| 13.2 | Aplicar cargas e ver diagrama em tempo real | 🕐 4h | 13.1 |
| 13.3 | Embed do simulador nas aulas de Resistência | 🕐 1h | 13.2 |

---

## 📦 Fase 14 — Testes Automatizados (🔥 Infra)

**Por quê:** Zero testes. Conforme o projeto cresce, bugs vão aparecer.

| # | Tarefa | Esforço | Depende |
|---|--------|---------|---------|
| 14.1 | Configurar Vitest no backend | 🕐 1h | - |
| 14.2 | Testes unitários do GamificationService | 🕐 2h | - |
| 14.3 | Testes do RolesGuard | 🕐 1h | - |
| 14.4 | Testes de integração da API (Supertest) | 🕐 3h | - |

---

## 🎯 Prioridade da Sprint Atual (Executar Agora)

```
1️⃣  Fase 1 — Pagamentos (monetização base)
2️⃣  Fase 5 — Responsividade (qualidade percebida)
3️⃣  Fase 2 — Home Page Guiada (diferencial)
```

---

> **Total estimado:** ~85 tarefas · ~180h de desenvolvimento
> **Atualizado:** Junho 2026
