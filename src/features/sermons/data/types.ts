import type { Sermon } from '../types';
export interface ParagraphRow { paragraph_index: number; paragraph_text: string }
export interface CountRow { count: number }
export interface StatusRow { value: string }
export type SermonRow = Sermon;
export interface DatabaseRelease {
  tagName: string;
  assetId: number | null;
  assetSize: number | null;
  publishedAt: string | null;
  downloadUrl: string;
  isFallback: boolean;
}
export interface LocalDatabaseRelease extends DatabaseRelease { downloadedAt?: string; localSize?: number; size?: number }
export type DownloadProgress = (percentage: number, message: string) => void;
