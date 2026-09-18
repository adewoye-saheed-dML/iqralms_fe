import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type PricingAgreement = components['schemas']['PricingAgreement'];
export type PricingAgreementCreate = components['schemas']['PricingAgreementCreate'];
export type MyPricingAgreement = components['schemas']['MyPricingAgreement'];
export type Level = components['schemas']['Level'];
export type ReasonEnum = components['schemas']['ReasonEnum'];

export const pricingApi = {
  getAgreements: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/pricing/organizations/{organization_pk}/agreements/', {
      params: { path: { organization_pk: organizationId } }
    });
    return data as PricingAgreement[];
  },

  createAgreement: async (organizationId: number, body: PricingAgreementCreate) => {
    const { data } = await apiClient.POST('/api/pricing/organizations/{organization_pk}/agreements/', {
      params: { path: { organization_pk: organizationId } },
      body
    });
    return data as PricingAgreement;
  },

  getMyAgreements: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/pricing/organizations/{organization_pk}/agreements/mine/', {
      params: { path: { organization_pk: organizationId } }
    });
    return data as MyPricingAgreement[];
  },
};
