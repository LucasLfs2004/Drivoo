// Design Tokens para o Drivoo
import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sistema de escala responsiva
const scale = (size: number) => (screenWidth / 320) * size;
const verticalScale = (size: number) => (screenHeight / 568) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Paleta de cores baseada na identidade visual do Drivoo
export const colors = {
  // Azul principal - cor primária do Drivoo
  primary: {
    50: '#E6F3FF',
    100: '#CCE7FF',
    200: '#99CFFF',
    300: '#66B7FF',
    400: '#339FFF',
    500: '#0061CC', // Azul principal (#0061CC)
    600: '#004EA3',
    700: '#003B7A',
    800: '#002851',
    900: '#001528',
  },
  // Azul médio como cor secundária
  secondary: {
    50: '#E8F4FF',
    100: '#D1E9FF',
    200: '#A3D3FF',
    300: '#75BDFF',
    400: '#47A7FF',
    500: '#148AD9', // Azul médio (#148AD9)
    600: '#106EB7',
    700: '#0C5295',
    800: '#083673',
    900: '#041A51',
  },
  // Azul claro para acentos
  accent: {
    50: '#F0FCFF',
    100: '#E1F9FF',
    200: '#C3F3FF',
    300: '#A5EDFF',
    400: '#87E7FF',
    500: '#17C8FD', // Azul claro (#17C8FD)
    600: '#12A0CA',
    700: '#0E7897',
    800: '#095064',
    900: '#052831',
  },
  // Verde para sucesso e confirmações
  success: {
    50: '#E8F5F0',
    100: '#D1EBE1',
    200: '#A3D7C3',
    300: '#75C3A5',
    400: '#47AF87',
    500: '#13B57D', // Verde (#13B57D)
    600: '#0F9164',
    700: '#0B6D4B',
    800: '#074932',
    900: '#032419',
  },
  // Amarelo/laranja mantido para avisos
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FF9800', // Amarelo/laranja
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  // Paleta neutra expandida para suporte a dark/light mode
  neutral: {
    0: '#FFFFFF',    // Branco puro
    50: '#FAFAFA',   // Cinza muito claro
    100: '#F5F5F5',  // Cinza claro
    200: '#EEEEEE',  // Cinza claro médio
    300: '#E0E0E0',  // Cinza médio claro
    400: '#BDBDBD',  // Cinza médio
    500: '#9E9E9E',  // Cinza
    600: '#757575',  // Cinza escuro médio
    700: '#616161',  // Cinza escuro
    800: '#424242',  // Cinza muito escuro
    900: '#212121',  // Quase preto
    950: '#0A0A0A',  // Preto
  },
  // Paleta cinza azulado (cool gray) - baseada em #EBEEF1
  coolGray: {
    50: '#F8F9FA',   // Quase branco com toque azulado
    100: '#F3F5F7',  // Muito claro
    200: '#EBEEF1',  // Base - cor original
    300: '#DDE1E6',  // Claro
    400: '#C5CBD3',  // Médio claro
    500: '#A8B0BA',  // Médio
    600: '#8A94A0',  // Médio escuro
    700: '#6B7580',  // Escuro
    800: '#4D5660',  // Muito escuro
    900: '#2F3740',  // Quase preto azulado
  },
  // Cores semânticas usando a paleta definida
  semantic: {
    success: '#13B57D',  // Verde
    warning: '#FF9800',  // Amarelo/laranja
    error: '#F44336',    // Vermelho padrão
    info: '#148AD9',     // Azul médio
  },
  // Backgrounds neutros para facilitar dark/light mode
  background: {
    primary: '#FFFFFF',     // Fundo principal (branco)
    secondary: '#FAFAFA',   // Fundo secundário (cinza muito claro)
    tertiary: '#F5F5F5',    // Fundo terciário (cinza claro)
    elevated: '#FFFFFF',    // Fundo elevado (cards, modais)
    overlay: 'rgba(0, 0, 0, 0.5)', // Overlay para modais
  },
  // Textos com hierarquia clara
  text: {
    primary: '#212121',     // Texto principal (cinza muito escuro)
    secondary: '#616161',   // Texto secundário (cinza escuro)
    tertiary: '#9E9E9E',    // Texto terciário (cinza)
    disabled: '#BDBDBD',    // Texto desabilitado (cinza médio)
    inverse: '#FFFFFF',     // Texto inverso (branco)
    link: '#0061CC',        // Links (azul principal)
  },
  // Bordas e divisores
  border: {
    light: '#F5F5F5',      // Borda clara
    medium: '#E0E0E0',     // Borda média
    strong: '#BDBDBD',     // Borda forte
  },
};

// Tipografia
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: moderateScale(12),
    sm: moderateScale(14),
    md: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
    '3xl': moderateScale(30),
    '4xl': moderateScale(36),
  },
  lineHeight: {
    xs: moderateScale(16),
    sm: moderateScale(18),
    md: moderateScale(24),
    lg: moderateScale(28),
    xl: moderateScale(32),
    '2xl': moderateScale(36),
    '3xl': moderateScale(42),
    '4xl': moderateScale(48),
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Espaçamento
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  '2xl': moderateScale(48),
  '3xl': moderateScale(64),
};

// Sombras
export const shadows = {
  sm: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Bordas
export const borders = {
  radius: {
    none: 0,
    sm: moderateScale(4),
    md: moderateScale(12),
    lg: moderateScale(18),
    xl: moderateScale(24),
    full: 9999,
  },
  width: {
    none: 0,
    thin: PixelRatio.roundToNearestPixel(0.5),
    base: PixelRatio.roundToNearestPixel(1),
    thick: PixelRatio.roundToNearestPixel(2),
  },
};

// Utilitários de escala
export const scaleUtils = {
  scale,
  verticalScale,
  moderateScale,
  screenWidth,
  screenHeight,
  isTablet: screenWidth >= 768,
};

// Tema completo
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  scaleUtils,
};

export type Theme = typeof theme;