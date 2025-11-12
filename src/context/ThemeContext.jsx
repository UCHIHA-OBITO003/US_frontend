import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const themes = {
  pink: {
    primary: 'from-pink-400 to-pink-600',
    secondary: 'from-pink-300 to-pink-500',
    accent: 'bg-pink-500',
    bg: 'from-pink-50 via-pink-100 to-pink-200'
  },
  purple: {
    primary: 'from-purple-400 to-purple-600',
    secondary: 'from-purple-300 to-purple-500',
    accent: 'bg-purple-500',
    bg: 'from-purple-50 via-purple-100 to-purple-200'
  },
  blue: {
    primary: 'from-blue-400 to-blue-600',
    secondary: 'from-blue-300 to-blue-500',
    accent: 'bg-blue-500',
    bg: 'from-blue-50 via-blue-100 to-blue-200'
  },
  dark: {
    primary: 'from-gray-700 to-gray-900',
    secondary: 'from-gray-600 to-gray-800',
    accent: 'bg-gray-800',
    bg: 'from-gray-900 via-gray-800 to-gray-900'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('pink');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'pink';
    setCurrentTheme(savedTheme);
  }, []);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const value = {
    theme: currentTheme,
    themeColors: themes[currentTheme],
    changeTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

