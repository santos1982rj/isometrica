import { z } from 'zod';

export const UserRoleEnum = z.enum(['STUDENT', 'PROFESSOR', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const SignupSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  papel: UserRoleEnum.optional().default('STUDENT'),
  universidade: z.string().optional(),
  periodo: z.number().int().min(1).max(12).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const EsqueceuSenhaSchema = z.object({
  email: z.string().email(),
});

export const RecuperarSenhaSchema = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const QuestionDifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const BloomLevelEnum = z.enum(['LEMBRAR', 'ENTENDER', 'APLICAR', 'ANALISAR', 'AVALIAR', 'CRIAR']);

export const CreateAlternativeSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const CreateQuestionSchema = z.object({
  text: z.string().min(1, 'Texto da questão é obrigatório'),
  topicId: z.string().min(1),
  difficulty: QuestionDifficultyEnum,
  bloomLevel: BloomLevelEnum,
  explanation: z.string().optional(),
  alternatives: z.array(CreateAlternativeSchema).min(2, 'Mínimo de 2 alternativas'),
});

export const CreateCourseSchema = z.object({
  name: z.string().min(1, 'Nome do curso é obrigatório'),
  description: z.string().min(1),
  category: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  color: z.string().optional(),
  estimatedHours: z.number().int().positive().optional(),
  level: z.string().optional(),
  premium: z.boolean().optional(),
  certificateEnabled: z.boolean().optional(),
  price: z.number().positive().optional(),
});

export const CreateModuleSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0),
});

export const CreateLessonSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  order: z.number().int().min(0),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  free: z.boolean().optional(),
});

export const SubmitAttemptSchema = z.object({
  userId: z.string().min(1),
  questionId: z.string().min(1),
  selectedId: z.string().min(1),
  correct: z.boolean(),
  timeSpent: z.number().int().positive().optional(),
  hintUsed: z.boolean().optional(),
});
