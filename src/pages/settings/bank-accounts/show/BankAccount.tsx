/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { BankAccount as BankAccountEntity } from '$app/common/interfaces/bank-accounts';
import { ResourceActions } from '$app/components/ResourceActions';
import { Settings } from '../../../../components/layouts/Settings';
import { useActions } from '../common/hooks/useActions';
import { useBankAccountQuery } from '../common/queries';
import { Details } from '../components/Details';

export function BankAccount() {
  useTitle('bank_account');

  const { id } = useParams();

  const [t] = useTranslation();
  const actions = useActions();
  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    {
      name: t('bank_account'),
      href: route('/settings/bank_accounts/:id/details', { id }),
    },
  ];

  const { data: response } = useBankAccountQuery({ id });

  const [accountDetails, setAccountDetails] = useState<BankAccountEntity>();

  useEffect(() => {
    setAccountDetails(response);
  }, [response]);

  return (
    <Settings
      title={t('bank_account')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#bank_account_details"
      navigationTopRight={
        accountDetails && (
          <ResourceActions
            resource={accountDetails}
            saveButtonLabel={t('edit')}
            onSaveClick={() =>
              navigate(route('/settings/bank_accounts/:id/edit', { id }))
            }
            actions={actions}
            disableSaveButton={!accountDetails}
          />
        )
      }
    >
      <Details accountDetails={accountDetails} />
    </Settings>
  );
}
