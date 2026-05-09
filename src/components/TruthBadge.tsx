import type { TruthMode } from '@/lib/schemas';

const STYLES: Record<string, { label_en: string; label_zh: string; bg: string; fg: string }> = {
  REAL: {
    label_en: 'REAL',
    label_zh: '真实数据',
    bg: '#10B981', // emerald-500
    fg: '#FFFFFF',
  },
  REAL_DERIVED: {
    label_en: 'REAL_DERIVED',
    label_zh: '真实派生',
    bg: '#0EA5E9', // sky-500
    fg: '#FFFFFF',
  },
  MIXED: {
    label_en: 'MIXED',
    label_zh: '混合',
    bg: '#F59E0B', // amber-500
    fg: '#000000',
  },
  SAMPLE_ONLY: {
    label_en: 'SAMPLE_ONLY',
    label_zh: '示例数据',
    bg: '#9CA3AF', // gray-400
    fg: '#FFFFFF',
  },
  FIXTURE_FALLBACK: {
    label_en: 'FIXTURE',
    label_zh: '占位数据',
    bg: '#9CA3AF',
    fg: '#FFFFFF',
  },
  UNKNOWN: {
    label_en: 'UNKNOWN',
    label_zh: '未知',
    bg: '#D1D5DB', // gray-300
    fg: '#1F2937', // gray-800
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
 *
 * Uses inline styles so colors are guaranteed to render regardless of
 * Tailwind purge configuration.
 */
export function TruthBadge({ mode, locale = 'en', label }: TruthBadgeProps) {
  const style = STYLES[mode] ?? STYLES.UNKNOWN;
  const text = label ?? (locale === 'zh' ? style.label_zh : style.label_en);
  return (
    <span
      data-testid="truth-badge"
      data-truth-mode={mode}
      className="inline-flex items-center rounded text-xs font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.fg,
        padding: '2px 8px',
      }}
      title={`data_truth_mode = ${mode}`}
    >
      {text}
    </span>
  );
}
