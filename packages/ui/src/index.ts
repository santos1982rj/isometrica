import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type { ClassValue }

export const COLORS = {
  primary: '#1a2e3c',
  accent: '#e85d32',
  success: '#26a96c',
  info: '#4790e6',
  danger: '#eb5757',
  warning: '#f3a638',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
