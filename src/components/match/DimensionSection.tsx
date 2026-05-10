// src/components/match/DimensionSection.tsx
// design §5.1 — `<details>` 包裹的维度 section + DimStatus chip 4 态。
import type { DimStatus, DimStatusValue } from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';

export interface DimensionSectionProps {
  id: string;
  title: string;
  status: DimStatus;
  t: Dictionary;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function DimStatusChip({ status, t }: { status: DimStatus; t: Dictionary }) {
  const v = status.status;
  if (v === 'READY') return null; // ready 不显示 chip（design §5.1.1）
  const cfg: Record<Exclude<DimStatusValue, 'READY'>, { cls: string; label: string; tip: string }> = {
    STUB: { cls: 'chip-stub', label: t.dimStatusChip.stub, tip: t.dimStatusChip.stubTip },
    DEGRADED: { cls: 'chip-degraded', label: t.dimStatusChip.degraded, tip: t.dimStatusChip.degradedTip },
    MISSING: { cls: 'chip-missing', label: t.dimStatusChip.missing, tip: t.dimStatusChip.missingTip },
  };
  const c = cfg[v];
  return (
    <span
      className={`chip ${c.cls}`}
      data-dim-status={v}
      title={c.tip}
      aria-label={`${c.label} — ${c.tip}`}
    >
      {c.label}
    </span>
  );
}

export function DimensionSection({
  id,
  title,
  status,
  t,
  defaultOpen = true,
  children,
}: DimensionSectionProps) {
  return (
    <details id={id} className="dim-section" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <DimStatusChip status={status} t={t} />
      </summary>
      <div className="dim-section-body">{children}</div>
    </details>
  );
}
