import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

const lightPalette = {
  canvas: '#F6F3EC',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEBE1',
  elevated: '#FFFFFF',
  accent: '#2F6BFF',
  accentStrong: '#1D4ED8',
  accentSoft: '#DCE7FF',
  textPrimary: '#0B0B0D',
  textSecondary: '#4A4A4E',
  textMuted: '#8A8780',
  textInverse: '#F6F3EC',
  border: '#E5DFD1',
  borderStrong: '#1A1A1A',
  danger: '#FF3B2E',
  warning: '#F5A524',
  success: '#4ADE80',
  overlay: 'rgba(11, 11, 13, 0.08)',
} as const;

const darkPalette = {
  canvas: '#0B0B0D',
  surface: '#141417',
  surfaceAlt: '#1C1D21',
  elevated: '#25272C',
  accent: '#2F6BFF',
  accentStrong: '#7AA8FF',
  accentSoft: '#18284E',
  textPrimary: '#F2F1EC',
  textSecondary: '#A7A59D',
  textMuted: '#6A6A70',
  textInverse: '#F6F3EC',
  border: '#2A2C31',
  borderStrong: '#3B3E44',
  danger: '#FF3B2E',
  warning: '#F5A524',
  success: '#4ADE80',
  overlay: 'rgba(11, 11, 13, 0.72)',
} as const;

function createTheme(palette: typeof lightPalette | typeof darkPalette) {
  return {
    bgCanvas: palette.canvas,
    bgSurface: palette.surface,
    bgSurfaceAlt: palette.surfaceAlt,
    bgElevated: palette.elevated,
    accent: palette.accent,
    accentStrong: palette.accentStrong,
    accentSoft: palette.accentSoft,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    textInverse: palette.textInverse,
    border: palette.border,
    borderStrong: palette.borderStrong,
    danger: palette.danger,
    warning: palette.warning,
    success: palette.success,
    overlay: palette.overlay,

    // Compatibility aliases while old screens/components are still migrating.
    primary: palette.accent,
    primaryDark: palette.accentStrong,
    primaryLight: palette.accentSoft,
    surface: palette.surface,
    surfaceAlt: palette.surfaceAlt,
    background: palette.canvas,
    white: palette.surface,
  } as const;
}

export const GymFlowColors = createTheme(lightPalette);
export const GymFlowDarkColors = createTheme(darkPalette);

export type ThemeColors = typeof GymFlowColors;

export const Colors = {
  light: {
    text: GymFlowColors.textPrimary,
    background: GymFlowColors.bgCanvas,
    tint: GymFlowColors.accent,
    icon: GymFlowColors.textSecondary,
    tabIconDefault: GymFlowColors.textMuted,
    tabIconSelected: GymFlowColors.accent,
    card: GymFlowColors.bgSurface,
    border: GymFlowColors.border,
    notification: GymFlowColors.danger,
  },
  dark: {
    text: GymFlowDarkColors.textPrimary,
    background: GymFlowDarkColors.bgCanvas,
    tint: GymFlowDarkColors.accent,
    icon: GymFlowDarkColors.textSecondary,
    tabIconDefault: GymFlowDarkColors.textMuted,
    tabIconSelected: GymFlowDarkColors.accent,
    card: GymFlowDarkColors.bgSurface,
    border: GymFlowDarkColors.border,
    notification: GymFlowDarkColors.danger,
  },
} as const;

export const NavigationThemes: { light: Theme; dark: Theme } = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: GymFlowColors.accent,
      background: GymFlowColors.bgCanvas,
      card: GymFlowColors.bgSurface,
      text: GymFlowColors.textPrimary,
      border: GymFlowColors.border,
      notification: GymFlowColors.danger,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: GymFlowDarkColors.accent,
      background: GymFlowDarkColors.bgCanvas,
      card: GymFlowDarkColors.bgSurface,
      text: GymFlowDarkColors.textPrimary,
      border: GymFlowDarkColors.border,
      notification: GymFlowDarkColors.danger,
    },
  },
};

const platformFonts = Platform.select({
  ios: {
    sans: 'Manrope_500Medium',
    serif: 'Georgia',
    rounded: 'Manrope_600SemiBold',
    mono: 'JetBrainsMono_500Medium',
  },
  default: {
    sans: 'Manrope_500Medium',
    serif: 'serif',
    rounded: 'Manrope_600SemiBold',
    mono: 'JetBrainsMono_500Medium',
  },
  web: {
    sans: "'Manrope_500Medium', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Manrope_600SemiBold', system-ui, sans-serif",
    mono: "'JetBrainsMono_500Medium', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Fonts = {
  ...platformFonts,
  display: 'Anton_400Regular',
  body: 'Manrope_500Medium',
  bodyRegular: 'Manrope_400Regular',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  monoData: 'JetBrainsMono_500Medium',
  monoRegular: 'JetBrainsMono_400Regular',
} as const;
