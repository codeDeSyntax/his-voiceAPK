import type { Sermon } from '@/features/sermons/types';
export interface RecentSermon extends Pick<Sermon, 'id' | 'title' | 'date' | 'type' | 'location'> { openedAt: number }
