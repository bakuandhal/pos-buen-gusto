import { randomBytes } from 'crypto';
import { createHash } from 'crypto';

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function sanitizeErrorMessage(message: string): string {
  // Evitar revelar detalles internos en mensajes de error
  const sensitivePatterns = [
    /DATABASE_URL/i,
    /JWT_SECRET/i,
    /password/i,
    /connection/i,
    /at\s+Object\./i,
    /at\s+async\s+/i,
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[redactado]');
  }

  return sanitized;
}
