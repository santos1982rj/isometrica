export type NotificationChannel = 'in_app' | 'email' | 'push'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export type NotificationCategory =
  | 'achievement' | 'level_up' | 'streak'
  | 'recommendation' | 'tutor_proactive'
  | 'course_update' | 'enrollment'
  | 'payment' | 'subscription'
  | 'system' | 'reminder'

export interface AppNotification {
  id: string
  userId: string
  category: NotificationCategory
  title: string
  message: string
  channel: NotificationChannel
  priority: NotificationPriority
  metadata: Record<string, unknown> | null
  read: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationPreferences {
  userId: string
  email: boolean
  push: boolean
  inApp: boolean
  digestFrequency: 'instant' | 'daily' | 'weekly' | 'never'
  categories: Partial<Record<NotificationCategory, boolean>>
}
