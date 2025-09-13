import axios from 'axios';

export interface VersionInfo {
  currentVersion: string;
  buildDate: string;
  buildTime: string;
}

export interface UpdateStatus {
  checking: boolean;
  available: boolean;
  installing: boolean;
  error: string | null;
  success: boolean;
}

export interface UpdateCheckResponse {
  available: boolean;
  latestVersion: string;
  downloadUrl?: string;
  changelog?: string;
}

// Declare global variables that will be injected at build time
declare global {
  const __APP_VERSION__: string;
  const __BUILD_DATE__: string;
  const __BUILD_TIME__: string;
}

class VersionService {
  /**
   * Get version endpoint URL from current server
   */
  private getVersionEndpoint(): string {
    return `${window.location.origin}/version.json`;
  }
  
  /**
   * Get current version information from build-time injected variables
   */
  getCurrentVersion(): VersionInfo {
    return {
      currentVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.2.0',
      buildDate: typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().split('T')[0],
      buildTime: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toTimeString().split(' ')[0]
    };
  }

  /**
   * Check for available updates from current server
   */
  async checkForUpdates(): Promise<UpdateCheckResponse> {
    try {
      const versionEndpoint = this.getVersionEndpoint();
      const response = await axios.get(versionEndpoint, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      const serverVersion = response.data;
      const currentVersion = this.getCurrentVersion().currentVersion;
      
      // Server should return { version: "0.2.1", buildDate: "2025-01-13", buildTime: "14:30:00" }
      const latestVersion = serverVersion.version || serverVersion.currentVersion;
      
      if (!latestVersion) {
        throw new Error('Invalid version information received from server.');
      }

      const available = this.isNewerVersion(latestVersion, currentVersion);

      return {
        available,
        latestVersion,
        downloadUrl: window.location.origin,
        changelog: serverVersion.changelog || 'New version available'
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      
      // Check if this is a network error or server error
      if (axios.isAxiosError(error)) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          throw new Error('Failed to check for updates. Please check your internet connection.');
        } else if (error.response?.status === 404) {
          throw new Error('Version information not available on this server.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied when checking for updates.');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('Server is currently unavailable. Please try again later.');
        }
      }
      
      // Generic error for unknown issues
      throw new Error('Unable to check for updates. Please try again later.');
    }
  }

  /**
   * Perform update using service worker mechanism
   */
  async performUpdate(): Promise<void> {
    try {
      // Check if service worker is available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          // First, check if there's a waiting service worker (new version ready)
          if (registration.waiting) {
            // Tell the waiting service worker to skip waiting and take control
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            return new Promise((resolve) => {
              const handleControllerChange = () => {
                navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                window.location.reload();
                resolve();
              };
              
              // Listen for the controlling service worker change
              navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
              
              // Fallback: if no controller change happens within 5 seconds, force reload
              setTimeout(() => {
                navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                window.location.reload();
                resolve();
              }, 5000);
            });
          } else {
            // No waiting service worker, try to update
            await registration.update();
            
            // Check again after update
            const updatedRegistration = await navigator.serviceWorker.getRegistration();
            if (updatedRegistration && updatedRegistration.waiting) {
              // New version found after update
              updatedRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
              
              return new Promise((resolve) => {
                const handleControllerChange = () => {
                  navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                  window.location.reload();
                  resolve();
                };
                
                navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
                
                setTimeout(() => {
                  navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
                  window.location.reload();
                  resolve();
                }, 5000);
              });
            } else {
              // No update available or already updated
              window.location.reload();
            }
          }
        } else {
          // No service worker registration, fallback to simple reload
          window.location.reload();
        }
      } else {
        // Service worker not supported, fallback to simple reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to perform update:', error);
      throw new Error('Failed to install update. Please refresh the page manually.');
    }
  }

  /**
   * Compare two semantic version strings
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const parseVersion = (version: string) => {
      return version.split('.').map(num => parseInt(num, 10));
    };

    const latestParts = parseVersion(latest);
    const currentParts = parseVersion(current);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }

  /**
   * Get update server status
   */
  async getServerStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const versionEndpoint = this.getVersionEndpoint();
      await axios.head(versionEndpoint, { timeout: 5000 });
      return { available: true, message: 'Update server is available' };
    } catch (error) {
      return { available: false, message: 'Update server is unavailable' };
    }
  }
}

export default new VersionService();