/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { defaultAccountDetails } from 'common/constants/bank-accounts';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { BankAccDetails } from 'common/interfaces/bank-accounts';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { Details } from '../components';

const BankAccountDetails = () => {
  useTitle('bank_account_details');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { id: bankAccountId } = useParams();
  const [bankAccountDetails, setBankAccountDetails] = useState<BankAccDetails>(
    defaultAccountDetails
  );

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const fetchBankAccountDetails = async () => {
    toast.loading(t('processing'));

    try {
      const { data: responseData } = await request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: bankAccountId })
      );
      setBankAccountDetails(responseData?.data);
    } catch (error) {
      console.error(error);
      navigate(route('/settings/bank_accounts'));
      return;
    }
    toast.dismiss();
  };

  useEffect(() => {
    fetchBankAccountDetails();
  }, []);

  return (
    <Settings
      title={t('bank_account_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#bank_account_details"
    >
      <Details accountDetails={bankAccountDetails} />
    </Settings>
  );
};
export default BankAccountDetails;
