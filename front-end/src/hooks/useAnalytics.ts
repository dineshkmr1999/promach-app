import { useEffect } from 'react';
import { analyticsAPI } from '@/services/api';

export function useAnalytics() {
  useEffect(() => {
    const trackPageView = () => {
      const path = window.location.pathname;
      
      // Skip tracking for admin pages
      if (path.startsWith('/admin')) {
        console.log('[Analytics] Skipping tracking on admin page');
        return;
      }
      
      // Skip tracking on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[Analytics] Skipping tracking on localhost');
        return;
      }
      
      const referrer = document.referrer;
      const userAgent = navigator.userAgent;
      
      analyticsAPI.track(path, referrer, userAgent);
    };
    
    trackPageView();
  }, []);
}
