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
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { toast } from '../helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { EmailType } from '$app/pages/invoices/common/components/SendEmailModal';
import { ValidationBag } from '../interfaces/validation-bag';

export interface GenericQueryOptions {
  id?: string;
  with?: string[];
  enabled: boolean;
}

export function useInvoiceQuery(params: { id: string | undefined }) {
  return useQuery<Invoice>(
    route('/api/v1/invoices/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/invoices/:id?include=client', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useBlankInvoiceQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery<Invoice>(
    route('/api/v1/invoices/create'),
    () =>
      request('GET', endpoint('/api/v1/invoices/create')).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_invoice'),
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
      | 'cancel',
    emailType?: EmailType
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/invoices/bulk'), {
      action,
      ids,
      ...(emailType && { email_type: emailType }),
    })
      .then(() => {
        if (action === 'mark_sent') {
          toast.success('marked_sent_invoices');
        } else if (action === 'email') {
          toast.success('emailed_invoices');
        } else if (action === 'mark_paid') {
          toast.success('marked_invoices_as_paid');
        } else if (action === 'download') {
          toast.success('exported_data');
        } else if (action === 'cancel') {
          toast.success('cancelled_invoices');
        } else {
          toast.success(`${action}d_invoice`);
        }

        params?.onSuccess?.();

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (
          error.response?.status === 422 &&
          error.response.data.errors.ids?.length
        ) {
          return toast.error(error.response.data.errors.ids[0]);
        }

        console.error(error);
        toast.error();
      });
  };
}
