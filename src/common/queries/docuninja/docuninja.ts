import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { AxiosResponse } from 'axios';

/**
 * @deprecated Use docuNinjaService.createAccount() from '$app/common/services/DocuNinjaService' instead.
 * This function is maintained for backward compatibility only.
 */
export function useCreate(): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/docuninja/create'));
}
