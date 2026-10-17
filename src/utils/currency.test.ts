import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from './currency';

describe('formatCurrency', () => {
  it('convierte centavos a formato de moneda con dos decimales', () => {
    expect(formatCurrency(1234)).toBe('12.34');
  });

  it('maneja importes menores a un peso', () => {
    expect(formatCurrency(5)).toBe('0.05');
  });

  it('maneja importes exactos sin centavos', () => {
    expect(formatCurrency(1000)).toBe('10.00');
  });

  it('maneja importes negativos', () => {
    expect(formatCurrency(-250)).toBe('-2.50');
  });

  it('lanza error si el valor no es entero', () => {
    expect(() => formatCurrency(10.5)).toThrow('centavos enteros');
  });
});

describe('parseCurrency', () => {
  it('convierte una cadena de moneda a centavos', () => {
    expect(parseCurrency('12.34')).toBe(1234);
  });

  it('maneja importes sin centavos', () => {
    expect(parseCurrency('10')).toBe(1000);
  });

  it('maneja un solo decimal', () => {
    expect(parseCurrency('5.5')).toBe(550);
  });

  it('lanza error para formato inválido', () => {
    expect(() => parseCurrency('abc')).toThrow('Formato de moneda inválido');
    expect(() => parseCurrency('12.345')).toThrow('Formato de moneda inválido');
  });
});
