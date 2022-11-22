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
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useLanguages } from 'common/hooks/useLanguages';
import { CompanyInput } from 'common/interfaces/company.interface';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { CurrencySelector } from 'components/CurrencySelector';
import { LightSwitch } from 'components/LightSwitch';
import { Modal } from 'components/Modal';
import {
  FormEvent,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyEdit(props: Props) {
  const [t] = useTranslation();

  const languages = useLanguages();

  const currentCompany = useCurrentCompany();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [companyId, setCompanyId] = useState<string | undefined>();

  const [company, setCompany] = useState<CompanyInput>({});

  const fetchCompanyDetails = async (company_id: string) => {
    const response = await request(
      'GET',
      endpoint('/api/v1/companies/:id', { id: company_id })
    );

    const companySettings = response?.data?.data?.settings;

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

      try {
        const response = await request(
          'GET',
          endpoint('/api/v1/companies/:id', { id: companyId })
        );

        const respondedCompany = response.data.data;

        const companySettings = respondedCompany.settings;

        respondedCompany.settings = {
          ...respondedCompany.settings,
          name: name ? name : companySettings?.name,
          subdomain: subdomain ? subdomain : companySettings?.subdomain,
          language_id: language_id ? language_id : companySettings?.language_id,
          currency_id: currency_id ? currency_id : companySettings?.currency_id,
        };

        await request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: companyId }),
          respondedCompany
        );

        setIsFormBusy(false);

        toast.success('updated_company');

        props.setIsModalOpen(false);

        window.location.href = route('/');
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(axiosError);
        if (axiosError?.response?.status === 422) {
          setErrors(axiosError?.response?.data?.errors);
          toast.dismiss();
        } else {
          toast.error();
        }
        setIsFormBusy(false);
      }
    }
  };

  useEffect(() => {
    if (currentCompany?.id && !companyId) {
      setCompanyId('');
    }
    if (companyId === '') {
      setCompanyId(currentCompany?.id);
      fetchCompanyDetails(currentCompany?.id);
    }
  }, [currentCompany]);

  return (
    <Modal
      title={t('company_details')}
      visible={props.isModalOpen}
      onClose={() => {
        props.setIsModalOpen(false);
        setErrors(undefined);
      }}
      size="regular"
      backgroundColor="gray"
    >
      <Card onFormSubmit={handleSave}>
        <div className="flex justify-between mb-6 px-6">
          <h1 className="text-2xl text-gray-900">Welcome to Invoice Ninja</h1>
          <LightSwitch />
        </div>
        <Element leftSide={t('company_name')}>
          <InputField
            value={company?.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors?.name}
          />
        </Element>
        <Element leftSide={t('subdomain')}>
          <InputField
            value={company?.subdomain}
            onValueChange={(value) => handleChange('subdomain', value)}
            errorMessage={errors?.errors?.subdomain}
          />
        </Element>
        <Element leftSide={t('language')}>
          <SelectField
            defaultValue={languages[0]?.id}
            value={company?.language_id}
            onValueChange={(value) => handleChange('language_id', value)}
            errorMessage={errors?.errors?.language_id}
          >
            {languages?.map((language, index) => (
              <option key={index} value={language?.id}>
                {language?.name}
              </option>
            ))}
          </SelectField>
        </Element>
        <Element leftSide={t('currency')}>
          <CurrencySelector
            value={company?.currency_id || ''}
            onChange={(value) => handleChange('currency_id', value)}
          />
        </Element>
      </Card>
      <div className="flex justify-end space-x-4">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
