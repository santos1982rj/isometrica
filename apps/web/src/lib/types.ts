// ===== Usuário =====
export interface Usuario {
  id: string
  email: string
  name: string | null
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN'
  university?: string | null
  period?: number | null
  createdAt?: string
}

export interface AuthResponse {
  access_token: string
  usuario: { id: string; email: string }
}

// ===== Curso =====
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

// ===== Progresso =====
export interface ProgressoCurso {
  total: number
  completed: number
  percentage: number
}

export interface NotaResponse {
  notes: string
}

// ===== Questões =====
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

// ===== Gamificação =====
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

// ===== AI / Tutor =====
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

// ===== Analytics =====
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

// ===== Admin =====
export interface UsuarioAdmin {
  id: string
  email: string
  name: string | null
  role: string
  university?: string | null
  period?: number | null
  createdAt: string
}

// ===== Matrícula =====
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

// ===== Certificado =====
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

// ===== Planos / Assinatura =====
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

// ===== Learning / Próximas aulas =====
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
