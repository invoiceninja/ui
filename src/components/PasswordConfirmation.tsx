/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from 'common/interfaces/validation-bag';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from './forms';
import { Modal } from './Modal';

interface Props {
  show?: boolean;
  onSave: (password: string, isRequired: boolean) => any;
  onClose: (visible: boolean) => any;
}

export function PasswordConfirmation(props: Props) {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const [isModalOpen, setIsModalOpen] = useState(props.show ?? false);
  const [currentPassword, setCurrentPassword] = useState('');

  const isPasswordRequired = true;

  useEffect(() => {
    setIsModalOpen(props.show as boolean);
  }, [props.show]);

  return (
    <Modal
      onClose={() => {
        props.onClose(false);
        setErrors(undefined);
      }}
      visible={isModalOpen}
      title={t('confirmation')}
      text={t('please_enter_your_password')}
    >
      <InputField
        id="current_password"
        type="password"
        label={t('current_password')}
        required
        value={currentPassword}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setCurrentPassword(event.target.value)
        }
        errorMessage={errors?.errors.password}
      />
      <Button
        onClick={() => {
          return props.onSave(currentPassword, isPasswordRequired);
        }}
      >
        {t('continue')}
      </Button>
    </Modal>
  );
}
