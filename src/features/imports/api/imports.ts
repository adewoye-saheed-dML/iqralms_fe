import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type ImportJobResponse = components['schemas']['ImportJobResponse'];
export type KindEnum = components['schemas']['KindEnum'];

export const importsApi = {
  validateImport: async (organizationId: number, file: File, kind: KindEnum, columnMapping?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping));
    }

    // Using raw fetch here since apiClient expects JSON body typically,
    // though apiClient.post supports body. 
    // Wait, apiClient in this project handles FormData natively?
    // Let's use apiClient.post but we need to ensure headers aren't explicitly set to application/json
    // Actually apiClient.post with FormData will omit Content-Type so browser sets it with boundary.
    return apiClient.post<ImportJobResponse>(
      `/api/imports/organizations/${organizationId}/validate/`,
      { body: formData as any }
    );
  },

  commitImport: (organizationId: number, jobId: number) =>
    apiClient.post<ImportJobResponse>(
      `/api/imports/organizations/${organizationId}/${jobId}/commit/`
    ),
};
