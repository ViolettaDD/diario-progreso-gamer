import { describe, expect, it } from 'vitest';
import { calcularRachas } from './racha';

const dias = (...lista: string[]) => lista.map((dia) => ({ dia }));

describe('racha', () => {
  it('H-04.1: la racha sigue viva si ayer jugó: 2 con hoy viernes 13 sin partida (RN-01)', () => {
    expect(calcularRachas(dias('2026-11-11', '2026-11-12'), '2026-11-13').rachaActual).toBe(2);
  });

  it('H-04.2: con hoy sábado 14 y última partida el jueves 12 la racha es 0 (RN-01)', () => {
    expect(calcularRachas(dias('2026-11-11', '2026-11-12'), '2026-11-14').rachaActual).toBe(0);
  });

  it('H-04.3: con partidas el 11, el 12 y el 13 y hoy 13 la racha es 3 (RN-01)', () => {
    expect(calcularRachas(dias('2026-11-11', '2026-11-12', '2026-11-13'), '2026-11-13').rachaActual).toBe(3);
  });

  it('H-04.4: tres partidas el jueves 12 y una el viernes 13 dan racha 2 (RN-02)', () => {
    const r = calcularRachas(dias('2026-11-12', '2026-11-12', '2026-11-12', '2026-11-13'), '2026-11-13');
    expect(r.rachaActual).toBe(2);
  });

  it('H-04.5: racha actual 6 desde el domingo 8 y mejor racha 12 de septiembre, con mejor ≥ actual (RN-20)', () => {
    const septiembre = Array.from({ length: 12 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);
    const noviembre = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'];
    const r = calcularRachas(dias(...septiembre, ...noviembre), '2026-11-13');
    expect(r.rachaActual).toBe(6);
    expect(r.mejorRacha).toBe(12);
    expect(r.mejorRacha).toBeGreaterThanOrEqual(r.rachaActual);
  });

  it('H-04.6: con hoy jueves 12 la partida del viernes 13 se ignora: actual 2 y mejor 2 (RN-10)', () => {
    const r = calcularRachas(dias('2026-11-11', '2026-11-12', '2026-11-13'), '2026-11-12');
    expect(r).toEqual({ rachaActual: 2, mejorRacha: 2 });
  });

  it('H-04.7: sin partidas da actual 0 y mejor 0; con partidas el 12 y el 13 da 2 (RN-12)', () => {
    expect(calcularRachas([], '2026-11-13')).toEqual({ rachaActual: 0, mejorRacha: 0 });
    expect(calcularRachas(dias('2026-11-12', '2026-11-13'), '2026-11-13').rachaActual).toBe(2);
  });
});
