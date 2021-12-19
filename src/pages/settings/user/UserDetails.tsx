/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import {
  AccentColor,
  Connect,
  Details,
  Notifications,
  Password,
} from './components';

export function UserDetails() {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('user_details')}`;
  });

  const onSave = () => {
    setIsModalOpen(true);
  };

  return (
    <Settings onSaveClick={onSave} title={t('user_details')}>
      <Modal
        onClose={setIsModalOpen}
        visible={isModalOpen}
        title={t('confirmation')}
        text={t('please_enter_your_password')}
      >
        <InputField
          id="current_password"
          type="password"
          label={t('current_password')}
        />
        <Button>{t('continue')}</Button>
      </Modal>

      <div className="space-y-6 mt-6">
        <Details />
        <Password />
        <Connect />
        <AccentColor />
        <Notifications />
      </div>
    </Settings>
  );
}
