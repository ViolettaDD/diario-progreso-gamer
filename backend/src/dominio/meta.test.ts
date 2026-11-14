import { describe, expect, it } from 'vitest';
import { puedeTenerMetaActiva } from './meta';

describe('estados que admiten meta activa', () => {
  it('H-01.7: completado y abandonado no admiten meta activa; jugando y pausado sí (RN-07)', () => {
    expect(puedeTenerMetaActiva('jugando')).toBe(true);
    expect(puedeTenerMetaActiva('pausado')).toBe(true);
    expect(puedeTenerMetaActiva('completado')).toBe(false);
    expect(puedeTenerMetaActiva('abandonado')).toBe(false);
  });
});
