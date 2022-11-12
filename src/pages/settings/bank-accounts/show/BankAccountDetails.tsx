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
import { useTitle } from 'common/hooks/useTitle';
import { BankAccDetails } from 'common/interfaces/bank-accounts';
import { useBankAccountsQuery } from 'common/queries/bank-accounts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { useBankAccountPages } from '../common/hooks/useBankAccountPages';
import { Details } from '../components';

const BankAccountDetails = () => {
  useTitle('bank_account_details');
  const { id } = useParams();
  const [t] = useTranslation();
  const pages = useBankAccountPages();
  const { data: response } = useBankAccountsQuery({ id });
  const [bankAccountDetails, setBankAccountDetails] = useState<BankAccDetails>(
    defaultAccountDetails
  );

  useEffect(() => {
    setBankAccountDetails(response?.data?.data);
  }, [response]);

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
