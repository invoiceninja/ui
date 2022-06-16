/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCurrentAccount } from 'common/hooks/useCurrentAccount';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Flutter } from './icons';
import { PasswordConfirmation } from './PasswordConfirmation';

export function SwitchToFlutter() {
  const [t] = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const account = useCurrentAccount();

  const onSubmit = () => {
    const toastId = toast.loading(t('processing'));

    request('PUT', endpoint('/api/v1/accounts/:id', { id: account.id }), {
      set_react_as_default_ap: false,
    })
      .then(() => window.location.reload())
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 400
          ? toast.error(error.response.data.message, { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <>
      <button onClick={() => setIsModalVisible(true)}>
        <Flutter width={32} height={32} />
      </button>

      <PasswordConfirmation
        show={isModalVisible}
        onClose={setIsModalVisible}
        onSave={() => onSubmit()}
      />
    </>
  );
}
