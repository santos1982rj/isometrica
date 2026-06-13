# Checklist de Beta Interno — Isométrica

## Autenticação
- [ ] Login com email e senha funciona
- [ ] Cadastro de novo usuário funciona
- [ ] Logout funciona (cookie removido)
- [ ] Recuperação de senha (se configurado)

## Perfil
- [ ] Perfil do aluno exibe dados corretos
- [ ] Edição de perfil funciona (nome, bio, universidade, período)
- [ ] Perfil público (`/u/[id]`) exibe informações corretas

## Aluno — Cursos
- [ ] Catálogo de cursos carrega
- [ ] Landing page do curso exibe ementa, professor, informações
- [ ] Matrícula em curso funciona
- [ ] Matrícula aparece no perfil e dashboard

## Aluno — Aulas
- [ ] Player de vídeo carrega (embed YouTube)
- [ ] Conteúdo textual aparece
- [ ] Marcar aula como concluída funciona
- [ ] Anotações salvam automaticamente
- [ ] Exercícios da aula carregam
- [ ] Sidebar de navegação entre aulas funciona
- [ ] Navegação aula anterior/próxima funciona

## Aluno — Questões
- [ ] Banco de questões carrega com filtros
- [ ] Responder questão registra tentativa
- [ ] Feed de erros exibe questões erradas
- [ ] Refazer questão no feed de erros funciona
- [ ] Limpar histórico de erros funciona

## Aluno — Simulados
- [ ] Modo Concurso lista simulados disponíveis
- [ ] Iniciar simulado redireciona para prova
- [ ] Timer do simulado funciona
- [ ] Responder questões no simulado funciona
- [ ] Resultado do simulado exibe desempenho

## Aluno — Gamificação
- [ ] XP atualiza após ações (responder, concluir aula, simular)
- [ ] Level aparece corretamente
- [ ] Streak é contado
- [ ] Conquistas aparecem
- [ ] Ranking de líderes carrega

## Aluno — Dashboard
- [ ] KPIs aparecem (XP, streak, level, cursos ativos)
- [ ] "Continue de onde parou" exibe próximas aulas
- [ ] Diagnóstico de proficiência carrega
- [ ] Timeline de atividade aparece
- [ ] Heatmap aparece

## Aluno — Certificados e Assinatura
- [ ] Página de certificados lista emitidos
- [ ] Compartilhar no LinkedIn funciona
- [ ] Planos de assinatura carregam
- [ ] Assinar plano funciona

## Professor
- [ ] Dashboard do professor carrega com analytics
- [ ] Lista de cursos do professor carrega
- [ ] Criar curso (wizard 4 etapas) funciona
- [ ] Adicionar módulo funciona
- [ ] Adicionar aula (com vídeo) funciona
- [ ] Editar módulo/aula funciona
- [ ] Remover módulo/aula com confirmação funciona
- [ ] Adicionar questão ao curso funciona
- [ ] Gerenciar concursos (CRUD) funciona
- [ ] Professor NÃO consegue editar recurso de outro professor

## Admin
- [ ] Dashboard admin carrega com KPIs
- [ ] Lista de usuários carrega
- [ ] Buscar usuário por nome/email funciona
- [ ] Alterar papel do usuário funciona
- [ ] Remover usuário com confirmação funciona
- [ ] Página financeiro carrega

## UX/UI
- [ ] Sidebar funciona (expandir/recolher)
- [ ] Navegação mobile (Sheet) funciona
- [ ] Modo escuro/claro alterna
- [ ] Páginas não estouram no mobile (<=768px)
- [ ] Botões de ícone têm dica ou aria-label
- [ ] Diálogos de confirmação têm título e descrição claros
- [ ] Empty states aparecem onde não há dados
- [ ] Loading states aparecem durante carregamento

## Responsividade Mobile
- [ ] Dashboard do aluno — 1 coluna
- [ ] Cursos — 1-2 colunas
- [ ] Curso/[id] — 1 coluna
- [ ] Player de aula — utilizável
- [ ] Gamificação — 1 coluna
- [ ] Progresso — 1 coluna
- [ ] Certificados — 1 coluna
- [ ] Assinatura — 1 coluna
- [ ] Tutor IA — chat utilizável
- [ ] Concurso — 1 coluna
- [ ] Professor dashboard — 1 coluna
- [ ] Admin usuários — 2 colunas

## Infraestrutura
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodaram sem erro
- [ ] Build de produção passa
- [ ] Typecheck passa
- [ ] Testes passam
- [ ] Backup do banco funcional
- [ ] Deploy para produção documentado
- [ ] Rollback documentado
