import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const checkInitialStatus = (): boolean => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('offline') === 'true' || window.location.hash === '#offline') {
        return false;
      }
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  };

  const [isOnline, setIsOnline] = useState<boolean>(checkInitialStatus);

  useEffect(() => {
    const handleOnline = () => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('offline') === 'true' || window.location.hash === '#offline') {
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    };

    const handleOffline = () => setIsOnline(false);

    const handleHashChange = () => {
      setIsOnline(checkInitialStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return isOnline;
}
