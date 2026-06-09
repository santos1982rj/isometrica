import 'reflect-metadata';

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ] as const;

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long');
  }
}
