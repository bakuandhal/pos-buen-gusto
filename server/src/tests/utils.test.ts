import { describe, it, expect } from 'vitest';

describe('Utilidades de autenticación', () => {
  it('generateRefreshToken debe devolver un string hexadecimal', async () => {
    const { generateRefreshToken } = await import('../utils/auth');
    const token = generateRefreshToken();
    expect(typeof token).toBe('string');
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    expect(token.length).toBeGreaterThan(0);
  });

  it('hashToken debe devolver un hash consistente', async () => {
    const { hashToken } = await import('../utils/auth');
    const hash1 = hashToken('mi-token-secreto');
    const hash2 = hashToken('mi-token-secreto');
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe('mi-token-secreto');
  });
});
