import type { ComponentProps, ReactNode } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type AboutIconName = ComponentProps<typeof Ionicons>['name'];

export interface AboutCardProps {
  icon: AboutIconName;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  delay?: number;
  cardId: string;
}
