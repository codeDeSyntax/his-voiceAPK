import type { Sermon } from '@/features/sermons/types';

export interface SearchMatch { paragraphIndex: number; context: string; fullParagraph: string }
export interface SermonSearchResult extends Pick<Sermon, 'id' | 'title' | 'year' | 'location'> {
  sentence: string;
  paragraphIndex: number;
  allMatches: SearchMatch[];
  totalMatches: number;
}
