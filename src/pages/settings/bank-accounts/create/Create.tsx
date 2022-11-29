/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { BankAccountInput } from 'common/interfaces/bank-accounts';
import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';

interface BankAccountValidation {
  bank_account_name?: string[];
}

export function Create() {
  const [t] = useTranslation();

  useTitle('create_bank_account');

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    { name: t('create_bank_account'), href: '/bank_accounts/create' },
  ];

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<BankAccountValidation>();

  const [bankAccount, setBankAccount] = useState<BankAccountInput>();

  const handleChange = (
    property: keyof BankAccountInput,
    value: BankAccountInput[keyof BankAccountInput]
  ) => {
    setBankAccount((prevState) => ({ ...prevState, [property]: value }));
  };

  const handleCancel = () => {
    if (!isFormBusy) {
      navigate('/settings/bank_accounts');
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event?.preventDefault();

      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/bank_integrations'), bankAccount)
        .then(() => {
          toast.success('created_bank_account');

          queryClient.invalidateQueries('/api/v1/bank_integrations');

          navigate('/settings/bank_accounts');
        })
        .catch((error: AxiosError) => {
          if (error?.response?.status === 422) {
            setErrors(error.response.data.errors);
            toast.dismiss();
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Settings
      title={t('create_bank_account')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#create_bank_account"
      onCancelClick={handleCancel}
      onSaveClick={handleSave}
    >
      <Card onFormSubmit={handleSave} title={t('create_bank_account')}>
        <Element leftSide={t('bank_account_name')}>
          <InputField
            value={bankAccount?.bank_account_name}
            onValueChange={(value) => handleChange('bank_account_name', value)}
            errorMessage={errors?.bank_account_name}
          />
        </Element>
      </Card>
    </Settings>
  );
}
