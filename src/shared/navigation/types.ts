import type { useRouter } from 'expo-router';
export type AppRouter = ReturnType<typeof useRouter>;
export type ReaderRouteParams = {
  source?: string;
  searchPhrase?: string;
  sermonId?: string;
  initialParagraph?: string;
  scrollToParagraph?: string;
};
