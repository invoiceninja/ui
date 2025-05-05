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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Location } from '$app/common/interfaces/location';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms/InputField';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { set } from 'lodash';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  blankLocation: Location;
  clientId: string | undefined;
  currentEditingLocation: Location | null;
  setCurrentEditingLocation: Dispatch<SetStateAction<Location | null>>;
}

export function LocationModal({
  isModalOpen,
  setIsModalOpen,
  blankLocation,
  clientId,
  currentEditingLocation,
  setCurrentEditingLocation,
}: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>();
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(
    blankLocation
  );

  const handleOnClose = () => {
    setIsModalOpen(false);
    currentEditingLocation && setCurrentEditingLocation(null);
  };

  const handleSave = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/locations'), {
        ...currentLocation,
        client_id: clientId,
      })
        .then(() => {
          toast.success('created_location');

          $refetch(['clients']);

          handleOnClose();
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

  const handleEdit = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'PUT',
        endpoint('/api/v1/locations/:id', { id: currentEditingLocation?.id }),
        currentLocation
      )
        .then(() => {
          toast.success('updated_location');

          $refetch(['clients']);

          setCurrentEditingLocation(null);
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

  const handleChange = (value: string | boolean, property: string) => {
    if (!currentLocation) {
      return;
    }

    const updatedLocation = cloneDeep(currentLocation);

    set(updatedLocation, property, value);

    setCurrentLocation(updatedLocation);
  };

  useEffect(() => {
    setCurrentLocation(
      currentEditingLocation ||
        cloneDeep({
          ...blankLocation,
          country_id: company?.settings?.country_id || '',
        })
    );
  }, [isModalOpen]);

  return (
    <Modal
      title={currentEditingLocation ? t('edit_location') : t('add_location')}
      visible={isModalOpen}
      onClose={handleOnClose}
      overflowVisible
    >
      <div className="flex flex-col space-y-4">
        <InputField
          label={t('name')}
          value={currentLocation?.name || ''}
          onValueChange={(value) => handleChange(value, 'name')}
          errorMessage={errors?.errors.name}
        />

        <InputField
          label={t('address1')}
          value={currentLocation?.address1 || ''}
          onValueChange={(value) => handleChange(value, 'address1')}
          errorMessage={errors?.errors.address1}
        />

        <InputField
          label={t('address2')}
          value={currentLocation?.address2 || ''}
          onValueChange={(value) => handleChange(value, 'address2')}
          errorMessage={errors?.errors.address2}
        />

        <InputField
          label={t('city')}
          value={currentLocation?.city || ''}
          onValueChange={(value) => handleChange(value, 'city')}
          errorMessage={errors?.errors.city}
        />

        <InputField
          label={t('state')}
          value={currentLocation?.state || ''}
          onValueChange={(value) => handleChange(value, 'state')}
          errorMessage={errors?.errors.state}
        />

        <InputField
          label={t('postal_code')}
          value={currentLocation?.postal_code || ''}
          onValueChange={(value) => handleChange(value, 'postal_code')}
          errorMessage={errors?.errors.postal_code}
        />

        <CountrySelector
          label={t('country')}
          value={currentLocation?.country_id || ''}
          onChange={(value) => handleChange(value, 'country_id')}
          errorMessage={errors?.errors.country_id}
        />

        <div className="pt-1">
          <Toggle
            label={t('shipping_address')}
            checked={Boolean(currentLocation?.is_shipping_location)}
            onValueChange={(value) =>
              handleChange(value, 'is_shipping_location')
            }
          />
        </div>

        <div className="w-full pt-4">
          <Button
            className="w-full"
            type="primary"
            behavior="button"
            onClick={currentEditingLocation ? handleEdit : handleSave}
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
