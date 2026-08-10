/**
 * Chart color tokens, per the dataviz skill's validated default palette
 * (light mode only — the rest of this app is light-mode, so charts match).
 * Categorical hues are assigned in FIXED order and never cycled/reassigned.
 */

export const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
] as const;

export const SEQUENTIAL_BLUE = {
  100: '#cde2fb',
  200: '#9ec5f4',
  300: '#6da7ec',
  400: '#3987e5',
  500: '#256abf',
  600: '#184f95',
  700: '#0d366b',
};

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const CHROME = {
  surface: '#ffffff',
  page: '#faf7f2',
  textPrimary: '#2b2320',
  textSecondary: '#4a3f39',
  muted: '#8c7f76',
  gridline: '#ede5da',
  baseline: '#d8b7c2',
  successText: '#356a49',
};

export const EXPENSE_CATEGORY_COLOR: Record<string, string> = {
  MAINTENANCE: CATEGORICAL[0],
  ACCESSORIES: CATEGORICAL[1],
  WASHING: CATEGORICAL[2],
  LABOUR: CATEGORICAL[3],
  INSURANCE: CATEGORICAL[4],
  REGISTRATION: CATEGORICAL[5],
  REPAIRS: CATEGORICAL[6],
  MISCELLANEOUS: CATEGORICAL[7],
};

export const tooltipContentStyle: React.CSSProperties = {
  background: CHROME.surface,
  border: `1px solid ${CHROME.gridline}`,
  borderRadius: 8,
  fontSize: 12,
  padding: '8px 10px',
  boxShadow: '0 4px 12px rgba(11,11,11,0.08)',
};

export const tooltipLabelStyle: React.CSSProperties = {
  color: CHROME.textPrimary,
  fontWeight: 600,
  marginBottom: 4,
};

export const axisTickStyle = { fill: CHROME.muted, fontSize: 11 };
