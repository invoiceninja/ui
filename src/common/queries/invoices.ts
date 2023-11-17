/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { useQuery, useQueryClient } from 'react-query';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '../helpers/toast/toast';
import { EmailType } from '$app/pages/invoices/common/components/SendEmailModal';
import { ValidationBag } from '../interfaces/validation-bag';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { $refetch } from '../hooks/useRefetch';

export interface GenericQueryOptions {
  id?: string;
  with?: string[];
  enabled: boolean;
}

export function useInvoiceQuery(params: { id: string | undefined }) {
  return useQuery<Invoice>(
    ['/api/v1/invoices', params.id],
    () =>
      request(
        'GET',
        endpoint('/api/v1/invoices/:id?include=client.group_settings', {
          id: params.id,
        })
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    {
      staleTime: Infinity,
      enabled: Boolean(params.id),
    }
  );
}

export function useBlankInvoiceQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery<Invoice>(
    ['/api/v1/invoices/create'],
    () =>
      request('GET', endpoint('/api/v1/invoices/create')).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_invoice')
        ? options?.enabled ?? true
        : false,
    }
  );
}

export function bulk(
  id: string[],
  action: 'archive' | 'restore' | 'delete' | 'cancel'
): Promise<AxiosResponse> {
  return request('POST', endpoint('/api/v1/invoices/bulk'), {
    action,
    ids: Array.from(id),
  });
}

const successMessages = {
  mark_sent: 'marked_sent_invoices',
  email: 'emailed_invoices',
  mark_paid: 'marked_invoices_as_paid',
  download: 'exported_data',
  cancel: 'cancelled_invoices',
  auto_bill: 'auto_billed_invoices',
};

interface Params {
  onSuccess?: () => void;
}

export function useBulk(params?: Params) {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action:
      | 'archive'
      | 'restore'
      | 'delete'
      | 'email'
      | 'mark_sent'
      | 'mark_paid'
      | 'download'
      | 'cancel'
      | 'auto_bill',
    emailType?: EmailType
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/invoices/bulk'), {
      action,
      ids,
      ...(emailType && { email_type: emailType }),
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_invoice`;

        toast.success(message);

        params?.onSuccess?.();

        $refetch(['invoices']);

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (
          error.response?.status === 422 &&
          error.response.data.errors.ids?.length
        ) {
          toast.error(error.response.data.errors.ids[0]);
        }
      });
  };
}
