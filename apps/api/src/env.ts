import 'reflect-metadata';

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GROQ_API_KEY',
    'REDIS_URL',
    'RESEND_API_KEY',
  ] as const;

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}
