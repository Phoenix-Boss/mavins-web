# Fix-Missing-Files.ps1
# Fixes the 3 files that failed due to Resolve-Path null error

param(
    [string]$ProjectRoot = "."
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FIXING MISSING/CORRUPTED FILES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ProjectRoot

$BackupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Write-Host "Created backup directory: $BackupDir" -ForegroundColor Yellow
Write-Host ""

function Update-File {
    param(
        [string]$FilePath,
        [string]$Content
    )

    $FullPath = [System.IO.Path]::GetFullPath($FilePath)
    $dir = [System.IO.Path]::GetDirectoryName($FullPath)

    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    if (Test-Path $FullPath) {
        $backupPath = Join-Path $BackupDir ([System.IO.Path]::GetFileName($FullPath))
        Copy-Item $FullPath $backupPath -Force
        Write-Host "  Backed up: $FilePath" -ForegroundColor Gray
    }

    [System.IO.File]::WriteAllText($FullPath, $Content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  Fixed: $FilePath" -ForegroundColor Green
}

Write-Host "Fixing 3 files..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. FIX Toast.tsx
# ============================================
$ToastContent = @'
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastStyles = {
  success: 'bg-green-500 text-white border-green-600',
  error: 'bg-red-500 text-white border-red-600',
  warning: 'bg-amber-500 text-white border-amber-600',
  info: 'bg-blue-500 text-white border-blue-600',
};

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 max-w-[90vw] md:max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-up',
              toastStyles[toast.type]
            )}
            onClick={() => hideToast(toast.id)}
          >
            <span className="text-lg">{icons[toast.type]}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button className="opacity-70 hover:opacity-100 text-lg">&times;</button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const Toast = ({ message, type = 'info', onClose }: { message: string; type?: ToastType; onClose?: () => void }) => {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border',
      toastStyles[type]
    )}>
      <span className="text-lg">{icons[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg">&times;</button>
      )}
    </div>
  );
};
'@

Update-File -FilePath "src/components/ui/Toast.tsx" -Content $ToastContent

# ============================================
# 2. FIX SongListItem.tsx
# ============================================
$SongListItemContent = @'
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface SongListItemProps {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration?: string;
  index: number;
  onClick: () => void;
  isPlaying?: boolean;
}

export const SongListItem = ({ 
  id, 
  title, 
  artist, 
  albumArt, 
  duration = "2:45",
  index, 
  onClick,
  isPlaying = false
}: SongListItemProps) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer group',
        theme.mode === 'dark' ? 'hover:bg-white/10' : 'hover:bg-purple-50',
        isPlaying && (theme.mode === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100/50')
      )}
    >
      <span className={cn(
        'w-8 text-center text-sm font-medium',
        isPlaying ? 'text-amber-500' : theme.textSecondary
      )}>
        {isPlaying ? '&#127925;' : `#${index + 1}`}
      </span>

      <div className={cn(
        'w-12 h-12 rounded-full overflow-hidden shadow-md transition-all duration-200',
        'ring-2 ring-transparent group-hover:ring-amber-500/50',
        isPlaying && 'ring-amber-500'
      )}>
        <img src={albumArt} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <h3 className={cn('font-medium', theme.text)}>{title}</h3>
        <p className={cn('text-sm', theme.textSecondary)}>{artist}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn('text-sm', theme.textSecondary)}>{duration}</span>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
          theme.mode === 'dark' ? 'bg-white/10 group-hover:bg-purple-500' : 'bg-purple-100 group-hover:bg-purple-500',
          'opacity-0 group-hover:opacity-100'
        )}>
          <span className="text-xs text-purple-400 group-hover:text-white">&#9654;</span>
        </div>
      </div>
    </div>
  );
};
'@

Update-File -FilePath "src/components/home/SongListItem.tsx" -Content $SongListItemContent

# ============================================
# 3. FIX SongList.tsx
# ============================================
$SongListContent = @'
'use client';

import React, { useState } from 'react';
import { SongListItem } from './SongListItem';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration?: string;
  isTask?: boolean;
}

interface SongListProps {
  tracks: Track[];
  isLoading?: boolean;
  onTrackClick: (trackId: string) => void;
  title?: string;
}

export const SongList = ({ tracks, isLoading = false, onTrackClick, title = "Featured Songs" }: SongListProps) => {
  const { theme } = useTheme();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleClick = (trackId: string) => {
    setPlayingId(trackId);
    onTrackClick(trackId);
    setTimeout(() => setPlayingId(null), 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {title && <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>{title}</h2>}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-8 h-4 bg-gray-700 rounded animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
              <div className="h-3 bg-gray-700 rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {title && <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>{title}</h2>}
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <SongListItem
            key={track.id}
            id={track.id}
            title={track.title}
            artist={track.artist || 'Unknown Artist'}
            albumArt={track.albumArt}
            duration={track.duration}
            index={index}
            onClick={() => handleClick(track.id)}
            isPlaying={playingId === track.id}
          />
        ))}
      </div>
    </div>
  );
};
'@

Update-File -FilePath "src/components/home/SongList.tsx" -Content $SongListContent

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   3 FILES FIXED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fixed files:" -ForegroundColor Yellow
Write-Host "  - src/components/ui/Toast.tsx" -ForegroundColor Green
Write-Host "  - src/components/home/SongListItem.tsx" -ForegroundColor Green
Write-Host "  - src/components/home/SongList.tsx" -ForegroundColor Green
Write-Host ""
Write-Host "Backup saved to: $BackupDir" -ForegroundColor Yellow