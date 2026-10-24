import { documentDirectory } from 'expo-file-system/legacy';

export const DATABASE_NAME = 'sermons-db.db';
export const TEMP_DATABASE_NAME = `${DATABASE_NAME}.download`;

/** FileSystem and SQLite must use the same scoped directory in Expo Go. */
export function getDatabaseDirectory(): string {
  if (!documentDirectory) throw new Error('Expo document directory is unavailable');
  return `${documentDirectory.replace(/\/+$/, '')}/SQLite/`;
}

export function getDatabasePath(): string {
  return `${getDatabaseDirectory()}${DATABASE_NAME}`;
}
