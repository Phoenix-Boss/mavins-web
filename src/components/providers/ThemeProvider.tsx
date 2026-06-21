// src/components/providers/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  theme: {
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    bgCard: string;
    cardHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    accent: string;
    accentBg: string;
    accentGradient: string;
    iconColor: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('soundwave-theme') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setMode(initial);
    
    // Apply theme class to html element
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('soundwave-theme', newMode);
    
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  const darkTheme = {
    bg: 'bg-black',
    bgSecondary: 'bg-neutral-950',
    bgTertiary: 'bg-neutral-900/50',
    bgCard: 'bg-neutral-900/80 backdrop-blur-sm',
    cardHover: 'hover:bg-neutral-800/80',
    text: 'text-white',
    textSecondary: 'text-neutral-300',
    textMuted: 'text-neutral-500',
    border: 'border-neutral-800',
    borderLight: 'border-neutral-700',
    accent: 'text-amber-400',
    accentBg: 'bg-gradient-to-r from-amber-500 to-purple-600',
    accentGradient: 'bg-gradient-to-r from-amber-400 to-purple-500',
    iconColor: 'text-neutral-400',
  };

  const lightTheme = {
    bg: 'bg-gradient-to-br from-purple-50 via-white to-sky-50',
    bgSecondary: 'bg-purple-50',
    bgTertiary: 'bg-sky-50',
    bgCard: 'bg-white backdrop-blur-sm',
    cardHover: 'hover:bg-purple-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    border: 'border-purple-200',
    borderLight: 'border-purple-100',
    accent: 'text-amber-600',
    accentBg: 'bg-gradient-to-r from-amber-500 to-purple-600',
    accentGradient: 'bg-gradient-to-r from-amber-500 via-purple-500 to-sky-500',
    iconColor: 'text-gray-700',
  };

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black">
        <div className="animate-pulse" />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};