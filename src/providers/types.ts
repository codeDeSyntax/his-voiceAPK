import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { Bookmark } from '@/features/bookmarks/types';
import type { RecentSermon } from '@/features/recents/types';
import type {
  HighlightColor,
  Highlights,
  ReadingPositions,
  Sermon,
} from '@/features/sermons/types';
import type { ReaderSettings } from '@/features/settings/types';
import type { AppTheme } from '@/shared/theme/types';
import type { SermonSearchResult } from '@/features/search/types';

export interface SermonProviderProps {
  children: ReactNode;
}

export interface SermonContextValue {
  selectedSermon: Sermon | null;
  setSelectedSermon: (sermon: Sermon | null) => Promise<void>;
  allSermons: Sermon[];
  textSermons: Sermon[];
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  searchPhrase: string;
  setSearchPhrase: Dispatch<SetStateAction<string>>;
  searchResults: SermonSearchResult[];
  setSearchResults: Dispatch<SetStateAction<SermonSearchResult[]>>;
  expandedSearchResults: Set<number>;
  setExpandedSearchResults: Dispatch<SetStateAction<Set<number>>>;
  error: string | null;
  loading: boolean;
  sermonsLoaded: boolean;
  theme: AppTheme;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  settings: ReaderSettings;
  setSettings: Dispatch<SetStateAction<ReaderSettings>>;
  lastReadPositions: ReadingPositions;
  updateLastReadPosition: (
    sermonId: Sermon['id'],
    paragraphIndex: number,
  ) => Promise<void>;
  getLastReadPosition: (sermonId: Sermon['id']) => number;
  handleRandomSermons: () => void;
  loadLastOpenedSermon: () => Promise<boolean>;
  updateSettings: (settings: Partial<ReaderSettings>) => Promise<boolean>;
  refreshSermons: () => Promise<boolean>;
  numberOfColumns: number;
  setNumberOfColumns: Dispatch<SetStateAction<number>>;
  filterSermonsByTag: (tag: string) => Sermon[];
  findSermonInState: (id: Sermon['id']) => Sermon | undefined;
  bookmarks: Bookmark[];
  addBookmark: (
    sermon: Sermon,
    paragraphIndex: number,
    paragraphText: string,
  ) => Promise<void>;
  removeBookmark: (sermon: Sermon, paragraphIndex: number) => Promise<void>;
  highlights: Highlights;
  addHighlight: (
    sermonId: Sermon['id'],
    paragraphIndex: number,
    color: HighlightColor,
  ) => Promise<void>;
  removeHighlight: (
    sermonId: Sermon['id'],
    paragraphIndex: number,
  ) => Promise<void>;
  getHighlight: (
    sermonId: Sermon['id'],
    paragraphIndex: number,
  ) => HighlightColor | null;
  recentSermons: RecentSermon[];
  readingFontsRevision: number;
}
