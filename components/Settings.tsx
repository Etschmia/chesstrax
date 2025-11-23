import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSettings from '../hooks/useSettings';
import { LLMProvider } from '../llmProviders';
import { CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, saveSettings, providers } = useSettings();
  const [selectedProviderId, setSelectedProviderId] = useState(settings.selectedProviderId);
  const [apiKeys, setApiKeys] = useState(settings.apiKeys);
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (selectedProviderId) {
      setCurrentApiKey(apiKeys[selectedProviderId] || '');
    }
  }, [selectedProviderId, apiKeys]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProviderId(e.target.value as LLMProvider['id']);
    setIsSaved(false);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentApiKey(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (selectedProviderId) {
      const newApiKeys = { ...apiKeys, [selectedProviderId]: currentApiKey };
      setApiKeys(newApiKeys);
      saveSettings({ selectedProviderId, apiKeys: newApiKeys });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  return (
    <div className="p-4 bg-gray-secondary rounded-lg">
      <h3 className="text-2xl font-bold text-text-primary mb-6">{t('settings.title')}</h3>
      
      <div className="space-y-6">
        <div className="form-group">
          <label htmlFor="provider-select" className="block text-sm font-medium text-text-secondary mb-2">
            {t('settings.aiProvider')}
          </label>
          <select 
            id="provider-select" 
            value={selectedProviderId || ''} 
            onChange={handleProviderChange}
            className="w-full h-12 bg-gray-tertiary border-2 border-gray-tertiary focus:border-accent focus:ring-0 focus:outline-hidden rounded-lg px-4 text-text-primary"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProvider && (
          <div className="form-group">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-text-secondary mb-2">
              {selectedProvider.apiKeyName}
            </label>
            <input
              id="api-key-input"
              type="password"
              value={currentApiKey}
              onChange={handleApiKeyChange}
              placeholder={t('settings.apiKeyPlaceholder', { providerName: selectedProvider.name })}
              className="w-full h-12 bg-gray-tertiary border-2 border-gray-tertiary focus:border-accent focus:ring-0 focus:outline-hidden rounded-lg px-4 text-text-primary placeholder:text-text-secondary/70"
            />
            <small className="mt-2 text-xs text-text-secondary">
              <a href={selectedProvider.documentationUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                {t('settings.findApiKeyLink')}
              </a>
            </small>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        {isSaved && (
          <div className="flex items-center gap-2 text-green-400 animate-pulse">
            <CheckCircle size={20} />
            <span className="text-sm font-semibold">{t('settings.saved')}</span>
          </div>
        )}
        <button 
          onClick={handleSave}
          className="bg-accent hover:bg-accent-dark text-gray-primary font-bold py-2 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-tertiary disabled:text-text-secondary disabled:cursor-not-allowed"
        >
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
};

export default Settings;