import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Meta } from './Meta.model';

const videojuego = new mongoose.Types.ObjectId();

function meta(cambios: Record<string, unknown> = {}) {
  return new Meta({ videojuego, horasSemanales: 5, diasPorSemana: 4, hitos: [], ...cambios });
}

/** Rutas del esquema con error, o [] si la meta es válida. */
function errores(doc: InstanceType<typeof Meta>): string[] {
  return Object.keys(doc.validateSync()?.errors ?? {});
}

const hito = (descripcion: string, porcentajeObjetivo = 50) => ({ descripcion, porcentajeObjetivo });

describe('modelo Meta', () => {
  it('H-01.1: acepta una meta de 5 h, 4 días y el hito "Llegar al 50 %" (RN-13)', () => {
    const doc = meta({ hitos: [hito('Llegar al 50 %')] });
    expect(errores(doc)).toEqual([]);
    expect(doc.activa).toBe(true);
    expect(doc.hitos[0].descripcion).toBe('Llegar al 50 %');
  });

  it('H-01.2: rechaza 0 h y 100,5 h y acepta 0,5 h y 100 h (RN-13)', () => {
    expect(errores(meta({ horasSemanales: 0 }))).toContain('horasSemanales');
    expect(errores(meta({ horasSemanales: 100.5 }))).toContain('horasSemanales');
    expect(errores(meta({ horasSemanales: 0.5 }))).toEqual([]);
    expect(errores(meta({ horasSemanales: 100 }))).toEqual([]);
  });

  it('H-01.3: rechaza 0 y 8 días y días no enteros, y acepta 1 y 7 (RN-13)', () => {
    expect(errores(meta({ diasPorSemana: 0 }))).toContain('diasPorSemana');
    expect(errores(meta({ diasPorSemana: 8 }))).toContain('diasPorSemana');
    expect(errores(meta({ diasPorSemana: 3.5 }))).toContain('diasPorSemana');
    expect(errores(meta({ diasPorSemana: 1 }))).toEqual([]);
    expect(errores(meta({ diasPorSemana: 7 }))).toEqual([]);
  });

  it('H-01.4: rechaza un sexto hito y objetivos de 0 y 101, y acepta dos hitos del 50 % (RN-13)', () => {
    const seis = [10, 20, 30, 40, 50, 60].map((o) => hito(`Llegar al ${o} %`, o));
    expect(errores(meta({ hitos: seis }))).toContain('hitos');
    expect(errores(meta({ hitos: [hito('Cero', 0)] }))).toContain('hitos.0.porcentajeObjetivo');
    expect(errores(meta({ hitos: [hito('Más de cien', 101)] }))).toContain('hitos.0.porcentajeObjetivo');
    expect(errores(meta({ hitos: [hito('Mitad', 50), hito('Mitad otra vez', 50)] }))).toEqual([]);
  });

  it('H-01.5: rechaza texto de hito vacío, solo espacios o de 61 caracteres, y acepta 60 y recorta espacios (RN-17)', () => {
    expect(errores(meta({ hitos: [hito('')] }))).toContain('hitos.0.descripcion');
    expect(errores(meta({ hitos: [hito('   ')] }))).toContain('hitos.0.descripcion');
    expect(errores(meta({ hitos: [hito('x'.repeat(61))] }))).toContain('hitos.0.descripcion');
    expect(errores(meta({ hitos: [hito('x'.repeat(60))] }))).toEqual([]);
    const conEspacios = meta({ hitos: [hito('  Llegar al 50 % ')] });
    expect(errores(conEspacios)).toEqual([]);
    expect(conEspacios.hitos[0].descripcion).toBe('Llegar al 50 %');
  });
});
