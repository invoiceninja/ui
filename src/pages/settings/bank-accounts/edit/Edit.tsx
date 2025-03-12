/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Toggle from '$app/components/forms/Toggle';
import { useBankAccountQuery } from '$app/pages/settings/bank-accounts/common/queries';
import { Settings } from '$app/components/layouts/Settings';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Edit() {
  useTitle('edit_bank_account');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams<string>();

  const { data: response } = useBankAccountQuery({ id });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  const [accountDetails, setAccountDetails] = useState<BankAccount>();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    {
      name: t('edit_bank_account'),
      href: route('/bank_accounts/:id/edit', { id }),
    },
  ];

  const handleChange = (
    property: keyof BankAccount,
    value: BankAccount[keyof BankAccount]
  ) => {
    setAccountDetails(
      (prevState) => prevState && { ...prevState, [property]: value }
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event.preventDefault();

      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'PUT',
        endpoint('/api/v1/bank_integrations/:id', { id }),
        accountDetails
      )
        .then(() => {
          toast.success('updated_bank_account');

          $refetch(['bank_integrations']);

          navigate('/settings/bank_accounts');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (response) {
      setAccountDetails(response);
    }
  }, [response]);

  return (
    <Settings
      title={t('edit_bank_account')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#edit_bank_account"
      onSaveClick={handleSave}
    >
      <Card onFormSubmit={handleSave} title={t('edit_bank_account')}>
        <Element leftSide={t('account_name')}>
          <InputField
            value={accountDetails?.bank_account_name}
            onValueChange={(value) => handleChange('bank_account_name', value)}
            errorMessage={errors?.errors.bank_account_name}
          />
        </Element>

        <Element leftSide={t('sync_from')}>
          <InputField
            type="date"
            value={accountDetails?.from_date}
            onValueChange={(value) => handleChange('from_date', value)}
            errorMessage={errors?.errors.from_date}
          />
        </Element>

        <Element leftSide={t('auto_sync')}>
          <Toggle
            checked={accountDetails?.auto_sync || false}
            onValueChange={(value) => handleChange('auto_sync', value)}
          />
        </Element>
      </Card>
    </Settings>
  );
}
