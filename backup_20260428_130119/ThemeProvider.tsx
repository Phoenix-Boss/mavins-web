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
    accent: string;
    accentBg: string;
    accentGradient: string;
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
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('soundwave-theme', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const toggleTheme = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  const theme = mode === 'dark' ? {
    bg: 'bg-black',
    bgSecondary: 'bg-neutral-950',
    bgTertiary: 'bg-neutral-900/50',
    bgCard: 'bg-neutral-900/80',
    cardHover: 'bg-neutral-800/80',
    text: 'text-white',
    textSecondary: 'text-neutral-400',
    textMuted: 'text-neutral-500',
    border: 'border-neutral-800',
    accent: 'text-amber-400',
    accentBg: 'bg-gradient-to-r from-amber-500 to-purple-600',
    accentGradient: 'bg-gradient-to-r from-amber-400 to-purple-500',
  } : {
    bg: 'bg-white',
    bgSecondary: 'bg-neutral-50',
    bgTertiary: 'bg-neutral-100/80',
    bgCard: 'bg-white/80',
    cardHover: 'bg-neutral-100/90',
    text: 'text-neutral-900',
    textSecondary: 'text-neutral-600',
    textMuted: 'text-neutral-400',
    border: 'border-neutral-200',
    accent: 'text-amber-600',
    accentBg: 'bg-gradient-to-r from-amber-500 to-purple-600',
    accentGradient: 'bg-gradient-to-r from-amber-500 to-purple-600',
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
