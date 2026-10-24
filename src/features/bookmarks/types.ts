import type { Sermon } from '@/features/sermons/types';

export interface Bookmark {
  id: string;
  sermon: Sermon;
  paragraphIndex: number;
  paragraphText: string;
  date: string;
}
