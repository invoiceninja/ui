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

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyEdit(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const company = useCurrentCompany();
  const companyChanges = useInjectCompanyChanges();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [stepIndex, setStepIndex] = useState<number>(0);

  const handleChange = useHandleCurrentCompanyChangeProperty();

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

  const handleConnectStripe = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/one_time_token'), {
      context: 'stripe_connect',
    }).then((response) => {
      window
        .open(
          route('https://invoicing.co/stripe/signup/:token', {
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
      title={t('welcome_to_invoice_ninja')}
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
              onValueChange={(value) => handleChange('settings.name', value)}
              errorMessage={errors?.errors?.name}
            />

            {isHosted() && (
              <InputField
                label={t('subdomain')}
                value={companyChanges?.subdomain}
                onValueChange={(value) => handleChange('subdomain', value)}
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
            <GatewayTypeIcon name="stripe" style={{ width: '75%' }} />

            <Button
              behavior="button"
              className="w-full"
              onClick={handleConnectStripe}
            >
              {t('setup')}
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          {stepIndex !== 2 || isSelfHosted() ? (
            <Button
              behavior="button"
              onClick={() => {
                stepIndex === 0 && handleSave(isHosted());
                stepIndex !== 0 && setStepIndex((current) => current + 1);
              }}
            >
              {isHosted() ? t('next') : t('save')}
            </Button>
          ) : (
            <Button
              behavior="button"
              onClick={() => props.setIsModalOpen(false)}
            >
              {t('done')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
