
import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck } from 'lucide-react';

interface LLMProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LLMProviderDialog: React.FC<LLMProviderDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-gray-secondary p-6 rounded-2xl shadow-2xl border border-gray-tertiary w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-text-secondary hover:text-text-primary">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('llmDialog.title')}</h2>
        
        <p className="text-text-secondary mb-4">
          {t('llmDialog.description')}
        </p>

        <div className="bg-gray-tertiary/50 border border-gray-tertiary rounded-lg p-4 flex items-start gap-3 mb-6">
            <ShieldCheck className="h-6 w-6 text-accent shrink-0 mt-1" />
            <div>
                <h3 className="font-semibold text-text-primary">{t('llmDialog.privacyTitle')}</h3>
                <p className="text-text-secondary text-sm">{t('llmDialog.privacyDescription')}</p>
            </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg text-text-primary bg-gray-tertiary hover:bg-gray-tertiary/80 transition-colors"
          >
            {t('llmDialog.cancel')}
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold text-gray-primary bg-accent hover:bg-accent-dark transition-colors"
          >
            {t('llmDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMProviderDialog;
