export enum EventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  ENROLLMENT_CREATED = 'enrollment.created',
  LESSON_STARTED = 'lesson.started',
  LESSON_COMPLETED = 'lesson.completed',
  QUESTION_ANSWERED = 'question.answered',
  QUESTION_CORRECT = 'question.correct',
  QUESTION_INCORRECT = 'question.incorrect',
  HINT_USED = 'hint.used',
  CONVERSATION_STARTED = 'conversation.started',
  MESSAGE_SENT = 'message.sent',
  RECOMMENDATION_CREATED = 'recommendation.created',
  DIAGNOSTIC_COMPLETED = 'diagnostic.completed',
  ACHIEVEMENT_UNLOCKED = 'achievement.unlocked',
  STREAK_UPDATED = 'streak.updated',
  LEVEL_UP = 'level.up',
  XP_GAINED = 'xp.gained',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
}

export interface BaseEvent {
  type: EventType;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type AppEvent = BaseEvent;
