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
import { Card } from '$app/components/cards';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientContext } from '../../edit/Edit';
import { useOutletContext, useParams } from 'react-router-dom';
import { Location } from '$app/common/interfaces/location';
import { useBlankLocationQuery } from '$app/common/queries/locations';
import { LocationModal } from './LocationModal';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import styled from 'styled-components';
import classNames from 'classnames';
import { Trash } from '$app/components/icons/Trash';
import { Pencil } from '$app/components/icons/Pencil';
import { Plus } from '$app/components/icons/Plus';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { $refetch } from '$app/common/hooks/useRefetch';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';
import { useSetAtom } from 'jotai';

const StyledIconBox = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }
`;

const LocationCard = styled.div`
  border-color: ${(props) => props.theme.borderColor};
`;

const NewLocationCard = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }
`;

export default function Locations() {
  const [t] = useTranslation();

  const { id } = useParams();

  const colors = useColorScheme();

  const resolveCountry = useResolveCountry();

  const context: ClientContext = useOutletContext();
  const { client, setErrors } = context;

  const { data: blankLocation } = useBlankLocationQuery();

  const setIsConfirmationVisible = useSetAtom(confirmActionModalAtom);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteLocationId, setDeleteLocationId] = useState<string>('');
  const [currentLocations, setCurrentLocations] = useState<Location[]>([]);
  const [currentEditingLocation, setCurrentEditingLocation] =
    useState<Location | null>(null);

  const handleDeleteLocation = (locationId: string) => {
    if (!isFormBusy && locationId) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request('DELETE', endpoint('/api/v1/locations/:id', { id: locationId }))
        .then(() => {
          toast.success('deleted_location');

          $refetch(['clients']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => {
          setIsFormBusy(false);
          setDeleteLocationId('');
          setIsConfirmationVisible(false);
        });
    }
  };

  useEffect(() => {
    setCurrentLocations(client?.locations || []);
  }, [client?.locations]);

  useEffect(() => {
    if (currentEditingLocation) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [currentEditingLocation]);

  if (!id) {
    return (
      <Card className="w-full xl:w-2/3" title={t('locations')}>
        <div className="px-6 text-sm">{t('save_to_add_locations')}.</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full" title={t('locations')}>
        <div className="px-4 sm:px-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <NewLocationCard
              className="flex flex-col space-y-2 items-center justify-center border-dashed border p-6 rounded-md cursor-pointer h-48"
              theme={{
                backgroundColor: colors.$1,
                hoverBackgroundColor: colors.$4,
                borderColor: colors.$5,
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size="2rem" color={colors.$3} />
              <span>{t('add_location')}</span>
            </NewLocationCard>

            {currentLocations.map((location, index) => (
              <LocationCard
                key={index}
                theme={{
                  borderColor: colors.$5,
                }}
                className="px-3 py-4 flex justify-between space-x-4 border rounded-md h-48"
              >
                <div className="flex flex-col flex-1 truncate justify-between">
                  <span className="text-lg font-semibold truncate mb-2 mt-1">
                    {location.name}
                  </span>

                  <div className="flex flex-col space-y-1 text-sm">
                    <div>
                      <span style={{ color: colors.$16 }}>
                        {t('address')}:{' '}
                      </span>
                      {location.address1}
                      {location.address1 &&
                        location.address2 &&
                        `, ${location.address2}`}
                    </div>

                    <div>
                      <span style={{ color: colors.$16 }}>{t('city')}: </span>
                      {location.city || ''}
                      {location.state &&
                        `${location.city ? ', ' : ''}${location.state}`}
                      {location.postal_code &&
                        `${location.state ? ' ' : ''}${location.postal_code}`}
                    </div>

                    <div>
                      <span style={{ color: colors.$16 }}>
                        {t('country')}:{' '}
                      </span>
                      {resolveCountry(location.country_id)?.name}
                    </div>

                    <div>
                      <span style={{ color: colors.$16 }}>
                        {t('shipping')}:{' '}
                      </span>
                      {location.is_shipping_location ? t('yes') : t('no')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <StyledIconBox
                    className={classNames(
                      'flex items-center justify-center w-8 h-8 rounded-lg border',
                      {
                        'cursor-not-allowed opacity-75': isFormBusy,
                        'cursor-pointer': !isFormBusy,
                      }
                    )}
                    style={{ borderColor: colors.$5 }}
                    theme={{
                      hoverBackgroundColor: colors.$4,
                      backgroundColor: colors.$1,
                    }}
                    onClick={() =>
                      !isFormBusy && setCurrentEditingLocation(location)
                    }
                  >
                    <Pencil size="1rem" color="#2176FF" />
                  </StyledIconBox>

                  <StyledIconBox
                    className={classNames(
                      'flex items-center justify-center w-8 h-8 rounded-lg border',
                      {
                        'cursor-not-allowed opacity-75': isFormBusy,
                        'cursor-pointer': !isFormBusy,
                      }
                    )}
                    style={{ borderColor: colors.$5 }}
                    theme={{
                      hoverBackgroundColor: colors.$4,
                      backgroundColor: colors.$1,
                    }}
                    onClick={() => {
                      setDeleteLocationId(location.id);
                      setTimeout(() => {
                        setIsConfirmationVisible(true);
                      }, 100);
                    }}
                  >
                    <Trash size="1rem" color="red" />
                  </StyledIconBox>
                </div>
              </LocationCard>
            ))}
          </div>
        </div>
      </Card>

      <ConfirmActionModal
        onClick={() => handleDeleteLocation(deleteLocationId)}
        disabledButton={isFormBusy}
        title={t('delete_location')}
        message={t('delete_location_confirmation')}
      />

      <LocationModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        blankLocation={blankLocation as Location}
        clientId={client?.id}
        currentEditingLocation={currentEditingLocation}
        setCurrentEditingLocation={setCurrentEditingLocation}
      />
    </>
  );
}
