import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const;
