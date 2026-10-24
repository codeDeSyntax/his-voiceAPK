import type { ComponentProps, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/shared/theme/types';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface MenuAnchor {
  right: number;
  bottom: number;
}

export interface AppBarMenuProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  bookmarkCount?: number;
  recentCount?: number;
  anchor?: MenuAnchor;
}

export interface ActionRowProps {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  theme: AppTheme;
  isLast?: boolean;
  badge?: number;
}

export interface CountBadgeProps {
  count: number;
  theme: AppTheme;
}

export interface SpinnerProps {
  backgroundColor?: string;
  compact?: boolean;
  size?: number;
}

export interface GlassButtonProps {
  theme: AppTheme;
  size?: number;
  onPress?: () => void;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export interface GlassTileProps extends GlassButtonProps {
  selected?: boolean;
  compact?: boolean;
  borderRadius?: number;
  testID?: string;
}

export interface ReleaseData {
  latestVersion: string;
  currentVersion: string;
  apkUrl: string;
  releaseName: string;
  mandatory: boolean;
}

export type UpdateType = 'apk' | 'ota';
