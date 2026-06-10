export interface Usuario {
  id: string
  email: string
  name: string | null
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN'
  university?: string | null
  period?: number | null
  title?: string | null
  bio?: string | null
  lattes?: string | null
  linkedin?: string | null
  instagram?: string | null
  twitter?: string | null
  imageUrl?: string | null
  createdAt?: string
}

export interface AuthResponse {
  access_token: string
  usuario: { id: string; email: string }
}

export interface Curso {
  id: string
  name: string
  description: string
  imageUrl?: string | null
  category?: string | null
  color?: string | null
  estimatedHours?: number
  level?: string
  premium?: boolean
  certificateEnabled?: boolean
  price?: number
  subject?: { id: string; name: string } | null
  modules?: Modulo[]
  createdAt: string
}

export interface Modulo {
  id: string
  name: string
  order: number
  lessons: Aula[]
}

export interface Aula {
  id: string
  title: string
  type: string
  order: number
  free?: boolean
  materials?: { name: string; url: string; type: string }[]
  content?: string
  contentUrl?: string
  moduleId?: string
  module?: {
    id: string
    name: string
    course: { id: string; name: string; subject?: { id: string; name: string } | null }
  }
  prevLessonId?: string | null
  nextLessonId?: string | null
  moduleLessons?: Aula[]
  totalLessons?: number
  currentLessonIndex?: number
}

export interface ProgressoCurso {
  total: number
  completed: number
  percentage: number
}

export interface NotaResponse {
  notes: string
}

export interface Questao {
  id: string
  text: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  bloomLevel: string
  explanation?: string | null
  topicId: string
  topic?: { id: string; name: string; subject?: { id: string; name: string } }
  alternatives: Alternativa[]
}

export interface Alternativa {
  id: string
  text: string
  isCorrect: boolean
  order?: number
}

export interface PerfilGameficacao {
  id: string
  userId: string
  xp: number
  level: number
  streak: number
  achievements: Conquista[]
  missions: Missao[]
}

export interface Conquista {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  unlockedAt: string
}

export interface Missao {
  id: string
  name: string
  description?: string | null
  progress: number
  target: number
  completed: boolean
}

export interface Conversa {
  id: string
  title?: string | null
  userId: string
  messages?: Mensagem[]
  createdAt: string
}

export interface Mensagem {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Recomendacao {
  id: string
  userId: string
  title: string
  type: string
  description?: string | null
  link?: string | null
  createdAt: string
}

export interface ProfessorAnalytics {
  overview: {
    totalCourses: number
    totalStudents: number
    totalLessons: number
    avgAccuracy: number
  }
  courses: {
    id: string
    name: string
    subject: string
    totalLessons: number
    totalStudents: number
    completionRate: number
  }[]
  strugglingStudents: {
    id: string
    name: string
    accuracy: number
    totalQuestions: number
  }[]
}

export interface AdminFinanceiro {
  overview: {
    mrr: number
    activeSubscriptions: number
    totalRevenue: number
    churnRate: number
    totalSubscriptions: number
    newSubscriptionsThisMonth: number
  }
  planDistribution: { name: string; count: number; price: number }[]
  recentPayments: {
    id: string
    userName: string
    userEmail: string
    planName: string
    amount: number
    date: string
    status: string
  }[]
}

export interface UsuarioAdmin {
  id: string
  email: string
  name: string | null
  role: string
  university?: string | null
  period?: number | null
  createdAt: string
}

export interface Matricula {
  enrolled: boolean
  enrollment?: { id: string; userId: string; courseId: string; progress: number; createdAt: string } | null
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  course?: Curso
}

export interface Certificado {
  id: string
  userId: string
  courseId: string
  title: string
  proficiency: number
  totalHours: number
  createdAt: string
  course?: { id: string; name: string; subject?: { id: string; name: string } | null }
}

export interface Plano {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  active: boolean
}

export interface Assinatura {
  id: string
  userId: string
  planId: string
  status: string
  startDate: string
  endDate?: string | null
  plan?: Plano
}

export interface NextLessonsResponse {
  nextLessons: {
    courseId: string
    courseName: string
    lessonId: string
    lessonTitle: string
    type: string
    progress: number
    totalLessons: number
    completedLessons: number
  }[]
  topicsToReview: {
    id: string
    proficiency: number
    topic?: { id: string; name: string }
  }[]
}

export interface Diagnostic {
  id: string
  userId: string
  snapshot: Record<string, number>
  createdAt: string
}

export interface WeekPlan {
  weekStart: string
  days: {
    date: string
    lessons: { lessonId: string; lessonTitle: string; courseName: string; courseId: string }[]
  }[]
}

export interface LeaderboardEntry {
  userId: string
  name: string | null
  imageUrl: string | null
  xp: number
  level: number
  streak: number
  rank: number
}

export interface ProfileResponse {
  user: Usuario
  gamification: { xp: number; level: number; streak: number } | null
  certificates: Certificado[]
  enrollments: { id: string; courseId: string; courseName: string; progress: number }[]
  stats: {
    totalAttempts: number
    correctAttempts: number
    accuracy: number
    totalCertificates: number
    coursesCreated: number
  }
}

export interface PublicProfileResponse {
  user: {
    id: string
    name: string | null
    imageUrl: string | null
    role: string
    title: string | null
    bio: string | null
    lattes: string | null
    linkedin: string | null
    instagram: string | null
    twitter: string | null
    createdAt: string
  }
  certificates: { id: string; title: string; proficiency: number; totalHours: number; courseName: string; createdAt: string }[]
  gamification: { xp: number; level: number; streak: number } | null
  coursesCreated: { id: string; name: string; description: string; category: string | null }[]
}

export interface StudentAnalytics {
  id: string
  name: string | null
  email: string
  accuracy: number
  totalAttempts: number
  lastActivity: string
}

export interface EventLog {
  id: string
  type: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface QuestionTreeItem {
  id: string
  name: string
  children?: { id: string; name: string; questionCount: number }[]
}

export interface QuestionTag {
  id: string
  name: string
  count: number
}

export interface ExamListResponse {
  id: string
  title: string
  description: string | null
  board: string
  year: string | null
  questionCount: number
  createdAt: string
}

export interface ExamBoard {
  id: string
  name: string
  questionCount: number
}

export interface QuestionStats {
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  difficultyDistribution: { difficulty: string; count: number }[]
  bloomDistribution: { level: string; count: number }[]
}

export interface TopicMastery {
  proficiency: number
  totalQuestions: number
  correctAnswers: number
  recentAttempts: { correct: boolean; createdAt: string }[]
}

export interface SimuladoResponse {
  exam: { id: string; title: string }
  questions: Questao[]
  totalQuestions: number
  timeLimit: number | null
}

export interface PurchaseResponse {
  purchase: { id: string; status: string }
  enrolled: boolean
}

export interface ImportQuestionsInput {
  text: string
  topicId: string
  difficulty: string
  bloomLevel: string
  explanation?: string
  alternatives: { text: string; isCorrect: boolean }[]
}
