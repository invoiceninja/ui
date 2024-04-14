/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { Modal } from '$app/components/Modal';
import { useState, SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { Logo } from '../components';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { isEqual } from 'lodash';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { route } from '$app/common/helpers/route';
import { GatewayTypeIcon } from '$app/pages/clients/show/components/GatewayTypeIcon';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }: 
`;

export function CompanyEdit(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const companyChanges = useInjectCompanyChanges();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [stepIndex, setStepIndex] = useState<number>(0);

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const handleChangeName = (value: string) => {
    handleChange('settings.name', value);

    const subDomainValue = value
      .split('')
      .filter((c) => /[a-zA-Z]/.test(c))
      .join('')
      .toLowerCase();

    handleChange('subdomain', subDomainValue);
  };

  const handleUpdateCompany = (isWizard: boolean) => {
    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: companyChanges?.id }),
      companyChanges
    )
      .then((response) => {
        toast.success('updated_company');

        isWizard
          ? setStepIndex((current) => current + 1)
          : props.setIsModalOpen(false);

        dispatch(updateRecord({ object: 'company', data: response.data.data }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  const handleConnectPaymentGateway = (
    gateway: 'stripe_connect' | 'paypal_ppcp'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/one_time_token'), {
      context: gateway,
    }).then((response) => {
      let url = 'stripe/signup/:token';

      if (gateway === 'paypal_ppcp') {
        url = 'paypal?token=:token';
      }

      window
        .open(
          route(`https://invoicing.co/${url}`, {
            token: response.data.hash,
          }),
          '_blank'
        )
        ?.focus();

      toast.dismiss();
    });
  };

  const handleSave = async (isWizard: boolean) => {
    if (!isFormBusy) {
      if (isEqual(company, companyChanges)) {
        isWizard
          ? setStepIndex((current) => current + 1)
          : props.setIsModalOpen(false);
        return;
      }

      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      if (companyChanges?.subdomain && isHosted()) {
        request('POST', endpoint('/api/v1/check_subdomain'), {
          subdomain: companyChanges.subdomain,
        })
          .then(() => handleUpdateCompany(isWizard))
          .finally(() => setIsFormBusy(false));
      } else {
        handleUpdateCompany(isWizard);
      }
    }
  };

  return (
    <Modal
      title={
        stepIndex !== 1
          ? stepIndex === 0
            ? t('welcome_to_invoice_ninja')
            : t('accept_payments_online')
          : ''
      }
      visible={props.isModalOpen}
      onClose={() => {
        props.setIsModalOpen(false);
        setErrors(undefined);
      }}
      backgroundColor="white"
      overflowVisible
    >
      <div className="flex flex-col space-y-6">
        {stepIndex === 0 && (
          <div className="flex flex-col space-y-4">
            <InputField
              label={t('company_name')}
              value={companyChanges?.settings?.name}
              onValueChange={(value) => handleChangeName(value)}
              errorMessage={errors?.errors?.name}
              changeOverride
            />

            {isHosted() && (
              <InputField
                label={t('subdomain')}
                value={companyChanges?.subdomain}
                onValueChange={(value) => handleChange('subdomain', value)}
                changeOverride
              />
            )}

            <LanguageSelector
              label={t('language')}
              value={companyChanges?.settings?.language_id || ''}
              onChange={(value) => handleChange('settings.language_id', value)}
              errorMessage={errors?.errors?.language_id}
            />

            <CurrencySelector
              label={t('currency')}
              value={companyChanges?.settings?.currency_id || ''}
              onChange={(value) => handleChange('settings.currency_id', value)}
            />
          </div>
        )}

        {stepIndex === 1 && <Logo isSettingsPage={false} />}

        {stepIndex === 2 && (
          <div className="flex flex-col items-center">
            <Div
              className="flex w-full justify-center h-28 cursor-pointer"
              theme={{ hoverColor: colors.$5 }}
              onClick={() => handleConnectPaymentGateway('stripe_connect')}
            >
              <GatewayTypeIcon name="stripe" style={{ width: '64%' }} />
            </Div>

            <Div
              className="flex w-full justify-center h-28 cursor-pointer"
              theme={{ hoverColor: colors.$5 }}
              onClick={() => handleConnectPaymentGateway('paypal_ppcp')}
            >
              <GatewayTypeIcon
                name="paypal"
                style={{
                  width: '38%',
                  transform: 'scale(1.7)',
                  pointerEvents: 'none',
                }}
              />
            </Div>

            <Button
              behavior="button"
              className="w-full mt-4"
              onClick={() => {
                props.setIsModalOpen(false);
                navigate('/settings/online_payments');
              }}
            >
              {t('all_payment_gateways')}
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          {(stepIndex !== 2 || isSelfHosted()) && (
            <Button
              behavior="button"
              onClick={() => {
                stepIndex === 0 && handleSave(isHosted());
                stepIndex !== 0 && setStepIndex((current) => current + 1);
              }}
            >
              {isHosted() ? t('next') : t('save')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
