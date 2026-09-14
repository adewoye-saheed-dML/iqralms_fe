import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type PricingAgreement = components['schemas']['PricingAgreement'];
export type PricingAgreementCreate = components['schemas']['PricingAgreementCreate'];
export type MyPricingAgreement = components['schemas']['MyPricingAgreement'];
export type Level = components['schemas']['Level'];
export type ReasonEnum = components['schemas']['ReasonEnum'];

export const pricingApi = {
  getAgreements: (organizationId: number) =>
    apiClient.get<PricingAgreement[]>(
      `/api/pricing/organizations/${organizationId}/agreements/`
    ),

  createAgreement: (organizationId: number, data: PricingAgreementCreate) =>
    apiClient.post<PricingAgreement>(
      `/api/pricing/organizations/${organizationId}/agreements/`,
      { body: data }
    ),

  getMyAgreements: (organizationId: number) =>
    apiClient.get<MyPricingAgreement[]>(
      `/api/pricing/organizations/${organizationId}/agreements/mine/`
    ),
};
