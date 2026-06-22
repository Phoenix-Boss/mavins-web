// src/components/withdrawal/WithdrawalModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  onSubmit: (amount: number, method: 'paypal' | 'bank' | 'crypto', details: any) => void;
  isLoading?: boolean;
}

export const WithdrawalModal = ({ isOpen, onClose, availableAmount, onSubmit, isLoading }: WithdrawalModalProps) => {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'paypal' | 'bank' | 'crypto'>('paypal');
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10 || numAmount > availableAmount) return;

    let details = {};
    if (method === 'paypal') {
      details = { email };
    } else if (method === 'bank') {
      details = { accountName, accountNumber };
    } else {
      details = { walletAddress: email };
    }

    onSubmit(numAmount, method, details);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal" size="md">
      <div className="space-y-4">
        <Card padding="sm" glass>
          <div className="flex justify-between items-center">
            <span className={cn('text-sm', theme.textSecondary)}>Available for withdrawal</span>
            <span className="text-2xl font-bold text-amber-400">${availableAmount.toFixed(2)}</span>
          </div>
          <p className={cn('text-xs mt-1', theme.textMuted)}>Minimum withdrawal: $10.00</p>
        </Card>

        <div>
          <label className={cn('text-sm font-medium block mb-2', theme.text)}>Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="10"
            max={availableAmount}
            step="1"
            className={cn(
              'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2',
              theme.bgTertiary,
              theme.border,
              'focus:ring-amber-500/50',
              theme.text
            )}
          />
        </div>

        <div>
          <label className={cn('text-sm font-medium block mb-2', theme.text)}>Withdrawal Method</label>
          <div className="grid grid-cols-3 gap-2">
            {(['paypal', 'bank', 'crypto'] as const).map((m: any) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                  method === m
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'
                    : cn(theme.bgTertiary, theme.textSecondary, 'hover:bg-white/10')
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {method === 'paypal' && (
          <div>
            <label className={cn('text-sm font-medium block mb-2', theme.text)}>PayPal Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={cn(
                'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2',
                theme.bgTertiary,
                theme.border,
                'focus:ring-amber-500/50',
                theme.text
              )}
            />
          </div>
        )}

        {method === 'bank' && (
          <>
            <div>
              <label className={cn('text-sm font-medium block mb-2', theme.text)}>Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full name on account"
                className={cn(
                  'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2',
                  theme.bgTertiary,
                  theme.border,
                  theme.text
                )}
              />
            </div>
            <div>
              <label className={cn('text-sm font-medium block mb-2', theme.text)}>Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className={cn(
                  'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2',
                  theme.bgTertiary,
                  theme.border,
                  theme.text
                )}
              />
            </div>
          </>
        )}

        {method === 'crypto' && (
          <div>
            <label className={cn('text-sm font-medium block mb-2', theme.text)}>Wallet Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="BTC/ETH/USDT wallet address"
              className={cn(
                'w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2',
                theme.bgTertiary,
                theme.border,
                theme.text
              )}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} loading={isLoading} disabled={!amount || parseFloat(amount) < 10 || parseFloat(amount) > availableAmount}>
            Request Withdrawal
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};


