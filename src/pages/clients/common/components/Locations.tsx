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
import { Button } from '$app/components/forms';
import { useBlankLocationQuery } from '$app/common/queries/locations';
import { LocationModal } from './LocationModal';
import { Badge } from '$app/components/Badge';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import styled from 'styled-components';
import classNames from 'classnames';
import { Trash } from '$app/components/icons/Trash';
import { Pencil } from '$app/components/icons/Pencil';
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

  &:focus {
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
    if (client?.locations?.length) {
      setCurrentLocations(client.locations);
    }
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
      <Card className="w-full xl:w-2/3" title={t('locations')}>
        <div className="flex flex-col space-y-4 px-6">
          {!currentLocations.length && (
            <span className="text-sm">{t('no_records_found')}.</span>
          )}

          {currentLocations.map((location, index) => (
            <div
              key={index}
              className="pb-4 mb-4 border-b flex flex-col md:flex-row gap-4"
              style={{ borderColor: colors.$5 }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-semibold">{location.name}</span>

                  {location.is_shipping_location && (
                    <Badge variant="blue">{t('shipping')}</Badge>
                  )}
                </div>

                <div className="text-sm mb-1">
                  <span style={{ color: colors.$16 }}>Address: </span>

                  {location.address1}
                  {location.address1 &&
                    location.address2 &&
                    `, ${location.address2}`}
                </div>

                <div className="text-sm mb-1">
                  <span style={{ color: colors.$16 }}>City: </span>
                  {location.city || ''}
                  {location.state &&
                    `${location.city ? ', ' : ''}${location.state}`}
                  {location.postal_code &&
                    `${location.state ? ' ' : ''}${location.postal_code}`}
                </div>

                <div className="text-sm mb-1">
                  <span style={{ color: colors.$16 }}>Country: </span>

                  {resolveCountry(location.country_id)?.name}
                </div>

                <div className="text-sm mb-1">
                  <span style={{ color: colors.$16 }}>Phone: </span>

                  {location.phone}
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 justify-between">
                <StyledIconBox
                  className={classNames(
                    'flex items-center justify-center w-10 rounded-lg border shadow-sm',
                    {
                      'cursor-not-allowed opacity-75': isFormBusy,
                      'cursor-pointer': !isFormBusy,
                    }
                  )}
                  style={{ height: '2.3rem', borderColor: colors.$5 }}
                  theme={{
                    hoverBackgroundColor: colors.$4,
                    backgroundColor: colors.$1,
                  }}
                  onClick={() =>
                    !isFormBusy && setCurrentEditingLocation(location)
                  }
                >
                  <Pencil size="1.25rem" color="#2176FF" />
                </StyledIconBox>

                <StyledIconBox
                  className={classNames(
                    'flex items-center justify-center w-10 rounded-lg border shadow-sm',
                    {
                      'cursor-not-allowed opacity-75': isFormBusy,
                      'cursor-pointer': !isFormBusy,
                    }
                  )}
                  style={{ height: '2.3rem', borderColor: colors.$5 }}
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
                  <Trash size="1.25rem" color="red" />
                </StyledIconBox>
              </div>
            </div>
          ))}

          <Button
            className="w-full"
            type="primary"
            behavior="button"
            onClick={() => setIsModalOpen(true)}
          >
            {t('add_location')}
          </Button>
        </div>
      </Card>

      <ConfirmActionModal
        onClick={() => handleDeleteLocation(deleteLocationId)}
        disabledButton={isFormBusy}
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
