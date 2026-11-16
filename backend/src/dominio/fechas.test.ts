import { describe, expect, it } from 'vitest';
import { esFechaCalendario, esFutura, hoyEnEcuador } from './fechas';

describe('fechas', () => {
  it('D-P2.1: "2026-11-12" es una fecha de calendario válida (RN-03)', () => {
    expect(esFechaCalendario('2026-11-12')).toBe(true);
  });

  it('D-P2.2: rechaza fecha con hora, con zona, texto, vacía y 2026-02-30 (RN-03)', () => {
    expect(esFechaCalendario('2026-11-12 10:00')).toBe(false);
    expect(esFechaCalendario('2026-11-12T10:00:00Z')).toBe(false);
    expect(esFechaCalendario('2026-11-12T10:00:00-05:00')).toBe(false);
    expect(esFechaCalendario('ayer')).toBe(false);
    expect(esFechaCalendario('')).toBe(false);
    expect(esFechaCalendario('2026-02-30')).toBe(false);
  });

  it('D-P2.3: a las 21:00 del jueves 12 en Ecuador hoy es el 12, el viernes 13 es futuro y el jueves 12 no (RN-10)', () => {
    // 21:00 en Guayaquil (UTC-5) = 02:00 UTC del día siguiente.
    const hoy = hoyEnEcuador(new Date('2026-11-13T02:00:00Z'));
    expect(hoy).toBe('2026-11-12');
    expect(esFutura('2026-11-13', hoy)).toBe(true);
    expect(esFutura('2026-11-12', hoy)).toBe(false);
  });

  it('D-P2.4: a las 23:59 del lunes 9 en Ecuador hoy es 2026-11-09 (RN-11)', () => {
    expect(hoyEnEcuador(new Date('2026-11-10T04:59:00Z'))).toBe('2026-11-09');
  });
});
