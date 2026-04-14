import { Platform } from 'react-native';

export const GymFlowColors = {
  primary:       '#1565C0',
  primaryDark:   '#0D47A1',
  primaryLight:  '#1976D2',
  surface:       '#E3F2FD',
  surfaceAlt:    '#F4F9FF',
  background:    '#F0F4FF',
  white:         '#FFFFFF',
  textPrimary:   '#1A1A2E',
  textSecondary: '#5C6B8A',
  textMuted:     '#9BA1A6',
  border:        '#D0DCF4',
  danger:        '#E53935',
  success:       '#2E7D32',
};

const tintColorLight = GymFlowColors.primary;
const tintColorDark  = '#fff';

export const Colors = {
  light: {
    text:            GymFlowColors.textPrimary,
    background:      GymFlowColors.background,
    tint:            tintColorLight,
    icon:            GymFlowColors.textSecondary,
    tabIconDefault:  GymFlowColors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text:            '#ECEDEE',
    background:      '#151718',
    tint:            tintColorDark,
    icon:            '#9BA1A6',
    tabIconDefault:  '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
