import type { BuiltinLedgeTab, LedgePreferences, LedgeTab } from '../types/ledge';

export type ClipboardCategory =
  | 'text'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'color'
  | 'link'
  | 'binary';

export interface ClassifiedClipMeta {
  category: ClipboardCategory;
  badgeCode: string;
  accentHex?: string;
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'heic', 'psd', 'fig']);
const VIDEO_EXTS = new Set(['mp4', 'mkv', 'webm', 'mov', 'avi', 'm4v']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus']);
const ARCHIVE_EXTS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg', 'msix']);
const DOC_EXTS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md', 'txt', 'rtf', 'epub']);
const CODE_EXTS = new Set([
  'cs', 'csproj', 'hlsl', 'ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'cpp', 'c', 'h',
  'java', 'kt', 'swift', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css', 'sql', 'ps1', 'sh',
]);

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_COLOR_RE = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i;
const URL_RE = /^https?:\/\/[^\s]+$/i;

/**
 * Classifies any copied text, code snippet, color, URL, or A-to-Z file extension
 * so Universal Clipboard can display accurate previews and filter categories.
 */
export function classifyClipboardPayload(
  rawTextOrFilename: string,
  mimeType?: string
): ClassifiedClipMeta {
  const trimmed = rawTextOrFilename.trim();

  if (mimeType) {
    if (mimeType.startsWith('image/')) return { category: 'image', badgeCode: 'IMG' };
    if (mimeType.startsWith('video/')) return { category: 'video', badgeCode: 'VID' };
    if (mimeType.startsWith('audio/')) return { category: 'audio', badgeCode: 'AUD' };
    if (mimeType === 'application/pdf') return { category: 'document', badgeCode: 'PDF' };
    if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return { category: 'archive', badgeCode: 'ZIP' };
    }
  }

  // Check hex / rgb color
  if (HEX_COLOR_RE.test(trimmed)) {
    return { category: 'color', badgeCode: 'HEX', accentHex: trimmed };
  }
  if (RGB_COLOR_RE.test(trimmed)) {
    return { category: 'color', badgeCode: 'RGB', accentHex: trimmed };
  }

  // Check URL
  if (URL_RE.test(trimmed)) {
    return { category: 'link', badgeCode: 'URL' };
  }

  // Check file extension (A to Z support)
  const dotIdx = trimmed.lastIndexOf('.');
  if (dotIdx > 0 && dotIdx < trimmed.length - 1 && !trimmed.includes(' ') && !trimmed.includes('\n')) {
    const ext = trimmed.slice(dotIdx + 1).toLowerCase();
    const upper = ext.toUpperCase().slice(0, 4);
    if (IMAGE_EXTS.has(ext)) return { category: 'image', badgeCode: upper };
    if (VIDEO_EXTS.has(ext)) return { category: 'video', badgeCode: upper };
    if (AUDIO_EXTS.has(ext)) return { category: 'audio', badgeCode: upper };
    if (ARCHIVE_EXTS.has(ext)) return { category: 'archive', badgeCode: upper };
    if (DOC_EXTS.has(ext)) return { category: 'document', badgeCode: upper };
    if (CODE_EXTS.has(ext)) return { category: 'code', badgeCode: upper };
    if (/^[a-z0-9]{1,6}$/.test(ext)) {
      return { category: 'binary', badgeCode: upper };
    }
  }

  // Heuristic for code snippets
  if (
    trimmed.includes('function ') ||
    trimmed.includes('const ') ||
    trimmed.includes('public ') ||
    trimmed.includes('import ') ||
    trimmed.startsWith('{') ||
    trimmed.includes('dotnet ') ||
    trimmed.includes('=>')
  ) {
    return { category: 'code', badgeCode: 'CODE' };
  }

  return { category: 'text', badgeCode: 'TXT' };
}

/**
 * Reorders an ordered array of tab/tile IDs cleanly without mutating the input array.
 */
export function moveOrderedItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const targetIndex = index + direction;
  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
    return [...items];
  }
  const copy = [...items];
  const [picked] = copy.splice(index, 1);
  copy.splice(targetIndex, 0, picked);
  return copy;
}

export interface BatteryEtaEstimate {
  minutesToFull: number | null;
  minutesRemainingOnBattery: number | null;
  formattedEta: string;
}

/**
 * Computes realistic battery time-to-full ETA (when charging at wattageW)
 * or remaining runtime (when discharging at loadW) for a given Wh battery pack.
 */
export function computeBatteryEta(
  batteryPct: number,
  isCharging: boolean,
  wattageW: number,
  capacityWh = 68
): BatteryEtaEstimate {
  const clampedPct = Math.max(0, Math.min(100, batteryPct));

  if (isCharging) {
    if (clampedPct >= 100) {
      return {
        minutesToFull: 0,
        minutesRemainingOnBattery: null,
        formattedEta: 'Fully charged',
      };
    }
    const remainingWh = ((100 - clampedPct) / 100) * capacityWh;
    // Account for CC/CV taper above 80% state of charge
    const taperFactor = clampedPct > 80 ? 0.62 : 0.88;
    const effectiveWatts = Math.max(5, wattageW * taperFactor);
    const mins = Math.max(1, Math.round((remainingWh / effectiveWatts) * 60));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {
      minutesToFull: mins,
      minutesRemainingOnBattery: null,
      formattedEta: h > 0 ? `${h}h ${m}m to full` : `${m} min to 100%`,
    };
  }

  const availableWh = (clampedPct / 100) * capacityWh;
  const drainW = Math.max(4, wattageW);
  const minsLeft = Math.max(1, Math.round((availableWh / drainW) * 60));
  const h = Math.floor(minsLeft / 60);
  const m = minsLeft % 60;
  return {
    minutesToFull: null,
    minutesRemainingOnBattery: minsLeft,
    formattedEta: h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`,
  };
}

/**
 * Matches a KeyboardEvent descriptor against a stored shortcut like "Alt+L" or "Alt+Space".
 */
export function matchesShortcutCombo(
  event: { altKey: boolean; ctrlKey: boolean; shiftKey: boolean; metaKey: boolean; code: string; key: string },
  combo: string
): boolean {
  const parts = combo.split('+').map((p) => p.trim().toLowerCase());
  const wantAlt = parts.includes('alt');
  const wantCtrl = parts.includes('ctrl') || parts.includes('control');
  const wantShift = parts.includes('shift');
  const mainKey = parts.find(
    (p) => p !== 'alt' && p !== 'ctrl' && p !== 'control' && p !== 'shift'
  );
  if (!mainKey) return false;
  if (event.altKey !== wantAlt || event.ctrlKey !== wantCtrl || event.shiftKey !== wantShift) {
    return false;
  }

  if (mainKey === 'space') {
    return event.code === 'Space' || event.key === ' ';
  }
  return (
    event.key.toLowerCase() === mainKey ||
    event.code.toLowerCase() === `key${mainKey}`
  );
}

/**
 * Checks whether a specific tab is enabled in current preferences.
 */
export function isTabEnabledInPrefs(tab: LedgeTab, prefs: LedgePreferences): boolean {
  if (!prefs) return true;
  if (tab.startsWith('custom_')) {
    return Boolean(prefs.customWidgetTabs?.some((ct) => ct.id === tab && ct.enabled));
  }
  const builtin = tab as BuiltinLedgeTab;
  if (builtin === 'ai' && !prefs.aiEnabled) return false;
  return Boolean(prefs.enabledTabs?.[builtin]);
}

