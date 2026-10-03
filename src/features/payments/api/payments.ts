import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type FamilyPayment = components['schemas']['FamilyPayment'];
export type FamilyPaymentStatusEnum = components['schemas']['FamilyPaymentStatusEnum'];
export type PaymentInitializeResponse = components['schemas']['PaymentInitializeResponse'];

export interface PaymentVerifyResult {
  reference: string;
  status: FamilyPaymentStatusEnum;
  paystack_data?: Record<string, unknown>;
}

export const paymentsApi = {
  getMyPayments: async (): Promise<FamilyPayment[]> => {
    const { data } = await apiClient.GET('/api/payments/mine/');
    return data ?? [];
  },

  getChildPayments: async (studentId?: number): Promise<FamilyPayment[]> => {
    const { data } = await apiClient.GET('/api/payments/children/', {
      params: {
        query: studentId ? { student_id: studentId } : undefined,
      },
    });
    return data ?? [];
  },

  initializePayment: async (
    pricingAgreementId: number,
    studentId?: number,
    callbackUrl?: string
  ): Promise<PaymentInitializeResponse> => {
    const { data } = await apiClient.POST('/api/payments/initialize/', {
      body: {
        pricing_agreement_id: pricingAgreementId,
        student_id: studentId ?? undefined,
        callback_url: callbackUrl,
      },
    });
    if (!data) {
      throw new Error('Failed to initialize payment');
    }
    return data;
  },

  verifyPayment: async (reference: string): Promise<PaymentVerifyResult> => {
    const { data } = await apiClient.GET('/api/payments/verify/{reference}/', {
      params: { path: { reference } },
    });
    if (!data) {
      throw new Error('Failed to verify payment');
    }
    return data as PaymentVerifyResult;
  },
};
