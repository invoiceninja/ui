/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function useHandleCreate(companyGateway: CompanyGateway | undefined) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return () => {
    const toastId = toast.loading(t('processing'));

    axios
      .post(endpoint('/api/v1/company_gateways'), companyGateway, {
        headers: defaultHeaders(),
      })
      .then(() => {
        toast.success(t('created_company_gateway'), { id: toastId });
        navigate('/settings/online_payments');
      })
      .catch((error) => {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
      });
  };
}
