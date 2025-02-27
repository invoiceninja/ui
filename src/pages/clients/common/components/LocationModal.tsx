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
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  blankLocation: Location;
  clientId: string | undefined;
}

const BLANK_LOCATION: Location = {
  id: '',
  user_id: '',
  vendor_id: '',
  client_id: '',
  name: '',
  address1: '',
  address2: '',
  phone: '',
  city: '',
  state: '',
  postal_code: '',
  country_id: '',
  is_shipping_location: false,
  custom_value1: '',
  custom_value2: '',
  custom_value3: '',
  custom_value4: '',
  is_deleted: false,
  updated_at: 0,
  archived_at: 0,
  created_at: 0,
};

export function LocationModal({
  isModalOpen,
  setIsModalOpen,
  blankLocation,
  clientId,
}: Props) {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | undefined>();
  const [currentLocation, setCurrentLocation] = useState<Location>(
    blankLocation || BLANK_LOCATION
  );

  const handleSave = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/locations'), {
        ...currentLocation,
        client_id: clientId,
      })
        .then((response: GenericSingleResourceResponse<Location>) => {
          toast.success('created_location');

          console.log(response);

          $refetch(['clients']);

          setIsModalOpen(false);
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
    const updatedLocation = cloneDeep(currentLocation);

    set(updatedLocation, property, value);

    setCurrentLocation(updatedLocation);
  };

  useEffect(() => {
    setCurrentLocation(blankLocation || BLANK_LOCATION);
  }, [isModalOpen]);

  return (
    <Modal
      title={t('add_location')}
      visible={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      overflowVisible
      size="regular"
    >
      <div className="flex flex-col space-y-4">
        <InputField
          label={t('name')}
          value={currentLocation.name}
          onValueChange={(value) => handleChange(value, 'name')}
          errorMessage={errors?.errors.name}
        />

        <InputField
          label={t('address1')}
          value={currentLocation.address1}
          onValueChange={(value) => handleChange(value, 'address1')}
          errorMessage={errors?.errors.address1}
        />

        <InputField
          label={t('address2')}
          value={currentLocation.address2}
          onValueChange={(value) => handleChange(value, 'address2')}
          errorMessage={errors?.errors.address2}
        />

        <InputField
          label={t('phone')}
          value={currentLocation.phone}
          onValueChange={(value) => handleChange(value, 'phone')}
          errorMessage={errors?.errors.phone}
        />

        <InputField
          label={t('city')}
          value={currentLocation.city}
          onValueChange={(value) => handleChange(value, 'city')}
          errorMessage={errors?.errors.city}
        />

        <InputField
          label={t('state')}
          value={currentLocation.state}
          onValueChange={(value) => handleChange(value, 'state')}
          errorMessage={errors?.errors.state}
        />

        <InputField
          label={t('postal_code')}
          value={currentLocation.postal_code}
          onValueChange={(value) => handleChange(value, 'postal_code')}
          errorMessage={errors?.errors.postal_code}
        />

        <InputField
          label={t('country')}
          value={currentLocation.country_id}
          onValueChange={(value) => handleChange(value, 'country_id')}
          errorMessage={errors?.errors.country_id}
        />

        <CountrySelector
          label={t('country')}
          value={currentLocation.country_id}
          onChange={(value) => handleChange(value, 'country_id')}
        />

        <div className="pt-1">
          <Toggle
            label={t('is_shipping_location')}
            value={currentLocation.is_shipping_location}
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
            onClick={handleSave}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
