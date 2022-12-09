/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField, Link } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { updateUser } from 'common/stores/slices/user';
import { Modal } from 'components/Modal';
import { merge } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';
import { SmsVerificationModal } from './SmsVerificationModal';

export function TwoFactorAuthentication() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const dispatch = useDispatch();

  const [isEnableModalOpen, setIsEnableModalOpen] = useState<boolean>(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState<boolean>(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);

  const [qrCode, setQrCode] = useState('');
  const [qrCodeSecret, setQrCodeSecret] = useState('');

  const [oneTimePassword, setOneTimePassword] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const requestQrCode = () => {
    toast.processing();

    request('GET', endpoint('/api/v1/settings/enable_two_factor'))
      .then((response) => {
        toast.dismiss();

        setQrCode(response.data.data.qrCode);
        setQrCodeSecret(response.data.data.secret);

        setIsEnableModalOpen(true);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
          toast.dismiss();
        } else {
          console.error(error);
        }
      });
  };

  const enableTwoFactor = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/settings/enable_two_factor'), {
      secret: qrCodeSecret,
      one_time_password: oneTimePassword,
    })
      .then((response) => {
        toast.success(response.data.message);

        dispatch(updateUser(merge({}, user, { google_2fa_secret: true })));

        setIsEnableModalOpen(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message);
          toast.dismiss();
        } else {
          toast.error();
        }
      })
      .finally(() => setIsSubmitDisabled(false));
  };

  const disableTwoFactor = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/settings/disable_two_factor'))
      .then(() => {
        toast.success('disabled_two_factor');

        dispatch(updateUser(merge({}, user, { google_2fa_secret: false })));

        setIsDisableModalOpen(false);
      })
      .catch((error) => console.error(error));
  };

  const resetSmsCode = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/sms_reset'), { email: user!.email })
      .then(() => {
        toast.success('check_phone_code');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.dismiss();
          console.error(error);
        }
      });
  };

  const verifyPhoneNumber = (code: string) => {
    toast.processing();

    request('POST', endpoint('/api/v1/sms_reset/confirm?validate_only=true'), {
      code,
      email: user!.email,
    })
      .then(() => {
        toast.success('verified_phone_number');

        dispatch(updateUser(merge({}, user, { verified_phone_number: true })));

        setIsSmsModalOpen(false);

        requestQrCode();

        setIsEnableModalOpen(true);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.dismiss();
          console.error(error);
        }
      });
  };

  const ishost = true;

  const checkPhoneNumberVerification = () => {
    if (ishost) {
      if (!user?.phone) {
        toast.error('enter_phone_number');
      } else if (!user?.verified_phone_number) {
        setIsSmsModalOpen(true);
        resetSmsCode();
      } else {
        requestQrCode();
        setIsEnableModalOpen(true);
      }
    } else {
      requestQrCode();
      setIsEnableModalOpen(true);
    }
  };

  return (
    <>
      <SmsVerificationModal
        visible={isSmsModalOpen}
        setVisible={setIsSmsModalOpen}
        resendSmsCode={resetSmsCode}
        verifyPhoneNumber={verifyPhoneNumber}
      />

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

        <Button disabled={isSubmitDisabled} onClick={() => enableTwoFactor()}>
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
        <Button disabled={isSubmitDisabled} onClick={() => disableTwoFactor()}>
          {t('confirm')}
        </Button>
      </Modal>

      <Card title={t('enable_two_factor')}>
        <Element leftSide="2FA">
          {!user?.google_2fa_secret && (
            <Button
              behavior="button"
              type="minimal"
              onClick={() => checkPhoneNumberVerification()}
            >
              {t('enable')}
            </Button>
          )}

          {user?.google_2fa_secret && (
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
