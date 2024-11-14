/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Invoice } from '$app/common/interfaces/invoice';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

interface Params {
  resource: Invoice | undefined;
  enableQuery: boolean;
  companyId?: string;
  checkInvoiceOnly?: boolean;
  withToaster?: boolean;
  onFinished?: () => void;
}

export interface EntityError {
  field: string;
  label?: string;
}

export interface ValidationEntityResponse {
  passes: boolean;
  invoice: string[];
  client: EntityError[];
  company: EntityError[];
}

export function useCheckEInvoiceValidation(params: Params) {
  const {
    companyId,
    resource,
    enableQuery,
    checkInvoiceOnly,
    withToaster,
    onFinished,
  } = params;

  const { id } = useParams();
  const queryClient = useQueryClient();

  const [validationEntityResponse, setValidationEntityResponse] = useState<
    ValidationEntityResponse | undefined
  >();

  const handleCheckValidation = async () => {
    withToaster && toast.processing();

    if (!checkInvoiceOnly && resource?.client_id && companyId) {
      const clientValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-client', resource?.client_id],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity: 'clients',
            entity_id: resource?.client_id,
          })
            .then((response) => response)
            .catch((error) => error.response),
        { staleTime: Infinity }
      );

      const companyValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-company', companyId],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity: 'companies',
            entity_id: companyId,
          })
            .then((response) => response)
            .catch((error) => error.response),
        { staleTime: Infinity }
      );

      let currentValidationResult = { client: [], company: [], passes: true };

      if (clientValidationResponse?.status === 422) {
        currentValidationResult = {
          company: [],
          client: clientValidationResponse.data.client,
          passes: false,
        };
      }

      if (companyValidationResponse?.status === 422) {
        currentValidationResult = {
          ...currentValidationResult,
          company: companyValidationResponse.data.company,
          passes: false,
        };
      }

      setValidationEntityResponse(() => ({
        invoice: [],
        ...currentValidationResult,
      }));
    } else {
      const invoiceValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-invoice', resource?.id],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity: 'invoices',
            entity_id: resource?.id,
          })
            .then((response) => response)
            .catch((error) => error.response),
        { staleTime: Infinity }
      );

      withToaster && toast.dismiss();

      if (invoiceValidationResponse?.status === 422) {
        setValidationEntityResponse(() =>
          cloneDeep({
            client: [],
            company: [],
            invoice: invoiceValidationResponse.data.invoice,
            passes: false,
          })
        );
      }
    }

    onFinished?.();
  };

  useEffect(() => {
    if (enableQuery && id === resource?.id) {
      handleCheckValidation();
    }
  }, [enableQuery, resource]);

  return { validationResponse: validationEntityResponse };
}
