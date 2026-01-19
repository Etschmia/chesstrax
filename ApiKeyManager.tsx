import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ApiKeyManager: React.FC = () => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('userGeminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error(t('apiKeyManager.error.empty'));
      return;
    }
    localStorage.setItem('userGeminiApiKey', apiKey);
    toast.success(t('apiKeyManager.success.saved'));
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('userGeminiApiKey');
    setApiKey('');
    toast.success(t('apiKeyManager.success.cleared'));
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">{t('apiKeyManager.title')}</h1>

      <form onSubmit={handleSaveApiKey} className="w-full">
        <div className="mb-4 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a6 6 0 0 1 6-6a6 6 0 0 1 6 6v2h-2V6a4 4 0 0 0-4-4a4 4 0 0 0-4 4v2h8Z"></path>
          </svg>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('apiKeyManager.placeholder')}
            className="w-full bg-gray-tertiary text-text-primary rounded-lg py-3 px-12 border border-gray-tertiary focus:outline-hidden focus:border-accent transition-colors duration-300"
          />
        </div>
        <p className="text-text-secondary text-sm mb-6 text-center">
          {t('apiKeyManager.description')}
        </p>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-dark text-gray-primary font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          {t('apiKeyManager.save')}
        </button>
      </form>

      {apiKey && (
        <button
          onClick={handleClearApiKey}
          className="mt-6 w-full text-sm text-text-secondary hover:text-red-500 transition-colors duration-300"
        >
          {t('apiKeyManager.clear')}
        </button>
      )}
    </div>
  );
};

export default ApiKeyManager;
