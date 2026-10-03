import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type PlatformSubscription = components['schemas']['PlatformSubscription'];
export type SubscriptionStatusEnum = components['schemas']['PlatformSubscriptionStatusEnum'];
export type SubaccountSetup = components['schemas']['SubaccountSetup'];
export type SubaccountSetupResponse = components['schemas']['SubaccountSetupResponse'];
export type OrganizationPayment = components['schemas']['FamilyPayment'];

export const billingApi = {
  getSubscriptionStatus: async (organizationId: number): Promise<PlatformSubscription | null> => {
    try {
      const { data } = await apiClient.GET('/api/billing/status/', {
        params: { query: { organization_id: organizationId } },
      });
      return data ?? null;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 404) {
        return null;
      }
      throw err;
    }
  },

  subscribe: async (organizationId: number, planCode?: string): Promise<PlatformSubscription> => {
    const { data } = await apiClient.POST('/api/billing/subscribe/', {
      body: {
        organization_id: organizationId,
        plan_code: planCode,
      },
    });
    if (!data) {
      throw new Error('Failed to subscribe organization');
    }
    return data;
  },

  setupSubaccount: async (
    organizationId: number,
    bankCode: string,
    accountNumber: string,
    businessName: string
  ): Promise<SubaccountSetupResponse> => {
    const { data } = await apiClient.POST('/api/payments/subaccount/setup/', {
      body: {
        organization_id: organizationId,
        bank_code: bankCode,
        account_number: accountNumber,
        business_name: businessName,
      },
    });
    if (!data) {
      throw new Error('Failed to setup subaccount');
    }
    return data;
  },

  getOrganizationPayments: async (organizationId: number): Promise<OrganizationPayment[]> => {
    const { data } = await apiClient.GET('/api/payments/organization/', {
      params: { query: { organization_id: organizationId } },
    });
    return data ?? [];
  },
};
