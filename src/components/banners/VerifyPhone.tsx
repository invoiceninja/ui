/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Banner } from '../Banner';
import { buttonStyles } from './VerifyEmail';
import { Modal } from '../Modal';
import { useEffect, useState } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Alert } from '../Alert';
import { Button } from '../forms';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint, isHosted } from '$app/common/helpers';
import { AxiosError } from 'axios';
import VerificationInput from 'react-verification-input';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { useDispatch } from 'react-redux';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useColorScheme } from '$app/common/colors';

interface VerificationProps {
  visible: boolean;
  onClose: (visible: boolean) => unknown;
}

interface ConfirmationProps extends VerificationProps {
  onResend: () => unknown;
  onComplete: () => unknown;
}

function Confirmation({
  visible,
  onClose,
  onResend,
  onComplete,
}: ConfirmationProps) {
  const [t] = useTranslation();
  const [code, setCode] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleConfirmation = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/verify/confirm'), {
      code,
    }).then(() => {
      toast.success('verified_phone_number');

      $refetch(['users', 'company_users']);

      request('POST', endpoint('/api/v1/refresh')).then(
        (response: GenericSingleResourceResponse<CompanyUser>) => {
          dispatch(updateCompanyUsers(response.data.data));
          onComplete();
        }
      );
    });
  };

  useEffect(() => {
    return () => {
      setCode(null);
    };
  }, []);

  return (
    <Modal title={t('sms_code')} visible={visible} onClose={onClose}>
      <div className="flex justify-center">
        <VerificationInput onComplete={setCode} />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="minimal" onClick={onResend} behavior="button">
          {t('resend_code')}
        </Button>

        <Button
          onClick={handleConfirmation}
          disabled={code === null}
          behavior="button"
          disableWithoutIcon
        >
          {t('verify')}
        </Button>
      </div>
    </Modal>
  );
}

function Verification({ visible, onClose }: VerificationProps) {
  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();
  const [number, setNumber] = useState<string>();
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const handleSms = () => {
    setErrors(undefined);

    if (!isPossiblePhoneNumber(number ?? '')) {
      setErrors({
        message: 'error',
        errors: { phone: [t('invalid_phone_number')] },
      });

      return;
    }

    toast.processing();

    request('POST', endpoint('/api/v1/verify'), {
      phone: number,
    })
      .then(() => {
        toast.success('code_was_sent');
        setIsConfirmationVisible(true);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };
  const colors = useColorScheme();

  return (
    <>
      <Modal
        title={t('verify_phone_number')}
        visible={visible}
        onClose={onClose}
      >
        <div className="flex flex-col mb-1"
          style={{ backgroundColor: colors.$2, color: colors.$3, colorScheme: colors.$0 }}
        >
          <PhoneInput
            international
            placeholder={t('phone')}
            countrySelectProps={{ unicodeFlags: true }}
            defaultCountry="US"
            value={number}
            onChange={setNumber}
          />
        </div>

        {errors?.errors.phone && (
          <Alert type="danger">{errors.errors.phone}</Alert>
        )}

        <Button
          className="self-end"
          behavior="button"
          type="primary"
          onClick={handleSms}
          disableWithoutIcon
        >
          {t('send_code')}
        </Button>
      </Modal>

      <Confirmation
        visible={isConfirmationVisible}
        onClose={setIsConfirmationVisible}
        onResend={handleSms}
        onComplete={() => {
          setIsConfirmationVisible(false);
          onClose(false);
        }}
      />
    </>
  );
}

export function VerifyPhone() {
  const [t] = useTranslation();
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);

  const user = useCurrentUser();
  const account = useCurrentAccount();
  const company = useCurrentCompany();

  if (!account) {
    return null;
  }

  if (!isHosted()) {
    return null;
  }

  if (
    account.account_sms_verified ||
    !user?.email_verified_at ||
    company?.is_disabled
  ) {
    return null;
  }

  return (
    <>
      <Banner variant="orange">
        <div className="flex space-x-1">
          <span>{t('verify_phone_number_help')}.</span>

          <button
            className={buttonStyles}
            onClick={() => setIsVerificationVisible(true)}
          >
            {t('verify_phone_number')}
          </button>
        </div>
      </Banner>

      <Verification
        visible={isVerificationVisible}
        onClose={setIsVerificationVisible}
      />
    </>
  );
}
