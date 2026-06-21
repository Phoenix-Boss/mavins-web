// src/components/modals/EmailModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export const EmailModal = ({ isOpen, onClose, onSubmit, isLoading = false }: EmailModalProps) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    await onSubmit(email);
    setEmail('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center text-3xl">
          ✉️
        </div>
        <h2 className={cn('text-xl font-bold mb-2', theme.text)}>
          Enter Your Email
        </h2>
        <p className={cn('text-sm mb-6', theme.textSecondary)}>
          We'll send you a magic link to get started
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            className={cn(
              'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all',
              theme.bgTertiary,
              theme.border,
              'focus:ring-amber-500/50',
              error && 'border-red-500'
            )}
          />
          {error && (
            <p className="text-red-500 text-sm text-left">{error}</p>
          )}
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </Button>
          <p className={cn('text-xs', theme.textMuted)}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </Modal>
  );
};