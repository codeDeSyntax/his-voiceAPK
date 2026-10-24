import type { AppTheme } from '../../shared/theme/types';

export interface Endnote {
  datecode: string | null;
  title: string | null;
  paragraph: string | null;
  quote: string | null;
  longQuote: string | null;
  keywords: string | null;
  fullEndnote: string;
}
export type EndnoteSearchType = 'ExactPhrase' | 'AllWords';
export interface BranhamSearchOptions { language?: string; searchType?: EndnoteSearchType; pageSize?: number; pageNumber?: number }
export interface BranhamHit {
  DocumentRecordId: string;
  RecordId: string;
  Properties: { DateCode: string; Title: string; Paragraph: string };
  Content?: string;
  Text?: string;
  HighlightedText?: string;
  Highlights?: string[];
  Score?: number;
}
export interface BranhamSearchPage {
  Results: BranhamHit[];
  TotalHits: number;
  PageSize: number;
  TotalPages?: number;
}
export interface BranhamSearchResponse extends Partial<BranhamSearchPage> {
  Result?: BranhamSearchPage;
  Status?: string;
  searchQuery?: string;
  searchType?: EndnoteSearchType;
  searchMethod?: string;
}
export type EndnotePaletteKey = 'blue' | 'gold' | 'sage' | 'indigo' | 'ruby' | 'metal';
export interface CachedEndnoteResults {
  byType?: Partial<Record<EndnoteSearchType, BranhamSearchResponse>>;
  results?: BranhamSearchResponse;
  searchType?: EndnoteSearchType;
  lastSearchType?: EndnoteSearchType;
}
export interface SermonSection { Paragraph: string; Content: string; IsHit?: boolean }
export interface BranhamSermonContent { Sections: SermonSection[] }
export interface EndnotePalette {
  isDark: boolean;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  accentSoft: string;
  highlightBg: string;
  highlightFg: string;
  divider: string;
  buttonTextOnAccent: string;
}
export interface EndnoteResultProperties {
  DateCode: string;
  Title: string;
  Paragraph: string;
  Fragment?: string;
}
export interface EndnoteSearchResult extends BranhamHit {
  Properties: EndnoteResultProperties;
}
export interface EndnoteParagraph {
  paraNum: number | null;
  text: string;
  isMatch?: boolean;
}
export interface EndnoteResultGroup {
  documentRecordId: string;
  items: EndnoteSearchResult[];
}
export interface EndnoteResultItemProps {
  items: EndnoteSearchResult[];
  isPrimary: boolean;
  isBestMatch: boolean;
  searchQuery: string;
  theme: AppTheme;
  palette: EndnotePalette;
  defaultExpanded: boolean;
  onFetchContent: (documentRecordId: string, recordId: string, datecode?: string) => Promise<void>;
  sermonContent?: BranhamSermonContent;
  isLoadingContent: boolean;
  searchType: EndnoteSearchType;
  targetParagraph?: number | null;
}
export interface EndnoteResultsProps {
  visible: boolean;
  onClose: () => void;
  endnoteData: Endnote | null;
  searchResults: BranhamSearchResponse | null;
  activeSearchType?: EndnoteSearchType;
  theme: AppTheme;
  endnotePalette?: EndnotePalette;
  isLoading: boolean;
  loadingSource?: string | null;
  onRetrySearch?: (searchType: EndnoteSearchType) => void;
  networkError?: boolean;
  embedded?: boolean;
}
