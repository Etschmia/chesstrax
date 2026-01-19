import { useEffect } from 'react';

/**
 * Google Analytics Component
 * Initializes Google Analytics 4 (GA4) tracking
 * Only loads in production mode to avoid tracking during development
 */
const GoogleAnalytics: React.FC = () => {
  useEffect(() => {
    // Only load GA in production
    if (import.meta.env.PROD) {
      // Get measurement ID from vite.config.ts define
      // This is replaced at build time by Vite
      const measurementId = process.env.VITE_GA_MEASUREMENT_ID || '';

      if (!measurementId) {
        console.warn('Google Analytics: Measurement ID not found. Please set MESS_ID in .env.local.');
        return;
      }

      // Load gtag script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      // Initialize gtag
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);

      // Track page views on route changes
      const handleLocationChange = () => {
        if ((window as any).gtag) {
          (window as any).gtag('config', measurementId, {
            page_path: window.location.pathname,
          });
        }
      };

      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', handleLocationChange);

      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, []);

  return null;
};

export default GoogleAnalytics;
