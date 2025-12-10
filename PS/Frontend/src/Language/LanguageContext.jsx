import React, { createContext, useState, useContext, useEffect } from 'react';
import translationsSpa from './Spa/Idioma.json';
import translationsEng from './Eng/Language.json';


// Crear un contexto para el idioma
const LanguageContext = createContext() ;

// Proveer el contexto a la aplicación
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('es'); // Estado inicial en español
    const [translations, setTranslations] = useState(translationsSpa);

    // Cambiar el idioma y las traducciones
    const changeLanguage = (lang) => {
        setLanguage(lang); // Cambia el idioma
    };

    // UseEffect para actualizar las traducciones cuando el idioma cambie
    useEffect(() => {
        if (language === 'es') {
            setTranslations(translationsSpa);
        } else if (language === 'en') {
            setTranslations(translationsEng);
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ translations, changeLanguage, language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook para consumir el contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
