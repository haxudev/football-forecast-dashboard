import { describe, expect, it } from 'vitest';
import { isPackStale, isPredictorDisabled } from './status';
import { loadAllPredictions, loadManifest } from './data';

describe('forecast pack schemas', () => {
  it('loads manifest and predictions', () => {
    const manifest = loadManifest();
    expect(manifest.competitions.length).toBeGreaterThan(0);
    expect(loadAllPredictions().length).toBeGreaterThan(0);
  });

  it('applies stale and disabled pack thresholds', () => {
    const now = new Date('2026-05-08T12:00:00Z');
    expect(isPackStale('2026-05-07T11:30:00Z', now)).toBe(true);
    expect(isPredictorDisabled('2026-05-05T11:30:00Z', now)).toBe(true);
    expect(isPredictorDisabled('2026-05-07T11:30:00Z', now)).toBe(false);
  });
});
