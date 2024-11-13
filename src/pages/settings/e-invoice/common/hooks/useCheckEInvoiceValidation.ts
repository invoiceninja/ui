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
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

interface Params {
  entityId: string;
  enableQuery: boolean;
  clientId: string;
  companyId: string;
  checkInvoiceOnly?: boolean;
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
  const { clientId, companyId, entityId, enableQuery, checkInvoiceOnly } =
    params;

  const queryClient = useQueryClient();

  const [validationEntityResponse, setValidationEntityResponse] =
    useState<ValidationEntityResponse>({
      passes: true,
      invoice: [],
      client: [],
      company: [],
    });

  const handleCheckValidation = async () => {
    if (!checkInvoiceOnly) {
      const clientValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-client', entityId],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity: 'clients',
            entity_id: clientId,
          })
            .then((response) => response)
            .catch((error) => error.response),
        { staleTime: Infinity }
      );

      const companyValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-company', entityId],
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

      setValidationEntityResponse((current) => ({
        ...current,
        ...currentValidationResult,
      }));
    } else {
      const invoiceValidationResponse = await queryClient.fetchQuery(
        ['/api/v1/einvoice/validateEntity-invoice', entityId],
        () =>
          request('POST', endpoint('/api/v1/einvoice/validateEntity'), {
            entity: 'invoices',
            entity_id: entityId,
          })
            .then((response) => response)
            .catch((error) => error.response),
        { staleTime: Infinity }
      );

      if (invoiceValidationResponse?.status === 422) {
        setValidationEntityResponse((current) => ({
          ...current,
          invoice: invoiceValidationResponse.data.invoice,
          passes: false,
        }));
      }
    }
  };

  useEffect(() => {
    if (enableQuery) {
      handleCheckValidation();
    }
  }, [enableQuery]);

  return { validationResponse: validationEntityResponse };
}
