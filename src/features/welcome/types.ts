import type { AppTheme } from "@/shared/theme/types";

export interface WelcomeLibraryActionProps {
  theme: AppTheme;
  dbExists: boolean;
  dbNeedsUpdate: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  downloadError: string | null;
  onOpen: () => void;
  handleDownloadDatabase: () => Promise<void>;
  handleCancelDownload: () => void;
}
