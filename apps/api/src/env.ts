import 'reflect-metadata';

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GROQ_API_KEY',
    'REDIS_URL',
  ] as const;

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const optional = ['RESEND_API_KEY', 'CORS_ORIGIN'] as const;
  for (const key of optional) {
    if (!process.env[key]) {
      console.warn(`[env] Optional variable ${key} is not set — some features may be disabled`);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}
