export interface AiConversation {
  id: string
  userId: string
  title: string | null
  context: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  messages: AiMessage[]
}

export interface AiMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AiRecommendation {
  id: string
  userId: string
  type: 'review' | 'practice' | 'mission' | 'study_plan'
  title: string
  description: string
  metadata: Record<string, unknown> | null
  read: boolean
  createdAt: string
}

export interface AiTutorAction {
  id: string
  userId: string
  actionType: string
  description: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
