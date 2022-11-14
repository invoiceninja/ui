/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BankAccountDetails } from 'common/interfaces/bank-accounts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { useBankAccountsQuery } from '../common/queries';
import { Details } from '../components/Details';

export function BankAccount() {
  useTitle('bank_account_details');

  const { id } = useParams();

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const { data: response } = useBankAccountsQuery({ id });

  const [accountDetails, setAccountDetails] = useState<BankAccountDetails>();

  useEffect(() => {
    setAccountDetails(response?.data?.data);
  }, [response]);

  return (
    <Settings
      title={t('bank_account_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#bank_account_details"
    >
      <Details accountDetails={accountDetails} />
    </Settings>
  );
}
