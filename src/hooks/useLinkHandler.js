// useLinkHandler.js
import { useCallback } from 'react';

export const useLinkHandler = () => {
  const handleReference = useCallback((content) => {
    // Implémentez votre logique ici
    console.log("Contenu référencé :", content);
  }, []);

  return handleReference;
};
