'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { Dictionary, Locale } from '@/lib/i18n';

const STORAGE_KEY = 'ff-locale';

function targetForLocale(pathname: string, currentLocale: Locale, target: Locale): string {
  // Map current path → equivalent path in target locale.
  let core = pathname || '/';
  if (currentLocale === 'en') {
    // strip leading /en
    core = core.replace(/^\/en(\/|$)/, '/') || '/';
  }
  if (!core.startsWith('/')) core = `/${core}`;
  if (target === 'zh') return core === '/' ? '/' : (core.endsWith('/') ? core : `${core}/`);
  // target en
  const trimmed = core === '/' ? '' : core.replace(/\/$/, '');
  return `/en${trimmed}/`;
}

export function LangMenu({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale === 'en' ? 'en' : 'zh-CN');
    }
  }, [locale]);

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

  const triggerLabel = locale === 'en' ? t.common.langEn : t.common.langZh;
  const items: { code: Locale; label: string; sub: string; href: string }[] = [
    { code: 'zh', label: '中文', sub: 'Chinese', href: targetForLocale(pathname, locale, 'zh') },
    { code: 'en', label: 'English', sub: '英文', href: targetForLocale(pathname, locale, 'en') },
  ];

  return (
    <div className="menu-root">
      <button
        ref={triggerRef}
        type="button"
        className="menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.common.languageLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🌐</span>
        <span className="menu-trigger-label">{triggerLabel}</span>
        <span aria-hidden="true" className="menu-caret">▾</span>
      </button>
      {open && (
        <div ref={menuRef} className="menu-pop" role="listbox" id={menuId} aria-label={t.common.languageLabel}>
          {items.map((it) => {
            const active = it.code === locale;
            return (
              <Link
                key={it.code}
                href={it.href}
                role="option"
                aria-selected={active}
                hrefLang={it.code === 'zh' ? 'zh-CN' : 'en'}
                className={`menu-item ${active ? 'is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="menu-item-label">{it.label}</span>
                <span className="menu-item-sub">{it.sub}</span>
                <span className="menu-item-check" aria-hidden="true">{active ? '✓' : ''}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
