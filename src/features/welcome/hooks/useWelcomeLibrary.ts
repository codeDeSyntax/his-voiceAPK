import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppContext } from '../../../providers/SermonProvider';
import { errorMessage } from '../../../shared/utils/errors';
import {
  databaseExists,
  downloadDatabaseWithSignal,
  getDatabaseStatus,
} from '../../sermons/data/downloadDatabase';

export const useWelcomeLibrary = () => {
  const router = useRouter();
  const { refreshSermons } = useAppContext();
  const [dbExists, setDbExists] = useState(false);
  const [dbNeedsUpdate, setDbNeedsUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const downloadControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const focusedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      downloadControllerRef.current?.abort();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      focusedRef.current = true;

      const refreshDatabaseState = async () => {
        // Returning to a running download must preserve its progress and errors.
        if (downloadControllerRef.current) return;

        // 1. Instant local offline check: if DB already exists, enable "Open sermons" immediately
        try {
          const locallyExists = await databaseExists();
          if (!isActive) return;
          if (locallyExists) {
            setDbExists(true);
            setIsChecking(false);
          } else {
            setIsChecking(true);
          }
        } catch {
          // Continue to status check
        }

        // 2. Check for release updates (with timeout)
        try {
          const status = await getDatabaseStatus();
          if (!isActive) return;
          setDbExists(status.exists);
          setDbNeedsUpdate(status.needsUpdate);
        } catch {
          if (!isActive) return;
          // A failed release lookup can still use a validated local database.
          try {
            const locallyExists = await databaseExists();
            if (!isActive) return;
            setDbExists(locallyExists);
          } catch {
            if (!isActive) return;
            setDbExists(false);
          }
          setDbNeedsUpdate(false);
        } finally {
          if (isActive) {
            setIsChecking(false);
            setIsDownloading(false);
            setDownloadProgress(0);
            setDownloadMessage('');
            setDownloadError(null);
          }
        }
      };

      void refreshDatabaseState();

      return () => {
        isActive = false;
        focusedRef.current = false;
      };
    }, []),
  );

  const handleDownloadDatabase = useCallback(async () => {
    if (isChecking || downloadControllerRef.current) return;

    const controller = new AbortController();
    downloadControllerRef.current = controller;
    setIsDownloading(true);
    setIsDone(false);
    setDownloadError(null);
    setDownloadProgress(0);
    setDownloadMessage('Preparing download...');

    try {
      const result = await downloadDatabaseWithSignal((percentage, message) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setDownloadProgress(percentage);
        setDownloadMessage(
          percentage >= 100 ? 'Preparing your library...' : message ?? '',
        );
      }, controller.signal);

      if (!mountedRef.current) return;
      if (controller.signal.aborted) throw new Error('Download cancelled.');
      if (!result.success) throw new Error('Download failed');

      const refreshed = await refreshSermons();
      if (!mountedRef.current) return;
      if (controller.signal.aborted) throw new Error('Download cancelled.');
      if (!refreshed) {
        throw new Error('The database was downloaded, but sermons could not be loaded. Please try again.');
      }

      setDownloadProgress(100);
      setDownloadMessage('Your sermons are ready.');
      setIsDone(true);
      setDbNeedsUpdate(false);
      setDbExists(true);
      setIsDownloading(false);
      if (focusedRef.current) router.replace('/sermons');
    } catch (error) {
      if (!mountedRef.current) return;
      if (controller.signal.aborted) {
        setDownloadError('Download cancelled.');
      } else {
        console.error('Download error:', error);
        setDownloadError(errorMessage(error) || 'Failed to download database');
      }
      setIsDone(false);
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadMessage('');
    } finally {
      if (downloadControllerRef.current === controller) {
        downloadControllerRef.current = null;
      }
    }
  }, [isChecking, refreshSermons, router]);

  const handleCancelDownload = useCallback(() => {
    downloadControllerRef.current?.abort();
  }, []);

  return {
    dbExists,
    dbNeedsUpdate,
    isChecking,
    isDownloading,
    downloadProgress,
    downloadMessage,
    downloadError,
    isDone,
    handleDownloadDatabase,
    handleCancelDownload,
  };
};
