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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { Modal } from '$app/components/Modal';
import { TabGroup } from '$app/components/TabGroup';
import { Company } from '$app/common/interfaces/company.interface';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useDispatch } from 'react-redux';
import {
  resetChanges,
  updateRecord,
} from '$app/common/stores/slices/company-users';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function CompanyUpdateModal({ visible, setVisible }: Props) {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const currentCompany = useCurrentCompany();

  const [company, setCompany] = useState<Company>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = (property: string, value: string) => {
    setErrors(undefined);

    setCompany((company) => company && set({ ...company }, property, value));
  };

  const handleClose = () => {
    setErrors(undefined);
    setCompany(undefined);
    setVisible(false);
  };

  const onSave = () => {
    if (isFormBusy) {
      toast.processing();

      setIsFormBusy(true);
      setErrors(undefined);

      request(
        'PUT',
        endpoint('/api/v1/companies/:id', { id: company?.id }),
        company
      )
        .then((response) => {
          toast.success('updated_settings');

          handleClose();

          dispatch(resetChanges('company'));
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (currentCompany && visible && !company) {
      setCompany(cloneDeep(currentCompany));
    }
  }, [visible, currentCompany]);

  return (
    <Modal
      title={t('edit_company')!}
      visible={visible}
      onClose={() => setVisible(false)}
      size="extraSmall"
      renderTransitionChildAsFragment
      overflowVisible
      withoutVerticalMargin
      withoutHorizontalPadding
      withoutBorderLine
      disableClosing={isFormBusy}
    >
      <div className="flex flex-col">
        {company ? (
          <TabGroup
            tabs={[t('details'), t('address')]}
            width="full"
            withHorizontalPadding
            horizontalPaddingWidth="1.5rem"
          >
            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <InputField
                label={t('name')}
                value={company?.settings?.name || ''}
                onValueChange={(value) => handleChange('settings.name', value)}
                errorMessage={errors?.errors['settings.name']}
              />

              <InputField
                label={t('id_number')}
                value={company?.settings?.id_number || ''}
                onValueChange={(value) =>
                  handleChange('settings.id_number', value.toString())
                }
                disabled={company?.legal_entity_id !== null}
                errorMessage={errors?.errors['settings.id_number']}
              />

              <InputField
                label={t('vat_number')}
                value={company?.settings?.vat_number || ''}
                onValueChange={(value) =>
                  handleChange('settings.vat_number', value.toString())
                }
                disabled={company?.legal_entity_id !== null}
                errorMessage={errors?.errors['settings.vat_number']}
              />

              {company?.legal_entity_id ? (
                <p className="mt-2">{t('changing_vat_and_id_number_note')}</p>
              ) : null}

              <InputField
                label={t('website')}
                value={company?.settings?.website || ''}
                onValueChange={(value) =>
                  handleChange('settings.website', value.toString())
                }
                errorMessage={errors?.errors['settings.website']}
              />

              <InputField
                label={t('email')}
                value={company?.settings?.email || ''}
                onValueChange={(value) =>
                  handleChange('settings.email', value.toString())
                }
                errorMessage={errors?.errors['settings.email']}
              />

              <InputField
                label={t('phone')}
                value={company?.settings?.phone || ''}
                onValueChange={(value) =>
                  handleChange('settings.phone', value.toString())
                }
                errorMessage={errors?.errors['settings.phone']}
              />
            </div>

            <div className="flex flex-col space-y-3 px-4 sm:px-6">
              <InputField
                label={t('address1')}
                value={company?.settings?.address1 || ''}
                onValueChange={(value) =>
                  handleChange('settings.address1', value)
                }
                errorMessage={errors?.errors['settings.address1']}
              />

              <InputField
                label={t('address2')}
                value={company?.settings?.address2 || ''}
                onValueChange={(value) =>
                  handleChange('settings.address2', value)
                }
                errorMessage={errors?.errors['settings.address2']}
              />

              <InputField
                label={t('city')}
                value={company?.settings?.city || ''}
                onValueChange={(value) => handleChange('settings.city', value)}
                errorMessage={errors?.errors['settings.city']}
              />

              <InputField
                label={t('state')}
                value={company?.settings?.state || ''}
                onValueChange={(value) => handleChange('settings.state', value)}
                errorMessage={errors?.errors['settings.state']}
              />
            </div>
          </TabGroup>
        ) : (
          <Spinner />
        )}

        <div className="flex justify-end mt-2 px-4 sm:px-6">
          <Button behavior="button" onClick={onSave}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
