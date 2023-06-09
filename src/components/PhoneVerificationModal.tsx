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
import { Button, InputField, SelectField } from './forms';
import { Modal } from './Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useCountries } from '$app/common/hooks/useCountries';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { SmsVerificationModal } from '$app/pages/settings/user/components/SmsVerificationModal';
import { Alert } from './Alert';
import { useQueryClient } from 'react-query';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function PhoneVerificationModal(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const countries = useCountries();
  const queryClient = useQueryClient();

  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);

  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [errors, setErrors] = useState<ValidationBag>();

  const handleClose = () => {
    props.setVisible(false);
    setPhoneNumber('');
    setCountryCode('');
    setErrors(undefined);
  };

  const handleSendSMSCode = () => {
    setErrors(undefined);

    toast.processing();

    request('POST', endpoint('/api/v1/verify'), {
      phone: `+${countryCode}${phoneNumber}`,
    })
      .then(() => {
        toast.success('check_phone_code');

        setIsSmsModalOpen(true);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message);
        } else if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.dismiss();
          console.error(error);
        }
      });
  };

  const handleVerifyPhoneNumber = (code: string) => {
    toast.processing();

    request('POST', endpoint('/api/v1/verify/confirm'), {
      code,
    })
      .then(() => {
        toast.success('verified_phone_number');

        queryClient.invalidateQueries('/api/v1/users');
        queryClient.invalidateQueries('/api/v1/company_users');

        request('POST', endpoint('/api/v1/refresh'))
          .then((response: GenericSingleResourceResponse<CompanyUser>) => {
            dispatch(updateCompanyUsers(response.data.data));

            setIsSmsModalOpen(false);

            props.setVisible(false);
          })
          .catch((error: AxiosError) => {
            console.error(error);
            toast.error();
          });
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

  return (
    <>
      <Modal
        title={t('verify_phone_number')}
        visible={props.visible}
        onClose={handleClose}
      >
        <div className="flex flex-col text-gray-900 mb-1">
          <span className="text-gray-500 mb-2">{t('phone_number')}</span>

          <div className="flex space-x-3">
            <SelectField
              value={countryCode}
              onValueChange={(value) => setCountryCode(value)}
              withBlank
              style={{ width: '5.5rem' }}
            >
              {countries.map((country, index) => (
                <option key={index} value={country.country_code}>
                  + {country.country_code}
                </option>
              ))}
            </SelectField>

            <div className="flex-1">
              <InputField
                value={phoneNumber}
                onValueChange={(value) => setPhoneNumber(value)}
              />
            </div>
          </div>
        </div>

        {errors?.errors.phone && (
          <Alert type="danger">{errors.errors.phone}</Alert>
        )}

        <Button
          className="self-end"
          behavior="button"
          type="primary"
          onClick={handleSendSMSCode}
          disableWithoutIcon
          disabled={!countryCode || !phoneNumber}
        >
          {t('send_code')}
        </Button>
      </Modal>

      <SmsVerificationModal
        visible={isSmsModalOpen}
        setVisible={setIsSmsModalOpen}
        verifyPhoneNumber={handleVerifyPhoneNumber}
      />
    </>
  );
}
