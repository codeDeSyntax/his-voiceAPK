import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/shared/theme/types';

export type SermonId = string | number;
export type SermonType = 'text' | 'mp3';

/** Lightweight list data. Text content is fetched separately from SQLite. */
export interface Sermon {
  id: SermonId;
  title: string;
  type: SermonType;
  date: string;
  year?: string | null;
  location?: string | null;
  sermon?: string | null;
  audioUrl?: string | null;
  downloadLink?: string | null;
  paragraph_count?: number | null;
  tags?: string[];
  lastReadParagraph?: number;
}

export interface TextSermon extends Sermon { type: 'text'; sermon: string }
export interface AudioSermon extends Sermon { type: 'mp3' }
export type HighlightColor = 'yellow' | 'green' | 'brown' | 'purple' | 'pink' | 'orange';
export type Highlights = Record<string, HighlightColor>;
export interface ReadingPosition { paragraph: number; timestamp: number }
export type ReadingPositions = Record<string, ReadingPosition | number>;
export type ParagraphLayouts = Record<number, { y: number; height: number }>;
export type FeedbackType = 'info' | 'success' | 'warning' | 'error';
export type ParagraphPickerMode = 'bookmark' | 'highlight';
export interface ParagraphSearchResult { index: number; paragraph: string; context: string; matchPosition: number }

export type SermonIconName = ComponentProps<typeof Ionicons>['name'];
export type SermonTypeFilter = 'all' | SermonType;
export type SermonSortOrder = 'asc' | 'desc';
export interface ListAppBarProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  totalCount: number;
  visibleCount: number;
  loading: boolean;
}
export interface SermonRowProps {
  item: Sermon;
  theme: AppTheme;
  lastRead: boolean;
  onPress: (sermon: Sermon) => void;
}
export interface CurrentSermonSearchProps {
  visible: boolean;
  onClose: () => void;
  paragraphs: string[];
  onNavigateToResult: (index: number, searchPhrase: string) => void;
  selectedSermon: Sermon | null;
}
export interface AudioPlayerProps { audioUrl: string | null; sermonTitle: string }
export interface AudioPlaylistProps {
  visible: boolean;
  onClose: () => void;
  currentSermon: Sermon | null;
  onSermonSelect: (sermon: Sermon) => void;
}
export interface TextSermonPlaylistProps {
  visible: boolean;
  onClose: () => void;
  currentSermon: Sermon | null;
  onSermonSelect: (sermon: Sermon) => void;
}
export interface BottomSheetControllerProps {
  theme: AppTheme;
  onOpenSearch: () => void;
  onScrollToPrev: () => void;
  onScrollToNext: () => void;
  onBookmarkPress: () => void;
  onHighlightPress: () => void;
  isVisible?: boolean;
}
export interface ReaderToolbarButtonProps {
  label: string;
  onPress: () => void;
  theme: AppTheme;
  children: ReactNode;
}
export interface SearchHeaderProps {
  theme: AppTheme;
  onSearchChange: (text: string) => void;
  onOpenViewOptions: () => void;
  hasActiveViewOptions: boolean;
  viewOptionsVisible: boolean;
  viewOptionsSummary: string;
}
export interface SermonViewOptionsProps {
  theme: AppTheme;
  visible: boolean;
  onClose: () => void;
  typeFilter: SermonTypeFilter;
  sortOrder: SermonSortOrder;
  onTypeFilterChange: (filter: SermonTypeFilter) => void;
  onSortOrderChange: (order: SermonSortOrder) => void;
  onReset: () => void;
  hasChanges: boolean;
}
export interface SearchFeedbackProps {
  isVisible: boolean;
  message?: string;
  theme: AppTheme;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}
export interface SermonListViewProps {
  theme: AppTheme;
  filteredSermons: Sermon[];
  handleSermonClick: (sermon: Sermon) => void;
  listHeaderComponent?: ReactElement | null;
  lastReadId?: Sermon['id'] | null;
}
export interface ParagraphPickerCircleProps {
  index: number;
  isCurrent: boolean;
  isSelected: boolean;
  bookmarked: boolean;
  hlHex: string | null;
  accent: string;
  subtle: string;
  isDark: boolean;
  onPress: (index: number) => void;
  mode: ParagraphPickerMode;
}
export interface ParagraphPickerSheetProps {
  visible: boolean;
  mode: ParagraphPickerMode;
  paragraphs: string[];
  currentParagraphIndex: number;
  selectedSermon: Sermon | null;
  theme: AppTheme;
  onClose: () => void;
}
export interface ParagraphTextProps {
  paragraph: string;
  index: number;
  theme: AppTheme;
  settings: import('../settings/types').ReaderSettings;
  selectedSermon: Sermon | null;
  searchPhrase: string;
  isSelected?: boolean;
  onLayout?: (event: import('react-native').LayoutChangeEvent) => void;
  onParagraphClick?: () => void;
  onEndnoteClick: (endnote: import('../endnotes/types').Endnote) => void;
}
