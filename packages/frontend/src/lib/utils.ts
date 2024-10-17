import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const logger = {
  log: (...args: any[]) => console.log('[NextAuth]', ...args),
  error: (...args: any[]) => console.error('[NextAuth Error]', ...args),
  warn: (...args: any[]) => console.warn('[NextAuth Warning]', ...args),
  debug: (...args: any[]) => console.debug('[NextAuth Debug]', ...args),
};
