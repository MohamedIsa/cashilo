export type Theme = {
  mode: 'light' | 'dark';
  background: string;
  primaryText: string;
  headline: string;
  primary: string;
  secondary: string;
  warning: string;
  error: string;
  card: string;
  border: string;
};

const commonColors: Omit<
  Theme,
  'mode' | 'background' | 'primaryText' | 'headline' | 'card' | 'border'
> = {
  primary: '#00B8D9',
  secondary: '#36B37E',
  warning: '#FFAB00',
  error: '#FF5630',
};

export const lightTheme: Theme = {
  mode: 'light',
  background: '#F9F9F9',
  primaryText: '#333333',
  headline: '#1E2A38',
  card: '#ECECEC',
  border: '#121212',
  ...commonColors,
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#121212',
  primaryText: '#FFFFFF',
  headline: '#E0E0E0',
  card: '#1E1E1E',
  border: '#F9F9F9',
  ...commonColors,
};

/* ────────────────────────────────────────────────────────────────────────
 * Design tokens
 * Shared, theme-agnostic scales for spacing, radius, typography and shadows.
 * Use these instead of magic numbers when building/redesigning screens so the
 * whole app stays visually consistent.
 * ──────────────────────────────────────────────────────────────────────── */

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner radii. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Type scale: { fontSize, fontWeight, lineHeight }. */
export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  heading: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
} as const;

/** Elevation presets (iOS shadow + Android elevation). */
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Returns an alpha-blended hex by appending a two-digit opacity suffix.
 * e.g. withAlpha('#00B8D9', 0.13) → '#00B8D921'. Keeps tint usage readable.
 */
export function withAlpha(hexColor: string, opacity: number): string {
  const clamped = Math.max(0, Math.min(1, opacity));
  const suffix = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${suffix}`;
}
