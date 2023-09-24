import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const [colorMode, rawSetColorMode] = useState(undefined);

    useEffect(() => {
        const root = window.document.documentElement;
        const initialColorValue = root.style.getPropertyValue('--initial-color-mode');
        rawSetColorMode(initialColorValue);
    }, []);

    const setColorMode = newValue => {
        const root = window.document.documentElement;
        localStorage.setItem('color-mode', newValue);

        // Set CSS variable
       // root.style.setProperty('--initial-color-mode', newValue);

        // Set data-theme attribute
        root.setAttribute('data-theme', newValue);

        rawSetColorMode(newValue);
    };

    return (
        <DarkModeContext.Provider value={{ colorMode, setColorMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
}
