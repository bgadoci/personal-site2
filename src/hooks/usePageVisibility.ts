'use client';

import { useState, useEffect } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
      
      // Force a re-render when the page becomes visible again
      if (document.visibilityState === 'visible') {
        setForceUpdate(prev => prev + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return { isVisible, forceUpdate };
}
