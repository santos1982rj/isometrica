import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  Curso, Questao, PerfilGameficacao, Conversa, Usuario,
  ProfessorAnalytics, AdminFinanceiro, UsuarioAdmin,
  Certificado, Plano, Assinatura, NextLessonsResponse, ProgressoCurso,
  Recomendacao, Enrollment, Diagnostic, WeekPlan, LeaderboardEntry,
  ProfileResponse, PublicProfileResponse, StudentAnalytics, EventLog,
  QuestionTreeItem, QuestionTag, ExamListResponse, QuestionStats,
  TopicMastery, SimuladoResponse,
} from './types';

export function useProfile() {
  return useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: () => api.profile.me(),
    staleTime: 30_000,
  });
}

export function usePublicProfile(id: string) {
  return useQuery<PublicProfileResponse>({
    queryKey: ['profile', 'public', id],
    queryFn: () => api.profile.publico(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.profile.atualizar>[0]) => api.profile.atualizar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); },
  });
}

export function useCourses() {
  return useQuery<Curso[]>({ queryKey: ['courses'], queryFn: () => api.courses.listar() });
}

export function useCourse(id: string) {
  return useQuery<Curso>({
    queryKey: ['courses', id],
    queryFn: () => api.courses.detalhe(id),
    enabled: !!id,
  });
}

export function useCourseAccess(courseId: string) {
  return useQuery({
    queryKey: ['courses', courseId, 'access'],
    queryFn: () => api.courses.verificarAcesso(courseId),
    enabled: !!courseId,
  });
}

export function useCourseProgress(userId: string, courseId: string) {
  return useQuery<ProgressoCurso>({
    queryKey: ['courses', courseId, 'progress', userId],
    queryFn: () => api.learning.progressoCurso(userId, courseId),
    enabled: !!userId && !!courseId,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.courses.criar>[0]) => api.courses.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.courses.remover(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useNextLessons(userId: string) {
  return useQuery<NextLessonsResponse>({
    queryKey: ['learning', 'nextLessons', userId],
    queryFn: () => api.learning.proximasAulas(userId),
    enabled: !!userId,
  });
}

export function useLearningModel(userId: string) {
  return useQuery({
    queryKey: ['learning', 'model', userId],
    queryFn: () => api.learning.modelo(userId),
    enabled: !!userId,
  });
}

export function useDiagnostics(userId: string) {
  return useQuery<Diagnostic[]>({
    queryKey: ['learning', 'diagnostics', userId],
    queryFn: () => api.learning.diagnosticos(userId),
    enabled: !!userId,
  });
}

export function useEnrollments(userId: string) {
  return useQuery<Enrollment[]>({
    queryKey: ['learning', 'enrollments', userId],
    queryFn: () => api.learning.matriculas(userId),
    enabled: !!userId,
  });
}

export function useEnrollment(userId: string, courseId: string) {
  return useQuery({
    queryKey: ['learning', 'enrollment', userId, courseId],
    queryFn: () => api.learning.verificarMatricula(userId, courseId),
    enabled: !!userId && !!courseId,
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      api.learning.matricular(userId, courseId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['learning'] }); },
  });
}

export function useErrors(userId: string) {
  return useQuery<Questao[]>({
    queryKey: ['learning', 'errors', userId],
    queryFn: () => api.learning.erros(userId),
    enabled: !!userId,
  });
}

export function useClearErrors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.learning.limparErros(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['learning', 'errors'] }); },
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.learning.enviarTentativa>[0]) =>
      api.learning.enviarTentativa(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning', 'model'] });
      qc.invalidateQueries({ queryKey: ['learning', 'errors'] });
      qc.invalidateQueries({ queryKey: ['questions', 'stats'] });
      qc.invalidateQueries({ queryKey: ['questions', 'mastery'] });
    },
  });
}

export function useNote(userId: string, lessonId: string) {
  return useQuery({
    queryKey: ['learning', 'notes', userId, lessonId],
    queryFn: () => api.learning.anotacao(userId, lessonId),
    enabled: !!userId && !!lessonId,
  });
}

export function useSaveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, lessonId, notes }: { userId: string; lessonId: string; notes: string }) =>
      api.learning.salvarAnotacao(userId, lessonId, notes),
    onSuccess: (_, { userId, lessonId }) => {
      qc.invalidateQueries({ queryKey: ['learning', 'notes', userId, lessonId] });
    },
  });
}

export function useMarkProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, lessonId, completed }: { userId: string; lessonId: string; completed: boolean }) =>
      api.learning.marcarProgresso(userId, lessonId, completed),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['learning'] }); },
  });
}

export function useCertificates() {
  return useQuery<Certificado[]>({
    queryKey: ['learning', 'certificates'],
    queryFn: () => api.learning.certificados(),
  });
}

export function useGenerateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.learning.gerarCertificado(courseId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['learning', 'certificates'] }); },
  });
}

export function useWeekPlan(userId: string) {
  return useQuery<WeekPlan>({
    queryKey: ['learning', 'weekPlan', userId],
    queryFn: () => api.learning.planoSemanal(userId),
    enabled: !!userId,
  });
}

export function useEventLogs(userId: string) {
  return useQuery<EventLog[]>({
    queryKey: ['analytics', 'events', userId],
    queryFn: () => api.analytics.eventos(userId),
    enabled: !!userId,
  });
}

export function useGamification(userId: string) {
  return useQuery<PerfilGameficacao>({
    queryKey: ['gamification', userId],
    queryFn: () => api.gamification.perfil(userId),
    enabled: !!userId,
  });
}

