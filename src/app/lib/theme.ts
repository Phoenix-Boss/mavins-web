// src/lib/theme.ts
// Centralized theme configuration for SoundWave platform
// Supports Tailwind CSS v4 compatible class names

export type ThemeMode = 'dark' | 'light';

// Theme color definitions using explicit hex values for v4 compatibility
export const themes = {
  dark: {
    // Backgrounds
    bg: 'bg-black',
    bgSecondary: 'bg-[#09090b]',      // zinc-950
    bgTertiary: 'bg-[#18181b]/50',    // zinc-900/50
    bgCard: 'bg-[#18181b]/30',        // zinc-900/30
    
    // Text colors
    text: 'text-[#fafafa]',            // zinc-50
    textSecondary: 'text-[#a1a1aa]',   // zinc-400
    textMuted: 'text-[#71717a]',       // zinc-500
    
    // Borders
    border: 'border-[#27272a]',        // zinc-800
    borderAccent: 'border-[#f59e0b]/30', // amber-500/30
    
    // Accent colors (Gold theme for dark mode)
    accent: 'text-[#fbbf24]',          // amber-400
    accentBg: 'bg-[#f59e0b]',          // amber-500
    accentHover: 'hover:bg-[#d97706]', // amber-600
    accentGradient: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]',
    
    // Interactive states
    cardHover: 'hover:bg-[#27272a]',
    inputBg: 'bg-[#18181b]',
    
    // Effects
    shadow: 'shadow-[#000000]/50',
    
    // Status colors
    success: 'text-[#34d399]',   // emerald-400
    warning: 'text-[#fbbf24]',   // amber-400
    error: 'text-[#f87171]',     // red-400
    
    // Identifier for conditional logic
    primary: 'amber',
  },
  
  light: {
    // Backgrounds
    bg: 'bg-white',
    bgSecondary: 'bg-[#fafafa]',       // zinc-50
    bgTertiary: 'bg-[#f5f3ff]',        // purple-50
    bgCard: 'bg-white',
    
    // Text colors
    text: 'text-[#18181b]',            // zinc-900
    textSecondary: 'text-[#52525b]',   // zinc-600
    textMuted: 'text-[#a1a1aa]',       // zinc-400
    
    // Borders
    border: 'border-[#ede9fe]',        // purple-100
    borderAccent: 'border-[#a78bfa]/30', // purple-400/30
    
    // Accent colors (Purple theme for light mode)
    accent: 'text-[#7c3aed]',          // purple-600
    accentBg: 'bg-[#7c3aed]',          // purple-600
    accentHover: 'hover:bg-[#6d28d9]', // purple-700
    accentGradient: 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]',
    
    // Interactive states
    cardHover: 'hover:bg-[#f5f3ff]',
    inputBg: 'bg-white',
    
    // Effects
    shadow: 'shadow-[#ede9fe]',
    
    // Status colors
    success: 'text-[#059669]',   // emerald-600
    warning: 'text-[#d97706]',   // amber-600
    error: 'text-[#dc2626]',     // red-600
    
    // Identifier for conditional logic
    primary: 'purple',
  },
} as const;

/**
 * Get theme class names based on current mode
 * @param mode - 'dark' or 'light'
 * @returns Object containing all theme class names
 */
export function getThemeClasses(mode: ThemeMode) {
  return themes[mode];
}

/**
 * Get the opposite theme mode
 * @param mode - Current mode
 * @returns Opposite mode
 */
export function toggleThemeMode(mode: ThemeMode): ThemeMode {
  return mode === 'dark' ? 'light' : 'dark';
}

/**
 * Get CSS variable equivalents for dynamic theming
 * Useful for inline styles or CSS-in-JS
 */
export const cssVariables = {
  dark: {
    '--color-bg': '#000000',
    '--color-bg-secondary': '#09090b',
    '--color-bg-tertiary': 'rgba(24, 24, 27, 0.5)',
    '--color-text': '#fafafa',
    '--color-text-secondary': '#a1a1aa',
    '--color-border': '#27272a',
    '--color-accent': '#fbbf24',
    '--color-accent-bg': '#f59e0b',
  },
  light: {
    '--color-bg': '#ffffff',
    '--color-bg-secondary': '#fafafa',
    '--color-bg-tertiary': 'rgba(245, 243, 255, 1)',
    '--color-text': '#18181b',
    '--color-text-secondary': '#52525b',
    '--color-border': '#ede9fe',
    '--color-accent': '#7c3aed',
    '--color-accent-bg': '#7c3aed',
  },
} as const;

/**
 * Apply CSS variables to document for dynamic theming
 * @param mode - Theme mode to apply
 */
export function applyCssVariables(mode: ThemeMode) {
  const root = document.documentElement;
  const variables = cssVariables[mode];
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}