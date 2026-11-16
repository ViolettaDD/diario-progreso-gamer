import { describe, expect, it } from 'vitest';
import { progresoDeSemana } from './progreso';
import type { PartidaDia } from './resumen';

function p(dia: string, duracionMinutos: number, porcentajeAvance = 0): PartidaDia {
  return { dia, duracionMinutos, porcentajeAvance, createdAt: new Date(`${dia}T20:00:00Z`) };
}

const meta = (horasSemanales: number, diasPorSemana = 4) => ({ horasSemanales, diasPorSemana });

describe('progreso de la semana', () => {
  it('H-02.1: con meta de 5 h suma 3,5 h y 70 % sin la partida del domingo 8 (RN-11)', () => {
    const r = progresoDeSemana(
      [p('2026-11-08', 180), p('2026-11-09', 120), p('2026-11-11', 90)],
      '2026-11-13',
      meta(5),
    );
    expect(r.horasSemana).toBe(3.5);
    expect(r.porcentajeHoras).toBe(70);
  });

  it('H-02.2: la partida de 150 min del domingo 15 suma 2,5 h a la semana del 9 al 15 y el lunes 16 la semana empieza en 0 h (RN-03, RN-11)', () => {
    const partidas = [p('2026-11-15', 150)];
    expect(progresoDeSemana(partidas, '2026-11-15', meta(5)).horasSemana).toBe(2.5);
    expect(progresoDeSemana(partidas, '2026-11-16', meta(5)).horasSemana).toBe(0);
  });

  it('H-02.3: 7 h con meta de 5 h da 100 % y horasSemana 7 (RN-05)', () => {
    const r = progresoDeSemana([p('2026-11-10', 240), p('2026-11-12', 180)], '2026-11-13', meta(5));
    expect(r.horasSemana).toBe(7);
    expect(r.porcentajeHoras).toBe(100);
  });

  it('H-02.4: 5 h con meta de 8 h da 63 % y con meta de 4 h da 100 % (RN-04)', () => {
    const partidas = [p('2026-11-09', 300)];
    expect(progresoDeSemana(partidas, '2026-11-11', meta(8)).porcentajeHoras).toBe(63);
    expect(progresoDeSemana(partidas, '2026-11-11', meta(4)).porcentajeHoras).toBe(100);
  });

  it('H-02.5: con hoy miércoles 11 la partida del viernes 13 no suma (RN-10)', () => {
    const r = progresoDeSemana([p('2026-11-09', 180), p('2026-11-13', 120)], '2026-11-11', meta(5));
    expect(r.horasSemana).toBe(3);
  });

  it('H-02.6: sin meta da 4 h y porcentaje null; con meta de 5 h y sin partidas da 0 h y 0 % (RN-12)', () => {
    const sinMeta = progresoDeSemana(
      [p('2026-11-09', 60), p('2026-11-12', 90), p('2026-11-13', 90)],
      '2026-11-13',
      null,
    );
    expect(sinMeta.horasSemana).toBe(4);
    expect(sinMeta.porcentajeHoras).toBeNull();
    const sinPartidas = progresoDeSemana([], '2026-11-13', meta(5));
    expect(sinPartidas.horasSemana).toBe(0);
    expect(sinPartidas.porcentajeHoras).toBe(0);
  });

  it('H-02.7: las partidas previas a la meta cuentan: 3,5 h de 5 h y 70 % (RN-14)', () => {
    const r = progresoDeSemana([p('2026-11-09', 120), p('2026-11-11', 90)], '2026-11-13', meta(5));
    expect(r.horasSemana).toBe(3.5);
    expect(r.porcentajeHoras).toBe(70);
  });

  it('H-02.8: partidas de 24 h y 10 h el mismo día dan 34 h y 100 % con meta de 10 h (RN-18)', () => {
    const r = progresoDeSemana([p('2026-11-10', 1440), p('2026-11-10', 600)], '2026-11-13', meta(10));
    expect(r.horasSemana).toBe(34);
    expect(r.porcentajeHoras).toBe(100);
  });

  it('H-03.1: dos partidas el lunes 9 y una el miércoles 11 dan 2 días (RN-02)', () => {
    const r = progresoDeSemana(
      [p('2026-11-09', 30), p('2026-11-09', 90), p('2026-11-11', 60)],
      '2026-11-13',
      meta(5, 4),
    );
    expect(r.diasJugadosSemana).toBe(2);
  });

  it('H-03.2: el domingo 15 cuenta como día de la semana del 9 al 15 y el lunes 16 da 0 días (RN-03, RN-11)', () => {
    const partidas = [p('2026-11-15', 150)];
    expect(progresoDeSemana(partidas, '2026-11-15', meta(5, 4)).diasJugadosSemana).toBe(1);
    expect(progresoDeSemana(partidas, '2026-11-16', meta(5, 4)).diasJugadosSemana).toBe(0);
  });

  it('H-03.3: sin meta da 3 días; con meta de 4 días y sin partidas da 0 días (RN-12)', () => {
    const partidas = [p('2026-11-09', 60), p('2026-11-12', 60), p('2026-11-13', 60)];
    expect(progresoDeSemana(partidas, '2026-11-13', null).diasJugadosSemana).toBe(3);
    expect(progresoDeSemana([], '2026-11-13', meta(5, 4)).diasJugadosSemana).toBe(0);
  });

  it('H-03.4: con partidas el lunes 9 y el miércoles 11 y meta de 3 días da 2 días (RN-14)', () => {
    const r = progresoDeSemana([p('2026-11-09', 60), p('2026-11-11', 60)], '2026-11-13', meta(5, 3));
    expect(r.diasJugadosSemana).toBe(2);
  });

  it('H-03.5: dos partidas del martes 10 que suman 34 h cuentan 1 día (RN-18)', () => {
    const r = progresoDeSemana([p('2026-11-10', 1440), p('2026-11-10', 600)], '2026-11-13', meta(10));
    expect(r.diasJugadosSemana).toBe(1);
  });

  it('H-07.2: 2 h en 1 día con meta de 6 h y 3 días dan 33 % y 1 día (RN-19)', () => {
    const r = progresoDeSemana([p('2026-11-13', 120)], '2026-11-13', meta(6, 3));
    expect(r.horasSemana).toBe(2);
    expect(r.porcentajeHoras).toBe(33);
    expect(r.diasJugadosSemana).toBe(1);
  });
});
