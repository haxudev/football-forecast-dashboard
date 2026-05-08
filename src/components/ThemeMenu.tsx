'use client';

import { useEffect, useRef, useState, useId, useCallback, useSyncExternalStore } from 'react';
import type { Dictionary } from '@/lib/i18n';

type Mode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'ff-theme';

function readStored(): Mode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

function subscribeStorage(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

function applyEffective(mode: Mode) {
  if (typeof window === 'undefined') return;
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const effective: 'light' | 'dark' =
    mode === 'system' ? (prefersLight ? 'light' : 'dark') : mode;
  document.documentElement.dataset.theme = effective;
}

export function ThemeMenu({ t }: { t: Dictionary }) {
  const mode = useSyncExternalStore<Mode>(subscribeStorage, readStored, () => 'system');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  // Apply theme whenever mode changes
  useEffect(() => {
    applyEffective(mode);
  }, [mode]);

  // Listen for system theme change while mode === 'system'
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => applyEffective('system');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [mode]);

  const choose = useCallback((next: Mode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      // Manually dispatch a storage event so useSyncExternalStore re-reads.
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: next }));
    }
    applyEffective(next);
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Click outside to close + escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current || !triggerRef.current) return;
      if (menuRef.current.contains(e.target as Node) || triggerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const labelMap: Record<Mode, string> = {
    system: t.common.themeSystem,
    light: t.common.themeLight,
    dark: t.common.themeDark,
  };
  const iconMap: Record<Mode, string> = { system: '🖥', light: '☀️', dark: '🌙' };

  return (
    <div className="menu-root">
      <button
        ref={triggerRef}
        type="button"
        className="menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.common.themeLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{iconMap[mode]}</span>
        <span className="menu-trigger-label">{labelMap[mode]}</span>
        <span aria-hidden="true" className="menu-caret">▾</span>
      </button>
      {open && (
        <div ref={menuRef} className="menu-pop" role="listbox" id={menuId} aria-label={t.common.themeLabel}>
          {(['system', 'light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={mode === m}
              className={`menu-item ${mode === m ? 'is-active' : ''}`}
              onClick={() => choose(m)}
            >
              <span className="menu-item-icon" aria-hidden="true">{iconMap[m]}</span>
              <span className="menu-item-label">{labelMap[m]}</span>
              <span className="menu-item-check" aria-hidden="true">{mode === m ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
