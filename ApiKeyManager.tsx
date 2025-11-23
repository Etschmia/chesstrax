import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load the saved API key from localStorage when the component mounts
    const savedApiKey = localStorage.getItem('userGeminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Handler for saving the API key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error('Bitte gib deinen API-Key ein.');
      return;
    }
    localStorage.setItem('userGeminiApiKey', apiKey);
    toast.success('API-Key erfolgreich gespeichert!');
  };

  // Handler for clearing the API key
  const handleClearApiKey = () => {
    localStorage.removeItem('userGeminiApiKey');
    setApiKey('');
    toast.success('API-Key erfolgreich entfernt!');
  };

  return (
    <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
      <Toaster />
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Eigenen API Key nutzen</h1>
      
      <form onSubmit={handleSaveApiKey} className="w-full">
        <div className="mb-4 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a6 6 0 0 1 6-6a6 6 0 0 1 6 6v2h-2V6a4 4 0 0 0-4-4a4 4 0 0 0-4 4v2h8Z"></path>
          </svg>
          <input
            type="password" // Use password type to hide the key
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Dein Gemini API Key von aistudio.google.com"
            className="w-full bg-gray-700 text-white rounded-lg py-3 px-12 border border-gray-600 focus:outline-hidden focus:border-blue-500 transition-colors duration-300"
          />
        </div>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Der API-Key wird lokal in deinem Browser gespeichert und für die Analyse verwendet.
        </p>
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          API-Key speichern
        </button>
      </form>

      {apiKey && (
        <button
          onClick={handleClearApiKey}
          className="mt-6 text-sm text-gray-400 hover:text-red-500 transition-colors duration-300"
        >
          Gespeicherten API-Key löschen
        </button>
      )}
    </div>
  );
};

export default ApiKeyManager;