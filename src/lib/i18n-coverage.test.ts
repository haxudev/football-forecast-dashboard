import { describe, expect, it } from 'vitest';
import { POSITION_NAME_MAP, COUNTRY_NAME_MAP, VENUE_NAME_MAP } from './i18n';

describe('i18n coverage (G3 / Sprint contract §C-3)', () => {
  it('VENUE_NAME_MAP \u2265 72 keys', () => {
    expect(Object.keys(VENUE_NAME_MAP).length).toBeGreaterThanOrEqual(72);
  });

  it('POSITION_NAME_MAP \u2265 20 keys', () => {
    expect(Object.keys(POSITION_NAME_MAP).length).toBeGreaterThanOrEqual(20);
  });

  it('COUNTRY_NAME_MAP \u2265 50 keys', () => {
    expect(Object.keys(COUNTRY_NAME_MAP).length).toBeGreaterThanOrEqual(50);
  });

  it('all VENUE entries provide both zh and en', () => {
    for (const [k, v] of Object.entries(VENUE_NAME_MAP)) {
      expect(v.zh, `VENUE[${k}].zh`).toBeTruthy();
      expect(v.en, `VENUE[${k}].en`).toBeTruthy();
    }
  });

  it('all POSITION entries provide both zh and en', () => {
    for (const [k, v] of Object.entries(POSITION_NAME_MAP)) {
      expect(v.zh, `POSITION[${k}].zh`).toBeTruthy();
      expect(v.en, `POSITION[${k}].en`).toBeTruthy();
    }
  });
});
