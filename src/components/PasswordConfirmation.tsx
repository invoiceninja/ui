/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
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

  const [isModalOpen, setIsModalOpen] = useState(props.show ?? false);
  const [currentPassword, setCurrentPassword] = useState('');

  const isPasswordRequired = true;

  useEffect(() => {
    setIsModalOpen(props.show as boolean);
  }, [props.show]);

  const handleConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onClose(false);
    props.onSave(currentPassword, isPasswordRequired);

    setCurrentPassword('');
  };

  return (
    <Modal
      onClose={() => {
        props.onClose(false);
      }}
      visible={isModalOpen}
      title={t('confirmation')}
      text={t('please_enter_your_password')}
    >
      <form onSubmit={handleConfirm}>
        <InputField
          id="current_password"
          type="password"
          label={t('current_password')}
          required
          value={currentPassword}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setCurrentPassword(event.target.value)
          }
        />
      </form>
      <Button
        disabled={currentPassword.length === 0}
        onClick={handleConfirm}
        disableWithoutIcon
      >
        {t('continue')}
      </Button>
    </Modal>
  );
}
