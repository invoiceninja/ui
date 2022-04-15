/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useHandleUpdate(companyGateway: CompanyGateway | undefined) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return () => {
    if (!companyGateway) {
      return;
    }

    const toastId = toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/company_gateways/:id', { id: companyGateway.id }),
        companyGateway,
        {
          headers: defaultHeaders,
        }
      )
      .then(() => toast.success(t('updated_company_gateway'), { id: toastId }))
      .catch((error) => {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/company_gateways/:id', {
            id: companyGateway.id,
          })
        )
      );
  };
}
