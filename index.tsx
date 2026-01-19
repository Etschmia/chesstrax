import React from 'react';
import './src/index.css';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import App from './App';
import i18n from './public/i18n';
import GoogleAnalytics from './components/GoogleAnalytics';

// Register service worker for update functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleAnalytics />
    <Toaster position="top-center" />
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);
