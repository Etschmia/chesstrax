import { useState, useCallback } from 'react';
import versionService, { VersionInfo, UpdateStatus, UpdateCheckResponse } from '../services/versionService';

export interface UseVersionInfoReturn {
  versionInfo: VersionInfo;
  updateStatus: UpdateStatus & { upToDate: boolean };
  checkForUpdates: () => Promise<void>;
  performUpdate: () => Promise<void>;
  clearUpdateStatus: () => void;
}

export const useVersionInfo = (): UseVersionInfoReturn => {
  const [versionInfo] = useState<VersionInfo>(() => versionService.getCurrentVersion());
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus & { upToDate: boolean }>({
    checking: false,
    available: false,
    installing: false,
    error: null,
    success: false,
    upToDate: false
  });

  const checkForUpdates = useCallback(async () => {
    setUpdateStatus(prev => ({
      ...prev,
      checking: true,
      error: null,
      success: false,
      upToDate: false
    }));

    try {
      const updateInfo: UpdateCheckResponse = await versionService.checkForUpdates();
      
      setUpdateStatus(prev => ({
        ...prev,
        checking: false,
        available: updateInfo.available,
        upToDate: !updateInfo.available,
        error: null
      }));
    } catch (error) {
      setUpdateStatus(prev => ({
        ...prev,
        checking: false,
        available: false,
        upToDate: false,
        error: error instanceof Error ? error.message : 'Failed to check for updates'
      }));
    }
  }, []);

  const performUpdate = useCallback(async () => {
    setUpdateStatus(prev => ({
      ...prev,
      installing: true,
      error: null,
      success: false
    }));

    try {
      await versionService.performUpdate();
      
      setUpdateStatus(prev => ({
        ...prev,
        installing: false,
        success: true,
        available: false,
        error: null
      }));
    } catch (error) {
      setUpdateStatus(prev => ({
        ...prev,
        installing: false,
        error: error instanceof Error ? error.message : 'Failed to install update'
      }));
    }
  }, []);

  const clearUpdateStatus = useCallback(() => {
    setUpdateStatus({
      checking: false,
      available: false,
      installing: false,
      error: null,
      success: false,
      upToDate: false
    });
  }, []);

  return {
    versionInfo,
    updateStatus,
    checkForUpdates,
    performUpdate,
    clearUpdateStatus
  };
};