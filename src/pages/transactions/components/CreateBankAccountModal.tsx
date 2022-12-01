/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from 'components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { BankAccountInput } from 'common/interfaces/bank-accounts';
import { useState } from 'react';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useHandleCreate } from 'pages/settings/bank-accounts/create/hooks/useHandleCreate';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CreateBankAccountModal(props: Props) {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  const [bankAccount, setBankAccount] = useState<BankAccountInput>();

  const handleSave = useHandleCreate(
    bankAccount,
    setErrors,
    setIsFormBusy,
    isFormBusy,
    props.setIsModalOpen
  );

  const handleChange = (
    property: keyof BankAccountInput,
    value: BankAccountInput[keyof BankAccountInput]
  ) => {
    setBankAccount((prevState) => ({ ...prevState, [property]: value }));
  };

  const handleCancel = () => {
    if (!isFormBusy) {
      props.setIsModalOpen(false);
    }
  };

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
