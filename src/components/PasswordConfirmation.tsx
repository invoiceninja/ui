/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, InputField } from './forms';
import { Modal } from './Modal';
import { useAtomValue } from 'jotai';
import { isPasswordRequiredAtom } from '$app/common/atoms/password-confirmation';

interface Props {
  show?: boolean;
  onSave: (password: string, isRequired: boolean) => any;
  onClose: (visible: boolean) => any;
  tableActions?: boolean;
}

export function PasswordConfirmation(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const location = useLocation();

  const inputFieldRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(props.show ?? false);

  const isPasswordRequired = useAtomValue(isPasswordRequiredAtom);

  useEffect(() => {
    setIsModalOpen(props.show as boolean);
  }, [props.show]);

  const handleConfirm = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    props.onSave(currentPassword, Boolean(currentPassword));
    setCurrentPassword('');

    props.onClose(false);
  };

  useEffect(() => {
    if (isModalOpen && !isPasswordRequired) {
      handleConfirm();
    }
  }, [isModalOpen]);

  return (
    <Modal
      onClose={() => {
        location.pathname.startsWith('/settings/users') && !props.tableActions
          ? navigate('/settings/users')
          : props.onClose(false);

        setCurrentPassword('');
      }}
      visible={isModalOpen && isPasswordRequired}
      title={t('confirmation')}
      text={t('please_enter_your_password')}
      initialFocusRef={inputFieldRef}
    >
      <form onSubmit={(event) => handleConfirm(event)}>
        <InputField
          innerRef={inputFieldRef}
          id="current_password"
          type="password"
          label={t('current_password')}
          required
          changeOverride={true}
          value={currentPassword}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setCurrentPassword(event.target.value)
          }
        />
      </form>
      <Button
        disabled={currentPassword.length === 0}
        onClick={(event: FormEvent<HTMLFormElement>) => handleConfirm(event)}
        disableWithoutIcon
      >
        {t('continue')}
      </Button>
    </Modal>
  );
}
