import * as React from 'react';
import { PaymentCallbackView } from '@/features/payments/components/payment-callback-view';
import { LoadingState } from '@/components/ui/loading';

export default function PaymentCallbackPage() {
  return (
    <React.Suspense fallback={<LoadingState />}>
      <PaymentCallbackView />
    </React.Suspense>
  );
}
