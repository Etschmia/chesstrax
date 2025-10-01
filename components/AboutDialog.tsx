import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info, ExternalLink, Heart, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useVersionInfo } from '../hooks/useVersionInfo';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { versionInfo, updateStatus, checkForUpdates, performUpdate, clearUpdateStatus } = useVersionInfo();

  const handleUpdateCheck = () => {
    clearUpdateStatus();
    checkForUpdates();
  };

  const handleUpdate = () => {
    performUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-secondary rounded-2xl shadow-2xl border border-gray-tertiary w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-tertiary">
          <div className="flex items-center gap-3">
            <Info size={24} className="text-accent" />
            <h2 className="text-2xl font-bold text-text-primary">{t('about.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2"
            aria-label="Close about dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            
            {/* App Information */}
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-text-primary mb-2">
                  Chess<span className="text-accent">Trax</span>
                </h3>
                <p className="text-text-secondary text-lg">
                  {t('appDescription')}
                </p>
              </div>
            </div>

            {/* Version Information */}
            <div className="bg-gray-tertiary/30 rounded-lg p-4 space-y-3">
              <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Info size={18} />
                {t('about.versionInfo')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">{t('about.version')}:</span>
                  <div className="font-mono text-accent">{versionInfo.currentVersion}</div>
                </div>
                <div>
                  <span className="text-text-secondary">{t('about.buildDate')}:</span>
                  <div className="font-mono text-text-primary">{versionInfo.buildDate}</div>
                </div>
                <div>
                  <span className="text-text-secondary">{t('about.buildTime')}:</span>
                  <div className="font-mono text-text-primary">{versionInfo.buildTime}</div>
                </div>
              </div>
            </div>

            {/* Update Section */}
            <div className="bg-gray-tertiary/30 rounded-lg p-4 space-y-4">
              <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Download size={18} />
                {t('about.updates')}
              </h4>
              
              <div className="space-y-3">
                {/* Update Status Display */}
                {updateStatus.checking && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('about.update.checking')}</span>
                  </div>
                )}

                {updateStatus.error && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle size={16} />
                    <span>{updateStatus.error}</span>
                  </div>
                )}

                {updateStatus.success && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle size={16} />
                    <span>{t('about.update.success')}</span>
                  </div>
                )}

                {updateStatus.upToDate && !updateStatus.checking && !updateStatus.error && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle size={16} />
                    <span>{t('about.update.upToDate')}</span>
                  </div>
                )}

                {!updateStatus.checking && !updateStatus.error && !updateStatus.success && !updateStatus.available && !updateStatus.upToDate && (
                  <div className="text-text-secondary">
                    <span>{t('about.update.checkPrompt')}</span>
                  </div>
                )}

                {updateStatus.available && !updateStatus.success && (
                  <div className="flex items-center gap-2 text-accent bg-accent/10 p-3 rounded-lg">
                    <Download size={16} />
                    <span>{t('about.update.updateAvailable')}</span>
                  </div>
                )}

                {/* Update Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateCheck}
                    disabled={updateStatus.checking || updateStatus.installing}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark disabled:bg-gray-tertiary disabled:text-text-secondary text-gray-primary font-medium rounded-lg transition-colors"
                  >
                    {updateStatus.checking ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {t('about.update.checkForUpdates')}
                  </button>

                  {updateStatus.available && (
                    <button
                      onClick={handleUpdate}
                      disabled={updateStatus.installing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-tertiary disabled:text-text-secondary text-white font-medium rounded-lg transition-colors"
                    >
                      {updateStatus.installing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      {updateStatus.installing ? t('about.update.installing') : t('about.update.install')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-gray-tertiary/30 rounded-lg p-4 space-y-4">
              <h4 className="text-lg font-semibold text-text-primary">
                {t('about.links')}
              </h4>
              
              <div className="space-y-3">
                <a
                  href="https://github.com/Etschmia/chesstrax-ai-coach"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent hover:text-accent-dark transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>{t('about.homepage')}</span>
                </a>
                
                <a
                  href="https://paypal.me/Etschmia"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Heart size={16} />
                  <span>{t('about.support')}</span>
                </a>
              </div>
            </div>

            {/* Technical Information */}
            <div className="text-center text-sm text-text-secondary space-y-2">
              <p>{t('about.technicalInfo')}</p>
              <p className="font-mono text-xs text-text-secondary/70">
                React {React.version} • TypeScript • Vite
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-tertiary p-4 bg-gray-tertiary/30">
          <div className="text-center text-xs text-text-secondary">
            <p>{t('about.footer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;