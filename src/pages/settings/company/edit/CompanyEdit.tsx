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
import { AxiosError, AxiosResponse } from 'axios';
import { endpoint, isHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { CompanyInput } from '$app/common/interfaces/company.interface';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { Modal } from '$app/components/Modal';
import {
  FormEvent,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { useQueryClient } from 'react-query';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyEdit(props: Props) {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const currentCompany = useCurrentCompany();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [companyId, setCompanyId] = useState<string | undefined>();

  const [company, setCompany] = useState<CompanyInput>({
    name: '',
    language_id: '',
    currency_id: '',
    subdomain: '',
  });

  const fetchCompanyDetails = async (companyId: string) => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/companies', companyId],
        () =>
          request('GET', endpoint('/api/v1/companies/:id', { id: companyId })),
        { staleTime: Infinity }
      )
      .then((response) => response.data.data);

    const companySettings = response?.settings;

    const { name, subdomain, language_id, currency_id } = companySettings;

    setCompany({
      name,
      subdomain,
      language_id,
      currency_id,
    });
  };

  const handleChange = (
    property: keyof CompanyInput,
    value: CompanyInput[keyof CompanyInput]
  ) => {
    setCompany((prevState) => ({
      ...prevState,
      [property]: value,
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event?.preventDefault();

      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      const { name, language_id, subdomain, currency_id } = company;

      request('GET', endpoint('/api/v1/companies/:id', { id: companyId }))
        .then((response: AxiosResponse) => {
          const respondedCompany = response.data.data;

          const companySettings = respondedCompany.settings;

          respondedCompany.settings = {
            ...respondedCompany.settings,
            name: name ? name : companySettings?.name,
            subdomain: subdomain ? subdomain : companySettings?.subdomain,
            language_id: language_id
              ? language_id
              : companySettings?.language_id,
            currency_id: currency_id
              ? currency_id
              : companySettings?.currency_id,
          };

          if (subdomain && isHosted()) {
            request('POST', endpoint('/api/v1/check_subdomain'), {
              subdomain: subdomain,
            }).catch(() => {
              return;
            });
          }

          request(
            'PUT',
            endpoint('/api/v1/companies/:id', { id: companyId }),
            respondedCompany
          )
            .then(() => {
              toast.success('updated_company');

              props.setIsModalOpen(false);

              window.location.href = route('/');
            })
            .catch((error: AxiosError<ValidationBag>) => {
              if (error.response?.status === 422) {
                setErrors(error.response.data);
                toast.dismiss();
              }
            });
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (currentCompany?.id) {
      setCompanyId(currentCompany.id);
    }
  }, [currentCompany]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails(companyId);
    }
  }, [companyId]);

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
      <InputField
        label={t('company_name')}
        value={company?.name}
        onValueChange={(value) => handleChange('name', value)}
        errorMessage={errors?.errors?.name}
      />

      {isHosted() && (
        <InputField
          label={t('subdomain')}
          value={company?.subdomain}
          onValueChange={(value) => handleChange('subdomain', value)}
        />
      )}

      <LanguageSelector
        label={t('language')}
        value={company?.language_id}
        onChange={(v) => handleChange('language_id', v)}
        errorMessage={errors?.errors?.language_id}
      />

      <CurrencySelector
        label={t('currency')}
        value={company?.currency_id || ''}
        onChange={(value) => handleChange('currency_id', value)}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
