
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  SETTINGS: 'sermonSettings',
  LAST_POSITIONS: 'sermonLastPositions',
  BOOKMARKS: 'sermonBookmarks',
  HIGHLIGHTS: 'sermonHighlights',
  LAST_SERMON: 'lastOpenedSermon',
  LAST_SCREEN: 'lastVisitedScreen',
  NAVIGATION_HISTORY: 'navigationHistory',
} as const;

export function parseStored<T>(value: string | null, fallback: T): T {
  if (value === null) return fallback;
  try { return JSON.parse(value) as T; }
  catch { return fallback; }
}

// Serialize writes for each key so a slower write cannot replace a newer value.
const writes = new Map<string, Promise<void>>();
export function writeStored(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  const next = (writes.get(key) ?? Promise.resolve())
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(key, serialized));
  writes.set(key, next);
  void next.finally(() => { if (writes.get(key) === next) writes.delete(key); }).catch(() => undefined);
  return next;
}
