import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para detectar si el usuario está en una página específica
 * y si la pestaña del navegador está visible
 */
export const usePageVisibility = (targetPath: string = '/chats') => {
  const location = useLocation();
  const [isPageVisible, setIsPageVisible] = useState(true);
  const isOnTargetPage = location.pathname === targetPath;

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Usuario está "presente" si está en la página de chats Y la pestaña está visible
  const isUserPresent = isOnTargetPage && isPageVisible;

  return {
    isOnTargetPage,
    isPageVisible,
    isUserPresent,
  };
};

