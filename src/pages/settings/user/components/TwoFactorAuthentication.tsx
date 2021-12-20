/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField, Link } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { Modal } from 'components/Modal';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeSecret, setQrCodeSecret] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [isSumbitDisabled, setIsSubmitDisabled] = useState(false);

  const requestQrCode = () => {
    toast.loading(t('processing'));

    axios
      .get(endpoint('/api/v1/settings/enable_two_factor'), {
        headers: defaultHeaders,
      })
      .then((response) => {
        toast.dismiss();

        setQrCode(response.data.data.qrCode);
        setQrCodeSecret(response.data.data.secret);

        setIsModalOpen(true);
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        console.log(error);

        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      });
  };

  const enableTwoFactor = () => {
    toast.loading(t('processing'));

    axios
      .post(
        endpoint('/api/v1/settings/enable_two_factor'),
        {
          secret: qrCodeSecret,
          one_time_password: oneTimePassword,
        },
        { headers: defaultHeaders }
      )
      .then((response) => {
        toast.dismiss();

        setIsModalOpen(false);

        toast.success(response.data.message);
      })
      .catch((error: AxiosError) => {
        toast.dismiss();

        error.response?.status === 400
          ? toast.error(error.response.data.message)
          : toast.error(t('error_title'));
      })
      .finally(() => setIsSubmitDisabled(false));
  };

  return (
    <>
      <Modal
        title={t('enable_two_factor')}
        visible={isModalOpen}
        onClose={setIsModalOpen}
      >
        <div className="flex flex-col items-center pb-8 space-y-4">
          <QRCode size={156} value={qrCode} />
          <p className="text-gray-900 font-semibold">{qrCodeSecret}</p>
        </div>

        <InputField
          id="one_time_password"
          type="text"
          label={t('one_time_password')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setOneTimePassword(event.target.value)
          }
        />

        <Button disabled={isSumbitDisabled} onClick={() => enableTwoFactor()}>
          {t('continue')}
        </Button>

        <div className="flex justify-center">
          <Link
            external
            to="https://github.com/antonioribeiro/google2fa#google-authenticator-apps"
          >
            {t('learn_more')}
          </Link>
        </div>
      </Modal>

      <Card title={t('enable_two_factor')}>
        <Element leftSide="2FA">
          <Button
            behaviour="button"
            type="minimal"
            onClick={() => requestQrCode()}
          >
            {t('Enable')}
          </Button>
        </Element>
      </Card>
    </>
  );
}
