import { describe, expect, it } from 'vitest';
import { semanaDe } from './semana';

describe('semana', () => {
  it('H-02.1: con hoy viernes 13 la semana va del 2026-11-09 al 2026-11-15 (RN-11)', () => {
    expect(semanaDe('2026-11-13')).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' });
    expect(semanaDe('2026-11-15')).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' });
    expect(semanaDe('2026-11-16')).toEqual({ inicio: '2026-11-16', fin: '2026-11-22' });
  });

  it('D-P2.4: con hoy lunes 9 la semana va del 2026-11-09 al 2026-11-15 (RN-11)', () => {
    expect(semanaDe('2026-11-09')).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' });
  });

  it('T-07: la semana del 2026-12-02 va del 2026-11-30 al 2026-12-06', () => {
    expect(semanaDe('2026-12-02')).toEqual({ inicio: '2026-11-30', fin: '2026-12-06' });
  });

  it('T-07: la semana del 2027-01-01 va del 2026-12-28 al 2027-01-03', () => {
    expect(semanaDe('2027-01-01')).toEqual({ inicio: '2026-12-28', fin: '2027-01-03' });
  });
});
