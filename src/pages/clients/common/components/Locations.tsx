/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms/InputField';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientContext } from '../../edit/Edit';
import { useOutletContext } from 'react-router-dom';
import { set } from 'lodash';
import { v4 } from 'uuid';
import Toggle from '$app/components/forms/Toggle';
import { CustomField } from '$app/components/CustomField';
import { Location } from '$app/common/interfaces/location';

export default function Locations() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const accentColor = useAccentColor();

  const context: ClientContext = useOutletContext();
  const { client, setClient, errors, setErrors } = context;

  const [currentLocations, setCurrentLocations] = useState<Location[]>([]);

  const handleChange = (
    value: string | number | boolean,
    propertyId: string,
    locationId: string
  ) => {
    setErrors(undefined);

    const locationIndex = currentLocations.findIndex(
      (location) => location.id === locationId
    );

    set(currentLocations[locationIndex], propertyId, value);

    setCurrentLocations([...currentLocations]);
  };

  const destroy = (index: number) => {
    const updatedLocations = currentLocations.filter((_, i) => i !== index);

    setCurrentLocations(updatedLocations);
  };

  const create = () => {
    const locations = [...currentLocations];

    locations.push({
      id: v4().replaceAll('-', ''),
      name: '',
      address1: '',
      address2: '',
      phone: '',
      city: '',
      state: '',
      postal_code: '',
      country_id: '',
      user_id: '',
      vendor_id: '',
      client_id: '',
      created_at: 0,
      updated_at: 0,
      archived_at: 0,
      is_deleted: false,
      is_shipping_location: false,
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
    } as Location);

    setCurrentLocations(locations);
  };

  return (
    <Card className="mt-4 xl:mt-0" title={t('locations')}>
      {currentLocations.map((location, index, row) => (
        <div
          key={index}
          className="pb-4 mb-4 border-b"
          style={{ borderColor: colors.$5 }}
        >
          <Element leftSide={t('name')}>
            <InputField
              id={`name_${index}`}
              value={location.name}
              onValueChange={(value) =>
                handleChange(value, 'name', location.id as string)
              }
              errorMessage={errors?.errors[`locations.${index}.name`]}
            />
          </Element>

          <Element leftSide={t('address_1')}>
            <InputField
              id={`address_1_${index}`}
              value={location.address1}
              onValueChange={(value) =>
                handleChange(value, 'address1', location.id as string)
              }
              errorMessage={errors?.errors[`locations.${index}.address1`]}
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              id={`address2_${index}`}
              value={location.address2}
              onValueChange={(value) =>
                handleChange(value, 'address2', location.id as string)
              }
              errorMessage={errors?.errors[`locations.${index}.address2`]}
            />
          </Element>

          <Element leftSide={t('shipping_location')}>
            <Toggle
              checked={Boolean(location?.is_shipping_location)}
              onChange={(value) =>
                handleChange(
                  value,
                  'is_shipping_location',
                  location.id as string
                )
              }
            />
          </Element>

          {company?.custom_fields?.contact1 && (
            <CustomField
              field="location1"
              defaultValue={location.custom_value1}
              value={company.custom_fields.location1}
              onValueChange={(value) =>
                handleChange(value, 'custom_value1', location.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact2 && (
            <CustomField
              field="location2"
              defaultValue={location.custom_value2}
              value={company.custom_fields.location2}
              onValueChange={(value) =>
                handleChange(value, 'custom_value2', location.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact3 && (
            <CustomField
              field="location3"
              defaultValue={location.custom_value3}
              value={company.custom_fields.location3}
              onValueChange={(value) =>
                handleChange(value, 'custom_value3', location.id as string)
              }
            />
          )}

          {company?.custom_fields?.contact4 && (
            <CustomField
              field="location4"
              defaultValue={location.custom_value4}
              value={company.custom_fields.location4}
              onValueChange={(value) =>
                handleChange(value, 'custom_value4', location.id as string)
              }
            />
          )}

          <div className="flex items-center">
            <div className="flex items-center justify-between w-1/2">
              {currentLocations.length >= 2 && (
                <button
                  type="button"
                  onClick={() => destroy(index)}
                  className="text-red-600"
                >
                  {t('remove_location')}
                </button>
              )}
            </div>

            <div className="w-1/2 flex justify-end">
              {index + 1 === row.length && (
                <button
                  type="button"
                  onClick={create}
                  style={{ color: accentColor }}
                >
                  {t('add_location')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
