/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VerificationInput from 'react-verification-input';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function Disable2faModal(props: Props) {
  const [t] = useTranslation();

  const { visible, setVisible } = props;

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const [isSendCodeBusy, setIsSendCodeBusy] = useState<boolean>(false);
  const [isVerifyCodeBusy, setIsVerifyCodeBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  const [isCodeVerificationModalOpen, setIsCodeVerificationModalOpen] =
    useState<boolean>(false);

  const handleSendCode = () => {
    toast.processing();

    setIsSendCodeBusy(true);

    request('POST', endpoint('/api/v1/sms_reset'), {
      email,
    })
      .then((response) => {
        toast.success(response.data.message);

        setVisible(false);
        setIsCodeVerificationModalOpen(true);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsSendCodeBusy(false));
  };

  const handleConfirmCode = () => {
    toast.processing();

    setIsVerifyCodeBusy(true);

    request('POST', endpoint('/api/v1/sms_reset/confirm'), {
      email,
      code,
    })
      .then((response) => {
        toast.success(response.data.message);

        setCode('');
        setEmail('');
        setIsCodeVerificationModalOpen(false);
      })
      .finally(() => setIsVerifyCodeBusy(false));
  };

  return (
    <>
      <Modal
        title={t('disable_2fa')}
        visible={visible}
        onClose={() => {
          setVisible(false);
          setEmail('');
        }}
      >
        <div className="flex flex-col space-y-6">
          <InputField
            label={t('email')}
            value={email}
            onValueChange={(value) => {
              setEmail(value);
              errors && setErrors(undefined);
            }}
            errorMessage={errors?.errors.email}
          />

          <Button
            className="self-end"
            onClick={handleSendCode}
            disableWithoutIcon
            disabled={!email || isSendCodeBusy}
          >
            {t('send_code')}
          </Button>
        </div>
      </Modal>

      <Modal
        title={t('disable_two_factor')}
        visible={isCodeVerificationModalOpen}
        onClose={() => {
          setIsCodeVerificationModalOpen(false);
          setCode('');
          setEmail('');
        }}
      >
        <div className="flex flex-col space-y-7 items-center">
          <VerificationInput onComplete={setCode} />

          <div className="flex self-end space-x-5">
            <Button
              type="minimal"
              onClick={handleSendCode}
              disableWithoutIcon
              disabled={isSendCodeBusy || isVerifyCodeBusy}
            >
              {t('resend_code')}
            </Button>

            <Button
              onClick={handleConfirmCode}
              disableWithoutIcon
              disabled={isSendCodeBusy || isVerifyCodeBusy || code.length !== 6}
            >
              {t('verify')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
