
import type { ComponentProps, Dispatch, SetStateAction } from 'react';
import type { Ionicons, MaterialIcons } from '@expo/vector-icons';

export type StateSetter<T> = Dispatch<SetStateAction<T>>;
export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
export type TimeoutHandle = ReturnType<typeof setTimeout>;
