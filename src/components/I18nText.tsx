import {
  formatVenue,
  formatPosition,
  formatCountry,
  localizedTeamName,
  type Locale,
} from '@/lib/i18n';

type Kind = 'venue' | 'position' | 'country' | 'team' | 'manager';

interface Props {
  raw?: string | null;
  locale: Locale;
  kind: Kind;
}

/**
 * I18nText — 渲染数据字段名称，未命中词典时 fallback `{raw} [未翻译]` 灰色斜体。
 *
 * 判断逻辑：
 *   - raw 为空/null/undefined → 渲染 [未知]
 *   - locale=zh 且 fn(raw) 返回与 raw 相同（且 raw 是 ASCII）→ 认为未命中词典，fallback
 *   - 其他 → 直接返回词典值
 *
 * D-007 / D-010 落地：silent fallback 禁止，必须在 UI 明示 [未翻译]。
 */
export function I18nText({ raw, locale, kind }: Props) {
  const styleUntranslated = { color: '#94a3b8', fontStyle: 'italic' as const };

  if (!raw) {
    return (
      <span className="i18n-untranslated" data-untranslated="empty" style={styleUntranslated}>
        [未知]
      </span>
    );
  }

  let val: string;
  switch (kind) {
    case 'venue':
      val = formatVenue(raw, locale);
      break;
    case 'position':
      val = formatPosition(raw, locale);
      break;
    case 'country':
      val = formatCountry(raw, locale);
      break;
    case 'team':
      val = localizedTeamName(raw, locale);
      break;
    case 'manager':
      val = raw;
      break;
    default:
      val = raw;
  }

  // 仅当 locale=zh 且 val 仍是原始 ASCII 字符串时才标 [未翻译]
  if (locale === 'zh' && val === raw && /^[\x00-\x7F\s\-.'·]+$/.test(raw)) {
    return (
      <span
        className="i18n-untranslated"
        data-untranslated="true"
        title="未翻译"
        style={styleUntranslated}
      >
        {raw} <span aria-label="未翻译">[未翻译]</span>
      </span>
    );
  }

  return <span>{val}</span>;
}
