export type AnalyticsEventType =
  | 'LESSON_STARTED' | 'LESSON_COMPLETED'
  | 'QUESTION_ANSWERED' | 'QUESTION_CORRECT' | 'QUESTION_INCORRECT' | 'HINT_USED'
  | 'CONVERSATION_STARTED' | 'MESSAGE_SENT'
  | 'RECOMMENDATION_VIEWED' | 'TUTOR_ACTION_TRIGGERED'
  | 'ENROLLMENT_CREATED' | 'DIAGNOSTIC_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED' | 'STREAK_UPDATED' | 'LEVEL_UP'
  | 'XP_GAINED'
  | 'USER_CREATED' | 'USER_UPDATED'
  | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED'

export interface AnalyticsEvent {
  id: string
  userId: string
  type: AnalyticsEventType
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AnalyticsSummary {
  type: AnalyticsEventType
  count: number
}

export interface ProfessorDashboard {
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

export interface AdminDashboard {
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
