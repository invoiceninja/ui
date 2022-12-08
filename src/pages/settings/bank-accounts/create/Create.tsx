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
import { useTitle } from 'common/hooks/useTitle';
import { BankAccountInput } from 'common/interfaces/bank-accounts';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { useHandleCreate } from './hooks/useHandleCreate';

export function Create() {
  const [t] = useTranslation();

  useTitle('new_bank_account');

  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    { name: t('new_bank_account'), href: '/settings/bank_accounts/create' },
  ];

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  const [bankAccount, setBankAccount] = useState<BankAccountInput>();

  const handleSave = useHandleCreate(
    bankAccount,
    setErrors,
    setIsFormBusy,
    isFormBusy
  );

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

  return (
    <Settings
      title={t('create_bank_account')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#create_bank_account"
      onCancelClick={handleCancel}
      onSaveClick={handleSave}
    >
      <Card onFormSubmit={handleSave} title={t('new_bank_account')}>
        <Element leftSide={t('name')}>
          <InputField
            value={bankAccount?.bank_account_name}
            onValueChange={(value) => handleChange('bank_account_name', value)}
            errorMessage={errors?.errors.bank_account_name}
          />
        </Element>
      </Card>
    </Settings>
  );
}
