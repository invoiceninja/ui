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
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import {
  BankAccountDetails,
  BankAccountInput,
} from 'common/interfaces/bank-accounts';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { useBankAccountsQuery } from '../common/queries';

interface BankAccountValidation {
  bank_account_name?: string[];
}

export function Edit() {
  useTitle('edit_bank_account');

  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams<string>();

  const { data: response } = useBankAccountsQuery({ id });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<BankAccountValidation | undefined>(
    undefined
  );

  const [accountDetails, setAccountDetails] = useState<BankAccountInput>();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    { name: t('edit_bank_account'), href: `/bank_accounts/${id}/edit` },
  ];

  const handleChange = (
    property: keyof BankAccountInput,
    value: BankAccountInput[keyof BankAccountInput]
  ) => {
    setAccountDetails((prevState) => ({ ...prevState, [property]: value }));
  };

  const getBankAccount = (bankAccount: BankAccountDetails | undefined) => {
    return {
      bank_account_name: bankAccount?.bank_account_name || '',
    };
  };

  const handleCancel = () => {
    if (!isFormBusy) {
      navigate(route('/settings/bank_accounts'));
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event?.preventDefault();

      const toastId = toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      try {
        await request(
          'PUT',
          endpoint('/api/v1/bank_integrations/:id', { id }),
          accountDetails
        );
        setIsFormBusy(false);
        toast.success(t('updated_bank_account'), { id: toastId });
        navigate(route('/settings/bank_accounts'));
      } catch (cachedError) {
        const error = cachedError as AxiosError;
        console.error(error);
        if (error?.response?.status === 422) {
          setErrors(error?.response?.data?.errors);
          toast.dismiss();
        } else {
          toast.error();
        }
        setIsFormBusy(false);
      }
    }
  };

  useEffect(() => {
    setAccountDetails(getBankAccount(response));
  }, [response]);

  return (
    <Settings
      title={t('edit_bank_account')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#edit_bank_account"
      onCancelClick={handleCancel}
      onSaveClick={handleSave}
    >
      <Card onFormSubmit={handleSave} title={t('edit_bank_account')}>
        <Element leftSide={t('bank_account_name')}>
          <InputField
            value={accountDetails?.bank_account_name}
            onValueChange={(value) => handleChange('bank_account_name', value)}
            errorMessage={errors?.bank_account_name}
          />
        </Element>
      </Card>
    </Settings>
  );
}