export function useLeaderboard(limit = 10) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['gamification', 'leaderboard', limit],
    queryFn: () => api.gamification.leaderboard(limit),
  });
}

export function useXpHistory(userId: string) {
  return useQuery({
    queryKey: ['gamification', 'xp-history', userId],
    queryFn: () => api.gamification.xpHistory(userId),
    enabled: !!userId,
  });
}

export function useProfessorAnalytics() {
  return useQuery<ProfessorAnalytics>({
    queryKey: ['analytics', 'professor'],
    queryFn: () => api.analytics.professor(),
  });
}

export function useCourseStudents(courseId: string) {
  return useQuery<StudentAnalytics[]>({
    queryKey: ['analytics', 'students', courseId],
    queryFn: () => api.analytics.cursoAlunos(courseId),
    enabled: !!courseId,
  });
}

export function useAdminFinanceiro() {
  return useQuery<AdminFinanceiro>({
    queryKey: ['admin', 'financeiro'],
    queryFn: () => api.financeiro.adminOverview(),
  });
}

export function useAdminUsuarios() {
  return useQuery<UsuarioAdmin[]>({
    queryKey: ['admin', 'usuarios'],
    queryFn: () => api.admin.usuarios(),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.admin.atualizarUsuario>[1] }) =>
      api.admin.atualizarUsuario(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'usuarios'] }); },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.removerUsuario(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'usuarios'] }); },
  });
}

export function useSubscriptions(userId: string) {
  return useQuery<Assinatura[]>({
    queryKey: ['financial', 'subscriptions', userId],
    queryFn: () => api.financeiro.assinaturas(userId),
    enabled: !!userId,
  });
}

export function usePlans() {
  return useQuery<Plano[]>({
    queryKey: ['financial', 'plans'],
    queryFn: () => api.financeiro.planos(),
  });
}

export function useSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) =>
      api.financeiro.assinar(userId, planId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial'] }); },
  });
}

export function useSubjectTree() {
  return useQuery<QuestionTreeItem[]>({
    queryKey: ['questions', 'tree'],
    queryFn: () => api.questions.arvore(),
  });
}

export function useQuestionTags() {
  return useQuery<QuestionTag[]>({
    queryKey: ['questions', 'tags'],
    queryFn: () => api.questions.tags(),
  });
}

export function useQuestions(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['questions', 'list', params],
    queryFn: () => api.questions.listar(params),
  });
}

export function useQuestionStats(id: string) {
  return useQuery<QuestionStats>({
    queryKey: ['questions', 'stats', id],
    queryFn: () => api.questions.stats(id),
    enabled: !!id,
  });
}

export function useTopicMastery(topicId: string) {
  return useQuery<TopicMastery>({
    queryKey: ['questions', 'mastery', topicId],
    queryFn: () => api.questions.dominio(topicId),
    enabled: !!topicId,
  });
}

export function useSimulado(examId: string, limit = 10) {
  return useQuery<SimuladoResponse>({
    queryKey: ['questions', 'simulado', examId, limit],
    queryFn: () => api.questions.simulado(examId, limit),
    enabled: !!examId,
  });
}

export function useExams(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['questions', 'exams', params],
    queryFn: () => api.questions.exames(params),
  });
}

export function useExamBoards() {
  return useQuery<string[]>({
    queryKey: ['questions', 'exams', 'boards'],
    queryFn: () => api.questions.boards(),
    staleTime: 60_000,
  });
}

export function useExam(id: string) {
  return useQuery({
    queryKey: ['questions', 'exams', id],
    queryFn: () => api.questions.obterExame(id),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.questions.criarExame>[0]) => api.questions.criarExame(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions', 'exams'] }) },
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.questions.atualizarExame(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions', 'exams'] }) },
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.questions.removerExame(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions', 'exams'] }) },
  });
}

export function useIniciarSimulado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => api.questions.iniciarSimulado(examId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['simulado'] }) },
  });
}

export function useResultadoSimulado(sessionId: string) {
  return useQuery({
    queryKey: ['simulado', 'resultado', sessionId],
    queryFn: () => api.questions.resultadoSimulado(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.questions.criar>[0]) => api.questions.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions'] }); },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.questions.atualizar>[1] }) =>
      api.questions.atualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions'] }); },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.questions.remover(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions'] }); },
  });
}

export function useConversations(userId: string) {
  return useQuery<Conversa[]>({
    queryKey: ['ai', 'conversations', userId],
    queryFn: () => api.ai.conversas(userId),
    enabled: !!userId,
  });
}

export function useConversation(id: string) {
  return useQuery<Conversa>({
    queryKey: ['ai', 'conversation', id],
    queryFn: () => api.ai.obterConversa(id),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, title }: { userId: string; title?: string }) =>
      api.ai.criarConversa(userId, title),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ai', 'conversations'] }); },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, role, content }: { conversationId: string; role: string; content: string }) =>
      api.ai.enviarMensagem(conversationId, role, content),
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] });
    },
  });
}

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => api.courses.comprar(courseId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Parameters<typeof api.courses.criarModulo>[1] }) =>
      api.courses.criarModulo(courseId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useLessons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Parameters<typeof api.courses.criarAula>[1] }) =>
      api.courses.criarAula(moduleId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['knowledge', 'subjects'],
    queryFn: () => api.knowledge.subjects(),
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ['knowledge', 'topics'],
    queryFn: () => api.knowledge.listarTopicos(),
  });
}
