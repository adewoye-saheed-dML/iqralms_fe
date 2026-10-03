'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { billingApi, type SubaccountSetupResponse } from '../api/billing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle2, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

interface BankDetailsFormProps {
  organizationId: number;
  initialBusinessName?: string;
}

const COMMON_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '50211', name: 'Kuda Bank' },
  { code: '999992', name: 'OPay' },
  { code: '999991', name: 'PalmPay' },
  { code: '035', name: 'Wema Bank / ALAT' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '082', name: 'Keystone Bank' },
];

export function BankDetailsForm({ organizationId, initialBusinessName }: BankDetailsFormProps) {
  const [bankCode, setBankCode] = React.useState('058');
  const [customBankCode, setCustomBankCode] = React.useState('');
  const [isCustomBank, setIsCustomBank] = React.useState(false);
  const [accountNumber, setAccountNumber] = React.useState('');
  const [businessName, setBusinessName] = React.useState(initialBusinessName || '');
  const [confirmedAccount, setConfirmedAccount] = React.useState<SubaccountSetupResponse | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const activeBankCode = isCustomBank ? customBankCode.trim() : bankCode;

  const setupMutation = useMutation({
    mutationFn: async () => {
      if (!activeBankCode) throw new Error('Bank code is required');
      if (accountNumber.trim().length !== 10) throw new Error('Account number must be exactly 10 digits');
      return billingApi.setupSubaccount(
        organizationId,
        activeBankCode,
        accountNumber.trim(),
        businessName.trim() || initialBusinessName || 'Academy Settlement'
      );
    },
    onSuccess: (data) => {
      setConfirmedAccount(data);
      setErrorMsg(null);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Failed to resolve and setup bank account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setupMutation.mutate();
  };

  const handleReset = () => {
    setConfirmedAccount(null);
    setErrorMsg(null);
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Tuition Settlement Bank Account</CardTitle>
        </div>
        <CardDescription className="text-sm mt-1">
          Direct tuition settlement via Paystack Subaccount (0% platform cut). Tuition payments made by families route
          directly to this bank account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {confirmedAccount ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                  Bank Settlement Subaccount Active
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Your settlement account has been verified with Paystack. Direct tuition routing is operational.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-background/80 rounded border p-2.5">
                <span className="text-muted-foreground block">Resolved Account Name</span>
                <span className="font-semibold text-sm block mt-0.5">{confirmedAccount.account_name}</span>
              </div>
              <div className="bg-background/80 rounded border p-2.5">
                <span className="text-muted-foreground block">Account Number</span>
                <span className="font-semibold text-sm block mt-0.5">{confirmedAccount.account_number}</span>
              </div>
              <div className="bg-background/80 rounded border p-2.5">
                <span className="text-muted-foreground block">Bank Code</span>
                <span className="font-semibold text-sm block mt-0.5">{confirmedAccount.bank_code}</span>
              </div>
              <div className="bg-background/80 rounded border p-2.5">
                <span className="text-muted-foreground block">Paystack Subaccount</span>
                <span className="font-mono text-xs block mt-0.5 truncate">{confirmedAccount.subaccount_code}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Update Bank Details
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bank-select" className="text-xs font-medium">
                  Bank
                </Label>
                {!isCustomBank ? (
                  <select
                    id="bank-select"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={bankCode}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomBank(true);
                      } else {
                        setBankCode(e.target.value);
                      }
                    }}
                  >
                    {COMMON_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                    <option value="custom">Other bank code...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="custom-bank-code"
                      placeholder="e.g. 058"
                      value={customBankCode}
                      onChange={(e) => setCustomBankCode(e.target.value)}
                      className="h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCustomBank(false)}
                      className="text-xs h-9 px-2"
                    >
                      Select list
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-number" className="text-xs font-medium">
                  NUBAN Account Number (10 digits)
                </Label>
                <Input
                  id="account-number"
                  placeholder="0123456789"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="h-9 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="business-name" className="text-xs font-medium">
                Business / Settlement Name
              </Label>
              <Input
                id="business-name"
                placeholder={initialBusinessName || 'Academy Business Name'}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-9"
              />
              <span className="text-[11px] text-muted-foreground">
                Matches the registered entity or official academy name associated with your bank account.
              </span>
            </div>

            {errorMsg && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Zero platform commission. Subaccount created securely with Paystack.</span>
              </div>
              <Button type="submit" size="sm" disabled={setupMutation.isPending || accountNumber.length !== 10}>
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Resolving Account...
                  </>
                ) : (
                  <>
                    Verify &amp; Setup Subaccount
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
