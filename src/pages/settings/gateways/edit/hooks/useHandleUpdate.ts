/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

export function useHandleUpdate(companyGateway: CompanyGateway | undefined) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return () => {
    if (!companyGateway) {
      return;
    }

    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/company_gateways/:id', { id: companyGateway.id }),
      companyGateway
    )
      .then(() => toast.success(t('updated_company_gateway'), { id: toastId }))
      .catch((error) => {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/company_gateways/:id', {
            id: companyGateway.id,
          })
        )
      );
  };
}
