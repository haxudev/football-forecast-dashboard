'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/i18n';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('ff-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('ff-theme', theme);
}

export function ThemeLanguageControls({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const targetLocale = locale === 'zh' ? 'en' : 'zh';
  const localeHref = locale === 'zh' ? '/en/' : '/';
  const localeLabel = locale === 'zh' ? t.common.english : t.common.chinese;

  function chooseTheme(value: Theme) {
    setTheme(value);
    applyTheme(value);
  }

  return <div className="shell-controls" aria-label={`${t.common.theme} / ${t.common.language}`}>
    {(['light', 'dark'] as const).map(value => <button key={value} className={`control-pill ${theme === value ? 'active' : ''}`} type="button" onClick={() => chooseTheme(value)} aria-pressed={theme === value} aria-label={`${t.common.theme}: ${value === 'light' ? t.common.light : t.common.dark}`}>{value === 'light' ? t.common.light : t.common.dark}</button>)}
    <a className="control-pill" href={localeHref} hrefLang={targetLocale === 'zh' ? 'zh-CN' : 'en'}>{localeLabel}</a>
  </div>;
}
