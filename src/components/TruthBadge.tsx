import type { TruthMode } from '@/lib/schemas';

const STYLES: Record<string, { label_en: string; label_zh: string; cls: string }> = {
  REAL: {
    label_en: 'REAL',
    label_zh: '真实数据',
    cls: 'bg-emerald-500 text-white',
  },
  REAL_DERIVED: {
    label_en: 'REAL_DERIVED',
    label_zh: '真实派生',
    cls: 'bg-sky-500 text-white',
  },
  MIXED: {
    label_en: 'MIXED',
    label_zh: '混合',
    cls: 'bg-amber-500 text-black',
  },
  SAMPLE_ONLY: {
    label_en: 'SAMPLE_ONLY',
    label_zh: '示例数据',
    cls: 'bg-gray-400 text-white',
  },
  FIXTURE_FALLBACK: {
    label_en: 'FIXTURE',
    label_zh: '占位数据',
    cls: 'bg-gray-400 text-white',
  },
  UNKNOWN: {
    label_en: 'UNKNOWN',
    label_zh: '未知',
    cls: 'bg-gray-300 text-gray-800',
  },
};

interface TruthBadgeProps {
  mode: string;  // accept any string so SAMPLE_ONLY etc. round-trip even when zod is bypassed
  locale?: 'zh' | 'en';
  label?: string;  // optional override label (e.g. competition name)
}

/**
 * P5 Sprint 3 / FB-2 — Truth Badge UI component.
 *
 * Color encoding (per sprint-contract §C-3 G6.2):
 *   REAL → emerald (live real-world data)
 *   REAL_DERIVED → sky (derived from real public sources, e.g. Elo)
 *   MIXED → amber (partial real + fallback)
 *   SAMPLE_ONLY → gray (no real backbone)
 */
export function TruthBadge({ mode, locale = 'en', label }: TruthBadgeProps) {
  const style = STYLES[mode] ?? STYLES.UNKNOWN;
  const text = label ?? (locale === 'zh' ? style.label_zh : style.label_en);
  return (
    <span
      data-testid="truth-badge"
      data-truth-mode={mode}
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${style.cls}`}
      title={`data_truth_mode = ${mode}`}
    >
      {text}
    </span>
  );
}
