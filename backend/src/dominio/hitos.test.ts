import { describe, expect, it } from 'vitest';
import { evaluarHitos } from './hitos';
import type { PartidaDia } from './resumen';

const HOY = '2026-11-13';

function p(dia: string, porcentajeAvance: number, createdAt = `${dia}T20:00:00Z`): PartidaDia {
  return { dia, duracionMinutos: 60, porcentajeAvance, createdAt: new Date(createdAt) };
}

const meta = (...objetivos: number[]) => ({
  hitos: objetivos.map((o) => ({ descripcion: `Llegar al ${o} %`, porcentajeObjetivo: o })),
});

describe('hitos', () => {
  it('H-05.1: el hito del 50 % con avance 60 está alcanzado (RN-06)', () => {
    expect(evaluarHitos(meta(50), [p('2026-11-12', 60)], HOY)).toEqual([
      { descripcion: 'Llegar al 50 %', porcentajeObjetivo: 50, alcanzado: true },
    ]);
  });

  it('H-05.2: una partida más reciente con 40 % deja el hito del 50 % pendiente (RN-06)', () => {
    const r = evaluarHitos(meta(50), [p('2026-11-12', 60), p('2026-11-13', 40)], HOY);
    expect(r[0].alcanzado).toBe(false);
  });

  it('H-05.3: con avance exacto de 50 el hito del 50 % está alcanzado (RN-06)', () => {
    expect(evaluarHitos(meta(50), [p('2026-11-12', 50)], HOY)[0].alcanzado).toBe(true);
  });

  it('H-05.4: sin partidas los hitos del 25 % y el 50 % están pendientes (RN-12)', () => {
    expect(evaluarHitos(meta(25, 50), [], HOY).map((h) => h.alcanzado)).toEqual([false, false]);
  });

  it('H-05.5: sin meta activa la lista de hitos es vacía (RN-15)', () => {
    expect(evaluarHitos(null, [p('2026-11-12', 60)], HOY)).toEqual([]);
  });

  it('H-06.4: con avance 30 el hito del 25 % está alcanzado y el del 50 % pendiente (RN-15)', () => {
    const r = evaluarHitos(meta(25, 50), [p('2026-11-12', 30)], HOY);
    expect(r.map((h) => [h.porcentajeObjetivo, h.alcanzado])).toEqual([
      [25, true],
      [50, false],
    ]);
  });
});
