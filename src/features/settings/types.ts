import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { useRouter } from 'expo-router';
import type { AppTheme } from '@/shared/theme/types';
export interface ReaderSettings {
  darkMode: boolean;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  accentColor?: string;
  numberOfColumns?: number;
}

export interface DisplaySettingsProps {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  fontFamily: string;
  setFontFamily: Dispatch<SetStateAction<string>>;
  accentColor: string;
  navigation: ReturnType<typeof useRouter>;
  compact?: boolean;
}

export interface FontFamilySheetProps {
  visible: boolean;
  onClose: () => void;
  fontFamily: string;
  setFontFamily: Dispatch<SetStateAction<string>>;
  FONT_OPTIONS: FontOption[];
  theme: AppTheme;
}

export interface TextPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  fontFamily: string;
  fontSize: number;
  getCurrentFontName: () => string;
  navigation: ReturnType<typeof useRouter>;
  theme: AppTheme;
}

export interface FontSizeSheetProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  selectFontSize: (size: number) => void;
  getFontSizeLabel: (size: number) => string;
  FONT_SIZE_OPTIONS: FontSizeOption[];
  theme: AppTheme;
}

export interface SettingsRowProps {
  icon: SettingsIconName;
  title: string;
  subtitle: string;
  children?: ReactNode;
  onPress?: () => void;
  theme: AppTheme;
}

export interface SavingModalProps {
  visible: boolean;
  theme: AppTheme;
}

export interface SettingsHeaderProps {
  theme: AppTheme;
  accentColor: string;
  compact?: boolean;
}
export interface FontOption { name: string; value: string }
export interface FontSizeOption { label: string; value: number }

export type SettingsIconName = ComponentProps<typeof Ionicons>['name'];

export interface AppSettingsProps {
  theme: AppTheme;
  router: ReturnType<typeof useRouter>;
  compact?: boolean;
}

export interface SettingItemProps {
  theme: AppTheme;
  icon: SettingsIconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  disabled?: boolean;
  rightIcon?: SettingsIconName;
  rightElement?: ReactNode;
}
