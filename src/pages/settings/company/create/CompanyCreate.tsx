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
import { Button, InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { CompanyInput } from 'common/interfaces/company.interface';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Modal } from 'components/Modal';
import { FormEvent, useState, SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyCreate(props: Props) {
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [company, setCompany] = useState<CompanyInput>();

  const handleChange = (
    property: keyof CompanyInput,
    value: CompanyInput[keyof CompanyInput]
  ) => {
    setCompany((prevState) => ({ ...prevState, [property]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    if (!isFormBusy) {
      event?.preventDefault();

      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      try {
        await request('POST', endpoint('/api/v1/companies'), company);
        setIsFormBusy(false);
        toast.success(t('created_company'));
        props.setIsModalOpen(false);
      } catch (cachedError) {
        const error = cachedError as AxiosError;
        console.error(error);
        if (error?.response?.status === 422) {
          setErrors(error?.response?.data?.errors);
          toast.dismiss();
        } else {
          toast.error();
        }
        setIsFormBusy(false);
      }
    }
  };

  return (
    <Modal
      title={t('new_company')}
      visible={props.isModalOpen}
      onClose={(value) => {
        props.setIsModalOpen(value);
        setErrors(undefined);
      }}
      size="regular"
      backgroundColor="gray"
    >
      <Card onFormSubmit={handleSave}>
        <Element leftSide={t('company_name')}>
          <InputField
            value={company?.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors?.name}
          />
        </Element>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
