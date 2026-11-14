import { describe, expect, it } from 'vitest';
import { calcularResumen, type PartidaDia } from './resumen';

const HOY = '2026-11-13';

function partida(dia: string, duracionMinutos: number, porcentajeAvance: number, createdAt: string): PartidaDia {
  return { dia, duracionMinutos, porcentajeAvance, createdAt: new Date(createdAt) };
}

describe('resumen', () => {
  it('D-P5.1: sin partidas da totalPartidas 0, horasTotales 0, ultimaPartida null y avance 0 (RN-12)', () => {
    expect(calcularResumen([], HOY)).toEqual({
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: 0,
    });
  });

  it('D-P5.2: 870 minutos dan 14,5 h y 100 minutos dan 1,67 h', () => {
    const muchas = [
      partida('2026-11-09', 300, 10, '2026-11-09T20:00:00Z'),
      partida('2026-11-10', 300, 20, '2026-11-10T20:00:00Z'),
      partida('2026-11-11', 270, 30, '2026-11-11T20:00:00Z'),
    ];
    expect(calcularResumen(muchas, HOY).horasTotales).toBe(14.5);
    expect(calcularResumen([partida('2026-11-12', 100, 40, '2026-11-12T20:00:00Z')], HOY).horasTotales).toBe(1.67);
  });

  it('D-P5.3: con dos partidas de la misma fecha gana la registrada después: avance 60 (RN-06)', () => {
    const primero = partida('2026-11-12', 30, 40, '2026-11-12T15:00:00Z');
    const despues = partida('2026-11-12', 30, 60, '2026-11-12T22:00:00Z');
    const resumen = calcularResumen([despues, primero], HOY);
    expect(resumen.porcentajeAvanceActual).toBe(60);
    expect(resumen.ultimaPartida).toBe('2026-11-12T00:00:00.000Z');
    expect(calcularResumen([primero, despues], HOY).porcentajeAvanceActual).toBe(60);
  });

  it('D-P5.4: una partida con fecha futura no suma horas ni define el avance (RN-10)', () => {
    const resumen = calcularResumen(
      [partida('2026-11-11', 60, 40, '2026-11-11T20:00:00Z'), partida('2026-11-14', 120, 90, '2026-11-10T20:00:00Z')],
      HOY,
    );
    expect(resumen).toEqual({
      totalPartidas: 1,
      horasTotales: 1,
      ultimaPartida: '2026-11-11T00:00:00.000Z',
      porcentajeAvanceActual: 40,
    });
  });
});
