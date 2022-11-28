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
import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { BankAccountInput } from 'common/interfaces/bank-accounts';
import { useState, FormEvent } from 'react';
import { useQueryClient } from 'react-query';

interface BankAccountValidation {
  bank_account_name?: string[];
}

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CreateBankAccountModal(props: Props) {
  const [t] = useTranslation();

  useTitle('create_bank_account');

  const queryClient = useQueryClient();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<BankAccountValidation | undefined>(
    undefined
  );

  const [bankAccount, setBankAccount] = useState<BankAccountInput>();

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

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event.preventDefault();

      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/bank_integrations'), bankAccount)
        .then(() => {
          toast.success('created_bank_account');

          queryClient.invalidateQueries('/api/v1/bank_integrations');

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/bank_integrations'),
              },
            })
          );

          props.setIsModalOpen(false);
        })
        .catch((error: AxiosError) => {
          console.error(error);

          if (error?.response?.status === 422) {
            setErrors(error?.response.data.errors);
            toast.dismiss();
          } else {
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('new_bank_account')}
      visible={props.isModalOpen}
      onClose={handleCancel}
      size="regular"
      backgroundColor="gray"
    >
      <Card onFormSubmit={handleSave}>
        <Element leftSide={t('bank_account_name')}>
          <InputField
            value={bankAccount?.bank_account_name}
            onValueChange={(value) => handleChange('bank_account_name', value)}
            errorMessage={errors?.bank_account_name}
          />
        </Element>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="minimal" onClick={handleCancel}>
          {t('cancel')}
        </Button>

        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
