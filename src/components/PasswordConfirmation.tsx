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
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, InputField } from './forms';
import { Modal } from './Modal';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';

interface Props {
  show?: boolean;
  onSave: (password: string, isRequired: boolean) => any;
  onClose: (visible: boolean) => any;
}

export function PasswordConfirmation(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = useCurrentCompany();

  const [isModalOpen, setIsModalOpen] = useState(props.show ?? false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [lastPasswordEntryTime, setLastPasswordEntryTime] = useAtom(
    lastPasswordEntryTimeAtom
  );

  const lastPwdTimeDiff = dayjs().unix() - lastPasswordEntryTime;

  const isPasswordTimeoutExpired =
    lastPwdTimeDiff > company.default_password_timeout / 1000 &&
    company.default_password_timeout > 0;

  useEffect(() => {
    setIsModalOpen(props.show as boolean);
  }, [props.show]);

  const handleConfirm = (
    event?: FormEvent<HTMLFormElement>,
    isFormConfirmation?: boolean
  ) => {
    event?.preventDefault();
    props.onSave(currentPassword, true);
    isFormConfirmation && setLastPasswordEntryTime(dayjs().unix());
    setCurrentPassword('');

    props.onClose(false);
  };

  useEffect(() => {
    if (isModalOpen && !isPasswordTimeoutExpired) {
      handleConfirm();
    }
  }, [isModalOpen]);

  return (
    <Modal
      onClose={() =>
        location.pathname.startsWith('/settings/users')
          ? navigate('/settings/users')
          : props.onClose(false)
      }
      visible={isModalOpen && isPasswordTimeoutExpired}
      title={t('confirmation')}
      text={t('please_enter_your_password')}
    >
      <form onSubmit={(event) => handleConfirm(event, true)}>
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
        onClick={(event: FormEvent<HTMLFormElement>) =>
          handleConfirm(event, true)
        }
        disableWithoutIcon
      >
        {t('continue')}
      </Button>
    </Modal>
  );
}
