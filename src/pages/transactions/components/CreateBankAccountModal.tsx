/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from '$app/components/forms';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { useState } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleCreate } from '$app/pages/settings/bank-accounts/create/hooks/useHandleCreate';
import { useBlankBankAccountQuery } from '$app/pages/settings/bank-accounts/common/queries';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onCreatedBankAccount?: (account: BankAccount) => unknown;
}

export function CreateBankAccountModal(props: Props) {
  const [t] = useTranslation();

  const { data } = useBlankBankAccountQuery();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  const [bankAccount, setBankAccount] = useState<BankAccount>();

  const handleSave = useHandleCreate(
    bankAccount,
    setErrors,
    setIsFormBusy,
    isFormBusy,
    props.setIsModalOpen,
    props.onCreatedBankAccount
  );

  const handleChange = (
    property: keyof BankAccount,
    value: BankAccount[keyof BankAccount]
  ) => {
    setBankAccount(
      (prevState) => prevState && { ...prevState, [property]: value }
    );
  };

  const handleCancel = () => {
    if (!isFormBusy) {
      props.setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (data) {
      setBankAccount(data);
    }
  }, [data]);

  return (
    <Modal
      title={t('new_bank_account')}
      visible={props.isModalOpen}
      onClose={handleCancel}
    >
      <InputField
        label={t('name')}
        value={bankAccount?.bank_account_name}
        onValueChange={(value) => handleChange('bank_account_name', value)}
        errorMessage={errors?.errors.bank_account_name}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
