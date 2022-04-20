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
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { defaultHeaders } from 'common/queries/common/headers';
import { updateUser } from 'common/stores/slices/user';
import { Modal } from 'components/Modal';
import { merge } from 'lodash';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const user = useCurrentUser();

  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  const [qrCode, setQrCode] = useState('');
  const [qrCodeSecret, setQrCodeSecret] = useState('');

  const [oneTimePassword, setOneTimePassword] = useState('');
  const [isSumbitDisabled, setIsSubmitDisabled] = useState(false);

  const requestQrCode = () => {
    toast.loading(t('processing'));

    axios
      .get(endpoint('/api/v1/settings/enable_two_factor'), {
        headers: defaultHeaders(),
      })
      .then((response) => {
        toast.dismiss();

        setQrCode(response.data.data.qrCode);
        setQrCodeSecret(response.data.data.secret);

        setIsEnableModalOpen(true);
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        console.error(error);

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
        { headers: defaultHeaders() }
      )
      .then((response) => {
        toast.dismiss();
        toast.success(response.data.message);

        dispatch(updateUser(merge({}, user, { google_2fa_secret: true })));

        setIsEnableModalOpen(false);
      })
      .catch((error: AxiosError) => {
        toast.dismiss();

        error.response?.status === 400
          ? toast.error(error.response.data.message)
          : toast.error(t('error_title'));
      })
      .finally(() => setIsSubmitDisabled(false));
  };

  const disableTwoFactor = () => {
    toast.loading(t('processing'));

    axios
      .post(
        endpoint('/api/v1/settings/disable_two_factor'),
        {},
        { headers: defaultHeaders() }
      )
      .then(() => {
        toast.dismiss();
        toast.success(t('disabled_two_factor'));

        dispatch(updateUser(merge({}, user, { google_2fa_secret: false })));

        setIsDisableModalOpen(false);
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      <Modal
        title={t('enable_two_factor')}
        visible={isEnableModalOpen}
        onClose={setIsEnableModalOpen}
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

        <Link
          external
          to="https://github.com/antonioribeiro/google2fa#google-authenticator-apps"
        >
          {t('learn_more')}
        </Link>
      </Modal>

      <Modal
        title={t('disable_two_factor')}
        visible={isDisableModalOpen}
        onClose={setIsDisableModalOpen}
      >
        <Button disabled={isSumbitDisabled} onClick={() => disableTwoFactor()}>
          {t('confirm')}
        </Button>
      </Modal>

      <Card title={t('enable_two_factor')}>
        <Element leftSide="2FA">
          {!user.google_2fa_secret && (
            <Button
              behavior="button"
              type="minimal"
              onClick={() => requestQrCode()}
            >
              {t('enable')}
            </Button>
          )}

          {user.google_2fa_secret && (
            <Button
              behavior="button"
              type="minimal"
              onClick={() => setIsDisableModalOpen(true)}
            >
              {t('disable')}
            </Button>
          )}
        </Element>
      </Card>
    </>
  );
}
